#!/bin/bash

# Income Clarity Service Manager
# Quick commands for managing the Income Clarity service

set -e

APP_NAME="income-clarity"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to show usage
show_usage() {
    echo -e "${BLUE}Income Clarity Service Manager${NC}"
    echo -e "Usage: $0 {install|start|stop|restart|status|logs|enable|disable|health|uninstall}"
    echo ""
    echo -e "${YELLOW}Commands:${NC}"
    echo -e "  install   Install the service"
    echo -e "  start     Start the service"
    echo -e "  stop      Stop the service"
    echo -e "  restart   Restart the service"
    echo -e "  status    Show service status"
    echo -e "  logs      Show service logs (live tail)"
    echo -e "  enable    Enable auto-start on boot"
    echo -e "  disable   Disable auto-start on boot"
    echo -e "  health    Check application health"
    echo -e "  uninstall Remove the service"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  $0 install    # Install and start the service"
    echo -e "  $0 status     # Check if service is running"
    echo -e "  $0 logs       # Watch live logs"
    echo -e "  $0 health     # Test health endpoint"
}

# Check if service exists
service_exists() {
    systemctl list-unit-files | grep -q "^$APP_NAME.service"
}

# Check if service is active
service_active() {
    systemctl is-active --quiet "$APP_NAME"
}

# Install service
install_service() {
    echo -e "${YELLOW}Installing Income Clarity service...${NC}"
    
    if [ -f "install-service.sh" ]; then
        ./install-service.sh
    else
        echo -e "${RED}ERROR: install-service.sh not found in current directory${NC}"
        echo "Please run this script from the service-configs directory"
        exit 1
    fi
}

# Start service
start_service() {
    echo -e "${YELLOW}Starting $APP_NAME service...${NC}"
    sudo systemctl start "$APP_NAME"
    echo -e "${GREEN}✓ Service started${NC}"
}

# Stop service
stop_service() {
    echo -e "${YELLOW}Stopping $APP_NAME service...${NC}"
    sudo systemctl stop "$APP_NAME"
    echo -e "${GREEN}✓ Service stopped${NC}"
}

# Restart service
restart_service() {
    echo -e "${YELLOW}Restarting $APP_NAME service...${NC}"
    sudo systemctl restart "$APP_NAME"
    echo -e "${GREEN}✓ Service restarted${NC}"
}

# Show service status
show_status() {
    echo -e "${YELLOW}Service Status:${NC}"
    sudo systemctl status "$APP_NAME" --no-pager
}

# Show logs
show_logs() {
    echo -e "${YELLOW}Showing live logs (Ctrl+C to exit):${NC}"
    sudo journalctl -u "$APP_NAME" -f
}

# Enable auto-start
enable_service() {
    echo -e "${YELLOW}Enabling auto-start on boot...${NC}"
    sudo systemctl enable "$APP_NAME"
    echo -e "${GREEN}✓ Auto-start enabled${NC}"
}

# Disable auto-start
disable_service() {
    echo -e "${YELLOW}Disabling auto-start on boot...${NC}"
    sudo systemctl disable "$APP_NAME"
    echo -e "${GREEN}✓ Auto-start disabled${NC}"
}

# Check health
check_health() {
    echo -e "${YELLOW}Checking application health...${NC}"
    
    if curl -f -s http://localhost:3000/api/health > /dev/null; then
        echo -e "${GREEN}✓ Application is healthy${NC}"
        echo ""
        echo -e "${YELLOW}Health Details:${NC}"
        curl -s http://localhost:3000/api/health?details=true | jq '.' 2>/dev/null || curl -s http://localhost:3000/api/health?details=true
    else
        echo -e "${RED}✗ Application health check failed${NC}"
        echo "The service may be down or not responding on port 3000"
    fi
}

# Uninstall service
uninstall_service() {
    echo -e "${YELLOW}Uninstalling $APP_NAME service...${NC}"
    
    # Stop service if running
    if service_active; then
        sudo systemctl stop "$APP_NAME"
        echo -e "${GREEN}✓ Service stopped${NC}"
    fi
    
    # Disable auto-start
    if service_exists; then
        sudo systemctl disable "$APP_NAME"
        echo -e "${GREEN}✓ Auto-start disabled${NC}"
        
        # Remove service file
        sudo rm -f "/etc/systemd/system/$APP_NAME.service"
        sudo systemctl daemon-reload
        echo -e "${GREEN}✓ Service file removed${NC}"
    fi
    
    echo -e "${GREEN}✓ Service uninstalled${NC}"
}

# Main script logic
case "${1:-}" in
    install)
        install_service
        ;;
    start)
        if ! service_exists; then
            echo -e "${RED}ERROR: Service not installed. Run '$0 install' first.${NC}"
            exit 1
        fi
        start_service
        ;;
    stop)
        if ! service_exists; then
            echo -e "${RED}ERROR: Service not installed.${NC}"
            exit 1
        fi
        stop_service
        ;;
    restart)
        if ! service_exists; then
            echo -e "${RED}ERROR: Service not installed. Run '$0 install' first.${NC}"
            exit 1
        fi
        restart_service
        ;;
    status)
        if ! service_exists; then
            echo -e "${RED}ERROR: Service not installed.${NC}"
            exit 1
        fi
        show_status
        ;;
    logs)
        if ! service_exists; then
            echo -e "${RED}ERROR: Service not installed.${NC}"
            exit 1
        fi
        show_logs
        ;;
    enable)
        if ! service_exists; then
            echo -e "${RED}ERROR: Service not installed. Run '$0 install' first.${NC}"
            exit 1
        fi
        enable_service
        ;;
    disable)
        if ! service_exists; then
            echo -e "${RED}ERROR: Service not installed.${NC}"
            exit 1
        fi
        disable_service
        ;;
    health)
        check_health
        ;;
    uninstall)
        uninstall_service
        ;;
    "")
        show_usage
        ;;
    *)
        echo -e "${RED}ERROR: Unknown command: $1${NC}"
        echo ""
        show_usage
        exit 1
        ;;
esac