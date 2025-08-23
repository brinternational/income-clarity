#!/bin/bash

# 🚨 Deployment Alert System
# Handles multiple alert channels for deployment events

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Alert configuration
ALERT_CONFIG="$APP_DIR/.alert-config.json"

# Default configuration
create_default_config() {
  cat > "$ALERT_CONFIG" << 'EOF'
{
  "enabled": true,
  "channels": {
    "console": {
      "enabled": true,
      "level": "info"
    },
    "desktop": {
      "enabled": false,
      "level": "warning"
    },
    "browser": {
      "enabled": true,
      "level": "info"
    },
    "webhook": {
      "enabled": false,
      "url": "",
      "level": "error"
    },
    "slack": {
      "enabled": false,
      "webhook_url": "",
      "level": "warning"
    },
    "email": {
      "enabled": false,
      "smtp_server": "",
      "level": "error"
    }
  },
  "sounds": {
    "enabled": true,
    "success": "bell",
    "warning": "bell",
    "error": "bell"
  }
}
EOF
}

# Load configuration
load_config() {
  if [ ! -f "$ALERT_CONFIG" ]; then
    create_default_config
  fi
  
  # Validate JSON
  if ! jq . "$ALERT_CONFIG" >/dev/null 2>&1; then
    echo "Warning: Invalid alert configuration, recreating defaults"
    create_default_config
  fi
}

# Get config value
get_config() {
  local path="$1"
  jq -r "$path" "$ALERT_CONFIG" 2>/dev/null || echo "false"
}

# Alert sound system
play_alert_sound() {
  local type="${1:-bell}"
  
  if [ "$(get_config '.sounds.enabled')" = "true" ]; then
    case "$type" in
      "bell")
        if command -v tput >/dev/null 2>&1; then
          tput bel
        fi
        ;;
      "beep")
        if command -v beep >/dev/null 2>&1; then
          beep -f 1000 -l 100
        elif command -v tput >/dev/null 2>&1; then
          tput bel
        fi
        ;;
      "chime")
        # Multiple bell sounds for chime effect
        if command -v tput >/dev/null 2>&1; then
          tput bel && sleep 0.1 && tput bel && sleep 0.1 && tput bel
        fi
        ;;
    esac
  fi
}

# Console alerts
send_console_alert() {
  local level="$1"
  local title="$2"
  local message="$3"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  if [ "$(get_config '.channels.console.enabled')" = "true" ]; then
    case "$level" in
      "success")
        echo -e "${timestamp} ${GREEN}✅ ${BOLD}${title}${NC}"
        echo -e "${GREEN}   ${message}${NC}"
        play_alert_sound "chime"
        ;;
      "warning")
        echo -e "${timestamp} ${YELLOW}⚠️  ${BOLD}${title}${NC}"
        echo -e "${YELLOW}   ${message}${NC}"
        play_alert_sound "bell"
        ;;
      "error")
        echo -e "${timestamp} ${RED}❌ ${BOLD}${title}${NC}"
        echo -e "${RED}   ${message}${NC}"
        play_alert_sound "beep"
        ;;
      "info")
        echo -e "${timestamp} ${BLUE}ℹ️  ${BOLD}${title}${NC}"
        echo -e "${BLUE}   ${message}${NC}"
        ;;
      "deployment")
        echo -e "${timestamp} ${PURPLE}🚀 ${BOLD}${title}${NC}"
        echo -e "${PURPLE}   ${message}${NC}"
        play_alert_sound "chime"
        ;;
    esac
  fi
}

# Desktop notifications (Linux/macOS)
send_desktop_notification() {
  local level="$1"
  local title="$2"
  local message="$3"
  
  if [ "$(get_config '.channels.desktop.enabled')" = "true" ]; then
    local icon=""
    local urgency="normal"
    
    case "$level" in
      "success")
        icon="dialog-information"
        ;;
      "warning")
        icon="dialog-warning"
        urgency="normal"
        ;;
      "error")
        icon="dialog-error"
        urgency="critical"
        ;;
      "deployment")
        icon="system-software-install"
        urgency="normal"
        ;;
      *)
        icon="dialog-information"
        ;;
    esac
    
    # Try different notification systems
    if command -v notify-send >/dev/null 2>&1; then
      notify-send -i "$icon" -u "$urgency" "$title" "$message"
    elif command -v osascript >/dev/null 2>&1; then
      # macOS
      osascript -e "display notification \"$message\" with title \"$title\""
    fi
  fi
}

