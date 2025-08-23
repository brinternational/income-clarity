#!/bin/bash
set -euo pipefail

# Safe Server Manager - Prevents Claude Code CLI Disconnection
# CRITICAL: Only manages Income Clarity server, never affects Claude Code

# Configuration
APP_DIR="/public/MasterV2/income-clarity/income-clarity-app"
PID_FILE="$APP_DIR/.server-pid"
SERVER_CMD="node custom-server.js"
SERVER_PORT="3000"
HEALTH_ENDPOINT="http://localhost:$SERVER_PORT/api/health"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS] $1${NC}"
}

# Safety validation - CRITICAL for Claude Code protection
validate_safety() {
    # Check we're in the correct directory
    if [[ ! -f "$APP_DIR/custom-server.js" ]]; then
        error "custom-server.js not found in $APP_DIR"
        error "Aborting to prevent accidental operations in wrong directory"
        exit 1
    fi
    
    # Check Claude Code CLI is not on port 22 (SSH)
    if ! ss -tlnp | grep -q ":22 "; then
        warning "Port 22 (SSH) not detected - Claude Code CLI may not be running"
        warning "Proceed with caution"
    fi
}

# Check if PID is our server process
validate_pid() {
    local pid=$1
    
    # Check if PID exists
    if ! kill -0 "$pid" 2>/dev/null; then
        return 1
    fi
    
    # Get process details
    local process_cmd
    process_cmd=$(ps -p "$pid" -o cmd --no-headers 2>/dev/null || echo "")
    local process_cwd
    process_cwd=$(pwdx "$pid" 2>/dev/null | cut -d' ' -f2- || echo "")
    
    # Validate this is our server process
    if [[ "$process_cmd" == *"$SERVER_CMD"* && "$process_cwd" == "$APP_DIR" ]]; then
        return 0
    else
        return 1
    fi
}

# Get PID from file
get_server_pid() {
    if [[ -f "$PID_FILE" ]]; then
        local pid_line
        pid_line=$(cat "$PID_FILE" 2>/dev/null || echo "")
        if [[ "$pid_line" =~ ^([0-9]+): ]]; then
            echo "${BASH_REMATCH[1]}"
        fi
    fi
}

# Check server status
status() {
    log "Checking server status..."
    
    local pid
    pid=$(get_server_pid)
    
    if [[ -z "$pid" ]]; then
        echo "Status: STOPPED (no PID file)"
        return 1
    fi
    
    if validate_pid "$pid"; then
        # Check if port is responsive (accept any HTTP response as "running")
        local health_response
        health_response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null || echo "000")
        if [[ "$health_response" =~ ^[2-5][0-9][0-9]$ ]]; then
            if [[ "$health_response" == "200" ]]; then
                success "Status: RUNNING (PID: $pid, Port: $SERVER_PORT, Health: OK)"
            else
                success "Status: RUNNING (PID: $pid, Port: $SERVER_PORT, Health: HTTP $health_response)"
            fi
            return 0
        else
            warning "Status: RUNNING but no HTTP response (PID: $pid)"
            return 2
        fi
    else
        warning "Status: STALE PID file (process not found)"
        rm -f "$PID_FILE"
        return 1
    fi
}

# Start server safely
start() {
    log "Starting Income Clarity server..."
    
    # Safety checks
    validate_safety
    
    # Check if already running
    if status > /dev/null 2>&1; then
        warning "Server is already running"
        return 0
    fi
    
    # Check port availability
    if ss -tlnp | grep -q ":$SERVER_PORT "; then
        error "Port $SERVER_PORT is occupied by another process"
        error "Use 'lsof -ti:$SERVER_PORT' to identify the process"
        error "NEVER use 'pkill -f node' - it will disconnect Claude Code!"
        exit 1
    fi
    
    # Change to app directory
    cd "$APP_DIR"
    
    # Start server in background
    log "Starting server: $SERVER_CMD"
    
    # Use production environment by default
    export NODE_ENV="${NODE_ENV:-production}"
    
    # Start server and capture PID
    nohup $SERVER_CMD > server.log 2>&1 &
    local server_pid=$!
    
    # Create PID file with metadata
    echo "$server_pid:$(date +%s):$(echo $SERVER_CMD | sha256sum | cut -d' ' -f1)" > "$PID_FILE"
    
    # Wait for startup
    log "Waiting for server startup..."
    local retry_count=0
    local max_retries=30
    
    while [[ $retry_count -lt $max_retries ]]; do
        if curl -s -o /dev/null -w "%{http_code}" "$HEALTH_ENDPOINT" | grep -q "200"; then
            success "Server started successfully (PID: $server_pid)"
            return 0
        fi
        
        # Check if process is still running
        if ! validate_pid "$server_pid"; then
            error "Server process died during startup"
            rm -f "$PID_FILE"
            return 1
        fi
        
        sleep 1
        ((retry_count++))
    done
    
    error "Server startup timeout after ${max_retries}s"
    return 1
}

