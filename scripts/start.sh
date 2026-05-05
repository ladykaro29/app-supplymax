#!/bin/sh

echo "=== SupplyMax Production Startup ==="

# Define paths
PRISMA_CLI="./node_modules/prisma/build/index.js"
SCHEMA_PATH="./prisma/schema.prisma"
# Use absolute path for reliability
DB_FILE="/app/prisma/v2_production.db"

echo "Working directory: $(pwd)"
echo "Target DB: $DB_FILE"

# Ensure the parent directory exists and is writable
mkdir -p /app/prisma

# Sync schema to the database file
echo "Pushing schema to $DB_FILE..."
# We export DATABASE_URL as absolute to ensure Prisma finds it
export DATABASE_URL="file:$DB_FILE"
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
