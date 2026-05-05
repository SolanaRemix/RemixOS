export interface LogEvent {
  step: string;
  message?: string;
  data?: unknown;
  timestamp?: number;
}

export interface AgentResult {
  status: "success" | "failure";
  data: unknown;
  logs: string[];
}

export interface BuildOutput {
  type: "webapp" | "api" | "trade" | "heavy";
  html?: string;
  code?: string;
  api?: Record<string, string>;
  web3?: {
    network: string;
    action: string;
  };
}

export interface TaskResult {
  plan: AgentResult;
  build: BuildOutput;
  execution: AgentResult;
  audit: AuditResult;
}

export interface AuditResult {
  safe: boolean;
  issues: string[];
}

export interface CyberTask {
  goal: string;
  steps: string[];
}

export type BroadcastFn = (event: LogEvent) => void;
