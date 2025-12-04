# Security Hardening Guide

This guide documents all security measures implemented in the DSA Learning Platform.

## Overview

Security is implemented at multiple layers:
- **HTTP Headers** (Helmet.js)
- **Rate Limiting** (express-rate-limit)
- **CORS** (Cross-Origin Resource Sharing)
- **Input Sanitization** (XSS and MongoDB injection prevention)
- **Input Validation** (Email, password, URL formats)
- **Content Security Policy** (CSP)
- **Authentication & Authorization** (JWT tokens, role-based access)

## 1. Helmet.js - HTTP Security Headers

**Purpose**: Protect against common web vulnerabilities like XSS, Clickjacking, etc.

### Implemented Headers

```
Content-Security-Policy: Controls resource loading (XSS protection)
Strict-Transport-Security: Enforces HTTPS
X-Frame-Options: Prevents clickjacking
X-Content-Type-Options: Prevents MIME sniffing
Referrer-Policy: Controls referrer information
Permissions-Policy: Controls browser features
```

### Configuration

The security middleware in `backend/src/middleware/securityMiddleware.ts` implements:

```typescript
helmet({
  contentSecurityPolicy: { /* CSP rules */ },
  hsts: { maxAge: 31536000 }, // 1 year
  frameguard: { action: 'deny' }, // No iframes
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
})
```

## 2. Rate Limiting

**Purpose**: Prevent brute force attacks, DDoS, and API abuse.

### Three-Tier Rate Limiting

#### General Limiter
- **Applies to**: All requests except health checks
- **Limit**: 100 requests per 15 minutes per IP
- **Purpose**: General API protection

#### Auth Limiter
- **Applies to**: Authentication endpoints (login, signup)
- **Limit**: 5 requests per 15 minutes per IP
- **Purpose**: Prevent brute force password attacks

#### API Limiter
- **Applies to**: API operations
- **Limit**: 60 requests per minute per IP
- **Purpose**: Prevent resource exhaustion

### Usage in Routes

```typescript
import { securityMiddleware } from '../middleware/securityMiddleware'
const security = securityMiddleware()

// Apply auth limiter to login route
router.post('/login', security.authLimiter, (req, res) => {
  // Handle login
})
```

## 3. CORS (Cross-Origin Resource Sharing)

**Purpose**: Control which domains can access your API.

### Configuration

```typescript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
}
```

### Environment-Specific

- **Development**: `http://localhost:3000`
- **Staging**: `https://staging.example.com`
- **Production**: `https://dsa-learning.com`

Set via `CORS_ORIGIN` environment variable.

## 4. Input Validation & Sanitization

**Purpose**: Prevent injection attacks (XSS, NoSQL injection, SQL injection).

### Validation Functions

```typescript
// Email validation
validateInput.isValidEmail('user@example.com') // true/false

// Password validation (8+ chars, uppercase, lowercase, number)
validateInput.isValidPassword('Password123') // true/false

// Username validation (alphanumeric, 3-20 chars)
validateInput.isValidUsername('user_123') // true/false

// URL validation
validateInput.isValidUrl('https://example.com') // true/false
```

### Sanitization Functions

```typescript
// Sanitize string (remove XSS and injection attempts)
validateInput.sanitizeString('<script>alert("xss")</script>') 
// Output: 'scriptalertxssscript'

// HTML escape
validateInput.escapeHtml('<div>') // '&lt;div&gt;'

// Normalize whitespace
validateInput.normalizeString('hello    world') // 'hello world'
```

### Automatic Sanitization

All incoming requests are automatically sanitized:

```typescript
// Sanitizes:
req.body      // POST/PUT data
req.query     // URL query parameters
req.params    // URL path parameters
```

## 5. Content Security Policy (CSP)

**Purpose**: Prevent inline script execution and control resource loading.

### Current CSP Rules

```
default-src 'self'           # Only from same origin
script-src 'self' 'unsafe-inline'  # Scripts from same origin
style-src 'self' 'unsafe-inline'   # Styles from same origin
img-src 'self' data: https:  # Images from same origin, data URIs, and HTTPS
connect-src 'self' https://api.judge0.com  # API calls allowed
font-src 'self' data: https: # Fonts from same origin, data URIs
object-src 'none'            # No embedded objects
frame-src 'none'             # No iframes allowed
```

### How to Modify CSP

Edit `backend/src/middleware/securityMiddleware.ts`:

```typescript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", 'https://trusted-cdn.com"],
    // ... other directives
  },
}
```

## 6. Password Requirements

**Minimum Requirements**:
- At least 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number

**Example Valid Password**: `MyPassword123`

**Why?** Ensures passwords are strong enough to resist brute force attacks.

## 7. JWT (JSON Web Tokens)

**Purpose**: Secure user authentication and authorization.

### Token Structure

```
Header.Payload.Signature
```

**Secret**: Stored in `JWT_SECRET` environment variable

**Expiry**: `JWT_EXPIRY` (default: 24 hours)

**Usage**:
```
Authorization: Bearer <token>
```

### Token Rotation

Never expose the JWT secret and rotate it:
- Monthly in staging
- Quarterly in production
- Immediately if compromised

## 8. Authentication Middleware

All protected routes use authentication middleware:

```typescript
import { authenticateToken } from '../middleware/authMiddleware'

// Protected route
router.get('/protected', authenticateToken, (req, res) => {
  // req.user contains the decoded JWT payload
})
```

## 9. Role-Based Access Control (RBAC)

Routes can be restricted by user role:

```typescript
// Admin-only endpoint
router.get('/admin/stats', authenticateToken, (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.role !== 'INSTRUCTOR') {
    return res.status(403).json({ error: 'Unauthorized' })
  }
  // ...
})
```

