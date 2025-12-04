/**
 * Security middleware for the DSA Learning Platform
 * Implements:
 * - Helmet.js for HTTP headers
 * - Rate limiting
 * - CORS hardening
 * - Content Security Policy (CSP)
 * - Input validation and sanitization
 */

import express, { Request, Response, NextFunction } from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import validator from 'validator'

// Initialize security middleware
export const securityMiddleware = () => {
  const router = express.Router()

  // 1. Helmet.js - Set various HTTP headers for security
  // This helps protect against common vulnerabilities like XSS, Clickjacking, etc.
  router.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", 'https://api.judge0.com'],
          fontSrc: ["'self'", 'data:', 'https:'],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      frameguard: {
        action: 'deny',
      },
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
    })
  )

  // 2. Rate limiting - Prevent brute force attacks and DDoS
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req: Request) => {
      // Skip rate limiting for health checks
      return req.path === '/api/health'
    },
  })

  // Stricter rate limiting for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per windowMs
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  })

  // Moderate rate limiting for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // Limit each IP to 60 requests per minute
    message: 'Too many API requests, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  })

  // Apply general rate limiter to all requests
  router.use(generalLimiter)

  // Export limiters via module-level exports
  ;(router as unknown as Record<string, unknown>).rateLimiters = { generalLimiter, authLimiter, apiLimiter }

  return router
}

// Export rate limiters for use in routes
export function getRateLimiters() {
  return {
    generalLimiter: rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      message: 'Too many requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req: Request) => req.path === '/api/health'
    }),
    authLimiter: rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 5,
      message: 'Too many authentication attempts, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }),
    apiLimiter: rateLimit({
      windowMs: 60 * 1000,
      max: 60,
      message: 'Too many API requests, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    })
  }
}

// Input validation and sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body)
  }

  // Sanitize query parameters
  if (req.query) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.query = sanitizeObject(req.query) as any
  }

  // Sanitize URL parameters
  if (req.params) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    req.params = sanitizeObject(req.params) as any
  }

  next()
}

// Built-in sanitization utilities
const builtInSanitize = {
  // HTML entity encoding to prevent XSS
  escapeHtml: (str: string): string => {
    const entityMap: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    }
    return str.replace(/[&<>"'/]/g, (s) => entityMap[s])
  },

  // Remove null bytes and control characters
  normalize: (str: string): string => {
    // eslint-disable-next-line no-control-regex
    return str.replace(/\0/g, '').replace(/[\x00-\x1F\x7F]/g, '')
  },

  // Remove NoSQL injection patterns
  removeNoSQLChars: (str: string): string => {
    return str.replace(/[${}]/g, '')
  },

  // Combine all sanitization techniques
  sanitize: (str: string): string => {
    if (typeof str !== 'string') return str
    let cleaned = builtInSanitize.normalize(str)
    cleaned = builtInSanitize.escapeHtml(cleaned)
    cleaned = builtInSanitize.removeNoSQLChars(cleaned)
    return cleaned
  }
}

// Recursive function to sanitize objects
function sanitizeObject(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) {
    if (typeof obj === 'string') {
      // Apply built-in sanitization
      return builtInSanitize.sanitize(obj)
    }
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item))
  }

  const sanitized: Record<string, unknown> = {}
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const objRecord = obj as Record<string, unknown>
      sanitized[key] = sanitizeObject(objRecord[key])
    }
  }
  return sanitized
}

// Input validation utilities
export const validateInput = {
  // Validate email
  isValidEmail: (email: string): boolean => {
    return validator.isEmail(email)
  },

  // Validate password (minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number)
  isValidPassword: (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return passwordRegex.test(password)
  },

  // Validate username (alphanumeric and underscore, 3-20 characters)
  isValidUsername: (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    return usernameRegex.test(username)
  },

  // Validate URL
  isValidUrl: (url: string): boolean => {
    return validator.isURL(url)
  },

  // Validate positive integer
  isValidPositiveInteger: (value: unknown): boolean => {
    return validator.isInt(String(value), { min: 1 })
  },

  // Sanitize string
  sanitizeString: (str: string): string => {
    return builtInSanitize.sanitize(str)
  },

  // Escape HTML
  escapeHtml: (str: string): string => {
    return validator.escape(str)
  },

  // Trim and normalize string
  normalizeString: (str: string): string => {
    return str.trim().replace(/\s+/g, ' ')
  },
}

// Validate email middleware
export const validateEmail = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body.email && !validateInput.isValidEmail(req.body.email)) {
    res.status(400).json({
      success: false,
      error: 'Invalid email format',
    })
    return
  }
  next()
}

// Validate password middleware
export const validatePassword = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body.password && !validateInput.isValidPassword(req.body.password)) {
    res.status(400).json({
      success: false,
      error:
        'Password must be at least 8 characters with uppercase, lowercase, and number',
    })
    return
  }
  next()
}
