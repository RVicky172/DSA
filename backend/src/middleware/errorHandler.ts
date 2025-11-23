/**
 * Error handling middleware for Express
 */

import { Request, Response, NextFunction } from 'express'
import type { ApiResponse } from '../types'

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500
  ) {
    super(message)
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err)

  const statusCode =
    err instanceof AppError ? err.statusCode : 500
  const message = err.message || 'Internal Server Error'

  const response: ApiResponse<null> = {
    success: false,
    error: message,
  }

  res.status(statusCode).json(response)
}

export const asyncHandler =
  (
    fn: (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<void>
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
