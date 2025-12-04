# Logging & Error Tracking Guide

This guide covers structured logging and error tracking setup for the DSA Learning Platform.

## Overview

The platform includes:
- **Structured Logging**: Consistent, machine-readable logs with different levels
- **Error Tracking**: Sentry integration for error monitoring and alerting
- **Performance Monitoring**: Track slow requests and database queries
- **Frontend Error Handling**: React error boundaries and client-side error reporting

## Table of Contents

1. [Structured Logging](#structured-logging)
2. [Backend Logging](#backend-logging)
3. [Frontend Logging](#frontend-logging)
4. [Sentry Integration](#sentry-integration)
5. [Performance Monitoring](#performance-monitoring)
6. [Log Levels](#log-levels)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## Structured Logging

All logs follow a consistent JSON-like format:

```
[2024-12-04T10:30:45.123Z] [INFO] User logged in | {"userId": "123", "email": "user@example.com"}
```

Format: `[timestamp] [level] message | {data}`

**Benefits**:
- Easy to parse by log aggregation tools
- Consistent across all services
- Includes context for debugging

## Backend Logging

### Using the Logger

```typescript
import { Logger } from './middleware/logger'

// Debug level (development)
Logger.debug('Database connection established', { host: 'localhost' })

// Info level (normal operations)
Logger.info('User created', { userId: 123, email: 'user@example.com' })

// Warn level (unexpected but recoverable)
Logger.warn('Slow query detected', { duration: 2500, query: 'SELECT...' })

// Error level (failures)
Logger.error('Database connection failed', error, { host: 'localhost' })
```

### Log Levels

- **DEBUG**: Detailed information for development
  - Database queries
  - Middleware execution
  - Variable values
  - **Never in production**

- **INFO**: General information about application events
  - User actions
  - API requests/responses
  - Authentication events
  - **Used in all environments**

- **WARN**: Unexpected situations that don't prevent operation
  - Slow requests (>1s)
  - Deprecated API usage
  - Missing optional config
  - **Used in all environments**

- **ERROR**: Serious problems that need attention
  - Exceptions
  - Failed operations
  - External service failures
  - **Used in all environments**

### Setting Log Level

Via environment variable:

```bash
# Development
LOG_LEVEL=debug

# Staging
LOG_LEVEL=info

# Production
LOG_LEVEL=error
```

### Request Logging Middleware

Automatically logs all API requests:

```typescript
import { requestLogger } from './middleware/logger'

app.use(requestLogger)
```

Logs:
- Request method, path, and IP
- Response status code
- Request duration
- User agent
- Slow requests (>1 second)

Example output:
```
[2024-12-04T10:30:45.123Z] [DEBUG] Incoming request | {"method":"POST","path":"/api/v1/auth/login","ip":"127.0.0.1"}
[2024-12-04T10:30:46.456Z] [INFO] POST /api/v1/auth/login | {"statusCode":200,"duration":"1331ms"}
[2024-12-04T10:30:46.456Z] [WARN] Slow request detected | {"method":"POST","path":"/api/v1/auth/login","duration":"1331ms"}
```

## Frontend Logging

### Using the Frontend Logger

```typescript
import { Logger, initializeErrorTracking } from './services/errorTracking'

// Initialize error tracking on app load
initializeErrorTracking()

// Debug logging
Logger.debug('Component mounted', { componentName: 'Dashboard' })

// Info logging
Logger.info('User logged in', { userId: 123 })

// Warn logging
Logger.warn('Missing optional prop', { componentName: 'Button', prop: 'icon' })

// Error logging
Logger.error('Failed to fetch data', error, { endpoint: '/api/lessons' })
```

### Error Boundary

Wrap components with error boundary for graceful error handling:

```typescript
import { ErrorBoundary } from './services/errorTracking'

export default function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  )
}
```

When an error occurs in a component:
1. Error is caught by boundary
2. Logged to console
3. Sent to Sentry (if configured)
4. User sees fallback UI with reload button

### API Error Logging

```typescript
import { logApiError } from './services/errorTracking'

try {
  const response = await fetch('/api/lessons')
  const data = await response.json()
} catch (error) {
  logApiError(error, 'fetch lessons')
}
```

### Enable Debug Mode

In development, enable debug logging:

```bash
# frontend/.env.dev
VITE_DEBUG=true
```

## Sentry Integration

### Setup

#### 1. Create Sentry Account

1. Go to [sentry.io](https://sentry.io)
2. Create free account
3. Create new project (select Node.js for backend, React for frontend)
4. Copy DSN

#### 2. Add to Backend

```bash
# backend/.env
SENTRY_DSN=https://your-key@your-project.ingest.sentry.io/123456
```

#### 3. Add to Frontend

```bash
# frontend/.env
VITE_SENTRY_DSN=https://your-key@your-project.ingest.sentry.io/789012
```

### Automatic Error Reporting

Errors are automatically reported when:

**Backend**:
- Unhandled exceptions occur
- Error logging middleware catches errors
- Async operations fail
- Database queries fail

**Frontend**:
- React component renders fail (ErrorBoundary)
- Unhandled promise rejections occur
- Global errors are thrown
- API calls fail

### Manual Error Reporting

```typescript
// Backend
import { Sentry } from './middleware/logger'
Sentry.captureException(error)

// Frontend
import { captureException } from '@sentry/react'
captureException(error)
```

### Sentry Dashboard Features

**Issues Tab**:
- Track occurrences of each error
- See affected users
- Timeline of when errors happened
- Stack traces with source maps

**Alerts Tab**:
- Set up notifications for critical errors
- Threshold alerts (e.g., >10 errors/min)
- Slack/Email/PagerDuty integration

**Releases Tab**:
- Monitor errors by version
- Compare versions
- Deployment tracking

**Performance Tab**:
- Slow transaction detection
- Request latency tracking
- Database query performance

## Performance Monitoring

### Backend Performance

```typescript
import { PerformanceMonitor } from './middleware/logger'

// Record operation duration
const start = Date.now()
const result = await expensiveOperation()
const duration = Date.now() - start
PerformanceMonitor.record('expensiveOperation', duration)

// Get metrics
const metrics = PerformanceMonitor.getMetrics('expensiveOperation')
// { count: 10, min: 500, max: 2500, average: 1200 }
```

### Request Timing

Logs requests that take >1 second:

```
[2024-12-04T10:30:46.456Z] [WARN] Slow request detected | {"method":"POST","path":"/api/v1/problems/submit","duration":"2100ms"}
```

### Database Query Monitoring

```typescript
// Track database queries
import { PerformanceMonitor } from './middleware/logger'

const start = Date.now()
const lessons = await prisma.lesson.findMany()
PerformanceMonitor.record('prisma.lesson.findMany', Date.now() - start)
```

## Best Practices

### What to Log

✅ **DO Log**:
- User actions (login, logout, form submission)
- API request/response status
- Authentication events
- Errors and warnings
- Database operations (in development)
- External service calls
- Configuration loading
- Deployment events

### What NOT to Log

❌ **DON'T Log**:
- Passwords
- API keys or secrets
- Credit card numbers
- Personal data (SSN, addresses)
- JWT tokens (log only first 10 chars)
- Full request/response bodies (log only status)
- Email addresses (unless necessary for support)

### Sanitizing Sensitive Data

```typescript
// Bad - logs entire token
Logger.info('Token created', { token: jwtToken })

// Good - logs only partial token
Logger.info('Token created', { token: jwtToken.substring(0, 10) + '...' })

// Better - don't log token at all
Logger.info('Token created', { userId: user.id })
```

### Structured Data

```typescript
// Bad - unstructured message
Logger.info('User 123 logged in from 192.168.1.1 with user agent Mozilla...')

// Good - structured data
Logger.info('User logged in', {
  userId: 123,
  ip: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
})
```

### Log Correlation

```typescript
// Add request ID for correlating logs
import { v4 as uuidv4 } from 'uuid'

app.use((req, res, next) => {
  req.id = uuidv4()
  Logger.debug('Request started', { requestId: req.id, path: req.path })
  next()
})
```

## Log Aggregation

### Docker Logging

Logs are captured to `docker` logs:

```bash
# View logs
docker logs container_name

# Follow logs
docker logs -f container_name

# Last 100 lines
docker logs --tail=100 container_name
```

### Recommended Log Aggregation Services

**Paid**:
- **ELK Stack** (Elasticsearch, Logstash, Kibana)
- **DataDog** - Full-featured monitoring
- **New Relic** - APM and monitoring
- **CloudWatch** (AWS) - AWS-integrated logging

**Free**:
- **Loki** (Grafana) - Simple log aggregation
- **Graylog** - Self-hosted log management

### Sending Logs to Service

Example with DataDog:

```typescript
import { Logger } from './middleware/logger'
import pino from 'pino'

const pinoLogger = pino({
  transport: {
    target: 'pino-datadog',
    options: {
      apiKey: process.env.DATADOG_API_KEY,
    },
  },
})

Logger.info = (message, data) => {
  pinoLogger.info({ message, ...data })
}
```

## Troubleshooting

### Logs Not Appearing

**Backend**:
1. Check `LOG_LEVEL` environment variable
2. Verify middleware is applied: `app.use(requestLogger)`
3. Ensure logger is imported correctly
4. Check console for errors

**Frontend**:
1. Set `VITE_DEBUG=true`
2. Open browser console (F12)
3. Check if `initializeErrorTracking()` is called
4. Verify Sentry DSN is correct (if using)

### Sentry Not Receiving Errors

1. **Verify DSN**: Check `SENTRY_DSN` in environment
2. **Network**: Ensure outbound HTTPS to sentry.io is allowed
3. **Environment**: Errors only reported in staging/production (not localhost)
4. **Initialization**: Ensure `Sentry.init()` runs before errors
5. **Sample Rate**: Check if error is excluded by `tracesSampleRate`

### Too Many Logs

1. **Reduce log level**: Set `LOG_LEVEL=warn` or `LOG_LEVEL=error`
2. **Filter requests**: Skip logging for health checks
3. **Pagination**: Limit number of detailed logs kept
4. **Rotation**: Implement log rotation to prevent disk overflow

### Performance Issues from Logging

1. **Async logging**: Use async loggers (e.g., pino)
2. **Batch writes**: Group logs before sending
3. **Sampling**: Log only percentage of requests in high-volume scenarios

## Related Documentation

- [Security Hardening Guide](./SECURITY_HARDENING.md)
- [Environment Management Guide](./ENVIRONMENT_MANAGEMENT.md)
- [Backend Enhancement Guide](./BACKEND_ENHANCEMENT_GUIDE.md)

## Monitoring Commands

### View Recent Errors (Backend)

```bash
# Tail logs
docker logs -f dsa-backend-prod | grep ERROR

# Count errors by type
docker logs dsa-backend-prod | grep ERROR | sort | uniq -c
```

### Check Sentry Quota

```bash
# API call to Sentry
curl -X GET "https://sentry.io/api/0/organizations/{org}/projects/" \
  -H "Authorization: Bearer $SENTRY_TOKEN"
```

### Monitor Disk Usage

```bash
# Check log file size
du -sh /var/log/dsa-backend.log

# Rotate logs
logrotate /etc/logrotate.d/dsa-backend
```

---

**Last Updated**: December 4, 2025
**Maintained By**: DevOps Team
**Review Frequency**: Quarterly
