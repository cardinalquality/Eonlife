/**
 * Unit tests for User Database Operations
 * Tests CRUD operations, newsletter management, and user queries
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as users from '../db/users';
import type { User } from '../db/users';

// Mock the database connection module
vi.mock('../db/connection', () => ({
  query: vi.fn()
}));

import { query } from '../db/connection';

describe('User Database Operations', () => {
  const mockUser: User = {
    user_id: 'user_123',
    email: 'test@example.com',
    first_name: 'John',
    last_name: 'Doe',
    phone_number: '+1234567890',
    email_verified: true,
    newsletter_subscribed: false,
    newsletter_consent_date: undefined,
    preferences: { frequency: 'weekly', topics: [] },
    last_login: new Date('2024-01-01'),
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUserByEmail', () => {
    it('should return a user when found by email', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      const result = await users.getUserByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE email = $1'),
        ['test@example.com']
      );
    });

    it('should return null when user not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await users.getUserByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    it('should exclude soft-deleted users', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await users.getUserByEmail('test@example.com');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });

    it('should limit to 1 result', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await users.getUserByEmail('test@example.com');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT 1'),
        expect.any(Array)
      );
    });

    it('should handle database errors', async () => {
      vi.mocked(query).mockRejectedValue(new Error('Database error'));

      await expect(users.getUserByEmail('test@example.com')).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('getUserById', () => {
    it('should return a user when found by ID', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      const result = await users.getUserById('user_123');

      expect(result).toEqual(mockUser);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users WHERE user_id = $1'),
        ['user_123']
      );
    });

    it('should return null when user not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await users.getUserById('nonexistent');

      expect(result).toBeNull();
    });

    it('should exclude soft-deleted users', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await users.getUserById('user_123');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });
  });

  describe('createUser', () => {
    const newUserData = {
      email: 'new@example.com',
      first_name: 'Jane',
      last_name: 'Smith',
      phone_number: '+9876543210',
      email_verified: false,
      newsletter_subscribed: true,
      preferences: { frequency: 'monthly' as const, topics: ['tech'] }
    };

    it('should create a new user', async () => {
      const createdUser = { ...mockUser, ...newUserData };
      vi.mocked(query).mockResolvedValue({
        rows: [createdUser],
        rowCount: 1
      } as any);

      const result = await users.createUser(newUserData);

      expect(result).toEqual(createdUser);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([
          'new@example.com',
          'Jane',
          'Smith',
          '+9876543210',
          false,
          true,
          expect.any(String) // JSON stringified preferences
        ])
      );
    });

    it('should handle optional fields', async () => {
      const minimalData = {
        email: 'minimal@example.com',
        first_name: 'Min',
        last_name: 'User',
        email_verified: false,
        newsletter_subscribed: false
      };

      vi.mocked(query).mockResolvedValue({
        rows: [{ ...mockUser, ...minimalData }],
        rowCount: 1
      } as any);

      await users.createUser(minimalData as any);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'minimal@example.com',
          'Min',
          'User',
          null, // phone_number
          false,
          false,
          expect.any(String) // default preferences
        ])
      );
    });

    it('should default email_verified to false', async () => {
      const dataWithoutVerified = {
        ...newUserData,
        email_verified: undefined
      };

      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      await users.createUser(dataWithoutVerified as any);

      const callArgs = vi.mocked(query).mock.calls[0][1];
      expect(callArgs![4]).toBe(false); // email_verified position
    });

    it('should default newsletter_subscribed to false', async () => {
      const dataWithoutNewsletter = {
        ...newUserData,
        newsletter_subscribed: undefined
      };

      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      await users.createUser(dataWithoutNewsletter as any);

      const callArgs = vi.mocked(query).mock.calls[0][1];
      expect(callArgs![5]).toBe(false); // newsletter_subscribed position
    });

    it('should stringify preferences as JSON', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      await users.createUser(newUserData);

      const callArgs = vi.mocked(query).mock.calls[0][1];
      const preferencesArg = callArgs![6];
      expect(typeof preferencesArg).toBe('string');
      expect(JSON.parse(preferencesArg as string)).toEqual(newUserData.preferences);
    });

    it('should use default preferences when not provided', async () => {
      const dataWithoutPrefs = {
        email: 'test@example.com',
        first_name: 'Test',
        last_name: 'User',
        email_verified: false,
        newsletter_subscribed: false
      };

      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      await users.createUser(dataWithoutPrefs as any);

      const callArgs = vi.mocked(query).mock.calls[0][1];
      const preferencesArg = JSON.parse(callArgs![6] as string);
      expect(preferencesArg).toEqual({ frequency: 'weekly', topics: [] });
    });
  });

  describe('updateUser', () => {
    it('should update user fields', async () => {
      const updates = {
        first_name: 'Updated',
        last_name: 'Name'
      };

      vi.mocked(query).mockResolvedValue({
        rows: [{ ...mockUser, ...updates }],
        rowCount: 1
      } as any);

      const result = await users.updateUser('user_123', updates);

      expect(result).toBeDefined();
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET'),
        expect.arrayContaining(['Updated', 'Name', 'user_123'])
      );
    });

    it('should only update allowed fields', async () => {
      const updates = {
        first_name: 'Updated',
        email: 'newemail@example.com', // Not allowed
        user_id: 'should-not-update', // Not allowed
        created_at: new Date() // Not allowed
      } as any;

      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      await users.updateUser('user_123', updates);

      const sql = vi.mocked(query).mock.calls[0][0];
      expect(sql).toContain('first_name =');
      expect(sql).not.toContain('email =');
      expect(sql).not.toContain('user_id =');
      expect(sql).not.toContain('created_at =');
    });

    it('should stringify preferences when updating', async () => {
      const updates = {
        preferences: { frequency: 'daily' as const, topics: ['news', 'updates'] }
      };

      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      await users.updateUser('user_123', updates as any);

      const callArgs = vi.mocked(query).mock.calls[0][1];
      expect(callArgs![0]).toEqual(JSON.stringify(updates.preferences));
    });

    it('should return null when user not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await users.updateUser('nonexistent', { first_name: 'Test' });

      expect(result).toBeNull();
    });

    it('should return user unchanged when no valid fields to update', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      const result = await users.updateUser('user_123', {});

      expect(result).toEqual(mockUser);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['user_123']
      );
    });

    it('should exclude soft-deleted users', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await users.updateUser('user_123', { first_name: 'Test' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });

    it('should update last_login field', async () => {
      const loginDate = new Date('2024-06-01');
      const updates = { last_login: loginDate };

      vi.mocked(query).mockResolvedValue({
        rows: [{ ...mockUser, last_login: loginDate }],
        rowCount: 1
      } as any);

      const result = await users.updateUser('user_123', updates as any);

      expect(result?.last_login).toEqual(loginDate);
    });

    it('should update email_verified field', async () => {
      const updates = { email_verified: true };

      vi.mocked(query).mockResolvedValue({
        rows: [{ ...mockUser, email_verified: true }],
        rowCount: 1
      } as any);

      const result = await users.updateUser('user_123', updates);

      expect(result?.email_verified).toBe(true);
    });
  });

  describe('deleteUser', () => {
    it('should soft delete a user', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 1
      } as any);

      const result = await users.deleteUser('user_123');

      expect(result).toBe(true);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE users SET deleted_at = NOW()'),
        ['user_123']
      );
    });

    it('should return false when user not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await users.deleteUser('nonexistent');

      expect(result).toBe(false);
    });

    it('should only delete non-deleted users', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 1
      } as any);

      await users.deleteUser('user_123');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        ['user_123']
      );
    });
  });

  describe('subscribeToNewsletter', () => {
    it('should subscribe user with default frequency and topics', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ ...mockUser, newsletter_subscribed: true }],
        rowCount: 1
      } as any);

      const result = await users.subscribeToNewsletter('user_123');

      expect(result?.newsletter_subscribed).toBe(true);
    });

    it('should set newsletter_subscribed to true', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ ...mockUser, newsletter_subscribed: true }],
        rowCount: 1
      } as any);

      await users.subscribeToNewsletter('user_123');

      const sql = vi.mocked(query).mock.calls[0][0];
      expect(sql).toContain('newsletter_subscribed =');
    });

    it('should set consent date', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      await users.subscribeToNewsletter('user_123');

      const sql = vi.mocked(query).mock.calls[0][0];
      expect(sql).toContain('newsletter_consent_date =');
    });

    it('should accept custom frequency', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      await users.subscribeToNewsletter('user_123', 'daily');

      const callArgs = vi.mocked(query).mock.calls[0][1];
      const preferences = JSON.parse(callArgs![2] as string);
      expect(preferences.frequency).toBe('daily');
    });

    it('should accept custom topics', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      await users.subscribeToNewsletter('user_123', 'weekly', ['tech', 'news']);

      const callArgs = vi.mocked(query).mock.calls[0][1];
      const preferences = JSON.parse(callArgs![2] as string);
      expect(preferences.topics).toEqual(['tech', 'news']);
    });

    it('should use default topics when not provided', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      await users.subscribeToNewsletter('user_123', 'monthly');

      const callArgs = vi.mocked(query).mock.calls[0][1];
      const preferences = JSON.parse(callArgs![2] as string);
      expect(preferences.topics).toEqual(['new_products', 'promotions', 'tips']);
    });
  });

  describe('unsubscribeFromNewsletter', () => {
    it('should unsubscribe user from newsletter', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ ...mockUser, newsletter_subscribed: false }],
        rowCount: 1
      } as any);

      const result = await users.unsubscribeFromNewsletter('user_123');

      expect(result?.newsletter_subscribed).toBe(false);
    });

    it('should set newsletter_subscribed to false', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      await users.unsubscribeFromNewsletter('user_123');

      const callArgs = vi.mocked(query).mock.calls[0][1];
      expect(callArgs).toContain(false);
    });
  });

  describe('updateLastLogin', () => {
    it('should update last login timestamp', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      const result = await users.updateLastLogin('user_123');

      expect(result).toBeDefined();
    });

    it('should set last_login to current date', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      await users.updateLastLogin('user_123');

      const callArgs = vi.mocked(query).mock.calls[0][1];
      expect(callArgs![0]).toBeInstanceOf(Date);
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with default pagination', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockUser],
        rowCount: 1
      } as any);

      const result = await users.getAllUsers();

      expect(result).toEqual([mockUser]);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM users'),
        [100, 0]
      );
    });

    it('should support custom limit', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await users.getAllUsers(50);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        [50, 0]
      );
    });

    it('should support custom offset', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await users.getAllUsers(100, 50);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        [100, 50]
      );
    });

    it('should order by created_at DESC', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await users.getAllUsers();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        expect.any(Array)
      );
    });

    it('should exclude soft-deleted users', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await users.getAllUsers();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });
  });

  describe('getNewsletterSubscribers', () => {
    it('should return only subscribed users', async () => {
      const subscribedUser = { ...mockUser, newsletter_subscribed: true };
      vi.mocked(query).mockResolvedValue({
        rows: [subscribedUser],
        rowCount: 1
      } as any);

      const result = await users.getNewsletterSubscribers();

      expect(result).toEqual([subscribedUser]);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('newsletter_subscribed = TRUE'),
        undefined
      );
    });

    it('should exclude soft-deleted users', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await users.getNewsletterSubscribers();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        undefined
      );
    });

    it('should order by created_at DESC', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await users.getNewsletterSubscribers();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        undefined
      );
    });
  });

  describe('countUsers', () => {
    it('should return count of all users', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '150' }],
        rowCount: 1
      } as any);

      const result = await users.countUsers();

      expect(result).toBe(150);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*) as count FROM users'),
        undefined
      );
    });

    it('should exclude soft-deleted users', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '0' }],
        rowCount: 1
      } as any);

      await users.countUsers();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        undefined
      );
    });

    it('should handle zero count', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '0' }],
        rowCount: 1
      } as any);

      const result = await users.countUsers();

      expect(result).toBe(0);
    });

    it('should parse count as integer', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '42' }],
        rowCount: 1
      } as any);

      const result = await users.countUsers();

      expect(typeof result).toBe('number');
      expect(result).toBe(42);
    });
  });

  describe('countNewsletterSubscribers', () => {
    it('should return count of subscribed users', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '75' }],
        rowCount: 1
      } as any);

      const result = await users.countNewsletterSubscribers();

      expect(result).toBe(75);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('newsletter_subscribed = TRUE'),
        undefined
      );
    });

    it('should exclude soft-deleted users', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '0' }],
        rowCount: 1
      } as any);

      await users.countNewsletterSubscribers();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        undefined
      );
    });

    it('should handle zero count', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '0' }],
        rowCount: 1
      } as any);

      const result = await users.countNewsletterSubscribers();

      expect(result).toBe(0);
    });

    it('should parse count as integer', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '25' }],
        rowCount: 1
      } as any);

      const result = await users.countNewsletterSubscribers();

      expect(typeof result).toBe('number');
      expect(result).toBe(25);
    });
  });
});
