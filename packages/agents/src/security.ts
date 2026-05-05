import type { AgentResult, AuditResult } from "@remixos/shared";

const UNSAFE_PATTERNS = [
  /eval\s*\(/,
  /new\s+Function\s*\(/,
  /child_process/,
  /exec\s*\(/,
  /require\s*\(\s*['"]os['"]\s*\)/,
  /\bprocess\.env\b.*=\s*[^;]+/,
  /__proto__/,
  /constructor\s*\[\s*['"]constructor['"]\s*\]/,
];

export async function securityAgent(execution: AgentResult): Promise<AuditResult> {
  const issues: string[] = [];
  const content = JSON.stringify(execution.data);

  for (const pattern of UNSAFE_PATTERNS) {
    if (pattern.test(content)) {
      issues.push(`Unsafe pattern detected: ${pattern.toString()}`);
    }
  }

  return {
    safe: issues.length === 0,
    issues,
  };
}
