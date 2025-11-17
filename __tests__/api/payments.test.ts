import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/payments/create-payment-intent/route';
import { NextRequest } from 'next/server';

// Mock PaymentService
vi.mock('@/lib/payment/payment-service', () => ({
  default: {
    createPaymentIntent: vi.fn(),
  },
}));

import PaymentService from '@/lib/payment/payment-service';

describe('POST /api/payments/create-payment-intent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create payment intent successfully', async () => {
    const mockPaymentIntent = {
      id: 'pi_test123',
      clientSecret: 'pi_test123_secret',
      amount: 5000,
      currency: 'usd',
      status: 'requires_payment_method',
    };

    (PaymentService.createPaymentIntent as any).mockResolvedValue(mockPaymentIntent);

    const requestBody = {
      customerId: 'cus_test123',
      amount: 5000,
      currency: 'usd',
      orderId: 'order_123',
      description: 'Test payment',
    };

    const request = new NextRequest('http://localhost:3000/api/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.paymentIntent).toEqual(mockPaymentIntent);
    expect(PaymentService.createPaymentIntent).toHaveBeenCalledWith({
      customerId: 'cus_test123',
      amount: 5000,
      currency: 'usd',
      orderId: 'order_123',
      metadata: {
        description: 'Test payment',
      },
    });
  });

  it('should reject request with missing customerId', async () => {
    const requestBody = {
      amount: 5000,
      currency: 'usd',
    };

    const request = new NextRequest('http://localhost:3000/api/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing or invalid required fields');
  });

  it('should reject request with invalid amount', async () => {
    const requestBody = {
      customerId: 'cus_test123',
      amount: 0,
      currency: 'usd',
    };

    const request = new NextRequest('http://localhost:3000/api/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing or invalid required fields');
  });

  it('should handle payment service errors', async () => {
    (PaymentService.createPaymentIntent as any).mockRejectedValue(
      new Error('Stripe API error')
    );

    const requestBody = {
      customerId: 'cus_test123',
      amount: 5000,
      currency: 'usd',
    };

    const request = new NextRequest('http://localhost:3000/api/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Stripe API error');
  });

  it('should use default currency when not provided', async () => {
    const mockPaymentIntent = {
      id: 'pi_test123',
      clientSecret: 'pi_test123_secret',
      amount: 5000,
      currency: 'usd',
      status: 'requires_payment_method',
    };

    (PaymentService.createPaymentIntent as any).mockResolvedValue(mockPaymentIntent);

    const requestBody = {
      customerId: 'cus_test123',
      amount: 5000,
    };

    const request = new NextRequest('http://localhost:3000/api/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(PaymentService.createPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({
        currency: 'usd',
      })
    );
  });
});
