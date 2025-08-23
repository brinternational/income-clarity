#!/bin/bash

# DARK MODE VISUAL TESTING RUNNER
# 
# This script provides easy execution of comprehensive dark mode visual testing
# with proper environment setup and result management.
#
# Usage: ./scripts/run-dark-mode-visual-testing.sh [options]
#
# Options:
#   --localhost     Test against localhost:3000 (default)
#   --production    Test against production URL https://incomeclarity.ddns.net
#   --clean         Clean previous test results before running
#   --open          Open results in browser after completion
#
# Date: August 22, 2025

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Default configuration
TEST_URL="http://localhost:3000"
CLEAN_RESULTS=false
OPEN_RESULTS=false
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --localhost)
      TEST_URL="http://localhost:3000"
      shift
      ;;
    --production)
      TEST_URL="https://incomeclarity.ddns.net"
      shift
      ;;
    --clean)
      CLEAN_RESULTS=true
      shift
      ;;
    --open)
      OPEN_RESULTS=true
      shift
      ;;
    -h|--help)
      echo "Dark Mode Visual Testing Runner"
      echo ""
      echo "Usage: $0 [options]"
      echo ""
      echo "Options:"
      echo "  --localhost     Test against localhost:3000 (default)"
      echo "  --production    Test against production URL"
      echo "  --clean         Clean previous test results"
      echo "  --open          Open results in browser"
      echo "  -h, --help      Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🌙 Dark Mode Visual Testing Runner${NC}"
echo "=================================="
echo ""
echo -e "📍 Test URL: ${YELLOW}$TEST_URL${NC}"
echo -e "🧹 Clean Results: ${YELLOW}$CLEAN_RESULTS${NC}"
echo -e "🌐 Open Results: ${YELLOW}$OPEN_RESULTS${NC}"
echo ""

# Change to project directory
cd "$PROJECT_DIR"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js to run the tests.${NC}"
    exit 1
fi

# Check if the test script exists
TEST_SCRIPT="$SCRIPT_DIR/comprehensive-dark-mode-visual-testing.js"
if [[ ! -f "$TEST_SCRIPT" ]]; then
    echo -e "${RED}❌ Test script not found: $TEST_SCRIPT${NC}"
    exit 1
fi

# Check if server is running (for localhost tests)
if [[ "$TEST_URL" == "http://localhost:3000" ]]; then
    echo -e "${BLUE}🔍 Checking if local server is running...${NC}"
    
    if ! curl -s -f "$TEST_URL" > /dev/null; then
        echo -e "${RED}❌ Local server not responding at $TEST_URL${NC}"
        echo ""
        echo "Please start the server first:"
        echo "  node custom-server.js"
        echo ""
        echo "Or use --production to test against the production server"
        exit 1
    else
        echo -e "${GREEN}✅ Local server is running${NC}"
    fi
fi

# Clean previous results if requested
if [[ "$CLEAN_RESULTS" == "true" ]]; then
    echo -e "${BLUE}🧹 Cleaning previous test results...${NC}"
    
    if [[ -d "test-results/dark-mode-visual-validation" ]]; then
        rm -rf test-results/dark-mode-visual-validation
        echo -e "${GREEN}✅ Cleaned dark-mode-visual-validation directory${NC}"
    fi
    
    if [[ -d "test-results/dark-mode-baseline" ]]; then
        rm -rf test-results/dark-mode-baseline
        echo -e "${GREEN}✅ Cleaned dark-mode-baseline directory${NC}"
    fi
    
    if [[ -d "test-results/dark-mode-console-logs" ]]; then
        rm -rf test-results/dark-mode-console-logs
        echo -e "${GREEN}✅ Cleaned dark-mode-console-logs directory${NC}"
    fi
fi

# Install dependencies if needed
echo -e "${BLUE}📦 Checking dependencies...${NC}"
if [[ ! -d "node_modules/playwright" ]]; then
    echo -e "${YELLOW}⚠️ Playwright not found. Installing...${NC}"
    npm install playwright
fi

# Set environment variable for test URL
export TEST_URL="$TEST_URL"

echo ""
echo -e "${BLUE}🚀 Starting Dark Mode Visual Testing...${NC}"
echo ""

