#!/bin/bash
# Automated Backup System - Enhanced safeguard implementation
# Created after 465+ file deletion incident to prevent future catastrophic loss

set -e

# Configuration
BACKUP_ROOT="/public/MasterV2/income-clarity/income-clarity-app/data/backups"
PROJECT_ROOT="/public/MasterV2/income-clarity/income-clarity-app"
GIT_ROOT="/public/MasterV2/income-clarity"
MAX_BACKUPS=48  # Keep 48 hours of backups (hourly)
MAX_DAILY_BACKUPS=30  # Keep 30 days of daily backups

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="$BACKUP_ROOT/backup-system.log"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $1${NC}" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}$(date '+%Y-%m-%d %H:%M:%S') - SUCCESS: $1${NC}" | tee -a "$LOG_FILE"
}

log_info() {
    echo -e "${BLUE}$(date '+%Y-%m-%d %H:%M:%S') - INFO: $1${NC}" | tee -a "$LOG_FILE"
}

# Ensure backup directories exist
create_backup_structure() {
    mkdir -p "$BACKUP_ROOT/hourly"
    mkdir -p "$BACKUP_ROOT/daily"
    mkdir -p "$BACKUP_ROOT/emergency"
    mkdir -p "$BACKUP_ROOT/git-snapshots"
    log_info "Backup directory structure created"
}

# Create comprehensive backup
create_backup() {
    local backup_type="$1"
    local timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
    local backup_dir=""
    
    case $backup_type in
        "hourly")
            backup_dir="$BACKUP_ROOT/hourly"
            ;;
        "daily")
            backup_dir="$BACKUP_ROOT/daily"
            ;;
        "emergency")
            backup_dir="$BACKUP_ROOT/emergency"
            ;;
        *)
            log_error "Invalid backup type: $backup_type"
            return 1
            ;;
    esac
    
    local backup_file="$backup_dir/backup_${backup_type}_$timestamp.tar.gz"
    local git_backup="$BACKUP_ROOT/git-snapshots/git_snapshot_$timestamp.tar.gz"
    
    log_info "Starting $backup_type backup..."
    
    # Create application backup
    cd "$PROJECT_ROOT"
    tar -czf "$backup_file" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='*.log' \
        --exclude='*.rdb' \
        --exclude='dist' \
        --exclude='build' \
        --exclude='.next' \
        --exclude='data/backups' \
        --exclude='test-results' \
        --exclude='playwright-report' \
        --exclude='appendonlydir' \
        . 2>/dev/null || {
        log_error "Application backup failed"
        return 1
    }
    
    # Create git repository backup
    cd "$GIT_ROOT"
    tar -czf "$git_backup" .git/ 2>/dev/null || {
        log_error "Git backup failed"
        return 1
    }
    
    # Verify backups
    if [ -f "$backup_file" ] && [ -f "$git_backup" ]; then
        local app_size=$(du -h "$backup_file" | cut -f1)
        local git_size=$(du -h "$git_backup" | cut -f1)
        log_success "$backup_type backup completed - App: $app_size, Git: $git_size"
        
        # Create backup manifest
        cat > "$backup_dir/backup_${backup_type}_${timestamp}.manifest" <<EOF
Backup Type: $backup_type
Created: $(date)
Application Backup: $backup_file
Git Backup: $git_backup
Application Size: $app_size
Git Size: $git_size
Git Commit: $(cd "$GIT_ROOT" && git rev-parse HEAD 2>/dev/null || echo "N/A")
Git Branch: $(cd "$GIT_ROOT" && git branch --show-current 2>/dev/null || echo "N/A")
File Count: $(tar -tzf "$backup_file" | wc -l)
System: $(uname -a)
EOF
        
        return 0
    else
        log_error "$backup_type backup verification failed"
        return 1
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    
    # Cleanup hourly backups
    local hourly_count=$(ls -1 "$BACKUP_ROOT/hourly/" 2>/dev/null | wc -l)
    if [ $hourly_count -gt $MAX_BACKUPS ]; then
        local to_delete=$((hourly_count - MAX_BACKUPS))
        log_info "Removing $to_delete old hourly backups"
        ls -1t "$BACKUP_ROOT/hourly/"backup_hourly_*.tar.gz 2>/dev/null | tail -n $to_delete | xargs rm -f
        ls -1t "$BACKUP_ROOT/hourly/"backup_hourly_*.manifest 2>/dev/null | tail -n $to_delete | xargs rm -f
    fi
    
    # Cleanup daily backups
    local daily_count=$(ls -1 "$BACKUP_ROOT/daily/" 2>/dev/null | wc -l)
    if [ $daily_count -gt $((MAX_DAILY_BACKUPS * 2)) ]; then  # *2 for .tar.gz and .manifest files
        local to_delete=$((daily_count - MAX_DAILY_BACKUPS * 2))
        log_info "Removing $to_delete old daily backup files"
        ls -1t "$BACKUP_ROOT/daily/"backup_daily_* 2>/dev/null | tail -n $to_delete | xargs rm -f
    fi
    
    # Cleanup old git snapshots (keep 7 days)
    find "$BACKUP_ROOT/git-snapshots/" -name "git_snapshot_*.tar.gz" -mtime +7 -delete 2>/dev/null || true
    
    log_success "Backup cleanup completed"
}

