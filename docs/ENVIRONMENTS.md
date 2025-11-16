# Environment Setup Guide

This guide explains how to set up and manage different environments (development, staging, production) for the Eonlife e-commerce platform.

## Table of Contents

- [Overview](#overview)
- [Environment Files](#environment-files)
- [Development Environment](#development-environment)
- [Staging Environment](#staging-environment)
- [Production Environment](#production-environment)
- [Database Management](#database-management)
- [Vercel Deployment](#vercel-deployment)
- [Testing Different Environments](#testing-different-environments)
- [Troubleshooting](#troubleshooting)

## Overview

The application supports three distinct environments:

| Environment | Purpose | Database | Stripe Keys | Analytics |
|-------------|---------|----------|-------------|-----------|
| **Development** | Local development | Local PostgreSQL or dev DB | Test keys | Disabled |
| **Staging** | Pre-production testing | Staging database | Test keys | Separate property |
| **Production** | Live site | Production database | Live keys | Production property |

## Environment Files

The project includes three environment template files:

- `.env.development` - Development environment configuration
- `.env.staging` - Staging environment configuration
- `.env.production` - Production environment configuration

These files are **committed to the repository** as templates. Your actual environment variables should be stored in:

- `.env.local` - Local development (not committed)
- Hosting provider's environment variables (Vercel, Railway, etc.)

### Security Note

⚠️ **Never commit actual secrets to git!**

- `.env.local` is automatically ignored by git
- Use your hosting provider's secret management for staging/production
- The template files (`.env.development`, etc.) contain placeholder values only

## Development Environment

### Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up development database:**
   ```bash
   npm run setup:dev
   ```

   This script will:
   - Create a local PostgreSQL database
   - Update your `.env.local` file with the database URL
   - Run Prisma migrations

3. **Copy environment template (alternative method):**
   ```bash
   npm run env:dev
   # This copies .env.development to .env.local
   ```

4. **Update your `.env.local` file with actual values:**
   - Add your Stripe test keys
   - Configure email service (optional)
   - Set up OAuth providers (optional)

5. **Start the development server:**
   ```bash
   npm run dev
   ```

### Manual Database Setup

If you prefer to set up the database manually:

1. **Create a PostgreSQL database:**
   ```bash
   createdb eonlife_dev
   ```

2. **Update `.env.local`:**
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/eonlife_dev
   ```

3. **Run migrations:**
   ```bash
   npm run db:push
   ```

### Development Features

- **Hot reloading** - Changes are reflected immediately
- **In-memory rate limiting** - No Redis required
- **Stripe test mode** - Use test credit cards
- **Email testing** - Use Mailtrap.io or Ethereal.email
- **Debug logging** - Verbose console output

## Staging Environment

Staging is a production-like environment for testing before deploying to production.

### Setting Up Staging

1. **Create a staging database:**

   Choose a cloud database provider:
   - [Supabase](https://supabase.com) (Recommended - free tier)
   - [Vercel Postgres](https://vercel.com/storage/postgres)
   - [Railway](https://railway.app)
   - [Neon](https://neon.tech)

2. **Run the staging setup script:**
   ```bash
   npm run setup:staging
   ```

   This will:
   - Prompt you for the database URL
   - Update `.env.staging`
   - Test the database connection
   - Optionally run migrations

3. **Deploy to Vercel (Staging):**
   ```bash
   # Install Vercel CLI if needed
   npm i -g vercel

   # Deploy to staging (preview)
   vercel

   # Add environment variables
   vercel env add DATABASE_URL
   vercel env add STRIPE_SECRET_KEY
   vercel env add STRIPE_WEBHOOK_SECRET
   vercel env add NEXTAUTH_SECRET
   vercel env add API_SECRET
   ```

4. **Configure Stripe webhooks:**
   - Go to Stripe Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-staging-url.vercel.app/api/webhooks/stripe`
   - Use **test mode** webhook secret
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`, etc.

### Staging Best Practices

- ✅ Always use Stripe **test mode** in staging
- ✅ Use separate analytics properties (GA, Sentry, etc.)
- ✅ Use test email recipient lists
- ✅ Keep staging database separate from production
- ✅ Test all features thoroughly before production deploy
- ❌ Never use production API keys in staging
- ❌ Don't send real emails to customers from staging

## Production Environment

### Pre-Production Checklist

Before deploying to production:

- [ ] All tests passing
- [ ] Staging environment thoroughly tested
- [ ] Database migrations tested in staging
- [ ] Stripe live keys configured
- [ ] SSL certificate configured
- [ ] Domain configured
- [ ] Analytics configured
- [ ] Error monitoring (Sentry) configured
- [ ] Email service configured with real domain
- [ ] Rate limiting configured (Upstash Redis)
- [ ] Backup strategy in place

### Production Deployment

1. **Create production database:**
   - Use a production-grade database (Supabase Pro, Railway, etc.)
   - Enable automatic backups
   - Set up connection pooling
   - Configure monitoring

2. **Deploy to Vercel (Production):**
   ```bash
   # Deploy to production
   vercel --prod

   # Add production environment variables
   vercel env add DATABASE_URL production
   vercel env add STRIPE_SECRET_KEY production
   vercel env add STRIPE_WEBHOOK_SECRET production
   vercel env add NEXTAUTH_SECRET production
   vercel env add API_SECRET production
   vercel env add UPSTASH_REDIS_URL production
   vercel env add UPSTASH_REDIS_TOKEN production
   ```

3. **Generate production secrets:**
   ```bash
   # Generate secure secrets
   openssl rand -base64 32  # For NEXTAUTH_SECRET
   openssl rand -base64 32  # For API_SECRET
   ```

4. **Configure Stripe production webhooks:**
   - Go to Stripe Dashboard → Switch to **Live mode**
   - Developers → Webhooks
   - Add endpoint: `https://eonlife.com/api/webhooks/stripe`
   - Use **live mode** webhook secret
   - Copy the webhook secret to Vercel environment variables

5. **Run production migrations:**
   ```bash
   # Connect to production database
   DATABASE_URL="your-production-url" npm run db:migrate:deploy
   ```

### Production Monitoring

- **Vercel Analytics** - Monitor performance
- **Sentry** - Error tracking and monitoring
- **Google Analytics** - User behavior tracking
- **Stripe Dashboard** - Payment monitoring
- **Database monitoring** - Query performance, connections

## Database Management

### Database Scripts

| Command | Description |
|---------|-------------|
| `npm run db:push` | Push schema changes (development) |
| `npm run db:migrate` | Create and apply migrations (development) |
| `npm run db:migrate:deploy` | Apply migrations (production/staging) |
| `npm run db:studio` | Open Prisma Studio (database GUI) |
| `npm run setup:dev` | Set up development database |
| `npm run setup:staging` | Set up staging database |

### Creating Migrations

```bash
# 1. Make changes to prisma/schema.prisma
# 2. Create a migration
npm run db:migrate
# Enter a descriptive name when prompted

# 3. Test the migration
npm run dev

# 4. Commit the migration files
git add prisma/migrations
git commit -m "Add migration for [feature]"
```

### Applying Migrations

**Development:**
```bash
npm run db:migrate
```

**Staging/Production:**
```bash
DATABASE_URL="your-staging-url" npm run db:migrate:deploy
```

### Database Backup

**Development:**
```bash
pg_dump eonlife_dev > backup.sql
```

**Production:**
- Use your database provider's backup tools
- Supabase: Automatic daily backups
- Railway: CLI backup commands
- Vercel Postgres: Automatic backups

## Vercel Deployment

### Project Setup

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Link your project:**
   ```bash
   vercel link
   ```

3. **Configure environments:**
   - Production: `vercel --prod`
   - Preview (Staging): `vercel` (default)
   - Development: `vercel dev`

### Environment Variables

Set environment variables for each environment:

```bash
# For production only
vercel env add VARIABLE_NAME production

# For preview (staging) only
vercel env add VARIABLE_NAME preview

# For development only
vercel env add VARIABLE_NAME development

# For all environments
vercel env add VARIABLE_NAME
```

### Automatic Deployments

**GitHub Integration:**

1. Connect your repository to Vercel
2. Configure branch deployments:
   - `main` branch → Production
   - Other branches → Preview (staging)
3. Environment variables are automatically applied

**Preview Deployments:**

Every pull request automatically gets a preview deployment with staging configuration.

### Custom Domains

**Production:**
```bash
vercel domains add eonlife.com
vercel domains add www.eonlife.com
```

**Staging:**
```bash
vercel domains add staging.eonlife.com
```

## Testing Different Environments

### Local Testing

Test each environment configuration locally:

```bash
# Test development config
npm run env:dev
npm run dev

# Test staging config (local)
npm run env:staging
npm run dev

# Test production config (local) - BE CAREFUL!
npm run env:production
npm run dev
```

⚠️ **Warning:** When testing production config locally, make sure to use test Stripe keys and a separate database!

### Environment Detection

The application automatically detects the environment based on:

1. `NEXT_PUBLIC_ENVIRONMENT` variable (explicit override)
2. `NEXT_PUBLIC_APP_URL` (URL-based detection)
3. `NODE_ENV` (fallback)

You can check the current environment in your code:

```typescript
import { appConfig } from '@/config/app.config';

console.log(appConfig.environment); // 'development' | 'staging' | 'production'
console.log(appConfig.isDevelopment); // boolean
console.log(appConfig.isStaging); // boolean
console.log(appConfig.isProduction); // boolean
```

### Testing Product Availability

To test product availability and database features across environments:

1. **Development:**
   ```bash
   # Add test products to local database
   npm run db:studio
   # Use Prisma Studio to add test data
   ```

2. **Staging:**
   - Deploy to staging
   - Use Stripe test mode to create products
   - Test checkout flow with test cards (4242 4242 4242 4242)
   - Verify database updates

3. **Production:**
   - Use Stripe live mode (real cards required)
   - Monitor with Stripe Dashboard
   - Check real-time database updates

## Troubleshooting

### Common Issues

**Database Connection Failed:**
```bash
# Check if PostgreSQL is running
pg_isready

# Check database exists
psql -l | grep eonlife

# Test connection
psql postgresql://user:password@localhost:5432/eonlife_dev
```

**Prisma Client Out of Sync:**
```bash
# Regenerate Prisma Client
npx prisma generate
```

**Environment Variables Not Loading:**
```bash
# Make sure .env.local exists
ls -la .env.local

# Check file is not empty
cat .env.local

# Restart dev server
npm run dev
```

**Stripe Webhook Verification Failed:**
- Check that `STRIPE_WEBHOOK_SECRET` matches your webhook configuration
- In development, use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Verify webhook endpoint URL in Stripe Dashboard

**Migration Failed:**
```bash
# Reset database (development only!)
npx prisma migrate reset

# Or manually:
dropdb eonlife_dev
createdb eonlife_dev
npm run db:migrate
```

### Getting Help

- **Next.js Issues:** https://github.com/vercel/next.js/discussions
- **Prisma Issues:** https://github.com/prisma/prisma/discussions
- **Stripe Issues:** https://support.stripe.com
- **Vercel Issues:** https://vercel.com/support

## Summary

### Quick Reference

**Development:**
```bash
npm run setup:dev  # One-time setup
npm run dev        # Start development server
```

**Staging:**
```bash
npm run setup:staging  # One-time setup
vercel                 # Deploy to preview
```

**Production:**
```bash
vercel --prod  # Deploy to production
```

### File Structure

```
Eonlife/
├── .env.development      # Development template (committed)
├── .env.staging          # Staging template (committed)
├── .env.production       # Production template (committed)
├── .env.local            # Your local config (not committed)
├── .env.example          # General template (committed)
├── scripts/
│   ├── setup-dev-db.sh   # Dev database setup
│   └── setup-staging-db.sh # Staging database setup
├── docs/
│   └── ENVIRONMENTS.md   # This file
└── vercel.json           # Vercel configuration
```

---

**Last Updated:** 2025-01-16
