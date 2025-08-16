#!/bin/bash

# SSH Server Deployment Script for Income Clarity
# Transfers and deploys the Income Clarity app to a remote SSH server

set -euo pipefail

# Configuration - Override with environment variables
REMOTE_HOST="${REMOTE_HOST:-}"
REMOTE_USER="${REMOTE_USER:-}"
REMOTE_PORT="${REMOTE_PORT:-22}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/income-clarity}"
SSH_KEY_PATH="${SSH_KEY_PATH:-}"
DEPLOYMENT_METHOD="${DEPLOYMENT_METHOD:-rsync}"  # options: rsync, tar, git
NODE_VERSION="${NODE_VERSION:-18.17.0}"
PM2_APP_NAME="${PM2_APP_NAME:-income-clarity}"
NGINX_CONFIG="${NGINX_CONFIG:-true}"
SSL_SETUP="${SSL_SETUP:-true}"
DOMAIN_NAME="${DOMAIN_NAME:-}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
LOG_FILE="/tmp/ssh_deploy_$(date +%Y%m%d_%H%M%S).log"

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

show_banner() {
    echo -e "${BLUE}"
    cat << "EOF"
  ____  ____  _   _   ____            _             
 / ___||  _ \| | | | |  _ \  ___ _ __ | | ___  _   _ 
 \___ \| |_) | |_| | | | | |/ _ \ '_ \| |/ _ \| | | |
  ___) |  __/|  _  | | |_| |  __/ |_) | | (_) | |_| |
 |____/|_|   |_| |_| |____/ \___| .__/|_|\___/ \__, |
                                |_|            |___/ 
        Income Clarity SSH Server Deployment
EOF
    echo -e "${NC}"
    log "${BLUE}🚀 Starting SSH deployment to ${REMOTE_HOST}${NC}"
    echo
}

# Validate configuration
validate_config() {
    log "${BLUE}🔍 Validating deployment configuration...${NC}"
    
    if [[ -z "${REMOTE_HOST}" ]]; then
        error_exit "REMOTE_HOST is required. Set via environment variable or provide interactively."
    fi
    
    if [[ -z "${REMOTE_USER}" ]]; then
        error_exit "REMOTE_USER is required. Set via environment variable or provide interactively."
    fi
    
    # Test SSH connection
    local ssh_opts="-o ConnectTimeout=10 -o StrictHostKeyChecking=no"
    if [[ -n "${SSH_KEY_PATH}" ]]; then
        ssh_opts="${ssh_opts} -i ${SSH_KEY_PATH}"
    fi
    
    info "Testing SSH connection to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PORT}..."
    if ssh ${ssh_opts} -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "echo 'SSH connection successful'" 2>/dev/null; then
        success "SSH connection established"
    else
        error_exit "Cannot connect to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PORT}"
    fi
    
    # Check if we're in the correct directory
    if [[ ! -f "package.json" ]] || ! grep -q "income-clarity-app" package.json; then
        error_exit "Not in the correct Income Clarity app directory"
    fi
    
    success "Configuration validation passed"
}

# Create deployment package
create_deployment_package() {
    log "${BLUE}📦 Creating deployment package...${NC}"
    
    local package_dir="/tmp/income-clarity-deploy"
    local exclude_file="/tmp/deploy-exclude.txt"
    
    # Clean up previous package
    rm -rf "${package_dir}"
    mkdir -p "${package_dir}"
    
    # Create exclusion list
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
EOF
    
    info "Exclusion list created with $(wc -l < "${exclude_file}") patterns"
    
    case "${DEPLOYMENT_METHOD}" in
        "rsync")
            create_rsync_package
            ;;
        "tar")
            create_tar_package "${package_dir}" "${exclude_file}"
            ;;
        "git")
            create_git_package
            ;;
        *)
            error_exit "Unknown deployment method: ${DEPLOYMENT_METHOD}"
            ;;
    esac
    
    # Clean up
    rm -f "${exclude_file}"
    
    success "Deployment package created using ${DEPLOYMENT_METHOD} method"
}

