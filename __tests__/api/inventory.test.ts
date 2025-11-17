import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/inventory/check/route';
import { NextRequest } from 'next/server';

// Mock the database
vi.mock('@/lib/db/mock-db', () => ({
  db: {
    products: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/db/seed', () => ({
  initializeDatabase: vi.fn(),
}));

import { db } from '@/lib/db/mock-db';

describe('POST /api/inventory/check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should check inventory for multiple items successfully', async () => {
    (db.products.findUnique as any)
      .mockResolvedValueOnce({
        id: '1',
        inventoryQuantity: 10,
      })
      .mockResolvedValueOnce({
        id: '2',
        inventoryQuantity: 5,
      });

    const requestBody = {
      items: [
        { productId: '1', quantity: 5 },
        { productId: '2', quantity: 3 },
      ],
    };

    const request = new NextRequest('http://localhost:3000/api/inventory/check', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.allAvailable).toBe(true);
    expect(data.items).toHaveLength(2);
    expect(data.items[0]).toEqual({
      productId: '1',
      available: true,
      currentStock: 10,
      requested: 5,
    });
  });

  it('should handle out of stock items', async () => {
    (db.products.findUnique as any).mockResolvedValue({
      id: '1',
      inventoryQuantity: 2,
    });

    const requestBody = {
      items: [{ productId: '1', quantity: 5 }],
    };

    const request = new NextRequest('http://localhost:3000/api/inventory/check', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.allAvailable).toBe(false);
    expect(data.items[0].available).toBe(false);
    expect(data.items[0].currentStock).toBe(2);
    expect(data.items[0].requested).toBe(5);
  });

  it('should handle product not found', async () => {
    (db.products.findUnique as any).mockResolvedValue(null);

    const requestBody = {
      items: [{ productId: 'invalid-id', quantity: 1 }],
    };

    const request = new NextRequest('http://localhost:3000/api/inventory/check', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.allAvailable).toBe(false);
    expect(data.items[0]).toEqual({
      productId: 'invalid-id',
      available: false,
      currentStock: 0,
      error: 'Product not found',
    });
  });

  it('should reject request without items array', async () => {
    const requestBody = {};

    const request = new NextRequest('http://localhost:3000/api/inventory/check', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Items array is required');
  });

  it('should handle database errors', async () => {
    (db.products.findUnique as any).mockRejectedValue(new Error('Database error'));

    const requestBody = {
      items: [{ productId: '1', quantity: 1 }],
    };

    const request = new NextRequest('http://localhost:3000/api/inventory/check', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to check inventory');
  });
});