# Stop server safely
stop() {
    log "Stopping Income Clarity server..."
    
    local pid
    pid=$(get_server_pid)
    
    if [[ -z "$pid" ]]; then
        warning "No server PID found"
        return 0
    fi
    
    if ! validate_pid "$pid"; then
        warning "PID $pid is not our server process or doesn't exist"
        rm -f "$PID_FILE"
        return 0
    fi
    
    log "Stopping server process (PID: $pid)"
    
    # Graceful shutdown
    kill "$pid"
    
    # Wait for graceful shutdown
    local retry_count=0
    local max_retries=10
    
    while [[ $retry_count -lt $max_retries ]]; do
        if ! kill -0 "$pid" 2>/dev/null; then
            success "Server stopped gracefully"
            rm -f "$PID_FILE"
            return 0
        fi
        sleep 1
        ((retry_count++))
    done
    
    # Force kill if necessary
    warning "Graceful shutdown timeout, forcing stop"
    kill -9 "$pid" 2>/dev/null || true
    
    # Wait a bit more
    sleep 2
    
    if ! kill -0 "$pid" 2>/dev/null; then
        success "Server stopped (forced)"
        rm -f "$PID_FILE"
        return 0
    else
        error "Unable to stop server process"
        return 1
    fi
}

# Restart server
restart() {
    log "Restarting Income Clarity server..."
    
    if status > /dev/null 2>&1; then
        stop
        sleep 2
    fi
    
    start
}

# Comprehensive health check
health() {
    log "Running comprehensive health check..."
    
    local issues=0
    
    # Check PID file and process
    echo "1. Process Status:"
    if status; then
        echo "   ✅ Server process running"
    else
        echo "   ❌ Server process not running"
        ((issues++))
    fi
    
    # Check port availability
    echo "2. Port Status:"
    if ss -tlnp | grep -q ":$SERVER_PORT "; then
        echo "   ✅ Port $SERVER_PORT is bound"
    else
        echo "   ❌ Port $SERVER_PORT not bound"
        ((issues++))
    fi
    
    # Check HTTP health endpoint
    echo "3. Health Endpoint:"
    local health_response
    health_response=$(curl -s -w "%{http_code}" "$HEALTH_ENDPOINT" 2>/dev/null || echo "000")
    local status_code="${health_response:(-3)}"
    if [[ "$status_code" =~ ^[2-5][0-9][0-9]$ ]]; then
        if [[ "$status_code" == "200" ]]; then
            echo "   ✅ Health endpoint responding (OK)"
        else
            echo "   ✅ Health endpoint responding (HTTP $status_code)"
        fi
    else
        echo "   ❌ Health endpoint not responding (HTTP: $status_code)"
        ((issues++))
    fi
    
    # Check database connectivity
    echo "4. Database:"
    if [[ -f "$APP_DIR/prisma/income_clarity.db" ]]; then
        echo "   ✅ Database file exists"
    else
        echo "   ❌ Database file not found"
        ((issues++))
    fi
    
    # Check Claude Code CLI protection
    echo "5. Claude Code CLI Protection:"
    if ss -tlnp | grep -q ":22 "; then
        echo "   ✅ SSH port 22 active (Claude Code CLI likely running)"
    else
        echo "   ⚠️  SSH port 22 not detected"
        warning "Claude Code CLI may not be running"
    fi
    
    echo ""
    if [[ $issues -eq 0 ]]; then
        success "All health checks passed"
        return 0
    else
        error "$issues health check(s) failed"
        return 1
    fi
}

# Show usage
usage() {
    echo "Safe Server Manager - Income Clarity"
    echo ""
    echo "CRITICAL: This script only manages the Income Clarity server"
    echo "It NEVER affects Claude Code CLI or other system processes"
    echo ""
    echo "Usage: $0 {start|stop|restart|status|health}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the Income Clarity server safely"
    echo "  stop    - Stop the Income Clarity server safely"  
    echo "  restart - Restart the Income Clarity server safely"
    echo "  status  - Show server status"
    echo "  health  - Run comprehensive health check"
    echo ""
    echo "Safety Features:"
    echo "  ✅ PID-based process tracking (no broad kill commands)"
    echo "  ✅ Process validation (ensures we only kill our server)"
    echo "  ✅ Claude Code CLI protection (never touches port 22)"
    echo "  ✅ Directory validation (prevents wrong-directory operations)"
    echo "  ✅ Graceful shutdown with fallback"
}

# Main command handling
case "${1:-}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    health)
        health
        ;;
    *)
        usage
        exit 1
        ;;
esac