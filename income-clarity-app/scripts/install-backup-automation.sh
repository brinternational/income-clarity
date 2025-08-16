#!/bin/bash

# LITE-035: Install Backup Automation System
# Sets up systemd timer and service for automated daily backups

set -e

echo "🚀 Installing Income Clarity Backup Automation System"
echo "=================================================="

# Check if running as root or with sudo
if [[ $EUID -ne 0 && -z "$SUDO_USER" ]]; then
    echo "❌ This script needs to be run with sudo privileges"
    echo "Please run: sudo $0"
    exit 1
fi

# Get the actual user (not root when using sudo)
ACTUAL_USER=${SUDO_USER:-$(whoami)}
USER_HOME=$(getent passwd "$ACTUAL_USER" | cut -d: -f6)

# Project paths
PROJECT_DIR="/public/MasterV2/income-clarity/income-clarity-app"
SCRIPTS_DIR="$PROJECT_DIR/scripts"
SYSTEMD_DIR="/etc/systemd/system"

echo "👤 Installing for user: $ACTUAL_USER"
echo "📁 Project directory: $PROJECT_DIR"

# Verify project directory exists
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Project directory not found: $PROJECT_DIR"
    exit 1
fi

# Verify backup script exists
if [ ! -f "$SCRIPTS_DIR/backup-database.js" ]; then
    echo "❌ Backup script not found: $SCRIPTS_DIR/backup-database.js"
    exit 1
fi

# Make scripts executable
echo "📝 Making scripts executable..."
chmod +x "$SCRIPTS_DIR/backup-database.js"
chmod +x "$SCRIPTS_DIR/backup-monitor.js"

# Copy systemd service files
echo "⚙️  Installing systemd service files..."
cp "$SCRIPTS_DIR/backup-automation.service" "$SYSTEMD_DIR/"
cp "$SCRIPTS_DIR/backup-automation.timer" "$SYSTEMD_DIR/"

# Update service file with correct paths and user
echo "🔧 Configuring service for current environment..."
sed -i "s|User=devuser|User=$ACTUAL_USER|g" "$SYSTEMD_DIR/backup-automation.service"
sed -i "s|Group=devuser|Group=$ACTUAL_USER|g" "$SYSTEMD_DIR/backup-automation.service"
sed -i "s|WorkingDirectory=.*|WorkingDirectory=$PROJECT_DIR|g" "$SYSTEMD_DIR/backup-automation.service"

# Detect Node.js path
NODE_PATH=$(which node)
if [ -z "$NODE_PATH" ]; then
    echo "⚠️  Node.js not found in PATH, checking common locations..."
    # Check NVM installation
    if [ -f "$USER_HOME/.nvm/nvm.sh" ]; then
        source "$USER_HOME/.nvm/nvm.sh"
        NODE_PATH=$(which node)
    fi
    
    # Check common system locations
    for path in /usr/local/bin/node /usr/bin/node /bin/node; do
        if [ -x "$path" ]; then
            NODE_PATH="$path"
            break
        fi
    done
fi

if [ -z "$NODE_PATH" ]; then
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

echo "🟢 Found Node.js at: $NODE_PATH"
sed -i "s|ExecStart=/usr/bin/node|ExecStart=$NODE_PATH|g" "$SYSTEMD_DIR/backup-automation.service"

# Reload systemd daemon
echo "🔄 Reloading systemd daemon..."
systemctl daemon-reload

# Enable and start the timer
echo "⏰ Enabling backup timer..."
systemctl enable backup-automation.timer

echo "🏁 Starting backup timer..."
systemctl start backup-automation.timer

# Check status
echo ""
echo "📊 Service Status:"
systemctl status backup-automation.timer --no-pager -l

echo ""
echo "📅 Timer Schedule:"
systemctl list-timers backup-automation.timer --no-pager

echo ""
echo "✅ Installation Complete!"
echo ""
echo "📋 Management Commands:"
echo "  • Check status:    sudo systemctl status backup-automation.timer"
echo "  • View logs:       sudo journalctl -u backup-automation.service -f"
echo "  • Test backup:     sudo systemctl start backup-automation.service"
echo "  • Stop timer:      sudo systemctl stop backup-automation.timer"
echo "  • Disable timer:   sudo systemctl disable backup-automation.timer"
echo ""
echo "🔍 Monitoring Commands:"
echo "  • Health check:    node $SCRIPTS_DIR/backup-monitor.js health"
echo "  • Verify backup:   node $SCRIPTS_DIR/backup-monitor.js verify"
echo "  • Cleanup old:     node $SCRIPTS_DIR/backup-monitor.js cleanup"
echo ""
echo "⏰ Backup Schedule: Daily at 3:00 AM"
echo "📍 Backup Location: $PROJECT_DIR/data/backups/"
echo ""

# Create a quick test
echo "🧪 Running test backup to verify installation..."
systemctl start backup-automation.service

echo "⏳ Waiting for test backup to complete..."
sleep 5

# Check if backup was created
if [ -f "$PROJECT_DIR/data/backups/latest.db" ]; then
    echo "✅ Test backup successful!"
    echo "🎉 Backup automation is now active!"
else
    echo "⚠️  Test backup may have failed. Check logs:"
    echo "sudo journalctl -u backup-automation.service --no-pager"
fi

echo ""
echo "🛡️  Backup automation setup complete!"