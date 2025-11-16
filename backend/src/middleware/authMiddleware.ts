/**
 * Authentication middleware for protecting routes
 */

import { Request, Response, NextFunction } from 'express'
import type { JwtPayload } from '../types/index.js'
import { AppError } from './errorHandler.js'

export interface AuthRequest extends Request {
  user?: JwtPayload
}

/**
 * Verify JWT token middleware
 * TODO: Implement JWT verification when auth is set up
 */
export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      throw new AppError('No token provided', 401)
    }

    // TODO: Verify token and set req.user
    // const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // req.user = decoded as JwtPayload;

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
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    return next(new AppError('Unauthorized: Admin access required', 403))
  }
  next()
}

/**
 * Check if user is instructor or admin
 */
export const isInstructor = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!['instructor', 'admin'].includes(req.user?.role || '')) {
    return next(
      new AppError('Unauthorized: Instructor access required', 403)
    )
  }
  next()
}
