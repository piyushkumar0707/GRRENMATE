# Multi-stage Dockerfile for GreenMate Next.js Application

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Set build-time environment variables
ARG NODE_ENV=production
ARG NEXT_TELEMETRY_DISABLED=1
ARG VERSION
ARG BUILD_DATE

ENV NODE_ENV=$NODE_ENV
ENV NEXT_TELEMETRY_DISABLED=$NEXT_TELEMETRY_DISABLED

# Build the application
WORKDIR /app/apps/web
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Set runtime environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Add non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/web/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application with correct permissions
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

# Copy production dependencies
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules

# Add health check script
RUN echo '#!/bin/sh\ncurl -f http://localhost:3000/api/health || exit 1' > /usr/local/bin/healthcheck
RUN chmod +x /usr/local/bin/healthcheck

# Add labels for metadata
LABEL maintainer="GreenMate Team <team@greenmate.app>"
LABEL version="${VERSION}"
LABEL build-date="${BUILD_DATE}"
LABEL description="GreenMate - Your Personal Plant Care Assistant"
LABEL org.opencontainers.image.title="GreenMate"
LABEL org.opencontainers.image.description="Your Personal Plant Care Assistant"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.source="https://github.com/greenmate/app"
LABEL org.opencontainers.image.licenses="MIT"

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variable for port
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD /usr/local/bin/healthcheck

# Start the application
CMD ["node", "server.js"]

# Development stage
FROM node:18-alpine AS development
WORKDIR /app

# Install dependencies for development
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install all dependencies including dev
RUN npm ci

# Copy source code
COPY . .

# Set development environment
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Expose port for development
EXPOSE 3000

# Working directory for app
WORKDIR /app/apps/web

# Start development server
CMD ["npm", "run", "dev"]