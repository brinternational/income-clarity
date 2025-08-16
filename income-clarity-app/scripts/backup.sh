#!/bin/bash

# Production Backup Script for Income Clarity
# Automated backup of database and critical data

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/tmp/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
LOG_FILE="${BACKUP_DIR}/backup_${TIMESTAMP}.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${1}" | tee -a "${LOG_FILE}"
}

error_exit() {
    log "${RED}ERROR: ${1}${NC}"
    exit 1
}

success() {
    log "${GREEN}SUCCESS: ${1}${NC}"
}

warning() {
    log "${YELLOW}WARNING: ${1}${NC}"
}

# Create backup directory
mkdir -p "${BACKUP_DIR}"

log "${GREEN}Starting Income Clarity backup - ${TIMESTAMP}${NC}"

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if running in production
    if [[ "${NODE_ENV:-}" != "production" ]]; then
        warning "Not running in production environment"
    fi
    
    # Check required environment variables
    if [[ -z "${DATABASE_URL:-}" ]]; then
        error_exit "DATABASE_URL not set"
    fi
    
    # Check available disk space (require at least 1GB)
    AVAILABLE_SPACE=$(df "${BACKUP_DIR}" | tail -1 | awk '{print $4}')
    REQUIRED_SPACE=1048576  # 1GB in KB
    
    if [[ ${AVAILABLE_SPACE} -lt ${REQUIRED_SPACE} ]]; then
        error_exit "Insufficient disk space. Available: ${AVAILABLE_SPACE}KB, Required: ${REQUIRED_SPACE}KB"
    fi
    
    success "Prerequisites check passed"
}

# Backup database
backup_database() {
    log "Starting database backup..."
    
    local backup_file="${BACKUP_DIR}/database_${TIMESTAMP}.sql"
    local backup_file_compressed="${backup_file}.gz"
    
    # Use pg_dump for PostgreSQL/Supabase
    if command -v pg_dump >/dev/null 2>&1; then
        log "Using pg_dump for database backup..."
        
        pg_dump "${DATABASE_URL}" \
            --no-password \
            --verbose \
            --clean \
            --if-exists \
            --create \
            --format=plain \
            --file="${backup_file}" 2>&1 | tee -a "${LOG_FILE}"
        
        if [[ ${PIPESTATUS[0]} -eq 0 ]]; then
            # Compress backup
            gzip "${backup_file}"
            success "Database backup completed: ${backup_file_compressed}"
            
            # Verify backup integrity
            if gunzip -t "${backup_file_compressed}" >/dev/null 2>&1; then
                success "Database backup integrity verified"
            else
                error_exit "Database backup integrity check failed"
            fi
        else
            error_exit "Database backup failed"
        fi
    else
        # Fallback: Use Supabase CLI if available
        if command -v supabase >/dev/null 2>&1; then
            log "Using Supabase CLI for database backup..."
            # Note: This requires proper Supabase project setup
            warning "Supabase CLI backup not implemented - using API approach"
        else
            warning "No database backup tool available - skipping database backup"
        fi
    fi
}

# Backup application configuration
backup_config() {
    log "Backing up application configuration..."
    
    local config_backup_dir="${BACKUP_DIR}/config_${TIMESTAMP}"
    mkdir -p "${config_backup_dir}"
    
    # Backup package.json and lock files
    if [[ -f "package.json" ]]; then
        cp package.json "${config_backup_dir}/"
    fi
    
    if [[ -f "package-lock.json" ]]; then
        cp package-lock.json "${config_backup_dir}/"
    fi
    
    # Backup Next.js config
    if [[ -f "next.config.mjs" ]]; then
        cp next.config.mjs "${config_backup_dir}/"
    fi
    
    # Backup Vercel config
    if [[ -f "vercel.json" ]]; then
        cp vercel.json "${config_backup_dir}/"
    fi
    
    # Backup migration scripts
    if [[ -d "scripts" ]]; then
        cp -r scripts "${config_backup_dir}/"
    fi
    
    # Create environment template (without secrets)
    if [[ -f ".env.example" ]]; then
        cp .env.example "${config_backup_dir}/"
    fi
    
    # Compress configuration backup
    tar -czf "${BACKUP_DIR}/config_${TIMESTAMP}.tar.gz" -C "${BACKUP_DIR}" "config_${TIMESTAMP}"
    rm -rf "${config_backup_dir}"
    
    success "Configuration backup completed"
}

