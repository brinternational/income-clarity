#!/bin/bash

# META Context Health Check - Ensures all context systems are working
# Run this periodically to verify META has everything it needs

echo "========================================="
echo "  🧠 META CONTEXT HEALTH CHECK"
echo "========================================="
echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
WARNINGS=0
FAILURES=0

# Function to check file exists and is recent
check_file() {
    local file=$1
    local description=$2
    local max_age_days=${3:-7}  # Default 7 days
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    
    if [ -f "$file" ]; then
        # Get file age in days
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            file_age=$(( ($(date +%s) - $(stat -f %m "$file")) / 86400 ))
        else
            # Linux
            file_age=$(( ($(date +%s) - $(stat -c %Y "$file")) / 86400 ))
        fi
        
        if [ $file_age -lt $max_age_days ]; then
            echo -e "${GREEN}✅ $description${NC}"
            echo "   Path: $file"
            echo "   Age: $file_age days"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            echo -e "${YELLOW}⚠️  $description${NC} (Stale: $file_age days old)"
            echo "   Path: $file"
            WARNINGS=$((WARNINGS + 1))
        fi
    else
        echo -e "${RED}❌ $description${NC} (MISSING!)"
        echo "   Expected at: $file"
        FAILURES=$((FAILURES + 1))
    fi
    echo ""
}

# Function to count files matching pattern
count_files() {
    local pattern=$1
    local description=$2
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    count=$(find . -name "$pattern" -type f 2>/dev/null | wc -l)
    
    if [ $count -gt 0 ]; then
        echo -e "${GREEN}✅ $description: $count found${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ $description: NONE found${NC}"
        FAILURES=$((FAILURES + 1))
    fi
}

echo "📁 CORE META FILES"
echo "---------------------------------------------"
check_file "/home/devuser/.claude/CLAUDE.md" "Global META CLAUDE.md" 30
check_file "/public/MasterV2/income-clarity/income-clarity-app/META_ORCHESTRATOR_COMPLETE_WORKFLOW.md" "Complete Workflow Documentation" 7
check_file "/public/MasterV2/income-clarity/MASTER_TODO_FINAL.md" "Master TODO List" 1
check_file "/public/MasterV2/income-clarity/SUPER_CARDS_BLUEPRINT.md" "Architecture Blueprint" 7

echo "📋 TRACKING FILES"
echo "---------------------------------------------"
check_file "/public/MasterV2/income-clarity/income-clarity-app/COMPLETED_FEATURES.md" "Completed Features List" 3
check_file "/public/MasterV2/income-clarity/income-clarity-app/META_VERIFICATION_LOG.md" "Verification Log" 1
check_file "/public/MasterV2/AGENT_MEMORY/daily/$(date +%Y-%m-%d).md" "Today's Memory File" 0

echo "🗂️ FOLDER CONTEXT FILES"
echo "---------------------------------------------"
count_files "CLAUDE.md" "Local CLAUDE.md files"

# Check recently updated contexts
echo ""
echo "📅 RECENTLY UPDATED CONTEXTS (Last 24 hours)"
echo "---------------------------------------------"
recent_count=$(find . -name "CLAUDE.md" -type f -mtime -1 2>/dev/null | wc -l)
if [ $recent_count -gt 0 ]; then
    echo -e "${GREEN}✅ $recent_count contexts updated in last 24 hours${NC}"
    find . -name "CLAUDE.md" -type f -mtime -1 2>/dev/null | head -5 | while read file; do
        echo "   - $file"
    done
else
    echo -e "${YELLOW}⚠️  No contexts updated in last 24 hours${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "🔍 CONTEXT SYSTEM INTEGRITY"
echo "---------------------------------------------"

# Check if app is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ App is running on port 3000${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}⚠️  App not running on port 3000${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

# Check TypeScript compilation
echo -n "Checking TypeScript compilation... "
if npm run type-check > /dev/null 2>&1; then
    echo -e "${GREEN}✅ TypeScript OK${NC}"
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
else
    echo -e "${YELLOW}⚠️  TypeScript has errors${NC}"
    WARNINGS=$((WARNINGS + 1))
fi
TOTAL_CHECKS=$((TOTAL_CHECKS + 1))

echo ""
echo "========================================="
echo "  📊 HEALTH CHECK SUMMARY"
echo "========================================="
echo -e "${BLUE}Total Checks:${NC} $TOTAL_CHECKS"
echo -e "${GREEN}Passed:${NC} $PASSED_CHECKS"
echo -e "${YELLOW}Warnings:${NC} $WARNINGS"
echo -e "${RED}Failures:${NC} $FAILURES"
echo ""

# Overall health status
if [ $FAILURES -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}🎉 PERFECT HEALTH - All systems operational!${NC}"
        exit 0
    else
        echo -e "${YELLOW}⚠️  GOOD HEALTH - Some minor issues to address${NC}"
        exit 0
    fi
else
    echo -e "${RED}❌ POOR HEALTH - Critical issues detected!${NC}"
    echo ""
    echo "RECOMMENDED ACTIONS:"
    echo "1. Check missing files and recreate if needed"
    echo "2. Update stale context files"
    echo "3. Ensure app is running properly"
    exit 1
fi