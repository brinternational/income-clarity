#!/bin/bash
set -euo pipefail

# Server Health Check - Pre-operation Safety Validation
# Ensures safe operations that won't disconnect Claude Code CLI

# Configuration
APP_DIR="/public/MasterV2/income-clarity/income-clarity-app"
SERVER_PORT="3000"
HEALTH_ENDPOINT="http://localhost:$SERVER_PORT/api/health"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[HEALTH CHECK] $1${NC}"
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

# Check Claude Code CLI is safe
check_claude_code_safety() {
    log "Checking Claude Code CLI safety..."
    
    # Check SSH port 22 is active
    if ss -tlnp | grep -q ":22 "; then
        success "SSH port 22 active - Claude Code CLI connection safe"
        return 0
    else
        warning "SSH port 22 not detected"
        warning "Claude Code CLI may not be running"
        echo "Continue anyway? (y/N): "
        read -r response
        if [[ "$response" =~ ^[Yy] ]]; then
            warning "Proceeding without Claude Code CLI safety guarantee"
            return 0
        else
            error "Operation cancelled for safety"
            return 1
        fi
    fi
}

# Check critical ports are not at risk
check_critical_ports() {
    log "Checking critical ports..."
    
    local critical_ports=("22" "8080")
    local safe=true
    
    for port in "${critical_ports[@]}"; do
        if ss -tlnp | grep -q ":$port "; then
            success "Critical port $port is active and protected"
        else
            if [[ "$port" == "22" ]]; then
                warning "Critical port $port (SSH) not active"
                safe=false
            else
                log "Port $port not in use (okay)"
            fi
        fi
    done
    
    if [[ "$safe" == "false" ]]; then
        warning "Some critical ports may be at risk"
        return 1
    fi
    
    return 0
}

# Check if dangerous processes are running
check_dangerous_processes() {
    log "Checking for dangerous processes that might interfere..."
    
    # Look for broad kill processes
    if pgrep -f "pkill.*node" > /dev/null 2>&1; then
        error "Dangerous 'pkill node' process detected!"
        error "This could disconnect Claude Code CLI"
        return 1
    fi
    
    if pgrep -f "killall.*node" > /dev/null 2>&1; then
        error "Dangerous 'killall node' process detected!"
        error "This could disconnect Claude Code CLI"
        return 1
    fi
    
    success "No dangerous processes detected"
    return 0
}

# Check working directory safety
check_directory_safety() {
    log "Checking directory safety..."
    
    # Ensure we're in the correct directory
    if [[ ! -f "$APP_DIR/custom-server.js" ]]; then
        error "custom-server.js not found in $APP_DIR"
        error "Cannot safely operate without Income Clarity server file"
        return 1
    fi
    
    if [[ ! -f "$APP_DIR/package.json" ]]; then
        error "package.json not found in $APP_DIR"
        error "Not a valid Node.js project directory"
        return 1
    fi
    
    # Check if we're in a Git repository (additional safety)
    if [[ -d "$APP_DIR/.git" ]]; then
        success "Operating in Git repository (safe)"
    else
        warning "Not in a Git repository - proceed with caution"
    fi
    
    success "Directory safety validated"
    return 0
}

# Check system resources
check_system_resources() {
    log "Checking system resources..."
    
    # Check available memory
    local mem_available
    mem_available=$(grep MemAvailable /proc/meminfo | awk '{print $2}')
    local mem_available_gb=$((mem_available / 1024 / 1024))
    
    if [[ $mem_available_gb -lt 1 ]]; then
        warning "Low memory available: ${mem_available_gb}GB"
        warning "Server startup may fail"
    else
        success "Memory available: ${mem_available_gb}GB"
    fi
    
    # Check disk space
    local disk_usage
    disk_usage=$(df "$APP_DIR" | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [[ $disk_usage -gt 90 ]]; then
        warning "High disk usage: ${disk_usage}%"
        warning "Server may fail to start or log properly"
    else
        success "Disk usage: ${disk_usage}%"
    fi
    
    return 0
}

# Check port availability for new server
check_port_availability() {
    log "Checking port $SERVER_PORT availability..."
    
    if ss -tlnp | grep -q ":$SERVER_PORT "; then
        # Port is occupied - check if it's our server
        local port_process
        port_process=$(ss -tlnp | grep ":$SERVER_PORT " | head -1)
        
        if [[ "$port_process" == *"node"* ]]; then
            warning "Port $SERVER_PORT occupied by Node.js process"
            warning "This might be our Income Clarity server"
            warning "Use 'safe-server-manager.sh status' to check"
        else
            error "Port $SERVER_PORT occupied by non-Node.js process"
            error "Process: $port_process"
            error "Cannot start server on occupied port"
            return 1
        fi
    else
        success "Port $SERVER_PORT is available"
    fi
    
    return 0
}

# Comprehensive pre-operation check
comprehensive_check() {
    log "Running comprehensive pre-operation safety check..."
    echo ""
    
    local checks_passed=0
    local total_checks=6
    
    # Run all checks
    if check_claude_code_safety; then ((checks_passed++)); fi
    echo ""
    
    if check_critical_ports; then ((checks_passed++)); fi
    echo ""
    
    if check_dangerous_processes; then ((checks_passed++)); fi
    echo ""
    
    if check_directory_safety; then ((checks_passed++)); fi
    echo ""
    
    if check_system_resources; then ((checks_passed++)); fi
    echo ""
    
    if check_port_availability; then ((checks_passed++)); fi
    echo ""
    
    # Summary
    echo "=========================================="
    echo "HEALTH CHECK SUMMARY"
    echo "=========================================="
    echo "Checks passed: $checks_passed/$total_checks"
    
    if [[ $checks_passed -eq $total_checks ]]; then
        success "✅ ALL SAFETY CHECKS PASSED"
        success "Safe to proceed with server operations"
        return 0
    else
        local failed=$((total_checks - checks_passed))
        error "❌ $failed SAFETY CHECK(S) FAILED"
        error "Review issues before proceeding"
        return 1
    fi
}

# Show usage
usage() {
    echo "Server Health Check - Pre-operation Safety Validation"
    echo ""
    echo "Usage: $0 [check_type]"
    echo ""
    echo "Check Types:"
    echo "  all                - Run comprehensive safety check (default)"
    echo "  claude             - Check Claude Code CLI safety"
    echo "  ports              - Check critical ports"
    echo "  processes          - Check for dangerous processes"
    echo "  directory          - Check directory safety"
    echo "  resources          - Check system resources"
    echo "  port-availability  - Check if server port is available"
    echo ""
    echo "Safety Features:"
    echo "  ✅ Claude Code CLI connection protection"
    echo "  ✅ Critical port validation"
    echo "  ✅ Dangerous process detection"
    echo "  ✅ Directory and resource validation"
}

# Main command handling
case "${1:-all}" in
    all|comprehensive)
        comprehensive_check
        ;;
    claude)
        check_claude_code_safety
        ;;
    ports)
        check_critical_ports
        ;;
    processes)
        check_dangerous_processes
        ;;
    directory)
        check_directory_safety
        ;;
    resources)
        check_system_resources
        ;;
    port-availability)
        check_port_availability
        ;;
    *)
        usage
        exit 1
        ;;
esac