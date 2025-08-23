#!/bin/bash

# 🚨 Real-time Deployment Monitor and Alert System
# Provides immediate feedback on deployment status and file changes

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"
MONITOR_LOG="$APP_DIR/monitor.log"
PID_FILE="$APP_DIR/.deployment-monitor.pid"
STATUS_FILE="$APP_DIR/.deployment-status.json"

# Colors and formatting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Alert sound
ALERT_SOUND() {
  if command -v tput >/dev/null 2>&1; then
    tput bel
  fi
}

# Notification system
notify() {
  local type="$1"
  local message="$2"
  local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  
  case "$type" in
    "SUCCESS")
      echo -e "${timestamp} ${GREEN}✅ SUCCESS${NC} $message" | tee -a "$MONITOR_LOG"
      ALERT_SOUND
      ;;
    "WARNING")
      echo -e "${timestamp} ${YELLOW}⚠️  WARNING${NC} $message" | tee -a "$MONITOR_LOG"
      ;;
    "ERROR")
      echo -e "${timestamp} ${RED}❌ ERROR${NC} $message" | tee -a "$MONITOR_LOG"
      ALERT_SOUND
      ;;
    "INFO")
      echo -e "${timestamp} ${BLUE}ℹ️  INFO${NC} $message" | tee -a "$MONITOR_LOG"
      ;;
    "DEPLOYMENT")
      echo -e "${timestamp} ${PURPLE}🚀 DEPLOY${NC} $message" | tee -a "$MONITOR_LOG"
      ALERT_SOUND
      ;;
    "CHANGE")
      echo -e "${timestamp} ${CYAN}📝 CHANGE${NC} $message" | tee -a "$MONITOR_LOG"
      ;;
  esac
}

# Update status file for API consumption
update_status() {
  local event_type="$1"
  local message="$2"
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%S.%3NZ")
  
  cat > "$STATUS_FILE" << EOF
{
  "timestamp": "$timestamp",
  "event_type": "$event_type",
  "message": "$message",
  "uptime": $(( $(date +%s) - $START_TIME )),
  "monitor_pid": $$,
  "server_status": "$(check_server_status)",
  "last_deployment": "$(get_last_deployment_info)"
}
EOF
}

# Check if server is running
check_server_status() {
  if curl -s --max-time 3 http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "healthy"
  else
    echo "unhealthy"
  fi
}

# Get last deployment info
get_last_deployment_info() {
  if [ -f "$APP_DIR/DEPLOYMENT-MANIFEST.json" ]; then
    jq -r '.timestamp // "unknown"' "$APP_DIR/DEPLOYMENT-MANIFEST.json" 2>/dev/null || echo "unknown"
  else
    echo "no_manifest"
  fi
}

# File change monitoring
monitor_file_changes() {
  local watch_paths=(
    "$APP_DIR/app"
    "$APP_DIR/components"
    "$APP_DIR/lib"
    "$APP_DIR/styles"
    "$APP_DIR/public"
    "$APP_DIR/.env"
    "$APP_DIR/package.json"
  )
  
  notify "INFO" "Starting file change monitoring for ${#watch_paths[@]} directories"
  
  if command -v inotifywait >/dev/null 2>&1; then
    # Use inotifywait if available (Linux)
    inotifywait -m -r -e modify,create,delete,move "${watch_paths[@]}" --format '%w%f %e' 2>/dev/null | while read file event; do
      if [[ ! "$file" =~ \.(log|tmp|swp|pid)$ ]]; then
        notify "CHANGE" "File changed: $file ($event)"
        update_status "file_change" "File changed: $file ($event)"
        
        # Trigger deployment verification if significant change
        if [[ "$file" =~ \.(tsx?|jsx?|css|json)$ ]]; then
          notify "INFO" "Triggering deployment verification for significant change"
          trigger_deployment_verification &
        fi
      fi
    done
  else
    # Fallback to polling method
    notify "WARNING" "inotifywait not available, using polling method"
    while true; do
      sleep 10
      # Check for recent changes (last 15 seconds)
      if find "${watch_paths[@]}" -type f -newermt '15 seconds ago' 2>/dev/null | grep -E '\.(tsx?|jsx?|css|json)$' >/dev/null; then
        notify "CHANGE" "Files modified in last 15 seconds"
        update_status "file_change" "Files modified in last 15 seconds"
      fi
    done
  fi
}

# Git change monitoring
monitor_git_changes() {
  local last_commit=""
  
  while true; do
    if [ -d "$APP_DIR/.git" ]; then
      local current_commit=$(git -C "$APP_DIR" rev-parse HEAD 2>/dev/null || echo "")
      
      if [ -n "$current_commit" ] && [ "$current_commit" != "$last_commit" ] && [ -n "$last_commit" ]; then
        local commit_msg=$(git -C "$APP_DIR" log -1 --pretty=format:"%s" 2>/dev/null || echo "Unknown commit")
        notify "DEPLOYMENT" "New commit detected: $commit_msg"
        update_status "git_commit" "New commit: $commit_msg"
        
        # Trigger full deployment verification
        trigger_deployment_verification &
      fi
      
      last_commit="$current_commit"
    fi
    
    sleep 30
  done
}

