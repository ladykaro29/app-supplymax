#!/bin/sh

# Ensure the DB schema is up to date in the runtime environment
# For SQLite, this creates the file if it doesn't exist
echo "Running database schema sync..."
npx prisma db push --accept-data-loss

# Seed the database if it's empty (first run only)
echo "Checking if database needs seeding..."
npx prisma db seed 2>/dev/null || echo "Seeding skipped or already done."

# Start the application
echo "Starting Next.js server..."
node server.js
