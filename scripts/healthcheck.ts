#!/usr/bin/env tsx
/**
 * RemixOS Health Check Script
 * Verifies all services are healthy. Exits 0 if all pass, 1 if any fail.
 * Useful as a Docker HEALTHCHECK, Kubernetes readiness probe, or CI gate.
 */

import http from "node:http";
import https from "node:https";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ServiceCheck {
  name: string;
  url: string;
  timeout: number;
  expectedStatus?: number;
  expectedBody?: string;
  required: boolean;
}

interface CheckResult {
  name: string;
  url: string;
  status: "pass" | "fail" | "warn";
  httpStatus?: number;
  latencyMs: number;
  error?: string;
  required: boolean;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const GATEWAY_URL = process.env["GATEWAY_URL"] ?? "http://localhost:3001";
const STUDIO_URL = process.env["STUDIO_URL"] ?? "http://localhost:3000";
const GO_CORE_URL = process.env["GO_CORE_URL"] ?? "http://localhost:8080";

const SERVICES: ServiceCheck[] = [
  {
    name: "gateway",
    url: `${GATEWAY_URL}/health`,
    timeout: 5000,
    expectedStatus: 200,
    required: true,
  },
  {
    name: "studio",
    url: `${STUDIO_URL}`,
    timeout: 8000,
    expectedStatus: 200,
    required: true,
  },
  {
    name: "go-core",
    url: `${GO_CORE_URL}/health`,
    timeout: 5000,
    expectedStatus: 200,
    required: false,
  },
];

// ─── HTTP Check ───────────────────────────────────────────────────────────────

function httpGet(url: string, timeoutMs: number): Promise<{ status: number; body: string; latencyMs: number }> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const mod = url.startsWith("https://") ? https : http;
    const req = mod.get(url, (res) => {
      let body = "";
      res.on("data", (chunk: Buffer) => { body += chunk.toString(); });
      res.on("end", () => {
        resolve({ status: res.statusCode ?? 0, body, latencyMs: Date.now() - start });
      });
    });

    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`Timeout after ${timeoutMs}ms`));
    });

    req.on("error", reject);
  });
}

// ─── Check Runner ─────────────────────────────────────────────────────────────

async function checkService(svc: ServiceCheck): Promise<CheckResult> {
  try {
    const { status, body, latencyMs } = await httpGet(svc.url, svc.timeout);
    const statusOk = svc.expectedStatus === undefined || status === svc.expectedStatus;
    const bodyOk = svc.expectedBody === undefined || body.includes(svc.expectedBody);

    if (statusOk && bodyOk) {
      return { name: svc.name, url: svc.url, status: "pass", httpStatus: status, latencyMs, required: svc.required };
    }

    const error = !statusOk
      ? `Expected HTTP ${svc.expectedStatus}, got ${status}`
      : `Response body missing expected string: "${svc.expectedBody}"`;

    return {
      name: svc.name, url: svc.url,
      status: svc.required ? "fail" : "warn",
      httpStatus: status, latencyMs, error, required: svc.required,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      name: svc.name, url: svc.url,
      status: svc.required ? "fail" : "warn",
      latencyMs: 0, error: message, required: svc.required,
    };
  }
}

// ─── Output ───────────────────────────────────────────────────────────────────

function printResult(r: CheckResult): void {
  const icon = r.status === "pass" ? "✔" : r.status === "warn" ? "⚠" : "✖";
  const color = r.status === "pass" ? "\x1b[32m" : r.status === "warn" ? "\x1b[33m" : "\x1b[31m";
  const reset = "\x1b[0m";
  const latency = r.status === "pass" ? ` (${r.latencyMs}ms)` : "";
  const err = r.error ? ` — ${r.error}` : "";
  const required = r.required ? "" : " [optional]";
  console.log(`  ${color}${icon}${reset} ${r.name}${required}${latency}${err}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function healthCheck(): Promise<void> {
  const format = process.argv.includes("--json") ? "json" : "text";

  if (format === "text") {
    console.log("\n🏥 RemixOS Health Check\n" + "─".repeat(40));
  }

  const results = await Promise.all(SERVICES.map(checkService));

  if (format === "json") {
    const overall = results.every((r) => !r.required || r.status === "pass") ? "healthy" : "unhealthy";
    console.log(JSON.stringify({ overall, timestamp: new Date().toISOString(), checks: results }, null, 2));
  } else {
    for (const r of results) {
      printResult(r);
    }
    console.log("─".repeat(40));
  }

  const failed = results.filter((r) => r.required && r.status === "fail");
  if (failed.length > 0) {
    if (format === "text") {
      console.log(`\n\x1b[31m✖ Health check FAILED (${failed.length} required service(s) down)\x1b[0m\n`);
    }
    process.exit(1);
  }

  if (format === "text") {
    console.log(`\n\x1b[32m✔ All required services healthy\x1b[0m\n`);
  }
}

healthCheck().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Health check error: ${message}`);
  process.exit(1);
});
