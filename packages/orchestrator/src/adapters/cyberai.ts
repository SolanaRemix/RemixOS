import type { CyberTask } from "@remixos/shared";

export async function loadCyberPlan(prompt: string): Promise<CyberTask> {
  // Adapter: later connect real CyberAi repo
  const lower = prompt.toLowerCase();
  const steps: string[] = [];

  if (lower.includes("trade") || lower.includes("web3")) {
    steps.push(...["plan", "build", "execute-trade", "secure"]);
  } else if (lower.includes("api")) {
    steps.push(...["plan", "build-api", "execute", "secure"]);
  } else {
    steps.push(...["plan", "build", "execute", "secure"]);
  }

  return { goal: prompt, steps };
}
