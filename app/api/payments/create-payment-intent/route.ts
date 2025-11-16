/**
 * API Route: Create Payment Intent
 * POST /api/payments/create-payment-intent
 *
 * Creates a Stripe payment intent for collecting payment via Stripe Elements.
 * This endpoint abstracts Stripe from the frontend.
 */

import { NextRequest, NextResponse } from 'next/server';
import PaymentService from '@/lib/payment/payment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, amount, currency = 'usd', orderId, description } = body;

    // Validation
    if (!customerId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields: customerId, amount' },
        { status: 400 },
      );
    }

    // Create payment intent
    const paymentIntent = await PaymentService.createPaymentIntent({
      customerId,
      amount, // already in cents
      currency,
      orderId,
      metadata: {
        description: description || '',
      },
    });

    return NextResponse.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.clientSecret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      },
    });
  } catch (error) {
    console.error('[API] Error creating payment intent:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create payment intent' },
      { status: 500 },
    );
  }
}
