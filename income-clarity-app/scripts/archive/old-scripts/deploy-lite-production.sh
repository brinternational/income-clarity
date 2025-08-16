#!/bin/bash

# Income Clarity Lite Production Deployment Script
# Simplified deployment for SQLite-based application to production server

set -euo pipefail

# Production server configuration
REMOTE_HOST="${REMOTE_HOST:-137.184.142.42}"
REMOTE_USER="${REMOTE_USER:-root}"
REMOTE_PORT="${REMOTE_PORT:-22}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/income-clarity-lite}"
PM2_APP_NAME="${PM2_APP_NAME:-income-clarity-lite}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
LOG_FILE="/tmp/deploy_lite_$(date +%Y%m%d_%H%M%S).log"

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
  _____                                  _____ _            _ _         
 |_   _|                                /  ___| |          (_) |        
   | |  _ __   ___ ___  _ __ ___   ___   \ `--.| |_ __ _ _ __ _| |_ _   _ 
   | | | '_ \ / __/ _ \| '_ ` _ \ / _ \   `--. \ | / _` | '__| | __| | | |
  _| |_| | | | (_| (_) | | | | | |  __/  /\__/ / | (_| | |  | | |_| |_| |
  \___/|_| |_|\___\___/|_| |_| |_|\___|  \____/|_|\__,_|_|  |_|\__|\__, |
                                                                    __/ |
           Lite Production Deployment v1.0                        |___/ 
EOF
    echo -e "${NC}"
    log "${BLUE}🚀 Starting deployment to ${REMOTE_HOST}${NC}"
    echo
}

# Validate deployment environment
validate_environment() {
    log "${BLUE}🔍 Validating deployment environment...${NC}"
    
    # Check if we're in the correct directory
    if [[ ! -f "package.json" ]] || ! grep -q "income-clarity-app" package.json; then
        error_exit "Not in the correct Income Clarity app directory"
    fi
    
    # Check if database exists
    if [[ ! -f "prisma/income_clarity.db" ]]; then
        error_exit "Database file not found. Run the application first to create it."
    fi
    
    # Test SSH connection
    info "Testing SSH connection to ${REMOTE_HOST}..."
    if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "echo 'SSH connection successful'" 2>/dev/null; then
        success "SSH connection established"
    else
        error_exit "Cannot connect to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PORT}"
    fi
    
    success "Environment validation passed"
}

# Create deployment backup
create_deployment_backup() {
    log "${BLUE}💾 Creating deployment backup...${NC}"
    
    local backup_file="/tmp/income-clarity-deployment-backup-$(date +%Y%m%d_%H%M%S).tar.gz"
    
    info "Creating backup archive..."
    tar --exclude='node_modules' \
        --exclude='.next' \
        --exclude='coverage' \
        --exclude='*.log' \
        --exclude='test-results' \
        --exclude='playwright-report' \
        -czf "${backup_file}" .
    
    local backup_size=$(du -h "${backup_file}" | cut -f1)
    success "Deployment backup created: ${backup_file} (${backup_size})"
    
    echo "${backup_file}"
}

# Deploy application files
deploy_files() {
    log "${BLUE}📦 Deploying application files...${NC}"
    
    info "Creating remote directory structure..."
    ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        mkdir -p ${REMOTE_PATH}
        mkdir -p ${REMOTE_PATH}/logs
        mkdir -p ${REMOTE_PATH}/data/backups
EOF
    
    info "Syncing application files..."
    rsync -avz --delete \
        --exclude='node_modules/' \
        --exclude='.next/' \
        --exclude='coverage/' \
        --exclude='*.log' \
        --exclude='test-results/' \
        --exclude='playwright-report/' \
        --exclude='.git/' \
        --exclude='.env.local' \
        --exclude='.env.development' \
        --exclude='test-*' \
        --exclude='debug-*' \
        --exclude='*-snippet-*.json' \
        --exclude='*-batch-*.txt' \
        --exclude='*.tmp' \
        --exclude='.DS_Store' \
        --exclude='Thumbs.db' \
        -e "ssh -p ${REMOTE_PORT}" \
        ./ "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/"
    
    success "Application files deployed"
}

# Set up production environment
setup_production_environment() {
    log "${BLUE}⚙️  Setting up production environment...${NC}"
    
    ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        cd ${REMOTE_PATH}
        
        # Install production dependencies
        echo "📦 Installing production dependencies..."
        npm ci --only=production
        
        # Build application
        echo "🏗️  Building application..."
        npm run build
        
        # Create production environment file
        if [[ ! -f ".env.production" ]]; then
            cat > .env.production << 'ENV_EOF'
# Income Clarity Lite Production Environment
NODE_ENV=production
PORT=3000

# Database Configuration (SQLite)
DATABASE_URL="file:./prisma/income_clarity.db"

# API Configuration
POLYGON_API_KEY=ImksH64K_m3BjrjtSpQVYt0i3vjeopXa

# Session Configuration
SESSION_SECRET=production_secret_change_this_$(openssl rand -base64 32 | tr -d '\n')

# Application Configuration
NEXT_PUBLIC_APP_URL=https://incomeclarity.ddns.net
NEXT_TELEMETRY_DISABLED=1

# Performance Configuration
NEXT_PUBLIC_CACHE_ENABLED=true
NEXT_PUBLIC_API_TIMEOUT=10000
ENV_EOF
            echo "✅ Created production environment file"
        else
            echo "ℹ️  Production environment file already exists"
        fi
        
        # Set proper permissions
        chmod 600 .env.production
        chmod +x scripts/*.js
        
        echo "✅ Production environment setup completed"
EOF
    
    success "Production environment configured"
}

# Configure PM2 for production
configure_pm2() {
    log "${BLUE}🔄 Configuring PM2 process manager...${NC}"
    
    ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        cd ${REMOTE_PATH}
        
        # Create PM2 ecosystem file
        cat > ecosystem.config.js << 'PM2_EOF'
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
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '${REMOTE_PATH}/logs/combined.log',
    out_file: '${REMOTE_PATH}/logs/out.log',
    error_file: '${REMOTE_PATH}/logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_restarts: 10,
    restart_delay: 2000,
    min_uptime: '10s',
    max_memory_restart: '500M',
    kill_timeout: 5000,
    watch: false,
    ignore_watch: ['logs', 'data', 'node_modules', '.next/cache'],
    watch_options: {
      followSymlinks: false
    }
  }]
};
PM2_EOF
        
        echo "🔄 Managing PM2 application..."
        
        # Stop existing application if running
        pm2 stop ${PM2_APP_NAME} || true
        pm2 delete ${PM2_APP_NAME} || true
        
        # Start application
        pm2 start ecosystem.config.js --env production
        
        # Save PM2 configuration
        pm2 save
        
        # Setup startup script
        pm2 startup || true
        
        echo "✅ PM2 configuration completed"
EOF
    
    success "PM2 process manager configured"
}

# Run database migrations and optimizations
run_database_setup() {
    log "${BLUE}🗃️  Setting up database...${NC}"
    
    ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        cd ${REMOTE_PATH}
        
        echo "🗃️  Running database setup..."
        
        # Generate Prisma client
        npx prisma generate
        
        # Push schema to database (creates tables if needed)
        npx prisma db push --accept-data-loss
        
        # Run database optimizations
        if [[ -f "scripts/optimize-sqlite-performance.js" ]]; then
            echo "⚡ Applying database optimizations..."
            node scripts/optimize-sqlite-performance.js
        fi
        
        # Create initial backup
        if [[ -f "scripts/backup-database.js" ]]; then
            echo "💾 Creating initial backup..."
            npm run backup
        fi
        
        # Set proper database permissions
        chmod 664 prisma/income_clarity.db
        chmod 755 data/backups
        
        echo "✅ Database setup completed"
EOF
    
    success "Database setup completed"
}

# Verify deployment
verify_deployment() {
    log "${BLUE}✅ Verifying deployment...${NC}"
    
    info "Checking PM2 application status..."
    ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "pm2 status"
    
    info "Waiting for application to start..."
    sleep 10
    
    # Test application health
    info "Testing application health..."
    local health_status=$(ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" \
        "curl -s -w '%{http_code}' http://localhost:3000/api/health-check -o /dev/null" 2>/dev/null || echo "000")
    
    if [[ "${health_status}" == "200" ]]; then
        success "Health check passed (HTTP ${health_status})"
    else
        warning "Health check failed (HTTP ${health_status})"
        
        # Show recent logs for debugging
        info "Showing recent application logs..."
        ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "pm2 logs ${PM2_APP_NAME} --lines 20"
    fi
    
    # Test database connection
    info "Testing database connection..."
    ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        cd ${REMOTE_PATH}
        node -e "
        const Database = require('better-sqlite3');
        try {
          const db = Database('prisma/income_clarity.db');
          const result = db.prepare('SELECT COUNT(*) as count FROM sqlite_master WHERE type=\"table\"').get();
          console.log('Database tables:', result.count);
          db.close();
          console.log('✅ Database connection successful');
        } catch (error) {
          console.log('❌ Database connection failed:', error.message);
          process.exit(1);
        }
        "
EOF
    
    # Test external API
    info "Testing external API access..."
    ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        cd ${REMOTE_PATH}
        if [[ -f "scripts/test-polygon-api.js" ]]; then
            node scripts/test-polygon-api.js || echo "⚠️  External API test failed"
        fi
EOF
    
    success "Deployment verification completed"
}

# Configure automatic backups
setup_automatic_backups() {
    log "${BLUE}💾 Setting up automatic backups...${NC}"
    
    ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
        cd ${REMOTE_PATH}
        
        # Create backup script
        cat > /usr/local/bin/income-clarity-backup.sh << 'BACKUP_EOF'
#!/bin/bash
cd ${REMOTE_PATH}
npm run backup >> logs/backup.log 2>&1
echo "\$(date): Automatic backup completed" >> logs/backup.log
BACKUP_EOF
        
        chmod +x /usr/local/bin/income-clarity-backup.sh
        
        # Add to crontab (daily at 2 AM)
        (crontab -l 2>/dev/null || echo "") | grep -v "income-clarity-backup" | crontab -
        (crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/income-clarity-backup.sh") | crontab -
        
        echo "✅ Automatic daily backups configured"
EOF
    
    success "Automatic backup system configured"
}

# Show deployment summary
show_deployment_summary() {
    log "${GREEN}🎉 Deployment completed successfully!${NC}"
    echo
    log "${GREEN}📊 Deployment Summary:${NC}"
    log "   🌐 Server: ${REMOTE_HOST}"
    log "   📁 Path: ${REMOTE_PATH}"
    log "   🔄 PM2 App: ${PM2_APP_NAME}"
    log "   🌍 URL: https://incomeclarity.ddns.net"
    log "   📋 Log File: ${LOG_FILE}"
    echo
    log "${YELLOW}📝 Next Steps:${NC}"
    log "   1. Check application status: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 status'"
    log "   2. View application logs: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 logs ${PM2_APP_NAME}'"
    log "   3. Monitor system resources: ssh ${REMOTE_USER}@${REMOTE_HOST} 'htop'"
    log "   4. Test application: curl https://incomeclarity.ddns.net/api/health-check"
    log "   5. Monitor backups: ssh ${REMOTE_USER}@${REMOTE_HOST} 'ls -la ${REMOTE_PATH}/data/backups/'"
    echo
    log "${BLUE}🔧 Management Commands:${NC}"
    log "   • Restart app: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 restart ${PM2_APP_NAME}'"
    log "   • Stop app: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 stop ${PM2_APP_NAME}'"
    log "   • View logs: ssh ${REMOTE_USER}@${REMOTE_HOST} 'pm2 logs ${PM2_APP_NAME}'"
    log "   • Manual backup: ssh ${REMOTE_USER}@${REMOTE_HOST} 'cd ${REMOTE_PATH} && npm run backup'"
}

# Main deployment process
main() {
    show_banner
    
    # Run deployment steps
    validate_environment
    
    local backup_file
    backup_file=$(create_deployment_backup)
    
    deploy_files
    setup_production_environment
    run_database_setup
    configure_pm2
    setup_automatic_backups
    verify_deployment
    
    show_deployment_summary
    
    # Clean up local backup
    rm -f "${backup_file}"
}

# Error handling
trap 'error_exit "Deployment failed at line $LINENO"' ERR

# Parse command line arguments
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
        --path)
            REMOTE_PATH="$2"
            shift 2
            ;;
        --help|-h)
            cat << EOF
Income Clarity Lite Production Deployment

Usage: $0 [options]

Options:
    --host HOST    Remote server hostname/IP (default: 137.184.142.42)
    --user USER    Remote server username (default: root)
    --path PATH    Remote deployment path (default: /var/www/income-clarity-lite)
    --help, -h     Show this help message

Environment Variables:
    REMOTE_HOST    Remote server hostname/IP
    REMOTE_USER    Remote server username
    REMOTE_PATH    Remote deployment path

EOF
            exit 0
            ;;
        *)
            error_exit "Unknown option: $1"
            ;;
    esac
done

# Run main deployment
main "$@"