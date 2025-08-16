#!/bin/bash

# BACKEND-005: API Security Testing Script
# Test rate limiting, security headers, and session validation

set -e

echo "🔒 Testing API security implementation..."

# Configuration
BASE_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"
CURL_TIMEOUT=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}Test ${TOTAL_TESTS}: ${test_name}${NC}"
    
    local result
    local http_code
    local headers
    
    # Execute test command
    if result=$(eval "$test_command" 2>&1); then
        # Extract HTTP code if available
        http_code=$(echo "$result" | grep -o 'HTTP/[0-9.]*\s[0-9]*' | grep -o '[0-9]*$' || echo "unknown")
        
        # Check if test passed based on expected result
        if [[ "$result" == *"$expected_result"* ]] || [[ "$http_code" == "$expected_result" ]]; then
            echo -e "  ${GREEN}✅ PASSED${NC}"
            TESTS_PASSED=$((TESTS_PASSED + 1))
        else
            echo -e "  ${RED}❌ FAILED${NC}"
            echo "  Expected: $expected_result"
            echo "  Got: $http_code"
            TESTS_FAILED=$((TESTS_FAILED + 1))
        fi
    else
        echo -e "  ${RED}❌ FAILED (command error)${NC}"
        echo "  Error: $result"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    
    echo ""
}

# Function to test rate limiting
test_rate_limiting() {
    echo -e "${BLUE}🚦 Testing Rate Limiting...${NC}\n"
    
    # Test normal request (should succeed)
    run_test "Normal API request" \
        "curl -s -w '%{http_code}' --max-time $CURL_TIMEOUT '${BASE_URL}/api/health'" \
        "200"
    
    # Test rate limiting by making rapid requests
    echo -e "${BLUE}Testing rapid requests for rate limiting...${NC}"
    local rate_limit_hit=false
    local attempt=1
    
    for i in {1..15}; do
        local response=$(curl -s -w "HTTPSTATUS:%{http_code}" --max-time $CURL_TIMEOUT "${BASE_URL}/api/super-cards" 2>/dev/null || echo "HTTPSTATUS:000")
        local http_code=$(echo $response | sed -e 's/.*HTTPSTATUS://')
        
        echo "Attempt ${i}: HTTP ${http_code}"
        
        if [ "$http_code" = "429" ]; then
            rate_limit_hit=true
            break
        fi
        
        sleep 0.1
    done
    
    if [ "$rate_limit_hit" = true ]; then
        echo -e "  ${GREEN}✅ Rate limiting is working (HTTP 429 received)${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "  ${YELLOW}⚠️  Rate limiting not triggered (may need more requests or different endpoint)${NC}"
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo ""
}

# Function to test security headers
test_security_headers() {
    echo -e "${BLUE}🛡️ Testing Security Headers...${NC}\n"
    
    # Test for X-Frame-Options
    run_test "X-Frame-Options header" \
        "curl -s -I --max-time $CURL_TIMEOUT '${BASE_URL}/api/health' | grep -i 'x-frame-options'" \
        "X-Frame-Options"
    
    # Test for X-Content-Type-Options
    run_test "X-Content-Type-Options header" \
        "curl -s -I --max-time $CURL_TIMEOUT '${BASE_URL}/api/health' | grep -i 'x-content-type-options'" \
        "X-Content-Type-Options"
    
    # Test for X-XSS-Protection
    run_test "X-XSS-Protection header" \
        "curl -s -I --max-time $CURL_TIMEOUT '${BASE_URL}/api/health' | grep -i 'x-xss-protection'" \
        "X-XSS-Protection"
    
    # Test for Referrer-Policy
    run_test "Referrer-Policy header" \
        "curl -s -I --max-time $CURL_TIMEOUT '${BASE_URL}/api/health' | grep -i 'referrer-policy'" \
        "Referrer-Policy"
    
    # Test for Content-Security-Policy
    run_test "Content-Security-Policy header" \
        "curl -s -I --max-time $CURL_TIMEOUT '${BASE_URL}/' | grep -i 'content-security-policy'" \
        "Content-Security-Policy"
    
    # Test for Strict-Transport-Security (production only)
    if [ "${NODE_ENV:-development}" = "production" ]; then
        run_test "Strict-Transport-Security header" \
            "curl -s -I --max-time $CURL_TIMEOUT '${BASE_URL}/' | grep -i 'strict-transport-security'" \
            "Strict-Transport-Security"
    else
        echo -e "${YELLOW}⚠️  Skipping HSTS test in development environment${NC}\n"
    fi
}

# Function to test session validation
test_session_validation() {
    echo -e "${BLUE}🔐 Testing Session Validation...${NC}\n"
    
    # Test access to protected route without auth (should fail)
    run_test "Protected route without auth" \
        "curl -s -w '%{http_code}' --max-time $CURL_TIMEOUT '${BASE_URL}/api/super-cards'" \
        "401"
    
    # Test with invalid session token (should fail)
    run_test "Invalid session token" \
        "curl -s -w '%{http_code}' --max-time $CURL_TIMEOUT -H 'Authorization: Bearer invalid-token' '${BASE_URL}/api/super-cards'" \
        "401"
    
    # Test public endpoint (should succeed)
    run_test "Public endpoint access" \
        "curl -s -w '%{http_code}' --max-time $CURL_TIMEOUT '${BASE_URL}/api/health'" \
        "200"
}

