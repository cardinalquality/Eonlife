/**
 * Database Module Index
 * Central export point for all database operations
 *
 * Usage:
 * import { users, products, orders } from '@/lib/db';
 * import { query, transaction } from '@/lib/db/connection';
 */

// Re-export connection utilities
export * from './connection';

// Re-export user operations
export * from './users';

// Re-export product operations
export * from './products';

// Re-export order operations
export * from './orders';

// Export module namespaces for convenience
import * as users from './users';
import * as products from './products';
import * as orders from './orders';

export { users, products, orders };
