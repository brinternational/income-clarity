#!/bin/bash
# File Change Monitor - Real-time protection against mass deletions
# Created after 465+ file deletion incident for continuous monitoring

set -e

# Configuration
PROJECT_ROOT="/public/MasterV2/income-clarity/income-clarity-app"
MONITOR_LOG="/public/MasterV2/income-clarity/income-clarity-app/data/backups/file-monitor.log"
ALERT_LOG="/public/MasterV2/income-clarity/income-clarity-app/data/backups/file-alerts.log"
PID_FILE="/tmp/income-clarity-monitor.pid"

# Thresholds
CRITICAL_DELETE_THRESHOLD=10    # Alert if 10+ files deleted in 5 minutes
MASS_DELETE_THRESHOLD=50        # Emergency backup if 50+ files deleted
MONITOR_INTERVAL=30             # Check every 30 seconds

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Critical directories to monitor
CRITICAL_DIRS=(
    "$PROJECT_ROOT/app/api"
    "$PROJECT_ROOT/components"
    "$PROJECT_ROOT/lib/services"
    "$PROJECT_ROOT/scripts"
)

# Critical files to monitor
CRITICAL_FILES=(
    "$PROJECT_ROOT/custom-server.js"
    "$PROJECT_ROOT/package.json"
    "$PROJECT_ROOT/next.config.mjs"
    "$PROJECT_ROOT/CLAUDE.md"
)

# Logging functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$MONITOR_LOG"
}

log_alert() {
    echo -e "${RED}$(date '+%Y-%m-%d %H:%M:%S') - ALERT: $1${NC}" | tee -a "$ALERT_LOG" -a "$MONITOR_LOG"
}

log_warning() {
    echo -e "${YELLOW}$(date '+%Y-%m-%d %H:%M:%S') - WARNING: $1${NC}" | tee -a "$MONITOR_LOG"
}

log_info() {
    echo -e "${BLUE}$(date '+%Y-%m-%d %H:%M:%S') - INFO: $1${NC}" | tee -a "$MONITOR_LOG"
}

# Check if monitor is already running
check_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Monitor already running with PID: $pid"
            exit 1
        else
            rm -f "$PID_FILE"
        fi
    fi
}

# Create baseline file count
create_baseline() {
    local baseline_file="/tmp/income-clarity-baseline-$(date +%s).txt"
    
    log_info "Creating file count baseline..."
    
    # Count files in critical directories
    for dir in "${CRITICAL_DIRS[@]}"; do
        if [ -d "$dir" ]; then
            local count=$(find "$dir" -type f | wc -l)
            echo "$dir:$count" >> "$baseline_file"
        fi
    done
    
    # Count total project files
    local total_count=$(find "$PROJECT_ROOT" -type f \
        -not -path "*/node_modules/*" \
        -not -path "*/.git/*" \
        -not -path "*/dist/*" \
        -not -path "*/build/*" \
        -not -path "*/.next/*" \
        -not -path "*/data/backups/*" \
        | wc -l)
    
    echo "TOTAL:$total_count" >> "$baseline_file"
    echo "$baseline_file"
}

# Check for file changes
check_file_changes() {
    local baseline_file="$1"
    local current_time=$(date '+%Y-%m-%d %H:%M:%S')
    local changes_detected=false
    local deleted_files=0
    
    # Check critical directories
    while IFS=':' read -r dir baseline_count; do
        if [ "$dir" = "TOTAL" ]; then
            # Check total file count
            local current_total=$(find "$PROJECT_ROOT" -type f \
                -not -path "*/node_modules/*" \
                -not -path "*/.git/*" \
                -not -path "*/dist/*" \
                -not -path "*/build/*" \
                -not -path "*/.next/*" \
                -not -path "*/data/backups/*" \
                | wc -l)
            
            local total_diff=$((baseline_count - current_total))
            
            if [ $total_diff -gt $CRITICAL_DELETE_THRESHOLD ]; then
                log_alert "CRITICAL: $total_diff files deleted from project (was: $baseline_count, now: $current_total)"
                deleted_files=$total_diff
                changes_detected=true
                
                if [ $total_diff -gt $MASS_DELETE_THRESHOLD ]; then
                    trigger_emergency_backup "Mass deletion detected: $total_diff files"
                fi
            elif [ $total_diff -gt 0 ]; then
                log_warning "File deletion detected: $total_diff files (was: $baseline_count, now: $current_total)"
            fi
        else
            # Check individual critical directories
            if [ -d "$dir" ]; then
                local current_count=$(find "$dir" -type f | wc -l)
                local diff=$((baseline_count - current_count))
                
                if [ $diff -gt 5 ]; then
                    log_alert "CRITICAL: $diff files deleted from $dir (was: $baseline_count, now: $current_count)"
                    changes_detected=true
                elif [ $diff -gt 0 ]; then
                    log_warning "Files deleted from $dir: $diff (was: $baseline_count, now: $current_count)"
                fi
            else
                log_alert "CRITICAL: Directory missing: $dir"
                changes_detected=true
            fi
        fi
    done < "$baseline_file"
    
    # Check critical files
    for file in "${CRITICAL_FILES[@]}"; do
        if [ ! -f "$file" ]; then
            log_alert "CRITICAL: Critical file missing: $file"
            changes_detected=true
            trigger_emergency_backup "Critical file missing: $file"
        fi
    done
    
    if [ "$changes_detected" = true ]; then
        return $deleted_files
    else
        return 0
    fi
}

