# Analytics Setup Guide

## Google Analytics 4 Integration

This project includes comprehensive Google Analytics 4 (GA4) tracking for user behavior, conversions, and e-commerce events.

### 🎯 Features Implemented

- ✅ **Google Analytics 4** - Automatic page view tracking
- ✅ **E-commerce Tracking** - Add to cart, checkout, purchase events
- ✅ **Conversion Goals** - Form submissions, CTA clicks, newsletter signups
- ✅ **Custom Events** - Button clicks, scroll depth, video plays
- ✅ **UTM Parameters** - Automatic campaign tracking
- ✅ **Social Media Tracking** - Social share and link click tracking
- ✅ **Error Tracking** - Monitor errors and performance issues

---

## 📋 Quick Start

### 1. Create Google Analytics 4 Property

1. Go to [Google Analytics](https://analytics.google.com/)
2. Click **Admin** → **Create Property**
3. Enter property name (e.g., "ReLuma Landing Page")
4. Configure timezone and currency
5. Click **Create**
6. Select **Web** platform
7. Enter your website URL
8. Copy your **Measurement ID** (format: `G-XXXXXXXXXX`)

### 2. Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Measurement ID.

### 3. Verify Installation

1. Start your development server: `npm run dev`
2. Open your website in the browser
3. Open Google Analytics → **Reports** → **Realtime**
4. You should see yourself as an active user

---

## 📊 Tracked Events

### Automatic Events

- **Page Views** - All page navigation
- **Session Start** - User session begins
- **First Visit** - New user visits
- **Scroll** - User scrolling behavior

### Custom E-commerce Events

| Event Name | Description | Parameters |
|------------|-------------|------------|
| `view_item` | User views product | product details, price |
| `add_to_cart` | User adds item to cart | product, quantity, value |
| `remove_from_cart` | User removes item | product, quantity |
| `begin_checkout` | User starts checkout | cart total, items |
| `purchase` | Completed purchase | order ID, total, items |

### Lead Generation Events

| Event Name | Description | Location |
|------------|-------------|----------|
| `form_submit` | Lead form submission | Hero section, footer |
| `newsletter_signup` | Email newsletter signup | Forms |
| `cta_click` | Call-to-action clicks | Hero, final CTA |

### Engagement Events

| Event Name | Description |
|------------|-------------|
| `button_click` | Button interactions |
| `scroll_depth` | How far users scroll |
| `video_play` | Video engagement |
| `outbound_link_click` | External link clicks |
| `share` | Social media shares |

---

## 🎨 Usage Examples

### Track Custom Events

```typescript
import { trackEvent } from '@/lib/analytics';

// Simple event
trackEvent('button_click', {
  button_name: 'Shop Now',
  location: 'navbar',
});
```

### Track E-commerce Events

```typescript
import { trackAddToCart, trackPurchase } from '@/lib/analytics';

// Add to cart
trackAddToCart({
  id: 'reluma-serum',
  name: 'ReLuma Growth Factor Serum',
  price: 89.99,
  category: 'Skincare',
}, 1);

// Purchase
trackPurchase({
  id: 'order_123456',
  total: 89.99,
  tax: 7.20,
  shippingCost: 5.00,
  items: [{
    item_id: 'reluma-serum',
    item_name: 'ReLuma Growth Factor Serum',
    price: 89.99,
    quantity: 1,
  }],
});
```

### Use Analytics Hook in Components

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackCTAClick, trackFormSubmit } = useAnalytics();

  return (
    <button onClick={() => trackCTAClick('buy_now', 'hero')}>
      Buy Now
    </button>
  );
}
```

---

## 🎯 Setting Up Conversion Goals

### In Google Analytics 4:

1. Go to **Admin** → **Events**
2. Click **Create Event** or **Mark as conversion**
3. Create conversions for:
   - `purchase` - E-commerce purchase
   - `form_submit` - Lead generation
   - `newsletter_signup` - Email signups
   - `begin_checkout` - Checkout initiated
   - `cta_click` - Important CTA clicks

### Recommended Conversions

| Conversion Name | Type | Purpose |
|-----------------|------|---------|
| `purchase` | E-commerce | Track revenue |
| `form_submit` | Lead Gen | Track leads |
| `newsletter_signup` | Lead Gen | Email list growth |
| `begin_checkout` | E-commerce | Cart abandonment |

---

## 📈 Custom Dashboard Setup

### Key Metrics to Track

1. **Revenue Metrics**
   - Total revenue (30d)
   - Average order value
   - Conversion rate
   - Revenue per user

2. **User Metrics**
   - New users
   - Returning users
   - Session duration
   - Bounce rate

3. **Lead Generation**
   - Form submissions
   - Newsletter signups
   - CTA click rate

4. **Product Performance**
   - Product views
   - Add to cart rate
   - Cart abandonment rate
   - Purchase completion rate

### Creating Custom Reports

1. Go to **Explore** in GA4
2. Create **Funnel Exploration** for:
   - Homepage → Form Submit → Purchase
   - Product View → Add to Cart → Checkout → Purchase

3. Create **Path Exploration** to see user journeys

---

## 🔗 UTM Parameter Tracking

UTM parameters are automatically tracked. Use this format for marketing campaigns:

```
https://yourdomain.com/?utm_source=facebook&utm_medium=cpc&utm_campaign=summer_sale&utm_content=ad_variant_a
```

### UTM Parameters

| Parameter | Purpose | Example |
|-----------|---------|---------|
| `utm_source` | Traffic source | facebook, google, email |
| `utm_medium` | Marketing medium | cpc, social, email |
| `utm_campaign` | Campaign name | summer_sale, launch |
| `utm_term` | Paid keywords | skincare, anti-aging |
| `utm_content` | Ad variation | ad_a, banner_top |

### Generate UTM Links

Use [Google's Campaign URL Builder](https://ga-dev-tools.google/campaign-url-builder/)

---

## 🧪 A/B Testing Setup

### Using Google Optimize (Free)

1. Create [Google Optimize](https://optimize.google.com/) account
2. Link to your GA4 property
3. Create experiments:
   - Hero headline variations
   - CTA button colors/text
   - Form field combinations
   - Pricing display options

### Testing Framework

The analytics setup supports A/B testing through:
- Custom dimensions
- Event parameters
- User properties

Example:

```typescript
import { trackEvent, setUserProperties } from '@/lib/analytics';