# Create rsync-based deployment
create_rsync_package() {
    info "Using rsync for deployment (recommended for updates)"
    
    local rsync_opts="-avz --delete --progress"
    local ssh_opts="-e ssh"
    
    if [[ -n "${SSH_KEY_PATH}" ]]; then
        ssh_opts="-e 'ssh -i ${SSH_KEY_PATH} -p ${REMOTE_PORT}'"
    else
        ssh_opts="-e 'ssh -p ${REMOTE_PORT}'"
    fi
    
    # Add exclusions
    rsync_opts="${rsync_opts} --exclude-from=/tmp/deploy-exclude.txt"
    
    info "Syncing files to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"
    
    # Create remote directory if it doesn't exist
    ssh ${ssh_opts#-e } "${REMOTE_USER}@${REMOTE_HOST}" "mkdir -p ${REMOTE_PATH}"
    
    # Sync files
    rsync ${rsync_opts} ${ssh_opts} ./ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"
}

# Create tar-based deployment package
create_tar_package() {
    local package_dir="$1"
    local exclude_file="$2"
    
    info "Creating tar package for deployment"
    
    local tar_file="/tmp/income-clarity-$(date +%Y%m%d_%H%M%S).tar.gz"
    
    # Create tar with exclusions
    tar --exclude-from="${exclude_file}" -czf "${tar_file}" -C . .
    
    local tar_size=$(du -h "${tar_file}" | cut -f1)
    info "Created tar package: ${tar_file} (${tar_size})"
    
    # Transfer tar file
    local scp_opts=""
    if [[ -n "${SSH_KEY_PATH}" ]]; then
        scp_opts="-i ${SSH_KEY_PATH}"
    fi
    
    info "Transferring package to remote server..."
    scp ${scp_opts} -P "${REMOTE_PORT}" "${tar_file}" "${REMOTE_USER}@${REMOTE_HOST}:/tmp/"
    
    # Extract on remote server
    local remote_tar_file="/tmp/$(basename "${tar_file}")"
    ssh ${scp_opts} -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        sudo mkdir -p ${REMOTE_PATH}
        sudo chown ${REMOTE_USER}:${REMOTE_USER} ${REMOTE_PATH}
        cd ${REMOTE_PATH}
        tar -xzf ${remote_tar_file}
        rm -f ${remote_tar_file}
EOF
    
    # Clean up local tar file
    rm -f "${tar_file}"
}

# Create git-based deployment
create_git_package() {
    info "Using git-based deployment"
    
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error_exit "Not in a git repository. Initialize git first or use rsync/tar method."
    fi
    
    # Check for uncommitted changes
    if [[ -n "$(git status --porcelain)" ]]; then
        warning "Uncommitted changes detected. Consider committing first."
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            error_exit "Deployment cancelled"
        fi
    fi
    
    # Get git info
    local git_remote=$(git remote get-url origin 2>/dev/null || echo "")
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    
    if [[ -z "${git_remote}" ]]; then
        error_exit "No git remote found. Add remote or use rsync/tar method."
    fi
    
    info "Git remote: ${git_remote}"
    info "Current branch: ${current_branch}"
    
    # Deploy via git clone on remote server
    ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        cd /tmp
        rm -rf income-clarity-git-deploy
        git clone ${git_remote} income-clarity-git-deploy
        cd income-clarity-git-deploy
        git checkout ${current_branch}
        
        # Move to deployment directory
        sudo mkdir -p ${REMOTE_PATH}
        sudo chown ${REMOTE_USER}:${REMOTE_USER} ${REMOTE_PATH}
        sudo rsync -av --delete ./ ${REMOTE_PATH}/
        
        # Cleanup
        cd /tmp
        rm -rf income-clarity-git-deploy
EOF
}

# Set up remote server environment
setup_remote_environment() {
    log "${BLUE}⚙️  Setting up remote server environment...${NC}"
    
    local ssh_opts=""
    if [[ -n "${SSH_KEY_PATH}" ]]; then
        ssh_opts="-i ${SSH_KEY_PATH}"
    fi
    
    ssh ${ssh_opts} -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        set -e
        
        echo "📦 Updating system packages..."
        sudo apt update
        
        echo "📦 Installing required system packages..."
        sudo apt install -y curl wget git build-essential nginx certbot python3-certbot-nginx
        
        echo "📦 Installing Node.js ${NODE_VERSION}..."
        # Install Node.js via NodeSource
        curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
        sudo apt install -y nodejs
        
        echo "📦 Installing PM2 globally..."
        sudo npm install -g pm2
        
        echo "✅ System setup completed"
        
        # Display versions
        echo "Node.js version: \$(node --version)"
        echo "NPM version: \$(npm --version)"
        echo "PM2 version: \$(pm2 --version)"
EOF
    
    success "Remote environment setup completed"
}

# Install application dependencies
install_remote_dependencies() {
    log "${BLUE}📦 Installing application dependencies on remote server...${NC}"
    
    local ssh_opts=""
    if [[ -n "${SSH_KEY_PATH}" ]]; then
        ssh_opts="-i ${SSH_KEY_PATH}"
    fi
    
    ssh ${ssh_opts} -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        set -e
        cd ${REMOTE_PATH}
        
        echo "📦 Installing production dependencies..."
        npm ci --only=production
        
        echo "🏗️  Building application..."
        npm run build
        
        echo "✅ Dependencies and build completed"
EOF
    
    success "Application dependencies installed and built"
}

# Configure environment variables
configure_remote_env() {
    log "${BLUE}⚙️  Configuring environment variables...${NC}"
    
    local ssh_opts=""
    if [[ -n "${SSH_KEY_PATH}" ]]; then
        ssh_opts="-i ${SSH_KEY_PATH}"
    fi
    
    info "Creating production environment file..."
    
    ssh ${ssh_opts} -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << 'EOF'
        set -e
        cd $REMOTE_PATH
        
        # Create .env.production from template
        if [[ -f ".env.production.example" ]]; then
            cp .env.production.example .env.production
            echo "📝 Created .env.production from template"
            echo "⚠️  IMPORTANT: Edit .env.production and set your production values:"
            echo "   - NEXT_PUBLIC_SUPABASE_URL"
            echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" 
            echo "   - SUPABASE_SERVICE_ROLE_KEY"
            echo "   - POLYGON_API_KEY"
            echo "   - SESSION_SECRET (generate with: openssl rand -base64 64)"
            echo "   - NEXT_PUBLIC_APP_URL (your domain)"
        else
            echo "⚠️  No .env.production.example found"
        fi
EOF
    
    warning "Remember to configure environment variables in .env.production on the remote server"
    success "Environment configuration template created"
}

# Set up PM2 process manager
setup_pm2() {
    log "${BLUE}🔄 Setting up PM2 process manager...${NC}"
    
    local ssh_opts=""
    if [[ -n "${SSH_KEY_PATH}" ]]; then
        ssh_opts="-i ${SSH_KEY_PATH}"
    fi
    
    # Create PM2 ecosystem file
    ssh ${ssh_opts} -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        set -e
        cd ${REMOTE_PATH}
        
        cat > ecosystem.config.js << 'ECOSYSTEM_EOF'
module.exports = {
  apps: [{
    name: '${PM2_APP_NAME}',
    script: 'npm',
    args: 'start',
    cwd: '${REMOTE_PATH}',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '${REMOTE_PATH}/logs/combined.log',
    out_file: '${REMOTE_PATH}/logs/out.log',
    error_file: '${REMOTE_PATH}/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_restarts: 5,
    restart_delay: 1000
  }]
};
ECOSYSTEM_EOF
        
        echo "📁 Creating logs directory..."
        mkdir -p logs
        
        echo "🔄 Starting application with PM2..."
        pm2 start ecosystem.config.js
        pm2 save
        pm2 startup
        
        echo "✅ PM2 configuration completed"
EOF
    
    success "PM2 process manager configured"
}

# Configure Nginx reverse proxy
setup_nginx() {
    if [[ "${NGINX_CONFIG}" != "true" ]]; then
        warning "Skipping Nginx setup (NGINX_CONFIG=false)"
        return
    fi
    
    log "${BLUE}🌐 Configuring Nginx reverse proxy...${NC}"
    
    local ssh_opts=""
    if [[ -n "${SSH_KEY_PATH}" ]]; then
        ssh_opts="-i ${SSH_KEY_PATH}"
    fi
    
    local domain="${DOMAIN_NAME:-$(echo "${REMOTE_HOST}" | tr -d '[]')}"
    
    ssh ${ssh_opts} -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        set -e
        
        echo "🌐 Creating Nginx configuration for ${domain}..."
        
        sudo tee /etc/nginx/sites-available/income-clarity << 'NGINX_EOF'
server {
    listen 80;
    server_name ${domain};
    
    client_max_body_size 100M;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy strict-origin-when-cross-origin;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Static assets caching
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    
    # API routes
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
NGINX_EOF
        
        echo "🔗 Enabling site..."
        sudo ln -sf /etc/nginx/sites-available/income-clarity /etc/nginx/sites-enabled/
        
        echo "🧪 Testing Nginx configuration..."
        sudo nginx -t
        
        echo "🔄 Reloading Nginx..."
        sudo systemctl reload nginx
        
        echo "✅ Nginx configuration completed"
EOF
    
    success "Nginx reverse proxy configured for ${domain}"
}

# Set up SSL certificate
setup_ssl() {
    if [[ "${SSL_SETUP}" != "true" ]] || [[ -z "${DOMAIN_NAME}" ]]; then
        warning "Skipping SSL setup (SSL_SETUP=false or DOMAIN_NAME not set)"
        return
    fi
    
    log "${BLUE}🔒 Setting up SSL certificate...${NC}"
    
    local ssh_opts=""
    if [[ -n "${SSH_KEY_PATH}" ]]; then
        ssh_opts="-i ${SSH_KEY_PATH}"
    fi
    
    ssh ${ssh_opts} -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        set -e
        
        echo "🔒 Obtaining SSL certificate for ${DOMAIN_NAME}..."
        sudo certbot --nginx -d ${DOMAIN_NAME} --non-interactive --agree-tos --email admin@${DOMAIN_NAME}
        
        echo "🔄 Setting up auto-renewal..."
        (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
        
        echo "✅ SSL certificate setup completed"
EOF
    
    success "SSL certificate configured for ${DOMAIN_NAME}"
}

# Post-deployment verification
post_deployment_verification() {
    log "${BLUE}✅ Running post-deployment verification...${NC}"
    
    local ssh_opts=""
    if [[ -n "${SSH_KEY_PATH}" ]]; then
        ssh_opts="-i ${SSH_KEY_PATH}"
    fi
    
    # Check PM2 status
    info "Checking PM2 application status..."
    ssh ${ssh_opts} -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "pm2 status"
    
    # Check application health
    local domain="${DOMAIN_NAME:-${REMOTE_HOST}}"
    local protocol="http"
    if [[ "${SSL_SETUP}" == "true" ]] && [[ -n "${DOMAIN_NAME}" ]]; then
        protocol="https"
    fi
    
    sleep 10  # Wait for application to start
    
    info "Testing application health at ${protocol}://${domain}..."
    local health_response=$(curl -s -w "%{http_code}" "${protocol}://${domain}/api/health" 2>/dev/null || echo "000")
    
    if [[ "${health_response: -3}" == "200" ]]; then
        success "Application health check passed"
    else
        warning "Health check failed with status: ${health_response: -3}"
    fi
    
    # Test homepage
    local homepage_response=$(curl -s -w "%{http_code}" "${protocol}://${domain}/" 2>/dev/null || echo "000")
    if [[ "${homepage_response: -3}" == "200" ]]; then
        success "Homepage accessible"
    else
        warning "Homepage check failed with status: ${homepage_response: -3}"
    fi
    
    success "Post-deployment verification completed"
}

# Main deployment process
main() {
    show_banner
    
    # Interactive configuration if not provided
    if [[ -z "${REMOTE_HOST}" ]]; then
        read -p "Enter remote server hostname/IP: " REMOTE_HOST
    fi
    
    if [[ -z "${REMOTE_USER}" ]]; then
        read -p "Enter remote server username: " REMOTE_USER
    fi
    
    if [[ -z "${DOMAIN_NAME}" ]] && [[ "${SSL_SETUP}" == "true" ]]; then
        read -p "Enter domain name for SSL (optional): " DOMAIN_NAME
    fi
    
    validate_config
    setup_remote_environment
    create_deployment_package
    configure_remote_env
    install_remote_dependencies
    setup_pm2
    setup_nginx
    setup_ssl
    post_deployment_verification
    
    log "${GREEN}🎉 SSH Deployment completed successfully!${NC}"
    log "${GREEN}🌐 Application URL: ${protocol:-http}://${domain}${NC}"
    log "📋 Log file: ${LOG_FILE}"
    
    echo
    log "${YELLOW}📝 Next Steps:${NC}"
    log "1. Edit ${REMOTE_PATH}/.env.production with your production values"
    log "2. Restart the application: ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_PATH} && pm2 restart ${PM2_APP_NAME}'"
    log "3. Monitor application: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 logs ${PM2_APP_NAME}'"
    log "4. Check application status: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 status'"
}

# Command line argument parsing
while [[ $# -gt 0 ]]; do
    case $1 in
        --host)
            REMOTE_HOST="$2"
            shift 2
            ;;
        --user)
            REMOTE_USER="$2"
            shift 2
            ;;
        --port)
            REMOTE_PORT="$2"
            shift 2
            ;;
        --path)
            REMOTE_PATH="$2"
            shift 2
            ;;
        --key)
            SSH_KEY_PATH="$2"
            shift 2
            ;;
        --method)
            DEPLOYMENT_METHOD="$2"
            shift 2
            ;;
        --domain)
            DOMAIN_NAME="$2"
            shift 2
            ;;
        --no-nginx)
            NGINX_CONFIG="false"
            shift
            ;;
        --no-ssl)
            SSL_SETUP="false"
            shift
            ;;
        --help|-h)
            cat << EOF
SSH Deployment Script for Income Clarity

Usage: $0 [options]

Options:
    --host HOST        Remote server hostname/IP
    --user USER        Remote server username
    --port PORT        SSH port (default: 22)
    --path PATH        Remote deployment path (default: /var/www/income-clarity)
    --key PATH         SSH private key path
    --method METHOD    Deployment method: rsync|tar|git (default: rsync)
    --domain DOMAIN    Domain name for SSL certificate
    --no-nginx         Skip Nginx configuration
    --no-ssl           Skip SSL setup
    --help, -h         Show this help message

Environment Variables:
    REMOTE_HOST        Remote server hostname/IP
    REMOTE_USER        Remote server username
    REMOTE_PORT        SSH port
    REMOTE_PATH        Remote deployment path
    SSH_KEY_PATH       SSH private key path
    DEPLOYMENT_METHOD  Deployment method
    DOMAIN_NAME        Domain name for SSL
    NGINX_CONFIG       Configure Nginx (true/false)
    SSL_SETUP          Set up SSL (true/false)

Examples:
    $0 --host myserver.com --user ubuntu --method rsync --domain income-clarity.com
    $0 --host 192.168.1.100 --user deploy --key ~/.ssh/deploy_key --no-ssl

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