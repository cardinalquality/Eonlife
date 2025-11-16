-- Eonlife E-commerce Platform - Seed Data
-- Created: 2025-11-15
-- Purpose: Test data for development and demonstration

-- ============================================================================
-- SEED USERS
-- ============================================================================

INSERT INTO users (
  user_id, email, first_name, last_name, phone_number,
  email_verified, newsletter_subscribed, newsletter_consent_date,
  preferences, last_login, created_by
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'sarah.johnson@example.com',
    'Sarah',
    'Johnson',
    '+1-555-0101',
    TRUE,
    TRUE,
    NOW(),
    '{"frequency": "weekly", "topics": ["new_products", "promotions", "tips"]}'::JSONB,
    NOW() - INTERVAL '2 days',
    NULL
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'michael.chen@example.com',
    'Michael',
    'Chen',
    '+1-555-0102',
    TRUE,
    TRUE,
    NOW() - INTERVAL '30 days',
    '{"frequency": "monthly", "topics": ["new_products", "tips"]}'::JSONB,
    NOW() - INTERVAL '5 days',
    NULL
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'emma.williams@example.com',
    'Emma',
    'Williams',
    '+1-555-0103',
    TRUE,
    FALSE,
    NULL,
    '{"frequency": "weekly", "topics": []}'::JSONB,
    NOW() - INTERVAL '15 days',
    NULL
  ),
  (
    '550e8400-e29b-41d4-a716-446655440004',
    'james.smith@example.com',
    'James',
    'Smith',
    '+1-555-0104',
    FALSE,
    FALSE,
    NULL,
    '{"frequency": "weekly", "topics": ["new_products", "promotions"]}'::JSONB,
    NULL,
    NULL
  ),
  (
    '550e8400-e29b-41d4-a716-446655440005',
    'olivia.davis@example.com',
    'Olivia',
    'Davis',
    '+1-555-0105',
    TRUE,
    TRUE,
    NOW() - INTERVAL '10 days',
    '{"frequency": "weekly", "topics": ["new_products", "promotions", "tips"]}'::JSONB,
    NOW() - INTERVAL '1 day',
    NULL
  );


-- ============================================================================
-- SEED PRODUCTS
-- ============================================================================

