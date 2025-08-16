#!/bin/bash

# Production Deployment Script for Income Clarity on Vercel
# This script automates the complete deployment process with validation

set -euo pipefail

# Configuration
PROJECT_NAME="income-clarity"
PRODUCTION_DOMAIN="income-clarity.vercel.app"
LOG_FILE="deployment_$(date +%Y%m%d_%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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
    echo -e "${BLUE}"
    cat << "EOF"
  ___                            _____ _            _ _       
 |_ _|_ __   ___ ___  _ __ ___   / ____| |          (_| |      
  | || '_ \ / __/ _ \| '_ ` _ \ | |    | | __ _ _ __ _| |_ _   _ 
  | || | | | (_| (_) | | | | | || |    | |/ _` | '__| | __| | | |
 |___|_| |_|\___\___/|_| |_| |_| \____|_|\__,_|_|  |_|\__|\_, |
                                                         __/ |
                             VERCEL DEPLOYMENT           |___/ 
EOF
    echo -e "${NC}"
    log "${BLUE}🚀 Starting Income Clarity deployment to Vercel${NC}"
    log "📅 $(date)"
    log "📋 Log file: ${LOG_FILE}"
    echo
}

# Pre-deployment validation
validate_environment() {
    log "${BLUE}🔍 Validating deployment environment...${NC}"
    
    # Check if we're in the correct directory
    if [[ ! -f "package.json" ]]; then
        error_exit "package.json not found. Are you in the correct directory?"
    fi
    
    # Check if this is the Income Clarity app
    if ! grep -q "income-clarity-app" package.json; then
        error_exit "This doesn't appear to be the Income Clarity app directory"
    fi
    
    # Check Vercel CLI
    if ! command -v vercel >/dev/null 2>&1; then
        error_exit "Vercel CLI not installed. Run: npm i -g vercel"
    fi
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2)
    local min_version="18.17.0"
    
    if ! npx semver -r ">=${min_version}" "${node_version}" >/dev/null 2>&1; then
        error_exit "Node.js version ${node_version} is too old. Minimum required: ${min_version}"
    fi
    
    success "Environment validation passed"
}

# Clean and build
build_application() {
    log "${BLUE}🏗️  Building application for production...${NC}"
    
    # Clean previous build
    rm -rf .next
    
    # Install dependencies
    info "Installing dependencies..."
    npm install --legacy-peer-deps 2>&1 | tee -a "${LOG_FILE}"
    
    # Build the application
    info "Building Next.js application..."
    npx next build 2>&1 | tee -a "${LOG_FILE}"
    
    # Verify build output
    if [[ ! -d ".next" ]]; then
        error_exit "Build failed - .next directory not found"
    fi
    
    success "Application built successfully"
}

# Configure Vercel project
configure_vercel_project() {
    log "${BLUE}⚙️  Configuring Vercel project...${NC}"
    
    # Check if already logged in
    if ! vercel whoami >/dev/null 2>&1; then
        warning "Please login to Vercel first:"
        warning "Run: vercel login"
        warning "Then re-run this script"
        exit 1
    fi
    
    info "Creating/linking Vercel project..."
    
    # Initialize or link project
    if [[ ! -f ".vercel/project.json" ]]; then
        vercel --confirm 2>&1 | tee -a "${LOG_FILE}"
    else
        info "Vercel project already linked"
    fi
    
    success "Vercel project configured"
}

# Set environment variables
configure_environment_variables() {
    log "${BLUE}🔐 Configuring environment variables...${NC}"
    
    # Check if .env.production exists
    if [[ -f ".env.production" ]]; then
        info "Found .env.production file, setting environment variables..."
        
        # Read .env.production and set variables
        while IFS= read -r line; do
            # Skip empty lines and comments
            [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
            
            # Extract key=value
            if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
                key="${BASH_REMATCH[1]}"
                value="${BASH_REMATCH[2]}"
                
                # Set environment variable in Vercel
                echo "Setting ${key}..."
                vercel env add "${key}" production <<< "${value}" 2>&1 | tee -a "${LOG_FILE}" || warning "Failed to set ${key}"
            fi
        done < ".env.production"
    else
        warning "No .env.production file found"
        warning "Please create .env.production with your production environment variables"
        warning "Use .env.production.example as a template"
    fi
    
    # Set critical environment variables if not already set
    info "Ensuring critical environment variables are set..."
    
    # These should be set manually in Vercel dashboard for security
    local critical_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
        "POLYGON_API_KEY"
        "SESSION_SECRET"
    )
    
    for var in "${critical_vars[@]}"; do
        if ! vercel env ls production | grep -q "^${var}"; then
            warning "Critical environment variable ${var} not found in Vercel"
            warning "Please set it manually in the Vercel dashboard"
        fi
    done
    
    success "Environment variables configured"
}

# Deploy to production
deploy_to_production() {
    log "${BLUE}🚀 Deploying to production...${NC}"
    
    # Deploy with production flag
    info "Deploying to Vercel production..."
    vercel --prod --confirm 2>&1 | tee -a "${LOG_FILE}"
    
    success "Deployed to production successfully"
}

# Post-deployment verification
verify_deployment() {
    log "${BLUE}✅ Verifying deployment...${NC}"
    
    # Wait for deployment to be ready
    sleep 10
    
    # Health check
    local health_url="https://${PRODUCTION_DOMAIN}/api/health"
    info "Checking deployment health: ${health_url}"
    
    local health_response=$(curl -s -w "%{http_code}" "${health_url}" || echo "000")
    
    if [[ "${health_response: -3}" == "200" ]]; then
        success "Health check passed"
    else
        warning "Health check failed with status: ${health_response: -3}"
    fi
    
    # Test static assets
    local static_url="https://${PRODUCTION_DOMAIN}/"
    info "Testing static assets: ${static_url}"
    
    local static_response=$(curl -s -w "%{http_code}" "${static_url}" || echo "000")
    
    if [[ "${static_response: -3}" == "200" ]]; then
        success "Static assets accessible"
    else
        warning "Static assets check failed with status: ${static_response: -3}"
    fi
    
    success "Post-deployment verification completed"
}

# Generate deployment summary
generate_summary() {
    log "${BLUE}📊 Deployment Summary${NC}"
    log ""
    log "🌐 Production URL: https://${PRODUCTION_DOMAIN}"
    log "📅 Deployment Date: $(date)"
    log "📋 Log File: ${LOG_FILE}"
    log ""
    log "🔍 Next Steps:"
    log "1. Verify all environment variables in Vercel dashboard"
    log "2. Test critical user flows (login, portfolio management)"
    log "3. Monitor error rates and performance metrics"
    log "4. Set up monitoring and alerting"
    log ""
    log "${GREEN}🎉 Deployment completed successfully!${NC}"
}

# Main deployment process
main() {
    show_banner
    validate_environment
    build_application
    configure_vercel_project
    configure_environment_variables
    deploy_to_production
    verify_deployment
    generate_summary
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD="true"
            shift
            ;;
        --skip-env)
            SKIP_ENV="true"
            shift
            ;;
        --help|-h)
            cat << EOF
Usage: $0 [options]

Options:
    --skip-build       Skip the build step
    --skip-env         Skip environment variable configuration
    --help, -h         Show this help message

Environment Variables:
    VERCEL_TOKEN       Vercel authentication token (for CI/CD)

Examples:
    $0                 # Full deployment
    $0 --skip-build    # Deploy without building
    $0 --skip-env      # Deploy without configuring env vars

EOF
            exit 0
            ;;
        *)
            error_exit "Unknown option: $1"
            ;;
    esac
done

# Run main deployment process
main "$@"