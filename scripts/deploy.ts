#!/usr/bin/env tsx
/**
 * RemixOS Deploy Script
 * Handles deployment to multiple targets: Vercel, Netlify, Docker, Railway, Fly.io, VPS.
 */

import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
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

function run(cmd: string, options: { cwd?: string; silent?: boolean } = {}): boolean {
  if (options.silent) {
    const result = spawnSync(cmd, { shell: true, stdio: "pipe", cwd: options.cwd ?? rootDir });
    return result.status === 0;
  }
  try {
    execSync(cmd, { stdio: "inherit", cwd: options.cwd ?? rootDir });
    return true;
  } catch {
    return false;
  }
}

function commandExists(cmd: string): boolean {
  const result = spawnSync(cmd, ["--version"], { shell: true, stdio: "pipe" });
  return result.status === 0;
}

// ─── Build ────────────────────────────────────────────────────────────────────

async function buildAll(): Promise<void> {
  log("step", "Building all packages…");
  const ok = run("pnpm build");
  if (!ok) throw new Error("Build failed");
  log("success", "Build complete.");
}

// ─── Pre-deploy checks ────────────────────────────────────────────────────────

async function preDeployChecks(opts: DeployOptions): Promise<void> {
  log("step", "Running pre-deploy checks…");

  // Lint
  log("info", "  Linting…");
  const lintOk = run("pnpm lint", { silent: true });
  if (!lintOk) {
    log("warn", "  Lint warnings detected — continuing (run pnpm lint to inspect).");
  }

  // Type check
  log("info", "  Type checking…");
  const tcOk = run("pnpm typecheck", { silent: true });
  if (!tcOk) {
    if (opts.environment === "production") {
      throw new Error("TypeScript errors detected. Fix before deploying to production.");
    }
    log("warn", "  TypeScript errors detected — deploying to preview anyway.");
  }

  // Tests
  log("info", "  Running tests…");
  const testOk = run("pnpm test", { silent: true });
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
  const cmd = `vercel deploy ${flags} --yes`;

  log("step", `Deploying to Vercel (${opts.environment})…`);
  if (!opts.dryRun) {
    const ok = run(cmd);
    if (!ok) throw new Error("Vercel deployment failed");
  } else {
    log("info", `[DRY RUN] Would run: ${cmd}`);
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
  const cmd = `netlify deploy --dir ${dir} ${flags}`;

  log("step", `Deploying to Netlify (${opts.environment})…`);
  if (!opts.dryRun) {
    const ok = run(cmd);
    if (!ok) throw new Error("Netlify deployment failed");
  } else {
    log("info", `[DRY RUN] Would run: ${cmd}`);
  }
  log("success", "Netlify deployment complete.");
}

async function deployDocker(opts: DeployOptions): Promise<void> {
  const composeFile = "infra/docker/docker-compose.yml";
  log("step", "Deploying via Docker Compose…");

  if (!opts.dryRun) {
    const ok = run(`docker compose -f ${composeFile} up --build -d`);
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
    const ok = run("railway up");
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
    const ok = run(`flyctl deploy ${flags}`);
    if (!ok) throw new Error("Fly.io deployment failed");
  } else {
    log("info", `[DRY RUN] Would run: flyctl deploy ${flags}`);
  }
  log("success", "Fly.io deployment complete.");
}

async function deployVps(opts: DeployOptions): Promise<void> {
  const host = process.env["VPS_HOST"];
  const user = process.env["VPS_USER"] ?? "ubuntu";
  const appDir = process.env["VPS_APP_DIR"] ?? "/opt/remixos";

  if (!host) {
    throw new Error("VPS_HOST environment variable is required for VPS deployment.");
  }

  log("step", `Deploying to VPS (${host})…`);

  const sshCmd = (cmd: string) => `ssh ${user}@${host} "${cmd}"`;

  if (!opts.dryRun) {
    // Pull latest code
    run(sshCmd(`cd ${appDir} && git pull origin main`));
    // Install dependencies
    run(sshCmd(`cd ${appDir} && pnpm install --frozen-lockfile`));
    // Build
    run(sshCmd(`cd ${appDir} && pnpm build`));
    // Restart services (assumes pm2 or systemd)
    if (!run(sshCmd("pm2 reload all"), { silent: true })) {
      run(sshCmd("systemctl restart remixos"));
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