# Server health monitoring
monitor_server_health() {
  local last_status=""
  
  while true; do
    local current_status=$(check_server_status)
    
    if [ "$current_status" != "$last_status" ] && [ -n "$last_status" ]; then
      if [ "$current_status" = "healthy" ]; then
        notify "SUCCESS" "Server is now healthy"
        update_status "server_healthy" "Server is now healthy"
      else
        notify "ERROR" "Server is now unhealthy"
        update_status "server_unhealthy" "Server is now unhealthy"
      fi
    fi
    
    last_status="$current_status"
    sleep 15
  done
}

# Build change monitoring
monitor_build_changes() {
  local last_build_id=""
  
  while true; do
    if [ -f "$APP_DIR/.next/BUILD_ID" ]; then
      local current_build_id=$(cat "$APP_DIR/.next/BUILD_ID" 2>/dev/null || echo "")
      
      if [ -n "$current_build_id" ] && [ "$current_build_id" != "$last_build_id" ] && [ -n "$last_build_id" ]; then
        notify "DEPLOYMENT" "New build detected: $current_build_id"
        update_status "build_change" "New build: $current_build_id"
        
        # Trigger deployment verification and cache busting
        trigger_post_build_actions &
      fi
      
      last_build_id="$current_build_id"
    fi
    
    sleep 20
  done
}

# Trigger deployment verification
trigger_deployment_verification() {
  notify "INFO" "Running deployment verification..."
  
  if [ -f "$SCRIPT_DIR/deployment-verifier.sh" ]; then
    if "$SCRIPT_DIR/deployment-verifier.sh" smoke-test >/dev/null 2>&1; then
      notify "SUCCESS" "Deployment verification passed"
      update_status "verification_success" "Deployment verification passed"
    else
      notify "ERROR" "Deployment verification failed"
      update_status "verification_failed" "Deployment verification failed"
    fi
  else
    notify "WARNING" "Deployment verifier not found, skipping verification"
  fi
}

# Trigger post-build actions
trigger_post_build_actions() {
  notify "INFO" "Running post-build actions..."
  
  # Cache busting
  if [ -f "$SCRIPT_DIR/cache-buster.sh" ]; then
    notify "INFO" "Clearing caches..."
    "$SCRIPT_DIR/cache-buster.sh" localhost >/dev/null 2>&1 || true
  fi
  
  # Quick health check
  sleep 5
  if check_server_status | grep -q "healthy"; then
    notify "SUCCESS" "Post-build health check passed"
  else
    notify "WARNING" "Post-build health check failed"
  fi
}

