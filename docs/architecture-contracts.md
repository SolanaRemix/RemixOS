# RemixOS Architecture Contracts (PR3.1 Foundation)

## Locked contracts

### `apps/studio`
- Owns UX composition, workspace state, command palette, wallet UI, and API client behavior.
- Must only consume backend through gateway HTTP/WebSocket contracts.
- Must not import internal modules from `apps/gateway` or private implementation files in `packages/*`.

### `apps/gateway`
- Owns authentication, request validation, rate limiting, audit logging, and orchestration entrypoints.
- Must only consume package-level exports from `@remixos/*` workspaces.
- Must not embed UI logic or wallet-specific business logic.

### `packages/shared`
- Owns canonical cross-domain contracts: auth claims, task payloads, queue metadata, and audit record schemas.
- Must remain runtime-agnostic and dependency-light.

### `packages/orchestrator`
- Owns task lifecycle orchestration and queue progression.
- Must expose stable APIs for direct and queued execution paths.
- Must not couple to HTTP transport details.

### `packages/agents`
- Owns planner/builder/executor/security/fixer agent behavior.
- Must remain stateless and composable through orchestrator only.

### `packages/builder`, `packages/executor`, `packages/security`
- Own their domain-specific pipelines and adapters.
- Must preserve strict TypeScript contracts exported via `@remixos/shared`.

## Extension points

- **Auth provider adapters**: replace JWT issuer/validator without changing gateway route signatures.
- **Rate limit storage**: move from in-memory storage to Redis-backed windows while preserving middleware contract.
- **Queue backend**: swap in Redis/BullMQ workers behind orchestrator queue API.
- **Audit sink**: route structured audit events to persistent stores (PostgreSQL, data lake, SIEM).
- **Model routing**: inject model/provider selection within orchestrator without changing gateway request schema.

## PR stream boundaries

- Stream A/B stay isolated to studio UI + packaging wrappers.
- Stream C/F evolve gateway/orchestrator/shared contracts.
- Stream D/E/G consume stable contracts and add feature modules.
- Stream H validates performance/deployment infrastructure without modifying product APIs.
