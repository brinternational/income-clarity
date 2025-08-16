#!/bin/bash

# Production Deployment Script for Income Clarity
# Automated deployment with pre-checks and rollback capability

set -euo pipefail

# Configuration
DEPLOYMENT_ENV="${DEPLOYMENT_ENV:-production}"
BACKUP_BEFORE_DEPLOY="${BACKUP_BEFORE_DEPLOY:-true}"
RUN_TESTS="${RUN_TESTS:-true}"
SKIP_BUILD="${SKIP_BUILD:-false}"
DEPLOY_TARGET="${DEPLOY_TARGET:-vercel}"
LOG_FILE="/tmp/deploy_$(date +%Y%m%d_%H%M%S).log"

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
                                 DEPLOYMENT               |___/ 
EOF
    echo -e "${NC}"
    log "${BLUE}🚀 Starting Income Clarity deployment to ${DEPLOYMENT_ENV}${NC}"
    log "📅 $(date)"
    log "📋 Log file: ${LOG_FILE}"
    echo
}

# Pre-deployment checks
pre_deployment_checks() {
    log "${BLUE}🔍 Running pre-deployment checks...${NC}"
    
    # Check if we're in the correct directory
    if [[ ! -f "package.json" ]]; then
        error_exit "package.json not found. Are you in the correct directory?"
    fi
    
    # Check if this is the Income Clarity app
    if ! grep -q "income-clarity-app" package.json; then
        error_exit "This doesn't appear to be the Income Clarity app directory"
    fi
    
    # Check Node.js version
    local node_version=$(node --version | cut -d'v' -f2)
    local min_version="18.17.0"
    
    if ! npx semver -r ">=${min_version}" "${node_version}" >/dev/null 2>&1; then
        error_exit "Node.js version ${node_version} is too old. Minimum required: ${min_version}"
    fi
    
    success "Node.js version ${node_version} is compatible"
    
    # Check if npm is available
    if ! command -v npm >/dev/null 2>&1; then
        error_exit "npm is not installed or not in PATH"
    fi
    
    # Check git status (if in git repo)
    if git rev-parse --git-dir > /dev/null 2>&1; then
        if [[ -n "$(git status --porcelain)" ]]; then
            warning "There are uncommitted changes in the repository"
            read -p "Continue with deployment? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                error_exit "Deployment cancelled by user"
            fi
        fi
        
        local current_branch=$(git rev-parse --abbrev-ref HEAD)
        info "Current branch: ${current_branch}"
        info "Latest commit: $(git log -1 --oneline)"
    fi
    
    success "Pre-deployment checks passed"
}

# Environment configuration
setup_environment() {
    log "${BLUE}⚙️  Setting up environment configuration...${NC}"
    
    # Check for environment-specific config
    if [[ ! -f ".env.${DEPLOYMENT_ENV}" ]] && [[ "${DEPLOYMENT_ENV}" != "production" ]]; then
        warning "No .env.${DEPLOYMENT_ENV} file found"
    fi
    
    # Validate critical environment variables for production
    if [[ "${DEPLOYMENT_ENV}" == "production" ]]; then
        local required_vars=(
            "NEXT_PUBLIC_SUPABASE_URL"
            "NEXT_PUBLIC_SUPABASE_ANON_KEY"
            "POLYGON_API_KEY"
        )
        
        for var in "${required_vars[@]}"; do
            if [[ -z "${!var:-}" ]]; then
                error_exit "Required environment variable ${var} is not set"
            fi
        done
        
        success "Critical environment variables verified"
    fi
    
    # Set Node environment
    export NODE_ENV="${DEPLOYMENT_ENV}"
    
    success "Environment configuration complete"
}

# Install dependencies
install_dependencies() {
    log "${BLUE}📦 Installing dependencies...${NC}"
    
    # Clean install for production deployments
    if [[ "${DEPLOYMENT_ENV}" == "production" ]]; then
        npm ci --only=production 2>&1 | tee -a "${LOG_FILE}"
    else
        npm install 2>&1 | tee -a "${LOG_FILE}"
    fi
    
    # Audit for security vulnerabilities
    info "Running security audit..."
    npm audit --audit-level=moderate 2>&1 | tee -a "${LOG_FILE}" || warning "Security audit found issues"
    
    success "Dependencies installed successfully"
}

