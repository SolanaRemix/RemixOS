FROM node:20-alpine AS base
RUN corepack enable

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* tsconfig.base.json ./

# Copy package manifests
COPY apps/gateway/package.json ./apps/gateway/
COPY packages/shared/package.json ./packages/shared/
COPY packages/agents/package.json ./packages/agents/
COPY packages/orchestrator/package.json ./packages/orchestrator/
COPY packages/builder/package.json ./packages/builder/
COPY packages/executor/package.json ./packages/executor/
COPY packages/security/package.json ./packages/security/

RUN pnpm install --frozen-lockfile

# Copy source
COPY apps/gateway ./apps/gateway
COPY packages ./packages

# Build
RUN pnpm --filter @remixos/shared build
RUN pnpm --filter @remixos/agents build
RUN pnpm --filter @remixos/orchestrator build
RUN pnpm --filter @remixos/builder build
RUN pnpm --filter @remixos/executor build
RUN pnpm --filter @remixos/security build
RUN pnpm --filter @remixos/gateway build

EXPOSE 3001

CMD ["node", "apps/gateway/dist/index.js"]