# Performance monitoring
monitor_performance() {
  while true; do
    local response_time=$(curl -w "%{time_total}" -s --max-time 10 http://localhost:3000/api/health -o /dev/null 2>/dev/null || echo "999")
    
    if (( $(echo "$response_time > 3.0" | bc -l 2>/dev/null || echo "0") )); then
      notify "WARNING" "Slow response time: ${response_time}s"
      update_status "slow_response" "Response time: ${response_time}s"
    fi
    
    sleep 60
  done
}

# Start monitoring
start_monitor() {
  if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo "Monitor already running (PID: $(cat $PID_FILE))"
    exit 1
  fi
  
  # Clear previous log
  > "$MONITOR_LOG"
  
  # Record start time
  START_TIME=$(date +%s)
  echo $$ > "$PID_FILE"
  
  notify "SUCCESS" "🚀 Real-time Deployment Monitor Started"
  notify "INFO" "Monitoring: File changes, Git commits, Build changes, Server health, Performance"
  notify "INFO" "Log file: $MONITOR_LOG"
  notify "INFO" "Status file: $STATUS_FILE"
  
  # Initialize status
  update_status "monitor_started" "Real-time deployment monitor started"
  
  # Start monitoring processes in background
  monitor_file_changes &
  monitor_git_changes &
  monitor_server_health &
  monitor_build_changes &
  monitor_performance &
  
  # Keep main process alive
  while true; do
    if ! kill -0 $$ 2>/dev/null; then
      break
    fi
    sleep 30
  done
}

# Stop monitoring
stop_monitor() {
  if [ -f "$PID_FILE" ]; then
    local pid=$(cat "$PID_FILE")
    if kill -0 "$pid" 2>/dev/null; then
      # Kill process group to stop all background processes
      kill -TERM -$pid 2>/dev/null || true
      sleep 2
      kill -KILL -$pid 2>/dev/null || true
      
      notify "INFO" "Deployment monitor stopped"
      rm -f "$PID_FILE"
    else
      echo "Monitor not running"
      rm -f "$PID_FILE"
    fi
  else
    echo "Monitor not running (no PID file)"
  fi
}

# Show status
show_status() {
  if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo -e "${GREEN}✅ Monitor Status: RUNNING${NC}"
    echo "PID: $(cat $PID_FILE)"
    
    if [ -f "$STATUS_FILE" ]; then
      echo ""
      echo "Latest Status:"
      jq '.' "$STATUS_FILE" 2>/dev/null || cat "$STATUS_FILE"
    fi
    
    echo ""
    echo "Recent Activity (last 10 entries):"
    tail -10 "$MONITOR_LOG" 2>/dev/null || echo "No activity yet"
  else
    echo -e "${RED}❌ Monitor Status: NOT RUNNING${NC}"
  fi
}

# Show real-time logs
show_logs() {
  echo "Real-time monitoring logs (Ctrl+C to exit):"
  echo "=================================================="
  
  if [ -f "$MONITOR_LOG" ]; then
    tail -f "$MONITOR_LOG"
  else
    echo "No log file found. Is the monitor running?"
  fi
}

# Health check
health_check() {
  echo "🔍 Deployment Monitor Health Check"
  echo "=================================="
  
  # Check if running
  if [ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null; then
    echo -e "${GREEN}✅ Monitor Process: RUNNING${NC}"
  else
    echo -e "${RED}❌ Monitor Process: NOT RUNNING${NC}"
  fi
  
  # Check server status
  local server_status=$(check_server_status)
  if [ "$server_status" = "healthy" ]; then
    echo -e "${GREEN}✅ Server Status: HEALTHY${NC}"
  else
    echo -e "${RED}❌ Server Status: UNHEALTHY${NC}"
  fi
  
  # Check status file
  if [ -f "$STATUS_FILE" ]; then
    echo -e "${GREEN}✅ Status File: EXISTS${NC}"
    local last_update=$(jq -r '.timestamp // "unknown"' "$STATUS_FILE" 2>/dev/null || echo "unknown")
    echo "   Last Update: $last_update"
  else
    echo -e "${YELLOW}⚠️  Status File: MISSING${NC}"
  fi
  
  # Check log file
  if [ -f "$MONITOR_LOG" ]; then
    local log_size=$(wc -l < "$MONITOR_LOG" 2>/dev/null || echo "0")
    echo -e "${GREEN}✅ Log File: EXISTS${NC} ($log_size lines)"
  else
    echo -e "${YELLOW}⚠️  Log File: MISSING${NC}"
  fi
  
  # Check dependencies
  echo ""
  echo "Dependencies:"
  command -v inotifywait >/dev/null && echo -e "${GREEN}✅ inotifywait: AVAILABLE${NC}" || echo -e "${YELLOW}⚠️  inotifywait: NOT AVAILABLE (using polling)${NC}"
  command -v jq >/dev/null && echo -e "${GREEN}✅ jq: AVAILABLE${NC}" || echo -e "${RED}❌ jq: NOT AVAILABLE${NC}"
  command -v curl >/dev/null && echo -e "${GREEN}✅ curl: AVAILABLE${NC}" || echo -e "${RED}❌ curl: NOT AVAILABLE${NC}"
  command -v bc >/dev/null && echo -e "${GREEN}✅ bc: AVAILABLE${NC}" || echo -e "${YELLOW}⚠️  bc: NOT AVAILABLE${NC}"
}

# Main command handling
case "${1:-}" in
  "start")
    start_monitor
    ;;
  "stop")
    stop_monitor
    ;;
  "restart")
    stop_monitor
    sleep 2
    start_monitor
    ;;
  "status")
    show_status
    ;;
  "logs")
    show_logs
    ;;
  "health")
    health_check
    ;;
  *)
    echo "🚨 Real-time Deployment Monitor and Alert System"
    echo "================================================="
    echo ""
    echo "Usage: $0 {start|stop|restart|status|logs|health}"
    echo ""
    echo "Commands:"
    echo "  start     Start real-time monitoring"
    echo "  stop      Stop monitoring"
    echo "  restart   Restart monitoring"
    echo "  status    Show monitor status"
    echo "  logs      Show real-time logs"
    echo "  health    Run health check"
    echo ""
    echo "Monitoring Features:"
    echo "  📝 File changes (components, app, lib, styles)"
    echo "  🔄 Git commits and branch changes"
    echo "  🏗️  Build changes and deployment detection"
    echo "  ❤️  Server health and performance monitoring"
    echo "  🚨 Real-time alerts with sound notifications"
    echo "  📊 JSON status API for dashboard integration"
    echo ""
    echo "Status: $([ -f "$PID_FILE" ] && kill -0 $(cat "$PID_FILE") 2>/dev/null && echo "RUNNING" || echo "NOT RUNNING")"
    echo ""
    exit 1
    ;;
esac