INSERT INTO products (
  product_id, sku, name, description, long_description,
  price, compare_at_price, cost, inventory_quantity, low_stock_threshold,
  images, category, tags, is_active, seo_title, seo_description, created_by
) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001',
    'RELUMA-SERUM-001',
    'Youthful Glow Serum',
    'Advanced anti-aging serum with hyaluronic acid and vitamin C',
    'Our signature Youthful Glow Serum combines powerful antioxidants with hydrating hyaluronic acid to reduce fine lines and brighten the complexion. This lightweight formula absorbs quickly and works with your skin''s natural barrier to deliver visible results in just 2 weeks.',
    89.99,
    119.99,
    35.00,
    150,
    20,
    '[{"url": "/products/serum-01.jpg", "alt": "Youthful Glow Serum bottle"}]'::JSONB,
    'Serums & Treatments',
    ARRAY['anti-aging', 'serum', 'vitamin-c', 'hydrating'],
    TRUE,
    'Youthful Glow Serum | Premium Anti-Aging',
    'Advanced anti-aging serum with hyaluronic acid and vitamin C. Shop premium skincare at Reluma.',
    NULL
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    'RELUMA-CREAM-002',
    'Radiance Renewal Cream',
    'Nourishing moisturizer for all skin types',
    'Experience the ultimate in hydration with our Radiance Renewal Cream. Packed with peptides and botanical extracts, this luxurious formula provides 24-hour moisture while promoting skin elasticity and a youthful glow.',
    74.99,
    99.99,
    28.00,
    200,
    25,
    '[{"url": "/products/cream-01.jpg", "alt": "Radiance Renewal Cream jar"}]'::JSONB,
    'Moisturizers',
    ARRAY['moisturizer', 'nourishing', 'all-skin-types'],
    TRUE,
    'Radiance Renewal Cream | Luxurious Moisturizer',
    'Nourishing 24-hour moisturizer with peptides and botanicals for all skin types.',
    NULL
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    'RELUMA-MASK-003',
    'Deep Hydration Face Mask',
    'Weekly treatment mask for intense hydration',
    'Treat your skin to a spa-like experience with our Deep Hydration Face Mask. This intensive treatment delivers moisture deep into the skin, leaving it soft, supple, and radiant.',
    54.99,
    69.99,
    20.00,
    80,
    15,
    '[{"url": "/products/mask-01.jpg", "alt": "Deep Hydration Face Mask"}]'::JSONB,
    'Masks & Treatments',
    ARRAY['face-mask', 'hydrating', 'treatment'],
    TRUE,
    'Deep Hydration Face Mask | Weekly Treatment',
    'Intensive hydrating face mask treatment for soft, supple, radiant skin.',
    NULL
  ),
  (
    '660e8400-e29b-41d4-a716-446655440004',
    'RELUMA-CLEANSER-004',
    'Gentle Gel Cleanser',
    'pH-balanced cleanser for sensitive skin',
    'Our Gentle Gel Cleanser removes makeup and impurities without disrupting your skin''s natural pH balance. Perfect for sensitive skin, it cleanses thoroughly yet gently.',
    39.99,
    49.99,
    15.00,
    300,
    50,
    '[{"url": "/products/cleanser-01.jpg", "alt": "Gentle Gel Cleanser"}]'::JSONB,
    'Cleansers',
    ARRAY['cleanser', 'gentle', 'sensitive-skin', 'gel'],
    TRUE,
    'Gentle Gel Cleanser | pH-Balanced for Sensitive Skin',
    'pH-balanced gel cleanser for sensitive skin. Gentle yet effective makeup removal.',
    NULL
  ),
  (
    '660e8400-e29b-41d4-a716-446655440005',
    'RELUMA-SET-005',
    'Starter Collection Set',
    'Complete skincare routine starter kit',
    'Everything you need to start your skincare journey! This curated set includes our best-selling cleanser, toner, serum, and moisturizer. Perfect for beginners or those wanting to try our full range.',
    129.99,
    179.99,
    50.00,
    75,
    10,
    '[{"url": "/products/set-01.jpg", "alt": "Reluma Starter Collection Set"}]'::JSONB,
    'Sets & Kits',
    ARRAY['set', 'starter', 'collection', 'value'],
    TRUE,
    'Reluma Starter Collection | Complete Skincare Kit',
    'Complete skincare routine starter set with cleanser, toner, serum, and moisturizer.',
    NULL
  );


-- ============================================================================
-- SEED SHIPPING ADDRESSES
-- ============================================================================

INSERT INTO shipping_addresses (
  address_id, user_id, first_name, last_name,
  address_line1, address_line2, city, state, postal_code, country,
  phone, is_default
) VALUES
  (
    '770e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'Sarah',
    'Johnson',
    '123 Main Street',
    'Apt 4B',
    'New York',
    'NY',
    '10001',
    'United States',
    '+1-555-0101',
    TRUE
  ),
  (
    '770e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'Sarah',
    'Johnson',
    '456 Park Avenue',
    NULL,
    'Brooklyn',
    'NY',
    '11201',
    'United States',
    '+1-555-0101',
    FALSE
  ),
  (
    '770e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440002',
    'Michael',
    'Chen',
    '789 Oak Road',
    NULL,
    'San Francisco',
    'CA',
    '94102',
    'United States',
    '+1-555-0102',
    TRUE
  ),
  (
    '770e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440003',
    'Emma',
    'Williams',
    '321 Elm Street',
    'Suite 200',
    'Los Angeles',
    'CA',
    '90001',
    'United States',
    '+1-555-0103',
    TRUE
  ),
  (
    '770e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440005',
    'Olivia',
    'Davis',
    '654 Maple Drive',
    NULL,
    'Seattle',
    'WA',
    '98101',
    'United States',
    '+1-555-0105',
    TRUE
  );


