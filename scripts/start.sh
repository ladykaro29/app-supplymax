#!/bin/sh

echo "=== SupplyMax Startup ==="

# If the runtime DB doesn't exist, copy the pre-seeded template
if [ ! -f /app/prisma/dev.db ]; then
  echo "No database found. Copying pre-seeded template..."
  cp /app/prisma/template.db /app/prisma/dev.db
  echo "Database ready with seed data."
else
  echo "Existing database found, using it."
fi

# Start the application
echo "Starting Next.js server..."
exec node server.js
