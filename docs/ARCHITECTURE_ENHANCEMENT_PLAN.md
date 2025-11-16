# DSA Learning Platform - Architecture Enhancement Plan

## Table of Contents
1. [Frontend Design Architecture](#frontend-design-architecture)
2. [Backend Architecture Enhancement](#backend-architecture-enhancement)
3. [Database Strategy](#database-strategy)
4. [Implementation Roadmap](#implementation-roadmap)

---

## Frontend Design Architecture

### Design Philosophy: Futuristic Gradient + Glass-Morphism

**Color Palette:**
- Primary Gradient: `#1f2937` → `#0f172a` (dark slate)
- Accent: `#00d4ff` (cyan), `#00f5ff` (bright cyan)
- Secondary: `#8b5cf6` (purple), `#ec4899` (pink)
- Background: `#0f172a` (dark navy)
- Text: `#f8fafc` (off-white)

**Key Design Elements:**
- Animated gradients and mesh backgrounds
- Glass-morphism cards with blur and transparency
- Glowing text effects and neon accents
- Smooth transitions and micro-interactions
- Responsive grid layouts

### Folder Structure

```
frontend/src/
├── components/
│   ├── common/
│   │   ├── Navbar.jsx              (header with logo, nav links, auth buttons)
│   │   ├── Footer.jsx              (footer with links, social)
│   │   └── Modal.jsx               (reusable modal component)
│   ├── auth/
│   │   ├── LoginModal.jsx          (login form)
│   │   ├── SignupModal.jsx         (signup form)
│   │   └── AuthGuard.jsx           (protected routes)
│   ├── sections/
│   │   ├── Hero.jsx                (landing page hero)
│   │   ├── Features.jsx            (feature showcase)
│   │   ├── Testimonials.jsx        (user testimonials with carousel)
│   │   ├── Subscription.jsx        (pricing plans)
│   │   └── CTA.jsx                 (call-to-action section)
│   └── cards/
│       ├── LessonCard.jsx          (lesson preview)
│       ├── ProblemCard.jsx         (problem preview)
│       └── TestimonialCard.jsx     (testimonial card)
├── pages/
│   ├── Landing.jsx                 (home page)
│   ├── Dashboard.jsx               (user dashboard)
│   ├── Lessons.jsx                 (lessons list)
│   ├── LessonDetail.jsx            (individual lesson)
│   ├── Profile.jsx                 (user profile)
│   └── NotFound.jsx                (404 page)
├── services/
│   └── api.js                      (centralized API client with axios)
├── context/
│   └── AuthContext.jsx             (global auth state)
├── hooks/
│   ├── useAuth.js                  (auth hook)
│   └── useFetch.js                 (data fetching hook)
├── styles/
│   ├── index.css                   (global styles)
│   ├── animations.css              (keyframe animations)
│   ├── theme.css                   (color variables and utilities)
│   └── components.css              (component-specific styles)
├── utils/
│   └── constants.js                (API endpoints, config)
└── App.jsx                         (main app with routing)
```

### Page Structure

#### Landing Page Components
1. **Navbar** - Fixed header with:
   - Logo/Brand name
   - Navigation links (Features, Testimonials, Pricing)
   - Login/Signup buttons
   - Mobile menu toggle

2. **Hero Section** - Animated welcome area:
   - Animated gradient text title
   - Subtitle with typing effect
   - CTA buttons (Get Started, Explore)
   - Animated background shapes

3. **Features Section** - Grid of 6 features:
   - Interactive hover effects
   - Icons with glow effects
   - Feature descriptions

4. **Testimonials Section** - Carousel of user reviews:
   - Profile images, names, roles
   - Star ratings
   - Quote text
   - Smooth carousel navigation

5. **Subscription Section** - 3 pricing plans:
   - Basic (Free)
   - Pro (Monthly)
   - Enterprise (Custom)
   - Feature comparison
   - Popular badge on Pro tier

6. **CTA & Footer** - Action buttons and links

### Authentication Flow

```
Landing Page
    ↓
Login/Signup Modal
    ↓
API Validation (backend)
    ↓
JWT Token → localStorage
    ↓
Dashboard (Protected Route)
```

### Component State Management

**Using React Context + Hooks:**
- `AuthContext` - stores user, token, loading state
- `useAuth()` - custom hook for auth operations
- `useFetch()` - custom hook for API calls with loading/error states

---

## Backend Architecture Enhancement

### Current State → Enhanced State

**Current:** Single-file Express server with hardcoded sample data
**Enhanced:** Modular structure with authentication, database, and API versioning

### Folder Structure

```
backend/src/
├── index.js                        (entry point)
├── config/
│   └── database.js                 (Prisma client initialization)
├── middleware/
│   ├── auth.js                     (JWT verification)
│   ├── errorHandler.js             (centralized error handling)
│   └── validation.js               (request validation)
├── routes/
│   ├── index.js                    (route aggregator)
│   ├── auth.routes.js              (signup, login, refresh)
│   ├── lessons.routes.js           (GET, POST lessons)
│   ├── problems.routes.js          (problem endpoints)
│   └── users.routes.js             (user profile, settings)
├── controllers/
│   ├── authController.js           (auth logic)
│   ├── lessonController.js         (lesson operations)
│   ├── problemController.js        (problem operations)
│   └── userController.js           (user operations)
├── services/
│   ├── authService.js              (JWT, password hashing)
│   ├── lessonService.js            (lesson business logic)
│   └── emailService.js             (email notifications - future)
├── models/
│   └── schema.prisma               (database schema)
├── utils/
│   ├── logger.js                   (logging utility)
│   └── constants.js                (API constants)
└── .env.example                    (environment variables template)
```

### API Versioning Strategy

**Endpoint Format:** `/api/v1/{resource}/{action}`

**Examples:**
- `POST /api/v1/auth/signup`
- `POST /api/v1/auth/login`
- `GET /api/v1/lessons`
- `POST /api/v1/lessons` (admin only)
- `GET /api/v1/users/profile`

### Authentication Strategy

**JWT Implementation:**
- Token stored in `localStorage` (client-side)
- Refresh token rotation
- Short-lived access tokens (15 min)
- Longer-lived refresh tokens (7 days)

**Middleware Flow:**
```
Request
    ↓
Check Authorization header
    ↓
Verify JWT
    ↓
Extract user ID
    ↓
Attach user to request
    ↓
Handler
```

### Error Handling

**Centralized Error Handler:**
```javascript
{
  success: false,
  code: "AUTH_INVALID_CREDENTIALS",
  message: "Invalid email or password",
  statusCode: 401
}
```

---

## Database Strategy

### Why PostgreSQL + Prisma?

1. **PostgreSQL:**
   - Production-ready relational DB
   - Excellent for structured data
   - ACID compliance
   - Great performance with proper indexing

2. **Prisma ORM:**
   - Type-safe database access
   - Auto-generated migrations
   - Easy relationship management
   - Built-in validation

### Data Models

#### User
```prisma
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  password          String    (hashed)
  firstName         String?
  lastName          String?
  avatar            String?
  role              UserRole  @default(STUDENT)
  subscription      String    @default("free")  // free, pro, enterprise
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  lessons           Lesson[]
  progress          Progress[]
  testimonial       Testimonial?
}

enum UserRole {
  STUDENT
  INSTRUCTOR
  ADMIN
}
```

#### Lesson
```prisma
model Lesson {
  id                String    @id @default(cuid())
  title             String
  description       String
  difficulty        Difficulty
  content           String    (markdown)
  topics            String[]
  createdBy         String
  creator           User      @relation(fields: [createdBy], references: [id])
  problems          Problem[]
  progress          Progress[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}
```

#### Problem
```prisma
model Problem {
  id                String    @id @default(cuid())
  title             String
  description       String
  lessonId          String
  lesson            Lesson    @relation(fields: [lessonId], references: [id])
  difficulty        Difficulty
  testCases         TestCase[]
  solutions         Solution[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}
```

#### TestCase
```prisma
model TestCase {
  id                String    @id @default(cuid())
  problemId         String
  problem           Problem   @relation(fields: [problemId], references: [id])
  input             String
  expectedOutput    String
  isHidden          Boolean   @default(false)
}
```

#### Progress
```prisma
model Progress {
  id                String    @id @default(cuid())
  userId            String
  user              User      @relation(fields: [userId], references: [id])
  lessonId          String
  lesson            Lesson    @relation(fields: [lessonId], references: [id])
  status            Status    @default(NOT_STARTED)
  completedAt       DateTime?
  
  @@unique([userId, lessonId])
}

enum Status {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}
```

#### Testimonial
```prisma
model Testimonial {
  id                String    @id @default(cuid())
  userId            String    @unique
  user              User      @relation(fields: [userId], references: [id])
  rating            Int       (1-5 stars)
  text              String
  approved          Boolean   @default(false)
  createdAt         DateTime  @default(now())
}
```

---

## Database Setup & Installation

### Step 1: Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and run installer from https://www.postgresql.org/download/windows/

### Step 2: Create Database & User

```bash
# Connect to PostgreSQL
psql -U postgres

# In psql:
CREATE DATABASE dsa_learning;
CREATE USER dsa_user WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE dsa_learning TO dsa_user;
\q
```

### Step 3: Install Prisma

```bash
cd backend
npm install @prisma/client prisma
npx prisma init
```

### Step 4: Configure `.env`

```env
# backend/.env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://dsa_user:secure_password_here@localhost:5432/dsa_learning"
JWT_SECRET="your_super_secret_key_here_min_32_chars"
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
CORS_ORIGIN="http://localhost:3000"
```

### Step 5: Create Prisma Schema

See Data Models section above.

### Step 6: Run Migrations

```bash
# Generate migration files
npx prisma migrate dev --name init

# Apply migrations to database
npx prisma migrate deploy
```

### Step 7: Seed Database (Optional)

Create `backend/prisma/seed.js`:
```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Create sample users, lessons, problems
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
```

Run: `npx prisma db seed`

### Step 8: Connect to Backend

Update `backend/src/config/database.js`:
```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = prisma
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)

**Frontend:**
- [ ] Create folder structure
- [ ] Build Navbar component
- [ ] Design landing page layout
- [ ] Implement modal system
- [ ] Create auth forms (Login/Signup)
- [ ] Set up React Router

**Backend:**
- [ ] Install PostgreSQL + Prisma
- [ ] Create database and schema
- [ ] Set up folder structure
- [ ] Implement JWT authentication
- [ ] Create auth endpoints (`/api/v1/auth/signup`, `/api/v1/auth/login`)
- [ ] Add middleware (auth, error handling)

**Database:**
- [ ] PostgreSQL setup
- [ ] Prisma initialization
- [ ] Schema definition
- [ ] Migration creation

### Phase 2: Core Features (Weeks 3-4)

**Frontend:**
- [ ] Build Hero section
- [ ] Create Features section
- [ ] Implement Testimonials carousel
- [ ] Build Subscription plans section
- [ ] Create API client service (`services/api.js`)
- [ ] Set up Auth context
- [ ] Implement Login/Signup flow

**Backend:**
- [ ] Create lessons endpoints (`GET /api/v1/lessons`, `POST /api/v1/lessons`)
- [ ] Create problems endpoints
- [ ] Create user profile endpoints
- [ ] Add request validation
- [ ] Implement pagination for list endpoints

**Database:**
- [ ] Seed initial lessons data
- [ ] Create test users
- [ ] Add sample problems

### Phase 3: Enhancement (Weeks 5-6)

**Frontend:**
- [ ] Build Dashboard page
- [ ] Create Lessons list page
- [ ] Implement Lesson detail view
- [ ] Build Profile page
- [ ] Add responsive design
- [ ] Implement animations and transitions
- [ ] Add loading and error states

**Backend:**
- [ ] Create progress tracking endpoints
- [ ] Add user update endpoints
- [ ] Implement testimonial endpoints
- [ ] Add logging
- [ ] Create API documentation (Swagger/OpenAPI)

**Testing:**
- [ ] Unit tests for services
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user flows

### Phase 4: Advanced Features (Weeks 7-8)

- [ ] Code editor integration (Monaco Editor)
- [ ] Problem submission and execution
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] Analytics and progress tracking
- [ ] Search and filtering
- [ ] User recommendations

### Phase 5: Deployment & Optimization (Week 9+)

- [ ] Environment-specific configs
- [ ] Database backups strategy
- [ ] Performance optimization
- [ ] Security audit
- [ ] CI/CD pipeline
- [ ] Containerization refinement
- [ ] Deploy to production

---

## Quick Start Commands

```bash
# Install everything
npm run install:all

# Setup PostgreSQL and Prisma
cd backend
npm install @prisma/client prisma axios dotenv
npx prisma init

# Update .env with DATABASE_URL
# Create and run migrations
npx prisma migrate dev --name init

# Start development
npm run start:backend
npm run start:frontend

# Or with Docker
docker compose -f docker-compose.dev.yml up
```

---

## Environment Variables Summary

**Backend (.env):**
```
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://user:pass@localhost:5432/dsa_learning
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=15m
REFRESH_TOKEN_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

**Frontend (.env.local):**
```
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=DSA Learning Platform
```

---

## Key Technologies Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | UI Framework |
| Frontend | React Router | Client routing |
| Frontend | Axios | HTTP client |
| Frontend | CSS (with animations) | Styling |
| Backend | Express.js | API server |
| Backend | Prisma ORM | Database access |
| Backend | PostgreSQL | Database |
| Backend | JWT | Authentication |
| Backend | bcrypt | Password hashing |
| DevOps | Docker | Containerization |
| DevOps | Docker Compose | Orchestration |

---

## Next: Implementation Steps

1. Begin Phase 1 implementation
2. Run PostgreSQL setup
3. Configure Prisma schema
4. Build auth endpoints
5. Create frontend components
6. Connect frontend to backend APIs

See individual implementation files for detailed code examples.
