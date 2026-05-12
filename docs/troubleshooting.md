# RemixOS — Troubleshooting Guide

## Common Issues

---

### `REMIXOS_JWT_SECRET must be a strong value` on gateway startup

**Cause:** `REMIXOS_AUTH_REQUIRED=true` but the JWT secret is weak or unset.

**Fix:**
```bash
# Generate a strong secret
openssl rand -base64 48
# Add to .env:
REMIXOS_JWT_SECRET=<output from above>
```

Or disable auth for local development:
```env
REMIXOS_AUTH_REQUIRED=false
```

---

### `pnpm: command not found`

**Fix:**
```bash
# Enable corepack (included with Node.js 16+)
corepack enable
corepack prepare pnpm@latest --activate

# Or install globally
npm install -g pnpm@9
```

---

### Port 3001 already in use

**Fix:**
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9
# Or change the port:
PORT=3002 pnpm dev
```

---

### Build fails with TypeScript errors

**Quick diagnosis:**
```bash
pnpm typecheck
```

**Common causes:**
- Missing `.js` extension on relative imports (ESM requires explicit extensions)
- New types added to `@remixos/shared` but `dist/` not rebuilt → run `pnpm build` first
- Incorrect `tsconfig.json` — check `"moduleResolution": "bundler"` for Next.js

---

### WebSocket connection refused

**Symptoms:** Log panel shows "Connection refused" or no live logs.

**Checklist:**
1. Gateway running? `curl http://localhost:3001/health`
2. `NEXT_PUBLIC_WS_URL` matches gateway port
3. Firewall blocking port 3001?
4. Browser blocking mixed content (HTTPS page → WS)?
   - Use `wss://` for HTTPS deployments

---

### `pnpm install --frozen-lockfile` fails

**Cause:** `pnpm-lock.yaml` is out of sync with `package.json` changes.

**Fix (development only):**
```bash
pnpm install  # regenerates lockfile
git add pnpm-lock.yaml
git commit -m "chore: update pnpm lockfile"
```

**Do not** run `pnpm install` (without `--frozen-lockfile`) in CI.

---

### Docker containers fail to start

**Diagnosis:**
```bash
docker compose -f infra/docker/docker-compose.yml logs
docker compose -f infra/docker/docker-compose.yml ps
```

**Common issues:**

| Symptom | Cause | Fix |
|---------|-------|-----|
| Gateway exits immediately | Weak JWT secret | Set `REMIXOS_JWT_SECRET` in `.env` |
| Redis not reachable | Redis container not running | Check `redis` service health |
| Postgres auth failed | Wrong credentials | Match `POSTGRES_USER`/`POSTGRES_PASSWORD` in `.env` |
| Port already in use | Local service on same port | Stop local services or change port mapping |

---

### AI providers returning errors

**OpenAI 401:** Invalid API key — check `OPENAI_API_KEY`
**OpenAI 429:** Rate limited — reduce request frequency or upgrade plan
**Anthropic 529:** Overloaded — retry with exponential backoff (router handles this automatically)

**Check which providers are active:**
```bash
curl http://localhost:3001/health
# AI provider info shown in admin dashboard at /admin
```

**Fallback to mock (dev):**
Remove or unset all `*_API_KEY` variables. The AI router will return structured mock responses.

---

### `next lint` warning about deprecation

This is expected with Next.js 15. The lint command still works. Migrate when ready:
```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

---

### Self-heal script fails after 3 attempts

**Diagnosis:** Check which step is failing:
```bash
pnpm tsx scripts/self-heal.ts 2>&1 | grep "✖"
```

**If `install` fails:**
- Check network connectivity
- Try `pnpm store prune` to clear corrupted cache
- Delete `node_modules` and retry

**If `build` fails:**
- Run `pnpm build 2>&1 | head -50` for full error output
- Check for missing environment variables required at build time

**If `test` fails:**
- Run `pnpm test` directly for verbose test output

---

### Health check shows service as "down"

```bash
pnpm tsx scripts/healthcheck.ts --json | jq
```

For optional services (Go Core), `status: "warn"` is acceptable. For required services (gateway, studio), investigate:

```bash
# Gateway
curl -v http://localhost:3001/health

# Studio
curl -v http://localhost:3000/
```

---

### Wallet not connecting

**MetaMask:**
- Ensure extension is installed and unlocked
- Check `window.ethereum` is present in browser console
- Try a hard refresh (Ctrl+Shift+R)

**Phantom:**
- Ensure extension is installed and `window.solana.isPhantom === true`
- Switch to the correct network in Phantom before connecting

**General:**
- HTTPS required for wallet APIs in production
- Incognito/private mode may block wallet extensions

---

## Getting Help

- 📖 Full docs: [/docs](../docs/)
- 🐛 Issues: [github.com/SolanaRemix/RemixOS/issues](https://github.com/SolanaRemix/RemixOS/issues)
- 💬 Discussions: [github.com/SolanaRemix/RemixOS/discussions](https://github.com/SolanaRemix/RemixOS/discussions)
