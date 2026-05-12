import type { AiCompletionRequest, AiCompletionResponse, AiProvider, AiProviderConfig } from "@remixos/shared";

// ─── Provider Configurations ─────────────────────────────────────────────────

function buildProviderConfigs(): AiProviderConfig[] {
  const configs: AiProviderConfig[] = [];

  if (process.env["OPENAI_API_KEY"]) {
    configs.push({
      provider: "openai",
      model: process.env["OPENAI_MODEL"] ?? "gpt-4o-mini",
      apiKey: process.env["OPENAI_API_KEY"],
      baseUrl: process.env["OPENAI_BASE_URL"] ?? "https://api.openai.com/v1",
      maxTokens: 4096,
      temperature: 0.7,
      enabled: true,
    });
  }

  if (process.env["ANTHROPIC_API_KEY"]) {
    configs.push({
      provider: "anthropic",
      model: process.env["ANTHROPIC_MODEL"] ?? "claude-3-5-haiku-20241022",
      apiKey: process.env["ANTHROPIC_API_KEY"],
      baseUrl: "https://api.anthropic.com/v1",
      maxTokens: 4096,
      temperature: 0.7,
      enabled: true,
    });
  }

  if (process.env["GROK_API_KEY"]) {
    configs.push({
      provider: "grok",
      model: process.env["GROK_MODEL"] ?? "grok-2-latest",
      apiKey: process.env["GROK_API_KEY"],
      baseUrl: "https://api.x.ai/v1",
      maxTokens: 4096,
      temperature: 0.7,
      enabled: true,
    });
  }

  if (process.env["DEEPSEEK_API_KEY"]) {
    configs.push({
      provider: "deepseek",
      model: process.env["DEEPSEEK_MODEL"] ?? "deepseek-chat",
      apiKey: process.env["DEEPSEEK_API_KEY"],
      baseUrl: "https://api.deepseek.com/v1",
      maxTokens: 4096,
      temperature: 0.7,
      enabled: true,
    });
  }

  if (process.env["GEMINI_API_KEY"]) {
    configs.push({
      provider: "gemini",
      model: process.env["GEMINI_MODEL"] ?? "gemini-1.5-flash",
      apiKey: process.env["GEMINI_API_KEY"],
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      maxTokens: 4096,
      temperature: 0.7,
      enabled: true,
    });
  }

  if (process.env["OLLAMA_BASE_URL"]) {
    configs.push({
      provider: "ollama",
      model: process.env["OLLAMA_MODEL"] ?? "llama3.2",
      baseUrl: process.env["OLLAMA_BASE_URL"] ?? "http://localhost:11434/v1",
      maxTokens: 4096,
      temperature: 0.7,
      enabled: true,
    });
  }

  return configs;
}

// ─── HTTP Completion Caller ───────────────────────────────────────────────────

interface OpenAICompatibleMessage {
  role: string;
  content: string;
}

