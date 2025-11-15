/**
 * Database Connection Module
 * Handles PostgreSQL/Supabase connection pooling and configuration
 * Supports both server and edge runtime
 */

import { createPool } from '@vercel/postgres';

// Connection pool instance
let pool: ReturnType<typeof createPool> | null = null;

/**
 * Initialize database connection pool
 * @returns Connection pool instance
 */
export function initializePool() {
  if (pool) {
    return pool;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is not set. Please configure your database connection.'
    );
  }

  pool = createPool({
    connectionString: process.env.DATABASE_URL,
  });

  return pool;
}

/**
 * Get database connection pool
 * Initializes if not already initialized
 * @returns Connection pool instance
 */
export function getPool() {
  if (!pool) {
    return initializePool();
  }
  return pool;
}

/**
 * Execute a query with automatic connection from pool
 * @param query SQL query string
 * @param values Query parameters
 * @returns Query result
 */
export async function query(
  query: string,
  values?: (string | number | boolean | null | undefined)[]
) {
  const pool = getPool();
  try {
    const result = await pool.query(query, values);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Execute multiple queries in a transaction
 * @param queries Array of {query, values} objects
 * @returns Array of query results
 */
export async function transaction(
  queries: Array<{ query: string; values?: (string | number | boolean | null | undefined)[] }>
) {
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const results = [];
    for (const { query, values } of queries) {
      const result = await client.query(query, values);
      results.push(result);
    }

    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close database connection pool
 * Should be called on application shutdown
 */
export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Health check for database connection
 * @returns true if connection is healthy, false otherwise
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW() as current_time');
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export default {
  initializePool,
  getPool,
  query,
  transaction,
  closePool,
  healthCheck,
};