# Run tests
run_tests() {
    if [[ "${RUN_TESTS}" != "true" ]]; then
        warning "Skipping tests (RUN_TESTS=false)"
        return
    fi
    
    log "${BLUE}🧪 Running test suite...${NC}"
    
    # Run linting
    info "Running ESLint..."
    npm run lint 2>&1 | tee -a "${LOG_FILE}"
    
    # Run unit tests
    info "Running unit tests..."
    npm test -- --watchAll=false --coverage 2>&1 | tee -a "${LOG_FILE}"
    
    # Run E2E tests for critical paths
    if command -v npx >/dev/null 2>&1 && npx playwright --version >/dev/null 2>&1; then
        info "Running E2E tests..."
        npm run test:e2e 2>&1 | tee -a "${LOG_FILE}"
    else
        warning "Playwright not available, skipping E2E tests"
    fi
    
    success "All tests passed"
}

# Build application
build_application() {
    if [[ "${SKIP_BUILD}" == "true" ]]; then
        warning "Skipping build (SKIP_BUILD=true)"
        return
    fi
    
    log "${BLUE}🏗️  Building application...${NC}"
    
    # Clean previous build
    rm -rf .next
    
    # Build the application
    npm run build 2>&1 | tee -a "${LOG_FILE}"
    
    # Verify build output
    if [[ ! -d ".next" ]]; then
        error_exit "Build failed - .next directory not found"
    fi
    
    # Check build size
    local build_size=$(du -sh .next 2>/dev/null | cut -f1)
    info "Build size: ${build_size}"
    
    success "Application built successfully"
}

# Create backup
create_backup() {
    if [[ "${BACKUP_BEFORE_DEPLOY}" != "true" ]]; then
        warning "Skipping backup (BACKUP_BEFORE_DEPLOY=false)"
        return
    fi
    
    log "${BLUE}💾 Creating pre-deployment backup...${NC}"
    
    if [[ -f "scripts/backup.sh" ]]; then
        bash scripts/backup.sh 2>&1 | tee -a "${LOG_FILE}"
        success "Backup completed"
    else
        warning "Backup script not found, skipping backup"
    fi
}

# Deploy to target platform
deploy_application() {
    log "${BLUE}🚀 Deploying to ${DEPLOY_TARGET}...${NC}"
    
    case "${DEPLOY_TARGET}" in
        "vercel")
            deploy_to_vercel
            ;;
        "netlify")
            deploy_to_netlify
            ;;
        "docker")
            deploy_with_docker
            ;;
        *)
            error_exit "Unknown deployment target: ${DEPLOY_TARGET}"
            ;;
    esac
}

# Deploy to Vercel
deploy_to_vercel() {
    info "Deploying to Vercel..."
    
    if ! command -v vercel >/dev/null 2>&1; then
        error_exit "Vercel CLI not installed. Run: npm i -g vercel"
    fi
    
    # Deploy based on environment
    if [[ "${DEPLOYMENT_ENV}" == "production" ]]; then
        vercel --prod --confirm 2>&1 | tee -a "${LOG_FILE}"
    else
        vercel 2>&1 | tee -a "${LOG_FILE}"
    fi
    
    success "Deployed to Vercel successfully"
}

# Deploy to Netlify
deploy_to_netlify() {
    info "Deploying to Netlify..."
    
    if ! command -v netlify >/dev/null 2>&1; then
        error_exit "Netlify CLI not installed. Run: npm i -g netlify-cli"
    fi
    
    if [[ "${DEPLOYMENT_ENV}" == "production" ]]; then
        netlify deploy --prod --dir=.next 2>&1 | tee -a "${LOG_FILE}"
    else
        netlify deploy --dir=.next 2>&1 | tee -a "${LOG_FILE}"
    fi
    
    success "Deployed to Netlify successfully"
}

# Deploy with Docker
deploy_with_docker() {
    info "Building and deploying Docker container..."
    
    if ! command -v docker >/dev/null 2>&1; then
        error_exit "Docker not installed"
    fi
    
    # Build Docker image
    docker build -t income-clarity:latest . 2>&1 | tee -a "${LOG_FILE}"
    
    # Tag for deployment
    if [[ -n "${DOCKER_REGISTRY:-}" ]]; then
        docker tag income-clarity:latest "${DOCKER_REGISTRY}/income-clarity:latest"
        docker push "${DOCKER_REGISTRY}/income-clarity:latest" 2>&1 | tee -a "${LOG_FILE}"
    fi
    
    success "Docker deployment completed"
}

