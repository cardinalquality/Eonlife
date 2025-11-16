/**
 * Stripe Service
 *
 * This service handles all Stripe API calls.
 * It converts Stripe objects to our internal types.
 * This is the ONLY place where Stripe SDK is used directly.
 */

import Stripe from 'stripe';
import {
  PaymentCustomer,
  PaymentIntent,
  CheckoutSession,
  PaymentMethod,
  Subscription,
  CreatePaymentIntentRequest,
  CreateCheckoutSessionRequest,
  CreateSubscriptionRequest,
  RefundRequest,
  RefundResult,
} from './types';

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20' as any,
});

export class StripePaymentService {
  /**
   * CUSTOMER MANAGEMENT
   */

  static async createCustomer(email: string, name?: string): Promise<PaymentCustomer> {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
      });

      return {
        id: customer.id,
        email: customer.email || '',
        name: customer.name || undefined,
        stripeCustomerId: customer.id,
        createdAt: new Date(customer.created * 1000),
      };
    } catch (error) {
      throw new Error(`Failed to create Stripe customer: ${(error as Error).message}`);
    }
  }

  static async getCustomer(stripeCustomerId: string): Promise<PaymentCustomer> {
    try {
      const customer = await stripe.customers.retrieve(stripeCustomerId);

      return {
        id: customer.id,
        email: (customer as any).email || '',
        name: (customer as any).name || undefined,
        stripeCustomerId: customer.id,
        createdAt: new Date((customer as any).created * 1000),
      };
    } catch (error) {
      throw new Error(`Failed to retrieve Stripe customer: ${(error as Error).message}`);
    }
  }

  /**
   * PAYMENT INTENT MANAGEMENT
   */

  static async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: request.amount,
        currency: request.currency || 'usd',
        customer: request.customerId,
        metadata: {
          orderId: request.orderId || '',
          ...request.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        id: paymentIntent.id,
        customerId: paymentIntent.customer as string,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status as any,
        clientSecret: paymentIntent.client_secret || undefined,
        stripePaymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      throw new Error(`Failed to create payment intent: ${(error as Error).message}`);
    }
  }

  static async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        id: paymentIntent.id,
        customerId: (paymentIntent.customer as string) || '',
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status as any,
        stripePaymentIntentId: paymentIntent.id,
      };
    } catch (error) {
      throw new Error(`Failed to retrieve payment intent: ${(error as Error).message}`);
    }
  }

  /**
   * CHECKOUT SESSION MANAGEMENT
   */

  static async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CheckoutSession> {
    try {
      const lineItems = request.items.map((item) => ({
        price_data: {
          currency: request.currency || 'usd',
          product_data: {
            name: item.name,
            description: item.description,
          },
          unit_amount: item.unitPrice,
        },
        quantity: item.quantity,
      }));

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        line_items: lineItems as any,
        mode: 'payment',
        success_url: request.successUrl,
        cancel_url: request.cancelUrl,
        metadata: request.metadata,
      };

      // Add customer if available
      if (request.customerId) {
        sessionParams.customer = request.customerId;
      } else if (request.email) {
        sessionParams.customer_email = request.email;
      }

      const session = await stripe.checkout.sessions.create(sessionParams);

      return {
        id: session.id,
        customerId: (session.customer as string) || undefined,
        url: session.url || undefined,
        status: session.payment_status === 'paid' ? 'complete' : 'open',
        lineItems: request.items,
        totalAmount: request.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
        currency: request.currency || 'usd',
      };
    } catch (error) {
      throw new Error(`Failed to create checkout session: ${(error as Error).message}`);
    }
  }

  static async getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      return {
        id: session.id,
        customerId: (session.customer as string) || undefined,
        url: session.url || undefined,
        status: session.payment_status === 'paid' ? 'complete' : 'open',
        lineItems: [],
        totalAmount: session.amount_total || 0,
        currency: session.currency || 'usd',
      };
    } catch (error) {
      throw new Error(`Failed to retrieve checkout session: ${(error as Error).message}`);
    }
  }

  /**
   * PAYMENT METHOD MANAGEMENT
   */

  static async createPaymentMethod(
    customerId: string,
    paymentMethodData: any,
  ): Promise<PaymentMethod> {
    try {
      const paymentMethod = await stripe.paymentMethods.create(paymentMethodData);

      // Attach to customer
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: customerId,
      });

      return {
        id: paymentMethod.id,
        customerId,
        type: (paymentMethod.type as any) || 'card',
        last4: (paymentMethod.card?.last4 as string) || undefined,
        brand: (paymentMethod.card?.brand as string) || undefined,
        expiryMonth: (paymentMethod.card?.exp_month as number) || undefined,
        expiryYear: (paymentMethod.card?.exp_year as number) || undefined,
        isDefault: false,
        stripePaymentMethodId: paymentMethod.id,
      };
    } catch (error) {
      throw new Error(`Failed to create payment method: ${(error as Error).message}`);
    }
  }

  static async listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data.map((pm) => ({
        id: pm.id,
        customerId,
        type: 'card',
        last4: pm.card?.last4 || undefined,
        brand: pm.card?.brand || undefined,
        expiryMonth: pm.card?.exp_month || undefined,
        expiryYear: pm.card?.exp_year || undefined,
        isDefault: false,
        stripePaymentMethodId: pm.id,
      }));
    } catch (error) {
      throw new Error(`Failed to list payment methods: ${(error as Error).message}`);
    }
  }

  /**
   * SUBSCRIPTION MANAGEMENT
   */

  static async createSubscription(request: CreateSubscriptionRequest): Promise<Subscription> {
    try {
      // First, we need to create or retrieve a price
      // For simplicity, we'll create a product and price on the fly
      const product = await stripe.products.create({
        name: request.planName,
        metadata: {
          planId: request.planId,
        },
      });

      const price = await stripe.prices.create({
        unit_amount: request.amount,
        currency: request.currency || 'usd',
        recurring: {
          interval: request.billingInterval === 'month' ? 'month' : 'year',
        },
        product: product.id,
      });

      const subscription = await stripe.subscriptions.create({
        customer: request.customerId,
        items: [
          {
            price: price.id,
          },
        ],
        metadata: request.metadata,
      });

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        planId: request.planId,
        planName: request.planName,
        status: (subscription.status as any) || 'active',
        amount: request.amount,
        currency: request.currency || 'usd',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        stripeSubscriptionId: subscription.id,
        createdAt: new Date(subscription.created * 1000),
      };
    } catch (error) {
      throw new Error(`Failed to create subscription: ${(error as Error).message}`);
    }
  }

  static async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const subscription = await stripe.subscriptions.del(subscriptionId);

      return {
        id: subscription.id,
        customerId: subscription.customer as string,
        planId: '',
        planName: '',
        status: (subscription.status as any) || 'cancelled',
        amount: 0,
        currency: 'usd',
        stripeSubscriptionId: subscription.id,
        createdAt: new Date(subscription.created * 1000),
      };
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${(error as Error).message}`);
    }
  }

  /**
   * REFUND HANDLING
   */

  static async refundPayment(request: RefundRequest): Promise<RefundResult> {
    try {
      // This assumes we have the Stripe charge ID stored
      // In practice, you'd look up the order and get the charge ID from it
      const refund = await stripe.refunds.create({
        metadata: {
          orderId: request.orderId,
          reason: request.reason || 'general',
        },
      });

      return {
        id: refund.id,
        orderId: request.orderId,
        amount: refund.amount,
        status: refund.status as any,
        createdAt: new Date((refund as any).created * 1000),
      };
    } catch (error) {
      throw new Error(`Failed to refund payment: ${(error as Error).message}`);
    }
  }

  /**
   * WEBHOOK VERIFICATION
   */

  static verifyWebhookSignature(body: string | Buffer, signature: string): any {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
      return event;
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${(error as Error).message}`);
    }
  }
}

export default StripePaymentService;
