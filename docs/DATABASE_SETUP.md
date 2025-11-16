# Database Setup Guide - PostgreSQL & Prisma

## Overview

This guide covers setting up PostgreSQL database with Prisma ORM for the DSA Learning Platform.

## Prerequisites

- Node.js (v18+)
- PostgreSQL (v15+)
- npm or yarn

## Step 1: Install PostgreSQL

### macOS (using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
postgres --version

# Check if service is running
brew services list
```

### Ubuntu/Debian

```bash
# Update package manager
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Verify
sudo -u postgres psql --version
```

### Windows

1. Download from https://www.postgresql.org/download/windows/
2. Run installer and follow setup wizard
3. Remember the postgres superuser password
4. PostgreSQL will start automatically

### Docker (Optional)

```bash
# Run PostgreSQL in Docker
docker run -d \
  --name postgres-dsa \
  -e POSTGRES_USER=dsa_user \
  -e POSTGRES_PASSWORD=secure_password \
  -e POSTGRES_DB=dsa_learning \
  -p 5432:5432 \
  postgres:15-alpine

# Verify
docker exec -it postgres-dsa psql -U dsa_user -d dsa_learning -c '\l'
```

## Step 2: Create Database and User

### Method 1: Using psql CLI

```bash
# Connect to PostgreSQL (default user: postgres)
psql postgres

# Inside psql prompt:
-- Create database
CREATE DATABASE dsa_learning;

-- Create user
CREATE USER dsa_user WITH PASSWORD 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE dsa_learning TO dsa_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO dsa_user;

-- Connect to the new database and grant schema privileges
\c dsa_learning
GRANT ALL ON SCHEMA public TO dsa_user;

-- Verify
\l              # List databases
\du             # List users
\c dsa_learning # Connect to database
\dt             # List tables

-- Exit
\q
```

### Method 2: Using SQL Script

Create `setup_database.sql`:

```sql
-- Create database
CREATE DATABASE dsa_learning;

-- Create user with password
CREATE USER dsa_user WITH PASSWORD 'secure_password';

-- Grant database privileges
GRANT ALL PRIVILEGES ON DATABASE dsa_learning TO dsa_user;

-- Connect to database and grant schema privileges
\c dsa_learning
GRANT ALL PRIVILEGES ON SCHEMA public TO dsa_user;
GRANT ALL ON SCHEMA public TO PUBLIC;
```

Run the script:

```bash
psql postgres -f setup_database.sql
```

### Method 3: Connection String Only

If using a managed database service (Cloud SQL, RDS, etc.), you'll get a connection string. Skip to Step 3.

## Step 3: Configure Environment Variables

Create `backend/.env` file:

```env
# Database Connection
DATABASE_URL="postgresql://dsa_user:secure_password@localhost:5432/dsa_learning"

# Backend Configuration
PORT=4000
NODE_ENV=development

# Authentication
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRY=24h

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

**Examples:**

```bash
# Local development
DATABASE_URL="postgresql://dsa_user:secure_password@localhost:5432/dsa_learning"

# Docker
DATABASE_URL="postgresql://dsa_user:secure_password@postgres-dsa:5432/dsa_learning"

# Cloud SQL (GCP)
DATABASE_URL="postgresql://user:password@cloudsql-proxy:5432/dsa_learning"

# RDS (AWS)
DATABASE_URL="postgresql://user:password@dsa-db.c9akciq32.us-east-1.rds.amazonaws.com:5432/dsa_learning"

# Heroku
DATABASE_URL="postgres://user:password@ec2-1-2-3-4.compute-1.amazonaws.com:5432/dbname"
```

## Step 4: Initialize Prisma

```bash
cd backend

# Install Prisma (already in package.json, but can install explicitly)
npm install -D prisma @prisma/client

# Initialize Prisma (creates prisma/schema.prisma)
npx prisma init

# Prisma schema already created - verify it exists
cat prisma/schema.prisma
```

## Step 5: Run Database Migrations

```bash
# Create and apply migrations
npx prisma migrate dev --name init

# This will:
# 1. Create migration files in prisma/migrations/
# 2. Apply migrations to your database
# 3. Generate Prisma Client
```

You should see output like:

```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "dsa_learning" on "localhost:5432"

✔ Enter a name for this migration › init
Applying migration `20231116120000_init`

The following migration(s) have been created and applied:
migrations/
  └─ 20231116120000_init/
    └─ migration.sql

✓ Generated Prisma Client (v5.7.0) in 234ms
```

## Step 6: Verify Database Setup

### Using Prisma Studio

```bash
# Open Prisma Admin UI (visual database explorer)
npx prisma studio

# This opens http://localhost:5555
# You can now view and manage data visually
```

### Using psql CLI