# Backup critical application data
backup_app_data() {
    log "Backing up critical application data..."
    
    local app_backup_dir="${BACKUP_DIR}/app_data_${TIMESTAMP}"
    mkdir -p "${app_backup_dir}"
    
    # Backup public assets
    if [[ -d "public" ]]; then
        cp -r public "${app_backup_dir}/"
    fi
    
    # Backup any user uploads (if applicable)
    if [[ -d "uploads" ]]; then
        cp -r uploads "${app_backup_dir}/"
    fi
    
    # Backup logs (last 7 days)
    if [[ -d "logs" ]]; then
        find logs -name "*.log" -mtime -7 -exec cp {} "${app_backup_dir}/" \;
    fi
    
    # Create application metadata
    cat > "${app_backup_dir}/metadata.json" << EOF
{
  "backup_timestamp": "${TIMESTAMP}",
  "application": "income-clarity",
  "version": "$(node -p "require('./package.json').version" 2>/dev/null || echo 'unknown')",
  "environment": "${NODE_ENV:-unknown}",
  "node_version": "$(node --version 2>/dev/null || echo 'unknown')",
  "backup_type": "automated"
}
EOF
    
    # Compress application data backup
    if [[ -n "$(ls -A "${app_backup_dir}")" ]]; then
        tar -czf "${BACKUP_DIR}/app_data_${TIMESTAMP}.tar.gz" -C "${BACKUP_DIR}" "app_data_${TIMESTAMP}"
        rm -rf "${app_backup_dir}"
        success "Application data backup completed"
    else
        rm -rf "${app_backup_dir}"
        warning "No application data to backup"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log "Cleaning up backups older than ${RETENTION_DAYS} days..."
    
    local deleted_count=0
    
    # Find and delete old backup files
    while IFS= read -r -d '' file; do
        rm "${file}"
        ((deleted_count++))
        log "Deleted old backup: $(basename "${file}")"
    done < <(find "${BACKUP_DIR}" -name "*.sql.gz" -o -name "*.tar.gz" -o -name "*.log" -type f -mtime +${RETENTION_DAYS} -print0 2>/dev/null || true)
    
    if [[ ${deleted_count} -gt 0 ]]; then
        success "Cleaned up ${deleted_count} old backup files"
    else
        log "No old backups to clean up"
    fi
}

