#!/bin/bash

# Nginx Configuration Switcher for Income Clarity
# Usage: sudo ./scripts/switch-nginx.sh [dev|prod]

MODE=${1:-dev}
NGINX_AVAILABLE="/etc/nginx/sites-available/income-clarity"
NGINX_ENABLED="/etc/nginx/sites-enabled/income-clarity"
CONFIG_DIR="/public/MasterV2/income-clarity/income-clarity-app/nginx-configs"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "❌ Please run with sudo: sudo $0 $1"
    exit 1
fi

case $MODE in
    dev)
        CONFIG_FILE="$CONFIG_DIR/income-clarity-dev.conf"
        echo "🔧 Switching to DEVELOPMENT nginx configuration..."
        echo "   - WebSocket support for HMR"
        echo "   - Font proxying enabled"
        echo "   - Longer timeouts for dev"
        ;;
    prod)
        CONFIG_FILE="$CONFIG_DIR/income-clarity-prod.conf"
        echo "🚀 Switching to PRODUCTION nginx configuration..."
        echo "   - Optimized caching"
        echo "   - Security headers"
        echo "   - HTTP/2 enabled"
        ;;
    *)
        echo "❌ Unknown mode: $MODE"
        echo "Usage: $0 [dev|prod]"
        exit 1
        ;;
esac

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "❌ Configuration file not found: $CONFIG_FILE"
    exit 1
fi

# Backup current configuration
if [ -f "$NGINX_AVAILABLE" ]; then
    cp "$NGINX_AVAILABLE" "$NGINX_AVAILABLE.backup"
    echo "📦 Backed up current nginx config to $NGINX_AVAILABLE.backup"
fi

# Copy new configuration
cp "$CONFIG_FILE" "$NGINX_AVAILABLE"
echo "✅ Installed $MODE configuration"

# Test nginx configuration
nginx -t
if [ $? -ne 0 ]; then
    echo "❌ Nginx configuration test failed!"
    echo "Restoring backup..."
    cp "$NGINX_AVAILABLE.backup" "$NGINX_AVAILABLE"
    exit 1
fi

# Reload nginx
systemctl reload nginx
echo "♻️  Nginx reloaded with $MODE configuration"

echo ""
echo "🎯 Configuration applied successfully!"
echo ""
echo "Next steps:"
if [ "$MODE" = "dev" ]; then
    echo "1. Start development server: npm run dev"
    echo "2. Access at: https://incomeclarity.ddns.net"
    echo "3. Hot reload and WebSockets will work"
else
    echo "1. Build the app: npm run build"
    echo "2. Start production server: npm run start"
    echo "3. Access at: https://incomeclarity.ddns.net"
fi