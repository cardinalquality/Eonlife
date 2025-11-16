/**
 * Payment Service
 *
 * This is the main service that all application code uses.
 * It coordinates between the database and the Stripe service.
 * It provides a clean, normalized API.
 */

import { PrismaClient } from '@prisma/client';
import StripePaymentService from './stripe-service';
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

const prisma = new PrismaClient();

export class PaymentService {
  /**
   * CUSTOMER MANAGEMENT
   */

  static async getOrCreateCustomer(email: string, name?: string): Promise<PaymentCustomer> {
    // Check if customer exists in our database
    let customer = await prisma.customer.findUnique({
      where: { email },
    });

    if (!customer) {
      // Create Stripe customer
      const stripeCustomer = await StripePaymentService.createCustomer(email, name);

      // Create in database
      customer = await prisma.customer.create({
        data: {
          email,
          name,
          stripeCustomerId: stripeCustomer.stripeCustomerId,
        },
      });
    }

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name || undefined,
      stripeCustomerId: customer.stripeCustomerId || undefined,
      createdAt: customer.createdAt,
    };
  }

  static async getCustomer(customerId: string): Promise<PaymentCustomer | null> {
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return null;
    }

    return {
      id: customer.id,
      email: customer.email,
      name: customer.name || undefined,
      stripeCustomerId: customer.stripeCustomerId || undefined,
      createdAt: customer.createdAt,
    };
  }

  /**
   * PAYMENT INTENT MANAGEMENT
   * Used for one-time payments with Stripe Elements
   */

  static async createPaymentIntent(request: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    // Create Stripe payment intent
    const paymentIntent = await StripePaymentService.createPaymentIntent(request);

    // Create order in database if orderId provided
    if (request.orderId) {
      await prisma.order.create({
        data: {
          id: request.orderId,
          customerId: request.customerId,
          status: 'PENDING',
          totalAmount: request.amount,
          currency: request.currency || 'usd',
          stripePaymentIntentId: paymentIntent.stripePaymentIntentId,
        },
      });
    }

    return paymentIntent;
  }

  static async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    return await StripePaymentService.getPaymentIntent(paymentIntentId);
  }

  /**
   * CHECKOUT SESSION MANAGEMENT
   * Used for Stripe Checkout (hosted page)
   */

  static async createCheckoutSession(request: CreateCheckoutSessionRequest): Promise<CheckoutSession> {
    const session = await StripePaymentService.createCheckoutSession(request);

    // Optionally: Create order in database here if needed
    // This would be done based on the checkout items

    return session;
  }

  static async getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
    return await StripePaymentService.getCheckoutSession(sessionId);
  }

  /**
   * PAYMENT METHOD MANAGEMENT
   */

  static async savePaymentMethod(
    customerId: string,
    paymentMethodData: any,
  ): Promise<PaymentMethod> {
    const paymentMethod = await StripePaymentService.createPaymentMethod(
      customerId,
      paymentMethodData,
    );

    // Save to database
    await prisma.paymentMethod.create({
      data: {
        customerId,
        stripePaymentMethodId: paymentMethod.stripePaymentMethodId!,
        type: paymentMethod.type as any,
        last4: paymentMethod.last4,
        brand: paymentMethod.brand,
        expiryMonth: paymentMethod.expiryMonth,
        expiryYear: paymentMethod.expiryYear,
        isDefault: paymentMethod.isDefault,
      },
    });

    return paymentMethod;
  }

  static async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    const methods = await prisma.paymentMethod.findMany({
      where: { customerId },
    });

    return methods.map((method) => ({
      id: method.id,
      customerId: method.customerId,
      type: method.type as any,
      last4: method.last4 || undefined,
      brand: method.brand || undefined,
      expiryMonth: method.expiryMonth || undefined,
      expiryYear: method.expiryYear || undefined,
      isDefault: method.isDefault,
      stripePaymentMethodId: method.stripePaymentMethodId,
    }));
  }

  /**
   * SUBSCRIPTION MANAGEMENT
   */

  static async createSubscription(request: CreateSubscriptionRequest): Promise<Subscription> {
    const subscription = await StripePaymentService.createSubscription(request);

    // Save to database
    await prisma.subscription.create({
      data: {
        customerId: request.customerId,
        status: 'ACTIVE',
        planId: request.planId,
        planName: request.planName,
        amount: request.amount,
        currency: request.currency || 'usd',
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        stripeCustomerId: request.customerId,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
      },
    });

    return subscription;
  }

  static async getSubscription(subscriptionId: string): Promise<Subscription | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      customerId: subscription.customerId,
      planId: subscription.planId,
      planName: subscription.planName,
      status: subscription.status as any,
      amount: subscription.amount,
      currency: subscription.currency,
      currentPeriodStart: subscription.currentPeriodStart || undefined,
      currentPeriodEnd: subscription.currentPeriodEnd || undefined,
      stripeSubscriptionId: subscription.stripeSubscriptionId || undefined,
      createdAt: subscription.createdAt,
    };
  }

  static async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    // Get subscription from database
    const dbSubscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!dbSubscription || !dbSubscription.stripeSubscriptionId) {
      throw new Error('Subscription not found');
    }

    // Cancel in Stripe
    const subscription = await StripePaymentService.cancelSubscription(
      dbSubscription.stripeSubscriptionId,
    );

    // Update in database
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    return subscription;
  }

  /**
   * ORDER MANAGEMENT
   */

  static async getOrder(orderId: string) {
    return await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
  }

  static async updateOrderStatus(
    orderId: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED',
  ) {
    return await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
      },
    });
  }

  /**
   * REFUND HANDLING
   */

  static async refundOrder(request: RefundRequest): Promise<RefundResult> {
    // Get order
    const order = await this.getOrder(request.orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Perform refund
    const refund = await StripePaymentService.refundPayment(request);

    // Update order status
    await this.updateOrderStatus(request.orderId, 'REFUNDED');

    return refund;
  }

  /**
   * EVENT LOGGING
   * Used for tracking and debugging webhook events
   */

  static async logPaymentEvent(
    stripeEventId: string,
    eventType: string,
    eventData: any,
    relatedOrderId?: string,
    relatedSubscriptionId?: string,
  ) {
    return await prisma.paymentEvent.create({
      data: {
        stripeEventId,
        eventType,
        eventData,
        relatedOrderId,
        relatedSubscriptionId,
        status: 'PENDING',
      },
    });
  }

  static async markEventAsProcessed(eventId: string) {
    return await prisma.paymentEvent.update({
      where: { id: eventId },
      data: {
        status: 'PROCESSED',
        processedAt: new Date(),
      },
    });
  }
}

export default PaymentService;
