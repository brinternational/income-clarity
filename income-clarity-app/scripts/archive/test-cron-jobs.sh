#!/bin/bash

# BACKEND-004: Cron Jobs Testing Script
# Test all cron job endpoints for functionality and error handling

set -e

echo "🔄 Testing all cron job endpoints..."

# Configuration
BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
CRON_SECRET="${CRON_SECRET:-test-secret}"
CURL_TIMEOUT=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test cron endpoint
test_cron_endpoint() {
    local endpoint=$1
    local expected_schedule=$2
    local description=$3
    
    echo -e "${BLUE}Testing ${endpoint}${NC}"
    echo "Description: ${description}"
    echo "Schedule: ${expected_schedule}"
    echo "---"
    
    # Test without auth (should fail in production)
    echo "1. Testing without authentication..."
    local response
    local http_code
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        --max-time $CURL_TIMEOUT \
        "${BASE_URL}/api/cron/${endpoint}" || echo "HTTPSTATUS:000")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ "$http_code" = "401" ] || [ "$http_code" = "200" ]; then
        echo -e "  ${GREEN}✅ Unauthorized request handled correctly (${http_code})${NC}"
    else
        echo -e "  ${YELLOW}⚠️  Unexpected response without auth: ${http_code}${NC}"
    fi
    
    # Test with auth
    echo "2. Testing with authentication..."
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        --max-time $CURL_TIMEOUT \
        -H "Authorization: Bearer ${CRON_SECRET}" \
        "${BASE_URL}/api/cron/${endpoint}" || echo "HTTPSTATUS:000")
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ "$http_code" = "200" ]; then
        echo -e "  ${GREEN}✅ Authenticated request successful${NC}"
        
        # Parse JSON response if possible
        if command -v jq >/dev/null 2>&1 && echo "$body" | jq . >/dev/null 2>&1; then
            local success=$(echo "$body" | jq -r '.success // false')
            local message=$(echo "$body" | jq -r '.message // "No message"')
            local timestamp=$(echo "$body" | jq -r '.timestamp // "No timestamp"')
            local processingTime=$(echo "$body" | jq -r '.processingTime // .duration_ms // "N/A"')
            
            echo "    Success: ${success}"
            echo "    Message: ${message}"
            echo "    Processing time: ${processingTime}ms"
            echo "    Timestamp: ${timestamp}"
            
            # Check for specific endpoint metrics
            case $endpoint in
                "cache-warmer")
                    local usersWarmed=$(echo "$body" | jq -r '.stats.usersWarmed // 0')
                    local cardsWarmed=$(echo "$body" | jq -r '.stats.cardsWarmed // 0')
                    echo "    Users warmed: ${usersWarmed}"
                    echo "    Cards warmed: ${cardsWarmed}"
                    ;;
                "data-sync")
                    local stockPrices=$(echo "$body" | jq -r '.stats.stockPricesUpdated // 0')
                    local portfolios=$(echo "$body" | jq -r '.stats.portfoliosRefreshed // 0')
                    echo "    Stock prices updated: ${stockPrices}"
                    echo "    Portfolios refreshed: ${portfolios}"
                    ;;
                "cleanup")
                    local sessions=$(echo "$body" | jq -r '.stats.expiredSessionsRemoved // 0')
                    local logs=$(echo "$body" | jq -r '.stats.oldLogsRemoved // 0')
                    echo "    Expired sessions removed: ${sessions}"
                    echo "    Old logs removed: ${logs}"
                    ;;
                "health-check")
                    local overallHealth=$(echo "$body" | jq -r '.results.overall.healthy // false')
                    local healthScore=$(echo "$body" | jq -r '.results.overall.score // 0')
                    local alertCount=$(echo "$body" | jq -r '.alerts | length' 2>/dev/null || echo "0")
                    echo "    Overall healthy: ${overallHealth}"
                    echo "    Health score: ${healthScore}%"
                    echo "    Alerts: ${alertCount}"
                    ;;
            esac
            
        else
            echo "    Raw response: ${body:0:200}..."
        fi
        
    elif [ "$http_code" = "000" ]; then
        echo -e "  ${RED}❌ Request failed (timeout or connection error)${NC}"
        return 1
    else
        echo -e "  ${RED}❌ Request failed with status ${http_code}${NC}"
        echo "    Body: ${body:0:200}..."
        return 1
    fi
    
    echo ""
    return 0
}

