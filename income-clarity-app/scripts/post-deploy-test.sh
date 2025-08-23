#!/bin/bash

# Post-Deployment Test Suite for Income Clarity
# Comprehensive testing after deployment to verify all functionality works

set -euo pipefail

# Configuration
PRODUCTION_URL="${PRODUCTION_URL:-https://incomeclarity.ddns.net}"
TEST_EMAIL="${TEST_EMAIL:-test@example.com}"
TEST_PASSWORD="${TEST_PASSWORD:-password123}"
TEST_TIMEOUT="${TEST_TIMEOUT:-30}"
LOG_FILE="/tmp/post-deploy-test-$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Logging function
log() {
    echo -e "${1}" | tee -a "${LOG_FILE}"
}

error_exit() {
    log "${RED}❌ CRITICAL ERROR: ${1}${NC}"
    exit 1
}

success() {
    log "${GREEN}✅ SUCCESS: ${1}${NC}"
}

warning() {
    log "${YELLOW}⚠️  WARNING: ${1}${NC}"
}

info() {
    log "${BLUE}ℹ️  INFO: ${1}${NC}"
}

# Test result functions
test_passed() {
    ((TESTS_TOTAL++))
    ((TESTS_PASSED++))
    success "TEST PASSED: ${1}"
}

test_failed() {
    ((TESTS_TOTAL++))
    ((TESTS_FAILED++))
    log "${RED}❌ TEST FAILED: ${1}${NC}"
}

test_skipped() {
    ((TESTS_TOTAL++))
    ((TESTS_SKIPPED++))
    warning "TEST SKIPPED: ${1}"
}

# Display banner
show_banner() {
    echo -e "${PURPLE}"
    cat << "EOF"
  ____           _     ____             _             
 |  _ \ ___  ___| |_  |  _ \  ___ _ __ | | ___  _   _ 
 | |_) / _ \/ __| __| | | | |/ _ \ '_ \| |/ _ \| | | |
 |  __/ (_) \__ \ |_  | |_| |  __/ |_) | | (_) | |_| |
 |_|   \___/|___/\__| |____/ \___| .__/|_|\___/ \__, |
                                 |_|           |___/ 
  _____         _   
 |_   _|__  ___| |_ 
   | |/ _ \/ __| __|
   | |  __/\__ \ |_ 
   |_|\___||___/\__|
                   
EOF
    echo -e "${NC}"
    log "${PURPLE}🧪 Income Clarity Post-Deployment Test Suite${NC}"
    log "🌐 Target URL: ${PRODUCTION_URL}"
    log "📅 $(date)"
    log "📋 Log file: ${LOG_FILE}"
    echo
}

# Test deployment status endpoint
test_deployment_status() {
    log "${BLUE}🔍 Testing deployment status endpoint...${NC}"
    
    local status_url="${PRODUCTION_URL}/api/deployment/status"
    local response=$(curl -s -w "%{http_code}" "${status_url}" 2>/dev/null || echo "000")
    local http_code="${response: -3}"
    local body="${response%???}"
    
    if [[ "${http_code}" == "200" ]]; then
        test_passed "Deployment status endpoint accessible (200)"
        
        # Parse deployment info if possible
        if command -v jq >/dev/null 2>&1 && echo "${body}" | jq . >/dev/null 2>&1; then
            local version=$(echo "${body}" | jq -r '.version // "unknown"')
            local commit=$(echo "${body}" | jq -r '.commit // "unknown"')
            local healthy=$(echo "${body}" | jq -r '.healthy // false')
            
            info "  Deployed version: ${version}"
            info "  Deployed commit: ${commit:0:8}"
            info "  Health status: ${healthy}"
            
            if [[ "${healthy}" == "true" ]]; then
                test_passed "Deployment reports healthy status"
            else
                test_failed "Deployment reports unhealthy status"
            fi
        else
            test_failed "Deployment status response is not valid JSON"
        fi
    else
        test_failed "Deployment status endpoint not accessible (${http_code})"
    fi
}

