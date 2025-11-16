/**
 * API Route: Stripe Webhook
 * POST /api/webhooks/stripe
 *
 * This is the ONLY webhook endpoint in the application.
 * All Stripe events are processed here and converted to internal events.
 */

import { NextRequest, NextResponse } from 'next/server';
import StripePaymentService from '@/lib/payment/stripe-service';
import WebhookHandler from '@/lib/payment/webhook-handler';

export async function POST(request: NextRequest) {
  try {
    // Get the raw body for signature verification
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 },
      );
    }

    // Verify webhook signature
    const event = StripePaymentService.verifyWebhookSignature(body, sig);

    console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

    // Process the event
    await WebhookHandler.handleEvent(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);

    // Return 400 for signature verification errors
    // Return 500 for other errors
    const statusCode = (error as Error).message.includes('signature') ? 400 : 500;

    return NextResponse.json(
      { error: (error as Error).message || 'Webhook processing failed' },
      { status: statusCode },
    );
  }
}