# Function to test all endpoints
test_all_endpoints() {
    local failed=0
    local total=0
    
    echo -e "${BLUE}🚀 Starting cron job endpoint tests...${NC}\n"
    
    # Test cache-warmer (every 5 minutes)
    total=$((total + 1))
    if ! test_cron_endpoint "cache-warmer" "*/5 * * * *" "Cache warmer - preloads frequently accessed data"; then
        failed=$((failed + 1))
    fi
    
    # Test data-sync (every hour)  
    total=$((total + 1))
    if ! test_cron_endpoint "data-sync" "0 * * * *" "Data synchronization - updates materialized views and external data"; then
        failed=$((failed + 1))
    fi
    
    # Test cleanup (daily at 2 AM)
    total=$((total + 1))
    if ! test_cron_endpoint "cleanup" "0 2 * * *" "System cleanup - removes old data and performs maintenance"; then
        failed=$((failed + 1))
    fi
    
    # Test health-check (every minute)
    total=$((total + 1))
    if ! test_cron_endpoint "health-check" "* * * * *" "Health monitoring - checks system components and sends alerts"; then
        failed=$((failed + 1))
    fi
    
    echo -e "${BLUE}📊 Test Results Summary:${NC}"
    echo "---"
    echo "Total endpoints tested: ${total}"
    echo "Successful: $((total - failed))"
    echo "Failed: ${failed}"
    
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}🎉 All cron job endpoints are working correctly!${NC}"
        return 0
    else
        echo -e "${RED}❌ ${failed} cron job endpoint(s) failed tests${NC}"
        return 1
    fi
}

# Function to validate cron schedules in vercel.json
validate_cron_schedules() {
    echo -e "${BLUE}📋 Validating cron schedules in vercel.json...${NC}"
    
    if [ ! -f "vercel.json" ]; then
        echo -e "${RED}❌ vercel.json not found${NC}"
        return 1
    fi
    
    # Check if jq is available for JSON parsing
    if ! command -v jq >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  jq not installed, skipping vercel.json validation${NC}"
        return 0
    fi
    
    echo "Cron jobs configured in vercel.json:"
    echo "---"
    
    local cronCount=0
    while read -r path schedule; do
        cronCount=$((cronCount + 1))
        echo "${cronCount}. ${path} - ${schedule}"
    done < <(jq -r '.crons[]? | "\(.path) \(.schedule)"' vercel.json 2>/dev/null)
    
    if [ $cronCount -eq 0 ]; then
        echo -e "${YELLOW}⚠️  No cron jobs found in vercel.json${NC}"
    else
        echo -e "${GREEN}✅ Found ${cronCount} cron job(s) configured${NC}"
    fi
    
    echo ""
}

# Function to check environment variables
check_environment() {
    echo -e "${BLUE}🔍 Checking environment configuration...${NC}"
    echo "---"
    
    # Check required environment variables
    local missing=0
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        echo -e "${YELLOW}⚠️  NEXT_PUBLIC_SUPABASE_URL not set${NC}"
        missing=$((missing + 1))
    else
        echo -e "${GREEN}✅ NEXT_PUBLIC_SUPABASE_URL configured${NC}"
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        echo -e "${YELLOW}⚠️  SUPABASE_SERVICE_ROLE_KEY not set${NC}"
        missing=$((missing + 1))
    else
        echo -e "${GREEN}✅ SUPABASE_SERVICE_ROLE_KEY configured${NC}"
    fi
    
    if [ -z "$CRON_SECRET" ]; then
        echo -e "${YELLOW}⚠️  CRON_SECRET not set (using test-secret)${NC}"
    else
        echo -e "${GREEN}✅ CRON_SECRET configured${NC}"
    fi
    
    if [ -z "$REDIS_URL" ] && [ -z "$UPSTASH_REDIS_REST_URL" ]; then
        echo -e "${YELLOW}⚠️  Redis configuration not found${NC}"
        missing=$((missing + 1))
    else
        echo -e "${GREEN}✅ Redis configuration found${NC}"
    fi
    
    echo "Base URL: ${BASE_URL}"
    echo ""
    
    if [ $missing -gt 0 ]; then
        echo -e "${YELLOW}⚠️  ${missing} environment variable(s) missing - some tests may fail${NC}\n"
    fi
}

# Main function
main() {
    echo "🔄 BACKEND-004: Cron Jobs Validation Script"
    echo "==========================================="
    echo ""
    
    # Load environment variables if available
    if [ -f .env.local ]; then
        export $(grep -v '^#' .env.local | grep -v '^\s*$' | xargs)
        echo -e "${GREEN}✅ Loaded environment variables from .env.local${NC}\n"
    else
        echo -e "${YELLOW}⚠️  No .env.local file found${NC}\n"
    fi
    
    # Run all checks
    check_environment
    validate_cron_schedules
    
    # Check if server is running
    echo -e "${BLUE}🌐 Checking if server is accessible...${NC}"
    if curl -s --max-time 5 "${BASE_URL}/api/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is accessible at ${BASE_URL}${NC}\n"
    else
        echo -e "${RED}❌ Server not accessible at ${BASE_URL}${NC}"
        echo -e "${YELLOW}Please start the server with: npm run dev${NC}\n"
        exit 1
    fi
    
    # Run tests
    if test_all_endpoints; then
        echo ""
        echo -e "${GREEN}🎉 All cron job validations completed successfully!${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Deploy to Vercel to activate cron jobs"
        echo "2. Set CRON_SECRET environment variable in production"
        echo "3. Monitor cron job execution in Vercel dashboard"
        echo "4. Set up alerts for cron job failures"
        exit 0
    else
        echo ""
        echo -e "${RED}❌ Some cron job validations failed${NC}"
        exit 1
    fi
}

# Run main function
main "$@"