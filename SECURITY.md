# Security Implementation Guide

This document provides comprehensive information about the security features implemented in the Eonlife application.

## Table of Contents

1. [Security Overview](#security-overview)
2. [Security Headers](#security-headers)
3. [SSL/HTTPS Configuration](#sslhttps-configuration)
4. [Rate Limiting](#rate-limiting)
5. [Input Validation](#input-validation)
6. [XSS Protection](#xss-protection)
7. [CSRF Protection](#csrf-protection)
8. [Password Security](#password-security)
9. [SQL Injection Prevention](#sql-injection-prevention)
10. [API Security](#api-security)
11. [Deployment Security](#deployment-security)
12. [Security Monitoring](#security-monitoring)
13. [Security Checklist](#security-checklist)

## Security Overview

The application implements multiple layers of security to protect against common web vulnerabilities:

- **OWASP Top 10 Protection**: Guards against the most critical web application security risks
- **Defense in Depth**: Multiple security layers to ensure comprehensive protection
- **Secure by Default**: Security features enabled out of the box
- **Zero Trust Architecture**: Every request is validated and sanitized

## Security Headers

**Location**: `next.config.ts`

### Implemented Headers

1. **Strict-Transport-Security (HSTS)**
   - Forces HTTPS for 2 years
   - Includes all subdomains
   - Preload ready

2. **X-Frame-Options**
   - Prevents clickjacking attacks
   - Set to `SAMEORIGIN`

3. **X-Content-Type-Options**
   - Prevents MIME type sniffing
   - Set to `nosniff`

4. **X-XSS-Protection**
   - Enables XSS filter in older browsers
   - Set to `1; mode=block`

5. **Content-Security-Policy (CSP)**
   - Restricts resource loading
   - Prevents XSS and data injection attacks

6. **Referrer-Policy**
   - Controls referrer information
   - Set to `strict-origin-when-cross-origin`

7. **Permissions-Policy**
   - Restricts browser features
   - Disables camera, microphone, geolocation

### Verification

Test headers at: https://securityheaders.com

```bash
curl -I https://your-domain.com
```

## SSL/HTTPS Configuration

### Automatic SSL (Recommended)

**Vercel Deployment**:
- SSL is automatic and free
- Certificates auto-renew
- HTTPS enforced by default

**Netlify Deployment**:
- One-click SSL via Let's Encrypt
- Auto-renewal included
- Custom domains supported

### Manual SSL Configuration

For custom hosting with nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### Let's Encrypt Setup

```bash
# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
# Test renewal with:
sudo certbot renew --dry-run
```

## Rate Limiting

**Location**: `lib/rate-limit.ts`

### Available Rate Limiters

| Limiter | Limit | Window | Use Case |
|---------|-------|--------|----------|
| `api` | 10 requests | 10 seconds | General API endpoints |
| `auth` | 5 requests | 1 hour | Login attempts |
| `signup` | 3 requests | 1 hour | User registration |
| `passwordReset` | 3 requests | 1 hour | Password reset |
| `email` | 5 requests | 1 hour | Email sending |
| `upload` | 10 requests | 1 hour | File uploads |
| `strict` | 3 requests | 1 minute | Sensitive operations |

### Configuration

#### Development (In-Memory)

Works automatically, no configuration needed.

**Note**: Not suitable for production with multiple servers.

#### Production (Upstash Redis)

1. Sign up at https://upstash.com
2. Create a Redis database
3. Add credentials to `.env.local`:

```bash
UPSTASH_REDIS_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_TOKEN=your-token-here
```

### Usage Example

```typescript
import { rateLimitMiddleware } from '@/lib/rate-limit';

export async function POST(req: Request) {
  // Apply rate limiting
  const rateLimitError = await rateLimitMiddleware(req, 'api');
  if (rateLimitError) return rateLimitError;

  // Your endpoint logic here
}
```

## Input Validation

**Location**: `lib/validation.ts`

### Available Schemas

```typescript
import { schemas, formSchemas } from '@/lib/validation';

// Individual fields
schemas.email        // Email validation
schemas.password     // Strong password requirements
schemas.name         // Name validation
schemas.phone        // Phone number
schemas.address      // Full address
schemas.url          // URL validation
schemas.creditCard   // Credit card with Luhn check

// Complete forms
formSchemas.contact       // Contact form
formSchemas.newsletter    // Newsletter signup
formSchemas.registration  // User registration
formSchemas.login         // Login form
```

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Maximum 128 characters

### Usage Example

```typescript
import { validateInput, formatValidationErrors } from '@/lib/validation';
import { schemas } from '@/lib/validation';

const result = validateInput(schemas.email, userInput);

if (!result.success) {
  const errors = formatValidationErrors(result.errors);
  // Handle errors
} else {
  // Use validated data: result.data
}
```

## XSS Protection

**Location**: `lib/sanitization.ts`

### Sanitization Profiles

1. **STRICT**: No HTML allowed
2. **BASIC**: Basic text formatting only
3. **STANDARD**: Common formatting and links
4. **RICH**: Full rich text editor support

### Usage Examples

```typescript
import {
  sanitizeHtml,
  sanitizeUserContent,
  stripHtml,
  escapeHtml,
  sanitizeUrl
} from '@/lib/sanitization';

// Sanitize user-generated content
const safe = sanitizeUserContent(userInput);

// Remove all HTML
const text = stripHtml(htmlContent);

// Escape HTML characters
const escaped = escapeHtml(untrustedText);

// Sanitize URLs (blocks javascript:, data:, etc.)
const safeUrl = sanitizeUrl(userProvidedUrl);
```

### Automatic Protection

Next.js provides built-in XSS protection:
- All variables in JSX are automatically escaped
- `dangerouslySetInnerHTML` is avoided (not used in this project)

## CSRF Protection

**Location**: `lib/csrf.ts`

### Implementation Methods

#### 1. Double Submit Cookie Pattern (Recommended for APIs)

```typescript
import { doubleSubmitCsrfMiddleware } from '@/lib/csrf';

export async function POST(req: Request) {
  const csrfError = await doubleSubmitCsrfMiddleware(req);
  if (csrfError) return csrfError;

  // Your logic here
}
```

Client-side:
```typescript
// Get CSRF token
const response = await fetch('/api/csrf-token');
const { csrfToken } = await response.json();

// Include in requests
fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify(data)
});
```

#### 2. Synchronizer Token Pattern

```typescript
import { csrfMiddleware, createCsrfSession } from '@/lib/csrf';

// Generate token for session
const { token, cookie } = createCsrfSession(userId);

// Verify on subsequent requests
const csrfError = await csrfMiddleware(req, userId);
```

### When to Use CSRF Protection

- All state-changing operations (POST, PUT, DELETE, PATCH)
- Form submissions
- API endpoints that modify data

## Password Security

**Location**: `lib/password.ts`

### Password Hashing

```typescript
import { hashPassword, verifyPassword } from '@/lib/password';

// Hash a password (auto-validates strength)
const hash = await hashPassword(password);

// Verify password
const isValid = await verifyPassword(password, hash);
```

### Password Strength Evaluation

```typescript
import { evaluatePasswordStrength } from '@/lib/password';

const strength = evaluatePasswordStrength(password);
// Returns: { score: 0-4, feedback: string[], isAcceptable: boolean }
```

### Password Reset Tokens

```typescript
import { generateResetToken, verifyResetToken } from '@/lib/password';

// Generate token
const { token, hash, expires } = generateResetToken();
// Store hash and expires in database

// Verify token
const result = verifyResetToken(token, storedHash, expiresAt);
if (result.valid) {
  // Allow password reset
}
```

### Best Practices

1. Never store plain-text passwords
2. Use bcrypt with cost factor 12 (default)
3. Implement password history (prevent reuse)
4. Require password changes periodically
5. Use secure password reset flow
6. Implement account lockout after failed attempts

## SQL Injection Prevention

### Using Prisma (Recommended)

```typescript
// GOOD: Parameterized query
const user = await prisma.user.findUnique({
  where: { email: userInput }
});

// GOOD: Safe raw query with parameters
const users = await prisma.$queryRaw`
  SELECT * FROM users WHERE email = ${userInput}
`;

// BAD: String interpolation (NEVER DO THIS)
const users = await prisma.$queryRaw(
  `SELECT * FROM users WHERE email = '${userInput}'`
);
```

### Using Other ORMs

Always use parameterized queries:

```typescript
// MySQL example
connection.execute(
  'SELECT * FROM users WHERE email = ?',
  [userInput]
);

// PostgreSQL example
client.query(
  'SELECT * FROM users WHERE email = $1',
  [userInput]
);
```

## API Security

**Location**: `lib/api-middleware.ts`

### Comprehensive API Wrapper

```typescript
import { withSecurity } from '@/lib/api-middleware';

export async function POST(req: Request) {
  return withSecurity(
    req,
    async (request, userId) => {
      // Your secure endpoint logic
    },
    {
      allowedMethods: ['POST'],
      requireAuth: true,
      rateLimit: {
        enabled: true,
        type: 'api'
      },
      csrf: {
        enabled: true,
        useDoubleSubmit: true
      },
      cors: {
        enabled: true,
        origin: 'https://your-domain.com',
        methods: ['POST']
      }
    }
  );
}
```

### API Response Helpers

```typescript
import { createApiResponse, createErrorResponse } from '@/lib/api-middleware';

// Success response
return createApiResponse({ data: result }, 200);

// Error response
return createErrorResponse('Not found', 404);
```

## Deployment Security

### Vercel Deployment

1. **Environment Variables**:
   - Add all secrets in Vercel dashboard
   - Never commit `.env.local`

2. **Automatic Features**:
   - SSL certificates
   - DDoS protection
   - Edge caching
   - Automatic security headers

3. **Additional Configuration**:
   ```json
   // vercel.json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           }
         ]
       }
     ]
   }
   ```

### Docker Deployment

```dockerfile
# Use official Node.js runtime
FROM node:18-alpine

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY --chown=nextjs:nodejs . .

# Build application
RUN npm run build

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

### Environment-Specific Configuration

```typescript
// lib/config.ts
export const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  security: {
    enableCsrf: process.env.NODE_ENV === 'production',
    requireHttps: process.env.NODE_ENV === 'production',
    enableRateLimit: true,
  },

  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  }
};
```

## Security Monitoring

### Error Tracking with Sentry

1. **Install Sentry**:
```bash
npm install @sentry/nextjs
```

2. **Configure**:
```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

3. **Capture Security Events**:
```typescript
import * as Sentry from '@sentry/nextjs';

// Log rate limit violations
Sentry.captureMessage('Rate limit exceeded', {
  level: 'warning',
  extra: { ip, endpoint }
});

// Log validation failures
Sentry.captureMessage('Validation failed', {
  level: 'info',
  extra: { errors }
});
```

### Logging Best Practices

```typescript
// Good: Log security events
console.log('Authentication failed', { ip, timestamp });

// Bad: Log sensitive data
console.log('Login attempt', { password }); // NEVER DO THIS
```

### Security Audit Logging

```typescript
// lib/audit-log.ts
export function logSecurityEvent(
  event: string,
  details: Record<string, any>
) {
  const entry = {
    timestamp: new Date().toISOString(),
    event,
    ...details
  };

  // Log to your logging service
  console.log(JSON.stringify(entry));
}

// Usage
logSecurityEvent('failed_login', {
  ip: req.ip,
  email: email,
  reason: 'invalid_password'
});
```

## Security Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] `.env.local` not committed to git
- [ ] SSL certificate configured
- [ ] Security headers verified
- [ ] Rate limiting configured
- [ ] CSRF protection enabled
- [ ] Input validation on all forms
- [ ] Output sanitization implemented
- [ ] SQL injection prevention verified
- [ ] XSS protection tested
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies up to date (`npm audit`)
- [ ] Security headers tested (securityheaders.com)
- [ ] Penetration testing completed

### Post-Deployment

- [ ] SSL certificate verified (ssllabs.com)
- [ ] Security monitoring configured
- [ ] Log monitoring enabled
- [ ] Backup strategy implemented
- [ ] Incident response plan documented
- [ ] Security contacts established
- [ ] Regular security updates scheduled

### Ongoing Maintenance

- [ ] Weekly: Check for dependency updates
- [ ] Monthly: Review security logs
- [ ] Monthly: Run `npm audit`
- [ ] Quarterly: Security audit
- [ ] Quarterly: Penetration testing
- [ ] Yearly: SSL certificate renewal check

## Security Testing

### Manual Testing

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check for outdated packages
npm outdated

# Update packages
npm update
```

### Automated Testing

```typescript
// __tests__/security.test.ts
import { validateInput } from '@/lib/validation';
import { sanitizeHtml } from '@/lib/sanitization';
import { schemas } from '@/lib/validation';

describe('Security', () => {
  describe('Input Validation', () => {
    it('should reject invalid email', () => {
      const result = validateInput(schemas.email, 'invalid');
      expect(result.success).toBe(false);
    });
  });

  describe('XSS Protection', () => {
    it('should remove script tags', () => {
      const dirty = '<script>alert("xss")</script>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('script');
    });
  });
});
```

## Resources

### Security Tools

- **SSL Test**: https://www.ssllabs.com/ssltest/
- **Security Headers**: https://securityheaders.com
- **OWASP ZAP**: https://www.zaproxy.org/
- **npm audit**: Built into npm
- **Snyk**: https://snyk.io/

### Documentation

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **Next.js Security**: https://nextjs.org/docs/advanced-features/security-headers
- **MDN Security**: https://developer.mozilla.org/en-US/docs/Web/Security

### Support

For security issues, please contact: security@eonlife.com

**Do not** open public issues for security vulnerabilities.

---

**Last Updated**: 2024-01-15
**Version**: 1.0.0
