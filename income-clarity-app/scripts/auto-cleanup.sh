#!/bin/bash
# Automatic Cleanup Script  
# Purpose: Remove temporary files and processes before commits
# Usage: bash scripts/auto-cleanup.sh
# Lifecycle: Permanent utility script

echo "🧹 Income Clarity - Automatic Cleanup"
echo "===================================="

# Color functions
print_success() { echo -e "\033[32m✅ $1\033[0m"; }
print_warning() { echo -e "\033[33m⚠️  $1\033[0m"; }
print_info() { echo -e "\033[34m🔍 $1\033[0m"; }

cleanup_count=0

# 1. Remove temporary files from project root
print_info "Cleaning temporary files from project root..."
temp_files=$(find /public/MasterV2 -maxdepth 1 \( -name "test-*.js" -o -name "debug-*.js" -o -name "*.tmp" -o -name "*-snippet-*.json" -o -name "*-batch-*.txt" \) 2>/dev/null | wc -l)

if [ "$temp_files" -gt 0 ]; then
  find /public/MasterV2 -maxdepth 1 \( -name "test-*.js" -o -name "debug-*.js" -o -name "*.tmp" -o -name "*-snippet-*.json" -o -name "*-batch-*.txt" \) -delete 2>/dev/null
  print_success "Removed $temp_files temporary files from root"
  ((cleanup_count += temp_files))
else
  print_success "No temporary files in root"
fi

# 2. Remove temporary reports
print_info "Cleaning temporary reports..."
report_files=$(find /public/MasterV2 -maxdepth 1 -name "*-report-*.md" 2>/dev/null | wc -l)

if [ "$report_files" -gt 0 ]; then
  find /public/MasterV2 -maxdepth 1 -name "*-report-*.md" -delete 2>/dev/null
  print_success "Removed $report_files temporary reports"
  ((cleanup_count += report_files))
else
  print_success "No temporary reports found"
fi

# 3. Clean up scripts/temp directory
print_info "Cleaning scripts/temp directory..."
if [ -d "scripts/temp" ]; then
  temp_count=$(find scripts/temp -type f 2>/dev/null | wc -l)
  if [ "$temp_count" -gt 0 ]; then
    rm -f scripts/temp/*
    print_success "Removed $temp_count files from scripts/temp"
    ((cleanup_count += temp_count))
  else
    print_success "scripts/temp is already clean"
  fi
else
  print_info "scripts/temp directory doesn't exist (OK)"
fi

# 4. Clean up scripts/debug directory
print_info "Cleaning scripts/debug directory..."
if [ -d "scripts/debug" ]; then
  debug_count=$(find scripts/debug -type f 2>/dev/null | wc -l)
  if [ "$debug_count" -gt 0 ]; then
    rm -f scripts/debug/*
    print_success "Removed $debug_count files from scripts/debug"
    ((cleanup_count += debug_count))
  else
    print_success "scripts/debug is already clean"
  fi
else
  print_info "scripts/debug directory doesn't exist (OK)"
fi

# 5. Kill leftover browser processes
print_info "Cleaning up browser processes..."
browser_count=0

if pgrep -f "chrome.*--headless" >/dev/null 2>&1; then
  pkill -f "chrome.*--headless" 2>/dev/null || true
  ((browser_count++))
fi

if pgrep -f "chromium.*--headless" >/dev/null 2>&1; then
  pkill -f "chromium.*--headless" 2>/dev/null || true
  ((browser_count++))
fi

if pgrep -f "playwright" >/dev/null 2>&1; then
  pkill -f "playwright" 2>/dev/null || true
  ((browser_count++))
fi

if [ "$browser_count" -gt 0 ]; then
  print_success "Killed $browser_count browser processes"
else
  print_success "No leftover browser processes"
fi

# 6. Summary
echo ""
echo "🎯 Cleanup Summary:"
echo "=================="
if [ "$cleanup_count" -gt 0 ]; then
  print_success "Cleaned up $cleanup_count temporary files"
else
  print_success "Environment was already clean"
fi

if [ "$browser_count" -gt 0 ]; then
  print_success "Killed $browser_count browser processes"
fi

print_success "✨ Cleanup complete - Ready for development/commit"
echo ""