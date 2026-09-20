#!/bin/sh

echo "=== SupplyMax Production Startup ==="

# Define paths
PRISMA_CLI="./node_modules/prisma/build/index.js"
SCHEMA_PATH="./prisma/schema.prisma"

# Canonical DB path
export DATABASE_URL="file:/app/prisma/dev.db"

# Defensively remove leaked env files if any
for f in /app/.env /app/.env.production /app/.env.development /app/.env.local; do
  if [ -f "$f" ]; then
    echo "[STARTUP] Removing leaked env file: $f"
    rm -f "$f" || true
  fi
done

echo "Working directory: $(pwd)"
echo "Target DB: $DATABASE_URL"

# Ensure the parent directory exists
mkdir -p /app/prisma || true

# Try db push defensively if CLI exists (non-fatal)
if [ -f "$PRISMA_CLI" ]; then
  echo "Pushing schema to $DATABASE_URL (best-effort)..."
  node "$PRISMA_CLI" db push --schema="$SCHEMA_PATH" --accept-data-loss || true
fi

# Run seed script defensively
if [ -f ./scripts/seed.js ]; then
  echo "Running compiled seed script..."
  node ./scripts/seed.js || true
elif [ -f prisma/seed.js ]; then
  echo "Running prisma/seed.js..."
  node prisma/seed.js || true
fi

# Defensive admin ensure
echo "Ensuring admin user..."
node -e "
const { PrismaClient } = require('@prisma/client');
(async () => {
  try {
    const p = new PrismaClient();
    await p.user.deleteMany({ where: { email: 'admin@supplymax.com' } });
    await p.user.upsert({
      where: { email: 'admin@supplymax.app' },
      update: { password: '123Suppli', role_id: 'Admin', status: 'Active', name: 'Admin Supplymax' },
      create: {
        name: 'Admin Supplymax',
        email: 'admin@supplymax.app',
        password: '123Suppli',
        role_id: 'Admin',
        status: 'Active'
      }
    });
    console.log('[STARTUP] Admin ensured.');
    await p.\$disconnect();
  } catch (e) {
    console.warn('[STARTUP] Admin ensure notice:', e ? e.message : e);
  }
})();
" || true

# Start the application
echo "Starting Next.js server on port ${PORT:-3000}..."
exec node server.js
