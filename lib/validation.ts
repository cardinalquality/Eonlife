/**
 * Input Validation Library
 * Provides comprehensive validation schemas and utilities
 * using Zod for type-safe validation
 */

import { z } from 'zod';

/**
 * Common validation schemas
 */
export const schemas = {
  // Email validation
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase()
    .trim(),

  // Password validation with strong requirements
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),

  // Name validation
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters')
    .trim()
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),

  // Phone validation (E.164 format)
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .trim(),

  // US phone number (more specific)
  usPhone: z
    .string()
    .regex(/^(\+1)?[\s.-]?\(?[2-9]\d{2}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/, 'Invalid US phone number')
    .transform((val) => val.replace(/\D/g, '')), // Strip formatting

  // Address validation
  address: z.object({
    line1: z.string().min(1, 'Address line 1 is required').max(255).trim(),
    line2: z.string().max(255).trim().optional(),
    city: z.string().min(1, 'City is required').max(100).trim(),
    state: z.string().length(2, 'State must be 2 characters').toUpperCase(),
    postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
    country: z.string().length(2, 'Country must be 2-letter code').toUpperCase()
  }),

  // URL validation
  url: z.string().url('Invalid URL').max(2048),

  // Date validation
  date: z.coerce.date(),

  // Age validation (must be 18+)
  age: z.number().int().min(18, 'Must be at least 18 years old').max(120),

  // Credit card number (basic validation)
  creditCard: z
    .string()
    .regex(/^\d{13,19}$/, 'Invalid credit card number')
    .refine((val) => luhnCheck(val), 'Invalid credit card number'),

  // CVV validation
  cvv: z.string().regex(/^\d{3,4}$/, 'Invalid CVV'),

  // Text content (with length limits)
  shortText: z.string().min(1).max(255).trim(),
  mediumText: z.string().min(1).max(1000).trim(),
  longText: z.string().min(1).max(10000).trim(),

  // Numeric validations
  positiveNumber: z.number().positive(),
  nonNegativeNumber: z.number().nonnegative(),
  percentage: z.number().min(0).max(100),

  // Boolean validation
  checkbox: z.boolean(),
  optionalCheckbox: z.boolean().optional().default(false),

  // UUID validation
  uuid: z.string().uuid(),

  // Slug validation (URL-friendly string)
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
};

/**
 * Common form schemas
 */
export const formSchemas = {
  // Contact form
  contact: z.object({
    name: schemas.name,
    email: schemas.email,
    phone: schemas.phone.optional(),
    message: schemas.longText
  }),

  // Newsletter signup
  newsletter: z.object({
    email: schemas.email,
    consent: z.boolean().refine((val) => val === true, 'You must agree to receive emails')
  }),

  // User registration
  registration: z.object({
    name: schemas.name,
    email: schemas.email,
    password: schemas.password,
    confirmPassword: schemas.password,
    acceptTerms: z.boolean().refine((val) => val === true, 'You must accept the terms')
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }),

  // Login
  login: z.object({
    email: schemas.email,
    password: z.string().min(1, 'Password is required')
  }),

  // Password reset request
  passwordResetRequest: z.object({
    email: schemas.email
  }),

  // Password reset
  passwordReset: z.object({
    token: z.string().min(1),
    password: schemas.password,
    confirmPassword: schemas.password
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
};

/**
 * Validation result type
 */
export type ValidationResult<T> =
  | { success: true; data: T; errors: null }
  | { success: false; data: null; errors: z.ZodError };

/**
 * Validate input against a schema
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  const result = schema.safeParse(data);

  if (result.success) {
    return {
      success: true,
      data: result.data,
      errors: null
    };
  } else {
    return {
      success: false,
      data: null,
      errors: result.error
    };
  }
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(error: z.ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};

  // Zod v4 uses 'issues' instead of 'errors'
  const issues = (error as any).issues || (error as any).errors || [];
  issues.forEach((err: any) => {
    const path = err.path.join('.');
    formatted[path] = err.message;
  });

  return formatted;
}

/**
 * Luhn algorithm for credit card validation
 */
function luhnCheck(cardNumber: string): boolean {
  let sum = 0;
  let isEven = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Sanitize string input to prevent XSS
 * Note: This is a basic sanitizer. For HTML content, use DOMPurify (see sanitization.ts)
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove basic HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

/**
 * Validate and sanitize user input in one step
 */
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): ValidationResult<T> {
  // First validate
  const result = validateInput(schema, data);

  if (!result.success) {
    return result;
  }

  // Then sanitize string fields
  const sanitized = sanitizeObject(result.data);

  return {
    success: true,
    data: sanitized as T,
    errors: null
  };
}

/**
 * Recursively sanitize string fields in an object
 */
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }

  return obj;
}
