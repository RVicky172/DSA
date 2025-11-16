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

const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = authService.verifyToken(token)
      req.user = decoded
    }
    
    next()
  } catch (error) {
    next()
  }
}

const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: ERRORS.UNAUTHORIZED
      })
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: ERRORS.FORBIDDEN
      })
    }
    
    next()
  }
}

module.exports = {
  authMiddleware,
  optionalAuth,
  requireRole
}
```

### 7. Middleware - Error Handler

**`backend/src/middleware/errorHandler.js`**

```javascript
const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  logger.error('Error handler:', err.message)
  
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'
  const code = err.code || 'INTERNAL_ERROR'
  
  res.status(status).json({
    success: false,
    code,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = errorHandler
```

### 8. Middleware - Validation

**`backend/src/middleware/validation.js`**

```javascript
const validateSignup = (req, res, next) => {
  const { email, password, firstName, lastName } = req.body
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    })
  }
  
  if (!password || password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    })
  }
  
  if (!firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'First name and last name are required'
    })
  }
  
  next()
}

const validateLogin = (req, res, next) => {
  const { email, password } = req.body
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    })
  }
  
  next()
}

module.exports = {
  validateSignup,
  validateLogin
}
```

### 9. Controllers - Authentication

**`backend/src/controllers/authController.js`**

```javascript
const authService = require('../services/authService')
const logger = require('../utils/logger')
const { SUCCESS } = require('../utils/constants')

class AuthController {
  async signup(req, res, next) {
    try {
      const { email, password, firstName, lastName } = req.body
      
      const user = await authService.signup(email, password, firstName, lastName)
      
      logger.success('User signup:', user.email)
      
      res.status(201).json({
        success: true,
        message: SUCCESS.USER_CREATED,
        user
      })
    } catch (error) {
      next(error)
    }
  }
  
  async login(req, res, next) {
    try {
      const { email, password } = req.body
      
      const result = await authService.login(email, password)
      
      logger.success('User login:', email)
      
      res.status(200).json({
        success: true,
        message: SUCCESS.LOGIN_SUCCESS,
        ...result
      })
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      })
    }
  }
  
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body
      
      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        })
      }
      
      const decoded = authService.verifyToken(refreshToken)
      const newAccessToken = authService.generateAccessToken(decoded.userId)
      
      res.status(200).json({
        success: true,
        accessToken: newAccessToken
      })
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      })
    }
  }
}

module.exports = new AuthController()
```

### 10. Controllers - Lessons

**`backend/src/controllers/lessonController.js`**

```javascript
const lessonService = require('../services/lessonService')
const logger = require('../utils/logger')

class LessonController {
  async getAllLessons(req, res, next) {
    try {
      const { difficulty, skip = 0, take = 10 } = req.query
      
      const result = await lessonService.getAllLessons({
        difficulty,
        skip,
        take
      })
      
      res.status(200).json({
        success: true,
        ...result
      })
    } catch (error) {
      next(error)
    }
  }
  
  async getLessonById(req, res, next) {
    try {
      const { id } = req.params
      
      const lesson = await lessonService.getLessonById(id)
      
      res.status(200).json({
        success: true,
        lesson
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      })
    }
  }
  
  async createLesson(req, res, next) {
    try {
      const lesson = await lessonService.createLesson({
        ...req.body,
        instructorId: req.user.userId
      })
      
      logger.success('Lesson created:', lesson.id)
      
      res.status(201).json({
        success: true,
        lesson
      })
    } catch (error) {
      next(error)
    }
  }
  
  async updateLesson(req, res, next) {
    try {
      const { id } = req.params
      
      const lesson = await lessonService.updateLesson(id, req.body)
      
      logger.success('Lesson updated:', id)
      
      res.status(200).json({
        success: true,
        lesson
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      })
    }
  }
  
  async deleteLesson(req, res, next) {
    try {
      const { id } = req.params
      
      await lessonService.deleteLesson(id)
      
      logger.success('Lesson deleted:', id)
      
      res.status(200).json({
        success: true,
        message: 'Lesson deleted successfully'
      })
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      })
    }
  }
}

