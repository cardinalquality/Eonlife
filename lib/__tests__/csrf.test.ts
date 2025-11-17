/**
 * Unit tests for CSRF Protection
 * Tests token generation, hashing, verification, storage, and middleware
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  generateCsrfToken,
  hashCsrfToken,
  verifyCsrfToken,
  storeCsrfToken,
  verifyStoredCsrfToken,
  csrfMiddleware,
  createCsrfCookie,
  createCsrfSession,
  verifyDoubleSubmitCookie,
  doubleSubmitCsrfMiddleware
} from '../csrf';

describe('CSRF Protection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateCsrfToken', () => {
    it('should generate a token', () => {
      const token = generateCsrfToken();
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should generate a 64-character hex string (32 bytes)', () => {
      const token = generateCsrfToken();
      expect(token.length).toBe(64);
      expect(/^[a-f0-9]{64}$/.test(token)).toBe(true);
    });

    it('should generate unique tokens', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();
      expect(token1).not.toBe(token2);
    });

    it('should generate cryptographically random tokens', () => {
      const tokens = new Set();
      for (let i = 0; i < 100; i++) {
        tokens.add(generateCsrfToken());
      }
      expect(tokens.size).toBe(100);
    });
  });

  describe('hashCsrfToken', () => {
    it('should hash a token', () => {
      const token = 'test-token';
      const hash = hashCsrfToken(token);
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should produce a 64-character hex string (SHA256)', () => {
      const token = 'test-token';
      const hash = hashCsrfToken(token);
      expect(hash.length).toBe(64);
      expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
    });

    it('should produce consistent hashes for the same input', () => {
      const token = 'test-token';
      const hash1 = hashCsrfToken(token);
      const hash2 = hashCsrfToken(token);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const token1 = 'test-token-1';
      const token2 = 'test-token-2';
      const hash1 = hashCsrfToken(token1);
      const hash2 = hashCsrfToken(token2);
      expect(hash1).not.toBe(hash2);
    });

    it('should be case-sensitive', () => {
      const hash1 = hashCsrfToken('TOKEN');
      const hash2 = hashCsrfToken('token');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyCsrfToken', () => {
    it('should verify a valid token', () => {
      const token = 'test-token';
      const hash = hashCsrfToken(token);
      expect(verifyCsrfToken(token, hash)).toBe(true);
    });

    it('should reject an invalid token', () => {
      const token = 'test-token';
      const wrongToken = 'wrong-token';
      const hash = hashCsrfToken(token);
      expect(verifyCsrfToken(wrongToken, hash)).toBe(false);
    });

    it('should reject a token with wrong hash', () => {
      const token = 'test-token';
      const wrongHash = hashCsrfToken('different-token');
      expect(verifyCsrfToken(token, wrongHash)).toBe(false);
    });

    it('should be timing-safe (same length strings)', () => {
      const token1 = 'a'.repeat(64);
      const token2 = 'b'.repeat(64);
      const hash = hashCsrfToken(token1);

      // Should return false for different tokens of same length
      expect(verifyCsrfToken(token2, hash)).toBe(false);
    });

    it('should handle different length strings safely', () => {
      const token = 'short';
      const hash = hashCsrfToken('much-longer-string-here');
      expect(verifyCsrfToken(token, hash)).toBe(false);
    });

    it('should handle empty strings', () => {
      const hash = hashCsrfToken('');
      expect(verifyCsrfToken('', hash)).toBe(true);
      expect(verifyCsrfToken('not-empty', hash)).toBe(false);
    });
  });

  describe('storeCsrfToken', () => {
    it('should store a token', () => {
      const identifier = 'user-123';
      const token = generateCsrfToken();

      expect(() => storeCsrfToken(identifier, token)).not.toThrow();
    });

    it('should store token with default expiration (1 hour)', () => {
      const identifier = 'user-123';
      const token = generateCsrfToken();

      storeCsrfToken(identifier, token);
      expect(verifyStoredCsrfToken(identifier, token)).toBe(true);
    });

    it('should store token with custom expiration', () => {
      const identifier = 'user-123';
      const token = generateCsrfToken();
      const expiresInMs = 5000; // 5 seconds

      storeCsrfToken(identifier, token, expiresInMs);
      expect(verifyStoredCsrfToken(identifier, token)).toBe(true);
    });

    it('should overwrite existing token for same identifier', () => {
      const identifier = 'user-123';
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();

      storeCsrfToken(identifier, token1);
      storeCsrfToken(identifier, token2);

      expect(verifyStoredCsrfToken(identifier, token1)).toBe(false);
      expect(verifyStoredCsrfToken(identifier, token2)).toBe(true);
    });
  });

  describe('verifyStoredCsrfToken', () => {
    it('should verify a stored token', () => {
      const identifier = 'user-123';
      const token = generateCsrfToken();

      storeCsrfToken(identifier, token);
      expect(verifyStoredCsrfToken(identifier, token)).toBe(true);
    });

    it('should reject non-existent identifier', () => {
      const token = generateCsrfToken();
      expect(verifyStoredCsrfToken('non-existent', token)).toBe(false);
    });

    it('should reject wrong token for identifier', () => {
      const identifier = 'user-123';
      const token = generateCsrfToken();
      const wrongToken = generateCsrfToken();

      storeCsrfToken(identifier, token);
      expect(verifyStoredCsrfToken(identifier, wrongToken)).toBe(false);
    });

    it('should reject expired token', () => {
      const identifier = 'user-123';
      const token = generateCsrfToken();
      const expiresInMs = 1000; // 1 second

      storeCsrfToken(identifier, token, expiresInMs);

      // Advance time past expiration
      vi.advanceTimersByTime(1001);

      expect(verifyStoredCsrfToken(identifier, token)).toBe(false);
    });

    it('should delete expired token on verification', () => {
      const identifier = 'user-123';
      const token = generateCsrfToken();
      const expiresInMs = 1000;

      storeCsrfToken(identifier, token, expiresInMs);
      vi.advanceTimersByTime(1001);

      // First verification should return false and delete
      expect(verifyStoredCsrfToken(identifier, token)).toBe(false);

      // Second verification should also return false
      expect(verifyStoredCsrfToken(identifier, token)).toBe(false);
    });

    it('should handle multiple identifiers', () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();

      storeCsrfToken('user-1', token1);
      storeCsrfToken('user-2', token2);

      expect(verifyStoredCsrfToken('user-1', token1)).toBe(true);
      expect(verifyStoredCsrfToken('user-2', token2)).toBe(true);
      expect(verifyStoredCsrfToken('user-1', token2)).toBe(false);
      expect(verifyStoredCsrfToken('user-2', token1)).toBe(false);
    });
  });

  describe('csrfMiddleware', () => {
    it('should allow GET requests without token', async () => {
      const req = new Request('https://example.com', { method: 'GET' });
      const result = await csrfMiddleware(req, 'user-123');
      expect(result).toBeNull();
    });

    it('should allow HEAD requests without token', async () => {
      const req = new Request('https://example.com', { method: 'HEAD' });
      const result = await csrfMiddleware(req, 'user-123');
      expect(result).toBeNull();
    });

    it('should allow OPTIONS requests without token', async () => {
      const req = new Request('https://example.com', { method: 'OPTIONS' });
      const result = await csrfMiddleware(req, 'user-123');
      expect(result).toBeNull();
    });

    it('should reject POST request without token', async () => {
      const req = new Request('https://example.com', { method: 'POST' });
      const result = await csrfMiddleware(req, 'user-123');

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);

      const body = await result?.json();
      expect(body?.error).toBe('CSRF token missing');
    });

    it('should reject PUT request without token', async () => {
      const req = new Request('https://example.com', { method: 'PUT' });
      const result = await csrfMiddleware(req, 'user-123');

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });

    it('should reject DELETE request without token', async () => {
      const req = new Request('https://example.com', { method: 'DELETE' });
      const result = await csrfMiddleware(req, 'user-123');

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });

    it('should reject PATCH request without token', async () => {
      const req = new Request('https://example.com', { method: 'PATCH' });
      const result = await csrfMiddleware(req, 'user-123');

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });

    it('should accept valid token from header', async () => {
      const identifier = 'user-123';
      const token = generateCsrfToken();
      storeCsrfToken(identifier, token);

      const req = new Request('https://example.com', {
        method: 'POST',
        headers: { 'x-csrf-token': token }
      });

      const result = await csrfMiddleware(req, identifier);
      expect(result).toBeNull();
    });

    it('should accept valid token from cookie', async () => {
      const identifier = 'user-123';
      const token = generateCsrfToken();
      storeCsrfToken(identifier, token);

      const req = new Request('https://example.com', {
        method: 'POST',
        headers: { cookie: `csrf-token=${token}` }
      });

      const result = await csrfMiddleware(req, identifier);
      expect(result).toBeNull();
    });

    it('should prefer header token over cookie token', async () => {
      const identifier = 'user-123';
      const headerToken = generateCsrfToken();
      const cookieToken = generateCsrfToken();

      storeCsrfToken(identifier, headerToken);

      const req = new Request('https://example.com', {
        method: 'POST',
        headers: {
          'x-csrf-token': headerToken,
          cookie: `csrf-token=${cookieToken}`
        }
      });

      const result = await csrfMiddleware(req, identifier);
      expect(result).toBeNull();
    });

    it('should reject invalid token', async () => {
      const identifier = 'user-123';
      const token = generateCsrfToken();
      const invalidToken = generateCsrfToken();

      storeCsrfToken(identifier, token);

      const req = new Request('https://example.com', {
        method: 'POST',
        headers: { 'x-csrf-token': invalidToken }
      });

      const result = await csrfMiddleware(req, identifier);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);

      const body = await result?.json();
      expect(body?.error).toBe('Invalid CSRF token');
    });

    it('should reject expired token', async () => {
      const identifier = 'user-123';
      const token = generateCsrfToken();

      storeCsrfToken(identifier, token, 1000);
      vi.advanceTimersByTime(1001);

      const req = new Request('https://example.com', {
        method: 'POST',
        headers: { 'x-csrf-token': token }
      });

      const result = await csrfMiddleware(req, identifier);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });
  });

  describe('createCsrfCookie', () => {
    it('should create a cookie string', () => {
      const token = 'test-token';
      const cookie = createCsrfCookie(token, false);

      expect(cookie).toContain('csrf-token=test-token');
      expect(cookie).toContain('HttpOnly');
      expect(cookie).toContain('SameSite=Strict');
      expect(cookie).toContain('Path=/');
      expect(cookie).toContain('Max-Age=3600');
    });

    it('should include Secure flag when secure is true', () => {
      const token = 'test-token';
      const cookie = createCsrfCookie(token, true);

      expect(cookie).toContain('Secure');
    });

    it('should not include Secure flag when secure is false', () => {
      const token = 'test-token';
      const cookie = createCsrfCookie(token, false);

      expect(cookie).not.toContain('Secure');
    });

    it('should default to secure=true', () => {
      const token = 'test-token';
      const cookie = createCsrfCookie(token);

      expect(cookie).toContain('Secure');
    });

    it('should handle special characters in token', () => {
      const token = 'test-token-with-special_chars.123';
      const cookie = createCsrfCookie(token);

      expect(cookie).toContain(`csrf-token=${token}`);
    });
  });

  describe('createCsrfSession', () => {
    it('should create a session with token and cookie', () => {
      const identifier = 'user-123';
      const session = createCsrfSession(identifier);

      expect(session).toHaveProperty('token');
      expect(session).toHaveProperty('cookie');
      expect(typeof session.token).toBe('string');
      expect(typeof session.cookie).toBe('string');
    });

    it('should generate a valid token', () => {
      const identifier = 'user-123';
      const session = createCsrfSession(identifier);

      expect(session.token.length).toBe(64);
      expect(/^[a-f0-9]{64}$/.test(session.token)).toBe(true);
    });

    it('should store the token for verification', () => {
      const identifier = 'user-123';
      const session = createCsrfSession(identifier);

      expect(verifyStoredCsrfToken(identifier, session.token)).toBe(true);
    });

    it('should create cookie with token', () => {
      const identifier = 'user-123';
      const session = createCsrfSession(identifier);

      expect(session.cookie).toContain(`csrf-token=${session.token}`);
    });

    it('should use secure cookie in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const identifier = 'user-123';
      const session = createCsrfSession(identifier);

      expect(session.cookie).toContain('Secure');

      process.env.NODE_ENV = originalEnv;
    });

    it('should not use secure cookie in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const identifier = 'user-123';
      const session = createCsrfSession(identifier);

      expect(session.cookie).not.toContain('Secure');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('verifyDoubleSubmitCookie', () => {
    it('should verify matching tokens', () => {
      const token = 'test-token';

      const req = new Request('https://example.com', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
          cookie: `csrf-token=${token}`
        }
      });

      expect(verifyDoubleSubmitCookie(req)).toBe(true);
    });

    it('should reject mismatched tokens', () => {
      const req = new Request('https://example.com', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'token1',
          cookie: 'csrf-token=token2'
        }
      });

      expect(verifyDoubleSubmitCookie(req)).toBe(false);
    });

    it('should reject missing header token', () => {
      const req = new Request('https://example.com', {
        method: 'POST',
        headers: {
          cookie: 'csrf-token=test-token'
        }
      });

      expect(verifyDoubleSubmitCookie(req)).toBe(false);
    });

    it('should reject missing cookie token', () => {
      const req = new Request('https://example.com', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'test-token'
        }
      });

      expect(verifyDoubleSubmitCookie(req)).toBe(false);
    });

    it('should reject both tokens missing', () => {
      const req = new Request('https://example.com', {
        method: 'POST'
      });

      expect(verifyDoubleSubmitCookie(req)).toBe(false);
    });

    it('should be case-sensitive', () => {
      const req = new Request('https://example.com', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'TestToken',
          cookie: 'csrf-token=testtoken'
        }
      });

      expect(verifyDoubleSubmitCookie(req)).toBe(false);
    });

    it('should handle multiple cookies', () => {
      const token = 'test-token';

      const req = new Request('https://example.com', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
          cookie: `session=abc123; csrf-token=${token}; other=value`
        }
      });

      expect(verifyDoubleSubmitCookie(req)).toBe(true);
    });
  });

  describe('doubleSubmitCsrfMiddleware', () => {
    it('should allow GET requests', async () => {
      const req = new Request('https://example.com', { method: 'GET' });
      const result = await doubleSubmitCsrfMiddleware(req);
      expect(result).toBeNull();
    });

    it('should block POST without matching tokens', async () => {
      const req = new Request('https://example.com', {
        method: 'POST',
        headers: {
          'x-csrf-token': 'token1',
          cookie: 'csrf-token=token2'
        }
      });

      const result = await doubleSubmitCsrfMiddleware(req);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);

      const body = await result?.json();
      expect(body?.error).toBe('CSRF validation failed');
    });

    it('should allow POST with matching tokens', async () => {
      const token = 'test-token';

      const req = new Request('https://example.com', {
        method: 'POST',
        headers: {
          'x-csrf-token': token,
          cookie: `csrf-token=${token}`
        }
      });

      const result = await doubleSubmitCsrfMiddleware(req);
      expect(result).toBeNull();
    });

    it('should block PUT without matching tokens', async () => {
      const req = new Request('https://example.com', { method: 'PUT' });
      const result = await doubleSubmitCsrfMiddleware(req);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });

    it('should block DELETE without matching tokens', async () => {
      const req = new Request('https://example.com', { method: 'DELETE' });
      const result = await doubleSubmitCsrfMiddleware(req);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });

    it('should block PATCH without matching tokens', async () => {
      const req = new Request('https://example.com', { method: 'PATCH' });
      const result = await doubleSubmitCsrfMiddleware(req);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(403);
    });
  });
});
