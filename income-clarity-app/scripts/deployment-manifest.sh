#!/bin/bash

# Deployment Manifest Generator for Income Clarity
# Creates comprehensive deployment manifests for tracking and verification

set -euo pipefail

# Configuration
MANIFEST_FILE="${MANIFEST_FILE:-DEPLOYMENT-MANIFEST.json}"
TARGET_URL="${TARGET_URL:-https://incomeclarity.ddns.net}"
LOG_FILE="/tmp/deployment-manifest-$(date +%Y%m%d_%H%M%S).log"

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
  __  __             _  __         _   
 |  \/  | __ _ _ __ (_)/ _| ___  __| |_ 
 | |\/| |/ _` | '_ \| | |_ / _ \/ _` | __|
 | |  | | (_| | | | | |  _|  __/ (_| | |_ 
 |_|  |_|\__,_|_| |_|_|_|  \___|\__,_|\__|
                                         
   ____                           _             
  / ___| ___ _ __   ___ _ __ __ _| |_ ___  _ __ 
 | |  _ / _ \ '_ \ / _ \ '__/ _` | __/ _ \| '__|
 | |_| |  __/ | | |  __/ | | (_| | || (_) | |   
  \____|\___|_| |_|\___|_|  \__,_|\__\___/|_|   
                                               
EOF
    echo -e "${NC}"
    log "${PURPLE}📋 Income Clarity Deployment Manifest Generator${NC}"
    log "📁 Output file: ${MANIFEST_FILE}"
    log "🌐 Target URL: ${TARGET_URL}"
    log "📅 $(date)"
    log "📋 Log file: ${LOG_FILE}"
    echo
}

# Get application information
get_app_info() {
    local app_name="income-clarity-app"
    local app_version="1.0.0"
    
    # Try to get from package.json
    if [[ -f "package.json" ]]; then
        if command -v jq >/dev/null 2>&1; then
            app_name=$(jq -r '.name // "income-clarity-app"' package.json 2>/dev/null)
            app_version=$(jq -r '.version // "1.0.0"' package.json 2>/dev/null)
        else
            # Fallback parsing without jq
            app_name=$(grep '"name"' package.json 2>/dev/null | head -1 | sed 's/.*"name"[^"]*"\([^"]*\)".*/\1/' || echo "income-clarity-app")
            app_version=$(grep '"version"' package.json 2>/dev/null | head -1 | sed 's/.*"version"[^"]*"\([^"]*\)".*/\1/' || echo "1.0.0")
        fi
    fi
    
    echo "${app_name}|${app_version}"
}

# Get Git information
get_git_info() {
    local git_commit="unknown"
    local git_branch="unknown"
    local git_changes=0
    local git_message="unknown"
    
    if git rev-parse --git-dir > /dev/null 2>&1; then
        git_commit=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
        git_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
        git_changes=$(git status --porcelain 2>/dev/null | wc -l || echo "0")
        git_message=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "unknown")
    fi
    
    echo "${git_commit}|${git_branch}|${git_changes}|${git_message}"
}

# Get file information
get_file_info() {
    local total_files=0
    local checksums_json="{}"
    
    # Count TypeScript/JavaScript files
    if command -v find >/dev/null 2>&1; then
        total_files=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null | wc -l || echo "0")
        
        # Generate checksums for critical files (limit to 10 for performance)
        if command -v md5sum >/dev/null 2>&1; then
            local checksum_data=""
            local file_count=0
            
            while IFS= read -r file && [[ ${file_count} -lt 10 ]]; do
                if [[ -f "${file}" ]]; then
                    local checksum=$(md5sum "${file}" 2>/dev/null | cut -d' ' -f1 || echo "unknown")
                    if [[ -n "${checksum_data}" ]]; then
                        checksum_data="${checksum_data},"
                    fi
                    checksum_data="${checksum_data}\"${file}\": \"${checksum}\""
                    ((file_count++))
                fi
            done < <(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) 2>/dev/null | head -10)
            
            if [[ -n "${checksum_data}" ]]; then
                checksums_json="{${checksum_data}}"
            fi
        fi
    fi
    
    echo "${total_files}|${checksums_json}"
}

# Get environment information
get_environment_info() {
    local deployer="unknown"
    local environment="${NODE_ENV:-unknown}"
    local node_version="${BASH_VERSION:-unknown}"
    
    # Get deployer info
    if command -v whoami >/dev/null 2>&1 && command -v hostname >/dev/null 2>&1; then
        local username=$(whoami 2>/dev/null || echo "unknown")
        local hostname=$(hostname 2>/dev/null || echo "unknown")
        deployer="${username}@${hostname}"
    fi
    
    # Get Node.js version if available
    if command -v node >/dev/null 2>&1; then
        node_version=$(node --version 2>/dev/null || echo "unknown")
    fi
    
    echo "${deployer}|${environment}|${node_version}"
}

# Generate manifest JSON
generate_manifest() {
    log "${BLUE}📋 Generating deployment manifest...${NC}"
    
    # Gather all information (capture output properly)
    info "Gathering application information..."
    local app_info
    app_info=$(get_app_info 2>/dev/null)
    
    info "Gathering Git information..."
    local git_info
    git_info=$(get_git_info 2>/dev/null)
    
    info "Gathering file information..."
    local file_info
    file_info=$(get_file_info 2>/dev/null)
    
    info "Gathering environment information..."
    local env_info
    env_info=$(get_environment_info 2>/dev/null)
    
    # Parse gathered information
    IFS='|' read -r app_name app_version <<< "${app_info}"
    IFS='|' read -r git_commit git_branch git_changes git_message <<< "${git_info}"
    IFS='|' read -r total_files checksums_json <<< "${file_info}"
    IFS='|' read -r deployer environment node_version <<< "${env_info}"
    
    # Get current timestamp
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    local build_time=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    # Create manifest JSON
    cat > "${MANIFEST_FILE}" << EOF
{
  "deployment": {
    "timestamp": "${timestamp}",
    "deployer": "${deployer}",
    "environment": "${environment}",
    "target_url": "${TARGET_URL}",
    "node_version": "${node_version}"
  },
  "application": {
    "name": "${app_name}",
    "version": "${app_version}",
    "build_time": "${build_time}"
  },
  "git": {
    "commit": "${git_commit}",
    "branch": "${git_branch}",
    "uncommitted_changes": ${git_changes},
    "commit_message": "${git_message}"
  },
  "files": {
    "total_count": ${total_files},
    "checksums": ${checksums_json}
  },
  "verification": {
    "expected_features": [
      "authentication",
      "dashboard", 
      "super-cards",
      "performance-hub",
      "progressive-disclosure",
      "yodlee-integration",
      "premium-features"
    ],
    "critical_endpoints": [
      "/api/health",
      "/api/auth/me",
      "/api/auth/login",
      "/api/super-cards/performance-hub",
      "/api/super-cards/income-hub",
      "/api/deployment/status",
      "/dashboard",
      "/dashboard/super-cards",
      "/"
    ],
    "required_status_codes": {
      "/": 200,
      "/api/health": 200,
      "/api/auth/me": [200, 401],
      "/api/deployment/status": 200,
      "/dashboard": [200, 302, 307],
      "/dashboard/super-cards": [200, 302, 307]
    }
  },
  "metadata": {
    "manifest_version": "1.0",
    "generator": "deployment-manifest.sh",
    "generated_by": "${deployer}",
    "generation_time": "${timestamp}",
    "log_file": "${LOG_FILE}"
  }
}
EOF
    
    success "Deployment manifest generated: ${MANIFEST_FILE}"
    
    # Validate JSON if jq is available
    if command -v jq >/dev/null 2>&1; then
        if jq . "${MANIFEST_FILE}" >/dev/null 2>&1; then
            success "Manifest JSON is valid"
        else
            error_exit "Generated manifest JSON is invalid"
        fi
    else
        warning "jq not available - JSON validation skipped"
    fi
}

# Display manifest summary
display_summary() {
    log "${BLUE}📊 Manifest Summary...${NC}"
    
    if [[ -f "${MANIFEST_FILE}" ]]; then
        if command -v jq >/dev/null 2>&1; then
            local app_name=$(jq -r '.application.name' "${MANIFEST_FILE}")
            local app_version=$(jq -r '.application.version' "${MANIFEST_FILE}")
            local git_commit=$(jq -r '.git.commit' "${MANIFEST_FILE}")
            local git_branch=$(jq -r '.git.branch' "${MANIFEST_FILE}")
            local total_files=$(jq -r '.files.total_count' "${MANIFEST_FILE}")
            local features_count=$(jq -r '.verification.expected_features | length' "${MANIFEST_FILE}")
            local endpoints_count=$(jq -r '.verification.critical_endpoints | length' "${MANIFEST_FILE}")
            
            echo
            log "${GREEN}🎉 DEPLOYMENT MANIFEST SUMMARY${NC}"
            log "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            log "📱 Application: ${app_name} v${app_version}"
            log "🔀 Git: ${git_commit:0:8} (${git_branch})"
            log "📁 Files tracked: ${total_files} source files"
            log "🎯 Features: ${features_count} expected features"
            log "🔌 Endpoints: ${endpoints_count} critical endpoints"
            log "🌐 Target: ${TARGET_URL}"
            log "📋 Manifest: ${MANIFEST_FILE}"
            log "📝 Log: ${LOG_FILE}"
            log "📅 $(date)"
            echo
        else
            success "Manifest created successfully (JSON validation unavailable)"
        fi
    else
        error_exit "Manifest file not found after generation"
    fi
}

# Validate existing manifest
validate_manifest() {
    local manifest_file="${1:-${MANIFEST_FILE}}"
    
    log "${BLUE}🔍 Validating manifest: ${manifest_file}${NC}"
    
    if [[ ! -f "${manifest_file}" ]]; then
        error_exit "Manifest file not found: ${manifest_file}"
    fi
    
    # Check if it's valid JSON
    if command -v jq >/dev/null 2>&1; then
        if ! jq . "${manifest_file}" >/dev/null 2>&1; then
            error_exit "Manifest is not valid JSON"
        fi
        
        # Check required fields
        local required_fields=(
            ".deployment.timestamp"
            ".deployment.target_url"
            ".application.name"
            ".application.version"
            ".git.commit"
            ".verification.critical_endpoints"
        )
        
        for field in "${required_fields[@]}"; do
            local value=$(jq -r "${field}" "${manifest_file}" 2>/dev/null || echo "null")
            if [[ "${value}" == "null" ]] || [[ -z "${value}" ]]; then
                error_exit "Required field missing or empty: ${field}"
            fi
        done
        
        success "Manifest validation passed"
        
        # Display summary
        local timestamp=$(jq -r '.deployment.timestamp' "${manifest_file}")
        local target_url=$(jq -r '.deployment.target_url' "${manifest_file}")
        local app_version=$(jq -r '.application.version' "${manifest_file}")
        local git_commit=$(jq -r '.git.commit' "${manifest_file}")
        
        info "Deployment time: ${timestamp}"
        info "Target URL: ${target_url}"
        info "App version: ${app_version}"
        info "Git commit: ${git_commit:0:8}"
        
    else
        warning "jq not available - skipping detailed validation"
        success "Basic file existence check passed"
    fi
}

# Main function
main() {
    local command="${1:-generate}"
    
    case "${command}" in
        "generate"|"create")
            show_banner
            generate_manifest
            display_summary
            ;;
        "validate")
            local manifest_file="${2:-${MANIFEST_FILE}}"
            show_banner
            validate_manifest "${manifest_file}"
            ;;
        "summary"|"show")
            local manifest_file="${2:-${MANIFEST_FILE}}"
            if [[ ! -f "${manifest_file}" ]]; then
                error_exit "Manifest file not found: ${manifest_file}"
            fi
            display_summary
            ;;
        "help"|"--help"|"-h")
            cat << EOF
Usage: $0 <command> [options]

Commands:
    generate, create    Generate new deployment manifest (default)
    validate [FILE]     Validate existing manifest file
    summary, show [FILE] Show manifest summary
    help                Show this help message

Options:
    MANIFEST_FILE       Output manifest file path (default: DEPLOYMENT-MANIFEST.json)
    TARGET_URL          Target deployment URL (default: https://incomeclarity.ddns.net)

Examples:
    $0                                                    # Generate manifest
    $0 generate                                           # Generate manifest
    $0 validate                                           # Validate default manifest
    $0 validate /path/to/manifest.json                   # Validate specific file
    $0 summary                                            # Show summary
    
    MANIFEST_FILE=deploy.json $0 generate                # Custom output file
    TARGET_URL=https://staging.example.com $0 generate   # Custom target URL

Environment Variables:
    MANIFEST_FILE       Output file path
    TARGET_URL          Target deployment URL

Generated Files:
    ${MANIFEST_FILE}                                     # Deployment manifest
    ${LOG_FILE}                               # Generation log

EOF
            ;;
        *)
            error_exit "Unknown command: ${command}. Use 'help' for usage information."
            ;;
    esac
}

# Run main function with all arguments
main "$@"