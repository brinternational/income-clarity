#!/bin/bash

# ============================================================================
# DEPLOYMENT GUARD SYSTEM
# Critical: Pre-deployment validation and confirmation system
# Prevents accidental wrong-environment deployments
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

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_CHECK_SCRIPT="$SCRIPT_DIR/environment-check.sh"

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

# Confirmation function with timeout
confirm_action() {
    local prompt="$1"
    local confirmation_text="$2"
    local timeout_seconds="${3:-30}"
    
    echo -e "${YELLOW}$prompt${NC}"
    echo -e "${WHITE}Type exactly: ${RED}$confirmation_text${WHITE} to continue${NC}"
    echo -e "${CYAN}(Timeout in ${timeout_seconds} seconds)${NC}"
    echo -n "> "
    
    if read -t $timeout_seconds -r user_input; then
        if [ "$user_input" = "$confirmation_text" ]; then
            echo -e "${GREEN}✅ Confirmation accepted${NC}"
            return 0
        else
            echo -e "${RED}❌ Confirmation text mismatch. Operation cancelled.${NC}"
            return 1
        fi
    else
        echo -e "${RED}❌ Timeout exceeded. Operation cancelled for safety.${NC}"
        return 1
    fi
}

# Pre-deployment checks
pre_deployment_checks() {
    local target_env="$1"
    
    echo -e "${BLUE}🔍 Pre-deployment Safety Checks:${NC}"
    echo "────────────────────────────────────────────────────────────────────"
    
    # Run environment check
    if [ -x "$ENV_CHECK_SCRIPT" ]; then
        echo "Running environment validation..."
        if ! "$ENV_CHECK_SCRIPT" validate; then
            echo -e "${RED}❌ Environment validation failed! Deployment blocked.${NC}"
            return 1
        fi
    else
        echo -e "${YELLOW}⚠️  Environment check script not found or not executable${NC}"
    fi
    
    # Check for uncommitted changes
    if git status --porcelain | grep -q .; then
        echo -e "${YELLOW}⚠️  WARNING: Uncommitted changes detected${NC}"
        git status --short
        echo ""
        if ! confirm_action "Deploy with uncommitted changes?" "DEPLOY WITH CHANGES" 10; then
            return 1
        fi
    else
        echo -e "${GREEN}✅ No uncommitted changes${NC}"
    fi
    
    # Check current branch
    local current_branch=$(git branch --show-current)
    echo -e "Current branch: ${CYAN}$current_branch${NC}"
    
    if [ "$target_env" = "production" ] && [ "$current_branch" != "master" ] && [ "$current_branch" != "main" ]; then
        echo -e "${RED}⚠️  WARNING: Deploying to production from non-main branch!${NC}"
        if ! confirm_action "Continue deployment from branch '$current_branch'?" "DEPLOY FROM BRANCH" 15; then
            return 1
        fi
    fi
    
    echo "────────────────────────────────────────────────────────────────────"
    return 0
}

# Production deployment guard
production_deployment_guard() {
    print_banner "${RED}" "🚨 PRODUCTION DEPLOYMENT WARNING" "You are about to deploy to PRODUCTION environment"
    
    echo -e "${WHITE}Target Environment: ${RED}PRODUCTION${NC}"
    echo -e "${WHITE}Deployment Impact: ${RED}AFFECTS LIVE USERS${NC}"
    echo -e "${WHITE}Risk Level: ${RED}HIGH${NC}"
    echo ""
    
    # Show current environment status
    if [ -x "$ENV_CHECK_SCRIPT" ]; then
        "$ENV_CHECK_SCRIPT" banner
        echo ""
    fi
    
    # Pre-deployment checks
    if ! pre_deployment_checks "production"; then
        echo -e "${RED}❌ Pre-deployment checks failed. Deployment aborted.${NC}"
        return 1
    fi
    
    echo ""
    echo -e "${WHITE}Final confirmation required for production deployment.${NC}"
    echo -e "${RED}This action will affect the live production system!${NC}"
    echo ""
    
    if confirm_action "Proceed with PRODUCTION deployment?" "DEPLOY TO PRODUCTION" 30; then
        echo -e "${GREEN}✅ Production deployment confirmed${NC}"
        return 0
    else
        echo -e "${RED}❌ Production deployment cancelled${NC}"
        return 1
    fi
}

# Development deployment guard
development_deployment_guard() {
    print_banner "${BLUE}" "🛠️  DEVELOPMENT DEPLOYMENT" "Development environment deployment"
    
    echo -e "${WHITE}Target Environment: ${BLUE}DEVELOPMENT${NC}"
    echo -e "${WHITE}Risk Level: ${GREEN}LOW${NC}"
    echo ""
    
    # Pre-deployment checks
    if ! pre_deployment_checks "development"; then
        echo -e "${RED}❌ Pre-deployment checks failed. Deployment aborted.${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Development deployment ready${NC}"
    return 0
}

