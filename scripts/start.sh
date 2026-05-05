#!/bin/sh

echo "=== SupplyMax Production Startup ==="

# Define Prisma CLI path
PRISMA_CLI="./node_modules/prisma/build/index.js"

# Ensure the DB schema is up to date
echo "Syncing database schema..."
node $PRISMA_CLI db push --accept-data-loss

# Run the compiled seed script
echo "Running database seed..."
if [ -f prisma/seed.js ]; then
  node prisma/seed.js
else
  echo "WARNING: prisma/seed.js not found!"
fi

# Start the application
echo "Starting Next.js server..."
exec node server.js
