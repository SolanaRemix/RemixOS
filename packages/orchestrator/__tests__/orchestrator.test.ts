import { describe, it, expect } from "vitest";
import { runTask } from "../src/index.js";

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
});
