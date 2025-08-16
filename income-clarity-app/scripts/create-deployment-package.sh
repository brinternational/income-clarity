#!/bin/bash

# Create Deployment Package Script
# Creates tar.gz archive for manual deployment to SSH server

set -euo pipefail

# Configuration
PACKAGE_NAME="income-clarity-$(date +%Y%m%d_%H%M%S)"
PACKAGE_DIR="/tmp/${PACKAGE_NAME}"
ARCHIVE_PATH="/tmp/${PACKAGE_NAME}.tar.gz"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${1}"
}

error_exit() {
    log "${RED}❌ ERROR: ${1}${NC}"
    exit 1
}

success() {
    log "${GREEN}✅ SUCCESS: ${1}${NC}"
}

info() {
    log "${BLUE}ℹ️  INFO: ${1}${NC}"
}

show_banner() {
    echo -e "${BLUE}"
    cat << "EOF"
  ____            _                                  _   
 |  _ \  ___ _ __ | | ___  _   _ _ __ ___   ___ _ __ | |_ 
 | | | |/ _ \ '_ \| |/ _ \| | | | '_ ` _ \ / _ \ '_ \| __|
 | |_| |  __/ |_) | | (_) | |_| | | | | | |  __/ | | |_ 
 |____/ \___| .__/|_|\___/ \__, |_| |_| |_|\___|_| |_|\__|
            |_|            |___/                         
                Package Creator
EOF
    echo -e "${NC}"
    log "${BLUE}📦 Creating deployment package for Income Clarity${NC}"
    echo
}

# Create exclusion list
create_exclusion_list() {
    local exclude_file="/tmp/deploy-exclude.txt"
    
    cat > "${exclude_file}" << 'EOF'
node_modules/
.next/
.git/
coverage/
test-results/
playwright-report/
*.log
*.tmp
.env.local
.env.development
.env.test
.DS_Store
Thumbs.db
test-*
debug-*
*-snippet-*.json
*-batch-*.txt
dev.log
dev_output.log
dev-server.log
server.log
start.log
*.tsbuildinfo
cypress/
.nyc_output/
.vscode/
.idea/
*.swp
*.swo
nul
tsconfig.tsbuildinfo
test-next/
__pycache__/
*.pyc
playwright-report/
lighthouserc.js
manual-*.js
.vercel/
.next/
dist/
build/
out/
*.map
EOF
    
    echo "${exclude_file}"
}

# Validate current directory
validate_directory() {
    log "${BLUE}🔍 Validating current directory...${NC}"
    
    if [[ ! -f "package.json" ]]; then
        error_exit "package.json not found. Are you in the Income Clarity app directory?"
    fi
    
    if ! grep -q "income-clarity-app" package.json; then
        error_exit "This doesn't appear to be the Income Clarity app directory"
    fi
    
    success "Directory validation passed"
}

# Calculate package size
calculate_size() {
    local exclude_file="$1"
    local total_files=0
    local excluded_files=0
    
    # Count total files
    total_files=$(find . -type f | wc -l)
    
    # Count files that would be excluded
    while IFS= read -r pattern; do
        [[ -z "$pattern" ]] && continue
        [[ "$pattern" =~ ^[[:space:]]*# ]] && continue
        excluded_files=$((excluded_files + $(find . -path "./$pattern" -type f 2>/dev/null | wc -l)))
    done < "$exclude_file"
    
    local included_files=$((total_files - excluded_files))
    
    info "Total files: ${total_files}"
    info "Excluded files: ${excluded_files}"
    info "Files to package: ${included_files}"
    
    # Calculate approximate size
    local size_kb=$(du -sk --exclude-from="$exclude_file" . 2>/dev/null | cut -f1)
    local size_mb=$((size_kb / 1024))
    
    info "Estimated package size: ${size_mb}MB (${size_kb}KB)"
}

# Create package directory
create_package_directory() {
    local exclude_file="$1"
    
    log "${BLUE}📁 Creating package directory...${NC}"
    
    # Clean up any existing package directory
    rm -rf "${PACKAGE_DIR}"
    mkdir -p "${PACKAGE_DIR}"
    
    # Copy files excluding patterns
    info "Copying files to package directory..."
    rsync -av --exclude-from="${exclude_file}" ./ "${PACKAGE_DIR}/"
    
    success "Package directory created: ${PACKAGE_DIR}"
}

# Create production environment template
create_env_template() {
    log "${BLUE}⚙️  Creating production environment template...${NC}"
    
    if [[ -f ".env.production.example" ]]; then
        cp ".env.production.example" "${PACKAGE_DIR}/.env.production.template"
        info "Copied .env.production.example to package"
    else
        cat > "${PACKAGE_DIR}/.env.production.template" << 'EOF'
# Income Clarity - Production Environment Variables
# Copy this file to .env.production and configure your values

# Application Settings (REQUIRED)
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stock Price API (REQUIRED)
POLYGON_API_KEY=your_polygon_api_key
STOCK_API_PROVIDER=polygon

# Session Security (REQUIRED)
# Generate with: openssl rand -base64 64
SESSION_SECRET=your_secure_random_session_secret

# Optional: Error Tracking
# Error tracking service can be configured here

# Optional: Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Optional: Caching
REDIS_URL=redis://your-redis-connection

# Optional: Feature Flags
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_PWA_FEATURES=true
ENABLE_ADVANCED_ANALYTICS=false
EOF
        info "Created .env.production.template"
    fi
    
    success "Environment template created"
}

# Create deployment instructions
create_instructions() {
    log "${BLUE}📋 Creating deployment instructions...${NC}"
    
    cat > "${PACKAGE_DIR}/DEPLOYMENT_INSTRUCTIONS.md" << 'EOF'
# Income Clarity - Manual Deployment Instructions

## 📦 Package Contents

This package contains the complete Income Clarity application ready for production deployment.

## 🚀 Quick Deployment Steps

### 1. Transfer Package to Server

```bash
# Upload the tar.gz file to your server
scp income-clarity-YYYYMMDD_HHMMSS.tar.gz user@server:/tmp/

# SSH to your server
ssh user@server

# Extract the package
cd /var/www
sudo tar -xzf /tmp/income-clarity-*.tar.gz
sudo mv income-clarity-* income-clarity
sudo chown -R www-data:www-data income-clarity
```

### 2. Install Dependencies

```bash
cd /var/www/income-clarity

# Install production dependencies
npm ci --only=production

# Build the application
npm run build
```

### 3. Configure Environment

```bash
# Copy and edit environment variables
cp .env.production.template .env.production
nano .env.production

# Required variables to set:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
# - POLYGON_API_KEY
# - SESSION_SECRET (generate with: openssl rand -base64 64)
# - NEXT_PUBLIC_APP_URL
```

### 4. Set Up Process Manager (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application with PM2
pm2 start npm --name "income-clarity" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

### 5. Configure Nginx (Optional)

```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/income-clarity

# Add configuration (see SSH_DEPLOYMENT_GUIDE.md for full config)
# Enable site
sudo ln -s /etc/nginx/sites-available/income-clarity /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Set Up SSL (Optional)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

## ✅ Verification

1. Check PM2 status: `pm2 status`
2. Test health endpoint: `curl http://localhost:3000/api/health`
3. Test application: visit your domain

## 📚 Full Documentation

For complete deployment guide with automation scripts, see:
- SSH_DEPLOYMENT_GUIDE.md (comprehensive guide)
- scripts/ssh-deploy.sh (automated deployment)

## 🆘 Troubleshooting

- **Build fails**: Check Node.js version (requires 18.17.0+)
- **App won't start**: Verify environment variables in .env.production
- **Database issues**: Check Supabase connection and RLS policies
- **SSL issues**: Verify domain DNS points to server IP

---

Package created: $(date)
EOF
    
    success "Deployment instructions created"
}

