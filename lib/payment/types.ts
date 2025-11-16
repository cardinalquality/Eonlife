/**
 * Payment Service Types
 *
 * These types represent our internal payment models.
 * They are normalized and provider-agnostic.
 * Stripe objects are converted to these types internally.
 */

export interface PaymentCustomer {
  id: string;
  email: string;
  name?: string;
  stripeCustomerId?: string;
  createdAt: Date;
}

export interface PaymentIntent {
  id: string;
  customerId: string;
  amount: number; // in cents
  currency: string;
  status: 'requires_payment_method' | 'processing' | 'succeeded' | 'requires_action' | 'canceled';
  clientSecret?: string;
  stripePaymentIntentId?: string;
}

export interface CheckoutSession {
  id: string;
  customerId?: string;
  url?: string;
  status: 'open' | 'complete' | 'expired';
  lineItems: CheckoutLineItem[];
  totalAmount: number; // in cents
  currency: string;
}

export interface CheckoutLineItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number; // in cents
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  planName: string;
  status: 'active' | 'paused' | 'cancelled' | 'past_due';
  amount: number; // in cents
  currency: string;
  currentPeriodStart?: Date;
  currentPeriodEnd?: Date;
  stripeSubscriptionId?: string;
  createdAt: Date;
}

export interface PaymentMethod {
  id: string;
  customerId: string;
  type: 'card' | 'apple_pay' | 'google_pay' | 'bank_account' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  stripePaymentMethodId?: string;
}

export interface PaymentEvent {
  id: string;
  type: string; // e.g., 'payment.succeeded', 'subscription.updated'
  customerId?: string;
  orderId?: string;
  subscriptionId?: string;
  data: Record<string, any>;
  timestamp: Date;
}

export interface RefundRequest {
  orderId: string;
  amount?: number; // in cents, if not provided, refund full amount
  reason?: string;
}

export interface RefundResult {
  id: string;
  orderId: string;
  amount: number; // in cents
  status: 'succeeded' | 'pending' | 'failed';
  createdAt: Date;
}

/**
 * API Request/Response types
 */

export interface CreatePaymentIntentRequest {
  customerId: string;
  amount: number; // in cents
  currency?: string;
  orderId?: string;
  metadata?: Record<string, string>;
}

export interface CreateCheckoutSessionRequest {
  customerId?: string;
  email?: string; // if customerId not provided
  items: CheckoutLineItem[];
  currency?: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}

export interface CreateSubscriptionRequest {
  customerId: string;
  planId: string;
  planName: string;
  amount: number; // in cents per billing period
  currency?: string;
  billingInterval: 'month' | 'year';
  metadata?: Record<string, string>;
}
