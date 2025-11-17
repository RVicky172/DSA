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
