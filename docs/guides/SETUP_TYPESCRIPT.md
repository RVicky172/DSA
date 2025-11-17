# Quick Start Guide - TypeScript Full-Stack Setup

## Complete Setup in 5 Steps

### Step 1: Initial Setup (5 minutes)

```bash
# Clone/enter repository
cd /Users/vicky/Desktop/Code/DSA

# Install all dependencies (both backend and frontend)
npm run install:all

# This installs:
# - Backend: TypeScript, ts-node, Express with types, Prisma, ESLint
# - Frontend: React, TypeScript, Vite, ESLint
```

### Step 2: Database Setup (10 minutes)

#### Option A: Local PostgreSQL (Recommended for Development)

```bash
# 1. Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# 2. Create database and user
psql postgres << EOF
CREATE DATABASE dsa_learning;
CREATE USER dsa_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE dsa_learning TO dsa_user;
\c dsa_learning
GRANT ALL PRIVILEGES ON SCHEMA public TO dsa_user;
EOF

# 3. Create .env file in backend/
cat > backend/.env << EOF
DATABASE_URL="postgresql://dsa_user:secure_password@localhost:5432/dsa_learning"
PORT=4000
NODE_ENV=development
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:3000
EOF

# 4. Run Prisma migrations
cd backend
npx prisma migrate dev --name init

# 5. Verify (opens Prisma Studio at http://localhost:5555)
npx prisma studio
```

#### Option B: Docker PostgreSQL (Quick Start)

```bash
# Start PostgreSQL in Docker
docker run -d \
  --name postgres-dsa \
  -e POSTGRES_USER=dsa_user \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=dsa_learning \
  -p 5432:5432 \
  postgres:15-alpine

# Create .env and run migrations (same as Option A steps 3-5)
```

#### Option C: Using docker-compose

```bash
# Uncomment database service in docker-compose.yml
# Then run:
docker-compose up postgres

# Create .env file
cat > backend/.env << EOF
DATABASE_URL="postgresql://dsa_user:secure_password@postgres:5432/dsa_learning"
PORT=4000
NODE_ENV=development
JWT_SECRET=dev_secret_key
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:3000
EOF

# Run migrations
cd backend
npx prisma migrate dev --name init
```

### Step 3: Verify TypeScript Compilation (3 minutes)

```bash
# Frontend TypeScript check
cd frontend
npm run type-check

# Backend TypeScript compilation
cd ../backend
npm run build

# Should complete without errors
```

### Step 4: Start Development Servers (2 minutes)

```bash
# Terminal 1: Backend (with hot-reload via ts-node)
cd backend
npm run dev
# Output: 🚀 Backend server running on http://localhost:4000

# Terminal 2: Frontend (with Vite HMR)
cd frontend
npm run dev
# Output: VITE v5.0.0 ready in 234 ms ➜ http://localhost:3000
```

### Step 5: Test Everything Works (2 minutes)

```bash
# Test health endpoint
curl http://localhost:4000/api/health
# Expected: {"success":true,"data":{"ok":true},"message":"Server is running"}

# Test lessons endpoint
curl http://localhost:4000/api/lessons
# Expected: {"success":true,"data":{"lessons":[...]},...}

# Open frontend
open http://localhost:3000
# Should see DSA Learning Platform with lessons loaded
```

## Project Structure

```
DSA/
├── backend/
│   ├── src/
│   │   ├── index.ts          # Main server
│   │   ├── types/
│   │   │   └── index.ts      # TypeScript interfaces
│   │   └── middleware/
│   │       ├── errorHandler.ts
│   │       └── authMiddleware.ts
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── dist/                 # Compiled JS (built via npm run build)
│   ├── tsconfig.json
│   ├── package.json
│   └── .env                  # Your local config (git ignored)
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx          # Entry point
│   │   ├── App.tsx           # Root component
│   │   ├── types/
│   │   │   └── index.ts      # TypeScript types
│   │   ├── services/
│   │   │   └── api.ts        # Typed API client
│   │   └── styles/
│   ├── vite.config.ts        # Vite configuration
│   ├── tsconfig.json
│   ├── package.json
│   └── index.html
│
├── docs/
│   ├── TYPESCRIPT_MIGRATION.md  # Complete TypeScript guide
│   ├── DATABASE_SETUP.md         # Database setup guide
│   └── architecture.md
│
├── Dockerfile                    # Production build
├── Dockerfile.dev                # Development build
├── docker-compose.yml            # Production compose
├── docker-compose.dev.yml        # Development compose
└── package.json                  # Root monorepo config
```

