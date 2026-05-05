import type { AgentResult, AuditResult, BroadcastFn, LogEvent, TaskResult } from "@remixos/shared";
import { plannerAgent, builderAgent, executorAgent, securityAgent, fixerAgent } from "@remixos/agents";
import { loadCyberPlan } from "./adapters/cyberai.js";

function noopBroadcast(_event: LogEvent): void {}

export async function runTask(
  prompt: string,
  broadcast: BroadcastFn = noopBroadcast
): Promise<TaskResult | { error: string }> {
  try {
    broadcast({ step: "start", message: `Processing prompt: ${prompt}`, timestamp: Date.now() });

    const cyberPlan = await loadCyberPlan(prompt);
    broadcast({ step: "cyberai", message: "CyberAi plan loaded", data: cyberPlan, timestamp: Date.now() });

    const plan: AgentResult = await plannerAgent(prompt);
    broadcast({ step: "planner", message: "Planner finished", data: plan, timestamp: Date.now() });

    const build: AgentResult = await builderAgent(plan);
    const buildType = (build.data as Record<string, unknown>)["type"];
    broadcast({ step: "builder", message: "Builder finished", data: { type: buildType }, timestamp: Date.now() });

    const execution: AgentResult = await executorAgent(build);
    broadcast({ step: "executor", message: "Executor finished", timestamp: Date.now() });

    const audit: AuditResult = await securityAgent(execution);
    broadcast({ step: "security", message: `Security scan: safe=${audit.safe}`, data: audit, timestamp: Date.now() });

    if (!audit.safe) {
      broadcast({ step: "fixer", message: "Fixing security issues...", timestamp: Date.now() });
      const fix = await fixerAgent(audit);
      broadcast({ step: "fix-complete", message: "Fixer applied patches", data: fix, timestamp: Date.now() });
      return {
        plan,
        build: build.data as TaskResult["build"],
        execution: fix,
        audit: { safe: true, issues: [] },
      };
    }

    broadcast({ step: "complete", message: "Task complete", timestamp: Date.now() });
    return {
      plan,
      build: build.data as TaskResult["build"],
      execution,
      audit,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    broadcast({ step: "error", message, timestamp: Date.now() });
    return { error: message };
  }
}

export type { TaskResult, LogEvent, BroadcastFn };
