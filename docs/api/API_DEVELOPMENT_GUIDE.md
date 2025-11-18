# API Documentation & Development Guide

## Overview

This document outlines the DSA Learning Platform's API structure, Swagger documentation setup, and future development plans for extending the API.

---

## Current API Structure

### API Endpoint Organization

All API endpoints follow RESTful conventions and are organized under the `/api/v1/` prefix for versioning:

- **Health Check**: `/api/health` - Server status verification
- **Authentication**: `/api/v1/auth` - User signup, login, profile
- **Lessons**: `/api/v1/lessons` - Lesson CRUD operations
- **Problems**: `/api/v1/problems` - Problem CRUD operations

### Current Models & Database Schema

The backend uses **Prisma ORM** with the following models:

1. **User** - User accounts with roles (STUDENT, INSTRUCTOR, ADMIN)
   - id, email, username, password (hashed), role
   - Relations: lessons (as author), submissions, progress

2. **Lesson** - Learning content organized by category and difficulty
   - id, title, description, category, difficulty, content (markdown)
   - Relations: author (User), problems, categories

3. **Problem** - Coding challenges linked to lessons
   - id, title, description, difficulty, initialCode, language
   - Relations: lesson, testCases, submissions

4. **TestCase** - Test cases for validating problem solutions
   - id, input, output, isHidden
   - Relations: problem

5. **Submission** - User code submissions for problems
   - id, code, language, status, result, score
   - Relations: user, problem

6. **UserProgress** - Learning progress tracking per user
   - id, lessonsCompleted, problemsSolved, totalScore
   - Relations: user

**Database**: SQLite (development) / PostgreSQL (production)

---

## Swagger/OpenAPI Documentation

### Accessing Swagger UI

The API documentation is available at:

```
http://localhost:4000/api/docs
```

### OpenAPI Specification

The complete OpenAPI 3.0 specification is located at:

```
/docs/openapi.yaml
```

**Features:**
- Full CRUD operation documentation
- Request/response schemas
- Authentication examples
- Error response codes
- Query parameter descriptions
- Role-based access control documentation

### Backend Setup

The Swagger UI is integrated into the Express backend via:

1. **Package Installation**:
   - `swagger-ui-express` - UI rendering
   - `@types/swagger-ui-express` - TypeScript types

2. **Configuration** (`backend/src/config/swagger.ts`):
   - Reads OpenAPI YAML from `/docs/openapi.yaml`
   - Parses YAML into JSON specification

3. **Routes** (`backend/src/index.ts`):
   - `GET /api/docs` - Serves Swagger UI
   - Integrated with Express middleware stack

---

## Development Roadmap

### Phase 1 MVP - Completed ✅

**Database Layer** (2d) ✅
- Prisma schema with 6 models
- SQLite setup for local development
- Seed data with sample users and content

**Authentication** (3d) ✅
- JWT token generation/verification
- Password hashing with bcrypt
- Role-based access control
- Auth endpoints: signup, login, me

**API Endpoints** (4d) ✅
- Lesson CRUD: GET (all/paginated), GET (by ID), POST, PUT, DELETE
- Problem CRUD: GET (all/paginated), GET (by ID), POST, PUT, DELETE
- Pagination and filtering support
- Authorization checks

**API Documentation** (1d) ✅
- OpenAPI 3.0 specification
- Swagger UI integration
- Endpoint documentation with examples

### Phase 2 - Frontend Implementation (Next)

**Frontend Routing** (2d)
- [ ] Install React Router v6
- [ ] Create page structure
- [ ] Set up protected routes
- [ ] Implement route guards based on user roles

**Frontend API Client** (2d)
- [ ] Create `frontend/src/services/api.ts`
- [ ] Set up axios or fetch wrapper
- [ ] Implement token management in localStorage
- [ ] Create API hooks for authentication
- [ ] Error handling and interceptors

**Authentication UI** (3d)
- [ ] Login page with form validation
- [ ] Signup page with role selection
- [ ] Logout functionality
- [ ] Protected route wrapper component
- [ ] Token refresh/expiration handling

**Lesson Management UI** (2d)
- [ ] Lessons list page with pagination
- [ ] Lesson detail view
- [ ] Lesson search/filtering
- [ ] Display problems associated with lesson

**Problem Management UI** (1d)
- [ ] Problem detail page
- [ ] Code editor setup
- [ ] Test case display

### Phase 3 - Problem Execution & TestCases (Future)

**TestCase APIs** (2d)
- [ ] GET /api/v1/testcases (by problem)
- [ ] POST /api/v1/testcases (instructor only)
- [ ] PUT /api/v1/testcases/:id (instructor only)
- [ ] DELETE /api/v1/testcases/:id (admin only)

