/**
 * API Route: Create or Get Customer
 * POST /api/customers/create-or-get
 *
 * Gets an existing customer or creates a new one in our system and Stripe.
 * Returns the customer with all necessary information for payment.
 */

import { NextRequest, NextResponse } from 'next/server';
import PaymentService from '@/lib/payment/payment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name } = body;

    // Validation
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 },
      );
    }

    // Get or create customer
    const customer = await PaymentService.getOrCreateCustomer(email, name);

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        stripeCustomerId: customer.stripeCustomerId,
      },
    });
  } catch (error) {
    console.error('[API] Error creating customer:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create customer' },
      { status: 500 },
    );
  }
}
