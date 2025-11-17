# Database Schema Documentation

## Overview

The DSA Learning Platform uses **SQLite** for local development and can be switched to **PostgreSQL** for production via the `.env` configuration.

**ORM:** Prisma 5.22
**Database:** SQLite (dev) / PostgreSQL (production)

---

## Data Models

### 1. **User**
Represents platform users with role-based access control.

```
id           String   (Primary Key, CUID)
email        String   (Unique)
username     String   (Unique)
password     String   (Hashed with bcrypt)
role         String   (STUDENT | INSTRUCTOR | ADMIN)
createdAt    DateTime (Auto)
updatedAt    DateTime (Auto)

Relations:
- lessons: Lesson[] (authored lessons)
- submissions: Submission[]
- progress: UserProgress?
```

**Indexes:**
- `email` - For quick user lookups
- `username` - For username validation

---

### 2. **Lesson**
Learning content organized by topic and difficulty.

```
id           String   (Primary Key, CUID)
title        String   (Lesson title)
description  String   (Short description)
difficulty   String   (EASY | MEDIUM | HARD)
category     String   (e.g., "Arrays", "Trees", "DP")
content      String   (Markdown content)
authorId     String   (Foreign Key → User.id)
createdAt    DateTime (Auto)
updatedAt    DateTime (Auto)

Relations:
- author: User
- problems: Problem[]
```

**Indexes:**
- `authorId` - Filter lessons by author
- `category` - Group lessons by topic
- `difficulty` - Filter by difficulty level

---

### 3. **Problem**
Coding problems within lessons.

```
id           String   (Primary Key, CUID)
title        String   (Problem title)
description  String   (Problem statement)
difficulty   String   (EASY | MEDIUM | HARD)
initialCode  String   (Starter code)
language     String   (Programming language, default: "javascript")
lessonId     String   (Foreign Key → Lesson.id)
createdAt    DateTime (Auto)
updatedAt    DateTime (Auto)

Relations:
- lesson: Lesson
- testCases: TestCase[]
- submissions: Submission[]
```

**Indexes:**
- `lessonId` - Fetch problems for a lesson

---

### 4. **TestCase**
Test cases for problem validation.

```
id           String   (Primary Key, CUID)
input        String   (Test input)
output       String   (Expected output)
isHidden     Boolean  (Visible to user? default: false)
problemId    String   (Foreign Key → Problem.id)
createdAt    DateTime (Auto)

Relations:
- problem: Problem
```

**Indexes:**
- `problemId` - Fetch test cases for a problem

---

### 5. **Submission**
User code submissions with execution results.

```
id           String   (Primary Key, CUID)
code         String   (User's submitted code)
language     String   (Programming language, default: "javascript")
status       String   (PENDING | ACCEPTED | WRONG_ANSWER | TIME_LIMIT_EXCEEDED | RUNTIME_ERROR | COMPILATION_ERROR)
result       String?  (JSON: {passed: int, failed: int, verdict: string})
score        Int      (Points earned, default: 0)
userId       String   (Foreign Key → User.id)
problemId    String   (Foreign Key → Problem.id)
createdAt    DateTime (Auto)
updatedAt    DateTime (Auto)

Relations:
- user: User
- problem: Problem
```

**Indexes:**
- `userId` - Fetch user's submissions
- `problemId` - Fetch submissions for a problem
- `status` - Filter by verdict (for leaderboards, stats)

---

### 6. **UserProgress**
Tracks user learning metrics.

```
id               String   (Primary Key, CUID)
lessonsStarted   Int      (default: 0)
lessonsCompleted Int      (default: 0)
problemsAttempted Int     (default: 0)
problemsSolved   Int      (default: 0)
totalScore       Int      (default: 0)
userId           String   (Foreign Key → User.id, Unique)
createdAt        DateTime (Auto)
updatedAt        DateTime (Auto)

Relations:
- user: User
```

**Indexes:**
- `userId` - One-to-one relationship

---

## Enum Values

### UserRole
- `STUDENT` - Default learner role
- `INSTRUCTOR` - Can create lessons & problems
- `ADMIN` - Full platform access

### Difficulty
- `EASY` - Beginner level
- `MEDIUM` - Intermediate level
- `HARD` - Advanced level

### SubmissionStatus
- `PENDING` - Submission queued for execution
- `ACCEPTED` - All test cases passed ✅
- `WRONG_ANSWER` - Output doesn't match ❌
- `TIME_LIMIT_EXCEEDED` - Execution too slow ⏱️
- `RUNTIME_ERROR` - Code crashed 💥
- `COMPILATION_ERROR` - Syntax error 🔴

---

## Key Relationships

```
User (1) ──→ (N) Lesson (via authorId)
User (1) ──→ (N) Submission
User (1) ──→ (1) UserProgress

Lesson (1) ──→ (N) Problem
Problem (1) ──→ (N) TestCase
Problem (1) ──→ (N) Submission

User (1) ←─ (N) Submission (via userId)
```

---

## Sample Data

**Seed includes:**
- 4 Users: 1 admin, 1 instructor, 2 students
- 3 Lessons: Arrays (EASY), Linked Lists (MEDIUM), BSTs (HARD)
- 3 Problems: Find Max, Reverse Array, Merge Sorted Arrays
- 6 TestCases: Mix of public and hidden
- 2 Sample Submissions: For testing queries

**To seed:** `npm run seed` from `backend/` directory

---

## Database Commands

```bash
# View/edit data interactively
npx prisma studio

# Create new migration
npx prisma migrate dev --name "description"

# Apply migrations
npx prisma migrate deploy

# Reset database (DEV ONLY!)
npx prisma migrate reset

# Seed data
npm run seed
```

---

## Migration History

| Date | Migration | Changes |
|------|-----------|---------|
| 2025-11-17 | `20251117155453_init_schema` | Initial schema: 6 models, enums as strings |

---

## SQLite vs PostgreSQL

**Local Development (SQLite):**
- File-based: `backend/prisma/dev.db`
- No server setup needed
- Perfect for rapid iteration
- Limited to single process

**Production (PostgreSQL):**
- Change `DATABASE_URL` in `.env` to PostgreSQL connection string
- Run: `npx prisma migrate deploy`
- Supports concurrent connections
- Better performance at scale

---

## Performance Optimization Tips

1. **Indexes:** Already added on foreign keys and filter columns
2. **Pagination:** Use `take` & `skip` in queries for large result sets
3. **Relations:** Use `include`/`select` judiciously to avoid N+1 queries
4. **Queries:** Use Prisma's `findUnique` when possible (faster than `findFirst`)
