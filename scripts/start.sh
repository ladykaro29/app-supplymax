#!/bin/sh

echo "=== SupplyMax Production Startup ==="

# Define paths
PRISMA_CLI="./node_modules/prisma/build/index.js"
SCHEMA_PATH="./prisma/schema.prisma"
DB_FILE="/app/prisma/dev.db"

# FORCE RESET: Delete the existing DB to ensure the new schema (role_id, etc.) is applied correctly
if [ -f "$DB_FILE" ]; then
  echo "Found existing database at $DB_FILE. Removing it to force a clean schema sync..."
  rm "$DB_FILE"
fi

# Ensure the DB schema is up to date
echo "Syncing database schema..."
node $PRISMA_CLI db push --schema=$SCHEMA_PATH --accept-data-loss

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
