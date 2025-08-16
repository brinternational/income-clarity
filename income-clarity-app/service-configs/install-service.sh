#!/bin/bash

# Income Clarity Service Installation Script
# This script installs the Income Clarity app as a systemd service

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

APP_NAME="income-clarity"
SERVICE_FILE="income-clarity.service"
APP_DIR="/public/MasterV2/income-clarity/income-clarity-app"
SERVICE_DIR="/etc/systemd/system"

echo -e "${GREEN}=== Income Clarity Service Installation ===${NC}"

# Check if running as root for service installation
if [[ $EUID -eq 0 ]]; then
    echo -e "${RED}Warning: Running as root. This script will install a system service.${NC}"
else
    echo -e "${YELLOW}Note: You may need sudo privileges for service installation.${NC}"
fi

# Step 1: Verify app directory exists
echo -e "\n${YELLOW}Step 1: Checking application directory...${NC}"
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}ERROR: Application directory not found: $APP_DIR${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Application directory found${NC}"

# Step 2: Verify package.json and dependencies
echo -e "\n${YELLOW}Step 2: Checking application setup...${NC}"
cd "$APP_DIR"
if [ ! -f "package.json" ]; then
    echo -e "${RED}ERROR: package.json not found${NC}"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
fi

# Step 3: Build the application
echo -e "\n${YELLOW}Step 3: Building application for production...${NC}"
npm run build
echo -e "${GREEN}✓ Application built successfully${NC}"

# Step 4: Create/verify environment file
echo -e "\n${YELLOW}Step 4: Checking environment configuration...${NC}"
if [ ! -f ".env.local" ]; then
    echo -e "${RED}ERROR: .env.local file not found${NC}"
    echo "Please copy .env.example to .env.local and configure your environment variables"
    exit 1
fi
echo -e "${GREEN}✓ Environment file found${NC}"

# Step 5: Create health check endpoint (if it doesn't exist)
echo -e "\n${YELLOW}Step 5: Setting up health check...${NC}"
HEALTH_ENDPOINT="$APP_DIR/app/api/health/route.ts"
if [ ! -f "$HEALTH_ENDPOINT" ]; then
    mkdir -p "$APP_DIR/app/api/health"
    cat > "$HEALTH_ENDPOINT" << 'EOF'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'income-clarity'
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', error: 'Service check failed' },
      { status: 503 }
    )
  }
}
EOF
    echo -e "${GREEN}✓ Health check endpoint created${NC}"
else
    echo -e "${GREEN}✓ Health check endpoint already exists${NC}"
fi

# Step 6: Install systemd service
echo -e "\n${YELLOW}Step 6: Installing systemd service...${NC}"
if [ -f "service-configs/$SERVICE_FILE" ]; then
    sudo cp "service-configs/$SERVICE_FILE" "$SERVICE_DIR/$SERVICE_FILE"
    sudo systemctl daemon-reload
    echo -e "${GREEN}✓ Service file installed${NC}"
else
    echo -e "${RED}ERROR: Service file not found: service-configs/$SERVICE_FILE${NC}"
    exit 1
fi

# Step 7: Enable and start service
echo -e "\n${YELLOW}Step 7: Enabling and starting service...${NC}"
sudo systemctl enable "$APP_NAME"
sudo systemctl start "$APP_NAME"

# Step 8: Check service status
echo -e "\n${YELLOW}Step 8: Checking service status...${NC}"
sleep 5
sudo systemctl status "$APP_NAME" --no-pager

# Step 9: Test the service
echo -e "\n${YELLOW}Step 9: Testing service health...${NC}"
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Service is running and healthy${NC}"
else
    echo -e "${RED}✗ Service health check failed${NC}"
    echo "Check logs with: sudo journalctl -u $APP_NAME -f"
fi

# Summary
echo -e "\n${GREEN}=== Installation Complete ===${NC}"
echo -e "Service name: ${YELLOW}$APP_NAME${NC}"
echo -e "Service file: ${YELLOW}$SERVICE_DIR/$SERVICE_FILE${NC}"
echo -e "Application: ${YELLOW}http://localhost:3000${NC}"
echo -e ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  sudo systemctl status $APP_NAME     # Check status"
echo -e "  sudo systemctl start $APP_NAME      # Start service"
echo -e "  sudo systemctl stop $APP_NAME       # Stop service"
echo -e "  sudo systemctl restart $APP_NAME    # Restart service"
echo -e "  sudo journalctl -u $APP_NAME -f     # View logs"
echo -e "  sudo systemctl disable $APP_NAME    # Disable auto-start"
echo -e ""
echo -e "${GREEN}Your Income Clarity app is now running as a service!${NC}"