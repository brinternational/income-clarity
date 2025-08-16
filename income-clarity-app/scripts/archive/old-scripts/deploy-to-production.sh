#!/bin/bash

# ============================================
# Income Clarity Lite Production Deployment Script
# Target Server: 137.184.142.42
# ============================================

set -e  # Exit on error

# Configuration
SERVER_IP="137.184.142.42"
SERVER_USER="devuser"
APP_DIR="/public/MasterV2/income-clarity/income-clarity-app"
BACKUP_DIR="/backups/income-clarity"
LOG_FILE="/logs/deployment-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# ============================================
# Pre-Deployment Checks
# ============================================

log "Starting Income Clarity Lite Production Deployment..."

# Check if we're on the production server
if [[ $(hostname -I | grep -c "$SERVER_IP") -eq 0 ]]; then
    warning "Not on production server. This script should be run on $SERVER_IP"
    read -p "Continue anyway? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    error "Node.js 18+ required. Current version: $(node -v)"
fi

# Check if app directory exists
if [ ! -d "$APP_DIR" ]; then
    error "Application directory not found: $APP_DIR"
fi

cd "$APP_DIR"

# ============================================
# Step 1: Backup Current System
# ============================================

log "Step 1: Creating backup..."

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Backup database
if [ -f "prisma/dev.db" ]; then
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).db"
    cp prisma/dev.db "$BACKUP_FILE"
    log "Database backed up to: $BACKUP_FILE"
else
    warning "No existing database found to backup"
fi

# Backup environment file
if [ -f ".env.local" ]; then
    cp .env.local "$BACKUP_DIR/.env.local.backup-$(date +%Y%m%d-%H%M%S)"
    log "Environment file backed up"
fi

# ============================================
# Step 2: Check and Kill Existing Process
# ============================================

log "Step 2: Checking for existing processes..."

# CRITICAL: Only kill process on port 3000, NEVER use killall or kill node
PORT_PID=$(lsof -ti:3000 2>/dev/null || true)
if [ ! -z "$PORT_PID" ]; then
    warning "Found process on port 3000 (PID: $PORT_PID)"
    kill -9 "$PORT_PID"
    log "Killed process on port 3000"
    sleep 2
else
    log "No process found on port 3000"
fi

# ============================================
# Step 3: Install Dependencies
# ============================================

log "Step 3: Installing dependencies..."

# Clean install for production
rm -rf node_modules package-lock.json
npm ci --production=false || npm install

# ============================================
# Step 4: Database Setup
# ============================================

log "Step 4: Setting up database..."

# Initialize Prisma
npx prisma generate

# Push schema to database (create tables if needed)
npx prisma db push --skip-generate

# Run database optimization
if [ -f "lib/database-optimization.sql" ]; then
    log "Running database optimization..."
    sqlite3 prisma/dev.db < lib/database-optimization.sql 2>/dev/null || warning "Some optimizations may have already been applied"
fi

# ============================================
# Step 5: Environment Configuration
# ============================================

log "Step 5: Configuring environment..."

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        warning "Created .env.local from template. Please configure it!"
        warning "Edit .env.local and add your secrets before continuing"
        read -p "Press enter when .env.local is configured..."
    else
        error "No .env.local or .env.example found!"
    fi
fi

# Verify critical environment variables
source .env.local
if [ -z "$ENCRYPTION_KEY" ] || [ -z "$SESSION_SECRET" ]; then
    warning "Security keys not configured in .env.local"
    log "Generating secure keys..."
    
    # Generate secure keys if not present
    if [ -z "$ENCRYPTION_KEY" ]; then
        ENCRYPTION_KEY=$(openssl rand -hex 32)
        echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env.local
    fi
    
    if [ -z "$SESSION_SECRET" ]; then
        SESSION_SECRET=$(openssl rand -hex 32)
        echo "SESSION_SECRET=$SESSION_SECRET" >> .env.local
    fi
    
    log "Security keys generated and saved"
fi

# ============================================
# Step 6: Build Production Version
# ============================================

log "Step 6: Building production version..."

# Clean previous build
rm -rf .next

# Build Next.js application
NODE_ENV=production npm run build

if [ ! -d ".next" ]; then
    error "Build failed - .next directory not created"
fi

# ============================================
# Step 7: Run Tests
# ============================================

log "Step 7: Running validation tests..."

