import { describe, it, expect } from "vitest";
import { getQueuedTask, runQueuedTask, runTask } from "../src/index.js";

describe("orchestrator", () => {
  it("runs full flow and returns safe result", async () => {
    const result = await runTask("build a landing page");
    expect(result).not.toHaveProperty("error");
    if ("audit" in result) {
      expect(result.audit.safe).toBe(true);
      expect(result.plan).toBeDefined();
      expect(result.build).toBeDefined();
      expect(result.execution).toBeDefined();
    }
  });

  it("handles trade prompt", async () => {
    const result = await runTask("run arbitrage trade strategy");
    expect(result).not.toHaveProperty("error");
    if ("build" in result) {
      expect(result.build.type).toBe("trade");
    }
  });

  it("calls broadcast with log events", async () => {
    const logs: string[] = [];
    await runTask("build an api", (event) => {
      logs.push(event.step);
    });
    expect(logs).toContain("planner");
    expect(logs).toContain("builder");
    expect(logs).toContain("executor");
    expect(logs).toContain("security");
  });

  it("tracks queue state transitions and stores job metadata", async () => {
    const queueSteps: string[] = [];
    const result = await runQueuedTask("build an api", (event) => {
      if (event.step === "queue") {
        queueSteps.push(event.message ?? "");
      }
    });

    expect(result).not.toHaveProperty("error");
    if ("result" in result) {
      expect(result.job.promptBytes).toBeGreaterThan(0);
      expect(result.job.status).toBe("completed");
      expect(result.job.startedAt).toBeTypeOf("number");
      expect(result.job.completedAt).toBeTypeOf("number");
      expect(result.job.completedAt).toBeGreaterThanOrEqual(result.job.startedAt!);
      expect(getQueuedTask(result.job.id)?.status).toBe("completed");
    }

    expect(queueSteps).toEqual(["Task queued", "Task processing", "Task completed"]);
  });

  it("marks queued jobs as failed when execution errors", async () => {
    const result = await runQueuedTask("build an api", (event) => {
      if (event.step === "planner") {
        throw new Error("broadcast failed");
      }
    });

    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(result.error).toContain("broadcast failed");
      expect(result.job.status).toBe("failed");
      expect(result.job.error).toContain("broadcast failed");
      expect(result.job.completedAt).toBeTypeOf("number");
    }
  });
});
