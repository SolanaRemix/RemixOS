import type { AgentResult, BuildOutput } from "@remixos/shared";
import { runGXQS } from "./adapters/gxqs.js";
import { runSmartBrain } from "./adapters/smartbrain.js";
import { runTradeOS } from "./tradeos.js";

export async function execute(build: AgentResult): Promise<AgentResult> {
  const output = build.data as BuildOutput;

  if (output.type === "trade") {
    const tradeResult = await runTradeOS({
      action: output.web3?.action ?? "trade",
      network: output.web3?.network ?? "base",
    });
    return {
      status: "success",
      data: tradeResult,
      logs: [`Executor: trade executed on ${tradeResult.strategy.network}`],
    };
  }

  if (output.type === "heavy") {
    const gxqsResult = await runGXQS(JSON.stringify(output));
    return {
      status: "success",
      data: gxqsResult,
      logs: [`Executor: GXQS engine processed task`],
    };
  }

  // Default: SmartBrain execution
  const brainResult = await runSmartBrain(JSON.stringify(output));
  return {
    status: "success",
    data: {
      ...brainResult,
      output,
      timestamp: Date.now(),
    },
    logs: [`Executor: SmartBrain completed execution`],
  };
}

export { runGXQS, runSmartBrain, runTradeOS };
