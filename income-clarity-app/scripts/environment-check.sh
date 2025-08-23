#!/bin/bash

# ============================================================================
# ENVIRONMENT IDENTIFICATION AND VALIDATION SYSTEM
# Critical: Environment Confusion Prevention and Detection
# ============================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Banner function
print_banner() {
    local color=$1
    local title=$2
    local subtitle=$3
    echo -e "${color}"
    echo "═══════════════════════════════════════════════════════════════════"
    echo "  $title"
    if [ -n "$subtitle" ]; then
        echo "  $subtitle"
    fi
    echo "═══════════════════════════════════════════════════════════════════"
    echo -e "${NC}"
}

# Environment detection function
detect_environment() {
    local runtime_env="${NODE_ENV:-unknown}"
    local config_env="unknown"
    local public_env="unknown" 
    local app_url="unknown"
    local lite_mode="unknown"
    
    # Read from .env file if it exists
    if [ -f ".env" ]; then
        config_env=$(grep "^NODE_ENV=" .env 2>/dev/null | cut -d'=' -f2 || echo "unknown")
        public_env=$(grep "^NEXT_PUBLIC_ENVIRONMENT=" .env 2>/dev/null | cut -d'=' -f2 || echo "unknown")
        app_url=$(grep "^NEXT_PUBLIC_APP_URL=" .env 2>/dev/null | cut -d'=' -f2 || echo "unknown")
        lite_mode=$(grep "^LITE_PRODUCTION_MODE=" .env 2>/dev/null | cut -d'=' -f2 || echo "false")
    fi
    
    echo "RUNTIME_ENV:$runtime_env"
    echo "CONFIG_ENV:$config_env"
    echo "PUBLIC_ENV:$public_env"
    echo "APP_URL:$app_url"
    echo "LITE_MODE:$lite_mode"
}

