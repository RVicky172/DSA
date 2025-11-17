# Backend Architecture Enhancement Guide

Comprehensive guide for transforming the backend from single-file scaffold to production-ready API.

## Overview

**Current:** `backend/src/index.js` with hardcoded routes
**Target:** Modular architecture with authentication, database integration, and API versioning

---

## Folder Structure Setup

Create the following structure in `backend/src/`:

```bash
cd backend/src

# Create all directories
mkdir -p config middleware routes controllers services models utils

# Create files
touch config/database.js
touch middleware/auth.js middleware/errorHandler.js middleware/validation.js
touch routes/index.js routes/auth.routes.js routes/lessons.routes.js
touch controllers/authController.js controllers/lessonController.js
touch services/authService.js services/lessonService.js
touch utils/logger.js utils/constants.js
```

---

## File Implementation

### 1. Config - Database Connection

**`backend/src/config/database.js`**

```javascript
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error']
})

prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch(err => {
    console.error('❌ Database connection failed:', err)
    process.exit(1)
  })

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

module.exports = prisma
```

### 2. Utilities - Logger

**`backend/src/utils/logger.js`**

```javascript
const logger = {
  info: (message, data = '') => {
    console.log(`\n📘 [INFO] ${message}`, data)
  },
  
  error: (message, error = '') => {
    console.error(`\n❌ [ERROR] ${message}`, error)
  },
  
  warn: (message, data = '') => {
    console.warn(`\n⚠️  [WARN] ${message}`, data)
  },
  
  success: (message, data = '') => {
    console.log(`\n✅ [SUCCESS] ${message}`, data)
  }
}

module.exports = logger
```

### 3. Utilities - Constants

**`backend/src/utils/constants.js`**

```javascript
module.exports = {
  // API Versions
  API_VERSION: 'v1',
  
  // Roles
  USER_ROLES: {
    STUDENT: 'STUDENT',
    INSTRUCTOR: 'INSTRUCTOR',
    ADMIN: 'ADMIN'
  },
  
  // Subscription Plans
  SUBSCRIPTION_PLANS: {
    FREE: 'free',
    PRO: 'pro',
    ENTERPRISE: 'enterprise'
  },
  
  // Lesson Difficulty
  DIFFICULTIES: {
    EASY: 'EASY',
    MEDIUM: 'MEDIUM',
    HARD: 'HARD',
    EXPERT: 'EXPERT'
  },
  
  // Error Messages
  ERRORS: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User already exists',
    USER_NOT_FOUND: 'User not found',
    LESSON_NOT_FOUND: 'Lesson not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    INVALID_INPUT: 'Invalid input provided',
    SERVER_ERROR: 'Internal server error'
  },
  
  // Success Messages
  SUCCESS: {
    USER_CREATED: 'User created successfully',
    LOGIN_SUCCESS: 'Login successful',
    LESSON_CREATED: 'Lesson created successfully',
    LESSON_UPDATED: 'Lesson updated successfully'
  },
  
  // JWT
  JWT_EXPIRE: process.env.JWT_EXPIRE || '15m',
  REFRESH_TOKEN_EXPIRE: process.env.REFRESH_TOKEN_EXPIRE || '7d'
}
```

### 4. Services - Authentication

**`backend/src/services/authService.js`**

```javascript
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../config/database')
const { ERRORS, SUCCESS, JWT_EXPIRE } = require('../utils/constants')

class AuthService {
  async signup(email, password, firstName, lastName) {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      throw new Error(ERRORS.USER_EXISTS)
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'STUDENT',
        subscription: 'free'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    })
    
    return user
  }
  
  async login(email, password) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      throw new Error(ERRORS.INVALID_CREDENTIALS)
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    
    if (!isValidPassword) {
      throw new Error(ERRORS.INVALID_CREDENTIALS)
    }
    
    // Generate tokens
    const accessToken = this.generateAccessToken(user.id)
    const refreshToken = this.generateRefreshToken(user.id)
    
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      accessToken,
      refreshToken
    }
  }
  
  generateAccessToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    )
  }
  
  generateRefreshToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
    )
  }
  
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
      throw new Error('Invalid or expired token')
    }
  }
}

module.exports = new AuthService()
```

### 5. Services - Lessons

**`backend/src/services/lessonService.js`**

```javascript
const prisma = require('../config/database')
const { ERRORS } = require('../utils/constants')

class LessonService {
  async getAllLessons(filters = {}) {
    const { difficulty, skip = 0, take = 10 } = filters
    
    const where = {}
    if (difficulty) {
      where.difficulty = difficulty
    }
    
    const lessons = await prisma.lesson.findMany({
      where,
      skip: parseInt(skip),
      take: parseInt(take),
      select: {
        id: true,
        title: true,
        description: true,
        difficulty: true,
        topics: true,
        createdAt: true,
        _count: {
          select: { problems: true }
        }
      }
    })
    
    const total = await prisma.lesson.count({ where })
    
    return {
      lessons,
      total,
      page: Math.ceil(skip / take) + 1,
      pages: Math.ceil(total / take)
    }
  }
  
  async getLessonById(id) {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        problems: {
          select: {
            id: true,
            title: true,
            description: true,
            difficulty: true
          }
        }
      }
    })
    
    if (!lesson) {
      throw new Error(ERRORS.LESSON_NOT_FOUND)
    }
    
    return lesson
  }
  
  async createLesson(data) {
    return prisma.lesson.create({
      data: {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        content: data.content,
        topics: data.topics || [],
        instructor: data.instructorId
      }
    })
  }
  
  async updateLesson(id, data) {
    const lesson = await prisma.lesson.findUnique({ where: { id } })
    
    if (!lesson) {
      throw new Error(ERRORS.LESSON_NOT_FOUND)
    }
    
    return prisma.lesson.update({
      where: { id },
      data: {
        title: data.title || lesson.title,
        description: data.description || lesson.description,
        difficulty: data.difficulty || lesson.difficulty,
        content: data.content || lesson.content,
        topics: data.topics || lesson.topics
      }
    })
  }
  
  async deleteLesson(id) {
    const lesson = await prisma.lesson.findUnique({ where: { id } })
    
    if (!lesson) {
      throw new Error(ERRORS.LESSON_NOT_FOUND)
    }
    
    return prisma.lesson.delete({ where: { id } })
  }
}

module.exports = new LessonService()
```

### 6. Middleware - Authentication

**`backend/src/middleware/auth.js`**

```javascript
const authService = require('../services/authService')
const { ERRORS } = require('../utils/constants')
const logger = require('../utils/logger')

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        code: 'MISSING_TOKEN',
        message: ERRORS.UNAUTHORIZED
      })
    }
    
    const token = authHeader.split(' ')[1]
    const decoded = authService.verifyToken(token)
    
    req.user = decoded
    next()
  } catch (error) {
    logger.error('Auth middleware error:', error.message)
    res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: ERRORS.UNAUTHORIZED
    })
  }
}
```
