/**
 * Unit tests for Password Security Utilities
 * Tests password hashing, verification, strength evaluation, and reset tokens
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  needsRehash,
  evaluatePasswordStrength,
  generateResetToken,
  hashResetToken,
  verifyResetToken,
  generateTemporaryPassword,
  isPasswordInHistory,
  isCommonPassword,
  validatePasswordChange
} from '../password';

// Mock bcrypt
vi.mock('bcryptjs', () => ({
  default: {
    genSalt: vi.fn().mockResolvedValue('mock-salt'),
    hash: vi.fn().mockResolvedValue('$2a$12$mockedhashedpasswordhere'),
    compare: vi.fn()
  }
}));

// Mock validation module
vi.mock('../validation', () => ({
  schemas: {
    password: {
      safeParse: vi.fn()
    }
  }
}));

import bcrypt from 'bcryptjs';
import { schemas } from '../validation';

describe('Password Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a valid password', async () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({
        success: true,
        data: 'ValidPass123!'
      } as any);

      const hash = await hashPassword('ValidPass123!');

      expect(hash).toBe('$2a$12$mockedhashedpasswordhere');
      expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
      expect(bcrypt.hash).toHaveBeenCalledWith('ValidPass123!', 'mock-salt');
    });

    it('should validate password before hashing', async () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({
        success: true,
        data: 'ValidPass123!'
      } as any);

      await hashPassword('ValidPass123!');

      expect(schemas.password.safeParse).toHaveBeenCalledWith('ValidPass123!');
    });

    it('should throw error for invalid password', async () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({
        success: false,
        error: {
          errors: [
            { message: 'Password too short' },
            { message: 'Missing special character' }
          ]
        }
      } as any);

      await expect(hashPassword('weak')).rejects.toThrow(
        'Password validation failed: Password too short, Missing special character'
      );
    });

    it('should use bcrypt with 12 rounds', async () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({
        success: true,
        data: 'ValidPass123!'
      } as any);

      await hashPassword('ValidPass123!');

      expect(bcrypt.genSalt).toHaveBeenCalledWith(12);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await verifyPassword(
        'password123',
        '$2a$12$hashedpassword'
      );

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        '$2a$12$hashedpassword'
      );
    });

    it('should reject incorrect password', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await verifyPassword(
        'wrongpassword',
        '$2a$12$hashedpassword'
      );

      expect(result).toBe(false);
    });

    it('should handle bcrypt errors gracefully', async () => {
      vi.mocked(bcrypt.compare).mockRejectedValue(new Error('Bcrypt error'));
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await verifyPassword('password', 'invalid-hash');

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should be case-sensitive', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await verifyPassword(
        'Password123',
        '$2a$12$hashedforpassword123'
      );

      expect(result).toBe(false);
    });
  });

  describe('needsRehash', () => {
    it('should return false for current cost factor (12)', () => {
      const hash = '$2a$12$somehash';
      expect(needsRehash(hash)).toBe(false);
    });

    it('should return true for lower cost factor', () => {
      const hash = '$2a$10$somehash';
      expect(needsRehash(hash)).toBe(true);
    });

    it('should return true for very low cost factor', () => {
      const hash = '$2a$04$somehash';
      expect(needsRehash(hash)).toBe(true);
    });

    it('should return true for invalid hash format', () => {
      const invalidHash = 'not-a-valid-hash';
      expect(needsRehash(invalidHash)).toBe(true);
    });

    it('should return true for malformed hash', () => {
      const malformedHash = '$2a$invalid$hash';
      expect(needsRehash(malformedHash)).toBe(true);
    });

    it('should return false for higher cost factor', () => {
      const hash = '$2a$14$somehash';
      expect(needsRehash(hash)).toBe(false);
    });
  });

  describe('evaluatePasswordStrength', () => {
    it('should score weak password low', () => {
      const result = evaluatePasswordStrength('weak');

      expect(result.score).toBeLessThan(2);
      expect(result.isAcceptable).toBe(false);
    });

    it('should score strong password high', () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({ success: true } as any);

      const result = evaluatePasswordStrength('MyV3ry$tr0ng!P@ssw0rd123');

      expect(result.score).toBeGreaterThanOrEqual(3);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should give bonus for length >= 8', () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({ success: true } as any);

      const short = evaluatePasswordStrength('Abc1!');
      const longer = evaluatePasswordStrength('Abcd123!');

      expect(longer.score).toBeGreaterThanOrEqual(short.score);
    });

    it('should give bonus for length >= 12', () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({ success: true } as any);

      const result = evaluatePasswordStrength('VeryLong123!Pass');

      expect(result.score).toBeGreaterThanOrEqual(2);
    });

    it('should give bonus for length >= 16', () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({ success: true } as any);

      const result = evaluatePasswordStrength('VeryVeryLong123!Password');

      expect(result.score).toBeGreaterThanOrEqual(3);
    });

    it('should penalize common patterns', () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({ success: true } as any);

      const result = evaluatePasswordStrength('password123');

      expect(result.feedback).toContain('Avoid common patterns and repeated characters');
    });

    it('should penalize repeated characters', () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({ success: true } as any);

      const result = evaluatePasswordStrength('Passss123!');

      expect(result.feedback).toContain('Avoid common patterns and repeated characters');
    });

    it('should penalize sequential characters', () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({ success: true } as any);

      const result = evaluatePasswordStrength('abc123!Pass');

      expect(result.feedback).toContain('Avoid sequential characters');
    });

    it('should reward character variety', () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({ success: true } as any);

      const noVariety = evaluatePasswordStrength('aaaaaaaa');
      const highVariety = evaluatePasswordStrength('Aa1!Bb2@');

      expect(highVariety.score).toBeGreaterThan(noVariety.score);
    });

    it('should provide appropriate feedback for weak passwords', () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({ success: false } as any);

      const result = evaluatePasswordStrength('weak');

      expect(result.feedback).toContain('Use a longer password with more variety');
    });

    it('should cap score at 4', () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({ success: true } as any);

      const result = evaluatePasswordStrength('SuperUltraMegaSecure123!@#Password');

      expect(result.score).toBeLessThanOrEqual(4);
    });

    it('should check minimum requirements', () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({ success: false } as any);

      const result = evaluatePasswordStrength('short');

      expect(result.isAcceptable).toBe(false);
    });
  });

  describe('generateResetToken', () => {
    it('should generate a reset token object', () => {
      const token = generateResetToken();

      expect(token).toHaveProperty('token');
      expect(token).toHaveProperty('hash');
      expect(token).toHaveProperty('expires');
    });

    it('should generate a 64-character hex token', () => {
      const token = generateResetToken();

      expect(token.token.length).toBe(64);
      expect(/^[a-f0-9]{64}$/.test(token.token)).toBe(true);
    });

    it('should generate unique tokens', () => {
      const token1 = generateResetToken();
      const token2 = generateResetToken();

      expect(token1.token).not.toBe(token2.token);
      expect(token1.hash).not.toBe(token2.hash);
    });

    it('should set expiration to 1 hour in future', () => {
      const before = Date.now();
      const token = generateResetToken();
      const after = Date.now();

      const expectedExpiry = before + 3600000; // 1 hour
      expect(token.expires).toBeGreaterThanOrEqual(expectedExpiry);
      expect(token.expires).toBeLessThanOrEqual(after + 3600000);
    });

    it('should hash the token', () => {
      const token = generateResetToken();

      expect(token.hash).toBeDefined();
      expect(token.hash.length).toBe(64); // SHA256 hex
      expect(/^[a-f0-9]{64}$/.test(token.hash)).toBe(true);
    });
  });

  describe('hashResetToken', () => {
    it('should hash a token consistently', () => {
      const token = 'test-token';
      const hash1 = hashResetToken(token);
      const hash2 = hashResetToken(token);

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different tokens', () => {
      const hash1 = hashResetToken('token1');
      const hash2 = hashResetToken('token2');

      expect(hash1).not.toBe(hash2);
    });

    it('should produce 64-character hex string', () => {
      const hash = hashResetToken('test-token');

      expect(hash.length).toBe(64);
      expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
    });
  });

  describe('verifyResetToken', () => {
    it('should verify valid non-expired token', () => {
      const token = 'test-token';
      const hash = hashResetToken(token);
      const expiresAt = Date.now() + 3600000;

      const result = verifyResetToken(token, hash, expiresAt);

      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });

    it('should reject expired token', () => {
      const token = 'test-token';
      const hash = hashResetToken(token);
      const expiresAt = Date.now() - 1000; // Expired

      const result = verifyResetToken(token, hash, expiresAt);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Token has expired');
    });

    it('should reject invalid token', () => {
      const token = 'correct-token';
      const wrongToken = 'wrong-token';
      const hash = hashResetToken(token);
      const expiresAt = Date.now() + 3600000;

      const result = verifyResetToken(wrongToken, hash, expiresAt);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid token');
    });

    it('should reject token with wrong hash', () => {
      const token = 'test-token';
      const wrongHash = hashResetToken('different-token');
      const expiresAt = Date.now() + 3600000;

      const result = verifyResetToken(token, wrongHash, expiresAt);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Invalid token');
    });

    it('should check expiration before hash', () => {
      const token = 'test-token';
      const wrongHash = 'wrong-hash';
      const expiresAt = Date.now() - 1000;

      const result = verifyResetToken(token, wrongHash, expiresAt);

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Token has expired');
    });
  });

  describe('generateTemporaryPassword', () => {
    beforeEach(() => {
      // Mock validation to always succeed for temporary password generation
      vi.mocked(schemas.password.safeParse).mockReturnValue({ success: true } as any);
    });

    it('should generate a password of default length 12', () => {
      const password = generateTemporaryPassword();

      expect(password.length).toBe(12);
    });

    it('should generate a password of custom length', () => {
      const password = generateTemporaryPassword(16);

      expect(password.length).toBe(16);
    });

    it('should generate different passwords', () => {
      const pass1 = generateTemporaryPassword();
      const pass2 = generateTemporaryPassword();

      expect(pass1).not.toBe(pass2);
    });

    it('should only use allowed characters', () => {
      const password = generateTemporaryPassword();
      const allowedChars = /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*]+$/;

      expect(allowedChars.test(password)).toBe(true);
    });

    it('should not include ambiguous characters', () => {
      const password = generateTemporaryPassword(100); // Generate longer to test

      // Should not contain: 0, O, o, 1, l, I
      expect(password).not.toContain('0');
      expect(password).not.toContain('O');
      expect(password).not.toContain('1');
      expect(password).not.toContain('l');
      expect(password).not.toContain('I');
    });
  });

  describe('isPasswordInHistory', () => {
    it('should return false when password not in history', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await isPasswordInHistory('newpassword', [
        '$2a$12$hash1',
        '$2a$12$hash2'
      ]);

      expect(result).toBe(false);
    });

    it('should return true when password matches history', async () => {
      vi.mocked(bcrypt.compare)
        .mockResolvedValueOnce(false as never)
        .mockResolvedValueOnce(true as never);

      const result = await isPasswordInHistory('oldpassword', [
        '$2a$12$hash1',
        '$2a$12$hash2'
      ]);

      expect(result).toBe(true);
    });

    it('should check all history entries', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await isPasswordInHistory('password', [
        '$2a$12$hash1',
        '$2a$12$hash2',
        '$2a$12$hash3'
      ]);

      expect(bcrypt.compare).toHaveBeenCalledTimes(3);
    });

    it('should return false for empty history', async () => {
      const result = await isPasswordInHistory('password', []);

      expect(result).toBe(false);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should stop checking after finding match', async () => {
      vi.mocked(bcrypt.compare)
        .mockResolvedValueOnce(false as never)
        .mockResolvedValueOnce(true as never);

      await isPasswordInHistory('password', [
        '$2a$12$hash1',
        '$2a$12$hash2',
        '$2a$12$hash3'
      ]);

      expect(bcrypt.compare).toHaveBeenCalledTimes(2);
    });
  });

  describe('isCommonPassword', () => {
    it('should detect common passwords', () => {
      expect(isCommonPassword('password')).toBe(true);
      expect(isCommonPassword('123456')).toBe(true);
      expect(isCommonPassword('qwerty')).toBe(true);
      expect(isCommonPassword('abc123')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(isCommonPassword('PASSWORD')).toBe(true);
      expect(isCommonPassword('Password')).toBe(true);
      expect(isCommonPassword('QWERTY')).toBe(true);
    });

    it('should not flag uncommon passwords', () => {
      expect(isCommonPassword('MySecure123!Pass')).toBe(false);
      expect(isCommonPassword('UnlikelyP@ssw0rd')).toBe(false);
    });

    it('should detect variations of common passwords', () => {
      expect(isCommonPassword('letmein')).toBe(true);
      expect(isCommonPassword('LETMEIN')).toBe(true);
    });
  });

  describe('validatePasswordChange', () => {
    beforeEach(() => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({
        success: true,
        data: 'ValidPass123!'
      } as any);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);
    });

    it('should validate matching passwords', async () => {
      const result = await validatePasswordChange(
        'ValidPass123!',
        'ValidPass123!'
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-matching passwords', async () => {
      const result = await validatePasswordChange(
        'ValidPass123!',
        'DifferentPass123!'
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Passwords do not match');
    });

    it('should validate password strength', async () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({
        success: false,
        error: {
          errors: [{ message: 'Too weak' }]
        }
      } as any);

      const result = await validatePasswordChange('weak', 'weak');

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Too weak');
    });

    it('should reject common passwords', async () => {
      const result = await validatePasswordChange(
        'password',
        'password'
      );

      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('too common'))).toBe(true);
    });

    it('should reject if same as current password', async () => {
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await validatePasswordChange(
        'ValidPass123!',
        'ValidPass123!',
        '$2a$12$currenthash'
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('New password must be different from current password');
    });

    it('should check password history', async () => {
      vi.mocked(bcrypt.compare)
        .mockResolvedValueOnce(false as never) // current password check
        .mockResolvedValueOnce(false as never) // history check 1
        .mockResolvedValueOnce(true as never);  // history check 2 - match

      const result = await validatePasswordChange(
        'ValidPass123!',
        'ValidPass123!',
        '$2a$12$currenthash',
        ['$2a$12$oldhash1', '$2a$12$oldhash2']
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password has been used recently. Please choose a different password');
    });

    it('should pass all validations for good password', async () => {
      const result = await validatePasswordChange(
        'MyNewSecure123!Pass',
        'MyNewSecure123!Pass'
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accumulate multiple errors', async () => {
      vi.mocked(schemas.password.safeParse).mockReturnValue({
        success: false,
        error: {
          errors: [
            { message: 'Too short' },
            { message: 'No special char' }
          ]
        }
      } as any);

      const result = await validatePasswordChange(
        'weak',
        'different'
      );

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    it('should handle optional parameters', async () => {
      const result = await validatePasswordChange(
        'ValidPass123!',
        'ValidPass123!'
      );

      expect(result.valid).toBe(true);
    });
  });
});
