/**
 * Structured Logging & Error Tracking Middleware
 * Provides:
 * - Structured logging with different log levels
 * - Error tracking integration (Sentry)
 * - Request/response logging
 * - Performance monitoring
 */

import { Request, Response, NextFunction } from 'express'
import * as Sentry from '@sentry/node'

// Initialize Sentry (if DSN is provided)
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      // Express integration automatically enabled when Express is imported
    ],
  })
}

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Logger utility
export class Logger {
  private static getLogLevel(): LogLevel {
    const level = process.env.LOG_LEVEL || 'info'
    switch (level.toLowerCase()) {
      case 'debug':
        return LogLevel.DEBUG
      case 'info':
        return LogLevel.INFO
      case 'warn':
        return LogLevel.WARN
      case 'error':
        return LogLevel.ERROR
      default:
        return LogLevel.INFO
    }
  }

  private static shouldLog(level: LogLevel): boolean {
    const logLevel = this.getLogLevel()
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    const currentIndex = levels.indexOf(logLevel)
    const messageIndex = levels.indexOf(level)
    return messageIndex >= currentIndex
  }

  private static formatLog(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` | ${JSON.stringify(data)}` : ''
    return `[${timestamp}] [${level}] ${message}${dataStr}`
  }

  static debug(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      // eslint-disable-next-line no-console
      console.log(this.formatLog(LogLevel.DEBUG, message, data))
    }
  }

  static info(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.INFO)) {
      // eslint-disable-next-line no-console
      console.log(this.formatLog(LogLevel.INFO, message, data))
    }
  }

  static warn(message: string, data?: unknown): void {
    if (this.shouldLog(LogLevel.WARN)) {
      // eslint-disable-next-line no-console
      console.warn(this.formatLog(LogLevel.WARN, message, data))
    }
  }

  static error(message: string, error?: Error | string, data?: unknown): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorMsg = error instanceof Error ? error.message : error || 'Unknown error'
      // eslint-disable-next-line no-console
      console.error(this.formatLog(LogLevel.ERROR, message, { error: errorMsg, ...(data as Record<string, unknown>) }))

      // Report to Sentry
      if (process.env.SENTRY_DSN && error) {
        if (error instanceof Error) {
          Sentry.captureException(error)
        } else {
          Sentry.captureMessage(error, 'error')
        }
      }
    }
  }
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()

  // Skip logging for health checks
  if (req.path === '/api/health') {
    return next()
  }

  // Log request
  Logger.debug('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  })

  // Capture response
  const originalSend = res.send
  res.send = function (data: unknown) {
    const duration = Date.now() - start

    // Log response
    Logger.info(`${req.method} ${req.path}`, {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    })

    // Log slow requests
    if (duration > 1000) {
      Logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`,
      })
    }

    // Log errors
    if (res.statusCode >= 400) {
      Logger.warn(`HTTP ${res.statusCode}: ${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent'),
      })
    }

    return originalSend.call(this, data)
  }

  next()
}

// Error logging middleware
export const errorLogger = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error details
  Logger.error(`Error occurred: ${err.message}`, err, {
    method: req.method,
    path: req.path,
    ip: req.ip,
    timestamp: new Date().toISOString(),
  })

  // Report to Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(err, {
      tags: {
        endpoint: `${req.method} ${req.path}`,
      },
      contexts: {
        request: {
          method: req.method,
          path: req.path,
          url: req.url,
          ip_address: req.ip,
        },
      },
    })
  }

  next(err)
}

// Frontend error tracking (for client-side errors)
export interface ClientError {
  message: string
  stack?: string
  url?: string
  timestamp?: string
  userAgent?: string
}

export const logClientError = (error: ClientError) => {
  Logger.error('Client-side error', error.message, {
    url: error.url,
    stack: error.stack,
    userAgent: error.userAgent,
  })

  // Report to Sentry
  if (process.env.SENTRY_DSN) {
    Sentry.captureMessage(`Client Error: ${error.message}`, 'error')
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()

  static record(name: string, duration: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    this.metrics.get(name)!.push(duration)

    // Log if average exceeds 1 second
    const values = this.metrics.get(name)!
    const average = values.reduce((a, b) => a + b, 0) / values.length
    if (average > 1000) {
      Logger.warn(`Slow operation: ${name}`, {
        duration: `${duration}ms`,
        average: `${average.toFixed(2)}ms`,
      })
    }
  }

  static getMetrics(name?: string): Record<string, unknown> {
    if (name) {
      const values = this.metrics.get(name) || []
      return {
        count: values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        average: values.reduce((a, b) => a + b, 0) / values.length,
      }
    }

    return Object.fromEntries(
      [...this.metrics.entries()].map(([key, values]) => [
        key,
        {
          count: values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          average: values.reduce((a, b) => a + b, 0) / values.length,
        },
      ])
    )
  }

  static reset(): void {
    this.metrics.clear()
  }
}

// Sentry error boundary helper
export const withErrorTracking = (fn: (...args: unknown[]) => Promise<unknown>) => {
  return async (...args: unknown[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      if (process.env.SENTRY_DSN) {
        Sentry.captureException(error)
      }
      throw error
    }
  }
}

// Log uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  Logger.error('Uncaught Exception', error)
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error)
  }
})

// Log unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  Logger.error('Unhandled Rejection', reason as Error)
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(reason)
  }
})

export { Sentry }
