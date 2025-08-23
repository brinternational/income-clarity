#!/bin/bash

# Visual Diff Testing System
# Compares UI screenshots and generates detailed visual difference reports
# Usage: ./scripts/visual-diff-test.sh [baseline-dir] [current-dir] [output-dir]

set -e

# Configuration
BASELINE_DIR=${1:-"test-results/ui-baseline"}
CURRENT_DIR=${2:-"test-results/ui-current"}
OUTPUT_DIR=${3:-"test-results/ui-diff"}
TEMP_DIR="scripts/temp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_header() { echo -e "${PURPLE}🎯 $1${NC}"; }

# Create necessary directories
mkdir -p "$OUTPUT_DIR" "$TEMP_DIR"

# Initialize report files
REPORT_FILE="$OUTPUT_DIR/visual-diff-report.md"
JSON_REPORT="$OUTPUT_DIR/visual-diff-report.json"
SUMMARY_FILE="$OUTPUT_DIR/diff-summary.txt"

# Check if directories exist
if [ ! -d "$BASELINE_DIR" ]; then
    log_error "Baseline directory not found: $BASELINE_DIR"
    log_info "Run: ./scripts/ui-change-verifier.sh capture-baseline"
    exit 1
fi

if [ ! -d "$CURRENT_DIR" ]; then
    log_error "Current directory not found: $CURRENT_DIR"
    log_info "Run: ./scripts/ui-change-verifier.sh capture-current"
    exit 1
fi

log_header "VISUAL DIFF ANALYSIS"
log_info "Baseline: $BASELINE_DIR"
log_info "Current: $CURRENT_DIR"
log_info "Output: $OUTPUT_DIR"

# Initialize reports
echo "# Visual Diff Report" > "$REPORT_FILE"
echo "Generated: $(date)" >> "$REPORT_FILE"
echo "Baseline: $BASELINE_DIR" >> "$REPORT_FILE"
echo "Current: $CURRENT_DIR" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# JSON report initialization
echo "{
    \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
    \"baseline\": \"$BASELINE_DIR\",
    \"current\": \"$CURRENT_DIR\",
    \"output\": \"$OUTPUT_DIR\",
    \"results\": [" > "$JSON_REPORT"

# Statistics tracking
total_files=0
changed_files=0
significant_changes=0
first_json_entry=true

