# RemixOS — Security Guide

## Security Model

RemixOS is designed with a defence-in-depth approach. Security controls operate at every layer.

---

## Input Security

### Prompt Length Guard
All prompts submitted to `/run` are validated at the gateway:
- Maximum size: **16,384 bytes (~16 KB)**
- Rejected with `HTTP 413 Payload Too Large` if exceeded
- Measured in UTF-8 bytes (not characters) to prevent encoding bypasses

### Schema Validation
All incoming request bodies are validated with [Zod](https://zod.dev):
- Unknown properties are stripped
- Missing required fields return `HTTP 400`
- Type coercion is disabled

---

## Authentication & Authorisation

### JWT Authentication
When `REMIXOS_AUTH_REQUIRED=true`:
- All `/run` requests require a `Bearer <token>` header
- Tokens are issued by `/auth/token` (restricted to loopback or bootstrap secret)
- Tokens are signed with `REMIXOS_JWT_SECRET` using `jsonwebtoken`
- Token TTL configurable via `REMIXOS_JWT_TTL_SECONDS` (default: 3600s)

### JWT Secret Requirements
The gateway **refuses to start** if `REMIXOS_AUTH_REQUIRED=true` and the JWT secret is weak:
- Minimum 32 characters
- Must contain at least 3 of: lowercase, uppercase, digits, symbols
- Must not be all the same character

Generate a strong secret:
```bash
openssl rand -base64 48
```

### Scope-Based Access
JWT claims include a `scope` array. Current scope: `["run:task"]`.
Future scopes: `admin:read`, `admin:write`, `billing:manage`.

---

## Rate Limiting

In-memory rate limiter with configurable window and max requests:

| Variable | Default | Description |
|----------|---------|-------------|
| `REMIXOS_RATE_LIMIT_MAX` | 60 | Max requests per window |
| `REMIXOS_RATE_LIMIT_WINDOW_MS` | 60000 | Window size in ms (1 minute) |

Rate limit keys are per `actorId:ip`. Exceeded requests return `HTTP 429` with a `Retry-After` header.

---

## Output Security

### HTML Sanitisation
All HTML generation routes through `escapeHtml()`:
```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
```

### Sandboxed Preview Iframe
Generated UI is previewed inside an iframe with a restricted sandbox:
```html
<iframe sandbox="allow-scripts" srcdoc="..." />
```
`allow-same-origin` is **not** included — the iframe cannot access parent DOM or cookies.

### Code Injection Prevention
Generated JavaScript uses `JSON.stringify` for string literals, preventing JS injection via user-controlled strings.

---

## Static Analysis

The Security Agent (`packages/security`) runs on every generated artifact:
- Detects unsafe patterns: `eval()`, `Function()`, `innerHTML`, direct DOM writes
- Issues are collected in `AuditResult.issues[]`
- If `audit.safe === false`, the Fixer Agent automatically patches issues
- Pattern list is extensible — add your own matchers

---

## HTTP Security Headers

All responses from the Studio UI include:
```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

In production with nginx, `Strict-Transport-Security` is also set:
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

---

## Dependency Auditing

`pnpm audit --audit-level=high` runs on every CI push. The CI pipeline will fail if high-severity vulnerabilities are found.

Run manually:
```bash
pnpm audit --audit-level=high
```

---

## Audit Logging

Every significant action is logged in structured JSON to stdout:
```json
{
  "type": "audit",
  "requestId": "uuid",
  "actorId": "user-id",
  "action": "run_completed",
  "status": "success",
  "timestamp": 1700000000000,
  "metadata": { "jobId": "..." }
}
```

Audit actions: `issue_token`, `run_requested`, `run_completed`, `run_failed`, `auth_failed`, `rate_limited`.

Pipe to a SIEM or log aggregator (e.g., Grafana Loki, Datadog) for alerting and retention.

---

## Wallet Security

- Confirmation modal required before every on-chain action
- Errors are displayed in the modal and kept visible until dismissed
- Never auto-signs transactions
- Private keys are never stored or transmitted — all signing happens in the browser wallet

---

## Environment Security

- Never commit `.env` files (`.gitignore` includes `.env*` except `.env.example`)
- Rotate secrets regularly; revoke compromised tokens immediately
- In production, inject secrets via your platform's secret management (Vercel env vars, Railway secrets, Docker secrets)
- Use a dedicated service account with minimal permissions for database access

---

## Security Checklist (Pre-Production)

- [ ] `REMIXOS_AUTH_REQUIRED=true` with a strong JWT secret
- [ ] `REMIXOS_BOOTSTRAP_SECRET` set (or gateway bound to loopback only)
- [ ] HTTPS enabled with valid TLS certificate
- [ ] `Strict-Transport-Security` header active
- [ ] `pnpm audit` passing (no high+ vulnerabilities)
- [ ] Rate limiting configured appropriately for your traffic
- [ ] Audit logs piped to persistent storage
- [ ] Database access restricted to gateway service user
- [ ] Redis `requirepass` set in production
- [ ] Stripe webhooks validated with `STRIPE_WEBHOOK_SECRET`
