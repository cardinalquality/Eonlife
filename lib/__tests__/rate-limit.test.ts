/**
 * Unit tests for Rate Limiting
 * Tests in-memory and distributed rate limiting functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  ratelimit,
  getClientIdentifier,
  rateLimitMiddleware,
  checkRateLimit,
  createCustomRateLimiter
} from '../rate-limit';

// Mock Upstash
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn().mockImplementation(() => ({
    limit: vi.fn()
  }))
}));

vi.mock('@upstash/redis', () => ({
  Redis: vi.fn()
}));

describe('Rate Limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Clear environment variables for consistent testing
    delete process.env.UPSTASH_REDIS_URL;
    delete process.env.UPSTASH_REDIS_TOKEN;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getClientIdentifier', () => {
    it('should use user ID if provided', () => {
      const req = new Request('https://example.com');
      const identifier = getClientIdentifier(req, 'user_123');

      expect(identifier).toBe('user:user_123');
    });

    it('should extract IP from x-forwarded-for header', () => {
      const req = new Request('https://example.com', {
        headers: { 'x-forwarded-for': '192.168.1.1, 10.0.0.1' }
      });

      const identifier = getClientIdentifier(req);

      expect(identifier).toBe('ip:192.168.1.1');
    });

    it('should extract IP from x-real-ip header', () => {
      const req = new Request('https://example.com', {
        headers: { 'x-real-ip': '192.168.1.2' }
      });

      const identifier = getClientIdentifier(req);

      expect(identifier).toBe('ip:192.168.1.2');
    });

    it('should prefer cf-connecting-ip header', () => {
      const req = new Request('https://example.com', {
        headers: {
          'cf-connecting-ip': '1.2.3.4',
          'x-real-ip': '192.168.1.2',
          'x-forwarded-for': '192.168.1.1'
        }
      });

      const identifier = getClientIdentifier(req);

      expect(identifier).toBe('ip:1.2.3.4');
    });

    it('should prefer x-real-ip over x-forwarded-for', () => {
      const req = new Request('https://example.com', {
        headers: {
          'x-real-ip': '192.168.1.2',
          'x-forwarded-for': '192.168.1.1'
        }
      });

      const identifier = getClientIdentifier(req);

      expect(identifier).toBe('ip:192.168.1.2');
    });

    it('should use "unknown" if no IP headers found', () => {
      const req = new Request('https://example.com');

      const identifier = getClientIdentifier(req);

      expect(identifier).toBe('ip:unknown');
    });

    it('should extract first IP from comma-separated list', () => {
      const req = new Request('https://example.com', {
        headers: { 'x-forwarded-for': '10.0.0.1, 192.168.1.1, 172.16.0.1' }
      });

      const identifier = getClientIdentifier(req);

      expect(identifier).toBe('ip:10.0.0.1');
    });
  });

  describe('Pre-configured rate limiters', () => {
    it('should have api rate limiter', () => {
      expect(ratelimit.api).toBeDefined();
      expect(typeof ratelimit.api.limit).toBe('function');
    });

    it('should have auth rate limiter', () => {
      expect(ratelimit.auth).toBeDefined();
      expect(typeof ratelimit.auth.limit).toBe('function');
    });

    it('should have signup rate limiter', () => {
      expect(ratelimit.signup).toBeDefined();
      expect(typeof ratelimit.signup.limit).toBe('function');
    });

    it('should have passwordReset rate limiter', () => {
      expect(ratelimit.passwordReset).toBeDefined();
      expect(typeof ratelimit.passwordReset.limit).toBe('function');
    });

    it('should have email rate limiter', () => {
      expect(ratelimit.email).toBeDefined();
      expect(typeof ratelimit.email.limit).toBe('function');
    });

    it('should have upload rate limiter', () => {
      expect(ratelimit.upload).toBeDefined();
      expect(typeof ratelimit.upload.limit).toBe('function');
    });

    it('should have strict rate limiter', () => {
      expect(ratelimit.strict).toBeDefined();
      expect(typeof ratelimit.strict.limit).toBe('function');
    });
  });

  describe('In-memory rate limiter', () => {
    it('should allow requests within limit', async () => {
      const limiter = createCustomRateLimiter(5, 10);

      const result = await limiter.limit('test-identifier');

      expect(result.success).toBe(true);
      expect(result.limit).toBe(5);
      expect(result.remaining).toBe(4);
    });

    it('should track remaining requests', async () => {
      const limiter = createCustomRateLimiter(3, 10);

      await limiter.limit('test-id');
      const result = await limiter.limit('test-id');

      expect(result.remaining).toBe(1);
    });

    it('should block requests after limit exceeded', async () => {
      const limiter = createCustomRateLimiter(2, 10);

      await limiter.limit('test-id');
      await limiter.limit('test-id');
      const result = await limiter.limit('test-id');

      expect(result.success).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should reset after window expires', async () => {
      const limiter = createCustomRateLimiter(2, 1); // 1 second window

      await limiter.limit('test-id');
      await limiter.limit('test-id');

      // Wait for window to expire
      vi.advanceTimersByTime(1001);

      const result = await limiter.limit('test-id');

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
    });

    it('should track separate identifiers independently', async () => {
      const limiter = createCustomRateLimiter(2, 10);

      await limiter.limit('user-1');
      await limiter.limit('user-1');
      const user1Result = await limiter.limit('user-1');

      const user2Result = await limiter.limit('user-2');

      expect(user1Result.success).toBe(false);
      expect(user2Result.success).toBe(true);
    });

    it('should provide reset timestamp', async () => {
      const limiter = createCustomRateLimiter(5, 10);
      const before = Date.now();

      const result = await limiter.limit('test-id');

      expect(result.reset).toBeGreaterThan(before);
      expect(result.reset).toBeLessThanOrEqual(before + 10000);
    });

    it('should handle multiple requests correctly', async () => {
      const limiter = createCustomRateLimiter(3, 10);

      const results = [];
      for (let i = 0; i < 5; i++) {
        results.push(await limiter.limit('test-id'));
      }

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[2].success).toBe(true);
      expect(results[3].success).toBe(false);
      expect(results[4].success).toBe(false);
    });

    it('should maintain limit after exceeding', async () => {
      const limiter = createCustomRateLimiter(2, 10);

      await limiter.limit('test-id');
      await limiter.limit('test-id');
      await limiter.limit('test-id');
      const result = await limiter.limit('test-id');

      expect(result.limit).toBe(2);
      expect(result.success).toBe(false);
    });
  });

  describe('rateLimitMiddleware', () => {
    it('should allow request within limit', async () => {
      const req = new Request('https://example.com', {
        headers: { 'x-real-ip': '192.168.1.1' }
      });

      const result = await rateLimitMiddleware(req, 'api');

      expect(result).toBeNull();
    });

    it('should block request after limit exceeded', async () => {
      const req = new Request('https://example.com', {
        headers: { 'x-real-ip': '192.168.1.100' }
      });

      // Make requests up to the limit
      const limiter = createCustomRateLimiter(2, 60);
      await limiter.limit('ip:192.168.1.100');
      await limiter.limit('ip:192.168.1.100');

      // This should be blocked (manually test the blocked response)
      const mockLimiter = {
        limit: vi.fn().mockResolvedValue({
          success: false,
          limit: 2,
          remaining: 0,
          reset: Date.now() + 60000
        })
      };

      // Override the ratelimit object temporarily
      const originalApi = ratelimit.api;
      (ratelimit as any).api = mockLimiter;

      const result = await rateLimitMiddleware(req, 'api');

      expect(result).not.toBeNull();
      expect(result?.status).toBe(429);

      // Restore
      (ratelimit as any).api = originalApi;
    });

    it('should include rate limit headers in error response', async () => {
      const req = new Request('https://example.com');

      const mockLimiter = {
        limit: vi.fn().mockResolvedValue({
          success: false,
          limit: 10,
          remaining: 0,
          reset: Date.now() + 3600000
        })
      };

      const originalApi = ratelimit.api;
      (ratelimit as any).api = mockLimiter;

      const result = await rateLimitMiddleware(req, 'api');

      expect(result?.headers.get('X-RateLimit-Limit')).toBe('10');
      expect(result?.headers.get('X-RateLimit-Remaining')).toBe('0');
      expect(result?.headers.get('Retry-After')).toBeDefined();

      (ratelimit as any).api = originalApi;
    });

    it('should return JSON error response', async () => {
      const req = new Request('https://example.com');

      const mockLimiter = {
        limit: vi.fn().mockResolvedValue({
          success: false,
          limit: 10,
          remaining: 0,
          reset: Date.now() + 60000
        })
      };

      const originalApi = ratelimit.api;
      (ratelimit as any).api = mockLimiter;

      const result = await rateLimitMiddleware(req, 'api');
      const body = await result?.json();

      expect(body?.error).toBe('Too Many Requests');
      expect(body?.message).toContain('rate limit');
      expect(body?.retryAfter).toBeDefined();

      (ratelimit as any).api = originalApi;
    });

    it('should use different limiters based on type', async () => {
      const req = new Request('https://example.com');

      // Test that different limiter types work
      await rateLimitMiddleware(req, 'api');
      await rateLimitMiddleware(req, 'auth');
      await rateLimitMiddleware(req, 'strict');

      // Should not throw
      expect(true).toBe(true);
    });

    it('should use provided user ID for identifier', async () => {
      const req = new Request('https://example.com');

      const result = await rateLimitMiddleware(req, 'api', 'user_123');

      // Should use user-based identifier instead of IP
      expect(result).toBeNull(); // Within limit
    });

    it('should calculate retry-after in seconds', async () => {
      const req = new Request('https://example.com');
      const resetTime = Date.now() + 120000; // 2 minutes

      const mockLimiter = {
        limit: vi.fn().mockResolvedValue({
          success: false,
          limit: 10,
          remaining: 0,
          reset: resetTime
        })
      };

      const originalApi = ratelimit.api;
      (ratelimit as any).api = mockLimiter;

      const result = await rateLimitMiddleware(req, 'api');
      const retryAfter = parseInt(result?.headers.get('Retry-After') || '0');

      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(120);

      (ratelimit as any).api = originalApi;
    });
  });

  describe('checkRateLimit', () => {
    it('should check rate limit without blocking', async () => {
      const req = new Request('https://example.com', {
        headers: { 'x-real-ip': '192.168.1.50' }
      });

      const result = await checkRateLimit(req, 'api');

      expect(result).toHaveProperty('allowed');
      expect(result).toHaveProperty('remaining');
      expect(result).toHaveProperty('reset');
    });

    it('should return allowed true within limit', async () => {
      const req = new Request('https://example.com', {
        headers: { 'x-real-ip': '192.168.1.51' }
      });

      const result = await checkRateLimit(req, 'api');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeGreaterThanOrEqual(0);
    });

    it('should return allowed false when limit exceeded', async () => {
      const req = new Request('https://example.com');

      const mockLimiter = {
        limit: vi.fn().mockResolvedValue({
          success: false,
          limit: 10,
          remaining: 0,
          reset: Date.now() + 3600000
        })
      };

      const originalApi = ratelimit.api;
      (ratelimit as any).api = mockLimiter;

      const result = await checkRateLimit(req, 'api');

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);

      (ratelimit as any).api = originalApi;
    });

    it('should support all limiter types', async () => {
      const req = new Request('https://example.com');

      const types: Array<keyof typeof ratelimit> = [
        'api',
        'auth',
        'signup',
        'passwordReset',
        'email',
        'upload',
        'strict'
      ];

      for (const type of types) {
        const result = await checkRateLimit(req, type);
        expect(result).toHaveProperty('allowed');
      }
    });

    it('should use user ID if provided', async () => {
      const req = new Request('https://example.com');

      const result = await checkRateLimit(req, 'api', 'user_456');

      expect(result).toBeDefined();
      expect(result.allowed).toBe(true);
    });

    it('should return reset timestamp', async () => {
      const req = new Request('https://example.com');

      const result = await checkRateLimit(req, 'api');

      expect(result.reset).toBeGreaterThan(Date.now());
    });
  });

  describe('createCustomRateLimiter', () => {
    it('should create custom rate limiter', () => {
      const limiter = createCustomRateLimiter(100, 60);

      expect(limiter).toBeDefined();
      expect(typeof limiter.limit).toBe('function');
    });

    it('should respect custom max requests', async () => {
      const limiter = createCustomRateLimiter(1, 10);

      await limiter.limit('test-id');
      const result = await limiter.limit('test-id');

      expect(result.success).toBe(false);
    });

    it('should respect custom window', async () => {
      const limiter = createCustomRateLimiter(5, 1); // 1 second

      for (let i = 0; i < 5; i++) {
        await limiter.limit('test-id');
      }

      // Should be blocked
      let result = await limiter.limit('test-id');
      expect(result.success).toBe(false);

      // Advance time
      vi.advanceTimersByTime(1001);

      // Should be allowed again
      result = await limiter.limit('test-id');
      expect(result.success).toBe(true);
    });

    it('should work independently from default limiters', async () => {
      const customLimiter = createCustomRateLimiter(1, 10);

      await customLimiter.limit('test-id');
      const customResult = await customLimiter.limit('test-id');

      // Default API limiter should still work
      const apiResult = await ratelimit.api.limit('test-id');

      expect(customResult.success).toBe(false);
      expect(apiResult.success).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should handle limiter errors gracefully', async () => {
      const req = new Request('https://example.com');

      const mockLimiter = {
        limit: vi.fn().mockRejectedValue(new Error('Redis connection failed'))
      };

      const originalApi = ratelimit.api;
      (ratelimit as any).api = mockLimiter;

      await expect(rateLimitMiddleware(req, 'api')).rejects.toThrow();

      (ratelimit as any).api = originalApi;
    });
  });
});
