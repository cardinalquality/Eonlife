/**
 * Unit tests for Database Connection Module
 * Tests connection pooling, query execution, transactions, and health checks
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  initializePool,
  getPool,
  query,
  transaction,
  closePool,
  healthCheck
} from '../db/connection';

// Mock @vercel/postgres
const mockPool = {
  query: vi.fn(),
  connect: vi.fn(),
  end: vi.fn()
};

const mockClient = {
  query: vi.fn(),
  release: vi.fn()
};

vi.mock('@vercel/postgres', () => ({
  createPool: vi.fn(() => mockPool)
}));

import { createPool } from '@vercel/postgres';

describe('Database Connection', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

    // Reset the pool between tests
    // Note: This requires the module to be re-imported or the pool to be reset
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('initializePool', () => {
    it('should create a connection pool', () => {
      const pool = initializePool();

      expect(pool).toBeDefined();
      expect(createPool).toHaveBeenCalledWith({
        connectionString: 'postgresql://test:test@localhost:5432/testdb'
      });
    });

    it('should throw error if DATABASE_URL is not set', () => {
      delete process.env.DATABASE_URL;

      expect(() => initializePool()).toThrow(
        'DATABASE_URL environment variable is not set'
      );
    });

    it('should return existing pool if already initialized', () => {
      const pool1 = initializePool();
      const pool2 = initializePool();

      expect(pool1).toBe(pool2);
      expect(createPool).toHaveBeenCalledTimes(1);
    });

    it('should use DATABASE_URL from environment', () => {
      const customUrl = 'postgresql://custom:pass@host:5432/db';
      process.env.DATABASE_URL = customUrl;

      // Force re-initialization
      vi.resetModules();

      initializePool();

      expect(createPool).toHaveBeenCalledWith({
        connectionString: customUrl
      });
    });
  });

  describe('getPool', () => {
    it('should return existing pool', () => {
      const pool1 = initializePool();
      const pool2 = getPool();

      expect(pool2).toBe(pool1);
    });

    it('should initialize pool if not exists', () => {
      const pool = getPool();

      expect(pool).toBeDefined();
      expect(createPool).toHaveBeenCalled();
    });
  });

  describe('query', () => {
    beforeEach(() => {
      mockPool.query.mockResolvedValue({
        rows: [{ id: 1, name: 'test' }],
        rowCount: 1
      });
    });

    it('should execute a query', async () => {
      const result = await query('SELECT * FROM users WHERE id = $1', ['123']);

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = $1',
        ['123']
      );
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]).toEqual({ id: 1, name: 'test' });
    });

    it('should execute query without parameters', async () => {
      await query('SELECT * FROM users');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM users',
        undefined
      );
    });

    it('should handle string parameters', async () => {
      await query('INSERT INTO users (name) VALUES ($1)', ['John']);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['John']
      );
    });

    it('should handle number parameters', async () => {
      await query('SELECT * FROM products WHERE price < $1', [100]);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        [100]
      );
    });

    it('should handle boolean parameters', async () => {
      await query('SELECT * FROM users WHERE active = $1', [true]);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        [true]
      );
    });

    it('should handle null parameters', async () => {
      await query('UPDATE users SET phone = $1 WHERE id = $2', [null, '123']);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        [null, '123']
      );
    });

    it('should handle undefined parameters', async () => {
      await query('UPDATE users SET phone = $1 WHERE id = $2', [undefined, '123']);

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        [undefined, '123']
      );
    });

    it('should handle multiple parameters', async () => {
      await query(
        'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3)',
        ['user_123', 99.99, 'pending']
      );

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.any(String),
        ['user_123', 99.99, 'pending']
      );
    });

    it('should log and throw database errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Connection failed');
      mockPool.query.mockRejectedValue(error);

      await expect(query('SELECT * FROM users')).rejects.toThrow('Connection failed');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Database query error:', error);

      consoleErrorSpy.mockRestore();
    });

    it('should return query results', async () => {
      const mockResult = {
        rows: [
          { id: 1, name: 'User 1' },
          { id: 2, name: 'User 2' }
        ],
        rowCount: 2
      };
      mockPool.query.mockResolvedValue(mockResult);

      const result = await query('SELECT * FROM users');

      expect(result).toEqual(mockResult);
      expect(result.rows).toHaveLength(2);
      expect(result.rowCount).toBe(2);
    });

    it('should handle empty result sets', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      const result = await query('SELECT * FROM users WHERE id = $1', ['nonexistent']);

      expect(result.rows).toHaveLength(0);
      expect(result.rowCount).toBe(0);
    });
  });

  describe('transaction', () => {
    beforeEach(() => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 1 }], rowCount: 1 }) // Query 1
        .mockResolvedValueOnce({ rows: [{ id: 2 }], rowCount: 1 }) // Query 2
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      mockPool.connect.mockResolvedValue(mockClient);
    });

    it('should execute multiple queries in a transaction', async () => {
      const queries = [
        { query: 'INSERT INTO users (name) VALUES ($1)', values: ['John'] },
        { query: 'INSERT INTO users (name) VALUES ($1)', values: ['Jane'] }
      ];

      const results = await transaction(queries);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith(queries[0].query, queries[0].values);
      expect(mockClient.query).toHaveBeenCalledWith(queries[1].query, queries[1].values);
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(results).toHaveLength(2);
    });

    it('should execute queries in order', async () => {
      const queries = [
        { query: 'INSERT INTO orders (total) VALUES ($1)', values: [100] },
        { query: 'INSERT INTO order_items (order_id, product_id) VALUES ($1, $2)', values: [1, 'prod_1'] }
      ];

      await transaction(queries);

      const calls = mockClient.query.mock.calls;
      expect(calls[0][0]).toBe('BEGIN');
      expect(calls[1][0]).toBe(queries[0].query);
      expect(calls[2][0]).toBe(queries[1].query);
      expect(calls[3][0]).toBe('COMMIT');
    });

    it('should rollback on error', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 1 }) // Query 1
        .mockRejectedValueOnce(new Error('Query failed')) // Query 2 fails
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ROLLBACK

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const queries = [
        { query: 'INSERT INTO users (name) VALUES ($1)', values: ['John'] },
        { query: 'INVALID SQL', values: [] }
      ];

      await expect(transaction(queries)).rejects.toThrow('Query failed');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');

      consoleErrorSpy.mockRestore();
    });

    it('should release client after transaction', async () => {
      const queries = [
        { query: 'SELECT 1', values: [] }
      ];

      await transaction(queries);

      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should release client even after error', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockRejectedValueOnce(new Error('Query failed'))
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ROLLBACK

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const queries = [{ query: 'INVALID', values: [] }];

      await expect(transaction(queries)).rejects.toThrow();
      expect(mockClient.release).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should return all query results', async () => {
      const mockResults = [
        { rows: [{ id: 1 }], rowCount: 1 },
        { rows: [{ id: 2 }], rowCount: 1 }
      ];

      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce(mockResults[0])
        .mockResolvedValueOnce(mockResults[1])
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const queries = [
        { query: 'INSERT INTO users (name) VALUES ($1) RETURNING *', values: ['John'] },
        { query: 'INSERT INTO users (name) VALUES ($1) RETURNING *', values: ['Jane'] }
      ];

      const results = await transaction(queries);

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual(mockResults[0]);
      expect(results[1]).toEqual(mockResults[1]);
    });

    it('should handle transaction with no queries', async () => {
      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // COMMIT

      const results = await transaction([]);

      expect(results).toHaveLength(0);
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should log transaction errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Transaction error');

      mockClient.query
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }) // BEGIN
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce({ rows: [], rowCount: 0 }); // ROLLBACK

      await expect(transaction([{ query: 'FAIL', values: [] }])).rejects.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Transaction error:', error);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('closePool', () => {
    it('should close the connection pool', async () => {
      initializePool();

      await closePool();

      expect(mockPool.end).toHaveBeenCalled();
    });

    it('should handle closing non-existent pool', async () => {
      await closePool();

      // Should not throw
      expect(true).toBe(true);
    });

    it('should allow re-initialization after closing', async () => {
      initializePool();
      await closePool();

      const newPool = initializePool();

      expect(newPool).toBeDefined();
      expect(createPool).toHaveBeenCalled();
    });
  });

  describe('healthCheck', () => {
    it('should return true for healthy connection', async () => {
      mockPool.query.mockResolvedValue({
        rows: [{ current_time: new Date() }],
        rowCount: 1
      });

      const result = await healthCheck();

      expect(result).toBe(true);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT NOW()')
      );
    });

    it('should return false for unhealthy connection', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockPool.query.mockRejectedValue(new Error('Connection failed'));

      const result = await healthCheck();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Database health check failed:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('should return false if no rows returned', async () => {
      mockPool.query.mockResolvedValue({
        rows: [],
        rowCount: 0
      });

      const result = await healthCheck();

      expect(result).toBe(false);
    });

    it('should execute SELECT NOW() query', async () => {
      mockPool.query.mockResolvedValue({
        rows: [{ current_time: new Date() }],
        rowCount: 1
      });

      await healthCheck();

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT NOW() as current_time'
      );
    });

    it('should handle database timeout', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockPool.query.mockRejectedValue(new Error('Query timeout'));

      const result = await healthCheck();

      expect(result).toBe(false);

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('should handle query errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockPool.query.mockRejectedValue(new Error('Syntax error'));

      await expect(query('INVALID SQL')).rejects.toThrow('Syntax error');

      consoleErrorSpy.mockRestore();
    });

    it('should handle connection errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockPool.query.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(query('SELECT 1')).rejects.toThrow('ECONNREFUSED');

      consoleErrorSpy.mockRestore();
    });

    it('should handle transaction connection errors', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockPool.connect.mockRejectedValue(new Error('Connection pool exhausted'));

      await expect(transaction([{ query: 'SELECT 1', values: [] }]))
        .rejects.toThrow('Connection pool exhausted');

      consoleErrorSpy.mockRestore();
    });
  });
});