# Validation function
validate_environment_consistency() {
    local env_data="$1"
    local runtime_env=$(echo "$env_data" | grep "RUNTIME_ENV:" | cut -d':' -f2)
    local config_env=$(echo "$env_data" | grep "CONFIG_ENV:" | cut -d':' -f2)
    local public_env=$(echo "$env_data" | grep "PUBLIC_ENV:" | cut -d':' -f2)
    local app_url=$(echo "$env_data" | grep "APP_URL:" | cut -d':' -f2)
    local lite_mode=$(echo "$env_data" | grep "LITE_MODE:" | cut -d':' -f2)
    
    local warnings=0
    local errors=0
    
    echo -e "${BLUE}🔍 Environment Consistency Check:${NC}"
    echo "────────────────────────────────────────────────────────────────────"
    
    # Check for mismatches
    if [ "$runtime_env" != "$config_env" ] && [ "$config_env" != "unknown" ]; then
        echo -e "${RED}❌ CRITICAL MISMATCH: Runtime ($runtime_env) ≠ Config ($config_env)${NC}"
        echo "   This causes unpredictable behavior and deployment confusion!"
        ((errors++))
    else
        echo -e "${GREEN}✅ Runtime and Config environments match: $runtime_env${NC}"
    fi
    
    # URL validation
    if [[ "$app_url" == *"localhost"* ]] && [[ "$config_env" == "production" ]]; then
        echo -e "${RED}❌ ERROR: Production config with localhost URL${NC}"
        ((errors++))
    elif [[ "$app_url" == *"incomeclarity.ddns.net"* ]] && [[ "$runtime_env" == "development" ]]; then
        echo -e "${YELLOW}⚠️  WARNING: Development runtime with production URL${NC}"
        ((warnings++))
    else
        echo -e "${GREEN}✅ URL and environment configuration consistent${NC}"
    fi
    
    # Environment type identification
    if [ "$lite_mode" = "true" ]; then
        echo -e "${CYAN}ℹ️  Mode: Lite Production (SQLite + Local)${NC}"
    elif [ "$config_env" = "production" ]; then
        echo -e "${PURPLE}ℹ️  Mode: Full Production${NC}"
    elif [ "$runtime_env" = "development" ]; then
        echo -e "${BLUE}ℹ️  Mode: Development${NC}"
    fi
    
    echo "────────────────────────────────────────────────────────────────────"
    
    if [ $errors -gt 0 ]; then
        echo -e "${RED}🚨 CRITICAL: $errors error(s) detected! Environment is UNSAFE for deployment!${NC}"
        return 1
    elif [ $warnings -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $warnings warning(s) detected. Review configuration.${NC}"
        return 2
    else
        echo -e "${GREEN}✅ Environment configuration is consistent and safe.${NC}"
        return 0
    fi
}

# Server status check
check_server_status() {
    echo -e "${BLUE}🖥️  Server Status Check:${NC}"
    echo "────────────────────────────────────────────────────────────────────"
    
    # Check if server is running on port 3000
    if lsof -ti:3000 > /dev/null 2>&1; then
        local pid=$(lsof -ti:3000)
        local cmd=$(ps -p $pid -o cmd= 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ Server running on port 3000${NC}"
        echo "   PID: $pid"
        echo "   Command: $cmd"
        
        # Health check
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health | grep -q "200\|503"; then
            echo -e "${GREEN}✅ Server responding to health checks${NC}"
        else
            echo -e "${YELLOW}⚠️  Server not responding to health checks${NC}"
        fi
    else
        echo -e "${RED}❌ No server running on port 3000${NC}"
    fi
    
    echo "────────────────────────────────────────────────────────────────────"
}

# Main execution
main() {
    local command="${1:-check}"
    
    case "$command" in
        "check"|"")
            print_banner "${CYAN}" "🌐 ENVIRONMENT IDENTIFICATION SYSTEM" "Current Environment Analysis"
            
            # Detect environment
            local env_data=$(detect_environment)
            local runtime_env=$(echo "$env_data" | grep "RUNTIME_ENV:" | cut -d':' -f2)
            local config_env=$(echo "$env_data" | grep "CONFIG_ENV:" | cut -d':' -f2)
            local public_env=$(echo "$env_data" | grep "PUBLIC_ENV:" | cut -d':' -f2)
            local app_url=$(echo "$env_data" | grep "APP_URL:" | cut -d':' -f2)
            
            # Display current environment
            echo -e "${WHITE}📊 Current Environment State:${NC}"
            echo "────────────────────────────────────────────────────────────────────"
            echo -e "Runtime Environment:     ${YELLOW}$runtime_env${NC}"
            echo -e "Config Environment:      ${YELLOW}$config_env${NC}"
            echo -e "Public Environment:      ${YELLOW}$public_env${NC}"
            echo -e "Application URL:         ${YELLOW}$app_url${NC}"
            echo -e "Working Directory:       ${CYAN}$(pwd)${NC}"
            echo -e "Current User:            ${CYAN}$(whoami)${NC}"
            echo -e "Timestamp:               ${CYAN}$(date)${NC}"
            echo "────────────────────────────────────────────────────────────────────"
            echo ""
            
            # Validate consistency
            validate_environment_consistency "$env_data"
            local validation_result=$?
            
            echo ""
            
            # Check server status
            check_server_status
            
            # Summary
            echo ""
            case $validation_result in
                0)
                    print_banner "${GREEN}" "✅ ENVIRONMENT STATUS: SAFE" "Ready for operations"
                    ;;
                1)
                    print_banner "${RED}" "🚨 ENVIRONMENT STATUS: CRITICAL" "UNSAFE - Fix configuration before deployment!"
                    ;;
                2)
                    print_banner "${YELLOW}" "⚠️  ENVIRONMENT STATUS: WARNING" "Review configuration recommended"
                    ;;
            esac
            
            exit $validation_result
            ;;
            
        "banner")
            # Just show environment banner
            local env_data=$(detect_environment)
            local runtime_env=$(echo "$env_data" | grep "RUNTIME_ENV:" | cut -d':' -f2)
            local config_env=$(echo "$env_data" | grep "CONFIG_ENV:" | cut -d':' -f2)
            
            if [ "$runtime_env" = "production" ] || [ "$config_env" = "production" ]; then
                print_banner "${RED}" "🚨 PRODUCTION ENVIRONMENT" "Handle with extreme caution!"
            elif [ "$runtime_env" = "development" ]; then
                print_banner "${BLUE}" "🛠️  DEVELOPMENT ENVIRONMENT" "Safe for testing and development"
            else
                print_banner "${YELLOW}" "❓ UNKNOWN ENVIRONMENT" "Verify configuration"
            fi
            ;;
            
        "validate")
            # Validation only
            local env_data=$(detect_environment)
            validate_environment_consistency "$env_data"
            ;;
            
        "help")
            echo "Environment Check Usage:"
            echo "  ./environment-check.sh [command]"
            echo ""
            echo "Commands:"
            echo "  check      Full environment analysis (default)"
            echo "  banner     Show environment banner only"
            echo "  validate   Validation check only" 
            echo "  help       Show this help"
            ;;
            
        *)
            echo "Unknown command: $command"
            echo "Use './environment-check.sh help' for usage information"
            exit 1
            ;;
    esac
}

# Execute main function
main "$@"