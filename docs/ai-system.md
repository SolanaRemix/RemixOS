# RemixOS — AI System Guide

## Architecture

RemixOS uses a multi-agent pipeline orchestrated through a provider-agnostic AI router.

```
User Prompt
    │
    ▼
AiRouter (ai-router.ts)
    │  Provider fallback chain
    │  OpenAI → Anthropic → Grok → DeepSeek → Gemini → Ollama → Mock
    ▼
Orchestrator (runTask)
    │
    ├─► CyberAi Adapter   — intent classification
    ├─► Planner Agent     — step decomposition
    ├─► Builder Agent     — code / HTML / API generation
    ├─► Executor Agent    — runtime execution
    ├─► Security Agent    — static analysis + audit
    └─► Fixer Agent       — autonomous error repair
```

---

## Multi-Provider AI Router

Located at `packages/orchestrator/src/adapters/ai-router.ts`.

### Supported Providers

| Provider | Model (default) | Env Var |
|----------|----------------|---------|
| OpenAI | `gpt-4o-mini` | `OPENAI_API_KEY` |
| Anthropic | `claude-3-5-haiku-20241022` | `ANTHROPIC_API_KEY` |
| Grok (xAI) | `grok-2-latest` | `GROK_API_KEY` |
| DeepSeek | `deepseek-chat` | `DEEPSEEK_API_KEY` |
| Gemini | `gemini-1.5-flash` | `GEMINI_API_KEY` |
| Ollama | `llama3.2` | `OLLAMA_BASE_URL` |
| BYO (custom) | any | Set `OPENAI_BASE_URL` to your endpoint |

### Provider Fallback

The router calls providers in order of configuration. If a provider fails (network error, rate limit, invalid key), it automatically falls back to the next configured provider.

```env
# Configure multiple providers for resilient fallback:
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OLLAMA_BASE_URL=http://localhost:11434/v1
```

If **no** providers are configured, the router returns a structured mock response — useful for local development without API keys.

### Programmatic Usage

```typescript
import { getAiRouter } from "@remixos/orchestrator";

const router = getAiRouter();

const response = await router.complete({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Build a landing page for a SaaS product." },
  ],
  maxTokens: 4096,
  temperature: 0.7,
});

console.log(response.content);
console.log(`Provider: ${response.provider}, tokens: ${response.totalTokens}`);
```

### Preferred Provider

```typescript
// Force Anthropic, fall back to others on failure
const response = await router.complete(request, "anthropic");
```

---

## Agents

All agents are stateless async functions in `packages/agents/src/`.

| Agent | Input | Output | Purpose |
|-------|-------|--------|---------|
| **Planner** | Raw prompt | `AgentResult` with step array | Decomposes prompt into a build plan |
| **Builder** | Planner result | `AgentResult` with `BuildOutput` | Generates HTML, code, API stubs, Web3 |
| **Executor** | Builder result | `AgentResult` | Runs generated code in sandbox |
| **Security** | Executor result | `AuditResult` | Static analysis, unsafe-pattern scan |
| **Fixer** | Audit result | `AgentResult` | Patches security issues autonomously |

### Agent Result Type

```typescript
interface AgentResult {
  status: "success" | "failure";
  data: unknown;
  logs: string[];
}
```

### Build Output Type

```typescript
interface BuildOutput {
  type: "webapp" | "api" | "trade" | "heavy";
  html?: string;
  code?: string;
  api?: Record<string, string>;
  web3?: { network: string; action: string };
}
```

---

## CyberAi Adapter

`packages/orchestrator/src/adapters/cyberai.ts` — intent classifier that maps prompts to agent pipeline variants:

- Prompts containing `trade` or `web3` → `["plan", "build", "execute-trade", "secure"]`
- Prompts containing `api` → `["plan", "build-api", "execute", "secure"]`
- All others → `["plan", "build", "execute", "secure"]`

Replace this adapter with a real LLM call to enable semantic intent routing.

---

## AI Website Builder

The AI website builder (`apps/studio/app/builder/page.tsx`) provides a client-side generation pipeline:

1. User fills in description, category, color scheme, and style options
2. The UI generates a complete HTML page with embedded CSS
3. Result is shown in a live sandboxed iframe preview
4. User can download the HTML or deploy directly

**Categories supported:** Landing Page, SaaS App, Portfolio, E-Commerce, Blog, Dashboard

**Generation is client-side** (no API call needed) for instant offline-capable previews. For LLM-powered generation, wire the `handleBuild` function to call `POST /run` with the constructed prompt.

---

## Token Tracking

Token usage is returned on every `AiCompletionResponse`:

```typescript
interface AiCompletionResponse {
  provider: AiProvider;
  model: string;
  content: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  latencyMs: number;
}
```

Persist these to your database to implement per-user token billing.

---

## Streaming

To enable streaming responses, set `stream: true` on the completion request. Note: streaming requires server-sent events (SSE) or WebSocket delivery — the current gateway broadcasts via WebSocket. The AI router currently returns full responses; streaming support can be added per-provider.

---

## Background AI Tasks

For long-running AI jobs (batch generation, SEO automation, nightly re-indexing), use `runQueuedTask()` from the orchestrator:

```typescript
import { runQueuedTask } from "@remixos/orchestrator";

const result = await runQueuedTask(prompt, broadcastFn);
if ("error" in result) {
  console.error(result.error);
} else {
  console.log(result.result.build.html);
}
```

Queue jobs are stored in memory with a configurable TTL (`REMIXOS_QUEUE_JOB_TTL_MS`, default: 5 minutes). For persistence across restarts, integrate a Redis-backed queue (e.g., BullMQ).