# Test health endpoint
test_health_endpoint() {
    log "${BLUE}🏥 Testing health endpoint...${NC}"
    
    local health_url="${PRODUCTION_URL}/api/health"
    local status_code=$(curl -s -w "%{http_code}" -o /dev/null "${health_url}" 2>/dev/null || echo "000")
    
    if [[ "${status_code}" == "200" ]]; then
        test_passed "Health endpoint accessible (200)"
        
        # Test response content
        local health_response=$(curl -s "${health_url}" 2>/dev/null || echo "{}")
        if [[ -n "${health_response}" ]] && [[ "${health_response}" != "{}" ]]; then
            test_passed "Health endpoint returns response data"
        else
            test_failed "Health endpoint returns empty response"
        fi
    else
        test_failed "Health endpoint not accessible (${status_code})"
    fi
}

# Test homepage accessibility
test_homepage() {
    log "${BLUE}🏠 Testing homepage accessibility...${NC}"
    
    local status_code=$(curl -s -w "%{http_code}" -o /dev/null "${PRODUCTION_URL}/" 2>/dev/null || echo "000")
    
    if [[ "${status_code}" == "200" ]]; then
        test_passed "Homepage accessible (200)"
        
        # Test content
        local content=$(curl -s "${PRODUCTION_URL}/" 2>/dev/null || echo "")
        if echo "${content}" | grep -q "Income Clarity" || echo "${content}" | grep -q "DOCTYPE"; then
            test_passed "Homepage contains expected content"
        else
            test_failed "Homepage content unexpected or missing"
        fi
        
        # Test for basic HTML structure
        if echo "${content}" | grep -q "<html\|<head\|<body"; then
            test_passed "Homepage has valid HTML structure"
        else
            test_failed "Homepage missing basic HTML structure"
        fi
    else
        test_failed "Homepage not accessible (${status_code})"
    fi
}

# Test authentication endpoints
test_authentication() {
    log "${BLUE}🔐 Testing authentication endpoints...${NC}"
    
    # Test auth/me endpoint (should return 401 for unauthenticated)
    local auth_url="${PRODUCTION_URL}/api/auth/me"
    local status_code=$(curl -s -w "%{http_code}" -o /dev/null "${auth_url}" 2>/dev/null || echo "000")
    
    if [[ "${status_code}" == "401" ]]; then
        test_passed "Auth endpoint correctly rejects unauthenticated requests (401)"
    elif [[ "${status_code}" == "200" ]]; then
        warning "Auth endpoint returned 200 - may be authenticated session"
        test_passed "Auth endpoint accessible (200)"
    else
        test_failed "Auth endpoint unexpected response (${status_code})"
    fi
    
    # Test login page
    local login_url="${PRODUCTION_URL}/auth/login"
    local login_status=$(curl -s -w "%{http_code}" -o /dev/null "${login_url}" 2>/dev/null || echo "000")
    
    if [[ "${login_status}" == "200" ]]; then
        test_passed "Login page accessible (200)"
    else
        test_failed "Login page not accessible (${login_status})"
    fi
}

# Test dashboard routing
test_dashboard_routing() {
    log "${BLUE}📊 Testing dashboard routing...${NC}"
    
    # Test dashboard (should redirect to login or show dashboard if authenticated)
    local dashboard_url="${PRODUCTION_URL}/dashboard"
    local status_code=$(curl -s -w "%{http_code}" -o /dev/null "${dashboard_url}" 2>/dev/null || echo "000")
    
    if [[ "${status_code}" == "200" ]] || [[ "${status_code}" == "302" ]] || [[ "${status_code}" == "307" ]]; then
        test_passed "Dashboard routing working (${status_code})"
    else
        test_failed "Dashboard routing unexpected (${status_code})"
    fi
    
    # Test super cards dashboard
    local super_cards_url="${PRODUCTION_URL}/dashboard/super-cards"
    local super_status=$(curl -s -w "%{http_code}" -o /dev/null "${super_cards_url}" 2>/dev/null || echo "000")
    
    if [[ "${super_status}" == "200" ]] || [[ "${super_status}" == "302" ]] || [[ "${super_status}" == "307" ]]; then
        test_passed "Super cards dashboard routing working (${super_status})"
    else
        test_failed "Super cards dashboard routing unexpected (${super_status})"
    fi
}

