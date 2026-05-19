#!/bin/sh
set -e

echo "=== SupplyMax Production Startup ==="

# Define paths
PRISMA_CLI="./node_modules/prisma/build/index.js"
SCHEMA_PATH="./prisma/schema.prisma"

# FORCE the canonical DB path. We intentionally override whatever may
# have leaked from .env / build args / platform UI env vars, because
# the build was observed using /app/prisma/dev.db while runtime
# expected supplymax_v3.db, leading to login lookups against an empty
# DB. Single source of truth from here on.
export DATABASE_URL="file:/app/prisma/supplymax_v3.db"

# Some platforms (Easypanel, Coolify) inject .env files into the
# build context or runtime container. Prisma's CLI auto-loads .env,
# which would re-override DATABASE_URL. Strip them defensively.
for f in /app/.env /app/.env.production /app/.env.development /app/.env.local; do
  if [ -f "$f" ]; then
    echo "[STARTUP] Removing leaked env file: $f"
    rm -f "$f"
  fi
done

echo "Working directory: $(pwd)"
echo "Target DB: $DATABASE_URL"
echo "Contents of /app/prisma BEFORE migrations:"
ls -la /app/prisma/ || true

# Ensure the parent directory exists and is writable
mkdir -p /app/prisma

# Sync schema to the database file
echo "Pushing schema to $DATABASE_URL..."
node $PRISMA_CLI db push --schema=$SCHEMA_PATH --accept-data-loss

# Run the compiled seed script
echo "Running seed script..."
if [ -f prisma/seed.js ]; then
  node prisma/seed.js
else
  echo "WARNING: prisma/seed.js not found!"
fi

# Defensive admin ensure — runs INDEPENDENTLY of seed.js so it survives
# stale-volume / cached-image scenarios where seed.js may be outdated.
echo "Ensuring admin user (defensive)..."
node -e "
const { PrismaClient } = require('@prisma/client');
(async () => {
  const p = new PrismaClient();
  try {
    await p.user.deleteMany({ where: { email: 'admin@supplymax.com' } });
    const admin = await p.user.upsert({
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
    console.log('[STARTUP] Admin ensured:', admin.email);
    const users = await p.user.findMany({ select: { email: true, role_id: true } });
    console.log('[STARTUP] Users in DB:', JSON.stringify(users));
  } catch (e) {
    console.error('[STARTUP] Failed to ensure admin:', e && e.message ? e.message : e);
  } finally {
    await p.\$disconnect();
  }
})();
"

# Start the application
echo "Starting Next.js server..."
exec node server.js