# Run the test with proper error handling
if node "$TEST_SCRIPT"; then
    EXIT_CODE=0
    echo ""
    echo -e "${GREEN}🎉 Dark Mode Visual Testing completed successfully!${NC}"
else
    EXIT_CODE=$?
    echo ""
    echo -e "${RED}❌ Dark Mode Visual Testing failed with exit code $EXIT_CODE${NC}"
fi

# Display results information
RESULTS_DIR="test-results/dark-mode-visual-validation"
BASELINE_DIR="test-results/dark-mode-baseline"

if [[ -d "$RESULTS_DIR" ]]; then
    echo ""
    echo -e "${BLUE}📊 Test Results Summary:${NC}"
    echo "========================="
    
    # Count screenshots
    SCREENSHOT_COUNT=$(find "$RESULTS_DIR" -name "*.png" 2>/dev/null | wc -l || echo "0")
    echo -e "📸 Screenshots captured: ${YELLOW}$SCREENSHOT_COUNT${NC}"
    
    # List breakpoint directories
    if [[ -d "$RESULTS_DIR" ]]; then
        echo -e "📱 Breakpoints tested:"
        for dir in "$RESULTS_DIR"/*; do
            if [[ -d "$dir" ]]; then
                BREAKPOINT=$(basename "$dir")
                COUNT=$(find "$dir" -name "*.png" 2>/dev/null | wc -l || echo "0")
                echo -e "   - ${YELLOW}$BREAKPOINT${NC}: $COUNT screenshots"
            fi
        done
    fi
    
    # Check for reports
    if [[ -f "$RESULTS_DIR/dark-mode-testing-summary.md" ]]; then
        echo -e "📋 Summary report: ${YELLOW}$RESULTS_DIR/dark-mode-testing-summary.md${NC}"
    fi
    
    if [[ -f "$RESULTS_DIR/dark-mode-visual-testing-report.json" ]]; then
        echo -e "📄 Detailed report: ${YELLOW}$RESULTS_DIR/dark-mode-visual-testing-report.json${NC}"
    fi
    
    # Baseline information
    if [[ -d "$BASELINE_DIR" ]]; then
        BASELINE_COUNT=$(find "$BASELINE_DIR" -name "*.png" 2>/dev/null | wc -l || echo "0")
        echo -e "📁 Baseline screenshots: ${YELLOW}$BASELINE_COUNT${NC} (for future comparison)"
    fi
fi

# Open results if requested
if [[ "$OPEN_RESULTS" == "true" && -f "$RESULTS_DIR/dark-mode-testing-summary.md" ]]; then
    echo ""
    echo -e "${BLUE}🌐 Opening results in browser...${NC}"
    
    # Try different browsers/commands
    if command -v xdg-open &> /dev/null; then
        xdg-open "$RESULTS_DIR/dark-mode-testing-summary.md"
    elif command -v open &> /dev/null; then
        open "$RESULTS_DIR/dark-mode-testing-summary.md"
    elif command -v start &> /dev/null; then
        start "$RESULTS_DIR/dark-mode-testing-summary.md"
    else
        echo -e "${YELLOW}⚠️ Could not automatically open results. Please open manually:${NC}"
        echo "   $RESULTS_DIR/dark-mode-testing-summary.md"
    fi
fi

echo ""
echo -e "${BLUE}📂 Results Location:${NC}"
echo "   Screenshots: $RESULTS_DIR"
echo "   Baseline:    $BASELINE_DIR"
echo ""

# Provide next steps based on results
if [[ $EXIT_CODE -eq 0 ]]; then
    echo -e "${GREEN}✅ Next Steps:${NC}"
    echo "   1. Review the generated screenshots for visual issues"
    echo "   2. Use baseline screenshots for future regression testing"
    echo "   3. Address any warnings found in the report"
    echo "   4. Integrate into CI/CD pipeline for automated testing"
else
    echo -e "${RED}❌ Next Steps:${NC}"
    echo "   1. Review the error logs and failed test details"
    echo "   2. Fix any critical dark mode implementation issues"
    echo "   3. Re-run the tests after fixes"
    echo "   4. Check server connectivity and authentication"
fi

echo ""
echo -e "${BLUE}🌙 Dark Mode Visual Testing Runner Complete${NC}"

exit $EXIT_CODE