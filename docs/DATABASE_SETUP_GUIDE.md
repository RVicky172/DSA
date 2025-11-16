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
8. [Troubleshooting](#troubleshooting)

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

### Step 2: Verify Migration

```bash
# View database schema
npx prisma studio

# This opens a GUI at http://localhost:5555
```

### Step 3: Production Migration

For production deployments:

```bash
npx prisma migrate deploy
```

### Step 4: Reset Database (Development Only)

```bash
# ⚠️ WARNING: Deletes all data
npx prisma migrate reset

# Confirm when prompted
```

---

## Seed Data

### Step 1: Create Seed File

Create `prisma/seed.js`:

```javascript
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data (use with caution!)
  await prisma.submission.deleteMany({})
  await prisma.testCase.deleteMany({})
  await prisma.problem.deleteMany({})
  await prisma.progress.deleteMany({})
  await prisma.testimonial.deleteMany({})
  await prisma.user.deleteMany({})
  await prisma.lesson.deleteMany({})

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const user1 = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: 'STUDENT',
      subscription: 'free'
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: hashedPassword,
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'STUDENT',
      subscription: 'pro'
    }
  })

  const instructor = await prisma.user.create({
    data: {
      email: 'instructor@example.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Teacher',
      role: 'INSTRUCTOR'
    }
  })

  // Create sample lessons
  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'Arrays - The Basics',
      description: 'Learn fundamentals of arrays, indexing, and basic operations',
      difficulty: 'EASY',
      topics: ['arrays', 'fundamentals'],
      content: `# Arrays - The Basics

Arrays are fundamental data structures that store multiple items...`,
      instructor: instructor.id
    }
  })

  const lesson2 = await prisma.lesson.create({
    data: {
      title: 'Linked Lists Implementation',
      description: 'Master linked lists, insertion, deletion, and traversal',
      difficulty: 'MEDIUM',
      topics: ['linked-lists', 'pointers'],
      content: `# Linked Lists

A linked list is a linear data structure...`,
      instructor: instructor.id
    }
  })

  // Create sample problems
  const problem1 = await prisma.problem.create({
    data: {
      title: 'Two Sum',
      description: 'Find two numbers that add up to a target',
      lessonId: lesson1.id,
      difficulty: 'EASY',
      sampleInput: '[2, 7, 11, 15], target = 9',
      sampleOutput: '[0, 1]',
      testCases: {
        create: [
          {
            input: '[2, 7, 11, 15], target = 9',
            expectedOutput: '[0, 1]',
            isHidden: false
          },
          {
            input: '[3, 2, 4], target = 6',
            expectedOutput: '[1, 2]',
            isHidden: false
          }
        ]
      }
    }
  })

  const problem2 = await prisma.problem.create({
    data: {
      title: 'Reverse Array',
      description: 'Reverse an array in-place',
      lessonId: lesson1.id,
      difficulty: 'EASY',
      sampleInput: '[1, 2, 3, 4, 5]',
      sampleOutput: '[5, 4, 3, 2, 1]',
      testCases: {
        create: [
          {
            input: '[1, 2, 3, 4, 5]',
            expectedOutput: '[5, 4, 3, 2, 1]',
            isHidden: false
          }
        ]
      }
    }
  })

  // Create user progress
  await prisma.progress.create({
    data: {
      userId: user1.id,
      lessonId: lesson1.id,
      status: 'COMPLETED',
      completedAt: new Date(),
      timeSpent: 1200
    }
  })

  // Create testimonial
  await prisma.testimonial.create({
    data: {
      userId: user1.id,
      rating: 5,
      text: 'Amazing platform for learning DSA! Very comprehensive.',
      approved: true
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('Sample data created:')
  console.log(`- Users: ${[user1, user2, instructor].length}`)
  console.log(`- Lessons: 2`)
  console.log(`- Problems: 2`)
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### Step 2: Add Seed Script to package.json

In `backend/package.json`:

```json
{
  "prisma": {
    "seed": "node prisma/seed.js"
  }
}
```

### Step 3: Run Seed

```bash
npx prisma db seed

# Output should show:
# 🌱 Seeding database...
# ✅ Database seeded successfully!
```

---

## Backend Integration

### Step 1: Install Required Packages

```bash
cd backend

npm install bcryptjs jsonwebtoken axios dotenv
npm install -D nodemon
```

### Step 2: Create Database Config

Create `backend/src/config/database.js`:

```javascript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Handle errors
prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch(err => {
    console.error('❌ Database connection failed:', err)
    process.exit(1)
  })

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

module.exports = prisma
```

### Step 3: Import in Backend

In `backend/src/index.js`:

```javascript
const prisma = require('./config/database')

// Use prisma in your routes
app.get('/api/v1/lessons', async (req, res) => {
  const lessons = await prisma.lesson.findMany()
  res.json({ lessons })
})
```

---

## Environment Variables

### .env.example

Create `backend/.env.example`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# JWT
JWT_SECRET="your_secret_key_here"
JWT_EXPIRE="15m"
REFRESH_TOKEN_EXPIRE="7d"

# Server
PORT=4000
NODE_ENV=development

# CORS
CORS_ORIGIN="http://localhost:3000"

# Optional Services
SENDGRID_API_KEY=""
STRIPE_SECRET_KEY=""
```

---

## Connection String Reference

**PostgreSQL Connection String Format:**
```
postgresql://username:password@localhost:5432/database_name
```

**Parts:**
- `username` - Database user (default: postgres)
- `password` - User's password
- `localhost` - Host (or server address)
- `5432` - Port (default PostgreSQL port)
- `database_name` - Database name

**Examples:**
```
postgresql://dsa_user:secure_password_123@localhost:5432/dsa_learning
postgresql://postgres:admin@localhost:5432/dsa_dev
postgresql://user:pass@db.example.com:5432/prod_db
```

---

## Troubleshooting

### Issue: "Can't connect to PostgreSQL"

```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# Should output: "accepting connections"
```

**Solutions:**
- macOS: `brew services start postgresql@15`
- Linux: `sudo systemctl start postgresql`
- Windows: Start PostgreSQL from Services

### Issue: "Database does not exist"

```bash
# Create database manually
psql -U postgres -c "CREATE DATABASE dsa_learning"
```

### Issue: "User does not have privileges"

```bash
psql -U postgres -d dsa_learning

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE dsa_learning TO dsa_user;
\q
```

### Issue: "Prisma migration conflicts"

```bash
# Resolve conflicts
npx prisma migrate resolve --rolled-back <migration_name>
npx prisma migrate deploy
```

### Issue: "Port 5432 already in use"

```bash
# Find process using port 5432
lsof -i :5432  # macOS/Linux
netstat -ano | findstr :5432  # Windows

# Kill process or change PostgreSQL port
```

---

## Common Commands

```bash
# Open Prisma Studio (GUI for database)
npx prisma studio

# View pending migrations
npx prisma migrate status

# Create migration from schema changes
npx prisma migrate dev --name <migration_name>

# Validate schema
npx prisma validate

# Generate Prisma Client
npx prisma generate

# Format schema
npx prisma format

# Reset database (development only)
npx prisma migrate reset

# Seed database
npx prisma db seed
```

---

## Next Steps

1. ✅ Install PostgreSQL
2. ✅ Create database and user
3. ✅ Initialize Prisma
4. ✅ Define schema
5. ✅ Run migrations
6. ✅ Seed data
7. ✅ Integrate with backend
8. → Create API endpoints (see Backend Enhancement Guide)
