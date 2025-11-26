# DSA Learning Platform

Data Structures and Algorithms online learning platform built with **TypeScript**, **React**, **Express**, and **PostgreSQL**.

## 📊 Project Status - Phase 2 (100% Complete) ✅

### ✅ Completed (As of Nov 26, 2025)
- **Backend**: 100% - Custom Docker execution service, submission APIs, database integration
- **Frontend**: 100% - Monaco code editor, problem dashboard, split-view interface
- **Infrastructure**: 100% - Docker containers for Node, Python, C++, Java
- **Testing**: 100% - Integration tests verified end-to-end flow

### 🎉 Phase 2 Complete!
- **Custom Code Execution Engine** implemented
- **Secure Docker Isolation** for 4 languages
- **Real-time Grading System** with test cases
- **Modern Problem Solving Interface** with dark mode

### 🚀 Ready for Phase 3: Content Management
- Admin dashboard
- Lesson creation tools
- Problem management interface
- Markdown editor integration

---

## 🚀 Quick Start

See **[docs/guides/SETUP_TYPESCRIPT.md](./docs/guides/SETUP_TYPESCRIPT.md)** for the complete 5-step setup guide (20 minutes).

```bash
# 1. Install all dependencies
npm run install:all

# 2. Set up PostgreSQL database
# See docs/guides/SETUP_TYPESCRIPT.md for detailed steps

# 3. Start backend (Terminal 1)
cd backend && npm run dev

# 4. Start frontend (Terminal 2)
cd frontend && npm run dev

# 5. Open browser to http://localhost:3000
```

## 📚 Documentation Structure

All documentation is organized for easy navigation. **[Read the documentation management guide](./docs/DOCUMENTATION_MANAGEMENT.md)** to understand the structure.

### 🔗 Quick Links

**Setup & Getting Started:**
- **[docs/guides/SETUP_TYPESCRIPT.md](./docs/guides/SETUP_TYPESCRIPT.md)** ⭐ Full setup guide (Start here!)
- **[docs/guides/DATABASE_SETUP.md](./docs/guides/DATABASE_SETUP.md)** - Database configuration
- **[docs/guides/architecture.md](./docs/guides/architecture.md)** - System architecture

