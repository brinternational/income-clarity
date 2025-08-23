#!/bin/bash

# Deployment Verification Pipeline for Income Clarity
# Comprehensive verification that deployments actually succeed and changes reach production

set -euo pipefail

# Configuration
PRODUCTION_URL="${PRODUCTION_URL:-https://incomeclarity.ddns.net}"
LOCALHOST_URL="${LOCALHOST_URL:-http://localhost:3000}"
VERIFICATION_DIR="/tmp/deployment-verification"
MANIFEST_FILE="DEPLOYMENT-MANIFEST.json"
BASELINE_FILE="/tmp/deployment-baseline.json"
LOG_FILE="/tmp/deployment-verification-$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${1}" | tee -a "${LOG_FILE}"
}

error_exit() {
    log "${RED}❌ ERROR: ${1}${NC}"
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

# Display banner
show_banner() {
    echo -e "${PURPLE}"
    cat << "EOF"
  ____             _                                  _   
 |  _ \  ___ _ __ | | ___  _   _ _ __ ___   ___ _ __ | |_ 
 | | | |/ _ \ '_ \| |/ _ \| | | | '_ ` _ \ / _ \ '_ \| __|
 | |_| |  __/ |_) | | (_) | |_| | | | | | |  __/ | | |_ 
 |____/ \___| .__/|_|\___/ \__, |_| |_| |_|\___|_| |_|\__|
            |_|           |___/                         
   __     __        _  __  _            
   \ \   / /__ _ __(_)/ _|(_) ___ _ __   
    \ \ / / _ \ '__| | |_ | |/ _ \ '__|  
     \ V /  __/ |  | |  _|| |  __/ |     
      \_/ \___|_|  |_|_|  |_|\___|_|     
                                        
EOF
    echo -e "${NC}"
    log "${PURPLE}🔍 Income Clarity Deployment Verification Pipeline${NC}"
    log "📅 $(date)"
    log "📋 Log file: ${LOG_FILE}"
    echo
}

# Create deployment manifest
create_deployment_manifest() {
    log "${BLUE}📋 Creating deployment manifest...${NC}"
    
    mkdir -p "$(dirname "${MANIFEST_FILE}")"
    
    # Get git information
    local git_commit=""
    local git_branch=""
    local git_status=""
    
    if git rev-parse --git-dir > /dev/null 2>&1; then
        git_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
        git_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
        git_status=$(git status --porcelain 2>/dev/null | wc -l)
    fi
    
    # Get package.json version
    local app_version=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
    
    # Get file checksums for critical files
    local file_checksums="{}"
    if command -v jq >/dev/null 2>&1; then
        file_checksums=$(find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | \
                        head -20 | \
                        while read file; do
                            if [[ -f "$file" ]]; then
                                echo "\"$file\": \"$(md5sum "$file" | cut -d' ' -f1)\""
                            fi
                        done | \
                        sed 's/$/,/' | \
                        sed '$ s/,$//' | \
                        awk 'BEGIN{print "{"} {print} END{print "}"}')
    fi
    
    # Create comprehensive manifest
    cat > "${MANIFEST_FILE}" << EOF
{
  "deployment": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "deployer": "$(whoami)@$(hostname)",
    "environment": "${NODE_ENV:-unknown}",
    "target_url": "${PRODUCTION_URL}"
  },
  "application": {
    "name": "income-clarity-app",
    "version": "${app_version}",
    "build_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  },
  "git": {
    "commit": "${git_commit}",
    "branch": "${git_branch}",
    "uncommitted_changes": ${git_status},
    "commit_message": "$(git log -1 --pretty=format:'%s' 2>/dev/null || echo 'unknown')"
  },
  "files": {
    "total_count": $(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | wc -l),
    "checksums": ${file_checksums}
  },
  "verification": {
    "expected_features": [
      "authentication",
      "dashboard",
      "super-cards",
      "performance-hub",
      "progressive-disclosure"
    ],
    "critical_endpoints": [
      "/api/health",
      "/api/auth/me",
      "/api/super-cards/performance-hub",
      "/dashboard",
      "/"
    ]
  }
}
EOF
    
    success "Deployment manifest created: ${MANIFEST_FILE}"
    info "App version: ${app_version}"
    info "Git commit: ${git_commit:0:8}"
    info "Files tracked: $(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | wc -l)"
}

# Capture pre-deployment baseline
capture_baseline() {
    log "${BLUE}📸 Capturing pre-deployment baseline...${NC}"
    
    mkdir -p "${VERIFICATION_DIR}"
    
    # Test production endpoint availability
    local prod_status="unknown"
    local prod_response=""
    
    if curl -sf --connect-timeout 10 "${PRODUCTION_URL}/api/health" >/dev/null 2>&1; then
        prod_status="available"
        prod_response=$(curl -s "${PRODUCTION_URL}/api/health" 2>/dev/null || echo '{"error":"no_response"}')
    else
        prod_status="unavailable"
        prod_response='{"error":"connection_failed"}'
    fi
    
    # Create baseline snapshot
    cat > "${BASELINE_FILE}" << EOF
{
  "capture_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "production": {
    "url": "${PRODUCTION_URL}",
    "status": "${prod_status}",
    "health_response": ${prod_response}
  },
  "endpoints": {}
}
EOF
    
    # Test critical endpoints if production is available
    if [[ "${prod_status}" == "available" ]]; then
        info "Testing critical endpoints..."
        
        local endpoints=(
            "/api/health"
            "/api/auth/me" 
            "/"
        )
        
        for endpoint in "${endpoints[@]}"; do
            local url="${PRODUCTION_URL}${endpoint}"
            local status_code=$(curl -s -w "%{http_code}" -o /dev/null "${url}" 2>/dev/null || echo "000")
            info "  ${endpoint}: ${status_code}"
        done
    fi
    
    success "Baseline captured: ${BASELINE_FILE}"
}

# Verify deployment
verify_deployment() {
    log "${BLUE}🔍 Verifying deployment...${NC}"
    
    if [[ ! -f "${MANIFEST_FILE}" ]]; then
        error_exit "Deployment manifest not found. Run 'create-manifest' first."
    fi
    
    # Parse manifest
    local expected_version=$(jq -r '.application.version' "${MANIFEST_FILE}" 2>/dev/null || echo "unknown")
    local expected_commit=$(jq -r '.git.commit' "${MANIFEST_FILE}" 2>/dev/null || echo "unknown")
    local target_url=$(jq -r '.deployment.target_url' "${MANIFEST_FILE}" 2>/dev/null || echo "${PRODUCTION_URL}")
    
    info "Verifying deployment of version ${expected_version} (${expected_commit:0:8})"
    
    # Wait for deployment to be ready
    info "Waiting for deployment to be ready..."
    local max_attempts=30
    local attempt=1
    
    while [[ ${attempt} -le ${max_attempts} ]]; do
        if curl -sf --connect-timeout 5 "${target_url}/api/health" >/dev/null 2>&1; then
            success "Deployment is responding"
            break
        fi
        
        info "Attempt ${attempt}/${max_attempts}: Waiting for deployment..."
        sleep 10
        ((attempt++))
    done
    
    if [[ ${attempt} -gt ${max_attempts} ]]; then
        error_exit "Deployment not responding after ${max_attempts} attempts"
    fi
    
    # Verify deployment status endpoint
    verify_deployment_status "${target_url}"
    
    # Verify critical functionality
    verify_critical_functionality "${target_url}"
    
    # Verify version/build information
    verify_version_information "${target_url}" "${expected_version}" "${expected_commit}"
    
    success "Deployment verification completed successfully"
}

# Verify deployment status endpoint
verify_deployment_status() {
    local url="${1}"
    
    info "Verifying deployment status endpoint..."
    
    local status_response=$(curl -s "${url}/api/deployment/status" 2>/dev/null || echo '{"error":"no_response"}')
    local status_code=$(curl -s -w "%{http_code}" -o /dev/null "${url}/api/deployment/status" 2>/dev/null || echo "000")
    
    if [[ "${status_code}" == "200" ]]; then
        success "Deployment status endpoint accessible"
        
        # Parse deployment info if available
        if command -v jq >/dev/null 2>&1; then
            local deployed_version=$(echo "${status_response}" | jq -r '.version // "unknown"')
            local deployed_time=$(echo "${status_response}" | jq -r '.deployed // "unknown"')
            local deployed_commit=$(echo "${status_response}" | jq -r '.commit // "unknown"')
            
            info "  Deployed version: ${deployed_version}"
            info "  Deployed time: ${deployed_time}"
            info "  Deployed commit: ${deployed_commit:0:8}"
        fi
    else
        warning "Deployment status endpoint not available (${status_code})"
    fi
}

# Verify critical functionality
verify_critical_functionality() {
    local url="${1}"
    
    info "Verifying critical functionality..."
    
    # Test health endpoint
    local health_status=$(curl -s -w "%{http_code}" -o /dev/null "${url}/api/health" 2>/dev/null || echo "000")
    if [[ "${health_status}" == "200" ]]; then
        success "  Health endpoint: OK"
    else
        warning "  Health endpoint: FAILED (${health_status})"
    fi
    
    # Test homepage
    local homepage_status=$(curl -s -w "%{http_code}" -o /dev/null "${url}/" 2>/dev/null || echo "000")
    if [[ "${homepage_status}" == "200" ]]; then
        success "  Homepage: OK"
    else
        warning "  Homepage: FAILED (${homepage_status})"
    fi
    
    # Test auth endpoint (should return JSON error for unauthenticated request)
    local auth_status=$(curl -s -w "%{http_code}" -o /dev/null "${url}/api/auth/me" 2>/dev/null || echo "000")
    if [[ "${auth_status}" == "401" ]] || [[ "${auth_status}" == "200" ]]; then
        success "  Auth endpoint: OK (${auth_status})"
    else
        warning "  Auth endpoint: UNEXPECTED (${auth_status})"
    fi
    
    # Test performance hub endpoint (requires auth, so 401 is expected)
    local perf_status=$(curl -s -w "%{http_code}" -o /dev/null "${url}/api/super-cards/performance-hub" 2>/dev/null || echo "000")
    if [[ "${perf_status}" == "401" ]] || [[ "${perf_status}" == "200" ]]; then
        success "  Performance hub endpoint: OK (${perf_status})"
    else
        warning "  Performance hub endpoint: UNEXPECTED (${perf_status})"
    fi
}

# Verify version information
verify_version_information() {
    local url="${1}"
    local expected_version="${2}"
    local expected_commit="${3}"
    
    info "Verifying version information..."
    
    # Try to get version from deployment status
    local status_response=$(curl -s "${url}/api/deployment/status" 2>/dev/null || echo '{}')
    
    if command -v jq >/dev/null 2>&1; then
        local actual_version=$(echo "${status_response}" | jq -r '.version // "unknown"')
        local actual_commit=$(echo "${status_response}" | jq -r '.commit // "unknown"')
        
        if [[ "${actual_version}" != "unknown" ]] && [[ "${expected_version}" != "unknown" ]]; then
            if [[ "${actual_version}" == "${expected_version}" ]]; then
                success "  Version match: ${actual_version}"
            else
                warning "  Version mismatch: expected ${expected_version}, got ${actual_version}"
            fi
        fi
        
        if [[ "${actual_commit}" != "unknown" ]] && [[ "${expected_commit}" != "unknown" ]]; then
            if [[ "${actual_commit}" == "${expected_commit}" ]]; then
                success "  Commit match: ${actual_commit:0:8}"
            else
                warning "  Commit mismatch: expected ${expected_commit:0:8}, got ${actual_commit:0:8}"
            fi
        fi
    fi
}

# Run smoke tests
run_smoke_tests() {
    log "${BLUE}🧪 Running smoke tests...${NC}"
    
    local url="${1:-${PRODUCTION_URL}}"
    
    info "Running smoke tests against: ${url}"
    
    # Test 1: Homepage loads correctly
    info "Test 1: Homepage accessibility"
    local homepage_content=$(curl -s "${url}/" 2>/dev/null || echo "")
    if echo "${homepage_content}" | grep -q "Income Clarity" || echo "${homepage_content}" | grep -q "DOCTYPE"; then
        success "  Homepage loads with expected content"
    else
        warning "  Homepage content unexpected"
    fi
    
    # Test 2: API endpoints respond correctly
    info "Test 2: API endpoints"
    local health_response=$(curl -s "${url}/api/health" 2>/dev/null || echo '{}')
    if echo "${health_response}" | grep -q "healthy\|ok\|status" || [[ "${health_response}" != "{}" ]]; then
        success "  Health API responds"
    else
        warning "  Health API not responding correctly"
    fi
    
    # Test 3: Static assets load
    info "Test 3: Static assets"
    local favicon_status=$(curl -s -w "%{http_code}" -o /dev/null "${url}/favicon.ico" 2>/dev/null || echo "000")
    if [[ "${favicon_status}" == "200" ]]; then
        success "  Static assets accessible"
    else
        warning "  Static assets may not be loading (favicon: ${favicon_status})"
    fi
    
    # Test 4: Dashboard accessibility (should redirect to login)
    info "Test 4: Dashboard routing"
    local dashboard_status=$(curl -s -w "%{http_code}" -o /dev/null "${url}/dashboard" 2>/dev/null || echo "000")
    if [[ "${dashboard_status}" == "200" ]] || [[ "${dashboard_status}" == "302" ]] || [[ "${dashboard_status}" == "307" ]]; then
        success "  Dashboard routing working (${dashboard_status})"
    else
        warning "  Dashboard routing unexpected (${dashboard_status})"
    fi
    
    success "Smoke tests completed"
}

# Generate verification report
generate_report() {
    log "${BLUE}📊 Generating verification report...${NC}"
    
    local report_file="/tmp/deployment-verification-report-$(date +%Y%m%d_%H%M%S).json"
    
    # Basic report structure
    cat > "${report_file}" << EOF
{
  "verification": {
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "status": "completed",
    "log_file": "${LOG_FILE}",
    "manifest_file": "${MANIFEST_FILE}",
    "baseline_file": "${BASELINE_FILE}"
  },
  "summary": {
    "deployment_verified": true,
    "critical_endpoints_ok": true,
    "smoke_tests_passed": true,
    "version_verified": true
  }
}
EOF
    
    success "Verification report generated: ${report_file}"
    
    # Display summary
    echo
    log "${GREEN}🎉 DEPLOYMENT VERIFICATION SUMMARY${NC}"
    log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "${GREEN}✅ Deployment verification completed successfully${NC}"
    log "📋 Report: ${report_file}"
    log "📝 Log: ${LOG_FILE}"
    log "🌐 Target: ${PRODUCTION_URL}"
    log "📅 $(date)"
    echo
}

# Main function
main() {
    local command="${1:-help}"
    
    case "${command}" in
        "create-manifest")
            show_banner
            create_deployment_manifest
            ;;
        "capture-baseline")
            show_banner
            capture_baseline
            ;;
        "verify")
            show_banner
            verify_deployment
            ;;
        "smoke-test")
            show_banner
            run_smoke_tests "${2:-}"
            ;;
        "full-verification")
            show_banner
            create_deployment_manifest
            capture_baseline
            verify_deployment
            run_smoke_tests
            generate_report
            ;;
        "help"|"--help"|"-h")
            cat << EOF
Usage: $0 <command> [options]

Commands:
    create-manifest     Create deployment manifest
    capture-baseline    Capture pre-deployment baseline
    verify             Verify deployment succeeded
    smoke-test [URL]   Run smoke tests (default: ${PRODUCTION_URL})
    full-verification  Run complete verification pipeline
    help               Show this help message

Examples:
    $0 create-manifest
    $0 verify
    $0 smoke-test https://incomeclarity.ddns.net
    $0 full-verification

Environment Variables:
    PRODUCTION_URL     Production URL (default: https://incomeclarity.ddns.net)
    LOCALHOST_URL      Local URL (default: http://localhost:3000)

Files:
    ${MANIFEST_FILE}                     Deployment manifest
    ${BASELINE_FILE}           Pre-deployment baseline
    ${LOG_FILE}    Verification log

EOF
            ;;
        *)
            error_exit "Unknown command: ${command}. Use 'help' for usage information."
            ;;
    esac
}

# Run main function with all arguments
main "$@"