/**
 * Password Security Utilities
 * Provides secure password hashing, verification, and reset token generation
 */

import bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';
import { schemas } from './validation';

/**
 * Password hashing configuration
 */
const BCRYPT_ROUNDS = 12; // Cost factor (2^12 iterations)
const RESET_TOKEN_BYTES = 32;
const RESET_TOKEN_EXPIRY = 3600000; // 1 hour in milliseconds

/**
 * Hash a password using bcrypt
 * @throws Error if password doesn't meet requirements
 */
export async function hashPassword(password: string): Promise<string> {
  // Validate password strength
  const validation = schemas.password.safeParse(password);

  if (!validation.success) {
    const errors = validation.error.errors.map(e => e.message).join(', ');
    throw new Error(`Password validation failed: ${errors}`);
  }

  // Hash with bcrypt
  const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);

  return hash;
}

/**
 * Verify a password against its hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

/**
 * Check if password hash needs rehashing (e.g., if cost factor changed)
 */
export function needsRehash(hash: string): boolean {
  try {
    // Extract cost factor from hash
    const cost = parseInt(hash.split('$')[2], 10);
    return cost < BCRYPT_ROUNDS;
  } catch (error) {
    return true; // If we can't parse the hash, rehash it
  }
}

/**
 * Password strength evaluation
 */
export interface PasswordStrength {
  score: number; // 0-4 (weak to very strong)
  feedback: string[];
  isAcceptable: boolean;
}

/**
 * Evaluate password strength beyond basic requirements
 */
export function evaluatePasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  // Length bonuses
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character variety
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const varietyCount = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (varietyCount >= 4) score++;

  // Check for common patterns
  const commonPatterns = [
    /^123/,
    /abc/i,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /(.)\1{2,}/ // repeated characters
  ];

  const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
  if (hasCommonPattern) {
    score = Math.max(0, score - 1);
    feedback.push('Avoid common patterns and repeated characters');
  }

  // Sequential characters
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)) {
    feedback.push('Avoid sequential characters');
  }

  // Provide feedback
  if (score <= 1) {
    feedback.push('Use a longer password with more variety');
  } else if (score === 2) {
    feedback.push('Good password, but could be stronger');
  } else if (score === 3) {
    feedback.push('Strong password!');
  } else {
    feedback.push('Very strong password!');
  }

  // Check if meets minimum requirements
  const meetsRequirements = schemas.password.safeParse(password).success;

  return {
    score: Math.min(score, 4),
    feedback,
    isAcceptable: meetsRequirements && score >= 2
  };
}

/**
 * Password reset token management
 */
interface ResetToken {
  token: string;
  hash: string;
  expires: number;
}

/**
 * Generate a password reset token
 */
export function generateResetToken(): ResetToken {
  const token = randomBytes(RESET_TOKEN_BYTES).toString('hex');
  const hash = hashResetToken(token);
  const expires = Date.now() + RESET_TOKEN_EXPIRY;

  return { token, hash, expires };
}

/**
 * Hash a reset token for storage
 */
export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Verify a reset token
 */
export function verifyResetToken(
  token: string,
  storedHash: string,
  expiresAt: number
): { valid: boolean; reason?: string } {
  // Check expiration
  if (Date.now() >= expiresAt) {
    return { valid: false, reason: 'Token has expired' };
  }

  // Verify hash
  const hash = hashResetToken(token);

  // Timing-safe comparison
  if (hash !== storedHash) {
    return { valid: false, reason: 'Invalid token' };
  }

  return { valid: true };
}

/**
 * Generate a temporary password for email-based password reset
 * NOTE: Use this only for email verification, not as actual passwords
 */
export function generateTemporaryPassword(length: number = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
  let password = '';

  const bytes = randomBytes(length);

  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }

  // Ensure it meets requirements
  const strength = evaluatePasswordStrength(password);
  if (!strength.isAcceptable) {
    // Regenerate if it doesn't meet requirements (rare)
    return generateTemporaryPassword(length);
  }

  return password;
}

/**
 * Password history check (prevent password reuse)
 * Store hashes of previous N passwords
 */
export async function isPasswordInHistory(
  newPassword: string,
  previousHashes: string[]
): Promise<boolean> {
  for (const hash of previousHashes) {
    const isMatch = await verifyPassword(newPassword, hash);
    if (isMatch) {
      return true;
    }
  }

  return false;
}

/**
 * Check if password has been compromised (using local checks)
 * NOTE: For production, consider integrating with Have I Been Pwned API
 */
export function isCommonPassword(password: string): boolean {
  // List of most common passwords (expand this list)
  const commonPasswords = new Set([
    'password',
    '123456',
    '12345678',
    'qwerty',
    'abc123',
    'monkey',
    '1234567',
    'letmein',
    'trustno1',
    'dragon',
    'baseball',
    'iloveyou',
    'master',
    'sunshine',
    'ashley',
    'bailey',
    'passw0rd',
    'shadow',
    '123123',
    '654321',
    'superman',
    'qazwsx',
    'michael',
    'football'
  ]);

  return commonPasswords.has(password.toLowerCase());
}

/**
 * Validate password change request
 */
export interface PasswordChangeValidation {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a password change (comprehensive checks)
 */
export async function validatePasswordChange(
  newPassword: string,
  confirmPassword: string,
  currentPasswordHash?: string,
  previousHashes?: string[]
): Promise<PasswordChangeValidation> {
  const errors: string[] = [];

  // Check if passwords match
  if (newPassword !== confirmPassword) {
    errors.push('Passwords do not match');
  }

  // Validate strength
  const validation = schemas.password.safeParse(newPassword);
  if (!validation.success) {
    errors.push(...validation.error.errors.map(e => e.message));
  }

  // Check password strength
  const strength = evaluatePasswordStrength(newPassword);
  if (!strength.isAcceptable) {
    errors.push('Password is not strong enough');
  }

  // Check if it's a common password
  if (isCommonPassword(newPassword)) {
    errors.push('This password is too common. Please choose a more unique password');
  }

  // Check if same as current password
  if (currentPasswordHash) {
    const isSameAsCurrent = await verifyPassword(newPassword, currentPasswordHash);
    if (isSameAsCurrent) {
      errors.push('New password must be different from current password');
    }
  }

  // Check password history
  if (previousHashes && previousHashes.length > 0) {
    const inHistory = await isPasswordInHistory(newPassword, previousHashes);
    if (inHistory) {
      errors.push('Password has been used recently. Please choose a different password');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
