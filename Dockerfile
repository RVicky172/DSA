# Multi-stage build for DSA Learning Platform (TypeScript)
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend workspace
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source and config
COPY frontend/src ./src
COPY frontend/public ./public
COPY frontend/index.html ./
COPY frontend/vite.config.ts ./
COPY frontend/tsconfig.json ./
COPY frontend/tsconfig.node.json ./

# Build frontend (TypeScript + Vite)
RUN npm run build

# Stage 2: Build backend and final image
FROM node:18-alpine

WORKDIR /app

# Copy root package files
COPY package.json package-lock.json ./

# Copy backend workspace
COPY backend ./backend

# Install dependencies (only production backend deps)
WORKDIR /app/backend
RUN npm ci --only=production

# Build TypeScript backend
RUN npm run build

# Copy built frontend to backend public folder
COPY --from=frontend-builder /app/frontend/dist ./public

WORKDIR /app

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start compiled backend
CMD ["node", "backend/dist/index.js"]

