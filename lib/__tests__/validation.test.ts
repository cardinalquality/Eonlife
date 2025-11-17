import { describe, it, expect } from 'vitest';
import {
  schemas,
  formSchemas,
  validateInput,
  formatValidationErrors,
  sanitizeString,
  validateAndSanitize,
} from '../validation';

describe('Validation Schemas', () => {
  describe('email schema', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.co.uk',
        'user+tag@example.com',
        'user123@test-domain.com',
      ];

      validEmails.forEach((email) => {
        const result = schemas.email.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid',
        '@example.com',
        'user@',
        'user @example.com',
        'user@.com',
      ];

      invalidEmails.forEach((email) => {
        const result = schemas.email.safeParse(email);
        expect(result.success).toBe(false);
      });
    });

    it('should normalize email to lowercase and trim', () => {
      const result = schemas.email.safeParse('USER@EXAMPLE.COM');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('user@example.com');
      }
    });

    it('should reject emails longer than 255 characters', () => {
      const longEmail = 'a'.repeat(250) + '@test.com';
      const result = schemas.email.safeParse(longEmail);
      expect(result.success).toBe(false);
    });
  });

  describe('password schema', () => {
    it('should accept strong passwords', () => {
      const validPasswords = [
        'Password123!',
        'MyP@ssw0rd',
        'Str0ng!Pass',
        'C0mpl3x@Password',
      ];

      validPasswords.forEach((password) => {
        const result = schemas.password.safeParse(password);
        expect(result.success).toBe(true);
      });
    });

    it('should reject passwords without uppercase letter', () => {
      const result = schemas.password.safeParse('password123!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without lowercase letter', () => {
      const result = schemas.password.safeParse('PASSWORD123!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without number', () => {
      const result = schemas.password.safeParse('Password!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords without special character', () => {
      const result = schemas.password.safeParse('Password123');
      expect(result.success).toBe(false);
    });

    it('should reject passwords shorter than 8 characters', () => {
      const result = schemas.password.safeParse('Pass1!');
      expect(result.success).toBe(false);
    });

    it('should reject passwords longer than 128 characters', () => {
      const longPassword = 'P@ssw0rd' + 'a'.repeat(121);
      const result = schemas.password.safeParse(longPassword);
      expect(result.success).toBe(false);
    });
  });

  describe('name schema', () => {
    it('should accept valid names', () => {
      const validNames = [
        'John Doe',
        "O'Brien",
        'Mary-Jane',
        'Jean-Pierre',
        "D'Angelo",
      ];

      validNames.forEach((name) => {
        const result = schemas.name.safeParse(name);
        expect(result.success).toBe(true);
      });
    });

    it('should reject names with numbers', () => {
      const result = schemas.name.safeParse('John123');
      expect(result.success).toBe(false);
    });

    it('should reject names with special characters', () => {
      const result = schemas.name.safeParse('John@Doe');
      expect(result.success).toBe(false);
    });

    it('should trim whitespace', () => {
      const result = schemas.name.safeParse('  John Doe  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('John Doe');
      }
    });

    it('should reject empty names', () => {
      const result = schemas.name.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject names longer than 100 characters', () => {
      const longName = 'a'.repeat(101);
      const result = schemas.name.safeParse(longName);
      expect(result.success).toBe(false);
    });
  });

  describe('phone schema', () => {
    it('should accept valid phone numbers in E.164 format', () => {
      const validPhones = [
        '+12025551234',
        '+442071234567',
        '+33123456789',
        '12025551234',
      ];

      validPhones.forEach((phone) => {
        const result = schemas.phone.safeParse(phone);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid phone numbers', () => {
      // Test that phone numbers starting with 0 are rejected (E.164 requires 1-9)
      const result1 = schemas.phone.safeParse('+01234567890');
      expect(result1.success).toBe(false);

      // Test that alpha characters are rejected
      const result2 = schemas.phone.safeParse('abcdefghijk');
      expect(result2.success).toBe(false);
    });
  });

  describe('usPhone schema', () => {
    it('should accept valid US phone numbers', () => {
      const validPhones = [
        '(202) 555-1234',
        '202-555-1234',
        '202.555.1234',
        '2025551234',
        '+1 202 555 1234',
      ];

      validPhones.forEach((phone) => {
        const result = schemas.usPhone.safeParse(phone);
        expect(result.success).toBe(true);
      });
    });

    it('should strip formatting from phone numbers', () => {
      const result = schemas.usPhone.safeParse('(202) 555-1234');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('2025551234');
      }
    });
  });

  describe('address schema', () => {
    it('should accept valid addresses', () => {
      const validAddress = {
        line1: '123 Main St',
        line2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };

      const result = schemas.address.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('should accept addresses without line2', () => {
      const validAddress = {
        line1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      };

      const result = schemas.address.safeParse(validAddress);
      expect(result.success).toBe(true);
    });

    it('should normalize state and country to uppercase', () => {
      const address = {
        line1: '123 Main St',
        city: 'New York',
        state: 'ny',
        postalCode: '10001',
        country: 'us',
      };

      const result = schemas.address.safeParse(address);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.state).toBe('NY');
        expect(result.data.country).toBe('US');
      }
    });

    it('should accept ZIP+4 format', () => {
      const address = {
        line1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001-1234',
        country: 'US',
      };

      const result = schemas.address.safeParse(address);
      expect(result.success).toBe(true);
    });

    it('should reject invalid ZIP codes', () => {
      const address = {
        line1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: 'ABCDE',
        country: 'US',
      };

      const result = schemas.address.safeParse(address);
      expect(result.success).toBe(false);
    });

    it('should reject invalid state codes', () => {
      const address = {
        line1: '123 Main St',
        city: 'New York',
        state: 'NEW YORK',
        postalCode: '10001',
        country: 'US',
      };

      const result = schemas.address.safeParse(address);
      expect(result.success).toBe(false);
    });
  });

  describe('url schema', () => {
    it('should accept valid URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://test.com/path?query=value',
        'https://sub.domain.com:8080/path',
      ];

      validUrls.forEach((url) => {
        const result = schemas.url.safeParse(url);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'not-a-url',
        'ht tp://example.com', // Space in URL
      ];

      invalidUrls.forEach((url) => {
        const result = schemas.url.safeParse(url);
        expect(result.success).toBe(false);
      });
    });

    it('should reject URLs longer than 2048 characters', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2040);
      const result = schemas.url.safeParse(longUrl);
      expect(result.success).toBe(false);
    });
  });

  describe('age schema', () => {
    it('should accept valid ages', () => {
      const validAges = [18, 25, 50, 100, 120];

      validAges.forEach((age) => {
        const result = schemas.age.safeParse(age);
        expect(result.success).toBe(true);
      });
    });

    it('should reject ages under 18', () => {
      const result = schemas.age.safeParse(17);
      expect(result.success).toBe(false);
    });

    it('should reject ages over 120', () => {
      const result = schemas.age.safeParse(121);
      expect(result.success).toBe(false);
    });

    it('should reject non-integer ages', () => {
      const result = schemas.age.safeParse(25.5);
      expect(result.success).toBe(false);
    });
  });

  describe('creditCard schema', () => {
    it('should accept valid credit card numbers', () => {
      // Valid test card numbers (Luhn algorithm passes)
      const validCards = [
        '4532015112830366', // Visa
        '5425233430109903', // Mastercard
        '374245455400126',  // Amex
      ];

      validCards.forEach((card) => {
        const result = schemas.creditCard.safeParse(card);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid credit card numbers', () => {
      const invalidCards = [
        '1234567890123456', // Fails Luhn check
        '123',              // Too short
        'abcd1234abcd1234', // Contains letters
      ];

      invalidCards.forEach((card) => {
        const result = schemas.creditCard.safeParse(card);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('cvv schema', () => {
    it('should accept valid CVV codes', () => {
      const validCvvs = ['123', '4567', '000'];

      validCvvs.forEach((cvv) => {
        const result = schemas.cvv.safeParse(cvv);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid CVV codes', () => {
      const invalidCvvs = ['12', '12345', 'abc'];

      invalidCvvs.forEach((cvv) => {
        const result = schemas.cvv.safeParse(cvv);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('text schemas', () => {
    it('should accept valid short text', () => {
      const result = schemas.shortText.safeParse('Valid text');
      expect(result.success).toBe(true);
    });

    it('should reject short text over 255 characters', () => {
      const longText = 'a'.repeat(256);
      const result = schemas.shortText.safeParse(longText);
      expect(result.success).toBe(false);
    });

    it('should reject empty short text', () => {
      const result = schemas.shortText.safeParse('');
      expect(result.success).toBe(false);
    });
  });

  describe('numeric schemas', () => {
    it('should accept positive numbers', () => {
      const result = schemas.positiveNumber.safeParse(5);
      expect(result.success).toBe(true);
    });

    it('should reject zero for positive numbers', () => {
      const result = schemas.positiveNumber.safeParse(0);
      expect(result.success).toBe(false);
    });

    it('should accept zero for non-negative numbers', () => {
      const result = schemas.nonNegativeNumber.safeParse(0);
      expect(result.success).toBe(true);
    });

    it('should accept valid percentages', () => {
      const validPercentages = [0, 50, 100];

      validPercentages.forEach((pct) => {
        const result = schemas.percentage.safeParse(pct);
        expect(result.success).toBe(true);
      });
    });

    it('should reject percentages outside 0-100 range', () => {
      const invalidPercentages = [-1, 101];

      invalidPercentages.forEach((pct) => {
        const result = schemas.percentage.safeParse(pct);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('uuid schema', () => {
    it('should accept valid UUIDs', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      const result = schemas.uuid.safeParse(validUuid);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      const invalidUuids = [
        'not-a-uuid',
        '550e8400-e29b-41d4-a716',
        '550e8400e29b41d4a716446655440000',
      ];

      invalidUuids.forEach((uuid) => {
        const result = schemas.uuid.safeParse(uuid);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('slug schema', () => {
    it('should accept valid slugs', () => {
      const validSlugs = [
        'my-slug',
        'product-123',
        'hello-world-2024',
      ];

      validSlugs.forEach((slug) => {
        const result = schemas.slug.safeParse(slug);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid slugs', () => {
      const invalidSlugs = [
        'My-Slug',        // Uppercase
        'my_slug',        // Underscore
        'my--slug',       // Double dash
        '-my-slug',       // Starts with dash
        'my-slug-',       // Ends with dash
      ];

      invalidSlugs.forEach((slug) => {
        const result = schemas.slug.safeParse(slug);
        expect(result.success).toBe(false);
      });
    });
  });
});

describe('Form Schemas', () => {
  describe('contact form', () => {
    it('should accept valid contact form data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+12025551234',
        message: 'Hello, I have a question.',
      };

      const result = formSchemas.contact.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept contact form without phone', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello, I have a question.',
      };

      const result = formSchemas.contact.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject contact form with invalid email', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'invalid-email',
        message: 'Hello',
      };

      const result = formSchemas.contact.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('newsletter form', () => {
    it('should accept valid newsletter signup', () => {
      const validData = {
        email: 'user@example.com',
        consent: true,
      };

      const result = formSchemas.newsletter.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject newsletter signup without consent', () => {
      const invalidData = {
        email: 'user@example.com',
        consent: false,
      };

      const result = formSchemas.newsletter.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('registration form', () => {
    it('should accept valid registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: true,
      };

      const result = formSchemas.registration.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject registration with mismatched passwords', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Different123!',
        acceptTerms: true,
      };

      const result = formSchemas.registration.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject registration without accepting terms', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
        acceptTerms: false,
      };

      const result = formSchemas.registration.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('login form', () => {
    it('should accept valid login data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'password',
      };

      const result = formSchemas.login.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject login with empty password', () => {
      const invalidData = {
        email: 'user@example.com',
        password: '',
      };

      const result = formSchemas.login.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('password reset forms', () => {
    it('should accept valid password reset request', () => {
      const validData = {
        email: 'user@example.com',
      };

      const result = formSchemas.passwordResetRequest.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid password reset', () => {
      const validData = {
        token: 'abc123token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      };

      const result = formSchemas.passwordReset.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject password reset with mismatched passwords', () => {
      const invalidData = {
        token: 'abc123token',
        password: 'NewPassword123!',
        confirmPassword: 'Different123!',
      };

      const result = formSchemas.passwordReset.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Validation Utilities', () => {
  describe('validateInput', () => {
    it('should return success for valid input', () => {
      const result = validateInput(schemas.email, 'test@example.com');
      expect(result.success).toBe(true);
      expect(result.data).toBe('test@example.com');
      expect(result.errors).toBe(null);
    });

    it('should return errors for invalid input', () => {
      const result = validateInput(schemas.email, 'invalid-email');
      expect(result.success).toBe(false);
      expect(result.data).toBe(null);
      expect(result.errors).toBeDefined();
    });
  });

  describe('formatValidationErrors', () => {
    it('should format validation errors correctly', () => {
      const result = validateInput(formSchemas.contact, {
        name: '',
        email: 'invalid',
        message: '',
      });

      expect(result.success).toBe(false);
      if (!result.success && result.errors) {
        const formatted = formatValidationErrors(result.errors);
        expect(formatted).toHaveProperty('name');
        expect(formatted).toHaveProperty('email');
        expect(formatted).toHaveProperty('message');
      }
    });

    it('should format nested path errors', () => {
      const result = validateInput(schemas.address, {
        line1: '',
        city: '',
        state: 'INVALID',
        postalCode: 'INVALID',
        country: 'USA',
      });

      expect(result.success).toBe(false);
      if (!result.success && result.errors) {
        const formatted = formatValidationErrors(result.errors);
        expect(formatted).toHaveProperty('line1');
        expect(formatted).toHaveProperty('city');
        expect(formatted).toHaveProperty('state');
        expect(formatted).toHaveProperty('postalCode');
        expect(formatted).toHaveProperty('country');
      }
    });
  });

  describe('sanitizeString', () => {
    it('should remove HTML tags', () => {
      const result = sanitizeString('<script>alert("xss")</script>');
      expect(result).not.toContain('<');
      expect(result).not.toContain('>');
    });

    it('should remove javascript: protocol', () => {
      const result = sanitizeString('javascript:alert(1)');
      expect(result).not.toContain('javascript:');
    });

    it('should remove event handlers', () => {
      const result = sanitizeString('onclick=alert(1)');
      expect(result).not.toContain('onclick=');
    });

    it('should trim whitespace', () => {
      const result = sanitizeString('  test  ');
      expect(result).toBe('test');
    });

    it('should preserve safe content', () => {
      const safeString = 'This is a safe string with 123 and symbols: @#$%';
      const result = sanitizeString(safeString);
      expect(result).toBe(safeString);
    });
  });

  describe('validateAndSanitize', () => {
    it('should validate and sanitize string input', () => {
      const result = validateAndSanitize(schemas.name, '  John Doe  ');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('John Doe');
      }
    });

    it('should sanitize malicious input', () => {
      const result = validateAndSanitize(schemas.shortText, '<script>alert("xss")</script>');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toContain('<script>');
      }
    });

    it('should handle nested objects', () => {
      const input = {
        line1: '  123 Main St  ',
        city: '  New York  ',
        state: 'ny',
        postalCode: '10001',
        country: 'us',
      };

      const result = validateAndSanitize(schemas.address, input);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.line1).toBe('123 Main St');
        expect(result.data.city).toBe('New York');
      }
    });

    it('should return validation errors before sanitizing', () => {
      const result = validateAndSanitize(schemas.email, 'invalid-email');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });
});
