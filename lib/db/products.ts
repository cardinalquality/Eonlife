/**
 * Product Database Operations
 * Provides CRUD operations for product management and inventory
 */

import { query } from './connection';

export interface Product {
  product_id: string;
  sku: string;
  name: string;
  description?: string;
  long_description?: string;
  price: number;
  compare_at_price?: number;
  cost?: number;
  inventory_quantity: number;
  low_stock_threshold: number;
  images?: Record<string, any>[];
  category?: string;
  tags?: string[];
  is_active: boolean;
  seo_title?: string;
  seo_description?: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Get product by ID
 */
export async function getProductById(productId: string): Promise<Product | null> {
  const result = await query(
    `SELECT * FROM products WHERE product_id = $1 AND deleted_at IS NULL`,
    [productId]
  );
  return result.rows[0] || null;
}

/**
 * Get product by SKU
 */
export async function getProductBySku(sku: string): Promise<Product | null> {
  const result = await query(
    `SELECT * FROM products WHERE sku = $1 AND deleted_at IS NULL`,
    [sku]
  );
  return result.rows[0] || null;
}

/**
 * Get all active products
 */
export async function getActiveProducts(limit = 100, offset = 0): Promise<Product[]> {
  const result = await query(
    `SELECT * FROM products WHERE deleted_at IS NULL AND is_active = TRUE ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

/**
 * Get products by category
 */
export async function getProductsByCategory(
  category: string,
  limit = 100,
  offset = 0
): Promise<Product[]> {
  const result = await query(
    `SELECT * FROM products WHERE category = $1 AND deleted_at IS NULL AND is_active = TRUE ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [category, limit, offset]
  );
  return result.rows;
}

/**
 * Search products by name
 */
export async function searchProducts(searchTerm: string, limit = 100): Promise<Product[]> {
  const result = await query(
    `SELECT * FROM products WHERE name ILIKE $1 AND deleted_at IS NULL AND is_active = TRUE ORDER BY created_at DESC LIMIT $2`,
    [`%${searchTerm}%`, limit]
  );
  return result.rows;
}

/**
 * Create new product
 */
export async function createProduct(productData: Omit<Product, 'product_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'created_by' | 'updated_by'>): Promise<Product> {
  const result = await query(
    `INSERT INTO products (
      sku, name, description, long_description, price, compare_at_price,
      cost, inventory_quantity, low_stock_threshold, images, category,
      tags, is_active, seo_title, seo_description
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *`,
    [
      productData.sku,
      productData.name,
      productData.description || null,
      productData.long_description || null,
      productData.price,
      productData.compare_at_price || null,
      productData.cost || null,
      productData.inventory_quantity || 0,
      productData.low_stock_threshold || 10,
      JSON.stringify(productData.images || []),
      productData.category || null,
      productData.tags || [],
      productData.is_active !== false,
      productData.seo_title || null,
      productData.seo_description || null
    ]
  );
  return result.rows[0];
}

/**
 * Update product
 */
export async function updateProduct(productId: string, updates: Partial<Product>): Promise<Product | null> {
  const allowedFields = ['name', 'description', 'long_description', 'price', 'compare_at_price', 'cost', 'inventory_quantity', 'low_stock_threshold', 'images', 'category', 'tags', 'is_active', 'seo_title', 'seo_description'];
  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key)) {
      fields.push(`${key} = $${paramCount}`);
      values.push(key === 'images' ? JSON.stringify(value) : value);
      paramCount++;
    }
  }

  if (fields.length === 0) {
    return getProductById(productId);
  }

  values.push(productId);

  const result = await query(
    `UPDATE products SET ${fields.join(', ')} WHERE product_id = $${paramCount} AND deleted_at IS NULL RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Soft delete product
 */
export async function deleteProduct(productId: string): Promise<boolean> {
  const result = await query(
    `UPDATE products SET deleted_at = NOW() WHERE product_id = $1 AND deleted_at IS NULL`,
    [productId]
  );
  return result.rowCount > 0;
}

/**
 * Update product inventory
 */
export async function updateInventory(productId: string, quantity: number): Promise<Product | null> {
  return updateProduct(productId, { inventory_quantity: quantity } as Partial<Product>);
}

/**
 * Decrease inventory (for order placement)
 */
export async function decreaseInventory(productId: string, quantity: number): Promise<boolean> {
  const result = await query(
    `UPDATE products SET inventory_quantity = inventory_quantity - $1 WHERE product_id = $2 AND deleted_at IS NULL AND inventory_quantity >= $1`,
    [quantity, productId]
  );
  return result.rowCount > 0;
}

/**
 * Increase inventory (for returns/cancellations)
 */
export async function increaseInventory(productId: string, quantity: number): Promise<boolean> {
  const result = await query(
    `UPDATE products SET inventory_quantity = inventory_quantity + $1 WHERE product_id = $2 AND deleted_at IS NULL`,
    [quantity, productId]
  );
  return result.rowCount > 0;
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(limit = 100): Promise<Product[]> {
  const result = await query(
    `SELECT * FROM products WHERE deleted_at IS NULL AND is_active = TRUE AND inventory_quantity <= low_stock_threshold ORDER BY inventory_quantity ASC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

/**
 * Get out of stock products
 */
export async function getOutOfStockProducts(limit = 100): Promise<Product[]> {
  const result = await query(
    `SELECT * FROM products WHERE deleted_at IS NULL AND is_active = TRUE AND inventory_quantity = 0 ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

/**
 * Count total active products
 */
export async function countActiveProducts(): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) as count FROM products WHERE deleted_at IS NULL AND is_active = TRUE`
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * Get product categories
 */
export async function getCategories(): Promise<string[]> {
  const result = await query(
    `SELECT DISTINCT category FROM products WHERE deleted_at IS NULL AND is_active = TRUE ORDER BY category`
  );
  return result.rows.map(row => row.category).filter(Boolean);
}

/**
 * Get product revenue metrics
 */
export async function getProductRevenue(productId: string): Promise<any> {
  const result = await query(
    `SELECT
      p.product_id,
      p.name,
      p.sku,
      COUNT(oi.order_item_id) as orders_sold,
      SUM(oi.quantity) as total_quantity_sold,
      SUM(oi.total_price) as total_revenue
    FROM products p
    LEFT JOIN order_items oi ON p.product_id = oi.product_id
    WHERE p.product_id = $1 AND p.deleted_at IS NULL
    GROUP BY p.product_id, p.name, p.sku`,
    [productId]
  );
  return result.rows[0] || null;
}