# Health check
health_check() {
    log_info "Performing backup system health check..."
    
    # Check disk space
    local available_space=$(df "$BACKUP_ROOT" | awk 'NR==2 {print $4}')
    local min_space=1048576  # 1GB in KB
    
    if [ $available_space -lt $min_space ]; then
        log_error "Low disk space: $(df -h "$BACKUP_ROOT" | awk 'NR==2 {print $5}') used"
        return 1
    fi
    
    # Check critical files exist
    local critical_files=(
        "$PROJECT_ROOT/custom-server.js"
        "$PROJECT_ROOT/package.json"
        "$PROJECT_ROOT/next.config.mjs"
        "$GIT_ROOT/.git/HEAD"
    )
    
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Critical file missing: $file"
            return 1
        fi
    done
    
    log_success "Health check passed"
    return 0
}

# Emergency restore function
emergency_restore() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        echo "Usage: $0 restore <backup-file>"
        echo ""
        echo "Available backups:"
        find "$BACKUP_ROOT" -name "*.tar.gz" -type f | sort -r | head -10
        return 1
    fi
    
    if [ ! -f "$backup_file" ]; then
        log_error "Backup file not found: $backup_file"
        return 1
    fi
    
    log_info "Starting emergency restore from: $backup_file"
    
    # Create restore point
    local restore_timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
    local restore_backup="$BACKUP_ROOT/emergency/pre-restore-backup_$restore_timestamp.tar.gz"
    
    log_info "Creating pre-restore backup..."
    create_backup "emergency" || {
        log_error "Failed to create pre-restore backup"
        return 1
    }
    
    # Perform restore
    log_info "Restoring from backup..."
    cd "$PROJECT_ROOT"
    
    # Stop server if running
    pkill -f "custom-server.js" 2>/dev/null || true
    sleep 2
    
    # Extract backup
    tar -xzf "$backup_file" || {
        log_error "Failed to extract backup"
        return 1
    }
    
    log_success "Emergency restore completed from: $backup_file"
    log_info "Pre-restore backup saved as: $restore_backup"
    
    return 0
}

# Main execution
main() {
    local action="${1:-hourly}"
    
    case $action in
        "hourly"|"daily"|"emergency")
            create_backup_structure
            if health_check; then
                create_backup "$action"
                cleanup_old_backups
            else
                log_error "Health check failed - backup aborted"
                exit 1
            fi
            ;;
        "restore")
            emergency_restore "$2"
            ;;
        "health")
            health_check
            ;;
        "list")
            echo "Available backups:"
            echo ""
            echo "Hourly backups:"
            ls -lah "$BACKUP_ROOT/hourly/"*.tar.gz 2>/dev/null | tail -10 || echo "None found"
            echo ""
            echo "Daily backups:"
            ls -lah "$BACKUP_ROOT/daily/"*.tar.gz 2>/dev/null | tail -10 || echo "None found"
            echo ""
            echo "Emergency backups:"
            ls -lah "$BACKUP_ROOT/emergency/"*.tar.gz 2>/dev/null | tail -10 || echo "None found"
            ;;
        *)
            echo "Usage: $0 {hourly|daily|emergency|restore|health|list}"
            echo ""
            echo "  hourly    - Create hourly backup"
            echo "  daily     - Create daily backup"
            echo "  emergency - Create emergency backup"
            echo "  restore   - Restore from backup file"
            echo "  health    - Check backup system health"
            echo "  list      - List available backups"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"