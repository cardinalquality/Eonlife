#!/bin/bash
# Development Database Setup Script
# This script sets up a local PostgreSQL database for development

set -e  # Exit on error

echo "========================================="
echo "Eonlife Development Database Setup"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}Error: PostgreSQL is not installed${NC}"
    echo "Please install PostgreSQL first:"
    echo "  - macOS: brew install postgresql@14"
    echo "  - Ubuntu: sudo apt-get install postgresql-14"
    echo "  - Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

# Database configuration
DB_NAME="${DB_NAME:-eonlife_dev}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo -e "${YELLOW}Database Configuration:${NC}"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo ""

# Check if database exists
if psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}Warning: Database '$DB_NAME' already exists${NC}"
    read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping existing database..."
        psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "DROP DATABASE IF EXISTS $DB_NAME;"
    else
        echo "Skipping database creation..."
        skip_create=true
    fi
fi

# Create database if needed
if [ -z "$skip_create" ]; then
    echo -e "${GREEN}Creating database '$DB_NAME'...${NC}"
    psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "CREATE DATABASE $DB_NAME;"
fi

# Update .env.local file
ENV_FILE=".env.local"
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"

echo ""
echo -e "${GREEN}Setting up environment file...${NC}"

if [ ! -f "$ENV_FILE" ]; then
    # Create .env.local from .env.development template
    if [ -f ".env.development" ]; then
        cp .env.development "$ENV_FILE"
        echo "Created $ENV_FILE from .env.development template"
    else
        touch "$ENV_FILE"
        echo "Created empty $ENV_FILE"
    fi
fi

# Update DATABASE_URL in .env.local
if grep -q "^DATABASE_URL=" "$ENV_FILE"; then
    # Replace existing DATABASE_URL
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" "$ENV_FILE"
    else
        # Linux
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=$DATABASE_URL|" "$ENV_FILE"
    fi
else
    # Add DATABASE_URL
    echo "" >> "$ENV_FILE"
    echo "DATABASE_URL=$DATABASE_URL" >> "$ENV_FILE"
fi

echo -e "${GREEN}✓ Updated DATABASE_URL in $ENV_FILE${NC}"

# Run Prisma migrations
echo ""
echo -e "${GREEN}Running Prisma migrations...${NC}"
npm run db:push

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}Development database setup complete!${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""
echo "Database URL: $DATABASE_URL"
echo ""
echo "Next steps:"
echo "  1. Run 'npm run dev' to start the development server"
echo "  2. Access the database with: psql -U $DB_USER -h $DB_HOST -d $DB_NAME"
echo ""