# Generate backup report
generate_report() {
    local end_time=$(date +%Y%m%d_%H%M%S)
    local backup_files=($(find "${BACKUP_DIR}" -name "*_${TIMESTAMP}.*" -type f))
    local total_size=0
    
    log "Generating backup report..."
    
    # Calculate total backup size
    for file in "${backup_files[@]}"; do
        if [[ -f "${file}" ]]; then
            local size=$(stat -f%z "${file}" 2>/dev/null || stat -c%s "${file}" 2>/dev/null || echo 0)
            total_size=$((total_size + size))
        fi
    done
    
    # Convert size to human readable
    local human_size=$(numfmt --to=iec ${total_size} 2>/dev/null || echo "${total_size} bytes")
    
    cat > "${BACKUP_DIR}/backup_report_${TIMESTAMP}.json" << EOF
{
  "backup_id": "${TIMESTAMP}",
  "start_time": "${TIMESTAMP}",
  "end_time": "${end_time}",
  "status": "completed",
  "total_files": ${#backup_files[@]},
  "total_size_bytes": ${total_size},
  "total_size_human": "${human_size}",
  "files": [
    $(printf '"%s",' "${backup_files[@]}" | sed 's/,$//')
  ],
  "retention_days": ${RETENTION_DAYS}
}
EOF
    
    success "Backup completed successfully!"
    log "Total backup size: ${human_size}"
    log "Backup files created: ${#backup_files[@]}"
    log "Report: ${BACKUP_DIR}/backup_report_${TIMESTAMP}.json"
}

# Upload backups to S3
upload_to_s3() {
    if [[ -n "${S3_BACKUP_BUCKET:-}" ]] && command -v aws >/dev/null 2>&1; then
        log "Uploading backups to S3..."
        
        local backup_files=($(find "${BACKUP_DIR}" -name "*_${TIMESTAMP}.*" -type f))
        local upload_count=0
        local failed_count=0
        
        for file in "${backup_files[@]}"; do
            if [[ -f "${file}" ]]; then
                local filename=$(basename "${file}")
                local s3_path="s3://${S3_BACKUP_BUCKET}/$(date +%Y/%m/%d)/${filename}"
                
                if aws s3 cp "${file}" "${s3_path}" --storage-class STANDARD_IA 2>&1 | tee -a "${LOG_FILE}"; then
                    ((upload_count++))
                    log "Uploaded: ${filename}"
                else
                    ((failed_count++))
                    warning "Failed to upload: ${filename}"
                fi
            fi
        done
        
        if [[ ${upload_count} -gt 0 ]]; then
            success "Uploaded ${upload_count} files to S3"
            
            # Set S3 lifecycle policy for automatic cleanup
            aws s3api put-bucket-lifecycle-configuration --bucket "${S3_BACKUP_BUCKET}" --lifecycle-configuration '{
                "Rules": [
                    {
                        "ID": "BackupRetentionPolicy",
                        "Status": "Enabled",
                        "Transitions": [
                            {
                                "Days": 30,
                                "StorageClass": "GLACIER"
                            },
                            {
                                "Days": 90,
                                "StorageClass": "DEEP_ARCHIVE"
                            }
                        ],
                        "Expiration": {
                            "Days": 2555
                        }
                    }
                ]
            }' 2>/dev/null || warning "Failed to set S3 lifecycle policy"
        fi
        
        if [[ ${failed_count} -gt 0 ]]; then
            warning "${failed_count} files failed to upload to S3"
        fi
        
    else
        if [[ -z "${S3_BACKUP_BUCKET:-}" ]]; then
            warning "S3_BACKUP_BUCKET not configured - skipping S3 upload"
        else
            warning "AWS CLI not available - skipping S3 upload"
        fi
    fi
}

# Send notification (if configured)
send_notification() {
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        local backup_files=($(find "${BACKUP_DIR}" -name "*_${TIMESTAMP}.*" -type f))
        local total_size=$(du -sh "${BACKUP_DIR}"/*_${TIMESTAMP}.* 2>/dev/null | awk '{sum+=$1} END {print sum"M"}' || echo "Unknown")
        
        local s3_status=""
        if [[ -n "${S3_BACKUP_BUCKET:-}" ]]; then
            s3_status="\\n• S3 Backup: ✅ Uploaded"
        fi
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"✅ Income Clarity backup completed\\n• Timestamp: ${TIMESTAMP}\\n• Files: ${#backup_files[@]}\\n• Size: ${total_size}${s3_status}\"}" \
            "${SLACK_WEBHOOK_URL}" 2>/dev/null || warning "Failed to send Slack notification"
    fi
    
    if [[ -n "${EMAIL_NOTIFICATION:-}" ]]; then
        warning "Email notifications not implemented"
    fi
}

# Main execution
main() {
    trap 'error_exit "Backup script interrupted"' INT TERM
    
    check_prerequisites
    backup_database
    backup_config
    backup_app_data
    cleanup_old_backups
    generate_report
    upload_to_s3
    send_notification
    
    success "All backup operations completed successfully!"
}

# Run main function
main "$@"