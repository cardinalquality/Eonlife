/**
 * Unit tests for Product Database Operations
 * Tests CRUD operations, inventory management, and search functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import * as products from '../db/products';
import type { Product } from '../db/products';

// Mock the database connection module
vi.mock('../db/connection', () => ({
  query: vi.fn(),
  transaction: vi.fn()
}));

import { query } from '../db/connection';

describe('Product Database Operations', () => {
  const mockProduct: Product = {
    product_id: 'prod_123',
    sku: 'SKU-001',
    name: 'Test Product',
    description: 'A test product',
    long_description: 'A longer description of the test product',
    price: 29.99,
    compare_at_price: 39.99,
    cost: 15.00,
    inventory_quantity: 100,
    low_stock_threshold: 10,
    images: [{ url: 'https://example.com/image.jpg', alt: 'Product image' }],
    category: 'Electronics',
    tags: ['gadget', 'tech'],
    is_active: true,
    seo_title: 'Test Product SEO',
    seo_description: 'SEO description',
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProductById', () => {
    it('should return a product when found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockProduct],
        rowCount: 1
      } as any);

      const result = await products.getProductById('prod_123');

      expect(result).toEqual(mockProduct);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM products WHERE product_id = $1'),
        ['prod_123']
      );
    });

    it('should return null when product not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await products.getProductById('nonexistent');

      expect(result).toBeNull();
    });

    it('should exclude soft-deleted products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getProductById('prod_123');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });

    it('should handle database errors', async () => {
      vi.mocked(query).mockRejectedValue(new Error('Database error'));

      await expect(products.getProductById('prod_123')).rejects.toThrow('Database error');
    });
  });

  describe('getProductBySku', () => {
    it('should return a product when found by SKU', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockProduct],
        rowCount: 1
      } as any);

      const result = await products.getProductBySku('SKU-001');

      expect(result).toEqual(mockProduct);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT * FROM products WHERE sku = $1'),
        ['SKU-001']
      );
    });

    it('should return null when SKU not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await products.getProductBySku('NONEXISTENT');

      expect(result).toBeNull();
    });

    it('should exclude soft-deleted products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getProductBySku('SKU-001');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });
  });

  describe('getActiveProducts', () => {
    it('should return active products with default pagination', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockProduct],
        rowCount: 1
      } as any);

      const result = await products.getActiveProducts();

      expect(result).toEqual([mockProduct]);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('is_active = TRUE'),
        [100, 0]
      );
    });

    it('should support custom limit', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getActiveProducts(50);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        [50, 0]
      );
    });

    it('should support custom offset', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getActiveProducts(100, 50);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        [100, 50]
      );
    });

    it('should order by created_at DESC', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getActiveProducts();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY created_at DESC'),
        expect.any(Array)
      );
    });

    it('should exclude soft-deleted products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getActiveProducts();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products in category', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockProduct],
        rowCount: 1
      } as any);

      const result = await products.getProductsByCategory('Electronics');

      expect(result).toEqual([mockProduct]);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE category = $1'),
        ['Electronics', 100, 0]
      );
    });

    it('should support pagination', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getProductsByCategory('Electronics', 50, 25);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        ['Electronics', 50, 25]
      );
    });

    it('should only return active products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getProductsByCategory('Electronics');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('is_active = TRUE'),
        expect.any(Array)
      );
    });
  });

  describe('searchProducts', () => {
    it('should search products by name', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockProduct],
        rowCount: 1
      } as any);

      const result = await products.searchProducts('Test');

      expect(result).toEqual([mockProduct]);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('name ILIKE $1'),
        ['%Test%', 100]
      );
    });

    it('should use case-insensitive search', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.searchProducts('test');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        ['%test%', 100]
      );
    });

    it('should support custom limit', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.searchProducts('Test', 50);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        ['%Test%', 50]
      );
    });

    it('should only return active products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.searchProducts('Test');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('is_active = TRUE'),
        expect.any(Array)
      );
    });
  });

  describe('createProduct', () => {
    const newProductData = {
      sku: 'SKU-002',
      name: 'New Product',
      description: 'Description',
      long_description: 'Long description',
      price: 49.99,
      compare_at_price: 59.99,
      cost: 25.00,
      inventory_quantity: 50,
      low_stock_threshold: 5,
      images: [{ url: 'https://example.com/new.jpg' }],
      category: 'Accessories',
      tags: ['new', 'featured'],
      is_active: true,
      seo_title: 'New Product',
      seo_description: 'SEO desc'
    };

    it('should create a new product', async () => {
      const createdProduct = { ...mockProduct, ...newProductData };
      vi.mocked(query).mockResolvedValue({
        rows: [createdProduct],
        rowCount: 1
      } as any);

      const result = await products.createProduct(newProductData);

      expect(result).toEqual(createdProduct);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO products'),
        expect.arrayContaining([
          'SKU-002',
          'New Product',
          'Description',
          'Long description',
          49.99,
          59.99,
          25.00,
          50,
          5,
          expect.any(String), // JSON stringified images
          'Accessories',
          ['new', 'featured'],
          true,
          'New Product',
          'SEO desc'
        ])
      );
    });

    it('should handle optional fields', async () => {
      const minimalData = {
        sku: 'SKU-003',
        name: 'Minimal Product',
        price: 19.99,
        inventory_quantity: 10,
        low_stock_threshold: 2,
        is_active: true
      };

      vi.mocked(query).mockResolvedValue({
        rows: [{ ...mockProduct, ...minimalData }],
        rowCount: 1
      } as any);

      await products.createProduct(minimalData as any);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([
          'SKU-003',
          'Minimal Product',
          null, // description
          null, // long_description
          19.99,
          null, // compare_at_price
          null, // cost
          10,
          2,
          JSON.stringify([]), // empty images
          null, // category
          [], // tags
          true,
          null, // seo_title
          null  // seo_description
        ])
      );
    });

    it('should default is_active to true', async () => {
      const dataWithoutActive = {
        ...newProductData,
        is_active: undefined
      };

      vi.mocked(query).mockResolvedValue({
        rows: [mockProduct],
        rowCount: 1
      } as any);

      await products.createProduct(dataWithoutActive as any);

      const callArgs = vi.mocked(query).mock.calls[0][1];
      expect(callArgs).toContain(true); // is_active should be true
    });

    it('should stringify images as JSON', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockProduct],
        rowCount: 1
      } as any);

      await products.createProduct(newProductData);

      const callArgs = vi.mocked(query).mock.calls[0][1];
      const imagesArg = callArgs![9];
      expect(typeof imagesArg).toBe('string');
      expect(JSON.parse(imagesArg as string)).toEqual(newProductData.images);
    });
  });

  describe('updateProduct', () => {
    it('should update product fields', async () => {
      const updates = {
        name: 'Updated Name',
        price: 34.99
      };

      vi.mocked(query).mockResolvedValue({
        rows: [{ ...mockProduct, ...updates }],
        rowCount: 1
      } as any);

      const result = await products.updateProduct('prod_123', updates);

      expect(result).toBeDefined();
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE products SET'),
        expect.arrayContaining(['Updated Name', 34.99, 'prod_123'])
      );
    });

    it('should only update allowed fields', async () => {
      const updates = {
        name: 'Updated',
        product_id: 'should-not-update', // Not allowed
        created_at: new Date() // Not allowed
      } as any;

      vi.mocked(query).mockResolvedValue({
        rows: [mockProduct],
        rowCount: 1
      } as any);

      await products.updateProduct('prod_123', updates);

      const sql = vi.mocked(query).mock.calls[0][0];
      expect(sql).toContain('name =');
      expect(sql).not.toContain('product_id =');
      expect(sql).not.toContain('created_at =');
    });

    it('should stringify images when updating', async () => {
      const updates = {
        images: [{ url: 'https://example.com/updated.jpg' }]
      };

      vi.mocked(query).mockResolvedValue({
        rows: [mockProduct],
        rowCount: 1
      } as any);

      await products.updateProduct('prod_123', updates as any);

      const callArgs = vi.mocked(query).mock.calls[0][1];
      expect(callArgs![0]).toEqual(JSON.stringify(updates.images));
    });

    it('should return null when product not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await products.updateProduct('nonexistent', { name: 'Test' });

      expect(result).toBeNull();
    });

    it('should return product unchanged when no valid fields to update', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [mockProduct],
        rowCount: 1
      } as any);

      const result = await products.updateProduct('prod_123', {});

      expect(result).toEqual(mockProduct);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['prod_123']
      );
    });

    it('should exclude soft-deleted products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.updateProduct('prod_123', { name: 'Test' });

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });
  });

  describe('deleteProduct', () => {
    it('should soft delete a product', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 1
      } as any);

      const result = await products.deleteProduct('prod_123');

      expect(result).toBe(true);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE products SET deleted_at = NOW()'),
        ['prod_123']
      );
    });

    it('should return false when product not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await products.deleteProduct('nonexistent');

      expect(result).toBe(false);
    });

    it('should only delete non-deleted products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 1
      } as any);

      await products.deleteProduct('prod_123');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        ['prod_123']
      );
    });
  });

  describe('updateInventory', () => {
    it('should update inventory quantity', async () => {
      const updatedProduct = { ...mockProduct, inventory_quantity: 75 };
      vi.mocked(query).mockResolvedValue({
        rows: [updatedProduct],
        rowCount: 1
      } as any);

      const result = await products.updateInventory('prod_123', 75);

      expect(result?.inventory_quantity).toBe(75);
    });

    it('should handle zero inventory', async () => {
      const updatedProduct = { ...mockProduct, inventory_quantity: 0 };
      vi.mocked(query).mockResolvedValue({
        rows: [updatedProduct],
        rowCount: 1
      } as any);

      const result = await products.updateInventory('prod_123', 0);

      expect(result?.inventory_quantity).toBe(0);
    });
  });

  describe('decreaseInventory', () => {
    it('should decrease inventory by specified quantity', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 1
      } as any);

      const result = await products.decreaseInventory('prod_123', 10);

      expect(result).toBe(true);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('inventory_quantity = inventory_quantity - $1'),
        [10, 'prod_123']
      );
    });

    it('should only decrease if sufficient inventory', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 1
      } as any);

      await products.decreaseInventory('prod_123', 5);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('inventory_quantity >= $1'),
        [5, 'prod_123']
      );
    });

    it('should return false if insufficient inventory', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await products.decreaseInventory('prod_123', 1000);

      expect(result).toBe(false);
    });

    it('should not decrease deleted products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.decreaseInventory('prod_123', 5);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });
  });

  describe('increaseInventory', () => {
    it('should increase inventory by specified quantity', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 1
      } as any);

      const result = await products.increaseInventory('prod_123', 20);

      expect(result).toBe(true);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('inventory_quantity = inventory_quantity + $1'),
        [20, 'prod_123']
      );
    });

    it('should return false when product not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await products.increaseInventory('nonexistent', 10);

      expect(result).toBe(false);
    });

    it('should not increase deleted products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.increaseInventory('prod_123', 10);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products at or below low stock threshold', async () => {
      const lowStockProduct = { ...mockProduct, inventory_quantity: 5 };
      vi.mocked(query).mockResolvedValue({
        rows: [lowStockProduct],
        rowCount: 1
      } as any);

      const result = await products.getLowStockProducts();

      expect(result).toEqual([lowStockProduct]);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('inventory_quantity <= low_stock_threshold'),
        [100]
      );
    });

    it('should order by inventory quantity ascending', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getLowStockProducts();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY inventory_quantity ASC'),
        expect.any(Array)
      );
    });

    it('should only return active products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getLowStockProducts();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('is_active = TRUE'),
        expect.any(Array)
      );
    });

    it('should support custom limit', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getLowStockProducts(50);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        [50]
      );
    });
  });

  describe('getOutOfStockProducts', () => {
    it('should return products with zero inventory', async () => {
      const outOfStockProduct = { ...mockProduct, inventory_quantity: 0 };
      vi.mocked(query).mockResolvedValue({
        rows: [outOfStockProduct],
        rowCount: 1
      } as any);

      const result = await products.getOutOfStockProducts();

      expect(result).toEqual([outOfStockProduct]);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('inventory_quantity = 0'),
        [100]
      );
    });

    it('should only return active products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getOutOfStockProducts();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('is_active = TRUE'),
        expect.any(Array)
      );
    });

    it('should support custom limit', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getOutOfStockProducts(25);

      expect(query).toHaveBeenCalledWith(
        expect.any(String),
        [25]
      );
    });
  });

  describe('countActiveProducts', () => {
    it('should return count of active products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '42' }],
        rowCount: 1
      } as any);

      const result = await products.countActiveProducts();

      expect(result).toBe(42);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('COUNT(*) as count'),
        undefined
      );
    });

    it('should only count active products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '0' }],
        rowCount: 1
      } as any);

      await products.countActiveProducts();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('is_active = TRUE'),
        undefined
      );
    });

    it('should exclude soft-deleted products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '0' }],
        rowCount: 1
      } as any);

      await products.countActiveProducts();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        undefined
      );
    });

    it('should handle zero count', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ count: '0' }],
        rowCount: 1
      } as any);

      const result = await products.countActiveProducts();

      expect(result).toBe(0);
    });
  });

  describe('getCategories', () => {
    it('should return distinct categories', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [
          { category: 'Electronics' },
          { category: 'Accessories' },
          { category: 'Clothing' }
        ],
        rowCount: 3
      } as any);

      const result = await products.getCategories();

      expect(result).toEqual(['Electronics', 'Accessories', 'Clothing']);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT DISTINCT category'),
        undefined
      );
    });

    it('should filter out null categories', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [
          { category: 'Electronics' },
          { category: null },
          { category: 'Clothing' }
        ],
        rowCount: 3
      } as any);

      const result = await products.getCategories();

      expect(result).toEqual(['Electronics', 'Clothing']);
      expect(result).not.toContain(null);
    });

    it('should only include active products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getCategories();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('is_active = TRUE'),
        undefined
      );
    });

    it('should order categories alphabetically', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getCategories();

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY category'),
        undefined
      );
    });
  });

  describe('getProductRevenue', () => {
    it('should return revenue metrics for a product', async () => {
      const revenueData = {
        product_id: 'prod_123',
        name: 'Test Product',
        sku: 'SKU-001',
        orders_sold: 50,
        total_quantity_sold: 100,
        total_revenue: 2999.50
      };

      vi.mocked(query).mockResolvedValue({
        rows: [revenueData],
        rowCount: 1
      } as any);

      const result = await products.getProductRevenue('prod_123');

      expect(result).toEqual(revenueData);
      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('LEFT JOIN order_items'),
        ['prod_123']
      );
    });

    it('should return null when product not found', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      const result = await products.getProductRevenue('nonexistent');

      expect(result).toBeNull();
    });

    it('should aggregate order data correctly', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [{ orders_sold: 0, total_quantity_sold: 0, total_revenue: 0 }],
        rowCount: 1
      } as any);

      await products.getProductRevenue('prod_123');

      const sql = vi.mocked(query).mock.calls[0][0];
      expect(sql).toContain('COUNT(oi.order_item_id)');
      expect(sql).toContain('SUM(oi.quantity)');
      expect(sql).toContain('SUM(oi.total_price)');
      expect(sql).toContain('GROUP BY');
    });

    it('should exclude soft-deleted products', async () => {
      vi.mocked(query).mockResolvedValue({
        rows: [],
        rowCount: 0
      } as any);

      await products.getProductRevenue('prod_123');

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });
  });
});