# Test API endpoints
test_api_endpoints() {
    log "${BLUE}🔌 Testing API endpoints...${NC}"
    
    local endpoints=(
        "/api/health"
        "/api/auth/me"
        "/api/super-cards/performance-hub"
        "/api/deployment/status"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local url="${PRODUCTION_URL}${endpoint}"
        local status_code=$(curl -s -w "%{http_code}" -o /dev/null "${url}" 2>/dev/null || echo "000")
        
        if [[ "${status_code}" == "200" ]] || [[ "${status_code}" == "401" ]]; then
            test_passed "API endpoint ${endpoint} responding (${status_code})"
        else
            test_failed "API endpoint ${endpoint} not responding correctly (${status_code})"
        fi
    done
}

# Test static assets
test_static_assets() {
    log "${BLUE}📁 Testing static assets...${NC}"
    
    # Test favicon
    local favicon_status=$(curl -s -w "%{http_code}" -o /dev/null "${PRODUCTION_URL}/favicon.ico" 2>/dev/null || echo "000")
    if [[ "${favicon_status}" == "200" ]]; then
        test_passed "Favicon accessible (200)"
    else
        test_failed "Favicon not accessible (${favicon_status})"
    fi
    
    # Test robots.txt (optional)
    local robots_status=$(curl -s -w "%{http_code}" -o /dev/null "${PRODUCTION_URL}/robots.txt" 2>/dev/null || echo "000")
    if [[ "${robots_status}" == "200" ]]; then
        test_passed "Robots.txt accessible (200)"
    elif [[ "${robots_status}" == "404" ]]; then
        test_skipped "Robots.txt not found (404) - optional file"
    else
        warning "Robots.txt unexpected status (${robots_status})"
    fi
}

# Test progressive disclosure
test_progressive_disclosure() {
    log "${BLUE}🎯 Testing progressive disclosure...${NC}"
    
    # Test Level 1 (momentum dashboard)
    local level1_url="${PRODUCTION_URL}/dashboard/super-cards"
    local level1_status=$(curl -s -w "%{http_code}" -o /dev/null "${level1_url}" 2>/dev/null || echo "000")
    
    if [[ "${level1_status}" == "200" ]] || [[ "${level1_status}" == "302" ]] || [[ "${level1_status}" == "307" ]]; then
        test_passed "Progressive Disclosure Level 1 accessible (${level1_status})"
    else
        test_failed "Progressive Disclosure Level 1 not accessible (${level1_status})"
    fi
    
    # Test Level 2 (hero view)
    local level2_url="${PRODUCTION_URL}/dashboard/super-cards?view=hero-view&card=performance"
    local level2_status=$(curl -s -w "%{http_code}" -o /dev/null "${level2_url}" 2>/dev/null || echo "000")
    
    if [[ "${level2_status}" == "200" ]] || [[ "${level2_status}" == "302" ]] || [[ "${level2_status}" == "307" ]]; then
        test_passed "Progressive Disclosure Level 2 accessible (${level2_status})"
    else
        test_failed "Progressive Disclosure Level 2 not accessible (${level2_status})"
    fi
    
    # Test Level 3 (detailed view)
    local level3_url="${PRODUCTION_URL}/dashboard/super-cards?view=detailed&card=income"
    local level3_status=$(curl -s -w "%{http_code}" -o /dev/null "${level3_url}" 2>/dev/null || echo "000")
    
    if [[ "${level3_status}" == "200" ]] || [[ "${level3_status}" == "302" ]] || [[ "${level3_status}" == "307" ]]; then
        test_passed "Progressive Disclosure Level 3 accessible (${level3_status})"
    else
        test_failed "Progressive Disclosure Level 3 not accessible (${level3_status})"
    fi
}

# Test performance metrics
test_performance() {
    log "${BLUE}⚡ Testing performance metrics...${NC}"
    
    # Test homepage response time
    local start_time=$(date +%s%N)
    curl -s "${PRODUCTION_URL}/" >/dev/null 2>&1 || true
    local end_time=$(date +%s%N)
    local response_time=$(( (end_time - start_time) / 1000000 )) # Convert to milliseconds
    
    info "Homepage response time: ${response_time}ms"
    
    if [[ ${response_time} -lt 3000 ]]; then
        test_passed "Homepage response time acceptable (<3s)"
    elif [[ ${response_time} -lt 10000 ]]; then
        warning "Homepage response time slow (${response_time}ms)"
        test_passed "Homepage response time within limits (<10s)"
    else
        test_failed "Homepage response time too slow (${response_time}ms)"
    fi
    
    # Test API response time
    start_time=$(date +%s%N)
    curl -s "${PRODUCTION_URL}/api/health" >/dev/null 2>&1 || true
    end_time=$(date +%s%N)
    local api_response_time=$(( (end_time - start_time) / 1000000 ))
    
    info "API response time: ${api_response_time}ms"
    
    if [[ ${api_response_time} -lt 1000 ]]; then
        test_passed "API response time excellent (<1s)"
    elif [[ ${api_response_time} -lt 5000 ]]; then
        test_passed "API response time acceptable (<5s)"
    else
        test_failed "API response time too slow (${api_response_time}ms)"
    fi
}

# Test console errors (if possible)
test_console_errors() {
    log "${BLUE}🖥️  Testing for console errors...${NC}"
    
    # This test requires a browser automation tool
    # For now, we'll skip it and note it as a manual test
    test_skipped "Console error testing requires browser automation (manual verification needed)"
    
    info "  Manual check: Open ${PRODUCTION_URL} in browser and verify no console errors"
    info "  Manual check: Navigate through app and verify functionality"
}

# Generate test report
generate_test_report() {
    log "${BLUE}📊 Generating test report...${NC}"
    
    local report_file="/tmp/post-deploy-test-report-$(date +%Y%m%d_%H%M%S).json"
    local success_rate=0
    
    if [[ ${TESTS_TOTAL} -gt 0 ]]; then
        success_rate=$(( (TESTS_PASSED * 100) / TESTS_TOTAL ))
    fi
    
    cat > "${report_file}" << EOF
{
  "test_run": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "target_url": "${PRODUCTION_URL}",
    "log_file": "${LOG_FILE}"
  },
  "results": {
    "total_tests": ${TESTS_TOTAL},
    "passed": ${TESTS_PASSED},
    "failed": ${TESTS_FAILED},
    "skipped": ${TESTS_SKIPPED},
    "success_rate": ${success_rate}
  },
  "status": {
    "overall": "$(if [[ ${TESTS_FAILED} -eq 0 ]]; then echo "PASSED"; else echo "FAILED"; fi)",
    "deployment_verified": $(if [[ ${TESTS_FAILED} -eq 0 ]]; then echo "true"; else echo "false"; fi)
  }
}
EOF
    
    success "Test report generated: ${report_file}"
    
    # Display summary
    echo
    log "${PURPLE}🧪 POST-DEPLOYMENT TEST SUMMARY${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    if [[ ${TESTS_FAILED} -eq 0 ]]; then
        log "${GREEN}✅ ALL TESTS PASSED - DEPLOYMENT VERIFIED${NC}"
    else
        log "${RED}❌ ${TESTS_FAILED} TESTS FAILED - REVIEW REQUIRED${NC}"
    fi
    
    log "📊 Results: ${TESTS_PASSED}/${TESTS_TOTAL} passed (${success_rate}% success rate)"
    log "⏭️  Skipped: ${TESTS_SKIPPED} tests"
    log "🌐 Target: ${PRODUCTION_URL}"
    log "📋 Report: ${report_file}"
    log "📝 Log: ${LOG_FILE}"
    log "📅 $(date)"
    echo
    
    # Exit with appropriate code
    if [[ ${TESTS_FAILED} -gt 0 ]]; then
        exit 1
    fi
}