// Assign user to test variant
setUserProperties({
  experiment_variant: 'variant_b',
  experiment_name: 'hero_headline_test',
});

// Track with variant context
trackEvent('cta_click', {
  variant: 'variant_b',
});
```

---

## 🔥 Heat Mapping & Session Recording

### Recommended Tools

1. **Hotjar** (Free tier available)
   - Heat maps
   - Session recordings
   - Feedback polls

2. **Microsoft Clarity** (Completely free)
   - Heat maps
   - Session recordings
   - Rage clicks
   - Dead clicks

### Setup (Hotjar Example)

1. Sign up at [Hotjar](https://www.hotjar.com/)
2. Get your tracking code
3. Add to `components/GoogleAnalytics.tsx`:

```typescript
<Script
  id="hotjar"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `
      (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    `,
  }}
/>
```

---

## 📱 Email Analytics Tracking

### Tracking Newsletter Performance

Add UTM parameters to all email links:

```html
<a href="https://yourdomain.com/?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_digest&utm_content=cta_button">
  Shop Now
</a>
```

### Track Email Signups

Already implemented in `lib/analytics.ts`:

```typescript
import { trackNewsletterSignup } from '@/lib/analytics';

trackNewsletterSignup('hero_form');
```

---

## 🚀 Advanced Features

### Track Scroll Depth

```typescript
import { trackScrollDepth } from '@/lib/analytics';

// Track when user scrolls 50%
trackScrollDepth(50);
```

### Track Video Engagement

```typescript
import { trackVideoPlay } from '@/lib/analytics';

trackVideoPlay('product_demo_video');
```

### Track Search Queries

```typescript
import { trackSearch } from '@/lib/analytics';

trackSearch('anti-aging serum');
```

### Error Tracking

```typescript
import { trackError } from '@/lib/analytics';

try {
  // Your code
} catch (error) {
  trackError(error.message, 'checkout_error');
}
```

---

## 📊 Reporting Schedule

### Automated Reports

Set up in GA4:

1. Go to **Library** → **Scheduled Reports**
2. Create weekly reports for:
   - Revenue & conversions
   - User acquisition
   - Top products
   - Form submissions

### Recommended Frequency

- **Daily**: Revenue, conversions (sent to email)
- **Weekly**: Full performance report
- **Monthly**: Comprehensive analysis with trends

---

## 🔒 Privacy & GDPR Compliance

### Cookie Consent

To comply with GDPR/CCPA, implement cookie consent:

```typescript
// Only load GA after consent
if (userConsent) {
  // Load GA4
}
```

### Anonymize IP Addresses

Already configured in GA4 setup.

### Data Retention

Configure in GA4:
1. **Admin** → **Data Settings** → **Data Retention**
2. Set to 14 months (recommended)

---

## 🛠️ Troubleshooting

### Analytics Not Working?

1. ✅ Check `.env.local` has correct `NEXT_PUBLIC_GA_ID`
2. ✅ Verify Measurement ID format: `G-XXXXXXXXXX`
3. ✅ Check browser console for errors
4. ✅ Disable ad blockers during testing
5. ✅ Use GA4 DebugView for real-time testing

### Testing in Development

Enable GA in development:

```typescript
// components/GoogleAnalytics.tsx
if (!GA_ID || process.env.NODE_ENV === 'development') {
  return null; // Remove this condition to test in dev
}
```

### Debug Mode

```typescript
trackEvent('test_event', {
  debug_mode: true,
});
```

---

## 📚 Resources

- [GA4 Documentation](https://support.google.com/analytics/answer/10089681)
- [E-commerce Events Reference](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [UTM Best Practices](https://support.google.com/analytics/answer/1033863)
- [Google Tag Assistant](https://tagassistant.google.com/)

---

## ✅ Checklist

- [ ] Created GA4 property
- [ ] Added Measurement ID to `.env.local`
- [ ] Verified tracking in GA4 Realtime
- [ ] Set up conversion events
- [ ] Created custom dashboard
- [ ] Configured UTM campaigns
- [ ] Set up automated reports
- [ ] Tested all tracking events
- [ ] Added cookie consent (if required)
- [ ] Documented for team

---

**Questions?** Check the [Google Analytics Help Center](https://support.google.com/analytics) or contact your analytics team.
