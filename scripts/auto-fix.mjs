import { execSync } from "child_process";

console.log("🔧 RemixOS Self-Healing CI: Running auto-fix...");

const commands = [
  { cmd: "pnpm install", label: "Reinstalling dependencies" },
];

let ranSuccessfully = false;

for (const { cmd, label } of commands) {
  try {
    console.log(`  ▶ ${label}...`);
    execSync(cmd, { stdio: "inherit" });
    ranSuccessfully = true;
  } catch {
    console.log(`  ✗ ${label} failed`);
  }
}

if (ranSuccessfully) {
  console.log("✅ Auto-fix complete. Re-running build and tests...");
  try {
    execSync("pnpm build", { stdio: "inherit" });
    console.log("✅ Build passing after auto-fix.");
  } catch {
    console.log("❌ Build still failing after auto-fix. Manual review required.");
    process.exit(1);
  }
  try {
    execSync("pnpm test", { stdio: "inherit" });
    console.log("✅ Tests passing after auto-fix.");
  } catch {
    console.log("❌ Tests still failing after auto-fix. Manual review required.");
    process.exit(1);
  }
} else {
  console.log("❌ Auto-fix could not resolve issues. Manual review required.");
  process.exit(1);
}
