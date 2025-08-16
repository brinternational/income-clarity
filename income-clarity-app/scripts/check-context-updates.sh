#!/bin/bash

# Context Update Checker - Makes sure agents are updating CLAUDE.md files

echo "========================================="
echo "  CLAUDE.md Context Update Checker"
echo "========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for recently updated CLAUDE.md files (within last 24 hours)
echo "📅 Recently Updated Contexts (Last 24 hours):"
echo "---------------------------------------------"
find . -name "CLAUDE.md" -type f -mtime -1 2>/dev/null | while read file; do
    timestamp=$(date -r "$file" "+%Y-%m-%d %H:%M")
    echo -e "${GREEN}✅ $file${NC} - Updated: $timestamp"
done

echo ""

# Check for stale CLAUDE.md files (not updated in 3+ days)
echo "⚠️  Stale Contexts (Not updated in 3+ days):"
echo "---------------------------------------------"
find . -name "CLAUDE.md" -type f -mtime +3 2>/dev/null | while read file; do
    timestamp=$(date -r "$file" "+%Y-%m-%d")
    echo -e "${YELLOW}⚠️  $file${NC} - Last updated: $timestamp"
done

echo ""

# Check for folders that should have CLAUDE.md but don't
echo "❌ Missing Context Files (Important folders without CLAUDE.md):"
echo "---------------------------------------------"
important_dirs=(
    "components/super-cards"
    "components/income"
    "components/charts"
    "components/dashboard"
    "app/api/super-cards"
    "lib/services"
    "hooks"
    "contexts"
)

for dir in "${important_dirs[@]}"; do
    if [ -d "$dir" ] && [ ! -f "$dir/CLAUDE.md" ]; then
        echo -e "${RED}❌ $dir/CLAUDE.md${NC} - Missing!"
    fi
done

echo ""

# Summary
echo "========================================="
echo "  Summary"
echo "========================================="
updated_count=$(find . -name "CLAUDE.md" -type f -mtime -1 2>/dev/null | wc -l)
stale_count=$(find . -name "CLAUDE.md" -type f -mtime +3 2>/dev/null | wc -l)
total_count=$(find . -name "CLAUDE.md" -type f 2>/dev/null | wc -l)

echo "📊 Total CLAUDE.md files: $total_count"
echo -e "${GREEN}✅ Updated (24h): $updated_count${NC}"
echo -e "${YELLOW}⚠️  Stale (3+ days): $stale_count${NC}"

echo ""

# Enforcement reminder
if [ $stale_count -gt 0 ]; then
    echo "🚨 ACTION NEEDED:"
    echo "   Some context files are stale!"
    echo "   Next agent working in those folders should update them."
else
    echo "✨ Great job! All context files are up to date!"
fi

echo ""
echo "💡 TIP: Agents should ALWAYS update CLAUDE.md after working in a folder"
echo "========================================="