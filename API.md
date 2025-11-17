# Eonlife API Documentation

Complete reference for all API endpoints in the Eonlife e-commerce platform.

## Table of Contents
- [Overview](#overview)
- [Authentication](#authentication)
- [Security](#security)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Products](#products)
  - [Payments](#payments)
  - [Customer Management](#customer-management)
  - [Inventory](#inventory)
  - [Forms & Communication](#forms--communication)
  - [GDPR Compliance](#gdpr-compliance)
  - [Webhooks](#webhooks)
  - [Utilities](#utilities)

---

## Overview

**Base URL:** `http://localhost:3000` (development) or `https://yourdomain.com` (production)

**Content Type:** All endpoints accept and return `application/json` unless specified otherwise.

**CORS:** Configured to allow cross-origin requests. CORS preflight requests (`OPTIONS`) are supported.

---

## Authentication

Most public endpoints (newsletter, contact) **do not require authentication**.

Endpoints that require authentication:
- GDPR data export/deletion
- Customer management
- Order management

**Note:** Full authentication middleware is marked as TODO. Implement session-based or JWT authentication before production deployment.

---

## Security

All API endpoints implement security best practices:

### CSRF Protection
Endpoints with forms (contact, newsletter) use CSRF protection:
- **Header Required:** `X-CSRF-Token: <token>`
- **Get Token:** `GET /api/csrf-token`

### Rate Limiting
Rate limits vary by endpoint type:
- **Newsletter/Contact:** 5 requests per email per hour
- **Payments:** 10 requests per IP per minute
- **General:** 100 requests per IP per minute

### Input Validation
All user input is validated using schemas. Invalid input returns:
```json
{
  "error": "Validation failed",
  "details": ["Field name is required", "Email must be valid"]
}
```

### Sanitization
User-generated content is sanitized to prevent XSS attacks.

---

## Rate Limiting

When rate limit is exceeded:

**Response:**
```json
{
  "error": "Too many requests. Please try again later.",
  "retryAfter": 3600
}
```

**Status Code:** `429 Too Many Requests`

**Headers:**
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Timestamp when limit resets
- `Retry-After`: Seconds until retry is allowed

---

## Error Handling

### Standard Error Response
```json
{
  "error": "Error message here",
  "details": ["Optional array of specific errors"]
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (validation error)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `409` - Conflict (duplicate resource)
- `429` - Too many requests
- `500` - Internal server error

---

## Endpoints

## Products

### Get Product by ID

Retrieve detailed information about a specific product, including reviews.

**Endpoint:** `GET /api/products/{id}`

**Parameters:**
- `id` (path, required) - Product ID

**Example Request:**
```bash
curl http://localhost:3000/api/products/reluma-serum
```

**Example Response:**
```json
{
  "id": "reluma-serum",
  "name": "ReLuma Renewal Serum",
  "description": "Advanced anti-aging serum with 387 human growth factors",
  "price": 14900,
  "currency": "usd",
  "images": [
    "/products/reluma/bottle-front.jpg",
    "/products/reluma/bottle-side.jpg"
  ],
  "reviews": [
    {
      "id": "review-1",
      "rating": 5,
      "comment": "Amazing results!",
      "author": "Jane D.",
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "inventory": 1000,
  "status": "active"
}
```

**Error Responses:**
- `404` - Product not found
- `500` - Server error

---

## Payments

### Create Checkout Session

Create a Stripe Checkout session for hosted payment experience.

**Endpoint:** `POST /api/payments/create-checkout-session`

**Request Body:**
```json
{
  "customerId": "cus_xxx",
  "email": "customer@example.com",
  "items": [
    {
      "name": "ReLuma Renewal Serum",
      "description": "1-month supply",
      "quantity": 1,
      "unitPrice": 14900
    }
  ],
  "currency": "usd"
}
```

**Parameters:**
- `customerId` (optional) - Existing Stripe customer ID
- `email` (required if no customerId) - Customer email
- `items` (required) - Array of checkout items
  - `name` (required) - Product name
  - `description` (optional) - Product description
  - `quantity` (required) - Quantity
  - `unitPrice` (required) - Price in cents
- `currency` (optional, default: "usd") - Currency code

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/payments/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "items": [
      {
        "name": "ReLuma Renewal Serum",
        "quantity": 1,
        "unitPrice": 14900
      }
    ]
  }'
```

**Example Response:**
```json
{
  "success": true,
  "session": {
    "id": "cs_test_xxx",
    "url": "https://checkout.stripe.com/c/pay/cs_test_xxx",
    "status": "open"
  }
}
```

**Error Responses:**
- `400` - Missing or invalid items, email/customerId
- `500` - Payment processing error

---

### Create Payment Intent

Create a Stripe Payment Intent for custom checkout flows.

**Endpoint:** `POST /api/payments/create-payment-intent`

**Request Body:**
```json
{
  "amount": 14900,
  "currency": "usd",
  "customerId": "cus_xxx",
  "email": "customer@example.com",
  "metadata": {
    "productId": "reluma-serum",
    "quantity": 1
  }
}
```

**Parameters:**
- `amount` (required) - Amount in cents
- `currency` (optional, default: "usd") - Currency code
- `customerId` (optional) - Existing Stripe customer ID
- `email` (required if no customerId) - Customer email
- `metadata` (optional) - Additional metadata

**Example Response:**
```json
{
  "success": true,
  "paymentIntent": {
    "id": "pi_xxx",
    "clientSecret": "pi_xxx_secret_xxx",
    "status": "requires_payment_method"
  }
}
```

---

### Process Refund

Process a refund for a payment.

**Endpoint:** `POST /api/payments/refund`

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxx",
  "amount": 14900,
  "reason": "requested_by_customer"
}
```

**Parameters:**
- `paymentIntentId` (required) - Stripe Payment Intent ID
- `amount` (optional) - Refund amount in cents (defaults to full refund)
- `reason` (optional) - Refund reason: `duplicate`, `fraudulent`, `requested_by_customer`

**Example Response:**
```json
{
  "success": true,
  "refund": {
    "id": "re_xxx",
    "amount": 14900,
    "status": "succeeded"
  }
}
```

---

## Customer Management

### Create or Get Customer

Create a new customer or retrieve existing customer by email.

**Endpoint:** `POST /api/customers/create-or-get`

**Request Body:**
```json
{
  "email": "customer@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Parameters:**
- `email` (required) - Customer email
- `firstName` (optional) - First name
- `lastName` (optional) - Last name
- `phone` (optional) - Phone number

**Example Response:**
```json
{
  "customer": {
    "id": "cus_xxx",
    "email": "customer@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "stripeCustomerId": "cus_stripe_xxx"
  },
  "isNew": false
}
```

---

## Inventory

### Check Inventory

Check product availability.

**Endpoint:** `POST /api/inventory/check`

**Request Body:**
```json
{
  "productId": "reluma-serum",
  "quantity": 2
}
```

**Example Response:**
```json
{
  "available": true,
  "inStock": 1000,
  "requested": 2
}
```

---

### Reserve Inventory

Reserve inventory for an order (temporary hold).

**Endpoint:** `POST /api/inventory/reserve`

**Request Body:**
```json
{
  "items": [
    {
      "productId": "reluma-serum",
      "quantity": 2
    }
  ],
  "orderId": "order_xxx"
}
```

**Example Response:**
```json
{
  "success": true,
  "reservationId": "rsv_xxx",
  "expiresAt": "2024-01-15T10:15:00Z"
}
```

---

## Forms & Communication

### Newsletter Signup

Subscribe to newsletter.

**Endpoint:** `POST /api/newsletter`

**Security:**
- Rate limited: 5 requests per email per hour
- Input validation and sanitization

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter",
  "email": "user@example.com"
}
```

**Error Responses:**
- `400` - Invalid email format
- `429` - Rate limit exceeded

---

### Newsletter Subscribe (Alternative)

Alternative newsletter subscription endpoint.

**Endpoint:** `POST /api/subscribe`

Same as `/api/newsletter` - use either endpoint.

---

### Contact Form

Submit contact form.

**Endpoint:** `POST /api/contact`

**Security:**
- CSRF protection required
- Rate limited: 5 requests per email per hour
- Input sanitization

**Headers:**
```
Content-Type: application/json
X-CSRF-Token: <token from /api/csrf-token>
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "I have a question about your products"
}
```

**Example Request:**
```bash
# First, get CSRF token
TOKEN=$(curl http://localhost:3000/api/csrf-token | jq -r '.token')

# Then submit form
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "message": "I have a question"
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Your message has been sent successfully. We will get back to you soon!"
}
```

---

### Submit Product Review

Submit a product review.

**Endpoint:** `POST /api/reviews`

**Request Body:**
```json
{
  "productId": "reluma-serum",
  "rating": 5,
  "title": "Amazing product!",
  "comment": "I've seen great results after just 2 weeks",
  "author": "Jane D.",
  "email": "jane@example.com"
}
```

**Example Response:**
```json
{
  "success": true,
  "review": {
    "id": "review_xxx",
    "productId": "reluma-serum",
    "rating": 5,
    "title": "Amazing product!",
    "comment": "I've seen great results after just 2 weeks",
    "author": "Jane D.",
    "status": "pending",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

## GDPR Compliance

### Export User Data

Export all user data in JSON format (GDPR right to data portability).

**Endpoint:** `POST /api/gdpr/export-data`

**Note:** Should require authentication in production.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/gdpr/export-data \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}' \
  --output user-data.json
```

**Example Response:**
Downloaded JSON file containing:
```json
{
  "export_date": "2024-01-15T10:00:00Z",
  "user_rights": {
    "notice": "This is all the personal data we have about you...",
    "contact": "privacy@reluma.com"
  },
  "personal_information": {
    "user_id": "user_xxx",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "account_created": "2023-01-01T00:00:00Z"
  },
  "orders": [...],
  "addresses": [...],
  "consent_history": [...],
  "newsletter_analytics": [...],
  "chat_history": [...]
}
```

**Response Headers:**
```
Content-Type: application/json
Content-Disposition: attachment; filename="reluma-data-export-{userId}-{timestamp}.json"
```

---

### Delete User Account

Delete user account and all associated data (GDPR right to erasure).

**Endpoint:** `POST /api/gdpr/delete-account`

**Note:** Should require authentication in production.

**Request Body:**
```json
{
  "email": "user@example.com",
  "reason": "No longer using the service"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Your account and all associated data have been permanently deleted."
}
```

**What gets deleted:**
- User profile
- Orders (marked as deleted, not physically removed for legal/accounting)
- Addresses
- Newsletter subscriptions
- Consent records
- Chat history

---

## Cookie Consent

### Accept Cookie Consent

Record user cookie consent.

**Endpoint:** `POST /api/consent/accept`

**Request Body:**
```json
{
  "email": "user@example.com",
  "analyticsConsent": true,
  "marketingConsent": false,
  "functionalConsent": true
}
```

**Example Response:**
```json
{
  "success": true,
  "consent": {
    "id": "consent_xxx",
    "email": "user@example.com",
    "analytics": true,
    "marketing": false,
    "functional": true,
    "timestamp": "2024-01-15T10:00:00Z"
  }
}
```

---

## Webhooks

### Stripe Webhook

Handle Stripe webhook events.

**Endpoint:** `POST /api/webhooks/stripe`

**Security:**
- Stripe signature verification required
- Webhook secret must be configured: `STRIPE_WEBHOOK_SECRET`

**Headers:**
```
Stripe-Signature: t=xxx,v1=xxx
```

**Events Handled:**
- `checkout.session.completed` - Checkout session completed
- `payment_intent.succeeded` - Payment successful
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription canceled

**Example Stripe CLI Test:**
```bash
# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger payment_intent.succeeded
```

**Response:**
```json
{
  "received": true
}
```

---

## Utilities

### Get CSRF Token

Get CSRF token for form submissions.

**Endpoint:** `GET /api/csrf-token`

**Example Request:**
```bash
curl http://localhost:3000/api/csrf-token
```

**Example Response:**
```json
{
  "token": "abc123xyz789"
}
```

**Usage:**
Include token in `X-CSRF-Token` header for protected endpoints.

---

## Testing

### Testing with cURL

**Get Product:**
```bash
curl http://localhost:3000/api/products/reluma-serum
```

**Newsletter Signup:**
```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Contact Form with CSRF:**
```bash
# Get token
TOKEN=$(curl -s http://localhost:3000/api/csrf-token | jq -r '.token')

# Submit form
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message"
  }'
```

### Testing with Stripe

**Test Card Numbers:**
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **Requires authentication:** `4000 0025 0000 3155`

**Expiry:** Any future date (e.g., 12/34)
**CVC:** Any 3 digits (e.g., 123)
**ZIP:** Any 5 digits (e.g., 12345)

See [Stripe Testing Documentation](https://stripe.com/docs/testing) for more test cards.

---

## Rate Limits by Endpoint

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| `/api/newsletter` | 5 | 1 hour | email |
| `/api/subscribe` | 5 | 1 hour | email |
| `/api/contact` | 5 | 1 hour | email |
| `/api/reviews` | 3 | 1 hour | email |
| `/api/payments/*` | 10 | 1 minute | IP |
| `/api/gdpr/*` | 3 | 1 hour | email |
| All other endpoints | 100 | 1 minute | IP |

---

## Security Best Practices

### For Frontend Developers
1. Always get CSRF tokens before submitting forms
2. Never expose API secrets in client code
3. Use environment variables for Stripe publishable key
4. Validate user input on frontend before API calls
5. Handle rate limit errors gracefully with retry logic

### For Backend Developers
1. Always validate and sanitize user input
2. Use prepared statements for database queries (prevents SQL injection)
3. Implement proper authentication before production
4. Log suspicious activity
5. Keep Stripe webhook signature verification enabled
6. Rotate API secrets regularly

---

## Additional Resources

- **Stripe API Docs:** https://stripe.com/docs/api
- **Next.js API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **GDPR Compliance:** See [GDPR_IMPLEMENTATION.md](GDPR_IMPLEMENTATION.md)
- **Security Guide:** See [SECURITY.md](SECURITY.md)
- **Payment Integration:** See [PAYMENT_INTEGRATION.md](PAYMENT_INTEGRATION.md)

---

## Support

For API issues or questions:
1. Check the [Troubleshooting](#troubleshooting) section in [GETTING_STARTED.md](GETTING_STARTED.md)
2. Review endpoint-specific error messages
3. Check server logs for detailed error information
4. Verify environment variables are configured correctly

**Need help?** Open an issue on GitHub with:
- Endpoint URL
- Request payload
- Expected vs actual response
- Error messages from server logs
