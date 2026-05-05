import type { AgentResult, CyberTask } from "@remixos/shared";

export async function plannerAgent(prompt: string): Promise<AgentResult> {
  const steps = deriveSteps(prompt);
  const plan: CyberTask = {
    goal: prompt,
    steps,
  };
  return {
    status: "success",
    data: plan,
    logs: [`Planner: derived ${steps.length} steps for goal`],
  };
}

function deriveSteps(prompt: string): string[] {
  const lower = prompt.toLowerCase();
  if (lower.includes("trade") || lower.includes("web3")) {
    return ["plan", "build", "execute-trade", "secure", "report"];
  }
  if (lower.includes("api") || lower.includes("backend")) {
    return ["plan", "build-api", "execute", "secure", "report"];
  }
  return ["plan", "build", "execute", "secure", "report"];
}
