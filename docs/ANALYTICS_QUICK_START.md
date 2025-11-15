# Analytics Quick Start

## ⚡ Get Started in 5 Minutes

### Step 1: Get Your GA4 Measurement ID

1. Go to https://analytics.google.com/
2. Create a new GA4 property (or use existing)
3. Copy your Measurement ID (format: `G-XXXXXXXXXX`)

### Step 2: Add to Environment Variables

Create `.env.local` in project root:

```bash
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Step 3: Build and Deploy

```bash
npm run build
npm start
```

### Step 4: Verify Tracking

1. Visit your website
2. Open Google Analytics → Reports → Realtime
3. You should see active users!

---

## 📊 What's Already Tracked?

✅ **Page views** - Automatic
✅ **Form submissions** - Hero lead form
✅ **CTA clicks** - All "Buy Now" and "Shop Now" buttons
✅ **Social shares** - Footer social media links
✅ **Newsletter signups** - Email capture forms

---

## 🎯 Quick Usage

### In Any Component

```typescript
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const { trackCTAClick } = useAnalytics();

  return (
    <button onClick={() => trackCTAClick('my_button', 'my_section')}>
      Click Me
    </button>
  );
}
```

### Track E-commerce Events

```typescript
import { trackAddToCart } from '@/lib/analytics';

trackAddToCart({
  id: 'product-123',
  name: 'ReLuma Serum',
  price: 89.99,
}, 1);
```

---

## 🔥 Next Steps

1. **Set up conversions** - Mark important events as conversions in GA4
2. **Create custom dashboard** - Build reports for key metrics
3. **Add heat mapping** - Install Hotjar or Microsoft Clarity
4. **UTM campaigns** - Track marketing campaign performance

See [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md) for complete documentation.

---

## ❓ Troubleshooting

**Not seeing data?**
- Check `.env.local` has correct Measurement ID
- Disable ad blockers
- Wait 24-48 hours for data to appear in standard reports (use Realtime for instant verification)

**Testing locally?**
- GA4 is disabled in development by default
- Deploy to production/staging to test

---

## 📚 Available Tracking Functions

| Function | Purpose |
|----------|---------|
| `trackEvent()` | Custom events |
| `trackCTAClick()` | CTA button clicks |
| `trackFormSubmit()` | Form submissions |
| `trackAddToCart()` | Add to cart |
| `trackPurchase()` | Completed purchases |
| `trackNewsletterSignup()` | Email signups |
| `trackScrollDepth()` | Scroll tracking |
| `trackSocialShare()` | Social media clicks |

All functions are in `/lib/analytics.ts`

---

**Need help?** See full documentation in [ANALYTICS_SETUP.md](./ANALYTICS_SETUP.md)
