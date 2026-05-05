import type { AuditResult } from "@remixos/shared";

export async function scanRepo(path: string): Promise<AuditResult> {
  // Adapter: later replace with actual GitAntivirus CLI call
  // e.g., execSync(`gitantivirus scan ${path}`)
  void path;
  return {
    safe: true,
    issues: [],
  };
}
