#!/bin/bash
# ==============================================================================
# THE ONE SERVER SCRIPT - Income Clarity
# ==============================================================================
# ONE SOURCE OF TRUTH for starting the server
# Usage: ./server.sh [dev|prod]
# - dev:  Development mode with hot reload (default for iteration)
# - prod: Production mode with full build (for demos/performance)
# ==============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Determine mode
MODE=${1:-dev}  # Default to dev mode for faster iteration

echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           INCOME CLARITY SERVER - ONE SCRIPT TO RULE THEM ALL${NC}"
echo -e "${BLUE}                          MODE: ${MODE^^}${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"

# ==============================================================================
# STEP 1: PRE-FLIGHT CLEANUP (Prevent disk spikes)
# ==============================================================================
echo -e "\n${YELLOW}🧹 Step 1: Pre-flight cleanup...${NC}"

# Kill existing server sessions first
if tmux has-session -t income-clarity-dev 2>/dev/null; then
    echo "  Stopping existing tmux development session..."
    tmux kill-session -t income-clarity-dev 2>/dev/null || true
fi

# Clean npm cache that causes crashes
if [ -d ~/.npm/_npx ]; then
    echo "  Cleaning npm _npx cache..."
    rm -rf ~/.npm/_npx/* 2>/dev/null || true
fi

# Verify npm cache (faster than clean --force)
echo "  Verifying npm cache..."
npm cache verify >/dev/null 2>&1 || true

# Mode-specific cleanup
if [ "$MODE" = "prod" ]; then
    # Full cleanup for production builds
    if [ -d .next/cache ]; then
        echo "  Cleaning Next.js cache (production)..."
        rm -rf .next/cache 2>/dev/null || true
    fi
    if [ -d node_modules/.cache ]; then
        echo "  Cleaning node_modules cache (production)..."
        rm -rf node_modules/.cache 2>/dev/null || true
    fi
else
    # Lighter cleanup for development (preserve incremental builds)
    echo "  Preserving Next.js cache for faster development builds..."
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

# Set environment based on mode
if [ "$MODE" = "prod" ]; then
    export NODE_ENV=production
    echo "  NODE_ENV set to: production"
else
    export NODE_ENV=development
    echo "  NODE_ENV set to: development"
fi

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
# STEP 5: BUILD CHECK (MODE-DEPENDENT)
# ==============================================================================
echo -e "\n${YELLOW}🏗️ Step 5: Build check...${NC}"

if [ "$MODE" = "prod" ]; then
    # Production mode - full build required
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
        
        echo -e "${GREEN}✅ Production build complete${NC}"
    else
        echo -e "${GREEN}✅ Production build is up to date${NC}"
    fi
else
    # Development mode - no pre-build needed (Next.js dev handles it)
    echo -e "${GREEN}✅ Development mode - build handled by Next.js dev server${NC}"
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
# STEP 7: START SERVER (MODE-DEPENDENT)
# ==============================================================================
echo -e "\n${YELLOW}🚀 Step 7: Starting server...${NC}"

if [ "$MODE" = "prod" ]; then
    # Production mode - optimized build
    echo -e "${GREEN}Starting PRODUCTION server...${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Mode: PRODUCTION (optimized build)${NC}"
    echo -e "${GREEN}Local: http://localhost:3000${NC}"
    echo -e "${GREEN}Production: https://incomeclarity.ddns.net${NC}"
    echo -e "${GREEN}Press Ctrl+C to stop${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    # Check if custom server exists
    if [ -f custom-server.js ]; then
        NODE_ENV=production node custom-server.js
    else
        npm run start
    fi
else
    # Development mode - hot reload with tmux persistence
    echo -e "${GREEN}Starting DEVELOPMENT server...${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Mode: DEVELOPMENT (hot reload enabled)${NC}"
    echo -e "${GREEN}Local: http://localhost:3000${NC}"
    echo -e "${GREEN}Session: tmux session 'income-clarity-dev'${NC}"
    echo -e "${GREEN}Commands:${NC}"
    echo -e "${GREEN}  - View logs: tmux capture-pane -t income-clarity-dev -p${NC}"
    echo -e "${GREEN}  - Attach: tmux attach-session -t income-clarity-dev${NC}"
    echo -e "${GREEN}  - Stop: tmux kill-session -t income-clarity-dev${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}\n"
    
    # Start development server in tmux for persistence
    if [ -f custom-server.js ]; then
        echo "Starting with custom development server in tmux..."
        tmux new-session -d -s income-clarity-dev "NODE_ENV=development node custom-server.js"
    else
        echo "Starting with Next.js development server in tmux..."
        tmux new-session -d -s income-clarity-dev "npm run dev"
    fi
    
    # Brief pause to let server start
    sleep 2
    
    echo -e "${GREEN}✅ Development server started in tmux session${NC}"
    echo -e "${YELLOW}💡 Server is running in the background. Use tmux commands above to interact.${NC}"
fi