## 10. File Upload Security

**Max File Size**: Configurable via `MAX_FILE_SIZE` (default: 5MB)

**Allowed Types** (recommended):
- `.pdf`
- `.txt`
- `.md`
- Images: `.jpg`, `.png`, `.gif`, `.webp`

**Validation**:
```typescript
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880')

if (req.file.size > MAX_FILE_SIZE) {
  return res.status(400).json({ error: 'File too large' })
}
```

## 11. Environment Variable Secrets

**Never**:
- ❌ Commit `.env` files to version control
- ❌ Log sensitive values
- ❌ Use weak secrets
- ❌ Hardcode secrets in code

**Always**:
- ✅ Use strong, randomly generated secrets
- ✅ Store in `.env` (local) or secrets manager (production)
- ✅ Rotate secrets regularly
- ✅ Use different secrets per environment

### Generate Secure Secrets

```bash
# JWT Secret (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Database Password (32 bytes)
openssl rand -base64 32

# Redis Password (32 bytes)
node -e "console.log(require('crypto').randomBytes(24).toString('base64'))"
```

## 12. HTTPS/TLS

**Production Requirements**:
- All traffic must be HTTPS
- Use TLS 1.2 or higher
- Certificate from trusted CA
- HSTS header enforces HTTPS (1 year max-age)

**Configuration**:
```typescript
hsts: {
  maxAge: 31536000, // 1 year
  includeSubDomains: true,
  preload: true,  // Include in HSTS preload list
}
```

## 13. Database Security

### Connection Security
- Use strong passwords (32 characters minimum)
- Always use SSL for remote databases
- Limit database user permissions to specific tables/operations

### SQL Injection Prevention
- Use parameterized queries (Prisma ORM handles this)
- Never concatenate user input into SQL
- Validate and sanitize all inputs

### Data Protection
- Encrypt sensitive fields at rest
- Hash passwords with bcrypt (10+ salt rounds)
- Audit access to sensitive data

## 14. Logging & Monitoring

**Avoid Logging**:
- ❌ Passwords
- ❌ API keys/tokens
- ❌ Credit card numbers
- ❌ Personal data (SSN, addresses)

**Safe to Log**:
- ✅ User IDs
- ✅ IP addresses
- ✅ Request paths
- ✅ Error types (not full stack traces in production)

**Log Levels**:
- `debug`: Development, verbose output
- `info`: Staging, normal events
- `warn`: Warnings, unexpected situations
- `error`: Errors, failures

## 15. Dependency Security

### Weekly Audits

```bash
npm audit
npm audit fix
```

### Known Vulnerabilities

Check for vulnerabilities in dependencies:

```bash
npm audit --production
npm outdated
```

### Update Process

1. Check `npm outdated` for available updates
2. Run tests before updating
3. Update one package at a time
4. Run full test suite
5. Commit changes

## 16. Security Checklist

### Before Deploying to Production

- [ ] All secrets are in environment variables
- [ ] HTTPS/TLS is configured
- [ ] Rate limiting is enabled
- [ ] Input validation is comprehensive
- [ ] Database connections use SSL
- [ ] Passwords are hashed with bcrypt
- [ ] JWT secrets are strong (32+ chars)
- [ ] CORS is restricted to production domain
- [ ] CSP headers are configured
- [ ] Helmet.js middleware is active
- [ ] Database backups are automated
- [ ] Error tracking (Sentry) is configured
- [ ] Logging is structured and secure
- [ ] Dependencies are up to date
- [ ] No hardcoded secrets in code
- [ ] Security tests pass

## 17. Common Vulnerabilities & Solutions

### XSS (Cross-Site Scripting)

**Problem**: Attacker injects malicious scripts

**Solution**:
```typescript
// Automatic sanitization
const cleanInput = sanitizeInput(userInput)

// CSP headers restrict inline scripts
// Use innerHTML with sanitized values
```

### CSRF (Cross-Site Request Forgery)

**Problem**: Attacker tricks user into performing unwanted actions

**Solution**:
```typescript
// Use SameSite cookies
app.use(session({
  cookie: {
    sameSite: 'strict',
    secure: true,
    httpOnly: true,
  },
}))
```

### SQL Injection

**Problem**: Attacker manipulates SQL queries

**Solution**:
```typescript
// Use Prisma ORM - never concatenate SQL
const user = await prisma.user.findUnique({
  where: { email: sanitizedEmail }, // Parameterized
})
```

### Rate Limiting Bypass

**Problem**: Attacker uses proxies to bypass IP-based rate limiting

**Solution**:
```typescript
// Trust proxy headers
app.set('trust proxy', 1)

// Additional validation: require authentication
// Consider CAPTCHA for repeated failures
```

## 18. Related Documentation

- [Environment Management](./ENVIRONMENT_MANAGEMENT.md)
- [Database Security](./DATABASE_SETUP_GUIDE.md)
- [Backend Enhancement Guide](./BACKEND_ENHANCEMENT_GUIDE.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

## 19. Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** open a public GitHub issue
2. Email security team privately
3. Include vulnerability description and reproduction steps
4. Allow reasonable time for a fix before disclosure
5. Responsible disclosure policy: [link to policy]

## 20. Security Updates

Monitor for security updates:

```bash
# Enable npm security notifications
npm install --save-dev npm-audit-resolver

# Check for vulnerabilities regularly
npm audit
```

Subscribe to security mailing lists:
- [Node.js Security](https://nodejs.org/en/about/security/)
- [NPM Security Advisories](https://www.npmjs.com/advisories)
- [OWASP Security Tips](https://owasp.org/)

---

**Last Updated**: December 4, 2025
**Maintained By**: Backend Team
**Review Frequency**: Quarterly
