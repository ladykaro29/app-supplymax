#!/bin/sh

echo "=== SupplyMax Production Startup ==="

# Define paths
PRISMA_CLI="./node_modules/prisma/build/index.js"
SCHEMA_PATH="./prisma/schema.prisma"

# Fallback if DATABASE_URL is not set
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/prisma/production.db"
fi

echo "Working directory: $(pwd)"
echo "Target DB: $DATABASE_URL"

# Ensure the parent directory exists and is writable
mkdir -p /app/prisma

# Sync schema to the database file
echo "Pushing schema to $DATABASE_URL..."
node $PRISMA_CLI db push --schema=$SCHEMA_PATH --accept-data-loss

# Run the compiled seed script
echo "Seeding $DB_FILE..."
if [ -f prisma/seed.js ]; then
  node prisma/seed.js
else
  echo "WARNING: prisma/seed.js not found!"
fi

# Start the application
echo "Starting Next.js server..."
exec node server.js
