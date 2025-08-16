#!/bin/bash

# Check Production Server Status
# Verifies server connectivity and current application status

set -euo pipefail

REMOTE_HOST="${REMOTE_HOST:-137.184.142.42}"
REMOTE_USER="${REMOTE_USER:-root}"
REMOTE_PORT="${REMOTE_PORT:-22}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/income-clarity-lite}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Checking Production Server Status${NC}"
echo -e "${BLUE}Server: ${REMOTE_HOST}${NC}\n"

# Test SSH connection
echo "🔌 Testing SSH connection..."
if ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "echo 'Connected'" 2>/dev/null; then
    echo -e "${GREEN}✅ SSH connection successful${NC}"
else
    echo -e "${RED}❌ SSH connection failed${NC}"
    exit 1
fi

# Check server information
echo -e "\n📊 Server Information:"
ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << 'EOF'
    echo "   OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
    echo "   Uptime: $(uptime -p)"
    echo "   CPU: $(nproc) cores"
    echo "   Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
    echo "   Disk: $(df -h / | tail -n 1 | awk '{print $3 "/" $2 " (" $5 " used)"}')"
EOF

# Check if Node.js is installed
echo -e "\n🟢 Node.js Status:"
ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << 'EOF'
    if command -v node >/dev/null 2>&1; then
        echo "   ✅ Node.js installed: $(node --version)"
    else
        echo "   ❌ Node.js not installed"
    fi
    
    if command -v npm >/dev/null 2>&1; then
        echo "   ✅ NPM installed: $(npm --version)"
    else
        echo "   ❌ NPM not installed"
    fi
EOF

# Check if PM2 is installed
echo -e "\n🔄 PM2 Status:"
ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << 'EOF'
    if command -v pm2 >/dev/null 2>&1; then
        echo "   ✅ PM2 installed: $(pm2 --version)"
        echo "   📊 PM2 Status:"
        pm2 status 2>/dev/null || echo "   ℹ️  No PM2 processes running"
    else
        echo "   ❌ PM2 not installed"
    fi
EOF

# Check current application
echo -e "\n📱 Current Application Status:"
ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << EOF
    if [[ -d "${REMOTE_PATH}" ]]; then
        echo "   📁 Application directory exists: ${REMOTE_PATH}"
        cd ${REMOTE_PATH}
        
        if [[ -f "package.json" ]]; then
            echo "   ✅ package.json found"
            APP_NAME=\$(grep '"name"' package.json | cut -d'"' -f4)
            echo "   📦 Application: \$APP_NAME"
        else
            echo "   ❌ package.json not found"
        fi
        
        if [[ -f "prisma/income_clarity.db" ]]; then
            DB_SIZE=\$(du -h prisma/income_clarity.db | cut -f1)
            echo "   🗃️  Database exists: \$DB_SIZE"
        else
            echo "   ❌ Database not found"
        fi
        
        if [[ -d "data/backups" ]]; then
            BACKUP_COUNT=\$(ls data/backups/backup_*.db 2>/dev/null | wc -l)
            echo "   💾 Backups available: \$BACKUP_COUNT"
        else
            echo "   ❌ Backup directory not found"
        fi
        
    else
        echo "   ❌ Application directory does not exist: ${REMOTE_PATH}"
    fi
EOF

# Check web server status
echo -e "\n🌐 Web Server Status:"
ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << 'EOF'
    if command -v nginx >/dev/null 2>&1; then
        echo "   ✅ Nginx installed: $(nginx -v 2>&1 | cut -d'/' -f2)"
        if systemctl is-active --quiet nginx; then
            echo "   ✅ Nginx is running"
        else
            echo "   ❌ Nginx is not running"
        fi
    else
        echo "   ❌ Nginx not installed"
    fi
EOF

# Test application health
echo -e "\n🏥 Application Health Check:"
HEALTH_STATUS=$(ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" \
    "curl -s -w '%{http_code}' http://localhost:3000/api/health-check -o /dev/null 2>/dev/null" || echo "000")

if [[ "${HEALTH_STATUS}" == "200" ]]; then
    echo -e "   ${GREEN}✅ Application is healthy (HTTP 200)${NC}"
    
    # Test public access
    PUBLIC_STATUS=$(curl -s -w '%{http_code}' https://incomeclarity.ddns.net/api/health-check -o /dev/null 2>/dev/null || echo "000")
    if [[ "${PUBLIC_STATUS}" == "200" ]]; then
        echo -e "   ${GREEN}✅ Public access working (HTTP 200)${NC}"
    else
        echo -e "   ${YELLOW}⚠️  Public access issue (HTTP ${PUBLIC_STATUS})${NC}"
    fi
else
    echo -e "   ${RED}❌ Application health check failed (HTTP ${HEALTH_STATUS})${NC}"
fi

# Check system resources
echo -e "\n💻 System Resources:"
ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" << 'EOF'
    echo "   CPU Usage: $(top -bn1 | grep load | awk '{printf "%.2f%%\n", $(NF-2)*100}')"
    echo "   Memory Usage: $(free | grep Mem | awk '{printf "%.1f%%\n", $3/$2 * 100.0}')"
    echo "   Disk Usage: $(df / | tail -1 | awk '{print $5}')"
    
    # Check if system needs reboot
    if [[ -f /var/run/reboot-required ]]; then
        echo "   ⚠️  System reboot required"
    fi
EOF

echo -e "\n${GREEN}✅ Server status check completed${NC}"

# Provide recommendations
echo -e "\n${BLUE}📝 Deployment Readiness:${NC}"

# Check if deployment is safe
READY=true

# Check SSH
if ! ssh -o ConnectTimeout=5 -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "exit" 2>/dev/null; then
    echo -e "   ${RED}❌ SSH connection issue${NC}"
    READY=false
fi

# Check disk space
DISK_USAGE=$(ssh -p "${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}" "df / | tail -1 | awk '{print \$5}' | sed 's/%//'" 2>/dev/null || echo "100")
if [[ ${DISK_USAGE} -gt 90 ]]; then
    echo -e "   ${RED}❌ Low disk space (${DISK_USAGE}% used)${NC}"
    READY=false
fi

if [[ "${READY}" == "true" ]]; then
    echo -e "   ${GREEN}✅ Server is ready for deployment${NC}"
    echo -e "\n${BLUE}🚀 To deploy, run:${NC}"
    echo -e "   ${YELLOW}bash scripts/deploy-lite-production.sh${NC}"
else
    echo -e "   ${RED}❌ Server needs attention before deployment${NC}"
    echo -e "\n${YELLOW}Please resolve the issues above before deploying${NC}"
fi