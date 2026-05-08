import { randomUUID } from "node:crypto";
import type {
  AgentResult,
  AuditResult,
  BroadcastFn,
  LogEvent,
  QueueJob,
  QueuedTaskResult,
  TaskResult,
} from "@remixos/shared";
import { plannerAgent, builderAgent, executorAgent, securityAgent, fixerAgent } from "@remixos/agents";
import { loadCyberPlan } from "./adapters/cyberai.js";

function noopBroadcast(_event: LogEvent): void {}

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const queueStore = new Map<string, QueueJob>();
const queueJobTtlMs = parsePositiveInteger(process.env["REMIXOS_QUEUE_JOB_TTL_MS"], 5 * 60 * 1000);

function shouldCleanupJob(job: QueueJob, now: number): boolean {
  return (job.status === "completed" || job.status === "failed")
    && typeof job.completedAt === "number"
    && job.completedAt + queueJobTtlMs <= now;
}

function cleanupQueueStore(now = Date.now()): void {
  for (const [jobId, job] of queueStore.entries()) {
    if (shouldCleanupJob(job, now)) {
      queueStore.delete(jobId);
    }
  }
}

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

export async function runQueuedTask(
  prompt: string,
  broadcast: BroadcastFn = noopBroadcast
): Promise<QueuedTaskResult | { error: string; job: QueueJob }> {
  const now = Date.now();
  cleanupQueueStore(now);
  const job: QueueJob = {
    id: randomUUID(),
    status: "queued",
    createdAt: now,
    promptBytes: Buffer.byteLength(prompt, "utf8"),
  };

  queueStore.set(job.id, job);
  broadcast({ step: "queue", message: "Task queued", data: { jobId: job.id, status: job.status }, timestamp: now });

  job.status = "processing";
  job.startedAt = Date.now();
  queueStore.set(job.id, job);
  broadcast({ step: "queue", message: "Task processing", data: { jobId: job.id, status: job.status }, timestamp: job.startedAt });

  const result = await runTask(prompt, broadcast);
  job.completedAt = Date.now();

  if ("error" in result) {
    job.status = "failed";
    job.error = result.error;
    queueStore.set(job.id, job);
    broadcast({ step: "queue", message: "Task failed", data: { jobId: job.id, status: job.status }, timestamp: job.completedAt });
    return { error: result.error, job };
  }

  job.status = "completed";
  queueStore.set(job.id, job);
  broadcast({ step: "queue", message: "Task completed", data: { jobId: job.id, status: job.status }, timestamp: job.completedAt });
  return { job, result };
}

export function getQueuedTask(jobId: string): QueueJob | undefined {
  cleanupQueueStore();
  return queueStore.get(jobId);
}

export type { TaskResult, LogEvent, BroadcastFn, QueueJob, QueuedTaskResult };
