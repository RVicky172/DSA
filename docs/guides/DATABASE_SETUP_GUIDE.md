# PostgreSQL + Prisma Setup Guide for DSA Learning Platform

## Complete Installation & Configuration Steps

### Table of Contents
1. [PostgreSQL Installation](#postgresql-installation)
2. [Database Creation](#database-creation)
3. [Prisma Setup](#prisma-setup)
4. [Schema Definition](#schema-definition)
5. [Migrations](#migrations)
6. [Seed Data](#seed-data)
7. [Backend Integration](#backend-integration)
8. [Troubleshooting]

---

## PostgreSQL Installation

### macOS (Homebrew - Recommended)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version

# Connect to PostgreSQL (should show postgres=#)
psql -U postgres
```

### macOS (Using PostgreSQL App)

1. Download from https://postgresapp.com/
2. Install and launch the app
3. Click "Initialize" to create a new server
4. Access via terminal: `psql -U postgres`

### Ubuntu/Linux (Debian-based)

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version

# Connect as postgres user
sudo -u postgres psql
```

### Windows

1. Download from https://www.postgresql.org/download/windows/
2. Run the installer (.exe)
3. Choose installation directory (default: `C:\Program Files\PostgreSQL\15`)
4. Set password for postgres user
5. Choose port (default: 5432)
6. Complete installation

Access via Command Prompt or PowerShell:
```powershell
psql -U postgres
```

---

## Database Creation

### Step 1: Connect to PostgreSQL

```bash
# macOS/Linux
psql -U postgres

# Windows (Command Prompt or PowerShell)
psql -U postgres
```

You should see the PostgreSQL prompt: `postgres=#`

### Step 2: Create Database & User

```sql
-- Create database
CREATE DATABASE dsa_learning;

-- Create user with password
CREATE USER dsa_user WITH ENCRYPTED PASSWORD 'secure_password_123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dsa_learning TO dsa_user;

-- Connect to the new database
\c dsa_learning

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO dsa_user;

-- Exit
\q
```

### Step 3: Verify Setup

```bash
# Connect with new user
psql -U dsa_user -d dsa_learning -h localhost

# Should show: dsa_learning=>
```

---

## Prisma Setup

### Step 1: Install Dependencies

```bash
cd backend

# Install Prisma CLI and client
npm install @prisma/client
npm install -D prisma

# Verify installation
npx prisma --version
```

### Step 2: Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` (database schema)
- `.env` (environment variables)

### Step 3: Configure .env

Update `backend/.env`:

```env
# Database
DATABASE_URL="postgresql://dsa_user:secure_password_123@localhost:5432/dsa_learning"

# JWT
JWT_SECRET="your_super_secret_key_here_minimum_32_chars_long"
JWT_EXPIRE="15m"
REFRESH_TOKEN_EXPIRE="7d"

# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"

# Optional: Email service
SENDGRID_API_KEY="your_api_key_here"
```

**Important:** Never commit `.env` to version control. Use `.env.example` for documentation.

---

## Schema Definition

### Step 1: Update Prisma Schema

Replace `prisma/schema.prisma` with:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// User Model
model User {
  id                String    @id @default(cuid())
  email             String    @unique
  password          String
  firstName         String?
  lastName          String?
  avatar            String?
  role              UserRole  @default(STUDENT)
  subscription      String    @default("free") // free, pro, enterprise
  subscriptionEnd   DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  lessons           Progress[]
  testimonial       Testimonial?
  
  @@index([email])
}

enum UserRole {
  STUDENT
  INSTRUCTOR
  ADMIN
}

// Lesson Model
model Lesson {
  id                String    @id @default(cuid())
  title             String
  description       String    @db.Text
  difficulty        Difficulty
  content           String    @db.Text // Markdown content
  topics            String[] // Array of topics
  instructor        String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  problems          Problem[]
  userProgress      Progress[]
  
  @@index([difficulty])
  @@index([topics])
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
  EXPERT
}

// Problem Model
model Problem {
  id                String    @id @default(cuid())
  title             String
  description       String    @db.Text
  lessonId          String
  difficulty        Difficulty
  sampleInput       String?   @db.Text
  sampleOutput      String?   @db.Text
  timeLimit         Int       @default(1000) // ms
  memoryLimit       Int       @default(256) // MB
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  lesson            Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  testCases         TestCase[]
  submissions       Submission[]
  
  @@index([lessonId])
  @@index([difficulty])
}

// Test Case Model
model TestCase {
  id                String    @id @default(cuid())
  problemId         String
  input             String    @db.Text
  expectedOutput    String    @db.Text
  isHidden          Boolean   @default(false)
  explanation       String?   @db.Text
  
  // Relations
  problem           Problem   @relation(fields: [problemId], references: [id], onDelete: Cascade)
  
  @@index([problemId])
}

// Progress Model (User's lesson completion)
model Progress {
  id                String    @id @default(cuid())
  userId            String
  lessonId          String
  status            Status    @default(NOT_STARTED)
  completedAt       DateTime?
  timeSpent         Int?      // seconds
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson            Lesson    @relation(fields: [lessonId], references: [id], onDelete: Cascade)
  
  @@unique([userId, lessonId])
  @@index([userId])
  @@index([lessonId])
  @@index([status])
}

enum Status {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
}

// Submission Model (Code submissions)
model Submission {
  id                String    @id @default(cuid())
  problemId         String
  userId            String? // Optional for guest submissions
  code              String    @db.Text
  language          String    // python, javascript, java, cpp, etc
  status            SubmissionStatus
  output            String?   @db.Text
  error             String?   @db.Text
  timeMs            Int?
  memoryMb          Int?
  createdAt         DateTime  @default(now())
  
  // Relations
  problem           Problem   @relation(fields: [problemId], references: [id], onDelete: Cascade)
  
  @@index([problemId])
  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

enum SubmissionStatus {
  PENDING
  RUNNING
  ACCEPTED
  WRONG_ANSWER
  TIME_LIMIT_EXCEEDED
  MEMORY_LIMIT_EXCEEDED
  COMPILATION_ERROR
  RUNTIME_ERROR
}

// Testimonial Model
model Testimonial {
  id                String    @id @default(cuid())
  userId            String    @unique
  rating            Int // 1-5
  text              String    @db.Text
  approved          Boolean   @default(false)
  createdAt         DateTime  @default(now())
  
  // Relations
  user              User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([approved])
}

// Optional: Achievement/Badge Model
model Achievement {
  id                String    @id @default(cuid())
  name              String
  description       String
  icon              String?
  requirement       Int // e.g., problems_solved: 10
  createdAt         DateTime  @default(now())
  
  @@index([name])
}
```

### Step 2: Verify Schema

```bash
# Check for syntax errors
npx prisma validate
```

---

## Migrations

### Step 1: Create Initial Migration

```bash
# From backend directory
npx prisma migrate dev --name init
```

This command:
- Creates migration files in `prisma/migrations/`
- Applies migrations to the database
- Generates Prisma Client