module.exports = new LessonController()
```

### 11. Routes - Authentication

**`backend/src/routes/auth.routes.js`**

```javascript
const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { validateSignup, validateLogin } = require('../middleware/validation')

// Public routes
router.post('/signup', validateSignup, authController.signup.bind(authController))
router.post('/login', validateLogin, authController.login.bind(authController))
router.post('/refresh', authController.refreshToken.bind(authController))

module.exports = router
```

### 12. Routes - Lessons

**`backend/src/routes/lessons.routes.js`**

```javascript
const express = require('express')
const router = express.Router()
const lessonController = require('../controllers/lessonController')
const { authMiddleware, optionalAuth, requireRole } = require('../middleware/auth')

// Public routes
router.get('/', optionalAuth, lessonController.getAllLessons.bind(lessonController))
router.get('/:id', lessonController.getLessonById.bind(lessonController))

// Protected routes (instructor/admin only)
router.post(
  '/',
  authMiddleware,
  requireRole(['INSTRUCTOR', 'ADMIN']),
  lessonController.createLesson.bind(lessonController)
)

router.put(
  '/:id',
  authMiddleware,
  requireRole(['INSTRUCTOR', 'ADMIN']),
  lessonController.updateLesson.bind(lessonController)
)

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['INSTRUCTOR', 'ADMIN']),
  lessonController.deleteLesson.bind(lessonController)
)

module.exports = router
```

### 13. Routes - Index

**`backend/src/routes/index.js`**

```javascript
const express = require('express')
const router = express.Router()

const authRoutes = require('./auth.routes')
const lessonRoutes = require('./lessons.routes')

// API version v1
router.use('/v1/auth', authRoutes)
router.use('/v1/lessons', lessonRoutes)

// Health check
router.get('/health', (req, res) => {
  res.json({ ok: true })
})

module.exports = router
```

### 14. Updated Main Server File

**`backend/src/index.js`**

```javascript
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const path = require('path')

const apiRoutes = require('./routes')
const errorHandler = require('./middleware/errorHandler')
const logger = require('./utils/logger')

const app = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// API Routes
app.use('/api', apiRoutes)

// Serve static frontend in production
const publicPath = path.join(__dirname, '..', 'public')
app.use(express.static(publicPath))

// SPA fallback
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(publicPath, 'index.html'))
  }
})

// Error handling
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  logger.success(`Server running on http://localhost:${PORT}`)
  logger.info('API endpoints available at http://localhost:' + PORT + '/api')
})

module.exports = app
```

---

## Environment Variables

Create `.env` in backend root:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="postgresql://dsa_user:secure_password_123@localhost:5432/dsa_learning"
JWT_SECRET="your_super_secret_key_here_minimum_32_chars"
JWT_EXPIRE="15m"
REFRESH_TOKEN_EXPIRE="7d"
CORS_ORIGIN="http://localhost:3000"
```

---

## Installation & Setup

```bash
# 1. Install dependencies
cd backend
npm install @prisma/client bcryptjs jsonwebtoken

# 2. Create database
# (See DATABASE_SETUP_GUIDE.md)

# 3. Run migrations
npx prisma migrate dev --name init

# 4. Seed database
npx prisma db seed

# 5. Start development server
npm run dev
```

---

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create new account
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Lessons
- `GET /api/v1/lessons` - List all lessons
- `GET /api/v1/lessons/:id` - Get lesson details
- `POST /api/v1/lessons` - Create lesson (instructor/admin only)
- `PUT /api/v1/lessons/:id` - Update lesson
- `DELETE /api/v1/lessons/:id` - Delete lesson

---

## Testing Endpoints

```bash
# Signup
curl -X POST http://localhost:4000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Get Lessons
curl http://localhost:4000/api/v1/lessons

# Get Lesson Detail
curl http://localhost:4000/api/v1/lessons/{lesson_id}
```

---

## Next Steps

1. ✅ Set up folder structure
2. ✅ Implement services and middleware
3. ✅ Create controllers and routes
4. ✅ Update main server file
5. → Add more endpoints (problems, submissions, progress)
6. → Implement file uploads for code submissions
7. → Add request logging and monitoring
8. → Create API documentation (Swagger/OpenAPI)
