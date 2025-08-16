#!/bin/bash

# Income Clarity - Clean Server Start Script
# Ensures clean startup by killing existing processes, cleaning temp files, and starting fresh
# Version: 1.0.0
# Date: 2025-01-12

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

echo ""
echo "========================================="
echo "   Income Clarity - Clean Server Start"
echo "========================================="
echo ""

# Step 1: Kill any process on port 3000
echo "Step 1: Checking port 3000..."
echo "------------------------------"

# Check if anything is running on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_warning "Found process on port 3000, killing it..."
    
    # Get the PID of the process on port 3000
    PID=$(lsof -Pi :3000 -sTCP:LISTEN -t)
    
    # Kill the process
    kill -9 $PID 2>/dev/null || true
    
    # Wait a moment for port to be released
    sleep 2
    
    print_status "Port 3000 cleared"
else
    print_status "Port 3000 is free"
fi

# Step 2: Kill any remaining Node/Next.js processes for this app
echo ""
echo "Step 2: Cleaning up Node processes..."
echo "-------------------------------------"

# Kill any npm run dev processes
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true

# Kill any node processes related to this directory
CURRENT_DIR=$(pwd)
pkill -f "node.*${CURRENT_DIR}" 2>/dev/null || true

print_status "Node processes cleaned"

# Step 3: Clean up temporary files
echo ""
echo "Step 3: Cleaning temporary files..."
echo "-----------------------------------"

# Remove Next.js cache
if [ -d ".next" ]; then
    print_info "Removing .next cache directory..."
    rm -rf .next
    print_status "Next.js cache cleared"
fi

# Remove any debug/test files in root
find . -maxdepth 1 -name "debug-*.js" -delete 2>/dev/null || true
find . -maxdepth 1 -name "test-*.js" -delete 2>/dev/null || true
find . -maxdepth 1 -name "*-snippet-*.json" -delete 2>/dev/null || true
find . -maxdepth 1 -name "*.tmp" -delete 2>/dev/null || true
find . -maxdepth 1 -name "*.temp" -delete 2>/dev/null || true

print_status "Temporary files cleaned"

# Step 4: Clean up Playwright browser processes (if any)
echo ""
echo "Step 4: Cleaning browser processes..."
echo "-------------------------------------"

# Kill any leftover Chromium/Chrome processes from testing
pkill -f chromium 2>/dev/null || true
pkill -f chrome 2>/dev/null || true
pkill -f firefox 2>/dev/null || true

print_status "Browser processes cleaned"

# Step 5: Verify environment
echo ""
echo "Step 5: Verifying environment..."
echo "--------------------------------"

# Check Node version
NODE_VERSION=$(node -v)
print_info "Node version: $NODE_VERSION"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found! Are you in the right directory?"
    echo "Current directory: $(pwd)"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
    print_status "Dependencies installed"
else
    print_status "Dependencies found"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_warning ".env.local not found"
    if [ -f ".env.example" ]; then
        print_info "Copying .env.example to .env.local..."
        cp .env.example .env.local
        print_status ".env.local created"
    fi
else
    print_status ".env.local found"
fi

# Step 6: Check database
echo ""
echo "Step 6: Checking database..."
echo "----------------------------"

# Check if Prisma directory exists
if [ -d "prisma" ]; then
    # Check if database file exists
    if [ -f "prisma/income_clarity.db" ]; then
        print_status "Database found"
    else
        print_warning "Database not found. Creating new database..."
        npx prisma db push
        print_status "Database created"
    fi
    
    # Generate Prisma client
    print_info "Generating Prisma client..."
    npx prisma generate
    print_status "Prisma client generated"
else
    print_warning "Prisma directory not found"
fi

# Step 7: Final port check
echo ""
echo "Step 7: Final port verification..."
echo "----------------------------------"

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_error "Port 3000 is still in use!"
    print_info "Attempting force kill..."
    fuser -k 3000/tcp 2>/dev/null || true
    sleep 2
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    print_error "Failed to clear port 3000. Please manually kill the process:"
    echo "  lsof -i :3000"
    echo "  kill -9 [PID]"
    exit 1
else
    print_status "Port 3000 is ready"
fi

# Step 8: Start the development server
echo ""
echo "========================================="
echo -e "${GREEN}   Starting Development Server${NC}"
echo "========================================="
echo ""

print_info "Starting server on http://localhost:3000"
print_info "Network access: http://$(hostname -I | awk '{print $1}'):3000"
print_info "Public access: https://incomeclarity.ddns.net"
echo ""
print_info "Press Ctrl+C to stop the server"
print_warning "Keep this terminal open to maintain the server"
echo ""

# Export environment variables for better output
export NODE_ENV=development
export PORT=3000
export FORCE_COLOR=1  # Enable colored output
export NODE_OPTIONS='--max-old-space-size=4096'  # Increase memory limit

# Show real-time logs with colors
print_status "Server output will appear below:"
echo "========================================="

# Use the robust server wrapper that handles TTY issues
# This wrapper keeps the server alive and handles restarts
node server-wrapper.js

# This line will only execute if the wrapper exits
echo ""
print_info "Server stopped"