# Process each baseline file
for baseline_file in "$BASELINE_DIR"/*.png; do
    if [ ! -f "$baseline_file" ]; then
        continue
    fi
    
    filename=$(basename "$baseline_file")
    current_file="$CURRENT_DIR/${filename/baseline/current}"
    
    total_files=$((total_files + 1))
    
    log_info "Analyzing: $filename"
    
    if [ ! -f "$current_file" ]; then
        log_warning "Missing current file: $filename"
        
        echo "## ❌ $filename" >> "$REPORT_FILE"
        echo "**Status**: Missing current screenshot" >> "$REPORT_FILE"
        echo "**Issue**: Current screenshot not found" >> "$REPORT_FILE"
        echo "" >> "$REPORT_FILE"
        
        # Add to JSON
        if [ "$first_json_entry" = false ]; then
            echo "," >> "$JSON_REPORT"
        fi
        echo "        {
            \"file\": \"$filename\",
            \"status\": \"missing\",
            \"baseline_exists\": true,
            \"current_exists\": false,
            \"change_detected\": false,
            \"error\": \"Current screenshot missing\"
        }" >> "$JSON_REPORT"
        first_json_entry=false
        
        continue
    fi
    
    # Get file sizes
    baseline_size=$(stat -c%s "$baseline_file" 2>/dev/null || echo "0")
    current_size=$(stat -c%s "$current_file" 2>/dev/null || echo "0")
    
    # Calculate size difference
    size_diff=$((current_size - baseline_size))
    size_percent=0
    if [ "$baseline_size" -gt 0 ]; then
        size_percent=$(( (size_diff * 100) / baseline_size ))
    fi
    
    # Determine change significance
    change_detected=false
    change_level="none"
    
    if [ "${size_percent#-}" -gt 10 ]; then
        change_detected=true
        change_level="major"
        significant_changes=$((significant_changes + 1))
    elif [ "${size_percent#-}" -gt 5 ]; then
        change_detected=true
        change_level="moderate"
        changed_files=$((changed_files + 1))
    elif [ "${size_percent#-}" -gt 1 ]; then
        change_detected=true
        change_level="minor"
        changed_files=$((changed_files + 1))
    fi
    
    # Generate pixel-level comparison (if ImageMagick available)
    diff_image="$OUTPUT_DIR/${filename/baseline/diff}"
    pixel_diff_available=false
    
    if command -v compare >/dev/null 2>&1; then
        log_info "Generating pixel diff for $filename"
        
        # Create visual diff using ImageMagick
        if compare "$baseline_file" "$current_file" -highlight-color red "$diff_image" 2>/dev/null; then
            pixel_diff_available=true
            log_success "Pixel diff created: $(basename "$diff_image")"
        else
            log_warning "Pixel diff failed for $filename"
        fi
    fi
    
    # Get image dimensions (if available)
    baseline_dims="unknown"
    current_dims="unknown"
    
    if command -v identify >/dev/null 2>&1; then
        baseline_dims=$(identify -format "%wx%h" "$baseline_file" 2>/dev/null || echo "unknown")
        current_dims=$(identify -format "%wx%h" "$current_file" 2>/dev/null || echo "unknown")
    fi
    
    # Report generation
    case $change_level in
        "major")
            echo "## 🔴 $filename - MAJOR CHANGE" >> "$REPORT_FILE"
            log_warning "MAJOR change detected in $filename ($size_percent%)"
            ;;
        "moderate")
            echo "## 🟡 $filename - MODERATE CHANGE" >> "$REPORT_FILE"
            log_info "Moderate change detected in $filename ($size_percent%)"
            ;;
        "minor")
            echo "## 🟠 $filename - MINOR CHANGE" >> "$REPORT_FILE"
            log_info "Minor change detected in $filename ($size_percent%)"
            ;;
        *)
            echo "## 🟢 $filename - NO SIGNIFICANT CHANGE" >> "$REPORT_FILE"
            log_success "No significant change in $filename"
            ;;
    esac
    
    echo "**Change Level**: $change_level" >> "$REPORT_FILE"
    echo "**Baseline Size**: $baseline_size bytes ($baseline_dims)" >> "$REPORT_FILE"
    echo "**Current Size**: $current_size bytes ($current_dims)" >> "$REPORT_FILE"
    echo "**Size Difference**: $size_diff bytes ($size_percent%)" >> "$REPORT_FILE"
    
    if [ "$pixel_diff_available" = true ]; then
        echo "**Visual Diff**: ![Diff]($(basename "$diff_image"))" >> "$REPORT_FILE"
    fi
    
    echo "" >> "$REPORT_FILE"
    
    # Add to JSON report
    if [ "$first_json_entry" = false ]; then
        echo "," >> "$JSON_REPORT"
    fi
    
    echo "        {
            \"file\": \"$filename\",
            \"status\": \"compared\",
            \"baseline_exists\": true,
            \"current_exists\": true,
            \"change_detected\": $change_detected,
            \"change_level\": \"$change_level\",
            \"baseline_size\": $baseline_size,
            \"current_size\": $current_size,
            \"size_difference\": $size_diff,
            \"size_percentage\": $size_percent,
            \"baseline_dimensions\": \"$baseline_dims\",
            \"current_dimensions\": \"$current_dims\",
            \"pixel_diff_available\": $pixel_diff_available" >> "$JSON_REPORT"
    
    if [ "$pixel_diff_available" = true ]; then
        echo ",
            \"diff_image\": \"$(basename "$diff_image")\"" >> "$JSON_REPORT"
    fi
    
    echo "        }" >> "$JSON_REPORT"
    first_json_entry=false
done

# Close JSON report
echo "
    ],
    \"summary\": {
        \"total_files\": $total_files,
        \"changed_files\": $changed_files,
        \"significant_changes\": $significant_changes,
        \"analysis_complete\": true
    }
}" >> "$JSON_REPORT"

# Generate summary
echo "## 📊 Analysis Summary" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"
echo "- **Total Files Analyzed**: $total_files" >> "$REPORT_FILE"
echo "- **Files with Changes**: $changed_files" >> "$REPORT_FILE"
echo "- **Significant Changes**: $significant_changes" >> "$REPORT_FILE"
echo "" >> "$REPORT_FILE"

# Determine overall result
overall_result="NO_CHANGES"
if [ $significant_changes -gt 0 ]; then
    overall_result="SIGNIFICANT_CHANGES"
    echo "## ✅ RESULT: SIGNIFICANT UI CHANGES DETECTED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "**Conclusion**: UI changes are visible and significant. Deployment successful!" >> "$REPORT_FILE"
    log_success "SIGNIFICANT UI CHANGES DETECTED - Deployment verification PASSED"
elif [ $changed_files -gt 0 ]; then
    overall_result="MINOR_CHANGES"
    echo "## 🟡 RESULT: MINOR UI CHANGES DETECTED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "**Conclusion**: Some UI changes detected but not significant. Review changes manually." >> "$REPORT_FILE"
    log_warning "Minor UI changes detected - Manual review recommended"
else
    echo "## ⚠️  RESULT: NO SIGNIFICANT UI CHANGES DETECTED" >> "$REPORT_FILE"
    echo "" >> "$REPORT_FILE"
    echo "**Conclusion**: No significant UI changes found. Check for caching issues or deployment problems." >> "$REPORT_FILE"
    log_warning "NO SIGNIFICANT CHANGES - Check deployment and caching"
fi

echo "" >> "$REPORT_FILE"
echo "**Analysis completed**: $(date)" >> "$REPORT_FILE"

# Create summary file
echo "Visual Diff Analysis Summary" > "$SUMMARY_FILE"
echo "============================" >> "$SUMMARY_FILE"
echo "Timestamp: $(date)" >> "$SUMMARY_FILE"
echo "Total Files: $total_files" >> "$SUMMARY_FILE"
echo "Changed Files: $changed_files" >> "$SUMMARY_FILE"
echo "Significant Changes: $significant_changes" >> "$SUMMARY_FILE"
echo "Overall Result: $overall_result" >> "$SUMMARY_FILE"

# Final output
log_header "VISUAL DIFF ANALYSIS COMPLETE"
echo ""
log_info "📊 Analysis Results:"
log_info "   Total Files: $total_files"
log_info "   Changed Files: $changed_files"
log_info "   Significant Changes: $significant_changes"
echo ""
log_success "📄 Reports Generated:"
log_success "   Markdown: $REPORT_FILE"
log_success "   JSON: $JSON_REPORT"
log_success "   Summary: $SUMMARY_FILE"
echo ""

if [ $significant_changes -gt 0 ]; then
    log_success "🎉 UI CHANGES SUCCESSFULLY VERIFIED!"
    exit 0
elif [ $changed_files -gt 0 ]; then
    log_warning "📝 Minor changes detected - manual review recommended"
    exit 0
else
    log_warning "🔍 No significant changes detected - investigate deployment/caching"
    exit 1
fi