# Run critical tests only (quick validation)
npm run test:week4:quick || warning "Some tests failed - review before continuing"

# ============================================
# Step 8: Setup Systemd Service (Optional)
# ============================================

log "Step 8: Setting up systemd service..."

# Create systemd service file
sudo tee /etc/systemd/system/income-clarity.service > /dev/null <<EOF
[Unit]
Description=Income Clarity Lite Production
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$APP_DIR
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=10
StandardOutput=append:$APP_DIR/logs/app.log
StandardError=append:$APP_DIR/logs/error.log
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
sudo systemctl daemon-reload
sudo systemctl enable income-clarity.service

log "Systemd service configured"

# ============================================
# Step 9: Setup Daily Backup Cron
# ============================================

log "Step 9: Setting up automated backups..."

# Create backup script
cat > scripts/daily-backup.sh <<'EOF'
#!/bin/bash
BACKUP_DIR="/backups/income-clarity"
DB_FILE="/public/MasterV2/income-clarity/income-clarity-app/prisma/dev.db"
BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d).db.enc"

# Create backup
if [ -f "$DB_FILE" ]; then
    mkdir -p "$BACKUP_DIR"
    # Encrypt backup with password
    openssl enc -aes-256-cbc -salt -in "$DB_FILE" -out "$BACKUP_FILE" -pass pass:${BACKUP_PASSWORD:-defaultpass}
    
    # Remove backups older than 30 days
    find "$BACKUP_DIR" -name "*.db.enc" -mtime +30 -delete
    
    echo "Backup completed: $BACKUP_FILE"
else
    echo "Database file not found!"
    exit 1
fi
EOF

chmod +x scripts/daily-backup.sh

# Add to crontab (2 AM daily)
(crontab -l 2>/dev/null; echo "0 2 * * * $APP_DIR/scripts/daily-backup.sh") | crontab -

log "Daily backup cron job configured"

# ============================================
# Step 10: Start Application
# ============================================

log "Step 10: Starting application..."

# Start using systemd
sudo systemctl start income-clarity.service

# Wait for startup
sleep 5

# Check if running
if sudo systemctl is-active --quiet income-clarity.service; then
    log "Application started successfully!"
else
    error "Failed to start application. Check logs: sudo journalctl -u income-clarity.service"
fi

# ============================================
# Step 11: Verify Deployment
# ============================================

log "Step 11: Verifying deployment..."

# Check if application is responding
sleep 3
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    log "✅ Application is running and healthy!"
else
    warning "Application may not be fully started. HTTP status: $HTTP_STATUS"
    warning "Check manually: curl http://localhost:3000/api/health"
fi

# ============================================
# Post-Deployment Summary
# ============================================

echo ""
echo "============================================"
echo -e "${GREEN}DEPLOYMENT COMPLETE!${NC}"
echo "============================================"
echo ""
echo "Application URL: http://$SERVER_IP:3000"
echo "Health Check: http://$SERVER_IP:3000/api/health"
echo "Security Status: http://$SERVER_IP:3000/api/security/status"
echo ""
echo "Useful Commands:"
echo "  View logs:        sudo journalctl -u income-clarity.service -f"
echo "  Restart app:      sudo systemctl restart income-clarity.service"
echo "  Stop app:         sudo systemctl stop income-clarity.service"
echo "  Check status:     sudo systemctl status income-clarity.service"
echo "  Manual backup:    ./scripts/daily-backup.sh"
echo ""
echo "⚠️  IMPORTANT REMINDERS:"
echo "  1. NEVER use 'killall node' or 'pkill node'"
echo "  2. Always backup before updates"
echo "  3. Monitor logs for first 24 hours"
echo "  4. Test all critical features"
echo ""
echo "Deployment log saved to: $LOG_FILE"
echo "============================================"

# Create quick status check script
cat > check-status.sh <<'EOF'
#!/bin/bash
echo "Income Clarity Status Check"
echo "=========================="
echo "Service Status:"
sudo systemctl status income-clarity.service --no-pager | head -n 5
echo ""
echo "Port Status:"
lsof -i:3000
echo ""
echo "Health Check:"
curl -s http://localhost:3000/api/health | python3 -m json.tool 2>/dev/null || echo "API not responding"
echo ""
echo "Recent Logs:"
sudo journalctl -u income-clarity.service --no-pager -n 10
EOF

chmod +x check-status.sh
log "Created check-status.sh for quick health checks"

exit 0