# Browser notification (via API)
send_browser_notification() {
  local level="$1"
  local title="$2"
  local message="$3"
  
  if [ "$(get_config '.channels.browser.enabled')" = "true" ]; then
    # Send to browser notification API
    local payload=$(jq -n --arg level "$level" --arg title "$title" --arg message "$message" '{
      level: $level,
      title: $title,
      message: $message,
      timestamp: now | todateiso8601
    }')
    
    # Try to send to notification endpoint
    curl -s -X POST \
      -H "Content-Type: application/json" \
      -d "$payload" \
      "http://localhost:3000/api/monitoring/notify" >/dev/null 2>&1 || true
  fi
}

# Webhook alerts
send_webhook_alert() {
  local level="$1"
  local title="$2"
  local message="$3"
  local webhook_url="$(get_config '.channels.webhook.url')"
  
  if [ "$(get_config '.channels.webhook.enabled')" = "true" ] && [ -n "$webhook_url" ]; then
    local payload=$(jq -n --arg level "$level" --arg title "$title" --arg message "$message" '{
      alert_level: $level,
      title: $title,
      message: $message,
      timestamp: now | todateiso8601,
      source: "income-clarity-deployment-monitor"
    }')
    
    curl -s -X POST \
      -H "Content-Type: application/json" \
      -d "$payload" \
      "$webhook_url" >/dev/null 2>&1 || true
  fi
}

# Slack alerts
send_slack_alert() {
  local level="$1"
  local title="$2"
  local message="$3"
  local webhook_url="$(get_config '.channels.slack.webhook_url')"
  
  if [ "$(get_config '.channels.slack.enabled')" = "true" ] && [ -n "$webhook_url" ]; then
    local emoji="ℹ️"
    local color="good"
    
    case "$level" in
      "success")
        emoji="✅"
        color="good"
        ;;
      "warning")
        emoji="⚠️"
        color="warning"
        ;;
      "error")
        emoji="❌"
        color="danger"
        ;;
      "deployment")
        emoji="🚀"
        color="good"
        ;;
    esac
    
    local payload=$(jq -n --arg emoji "$emoji" --arg title "$title" --arg message "$message" --arg color "$color" '{
      text: "\($emoji) \($title)",
      attachments: [{
        color: $color,
        text: $message,
        ts: now
      }]
    }')
    
    curl -s -X POST \
      -H "Content-Type: application/json" \
      -d "$payload" \
      "$webhook_url" >/dev/null 2>&1 || true
  fi
}

# Main alert function
send_alert() {
  local level="$1"
  local title="$2"
  local message="$3"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  # Load configuration
  load_config
  
  # Check if alerts are enabled
  if [ "$(get_config '.enabled')" != "true" ]; then
    return 0
  fi
  
  # Check level filtering for each channel
  local console_level="$(get_config '.channels.console.level')"
  local desktop_level="$(get_config '.channels.desktop.level')"
  local browser_level="$(get_config '.channels.browser.level')"
  local webhook_level="$(get_config '.channels.webhook.level')"
  local slack_level="$(get_config '.channels.slack.level')"
  
  # Level priority: error > warning > info > success > deployment
  should_send_alert() {
    local channel_level="$1"
    local alert_level="$2"
    
    case "$channel_level" in
      "error")
        [[ "$alert_level" = "error" ]]
        ;;
      "warning")
        [[ "$alert_level" =~ ^(error|warning)$ ]]
        ;;
      "info")
        [[ "$alert_level" =~ ^(error|warning|info|deployment)$ ]]
        ;;
      *)
        true # Send all by default
        ;;
    esac
  }
  
  # Send to enabled channels based on level filtering
  if should_send_alert "$console_level" "$level"; then
    send_console_alert "$level" "$title" "$message"
  fi
  
  if should_send_alert "$desktop_level" "$level"; then
    send_desktop_notification "$level" "$title" "$message"
  fi
  
  if should_send_alert "$browser_level" "$level"; then
    send_browser_notification "$level" "$title" "$message"
  fi
  
  if should_send_alert "$webhook_level" "$level"; then
    send_webhook_alert "$level" "$title" "$message"
  fi
  
  if should_send_alert "$slack_level" "$level"; then
    send_slack_alert "$level" "$title" "$message"
  fi
  
  # Log alert to file
  local log_file="$APP_DIR/alerts.log"
  echo "${timestamp} [$level] $title: $message" >> "$log_file"
}

# Pre-configured alert types
deployment_started() {
  send_alert "deployment" "Deployment Started" "$1"
}

deployment_success() {
  send_alert "success" "Deployment Successful" "$1"
}

deployment_failed() {
  send_alert "error" "Deployment Failed" "$1"
}

deployment_warning() {
  send_alert "warning" "Deployment Warning" "$1"
}

server_healthy() {
  send_alert "success" "Server Healthy" "$1"
}

server_unhealthy() {
  send_alert "error" "Server Unhealthy" "$1"
}

