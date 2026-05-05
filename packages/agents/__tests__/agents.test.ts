import { describe, it, expect } from "vitest";
import { plannerAgent } from "../src/planner.js";
import { builderAgent } from "../src/builder.js";
import { securityAgent } from "../src/security.js";
import { fixerAgent } from "../src/fixer.js";

describe("plannerAgent", () => {
  it("returns success status with plan data", async () => {
    const result = await plannerAgent("build a landing page");
    expect(result.status).toBe("success");
    expect(result.data).toBeDefined();
    expect(result.logs.length).toBeGreaterThan(0);
  });

  it("derives trade steps for trade prompts", async () => {
    const result = await plannerAgent("run a trade strategy");
    const data = result.data as { steps: string[] };
    expect(data.steps).toContain("execute-trade");
  });

  it("derives api steps for api prompts", async () => {
    const result = await plannerAgent("create a REST api");
    const data = result.data as { steps: string[] };
    expect(data.steps).toContain("build-api");
  });
});

describe("builderAgent", () => {
  it("generates webapp scaffold", async () => {
    const plan = await plannerAgent("build a dashboard");
    const build = await builderAgent(plan);
    expect(build.status).toBe("success");
    const data = build.data as { type: string };
    expect(data.type).toBe("webapp");
  });

  it("generates trade scaffold for trade prompts", async () => {
    const plan = await plannerAgent("run a trade strategy");
    const build = await builderAgent(plan);
    const data = build.data as { type: string };
    expect(data.type).toBe("trade");
  });
});

describe("securityAgent", () => {
  it("marks safe execution as safe", async () => {
    const mockExecution = {
      status: "success" as const,
      data: { output: "Hello World", timestamp: Date.now() },
      logs: ["Executor: done"],
    };
    const audit = await securityAgent(mockExecution);
    expect(audit.safe).toBe(true);
    expect(audit.issues).toHaveLength(0);
  });

  it("detects unsafe patterns", async () => {
    const mockExecution = {
      status: "success" as const,
      data: { code: "eval(userInput)" },
      logs: [],
    };
    const audit = await securityAgent(mockExecution);
    expect(audit.safe).toBe(false);
    expect(audit.issues.length).toBeGreaterThan(0);
  });
});

describe("fixerAgent", () => {
  it("patches security issues and returns safe result", async () => {
    const audit = { safe: false, issues: ["eval() usage detected"] };
    const fix = await fixerAgent(audit);
    expect(fix.status).toBe("success");
    const data = fix.data as { patched: boolean; audit: { safe: boolean } };
    expect(data.patched).toBe(true);
    expect(data.audit.safe).toBe(true);
  });
});