# Create tar archive
create_archive() {
    log "${BLUE}📦 Creating tar.gz archive...${NC}"
    
    # Remove any existing archive
    rm -f "${ARCHIVE_PATH}"
    
    # Create tar archive
    tar -czf "${ARCHIVE_PATH}" -C "/tmp" "${PACKAGE_NAME}"
    
    # Get archive info
    local size=$(du -h "${ARCHIVE_PATH}" | cut -f1)
    local file_count=$(tar -tzf "${ARCHIVE_PATH}" | wc -l)
    
    success "Archive created: ${ARCHIVE_PATH}"
    info "Archive size: ${size}"
    info "Files in archive: ${file_count}"
}

# Display final instructions
show_completion() {
    log "${GREEN}🎉 Deployment package created successfully!${NC}"
    echo
    log "${YELLOW}📦 Package Details:${NC}"
    log "   Archive: ${ARCHIVE_PATH}"
    log "   Size: $(du -h "${ARCHIVE_PATH}" | cut -f1)"
    log "   Files: $(tar -tzf "${ARCHIVE_PATH}" | wc -l)"
    echo
    log "${YELLOW}📋 Next Steps:${NC}"
    log "1. Transfer to server: scp ${ARCHIVE_PATH} user@server:/tmp/"
    log "2. Extract on server: tar -xzf /tmp/$(basename "${ARCHIVE_PATH}")"
    log "3. Follow DEPLOYMENT_INSTRUCTIONS.md in the extracted directory"
    log "4. Or use the automated script: ./scripts/ssh-deploy.sh"
    echo
    log "${YELLOW}📚 Documentation:${NC}"
    log "   Complete guide: SSH_DEPLOYMENT_GUIDE.md"
    log "   Automated script: scripts/ssh-deploy.sh"
    echo
}

