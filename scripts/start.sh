#!/bin/sh

echo "=== SupplyMax Startup ==="

# Ensure the DB file and schema exist
echo "Syncing database schema..."
npx prisma db push --accept-data-loss 2>&1

# Seed the database - try compiled JS first, then tsx
echo "Running seed..."
if [ -f prisma/seed.js ]; then
  node prisma/seed.js 2>&1
else
  echo "No compiled seed.js found, trying tsx..."
  npx tsx prisma/seed.ts 2>&1 || echo "Seed failed - will start without seed data"
fi

# Start the application
echo "Starting Next.js server..."
exec node server.js
