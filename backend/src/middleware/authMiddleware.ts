/**
 * Authentication middleware for protecting routes
 */

import { Request, Response, NextFunction } from 'express'
import type { JwtPayload } from '../types'
import { AppError } from './errorHandler'
import { AuthService } from '../services/authService'

export interface AuthRequest extends Request {
  user?: JwtPayload
}

/**
 * Verify JWT token middleware
 */
export const verifyToken = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw new AppError('No token provided', 401)
    }

    const decoded = AuthService.verifyToken(token)
    
    if (!decoded) {
      throw new AppError('Invalid or expired token', 401)
    }

    req.user = decoded as JwtPayload

    next()
  } catch (error) {
    next(error)
  }
}

/**
 * Check if user is admin
 */
export const isAdmin = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'ADMIN') {
    return next(new AppError('Unauthorized: Admin access required', 403))
  }
  next()
}

/**
 * Check if user is instructor or admin
 */
export const isInstructor = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!['INSTRUCTOR', 'ADMIN'].includes(req.user?.role || '')) {
    return next(
      new AppError('Unauthorized: Instructor access required', 403)
    )
  }
  next()
}