```bash
# Connect to database
psql -U dsa_user -d dsa_learning -h localhost

# Inside psql:
\dt              # List all tables
\d users         # Describe users table
SELECT * FROM users;  # Query users

\q               # Exit
```

## Step 7: Seed Database (Optional)

Create `backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create sample lessons
  const lesson1 = await prisma.lesson.create({
    data: {
      title: 'Arrays',
      description: 'Learn about arrays and their operations',
      difficulty: 'EASY',
      category: 'Data Structures',
      content: '# Arrays\n\nArrays are fundamental data structures...',
      author: {
        create: {
          email: 'instructor@example.com',
          username: 'instructor',
          password: 'hashed_password', // Use bcrypt in real app
          role: 'INSTRUCTOR',
        },
      },
    },
  })

  console.log('✓ Seed data created:', lesson1)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Add to `backend/package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run seed:

```bash
npx prisma db seed
```

## Step 8: TypeScript Integration

The Prisma Client is already TypeScript-ready. To get full type support:

```bash
# Generate Prisma Client types
npx prisma generate

# Now you can use types in your code
import { Prisma, PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
  })
  // user is typed as User | null
  return user
}
```

## Step 9: Testing Database Connection

Create `backend/src/testConnection.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const result = await prisma.$queryRaw`SELECT 1`
    console.log('✓ Database connection successful!')
    console.log('Result:', result)
  } catch (error) {
    console.error('✗ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
```

Run test:

```bash
npx ts-node src/testConnection.ts
```

## Migration Workflows

### Create New Migration

```bash
# After modifying prisma/schema.prisma
npx prisma migrate dev --name add_new_field

# Or without applying (just create migration files)
npx prisma migrate create --name add_new_field
```

### Apply Pending Migrations (Production)

```bash
# Apply migrations without prompts
npx prisma migrate deploy
```

### Reset Database (Development Only)

```bash
# ⚠️ WARNING: Deletes all data
npx prisma migrate reset

# Or complete reset with seed
npx prisma migrate reset --skip-seed
```

### View Migration History

```bash
# List all migrations
npx prisma migrate status
```

## Troubleshooting

### Connection Refused

```bash
# Check if PostgreSQL is running
brew services list

# Restart if needed
brew services restart postgresql@15

# Test connection
psql -U dsa_user -d dsa_learning -c 'SELECT 1'
```

### Wrong Password

```bash
# Reset user password
psql postgres
ALTER USER dsa_user WITH PASSWORD 'new_password';
```

### Database Does Not Exist

```bash
# Create it again
psql postgres
CREATE DATABASE dsa_learning;
GRANT ALL PRIVILEGES ON DATABASE dsa_learning TO dsa_user;
```

### Prisma Can't Find .env

```bash
# Ensure backend/.env exists
ls -la backend/.env

# Or specify path explicitly
DATABASE_URL="..." npx prisma migrate dev
```

### Port Already in Use

```bash
# Find process using port 5432
lsof -i :5432

# Kill if necessary
kill -9 <PID>
```

## Docker-Compose Integration

For local development with Docker:

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: dsa_user
      POSTGRES_PASSWORD: secure_password
      POSTGRES_DB: dsa_learning
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U dsa_user']
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    environment:
      DATABASE_URL: "postgresql://dsa_user:secure_password@postgres:5432/dsa_learning"
    ports:
      - '4000:4000'
      - '3000:3000'
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - .:/app

volumes:
  postgres_data:
```

Run with:

```bash
docker-compose up -d
```

## Next Steps

1. ✅ Database set up and connected
2. Run migrations: `npx prisma migrate dev`
3. Start backend: `npm run dev`
4. Create API endpoints using Prisma Client
5. Test with Prisma Studio: `npx prisma studio`
6. Set up authentication with JWT
7. Deploy to production with managed database

## Useful Commands Reference

```bash
# Development
npx prisma migrate dev --name <migration_name>    # Create and apply migration
npx prisma studio                                  # Open admin UI
npx prisma generate                               # Generate client types
npx prisma db seed                                # Run seed script

# Production
npx prisma migrate deploy                         # Apply pending migrations
npx prisma db push                                # Sync schema to DB
npx prisma generate --skip-engine                 # Generate types only

# Debugging
npx prisma migrate status                         # Show migration status
npx prisma schema validate                        # Validate schema
npx prisma db execute                             # Run raw SQL
```

## Security Best Practices

1. **Never commit .env**: Add to .gitignore ✅
2. **Use strong passwords**: Change default from example
3. **Enable SSL in production**: `?sslmode=require` in connection string
4. **Limit user permissions**: Only GRANT needed privileges
5. **Use environment variables**: Never hardcode credentials
6. **Rotate JWT secrets**: Periodically update in production
7. **Enable database backups**: Set up automated backups
8. **Use connection pooling**: For production deployments
