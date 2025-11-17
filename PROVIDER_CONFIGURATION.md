# Provider Configuration Guide

Complete guide for configuring analytics, forms, payments, and email service providers in the Eonlife platform.

## Table of Contents
- [Overview](#overview)
- [Analytics Providers](#analytics-providers)
- [Form Providers](#form-providers)
- [Payment Providers](#payment-providers)
- [Email Marketing Providers](#email-marketing-providers)
- [Custom Providers](#custom-providers)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

The Eonlife platform supports multiple service providers for key functionalities. You can easily switch between providers or disable them entirely using environment variables.

### Supported Providers

| Category | Providers | Default |
|----------|-----------|---------|
| **Analytics** | Google Analytics, Mixpanel, Plausible, None | None |
| **Forms** | SendGrid, Formspree, Custom, None | None |
| **Payments** | Stripe, PayPal, Square, Shopify, None | None |
| **Email Marketing** | Mailchimp, ConvertKit, SendGrid, None | None |

### Configuration Files

- **`config/providers.config.ts`** - Provider configuration and environment variables
- **`lib/providers/`** - Provider implementations
- **`.env.local`** - Your provider credentials (never commit!)

---

## Analytics Providers

Track user behavior, conversions, and site performance.

### Google Analytics 4

**Best For:** Most websites, free tier available

#### Setup Steps

1. **Create GA4 Property**
   - Go to [Google Analytics](https://analytics.google.com)
   - Click **Admin** > **Create Property**
   - Fill in property details
   - Create a **Web** data stream
   - Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

2. **Configure Environment Variables**

   Add to `.env.local`:
   ```bash
   NEXT_PUBLIC_ANALYTICS_PROVIDER=google-analytics
   NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. **Verify Installation**
   - Visit your site
   - Open GA4 > **Reports** > **Realtime**
   - You should see your visit

#### Tracking Events

The platform automatically tracks:
- Page views
- Form submissions
- Button clicks
- Add to cart
- Begin checkout
- Purchase

**Custom Events:**
```typescript
import { getAnalyticsProvider } from '@/lib/providers';

const analytics = getAnalyticsProvider();
analytics.trackEvent('custom_event', {
  category: 'engagement',
  label: 'Button Click',
  value: 1
});
```

#### Implementation Details

File: `lib/providers/analytics/google-analytics.ts`

---

### Mixpanel

**Best For:** Advanced product analytics, user tracking

#### Setup Steps

1. **Create Mixpanel Project**
   - Go to [Mixpanel](https://mixpanel.com)
   - Create account and project
   - Copy your **Project Token**

2. **Configure Environment Variables**

   ```bash
   NEXT_PUBLIC_ANALYTICS_PROVIDER=mixpanel
   NEXT_PUBLIC_MIXPANEL_TOKEN=your-token-here
   ```

3. **Install Mixpanel SDK** (if not already installed)
   ```bash
   npm install mixpanel-browser
   ```

#### Tracking Events

```typescript
import { getAnalyticsProvider } from '@/lib/providers';

const analytics = getAnalyticsProvider();

// Track event with properties
analytics.trackEvent('product_viewed', {
  product_id: 'reluma-serum',
  price: 149.00,
  currency: 'USD'
});

// Identify user
analytics.identifyUser('user-123', {
  email: 'user@example.com',
  plan: 'premium'
});
```

---

### Plausible Analytics

**Best For:** Privacy-focused analytics, GDPR compliant

#### Setup Steps

1. **Create Plausible Account**
   - Go to [Plausible](https://plausible.io)
   - Add your website domain

2. **Configure Environment Variables**

   ```bash
   NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
   NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
   ```

3. **Verify Installation**
   - Visit your site
   - Check Plausible dashboard for real-time visitors

#### Custom Goals

Define goals in Plausible dashboard:
- Newsletter signup
- Purchase
- Contact form submission

Track in code:
```typescript
analytics.trackEvent('Newsletter Signup');
```

---

### Disable Analytics

```bash
NEXT_PUBLIC_ANALYTICS_PROVIDER=none
```

Or remove the environment variable entirely.

---

## Form Providers

Handle contact forms, lead capture, and email notifications.

### SendGrid

**Best For:** Transactional emails, large scale

#### Setup Steps

1. **Create SendGrid Account**
   - Go to [SendGrid](https://sendgrid.com)
   - Verify your sender email or domain
   - Create API key: **Settings** > **API Keys** > **Create API Key**
   - Give it **Full Access** permissions

2. **Configure Environment Variables**

   ```bash
   NEXT_PUBLIC_FORM_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@yourdomain.com
   SENDGRID_FROM_NAME=Your Brand Name
   ```

3. **Test Form Submission**
   ```bash
   curl -X POST http://localhost:3000/api/contact \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "message": "Test message"
     }'
   ```

#### Email Templates

Create templates in SendGrid dashboard:

**Contact Form Template:**
```html
<p>New contact form submission:</p>
<ul>
  <li>Name: {{name}}</li>
  <li>Email: {{email}}</li>
  <li>Message: {{message}}</li>
</ul>
```

**Using Templates in Code:**
```typescript
// lib/providers/forms/sendgrid.ts
await sendEmail({
  to: 'support@yourdomain.com',
  templateId: 'd-xxxxxxxxxxxx',
  dynamicData: {
    name: formData.name,
    email: formData.email,
    message: formData.message
  }
});
```

---

### Formspree

**Best For:** Quick setup, no backend needed

#### Setup Steps

1. **Create Formspree Form**
   - Go to [Formspree](https://formspree.io)
   - Create a new form
   - Copy your form endpoint URL

2. **Configure Environment Variables**

   ```bash
   NEXT_PUBLIC_FORM_PROVIDER=formspree
   NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id
   ```

3. **Form Automatically Works**
   - Contact form submissions go to Formspree
   - You receive email notifications
   - View submissions in Formspree dashboard

#### Custom Configuration

Configure in Formspree dashboard:
- Email notifications
- Auto-reply to submitters
- Spam filtering
- File uploads
- Webhooks

---

### Custom Form Handler

**Best For:** Advanced control, custom integrations

#### Setup Steps

1. **Configure Environment Variables**

   ```bash
   NEXT_PUBLIC_FORM_PROVIDER=custom
   NEXT_PUBLIC_CUSTOM_FORM_ENDPOINT=/api/form
   ```

2. **Create Custom Handler**

   Create `app/api/form/route.ts`:
   ```typescript
   import { NextRequest, NextResponse } from 'next/server';

   export async function POST(req: NextRequest) {
     const data = await req.json();

     // Your custom logic here
     console.log('Form submission:', data);

     // Send to your CRM, database, email service, etc.
     await sendToYourCRM(data);
     await saveToDatabase(data);
     await sendEmailNotification(data);

     return NextResponse.json({
       success: true,
       message: 'Form submitted successfully'
     });
   }
   ```

3. **Implement Your Logic**
   - Save to database
   - Send to CRM (Salesforce, HubSpot)
   - Trigger webhooks
   - Send custom emails

---

### Disable Forms

```bash
NEXT_PUBLIC_FORM_PROVIDER=none
```

Forms will still display but won't submit anywhere.

---

## Payment Providers

Process payments and manage checkout.

### Stripe (Recommended)

**Best For:** Most e-commerce sites, excellent developer experience

#### Setup Steps

1. **Create Stripe Account**
   - Go to [Stripe](https://stripe.com)
   - Complete account verification
   - Get API keys: **Developers** > **API Keys**

2. **Configure Environment Variables**

   **Development (.env.local):**
   ```bash
   NEXT_PUBLIC_PAYMENT_PROVIDER=stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   ```

   **Production:**
   ```bash
   NEXT_PUBLIC_PAYMENT_PROVIDER=stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
   STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   ```

3. **Setup Webhooks**

   **For Local Development:**
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe

   # Login
   stripe login

   # Forward webhooks to local server
   stripe listen --forward-to localhost:3000/api/webhooks/stripe

   # Copy webhook signing secret to .env.local
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
   ```

   **For Production:**
   - Go to **Developers** > **Webhooks**
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `charge.refunded`
   - Copy signing secret to production environment

4. **Test Payment Flow**

   Use Stripe test cards:
   - **Success:** `4242 4242 4242 4242`
   - **Decline:** `4000 0000 0000 0002`
   - **Requires authentication:** `4000 0025 0000 3155`

   Any future expiry date, any CVC, any ZIP code.

#### Implementation

See [PAYMENT_INTEGRATION.md](PAYMENT_INTEGRATION.md) for complete guide.

---

### PayPal

**Best For:** Global payments, PayPal user base

#### Setup Steps

1. **Create PayPal Business Account**
   - Go to [PayPal Developer](https://developer.paypal.com)
   - Create app
   - Get Client ID

2. **Configure Environment Variables**

   ```bash
   NEXT_PUBLIC_PAYMENT_PROVIDER=paypal
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-client-id
   ```

3. **Implementation**

   Implementation details in `lib/payment/paypal-service.ts`

---

### Square

**Best For:** In-person + online payments, POS integration

#### Setup

```bash
NEXT_PUBLIC_PAYMENT_PROVIDER=square
NEXT_PUBLIC_SQUARE_APPLICATION_ID=sandbox-sq0idb-xxxxx
NEXT_PUBLIC_SQUARE_LOCATION_ID=your-location-id
```

---

### Shopify

**Best For:** Using Shopify as backend

#### Setup

```bash
NEXT_PUBLIC_PAYMENT_PROVIDER=shopify
NEXT_PUBLIC_SHOPIFY_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=your-storefront-access-token
```

---

## Email Marketing Providers

Manage newsletter subscriptions and email campaigns.

### Mailchimp

**Best For:** Email marketing campaigns, automation

#### Setup Steps

1. **Create Mailchimp Account**
   - Go to [Mailchimp](https://mailchimp.com)
   - Create audience/list
   - Generate API key: **Account** > **Extras** > **API Keys**

2. **Get List ID**
   - Go to **Audience** > **Settings** > **Audience name and defaults**
   - Copy **Audience ID**

3. **Configure Environment Variables**

   ```bash
   NEXT_PUBLIC_EMAIL_PROVIDER=mailchimp
   MAILCHIMP_API_KEY=your-api-key-us21
   MAILCHIMP_LIST_ID=your-list-id
   MAILCHIMP_SERVER_PREFIX=us21
   ```

   **Note:** Server prefix is in your API key after the dash (e.g., `us21`)

4. **Test Subscription**

   ```bash
   curl -X POST http://localhost:3000/api/newsletter \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com"}'
   ```

#### Features

- Automated welcome emails
- Audience segmentation
- Campaign analytics
- A/B testing
- Email templates

---

### ConvertKit

**Best For:** Creator-focused email marketing

#### Setup

```bash
NEXT_PUBLIC_EMAIL_PROVIDER=convertkit
CONVERTKIT_API_KEY=your-api-key
CONVERTKIT_FORM_ID=your-form-id
```

1. Get API key: **Settings** > **Advanced** > **API Secret**
2. Get Form ID: **Forms** > Select form > URL has form ID

---

### SendGrid Lists

**Best For:** Already using SendGrid for transactional emails

#### Setup

```bash
NEXT_PUBLIC_EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxx
SENDGRID_LIST_ID=your-list-id
```

1. Create list in SendGrid: **Marketing** > **Contacts** > **Create List**
2. Get List ID from list settings

---

## Custom Providers

### Creating a Custom Analytics Provider

Create `lib/providers/analytics/custom.ts`:

```typescript
import { AnalyticsProvider, AnalyticsEvent } from './types';

export class CustomAnalyticsProvider implements AnalyticsProvider {
  initialize(): void {
    // Initialize your analytics service
    console.log('Custom analytics initialized');
  }

  trackPageView(url: string): void {
    // Track page view
    fetch('/api/analytics/pageview', {
      method: 'POST',
      body: JSON.stringify({ url })
    });
  }

  trackEvent(eventName: string, properties?: Record<string, any>): void {
    // Track custom event
    fetch('/api/analytics/event', {
      method: 'POST',
      body: JSON.stringify({ eventName, properties })
    });
  }

  identifyUser(userId: string, traits?: Record<string, any>): void {
    // Identify user
    fetch('/api/analytics/identify', {
      method: 'POST',
      body: JSON.stringify({ userId, traits })
    });
  }
}
```

Register in `lib/providers/analytics/index.ts`:

```typescript
import { CustomAnalyticsProvider } from './custom';

export function getAnalyticsProvider(): AnalyticsProvider {
  const provider = providersConfig.analytics.provider;

  switch (provider) {
    case 'google-analytics':
      return new GoogleAnalyticsProvider();
    case 'mixpanel':
      return new MixpanelProvider();
    case 'custom':
      return new CustomAnalyticsProvider();
    default:
      return new NoAnalyticsProvider();
  }
}
```

---

## Testing

### Test Analytics

**Google Analytics:**
1. Visit your site
2. Open GA4 dashboard > Realtime
3. Perform actions (navigate, click, submit forms)
4. Verify events appear in realtime report

**Mixpanel:**
1. Visit your site
2. Open Mixpanel > Events
3. Check for tracked events
4. Use Mixpanel Live View for realtime data

**Plausible:**
1. Visit your site
2. Check Plausible dashboard
3. Verify visitor count increments

### Test Forms

**SendGrid:**
```bash
# Test API directly
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "This is a test"
  }'

# Check SendGrid Activity
# Dashboard > Activity > Search by email
```

**Formspree:**
- Submit form on your site
- Check Formspree dashboard for submission
- Check your email for notification

### Test Payments

**Stripe Test Mode:**
```bash
# Test checkout session
curl -X POST http://localhost:3000/api/payments/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "items": [{
      "name": "Test Product",
      "quantity": 1,
      "unitPrice": 9900
    }]
  }'

# Use test card: 4242 4242 4242 4242
# Expiry: any future date
# CVC: any 3 digits
```

**Webhook Testing:**
```bash
# Stripe CLI
stripe trigger payment_intent.succeeded

# Check your webhook handler logs
```

### Test Email Marketing

**Mailchimp:**
```bash
# Test newsletter signup
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Check Mailchimp Audience
# Audience > View contacts > Search email
```

---

## Troubleshooting

### Analytics Not Tracking

**Check:**
1. Environment variables are set correctly
2. Provider is initialized in `app/layout.tsx`:
   ```typescript
   import { initializeProviders } from '@/lib/providers';
   initializeProviders();
   ```
3. Browser console for errors
4. Ad blockers aren't blocking analytics

**Debug:**
```typescript
// Add console logging
const analytics = getAnalyticsProvider();
console.log('Analytics provider:', analytics);
analytics.trackPageView(window.location.pathname);
```

### Forms Not Submitting

**Check:**
1. API endpoint exists and is configured
2. CORS settings allow requests
3. Environment variables are correct
4. Check browser network tab for failed requests

**Debug:**
```bash
# Check API route
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"Test"}' \
  -v
```

### Payments Failing

**Check:**
1. Using test API keys in development
2. Webhook secret is configured
3. Stripe webhook is receiving events (check Stripe dashboard)
4. Amount is in cents (e.g., $99.00 = 9900)

**Debug:**
```bash
# Check webhook deliveries
# Stripe Dashboard > Developers > Webhooks > [Your webhook] > Recent deliveries

# Test locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe
stripe trigger payment_intent.succeeded
```

### Email Marketing Not Working

**Check:**
1. API key is valid
2. List/Audience ID is correct
3. Email is valid format
4. Check service dashboard for errors

**Debug Mailchimp:**
```bash
# Test API directly
curl -X POST https://us21.api.mailchimp.com/3.0/lists/YOUR_LIST_ID/members \
  -u "anystring:YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email_address": "test@example.com",
    "status": "subscribed"
  }'
```

---

## Environment Variables Quick Reference

### Analytics
```bash
# Google Analytics
NEXT_PUBLIC_ANALYTICS_PROVIDER=google-analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Mixpanel
NEXT_PUBLIC_ANALYTICS_PROVIDER=mixpanel
NEXT_PUBLIC_MIXPANEL_TOKEN=your-token

# Plausible
NEXT_PUBLIC_ANALYTICS_PROVIDER=plausible
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=yourdomain.com
```

### Forms
```bash
# SendGrid
NEXT_PUBLIC_FORM_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Brand

# Formspree
NEXT_PUBLIC_FORM_PROVIDER=formspree
NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/xxxxx
```

### Payments
```bash
# Stripe
NEXT_PUBLIC_PAYMENT_PROVIDER=stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### Email Marketing
```bash
# Mailchimp
NEXT_PUBLIC_EMAIL_PROVIDER=mailchimp
MAILCHIMP_API_KEY=xxxxx-us21
MAILCHIMP_LIST_ID=xxxxx
MAILCHIMP_SERVER_PREFIX=us21
```

---

## Best Practices

### Security
- ✅ Never commit `.env.local` to Git
- ✅ Use different API keys for dev and production
- ✅ Rotate keys regularly
- ✅ Use environment variables for all secrets
- ✅ Verify webhooks with signatures

### Performance
- ✅ Load analytics asynchronously
- ✅ Batch analytics events when possible
- ✅ Use server-side API calls for sensitive operations
- ✅ Cache provider instances

### Reliability
- ✅ Implement error handling
- ✅ Add retry logic for API calls
- ✅ Log failures for debugging
- ✅ Have fallbacks for critical features
- ✅ Test in both dev and production

---

**Need help?** Check provider-specific documentation:
- [Google Analytics 4 Docs](https://developers.google.com/analytics/devguides/collection/ga4)
- [Stripe Docs](https://stripe.com/docs)
- [SendGrid Docs](https://docs.sendgrid.com)
- [Mailchimp API Docs](https://mailchimp.com/developer/)
- [Formspree Docs](https://help.formspree.io)
