/**
 * API Route: Refund Payment
 * POST /api/payments/refund
 *
 * Processes a refund for an order.
 * This endpoint abstracts the refund process from the frontend.
 */

import { NextRequest, NextResponse } from 'next/server';
import PaymentService from '@/lib/payment/payment-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, amount, reason } = body;

    // Validation
    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 },
      );
    }

    // Process refund
    const refund = await PaymentService.refundOrder({
      orderId,
      amount,
      reason,
    });

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        orderId: refund.orderId,
        amount: refund.amount,
        status: refund.status,
        createdAt: refund.createdAt,
      },
    });
  } catch (error) {
    console.error('[API] Error processing refund:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to process refund' },
      { status: 500 },
    );
  }
}
