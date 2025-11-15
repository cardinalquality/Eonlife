-- Eonlife E-commerce Platform Database Schema
-- Created: 2025-11-15
-- Database: PostgreSQL 14+
-- Notes: Includes soft deletes, audit trails, and optimized indexes

-- ============================================================================
-- EXTENSION SETUP
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For full-text search on products


-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  newsletter_subscribed BOOLEAN DEFAULT FALSE,
  newsletter_consent_date TIMESTAMP,
  preferences JSONB DEFAULT '{
    "frequency": "weekly",
    "topics": ["new_products", "promotions", "tips"]
  }'::JSONB,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID,
  updated_by UUID
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);
CREATE INDEX idx_users_newsletter_subscribed ON users(newsletter_subscribed) WHERE deleted_at IS NULL AND newsletter_subscribed = TRUE;


-- ============================================================================
-- PRODUCTS TABLE
-- ============================================================================

CREATE TABLE products (
  product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  compare_at_price DECIMAL(10, 2),
  cost DECIMAL(10, 2),
  inventory_quantity INTEGER DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  images JSONB DEFAULT '[]'::JSONB,
  category VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID,
  updated_by UUID
);

CREATE INDEX idx_products_sku ON products(sku) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_category ON products(category) WHERE deleted_at IS NULL AND is_active = TRUE;
CREATE INDEX idx_products_is_active ON products(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_products_name_trgm ON products USING GIN(name gin_trgm_ops) WHERE deleted_at IS NULL;
CREATE INDEX idx_products_tags ON products USING GIN(tags);


-- ============================================================================
-- ORDERS TABLE
-- ============================================================================

CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method_type AS ENUM ('credit_card', 'debit_card', 'paypal', 'stripe', 'apple_pay', 'google_pay');

CREATE TABLE orders (
  order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_status payment_status DEFAULT 'pending',
  payment_method payment_method_type,
  payment_transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID,
  updated_by UUID
);

CREATE INDEX idx_orders_user_id ON orders(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_order_number ON orders(order_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_status ON orders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_status ON orders(payment_status) WHERE deleted_at IS NULL;


-- ============================================================================
-- ORDER ITEMS TABLE
-- ============================================================================

CREATE TABLE order_items (
  order_item_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  sku_snapshot VARCHAR(100) NOT NULL,
  name_snapshot VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);


-- ============================================================================
-- SHIPPING ADDRESSES TABLE
-- ============================================================================

CREATE TABLE shipping_addresses (
  address_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(order_id) ON DELETE SET NULL,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_shipping_addresses_user_id ON shipping_addresses(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_shipping_addresses_order_id ON shipping_addresses(order_id);
CREATE INDEX idx_shipping_addresses_is_default ON shipping_addresses(user_id, is_default) WHERE deleted_at IS NULL AND is_default = TRUE;


-- ============================================================================
-- CART ITEMS TABLE
-- ============================================================================

CREATE TABLE cart_items (
  cart_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days')
);

CREATE INDEX idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX idx_cart_items_session_id ON cart_items(session_id);
CREATE INDEX idx_cart_items_product_id ON cart_items(product_id);
CREATE INDEX idx_cart_items_expires_at ON cart_items(expires_at);


-- ============================================================================
-- NEWSLETTER CAMPAIGNS TABLE
-- ============================================================================

CREATE TYPE campaign_status AS ENUM ('draft', 'scheduled', 'sent');

CREATE TABLE newsletter_campaigns (
  campaign_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  scheduled_date TIMESTAMP,
  sent_date TIMESTAMP,
  total_recipients INTEGER DEFAULT 0,
  opened_count INTEGER DEFAULT 0,
  clicked_count INTEGER DEFAULT 0,
  unsubscribed_count INTEGER DEFAULT 0,
  status campaign_status DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  created_by UUID,
  updated_by UUID
);

CREATE INDEX idx_campaigns_status ON newsletter_campaigns(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_sent_date ON newsletter_campaigns(sent_date DESC) WHERE deleted_at IS NULL AND sent_date IS NOT NULL;
CREATE INDEX idx_campaigns_created_at ON newsletter_campaigns(created_at DESC);


-- ============================================================================
-- NEWSLETTER ANALYTICS TABLE
-- ============================================================================

CREATE TABLE newsletter_analytics (
  analytics_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES newsletter_campaigns(campaign_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  sent_at TIMESTAMP NOT NULL,
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  links_clicked JSONB DEFAULT '[]'::JSONB,
  unsubscribed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_newsletter_analytics_campaign_id ON newsletter_analytics(campaign_id);
CREATE INDEX idx_newsletter_analytics_user_id ON newsletter_analytics(user_id);
CREATE INDEX idx_newsletter_analytics_sent_at ON newsletter_analytics(sent_at DESC);
CREATE INDEX idx_newsletter_analytics_opened_at ON newsletter_analytics(opened_at) WHERE opened_at IS NOT NULL;


-- ============================================================================
-- CHATBOT CONVERSATIONS TABLE
-- ============================================================================

CREATE TABLE chatbot_conversations (
  conversation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
  session_id VARCHAR(255) NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  messages JSONB DEFAULT '[]'::JSONB,
  satisfaction_rating INTEGER,
  resolved BOOLEAN DEFAULT FALSE,
  escalated_to_human BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_chatbot_conversations_user_id ON chatbot_conversations(user_id);
CREATE INDEX idx_chatbot_conversations_session_id ON chatbot_conversations(session_id);
CREATE INDEX idx_chatbot_conversations_started_at ON chatbot_conversations(started_at DESC);
CREATE INDEX idx_chatbot_conversations_escalated ON chatbot_conversations(escalated_to_human) WHERE escalated_to_human = TRUE;


-- ============================================================================
-- AUDIT LOG TABLE (for tracking all changes)
-- ============================================================================

CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE');

CREATE TABLE audit_logs (
  audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action audit_action NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_by UUID,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_changed_at ON audit_logs(changed_at DESC);


-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
  BEFORE UPDATE ON order_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipping_addresses_updated_at
  BEFORE UPDATE ON shipping_addresses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_campaigns_updated_at
  BEFORE UPDATE ON newsletter_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_conversations_updated_at
  BEFORE UPDATE ON chatbot_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

CREATE VIEW active_users AS
  SELECT * FROM users WHERE deleted_at IS NULL;

CREATE VIEW active_products AS
  SELECT * FROM products WHERE deleted_at IS NULL AND is_active = TRUE;

CREATE VIEW recent_orders AS
  SELECT * FROM orders WHERE deleted_at IS NULL ORDER BY created_at DESC;

CREATE VIEW order_summaries AS
  SELECT
    o.order_id,
    o.order_number,
    u.email,
    u.first_name,
    u.last_name,
    o.total,
    o.status,
    o.created_at,
    COUNT(oi.order_item_id) as item_count,
    SUM(oi.quantity) as total_quantity
  FROM orders o
  JOIN users u ON o.user_id = u.user_id
  LEFT JOIN order_items oi ON o.order_id = oi.order_id
  WHERE o.deleted_at IS NULL
  GROUP BY o.order_id, o.order_number, u.email, u.first_name, u.last_name, o.total, o.status, o.created_at;

CREATE VIEW low_stock_products AS
  SELECT
    product_id,
    sku,
    name,
    inventory_quantity,
    low_stock_threshold
  FROM products
  WHERE deleted_at IS NULL
    AND is_active = TRUE
    AND inventory_quantity <= low_stock_threshold;

CREATE VIEW newsletter_campaign_stats AS
  SELECT
    c.campaign_id,
    c.subject,
    c.status,
    c.total_recipients,
    c.opened_count,
    c.clicked_count,
    c.unsubscribed_count,
    ROUND(CAST(c.opened_count AS FLOAT) / NULLIF(c.total_recipients, 0) * 100, 2) as open_rate,
    ROUND(CAST(c.clicked_count AS FLOAT) / NULLIF(c.total_recipients, 0) * 100, 2) as click_rate,
    c.created_at
  FROM newsletter_campaigns c
  WHERE c.deleted_at IS NULL;


-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Core user information for the e-commerce platform';
COMMENT ON TABLE products IS 'Product catalog with inventory and pricing';
COMMENT ON TABLE orders IS 'Customer orders with payment and shipping status';
COMMENT ON TABLE order_items IS 'Individual items within an order';
COMMENT ON TABLE shipping_addresses IS 'Shipping addresses for users and orders';
COMMENT ON TABLE cart_items IS 'Shopping cart items (temporary storage)';
COMMENT ON TABLE newsletter_campaigns IS 'Email marketing campaigns';
COMMENT ON TABLE newsletter_analytics IS 'Analytics for newsletter engagement';
COMMENT ON TABLE chatbot_conversations IS 'Customer service chatbot interactions';
COMMENT ON TABLE audit_logs IS 'Audit trail for data changes';