-- ============================================================================
-- SEED ORDERS
-- ============================================================================

INSERT INTO orders (
  order_id, user_id, order_number, status,
  subtotal, tax, shipping_cost, discount_amount, total,
  currency, payment_status, payment_method,
  payment_transaction_id, created_at, shipped_at, delivered_at, created_by
) VALUES
  (
    '880e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'ORD-2025-001',
    'delivered',
    164.98,
    13.20,
    10.00,
    0.00,
    188.18,
    'USD',
    'completed',
    'credit_card',
    'txn_1A2B3C4D5E6F7G8H',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '5 days',
    NULL
  ),
  (
    '880e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    'ORD-2025-002',
    'shipped',
    89.99,
    7.20,
    5.00,
    0.00,
    102.19,
    'USD',
    'completed',
    'paypal',
    'txn_2B3C4D5E6F7G8H9I',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '1 day',
    NULL,
    NULL
  ),
  (
    '880e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440002',
    'ORD-2025-003',
    'processing',
    129.99,
    10.40,
    10.00,
    10.00,
    140.39,
    'USD',
    'completed',
    'stripe',
    'txn_3C4D5E6F7G8H9I0J',
    NOW() - INTERVAL '1 day',
    NULL,
    NULL,
    NULL
  ),
  (
    '880e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440003',
    'ORD-2025-004',
    'pending',
    74.99,
    6.00,
    0.00,
    0.00,
    80.99,
    'USD',
    'pending',
    'credit_card',
    NULL,
    NOW() - INTERVAL '12 hours',
    NULL,
    NULL,
    NULL
  ),
  (
    '880e8400-e29b-41d4-a716-446655440005',
    '550e8400-e29b-41d4-a716-446655440005',
    'ORD-2025-005',
    'delivered',
    299.97,
    24.00,
    15.00,
    30.00,
    308.97,
    'USD',
    'completed',
    'apple_pay',
    'txn_4D5E6F7G8H9I0J1K',
    NOW() - INTERVAL '20 days',
    NOW() - INTERVAL '15 days',
    NOW() - INTERVAL '10 days',
    NULL
  );


-- ============================================================================
-- SEED ORDER ITEMS
-- ============================================================================

INSERT INTO order_items (
  order_item_id, order_id, product_id, quantity,
  unit_price, total_price, sku_snapshot, name_snapshot
) VALUES
  (
    '990e8400-e29b-41d4-a716-446655440001',
    '880e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440001',
    1,
    89.99,
    89.99,
    'RELUMA-SERUM-001',
    'Youthful Glow Serum'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440002',
    '880e8400-e29b-41d4-a716-446655440001',
    '660e8400-e29b-41d4-a716-446655440002',
    1,
    74.99,
    74.99,
    'RELUMA-CREAM-002',
    'Radiance Renewal Cream'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440003',
    '880e8400-e29b-41d4-a716-446655440002',
    '660e8400-e29b-41d4-a716-446655440001',
    1,
    89.99,
    89.99,
    'RELUMA-SERUM-001',
    'Youthful Glow Serum'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440004',
    '880e8400-e29b-41d4-a716-446655440003',
    '660e8400-e29b-41d4-a716-446655440005',
    1,
    129.99,
    129.99,
    'RELUMA-SET-005',
    'Starter Collection Set'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440005',
    '880e8400-e29b-41d4-a716-446655440004',
    '660e8400-e29b-41d4-a716-446655440002',
    1,
    74.99,
    74.99,
    'RELUMA-CREAM-002',
    'Radiance Renewal Cream'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440006',
    '880e8400-e29b-41d4-a716-446655440005',
    '660e8400-e29b-41d4-a716-446655440001',
    2,
    89.99,
    179.98,
    'RELUMA-SERUM-001',
    'Youthful Glow Serum'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440007',
    '880e8400-e29b-41d4-a716-446655440005',
    '660e8400-e29b-41d4-a716-446655440003',
    1,
    54.99,
    54.99,
    'RELUMA-MASK-003',
    'Deep Hydration Face Mask'
  ),
  (
    '990e8400-e29b-41d4-a716-446655440008',
    '880e8400-e29b-41d4-a716-446655440005',
    '660e8400-e29b-41d4-a716-446655440004',
    1,
    39.99,
    39.99,
    'RELUMA-CLEANSER-004',
    'Gentle Gel Cleanser'
  );


