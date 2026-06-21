#!/bin/sh
set -e
cd /app
export DATABASE_URL="${DATABASE_URL:-file:/app/data/dliy.db}"
export NEXTAUTH_URL="${NEXTAUTH_URL:-http://localhost:3000}"
export NEXTAUTH_SECRET="${NEXTAUTH_SECRET:-$(openssl rand -base64 32)}"
export ENCRYPTION_KEY="${ENCRYPTION_KEY:-$(openssl rand -hex 32)}"
mkdir -p /app/data
echo "============================================"
echo "  dliy io - by Death Legion Team"
echo "  http://localhost:3000"
echo "============================================"
exec node server.js 2>/dev/null || exec npx next dev -p 3000 || exec node_modules/.bin/next dev -p 3000
