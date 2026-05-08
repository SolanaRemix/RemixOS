# RemixOS Capability Matrix (PR3.1 Baseline)

| Domain | Requirement scope | Status | Notes |
|---|---|---|---|
| Desktop | Native installer, tray, notifications, updater, FS integration | Missing | Not implemented yet; planned in Stream B. |
| Mobile | PWA + Capacitor, push, deep links, sync | Partial | Responsive studio exists; native wrappers not implemented. |
| Web | Next.js studio + gateway + WebSocket logs | Partial | Core works; offline/PWA hardening pending. |
| AI OS | Multi-agent run pipeline, streaming logs | Partial | Queue/model routing/memory/jobs pending. |
| Web3/Solana | Wallet UI + trade execution adapters | Partial | Multi-wallet manager, simulation, reconnect hardening pending. |
| Realtime collaboration | Presence, live cursors, shared editing | Missing | Stream E scope. |
| Backend production | Auth, RBAC, audit, billing, flags, retries | Partial | JWT auth, validation, rate limits, audit logging introduced in PR3.1; RBAC/billing pending. |
| Data layer | PostgreSQL + Prisma + Redis queues | Missing | Contracts introduced; runtime stack integration pending. |
| DevOps | CI/CD, security checks, deployment artifacts | Partial | Build/typecheck/test existing; lint+audit gates added in PR3.1; k8s/helm pending. |
| Observability | Request IDs, audit trail, telemetry | Partial | Request IDs + audit events added; metrics dashboards pending. |