**Submission APIs** (2d)
- [ ] POST /api/v1/submissions (submit code)
- [ ] GET /api/v1/submissions (user's submissions)
- [ ] GET /api/v1/submissions/:id (submission details)

**Code Execution** (3d)
- [ ] Integrate external judge API (Judge0, HackerRank, etc.)
- [ ] Sandbox environment for code execution
- [ ] Result parsing and storage

### Phase 4 - Advanced Features (Future)

**User Progress Tracking** (2d)
- [ ] GET /api/v1/progress (user's learning metrics)
- [ ] Lesson completion tracking
- [ ] Problem solve rate
- [ ] Score calculation

**Leaderboard & Stats** (2d)
- [ ] GET /api/v1/leaderboard
- [ ] User ranking by score
- [ ] Problem difficulty distribution

**User Management** (1d)
- [ ] GET /api/v1/users (admin only)
- [ ] PUT /api/v1/users/:id (admin only, change role)
- [ ] DELETE /api/v1/users/:id (admin only)

---

## Future API Endpoints Reference

### TestCases API

```yaml
GET /api/v1/testcases?problemId=<id>&skip=0&take=10
  Description: Get test cases for a problem
  Auth: Bearer token
  Roles: Any authenticated user

POST /api/v1/testcases
  Description: Create new test case
  Auth: Bearer token
  Roles: INSTRUCTOR, ADMIN
  Body:
    - problemId (required)
    - input (required)
    - output (required)
    - isHidden (optional, default: false)

PUT /api/v1/testcases/:id
  Description: Update test case
  Auth: Bearer token
  Roles: INSTRUCTOR, ADMIN
  Body: Same as POST (all fields optional)

DELETE /api/v1/testcases/:id
  Description: Delete test case
  Auth: Bearer token
  Roles: ADMIN only
```

### Submissions API

```yaml
GET /api/v1/submissions?problemId=<id>&skip=0&take=10
  Description: Get user's submissions
  Auth: Bearer token (can only see own submissions unless admin)
  Roles: Any authenticated user

POST /api/v1/submissions
  Description: Submit code for a problem
  Auth: Bearer token
  Body:
    - problemId (required)
    - code (required)
    - language (optional, default: javascript)

GET /api/v1/submissions/:id
  Description: Get submission details with test results
  Auth: Bearer token
  Roles: Any authenticated user

PUT /api/v1/submissions/:id
  Description: Re-evaluate submission (admin only)
  Auth: Bearer token
  Roles: ADMIN only
```

### Progress API

```yaml
GET /api/v1/progress
  Description: Get current user's learning progress
  Auth: Bearer token
  Response:
    - lessonsCompleted (number)
    - problemsSolved (number)
    - totalScore (number)
    - averageDifficulty (string)

GET /api/v1/progress/:userId
  Description: Get specific user's progress (admin only)
  Auth: Bearer token
  Roles: ADMIN only
```

---

## Updated Prisma Schema Required

When implementing Phase 3 TestCase & Submission APIs, ensure the following schema updates:

```prisma
model TestCase {
  id        String   @id @default(cuid())
  input     String
  output    String
  isHidden  Boolean  @default(false)

  // Relations
  problem   Problem  @relation(fields: [problemId], references: [id], onDelete: Cascade)
  problemId String

  createdAt DateTime @default(now())
  @@index([problemId])
  @@map("test_cases")
}

model Submission {
  id        String   @id @default(cuid())
  code      String
  language  String   @default("javascript")
  status    String   @default("PENDING")
  result    String?
  score     Int      @default(0)

  // Relations
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  problem   Problem  @relation(fields: [problemId], references: [id], onDelete: Cascade)
  problemId String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@index([problemId])
  @@map("submissions")
}
```

**Note**: These models are already in the current Prisma schema!

---

## Development Best Practices

### 1. API Response Format

All endpoints return a consistent response structure:

```typescript
{
  success: boolean
  data?: T
  error?: string
  message?: string
}
```

### 2. Error Handling

- Use appropriate HTTP status codes:
  - `400` - Bad Request (invalid input)
  - `401` - Unauthorized (missing/invalid token)
  - `403` - Forbidden (insufficient permissions)
  - `404` - Not Found
  - `500` - Server Error

### 3. Authentication

- JWT tokens passed in `Authorization: Bearer <token>` header
- Token expiry: 7 days (configurable via `.env`)
- Refresh tokens: Planned for Phase 3

### 4. Authorization

- Instructor: Can create/edit own lessons and problems
- Admin: Can manage all content and users
- Student: Can view lessons and submit problems

### 5. Database Queries

- Use Prisma for all database operations
- Always include proper error handling
- Implement pagination for list endpoints
- Add filtering where appropriate

### 6. Testing

- Test all CRUD operations
- Test role-based access controls
- Test pagination and filtering
- Use Postman or curl with sample data

---

## Setup Instructions for Developers

### Backend API Documentation

1. **Start backend server**:
   ```bash
   npm run start:backend
   ```

2. **Access Swagger UI**:
   ```
   http://localhost:4000/api/docs
   ```

3. **Test endpoints**:
   - Use Swagger UI to test endpoints directly
   - Or use curl/Postman with examples provided

### Adding New API Endpoints

1. Create service in `backend/src/services/<feature>Service.ts`
2. Create routes in `backend/src/routes/<feature>Routes.ts`
3. Mount routes in `backend/src/index.ts`
4. Update `docs/openapi.yaml` with new endpoint documentation
5. Commit with clear message: `feat: add <feature> API endpoints`

### Updating Documentation

1. Edit `docs/openapi.yaml` to match new endpoints
2. Restart backend server to reload Swagger UI
3. Verify documentation renders correctly
4. Commit: `docs: update OpenAPI specification for <feature>`

---

## Troubleshooting

### Swagger UI not loading?

1. Verify `docs/openapi.yaml` exists and is valid YAML
2. Check backend console for errors
3. Ensure `swagger-ui-express` is installed
4. Clear browser cache and refresh

### Cannot execute endpoints in Swagger UI?

1. Ensure backend server is running on port 4000
2. Check CORS is enabled in Express app
3. For protected endpoints, use "Authorize" button to add JWT token

### TypeScript errors with Swagger?

1. Install types: `npm install --save-dev @types/swagger-ui-express`
2. Ensure `YAML` parser is available: `npm install yaml`
3. Update tsconfig.json if needed

---

## References

- [OpenAPI 3.0 Specification](https://spec.openapis.org/oas/v3.0.0)
- [Swagger UI Documentation](https://github.com/swagger-api/swagger-ui)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

