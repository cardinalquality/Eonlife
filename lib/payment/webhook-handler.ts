/**
 * Webhook Handler
 *
 * Handles all Stripe webhook events and converts them to internal events.
 * This is the ONLY webhook endpoint in the application.
 * All Stripe logic for webhook processing is isolated here.
 */

import PaymentService from './payment-service';
import StripePaymentService from './stripe-service';

export type StripeEvent = any; // From Stripe SDK

export class WebhookHandler {
  /**
   * Process a Stripe webhook event
   * Converts Stripe events to internal application events
   */
  static async handleEvent(event: StripeEvent) {
    console.log(`[Webhook] Processing event: ${event.type}`);

    // Log the raw event
    const paymentEvent = await PaymentService.logPaymentEvent(
      event.id,
      event.type,
      event.data,
    );

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSucceeded(event);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentFailed(event);
          break;

        case 'charge.refunded':
          await this.handleRefund(event);
          break;

        case 'customer.subscription.created':
          await this.handleSubscriptionCreated(event);
          break;

        case 'customer.subscription.updated':
          await this.handleSubscriptionUpdated(event);
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionCancelled(event);
          break;

        case 'invoice.payment_succeeded':
          await this.handleInvoicePaymentSucceeded(event);
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event);
          break;

        default:
          console.log(`[Webhook] Unhandled event type: ${event.type}`);
      }

      // Mark event as processed
      await PaymentService.markEventAsProcessed(paymentEvent.id);
    } catch (error) {
      console.error('[Webhook] Error processing event:', error);
      throw error;
    }
  }

  /**
   * PAYMENT INTENT HANDLERS
   */

  private static async handlePaymentSucceeded(event: StripeEvent) {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;

    console.log(`[Webhook] Payment succeeded for order: ${orderId}`);

    if (!orderId) {
      console.warn('[Webhook] No orderId in payment intent metadata');
      return;
    }

    // Update order status
    await PaymentService.updateOrderStatus(orderId, 'COMPLETED');

    // TODO: Trigger order confirmation email
    // TODO: Trigger inventory update
    // TODO: Trigger fulfillment process
  }

  private static async handlePaymentFailed(event: StripeEvent) {
    const paymentIntent = event.data.object;
    const orderId = paymentIntent.metadata?.orderId;

    console.log(`[Webhook] Payment failed for order: ${orderId}`);

    if (!orderId) {
      console.warn('[Webhook] No orderId in payment intent metadata');
      return;
    }

    // Update order status
    await PaymentService.updateOrderStatus(orderId, 'FAILED');

    // TODO: Send payment failure notification email
    // TODO: Retry logic or user notification
  }

  /**
   * REFUND HANDLERS
   */

  private static async handleRefund(event: StripeEvent) {
    const charge = event.data.object;
    const orderId = charge.metadata?.orderId;

    console.log(`[Webhook] Refund processed for order: ${orderId}`);

    if (!orderId) {
      console.warn('[Webhook] No orderId in charge metadata');
      return;
    }

    // Update order status
    await PaymentService.updateOrderStatus(orderId, 'REFUNDED');

    // TODO: Send refund confirmation email
    // TODO: Log refund in accounting system
  }

  /**
   * SUBSCRIPTION HANDLERS
   */

  private static async handleSubscriptionCreated(event: StripeEvent) {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    console.log(`[Webhook] Subscription created for customer: ${customerId}`);

    // Get or create customer in database
    const customer = await PaymentService.getCustomer(customerId);
    if (!customer) {
      console.warn(`[Webhook] Customer not found: ${customerId}`);
      return;
    }

    // TODO: Update subscription in database if needed
    // TODO: Send subscription confirmation email
  }

  private static async handleSubscriptionUpdated(event: StripeEvent) {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    console.log(`[Webhook] Subscription updated for customer: ${customerId}`);

    // TODO: Update subscription details in database
    // TODO: Handle plan changes
    // TODO: Handle billing issues
  }

  private static async handleSubscriptionCancelled(event: StripeEvent) {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    console.log(`[Webhook] Subscription cancelled for customer: ${customerId}`);

    // TODO: Update subscription status in database
    // TODO: Send cancellation confirmation email
    // TODO: Revoke access if needed
  }

  /**
   * INVOICE HANDLERS
   * Handle recurring billing events
   */

  private static async handleInvoicePaymentSucceeded(event: StripeEvent) {
    const invoice = event.data.object;
    const customerId = invoice.customer;

    console.log(`[Webhook] Invoice payment succeeded for customer: ${customerId}`);

    // TODO: Update subscription status
    // TODO: Send receipt email
  }

  private static async handleInvoicePaymentFailed(event: StripeEvent) {
    const invoice = event.data.object;
    const customerId = invoice.customer;

    console.log(`[Webhook] Invoice payment failed for customer: ${customerId}`);

    // TODO: Handle failed payment
    // TODO: Notify customer
    // TODO: Retry logic
  }
}

export default WebhookHandler;
