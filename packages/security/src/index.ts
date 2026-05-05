import type { AuditResult } from "@remixos/shared";
import { scanRepo } from "./adapters/gitantivirus.js";

const UNSAFE_PATTERNS: Array<{ pattern: RegExp; description: string }> = [
  { pattern: /eval\s*\(/, description: "eval() usage detected" },
  { pattern: /new\s+Function\s*\(/, description: "new Function() usage detected" },
  { pattern: /\brequire\s*\(\s*['"]child_process['"]\s*\)/, description: "child_process import detected" },
  { pattern: /__proto__/, description: "prototype pollution risk" },
  { pattern: /constructor\[['"]constructor['"]\]/, description: "constructor injection risk" },
  { pattern: /process\.env\s*=/, description: "env mutation detected" },
];

export function scanCode(code: string): AuditResult {
  const issues: string[] = [];

  for (const { pattern, description } of UNSAFE_PATTERNS) {
    if (pattern.test(code)) {
      issues.push(description);
    }
  }

  return {
    safe: issues.length === 0,
    issues,
  };
}

export function validateStructure(data: unknown): AuditResult {
  if (data === null || data === undefined) {
    return { safe: false, issues: ["Output is null or undefined"] };
  }
  if (typeof data === "string" && data.length > 1_000_000) {
    return { safe: false, issues: ["Output exceeds size limit"] };
  }
  return { safe: true, issues: [] };
}

export async function auditExecution(data: unknown): Promise<AuditResult> {
  const structureResult = validateStructure(data);
  if (!structureResult.safe) return structureResult;

  const codeResult = scanCode(JSON.stringify(data));
  if (!codeResult.safe) return codeResult;

  return { safe: true, issues: [] };
}

export { scanRepo };
