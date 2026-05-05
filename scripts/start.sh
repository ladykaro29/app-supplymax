#!/bin/sh

echo "=== SupplyMax Production Startup ==="

# Define paths - using relative paths which are often more reliable in SQLite/Prisma containers
PRISMA_CLI="./node_modules/prisma/build/index.js"
SCHEMA_PATH="./prisma/schema.prisma"
# We change the filename to v2 to force a fresh start and bypass any "sticky" volume files
DB_FILE="./prisma/v2_production.db"

echo "Current directory: $(pwd)"
echo "Target DB: $DB_FILE"

# Ensure prisma directory exists
mkdir -p ./prisma

# Sync schema to the NEW database file
echo "Pushing schema to $DB_FILE..."
node $PRISMA_CLI db push --schema=$SCHEMA_PATH --accept-data-loss

# Run the compiled seed script
echo "Seeding $DB_FILE..."
if [ -f prisma/seed.js ]; then
  # Ensure seed uses the same DB_FILE if it relies on env
  DATABASE_URL="file:$DB_FILE" node prisma/seed.js
else
  echo "WARNING: prisma/seed.js not found!"
fi

# Start the application
echo "Starting Next.js server..."
# Ensure the app uses the NEW database file
export DATABASE_URL="file:$DB_FILE"
exec node server.js
