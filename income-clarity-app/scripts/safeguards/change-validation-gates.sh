#!/bin/bash
# Change Validation Gates - Prevent dangerous operations before execution
# Created after 465+ file deletion incident to validate all major operations

set -e

# Configuration
PROJECT_ROOT="/public/MasterV2/income-clarity/income-clarity-app"
VALIDATION_LOG="/public/MasterV2/income-clarity/income-clarity-app/data/backups/validation.log"
OPERATIONS_LOG="/public/MasterV2/income-clarity/income-clarity-app/data/backups/operations.log"

# Thresholds and limits
MAX_FILE_OPERATIONS=100
MAX_DELETE_OPERATIONS=25
CRITICAL_PATH_PROTECTION=true

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Protected paths - operations on these require extra confirmation
PROTECTED_PATHS=(
    "$PROJECT_ROOT/app/api"
    "$PROJECT_ROOT/components"
    "$PROJECT_ROOT/lib/services"
    "$PROJECT_ROOT/scripts"
    "$PROJECT_ROOT/custom-server.js"
    "$PROJECT_ROOT/package.json"
    "$PROJECT_ROOT/next.config.mjs"
    "$PROJECT_ROOT/CLAUDE.md"
)

# High-risk operation patterns
HIGH_RISK_PATTERNS=(
    "rm -rf"
    "find.*-delete"
    "git reset --hard"
    "git clean -fd"
    "npm uninstall"
    "yarn remove"
)

# Logging functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$VALIDATION_LOG"
}

log_operation() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$OPERATIONS_LOG"
}

log_error() {
    echo -e "${RED}$(date '+%Y-%m-%d %H:%M:%S') - ERROR: $1${NC}" | tee -a "$VALIDATION_LOG"
}

log_warning() {
    echo -e "${YELLOW}$(date '+%Y-%m-%d %H:%M:%S') - WARNING: $1${NC}" | tee -a "$VALIDATION_LOG"
}

log_success() {
    echo -e "${GREEN}$(date '+%Y-%m-%d %H:%M:%S') - SUCCESS: $1${NC}" | tee -a "$VALIDATION_LOG"
}

log_info() {
    echo -e "${BLUE}$(date '+%Y-%m-%d %H:%M:%S') - INFO: $1${NC}" | tee -a "$VALIDATION_LOG"
}

# Create pre-operation backup
create_checkpoint() {
    local operation="$1"
    local timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
    local checkpoint_name="checkpoint_${operation}_${timestamp}"
    
    log_info "Creating checkpoint: $checkpoint_name"
    
    if [ -f "$PROJECT_ROOT/scripts/safeguards/automated-backup-system.sh" ]; then
        "$PROJECT_ROOT/scripts/safeguards/automated-backup-system.sh" emergency
        log_success "Checkpoint created successfully"
        return 0
    else
        log_error "Backup system not available for checkpoint"
        return 1
    fi
}

# Validate path safety
validate_path() {
    local target_path="$1"
    local operation="$2"
    
    # Check if path is protected
    for protected in "${PROTECTED_PATHS[@]}"; do
        if [[ "$target_path" == "$protected"* ]]; then
            log_warning "Operation '$operation' targets protected path: $target_path"
            return 1
        fi
    done
    
    # Check if path is critical system location
    local critical_patterns=("/bin" "/usr/bin" "/etc" "/var" "/home")
    for pattern in "${critical_patterns[@]}"; do
        if [[ "$target_path" == "$pattern"* ]]; then
            log_error "Operation '$operation' targets critical system path: $target_path"
            return 2
        fi
    done
    
    return 0
}

# Validate operation command
validate_command() {
    local command="$1"
    
    # Check for high-risk patterns
    for pattern in "${HIGH_RISK_PATTERNS[@]}"; do
        if [[ "$command" =~ $pattern ]]; then
            log_warning "High-risk operation detected: $pattern in '$command'"
            return 1
        fi
    done
    
    # Check for mass deletion patterns
    if [[ "$command" =~ rm.*\*.*\* ]] || [[ "$command" =~ find.*-delete.*\* ]]; then
        log_error "Mass deletion pattern detected: $command"
        return 2
    fi
    
    return 0
}

