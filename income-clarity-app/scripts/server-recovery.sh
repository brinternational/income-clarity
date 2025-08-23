#!/bin/bash
set -euo pipefail

# Server Recovery Script - Handle Claude Code CLI Disconnection Recovery
# This script helps recover from accidental disconnections

# Configuration
APP_DIR="/public/MasterV2/income-clarity/income-clarity-app"
PID_FILE="$APP_DIR/.server-pid"
SERVER_PORT="3000"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[RECOVERY] $1${NC}"
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

info() {
    echo -e "${CYAN}[INFO] $1${NC}"
}

# Check if Claude Code CLI is connected
check_claude_code_connection() {
    log "Checking Claude Code CLI connection status..."
    
    # Check SSH port
    if ss -tlnp | grep -q ":22 "; then
        success "SSH port 22 is active"
        
        # Check for active SSH connections
        local ssh_connections
        ssh_connections=$(ss -tnp | grep -c ":22 " || echo "0")
        
        if [[ $ssh_connections -gt 0 ]]; then
            success "Active SSH connections: $ssh_connections"
            success "Claude Code CLI appears to be connected"
            return 0
        else
            warning "No active SSH connections detected"
            warning "Claude Code CLI may not be connected"
            return 1
        fi
    else
        error "SSH port 22 is not active"
        error "Claude Code CLI is likely disconnected"
        return 1
    fi
}

# Diagnose system state
diagnose_system() {
    log "Running system diagnostics..."
    echo ""
    
    info "=== SYSTEM STATE DIAGNOSIS ==="
    
    # Check SSH service
    echo "1. SSH Service Status:"
    if systemctl is-active ssh >/dev/null 2>&1; then
        success "   SSH service is running"
    else
        error "   SSH service is not running"
        info "   Try: sudo systemctl start ssh"
    fi
    
    # Check network listeners
    echo "2. Network Listeners:"
    info "   Port 22 (SSH): $(ss -tlnp | grep :22 || echo 'NOT LISTENING')"
    info "   Port 3000 (App): $(ss -tlnp | grep :3000 || echo 'NOT LISTENING')"
    info "   Port 8080 (Other): $(ss -tlnp | grep :8080 || echo 'NOT LISTENING')"
    
    # Check Income Clarity server
    echo "3. Income Clarity Server:"
    if [[ -f "$PID_FILE" ]]; then
        local pid
        pid=$(cat "$PID_FILE" | cut -d: -f1 2>/dev/null || echo "")
        if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
            success "   Server process running (PID: $pid)"
        else
            warning "   Server PID file exists but process not found"
        fi
    else
        info "   No server PID file found"
    fi
    
    # Check for dangerous processes
    echo "4. Dangerous Processes Check:"
    if pgrep -f "pkill.*node" >/dev/null 2>&1; then
        error "   DANGEROUS: pkill node process detected!"
    elif pgrep -f "killall.*node" >/dev/null 2>&1; then
        error "   DANGEROUS: killall node process detected!"
    else
        success "   No dangerous processes detected"
    fi
    
    # Check system resources
    echo "5. System Resources:"
    local mem_usage
    mem_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2 }')
    info "   Memory usage: ${mem_usage}%"
    
    local disk_usage
    disk_usage=$(df "$APP_DIR" | tail -1 | awk '{print $5}')
    info "   Disk usage: $disk_usage"
    
    echo ""
}

# Attempt to recover Claude Code CLI connection
recover_claude_code() {
    log "Attempting to recover Claude Code CLI connection..."
    
    # Check if SSH is running
    if ! systemctl is-active ssh >/dev/null 2>&1; then
        warning "SSH service is not running"
        echo "Restart SSH service? (requires sudo) [y/N]: "
        read -r response
        if [[ "$response" =~ ^[Yy] ]]; then
            log "Restarting SSH service..."
            if sudo systemctl restart ssh; then
                success "SSH service restarted"
                sleep 2
            else
                error "Failed to restart SSH service"
                return 1
            fi
        else
            warning "SSH service restart declined"
        fi
    fi
    
    # Wait for potential reconnection
    log "Waiting for Claude Code CLI reconnection..."
    local retry_count=0
    local max_retries=30
    
    while [[ $retry_count -lt $max_retries ]]; do
        if check_claude_code_connection >/dev/null 2>&1; then
            success "Claude Code CLI connection recovered!"
            return 0
        fi
        
        echo -n "."
        sleep 1
        ((retry_count++))
    done
    
    echo ""
    error "Claude Code CLI connection not recovered after ${max_retries}s"
    return 1
}

