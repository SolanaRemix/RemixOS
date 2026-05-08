import { randomUUID } from "node:crypto";
import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { z } from "zod";
import { runQueuedTask } from "@remixos/orchestrator";
import type { AuditLogEntry, AuthClaims, LogEvent, RunPromptRequest } from "@remixos/shared";

function parsePositiveIntegerEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid ${name}: expected a positive integer`);
  }

  return parsed;
}

function parseTrustProxyEnv(value: string | undefined): boolean | number {
  if (value === undefined || value === "false") {
    return false;
  }
  if (value === "true") {
    return true;
  }

  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 0) {
    return numeric;
  }

  throw new Error("Invalid REMIXOS_TRUST_PROXY: expected true, false, or a non-negative integer");
}

function isLoopbackIp(ip: string): boolean {
  return ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
}

function hasStrongSecretShape(secret: string): boolean {
  const hasLower = /[a-z]/.test(secret);
  const hasUpper = /[A-Z]/.test(secret);
  const hasDigit = /\d/.test(secret);
  const hasSymbol = /[^a-zA-Z0-9]/.test(secret);
  const classes = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  const isAllSameCharacter = /^(.)(\1)+$/.test(secret);
  return classes >= 3 && !isAllSameCharacter;
}

const authRequired = process.env["REMIXOS_AUTH_REQUIRED"] !== "false";
const configuredJwtSecret = process.env["REMIXOS_JWT_SECRET"];

if (authRequired && (!configuredJwtSecret || configuredJwtSecret.length < 32 || !hasStrongSecretShape(configuredJwtSecret))) {
  throw new Error("REMIXOS_JWT_SECRET must be a strong value (>=32 chars, mixed character classes) when auth is enabled");
}

const appConfig = {
  authRequired,
  jwtSecret: configuredJwtSecret ?? "remixos-dev-secret-change-me",
  jwtTtlSeconds: parsePositiveIntegerEnv("REMIXOS_JWT_TTL_SECONDS", 3600),
  rateLimitMax: parsePositiveIntegerEnv("REMIXOS_RATE_LIMIT_MAX", 60),
  rateLimitWindowMs: parsePositiveIntegerEnv("REMIXOS_RATE_LIMIT_WINDOW_MS", 60000),
  trustProxy: parseTrustProxyEnv(process.env["REMIXOS_TRUST_PROXY"]),
  bootstrapSecret: process.env["REMIXOS_BOOTSTRAP_SECRET"],
} as const;

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

app.set("trust proxy", appConfig.trustProxy);

const runPromptSchema = z.object({
  prompt: z.string().trim().min(1),
});

const tokenRequestSchema = z.object({
  userId: z.string().trim().min(3).max(128).optional(),
  workspaceId: z.string().trim().min(1).max(128).optional(),
});

interface GatewayRequest extends express.Request {
  auth?: AuthClaims;
  requestId?: string;
}

interface RateLimitWindow {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitWindow>();

function cleanupRateLimitStore(now = Date.now()): void {
  for (const [key, value] of rateLimitStore.entries()) {
    if (value.resetAt <= now) {
      rateLimitStore.delete(key);
    }
  }
}

setInterval(() => {
  cleanupRateLimitStore();
}, Math.min(60000, Math.max(5000, Math.floor(appConfig.rateLimitWindowMs / 2)))).unref();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const requestId = randomUUID();
  (req as GatewayRequest).requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
});

// Connected WebSocket clients
const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
  ws.send(JSON.stringify({ step: "connected", message: "RemixOS Gateway connected" }));
});

function broadcast(event: LogEvent): void {
  const message = JSON.stringify(event);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function logAudit(entry: AuditLogEntry): void {
  console.log(JSON.stringify({
    type: "audit",
    ...entry,
  }));
}

function issueToken(claims: Omit<AuthClaims, "iat" | "exp">): string {
  return jwt.sign(claims, appConfig.jwtSecret, {
    expiresIn: appConfig.jwtTtlSeconds,
    issuer: "remixos-gateway",
    audience: "remixos-studio",
  });
}

function parseClaims(rawToken: string): AuthClaims | null {
  try {
    const payload = jwt.verify(rawToken, appConfig.jwtSecret, {
      issuer: "remixos-gateway",
      audience: "remixos-studio",
    });

    if (typeof payload === "string") {
      return null;
    }

    const jwtPayload = payload as JwtPayload;
    const sub = jwtPayload.sub;
    const workspaceId = jwtPayload["workspaceId"];
    const scope = jwtPayload["scope"];

    if (
      typeof sub !== "string"
      || typeof workspaceId !== "string"
      || !Array.isArray(scope)
      || scope.some((item) => typeof item !== "string")
    ) {
      return null;
    }

    return {
      sub,
      workspaceId,
      scope,
      iat: typeof jwtPayload.iat === "number" ? jwtPayload.iat : undefined,
      exp: typeof jwtPayload.exp === "number" ? jwtPayload.exp : undefined,
    };
  } catch {
    return null;
  }
}

function enforceAuth(req: GatewayRequest, res: express.Response, next: express.NextFunction): void {
  if (!appConfig.authRequired) {
    req.auth = { sub: "anonymous", workspaceId: "local", scope: ["run:task"] };
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    logAudit({
      requestId: req.requestId ?? "unknown",
      actorId: "anonymous",
      action: "auth_failed",
      status: "failure",
      timestamp: Date.now(),
      metadata: { reason: "missing_bearer_token" },
    });
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }

  const claims = parseClaims(authHeader.slice("Bearer ".length));
  if (!claims) {
    logAudit({
      requestId: req.requestId ?? "unknown",
      actorId: "anonymous",
      action: "auth_failed",
      status: "failure",
      timestamp: Date.now(),
      metadata: { reason: "invalid_token" },
    });
    res.status(401).json({ error: "Invalid token" });
    return;
  }

  req.auth = claims;
  next();
}

function enforceRateLimit(req: GatewayRequest, res: express.Response, next: express.NextFunction): void {
  const actorId = req.auth?.sub ?? "anonymous";
  const key = `${actorId}:${req.ip ?? "unknown"}`;
  const now = Date.now();

  cleanupRateLimitStore(now);

  const existing = rateLimitStore.get(key);
  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + appConfig.rateLimitWindowMs });
    next();
    return;
  }

  if (existing.count >= appConfig.rateLimitMax) {
    const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    logAudit({
      requestId: req.requestId ?? "unknown",
      actorId,
      action: "rate_limited",
      status: "failure",
      timestamp: Date.now(),
      metadata: { retryAfterSeconds },
    });
    res.setHeader("retry-after", String(retryAfterSeconds));
    res.status(429).json({ error: "Rate limit exceeded" });
    return;
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);
  next();
}

function enforceTokenIssuancePolicy(req: GatewayRequest, res: express.Response, next: express.NextFunction): void {
  if (!appConfig.authRequired) {
    next();
    return;
  }

  if (appConfig.bootstrapSecret) {
    if (req.headers["x-remixos-bootstrap-secret"] !== appConfig.bootstrapSecret) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
    return;
  }

  if (!isLoopbackIp(req.ip ?? "")) {
    res.status(403).json({ error: "Token endpoint is restricted" });
    return;
  }

  next();
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "remixos-gateway", timestamp: Date.now() });
});

app.post("/auth/token", enforceRateLimit, enforceTokenIssuancePolicy, (req, res) => {
  const parsed = tokenRequestSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid token request payload" });
    return;
  }

  const userId = parsed.data.userId ?? `guest-${randomUUID()}`;
  const workspaceId = parsed.data.workspaceId ?? "default";
  const token = issueToken({
    sub: userId,
    workspaceId,
    scope: ["run:task"],
  });

  const requestId = (req as GatewayRequest).requestId ?? "unknown";
  logAudit({
    requestId,
    actorId: userId,
    action: "issue_token",
    status: "success",
    timestamp: Date.now(),
    metadata: { workspaceId },
  });

  res.json({
    token,
    tokenType: "Bearer",
    expiresIn: appConfig.jwtTtlSeconds,
  });
});

app.post("/run", enforceAuth, enforceRateLimit, async (req, res) => {
  const parsed = runPromptSchema.safeParse(req.body) as z.SafeParseReturnType<unknown, RunPromptRequest>;
  if (!parsed.success) {
    res.status(400).json({ error: "Missing or invalid prompt" });
    return;
  }

  const prompt = parsed.data.prompt;
  const MAX_PROMPT_BYTES = 16384;
  if (Buffer.byteLength(prompt, "utf8") > MAX_PROMPT_BYTES) {
    res.status(413).json({ error: "Prompt too large (max 16384 bytes)" });
    return;
  }

  const gatewayReq = req as GatewayRequest;
  const actorId = gatewayReq.auth?.sub ?? "anonymous";

  logAudit({
    requestId: gatewayReq.requestId ?? "unknown",
    actorId,
    action: "run_requested",
    status: "success",
    timestamp: Date.now(),
    metadata: { promptLength: prompt.length },
  });

  try {
    const queued = await runQueuedTask(prompt.trim(), broadcast);

    if ("error" in queued) {
      logAudit({
        requestId: gatewayReq.requestId ?? "unknown",
        actorId,
        action: "run_failed",
        status: "failure",
        timestamp: Date.now(),
        metadata: { error: queued.error, jobId: queued.job.id },
      });
      res.status(500).json({ error: queued.error, job: queued.job });
      return;
    }

    logAudit({
      requestId: gatewayReq.requestId ?? "unknown",
      actorId,
      action: "run_completed",
      status: "success",
      timestamp: Date.now(),
      metadata: { jobId: queued.job.id },
    });

    res.json({
      job: queued.job,
      ...queued.result,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    logAudit({
      requestId: gatewayReq.requestId ?? "unknown",
      actorId,
      action: "run_failed",
      status: "failure",
      timestamp: Date.now(),
      metadata: { error: message },
    });
    res.status(500).json({ error: message });
  }
});

const PORT = process.env["PORT"] ?? 3001;
httpServer.listen(PORT, () => {
  console.log(`RemixOS Gateway running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready on ws://localhost:${PORT}`);
});

export default app;
