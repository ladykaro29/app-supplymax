#!/bin/sh

echo "=== SupplyMax Startup ==="

# Ensure the DB file and schema exist
echo "Syncing database schema..."
npx prisma db push --accept-data-loss 2>&1 || echo "WARNING: prisma db push had issues"

# Seed the database if it's empty
echo "Checking seed..."
npx tsx prisma/seed.ts 2>&1 || echo "WARNING: seed had issues (may already be seeded)"

# Start the application
echo "Starting Next.js server..."
exec node server.js
