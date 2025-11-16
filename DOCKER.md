# Docker Setup for DSA Learning Platform

## Quick Start

### Production Build & Run

```bash
# Build image
docker build -t dsa-app:latest .

# Run container
docker run -p 4000:4000 dsa-app:latest
```

### With Docker Compose (Production)

```bash
docker compose up
```

The app will be available at `http://localhost:4000`

### Development with Hot-Reload

```bash
# Option 1: docker-compose with file volumes
docker compose -f docker-compose.dev.yml up

# Option 2: Using the helper script
bash .docker-build.sh run-dev
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:4000`

## Files Overview

### `Dockerfile`

Multi-stage production build:

- **Stage 1**: Builds React frontend (Vite)
- **Stage 2**: Prepares backend, copies built frontend to `backend/public/`
- Result: Single image serving both frontend (static) and backend (API)

### `Dockerfile.dev`

Development image with:

- Hot-reload via volume mounts
- All dev dependencies installed
- Supports `npm run dev` for both workspaces

### `docker-compose.yml`

Production setup:

- Single `app` service
- Port 4000 exposed
- Health check enabled
- Template for optional PostgreSQL database

### `docker-compose.dev.yml`

Development setup:

- Separate `backend` and `frontend` services
- Volume mounts for live code changes
- Exposes ports 4000 (backend) and 3000 (frontend)
- Interactive TTY for debugging

### `.dockerignore`

Excludes build artifacts and node_modules to optimize image size

### `.docker-build.sh`

Convenience script for common Docker tasks:

```bash
bash .docker-build.sh build       # Build production
bash .docker-build.sh build-dev   # Build dev
bash .docker-build.sh run         # Run production
bash .docker-build.sh run-dev     # Run dev with compose
bash .docker-build.sh compose     # Run production with compose
bash .docker-build.sh clean       # Clean up images/containers
```

## How It Works

### Production Flow

1. Frontend code is built to static files (`frontend/dist/`)
2. Backend copies these files to `backend/public/`
3. Backend serves API routes at `/api/*`
4. Backend serves SPA (fallback to `index.html` for non-API routes)

### Development Flow

1. Frontend dev server runs on port 3000 with HMR
2. Backend dev server runs on port 4000 with nodemon auto-restart
3. Changes to files automatically reload in the browser

## Environment Variables

### Production

- `PORT` — Backend port (default: 4000)
- `NODE_ENV` — Set to `production`

### Development

- `VITE_API_URL` — Frontend API endpoint (default: `http://localhost:4000`)

Add more to `backend/.env.example` and `docker-compose.yml` as features are added.

## Testing the Setup

### Health Check

```bash
curl http://localhost:4000/api/health
# Expected: {"ok":true}
```

### API Endpoint

```bash
curl http://localhost:4000/api/lessons
# Expected: {"lessons":[...]}
```

### Frontend (Production)

Visit `http://localhost:4000` in browser

## Notes

- Both `Dockerfile` and `Dockerfile.dev` use `node:18-alpine` (update to `20` or latest as needed)
- In production, frontend is bundled with backend for single deployment
- In development, frontend and backend run separately for HMR
- Optional database service template included in `docker-compose.yml` (uncomment when adding PostgreSQL)
- Health check monitors `/api/health` endpoint every 30s with 3-retry policy