# Main function
main() {
    show_banner
    
    # Run all test suites
    test_deployment_status
    test_health_endpoint
    test_homepage
    test_authentication
    test_dashboard_routing
    test_api_endpoints
    test_static_assets
    test_progressive_disclosure
    test_performance
    test_console_errors
    
    # Generate final report
    generate_test_report
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --url)
            PRODUCTION_URL="$2"
            shift 2
            ;;
        --email)
            TEST_EMAIL="$2"
            shift 2
            ;;
        --password)
            TEST_PASSWORD="$2"
            shift 2
            ;;
        --timeout)
            TEST_TIMEOUT="$2"
            shift 2
            ;;
        --help|-h)
            cat << EOF
Usage: $0 [options]

Options:
    --url URL          Target URL for testing (default: ${PRODUCTION_URL})
    --email EMAIL      Test email for authentication (default: ${TEST_EMAIL})
    --password PASS    Test password for authentication (default: ${TEST_PASSWORD})
    --timeout SECONDS  Request timeout (default: ${TEST_TIMEOUT})
    --help, -h         Show this help message

Examples:
    $0
    $0 --url https://staging.incomeclarity.ddns.net
    $0 --url http://localhost:3000 --timeout 10

EOF
            exit 0
            ;;
        *)
            error_exit "Unknown option: $1. Use --help for usage information."
            ;;
    esac
done

# Run main function
main "$@"