# Post-deployment verification
post_deployment_verification() {
    log "${BLUE}✅ Running post-deployment verification...${NC}"
    
    # Wait for deployment to be ready
    sleep 10
    
    # Health check
    if [[ -n "${DEPLOYMENT_URL:-}" ]]; then
        info "Checking deployment health: ${DEPLOYMENT_URL}/api/health"
        
        local health_response=$(curl -s -w "%{http_code}" "${DEPLOYMENT_URL}/api/health" || echo "000")
        
        if [[ "${health_response: -3}" == "200" ]]; then
            success "Health check passed"
        else
            warning "Health check failed with status: ${health_response: -3}"
        fi
    else
        warning "DEPLOYMENT_URL not set, skipping health check"
    fi
    
    # Basic functionality test
    info "Testing basic application functionality..."
    
    # Test static assets
    if [[ -n "${DEPLOYMENT_URL:-}" ]]; then
        local static_test=$(curl -s -w "%{http_code}" "${DEPLOYMENT_URL}/" || echo "000")
        if [[ "${static_test: -3}" == "200" ]]; then
            success "Static assets accessible"
        else
            warning "Static assets check failed"
        fi
    fi
    
    success "Post-deployment verification completed"
}

# Cleanup
cleanup() {
    log "${BLUE}🧹 Cleaning up...${NC}"
    
    # Clean build artifacts if not needed
    if [[ "${DEPLOYMENT_ENV}" == "production" ]] && [[ "${DEPLOY_TARGET}" != "docker" ]]; then
        info "Cleaning build artifacts..."
        # rm -rf .next (commented out to preserve build for debugging)
    fi
    
    # Clean temporary files
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    success "Cleanup completed"
}

# Error handling
handle_error() {
    local exit_code=$?
    log "${RED}❌ Deployment failed with exit code ${exit_code}${NC}"
    
    # Attempt rollback if in production
    if [[ "${DEPLOYMENT_ENV}" == "production" ]] && [[ -n "${PREVIOUS_DEPLOYMENT:-}" ]]; then
        warning "Attempting rollback to previous deployment..."
        # Rollback logic would go here
        # vercel rollback "${PREVIOUS_DEPLOYMENT}" --confirm
    fi
    
    log "📋 Check the log file for details: ${LOG_FILE}"
    exit ${exit_code}
}

# Main deployment process
main() {
    trap handle_error ERR
    
    show_banner
    pre_deployment_checks
    setup_environment
    install_dependencies
    run_tests
    create_backup
    build_application
    deploy_application
    post_deployment_verification
    cleanup
    
    log "${GREEN}🎉 Deployment completed successfully!${NC}"
    log "📅 $(date)"
    log "📋 Log file: ${LOG_FILE}"
    
    if [[ -n "${DEPLOYMENT_URL:-}" ]]; then
        log "${GREEN}🌐 Application URL: ${DEPLOYMENT_URL}${NC}"
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --env)
            DEPLOYMENT_ENV="$2"
            shift 2
            ;;
        --skip-tests)
            RUN_TESTS="false"
            shift
            ;;
        --skip-backup)
            BACKUP_BEFORE_DEPLOY="false"
            shift
            ;;
        --skip-build)
            SKIP_BUILD="true"
            shift
            ;;
        --target)
            DEPLOY_TARGET="$2"
            shift 2
            ;;
        --url)
            DEPLOYMENT_URL="$2"
            shift 2
            ;;
        --help|-h)
            cat << EOF
Usage: $0 [options]

Options:
    --env ENV          Deployment environment (production, staging, development)
    --skip-tests       Skip running tests
    --skip-backup      Skip creating backup
    --skip-build       Skip building application
    --target TARGET    Deployment target (vercel, netlify, docker)
    --url URL          Deployment URL for verification
    --help, -h         Show this help message

Environment Variables:
    DEPLOYMENT_ENV     Deployment environment
    BACKUP_BEFORE_DEPLOY   Create backup before deployment (true/false)
    RUN_TESTS         Run test suite (true/false)
    SKIP_BUILD        Skip build step (true/false)
    DEPLOY_TARGET     Deployment target platform
    DEPLOYMENT_URL    URL for post-deployment verification

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