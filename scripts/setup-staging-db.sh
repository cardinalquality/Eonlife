#!/bin/bash
# Staging Database Setup Script
# This script helps configure a staging database (usually on a cloud provider)

set -e  # Exit on error

echo "========================================="
echo "Eonlife Staging Database Setup"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will help you set up a staging database.${NC}"
echo ""
echo "Recommended database providers for staging:"
echo "  1. Supabase (https://supabase.com) - Free tier available"
echo "  2. Vercel Postgres (https://vercel.com/storage/postgres) - Easy integration"
echo "  3. Railway (https://railway.app) - Simple deployment"
echo "  4. Neon (https://neon.tech) - Serverless PostgreSQL"
echo ""

read -p "Have you created a staging database? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${YELLOW}Please create a staging database first, then run this script again.${NC}"
    echo ""
    echo "Quick setup guides:"
    echo "  Supabase: https://supabase.com/docs/guides/database"
    echo "  Vercel: https://vercel.com/docs/storage/vercel-postgres/quickstart"
    echo "  Railway: https://docs.railway.app/databases/postgresql"
    echo ""
    exit 0
fi

echo ""
echo -e "${GREEN}Great! Let's configure your staging environment.${NC}"
echo ""

# Get database URL
echo "Enter your staging DATABASE_URL:"
echo "(Format: postgresql://user:password@host:port/database)"
read -p "DATABASE_URL: " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL cannot be empty${NC}"
    exit 1
fi

# Validate DATABASE_URL format
if [[ ! $DATABASE_URL =~ ^postgres(ql)?:// ]]; then
    echo -e "${RED}Error: Invalid DATABASE_URL format${NC}"
    echo "Expected format: postgresql://user:password@host:port/database"
    exit 1
fi

# Create .env.staging file
ENV_FILE=".env.staging"

echo ""
echo -e "${GREEN}Updating $ENV_FILE...${NC}"

# Update DATABASE_URL in .env.staging
if [ -f "$ENV_FILE" ]; then
    if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" "$ENV_FILE"
        else
            sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" "$ENV_FILE"
        fi
    else
        echo "" >> "$ENV_FILE"
        echo "DATABASE_URL=$DATABASE_URL" >> "$ENV_FILE"
    fi
    echo -e "${GREEN}✓ Updated DATABASE_URL in $ENV_FILE${NC}"
else
    echo -e "${RED}Error: $ENV_FILE not found${NC}"
    exit 1
fi

# Test database connection
echo ""
echo -e "${YELLOW}Testing database connection...${NC}"

# Temporarily set DATABASE_URL for the test
export DATABASE_URL="$DATABASE_URL"

# Run a simple Prisma command to test connection
if npx prisma db execute --stdin <<< "SELECT 1;" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Database connection successful!${NC}"
else
    echo -e "${RED}✗ Database connection failed${NC}"
    echo "Please check your DATABASE_URL and try again."
    exit 1
fi

# Run migrations
echo ""
read -p "Do you want to run database migrations now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}Running Prisma migrations...${NC}"
    npx prisma migrate deploy
    echo -e "${GREEN}✓ Migrations completed${NC}"
fi

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Staging database setup complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Configure other staging environment variables in .env.staging"
echo "  2. Deploy to your staging environment (e.g., Vercel)"
echo "  3. Add environment variables to your hosting provider"
echo ""
echo "For Vercel deployment:"
echo "  vercel env add DATABASE_URL"
echo "  (Then paste the DATABASE_URL when prompted)"
echo ""