# Trigger emergency backup
trigger_emergency_backup() {
    local reason="$1"
    log_alert "Triggering emergency backup: $reason"
    
    # Run emergency backup script
    if [ -f "$PROJECT_ROOT/scripts/safeguards/automated-backup-system.sh" ]; then
        "$PROJECT_ROOT/scripts/safeguards/automated-backup-system.sh" emergency
        log_info "Emergency backup completed"
    else
        log_alert "Emergency backup script not found!"
    fi
    
    # Send alert notification (if notification system available)
    if command -v mail >/dev/null 2>&1; then
        echo "CRITICAL ALERT: $reason at $(date)" | mail -s "Income Clarity - File Deletion Alert" admin@localhost 2>/dev/null || true
    fi
}

# Monitor function
start_monitoring() {
    echo $$ > "$PID_FILE"
    log_info "File change monitor started (PID: $$)"
    
    # Create initial baseline
    local baseline_file=$(create_baseline)
    log_info "Baseline created: $baseline_file"
    
    # Monitor loop
    while true; do
        sleep $MONITOR_INTERVAL
        
        # Check for changes
        local deleted_count=0
        if ! deleted_count=$(check_file_changes "$baseline_file"); then
            deleted_count=$?
        fi
        
        # Update baseline every 10 minutes (20 cycles)
        local cycle_count=0
        cycle_count=$((cycle_count + 1))
        if [ $cycle_count -ge 20 ]; then
            rm -f "$baseline_file"
            baseline_file=$(create_baseline)
            cycle_count=0
            log_info "Baseline refreshed"
        fi
        
        # Memory cleanup - rotate logs if they get too large
        if [ -f "$MONITOR_LOG" ] && [ $(wc -l < "$MONITOR_LOG") -gt 10000 ]; then
            tail -5000 "$MONITOR_LOG" > "$MONITOR_LOG.tmp"
            mv "$MONITOR_LOG.tmp" "$MONITOR_LOG"
            log_info "Monitor log rotated"
        fi
    done
}

# Stop monitoring
stop_monitoring() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            rm -f "$PID_FILE"
            echo "Monitor stopped (PID: $pid)"
        else
            echo "Monitor not running"
            rm -f "$PID_FILE"
        fi
    else
        echo "Monitor not running"
    fi
}

# Status check
check_status() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo -e "${GREEN}Monitor running (PID: $pid)${NC}"
            echo "Log file: $MONITOR_LOG"
            echo "Alert file: $ALERT_LOG"
            if [ -f "$ALERT_LOG" ]; then
                local alert_count=$(wc -l < "$ALERT_LOG")
                echo "Total alerts: $alert_count"
                if [ $alert_count -gt 0 ]; then
                    echo "Recent alerts:"
                    tail -5 "$ALERT_LOG"
                fi
            fi
        else
            echo -e "${RED}Monitor not running (stale PID file)${NC}"
            rm -f "$PID_FILE"
        fi
    else
        echo -e "${YELLOW}Monitor not running${NC}"
    fi
}

# Main execution
main() {
    local action="${1:-start}"
    
    # Ensure log directories exist
    mkdir -p "$(dirname "$MONITOR_LOG")"
    
    case $action in
        "start")
            check_running
            start_monitoring
            ;;
        "stop")
            stop_monitoring
            ;;
        "restart")
            stop_monitoring
            sleep 2
            check_running
            start_monitoring
            ;;
        "status")
            check_status
            ;;
        "logs")
            if [ -f "$MONITOR_LOG" ]; then
                tail -f "$MONITOR_LOG"
            else
                echo "No log file found"
            fi
            ;;
        "alerts")
            if [ -f "$ALERT_LOG" ]; then
                tail -20 "$ALERT_LOG"
            else
                echo "No alerts found"
            fi
            ;;
        *)
            echo "Usage: $0 {start|stop|restart|status|logs|alerts}"
            echo ""
            echo "  start   - Start file monitoring"
            echo "  stop    - Stop file monitoring"
            echo "  restart - Restart file monitoring"
            echo "  status  - Check monitor status"
            echo "  logs    - Follow monitor logs"
            echo "  alerts  - Show recent alerts"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"