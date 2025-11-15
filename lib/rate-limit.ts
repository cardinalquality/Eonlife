/**
 * Rate Limiting Library
 * Provides configurable rate limiting for API endpoints
 * Supports Upstash Redis (production) and in-memory store (development)
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * In-memory rate limiter for development
 * NOTE: This is NOT suitable for production with multiple servers
 */
class MemoryRateLimiter {
  private store: Map<string, { count: number; reset: number }> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;

    // Clean up old entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async limit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
  }> {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // If no entry or window has expired, create new entry
    if (!entry || now >= entry.reset) {
      const reset = now + this.windowMs;
      this.store.set(identifier, { count: 1, reset });
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset
      };
    }

    // Increment count
    entry.count++;
    this.store.set(identifier, entry);

    const success = entry.count <= this.maxRequests;
    const remaining = Math.max(0, this.maxRequests - entry.count);

    return {
      success,
      limit: this.maxRequests,
      remaining,
      reset: entry.reset
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, value] of this.store.entries()) {
      if (now >= value.reset) {
        this.store.delete(key);
      }
    }
  }
}

/**
 * Create rate limiter instance based on environment
 */
function createRateLimiter(maxRequests: number, windowSeconds: number) {
  const windowMs = windowSeconds * 1000;

  // Use Upstash Redis in production if configured
  if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_URL,
        token: process.env.UPSTASH_REDIS_TOKEN
      });

      return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
        analytics: true,
        prefix: '@eonlife/ratelimit'
      });
    } catch (error) {
      console.warn('Failed to initialize Upstash Redis, falling back to in-memory store:', error);
      return new MemoryRateLimiter(maxRequests, windowMs);
    }
  }

  // Use in-memory store for development
  console.log('Using in-memory rate limiter (not suitable for production)');
  return new MemoryRateLimiter(maxRequests, windowMs);
}

/**
 * Pre-configured rate limiters for different use cases
 */
export const ratelimit = {
  // General API endpoints: 10 requests per 10 seconds
  api: createRateLimiter(10, 10),

  // Authentication endpoints: 5 login attempts per hour
  auth: createRateLimiter(5, 3600),

  // Signup endpoints: 3 signup attempts per hour
  signup: createRateLimiter(3, 3600),

  // Password reset: 3 attempts per hour
  passwordReset: createRateLimiter(3, 3600),

  // Email sending: 5 emails per hour
  email: createRateLimiter(5, 3600),

  // File uploads: 10 uploads per hour
  upload: createRateLimiter(10, 3600),

  // Strict rate limit for sensitive operations: 3 requests per minute
  strict: createRateLimiter(3, 60)
};

/**
 * Get client identifier from request
 * Uses IP address or user ID if authenticated
 */
export function getClientIdentifier(req: Request, userId?: string): string {
  if (userId) {
    return `user:${userId}`;
  }

  // Get IP from various headers (in order of preference)
  const forwarded = req.headers.get('x-forwarded-for');
  const real = req.headers.get('x-real-ip');
  const cloudflare = req.headers.get('cf-connecting-ip');

  const ip = cloudflare || real || forwarded?.split(',')[0] || 'unknown';

  return `ip:${ip}`;
}

/**
 * Rate limit middleware for API routes
 */
export async function rateLimitMiddleware(
  req: Request,
  limiterType: keyof typeof ratelimit = 'api',
  userId?: string
): Promise<Response | null> {
  const identifier = getClientIdentifier(req, userId);
  const limiter = ratelimit[limiterType];

  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  if (!success) {
    return new Response(
      JSON.stringify({
        error: 'Too Many Requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        retryAfter: Math.ceil((reset - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(reset).toISOString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
        }
      }
    );
  }

  return null;
}

/**
 * Rate limit check without blocking (for conditional logic)
 */
export async function checkRateLimit(
  req: Request,
  limiterType: keyof typeof ratelimit = 'api',
  userId?: string
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const identifier = getClientIdentifier(req, userId);
  const limiter = ratelimit[limiterType];

  const { success, remaining, reset } = await limiter.limit(identifier);

  return {
    allowed: success,
    remaining,
    reset
  };
}

/**
 * Custom rate limiter for specific use cases
 */
export function createCustomRateLimiter(maxRequests: number, windowSeconds: number) {
  return createRateLimiter(maxRequests, windowSeconds);
}
