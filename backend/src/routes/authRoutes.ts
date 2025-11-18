// backend/src/routes/authRoutes.ts
import { Router, Request, Response, NextFunction } from 'express'
import { AuthService } from '../services/authService.js'
import { AppError } from '../middleware/errorHandler.js'
import { verifyToken, AuthRequest } from '../middleware/authMiddleware.js'

const router = Router()

/**
 * POST /api/v1/auth/signup
 * Register a new user
 */
router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, username, password } = req.body

    // Validation
    if (!email || !username || !password) {
      throw new AppError('Email, username, and password are required', 400)
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400)
    }

    const result = await AuthService.signup(email, username, password, 'STUDENT')

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: result,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/v1/auth/login
 * Login user and return JWT token
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      throw new AppError('Email and password are required', 400)
    }

    const result = await AuthService.login(email, password)

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/v1/auth/me
 * Get current user profile (protected)
 */
router.get('/me', verifyToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.userId) {
      throw new AppError('User not found', 401)
    }

    const user = await AuthService.getUserById(req.user.userId)

    res.status(200).json({
      success: true,
      data: user,
    })
  } catch (error) {
    next(error)
  }
})

export default router
