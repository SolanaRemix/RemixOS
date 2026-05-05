import type { AgentResult, BuildOutput, CyberTask } from "@remixos/shared";

export async function builderAgent(plan: AgentResult): Promise<AgentResult> {
  const task = plan.data as CyberTask;
  const isTradeTask = task.steps.some((s: string) => s.includes("trade"));
  const isApiTask = task.steps.some((s: string) => s.includes("api"));

  const output: BuildOutput = {
    type: isTradeTask ? "trade" : isApiTask ? "api" : "webapp",
    html: generateHtml(task.goal),
    code: generateComponent(task.goal),
    api: generateApiStub(task.goal),
    ...(isTradeTask && {
      web3: { network: "base", action: "trade" },
    }),
  };

  return {
    status: "success",
    data: output,
    logs: [`Builder: generated ${output.type} scaffold`],
  };
}

function generateHtml(goal: string): string {
  return `<div style="font-family:sans-serif;padding:20px;background:#05070a;color:#fff">
  <h1 style="color:#8b5cf6">RemixOS App</h1>
  <p>${goal}</p>
</div>`;
}

function generateComponent(goal: string): string {
  return `export default function App() {
  return (
    <div className="min-h-screen bg-[#05070a] text-white p-8">
      <h1 className="text-2xl font-bold text-purple-400">RemixOS App</h1>
      <p className="mt-4 text-gray-300">${goal}</p>
    </div>
  );
}`;
}

function generateApiStub(goal: string): Record<string, string> {
  return {
    "/api/run": `// Generated handler for: ${goal}\nexport async function handler(req, res) { res.json({ status: "ok" }); }`,
    "/api/status": "export async function handler(req, res) { res.json({ status: \"running\" }); }",
  };
}
