#!/bin/bash
# ==============================================================================
# THE ONE SERVER SCRIPT - Income Clarity
# ==============================================================================
# ONE SOURCE OF TRUTH for starting the server
# Includes: cleanup, build, start with all safety checks
# ==============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           INCOME CLARITY SERVER - ONE SCRIPT TO RULE THEM ALL${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

# ==============================================================================
# STEP 1: PRE-FLIGHT CLEANUP (Prevent disk spikes)
# ==============================================================================
echo -e "\n${YELLOW}🧹 Step 1: Pre-flight cleanup...${NC}"

# Clean npm cache that causes crashes
if [ -d ~/.npm/_npx ]; then
    echo "  Cleaning npm _npx cache..."
    rm -rf ~/.npm/_npx/* 2>/dev/null || true
fi

# Verify npm cache (faster than clean --force)
echo "  Verifying npm cache..."
npm cache verify >/dev/null 2>&1 || true

# Clean Next.js cache
if [ -d .next/cache ]; then
    echo "  Cleaning Next.js cache..."
    rm -rf .next/cache 2>/dev/null || true
fi

# Clean node_modules cache
if [ -d node_modules/.cache ]; then
    echo "  Cleaning node_modules cache..."
    rm -rf node_modules/.cache 2>/dev/null || true
fi

# Clean test artifacts
rm -rf playwright-report test-results coverage 2>/dev/null || true

echo -e "${GREEN}✅ Cleanup complete${NC}"

# ==============================================================================
# STEP 2: PORT CHECK & CLEANUP
# ==============================================================================
echo -e "\n${YELLOW}🔍 Step 2: Checking port 3000...${NC}"

# Kill any process on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "  Port 3000 is in use. Killing existing process..."
    lsof -Pi :3000 -sTCP:LISTEN -t | xargs kill -9 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}✅ Port 3000 cleared${NC}"
else
    echo -e "${GREEN}✅ Port 3000 is available${NC}"
fi

# ==============================================================================
# STEP 3: ENVIRONMENT CHECK
# ==============================================================================
echo -e "\n${YELLOW}🔧 Step 3: Environment check...${NC}"

# Check for .env file
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        echo "  Creating .env from .env.example..."
        cp .env.example .env
    else
        echo -e "${RED}⚠️  Warning: No .env file found${NC}"
    fi
fi

# Set production environment
export NODE_ENV=production
echo "  NODE_ENV set to: production"

# ==============================================================================
# STEP 4: DEPENDENCY CHECK
# ==============================================================================
echo -e "\n${YELLOW}📦 Step 4: Checking dependencies...${NC}"

if [ ! -d node_modules ] || [ ! -f node_modules/.package-lock.json ]; then
    echo "  Installing dependencies..."
    npm ci --prefer-offline --no-audit --no-fund
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi

# ==============================================================================
# STEP 5: BUILD CHECK
# ==============================================================================
echo -e "\n${YELLOW}🏗️ Step 5: Build check...${NC}"

# Check if build is needed
BUILD_NEEDED=false
if [ ! -d .next ]; then
    BUILD_NEEDED=true
    echo "  No build found. Building application..."
elif [ -f package.json -a package.json -nt .next ]; then
    BUILD_NEEDED=true
    echo "  package.json changed. Rebuilding..."
elif find . -name "*.tsx" -newer .next -print -quit | grep -q .; then
    BUILD_NEEDED=true
    echo "  Source files changed. Rebuilding..."
fi

if [ "$BUILD_NEEDED" = true ]; then
    # Set memory limit to prevent crashes
    export NODE_OPTIONS="--max-old-space-size=1024"
    
    echo "  Building with memory limit (1GB)..."
    npm run build
    
    echo -e "${GREEN}✅ Build complete${NC}"
else
    echo -e "${GREEN}✅ Build is up to date${NC}"
fi

# ==============================================================================
# STEP 6: DATABASE CHECK
# ==============================================================================
echo -e "\n${YELLOW}🗄️ Step 6: Database check...${NC}"

if [ -f prisma/dev.db ]; then
    SIZE=$(du -h prisma/dev.db | cut -f1)
    echo -e "${GREEN}✅ Database exists (${SIZE})${NC}"
else
    echo "  Creating database..."
    npx prisma db push
    echo -e "${GREEN}✅ Database created${NC}"
fi

# ==============================================================================
# STEP 7: START SERVER
# ==============================================================================
echo -e "\n${YELLOW}🚀 Step 7: Starting server...${NC}"

# Check if custom server exists
if [ -f custom-server.js ]; then
    echo -e "${GREEN}Starting with custom server...${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Server starting at: http://localhost:3000${NC}"
    echo -e "${GREEN}Production URL: https://incomeclarity.ddns.net${NC}"
    echo -e "${GREEN}Press Ctrl+C to stop${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    # Start with production flag
    NODE_ENV=production node custom-server.js
else
    echo -e "${GREEN}Starting with Next.js...${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Server starting at: http://localhost:3000${NC}"
    echo -e "${GREEN}Press Ctrl+C to stop${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    # Start Next.js
    npm run start
fi