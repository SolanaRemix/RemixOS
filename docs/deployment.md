# RemixOS — Deployment Guide

RemixOS supports one-click autonomous deployment to all major platforms.

---

## Quick Deploy

```bash
# Vercel (recommended for Studio UI)
pnpm tsx scripts/deploy.ts vercel --prod

# Netlify
pnpm tsx scripts/deploy.ts netlify --prod

# Docker (full stack)
pnpm tsx scripts/deploy.ts docker

# Railway
pnpm tsx scripts/deploy.ts railway --prod

# Fly.io
pnpm tsx scripts/deploy.ts fly --prod

# VPS (SSH-based)
VPS_HOST=your-server.com VPS_USER=ubuntu pnpm tsx scripts/deploy.ts vps --prod
```

Add `--dry-run` to preview what would happen without executing.

---

## Platform-Specific Guides

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel deploy --prod`

The `vercel.json` at the repo root configures:
- Build command: `pnpm build`
- Output: `apps/studio/.next`
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- API proxy routes to the gateway

**Required environment variables (Vercel dashboard → Settings → Environment Variables):**
- `NEXT_PUBLIC_GATEWAY_URL`
- `NEXT_PUBLIC_WS_URL`
- `REMIXOS_JWT_SECRET` (gateway only)

---

### Netlify

1. Install Netlify CLI: `npm i -g netlify-cli`
2. Login: `netlify login`
3. Link site: `netlify link`
4. Deploy: `netlify deploy --prod --dir apps/studio/.next`

The `netlify.toml` at the repo root handles:
- Build command and publish directory
- `@netlify/plugin-nextjs` for SSR support
- Security headers
- API redirect to gateway

---

### Docker Compose (Full Stack)

The enhanced `docker-compose.yml` includes:

| Service | Port | Description |
|---------|------|-------------|
| `gateway` | 3001 | Express + WebSocket API |
| `studio` | 3000 | Next.js frontend |
| `go-core` | 8080 | Go microservice |
| `redis` | 6379 | Session store + caching |
| `postgres` | 5432 | Primary database |
| `nginx` | 80/443 | Reverse proxy + SSL |

```bash
# Start all services
docker compose -f infra/docker/docker-compose.yml up --build -d

# View logs
docker compose -f infra/docker/docker-compose.yml logs -f gateway

# Stop everything
docker compose -f infra/docker/docker-compose.yml down
```

**Required `.env` file at repo root before starting Docker:**

```env
REMIXOS_JWT_SECRET=<strong-32-char-secret>
DATABASE_URL=postgresql://remixos:remixos_dev@postgres:5432/remixos
REDIS_URL=redis://redis:6379
POSTGRES_USER=remixos
POSTGRES_PASSWORD=remixos_dev
POSTGRES_DB=remixos
```

---

### Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Link project: `railway link`
4. Deploy: `railway up`

Railway auto-detects Node.js and uses the root `package.json` build script.

---

### Fly.io

1. Install flyctl: see [fly.io/docs/hands-on/install-flyctl](https://fly.io/docs/hands-on/install-flyctl/)
2. Create app: `flyctl apps create remixos`
3. Set secrets: `flyctl secrets set REMIXOS_JWT_SECRET=...`
4. Deploy: `flyctl deploy`

Add a `fly.toml` at repo root with your app config.

---

### VPS (SSH-based)

Prerequisites on the VPS:
- Node.js ≥ 20
- pnpm ≥ 9
- pm2 or systemd service

Set environment variables:
```bash
export VPS_HOST=your-server.com
export VPS_USER=ubuntu
export VPS_APP_DIR=/opt/remixos
```

Deploy:
```bash
pnpm tsx scripts/deploy.ts vps --prod
```

The deploy script will:
1. SSH to the server
2. `git pull origin main`
3. `pnpm install --frozen-lockfile`
4. `pnpm build`
5. `pm2 reload all` (falls back to `systemctl restart remixos`)

---

### Cloudflare Workers / Pages

For Cloudflare Pages, set:
- Build command: `pnpm build`
- Build output: `apps/studio/.next`
- Root directory: (leave blank for repo root)
- Node.js version: `20`

---

## Nginx Reverse Proxy

The `infra/docker/nginx.conf` provides:
- HTTP → HTTPS redirect
- SSL/TLS termination (TLSv1.2 + TLSv1.3)
- WebSocket proxy for the gateway
- Rate limiting on API and auth endpoints
- Security headers
- Gzip compression

For production, mount SSL certificates at `/etc/nginx/ssl/`:
- `fullchain.pem` — full certificate chain
- `privkey.pem` — private key

Use [Certbot](https://certbot.eff.org/) to obtain free Let's Encrypt certs:
```bash
certbot certonly --standalone -d yourdomain.com
```

---

## Health Checks

```bash
# Check all services
pnpm tsx scripts/healthcheck.ts

# JSON output (for monitoring integrations)
pnpm tsx scripts/healthcheck.ts --json

# Custom endpoints via env vars
GATEWAY_URL=https://api.yourdomain.com STUDIO_URL=https://yourdomain.com pnpm tsx scripts/healthcheck.ts
```

Exit code 0 = all required services healthy. Exit code 1 = one or more required services down.

---

## CI/CD

See [.github/workflows/ci.yml](../.github/workflows/ci.yml) for the full CI pipeline.

The pipeline runs on every push to `main` and every PR:
1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm build`
4. `pnpm typecheck`
5. `pnpm test`
6. `pnpm audit --audit-level=high`

The self-healing CI workflow (`.github/workflows/auto-fix.yml`) automatically triggers if the main pipeline fails.