-- ============================================================================
-- SEED CART ITEMS
-- ============================================================================

INSERT INTO cart_items (
  cart_id, user_id, session_id, product_id, quantity,
  created_at, expires_at
) VALUES
  (
    'aa0e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'session-123456789',
    '660e8400-e29b-41d4-a716-446655440001',
    1,
    NOW(),
    NOW() + INTERVAL '30 days'
  ),
  (
    'aa0e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'session-987654321',
    '660e8400-e29b-41d4-a716-446655440002',
    2,
    NOW(),
    NOW() + INTERVAL '30 days'
  ),
  (
    'aa0e8400-e29b-41d4-a716-446655440003',
    NULL,
    'session-guest-12345',
    '660e8400-e29b-41d4-a716-446655440003',
    1,
    NOW(),
    NOW() + INTERVAL '30 days'
  );


-- ============================================================================
-- SEED NEWSLETTER CAMPAIGNS
-- ============================================================================

INSERT INTO newsletter_campaigns (
  campaign_id, subject, content, status,
  scheduled_date, sent_date, total_recipients,
  opened_count, clicked_count, unsubscribed_count, created_by
) VALUES
  (
    'bb0e8400-e29b-41d4-a716-446655440001',
    'Welcome to Reluma - Exclusive 15% Off Your First Order!',
    'Welcome to the Reluma family! We''re excited to have you. Here''s your exclusive 15% discount code: WELCOME15. Use it on your first order and discover the power of our premium skincare.',
    'sent',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days',
    5,
    4,
    2,
    0,
    NULL
  ),
  (
    'bb0e8400-e29b-41d4-a716-446655440002',
    'New Arrival: Our Best-Selling Serum is Back in Stock!',
    'Good news! Our beloved Youthful Glow Serum is back in stock. Get yours before they sell out again. Limited stock available.',
    'sent',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days',
    5,
    5,
    3,
    0,
    NULL
  ),
  (
    'bb0e8400-e29b-41d4-a716-446655440003',
    'Flash Sale: 20% Off All Moisturizers This Weekend!',
    'This weekend only! Get 20% off all our moisturizers. Perfect time to stock up on hydration. Use code MOISTURE20.',
    'scheduled',
    NOW() + INTERVAL '2 days',
    NULL,
    0,
    0,
    0,
    0,
    NULL
  ),
  (
    'bb0e8400-e29b-41d4-a716-446655440004',
    'Skincare Tips: How to Get Summer-Ready Skin',
    'Learn our dermatologist-approved tips for achieving glowing summer skin. From sun protection to hydration, we cover it all.',
    'draft',
    NULL,
    NULL,
    0,
    0,
    0,
    0,
    NULL
  );


-- ============================================================================
-- SEED NEWSLETTER ANALYTICS
-- ============================================================================

