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
# We force a local DATABASE_URL just for the build process
# This prevents Next.js from failing during static generation
ENV DATABASE_URL="file:./build-time.db"
ENV NEXT_TELEMETRY_DISABLED=1

# Generate a dummy database so Prisma doesn't complain during build
RUN npx prisma db push --accept-data-loss
RUN npx prisma generate

# Build the project
RUN npm run build

# Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# This is the path to your Easypanel VOLUME
ENV DATABASE_URL="file:/app/prisma/dev.db"

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma logic for runtime (schema, migrations, seed)
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/package.json ./package.json

# Copy tsx for seeding (needed by prisma db seed)
COPY --from=builder /app/node_modules/tsx ./node_modules/tsx
COPY --from=builder /app/node_modules/.bin/tsx ./node_modules/.bin/tsx
COPY --from=builder /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=builder /app/node_modules/.bin/esbuild ./node_modules/.bin/esbuild
COPY --from=builder /app/node_modules/dotenv ./node_modules/dotenv

# Startup script
COPY --from=builder /app/scripts/start.sh ./start.sh
USER root
RUN tr -d '\r' < start.sh > start_unix.sh && mv start_unix.sh start.sh
RUN chmod +x start.sh
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["./start.sh"]
