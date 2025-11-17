import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/products/[id]/route';
import { NextRequest } from 'next/server';

// Mock the database
vi.mock('@/lib/db/mock-db', () => ({
  db: {
    products: {
      findUnique: vi.fn(),
    },
  },
}));

// Mock database initialization
vi.mock('@/lib/db/seed', () => ({
  initializeDatabase: vi.fn(),
}));

import { db } from '@/lib/db/mock-db';

describe('GET /api/products/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return a product successfully', async () => {
    const mockProduct = {
      id: '1',
      name: 'Test Product',
      price: 1999,
      description: 'Test description',
      reviews: [],
    };

    (db.products.findUnique as any).mockResolvedValue(mockProduct);

    const request = new NextRequest('http://localhost:3000/api/products/1');
    const params = Promise.resolve({ id: '1' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockProduct);
    expect(db.products.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
      include: { reviews: true },
    });
  });

  it('should return 404 when product not found', async () => {
    (db.products.findUnique as any).mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/products/999');
    const params = Promise.resolve({ id: '999' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'Product not found' });
  });

  it('should handle database errors gracefully', async () => {
    (db.products.findUnique as any).mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/products/1');
    const params = Promise.resolve({ id: '1' });

    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch product' });
  });
});