# Clean up stale processes safely
cleanup_stale_processes() {
    log "Cleaning up stale processes safely..."
    
    # Check for stale PID file
    if [[ -f "$PID_FILE" ]]; then
        local pid
        pid=$(cat "$PID_FILE" | cut -d: -f1 2>/dev/null || echo "")
        
        if [[ -n "$pid" ]]; then
            if ! kill -0 "$pid" 2>/dev/null; then
                warning "Removing stale PID file (process $pid not found)"
                rm -f "$PID_FILE"
            else
                # Process exists - validate it's our server
                local process_cmd
                process_cmd=$(ps -p "$pid" -o cmd --no-headers 2>/dev/null || echo "")
                
                if [[ "$process_cmd" == *"custom-server.js"* ]]; then
                    info "Valid server process found (PID: $pid)"
                else
                    warning "PID $pid is not our server process: $process_cmd"
                    warning "Removing incorrect PID file"
                    rm -f "$PID_FILE"
                fi
            fi
        fi
    fi
    
    # Check for orphaned Income Clarity processes
    local orphaned_pids
    orphaned_pids=$(pgrep -f "custom-server.js" || echo "")
    
    if [[ -n "$orphaned_pids" ]]; then
        warning "Found potentially orphaned Income Clarity processes:"
        echo "$orphaned_pids" | while read -r pid; do
            if [[ -n "$pid" ]]; then
                local process_info
                process_info=$(ps -p "$pid" -o pid,ppid,cmd --no-headers 2>/dev/null || echo "")
                warning "  PID $pid: $process_info"
            fi
        done
        
        echo "Clean up these processes? [y/N]: "
        read -r response
        if [[ "$response" =~ ^[Yy] ]]; then
            echo "$orphaned_pids" | while read -r pid; do
                if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
                    log "Stopping orphaned process $pid"
                    kill "$pid" 2>/dev/null || true
                fi
            done
            success "Orphaned processes cleaned up"
        fi
    else
        info "No orphaned Income Clarity processes found"
    fi
}

# Restore server to healthy state
restore_server() {
    log "Restoring Income Clarity server to healthy state..."
    
    # Use safe server manager for restoration
    if [[ -x "$APP_DIR/scripts/safe-server-manager.sh" ]]; then
        log "Using safe server manager for restoration"
        
        # Stop any existing server safely
        "$APP_DIR/scripts/safe-server-manager.sh" stop 2>/dev/null || true
        sleep 2
        
        # Start server fresh
        if "$APP_DIR/scripts/safe-server-manager.sh" start; then
            success "Server restored successfully"
            return 0
        else
            error "Failed to restore server"
            return 1
        fi
    else
        error "Safe server manager script not found"
        error "Cannot safely restore server"
        return 1
    fi
}

# Full recovery procedure
full_recovery() {
    log "Starting full recovery procedure..."
    echo ""
    
    info "=== RECOVERY PROCEDURE ==="
    
    # Step 1: Diagnose
    diagnose_system
    
    # Step 2: Clean up
    cleanup_stale_processes
    echo ""
    
    # Step 3: Recover Claude Code CLI
    if ! check_claude_code_connection >/dev/null 2>&1; then
        warning "Claude Code CLI connection not detected"
        if ! recover_claude_code; then
            warning "Could not automatically recover Claude Code CLI connection"
            warning "You may need to reconnect manually"
        fi
    else
        success "Claude Code CLI connection is healthy"
    fi
    echo ""
    
    # Step 4: Restore server
    restore_server
    echo ""
    
    # Step 5: Final validation
    log "Running final validation..."
    if "$APP_DIR/scripts/safe-server-manager.sh" health >/dev/null 2>&1; then
        success "✅ RECOVERY COMPLETE - System is healthy"
        return 0
    else
        warning "⚠️  Recovery completed but some issues remain"
        info "Run './scripts/safe-server-manager.sh health' for details"
        return 1
    fi
}

# Show recovery status
status() {
    log "Recovery system status..."
    echo ""
    
    info "=== RECOVERY STATUS ==="
    
    # Check Claude Code CLI
    if check_claude_code_connection >/dev/null 2>&1; then
        success "Claude Code CLI: ✅ Connected"
    else
        error "Claude Code CLI: ❌ Disconnected"
    fi
    
    # Check Income Clarity server
    if "$APP_DIR/scripts/safe-server-manager.sh" status >/dev/null 2>&1; then
        success "Income Clarity Server: ✅ Running"
    else
        warning "Income Clarity Server: ⚠️  Not running"
    fi
    
    # Check safe management tools
    if [[ -x "$APP_DIR/scripts/safe-server-manager.sh" ]]; then
        success "Safe Management Tools: ✅ Available"
    else
        error "Safe Management Tools: ❌ Not available"
    fi
    
    echo ""
}

# Show usage
usage() {
    echo "Server Recovery Script - Claude Code CLI Protection"
    echo ""
    echo "Usage: $0 {diagnose|recover|cleanup|restore|full|status}"
    echo ""
    echo "Commands:"
    echo "  diagnose  - Run system diagnostics"
    echo "  recover   - Attempt Claude Code CLI recovery"
    echo "  cleanup   - Clean up stale processes safely"
    echo "  restore   - Restore Income Clarity server"
    echo "  full      - Run full recovery procedure (recommended)"
    echo "  status    - Show recovery system status"
    echo ""
    echo "Recovery Features:"
    echo "  ✅ Claude Code CLI connection restoration"
    echo "  ✅ Safe process cleanup (no broad kills)"
    echo "  ✅ Income Clarity server restoration"
    echo "  ✅ System state validation"
    echo ""
    echo "Use 'full' for complete automated recovery"
}

# Main command handling
case "${1:-full}" in
    diagnose)
        diagnose_system
        ;;
    recover)
        recover_claude_code
        ;;
    cleanup)
        cleanup_stale_processes
        ;;
    restore)
        restore_server
        ;;
    full)
        full_recovery
        ;;
    status)
        status
        ;;
    *)
        usage
        exit 1
        ;;
esac