# Cleanup function
cleanup() {
    log "${BLUE}🧹 Cleaning up temporary files...${NC}"
    
    # Remove package directory
    if [[ -d "${PACKAGE_DIR}" ]]; then
        rm -rf "${PACKAGE_DIR}"
        info "Removed temporary package directory"
    fi
    
    # Remove exclusion file
    if [[ -f "/tmp/deploy-exclude.txt" ]]; then
        rm -f "/tmp/deploy-exclude.txt"
        info "Removed exclusion file"
    fi
}

# Main process
main() {
    show_banner
    
    validate_directory
    
    local exclude_file
    exclude_file=$(create_exclusion_list)
    
    calculate_size "${exclude_file}"
    
    echo
    read -p "Continue creating deployment package? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "${YELLOW}Package creation cancelled${NC}"
        cleanup
        exit 0
    fi
    
    create_package_directory "${exclude_file}"
    create_env_template
    create_instructions
    create_archive
    cleanup
    show_completion
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --name)
            PACKAGE_NAME="$2"
            PACKAGE_DIR="/tmp/${PACKAGE_NAME}"
            ARCHIVE_PATH="/tmp/${PACKAGE_NAME}.tar.gz"
            shift 2
            ;;
        --output)
            ARCHIVE_PATH="$2"
            shift 2
            ;;
        --help|-h)
            cat << EOF
Create Deployment Package for Income Clarity

Usage: $0 [options]

Options:
    --name NAME        Package name (default: income-clarity-YYYYMMDD_HHMMSS)
    --output PATH      Output archive path (default: /tmp/PACKAGE_NAME.tar.gz)
    --help, -h         Show this help message

Description:
    Creates a tar.gz deployment package with all necessary files for
    manual deployment to an SSH server. Automatically excludes development
    files, build artifacts, and environment files.

Examples:
    $0                                    # Create package with timestamp
    $0 --name income-clarity-v1.0        # Create package with custom name
    $0 --output ./deployment.tar.gz      # Create package in current directory

EOF
            exit 0
            ;;
        *)
            error_exit "Unknown option: $1"
            ;;
    esac
done

# Run main process
main "$@"