INSERT INTO newsletter_analytics (
  analytics_id, campaign_id, user_id, sent_at,
  opened_at, clicked_at, links_clicked, unsubscribed_at
) VALUES
  (
    'cc0e8400-e29b-41d4-a716-446655440001',
    'bb0e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '4 days 23 hours',
    NOW() - INTERVAL '4 days 22 hours',
    '[{"text": "WELCOME15 code", "url": "/shop?code=WELCOME15"}]'::JSONB,
    NULL
  ),
  (
    'cc0e8400-e29b-41d4-a716-446655440002',
    'bb0e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    NOW() - INTERVAL '5 days',
    NULL,
    NULL,
    '[]'::JSONB,
    NULL
  ),
  (
    'cc0e8400-e29b-41d4-a716-446655440003',
    'bb0e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day 23 hours',
    NOW() - INTERVAL '1 day 22 hours',
    '[{"text": "Youthful Glow Serum", "url": "/products/serum-001"}]'::JSONB,
    NULL
  ),
  (
    'cc0e8400-e29b-41d4-a716-446655440004',
    'bb0e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    NOW() - INTERVAL '2 days',
    NULL,
    NULL,
    '[]'::JSONB,
    NULL
  ),
  (
    'cc0e8400-e29b-41d4-a716-446655440005',
    'bb0e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440005',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 day 20 hours',
    NULL,
    '[]'::JSONB,
    NULL
  );


-- ============================================================================
-- SEED CHATBOT CONVERSATIONS
-- ============================================================================

INSERT INTO chatbot_conversations (
  conversation_id, user_id, session_id, started_at, ended_at,
  messages, satisfaction_rating, resolved, escalated_to_human
) VALUES
  (
    'dd0e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    'chat-session-001',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '23 hours 50 minutes',
    '[
      {"sender": "user", "message": "Is this product suitable for sensitive skin?", "timestamp": "2025-11-14T10:00:00Z"},
      {"sender": "bot", "message": "Yes! Our Youthful Glow Serum is pH-balanced and dermatologist-tested for all skin types including sensitive skin.", "timestamp": "2025-11-14T10:00:30Z"},
      {"sender": "user", "message": "Great! I''d like to order one.", "timestamp": "2025-11-14T10:01:00Z"},
      {"sender": "bot", "message": "Wonderful! You can proceed to checkout. Would you like a special promo code?", "timestamp": "2025-11-14T10:01:30Z"}
    ]'::JSONB,
    5,
    TRUE,
    FALSE
  ),
  (
    'dd0e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    'chat-session-002',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '7 hours 45 minutes',
    '[
      {"sender": "user", "message": "Where''s my order?", "timestamp": "2025-11-15T09:00:00Z"},
      {"sender": "bot", "message": "Let me check that for you. What''s your order number?", "timestamp": "2025-11-15T09:00:30Z"},
      {"sender": "user", "message": "ORD-2025-003", "timestamp": "2025-11-15T09:01:00Z"},
      {"sender": "bot", "message": "Your order is currently being processed and should ship within 24 hours.", "timestamp": "2025-11-15T09:01:30Z"}
    ]'::JSONB,
    4,
    TRUE,
    FALSE
  ),
  (
    'dd0e8400-e29b-41d4-a716-446655440003',
    NULL,
    'chat-session-guest-001',
    NOW() - INTERVAL '2 hours',
    NULL,
    '[
      {"sender": "user", "message": "Do you have payment plans available?", "timestamp": "2025-11-15T13:00:00Z"},
      {"sender": "bot", "message": "We offer multiple payment options including credit card and PayPal. Let me connect you with a specialist.", "timestamp": "2025-11-15T13:00:30Z"}
    ]'::JSONB,
    NULL,
    FALSE,
    TRUE
  );


-- ============================================================================
-- SUMMARY
-- ============================================================================

-- Summary of seeded data:
-- - 5 Users (various subscription states)
-- - 5 Products (different categories and stock levels)
-- - 5 Orders (various statuses and payment methods)
-- - 8 Order Items (multiple products in different orders)
-- - 5 Shipping Addresses (multiple addresses per user)
-- - 3 Cart Items (mix of logged-in and guest)
-- - 4 Newsletter Campaigns (different statuses)
-- - 5 Newsletter Analytics (engagement tracking)
-- - 3 Chatbot Conversations (different resolution states)
