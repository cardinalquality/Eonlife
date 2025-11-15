# Eonlife Database Setup Guide

Quick setup instructions for getting the database running.

## Prerequisites
- PostgreSQL 14+ or Supabase account
- Node.js 18+
- `psql` CLI (optional, for direct database access)

## Option 1: Supabase (Recommended)

### 1. Create Supabase Project
```bash
# Go to https://supabase.com and create a new account
# Click "New Project" and follow the wizard
# Select PostgreSQL 14 or later
# Save your credentials:
# - Project URL: supabase_url
# - Anon Key: anon_key (for client-side)
# - Service Role Key: service_role_key (for server-side)
```

### 2. Get Connection String
In Supabase Dashboard:
1. Go to Project Settings → Database
2. Find "Connection string" section
3. Copy the PostgreSQL URI:
   ```
   postgresql://postgres:[password]@[project-id].supabase.co:5432/postgres
   ```

### 3. Configure Environment
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your connection string
DATABASE_URL=postgresql://postgres:[password]@[project-id].supabase.co:5432/postgres
```

### 4. Initialize Database

#### Using psql (Recommended)
```bash
# Connect to your Supabase database
psql postgresql://postgres:[password]@[project-id].supabase.co:5432/postgres

# In psql console, run:
\i database/migrations/001_create_schema.sql
\i database/seeds/001_seed_data.sql

# Verify installation
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as order_count FROM orders;

# Exit psql
\q
```

#### Using curl (if psql not available)
```bash
# You can also run SQL files through Supabase Dashboard
# Go to SQL Editor and paste the SQL content
```

### 5. Verify Setup
```bash
# Test connection using Node.js
node -e "
const { query } = require('./lib/db/connection');
query('SELECT COUNT(*) as count FROM users').then(r => {
  console.log('Users:', r.rows[0].count);
  console.log('✓ Database connected successfully!');
}).catch(e => {
  console.error('✗ Connection failed:', e.message);
});
"
```

---

## Option 2: Local PostgreSQL

### 1. Install PostgreSQL
```bash
# macOS (using Homebrew)
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Windows
# Download installer from https://www.postgresql.org/download/windows/
```

### 2. Create Database
```bash
# Start PostgreSQL service
sudo systemctl start postgresql  # Linux
brew services start postgresql  # macOS

# Create database
createdb eonlife_db

# Connect
psql eonlife_db
```

### 3. Configure Environment
```bash
cp .env.example .env.local

# Edit .env.local
DATABASE_URL=postgresql://postgres@localhost:5432/eonlife_db
```

### 4. Initialize Database
```bash
# Run migrations
psql eonlife_db -f database/migrations/001_create_schema.sql

# Load seed data
psql eonlife_db -f database/seeds/001_seed_data.sql
```

### 5. Verify Setup
```bash
psql eonlife_db -c "SELECT COUNT(*) as users FROM users;"
```

---

## Using the Database in Code

### Connection Example
```typescript
import { query } from '@/lib/db/connection';

// Execute query
const result = await query('SELECT * FROM users WHERE email = $1', ['user@example.com']);
console.log(result.rows);
```

### Using Helper Functions
```typescript
import { getUserByEmail, createUser } from '@/lib/db/users';
import { getActiveProducts } from '@/lib/db/products';
import { getUserOrders } from '@/lib/db/orders';

// Get user
const user = await getUserByEmail('user@example.com');

// Create user
const newUser = await createUser({
  email: 'new@example.com',
  first_name: 'John',
  last_name: 'Doe'
});

// Get products
const products = await getActiveProducts();

// Get user orders
const orders = await getUserOrders(userId);
```

---

## Seed Data

The `001_seed_data.sql` file includes sample data:

### Sample Users (5)
- sarah.johnson@example.com
- michael.chen@example.com
- emma.williams@example.com
- james.smith@example.com
- olivia.davis@example.com

### Sample Products (5)
- Youthful Glow Serum ($89.99)
- Radiance Renewal Cream ($74.99)
- Deep Hydration Face Mask ($54.99)
- Gentle Gel Cleanser ($39.99)
- Starter Collection Set ($129.99)

### Sample Orders (5)
Various order statuses (pending, processing, shipped, delivered)

### Sample Data Relationships
- 5 users with multiple shipping addresses
- 5 products with inventory
- 5 orders with 8 total order items
- 3 cart items
- 4 newsletter campaigns
- 5 newsletter analytics entries
- 3 chatbot conversations

### Clear Seed Data
```sql
-- Delete all data (careful!)
DELETE FROM audit_logs;
DELETE FROM chatbot_conversations;
DELETE FROM newsletter_analytics;
DELETE FROM newsletter_campaigns;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM shipping_addresses;
DELETE FROM products;
DELETE FROM users;
```

---

## Common Tasks

### Backup Database
```bash
# Export full backup
pg_dump postgresql://user:pass@host/db > backup.sql

# Compressed backup
pg_dump postgresql://user:pass@host/db | gzip > backup.sql.gz
```

### Restore from Backup
```bash
# Restore backup
psql postgresql://user:pass@host/db < backup.sql

# Restore compressed
gunzip -c backup.sql.gz | psql postgresql://user:pass@host/db
```

### Reset Database
```sql
-- Drop all tables and start fresh
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Then re-run migrations
\i database/migrations/001_create_schema.sql
\i database/seeds/001_seed_data.sql
```

### Monitor Queries
```sql
-- View active connections
SELECT pid, usename, application_name FROM pg_stat_activity;

-- View recent queries
SELECT query, mean_time, calls FROM pg_stat_statements LIMIT 10;
```

---

## Troubleshooting

### Connection Issues

**"Connection refused"**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgres  # macOS

# Verify connection string
psql postgresql://user:password@host:5432/database
```

**"Database does not exist"**
```bash
# For Supabase, use "postgres" as database name, not project name
# Check DATABASE_URL in .env.local
psql $DATABASE_URL -c "SELECT 1"
```

### Permission Issues

**"Permission denied"**
```sql
-- Grant permissions to user
GRANT ALL ON ALL TABLES IN SCHEMA public TO username;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO username;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO username;
```

### Migration Issues

**"Table already exists"**
```bash
# Migrations should be idempotent (safe to run multiple times)
# Check if migrations have already been applied
psql $DATABASE_URL -c "SELECT * FROM information_schema.tables WHERE table_schema='public';"
```

---

## Next Steps

1. ✅ Database initialized
2. ✅ Seed data loaded
3. → Configure environment variables
4. → Connect from application code
5. → Test CRUD operations
6. → Set up automated backups
7. → Configure monitoring

See `DATABASE.md` for complete documentation.

---

## Database Management

### Supabase Admin Panel
1. Go to your project dashboard
2. SQL Editor: Write and test queries
3. Database: Manage tables and schemas
4. Backups: View and restore backups
5. Settings: Connection and authentication

### psql Commands
```sql
\d              -- List all tables
\d users        -- Describe table structure
\dt             -- List tables
\dv             -- List views
\l              -- List databases
\c database     -- Connect to database
\q              -- Quit
```

---

**Setup Complete!** Your database is ready to use.
