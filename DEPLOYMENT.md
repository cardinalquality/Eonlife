# Deployment Guide

Complete guide for deploying the Eonlife e-commerce platform to production.

## Table of Contents
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
  - [Vercel (Recommended)](#vercel-recommended)
  - [Netlify](#netlify)
  - [Docker](#docker)
  - [Traditional VPS](#traditional-vps)
- [Database Deployment](#database-deployment)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)
- [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, ensure you have:

### ✅ Code & Configuration
- [ ] All code committed to Git repository
- [ ] `.env.local` is in `.gitignore` (never commit secrets!)
- [ ] Production environment variables documented
- [ ] Database migrations tested
- [ ] Build succeeds locally: `npm run build`

### ✅ Services & Accounts
- [ ] Production database (Supabase, AWS RDS, etc.)
- [ ] Stripe account in production mode
- [ ] Email service configured (SendGrid, etc.)
- [ ] Analytics setup (Google Analytics)
- [ ] Domain name purchased and DNS ready
- [ ] SSL/TLS certificate (auto with Vercel/Netlify)

### ✅ Security
- [ ] API secrets generated and secure
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] CORS settings reviewed
- [ ] Security headers configured
- [ ] Stripe webhook secrets configured

### ✅ Testing
- [ ] All pages load without errors
- [ ] Checkout flow works end-to-end
- [ ] Payment processing tested with Stripe test mode
- [ ] Forms submit successfully
- [ ] Mobile responsiveness verified
- [ ] SEO metadata configured

---

## Environment Setup

### Production Environment Variables

Create production environment variables. **Never commit these to Git!**

#### Required Variables

```bash
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com

# Database (Production)
DATABASE_URL=postgresql://user:password@host:5432/eonlife_production

# Stripe (Production Keys)
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Security
API_SECRET=<generate-with-openssl-rand-base64-32>

# Email (Production)
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Brand

# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### Optional but Recommended

```bash
# Rate Limiting (Production)
UPSTASH_REDIS_URL=https://xxx.upstash.io
UPSTASH_REDIS_TOKEN=xxx

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_AUTH_TOKEN=xxx

# Mailchimp Newsletter
MAILCHIMP_API_KEY=xxx
MAILCHIMP_AUDIENCE_ID=xxx
MAILCHIMP_SERVER_PREFIX=us1
```

### Generate Secure Secrets

```bash
# API Secret
openssl rand -base64 32

# Generate multiple secrets
for i in {1..3}; do openssl rand -base64 32; done
```

---

## Deployment Options

## Vercel (Recommended)

Vercel is the easiest deployment option for Next.js applications.

### Why Vercel?
- ✅ Zero configuration for Next.js
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN
- ✅ Automatic deployments from Git
- ✅ Built-in analytics and monitoring
- ✅ Free tier available

### Step-by-Step Deployment

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Login to Vercel

```bash
vercel login
```

#### 3. Deploy from Project Directory

```bash
# Navigate to project root
cd /path/to/Eonlife

# Deploy (first time)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Your account/team
# - Link to existing project? No
# - Project name? eonlife (or your choice)
# - Directory? ./ (default)
# - Override settings? No
```

#### 4. Configure Environment Variables

**Option A: Via Vercel Dashboard**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add each variable:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = `postgresql://...`
   - `STRIPE_SECRET_KEY` = `sk_live_...`
   - etc. (see [Environment Setup](#environment-setup))

**Option B: Via CLI**
```bash
# Add single variable
vercel env add DATABASE_URL production

# Paste value when prompted
# Repeat for each variable
```

#### 5. Deploy to Production

```bash
# Deploy to production
vercel --prod

# Or use deployment URL from dashboard
```

#### 6. Configure Custom Domain

**In Vercel Dashboard:**
1. Go to **Settings** > **Domains**
2. Add your domain: `yourdomain.com`
3. Follow DNS configuration instructions
4. Add DNS records:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
5. Wait for DNS propagation (up to 48 hours, usually <1 hour)

#### 7. Configure Stripe Webhook

**Production Webhook URL:**
```
https://yourdomain.com/api/webhooks/stripe
```

1. Go to [Stripe Dashboard](https://dashboard.stripe.com) > **Developers** > **Webhooks**
2. Click **Add endpoint**
3. Enter URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy **Signing secret** (starts with `whsec_`)
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

#### 8. Verify Deployment

```bash
# Test homepage
curl https://yourdomain.com

# Test API endpoint
curl https://yourdomain.com/api/products/reluma-serum

# Test in browser
open https://yourdomain.com
```

### Automatic Deployments

Vercel automatically deploys when you push to Git:

```bash
# Push to main branch
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically builds and deploys
# Check dashboard for deployment status
```

### Vercel Best Practices

**Environment Variables:**
- Use different values for Preview and Production
- Never hardcode secrets in code

**Database Connections:**
- Use connection pooling for Prisma
- Set connection limits in DATABASE_URL

**Performance:**
- Enable Vercel Analytics
- Use ISR (Incremental Static Regeneration) for product pages
- Optimize images with Next.js Image component

---

## Netlify

Alternative to Vercel with similar features.

### Step-by-Step Deployment

#### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Login

```bash
netlify login
```

#### 3. Initialize Project

```bash
netlify init
```

#### 4. Configure Build Settings

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

#### 5. Deploy

```bash
# Deploy to preview
netlify deploy

# Deploy to production
netlify deploy --prod
```

#### 6. Configure Environment Variables

```bash
# Via CLI
netlify env:set DATABASE_URL "postgresql://..."
netlify env:set STRIPE_SECRET_KEY "sk_live_..."

# Or via Netlify Dashboard
# Site Settings > Environment Variables
```

---

## Docker

For self-hosted deployments or containerized environments.

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Multi-stage build for smaller image size
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js app
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

For local testing with database:

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/eonlife
      - STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}
      - STRIPE_PUBLIC_KEY=${STRIPE_PUBLIC_KEY}
    depends_on:
      - db
    networks:
      - eonlife-network

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=eonlife
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d
    networks:
      - eonlife-network

volumes:
  postgres-data:

networks:
  eonlife-network:
```

### Build and Run

```bash
# Build image
docker build -t eonlife:latest .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

### Deploy to Docker Hub

```bash
# Tag image
docker tag eonlife:latest yourusername/eonlife:latest

# Push to Docker Hub
docker push yourusername/eonlife:latest
```

---

## Traditional VPS

Deploy to a VPS (DigitalOcean, Linode, AWS EC2, etc.)

### Prerequisites

- Ubuntu 22.04 LTS server
- Root or sudo access
- Domain pointing to server IP

### Step-by-Step Setup

#### 1. Connect to Server

```bash
ssh root@your-server-ip
```

#### 2. Install Node.js

```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Verify
node --version  # Should be v18+
npm --version
```

#### 3. Install PostgreSQL

```bash
# Install PostgreSQL 14
apt install -y postgresql postgresql-contrib

# Start service
systemctl start postgresql
systemctl enable postgresql

# Create database
sudo -u postgres psql -c "CREATE DATABASE eonlife;"
sudo -u postgres psql -c "CREATE USER eonlife_user WITH PASSWORD 'secure_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE eonlife TO eonlife_user;"
```

#### 4. Install Nginx

```bash
apt install -y nginx

# Start service
systemctl start nginx
systemctl enable nginx
```

#### 5. Clone and Build Application

```bash
# Create app directory
mkdir -p /var/www/eonlife
cd /var/www/eonlife

# Clone repository
git clone <your-repo-url> .

# Install dependencies
npm ci

# Create environment file
cp .env.example .env.local
nano .env.local  # Edit with production values

# Generate Prisma client
npx prisma generate

# Run migrations
psql -U eonlife_user -d eonlife < database/migrations/001_create_schema.sql

# Build
npm run build
```

#### 6. Configure PM2 (Process Manager)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "eonlife" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command that PM2 outputs

# Monitor
pm2 status
pm2 logs eonlife
```

#### 7. Configure Nginx

```bash
# Create Nginx config
nano /etc/nginx/sites-available/eonlife
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
# Create symlink
ln -s /etc/nginx/sites-available/eonlife /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload Nginx
systemctl reload nginx
```

#### 8. Setup SSL with Let's Encrypt

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

Certbot automatically updates Nginx config for HTTPS.

#### 9. Configure Firewall

```bash
# Allow SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable

# Check status
ufw status
```

---

## Database Deployment

### Supabase (Recommended)

1. Create production project at [supabase.com](https://supabase.com)
2. Go to **Project Settings** > **Database**
3. Copy connection string
4. Run migrations:
   ```bash
   psql "postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres" \
     < database/migrations/001_create_schema.sql
   ```
5. Add to environment variables:
   ```bash
   DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres
   ```

### AWS RDS

1. Create PostgreSQL instance in [AWS RDS Console](https://console.aws.amazon.com/rds)
2. Configure security group to allow your app's IP
3. Create database:
   ```bash
   psql -h your-rds-endpoint.rds.amazonaws.com -U postgres -c "CREATE DATABASE eonlife;"
   ```
4. Run migrations
5. Add connection string to environment

### Connection Pooling

For production, use connection pooling:

**Supabase:**
```bash
# Use pooler connection string (port 6543)
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT].pooler.supabase.com:6543/postgres
```

**PgBouncer (for VPS):**
```bash
# Install
apt install -y pgbouncer

# Configure /etc/pgbouncer/pgbouncer.ini
[databases]
eonlife = host=localhost port=5432 dbname=eonlife

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
pool_mode = transaction
max_client_conn = 100

# Start
systemctl start pgbouncer
systemctl enable pgbouncer
```

---

## Post-Deployment

### 1. Verify Deployment

```bash
# Homepage loads
curl https://yourdomain.com

# API works
curl https://yourdomain.com/api/products/reluma-serum

# SSL is active
curl -I https://yourdomain.com | grep -i strict-transport-security
```

### 2. Test Critical Paths

- [ ] Homepage loads
- [ ] Product pages load
- [ ] Shopping cart works
- [ ] Checkout flow completes
- [ ] Stripe payment works (use test card first!)
- [ ] Forms submit successfully
- [ ] Newsletter signup works
- [ ] Email notifications sent

### 3. Configure Monitoring

**Vercel Analytics:**
- Automatically enabled on Vercel

**Google Analytics:**
- Verify `NEXT_PUBLIC_GA_ID` is set
- Check Real-Time reports in GA dashboard

**Sentry (Error Tracking):**
```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
```

### 4. Setup Backups

**Database Backups:**

**Supabase:**
- Automatic daily backups on Pro plan
- Manual backups: Dashboard > Database > Backups

**VPS:**
```bash
# Create backup script
nano /root/backup-db.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/eonlife"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U eonlife_user eonlife > $BACKUP_DIR/eonlife_$DATE.sql
gzip $BACKUP_DIR/eonlife_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

```bash
# Make executable
chmod +x /root/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /root/backup-db.sh
```

### 5. Performance Optimization

**Enable CDN:**
- Vercel/Netlify: Automatic
- VPS: Use Cloudflare (free)

**Image Optimization:**
- Already handled by Next.js Image component

**Caching:**
- Configure cache headers in `next.config.js`

---

## Monitoring & Maintenance

### Health Checks

Create monitoring script:

```bash
# Create monitor.sh
curl -f https://yourdomain.com/api/health || echo "Site down!" | mail -s "Eonlife Down" admin@yourdomain.com
```

**Use External Monitoring:**
- [UptimeRobot](https://uptimerobot.com) - Free uptime monitoring
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

### Log Management

**Vercel:**
- Dashboard > Logs

**VPS with PM2:**
```bash
# View logs
pm2 logs eonlife

# Save logs to file
pm2 logs eonlife --lines 1000 > logs.txt
```

### Database Maintenance

```bash
# Vacuum database (reclaim space)
psql -U eonlife_user -d eonlife -c "VACUUM ANALYZE;"

# Check database size
psql -U eonlife_user -d eonlife -c "SELECT pg_size_pretty(pg_database_size('eonlife'));"
```

### Updates

**Vercel/Netlify:**
```bash
# Push to Git - auto-deploys
git push origin main
```

**VPS:**
```bash
cd /var/www/eonlife
git pull
npm ci
npm run build
pm2 restart eonlife
```

---

## Troubleshooting

### Build Fails

```bash
# Check Node version
node --version  # Must be 18+

# Clear cache and rebuild
rm -rf .next node_modules package-lock.json
npm install
npm run build
```

### Database Connection Issues

```bash
# Test connection
psql "$DATABASE_URL" -c "SELECT 1;"

# Check connection string format
echo $DATABASE_URL
# Should be: postgresql://user:password@host:port/database
```

### Stripe Webhooks Not Working

1. Verify webhook URL is correct
2. Check webhook signing secret
3. View webhook logs in Stripe Dashboard
4. Test with Stripe CLI:
   ```bash
   stripe listen --forward-to https://yourdomain.com/api/webhooks/stripe
   ```

### SSL/HTTPS Issues

**Vercel/Netlify:**
- Automatic - wait for DNS propagation

**VPS:**
```bash
# Renew certificate
certbot renew

# Force renewal
certbot renew --force-renewal
```

### High Memory Usage

```bash
# Check memory
free -h

# Restart app
pm2 restart eonlife

# Increase Node memory limit
pm2 delete eonlife
pm2 start npm --name "eonlife" --max-memory-restart 500M -- start
```

---

## Rollback Procedure

### Vercel

1. Go to Dashboard > Deployments
2. Find previous working deployment
3. Click "⋯" > Promote to Production

### VPS

```bash
cd /var/www/eonlife
git log  # Find previous commit
git revert <commit-hash>
npm ci
npm run build
pm2 restart eonlife
```

---

## Security Checklist

Before going live:

- [ ] All secrets in environment variables (not in code)
- [ ] HTTPS/SSL enabled
- [ ] Security headers configured
- [ ] CSRF protection enabled
- [ ] Rate limiting active
- [ ] Input validation on all forms
- [ ] SQL injection protection (parameterized queries)
- [ ] XSS protection (sanitized user input)
- [ ] Stripe webhook signature verification
- [ ] Database credentials secure
- [ ] Regular backups configured
- [ ] Monitoring and alerts set up

---

## Quick Reference

### Vercel Deployment
```bash
vercel login
vercel
vercel --prod
```

### VPS Deployment
```bash
ssh user@server
cd /var/www/eonlife
git pull
npm ci
npm run build
pm2 restart eonlife
```

### Check Deployment Status
```bash
# Vercel
vercel ls

# VPS
pm2 status
pm2 logs eonlife --lines 50
```

---

**Ready to deploy!** Start with [Vercel](#vercel-recommended) for the quickest deployment.
