#!/bin/bash
# setup-claude-permissions.sh
# Comprehensive sudo permissions setup for Claude AI management
# Generated: $(date)

set -e

echo "🚀 Setting up Claude AI Management Permissions..."
echo "=================================================="

# Get current user (but use the real user if run with sudo)
if [ -n "$SUDO_USER" ]; then
    CURRENT_USER="$SUDO_USER"
else
    CURRENT_USER=$(whoami)
fi
echo "📋 Setting up permissions for user: $CURRENT_USER"

# Create sudoers file for Claude AI management
echo "🔧 Creating sudoers configuration..."
cat << EOF | sudo tee /etc/sudoers.d/claude-ai
# Income Clarity Management Permissions for Claude AI
# Generated: $(date)
# User: $CURRENT_USER

# Nginx management (NOPASSWD)
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/systemctl reload nginx
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/systemctl status nginx
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/systemctl start nginx
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/systemctl stop nginx
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/sbin/nginx -t
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/sbin/nginx -s reload
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/sbin/nginx -s quit
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/sbin/nginx -s stop

# Income Clarity service management (NOPASSWD)
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/systemctl start income-clarity
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/systemctl stop income-clarity
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/systemctl restart income-clarity
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/systemctl status income-clarity
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/systemctl enable income-clarity
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/systemctl disable income-clarity
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/systemctl daemon-reload

# Log viewing (NOPASSWD)
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/journalctl -u nginx*
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/journalctl -u income-clarity*
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/tail -f /var/log/nginx/*
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/tail -n * /var/log/nginx/*
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/cat /var/log/nginx/*

# Process management (NOPASSWD)
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/lsof -i\:3000
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/lsof -i\:80
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/lsof -i\:443
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/netstat -tulpn
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/ss -tulpn*
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/ps aux
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/pkill -f node
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/pkill -f next-server
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/pkill -f income-clarity

# File system monitoring (NOPASSWD)
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/df -h
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/du -sh *
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/ls -la /etc/nginx/*
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/cat /etc/nginx/sites-available/*
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/cat /etc/nginx/sites-enabled/*

# Certificate management (Read only)
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/ls -la /etc/letsencrypt/live/*
$CURRENT_USER ALL=(ALL) NOPASSWD: /bin/cat /etc/letsencrypt/live/*/fullchain.pem
$CURRENT_USER ALL=(ALL) NOPASSWD: /usr/bin/openssl x509 -in /etc/letsencrypt/live/* -text -noout

EOF

# Set correct permissions on sudoers file
echo "🔒 Setting secure permissions on sudoers file..."
sudo chmod 440 /etc/sudoers.d/claude-ai

# Add user to relevant groups
echo "👥 Adding user to management groups..."
sudo usermod -a -G www-data $CURRENT_USER 2>/dev/null || echo "   ⚠️  www-data group not found (skipping)"
sudo usermod -a -G systemd-journal $CURRENT_USER 2>/dev/null || echo "   ⚠️  systemd-journal group not found (skipping)"
sudo usermod -a -G adm $CURRENT_USER 2>/dev/null || echo "   ⚠️  adm group not found (skipping)"

# Set nginx directory permissions
echo "📁 Setting nginx directory permissions..."
if [ -d "/etc/nginx/sites-available" ]; then
    sudo chgrp -R www-data /etc/nginx/sites-available/ 2>/dev/null || echo "   ⚠️  Cannot change nginx group ownership"
    sudo chmod g+r /etc/nginx/sites-available/ 2>/dev/null || echo "   ⚠️  Cannot set nginx read permissions"
fi

echo ""
echo "✅ PERMISSIONS SETUP COMPLETE!"
echo "================================"
echo ""
echo "🧪 Testing permissions..."

# Test critical permissions
echo "Testing nginx config validation..."
if sudo nginx -t 2>/dev/null; then
    echo "   ✅ nginx -t (config test) - WORKING"
else
    echo "   ❌ nginx -t (config test) - FAILED"
fi

echo "Testing nginx status..."
if sudo systemctl status nginx >/dev/null 2>&1; then
    echo "   ✅ systemctl status nginx - WORKING"
else
    echo "   ❌ systemctl status nginx - FAILED"
fi

echo "Testing port check..."
if sudo lsof -i:3000 >/dev/null 2>&1; then
    echo "   ✅ lsof -i:3000 (port check) - WORKING"
else
    echo "   ℹ️  lsof -i:3000 (no process on port 3000 - normal)"
fi

echo "Testing log access..."
if sudo journalctl -u nginx -n 1 >/dev/null 2>&1; then
    echo "   ✅ journalctl log access - WORKING"
else
    echo "   ❌ journalctl log access - FAILED"
fi

echo ""
echo "🎯 CLAUDE AI CAN NOW:"
echo "✅ Restart nginx without password prompts"
echo "✅ Test nginx configurations automatically"
echo "✅ Manage Income Clarity service"
echo "✅ Debug port conflicts instantly"
echo "✅ Monitor logs in real-time"
echo "✅ Kill stuck processes autonomously"
echo "✅ Perform 24/7 maintenance tasks"
echo ""
echo "🔥 AUTONOMOUS MANAGEMENT ACTIVATED!"
echo "Run 'sudo nginx -t' to verify setup is working."
