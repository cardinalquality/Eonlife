/**
 * CSRF (Cross-Site Request Forgery) Protection
 * Implements token-based CSRF protection for API routes
 */

import { randomBytes, createHash } from 'crypto';

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Hash a CSRF token for secure storage
 */
export function hashCsrfToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verify CSRF token
 */
export function verifyCsrfToken(token: string, hashedToken: string): boolean {
  const hash = hashCsrfToken(token);

  // Use constant-time comparison to prevent timing attacks
  return timingSafeEqual(hash, hashedToken);
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * CSRF token storage (in-memory for stateless apps)
 * In production, use session storage or encrypted cookies
 */
const tokenStore = new Map<string, { hash: string; expires: number }>();

// Clean up expired tokens every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of tokenStore.entries()) {
    if (now >= value.expires) {
      tokenStore.delete(key);
    }
  }
}, 300000);

/**
 * Store CSRF token
 */
export function storeCsrfToken(
  identifier: string,
  token: string,
  expiresInMs: number = 3600000 // 1 hour default
): void {
  const hash = hashCsrfToken(token);
  const expires = Date.now() + expiresInMs;

  tokenStore.set(identifier, { hash, expires });
}

/**
 * Verify stored CSRF token
 */
export function verifyStoredCsrfToken(identifier: string, token: string): boolean {
  const stored = tokenStore.get(identifier);

  if (!stored) {
    return false;
  }

  // Check expiration
  if (Date.now() >= stored.expires) {
    tokenStore.delete(identifier);
    return false;
  }

  return verifyCsrfToken(token, stored.hash);
}

/**
 * CSRF middleware for API routes
 * Validates CSRF token on state-changing operations
 */
export async function csrfMiddleware(
  req: Request,
  identifier: string
): Promise<Response | null> {
  const method = req.method;

  // Only check CSRF on state-changing operations
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return null;
  }

  // Get CSRF token from header or body
  const tokenFromHeader = req.headers.get('x-csrf-token');
  const tokenFromCookie = getCsrfTokenFromCookie(req);

  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return new Response(
      JSON.stringify({
        error: 'CSRF token missing',
        message: 'CSRF token is required for this operation'
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  // Verify token
  const isValid = verifyStoredCsrfToken(identifier, token);

  if (!isValid) {
    return new Response(
      JSON.stringify({
        error: 'Invalid CSRF token',
        message: 'CSRF token is invalid or expired'
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return null;
}

/**
 * Get CSRF token from cookie
 */
function getCsrfTokenFromCookie(req: Request): string | null {
  const cookieHeader = req.headers.get('cookie');
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return cookies['csrf-token'] || null;
}

/**
 * Create CSRF cookie header
 */
export function createCsrfCookie(token: string, secure: boolean = true): string {
  const cookieOptions = [
    `csrf-token=${token}`,
    'HttpOnly',
    'SameSite=Strict',
    'Path=/',
    `Max-Age=${3600}` // 1 hour
  ];

  if (secure) {
    cookieOptions.push('Secure');
  }

  return cookieOptions.join('; ');
}

/**
 * Generate and store CSRF token for a session
 */
export function createCsrfSession(identifier: string): {
  token: string;
  cookie: string;
} {
  const token = generateCsrfToken();
  storeCsrfToken(identifier, token);

  const isProduction = process.env.NODE_ENV === 'production';
  const cookie = createCsrfCookie(token, isProduction);

  return { token, cookie };
}

/**
 * Double Submit Cookie Pattern
 * Alternative CSRF protection using cookie-to-header token
 */
export function verifyDoubleSubmitCookie(req: Request): boolean {
  const tokenFromHeader = req.headers.get('x-csrf-token');
  const tokenFromCookie = getCsrfTokenFromCookie(req);

  if (!tokenFromHeader || !tokenFromCookie) {
    return false;
  }

  // Use timing-safe comparison
  return timingSafeEqual(tokenFromHeader, tokenFromCookie);
}

/**
 * Middleware using double submit cookie pattern
 */
export async function doubleSubmitCsrfMiddleware(req: Request): Promise<Response | null> {
  const method = req.method;

  // Only check CSRF on state-changing operations
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return null;
  }

  const isValid = verifyDoubleSubmitCookie(req);

  if (!isValid) {
    return new Response(
      JSON.stringify({
        error: 'CSRF validation failed',
        message: 'CSRF token validation failed'
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }

  return null;
}
