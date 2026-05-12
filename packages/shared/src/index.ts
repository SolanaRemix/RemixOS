// ─── AI Provider System ──────────────────────────────────────────────────────

export type AiProvider =
  | "openai"
  | "anthropic"
  | "grok"
  | "deepseek"
  | "gemini"
  | "zhipuai"
  | "ollama"
  | "custom";

export interface AiProviderConfig {
  provider: AiProvider;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  enabled: boolean;
}

export interface AiCompletionRequest {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AiCompletionResponse {
  provider: AiProvider;
  model: string;
  content: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
}

// ─── Subscription / Billing ──────────────────────────────────────────────────

export type SubscriptionTier = "free" | "starter" | "pro" | "enterprise";
export type BillingInterval = "monthly" | "yearly";
export type PaymentProvider = "stripe" | "paypal" | "crypto" | "bank_transfer";

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  aiTokensPerMonth: number;
  maxProjects: number;
  maxTeamMembers: number;
  customDomain: boolean;
  whiteLabel: boolean;
  prioritySupport: boolean;
}

export interface UserSubscription {
  userId: string;
  tier: SubscriptionTier;
  interval: BillingInterval;
  status: "active" | "cancelled" | "past_due" | "trialing";
  currentPeriodStart: number;
  currentPeriodEnd: number;
  tokensUsed: number;
  tokensLimit: number;
  paymentProvider?: PaymentProvider;
  externalSubscriptionId?: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  type: "purchase" | "usage" | "refund" | "bonus";
  amount: number;
  balance: number;
  description: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

// ─── Website Builder ─────────────────────────────────────────────────────────

export type WebsiteCategory =
  | "landing"
  | "saas"
  | "portfolio"
  | "ecommerce"
  | "blog"
  | "dashboard"
  | "docs";

export interface WebsiteGenerationRequest {
  description: string;
  category: WebsiteCategory;
  colorScheme?: string;
  style?: "modern" | "minimal" | "bold" | "elegant";
  pages?: string[];
  includeAuth?: boolean;
  includePayments?: boolean;
  targetAudience?: string;
}

export interface WebsiteSection {
  id: string;
  type: "hero" | "features" | "pricing" | "testimonials" | "cta" | "footer" | "header" | "faq" | "team" | "custom";
  content: Record<string, unknown>;
  html: string;
  order: number;
}

export interface GeneratedWebsite {
  id: string;
  title: string;
  description: string;
  category: WebsiteCategory;
  sections: WebsiteSection[];
  html: string;
  css: string;
  seoMeta: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
  createdAt: number;
}

// ─── Core Events & Tasks ─────────────────────────────────────────────────────

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
