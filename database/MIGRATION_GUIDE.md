# Database Migration Guide

Instructions for running and managing database migrations for the Eonlife e-commerce platform.

## Overview

Database migrations allow you to version-control your database schema and safely apply changes across environments.

### Migration Files
- **001_create_schema.sql**: Initial schema with all tables, indexes, views, and triggers
- **001_seed_data.sql**: Sample data for development and testing

## Running Migrations

### Method 1: Using psql (Recommended)

#### Prerequisites
```bash
# Ensure PostgreSQL client is installed
which psql

# Verify database connection
psql $DATABASE_URL -c "SELECT version();"
```

#### Execute Migration
```bash
# Navigate to project directory
cd /home/user/Eonlife

# Run schema creation
psql $DATABASE_URL -f database/migrations/001_create_schema.sql

# Expected output:
# CREATE EXTENSION
# CREATE TABLE
# CREATE INDEX
# ... (many more)
```

#### Verify Installation
```bash
# Count tables created
psql $DATABASE_URL -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"

# Expected result: 10 tables

# List all tables
psql $DATABASE_URL -c "\dt"

# Expected tables:
# - users
# - products
# - orders
# - order_items
# - shipping_addresses
# - cart_items
# - newsletter_campaigns
# - newsletter_analytics
# - chatbot_conversations
# - audit_logs
```

### Method 2: Using Supabase Dashboard

#### SQL Editor
1. Go to your Supabase project dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste contents of `database/migrations/001_create_schema.sql`
5. Click "Run"
6. Verify all statements execute successfully

#### Multiple Files
If the migration file is too large, you can split it:

```bash
# View migration file size
wc -l database/migrations/001_create_schema.sql  # Should be ~600 lines

# Split into smaller chunks if needed (not usually necessary)
split -l 200 database/migrations/001_create_schema.sql schema_part_
```

### Method 3: Using Node.js Migration Runner

If you prefer to manage migrations programmatically (not included in current setup):

```typescript
// Example implementation (for future use)
import fs from 'fs';
import { query } from '@/lib/db/connection';

export async function runMigration(filePath: string) {
  const sql = fs.readFileSync(filePath, 'utf-8');
  // Split by statements and execute
  // Implementation details...
}
```

---

## Loading Seed Data

### Option A: Load All Seed Data
```bash
# Load seed data
psql $DATABASE_URL -f database/seeds/001_seed_data.sql

# Verify data loaded
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"      # Should return 5
psql $DATABASE_URL -c "SELECT COUNT(*) FROM products;"   # Should return 5
psql $DATABASE_URL -c "SELECT COUNT(*) FROM orders;"     # Should return 5
```

### Option B: Selective Seed Data

If you only want specific tables, you can extract sections from `001_seed_data.sql`:

```sql
-- Seed only users
INSERT INTO users (email, first_name, last_name, ...) VALUES (...);

-- Seed only products
INSERT INTO products (sku, name, price, ...) VALUES (...);
```

### Option C: Skip Seed Data (Production)

For production environments, skip the seed file:

```bash
# Only run schema, no seed data
psql $PROD_DATABASE_URL -f database/migrations/001_create_schema.sql
```

---

## Migration Verification

### Complete Verification Checklist

Run this script to verify everything:

```bash
#!/bin/bash

DB_URL=$DATABASE_URL

echo "Checking database connectivity..."
psql $DB_URL -c "SELECT NOW();" > /dev/null && echo "✓ Connected" || echo "✗ Connection failed"

echo "Checking tables..."
psql $DB_URL -c "\dt" | grep -E "(users|products|orders|cart_items|newsletter)" && echo "✓ Tables created"

echo "Checking indexes..."
psql $DB_URL -c "\di" | grep "idx_" && echo "✓ Indexes created"

echo "Checking views..."
psql $DB_URL -c "\dv" | grep -E "(active_|low_stock|order_summaries)" && echo "✓ Views created"

echo "Checking triggers..."
psql $DB_URL -c "SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema='public';" && echo "✓ Triggers created"

echo "Checking data..."
echo "  Users: $(psql $DB_URL -t -c "SELECT COUNT(*) FROM users;")"
echo "  Products: $(psql $DB_URL -t -c "SELECT COUNT(*) FROM products;")"
echo "  Orders: $(psql $DB_URL -t -c "SELECT COUNT(*) FROM orders;")"

echo "✓ Migration verification complete!"
```

Save as `scripts/verify-migration.sh` and run:

```bash
chmod +x scripts/verify-migration.sh
./scripts/verify-migration.sh
```

---

## Rolling Back Migrations

### Option 1: Drop Everything (Development Only)

**WARNING: This deletes all data!**

```bash
# Reset database to empty state
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run migrations
psql $DATABASE_URL -f database/migrations/001_create_schema.sql
```

### Option 2: Drop Specific Table

```bash
# Drop a single table (will cascade to dependent tables)
psql $DATABASE_URL -c "DROP TABLE IF EXISTS products CASCADE;"

# Re-create just that table (requires manual SQL)
```

### Option 3: Restore from Backup

For production rollbacks:

```bash
# List available backups
# Go to Supabase Dashboard → Backups

# Restore to a specific point in time
# Click backup and select "Restore"
```

