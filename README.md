<div align="center">

# 🚀 RemixOS

### Launch Your Own AI Website Builder SaaS in Minutes

**Turn plain English into professional websites. Monetize instantly. Scale infinitely.**

[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?logo=node.js)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-9-orange?logo=pnpm)](https://pnpm.io)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![CI](https://img.shields.io/badge/CI-self--healing-purple)](#-cicd--self-healing-pipeline)

[**Start Building →**](https://remixos.app) · [**AI Builder**](https://remixos.app/builder) · [**Admin**](https://remixos.app/admin) · [**Docs**](docs/)

</div>

---

## 🎯 What is RemixOS?

RemixOS is a **category-defining AI-native platform** — AI Studio × Vercel × Webflow × Replit × Solana IDE × Linear.

| Inspiration | What RemixOS adds |
|-------------|-------------------|
| Google AI Studio — *prompt-to-app UX* | Multi-agent orchestration pipeline |
| Vercel — *deployment platform* | One-click deploy to 7+ targets |
| Webflow — *no-code website builder* | AI-generated layouts, live preview, instant download |
| Replit — *collaborative SaaS IDE* | Built-in monetisation, subscriptions, credits |
| Solana Playground — *blockchain IDE* | Web3 wallet connect + on-chain execution |
| Linear — *workspace-first UX* | Command palette, multi-panel workspace |

**RemixOS is your AI Website Builder Business-in-a-Box.** Entrepreneurs, agencies, and developers launch their own AI website creation SaaS instantly.

---

## ✨ Features

### 🤖 AI Website Builder
- Plain-English → professional website in seconds
- 6 categories: Landing, SaaS, Portfolio, E-Commerce, Blog, Dashboard
- 6 color schemes, 4 visual styles, live iframe preview
- One-click HTML download or deploy

### �� Multi-Provider AI System
- **6 providers:** OpenAI, Anthropic, Grok, DeepSeek, Gemini, Ollama + BYO
- Automatic provider fallback chain
- Dev-mode mock (no API key needed locally)
- Token usage tracked on every completion

### 📊 Admin Control Center
- Real-time service health monitoring
- Audit log viewer
- AI provider configuration status
- Deployment command reference

### 🚀 Autonomous Deployment Engine
- `scripts/deploy.ts` — Vercel, Netlify, Docker, Railway, Fly.io, VPS
- `scripts/bootstrap.ts` — auto-detect environment, install, configure
- `scripts/self-heal.ts` — autonomous build/test repair
- `scripts/healthcheck.ts` — verify all services

### 🔒 Enterprise Security
- Prompt length guard (HTTP 413 > 16 KB)
- JWT auth with strong-secret enforcement
- Zod schema validation · HTML output sanitisation
- Sandboxed iframe previews · Rate limiting
- Security headers (HSTS, X-Frame-Options, etc.)
- Structured audit logs · `pnpm audit` in CI

### ⚡ Execution Runtimes
- SmartBrain — sandboxed JavaScript runtime
- GXQS Engine — high-performance Go microservice
- TradeOS — Web3 execution (Solana + EVM)

### 🌐 Blockchain Ecosystem
- MetaMask + Phantom wallet connect
- Solana Mainnet/Devnet · Ethereum · BASE · any EVM
- Transaction confirmation modal
- Smart contract scaffold generator

---

## 🖼 Screenshots

### AI Website Builder
![AI Builder](https://placehold.co/1200x600/05070a/8b5cf6?text=RemixOS+—+AI+Website+Builder+(Category+%7C+Style+%7C+Live+Preview))

*Left: description, category, color, style configuration. Right: live sandboxed iframe preview.*

### Studio — AI Orchestration
![Studio](https://placehold.co/1200x600/05070a/3b82f6?text=RemixOS+Studio+—+Prompt+→+Generate+→+Execute+→+Deploy)

*Prompt panel · WebSocket log stream · Preview / Code / JSON output · Wallet HUD*

### Admin Dashboard
![Admin](https://placehold.co/1200x600/05070a/22c55e?text=RemixOS+Admin+—+Metrics+%7C+Audit+Log+%7C+AI+Providers+%7C+Deployments)

*System metrics · Real-time audit log · AI provider status · Deployment targets*

---

## 🏗 Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│               Studio UI  (Next.js :3000)                              │
│   / → AI Studio   /builder → Website Builder   /admin → Admin        │
└────────────────────────────┬─────────────────────────────────────────┘
                             │  HTTP POST /run  +  WebSocket
┌────────────────────────────▼─────────────────────────────────────────┐
│                Gateway  (Express + ws  :3001)                         │
│   Auth · Validation · Rate limiting · Audit logs                      │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
┌────────────────────────────▼─────────────────────────────────────────┐
│              Orchestrator  (packages/orchestrator)                     │
│   ┌─────────────────────────────────────────────────────────────┐     │
│   │  AiRouter — OpenAI · Anthropic · Grok · DeepSeek · Gemini   │     │
│   │             Ollama · Custom BYO · Mock (dev fallback)        │     │
│   └─────────────────────────────────────────────────────────────┘     │
└──┬──────────┬──────────┬────────────┬──────────────────────────────┘
   ▼          ▼          ▼            ▼
Planner   Builder   Executor      Security → Fixer
                        │
              ┌─────────┴──────────────────────────┐
              │  SmartBrain · GXQS Go · TradeOS Web3│
              └─────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | Next.js, React, Tailwind CSS | 15 / 18 / 3 |
| Language | TypeScript (strict) | 5 |
| Backend | Node.js, Express, ws | 20 / 4 / 8 |
| Validation | Zod | 3 |
| Monorepo | pnpm workspaces | 9 |
| Testing | Vitest | 1 |
| Go engine | Go (GXQS microservice) | 1.21 |
| EVM Web3 | ethers.js | v6 |
| Solana | @solana/web3.js, Phantom | latest |
| Infra | Docker, docker-compose, nginx | — |
| CI | GitHub Actions (self-healing) | — |

---

## 🚀 Getting Started

### Prerequisites

```
Node.js ≥ 20 · pnpm ≥ 9 · Go ≥ 1.21 (optional) · Docker (optional)
```

### Quick Start

```bash
git clone https://github.com/SolanaRemix/RemixOS.git
cd RemixOS

# Bootstrap: installs deps, creates .env, checks services
pnpm tsx scripts/bootstrap.ts

# Start all services
pnpm dev
```

| Service | URL |
|---------|-----|
| Studio UI | http://localhost:3000 |
| AI Builder | http://localhost:3000/builder |
| Admin | http://localhost:3000/admin |
| Gateway API | http://localhost:3001 |

### AI Providers (optional)

```env
# .env — add any providers you want
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OLLAMA_BASE_URL=http://localhost:11434/v1
```

No providers configured = dev mock mode. No API key needed for local development.

### Build & Test

```bash
pnpm build · pnpm test · pnpm lint · pnpm typecheck
```

---

## 🚢 Deployment

```bash
pnpm tsx scripts/deploy.ts vercel --prod   # Vercel
pnpm tsx scripts/deploy.ts docker          # Docker (full stack)
pnpm tsx scripts/deploy.ts railway --prod  # Railway
pnpm tsx scripts/deploy.ts fly --prod      # Fly.io
VPS_HOST=yourserver.com pnpm tsx scripts/deploy.ts vps --prod
```

Full guide: [docs/deployment.md](docs/deployment.md)

---

## 📡 API Reference

### `POST /auth/token` — Issue JWT
```bash
curl -X POST http://localhost:3001/auth/token \
  -H "Content-Type: application/json" \
  -d '{"workspaceId":"studio"}'
```

### `POST /run` — Submit prompt
```bash
curl -X POST http://localhost:3001/run \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Build a Web3 trading dashboard"}'
```

### `GET /health` — Service health
```json
{ "status": "ok", "service": "remixos-gateway", "timestamp": 1700000000000 }
```

### WebSocket — Live logs
Connect to `ws://localhost:3001`:
```jsonc
{ "step": "ai-router",  "message": "AI router ready (2 provider(s))" }
{ "step": "planner",    "message": "Plan created: 3 steps" }
{ "step": "builder",    "message": "HTML generated (2.1 KB)" }
{ "step": "security",   "message": "Audit passed — 0 issues" }
```

---

## 🏛 Monorepo Structure

```
remixos/
├── apps/
│   ├── studio/         → Next.js 15 (/, /builder, /admin)
│   └── gateway/        → Express + WebSocket API
├── packages/
│   ├── shared/         → Types: AI providers, billing, builder, tasks
│   ├── agents/         → Planner · Builder · Executor · Security · Fixer
│   ├── orchestrator/   → runTask() · AiRouter · CyberAi adapter
│   ├── builder/        → Code generators
│   ├── executor/       → SmartBrain · GXQS · TradeOS
│   ├── security/       → Static analysis
│   └── go-core/        → Go microservice
├── infra/docker/       → Dockerfiles · docker-compose · nginx.conf
├── scripts/            → bootstrap · deploy · self-heal · healthcheck
└── docs/               → setup · deployment · ai-system · blockchain
                          security · mobile · desktop · troubleshooting
```

---

## 🔁 CI/CD & Self-Healing Pipeline

Every push runs: install → lint → build → typecheck → test → audit

If the pipeline fails, `scripts/self-heal.ts` automatically attempts 3 repair strategies (clear dist → clean install) before reporting failure. **No false-green CI.**

---

## 🧠 Roadmap

### ✅ Shipped (PR4)
- [x] Multi-provider AI router (6 providers + fallback + mock)
- [x] AI Website Builder (6 categories, live preview, download)
- [x] Admin dashboard (metrics, audit log, AI providers, deployments)
- [x] Universal deployment scripts (7 targets)
- [x] Bootstrap + self-heal + healthcheck scripts
- [x] Enhanced docker-compose (Redis, Postgres, nginx, health checks)
- [x] Security headers (vercel.json, netlify.toml, nginx.conf)
- [x] SEO (metadata, sitemap, robots.txt, OpenGraph, Twitter cards)
- [x] Full documentation suite (8 guides)
- [x] Production readiness checklist

### 🔜 Near-term
- [ ] Stripe subscription + credit billing
- [ ] Realtime collaboration (live cursors, shared editing)
- [ ] Kubernetes/Helm manifests
- [ ] Error boundaries across all routes
- [ ] Redis-backed durable job queue

### 🔭 Long-term
- [ ] SPL token launcher + NFT deployment
- [ ] App NFT registry (on-chain ownership)
- [ ] Tauri/Electron desktop packaging
- [ ] Component marketplace
- [ ] Agent learning loop (feedback → fine-tuning)
- [ ] White-label SaaS licensing engine

---

## �� Documentation

| Guide | Link |
|-------|------|
| Setup & Quick Start | [docs/setup.md](docs/setup.md) |
| Deployment (all platforms) | [docs/deployment.md](docs/deployment.md) |
| AI System & Providers | [docs/ai-system.md](docs/ai-system.md) |
| Blockchain & Web3 | [docs/blockchain.md](docs/blockchain.md) |
| Security | [docs/security.md](docs/security.md) |
| Mobile & PWA | [docs/mobile.md](docs/mobile.md) |
| Desktop (Tauri/Electron) | [docs/desktop.md](docs/desktop.md) |
| Troubleshooting | [docs/troubleshooting.md](docs/troubleshooting.md) |
| Production Readiness | [docs/production-readiness.md](docs/production-readiness.md) |

---

## 🤝 Contributing

1. Fork → `git checkout -b feat/your-feature`
2. TypeScript strict mode enforced throughout
3. Run: `pnpm build && pnpm test && pnpm lint && pnpm typecheck`
4. Open a pull request — self-healing CI validates automatically

---

## 📜 License

[MIT](LICENSE) © RemixOS Contributors
