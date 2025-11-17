# DSA Learning Platform

A modern, full-stack platform for learning data structures and algorithms with TypeScript, React, and PostgreSQL.

> **Last Updated:** November 17, 2025 - Testing git user configuration

## 🎯 Overview

| Component | Tech | Port |
|-----------|------|------|
| **Frontend** | React 18 + Vite + TypeScript | 3000 |
| **Backend** | Express.js + TypeScript | 4000 |
| **Database** | PostgreSQL + Prisma ORM | 5432 |

## ⚡ Quick Start (2 minutes)

```bash
npm run install:all     # Install all dependencies
npm run start           # Start backend & frontend in background
```

Open **http://localhost:3000** — Done!

## 🚀 Core Commands

```bash
# Development
npm run start:backend   # Backend on http://localhost:4000
npm run start:frontend  # Frontend on http://localhost:3000

# Database
npx prisma studio     # Admin UI (http://localhost:5555)
npx prisma migrate dev --name "init"  # Create migration

# Production
npm run build          # Build for production
docker compose up      # Docker deployment
```

## 📂 Project Structure

```
frontend/              React SPA (port 3000)
backend/               Express API (port 4000)
docs/
  ├── README.md       ← You are here
  ├── ENHANCEMENT_PLAN.md
  └── guides/         In-depth setup & architecture guides
package.json          Monorepo configuration
```

## 🌐 API Endpoints

```
GET  /api/health                Health check
GET  /api/lessons               List lessons
GET  /api/lessons/:id           Get lesson details
```

See `guides/BACKEND_ENHANCEMENT_GUIDE.md` for full API documentation.

## 🔧 Database Setup

### Using PostgreSQL locally (macOS):
```bash
brew install postgresql@15
brew services start postgresql@15
createdb dsa_learning

cd backend
npx prisma migrate dev --name init
```

### Using Docker:
```bash
docker run -d \
  -e POSTGRES_DB=dsa_learning \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  postgres:15-alpine
```

## 📋 Environment Setup

Create `backend/.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/dsa_learning"
PORT=4000
NODE_ENV=development
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000
```

## 📚 Documentation

| Resource | Audience | Link |
|----------|----------|------|
| Quick Start | Everyone | This file ↑ |
| Development Roadmap | Product Managers | `ENHANCEMENT_PLAN.md` |
| Database Setup | Backend Devs | `guides/DATABASE_SETUP.md` |
| TypeScript Architecture | Full-Stack | `guides/TYPESCRIPT_MIGRATION.md` |
| API Design | Backend Devs | `guides/BACKEND_ENHANCEMENT_GUIDE.md` |
| React Patterns | Frontend Devs | `guides/FRONTEND_API_SERVICE_GUIDE.md` |

## ⚠️ Common Issues

| Issue | Fix |
|-------|-----|
| Backend won't start | `lsof -i :4000` (check if port is free) |
| Frontend won't load | `rm -rf frontend/node_modules/.vite` |
| DB connection error | Verify `DATABASE_URL` in `.env` |

## 🔗 Quick Links

- **Setup help?** → `docs/guides/DATABASE_SETUP.md`
- **Backend patterns?** → `docs/guides/BACKEND_ENHANCEMENT_GUIDE.md`
- **Frontend guide?** → `docs/guides/FRONTEND_API_SERVICE_GUIDE.md`
- **TypeScript setup?** → `docs/guides/TYPESCRIPT_MIGRATION.md`
- **Next features?** → `docs/ENHANCEMENT_PLAN.md`

---

**Status:** Development  
**Stack:** React 18 • Express.js • PostgreSQL • TypeScript 5.3+  
**Updated:** November 2025