# Interactive confirmation
get_confirmation() {
    local message="$1"
    local default="${2:-no}"
    
    echo -e "${YELLOW}⚠️  $message${NC}"
    echo -e "${BLUE}Type 'yes' to confirm, anything else to cancel:${NC}"
    read -r response
    
    if [ "$response" = "yes" ]; then
        return 0
    else
        return 1
    fi
}

# File operation validation
validate_file_operation() {
    local operation="$1"
    local target="$2"
    local force="${3:-false}"
    
    log_info "Validating file operation: $operation on $target"
    
    case $operation in
        "delete"|"remove"|"rm")
            # Count files that would be affected
            local file_count=0
            if [ -d "$target" ]; then
                file_count=$(find "$target" -type f | wc -l)
            elif [ -f "$target" ]; then
                file_count=1
            fi
            
            if [ $file_count -gt $MAX_DELETE_OPERATIONS ]; then
                log_error "Mass deletion blocked: $file_count files (limit: $MAX_DELETE_OPERATIONS)"
                
                if [ "$force" = "false" ]; then
                    if get_confirmation "Delete $file_count files from $target?"; then
                        create_checkpoint "mass_delete"
                        log_operation "MASS DELETE: $file_count files from $target (user confirmed)"
                        return 0
                    else
                        log_operation "BLOCKED: Mass deletion cancelled by user"
                        return 1
                    fi
                fi
            fi
            
            # Validate path safety
            if ! validate_path "$target" "$operation"; then
                local path_status=$?
                if [ $path_status -eq 2 ]; then
                    log_error "Critical path deletion blocked: $target"
                    return 1
                elif [ $path_status -eq 1 ] && [ "$force" = "false" ]; then
                    if get_confirmation "Delete from protected path $target?"; then
                        create_checkpoint "protected_delete"
                        log_operation "PROTECTED DELETE: $target (user confirmed)"
                        return 0
                    else
                        log_operation "BLOCKED: Protected path deletion cancelled"
                        return 1
                    fi
                fi
            fi
            ;;
            
        "move"|"mv")
            if ! validate_path "$target" "$operation"; then
                log_warning "Move operation on protected path: $target"
                if [ "$force" = "false" ]; then
                    if ! get_confirmation "Move from protected path $target?"; then
                        log_operation "BLOCKED: Protected path move cancelled"
                        return 1
                    fi
                fi
            fi
            ;;
            
        "copy"|"cp")
            # Generally safe, just log
            log_operation "COPY: $target"
            ;;
            
        *)
            log_warning "Unknown file operation: $operation on $target"
            ;;
    esac
    
    log_success "File operation validated: $operation on $target"
    return 0
}

# Build operation validation
validate_build_operation() {
    local build_type="$1"
    
    log_info "Validating build operation: $build_type"
    
    # Check if critical files exist before build
    local critical_files=(
        "$PROJECT_ROOT/package.json"
        "$PROJECT_ROOT/next.config.mjs"
        "$PROJECT_ROOT/custom-server.js"
    )
    
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Build blocked: Critical file missing: $file"
            return 1
        fi
    done
    
    # Check disk space
    local available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    local min_space=2097152  # 2GB in KB
    
    if [ $available_space -lt $min_space ]; then
        log_error "Build blocked: Insufficient disk space"
        return 1
    fi
    
    # Create pre-build checkpoint for major builds
    if [[ "$build_type" =~ ^(production|full|clean)$ ]]; then
        log_info "Creating pre-build checkpoint for $build_type build"
        create_checkpoint "build_${build_type}"
    fi
    
    log_success "Build operation validated: $build_type"
    return 0
}

# Git operation validation
validate_git_operation() {
    local git_command="$1"
    
    log_info "Validating git operation: $git_command"
    
    case $git_command in
        *"reset --hard"*)
            log_warning "Hard reset detected"
            if ! get_confirmation "Perform hard reset? This will lose uncommitted changes."; then
                log_operation "BLOCKED: Git hard reset cancelled"
                return 1
            fi
            create_checkpoint "git_reset"
            ;;
            
        *"clean -fd"*)
            log_warning "Git clean -fd detected"
            if ! get_confirmation "Remove all untracked files and directories?"; then
                log_operation "BLOCKED: Git clean cancelled"
                return 1
            fi
            create_checkpoint "git_clean"
            ;;
            
        *"push --force"*)
            log_error "Force push blocked for safety"
            return 1
            ;;
            
        *"rebase"*)
            log_info "Git rebase detected - creating checkpoint"
            create_checkpoint "git_rebase"
            ;;
    esac
    
    log_success "Git operation validated: $git_command"
    return 0
}

