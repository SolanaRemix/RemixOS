# Production Readiness Checklist

Status legend: `PASS` / `PARTIAL` / `MISSING`

## Core engineering gates

- [ ] Type safety: `pnpm typecheck` is green (`PASS` when enforced in CI).
- [ ] CI green: build, lint, typecheck, tests all pass on PR and main.
- [ ] Zero ESLint errors.
- [ ] Zero TypeScript errors.

## Security and platform hardening

- [x] Request validation at gateway boundary (`PASS` in PR3.1).
- [x] JWT-authenticated run endpoint (`PASS` in PR3.1).
- [x] Rate limiting for orchestration API (`PASS` in PR3.1).
- [x] Structured audit logging with request IDs (`PASS` in PR3.1).
- [ ] Security headers (CSP, HSTS, frame protections) enforced in gateway/proxy.
- [ ] Dependency auditing blocks high/critical vulnerabilities in CI.

## Reliability and recovery

- [x] Queue-aware orchestration contract (`PASS` in PR3.1).
- [ ] Redis-backed durable queue + retry policy.
- [ ] Crash recovery for in-flight tasks.
- [ ] WebSocket stability checks and reconnect strategy.
- [ ] Offline fallback and session recovery for Studio.

## Product readiness

- [ ] Mobile responsiveness validated on Android + iOS breakpoints.
- [ ] Wallet reconnect/session persistence verified for supported wallets.
- [ ] Error boundaries across all critical Studio routes.
- [ ] AI token usage tracking and per-workflow cost telemetry.
- [ ] Workspace restore snapshots for collaboration flows.

## Deployment readiness

- [ ] Docker image and compose stack validated.
- [ ] Kubernetes/Helm manifests validated.
- [ ] Multi-platform support matrix signed off (Web/Desktop/Mobile/PWA).
- [ ] AI service monitoring dashboards and alerts configured.
- [ ] Rollback and health-check procedures tested.
