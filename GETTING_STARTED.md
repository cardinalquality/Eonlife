# Getting Started with Eonlife E-Commerce Platform

This guide walks you through setting up the Eonlife e-commerce platform from scratch. Follow these steps to get your development environment running.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Initial Setup](#initial-setup)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Next Steps](#next-steps)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** 18+ ([Download](https://nodejs.org/))
  ```bash
  # Verify installation
  node --version  # Should show v18 or higher
  npm --version   # Should show v9 or higher
  ```

- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/)) OR a [Supabase](https://supabase.com) account (recommended for quick setup)

- **Git** ([Download](https://git-scm.com/downloads))
  ```bash
  git --version
  ```

### Recommended
- **Visual Studio Code** or your preferred code editor
- **PostgreSQL client** (`psql`) for database operations
- **Stripe Account** (for payment processing) - [Sign up](https://stripe.com)

---

## Initial Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd Eonlife

# Verify you're in the right directory
ls -la  # Should see package.json, app/, components/, etc.
```

### 2. Install Dependencies

```bash
# Install Node.js dependencies
npm install

# This will install:
# - Next.js 16, React 19, TypeScript
# - Prisma ORM, Stripe SDK
# - Tailwind CSS v4
# - And all other dependencies
```

**Expected output:**
```
added XXX packages in XXs
```

---

## Environment Configuration

### 1. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env.local
```

### 2. Configure Essential Variables

Open `.env.local` in your editor and configure these **required** variables:

#### Basic Configuration
```bash
# Application settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000
```

#### Database Configuration
Choose **ONE** of the following options:

**Option A: Supabase (Recommended for quick start)**
```bash
# Get from Supabase Dashboard > Project Settings > Database
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[PROJECT_ID].supabase.co:5432/postgres
```

**Option B: Local PostgreSQL**
```bash
# Local PostgreSQL connection
DATABASE_URL=postgresql://postgres:password@localhost:5432/eonlife_db
```

#### Payment Configuration (Stripe)
```bash
# Get from Stripe Dashboard > Developers > API Keys
# Use TEST keys for development
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Get from Stripe Dashboard > Developers > Webhooks
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Optional Configuration

Configure these based on features you want to enable:

#### Analytics (Optional)
```bash
# Google Analytics 4
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX  # From analytics.google.com

# Other analytics
MIXPANEL_TOKEN=your-token
```

#### Email Service (Optional)
```bash
# SendGrid for transactional emails
SENDGRID_API_KEY=your-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Brand

# Mailchimp for newsletters
MAILCHIMP_API_KEY=your-api-key
MAILCHIMP_AUDIENCE_ID=your-audience-id
MAILCHIMP_SERVER_PREFIX=us1
```

#### Security (Optional but recommended for production)
```bash
# API Secret (generate with: openssl rand -base64 32)
API_SECRET=your-secret-key-here

# Rate Limiting with Upstash Redis
UPSTASH_REDIS_URL=your-redis-url
UPSTASH_REDIS_TOKEN=your-redis-token
```

---

## Database Setup

### Option 1: Supabase Database (Recommended)

#### Step 1: Create Supabase Project
1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login and click "New Project"
3. Fill in project details:
   - **Project Name**: Eonlife
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is sufficient for development

#### Step 2: Get Connection String
1. In Supabase Dashboard, go to **Project Settings** > **Database**
2. Copy the **Connection string** (URI format)
3. Replace `[YOUR-PASSWORD]` with your database password
4. Add to `.env.local` as `DATABASE_URL`

#### Step 3: Initialize Database Schema
```bash
# Install psql if not already installed (macOS)
brew install postgresql

# Connect to Supabase database
psql "postgresql://postgres:[PASSWORD]@[PROJECT-ID].supabase.co:5432/postgres"

# In psql console, run migrations
\i database/migrations/001_create_schema.sql

# Seed initial data
\i database/seeds/001_seed_data.sql

# Verify setup
SELECT COUNT(*) as product_count FROM products;
# Should return count > 0

# Exit psql
\q
```

**Alternative: Using Supabase SQL Editor**
1. Go to Supabase Dashboard > **SQL Editor**
2. Click **New Query**
3. Copy and paste contents of `database/migrations/001_create_schema.sql`
4. Click **Run**
5. Repeat for `database/seeds/001_seed_data.sql`

### Option 2: Local PostgreSQL

#### Step 1: Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Step 2: Create Database
```bash
# Create database user (if needed)
sudo -u postgres createuser -s $USER

# Create database
createdb eonlife_db

# Verify
psql -l  # Should list eonlife_db
```

#### Step 3: Initialize Schema
```bash
# Run migrations
psql -d eonlife_db -f database/migrations/001_create_schema.sql

# Seed data
psql -d eonlife_db -f database/seeds/001_seed_data.sql

# Verify
psql -d eonlife_db -c "SELECT COUNT(*) FROM products;"
```

### Using Prisma ORM

The project includes Prisma ORM alongside custom SQL. To set up Prisma:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (alternative to SQL migrations)
npx prisma db push

# Open Prisma Studio to view data
npx prisma studio
# Opens at http://localhost:5555
```

---

## Running the Application

### 1. Start Development Server

```bash
npm run dev
```

**Expected output:**
```
▲ Next.js 16.0.3
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000

✓ Ready in XXXms
```

### 2. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000)

You should see the Eonlife landing page.

### 3. Development Tips

**Hot Reload**: Changes to code automatically refresh the page

**Available Scripts:**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run ESLint
npm run prisma       # Prisma CLI commands
npm run db:push      # Push Prisma schema to database
npm run db:migrate   # Run Prisma migrations
```

---

## Verification

Verify your setup by checking these key areas:

### 1. Homepage Loads
- Visit http://localhost:3000
- Should see landing page with product information

### 2. Database Connection
```bash
# Test database query
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT COUNT(*) FROM products').then(r => {
  console.log('✓ Database connected. Products:', r.rows[0].count);
  process.exit(0);
}).catch(e => {
  console.error('✗ Database error:', e.message);
  process.exit(1);
});
"
```

### 3. API Endpoints

Test key API endpoints:

**Products API:**
```bash
curl http://localhost:3000/api/products/1
# Should return product JSON
```

**Newsletter API:**
```bash
curl -X POST http://localhost:3000/api/newsletter \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
# Should return success response
```

### 4. Stripe Integration
- Visit the checkout page
- Stripe elements should load (card input fields)
- Use test card: `4242 4242 4242 4242`

### 5. Check Browser Console
- Open Developer Tools (F12)
- Console tab should have no errors
- Network tab should show successful API requests

---

## Next Steps

Now that your development environment is running:

### 1. Explore the Codebase
- **Landing Pages**: See [README.md](README.md) for template system
- **Database Schema**: See [DATABASE.md](DATABASE.md)
- **Security**: See [SECURITY.md](SECURITY.md)
- **Payments**: See [PAYMENT_INTEGRATION.md](PAYMENT_INTEGRATION.md)
- **API Routes**: See [API.md](API.md) (if available)

### 2. Configure Products
- Review product configurations in `products/` directory
- See [PRODUCT_SETUP.md](PRODUCT_SETUP.md) for adding new products

### 3. Set Up Analytics
- Configure Google Analytics in `.env.local`
- See [docs/ANALYTICS_SETUP.md](docs/ANALYTICS_SETUP.md)

### 4. Customize Your Site
- Update landing page content in `templates/option1/config.ts`
- Modify styles in `app/globals.css`
- See [QUICK_START.md](QUICK_START.md) for customization guide

### 5. Prepare for Production
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions
- Review [SECURITY.md](SECURITY.md) for production security checklist

---

## Troubleshooting

### Common Issues

#### "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Database connection fails
```bash
# Verify DATABASE_URL is correct
echo $DATABASE_URL

# Test PostgreSQL connection
psql "$DATABASE_URL" -c "SELECT 1;"

# Check if PostgreSQL is running
pg_isready
```

#### Port 3000 already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill

# Or run on different port
PORT=3001 npm run dev
```

#### Prisma errors
```bash
# Regenerate Prisma client
npx prisma generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset
```

#### Build errors
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

#### Stripe webhook issues (local development)
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy webhook signing secret to .env.local
# STRIPE_WEBHOOK_SECRET=whsec_...
```

### Environment Variable Issues

If features aren't working:
1. **Check `.env.local` exists** in project root
2. **Verify variable names** match `.env.example`
3. **Restart dev server** after changing env vars
4. **Check for typos** in variable values
5. **Quote special characters** in bash/terminal

### Still Having Issues?

1. Check the [GitHub Issues](../../issues) page
2. Review specific documentation:
   - [DATABASE.md](DATABASE.md) - Database issues
   - [SECURITY.md](SECURITY.md) - Security setup
   - [PAYMENT_INTEGRATION.md](PAYMENT_INTEGRATION.md) - Stripe issues
3. Enable debug logging:
   ```bash
   DEBUG=* npm run dev
   ```

---

## Quick Reference

### File Structure
```
Eonlife/
├── app/                    # Next.js app (pages, API routes)
├── components/             # React components
├── lib/                    # Utilities, database, services
├── database/               # SQL migrations and seeds
├── prisma/                 # Prisma schema
├── products/               # Product configurations
├── templates/              # Landing page templates
├── public/                 # Static assets
├── .env.local             # Your environment variables (create this!)
└── .env.example           # Template for environment variables
```

### Key Commands
```bash
npm install                 # Install dependencies
npm run dev                # Start development
npm run build              # Build for production
npm start                  # Run production build
npx prisma studio          # Database GUI
npx prisma generate        # Generate Prisma client
```

### Key Files to Configure
- `.env.local` - Environment variables
- `templates/option1/config.ts` - Landing page content
- `app/globals.css` - Global styles
- `config/providers.config.ts` - Analytics, email providers

---

**Ready to build!** Start with [QUICK_START.md](QUICK_START.md) for customization tips.