# Server restart guard
server_restart_guard() {
    local action="$1"
    local target_env="${2:-unknown}"
    
    print_banner "${YELLOW}" "🔄 SERVER $action GUARD" "Confirming server operation"
    
    echo -e "${WHITE}Action: ${YELLOW}$action${NC}"
    echo -e "${WHITE}Environment: ${CYAN}$target_env${NC}"
    
    # Show current server status
    echo ""
    echo -e "${BLUE}📊 Current Server Status:${NC}"
    echo "────────────────────────────────────────────────────────────────────"
    
    if lsof -ti:3000 > /dev/null 2>&1; then
        local pid=$(lsof -ti:3000)
        local cmd=$(ps -p $pid -o cmd= 2>/dev/null || echo "unknown")
        echo -e "${GREEN}✅ Server currently running${NC}"
        echo "   PID: $pid"
        echo "   Command: $cmd"
    else
        echo -e "${RED}❌ No server currently running on port 3000${NC}"
    fi
    
    echo "────────────────────────────────────────────────────────────────────"
    
    case "$action" in
        "RESTART")
            if [ "$target_env" = "production" ]; then
                echo -e "${RED}⚠️  WARNING: Restarting production server will cause brief downtime!${NC}"
                confirm_action "Proceed with production server restart?" "RESTART PRODUCTION" 15
            else
                echo -e "${GREEN}✅ Development server restart confirmed${NC}"
                return 0
            fi
            ;;
        "STOP")
            if [ "$target_env" = "production" ]; then
                echo -e "${RED}🚨 CRITICAL: Stopping production server will cause COMPLETE DOWNTIME!${NC}"
                confirm_action "Proceed with production server shutdown?" "STOP PRODUCTION" 20
            else
                echo -e "${YELLOW}Server stop confirmed${NC}"
                return 0
            fi
            ;;
        "START")
            echo -e "${GREEN}✅ Server start confirmed${NC}"
            return 0
            ;;
        *)
            echo -e "${YELLOW}Server operation '$action' confirmed${NC}"
            return 0
            ;;
    esac
}

# Environment mismatch detector
check_environment_mismatch() {
    if [ -x "$ENV_CHECK_SCRIPT" ]; then
        if ! "$ENV_CHECK_SCRIPT" validate > /dev/null 2>&1; then
            print_banner "${RED}" "🚨 ENVIRONMENT MISMATCH DETECTED" "Configuration inconsistency found!"
            
            "$ENV_CHECK_SCRIPT" check
            
            echo ""
            echo -e "${RED}❌ DEPLOYMENT BLOCKED: Fix environment configuration first!${NC}"
            echo -e "${WHITE}Recommended actions:${NC}"
            echo -e "  1. Run: ${CYAN}./scripts/environment-check.sh${NC}"
            echo -e "  2. Fix environment variable mismatches"
            echo -e "  3. Ensure runtime and config environments match"
            echo -e "  4. Re-run this deployment guard"
            
            return 1
        fi
    fi
    
    return 0
}

# Main deployment guard function
main() {
    local command="${1:-help}"
    local target_env="${2:-unknown}"
    
    case "$command" in
        "production"|"prod")
            if ! check_environment_mismatch; then
                exit 1
            fi
            production_deployment_guard
            ;;
            
        "development"|"dev")
            if ! check_environment_mismatch; then
                exit 1
            fi
            development_deployment_guard
            ;;
            
        "server")
            local action="${2:-UNKNOWN}"
            local env="${3:-$(node -pe 'process.env.NODE_ENV || "unknown"' 2>/dev/null || echo "unknown")}"
            server_restart_guard "$action" "$env"
            ;;
            
        "check")
            check_environment_mismatch
            ;;
            
        "help"|*)
            echo "Deployment Guard Usage:"
            echo "  ./deployment-guard.sh [command] [options]"
            echo ""
            echo "Commands:"
            echo "  production          Production deployment guard"
            echo "  development         Development deployment guard"
            echo "  server [action] [env]  Server operation guard (START/STOP/RESTART)"
            echo "  check               Check for environment mismatches"
            echo "  help                Show this help"
            echo ""
            echo "Examples:"
            echo "  ./deployment-guard.sh production"
            echo "  ./deployment-guard.sh server RESTART production"
            echo "  ./deployment-guard.sh check"
            ;;
    esac
}

# Execute main function
main "$@"