performance_warning() {
  send_alert "warning" "Performance Warning" "$1"
}

file_change_detected() {
  send_alert "info" "File Change Detected" "$1"
}

build_completed() {
  send_alert "success" "Build Completed" "$1"
}

# Configuration management
show_config() {
  echo "🔔 Alert Configuration"
  echo "====================="
  load_config
  jq '.' "$ALERT_CONFIG"
}

edit_config() {
  load_config
  
  if command -v nano >/dev/null 2>&1; then
    nano "$ALERT_CONFIG"
  elif command -v vi >/dev/null 2>&1; then
    vi "$ALERT_CONFIG"
  else
    echo "No text editor available. Edit $ALERT_CONFIG manually."
  fi
}

test_alerts() {
  echo "🧪 Testing Alert System"
  echo "======================="
  
  echo "Testing all alert levels..."
  
  sleep 1
  send_alert "info" "Test Info Alert" "This is a test information alert"
  
  sleep 1
  send_alert "success" "Test Success Alert" "This is a test success alert"
  
  sleep 1
  send_alert "warning" "Test Warning Alert" "This is a test warning alert"
  
  sleep 1
  send_alert "error" "Test Error Alert" "This is a test error alert"
  
  sleep 1
  send_alert "deployment" "Test Deployment Alert" "This is a test deployment alert"
  
  echo ""
  echo "Alert tests completed! Check all configured channels."
}

enable_channel() {
  local channel="$1"
  load_config
  
  # Update configuration to enable channel
  jq ".channels.${channel}.enabled = true" "$ALERT_CONFIG" > "${ALERT_CONFIG}.tmp" && mv "${ALERT_CONFIG}.tmp" "$ALERT_CONFIG"
  echo "✅ Enabled $channel alerts"
}

disable_channel() {
  local channel="$1"
  load_config
  
  # Update configuration to disable channel
  jq ".channels.${channel}.enabled = false" "$ALERT_CONFIG" > "${ALERT_CONFIG}.tmp" && mv "${ALERT_CONFIG}.tmp" "$ALERT_CONFIG"
  echo "❌ Disabled $channel alerts"
}

# Main command handling
case "${1:-help}" in
  "send")
    if [ $# -lt 4 ]; then
      echo "Usage: $0 send <level> <title> <message>"
      echo "Levels: info, success, warning, error, deployment"
      exit 1
    fi
    send_alert "$2" "$3" "$4"
    ;;
  "deployment-started")
    deployment_started "${2:-Deployment process initiated}"
    ;;
  "deployment-success")
    deployment_success "${2:-Deployment completed successfully}"
    ;;
  "deployment-failed")
    deployment_failed "${2:-Deployment process failed}"
    ;;
  "server-healthy")
    server_healthy "${2:-Server is responding normally}"
    ;;
  "server-unhealthy")
    server_unhealthy "${2:-Server is not responding}"
    ;;
  "config")
    show_config
    ;;
  "config-edit")
    edit_config
    ;;
  "test")
    test_alerts
    ;;
  "enable")
    if [ -z "${2:-}" ]; then
      echo "Usage: $0 enable <channel>"
      echo "Channels: console, desktop, browser, webhook, slack, email"
      exit 1
    fi
    enable_channel "$2"
    ;;
  "disable")
    if [ -z "${2:-}" ]; then
      echo "Usage: $0 disable <channel>"
      echo "Channels: console, desktop, browser, webhook, slack, email"
      exit 1
    fi
    disable_channel "$2"
    ;;
  *)
    echo "🚨 Deployment Alert System"
    echo "=========================="
    echo ""
    echo "Usage: $0 <command> [args...]"
    echo ""
    echo "Commands:"
    echo "  send <level> <title> <message>  Send custom alert"
    echo "  deployment-started [message]    Send deployment started alert"
    echo "  deployment-success [message]    Send deployment success alert"  
    echo "  deployment-failed [message]     Send deployment failure alert"
    echo "  server-healthy [message]        Send server healthy alert"
    echo "  server-unhealthy [message]      Send server unhealthy alert"
    echo ""
    echo "Configuration:"
    echo "  config                          Show current configuration"
    echo "  config-edit                     Edit configuration"
    echo "  test                           Test all alert channels"
    echo "  enable <channel>               Enable alert channel"
    echo "  disable <channel>              Disable alert channel"
    echo ""
    echo "Alert Levels: info, success, warning, error, deployment"
    echo "Channels: console, desktop, browser, webhook, slack"
    echo ""
    echo "Examples:"
    echo "  $0 send success 'Build Complete' 'Application built successfully'"
    echo "  $0 deployment-started 'New version deploying'"
    echo "  $0 enable desktop"
    echo "  $0 test"
    ;;
esac