**API Documentation:**
- **[Interactive Swagger UI](http://localhost:4000/api/docs)** - Test APIs in browser
- **[docs/api/API_DEVELOPMENT_GUIDE.md](./docs/api/API_DEVELOPMENT_GUIDE.md)** - Complete API reference
- **[docs/api/openapi.yaml](./docs/api/openapi.yaml)** - OpenAPI 3.0 specification

**Frontend Components:**
- **[docs/guides/FRONTEND_COMPONENTS_GUIDE.md](./docs/guides/FRONTEND_COMPONENTS_GUIDE.md)** - React components reference
- **[docs/guides/FRONTEND_API_SERVICE_GUIDE.md](./docs/guides/FRONTEND_API_SERVICE_GUIDE.md)** - API client guide

**Documentation Management:**
- **[docs/DOCUMENTATION_MANAGEMENT.md](./docs/DOCUMENTATION_MANAGEMENT.md)** - How docs are organized
- **[progress/CURRENT.md](./progress/CURRENT.md)** - Today's progress
- **[progress/README.md](./progress/README.md)** - Daily progress tracking

**Other Resources:**
- **[DOCKER.md](./DOCKER.md)** - Docker setup
- **[docs/guides/INSTRUCTIONS.md](./docs/guides/INSTRUCTIONS.md)** - Development instructions

## 📚 Project Documentation

**For TypeScript Setup & Backend Architecture:**
- **[SETUP_TYPESCRIPT.md](./docs/guides/SETUP_TYPESCRIPT.md)** ⭐ **Start here for full setup**
  - 5-step quick start guide
  - Environment setup
  - Troubleshooting

- **[docs/TYPESCRIPT_MIGRATION.md](./docs/migration/TYPESCRIPT_MIGRATION.md)**
  - Complete TypeScript configuration
  - Backend architecture details
  - Type-safe patterns
  - Frontend structure

**For Database Setup:**
- **[docs/DATABASE_SETUP.md](./docs/migration/DATABASE_SETUP.md)**
  - PostgreSQL installation
  - Prisma ORM setup
  - Migration workflows
  - Connection troubleshooting

**For Containerization:**
- **[DOCKER.md](./DOCKER.md)**
  - Production Docker builds
  - Development with docker-compose
  - Multi-stage builds for TypeScript

**For General Architecture:**
- **[docs/architecture.md](./docs/guides/architecture.md)**
  - Project overview and design decisions
  - Roadmap and next steps

**For Development:**
- **[docs/INSTRUCTIONS.md](./docs/guides/INSTRUCTIONS.md)**
  - Coding conventions
  - Frontend/backend patterns
  - PR checklist

## 🛠️ Tech Stack

### Backend
- **TypeScript** - Type-safe JavaScript
- **Express.js** - Web server and routing
- **PostgreSQL** - Relational database
- **Prisma** - Modern ORM with TypeScript support
- **ts-node** - TypeScript execution for development
- **ESLint** - Code linting

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe components
- **Vite** - Fast build tool and dev server
- **React Fast Refresh** - HMR support

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nodemon** - Auto-restart on file changes

## 📁 Project Structure

```
DSA/
├── backend/                          # TypeScript Express API
│   ├── src/
│   │   ├── index.ts                 # Main server entry
│   │   ├── types/index.ts           # Shared types & interfaces
│   │   ├── middleware/              # Error & auth middleware
│   │   ├── routes/                  # Route definitions (todo)
│   │   ├── controllers/             # Request handlers (todo)
│   │   ├── services/                # Business logic (todo)
│   │   └── models/                  # Database queries (todo)
│   ├── prisma/
│   │   └── schema.prisma            # Database schema
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/                         # React + Vite app
│   ├── src/
│   │   ├── main.tsx                 # Entry point
│   │   ├── App.tsx                  # Root component
│   │   ├── types/index.ts           # Frontend types
│   │   ├── services/api.ts          # Typed API client
│   │   ├── components/              # React components (todo)
│   │   ├── pages/                   # Page components (todo)
│   │   └── styles/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── docs/
│   ├── TYPESCRIPT_MIGRATION.md       # TypeScript setup details
│   ├── DATABASE_SETUP.md             # Database guide
│   ├── architecture.md
│   └── INSTRUCTIONS.md
│
├── Dockerfile                        # Production build
├── docker-compose.yml                # Production compose
├── DOCKER.md                         # Docker guide
├── SETUP_TYPESCRIPT.md               # Quick start guide
└── README.md                         # This file
```

## 🚦 Development Workflow

### Start Development Servers

```bash
# Terminal 1: Backend (TypeScript with hot-reload)
cd backend
npm run dev

# Terminal 2: Frontend (Vite dev server)
cd frontend
npm run dev

# Terminal 3 (optional): View database
cd backend
npx prisma studio
```

### TypeScript Type Checking

```bash
# Type check without building
npm run type-check

# Lint code
npm run lint

# Build TypeScript to JavaScript
npm run build
```

### Database Migrations

```bash
cd backend

# Create new migration after schema changes
npx prisma migrate dev --name <description>

# Apply migrations in production
npx prisma migrate deploy

# View migration history
npx prisma migrate status

# Reset database (dev only - deletes all data)
npx prisma migrate reset
```

## 🐳 Docker Usage

### Development with Docker

```bash
# Run all services (frontend, backend, database)
docker-compose -f docker-compose.dev.yml up

# Backend: http://localhost:4000
# Frontend: http://localhost:3000
# Database: postgres://localhost:5432
```

### Production Build

```bash
# Build image
docker build -t dsa-app:latest .

# Run container
docker run -p 4000:4000 dsa-app:latest
```

See **[DOCKER.md](./DOCKER.md)** for more options.

## 📋 API Endpoints

### Current Endpoints
- `GET /api/health` - Health check
- `GET /api/lessons` - List all lessons
- `GET /api/lessons/:id` - Get lesson by ID

### Coming Soon
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/problems` - List problems
- `POST /api/problems/submit` - Submit solution
- `GET /api/users/:id/progress` - User progress

See **[docs/TYPESCRIPT_MIGRATION.md](./docs/TYPESCRIPT_MIGRATION.md#phase-6-routes--controllers)** for implementing new endpoints.

## 🗄️ Database Schema

The project uses **PostgreSQL** with **Prisma ORM**.

**Models:**
- `User` - Student, instructor, admin accounts
- `Lesson` - DSA learning content
- `Problem` - Coding challenges
- `TestCase` - Test cases for problems
- `Submission` - User code submissions
- `UserProgress` - Track user progress

See **[backend/prisma/schema.prisma](./backend/prisma/schema.prisma)** for full schema.

## 🔐 Environment Variables

Create `backend/.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dsa_learning"
PORT=4000
NODE_ENV=development
JWT_SECRET=dev_secret_key
JWT_EXPIRY=24h
CORS_ORIGIN=http://localhost:3000
```

See [docs/DATABASE_SETUP.md](./docs/DATABASE_SETUP.md#step-3-configure-environment-variables) for examples.

## 📚 Learning Path

**Phase 1: Setup** ✅
- TypeScript configuration
- Database setup with Prisma
- Basic API endpoints

**Phase 2: API Development**
- User authentication (JWT)
- Lesson CRUD operations
- Problem management

**Phase 3: Frontend**
- React components
- State management
- Problem solver interface

**Phase 4: Features**
- Code execution/sandbox
- Progress tracking
- Admin dashboard

**Phase 5: Production**
- Testing (Jest, Vitest)
- CI/CD pipeline
- Deployment

See **[docs/architecture.md](./docs/architecture.md)** for the full roadmap.

## 🛣️ Implementation Roadmap

**Current Status:** Phase 1 MVP - 100% Complete ✅ (Day 6 of 17)

### Phase 1: Core MVP ✅ (100% - COMPLETE)
- [x] Backend database & APIs (100% ✅)
- [x] User authentication (100% ✅)
- [x] Frontend authentication UI (100% ✅)
- [x] Lesson browsing interface (100% ✅)
- [x] React Router implementation (100% ✅)
- [x] Protected routes (100% ✅)
- [x] Error boundary & toast notifications (100% ✅)

**Timeline:** Week 1 of 4 completed  
**Status:** ✅ Ready for Phase 2

### Phase 2: Interactivity (100% - COMPLETE) ✅
- [x] Code editor integration (Monaco Editor) (100% ✅)
- [x] Problem submission API (100% ✅)
- [x] Custom Docker execution engine (100% ✅)
- [x] Test case execution display (100% ✅)
- [x] User progress tracking (100% ✅)

**Status:** ✅ Ready for Phase 3

**Starts:** After Phase 1 completion

### Phase 3: Content Management (2-3 weeks)
- [ ] Admin dashboard
- [ ] Lesson creation/editing forms
- [ ] Problem template builder
- [ ] Markdown editor integration

**Starts:** After Phase 2 completion

### Phase 4: Production Deployment (2 weeks)
- [ ] GitHub Actions CI/CD
- [ ] Docker optimization
- [ ] Error tracking & logging
- [ ] Security hardening

**For Complete Roadmap:** See **[docs/planning/ENHANCEMENT_PLAN.md](./docs/planning/ENHANCEMENT_PLAN.md)**

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/description`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/description`
4. Open a pull request

See **[docs/INSTRUCTIONS.md](./docs/INSTRUCTIONS.md)** for coding conventions.

## 📝 License

MIT License - See [LICENSE](./LICENSE)

## 🆘 Help & Support

**Quick Issues:**
- Backend won't start → See **[SETUP_TYPESCRIPT.md](./SETUP_TYPESCRIPT.md#troubleshooting)**
- Database error → See **[docs/DATABASE_SETUP.md](./docs/DATABASE_SETUP.md#troubleshooting)**
- Docker issues → See **[DOCKER.md](./DOCKER.md#notes)**

**Questions:**
1. Check relevant documentation file
2. Review `.github/copilot-instructions.md` for AI agent guidance
3. Open an issue on GitHub
- **[docs/ARCHITECTURE_ENHANCEMENT_PLAN.md](./docs/ARCHITECTURE_ENHANCEMENT_PLAN.md)**
  - Frontend design architecture with futuristic theme
  - Backend modular architecture
  - Database schema design
  - Full 9-phase roadmap

- **[docs/DATABASE_SETUP_GUIDE.md](./docs/DATABASE_SETUP_GUIDE.md)**
  - PostgreSQL installation (all OS)
  - Prisma ORM setup
  - Complete schema definition
  - Seed data configuration

- **[docs/BACKEND_ENHANCEMENT_GUIDE.md](./docs/BACKEND_ENHANCEMENT_GUIDE.md)**
  - 14 complete ready-to-use backend files
  - Services, controllers, middleware implementation
  - API endpoint documentation
  - Testing examples

- **[docs/FRONTEND_API_SERVICE_GUIDE.md](./docs/FRONTEND_API_SERVICE_GUIDE.md)**
  - Axios-based API client service
  - Authentication context with token management
  - Custom React hooks
  - Usage examples

- **[.github/copilot-instructions.md](./.github/copilot-instructions.md)**
  - AI agent guidelines
  - Project conventions and patterns

- **[DOCKER.md](./DOCKER.md)**
  - Docker & containerization setup
  - Local development with containers

## What's New

### Frontend (Phase 1 Complete)
- ✅ Beautiful futuristic landing page with hero section
- ✅ Interactive features showcase
- ✅ Testimonials carousel
- ✅ Pricing plans comparison
- ✅ Login/Signup modals
- ✅ Glass-morphism design with gradients
- ✅ Smooth animations and transitions
- ✅ Fully responsive layout

### Backend (Ready for Phase 1)
- ✅ Modular folder structure
- ✅ JWT authentication
- ✅ Role-based access control
- ✅ Error handling middleware
- ✅ API versioning (/api/v1/*)
- ✅ Request validation
- ✅ Database integration ready

### Database (PostgreSQL + Prisma)
- ✅ 8 data models defined
- ✅ User roles and authentication
- ✅ Lesson and problem tracking
- ✅ Progress tracking
- ✅ Testimonials and submissions
- ✅ Complete migrations setup

### API Endpoints (Phase 1)
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/lessons` - List lessons
- `GET /api/v1/lessons/:id` - Lesson details
- `POST /api/v1/lessons` - Create lesson (instructor)

## Quick Start for Phase 1

```bash
# 1. Setup database (see DATABASE_SETUP_GUIDE.md)
# 2. Install backend dependencies
cd backend
npm install @prisma/client bcryptjs jsonwebtoken axios

# 3. Create database and run migrations
npx prisma migrate dev --name init
npx prisma db seed

# 4. Create backend structure
# (Follow BACKEND_ENHANCEMENT_GUIDE.md - copy 14 files provided)

# 5. Install frontend dependencies
cd ../frontend
npm install axios

# 6. Create frontend services
# (Follow FRONTEND_API_SERVICE_GUIDE.md - copy 4 files provided)

# 7. Start development
npm run start:backend
npm run start:frontend
```

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for complete Phase 1 checklist.

## Docker Setup

For containerized development and deployment:

```bash
# Development with hot-reload
docker compose -f docker-compose.dev.yml up

# Production build and run
docker build -t dsa-app:latest .
docker compose up
```

See [DOCKER.md](./DOCKER.md) for detailed container setup.

## Docker Setup

For containerized development and deployment, see [DOCKER.md](./DOCKER.md).

**Quick start with Docker:**

```bash
# Production build and run
docker build -t dsa-app:latest .
docker run -p 4000:4000 dsa-app:latest

# Or with docker-compose
docker compose up

# Development with hot-reload
docker compose -f docker-compose.dev.yml up
```

See `docs/architecture.md` for full architecture notes and next steps.
