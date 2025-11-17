/**
 * Unit tests for Order Database Operations
 * Tests CRUD operations, order management, and revenue tracking
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as orders from '../db/orders';
import type { Order, OrderItem } from '../db/orders';

// Mock the database connection module
vi.mock('../db/connection', () => ({
  query: vi.fn(),
  transaction: vi.fn()
}));

import { query } from '../db/connection';

describe('Order Database Operations', () => {
  const mockOrder: Order = {
    order_id: 'ord_123',
    user_id: 'user_456',
    order_number: 'ORD-2024-123456',
    status: 'pending',
    subtotal: 100.00,
    tax: 8.50,
    shipping_cost: 10.00,
    discount_amount: 5.00,
    total: 113.50,
    currency: 'USD',
    payment_status: 'pending',
    payment_method: 'credit_card',
    payment_transaction_id: 'txn_789',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
    shipped_at: undefined,
    delivered_at: undefined
  };

  const mockOrderItem: OrderItem = {
    order_item_id: 'item_123',
    order_id: 'ord_123',
    product_id: 'prod_456',
    quantity: 2,
    unit_price: 50.00,
    total_price: 100.00,
    sku_snapshot: 'SKU-001',
    name_snapshot: 'Test Product'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOrderById', () => {
    it('should return an order when found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockOrder],
        rowCount: 1
      } as any);

      const result = await orders.getOrderById('ord_123');

      expect(result).toEqual(mockOrder);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM orders WHERE order_id = $1'),
        ['ord_123']
      );
    });

    it('should return null when order not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await orders.getOrderById('nonexistent');

      expect(result).toBeNull();
    });

    it('should exclude soft-deleted orders', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getOrderById('ord_123');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });

    it('should handle database errors', async () => {
      vi.mocked(query).mockRejectedValue(new Error('Database error'));

      await expect(orders.getOrderById('ord_123')).rejects.toThrow('Database error');
    });
  });

  describe('getOrderByNumber', () => {
    it('should return an order by order number', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockOrder],
        rowCount: 1
      } as any);

      const result = await orders.getOrderByNumber('ORD-2024-123456');

      expect(result).toEqual(mockOrder);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM orders WHERE order_number = $1'),
        ['ORD-2024-123456']
      );
    });

    it('should return null when order number not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await orders.getOrderByNumber('NONEXISTENT');

      expect(result).toBeNull();
    });

    it('should exclude soft-deleted orders', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getOrderByNumber('ORD-2024-123456');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });
  });

  describe('getUserOrders', () => {
    it('should return orders for a user', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockOrder],
        rowCount: 1
      } as any);

      const result = await orders.getUserOrders('user_456');

      expect(result).toEqual([mockOrder]);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE user_id = $1'),
        ['user_456', 100, 0]
      );
    });

    it('should support pagination with limit', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getUserOrders('user_456', 50);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        ['user_456', 50, 0]
      );
    });

    it('should support pagination with offset', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getUserOrders('user_456', 100, 50);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        ['user_456', 100, 50]
      );
    });

    it('should order by created_at DESC', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getUserOrders('user_456');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        expect.any(Array)
      );
    });

    it('should exclude soft-deleted orders', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getUserOrders('user_456');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });
  });

  describe('getOrderItems', () => {
    it('should return order items for an order', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockOrderItem],
        rowCount: 1
      } as any);

      const result = await orders.getOrderItems('ord_123');

      expect(result).toEqual([mockOrderItem]);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM order_items WHERE order_id = $1'),
        ['ord_123']
      );
    });

    it('should order items by created_at ASC', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getOrderItems('ord_123');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at ASC'),
        expect.any(Array)
      );
    });

    it('should return empty array when no items', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await orders.getOrderItems('ord_123');

      expect(result).toEqual([]);
    });
  });

  describe('createOrder', () => {
    const orderData = {
      subtotal: 100.00,
      tax: 8.50,
      shipping_cost: 10.00,
      discount_amount: 5.00,
      total: 113.50,
      currency: 'USD',
      payment_status: 'pending' as const,
      payment_method: 'credit_card' as const,
      payment_transaction_id: 'txn_789'
    };

    const items = [
      {
        product_id: 'prod_456',
        quantity: 2,
        unit_price: 50.00,
        total_price: 100.00,
        sku_snapshot: 'SKU-001',
        name_snapshot: 'Test Product'
      }
    ];

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should create an order with items', async () => {
      vi.mocked(query)
        .mockResolvedValueOnce({
          rows: [mockOrder],
          rowCount: 1
        } as any)
        .mockResolvedValue({
          rows: [mockOrderItem],
          rowCount: 1
        } as any);

      const result = await orders.createOrder('user_456', orderData, items);

      expect(result).toEqual(mockOrder);
      expect(query).toHaveBeenCalledTimes(2); // 1 for order, 1 for items
    });

    it('should generate order number with year and timestamp', async () => {
      vi.mocked(query)
        .mockResolvedValueOnce({
          rows: [mockOrder],
          rowCount: 1
        } as any)
        .mockResolvedValue({
          rows: [],
          rowCount: 1
        } as any);

      await orders.createOrder('user_456', orderData, items);

      const orderNumberArg = vi.mocked(query).mock.calls[0][1]![1];
      expect(orderNumberArg).toMatch(/^ORD-2024-\d{6}$/);
    });

    it('should set initial status to pending', async () => {
      vi.mocked(query)
        .mockResolvedValueOnce({
          rows: [mockOrder],
          rowCount: 1
        } as any)
        .mockResolvedValue({
          rows: [],
          rowCount: 1
        } as any);

      await orders.createOrder('user_456', orderData, items);

      const statusArg = vi.mocked(query).mock.calls[0][1]![2];
      expect(statusArg).toBe('pending');
    });

    it('should insert all order items', async () => {
      const multipleItems = [
        {
          product_id: 'prod_1',
          quantity: 1,
          unit_price: 10.00,
          total_price: 10.00,
          sku_snapshot: 'SKU-1',
          name_snapshot: 'Product 1'
        },
        {
          product_id: 'prod_2',
          quantity: 2,
          unit_price: 20.00,
          total_price: 40.00,
          sku_snapshot: 'SKU-2',
          name_snapshot: 'Product 2'
        }
      ];

      vi.mocked(query)
        .mockResolvedValueOnce({
          rows: [mockOrder],
          rowCount: 1
        } as any)
        .mockResolvedValue({
          rows: [mockOrderItem],
          rowCount: 1
        } as any);

      await orders.createOrder('user_456', orderData, multipleItems);

      // 1 order insert + 2 item inserts = 3 calls
      expect(query).toHaveBeenCalledTimes(3);
    });

    it('should handle optional payment fields', async () => {
      const minimalOrderData = {
        subtotal: 100.00,
        tax: 8.50,
        shipping_cost: 10.00,
        discount_amount: 0,
        total: 118.50,
        currency: 'USD',
        payment_status: 'pending' as const
      };

      vi.mocked(query)
        .mockResolvedValueOnce({
          rows: [mockOrder],
          rowCount: 1
        } as any)
        .mockResolvedValue({
          rows: [],
          rowCount: 1
        } as any);

      await orders.createOrder('user_456', minimalOrderData, items);

      const callArgs = vi.mocked(query).mock.calls[0][1];
      expect(callArgs![10]).toBeNull(); // payment_method
      expect(callArgs![11]).toBeNull(); // payment_transaction_id
    });

    it('should throw error on database failure', async () => {
      vi.mocked(query).mockRejectedValue(new Error('Database error'));

      await expect(
        orders.createOrder('user_456', orderData, items)
      ).rejects.toThrow('Database error');
    });

    it('should log errors on failure', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(query).mockRejectedValue(new Error('Database error'));

      await expect(
        orders.createOrder('user_456', orderData, items)
      ).rejects.toThrow();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error creating order:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const updatedOrder = { ...mockOrder, status: 'processing' as const };
      vi.mocked(query).mockResolvedValue({
        rows: [updatedOrder],
        rowCount: 1
      } as any);

      const result = await orders.updateOrderStatus('ord_123', 'processing');

      expect(result).toEqual(updatedOrder);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE orders SET'),
        expect.arrayContaining(['processing', 'ord_123'])
      );
    });

    it('should update shipped_at when status is shipped', async () => {
      const shippedDate = new Date('2024-01-10');
      const updatedOrder = { ...mockOrder, status: 'shipped' as const, shipped_at: shippedDate };

      vi.mocked(query).mockResolvedValue({
        rows: [updatedOrder],
        rowCount: 1
      } as any);

      const result = await orders.updateOrderStatus('ord_123', 'shipped', {
        shipped_at: shippedDate
      });

      expect(result?.status).toBe('shipped');
      const callArgs = vi.mocked(query).mock.calls[0][1];
      expect(callArgs).toContain(shippedDate);
    });

    it('should update delivered_at when status is delivered', async () => {
      const deliveredDate = new Date('2024-01-15');
      const updatedOrder = { ...mockOrder, status: 'delivered' as const, delivered_at: deliveredDate };

      vi.mocked(query).mockResolvedValue({
        rows: [updatedOrder],
        rowCount: 1
      } as any);

      const result = await orders.updateOrderStatus('ord_123', 'delivered', {
        delivered_at: deliveredDate
      });

      expect(result?.status).toBe('delivered');
      const callArgs = vi.mocked(query).mock.calls[0][1];
      expect(callArgs).toContain(deliveredDate);
    });

    it('should return null when order not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await orders.updateOrderStatus('nonexistent', 'processing');

      expect(result).toBeNull();
    });

    it('should exclude soft-deleted orders', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.updateOrderStatus('ord_123', 'processing');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });

    it('should support all valid status values', async () => {
      const statuses: Array<'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'> = [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
      ];

      for (const status of statuses) {
        vi.mocked(query).mockResolvedValue({
          rows: [{ ...mockOrder, status }],
          rowCount: 1
        } as any);

        const result = await orders.updateOrderStatus('ord_123', status);
        expect(result?.status).toBe(status);
      }
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', async () => {
      const updatedOrder = { ...mockOrder, payment_status: 'completed' as const };
      vi.mocked(query).mockResolvedValue({
        rows: [updatedOrder],
        rowCount: 1
      } as any);

      const result = await orders.updatePaymentStatus('ord_123', 'completed');

      expect(result?.payment_status).toBe('completed');
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE orders SET payment_status = $1'),
        ['completed', null, 'ord_123']
      );
    });

    it('should update transaction ID when provided', async () => {
      const updatedOrder = {
        ...mockOrder,
        payment_status: 'completed' as const,
        payment_transaction_id: 'new_txn_123'
      };

      vi.mocked(query).mockResolvedValue({
        rows: [updatedOrder],
        rowCount: 1
      } as any);

      const result = await orders.updatePaymentStatus(
        'ord_123',
        'completed',
        'new_txn_123'
      );

      expect(result?.payment_transaction_id).toBe('new_txn_123');
      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        ['completed', 'new_txn_123', 'ord_123']
      );
    });

    it('should preserve existing transaction ID when not provided', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockOrder],
        rowCount: 1
      } as any);

      await orders.updatePaymentStatus('ord_123', 'completed');

      const sql = vi.mocked(query).mock.calls[0][0];
      expect(sql).toContain('COALESCE');
    });

    it('should support all payment status values', async () => {
      const statuses: Array<'pending' | 'completed' | 'failed' | 'refunded'> = [
        'pending',
        'completed',
        'failed',
        'refunded'
      ];

      for (const status of statuses) {
        vi.mocked(query).mockResolvedValue({
          rows: [{ ...mockOrder, payment_status: status }],
          rowCount: 1
        } as any);

        const result = await orders.updatePaymentStatus('ord_123', status);
        expect(result?.payment_status).toBe(status);
      }
    });

    it('should return null when order not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await orders.updatePaymentStatus('nonexistent', 'completed');

      expect(result).toBeNull();
    });
  });

  describe('getOrdersByStatus', () => {
    it('should return orders with specific status', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockOrder],
        rowCount: 1
      } as any);

      const result = await orders.getOrdersByStatus('pending');

      expect(result).toEqual([mockOrder]);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = $1'),
        ['pending', 100, 0]
      );
    });

    it('should support pagination', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getOrdersByStatus('processing', 50, 25);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        ['processing', 50, 25]
      );
    });

    it('should order by created_at DESC', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getOrdersByStatus('pending');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        expect.any(Array)
      );
    });

    it('should exclude soft-deleted orders', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getOrdersByStatus('pending');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });
  });

  describe('getRecentOrders', () => {
    it('should return orders from past 30 days by default', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockOrder],
        rowCount: 1
      } as any);

      const result = await orders.getRecentOrders();

      expect(result).toEqual([mockOrder]);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("INTERVAL '30 days'"),
        [100]
      );
    });

    it('should support custom day range', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getRecentOrders(7);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("INTERVAL '7 days'"),
        [100]
      );
    });

    it('should support custom limit', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getRecentOrders(30, 50);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        [50]
      );
    });

    it('should order by created_at DESC', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getRecentOrders();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        expect.any(Array)
      );
    });
  });

  describe('countOrdersByStatus', () => {
    it('should return count of orders with status', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '42' }],
        rowCount: 1
      } as any);

      const result = await orders.countOrdersByStatus('pending');

      expect(result).toBe(42);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*) as count'),
        ['pending']
      );
    });

    it('should exclude soft-deleted orders', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '0' }],
        rowCount: 1
      } as any);

      await orders.countOrdersByStatus('pending');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });

    it('should handle zero count', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '0' }],
        rowCount: 1
      } as any);

      const result = await orders.countOrdersByStatus('cancelled');

      expect(result).toBe(0);
    });
  });

  describe('getTotalRevenue', () => {
    it('should return total revenue for completed orders', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ revenue: '12345.67' }],
        rowCount: 1
      } as any);

      const result = await orders.getTotalRevenue();

      expect(result).toBe(12345.67);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining("payment_status = 'completed'"),
        []
      );
    });

    it('should filter by from date when provided', async () => {
      const fromDate = new Date('2024-01-01');

      vi.mocked(query).mockResolvedValue({
        rows: [{ revenue: '1000' }],
        rowCount: 1
      } as any);

      await orders.getTotalRevenue(fromDate);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('created_at >= $1'),
        [fromDate]
      );
    });

    it('should filter by to date when provided', async () => {
      const toDate = new Date('2024-12-31');

      vi.mocked(query).mockResolvedValue({
        rows: [{ revenue: '1000' }],
        rowCount: 1
      } as any);

      await orders.getTotalRevenue(undefined, toDate);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('created_at <= $1'),
        [toDate]
      );
    });

    it('should filter by date range', async () => {
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-12-31');

      vi.mocked(query).mockResolvedValue({
        rows: [{ revenue: '5000' }],
        rowCount: 1
      } as any);

      await orders.getTotalRevenue(fromDate, toDate);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('created_at >= $1'),
        [fromDate, toDate]
      );
    });

    it('should handle zero revenue', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ revenue: '0' }],
        rowCount: 1
      } as any);

      const result = await orders.getTotalRevenue();

      expect(result).toBe(0);
    });

    it('should exclude soft-deleted orders', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ revenue: '1000' }],
        rowCount: 1
      } as any);

      await orders.getTotalRevenue();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });
  });

  describe('getOrderSummary', () => {
    const mockSummary = {
      order_id: 'ord_123',
      order_number: 'ORD-2024-123456',
      status: 'pending',
      total: 113.50,
      created_at: new Date('2024-01-01'),
      email: 'test@example.com',
      first_name: 'John',
      last_name: 'Doe',
      item_count: 3,
      total_quantity: 5
    };

    it('should return order summary with customer info', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockSummary],
        rowCount: 1
      } as any);

      const result = await orders.getOrderSummary('ord_123');

      expect(result).toEqual(mockSummary);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('JOIN users u ON o.user_id = u.user_id'),
        ['ord_123']
      );
    });

    it('should include order item aggregates', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockSummary],
        rowCount: 1
      } as any);

      await orders.getOrderSummary('ord_123');

      const sql = vi.mocked(query).mock.calls[0][0];
      expect(sql).toContain('COUNT(oi.order_item_id)');
      expect(sql).toContain('SUM(oi.quantity)');
      expect(sql).toContain('GROUP BY');
    });

    it('should return null when order not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await orders.getOrderSummary('nonexistent');

      expect(result).toBeNull();
    });

    it('should exclude soft-deleted orders', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await orders.getOrderSummary('ord_123');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });
  });

  describe('deleteOrder', () => {
    it('should soft delete an order', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 1
      } as any);

      const result = await orders.deleteOrder('ord_123');

      expect(result).toBe(true);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE orders SET deleted_at = NOW()'),
        ['ord_123']
      );
    });

    it('should return false when order not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await orders.deleteOrder('nonexistent');

      expect(result).toBe(false);
    });

    it('should only delete non-deleted orders', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 1
      } as any);

      await orders.deleteOrder('ord_123');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        ['ord_123']
      );
    });
  });
});
