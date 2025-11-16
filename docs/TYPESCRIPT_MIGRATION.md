# TypeScript Migration & Backend Enhancement Guide

## Overview

This document outlines the complete TypeScript migration and backend architectural improvements for the DSA Learning Platform.

## Phase 1: TypeScript Setup ✅

### 1.1 Backend TypeScript Configuration

**Files Created:**
- `backend/tsconfig.json` — Strict TypeScript configuration
- `backend/src/types/index.ts` — Core types and interfaces
- `backend/src/index.ts` — Main server file (converted from .js)
- `backend/src/middleware/errorHandler.ts` — Error handling
- `backend/src/middleware/authMiddleware.ts` — Auth middleware
- `backend/package.json` — Updated with TypeScript dependencies

**Key Dependencies:**
```json
{
  "@types/cors": "^2.8.17",
  "@types/express": "^4.17.21",
  "@types/node": "^20.10.5",
  "typescript": "^5.3.3",
  "ts-node": "^10.9.2",
  "@typescript-eslint/eslint-plugin": "^6.15.0"
}
```

### 1.2 Frontend TypeScript Configuration

**Files Created:**
- `frontend/tsconfig.json` — React + JSX TypeScript config
- `frontend/tsconfig.node.json` — Vite config TypeScript
- `frontend/src/types/index.ts` — Frontend types and interfaces
- `frontend/src/main.tsx` — Entry point (converted from .jsx)
- `frontend/src/App.tsx` — App component (converted from .jsx)
- `frontend/src/services/api.ts` — Typed API client
- `frontend/vite.config.ts` — Vite config (converted from .js)
- `frontend/package.json` — Updated with TypeScript dependencies

**Key Dependencies:**
```json
{
  "@types/react": "^18.2.37",
  "@types/react-dom": "^18.2.15",
  "typescript": "^5.3.3"
}
```

## Phase 2: Backend Architecture Enhancement

### 2.1 Project Structure

```
backend/
├── src/
│   ├── index.ts              # Main entry point
│   ├── types/
│   │   └── index.ts          # Core types and interfaces
│   ├── middleware/
│   │   ├── errorHandler.ts   # Error handling middleware
│   │   └── authMiddleware.ts # JWT authentication
│   ├── routes/               # Route definitions (to be created)
│   ├── controllers/          # Request handlers (to be created)
│   ├── services/             # Business logic (to be created)
│   ├── models/               # Prisma models (to be created)
│   └── utils/                # Utility functions (to be created)
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── tsconfig.json
└── package.json
```

### 2.2 Type-First Development

**Core Interfaces (backend/src/types/index.ts):**

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface User {
  id: string
  email: string
  username: string
  role: 'student' | 'instructor' | 'admin'
}

interface Lesson {
  id: string
  title: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  content: string
}

interface JwtPayload {
  userId: string
  email: string
  role: string
}
```

### 2.3 Middleware Architecture

**Error Handling:**
```typescript
// All errors centralized and typed
export class AppError extends Error {
  constructor(message: string, statusCode: number = 500)
}

// Express middleware with proper typing
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => { /* ... */ }
```

**Authentication:**
```typescript
// JWT verification middleware
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => { /* ... */ }

// Role-based access control
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {}
export const isInstructor = (req: AuthRequest, res: Response, next: NextFunction) => {}
```

## Phase 3: Frontend Enhancement

### 3.1 Frontend Project Structure

```
frontend/
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Root component
│   ├── types/
│   │   └── index.ts          # Frontend types
│   ├── services/
│   │   └── api.ts            # Typed API client
│   ├── components/           # Reusable components (to be created)
│   │   ├── Header.tsx
│   │   ├── Navigation.tsx
│   │   ├── LessonCard.tsx
│   │   └── ...
│   ├── pages/                # Page components (to be created)
│   │   ├── HomePage.tsx
│   │   ├── LessonPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ...
│   ├── hooks/                # Custom React hooks (to be created)
│   │   ├── useAuth.ts
│   │   ├── useLessons.ts
│   │   └── ...
│   ├── contexts/             # React contexts (to be created)
│   │   ├── AuthContext.tsx
│   │   └── LessonContext.tsx
│   └── styles/
│       ├── global.css
│       └── components.css
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### 3.2 Typed API Client (frontend/src/services/api.ts)

```typescript
// Centralized, typed API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Generic error handling
  // Auto-injects auth token
  // Type-safe responses
}

// Specific endpoints with return types
export async function getLessons(): Promise<LessonsData> { }
export async function login(email: string, password: string): Promise<{ token: string; user: User }> { }
export async function submitSolution(problemId: number, code: string): Promise<{ passed: boolean }> { }
```

### 3.3 Custom Hooks Pattern