# Package manager validation
validate_package_operation() {
    local package_command="$1"
    
    log_info "Validating package operation: $package_command"
    
    case $package_command in
        *"uninstall"*|*"remove"*)
            # Check if removing critical packages
            local critical_packages=("next" "react" "typescript" "prisma")
            for pkg in "${critical_packages[@]}"; do
                if [[ "$package_command" =~ $pkg ]]; then
                    log_warning "Critical package operation: $pkg"
                    if ! get_confirmation "Remove critical package $pkg?"; then
                        log_operation "BLOCKED: Critical package removal cancelled"
                        return 1
                    fi
                    create_checkpoint "package_remove"
                    break
                fi
            done
            ;;
            
        *"install"*)
            # Generally safe, just log
            log_operation "PACKAGE INSTALL: $package_command"
            ;;
    esac
    
    log_success "Package operation validated: $package_command"
    return 0
}

# Main validation gate
validate_operation() {
    local operation_type="$1"
    local operation_details="$2"
    local force="${3:-false}"
    
    # Ensure log directories exist
    mkdir -p "$(dirname "$VALIDATION_LOG")"
    
    log_info "=== VALIDATION GATE ==="
    log_info "Type: $operation_type"
    log_info "Details: $operation_details"
    log_info "Force: $force"
    
    case $operation_type in
        "file")
            validate_file_operation $operation_details $force
            ;;
        "build")
            validate_build_operation "$operation_details"
            ;;
        "git")
            validate_git_operation "$operation_details"
            ;;
        "package")
            validate_package_operation "$operation_details"
            ;;
        "command")
            validate_command "$operation_details"
            ;;
        *)
            log_error "Unknown operation type: $operation_type"
            return 1
            ;;
    esac
}

# System health check before operations
health_check() {
    log_info "Performing system health check..."
    
    # Check critical files
    local critical_files=(
        "$PROJECT_ROOT/custom-server.js"
        "$PROJECT_ROOT/package.json"
        "$PROJECT_ROOT/next.config.mjs"
    )
    
    for file in "${critical_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Health check failed: Missing $file"
            return 1
        fi
    done
    
    # Check backup system
    if [ ! -f "$PROJECT_ROOT/scripts/safeguards/automated-backup-system.sh" ]; then
        log_error "Health check failed: Backup system missing"
        return 1
    fi
    
    # Check disk space
    local available_space=$(df "$PROJECT_ROOT" | awk 'NR==2 {print $4}')
    local min_space=1048576  # 1GB in KB
    
    if [ $available_space -lt $min_space ]; then
        log_warning "Health check warning: Low disk space"
    fi
    
    log_success "System health check passed"
    return 0
}

# Show recent operations
show_operations() {
    local count="${1:-20}"
    
    echo -e "${PURPLE}=== RECENT OPERATIONS ===${NC}"
    if [ -f "$OPERATIONS_LOG" ]; then
        tail -n "$count" "$OPERATIONS_LOG"
    else
        echo "No operations log found"
    fi
}

# Main execution
main() {
    local action="$1"
    
    case $action in
        "validate")
            validate_operation "$2" "$3" "$4"
            ;;
        "health")
            health_check
            ;;
        "operations")
            show_operations "$2"
            ;;
        "logs")
            if [ -f "$VALIDATION_LOG" ]; then
                tail -f "$VALIDATION_LOG"
            else
                echo "No validation log found"
            fi
            ;;
        *)
            echo "Usage: $0 {validate|health|operations|logs}"
            echo ""
            echo "  validate TYPE DETAILS [FORCE]  - Validate operation"
            echo "    Types: file, build, git, package, command"
            echo "    Examples:"
            echo "      $0 validate file \"delete /path/to/files\""
            echo "      $0 validate build \"production\""
            echo "      $0 validate git \"reset --hard HEAD\""
            echo ""
            echo "  health                        - Check system health"
            echo "  operations [COUNT]            - Show recent operations"
            echo "  logs                          - Follow validation logs"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"