# GDPR Compliance Implementation

This document outlines the GDPR compliance features implemented for ReLuma.

## Overview

This implementation includes all necessary components for GDPR, CCPA, and CAN-SPAM compliance, including:

- ✅ Privacy Policy page
- ✅ Terms of Service page
- ✅ Return/Refund Policy page
- ✅ Shipping Policy page
- ✅ Cookie consent banner
- ✅ Consent tracking in database
- ✅ GDPR data export functionality
- ✅ Right to deletion (account deletion)
- ✅ All policies accessible in footer

## Database Setup

### 1. Initialize Prisma

Before using the GDPR features, you need to initialize the database:

```bash
# Generate Prisma client
npx prisma generate

# Create the database and run migrations
npx prisma db push

# (Optional) Seed the database
npx prisma db seed
```

### 2. Database Schema

The database includes the following models for GDPR compliance:

- **User**: Stores user information with soft delete capability
- **Order**: Tracks customer orders
- **OrderItem**: Individual items in orders
- **Address**: Shipping and billing addresses (anonymized on deletion)
- **Consent**: Tracks user consent for cookies, marketing, etc.
- **NewsletterAnalytic**: Tracks email engagement for CAN-SPAM compliance
- **ChatbotConversation**: Stores customer service conversations

## Legal Pages

All legal pages are located in the `/app` directory:

- `/privacy` - Privacy Policy
- `/terms` - Terms of Service
- `/refund-policy` - Return & Refund Policy
- `/shipping-policy` - Shipping Policy

### Customization Required

Before going live, you **MUST** customize the following in each legal page:

1. **Company Address**: Replace `[Your Company Address]` with your actual physical address (required by law)
2. **Contact Information**: Update email addresses and phone numbers
3. **Governing Law**: Update the jurisdiction in Terms of Service
4. **Shipping Rates**: Update actual shipping costs and delivery times
5. **Return Policy**: Adjust return windows and conditions to match your policies
6. **Last Updated Date**: Currently set to November 15, 2025

⚠️ **IMPORTANT**: Have these policies reviewed by a lawyer before going live!

## Cookie Consent Banner

The cookie consent banner is implemented in `/components/CookieConsent.tsx` and automatically appears on all pages via the root layout.

### Features:
- Displays on first visit
- Stores consent in localStorage and database
- Accept/Decline options
- Link to Privacy Policy
- WCAG compliant (accessible)

### Analytics Integration

To enable Google Analytics or other tracking tools when users accept cookies, update the `enableAnalytics()` function in `CookieConsent.tsx`:

```typescript
const enableAnalytics = () => {
  if (typeof window !== 'undefined') {
    // Example for Google Analytics
    window.gtag('consent', 'update', {
      analytics_storage: 'granted'
    });
  }
};
```

## GDPR API Endpoints

### 1. Consent Tracking

**Endpoint**: `POST /api/consent/accept`

Tracks user consent for cookies, marketing, analytics, etc.

**Request Body**:
```json
{
  "type": "cookies",
  "accepted": true
}
```

**Response**:
```json
{
  "success": true,
  "consent": {
    "id": "...",
    "type": "cookies",
    "accepted": true,
    "createdAt": "2025-11-15T..."
  }
}
```

### 2. Data Export (Right to Access)

**Endpoint**: `POST /api/gdpr/export-data`

Allows users to export all their personal data in JSON format.

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response**: Downloads a JSON file containing:
- Personal information
- Order history
- Addresses
- Consent history
- Newsletter analytics
- Chat history

**⚠️ Security Note**: This endpoint requires authentication in production. Implement proper session management before deploying.

### 3. Account Deletion (Right to Erasure)

**Endpoints**:
- `GET /api/gdpr/delete-account?email=user@example.com` - Check eligibility
- `POST /api/gdpr/delete-account` - Delete account

**Check Eligibility Request**:
```
GET /api/gdpr/delete-account?email=user@example.com
```

**Delete Account Request Body**:
```json
{
  "email": "user@example.com",
  "confirmation": "DELETE MY ACCOUNT"
}
```

**Important Notes**:
- Cannot delete accounts with pending orders
- Uses "soft delete" approach (anonymization)
- Keeps order history for 7 years (legal/tax requirement)
- Anonymizes all personally identifiable information
- Deletes chat conversations
- Newsletter unsubscribe is automatic

