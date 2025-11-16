/**
 * Order Database Operations
 * Provides CRUD operations for order management
 */

import { query, transaction } from './connection';

export interface OrderItem {
  order_item_id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  sku_snapshot: string;
  name_snapshot: string;
}

export interface Order {
  order_id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  currency: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method?: 'credit_card' | 'debit_card' | 'paypal' | 'stripe' | 'apple_pay' | 'google_pay';
  payment_transaction_id?: string;
  created_at: Date;
  updated_at: Date;
  shipped_at?: Date;
  delivered_at?: Date;
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  const result = await query(
    `SELECT * FROM orders WHERE order_id = $1 AND deleted_at IS NULL`,
    [orderId]
  );
  return result.rows[0] || null;
}

/**
 * Get order by order number
 */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const result = await query(
    `SELECT * FROM orders WHERE order_number = $1 AND deleted_at IS NULL`,
    [orderNumber]
  );
  return result.rows[0] || null;
}

/**
 * Get all orders for a user
 */
export async function getUserOrders(
  userId: string,
  limit = 100,
  offset = 0
): Promise<Order[]> {
  const result = await query(
    `SELECT * FROM orders WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return result.rows;
}

/**
 * Get order items for an order
 */
export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const result = await query(
    `SELECT * FROM order_items WHERE order_id = $1 ORDER BY created_at ASC`,
    [orderId]
  );
  return result.rows;
}

/**
 * Create a new order with items (transaction)
 */
export async function createOrder(
  userId: string,
  orderData: Omit<Order, 'order_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'created_by' | 'updated_by' | 'status'>,
  items: Array<Omit<OrderItem, 'order_item_id' | 'order_id'>>
): Promise<Order | null> {
  // Generate order number
  const timestamp = Date.now();
  const orderNumber = `ORD-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}`;

  try {
    const result = await query(
      `INSERT INTO orders (
        user_id, order_number, status, subtotal, tax, shipping_cost,
        discount_amount, total, currency, payment_status, payment_method,
        payment_transaction_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        userId,
        orderNumber,
        'pending',
        orderData.subtotal,
        orderData.tax,
        orderData.shipping_cost,
        orderData.discount_amount,
        orderData.total,
        orderData.currency,
        orderData.payment_status,
        orderData.payment_method || null,
        orderData.payment_transaction_id || null
      ]
    );

    const order = result.rows[0];

    // Add order items
    for (const item of items) {
      await query(
        `INSERT INTO order_items (
          order_id, product_id, quantity, unit_price,
          total_price, sku_snapshot, name_snapshot
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          order.order_id,
          item.product_id,
          item.quantity,
          item.unit_price,
          item.total_price,
          item.sku_snapshot,
          item.name_snapshot
        ]
      );
    }

    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  updateData?: { shipped_at?: Date; delivered_at?: Date }
): Promise<Order | null> {
  const updates: any = { status };

  if (status === 'shipped' && updateData?.shipped_at) {
    updates.shipped_at = updateData.shipped_at;
  }

  if (status === 'delivered' && updateData?.delivered_at) {
    updates.delivered_at = updateData.delivered_at;
  }

  const fields = Object.keys(updates);
  const values = Object.values(updates);
  values.push(orderId);

  const result = await query(
    `UPDATE orders SET ${fields.map((f, i) => `${f} = $${i + 1}`).join(', ')} WHERE order_id = $${values.length} AND deleted_at IS NULL RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Update payment status
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded',
  transactionId?: string
): Promise<Order | null> {
  const result = await query(
    `UPDATE orders SET payment_status = $1, payment_transaction_id = COALESCE($2, payment_transaction_id) WHERE order_id = $3 AND deleted_at IS NULL RETURNING *`,
    [paymentStatus, transactionId || null, orderId]
  );

  return result.rows[0] || null;
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  limit = 100,
  offset = 0
): Promise<Order[]> {
  const result = await query(
    `SELECT * FROM orders WHERE status = $1 AND deleted_at IS NULL ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
    [status, limit, offset]
  );
  return result.rows;
}

/**
 * Get recent orders
 */
export async function getRecentOrders(days = 30, limit = 100): Promise<Order[]> {
  const result = await query(
    `SELECT * FROM orders WHERE deleted_at IS NULL AND created_at >= NOW() - INTERVAL '${days} days' ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

/**
 * Count orders by status
 */
export async function countOrdersByStatus(
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
): Promise<number> {
  const result = await query(
    `SELECT COUNT(*) as count FROM orders WHERE status = $1 AND deleted_at IS NULL`,
    [status]
  );
  return parseInt(result.rows[0].count, 10);
}

/**
 * Get total order revenue
 */
export async function getTotalRevenue(fromDate?: Date, toDate?: Date): Promise<number> {
  let query_str = `SELECT COALESCE(SUM(total), 0) as revenue FROM orders WHERE deleted_at IS NULL AND payment_status = 'completed'`;
  const params: any[] = [];

  if (fromDate) {
    query_str += ` AND created_at >= $${params.length + 1}`;
    params.push(fromDate);
  }

  if (toDate) {
    query_str += ` AND created_at <= $${params.length + 1}`;
    params.push(toDate);
  }

  const result = await query(query_str, params);
  return parseFloat(result.rows[0].revenue);
}

/**
 * Get order summary with customer info
 */
export async function getOrderSummary(orderId: string): Promise<any> {
  const result = await query(
    `SELECT
      o.order_id,
      o.order_number,
      o.status,
      o.total,
      o.created_at,
      u.email,
      u.first_name,
      u.last_name,
      COUNT(oi.order_item_id) as item_count,
      SUM(oi.quantity) as total_quantity
    FROM orders o
    JOIN users u ON o.user_id = u.user_id
    LEFT JOIN order_items oi ON o.order_id = oi.order_id
    WHERE o.order_id = $1 AND o.deleted_at IS NULL
    GROUP BY o.order_id, o.order_number, o.status, o.total, o.created_at, u.email, u.first_name, u.last_name`,
    [orderId]
  );
  return result.rows[0] || null;
}

/**
 * Soft delete order
 */
export async function deleteOrder(orderId: string): Promise<boolean> {
  const result = await query(
    `UPDATE orders SET deleted_at = NOW() WHERE order_id = $1 AND deleted_at IS NULL`,
    [orderId]
  );
  return result.rowCount > 0;
}