interface OpenAICompatibleResponse {
  choices?: Array<{
    message?: { content?: string };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

async function callOpenAICompatible(
  config: AiProviderConfig,
  req: AiCompletionRequest,
): Promise<AiCompletionResponse> {
  const start = Date.now();
  const endpoint = `${config.baseUrl}/chat/completions`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (config.apiKey) {
    headers["Authorization"] = `Bearer ${config.apiKey}`;
  }

  // Anthropic requires a different header name
  if (config.provider === "anthropic" && config.apiKey) {
    headers["x-api-key"] = config.apiKey;
    headers["anthropic-version"] = "2023-06-01";
    delete headers["Authorization"];
  }

  const body = JSON.stringify({
    model: req.model ?? config.model,
    messages: req.messages as OpenAICompatibleMessage[],
    max_tokens: req.maxTokens ?? config.maxTokens ?? 2048,
    temperature: req.temperature ?? config.temperature ?? 0.7,
    stream: false,
  });

  const response = await fetch(endpoint, { method: "POST", headers, body });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${config.provider} API error ${response.status}: ${text.slice(0, 200)}`);
  }

  const data = await response.json() as OpenAICompatibleResponse;
  const content = data.choices?.[0]?.message?.content ?? "";
  const usage = data.usage ?? {};

  return {
    provider: config.provider,
    model: req.model ?? config.model,
    content,
    inputTokens: usage.prompt_tokens ?? 0,
    outputTokens: usage.completion_tokens ?? 0,
    totalTokens: usage.total_tokens ?? 0,
    latencyMs: Date.now() - start,
  };
}

async function callGemini(
  config: AiProviderConfig,
  req: AiCompletionRequest,
): Promise<AiCompletionResponse> {
  const start = Date.now();
  const model = req.model ?? config.model;
  const endpoint = `${config.baseUrl}/models/${model}:generateContent?key=${config.apiKey ?? ""}`;

  interface GeminiPart { text: string }
  interface GeminiContent { role: string; parts: GeminiPart[] }
  const contents: GeminiContent[] = req.messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body = JSON.stringify({
    contents,
    generationConfig: {
      maxOutputTokens: req.maxTokens ?? config.maxTokens ?? 2048,
      temperature: req.temperature ?? config.temperature ?? 0.7,
    },
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${text.slice(0, 200)}`);
  }

  interface GeminiResponse {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number; totalTokenCount?: number };
  }
  const data = await response.json() as GeminiResponse;
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const usage = data.usageMetadata ?? {};

  return {
    provider: config.provider,
    model,
    content,
    inputTokens: usage.promptTokenCount ?? 0,
    outputTokens: usage.candidatesTokenCount ?? 0,
    totalTokens: usage.totalTokenCount ?? 0,
    latencyMs: Date.now() - start,
  };
}

// ─── Router ───────────────────────────────────────────────────────────────────

export class AiRouter {
  private readonly providers: AiProviderConfig[];

  constructor(providers?: AiProviderConfig[]) {
    this.providers = (providers ?? buildProviderConfigs()).filter((p) => p.enabled);
  }

  /** Returns ordered list of enabled providers. */
  getProviders(): AiProviderConfig[] {
    return [...this.providers];
  }

  /** Returns true if at least one provider is configured. */
  hasProviders(): boolean {
    return this.providers.length > 0;
  }

  /**
   * Calls the first available provider and falls back to the next on failure.
   * Throws if no providers are available or all fail.
   */
  async complete(req: AiCompletionRequest, preferredProvider?: AiProvider): Promise<AiCompletionResponse> {
    if (this.providers.length === 0) {
      // No external provider configured — return a structured mock for development
      return this.mockCompletion(req);
    }

    const ordered = preferredProvider
      ? [...this.providers].sort((a) => (a.provider === preferredProvider ? -1 : 1))
      : this.providers;

    const errors: string[] = [];

    for (const config of ordered) {
      try {
        return await this.callProvider(config, req);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        errors.push(`${config.provider}: ${msg}`);
      }
    }

    throw new Error(`All AI providers failed:\n${errors.join("\n")}`);
  }

  private async callProvider(config: AiProviderConfig, req: AiCompletionRequest): Promise<AiCompletionResponse> {
    if (config.provider === "gemini") {
      return callGemini(config, req);
    }
    return callOpenAICompatible(config, req);
  }

  /** Returns a structured mock response when no providers are configured (dev mode). */
  private mockCompletion(req: AiCompletionRequest): AiCompletionResponse {
    const lastMessage = req.messages.at(-1)?.content ?? "";
    const content = `[AI mock] Processed: ${lastMessage.slice(0, 80)}`;
    return {
      provider: "custom",
      model: "mock",
      content,
      inputTokens: Math.ceil(lastMessage.length / 4),
      outputTokens: Math.ceil(content.length / 4),
      totalTokens: Math.ceil((lastMessage.length + content.length) / 4),
      latencyMs: 0,
    };
  }
}

/** Singleton router instance — lazy-initialised from environment variables. */
let _router: AiRouter | null = null;

export function getAiRouter(): AiRouter {
  if (!_router) {
    _router = new AiRouter();
  }
  return _router;
}
