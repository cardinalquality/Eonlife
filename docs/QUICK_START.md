# Quick Start Guide

Get started with Eonlife in different environments quickly.

## Development Environment (Local)

### Option 1: Automated Setup (Recommended)

```bash
# 1. Install dependencies
npm install

# 2. Run the automated setup script
npm run setup:dev

# 3. Start the development server
npm run dev
```

The setup script will:
- Create a local PostgreSQL database (`eonlife_dev`)
- Generate a `.env.local` file with the database URL
- Run Prisma migrations

### Option 2: Manual Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
npm run env:dev
# This creates .env.local from .env.development

# 3. Create local database
createdb eonlife_dev

# 4. Update .env.local with your database URL
# DATABASE_URL=postgresql://postgres:password@localhost:5432/eonlife_dev

# 5. Run migrations
npm run db:push

# 6. Start development server
npm run dev
```

### Required Setup for Full Features

For complete functionality, update your `.env.local` file with:

**Stripe (Test Mode):**
```env
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Get test keys from: https://dashboard.stripe.com/test/apikeys

**Email (Optional - for testing):**
```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_username
SMTP_PASSWORD=your_password
```

Sign up for free at: https://mailtrap.io

### Testing with Stripe

1. **Start local webhook forwarding:**
   ```bash
   # Install Stripe CLI
   brew install stripe/stripe-cli/stripe
   # or: scoop install stripe

   # Forward webhooks to local server
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. **Use test credit cards:**
   - Success: `4242 4242 4242 4242`
   - Requires authentication: `4000 0025 0000 3155`
   - Declined: `4000 0000 0000 9995`
   - Any future date, any 3-digit CVC

## Staging Environment

### 1. Create a Staging Database

Choose a provider:
- **Supabase** (Free tier): https://supabase.com
- **Vercel Postgres**: https://vercel.com/storage/postgres
- **Railway**: https://railway.app
- **Neon**: https://neon.tech

### 2. Configure Staging

```bash
# Run the staging setup script
npm run setup:staging

# Follow the prompts to enter your database URL
```

### 3. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview (staging)
vercel

# Add environment variables
vercel env add DATABASE_URL preview
vercel env add STRIPE_SECRET_KEY preview
vercel env add STRIPE_WEBHOOK_SECRET preview
vercel env add NEXTAUTH_SECRET preview
vercel env add API_SECRET preview
```

### 4. Configure Stripe Webhook

1. Go to https://dashboard.stripe.com/test/webhooks
2. Add endpoint: `https://your-preview-url.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the webhook secret
5. Add to Vercel: `vercel env add STRIPE_WEBHOOK_SECRET preview`

## Production Environment

### Pre-Deployment Checklist

- [ ] All features tested in staging
- [ ] Database migrations tested
- [ ] Production database created with backups enabled
- [ ] Stripe live mode keys obtained
- [ ] Domain configured
- [ ] SSL certificate configured (automatic with Vercel)
- [ ] Analytics configured (Google Analytics, Sentry)
- [ ] Email service configured with real domain
- [ ] Rate limiting configured (Upstash Redis)

### Production Deployment

```bash
# 1. Generate production secrets
openssl rand -base64 32  # For NEXTAUTH_SECRET
openssl rand -base64 32  # For API_SECRET

# 2. Deploy to production
vercel --prod

# 3. Add production environment variables
vercel env add DATABASE_URL production
vercel env add STRIPE_SECRET_KEY production  # Use LIVE key!
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add NEXTAUTH_SECRET production
vercel env add API_SECRET production
vercel env add UPSTASH_REDIS_URL production
vercel env add UPSTASH_REDIS_TOKEN production

# 4. Configure custom domain
vercel domains add yourdomain.com
vercel domains add www.yourdomain.com
```

### Stripe Production Setup

1. Switch to **Live mode** in Stripe Dashboard
2. Get live API keys from: https://dashboard.stripe.com/apikeys
3. Configure webhook: `https://yourdomain.com/api/webhooks/stripe`
4. **Important:** Use the live webhook secret, not test!

### Rate Limiting (Required for Production)

Sign up for Upstash Redis (free tier available):

1. Go to https://upstash.com
2. Create a Redis database
3. Copy the `UPSTASH_REDIS_URL` and `UPSTASH_REDIS_TOKEN`
4. Add to Vercel production environment

## Common Tasks

### View Database

```bash
# Open Prisma Studio (database GUI)
npm run db:studio
```

### Add Test Data

Use Prisma Studio or create a seed script:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Add test products, customers, etc.
  await prisma.customer.create({
    data: {
      email: 'test@example.com',
      name: 'Test Customer',
    },
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Then run:
```bash
npm run db:seed
```

### Switch Environments Locally

```bash
# Switch to development config
npm run env:dev

# Switch to staging config
npm run env:staging

# Switch to production config (be careful!)
npm run env:production
```

### Test Product Availability

1. **Add products via Stripe Dashboard:**
   - Go to Products in Stripe Dashboard
   - Create a product with pricing
   - Copy the price ID

2. **Test checkout flow:**
   - Navigate to product page
   - Click "Buy Now"
   - Complete checkout with test card (dev/staging) or real card (production)

3. **Verify in database:**
   ```bash
   npm run db:studio
   # Check Orders and PaymentEvents tables
   ```

## Troubleshooting

### PostgreSQL Not Found

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql-14
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### Port Already in Use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### Database Migration Issues

```bash
# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# Or create new migration
npm run db:migrate
```

### Stripe Webhook Issues

**Development:**
```bash
# Use Stripe CLI to forward webhooks
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Test webhook
stripe trigger checkout.session.completed
```

**Staging/Production:**
- Verify webhook URL is correct in Stripe Dashboard
- Check webhook secret matches environment variable
- View webhook logs in Stripe Dashboard

## Next Steps

- Read the [Full Environment Guide](./ENVIRONMENTS.md)
- Check the [API Documentation](../README.md)
- Review [Prisma Schema](../prisma/schema.prisma)
- Configure [Analytics](./ANALYTICS.md) (if available)

## Getting Help

- **Next.js:** https://nextjs.org/docs
- **Prisma:** https://www.prisma.io/docs
- **Stripe:** https://stripe.com/docs
- **Vercel:** https://vercel.com/docs

---

**Quick Links:**
- [Stripe Test Cards](https://stripe.com/docs/testing#cards)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Prisma Studio](https://www.prisma.io/studio)