---

## Idempotent Migrations

All migrations should be safe to run multiple times:

```sql
-- GOOD: Using IF NOT EXISTS
CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY,
  ...
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- BAD: Will fail if run twice
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  ...
);
```

The provided migrations use `IF NOT EXISTS` for safety.

---

## Testing Migrations

### Unit Test Example (TypeScript)

```typescript
import { healthCheck, query } from '@/lib/db/connection';

describe('Database Migrations', () => {
  test('Database connection works', async () => {
    const isHealthy = await healthCheck();
    expect(isHealthy).toBe(true);
  });

  test('Users table exists', async () => {
    const result = await query(
      `SELECT EXISTS(
        SELECT 1 FROM information_schema.tables
        WHERE table_schema='public' AND table_name='users'
      ) as exists`
    );
    expect(result.rows[0].exists).toBe(true);
  });

  test('Can insert and read user', async () => {
    const email = `test-${Date.now()}@example.com`;

    await query(
      `INSERT INTO users (email, first_name, last_name) VALUES ($1, $2, $3)`,
      [email, 'Test', 'User']
    );

    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].email).toBe(email);
  });
});
```

---

## Migration Safety

### Best Practices

1. **Always Backup First**
   ```bash
   # Create backup before running migrations
   pg_dump $DATABASE_URL > backup_before_migration.sql
   ```

2. **Test in Development**
   - Run migrations on development database first
   - Verify all functionality works
   - Then run on staging
   - Finally run on production

3. **Use Transactions**
   ```sql
   BEGIN;
   -- All migration statements
   COMMIT;
   -- Or ROLLBACK if something fails
   ```

4. **Monitor Application Logs**
   ```bash
   # Watch for errors after migration
   tail -f logs/application.log
   ```

5. **Verify Data Integrity**
   ```sql
   -- Check for orphaned records
   SELECT COUNT(*) FROM orders WHERE user_id NOT IN (SELECT user_id FROM users);

   -- Verify constraints
   SELECT constraint_name FROM information_schema.constraint_column_usage
   WHERE table_schema='public';
   ```

---

## Troubleshooting

### Migration Fails with "Permission Denied"

```bash
# Solution: Use postgres user (has all permissions)
psql -U postgres $DATABASE_URL -f database/migrations/001_create_schema.sql

# Or grant permissions
psql $DATABASE_URL -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO $DB_USER;"
```

### "Table Already Exists"

```sql
-- Check if tables exist
SELECT * FROM information_schema.tables WHERE table_schema='public';

-- If already created, migrations are safe to re-run (due to IF NOT EXISTS)
```

### Connection Timeout

```bash
# Increase timeout
PGCONNECT_TIMEOUT=10 psql $DATABASE_URL -f database/migrations/001_create_schema.sql

# Or check database status
psql $DATABASE_URL -c "SELECT 1;"
```

### Large File Issues

If migration file is too large for web dashboard:

```bash
# Upload in chunks
split -l 300 database/migrations/001_create_schema.sql schema_

# Run chunks one by one
psql $DATABASE_URL -f schema_aa
psql $DATABASE_URL -f schema_ab
psql $DATABASE_URL -f schema_ac
```

---

## Production Deployment

### Pre-Migration Checklist
- [ ] Database backup created
- [ ] Maintenance window scheduled
- [ ] Team notified
- [ ] Rollback plan documented
- [ ] Monitoring alerts enabled

### Migration Steps
```bash
# 1. Create backup
pg_dump $PROD_DATABASE_URL > prod_backup_$(date +%s).sql

# 2. Run migration (non-interactive, safe)
psql $PROD_DATABASE_URL -f database/migrations/001_create_schema.sql

# 3. Verify
psql $PROD_DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# 4. Test critical queries
# (See test commands below)

# 5. Monitor application
tail -f logs/application.log
```

### Post-Migration Testing

```bash
# Test critical user paths
psql $PROD_DATABASE_URL -c "
  SELECT o.order_number, u.email, o.total
  FROM orders o
  JOIN users u ON o.user_id = u.user_id
  LIMIT 5;
"

# Check for errors
psql $PROD_DATABASE_URL -c "
  SELECT COUNT(*) as error_count
  FROM information_schema.check_constraints
  WHERE constraint_type = 'CHECK';
"
```

---

## Monitoring Migrations

### Check Migration Status
```sql
-- View table sizes (indicates data)
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename) DESC;

-- Check indexes
SELECT indexname, idx_scan FROM pg_stat_user_indexes ORDER BY idx_scan DESC;

-- Monitor slow queries
SELECT mean_time, calls, query FROM pg_stat_statements
LIMIT 10 ORDER BY mean_time DESC;
```

---

## References

- [PostgreSQL CREATE TABLE](https://www.postgresql.org/docs/current/sql-createtable.html)
- [PostgreSQL Transactions](https://www.postgresql.org/docs/current/tutorial-transactions.html)
- [Supabase Migrations](https://supabase.com/docs/guides/database/postgres-schemas)
- [Database Change Management Best Practices](https://www.liquibase.org/get-started/best-practices)

---

**Last Updated**: 2025-11-15
**Version**: 1.0
