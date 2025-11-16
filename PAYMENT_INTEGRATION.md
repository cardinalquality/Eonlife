# Payment Integration Guide

This document explains how the Stripe payment integration works and how to use it in your application.

## Architecture Overview

The payment system follows an **abstraction pattern** to decouple payment processing from the rest of the application:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Components                        │
│              (CheckoutForm, StripeCheckout, etc)             │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP Requests
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                              │
│   (/api/payments/*, /api/customers/*, /api/webhooks/*)      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   Payment Service Layer                      │
│              (payment-service.ts - THE ABSTRACTION)          │
│  - Normalizes data                                           │
│  - Coordinates database & payment provider                   │
│  - Returns internal types, NOT Stripe objects                │
└────────────────────────┬────────────────────────────────────┘
                    ┌────┴─────┐
                    ▼           ▼
        ┌──────────────────┐  ┌──────────────────┐
        │   Stripe Service │  │   Database       │
        │(stripe-service)  │  │   (Prisma)       │
        └──────────────────┘  └──────────────────┘
```

## Key Design Principles

### 1. **No Stripe Logic in Frontend**
The frontend never calls Stripe directly (except for loading the Stripe.js library). All payment operations go through your API.

```typescript
// ✗ WRONG - Never do this
const stripe = loadStripe(...);
const { paymentIntent } = await stripe.paymentIntents.create(...);

// ✓ CORRECT - Call your API endpoint
const response = await fetch('/api/payments/create-payment-intent', {...});
```

### 2. **Normalized Data Types**
Your application uses internal types (defined in `lib/payment/types.ts`), not Stripe objects.

```typescript
// Internal type (provider-agnostic)
interface PaymentIntent {
  id: string;
  customerId: string;
  amount: number;
  status: 'requires_payment_method' | 'processing' | 'succeeded' | 'requires_action' | 'canceled';
  clientSecret?: string;
  stripePaymentIntentId?: string; // Maps to Stripe for reference
}
```

### 3. **Single Stripe Service**
All Stripe SDK calls are in `lib/payment/stripe-service.ts`. This is the ONLY place where Stripe is used directly.

### 4. **Single Webhook Endpoint**
All Stripe webhook events go to `/api/webhooks/stripe`. Events are converted to internal events and processed.

### 5. **Database as Source of Truth**
Every payment operation is saved to the database. Stripe is used for payment processing, but your database tracks all business logic.

## File Structure

```
lib/payment/
├── types.ts                    # Internal type definitions
├── stripe-service.ts           # Stripe SDK wrapper (provider-specific)
├── payment-service.ts          # Main service layer (business logic)
├── webhook-handler.ts          # Webhook event processing
└── index.ts                    # Exports

app/api/
├── payments/
│   ├── create-payment-intent/route.ts     # Payment Intent API
│   ├── create-checkout-session/route.ts   # Checkout Session API
│   └── refund/route.ts                    # Refund API
├── customers/
│   └── create-or-get/route.ts            # Customer Management API
└── webhooks/
    └── stripe/route.ts                    # Webhook Receiver

components/
├── CheckoutForm.tsx                       # Stripe Elements Form
└── StripeCheckout.tsx                     # Stripe Checkout (hosted)
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

This installs:
- `stripe` - Stripe SDK for backend
- `@stripe/react-stripe-js` - React Stripe components
- `@stripe/stripe-js` - Frontend Stripe library
- `@prisma/client` - Database ORM
- `prisma` - Database tools

### 2. Configure Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Then add your Stripe credentials:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/reluma_db"

# Stripe (get from https://dashboard.stripe.com/apikeys)
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLIC_KEY"
STRIPE_WEBHOOK_SECRET="whsec_test_YOUR_WEBHOOK_SECRET"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Set Up Database

```bash
# Push schema to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 4. Test with Stripe CLI (Webhooks)

Install and configure Stripe CLI:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS
# or download from https://stripe.com/docs/stripe-cli

# Log in to your Stripe account
stripe login

# Listen for webhook events
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will give you a webhook secret to add to .env.local
```

## Usage Examples

### Example 1: Accept Payment with Stripe Elements (Form)

```typescript
import { CheckoutForm } from '@/components/CheckoutForm';

export default function CheckoutPage() {
  return (
    <CheckoutForm
      amount={9999} // $99.99 in cents
      description="ReLuma Premium Serum"
      onSuccess={(paymentIntentId) => {
        console.log('Payment successful:', paymentIntentId);
        // Redirect to success page or show confirmation
      }}
      onError={(error) => {
        console.error('Payment failed:', error);
      }}
    />
  );
}
```

### Example 2: Accept Payment with Stripe Checkout (Hosted)

```typescript
import { StripeCheckout } from '@/components/StripeCheckout';

export default function ProductPage() {
  const items = [
    {
      name: 'ReLuma Serum',
      description: 'Anti-aging face serum',
      quantity: 1,
      unitPrice: 9999, // $99.99 in cents
    },
  ];

  return (
    <StripeCheckout
      email="customer@example.com"
      items={items}
      onSuccess={() => console.log('Checkout session created')}
    />
  );
}
```

### Example 3: Create Subscription

```typescript
import { PaymentService } from '@/lib/payment';

// In your API route
const subscription = await PaymentService.createSubscription({
  customerId: 'cust_123',
  planId: 'plan_premium',
  planName: 'Premium Plan',
  amount: 4999, // $49.99/month in cents
  billingInterval: 'month',
});
```

### Example 4: Handle Refunds

```typescript
import { PaymentService } from '@/lib/payment';

const refund = await PaymentService.refundOrder({
  orderId: 'order_123',
  amount: 9999, // $99.99 in cents (optional, full refund if omitted)
  reason: 'Customer request',
});
```

## Webhook Handling

The webhook handler automatically processes these Stripe events:

| Event | Handler | Action |
|-------|---------|--------|
| `payment_intent.succeeded` | `handlePaymentSucceeded` | Mark order as COMPLETED |
| `payment_intent.payment_failed` | `handlePaymentFailed` | Mark order as FAILED |
| `charge.refunded` | `handleRefund` | Mark order as REFUNDED |
| `customer.subscription.created` | `handleSubscriptionCreated` | Create subscription record |
| `customer.subscription.updated` | `handleSubscriptionUpdated` | Update subscription details |
| `customer.subscription.deleted` | `handleSubscriptionCancelled` | Cancel subscription |
| `invoice.payment_succeeded` | `handleInvoicePaymentSucceeded` | Process recurring payment |
| `invoice.payment_failed` | `handleInvoicePaymentFailed` | Handle failed recurring payment |

To add handling for additional events, edit `lib/payment/webhook-handler.ts`.

## Swapping Payment Providers

The beauty of this abstraction is that swapping payment providers requires minimal changes:

### To swap Stripe for PayPal:

1. **Create a new PayPal service** at `lib/payment/paypal-service.ts`
2. **Update the type conversions** in `payment-service.ts`
3. **Update the webhook handler** at `lib/payment/webhook-handler.ts`
4. **Update frontend components** (CheckoutForm.tsx, etc.)

The API routes and database schema remain **unchanged**!

## Best Practices

### ✓ DO:
- Always call API endpoints from the frontend (never Stripe SDK directly)
- Store Stripe IDs in the database for reference
- Log all payment events in the database
- Normalize Stripe data before returning to frontend
- Handle errors gracefully with user-friendly messages
- Test with Stripe test cards

### ✗ DON'T:
- Never store raw card data (Stripe handles this)
- Never expose secret keys to the frontend
- Never scatter Stripe calls throughout your codebase
- Never skip webhook signature verification
- Never hardcode payment logic in components

## Test Cards

| Card | Use Case |
|------|----------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Payment declined |
| 4000 0027 6000 3184 | Requires 3D Secure authentication |

## Troubleshooting

### Webhook not receiving events?
- Make sure Stripe CLI is running: `stripe listen`
- Check webhook secret in `.env.local` matches CLI output
- Verify API route path: `/api/webhooks/stripe`

### Payment Intent creation fails?
- Check Stripe secret key in `.env.local`
- Verify customer exists in database
- Check Stripe dashboard for errors

### Database connection fails?
- Verify `DATABASE_URL` in `.env.local`
- Make sure PostgreSQL is running
- Run `npx prisma db push` to create tables

## Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Elements](https://stripe.com/docs/stripe-js/elements/payment-element)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Prisma Documentation](https://www.prisma.io/docs/)
