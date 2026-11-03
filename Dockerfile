# ==============================================================================
# Multi-Stage Production Dockerfile for Fandoq Academy & Confectionery Full-Stack
# ==============================================================================

# Stage 1: Build Frontend Assets & Prepare dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package.json package-lock.json* bun.lock* ./
RUN npm install --frozen-lockfile || npm install

# Copy application source code
COPY . .

# Build the client-side SPA into /dist
RUN npm run build

# ==============================================================================
# Stage 2: Minimal & Secure Production Runtime
# ==============================================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies
COPY package.json package-lock.json* bun.lock* ./
RUN npm install --omit=dev || npm install --production

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy server scripts and types
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/src/types ./src/types
COPY --from=builder /app/src/data ./src/data
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# Security best practice: Run with non-root user
USER node

# Expose HTTP port
EXPOSE 3000

# Container Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the full-stack server
CMD ["npm", "start"]
