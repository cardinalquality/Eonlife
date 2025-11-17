import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/customers/create-or-get/route';
import { NextRequest } from 'next/server';

// Mock PaymentService
vi.mock('@/lib/payment/payment-service', () => ({
  default: {
    getOrCreateCustomer: vi.fn(),
  },
}));

import PaymentService from '@/lib/payment/payment-service';

describe('POST /api/customers/create-or-get', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create or get customer successfully', async () => {
    const mockCustomer = {
      id: 'cust-123',
      email: 'john@example.com',
      name: 'John Doe',
      stripeCustomerId: 'cus_stripe123',
    };

    (PaymentService.getOrCreateCustomer as any).mockResolvedValue(mockCustomer);

    const requestBody = {
      email: 'john@example.com',
      name: 'John Doe',
    };

    const request = new NextRequest('http://localhost:3000/api/customers/create-or-get', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.customer).toEqual(mockCustomer);
    expect(PaymentService.getOrCreateCustomer).toHaveBeenCalledWith(
      'john@example.com',
      'John Doe'
    );
  });

  it('should work with email only (without name)', async () => {
    const mockCustomer = {
      id: 'cust-123',
      email: 'john@example.com',
      name: null,
      stripeCustomerId: 'cus_stripe123',
    };

    (PaymentService.getOrCreateCustomer as any).mockResolvedValue(mockCustomer);

    const requestBody = {
      email: 'john@example.com',
    };

    const request = new NextRequest('http://localhost:3000/api/customers/create-or-get', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(PaymentService.getOrCreateCustomer).toHaveBeenCalledWith(
      'john@example.com',
      undefined
    );
  });

  it('should reject request without email', async () => {
    const requestBody = {
      name: 'John Doe',
    };

    const request = new NextRequest('http://localhost:3000/api/customers/create-or-get', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Valid email is required');
  });

  it('should reject request with invalid email', async () => {
    const requestBody = {
      email: 'not-an-email',
      name: 'John Doe',
    };

    const request = new NextRequest('http://localhost:3000/api/customers/create-or-get', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Valid email is required');
  });

  it('should handle payment service errors', async () => {
    (PaymentService.getOrCreateCustomer as any).mockRejectedValue(
      new Error('Stripe customer creation failed')
    );

    const requestBody = {
      email: 'john@example.com',
      name: 'John Doe',
    };

    const request = new NextRequest('http://localhost:3000/api/customers/create-or-get', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Stripe customer creation failed');
  });
});