```typescript
// hooks/useAuth.ts
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  const login = async (email: string, password: string) => {
    const { token, user } = await apiService.login(email, password)
    localStorage.setItem('authToken', token)
  }
  
  return { user, loading, login, logout }
}
```

## Phase 4: Database Setup (PostgreSQL)

### 4.1 Installation & Setup

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

### 4.2 Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE dsa_learning;
CREATE USER dsa_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE dsa_learning TO dsa_user;

# Verify
\l  # List databases
\du # List users
```

### 4.3 Prisma Setup

```bash
# Install Prisma
npm install -D prisma @prisma/client

# Initialize Prisma
npx prisma init

# Update .env with database URL
DATABASE_URL="postgresql://dsa_user:secure_password@localhost:5432/dsa_learning"

# Create schema
# (see prisma/schema.prisma section below)

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 4.4 Prisma Schema (backend/prisma/schema.prisma)

```prisma
// This will be created in next step

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String     @id @default(cuid())
  email     String     @unique
  username  String     @unique
  password  String     // Hash this!
  role      UserRole   @default(STUDENT)
  lessons   Lesson[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  @@index([email])
}

model Lesson {
  id          String      @id @default(cuid())
  title       String
  description String
  difficulty  Difficulty
  category    String
  content     String
  author      User        @relation(fields: [authorId], references: [id])
  authorId    String
  problems    Problem[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([authorId])
}

model Problem {
  id          String      @id @default(cuid())
  title       String
  description String
  difficulty  Difficulty
  initialCode String
  lesson      Lesson      @relation(fields: [lessonId], references: [id])
  lessonId    String
  testCases   TestCase[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([lessonId])
}

model TestCase {
  id        String  @id @default(cuid())
  input     String
  output    String
  problem   Problem @relation(fields: [problemId], references: [id])
  problemId String
  createdAt DateTime @default(now())

  @@index([problemId])
}

enum UserRole {
  STUDENT
  INSTRUCTOR
  ADMIN
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}
```

## Phase 5: Backend Services Layer

### 5.1 Services Directory Structure

```
backend/src/services/
├── index.ts              # Export all services
├── userService.ts        # User CRUD operations
├── lessonService.ts      # Lesson CRUD operations
├── problemService.ts     # Problem CRUD operations
└── authService.ts        # Authentication logic
```

### 5.2 Example Service (userService.ts)

```typescript
import { PrismaClient } from '@prisma/client'
import type { User } from '../types/index.js'

const prisma = new PrismaClient()

export class UserService {
  static async createUser(
    email: string,
    username: string,
    hashedPassword: string
  ): Promise<User> {
    return prisma.user.create({
      data: { email, username, password: hashedPassword }
    })
  }

  static async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id }
    })
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email }
    })
  }
}
```

## Phase 6: Routes & Controllers

### 6.1 Controllers Directory

```
backend/src/controllers/
├── index.ts
├── userController.ts
├── lessonController.ts
├── problemController.ts
└── authController.ts
```

### 6.2 Example Controller

```typescript
import { Request, Response } from 'express'
import { UserService } from '../services/userService.js'
import { asyncHandler } from '../middleware/errorHandler.js'

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password } = req.body
  const user = await UserService.createUser(email, username, password)
  res.status(201).json({ success: true, data: user })
})
```

### 6.3 Routes Structure

```
backend/src/routes/
├── index.ts              # Combine all routes
├── authRoutes.ts         # /api/auth/*
├── userRoutes.ts         # /api/users/*
├── lessonRoutes.ts       # /api/lessons/*
└── problemRoutes.ts      # /api/problems/*
```

## Installation Steps (Quick Reference)

### Backend TypeScript Setup

```bash
cd backend
npm install
npm run build
npm run dev
```

### Frontend TypeScript Setup

```bash
cd frontend
npm install
npm run dev
```

### Database Setup

```bash
# PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Prisma
npm install -D prisma @prisma/client
npx prisma init
# Update .env
npx prisma migrate dev --name init
```

### Run All Together

```bash
npm run install:all
npm run start
```

## Development Commands

```bash
# Backend
npm run build              # Compile TypeScript
npm run dev               # Run with nodemon + ts-node
npm run lint              # Run ESLint
npm run type-check        # TypeScript check

# Frontend
npm run dev               # Vite dev server
npm run build             # Build production
npm run type-check        # TypeScript check
npm run lint              # Run ESLint

# Database
npx prisma studio        # Prisma Admin UI
npx prisma migrate dev   # Run migrations
npx prisma seed          # Seed database
```

## Next Steps

1. Install dependencies: `npm run install:all`
2. Set up PostgreSQL and database
3. Create Prisma schema and run migrations
4. Implement services layer
5. Create controllers and routes
6. Add authentication with JWT
7. Build React components and pages
8. Add testing (Jest, Vitest)
9. Set up CI/CD pipeline

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js with TypeScript](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
