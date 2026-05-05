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

# Use a build-time DB for Prisma generation and build
ENV DATABASE_URL="file:./build-time.db"
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss

# Compile seed.ts to seed.js so we can run it with plain node at runtime
RUN npx tsx --compile prisma/seed.ts 2>/dev/null || npx esbuild prisma/seed.ts --bundle --platform=node --outfile=prisma/seed.js --external:@prisma/client --external:dotenv 2>/dev/null || echo "Will use tsx at runtime"

# Build the project
RUN npm run build

# Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/data/prod.db"

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Create persistent data directory with proper permissions
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data

# Assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma runtime files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/package.json ./package.json

# Copy dotenv for seed script
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv

# Startup script
COPY --from=builder /app/scripts/start.sh ./start.sh
USER root
RUN tr -d '\r' < start.sh > start_unix.sh && mv start_unix.sh start.sh
RUN chmod +x start.sh

# Ensure nextjs user owns everything it needs
RUN chown -R nextjs:nodejs /app/prisma /app/data
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]
