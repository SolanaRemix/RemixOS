#!/usr/bin/env tsx
/**
 * RemixOS Bootstrap Script
 * Detects environment, validates prerequisites, and initialises services.
 */

import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = "linux" | "darwin" | "win32";
type Env = "development" | "production" | "docker" | "ci";

interface BootstrapConfig {
  platform: Platform;
  env: Env;
  nodeVersion: string;
  pnpmVersion: string;
  rootDir: string;
  missingEnvVars: string[];
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function log(level: "info" | "warn" | "error" | "success", message: string): void {
  const icons = { info: "ℹ", warn: "⚠", error: "✖", success: "✔" } as const;
  const colors = { info: "\x1b[36m", warn: "\x1b[33m", error: "\x1b[31m", success: "\x1b[32m" } as const;
  const reset = "\x1b[0m";
  console.log(`${colors[level]}${icons[level]}${reset} ${message}`);
}

function run(cmd: string, options: { cwd?: string; silent?: boolean } = {}): boolean {
  const result = spawnSync(cmd, { shell: true, stdio: options.silent ? "pipe" : "inherit", cwd: options.cwd ?? rootDir });
  return result.status === 0;
}

function commandExists(cmd: string): boolean {
  const result = spawnSync(cmd, ["--version"], { shell: true, stdio: "pipe" });
  return result.status === 0;
}

// ─── Environment Detection ────────────────────────────────────────────────────

const rootDir = path.resolve(import.meta.dirname ?? process.cwd(), "..");

function detectEnvironment(): Env {
  if (process.env["CI"] === "true") return "ci";
  if (process.env["DOCKER"] === "true" || fs.existsSync("/.dockerenv")) return "docker";
  if (process.env["NODE_ENV"] === "production") return "production";
  return "development";
}

function detectPlatform(): Platform {
  const p = process.platform as string;
  if (p === "linux" || p === "darwin" || p === "win32") return p as Platform;
  return "linux";
}

function getNodeVersion(): string {
  try {
    return execSync("node --version", { stdio: "pipe" }).toString().trim();
  } catch {
    return "unknown";
  }
}

function getPnpmVersion(): string {
  try {
    return execSync("pnpm --version", { stdio: "pipe" }).toString().trim();
  } catch {
    return "not installed";
  }
}

// ─── Prerequisites ────────────────────────────────────────────────────────────

const REQUIRED_ENV_VARS_PRODUCTION = [
  "REMIXOS_JWT_SECRET",
  "DATABASE_URL",
];

const REQUIRED_ENV_VARS_DEVELOPMENT: string[] = [];

function checkEnvVars(env: Env): string[] {
  const required = env === "production" ? REQUIRED_ENV_VARS_PRODUCTION : REQUIRED_ENV_VARS_DEVELOPMENT;
  return required.filter((v) => !process.env[v]);
}

function ensureEnvFile(): void {
  const envPath = path.join(rootDir, ".env");
  const envExamplePath = path.join(rootDir, ".env.example");

  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      log("info", "Created .env from .env.example — please fill in your values.");
    } else {
      const defaults = [
        "# RemixOS Environment Configuration",
        "NODE_ENV=development",
        "PORT=3001",
        "NEXT_PUBLIC_GATEWAY_URL=http://localhost:3001",
        "NEXT_PUBLIC_WS_URL=ws://localhost:3001",
        "# REMIXOS_AUTH_REQUIRED=false",
        "# REMIXOS_JWT_SECRET=<strong-secret-here>",
        "# DATABASE_URL=postgresql://remixos:remixos_dev@localhost:5432/remixos",
        "# REDIS_URL=redis://localhost:6379",
        "# OPENAI_API_KEY=",
        "# ANTHROPIC_API_KEY=",
        "# STRIPE_SECRET_KEY=",
        "# STRIPE_WEBHOOK_SECRET=",
        "",
      ].join("\n");
      fs.writeFileSync(envPath, defaults);
      log("info", "Created default .env file.");
    }
  }
}

// ─── Database ─────────────────────────────────────────────────────────────────

function runPrismaMigrations(): void {
  const schemaPath = path.join(rootDir, "packages", "database", "prisma", "schema.prisma");
  if (!fs.existsSync(schemaPath)) {
    log("info", "No Prisma schema found — skipping database migration.");
    return;
  }

  log("info", "Running Prisma migrations…");
  const ok = run("pnpm --filter @remixos/database prisma migrate deploy", { silent: false });
  if (ok) {
    log("success", "Database migrations applied.");
  } else {
    log("warn", "Prisma migration failed — check DATABASE_URL and database connectivity.");
  }
}

// ─── Redis ────────────────────────────────────────────────────────────────────

async function checkRedis(): Promise<void> {
  const redisUrl = process.env["REDIS_URL"];
  if (!redisUrl) {
    log("info", "REDIS_URL not set — Redis session store disabled.");
    return;
  }

  if (!commandExists("redis-cli")) {
    log("info", "redis-cli not found — skipping Redis connectivity check.");
    return;
  }

  const result = spawnSync("redis-cli", ["-u", redisUrl, "ping"], { stdio: "pipe" });
  if (result.status === 0 && result.stdout.toString().trim() === "PONG") {
    log("success", "Redis is reachable.");
  } else {
    log("warn", "Cannot reach Redis — check REDIS_URL.");
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function bootstrap(): Promise<void> {
  console.log("\n🚀 RemixOS Bootstrap\n" + "─".repeat(40));

  const config: BootstrapConfig = {
    platform: detectPlatform(),
    env: detectEnvironment(),
    nodeVersion: getNodeVersion(),
    pnpmVersion: getPnpmVersion(),
    rootDir,
    missingEnvVars: [],
  };

  log("info", `Platform:   ${config.platform}`);
  log("info", `Environment: ${config.env}`);
  log("info", `Node.js:     ${config.nodeVersion}`);
  log("info", `pnpm:        ${config.pnpmVersion}`);

  // Validate Node.js version
  const nodeMajor = parseInt(config.nodeVersion.replace("v", "").split(".")[0] ?? "0", 10);
  if (nodeMajor < 20) {
    log("error", `Node.js 20+ required (found ${config.nodeVersion}). Please upgrade.`);
    process.exit(1);
  }

  if (config.pnpmVersion === "not installed") {
    log("error", "pnpm not found. Run: corepack enable && corepack prepare pnpm@latest --activate");
    process.exit(1);
  }

  // Ensure .env exists
  ensureEnvFile();

  // Check required environment variables
  config.missingEnvVars = checkEnvVars(config.env);
  if (config.missingEnvVars.length > 0) {
    if (config.env === "production") {
      log("error", `Missing required environment variables: ${config.missingEnvVars.join(", ")}`);
      process.exit(1);
    } else {
      log("warn", `Missing env vars (non-critical in dev): ${config.missingEnvVars.join(", ")}`);
    }
  }

  // Install dependencies
  log("info", "Installing dependencies…");
  const installOk = run("pnpm install --frozen-lockfile");
  if (!installOk) {
    log("error", "pnpm install failed.");
    process.exit(1);
  }
  log("success", "Dependencies installed.");

  // Check Redis
  await checkRedis();

  // Run DB migrations (skip in CI unless explicitly requested)
  if (config.env !== "ci" || process.env["REMIXOS_RUN_MIGRATIONS"] === "true") {
    runPrismaMigrations();
  }

  console.log("\n" + "─".repeat(40));
  log("success", "Bootstrap complete! Start development with: pnpm dev");
  console.log();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
