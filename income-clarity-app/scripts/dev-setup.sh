#!/bin/bash
# Development Session Setup Script
# Purpose: Clean development environment startup
# Usage: bash scripts/dev-setup.sh
# Lifecycle: Permanent utility script

echo "🚀 Income Clarity - Development Setup"
echo "======================================"

# Color functions
print_success() { echo -e "\033[32m✅ $1\033[0m"; }
print_warning() { echo -e "\033[33m⚠️  $1\033[0m"; }
print_error() { echo -e "\033[31m❌ $1\033[0m"; }
print_info() { echo -e "\033[34m🔍 $1\033[0m"; }

# 1. Clean up any leftover processes and files
print_info "Cleaning up development environment..."

# Kill leftover browser processes
print_info "Killing leftover browser processes..."
pkill -f "chrome.*--headless" 2>/dev/null || true
pkill -f "chromium.*--headless" 2>/dev/null || true  
pkill -f "playwright" 2>/dev/null || true
print_success "Browser cleanup complete"

# Clean up temporary files
print_info "Removing temporary files..."
find . -maxdepth 1 \( -name "test-*.js" -o -name "debug-*.js" -o -name "*.tmp" -o -name "*-snippet-*.json" \) -delete 2>/dev/null || true
find . -maxdepth 1 -name "*-report-*.md" -delete 2>/dev/null || true
print_success "Temporary file cleanup complete"

# 2. Kill existing development servers
print_info "Checking for existing servers on port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  print_warning "Killing existing server on port 3000..."
  lsof -ti:3000 | xargs kill -9 2>/dev/null || true
  sleep 2
  print_success "Port 3000 cleared"
else
  print_success "Port 3000 is free"
fi

# 3. Validate environment
print_info "Validating environment variables..."
if [ -f ".env.local" ]; then
  node scripts/validate-env.js
  ENV_STATUS=$?
  if [ $ENV_STATUS -eq 0 ]; then
    print_success "Environment validation passed"
  else
    print_error "Environment validation failed"
    print_warning "Check .env.local file for missing variables"
    exit 1
  fi
else
  print_error ".env.local file not found"
  print_warning "Create .env.local with required environment variables"
  exit 1
fi

# 4. Check database
print_info "Checking database connection..."
if [ -f "prisma/dev.db" ]; then
  print_success "Database file exists"
else
  print_warning "Database file not found - run setup-test-user.js"
fi

# 5. Validate dependencies
print_info "Checking node_modules..."
if [ -d "node_modules" ]; then
  print_success "Dependencies installed"
else
  print_warning "Installing dependencies..."
  npm install
  print_success "Dependencies installation complete"
fi

# 6. Final status check
echo ""
echo "🎯 Development Environment Status:"
echo "=================================="
print_success "✅ Browser processes cleaned"
print_success "✅ Temporary files removed"
print_success "✅ Port 3000 available"
print_success "✅ Environment validated"
print_success "✅ Dependencies ready"
echo ""

# 7. Start development server
print_info "Starting development server..."
echo ""
echo "🌟 Income Clarity Development Server Starting..."
echo "📱 Access: http://localhost:3000"
echo "👤 Test Login: test@example.com / password123"
echo "🛑 Stop: Ctrl+C"
echo ""

exec npm run dev