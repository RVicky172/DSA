/**
 * Frontend Error Tracking & Logging
 * Integrates with Sentry for error monitoring
 */

import React from 'react'

// Error tracking initialization
let sentryInitialized = false

export const initializeErrorTracking = () => {
  if (sentryInitialized) return

  const sentryDsn = import.meta.env.VITE_SENTRY_DSN
  if (!sentryDsn) {
    console.log('Sentry error tracking not configured')
    return
  }

  try {
    // Dynamically import Sentry
    import('@sentry/react').then((Sentry) => {
      Sentry.init({
        dsn: sentryDsn,
        environment: import.meta.env.VITE_ENV || 'development',
        tracesSampleRate: import.meta.env.VITE_ENV === 'production' ? 0.1 : 1.0,
        integrations: [
          new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      })
      sentryInitialized = true
      console.log('Sentry error tracking initialized')
    })
  } catch (error) {
    console.warn('Failed to initialize Sentry:', error)
  }
}

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Frontend logger
export class Logger {
  private static getLogLevel(): LogLevel {
    const debugMode = import.meta.env.VITE_DEBUG === 'true'
    return debugMode ? LogLevel.DEBUG : LogLevel.INFO
  }

  private static shouldLog(level: LogLevel): boolean {
    const logLevel = this.getLogLevel()
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    const currentIndex = levels.indexOf(logLevel)
    const messageIndex = levels.indexOf(level)
    return messageIndex >= currentIndex
  }

  private static formatLog(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` | ${JSON.stringify(data)}` : ''
    return `[${timestamp}] [${level}] ${message}${dataStr}`
  }

  static debug(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatLog(LogLevel.DEBUG, message, data))
    }
  }

  static info(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatLog(LogLevel.INFO, message, data))
    }
  }

  static warn(message: string, data?: any): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatLog(LogLevel.WARN, message, data))
    }
  }

  static error(message: string, error?: Error | string, data?: any): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const errorMsg = error instanceof Error ? error.message : error || 'Unknown error'
      console.error(this.formatLog(LogLevel.ERROR, message, { error: errorMsg, ...data }))

      // Report to Sentry
      if (sentryInitialized) {
        import('@sentry/react').then((Sentry) => {
          if (error instanceof Error) {
            Sentry.captureException(error)
          } else {
            Sentry.captureMessage(`${message}: ${error}`, 'error')
          }
        })
      }
    }
  }
}

// Error boundary for React components
interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    Logger.error('React Error Boundary caught error', error, {
      componentStack: errorInfo.componentStack,
    })

    if (sentryInitialized) {
      import('@sentry/react').then((Sentry) => {
        Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
        })
      })
    }
  }

  render(): React.ReactNode {
    const { hasError, error } = this.state
    
    if (hasError) {
      const errorMessage = error?.message || 'Unknown error occurred'
      return React.createElement(
        'div',
        { style: { padding: '20px', textAlign: 'center' as const } },
        React.createElement('h1', undefined, 'Something went wrong'),
        React.createElement('p', undefined, errorMessage),
        React.createElement(
          'button',
          { onClick: () => window.location.reload() },
          'Reload Page'
        )
      )
    }

    return this.props.children
  }
}

// Global error handler
export const setupGlobalErrorHandler = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    Logger.error('Unhandled Promise Rejection', event.reason)
    if (sentryInitialized) {
      import('@sentry/react').then((Sentry) => {
        Sentry.captureException(event.reason)
      })
    }
  })

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    Logger.error('Uncaught Error', event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
    if (sentryInitialized) {
      import('@sentry/react').then((Sentry) => {
        Sentry.captureException(event.error)
      })
    }
  })
}

// API error logger
export const logApiError = (error: any, context?: string) => {
  const errorMessage = error?.response?.data?.error || error?.message || 'Unknown API error'
  const statusCode = error?.response?.status

  Logger.error(`API Error${context ? ` (${context})` : ''}`, errorMessage, {
    statusCode,
    url: error?.config?.url,
  })

  if (sentryInitialized) {
    import('@sentry/react').then((Sentry) => {
      Sentry.captureException(error, {
        tags: {
          type: 'api_error',
          context: context || 'unknown',
        },
      })
    })
  }
}

// Initialize on app load
if (typeof window !== 'undefined') {
  initializeErrorTracking()
  setupGlobalErrorHandler()
}
