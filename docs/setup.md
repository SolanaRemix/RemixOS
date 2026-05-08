# RemixOS — Setup Guide

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | ≥ 20 | [nodejs.org](https://nodejs.org) |
| pnpm | ≥ 9 | `corepack enable && corepack prepare pnpm@latest --activate` |
| Go *(optional)* | ≥ 1.21 | [go.dev](https://go.dev/dl/) |
| Docker *(optional)* | ≥ 24 | [docker.com](https://docker.com) |

---

## Quick Start

### 1. Clone & Bootstrap

```bash
git clone https://github.com/SolanaRemix/RemixOS.git
cd RemixOS

# Auto-detect environment and set up everything
pnpm tsx scripts/bootstrap.ts
```

The bootstrap script:
- Validates Node.js / pnpm versions
- Creates `.env` from the template if it doesn't exist
- Installs all workspace dependencies (`pnpm install --frozen-lockfile`)
- Checks Redis connectivity (if `REDIS_URL` is set)
- Runs Prisma migrations (if a database schema exists)

### 2. Configure Environment

```bash
cp .env.example .env   # if not already created by bootstrap
```

Edit `.env`:

```env
# Required for production; optional for development
NODE_ENV=development
PORT=3001

NEXT_PUBLIC_GATEWAY_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001

# Auth (required in production)
# REMIXOS_AUTH_REQUIRED=false
# REMIXOS_JWT_SECRET=<generate with: openssl rand -base64 48>

# Database (optional in dev)
# DATABASE_URL=postgresql://remixos:remixos_dev@localhost:5432/remixos

# Redis (optional in dev)
# REDIS_URL=redis://localhost:6379

# AI Providers — add any you want to use
# OPENAI_API_KEY=sk-...
# ANTHROPIC_API_KEY=sk-ant-...
# GROK_API_KEY=...
# DEEPSEEK_API_KEY=...
# GEMINI_API_KEY=...
# OLLAMA_BASE_URL=http://localhost:11434/v1

# Payments (Phase 4 — optional)
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Start Development

```bash
pnpm dev
```

| Service | URL | Description |
|---------|-----|-------------|
| Studio UI | http://localhost:3000 | Next.js frontend |
| AI Builder | http://localhost:3000/builder | AI Website Builder |
| Admin | http://localhost:3000/admin | Admin Dashboard |
| Gateway API | http://localhost:3001 | Express + WebSocket |
| GXQS Engine *(opt.)* | http://localhost:8080 | Go microservice |

---

## Development Scripts

```bash
pnpm dev          # Start all services in parallel
pnpm build        # Build all packages and apps
pnpm lint         # ESLint across all workspaces
pnpm typecheck    # TypeScript strict type checking
pnpm test         # Vitest unit tests
pnpm clean        # Remove all dist/ and .next/ directories
```

### Utility Scripts (tsx)

```bash
# Bootstrap environment
pnpm tsx scripts/bootstrap.ts

# Deploy to a target
pnpm tsx scripts/deploy.ts vercel --prod
pnpm tsx scripts/deploy.ts netlify
pnpm tsx scripts/deploy.ts docker

# Self-healing build+test repair
pnpm tsx scripts/self-heal.ts

# Health check all services
pnpm tsx scripts/healthcheck.ts
pnpm tsx scripts/healthcheck.ts --json   # machine-readable output
```

---

## Project Structure

```
remixos/
├── apps/
│   ├── studio/         → Next.js 15 UI (Studio, AI Builder, Admin)
│   └── gateway/        → Express + WebSocket API server
├── packages/
│   ├── shared/         → TypeScript types, subscription/AI/billing types
│   ├── agents/         → Agent mesh (Planner, Builder, Executor, Security, Fixer)
│   ├── orchestrator/   → Task runner + AI provider router
│   ├── builder/        → Code-generation layer
│   ├── executor/       → Execution runtime (JS, Go, Web3)
│   ├── security/       → Static analysis + audit helpers
│   └── go-core/        → Go microservice (GXQS engine)
├── infra/
│   ├── docker/         → Dockerfiles, docker-compose, nginx.conf
│   └── ci/             → CI configuration helpers
├── scripts/
│   ├── bootstrap.ts    → Environment setup + migration
│   ├── deploy.ts       → Multi-target deployment
│   ├── self-heal.ts    → Autonomous build repair
│   └── healthcheck.ts  → Service health verification
└── docs/               → Full documentation
```

---

## Workspace Packages

Each package under `packages/` uses ESM (`"type": "module"`) and TypeScript strict mode. Relative imports use `.js` extensions (transpiled at build time).

| Package | Entry | Purpose |
|---------|-------|---------|
| `@remixos/shared` | `dist/index.js` | Shared types: AI providers, billing, website builder, task results |
| `@remixos/agents` | `dist/index.js` | 5 stateless agents: Planner, Builder, Executor, Security, Fixer |
| `@remixos/orchestrator` | `dist/index.js` | `runTask()`, `runQueuedTask()`, AI router, CyberAi adapter |
| `@remixos/builder` | `dist/index.js` | HTML/JSX/JSON code generators |
| `@remixos/executor` | `dist/index.js` | SmartBrain JS + GXQS Go + TradeOS Web3 runtimes |
| `@remixos/security` | `dist/index.js` | Static analysis, pattern detection, audit helpers |

---

## Troubleshooting

See [troubleshooting.md](./troubleshooting.md) for common issues.
