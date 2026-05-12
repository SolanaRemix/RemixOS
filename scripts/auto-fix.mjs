import { spawnSync } from "child_process";

console.log("🔧 RemixOS Self-Healing CI: Running auto-fix...");

const commands = [{ file: "pnpm", args: ["install"], label: "Reinstalling dependencies" }];

let ranSuccessfully = false;

function run(file, args) {
  const result = spawnSync(file, args, { stdio: "inherit" });
  return result.status === 0;
}

for (const { file, args, label } of commands) {
  try {
    console.log(`  ▶ ${label}...`);
    if (!run(file, args)) throw new Error("command failed");
    ranSuccessfully = true;
  } catch {
    console.log(`  ✗ ${label} failed`);
  }
}

if (ranSuccessfully) {
  console.log("✅ Auto-fix complete. Re-running build and tests...");
  try {
    if (!run("pnpm", ["build"])) throw new Error("build failed");
    console.log("✅ Build passing after auto-fix.");
  } catch {
    console.log("❌ Build still failing after auto-fix. Manual review required.");
    process.exit(1);
  }
  try {
    if (!run("pnpm", ["test"])) throw new Error("test failed");
    console.log("✅ Tests passing after auto-fix.");
  } catch {
    console.log("❌ Tests still failing after auto-fix. Manual review required.");
    process.exit(1);
  }
} else {
  console.log("❌ Auto-fix could not resolve issues. Manual review required.");
  process.exit(1);
}
