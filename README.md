# 🚀 RemixOS Studio

> AI-powered application studio + execution engine

RemixOS Studio is a next-generation AI platform that combines prompt-driven app generation, multi-agent orchestration, execution pipelines, and real-time developer feedback.

## ✨ Features

- 🧠 **AI Orchestrator** — planner → builder → executor → security → fixer pipeline
- ⚡ **Real-time logs** via WebSocket
- 🎨 **Cyber-futuristic UI** — glassmorphism + neon design
- 🔐 **Built-in security validation** layer
- 🔗 **Wallet connect** — MetaMask + Phantom
- 🧩 **Modular monorepo** architecture (pnpm workspaces)
- ⚙️ **GXQS Go engine** — high-performance microservice
- 🤖 **TradeOS** — Web3 execution layer (Solana/BASE)
- 🔁 **Self-healing CI** — auto-fix pipeline

## 🏗 Architecture

```
Studio UI (Next.js)
   ↓
Gateway (Express + WebSocket)
   ↓
Orchestrator (TypeScript)
   ↓
Agent Mesh
   ├── Planner
   ├── Builder
   ├── Executor
   ├── Security
   └── Fixer
   ↓
Execution Router
   ├── SmartBrain (JS runtime)
   ├── GXQS Engine (Go microservice)
   └── TradeOS (Web3 execution)
   ↓
Security (GitAntivirus adapter)
   ↓
Return result
```

## 🏛 Monorepo Structure

```
remixos/
  apps/
    studio/      → Next.js 14 UI (AI Studio interface)
    gateway/     → Express + WebSocket API server
  packages/
    shared/      → TypeScript types & utilities
    agents/      → Agent mesh (planner, builder, executor, security, fixer)
    orchestrator/→ Core task runner + CyberAi adapter
    builder/     → Code generation layer
    executor/    → Execution runtime (GXQS, SmartBrain, TradeOS)
    security/    → Scanning + validation (GitAntivirus adapter)
    go-core/     → Go microservice (GXQS engine)
  infra/
    docker/      → Dockerfile + docker-compose
    ci/          → CI configuration
  scripts/       → Auto-fix + utilities
  .github/
    workflows/   → CI + auto-fix pipelines
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, WebSocket (ws) |
| Monorepo | pnpm workspaces |
| Testing | Vitest |
| Go engine | Go 1.21 |
| Blockchain | ethers.js v6 (EVM), Phantom (Solana) |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Go 1.21+ (optional, for GXQS engine)

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

This starts:
- `http://localhost:3000` — Studio UI
- `http://localhost:3001` — Gateway API + WebSocket

### Build

```bash
pnpm build
```

### Test

```bash
pnpm test
```

## 📡 API

### POST /run

Send a prompt to the orchestrator:

```bash
curl -X POST http://localhost:3001/run \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Build a Web3 trading dashboard"}'
```

Response:

```json
{
  "plan": { "status": "success", "data": {}, "logs": [] },
  "build": { "type": "trade", "html": "...", "code": "...", "web3": {} },
  "execution": { "status": "success", "data": {} },
  "audit": { "safe": true, "issues": [] }
}
```

### WebSocket

Connect to `ws://localhost:3001` for real-time logs:

```json
{ "step": "planner", "message": "Planner finished", "timestamp": 1234567890 }
```

## 🎨 UI

- Glassmorphism panels
- Neon gradient accents
- Mobile-first layout
- Dark cyber theme
- Live log streaming
- Tabbed output (Preview / Code / JSON)
- Wallet connect (MetaMask + Phantom)

## 🐳 Docker

```bash
docker-compose -f infra/docker/docker-compose.yml up
```

## 🧠 Roadmap

- [ ] CyberAi integration (control plane)
- [ ] SmartBrain execution runtime
- [ ] GitAntivirus security layer
- [ ] TradeOS (Web3 execution — Solana + BASE)
- [ ] GXQS Go engine (high-performance core)
- [ ] GitHub PR auto-fix bot
- [ ] Agent learning loop
- [ ] Drag builder + DB generator
- [ ] Contract deploy UI

## 🔐 Security

- Dependency auditing (`pnpm audit`)
- Static code validation (unsafe pattern detection)
- GitAntivirus adapter (pluggable)
- Wallet confirmation modal before any transaction

## 📜 License

MIT
