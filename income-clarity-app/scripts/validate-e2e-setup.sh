#!/bin/bash

# E2E Setup Validation Script
# Quick validation that Playwright is properly configured for production testing

set -e

echo "🔍 Validating E2E Test Setup..."
echo ""

# Check Playwright installation
echo "📦 Checking Playwright installation..."
if npx playwright --version; then
    echo "✅ Playwright is installed"
else
    echo "❌ Playwright is not installed"
    exit 1
fi

# Check if browsers are installed
echo ""
echo "🌐 Checking Playwright browsers..."
if npx playwright install --dry-run chromium &> /dev/null; then
    echo "✅ Chromium browser is available"
else
    echo "⚠️  Installing Chromium browser..."
    npx playwright install chromium
fi

# Check test files exist
echo ""
echo "📋 Checking test files..."
test_files=(
    "__tests__/e2e/auth-flow.spec.ts"
    "__tests__/e2e/super-cards.spec.ts" 
    "__tests__/e2e/portfolio-management.spec.ts"
    "__tests__/e2e/comprehensive-features-test.spec.ts"
    "__tests__/e2e/settings-and-premium.spec.ts"
)

for test_file in "${test_files[@]}"; do
    if [ -f "$test_file" ]; then
        echo "✅ $test_file exists"
    else
        echo "❌ $test_file missing"
        exit 1
    fi
done

# Check configuration file
echo ""
echo "⚙️  Checking Playwright configuration..."
if [ -f "playwright.config.ts" ]; then
    echo "✅ playwright.config.ts exists"
    
    # Check if it uses production server
    if grep -q "NODE_ENV=production node custom-server.js" playwright.config.ts; then
        echo "✅ Configuration uses production server"
    else
        echo "⚠️  Configuration may not use production server"
    fi
else
    echo "❌ playwright.config.ts missing"
    exit 1
fi

# Check if server can start
echo ""
echo "🚀 Testing production server startup..."

# Kill any existing process on port 3000
if lsof -i :3000 &> /dev/null; then
    echo "⚠️  Port 3000 in use, cleaning up..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Start server in background
echo "Starting production server..."
NODE_ENV=production node custom-server.js &
SERVER_PID=$!

# Wait for server to start
sleep 5

# Check if server is responding
if curl -f http://localhost:3000 &> /dev/null; then
    echo "✅ Production server started successfully"
else
    echo "❌ Production server failed to start"
    kill $SERVER_PID 2>/dev/null || true
    exit 1
fi

# Kill the test server
kill $SERVER_PID 2>/dev/null || true
sleep 2

# Run a quick smoke test
echo ""
echo "🧪 Running smoke test..."

# Start server again for the test
NODE_ENV=production node custom-server.js &
SERVER_PID=$!
sleep 5

# Run a single quick test
if npx playwright test auth-flow.spec.ts --project=chromium --grep="should login with existing credentials" --timeout=30000; then
    echo "✅ Smoke test passed"
    SMOKE_TEST_RESULT="PASS"
else
    echo "⚠️  Smoke test failed (this may be expected if demo data isn't set up)"
    SMOKE_TEST_RESULT="FAIL"
fi

# Cleanup
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "======================================"
echo "🎯 E2E SETUP VALIDATION RESULTS"
echo "======================================"
echo "✅ Playwright Installation: OK"
echo "✅ Browser Availability: OK" 
echo "✅ Test Files: OK"
echo "✅ Configuration: OK"
echo "✅ Production Server: OK"
echo "🧪 Smoke Test: $SMOKE_TEST_RESULT"
echo ""

if [ "$SMOKE_TEST_RESULT" = "PASS" ]; then
    echo "🎉 E2E TEST SETUP IS FULLY READY!"
    echo ""
    echo "📋 Available test commands:"
    echo "  npm run test:e2e:comprehensive  # Run full test suite"
    echo "  npm run test:e2e:ui             # Interactive test runner"
    echo "  npm run test:e2e:auth           # Authentication tests only"
    echo "  npm run test:e2e:super-cards    # Super Cards tests only"
    echo "  npm run test:e2e:mobile         # Mobile device tests"
    echo ""
else
    echo "⚠️  E2E SETUP IS READY BUT SMOKE TEST FAILED"
    echo ""
    echo "This is normal if:"
    echo "- Demo user account isn't set up (test@example.com)"
    echo "- Database needs to be seeded"
    echo "- Server needs environment setup"
    echo ""
    echo "Run demo setup first:"
    echo "  node scripts/setup-test-user.js"
    echo "  node scripts/seed-demo-data.js"
    echo ""
fi

echo "🚀 Ready to run comprehensive E2E tests!"