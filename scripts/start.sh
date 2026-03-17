#!/bin/sh

# Ensure the DB schema is up to date in the runtime environment
# For SQLite, this creates the file if it doesn't exist
echo "Running database schema sync..."
npx prisma db push --accept-data-loss

# Start the application
echo "Starting Next.js server..."
node server.js
