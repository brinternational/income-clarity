#!/bin/bash
# Quality Check Script
# Purpose: Comprehensive quality validation before commits/deployment
# Usage: bash scripts/quality-check.sh
# Lifecycle: Permanent utility script

echo "🔍 Income Clarity - Quality Check"
echo "================================="

# Color functions  
print_success() { echo -e "\033[32m✅ $1\033[0m"; }
print_warning() { echo -e "\033[33m⚠️  $1\033[0m"; }
print_error() { echo -e "\033[31m❌ $1\033[0m"; }
print_info() { echo -e "\033[34m🔍 $1\033[0m"; }

# Track overall status
overall_status=0
check_count=0

# Helper function to run checks
run_check() {
  local check_name="$1"
  local command="$2"
  
  print_info "Running $check_name..."
  ((check_count++))
  
  if eval "$command" >/dev/null 2>&1; then
    print_success "$check_name passed"
    return 0
  else
    print_error "$check_name failed"
    overall_status=1
    return 1
  fi
}

# 1. Environment validation
run_check "Environment validation" "node scripts/validate-env.js"

# 2. TypeScript type checking
if [ -f "tsconfig.json" ]; then
  run_check "TypeScript type checking" "npm run type-check"
else
  print_warning "No tsconfig.json found - skipping TypeScript check"
fi

# 3. ESLint code quality
if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.json" ]; then
  run_check "ESLint code quality" "npm run lint"
else
  print_warning "No ESLint config found - skipping lint check"
fi

# 4. Database connectivity
print_info "Checking database connectivity..."
if [ -f "prisma/dev.db" ]; then
  if npx prisma db push --accept-data-loss >/dev/null 2>&1; then
    print_success "Database connectivity passed"
  else
    print_warning "Database push failed - check schema"
    overall_status=1
  fi
else
  print_error "Database file not found"
  overall_status=1
fi

# 5. API key validation
print_info "Checking API key configuration..."
if [ -n "$POLYGON_API_KEY" ] && [ "$POLYGON_API_KEY" != "your_polygon_api_key_here" ]; then
  print_success "Polygon API key configured"
else
  print_error "Polygon API key missing or placeholder"
  overall_status=1
fi

# 6. Build test (production readiness)
print_info "Testing production build..."
if npm run build >/dev/null 2>&1; then
  print_success "Production build successful"
  # Cleanup build files
  rm -rf .next 2>/dev/null || true
else
  print_error "Production build failed"
  overall_status=1
fi

# 7. Test suite (if available)
if [ -f "jest.config.js" ] && [ -d "__tests__" ]; then
  run_check "Test suite" "npm test -- --passWithNoTests"
else
  print_warning "No test configuration found - consider adding tests"
fi

# 8. Security check for exposed secrets
print_info "Checking for exposed secrets..."
secret_files=$(grep -r "sk_" . --include="*.js" --include="*.ts" --include="*.json" --exclude-dir=node_modules 2>/dev/null | wc -l)
if [ "$secret_files" -eq 0 ]; then
  print_success "No exposed secrets found"
else
  print_error "Found $secret_files potential secret exposures"
  overall_status=1
fi

# 9. Port availability check
print_info "Checking port 3000 availability..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  print_warning "Port 3000 is in use - development server may be running"
else
  print_success "Port 3000 is available"
fi

# 10. File system cleanup verification
print_info "Checking for temporary files..."
temp_count=$(find . -maxdepth 2 \( -name "test-*.js" -o -name "debug-*.js" -o -name "*.tmp" \) 2>/dev/null | wc -l)
if [ "$temp_count" -eq 0 ]; then
  print_success "No temporary files found"
else
  print_warning "Found $temp_count temporary files - run auto-cleanup.sh"
fi

# Summary
echo ""
echo "🎯 Quality Check Summary:"
echo "========================"
echo "Checks run: $check_count"

if [ $overall_status -eq 0 ]; then
  print_success "🎉 All quality checks passed!"
  print_success "✨ Ready for commit/deployment"
  echo ""
  echo "Next steps:"
  echo "- git add ."
  echo "- git commit -m 'Your commit message'"
  echo "- Or deploy to production"
else
  print_error "❌ Quality checks failed"
  print_warning "Fix issues before committing/deploying"
  echo ""
  echo "Common fixes:"
  echo "- Run 'npm run lint --fix' for code style"
  echo "- Run 'npm run type-check' for TypeScript errors"  
  echo "- Check .env.local for missing variables"
  echo "- Run 'bash scripts/auto-cleanup.sh' for file cleanup"
fi

echo ""
exit $overall_status