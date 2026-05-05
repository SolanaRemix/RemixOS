<div align="center">

# 🚀 RemixOS Studio

### The AI-native application builder for the Web3 era

**Prompt → Generate → Execute → Deploy — all in one platform**

[![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen?logo=node.js)](https://nodejs.org)
[![pnpm](https://img.shields.io/badge/pnpm-9-orange?logo=pnpm)](https://pnpm.io)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![CI](https://img.shields.io/badge/CI-self--healing-purple)](#-cicd--self-healing-pipeline)

</div>

---

## 🧭 Overview

**RemixOS Studio** is a production-grade, AI-powered application builder that takes a plain-English prompt and delivers a running application — complete with UI, backend, database schema, and optional Web3 integrations — in seconds.

It combines the best of:

| Inspiration | What RemixOS adds |
|-------------|-------------------|
| Google AI Studio — *prompt-to-app UX* | Multi-agent orchestration pipeline |
| v0 — *high-quality UI generation* | Live execution, not just code output |
| Base44 — *backend + DB automation* | Web3 execution (Solana + EVM chains) |

---

## ✨ Features

### 🧠 AI Studio
- Natural-language prompt interface — describe any app, get a running scaffold
- Multi-agent pipeline: **Planner → Builder → Executor → Security → Fixer**
- CyberAi orchestration layer with pluggable LLM backends
- Real-time streaming logs via WebSocket so you see every agent step as it happens
- Self-healing output: the Fixer agent corrects build errors before returning

### 🎨 Builder — UI, DB & API
- **Drag-and-drop canvas** built on React Flow — compose apps visually without writing code
- Block library: Button, Input, Chart, Data Table, API Call, Wallet Connect, Blockchain Action
- **Database generator** — describe your schema in plain English, get a live Supabase DB
- **API stub generator** — auto-generates typed REST or tRPC endpoints from your schema
- HTML/JSX code generator with injection-safe `escapeHtml` output

### ⚡ Execution — Web2 & Web3
- **SmartBrain JS runtime** — sandboxed JavaScript execution environment
- **GXQS Go engine** — high-performance microservice for latency-sensitive tasks
- **TradeOS Web3 layer** — connect to Solana and EVM-compatible chains (BASE, Ethereum)
- Transaction confirmation modal before any on-chain action
- Wallet integrations: MetaMask, Phantom, WalletConnect

### 🤝 Collaboration & Versioning
- Named project versions — snapshot any build state with a label
- Version history viewer — browse past builds, diff, and revert
- Real-time log broadcast — all connected clients see the same live execution stream

### 🛡 Security
- Prompt length guard — rejects oversized payloads (> 16 KB) before orchestration
- Built-in static analysis: unsafe-pattern detection on every generated artifact
- GitAntivirus adapter — pluggable antivirus scanning layer
- CSP-enforced iframe sandbox for generated UI previews (`allow-scripts` removed)
- `pnpm audit` integrated into CI

### 🔁 CI/CD & Self-Healing Pipeline
- GitHub Actions workflow with `continue-on-error` guard on build and test steps
- Auto-fix script re-runs `pnpm install → pnpm build → pnpm test` and exits 1 if still broken — **no false-green CI**
- Dockerised services for reproducible local and cloud deployments

---

## 🖼 UI / UX

### Prompt Input Panel
The main entry point. Type a prompt, hit **Run**, and watch the agent pipeline stream live logs while building your app.

![Prompt Input Panel](https://placehold.co/1200x600/05070a/8b5cf6?text=RemixOS+Studio+—+Prompt+Input+Panel)

*Glassmorphism card UI · Neon purple/blue accents · Live WebSocket log stream below the input*

---

### Drag-and-Drop Builder Canvas
Visual app composition — drag blocks from the palette onto the canvas, connect them with edges, and export to React code with one click.

![Builder Canvas](https://placehold.co/1200x600/05070a/3b82f6?text=RemixOS+Studio+—+Drag+%26+Drop+Builder+Canvas)

*React Flow canvas · Block palette (left) · Properties inspector (right) · Export button (top-right)*

---

### Output Panel — Preview / Code / JSON
Tabbed output panel shows the generated UI live in an iframe, the raw source code with syntax highlighting, and the full execution JSON for debugging.

![Output Panel](https://placehold.co/1200x600/05070a/22c55e?text=RemixOS+Studio+—+Output+Panel+%28Preview+%7C+Code+%7C+JSON%29)

*Sandboxed iframe preview · Prism-highlighted code · Execution JSON · Wallet connect button (top-right)*

---

## 🏗 Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Studio UI  (Next.js :3000)               │
│   Prompt Panel · Drag Builder · Output Panel · Wallet HUD  │
└────────────────────────┬───────────────────────────────────┘
                         │  HTTP POST /run  +  WebSocket
┌────────────────────────▼───────────────────────────────────┐
│                 Gateway  (Express + ws  :3001)              │
│   Auth · Prompt validation · Max-length guard · WS Broadcast│
└────────────────────────┬───────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────────┐
│              Orchestrator  (packages/orchestrator)          │
│   CyberAi adapter · Task runner · Agent scheduler          │
└──┬──────────┬──────────┬────────────┬───────────┬──────────┘
   │          │          │            │           │
   ▼          ▼          ▼            ▼           ▼
Planner   Builder   Executor      Security    Fixer
   │          │          │            │           │
   │    ┌─────▼──────┐   │       GitAntivirus   Auto-
   │    │Code / DB / │   │        Adapter      repair
   │    │API  gen    │   │
   │    └────────────┘   │
   └──────────┬──────────┘
              ▼
   ┌─────────────────────┐
   │   Execution Router  │
   │  (packages/executor)│
   ├─────────────────────┤
   │ SmartBrain (JS)     │
   │ GXQS Engine (Go)    │
   │ TradeOS (Web3)      │
   └──────────┬──────────┘
              │  on-chain actions
   ┌──────────▼──────────┐
   │  Web3 Layer         │
   │  Solana · BASE · ETH│
   └─────────────────────┘
```

### Layer Descriptions

| Layer | Package | Responsibility |
|-------|---------|----------------|
| **Studio UI** | `apps/studio` | Next.js 15 front-end; prompt input, drag builder, output tabs, wallet HUD |
| **Gateway** | `apps/gateway` | Express + WebSocket server; validates, routes, and broadcasts events |
| **Orchestrator** | `packages/orchestrator` | Schedules agents, manages state, exposes `runTask()` |
| **Agents** | `packages/agents` | Planner, Builder, Executor, Security, Fixer — each a stateless async function |
| **Builder** | `packages/builder` | HTML/JSX/JSON code generators with injection-safe output |
| **Executor** | `packages/executor` | SmartBrain JS runtime + GXQS Go adapter + TradeOS Web3 adapter |
| **Security** | `packages/security` | Static analysis, GitAntivirus adapter, audit helpers |
| **Shared** | `packages/shared` | TypeScript types, utilities, constants shared across packages |
| **Go Core** | `packages/go-core` | GXQS high-performance microservice (optional) |

---

## 🛠 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js, React, Tailwind CSS | 15 / 18 / 3 |
| **Language** | TypeScript (strict) | 5 |
| **Backend** | Node.js, Express, ws | 20 / 4 / 8 |
| **Monorepo** | pnpm workspaces | 9 |
| **Testing** | Vitest | 1 |
| **Go engine** | Go (GXQS microservice) | 1.21 |
| **EVM Web3** | ethers.js | v6 |
| **Solana Web3** | @solana/web3.js, Phantom | latest |
| **Infra** | Docker, docker-compose | — |
| **CI** | GitHub Actions (self-healing) | — |

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| pnpm | ≥ 9 |
| Go *(optional — GXQS engine)* | ≥ 1.21 |

### Install dependencies

```bash
pnpm install
```

### Start all services in development mode

```bash
pnpm dev
```

| Service | URL | Description |
|---------|-----|-------------|
| Studio UI | http://localhost:3000 | Next.js front-end |
| Gateway API | http://localhost:3001 | Express + WebSocket server |
| GXQS Engine *(optional)* | http://localhost:8080 | Go microservice |

### Build for production

```bash
pnpm build
```

### Run tests

```bash
pnpm test
```

### Docker (full stack)

```bash
docker-compose -f infra/docker/docker-compose.yml up
```

---

## 📡 API Reference

### `POST /run`

Submit a natural-language prompt to the AI orchestration pipeline.

**Request**

```bash
curl -X POST http://localhost:3001/run \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Build a Web3 trading dashboard with a price chart and swap button"}'
```

> **Limit:** Prompts exceeding 16 384 bytes (≈ 16 KB) are rejected with `HTTP 413`.

**Response**

```json
{
  "plan":      { "status": "success", "data": { "steps": ["ui", "api", "web3"] }, "logs": [] },
  "build":     { "type": "trade", "html": "<html>…</html>", "code": "…", "web3": { "chain": "base" } },
  "execution": { "status": "success", "data": { "txHash": null } },
  "audit":     { "safe": true, "issues": [] }
}
```

On internal failure the gateway returns `HTTP 500` with `{ "error": "…" }`.

---

### WebSocket — Live Logs

Connect to `ws://localhost:3001` after submitting a run to receive real-time agent events:

```jsonc
// Agent step event
{ "step": "planner",   "message": "Plan created: 3 steps",  "timestamp": 1700000000000 }
{ "step": "builder",   "message": "HTML generated (2.1 KB)", "timestamp": 1700000001200 }
{ "step": "executor",  "message": "Execution complete",       "timestamp": 1700000002800 }
{ "step": "security",  "message": "Audit passed — 0 issues",  "timestamp": 1700000003100 }
```

---

## 🔗 Web3 Capabilities

RemixOS Studio ships with a first-class Web3 execution layer — **TradeOS** — that enables generated apps to interact with on-chain contracts without leaving the Studio environment.

| Feature | Details |
|---------|---------|
| **EVM chains** | Ethereum Mainnet, BASE, any EVM-compatible network |
| **Solana** | Devnet + Mainnet via `@solana/web3.js` and Phantom adapter |
| **Wallet connect** | MetaMask, Phantom, WalletConnect modal |
| **Transaction safety** | Confirmation modal before every on-chain action; errors surface inside the wallet modal (not silently swallowed) |
| **Contract scaffold** | Prompt-to-Solidity generator with on-click deploy UI |
| **App NFT registry** | On-chain app registry — register, version, and transfer generated apps as NFTs |

### Example — connect and send a transaction

```ts
import { useWallet } from "@/hooks/useWallet";

const { connect, account, error } = useWallet();

// Connect — modal stays open if wallet not installed so the user sees the error
await connect("metamask");

// Once account is set, execute a contract call
if (account) {
  await sendTransaction({ to: CONTRACT_ADDRESS, value: "0.01" });
}
```

---

## 🏛 Monorepo Structure

```
remixos/
├── apps/
│   ├── studio/         → Next.js 15 UI (AI Studio interface)
│   └── gateway/        → Express + WebSocket API server
├── packages/
│   ├── shared/         → TypeScript types & shared utilities
│   ├── agents/         → Agent mesh (Planner, Builder, Executor, Security, Fixer)
│   ├── orchestrator/   → Core task runner + CyberAi adapter
│   ├── builder/        → Code-generation layer (HTML/JSX/JSON)
│   ├── executor/       → Execution runtime (GXQS, SmartBrain, TradeOS)
│   ├── security/       → Static analysis + GitAntivirus adapter
│   └── go-core/        → Go microservice (GXQS engine)
├── infra/
│   ├── docker/         → Dockerfile + docker-compose
│   └── ci/             → CI configuration helpers
├── scripts/
│   └── auto-fix.mjs    → Self-healing install → build → test script
└── .github/
    └── workflows/      → CI pipeline + auto-fix workflow
```

---

## 🔐 Security

| Control | Implementation |
|---------|---------------|
| Input length guard | Prompts > 16 KB rejected at gateway with `HTTP 413` |
| Output sanitisation | All HTML/JS generation routes through `escapeHtml()` |
| Code injection prevention | `JSON.stringify` used for string literals in generated JS/JSX |
| Iframe CSP | Generated UI previewed in a sandboxed iframe without `allow-scripts` |
| Dependency auditing | `pnpm audit` runs on every CI push |
| Static code analysis | Unsafe-pattern detection on every generated artefact |
| GitAntivirus adapter | Pluggable antivirus scanning (swap in any provider) |
| Wallet safety | Confirmation modal required before every on-chain action; errors kept visible until dismissed |
| HTTP error mapping | `runTask` failures return `HTTP 500`, not `200`, preventing silent failures |

---

## 🧠 Roadmap

### Near-term
- [x] Multi-agent orchestration pipeline
- [x] Real-time WebSocket log streaming
- [x] Wallet connect (MetaMask + Phantom)
- [x] Self-healing CI with auto-fix script
- [x] Prompt max-length guard + HTTP 413
- [ ] CyberAi LLM integration (live control plane)
- [ ] SmartBrain sandboxed JS runtime (v2)
- [ ] GitAntivirus live scanning adapter

### Mid-term
- [ ] Drag-and-drop builder → React export
- [ ] Database schema generator (Supabase live DB)
- [ ] API stub generator (typed tRPC / REST)
- [ ] Smart contract deploy UI (Solidity scaffold + one-click deploy)
- [ ] Project versioning UI (name, diff, revert)

### Long-term
- [ ] Component marketplace (upload / browse / fork templates)
- [ ] User authentication (email + Google + GitHub with 2-way project sync)
- [ ] On-chain App Registry (App NFT ownership + trading)
- [ ] Agent learning loop (feedback → fine-tuning)
- [ ] GXQS Go engine (high-performance execution core)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes — TypeScript strict mode is enforced throughout
4. Run the full suite: `pnpm build && pnpm test`
5. Open a pull request — the self-healing CI will validate your changes automatically

---

## 📜 License

[MIT](LICENSE) © RemixOS Contributors
