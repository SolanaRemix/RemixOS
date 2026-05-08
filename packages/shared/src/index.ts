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

export interface AuthClaims {
  sub: string;
  workspaceId: string;
  scope: string[];
  iat?: number;
  exp?: number;
}

export interface RunPromptRequest {
  prompt: string;
}

export type AuditAction =
  | "issue_token"
  | "run_requested"
  | "run_completed"
  | "run_failed"
  | "auth_failed"
  | "rate_limited";

export interface AuditLogEntry {
  requestId: string;
  actorId: string;
  action: AuditAction;
  status: "success" | "failure";
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export type QueueJobStatus = "queued" | "processing" | "completed" | "failed";

export interface QueueJob {
  id: string;
  status: QueueJobStatus;
  createdAt: number;
  promptBytes: number;
  startedAt?: number;
  completedAt?: number;
  error?: string;
}

export interface QueuedTaskResult {
  job: QueueJob;
  result: TaskResult;
}

export type BroadcastFn = (event: LogEvent) => void;