## Common Commands

### Development

```bash
# Terminal 1: Backend
cd backend
npm run dev              # Run with ts-node + nodemon

# Terminal 2: Frontend
cd frontend
npm run dev              # Run Vite dev server

# Terminal 3: View database
cd backend
npx prisma studio       # Open admin UI at http://localhost:5555
```

### TypeScript

```bash
# Type checking (doesn't compile)
npm run type-check

# Build TypeScript to JavaScript
npm run build

# Linting
npm run lint
```

### Database

```bash
cd backend

# Create new migration after schema change
npx prisma migrate dev --name <description>

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# View migration status
npx prisma migrate status

# Seed database
npx prisma db seed
```

### Docker

```bash
# Production build
docker build -t dsa-app:latest .
docker run -p 4000:4000 dsa-app:latest

# Development with compose
docker-compose -f docker-compose.dev.yml up

# Production with compose
docker-compose up
```

## Environment Variables

Create `backend/.env`:

```bash
# REQUIRED
DATABASE_URL="postgresql://user:password@localhost:5432/dsa_learning"
PORT=4000
JWT_SECRET=your_secret_key

# OPTIONAL
NODE_ENV=development
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:3000
```

## Troubleshooting

### Backend won't start

```bash
# Check TypeScript compilation
cd backend
npm run build

# Check if port 4000 is in use
lsof -i :4000

# Check database connection
npx ts-node src/testConnection.ts
```

### Frontend won't load

```bash
# Check port 3000 availability
lsof -i :3000

# Rebuild dependencies
rm -rf node_modules package-lock.json
npm run install:all

# Check TypeScript types
npm run type-check
```

### Database connection error

```bash
# Check PostgreSQL is running
brew services list

# Test connection
psql -U dsa_user -d dsa_learning -h localhost

# Check .env has correct URL
cat backend/.env | grep DATABASE_URL
```

### Prisma migrations fail

```bash
# Reset Prisma Client
rm -rf backend/node_modules/.prisma

# Regenerate
npx prisma generate

# Try migration again
npx prisma migrate dev
```

## What's Next?

1. ✅ Project setup with TypeScript
2. ✅ Database connected with Prisma
3. ✅ Backend running with hot-reload
4. ✅ Frontend with React + TypeScript
5. 📝 Next: Build API routes with controllers
6. 📝 Next: Add authentication (JWT)
7. 📝 Next: Create React components
8. 📝 Next: Implement problem solving interface
9. 📝 Next: Add testing (Jest/Vitest)
10. 📝 Next: Deploy to production

## Documentation Files

- **TYPESCRIPT_MIGRATION.md** — Full TypeScript setup details and backend architecture
- **DATABASE_SETUP.md** — PostgreSQL & Prisma setup guide (500+ lines)
- **DOCKER.md** — Docker and containerization guide
- **architecture.md** — Overall project architecture and roadmap
- **INSTRUCTIONS.md** — Development conventions and best practices
- **.github/copilot-instructions.md** — AI agent guidelines

## Key Files to Review

```bash
# Backend
cat backend/tsconfig.json          # TypeScript config
cat backend/src/index.ts           # Server entry point
cat backend/src/types/index.ts     # All types/interfaces
cat backend/prisma/schema.prisma   # Database schema

# Frontend
cat frontend/tsconfig.json         # TypeScript config
cat frontend/src/main.tsx          # Entry point
cat frontend/src/App.tsx           # Main component
cat frontend/src/services/api.ts   # API client

# Config
cat .env.example                   # Environment template
cat docker-compose.yml             # Production compose
```

## Support

For detailed information:
- TypeScript setup → See `docs/TYPESCRIPT_MIGRATION.md`
- Database issues → See `docs/DATABASE_SETUP.md`
- Docker setup → See `docs/DOCKER.md`
- Architecture → See `docs/architecture.md`
- Backend patterns → See `docs/INSTRUCTIONS.md`

