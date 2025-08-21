#!/bin/bash

# COMPREHENSIVE E2E VISUAL VALIDATION RUNNER
# Executes screenshot-based testing with console error monitoring

echo "🚀 Starting Comprehensive E2E Visual Validation System"
echo "======================================================"

# Check if server is running
echo "🔍 Checking if server is running on https://incomeclarity.ddns.net..."
if ! curl -s --max-time 10 https://incomeclarity.ddns.net > /dev/null; then
    echo "❌ Server not accessible at https://incomeclarity.ddns.net"
    echo "   Make sure the production server is running:"
    echo "   cd /public/MasterV2/income-clarity/income-clarity-app && NODE_ENV=production node custom-server.js"
    exit 1
fi

echo "✅ Server is accessible"

# Ensure playwright browser is installed
echo "🔍 Checking Playwright installation..."
if ! npx playwright install chromium --quiet; then
    echo "❌ Failed to install Playwright browsers"
    exit 1
fi

echo "✅ Playwright ready"

# Create test results directory
mkdir -p test-results/e2e-visual-validation
mkdir -p test-results/console-logs

echo "📂 Test directories created"

# Run the comprehensive validation
echo "🧪 Executing visual validation tests..."
echo ""

cd /public/MasterV2/income-clarity/income-clarity-app

if node scripts/comprehensive-e2e-visual-validation.js; then
    echo ""
    echo "🎉 VALIDATION COMPLETED SUCCESSFULLY"
    echo "📊 Check test-results/e2e-visual-validation/ for detailed results"
    echo "📋 Review test-summary.md for human-readable report"
else
    echo ""
    echo "⚠️ VALIDATION COMPLETED WITH ISSUES"
    echo "❌ Some tests failed - check the detailed report"
    echo "📂 Screenshots and logs saved in test-results/"
    exit 1
fi