# Environment Management Guide

This guide explains how to manage environment variables for development, staging, and production environments.

## Overview

The DSA Learning Platform uses different environment configurations for:
- **Development** (local development with hot-reload)
- **Staging** (pre-production testing environment)
- **Production** (live environment)

## Directory Structure

```
backend/
├── .env.example          # Template with all available variables
├── .env.dev             # Development environment variables
├── .env.staging         # Staging environment variables
└── .env.production      # Production environment variables

frontend/
├── .env.example          # Template with all available variables
├── .env.dev             # Development environment variables
├── .env.staging         # Staging environment variables
└── .env.production      # Production environment variables
```

## Environment Variables

### Backend Environment Variables

| Variable | Dev | Staging | Production | Description |
|----------|-----|---------|------------|-------------|
| `PORT` | 4000 | 4000 | 4000 | Server port |
| `NODE_ENV` | development | staging | production | Node environment |
| `DATABASE_URL` | local | remote | remote | PostgreSQL connection string |
| `JWT_SECRET` | dev_secret | ${VAR} | ${VAR} | JWT signing secret (use strong value) |
| `JWT_EXPIRY` | 24h | 24h | 24h | JWT token expiry |
| `CORS_ORIGIN` | http://localhost:3000 | https://staging.example.com | https://dsa-learning.com | Frontend CORS origin |
| `LOG_LEVEL` | debug | info | error | Logging level |
| `REDIS_URL` | localhost | remote | remote | Redis connection (optional) |
| `SENTRY_DSN` | empty | staging_dsn | prod_dsn | Error tracking (optional) |

### Frontend Environment Variables

| Variable | Dev | Staging | Production | Description |
|----------|-----|---------|------------|-------------|
| `VITE_API_URL` | http://localhost:4000 | https://api-staging.example.com | https://dsa-learning.com/api | Backend API URL |
| `VITE_ENV` | development | staging | production | Vite environment |
| `VITE_DEBUG` | true | false | false | Debug mode |
| `VITE_ANALYTICS_ENABLED` | false | true | true | Analytics enabled |
| `VITE_SENTRY_DSN` | empty | staging_dsn | prod_dsn | Error tracking |

## Local Development Setup

### Step 1: Copy Environment Files

```bash
# Backend
cp backend/.env.example backend/.env
# Then edit backend/.env with your local values

# Frontend
cp frontend/.env.example frontend/.env
# Then edit frontend/.env with your local values
```

### Step 2: Configure Local Database (Optional)

If using Docker:

```bash
# Start development environment with database
docker-compose -f docker-compose.dev.yml up

# Seed database with sample data
docker-compose -f docker-compose.dev.yml exec backend npm run seed
```

If using local PostgreSQL:

```bash
# Create database
psql -U postgres
CREATE DATABASE dsa_learning;
CREATE USER dsa_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE dsa_learning TO dsa_user;

# Run migrations
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```

### Step 3: Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Or use docker-compose
docker-compose -f docker-compose.dev.yml up
```

## Staging Environment Setup

Staging environment uses Docker containers with predefined configuration:

```bash
# Create .env.staging file with staging credentials
# (Should be provided by DevOps team)

# Start staging environment
docker-compose -f docker-compose.staging.yml up --build

# Seed database
docker-compose -f docker-compose.staging.yml exec backend npm run seed
```

**Staging Environment Requirements:**
- Remote database server (AWS RDS, Azure Database, etc.)
- Redis instance for caching
- Proper domain and SSL certificates
- Environment variables for all sensitive data

## Production Environment Setup

Production uses optimized Docker images and requires strict environment configuration:

```bash
# ⚠️ CRITICAL: Never commit production .env to version control!
# Set environment variables via your deployment platform (GitHub Actions, GitLab CI, etc.)

# Build production images
docker build -f backend/Dockerfile -t dsa-backend:latest backend/
docker build -f frontend/Dockerfile -t dsa-frontend:latest frontend/

# Start production environment
docker-compose up -d

# Verify services are healthy
docker-compose ps
```

**Production Requirements:**
- All sensitive variables passed via CI/CD secrets
- Database backup and recovery plan
- Redis cache for performance
- Error tracking (Sentry) for monitoring
- Log aggregation (ELK, Datadog, etc.)
- Load balancing and auto-scaling
- SSL/TLS certificates
- Database replication and failover

## Docker Compose Environments

### Development (`docker-compose.dev.yml`)

```bash
# Start with live code reload
docker-compose -f docker-compose.dev.yml up

# Services included:
# - PostgreSQL database
# - Backend (Node.js with nodemon)
# - Frontend (Vite with HMR)
```

### Staging (`docker-compose.staging.yml`)

```bash
# Start staging environment
docker-compose -f docker-compose.staging.yml up --build

# Services included:
# - PostgreSQL database
# - Redis cache
# - Backend (optimized build)
# - Frontend (optimized build)
# - Health checks enabled
```

### Production (`docker-compose.yml`)

```bash
# Start production environment
docker-compose up -d

# Services included:
# - PostgreSQL database with backup volume
# - Redis with persistence
# - Backend with health monitoring
# - Frontend with nginx
# - Logging configured
```

## Security Best Practices

### 1. Never Commit Secrets

```bash
# Add .env files to .gitignore
echo ".env" >> .gitignore
echo ".env.*.local" >> .gitignore
echo ".env.production" >> .gitignore
```

### 2. Use Strong Secrets

```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate strong database password
openssl rand -base64 32
```

### 3. Rotate Secrets Regularly

- JWT_SECRET should be rotated quarterly
- Database passwords should be rotated when staff changes
- API keys should be rotated monthly

### 4. Environment Variable Validation

The backend should validate required environment variables on startup:

```typescript
// Example validation in backend/src/index.ts
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'CORS_ORIGIN',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set environment variables
        run: |
          echo "DATABASE_URL=${{ secrets.DATABASE_URL }}" >> $GITHUB_ENV
          echo "JWT_SECRET=${{ secrets.JWT_SECRET }}" >> $GITHUB_ENV
          echo "CORS_ORIGIN=${{ secrets.CORS_ORIGIN }}" >> $GITHUB_ENV
      
      - name: Build and deploy
        run: docker-compose up -d
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test connection
psql -h localhost -U dsa_user -d dsa_learning -c "SELECT 1"

# View logs
docker-compose logs db
```

### Frontend API Connection Issues

```bash
# Check VITE_API_URL in browser console
console.log(import.meta.env.VITE_API_URL)

# Check backend is accessible
curl http://localhost:4000/api/health
```

### Port Already in Use

```bash
# Find process using port 4000
lsof -i :4000

# Kill process
kill -9 <PID>
```

## Environment Variable Loading Order

The application loads environment variables in this order (first found wins):

1. System environment variables
2. `.env.<NODE_ENV>` file (e.g., `.env.production`)
3. `.env` file
4. `.env.example` (fallback)

## Related Documentation

- [Docker Guide](../DOCKER.md)
- [Backend Enhancement Guide](guides/BACKEND_ENHANCEMENT_GUIDE.md)
- [Database Setup Guide](guides/DATABASE_SETUP_GUIDE.md)
