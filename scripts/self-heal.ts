#!/usr/bin/env tsx
/**
 * RemixOS Self-Heal Script
 * Detects broken build/test state and automatically attempts to repair it.
 * Exits with code 1 if the system cannot be healed — never reports false-green.
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HealStep {
  name: string;
  file: string;
  args: string[];
  critical: boolean;
}

interface HealAttempt {
  step: string;
  attempt: number;
  success: boolean;
  durationMs: number;
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function log(level: "info" | "warn" | "error" | "success", message: string): void {
  const ts = new Date().toISOString();
  const icons = { info: "ℹ", warn: "⚠", error: "✖", success: "✔" } as const;
  const colors = { info: "\x1b[36m", warn: "\x1b[33m", error: "\x1b[31m", success: "\x1b[32m" } as const;
  const reset = "\x1b[0m";
  console.log(`[${ts}] ${colors[level]}${icons[level]}${reset} ${message}`);
}

const rootDir = path.resolve(import.meta.dirname ?? process.cwd(), "..");

function run(file: string, args: string[]): { success: boolean; durationMs: number } {
  const start = Date.now();
  const result = spawnSync(file, args, {
    stdio: "inherit",
    cwd: rootDir,
  });
  const durationMs = Date.now() - start;
  return { success: result.status === 0, durationMs };
}

// ─── Repair Strategies ────────────────────────────────────────────────────────

function clearNodeModules(): void {
  log("info", "Clearing node_modules for clean install…");
  const dirs = [
    "node_modules",
    "apps/gateway/node_modules",
    "apps/studio/node_modules",
    "packages/shared/node_modules",
    "packages/agents/node_modules",
    "packages/orchestrator/node_modules",
    "packages/builder/node_modules",
    "packages/executor/node_modules",
    "packages/security/node_modules",
  ];
  for (const dir of dirs) {
    const full = path.join(rootDir, dir);
    if (fs.existsSync(full)) {
      fs.rmSync(full, { recursive: true, force: true });
    }
  }
}

function clearDistDirs(): void {
  log("info", "Clearing dist directories…");
  const distDirs: string[] = [];

  function findDist(base: string, depth = 0): void {
    if (depth > 3) return;
    try {
      for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
        if (entry.isDirectory()) {
          if (entry.name === "dist" || entry.name === ".next") {
            distDirs.push(path.join(base, entry.name));
          } else if (entry.name !== "node_modules" && entry.name !== ".git") {
            findDist(path.join(base, entry.name), depth + 1);
          }
        }
      }
    } catch {
      // ignore permission errors
    }
  }

  findDist(rootDir);
  for (const dir of distDirs) {
    fs.rmSync(dir, { recursive: true, force: true });
    log("info", `  Removed ${path.relative(rootDir, dir)}`);
  }
}

// ─── Heal Pipeline ────────────────────────────────────────────────────────────

const HEAL_STEPS: HealStep[] = [
  { name: "install", file: "pnpm", args: ["install", "--frozen-lockfile"], critical: true },
  { name: "build", file: "pnpm", args: ["build"], critical: true },
  { name: "typecheck", file: "pnpm", args: ["typecheck"], critical: false },
  { name: "test", file: "pnpm", args: ["test"], critical: true },
];

const MAX_ATTEMPTS = 3;

async function selfHeal(): Promise<void> {
  console.log("\n🔧 RemixOS Self-Heal\n" + "─".repeat(40));

  const history: HealAttempt[] = [];
  let attempt = 1;

  while (attempt <= MAX_ATTEMPTS) {
    log("info", `\nHeal attempt ${attempt}/${MAX_ATTEMPTS}…`);

    let allPassed = true;

    for (const step of HEAL_STEPS) {
      log("info", `  Running: ${step.name} (${step.file} ${step.args.join(" ")})`);
      const result = run(step.file, step.args);
      history.push({ step: step.name, attempt, success: result.success, durationMs: result.durationMs });

      if (!result.success) {
        allPassed = false;
        if (step.critical) {
          log("warn", `  ${step.name} failed (${result.durationMs}ms) — triggering repair strategy`);
          break;
        } else {
          log("warn", `  ${step.name} failed (non-critical, continuing)`);
        }
      } else {
        log("success", `  ${step.name} passed (${result.durationMs}ms)`);
      }
    }

    if (allPassed) {
      console.log("\n" + "─".repeat(40));
      log("success", `System healed on attempt ${attempt}. ✔`);
      printSummary(history);
      return;
    }

    // Apply progressively more aggressive repair
    if (attempt === 1) {
      log("info", "\nStrategy: clearing dist directories and rebuilding…");
      clearDistDirs();
    } else if (attempt === 2) {
      log("info", "\nStrategy: full clean install…");
      clearDistDirs();
      clearNodeModules();
    }

    attempt++;
  }

  // Still broken after all attempts
  console.log("\n" + "─".repeat(40));
  log("error", `System could not be healed after ${MAX_ATTEMPTS} attempts.`);
  printSummary(history);

  const failedCritical = history.filter((h) => !h.success);
  if (failedCritical.length > 0) {
    log("error", "Failed steps: " + failedCritical.map((h) => `${h.step}@attempt${h.attempt}`).join(", "));
  }

  process.exit(1);
}

function printSummary(history: HealAttempt[]): void {
  console.log("\nHeal Summary:");
  for (const h of history) {
    const status = h.success ? "\x1b[32m✔\x1b[0m" : "\x1b[31m✖\x1b[0m";
    console.log(`  ${status} attempt=${h.attempt} step=${h.step} (${h.durationMs}ms)`);
  }
}

selfHeal().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  log("error", message);
  process.exit(1);
});
