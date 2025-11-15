/**
 * User Database Operations
 * Provides CRUD operations for user management
 */

import { query } from './connection';

export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  email_verified: boolean;
  newsletter_subscribed: boolean;
  newsletter_consent_date?: Date;
  preferences?: Record<string, any>;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await query(
    `SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL LIMIT 1`,
    [email]
  );
  return result.rows[0] || null;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const result = await query(
    `SELECT * FROM users WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId]
  );
  return result.rows[0] || null;
}

/**
 * Create new user
 */
export async function createUser(userData: Omit<User, 'user_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'created_by' | 'updated_by'>): Promise<User> {
  const result = await query(
    `INSERT INTO users (
      email, first_name, last_name, phone_number,
      email_verified, newsletter_subscribed, preferences
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      userData.email,
      userData.first_name,
      userData.last_name,
      userData.phone_number || null,
      userData.email_verified || false,
      userData.newsletter_subscribed || false,
      JSON.stringify(userData.preferences || { frequency: 'weekly', topics: [] })
    ]
  );
  return result.rows[0];
}

/**
 * Update user information
 */
export async function updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
  const allowedFields = ['first_name', 'last_name', 'phone_number', 'email_verified', 'newsletter_subscribed', 'preferences', 'last_login'];
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(key === 'preferences' ? JSON.stringify(value) : value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    return getUserById(userId);
  }

  values.push(userId);

  const result = await query(
    `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${paramCount} AND deleted_at IS NULL RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Soft delete user
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const result = await query(
    `UPDATE users SET deleted_at = NOW() WHERE user_id = $1 AND deleted_at IS NULL`,
    [userId]
  );
  return result.rowCount > 0;
}

/**
 * Subscribe user to newsletter
 */
export async function subscribeToNewsletter(
  userId: string,
  frequency: 'daily' | 'weekly' | 'monthly' = 'weekly',
  topics: string[] = ['new_products', 'promotions', 'tips']
): Promise<User | null> {
  return updateUser(userId, {
    newsletter_subscribed: true,
    newsletter_consent_date: new Date(),
    preferences: { frequency, topics }
  } as Partial<User>);
}

/**
 * Unsubscribe user from newsletter
 */
export async function unsubscribeFromNewsletter(userId: string): Promise<User | null> {
  return updateUser(userId, {
    newsletter_subscribed: false
  } as Partial<User>);
}

/**
 * Update last login timestamp
 */
export async function updateLastLogin(userId: string): Promise<User | null> {
  return updateUser(userId, {
    last_login: new Date()
  } as Partial<User>);
}

/**
 * Get all active users (not deleted)
 */
export async function getAllUsers(limit = 100, offset = 0): Promise<User[]> {
  const result = await query(
    `SELECT * FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

/**
 * Get newsletter subscribers
 */
export async function getNewsletterSubscribers(): Promise<User[]> {
  const result = await query(
    `SELECT * FROM users WHERE deleted_at IS NULL AND newsletter_subscribed = TRUE ORDER BY created_at DESC`
  );
  return result.rows;
}

/**
 * Count total users
 */
export async function countUsers(): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * Count newsletter subscribers
 */
export async function countNewsletterSubscribers(): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL AND newsletter_subscribed = TRUE`
  );
  return parseInt(result.rows[0].count, 10);
}
