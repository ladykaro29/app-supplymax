# Build Stage
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --include=dev

# Copy source code
COPY . .

# --- CRITICAL BUILD-TIME SETUP ---
ENV NEXT_TELEMETRY_DISABLED=1

# 1. Generate Prisma Client for the Alpine target
RUN npx prisma generate

# 2. Create the production database with correct schema AT BUILD TIME
#    Use the SAME relative path that the runtime will use
ENV DATABASE_URL="file:./prisma/production.db"
RUN npx prisma db push --accept-data-loss

# 3. Compile and run seed to populate the build-time DB
RUN npx esbuild prisma/seed.ts --bundle --platform=node --outfile=prisma/seed.js --external:@prisma/client --external:dotenv
RUN node prisma/seed.js

# 4. Build the Next.js project (with DATABASE_URL set so Prisma resolves correctly)
RUN npm run build

# Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# CRITICAL: Same relative path as build time
ENV DATABASE_URL="file:./prisma/production.db"

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Assets
COPY --from=builder /app/public ./public

# Standalone output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma: copy the schema, the BUILT database, and the engine files
COPY --from=builder --chown=nextjs:nodejs /app/prisma/schema.prisma ./prisma/schema.prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma/production.db ./prisma/production.db
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Ensure the nextjs user can write to the prisma dir (SQLite needs write for WAL/journal)
USER root
RUN chown -R nextjs:nodejs /app/prisma
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start directly - no startup script needed, DB is already built and seeded
CMD ["node", "server.js"]
