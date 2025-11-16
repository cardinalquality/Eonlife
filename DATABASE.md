# Eonlife E-commerce Database Schema

## Table of Contents
1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Schema Architecture](#schema-architecture)
4. [Tables](#tables)
5. [Indexes](#indexes)
6. [Views](#views)
7. [Usage Examples](#usage-examples)
8. [Backup & Recovery](#backup--recovery)
9. [Performance Optimization](#performance-optimization)
10. [Troubleshooting](#troubleshooting)

---

## Overview

This document describes the complete database schema for the Eonlife e-commerce platform. The schema is designed for a PostgreSQL 14+ database (Supabase recommended) with support for:

- **User Management**: Customer accounts, preferences, and newsletter subscriptions
- **Product Catalog**: Inventory management, pricing, and categorization
- **Order Management**: Order processing, item tracking, and payment status
- **Shipping**: Address management and order fulfillment
- **Shopping Cart**: Persistent session-based cart system
- **Newsletter Marketing**: Campaign management and engagement analytics
- **Customer Service**: Chatbot conversations and interaction tracking
- **Audit Trail**: Full audit logging for compliance

### Key Features
- ✅ Soft deletes for data retention and compliance
- ✅ Audit trail with `created_by` and `updated_by` tracking
- ✅ Automatic timestamp management with triggers
- ✅ Performance-optimized indexes for common queries
- ✅ JSONB support for flexible data storage
- ✅ UUID primary keys for distributed systems
- ✅ Full-text search capabilities
- ✅ Enum types for status management

---

## Database Setup

### Prerequisites
- PostgreSQL 14+ or Supabase account
- Node.js 18+ (for running migrations)
- `psql` command-line tool (optional, for manual queries)

### Step 1: Create Supabase Project (Recommended)

1. Visit [supabase.com](https://supabase.com) and create an account
2. Create a new project (PostgreSQL 14+)
3. Copy your database credentials:
   - Host: `[project-id].supabase.co`
   - Port: `5432`
   - Username: `postgres`
   - Password: (from project settings)
   - Database: `postgres`

### Step 2: Configure Environment

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `DATABASE_URL` with your Supabase connection string:
   ```
   postgresql://postgres:[password]@[project-id].supabase.co:5432/postgres
   ```

### Step 3: Initialize Schema

#### Option A: Using psql (Direct)
```bash
# Connect to your database
psql postgresql://postgres:[password]@[project-id].supabase.co:5432/postgres

# Execute the migration script
\i database/migrations/001_create_schema.sql

# Load seed data
\i database/seeds/001_seed_data.sql
```

#### Option B: Using a Migration Tool
The project supports Node.js-based migrations (setup required):

```bash
# Install migration tools (if using Flyway, Liquibase, or custom scripts)
npm run migrate:up    # Run migrations
npm run migrate:down  # Rollback migrations
```

### Step 4: Verify Installation

Test your database connection:

```bash
# Using Node.js
node -e "require('./lib/db/connection').healthCheck().then(ok => console.log('Database OK:', ok))"

# Using psql
psql postgresql://... -c "SELECT COUNT(*) as users FROM users;"
```

---

## Schema Architecture

### Data Flow Diagram

```
┌─────────────┐
│   Users     │ ◄─── Newsletter Subscribers
│  (Core)     │
└──────┬──────┘
       │
       ├──────────────────┐
       │                  │
  ┌────▼────┐      ┌─────▼──────┐
  │ Cart     │      │ Shipping   │
  │ Items    │      │ Addresses  │
  └─────┬────┘      └─────▲──────┘
        │                 │
        └────────┬────────┘
                 │
           ┌─────▼──────┐
           │  Orders    │ ◄─── Payment Status
           └─────┬──────┘
                 │
           ┌─────▼──────────┐
           │ Order Items ◄──┼──► Products
           └────────────────┘    (Inventory)
                 │
           ┌─────▼──────────┐
           │ Newsletter     │
           │ Analytics      │
           └────────────────┘

Additional Features:
- Chatbot Conversations (linked to Users)
- Audit Logs (tracks all changes)
```

### Table Relationships

```sql
-- Foreign Key Structure
Orders.user_id → Users.user_id
OrderItems.order_id → Orders.order_id
OrderItems.product_id → Products.product_id
ShippingAddresses.user_id → Users.user_id
ShippingAddresses.order_id → Orders.order_id (nullable)
CartItems.user_id → Users.user_id (nullable for guest)
CartItems.product_id → Products.product_id
NewsletterAnalytics.campaign_id → NewsletterCampaigns.campaign_id
NewsletterAnalytics.user_id → Users.user_id
ChatbotConversations.user_id → Users.user_id (nullable for guest)
```

---

## Tables

### 1. Users
Stores customer account information and preferences.

```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  newsletter_subscribed BOOLEAN DEFAULT FALSE,
  newsletter_consent_date TIMESTAMP,
  preferences JSONB,  -- {"frequency": "weekly", "topics": ["new_products"]}
  last_login TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,  -- Soft delete
  created_by UUID,
  updated_by UUID
);
```

**Indexes**: `email`, `created_at`, `newsletter_subscribed`

**Common Queries**:
```typescript
// Get user by email
const user = await getUserByEmail('user@example.com');

// Create user
const newUser = await createUser({
  email: 'new@example.com',
  first_name: 'John',
  last_name: 'Doe',
  newsletter_subscribed: true
});

// Subscribe to newsletter
await subscribeToNewsletter(userId, 'weekly', ['new_products', 'promotions']);
```

---

### 2. Products
Stores product catalog with inventory and pricing.

```sql
CREATE TABLE products (
  product_id UUID PRIMARY KEY,
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),  -- MSRP
  cost DECIMAL(10, 2),
  inventory_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  images JSONB,  -- [{"url": "/path", "alt": "description"}]
  category VARCHAR(100),
  tags TEXT[],  -- ['anti-aging', 'serum', 'vitamin-c']
  is_active BOOLEAN DEFAULT TRUE,
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID,
  updated_by UUID
);
```

**Indexes**: `sku`, `category`, `is_active`, `name` (trgm), `tags`

**Common Queries**:
```typescript
// Get active products
const products = await getActiveProducts();

// Search products
const results = await searchProducts('serum');

// Get low stock
const lowStock = await getLowStockProducts();

// Decrease inventory (on order)
await decreaseInventory(productId, quantity);

// Get revenue metrics
const revenue = await getProductRevenue(productId);
```

---

### 3. Orders
Stores customer orders with payment and shipping status.

```sql
CREATE TABLE orders (
  order_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status order_status,  -- pending, processing, shipped, delivered, cancelled
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_status payment_status,  -- pending, completed, failed, refunded
  payment_method payment_method_type,  -- credit_card, paypal, stripe, etc.
  payment_transaction_id VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID,
  updated_by UUID
);
```

**Indexes**: `user_id`, `order_number`, `status`, `payment_status`, `created_at`

**Common Queries**:
```typescript
// Create order with items
const order = await createOrder(userId, orderData, items);

// Update order status
await updateOrderStatus(orderId, 'shipped', { shipped_at: new Date() });

// Get user orders
const orders = await getUserOrders(userId);

// Get order summary
const summary = await getOrderSummary(orderId);

// Get revenue metrics
const revenue = await getTotalRevenue(fromDate, toDate);
```

---

### 4. OrderItems
Individual line items within an order.

```sql
CREATE TABLE order_items (
  order_item_id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders ON DELETE CASCADE,
  product_id UUID REFERENCES products,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,  -- Price at time of order
  total_price DECIMAL(10, 2) NOT NULL,
  sku_snapshot VARCHAR(100) NOT NULL,  -- Snapshot for historical accuracy
  name_snapshot VARCHAR(255) NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Indexes**: `order_id`, `product_id`

---

### 5. ShippingAddresses
Customer shipping and billing addresses.

```sql
CREATE TABLE shipping_addresses (
  address_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users ON DELETE CASCADE,
  order_id UUID REFERENCES orders (nullable),  -- Linked order if applicable
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP
);
```

**Indexes**: `user_id`, `order_id`, `is_default`

---

### 6. CartItems
Shopping cart items (persistent across sessions).

```sql
CREATE TABLE cart_items (
  cart_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users (nullable for guests),
  session_id VARCHAR(255) NOT NULL,
  product_id UUID REFERENCES products ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  expires_at TIMESTAMP  -- Auto-cleanup after 30 days
);
```

**Indexes**: `user_id`, `session_id`, `product_id`, `expires_at`

**Purpose**: Allows both authenticated and guest carts with session-based tracking.

---

### 7. NewsletterCampaigns
Email marketing campaigns.

```sql
CREATE TABLE newsletter_campaigns (
  campaign_id UUID PRIMARY KEY,
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  scheduled_date TIMESTAMP,
  sent_date TIMESTAMP,
  total_recipients INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  status campaign_status,  -- draft, scheduled, sent
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID,
  updated_by UUID
);
```

**Common Queries**:
```typescript
// Metrics automatically calculated:
// - Open Rate = (opened_count / total_recipients) * 100
// - Click Rate = (clicked_count / total_recipients) * 100
```

---

### 8. NewsletterAnalytics
Individual email engagement tracking.

```sql
CREATE TABLE newsletter_analytics (
  analytics_id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES newsletter_campaigns,
  user_id UUID REFERENCES users,
  sent_at TIMESTAMP NOT NULL,
  opened_at TIMESTAMP,  -- NULL if not opened
  clicked_at TIMESTAMP,  -- NULL if not clicked
  links_clicked JSONB,  -- [{"text": "link text", "url": "/path"}]
  unsubscribed_at TIMESTAMP,  -- NULL if didn't unsubscribe
  created_at TIMESTAMP
);
```

**Indexes**: `campaign_id`, `user_id`, `sent_at`, `opened_at`

---

### 9. ChatbotConversations
Customer service chatbot interactions.

```sql
CREATE TABLE chatbot_conversations (
  conversation_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users (nullable for guests),
  session_id VARCHAR(255) NOT NULL,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  messages JSONB,  -- [{"sender": "user|bot", "message": "text", "timestamp": "..."}]
  satisfaction_rating INTEGER,  -- 1-5 scale
  resolved BOOLEAN DEFAULT FALSE,
  escalated_to_human BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Indexes**: `user_id`, `session_id`, `started_at`, `escalated_to_human`

---

### 10. AuditLogs
Complete audit trail for compliance and debugging.

```sql
CREATE TABLE audit_logs (
  audit_id UUID PRIMARY KEY,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action audit_action,  -- CREATE, UPDATE, DELETE
  old_values JSONB,  -- Previous values for updates
  new_values JSONB,  -- New values for updates
  changed_by UUID,  -- User who made the change
  changed_at TIMESTAMP
);
```

**Indexes**: `table_name`, `record_id`, `changed_at`

---

## Indexes

All indexes are designed for common query patterns and proper maintenance.

### Index Summary
```sql
-- Users table
idx_users_email                      -- Fast lookup by email
idx_users_created_at                 -- Recent user queries
idx_users_newsletter_subscribed       -- Newsletter targeting

-- Products table
idx_products_sku                      -- SKU lookup
idx_products_category                -- Category browsing
idx_products_is_active               -- Active products listing
idx_products_name_trgm               -- Full-text search
idx_products_tags                     -- Tag filtering

-- Orders table
idx_orders_user_id                   -- User order history
idx_orders_order_number              -- Order lookup
idx_orders_status                    -- Order status filtering
idx_orders_payment_status            -- Payment reconciliation
idx_orders_created_at                -- Recent orders

-- CartItems table
idx_cart_items_expires_at            -- Auto-cleanup queries
idx_cart_items_session_id            -- Guest cart retrieval

-- Newsletter tables
idx_campaigns_sent_date              -- Campaign reporting
idx_newsletter_analytics_opened_at   -- Engagement metrics

-- Chatbot table
idx_chatbot_conversations_escalated  -- Customer support filtering
```

---

## Views

Helper views for common reporting and analysis queries:

### View: active_users
Returns non-deleted users.

```sql
SELECT * FROM active_users;
-- Replaces: WHERE deleted_at IS NULL from users
```

### View: active_products
Returns active, non-deleted products.

```sql
SELECT * FROM active_products;
-- Useful for product listing pages
```

### View: order_summaries
Orders with customer info and item counts.

```sql
SELECT * FROM order_summaries;
-- Includes: user email, product count, total quantity, order status
```

### View: low_stock_products
Products below stock threshold.

```sql
SELECT * FROM low_stock_products;
-- Automatic inventory alerts
```

### View: newsletter_campaign_stats
Campaign metrics with calculated rates.

```sql
SELECT * FROM newsletter_campaign_stats;
-- Includes: open_rate, click_rate percentages
```

---

## Usage Examples

### Creating a New User

```typescript
import { createUser, subscribeToNewsletter } from '@/lib/db/users';

const user = await createUser({
  email: 'customer@example.com',
  first_name: 'Sarah',
  last_name: 'Johnson',
  phone_number: '+1-555-0101',
  email_verified: true,
  newsletter_subscribed: true,
  preferences: {
    frequency: 'weekly',
    topics: ['new_products', 'promotions', 'tips']
  }
});
```

### Processing an Order

```typescript
import { createOrder, decreaseInventory } from '@/lib/db/orders';
import { decreaseInventory as decreaseProductInventory } from '@/lib/db/products';

// Create order with items
const order = await createOrder(userId, {
  subtotal: 164.98,
  tax: 13.20,
  shipping_cost: 10.00,
  discount_amount: 0,
  total: 188.18,
  currency: 'USD',
  payment_status: 'completed',
  payment_method: 'credit_card',
  payment_transaction_id: 'txn_12345'
}, [
  {
    product_id: productId1,
    quantity: 1,
    unit_price: 89.99,
    total_price: 89.99,
    sku_snapshot: 'RELUMA-SERUM-001',
    name_snapshot: 'Youthful Glow Serum'
  }
]);

// Update inventory for each item
for (const item of order.items) {
  await decreaseProductInventory(item.product_id, item.quantity);
}
```

### Querying Analytics

```typescript
import { getProductRevenue } from '@/lib/db/products';
import { getTotalRevenue } from '@/lib/db/orders';

// Get total revenue for date range
const revenue = await getTotalRevenue(
  new Date('2025-01-01'),
  new Date('2025-12-31')
);

// Get per-product revenue
const productRevenue = await getProductRevenue(productId);
```

### Managing Newsletter Campaigns

```typescript
// Create campaign
const campaign = await query(
  `INSERT INTO newsletter_campaigns (subject, content, status)
   VALUES ($1, $2, $3) RETURNING *`,
  ['Welcome!', 'Welcome to Reluma...', 'draft']
);

// Schedule send
await query(
  `UPDATE newsletter_campaigns SET status = 'scheduled', scheduled_date = NOW() + INTERVAL '24 hours' WHERE campaign_id = $1`,
  [campaignId]
);

// Track opens
await query(
  `UPDATE newsletter_analytics SET opened_at = NOW() WHERE analytics_id = $1`,
  [analyticsId]
);
```

---

## Backup & Recovery

### Automatic Backups

Supabase provides automatic daily backups. To enable more frequent backups:

1. Log into your Supabase project
2. Go to Settings → Backups
3. Choose backup frequency (1 hour, 8 hours, etc.)
4. Set retention period (minimum 7 days recommended)

### Manual Backup

#### Using pg_dump (PostgreSQL)
```bash
# Full database backup
pg_dump postgresql://user:password@host/db > backup.sql

# Compressed backup (recommended)
pg_dump postgresql://user:password@host/db | gzip > backup.sql.gz

# Backup specific table
pg_dump -t users postgresql://user:password@host/db > users_backup.sql
```

#### Supabase Dashboard
1. Go to Project → Backups
2. Click "Request a backup"
3. Download when ready

### Restore from Backup

#### Using psql
```bash
# Restore from backup
psql postgresql://user:password@host/db < backup.sql

# Restore from compressed backup
gunzip -c backup.sql.gz | psql postgresql://user:password@host/db

# Restore specific table (requires table to exist)
psql postgresql://user:password@host/db < users_backup.sql
```

#### Point-in-Time Recovery (Supabase)
1. Go to Project → Backups
2. Select a backup point
3. Click "Restore"
4. Review and confirm

### Backup Strategy

**Recommended Setup**:
- Daily automatic backups (Supabase default)
- Weekly manual exports to cloud storage (S3, GCS)
- Monthly full database dumps
- Test restore procedures quarterly

---

## Performance Optimization

### Query Optimization Tips

#### 1. Use Indexes
```typescript
// GOOD: Uses idx_users_email index
const user = await query('SELECT * FROM users WHERE email = $1', [email]);

// BAD: Requires full table scan
const user = await query('SELECT * FROM users WHERE first_name = $1', [firstName]);
```

#### 2. Limit Result Sets
```typescript
// GOOD: Pagination
const users = await query('SELECT * FROM users LIMIT $1 OFFSET $2', [limit, offset]);

// BAD: No limit, could return huge dataset
const users = await query('SELECT * FROM users');
```

#### 3. Filter Soft Deletes
```typescript
// GOOD: Filters deleted records
const products = await query('SELECT * FROM products WHERE deleted_at IS NULL');

// BAD: Includes deleted records
const products = await query('SELECT * FROM products');
```

### Index Statistics

Keep index statistics up to date:

```sql
-- Update table statistics
ANALYZE users;
ANALYZE products;
ANALYZE orders;

-- Or analyze all tables
ANALYZE;
```

### Connection Pooling

Configure connection pool in `.env.local`:

```env
DB_POOL_MIN=2           # Minimum connections
DB_POOL_MAX=20          # Maximum connections
DB_IDLE_TIMEOUT=30000   # Idle timeout (ms)
DB_CONNECTION_TIMEOUT=2000  # Connection timeout (ms)
```

### Query Monitoring

Monitor slow queries in Supabase:

1. Go to Project → Monitoring
2. View slow queries
3. Optimize using EXPLAIN ANALYZE

```sql
EXPLAIN ANALYZE SELECT * FROM orders WHERE status = 'pending';
```

---

## Troubleshooting

### Common Issues

#### 1. "Connection refused"
```
Error: connect ECONNREFUSED
```

**Solution**:
- Check DATABASE_URL in .env.local
- Verify database is running
- Check firewall/VPN connection

```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

#### 2. "Database does not exist"
```
Error: database "eonlife_db" does not exist
```

**Solution**:
- Check .env.local DATABASE_URL points to correct database
- For Supabase, use `postgres` as database name, not project name

```env
# Correct
DATABASE_URL=postgresql://postgres:password@project.supabase.co:5432/postgres

# Incorrect
DATABASE_URL=postgresql://postgres:password@project.supabase.co:5432/eonlife_db
```

#### 3. "Permission denied"
```
Error: permission denied for table users
```

**Solution**:
- Check user role has appropriate permissions
- In Supabase, use postgres user (has all permissions)
- If using different user, run: `GRANT ALL ON ALL TABLES IN SCHEMA public TO username;`

#### 4. "Unique constraint violation"
```
Error: duplicate key value violates unique constraint "users_email_key"
```

**Solution**:
- Check if email already exists before inserting
- Use UPSERT (INSERT ... ON CONFLICT) for idempotent operations

```sql
INSERT INTO users (email, first_name, last_name) VALUES ($1, $2, $3)
ON CONFLICT (email) DO UPDATE SET first_name = $2, last_name = $3;
```

#### 5. "Foreign key violation"
```
Error: insert or update on table "orders" violates foreign key constraint
```

**Solution**:
- Ensure referenced user/product exists
- Check deleted_at status (soft-deleted records can violate FKs)

```sql
-- Verify user exists
SELECT * FROM users WHERE user_id = $1 AND deleted_at IS NULL;
```

### Performance Debugging

#### Check Connection Health
```typescript
import { healthCheck } from '@/lib/db/connection';

const isHealthy = await healthCheck();
console.log('Database:', isHealthy ? '✓ OK' : '✗ Failed');
```

#### Monitor Query Performance
```sql
-- View slowest queries
SELECT query, calls, mean_time, max_time FROM pg_stat_statements
ORDER BY mean_time DESC LIMIT 10;
```

#### Check Table Sizes
```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename) DESC;
```

---

## Database Administration

### Regular Maintenance

```sql
-- Reindex tables
REINDEX TABLE users;
REINDEX TABLE products;
REINDEX TABLE orders;

-- Vacuum tables (cleanup dead rows)
VACUUM ANALYZE users;
VACUUM ANALYZE products;
VACUUM ANALYZE orders;

-- Check for missing indexes
SELECT * FROM pg_stat_user_indexes WHERE idx_scan = 0;
```

### Monitoring Connections
```sql
-- View active connections
SELECT datname, count(*) as connections FROM pg_stat_activity GROUP BY datname;

-- View long-running queries
SELECT pid, now() - query_start as duration, query FROM pg_stat_activity
WHERE state = 'active' AND query_start < now() - INTERVAL '5 minutes';
```

---

## References

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Supabase Documentation](https://supabase.com/docs)
- [UUID RFC 4122](https://tools.ietf.org/html/rfc4122)
- [JSONB in PostgreSQL](https://www.postgresql.org/docs/current/datatype-json.html)

---

**Last Updated**: 2025-11-15
**Version**: 1.0
