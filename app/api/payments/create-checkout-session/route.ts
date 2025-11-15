/**
 * API Route: Create Checkout Session
 * POST /api/payments/create-checkout-session
 *
 * Creates a Stripe Checkout session for a hosted checkout experience.
 * This endpoint abstracts Stripe from the frontend.
 */

import { NextRequest, NextResponse } from 'next/server';
import PaymentService from '@/lib/payment/payment-service';

interface CheckoutItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number; // in cents
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, email, items, currency = 'usd' } = body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 },
      );
    }

    if (!customerId && !email) {
      return NextResponse.json(
        { error: 'Either customerId or email is required' },
        { status: 400 },
      );
    }

    // Build success and cancel URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/checkout/cancelled`;

    // Create checkout session
    const session = await PaymentService.createCheckoutSession({
      customerId,
      email,
      items: items as CheckoutItem[],
      currency,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        url: session.url,
        status: session.status,
      },
    });
  } catch (error) {
    console.error('[API] Error creating checkout session:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create checkout session' },
      { status: 500 },
    );
  }
}