**⚠️ Security Note**: This endpoint requires authentication in production. Users should only be able to delete their own accounts.

## Authentication Requirements

The following endpoints need authentication middleware before production deployment:

1. `/api/gdpr/export-data` - Should verify user identity
2. `/api/gdpr/delete-account` - Should verify user identity

### Recommended Implementation:

```typescript
import { getSession } from '@/lib/auth'; // Your auth library

export async function POST(req: NextRequest) {
  const session = await getSession(req);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  // ... rest of endpoint logic
}
```

## Data Retention Policy

As outlined in the Privacy Policy:

- **Account Data**: 7 years after deletion (anonymized)
- **Transaction Data**: 7 years (legal/tax requirement)
- **Marketing Data**: Until unsubscribe
- **Analytics Data**: 26 months, then anonymized
- **Chat Logs**: Deleted on account deletion

## Email Unsubscribe (CAN-SPAM Compliance)

To ensure CAN-SPAM compliance, all marketing emails must:

1. Include an unsubscribe link
2. Process unsubscribes within 10 business days (we recommend 24 hours)
3. Honor unsubscribe requests permanently

### Implementation:

When a user clicks unsubscribe, update their user record:

```typescript
await prisma.user.update({
  where: { id: userId },
  data: {
    newsletterSubscribed: false
  }
});

// Track the event
await prisma.newsletterAnalytic.create({
  data: {
    userId,
    event: 'unsubscribed',
    metadata: JSON.stringify({ source: 'email_link' })
  }
});
```

## Testing

### Test Cookie Consent:
1. Visit the homepage
2. Clear localStorage
3. Refresh - banner should appear
4. Click Accept/Decline
5. Check localStorage for `cookie-consent`
6. Verify entry in database `Consent` table

### Test Data Export:
```bash
curl -X POST http://localhost:3000/api/gdpr/export-data \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### Test Account Deletion:
```bash
# Check eligibility
curl http://localhost:3000/api/gdpr/delete-account?email=test@example.com

# Delete account
curl -X POST http://localhost:3000/api/gdpr/delete-account \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","confirmation":"DELETE MY ACCOUNT"}'
```

## Compliance Checklist

Before launching:

- [ ] Update all placeholder text in legal pages
- [ ] Add actual company address (required by law)
- [ ] Review all policies with a lawyer
- [ ] Implement authentication for GDPR endpoints
- [ ] Set up email unsubscribe functionality
- [ ] Test cookie consent banner
- [ ] Test data export
- [ ] Test account deletion
- [ ] Configure analytics tools with consent management
- [ ] Add unsubscribe links to all marketing emails
- [ ] Create internal processes for handling GDPR requests
- [ ] Train staff on GDPR compliance
- [ ] Set up data breach notification procedures
- [ ] Document data processing activities
- [ ] Update privacy policy annually or when changes occur

## Additional Recommendations

### 1. Two-Factor Authentication
For sensitive operations like account deletion, consider adding 2FA:

```typescript
// Send confirmation email with unique token
const token = generateSecureToken();
await sendConfirmationEmail(user.email, token);
```

### 2. Audit Logging
Log all GDPR-related actions:

```typescript
await prisma.auditLog.create({
  data: {
    userId,
    action: 'DATA_EXPORT',
    ipAddress: req.ip,
    timestamp: new Date()
  }
});
```

### 3. Data Processing Agreement
If using third-party services (Stripe, SendGrid, etc.), ensure you have Data Processing Agreements (DPAs) in place.

### 4. Regular Audits
- Review data retention policies quarterly
- Audit third-party integrations annually
- Update privacy policies when adding new features
- Test GDPR workflows regularly

## Support & Questions

For questions about this implementation:
- Email: privacy@reluma.com
- Review GDPR.eu for official guidance
- Consult with legal counsel for compliance questions

## Resources

- [GDPR Official Website](https://gdpr.eu/)
- [FTC CAN-SPAM Act](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business)
- [CCPA Official Guide](https://oag.ca.gov/privacy/ccpa)
- [Prisma Documentation](https://www.prisma.io/docs)

---

**Last Updated**: November 15, 2025
