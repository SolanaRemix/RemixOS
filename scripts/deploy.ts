#!/usr/bin/env tsx
/**
 * RemixOS Deploy Script
 * Handles deployment to multiple targets: Vercel, Netlify, Docker, Railway, Fly.io, VPS.
 */

import { spawnSync } from "node:child_process";
import path from "node:path";

// ─── Types ────────────────────────────────────────────────────────────────────

type DeployTarget =
  | "vercel"
  | "netlify"
  | "docker"
  | "railway"
  | "fly"
  | "render"
  | "vps";

interface DeployOptions {
  target: DeployTarget;
  environment: "production" | "preview";
  dryRun: boolean;
  skipBuild: boolean;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function log(level: "info" | "warn" | "error" | "success" | "step", message: string): void {
  const icons = { info: "ℹ", warn: "⚠", error: "✖", success: "✔", step: "→" } as const;
  const colors = {
    info: "\x1b[36m", warn: "\x1b[33m", error: "\x1b[31m",
    success: "\x1b[32m", step: "\x1b[35m",
  } as const;
  const reset = "\x1b[0m";
  console.log(`${colors[level]}${icons[level]}${reset} ${message}`);
}

const rootDir = path.resolve(import.meta.dirname ?? process.cwd(), "..");

function run(
  file: string,
  args: string[],
  options: { cwd?: string; silent?: boolean } = {},
): boolean {
  const result = spawnSync(file, args, {
    stdio: options.silent ? "pipe" : "inherit",
    cwd: options.cwd ?? rootDir,
  });
  return result.status === 0;
}

function commandExists(cmd: string): boolean {
  const result = spawnSync(cmd, ["--version"], { stdio: "pipe" });
  return result.status === 0;
}

function ensureSafeIdentifier(value: string, field: string, pattern: RegExp): string {
  if (!pattern.test(value)) {
    throw new Error(`Invalid ${field}: ${value}`);
  }
  return value;
}

// ─── Build ────────────────────────────────────────────────────────────────────

async function buildAll(): Promise<void> {
  log("step", "Building all packages…");
  const ok = run("pnpm", ["build"]);
  if (!ok) throw new Error("Build failed");
  log("success", "Build complete.");
}

// ─── Pre-deploy checks ────────────────────────────────────────────────────────

async function preDeployChecks(opts: DeployOptions): Promise<void> {
  log("step", "Running pre-deploy checks…");

  // Lint
  log("info", "  Linting…");
  const lintOk = run("pnpm", ["lint"], { silent: true });
  if (!lintOk) {
    log("warn", "  Lint warnings detected — continuing (run pnpm lint to inspect).");
  }

  // Type check
  log("info", "  Type checking…");
  const tcOk = run("pnpm", ["typecheck"], { silent: true });
  if (!tcOk) {
    if (opts.environment === "production") {
      throw new Error("TypeScript errors detected. Fix before deploying to production.");
    }
    log("warn", "  TypeScript errors detected — deploying to preview anyway.");
  }

  // Tests
  log("info", "  Running tests…");
  const testOk = run("pnpm", ["test"], { silent: true });
  if (!testOk) {
    if (opts.environment === "production") {
      throw new Error("Tests failed. Fix before deploying to production.");
    }
    log("warn", "  Tests failed — deploying to preview anyway.");
  }

  log("success", "Pre-deploy checks passed.");
}

// ─── Deploy Targets ───────────────────────────────────────────────────────────

async function deployVercel(opts: DeployOptions): Promise<void> {
  if (!commandExists("vercel")) {
    log("error", "Vercel CLI not found. Install with: pnpm add -g vercel");
    throw new Error("Missing vercel CLI");
  }

  const flags = opts.environment === "production" ? "--prod" : "";
  log("step", `Deploying to Vercel (${opts.environment})…`);
  if (!opts.dryRun) {
    const args = ["deploy", "--yes"];
    if (flags) args.splice(1, 0, flags);
    const ok = run("vercel", args);
    if (!ok) throw new Error("Vercel deployment failed");
  } else {
    log("info", `[DRY RUN] Would run: vercel deploy ${flags} --yes`.trim());
  }
  log("success", "Vercel deployment complete.");
}

async function deployNetlify(opts: DeployOptions): Promise<void> {
  if (!commandExists("netlify")) {
    log("error", "Netlify CLI not found. Install with: pnpm add -g netlify-cli");
    throw new Error("Missing netlify CLI");
  }

  const dir = "apps/studio/.next";
  const flags = opts.environment === "production" ? "--prod" : "";
  log("step", `Deploying to Netlify (${opts.environment})…`);
  if (!opts.dryRun) {
    const args = ["deploy", "--dir", dir];
    if (flags) args.push(flags);
    const ok = run("netlify", args);
    if (!ok) throw new Error("Netlify deployment failed");
  } else {
    log("info", `[DRY RUN] Would run: netlify deploy --dir ${dir} ${flags}`.trim());
  }
  log("success", "Netlify deployment complete.");
}

async function deployDocker(opts: DeployOptions): Promise<void> {
  const composeFile = "infra/docker/docker-compose.yml";
  log("step", "Deploying via Docker Compose…");

  if (!opts.dryRun) {
    const ok = run("docker", ["compose", "-f", composeFile, "up", "--build", "-d"]);
    if (!ok) throw new Error("Docker deployment failed");
  } else {
    log("info", `[DRY RUN] Would run: docker compose -f ${composeFile} up --build -d`);
  }
  log("success", "Docker deployment complete.");
}

async function deployRailway(opts: DeployOptions): Promise<void> {
  if (!commandExists("railway")) {
    log("error", "Railway CLI not found. Install with: pnpm add -g @railway/cli");
    throw new Error("Missing railway CLI");
  }

  log("step", "Deploying to Railway…");
  if (!opts.dryRun) {
    const ok = run("railway", ["up"]);
    if (!ok) throw new Error("Railway deployment failed");
  } else {
    log("info", "[DRY RUN] Would run: railway up");
  }
  log("success", "Railway deployment complete.");
}

async function deployFly(opts: DeployOptions): Promise<void> {
  if (!commandExists("flyctl")) {
    log("error", "flyctl not found. Install from: https://fly.io/docs/hands-on/install-flyctl/");
    throw new Error("Missing flyctl");
  }

  const flags = opts.environment === "production" ? "" : "--strategy=immediate";
  log("step", "Deploying to Fly.io…");
  if (!opts.dryRun) {
    const args = ["deploy"];
    if (flags) args.push(flags);
    const ok = run("flyctl", args);
    if (!ok) throw new Error("Fly.io deployment failed");
  } else {
    log("info", `[DRY RUN] Would run: flyctl deploy ${flags}`);
  }
  log("success", "Fly.io deployment complete.");
}

async function deployVps(opts: DeployOptions): Promise<void> {
  const rawHost = process.env["VPS_HOST"];
  const rawUser = process.env["VPS_USER"] ?? "ubuntu";
  const rawAppDir = process.env["VPS_APP_DIR"] ?? "/opt/remixos";

  if (!rawHost) {
    throw new Error("VPS_HOST environment variable is required for VPS deployment.");
  }

  const host = ensureSafeIdentifier(
    rawHost,
    "VPS_HOST",
    /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/,
  );
  const user = ensureSafeIdentifier(rawUser, "VPS_USER", /^[a-zA-Z_][a-zA-Z0-9_-]*$/);
  const appDirCandidate = ensureSafeIdentifier(rawAppDir, "VPS_APP_DIR", /^\/[a-zA-Z0-9_/-]+$/);
  const appSegments = appDirCandidate.split("/").filter(Boolean);
  if (appSegments.length === 0) {
    throw new Error("Invalid VPS_APP_DIR: must contain at least one directory segment");
  }
  if (!appSegments.every((segment) => /^[a-zA-Z0-9_-]+$/.test(segment))) {
    throw new Error("Invalid VPS_APP_DIR: contains unsupported path segment");
  }
  const appDir = `/${appSegments.join("/")}`;

  log("step", `Deploying to VPS (${host})…`);

  const sshRun = (remoteCmd: string, silent = false): boolean => {
    return run("ssh", [`${user}@${host}`, remoteCmd], { silent });
  };

  if (!opts.dryRun) {
    // Pull latest code
    if (!sshRun(`cd ${appDir} && git pull origin main`)) {
      throw new Error("VPS git pull failed");
    }
    // Install dependencies
    if (!sshRun(`cd ${appDir} && pnpm install --frozen-lockfile`)) {
      throw new Error("VPS dependency install failed");
    }
    // Build
    if (!sshRun(`cd ${appDir} && pnpm build`)) {
      throw new Error("VPS build failed");
    }
    // Restart services (assumes pm2 or systemd)
    if (!sshRun("pm2 reload all", true)) {
      if (!sshRun("systemctl restart remixos")) {
        throw new Error("VPS service restart failed");
      }
    }
  } else {
    log("info", `[DRY RUN] Would SSH to ${user}@${host} and run deploy commands`);
  }
  log("success", "VPS deployment complete.");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function parseArgs(): DeployOptions {
  const args = process.argv.slice(2);
  const target = (args[0] ?? "vercel") as DeployTarget;
  const validTargets: DeployTarget[] = ["vercel", "netlify", "docker", "railway", "fly", "render", "vps"];

  if (!validTargets.includes(target)) {
    console.error(`Unknown target: ${target}. Valid targets: ${validTargets.join(", ")}`);
    process.exit(1);
  }

  return {
    target,
    environment: args.includes("--prod") ? "production" : "preview",
    dryRun: args.includes("--dry-run"),
    skipBuild: args.includes("--skip-build"),
  };
}

async function deploy(): Promise<void> {
  const opts = parseArgs();

  console.log("\n🚀 RemixOS Deploy\n" + "─".repeat(40));
  log("info", `Target:       ${opts.target}`);
  log("info", `Environment:  ${opts.environment}`);
  log("info", `Dry run:      ${opts.dryRun}`);

  if (!opts.skipBuild) {
    await buildAll();
  }

  await preDeployChecks(opts);

  switch (opts.target) {
    case "vercel":   await deployVercel(opts);  break;
    case "netlify":  await deployNetlify(opts); break;
    case "docker":   await deployDocker(opts);  break;
    case "railway":  await deployRailway(opts); break;
    case "fly":      await deployFly(opts);     break;
    case "vps":      await deployVps(opts);     break;
    default:
      log("error", `Unsupported target: ${opts.target}`);
      process.exit(1);
  }

  console.log("\n" + "─".repeat(40));
  log("success", `Deployment to ${opts.target} (${opts.environment}) complete! 🎉`);
}

deploy().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  log("error", message);
  process.exit(1);
});