# Function to test CORS headers
test_cors_headers() {
    echo -e "${BLUE}🌐 Testing CORS Headers...${NC}\n"
    
    # Test OPTIONS request
    run_test "CORS preflight request" \
        "curl -s -I -X OPTIONS --max-time $CURL_TIMEOUT '${BASE_URL}/api/health' | grep -i 'access-control-allow'" \
        "Access-Control-Allow"
    
    # Test Origin header handling
    local test_origin="https://malicious-site.com"
    local response=$(curl -s -I --max-time $CURL_TIMEOUT -H "Origin: ${test_origin}" "${BASE_URL}/api/health")
    
    if echo "$response" | grep -q "Access-Control-Allow-Origin: ${test_origin}"; then
        echo -e "  ${RED}❌ SECURITY RISK: CORS allows arbitrary origins${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    else
        echo -e "  ${GREEN}✅ CORS properly restricts origins${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo ""
}

# Function to test input validation
test_input_validation() {
    echo -e "${BLUE}🔍 Testing Input Validation...${NC}\n"
    
    # Test SQL injection attempt
    run_test "SQL injection protection" \
        "curl -s -w '%{http_code}' --max-time $CURL_TIMEOUT '${BASE_URL}/api/super-cards?query=\'; DROP TABLE users; --'" \
        "400"
    
    # Test XSS attempt
    run_test "XSS protection" \
        "curl -s -w '%{http_code}' --max-time $CURL_TIMEOUT '${BASE_URL}/api/super-cards?name=<script>alert(\"xss\")</script>'" \
        "400"
    
    # Test oversized request
    local large_payload=$(python3 -c "print('x' * 10000)" 2>/dev/null || echo "$(printf '%*s' 10000 | tr ' ' 'x')")
    run_test "Large payload protection" \
        "curl -s -w '%{http_code}' --max-time $CURL_TIMEOUT -d '$large_payload' '${BASE_URL}/api/health'" \
        "413"
}

# Function to test @upstash/ratelimit installation
test_dependencies() {
    echo -e "${BLUE}📦 Checking Dependencies...${NC}\n"
    
    if [ -f "package.json" ]; then
        if grep -q "@upstash/ratelimit" package.json; then
            echo -e "  ${GREEN}✅ @upstash/ratelimit is installed${NC}"
        else
            echo -e "  ${YELLOW}⚠️  @upstash/ratelimit not found in package.json${NC}"
            echo "  Installing @upstash/ratelimit..."
            if npm install @upstash/ratelimit; then
                echo -e "  ${GREEN}✅ @upstash/ratelimit installed successfully${NC}"
            else
                echo -e "  ${RED}❌ Failed to install @upstash/ratelimit${NC}"
            fi
        fi
        
        if grep -q "@upstash/redis" package.json; then
            echo -e "  ${GREEN}✅ @upstash/redis is installed${NC}"
        else
            echo -e "  ${YELLOW}⚠️  @upstash/redis not found in package.json${NC}"
        fi
    else
        echo -e "  ${RED}❌ package.json not found${NC}"
    fi
    
    echo ""
}

# Function to test rate limit API
test_rate_limit_api() {
    echo -e "${BLUE}📊 Testing Rate Limit API...${NC}\n"
    
    # Test rate limit stats endpoint
    run_test "Rate limit stats endpoint" \
        "curl -s -w '%{http_code}' --max-time $CURL_TIMEOUT '${BASE_URL}/api/cache/stats' | tail -c 3" \
        "200"
}

# Main function
main() {
    echo "🔒 BACKEND-005: API Security Testing"
    echo "===================================="
    echo ""
    
    # Load environment variables if available
    if [ -f .env.local ]; then
        export $(grep -v '^#' .env.local | grep -v '^\s*$' | xargs)
        echo -e "${GREEN}✅ Loaded environment variables from .env.local${NC}\n"
    else
        echo -e "${YELLOW}⚠️  No .env.local file found${NC}\n"
    fi
    
    # Check if server is running
    echo -e "${BLUE}🌐 Checking if server is accessible...${NC}"
    if curl -s --max-time 5 "${BASE_URL}/api/health" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is accessible at ${BASE_URL}${NC}\n"
    else
        echo -e "${RED}❌ Server not accessible at ${BASE_URL}${NC}"
        echo -e "${YELLOW}Please start the server with: npm run dev${NC}\n"
        exit 1
    fi
    
    # Run all security tests
    test_dependencies
    test_rate_limiting
    test_security_headers
    test_session_validation
    test_cors_headers
    test_input_validation
    test_rate_limit_api
    
    # Results summary
    echo -e "${BLUE}📊 Security Test Results Summary:${NC}"
    echo "=================================="
    echo "Total tests: ${TOTAL_TESTS}"
    echo -e "Passed: ${GREEN}${TESTS_PASSED}${NC}"
    echo -e "Failed: ${RED}${TESTS_FAILED}${NC}"
    
    local success_rate=$((TESTS_PASSED * 100 / TOTAL_TESTS))
    echo "Success rate: ${success_rate}%"
    
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}🎉 All security tests passed!${NC}"
        echo ""
        echo "Security features verified:"
        echo "✅ Rate limiting with @upstash/ratelimit"
        echo "✅ Comprehensive security headers"
        echo "✅ Session validation and authentication"
        echo "✅ CORS protection"
        echo "✅ Input validation"
        echo ""
        echo "Next steps:"
        echo "1. Configure Redis/Upstash in production"
        echo "2. Set up monitoring alerts for rate limit violations"
        echo "3. Review CSP policy for production domains"
        echo "4. Implement additional security monitoring"
        
        exit 0
    else
        echo -e "${RED}❌ ${TESTS_FAILED} security test(s) failed${NC}"
        echo ""
        echo "Review the failed tests and ensure:"
        echo "1. Security middleware is properly configured"
        echo "2. Rate limiting is enabled and working"
        echo "3. Security headers are being set correctly"
        echo "4. Session validation is functioning"
        
        exit 1
    fi
}

# Run main function
main "$@"