# syntax=docker/dockerfile:1.7

# =============================================================================
# dliy io - Production Dockerfile
# Multi-stage build optimized for Next.js standalone output
# =============================================================================
# Build:  docker build -t dliyio/app:latest .
# Run:    docker run -p 3000:3000 -v $(pwd)/data:/app/data dliyio/app:latest
# =============================================================================

# ---- Stage 1: deps ----
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable Bun via corepack for faster installs
RUN corepack enable

# Copy lockfile + package manifests
COPY package.json bun.lock* ./
COPY prisma ./prisma

# Install dependencies (use bun for speed)
RUN bun install --frozen-lockfile

# ---- Stage 2: builder ----
FROM node:20-alpine AS builder
RUN corepack enable
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects telemetry — disable it
ENV NEXT_TELEMETRY_DISABLED=1

# Build-time env vars
ENV NODE_ENV=production
ENV DATABASE_URL="file:/app/data/dliy.db"

# Generate Prisma client
RUN bun run db:generate

# Build the Next.js app (standalone output)
RUN bun run build

# ---- Stage 3: runner ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Install minimal runtime deps + openssl for Prisma
RUN apk add --no-cache openssl tini

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy standalone build (includes only the runtime deps)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy Prisma files + migrations
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Persisted data directory (database, logs)
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data
VOLUME ["/app/data"]

# Drop privileges
USER nextjs

# Healthcheck: hit the home page
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:3000/ >/dev/null 2>&1 || exit 1

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
