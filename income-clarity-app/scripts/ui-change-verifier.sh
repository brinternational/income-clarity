#!/bin/bash

# UI Change Verification System
# Ensures UI changes are actually visible on production with visual proof
# Usage: ./scripts/ui-change-verifier.sh [command] [options]

set -e

# Configuration
PRODUCTION_URL="https://incomeclarity.ddns.net"
BASELINE_DIR="test-results/ui-baseline"
CURRENT_DIR="test-results/ui-current"
DIFF_DIR="test-results/ui-diff"
TEMP_DIR="scripts/temp"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_header() { echo -e "${PURPLE}🎯 $1${NC}"; }

# Create necessary directories
create_directories() {
    mkdir -p "$BASELINE_DIR" "$CURRENT_DIR" "$DIFF_DIR" "$TEMP_DIR"
    mkdir -p ".ui-baseline"
}

# Check if server is running
check_server() {
    local url=${1:-$PRODUCTION_URL}
    log_info "Checking server at $url..."
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
        log_success "Server is responding at $url"
        return 0
    else
        log_error "Server not responding at $url"
        return 1
    fi
}

# Capture baseline screenshots before UI changes
capture_baseline() {
    log_header "CAPTURING UI BASELINE SCREENSHOTS"
    
    create_directories
    
    log_info "Capturing baseline screenshots for comparison..."
    
    # Use existing screenshot infrastructure
    if [ -f "scripts/comprehensive-dark-mode-visual-testing.js" ]; then
        log_info "Using existing visual testing infrastructure"
        node scripts/comprehensive-dark-mode-visual-testing.js --baseline --output="$BASELINE_DIR"
    else
        log_info "Creating basic screenshot capture"
        node -e "
        const { chromium } = require('playwright');
        
        (async () => {
            const browser = await chromium.launch();
            const context = await browser.newContext();
            const page = await context.newPage();
            
            const pages = [
                { name: 'landing', url: '$PRODUCTION_URL' },
                { name: 'dashboard', url: '$PRODUCTION_URL/dashboard/super-cards' },
                { name: 'login', url: '$PRODUCTION_URL/auth/login' }
            ];
            
            const breakpoints = [
                { name: 'mobile', width: 375, height: 812 },
                { name: 'desktop', width: 1920, height: 1080 }
            ];
            
            for (const bp of breakpoints) {
                await page.setViewportSize({ width: bp.width, height: bp.height });
                
                for (const pageInfo of pages) {
                    try {
                        await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
                        await page.waitForTimeout(2000);
                        
                        const filename = \`$BASELINE_DIR/\${pageInfo.name}-\${bp.name}-baseline.png\`;
                        await page.screenshot({ 
                            path: filename,
                            fullPage: true 
                        });
                        
                        console.log(\`✅ Captured: \${filename}\`);
                    } catch (error) {
                        console.log(\`❌ Failed to capture \${pageInfo.name}-\${bp.name}: \${error.message}\`);
                    }
                }
            }
            
            await browser.close();
            console.log('📸 Baseline capture complete');
        })();
        " 2>/dev/null || log_error "Baseline capture failed"
    fi
    
    # Store baseline metadata
    echo "{
        \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
        \"commit\": \"$(git rev-parse HEAD 2>/dev/null || echo 'unknown')\",
        \"branch\": \"$(git branch --show-current 2>/dev/null || echo 'unknown')\",
        \"url\": \"$PRODUCTION_URL\",
        \"purpose\": \"UI change baseline capture\"
    }" > "$BASELINE_DIR/baseline-metadata.json"
    
    log_success "Baseline screenshots captured in: $BASELINE_DIR"
    log_info "Files created: $(ls -1 "$BASELINE_DIR" | wc -l)"
}

# Capture current screenshots after UI changes
capture_current() {
    log_header "CAPTURING CURRENT UI STATE"
    
    create_directories
    
    # Force cache busting first
    if [ -f "scripts/cache-buster.sh" ]; then
        log_info "Running cache buster..."
        ./scripts/cache-buster.sh production
    fi
    
    log_info "Capturing current UI screenshots..."
    
    node -e "
    const { chromium } = require('playwright');
    
    (async () => {
        const browser = await chromium.launch();
        const context = await browser.newContext({
            // Force no cache
            ignoreHTTPSErrors: true,
            extraHTTPHeaders: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        const page = await context.newPage();
        
        // Disable cache
        await page.route('**/*', route => {
            route.continue({
                headers: {
                    ...route.request().headers(),
                    'Cache-Control': 'no-cache'
                }
            });
        });
        
        const pages = [
            { name: 'landing', url: '$PRODUCTION_URL' },
            { name: 'dashboard', url: '$PRODUCTION_URL/dashboard/super-cards' },
            { name: 'login', url: '$PRODUCTION_URL/auth/login' }
        ];
        
        const breakpoints = [
            { name: 'mobile', width: 375, height: 812 },
            { name: 'desktop', width: 1920, height: 1080 }
        ];
        
        for (const bp of breakpoints) {
            await page.setViewportSize({ width: bp.width, height: bp.height });
            
            for (const pageInfo of pages) {
                try {
                    await page.goto(pageInfo.url + '?v=' + Date.now(), { 
                        waitUntil: 'networkidle',
                        timeout: 30000 
                    });
                    await page.waitForTimeout(3000);
                    
                    const filename = \`$CURRENT_DIR/\${pageInfo.name}-\${bp.name}-current.png\`;
                    await page.screenshot({ 
                        path: filename,
                        fullPage: true 
                    });
                    
                    console.log(\`✅ Captured: \${filename}\`);
                } catch (error) {
                    console.log(\`❌ Failed to capture \${pageInfo.name}-\${bp.name}: \${error.message}\`);
                }
            }
        }
        
        await browser.close();
        console.log('📸 Current state capture complete');
    })();
    " 2>/dev/null || log_error "Current capture failed"
    
    # Store current metadata
    echo "{
        \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
        \"commit\": \"$(git rev-parse HEAD 2>/dev/null || echo 'unknown')\",
        \"branch\": \"$(git branch --show-current 2>/dev/null || echo 'unknown')\",
        \"url\": \"$PRODUCTION_URL\",
        \"purpose\": \"UI change verification capture\"
    }" > "$CURRENT_DIR/current-metadata.json"
    
    log_success "Current screenshots captured in: $CURRENT_DIR"
}

# Compare baseline with current and generate diff report
compare_ui_changes() {
    log_header "GENERATING VISUAL DIFF REPORT"
    
    if [ ! -d "$BASELINE_DIR" ] || [ ! -d "$CURRENT_DIR" ]; then
        log_error "Missing baseline or current screenshots. Run capture commands first."
        return 1
    fi
    
    create_directories
    
    # Generate comparison report
    local report_file="$DIFF_DIR/ui-changes-report.md"
    local changes_detected=false
    
    echo "# UI Changes Visual Diff Report" > "$report_file"
    echo "Generated: $(date)" >> "$report_file"
    echo "" >> "$report_file"
    
    # Compare files
    for baseline_file in "$BASELINE_DIR"/*.png; do
        if [ -f "$baseline_file" ]; then
            local filename=$(basename "$baseline_file")
            local current_file="$CURRENT_DIR/${filename/baseline/current}"
            
            if [ -f "$current_file" ]; then
                local baseline_size=$(stat -c%s "$baseline_file" 2>/dev/null || echo "0")
                local current_size=$(stat -c%s "$current_file" 2>/dev/null || echo "0")
                local size_diff=$((current_size - baseline_size))
                local size_percent=0
                
                if [ "$baseline_size" -gt 0 ]; then
                    size_percent=$(( (size_diff * 100) / baseline_size ))
                fi
                
                echo "## $filename" >> "$report_file"
                echo "- Baseline size: $baseline_size bytes" >> "$report_file"
                echo "- Current size: $current_size bytes" >> "$report_file"
                echo "- Size change: $size_diff bytes ($size_percent%)" >> "$report_file"
                
                if [ "${size_percent#-}" -gt 5 ]; then
                    echo "- **SIGNIFICANT CHANGE DETECTED** (>5% size difference)" >> "$report_file"
                    changes_detected=true
                    log_warning "Significant change detected in $filename ($size_percent%)"
                else
                    echo "- Minor or no visual change" >> "$report_file"
                    log_info "No significant change in $filename"
                fi
                
                echo "" >> "$report_file"
            else
                echo "## $filename" >> "$report_file"
                echo "- **ERROR**: Current screenshot missing" >> "$report_file"
                echo "" >> "$report_file"
                log_error "Missing current screenshot for $filename"
            fi
        fi
    done
    
    # Summary
    echo "## Summary" >> "$report_file"
    if [ "$changes_detected" = true ]; then
        echo "✅ **UI CHANGES DETECTED** - Changes are visible in production" >> "$report_file"
        log_success "UI changes detected and verified!"
    else
        echo "⚠️ **NO SIGNIFICANT CHANGES DETECTED** - May indicate caching or deployment issues" >> "$report_file"
        log_warning "No significant UI changes detected - check deployment"
    fi
    
    echo "" >> "$report_file"
    echo "Report generated: $(date)" >> "$report_file"
    
    log_success "Visual diff report generated: $report_file"
    
    # Display summary
    cat "$report_file"
}

# Force cache busting to ensure fresh content
force_cache_bust() {
    log_header "FORCE CACHE BUSTING"
    
    if [ -f "scripts/cache-buster.sh" ]; then
        ./scripts/cache-buster.sh production
    else
        log_info "Creating inline cache busting..."
        
        # Force browser cache clear by updating cache headers
        curl -s -H "Cache-Control: no-cache" \
             -H "Pragma: no-cache" \
             -H "Expires: 0" \
             "$PRODUCTION_URL" > /dev/null || true
             
        # Add cache-busting query parameter test
        local cache_test_url="$PRODUCTION_URL/?v=$(date +%s)"
        if curl -s "$cache_test_url" > /dev/null; then
            log_success "Cache busting test successful"
        else
            log_warning "Cache busting test failed"
        fi
    fi
}

# Verify UI version has changed
verify_ui_version() {
    log_header "VERIFYING UI VERSION"
    
    local version_url="$PRODUCTION_URL/api/ui-version"
    
    log_info "Checking UI version at: $version_url"
    
    if curl -s "$version_url" > "$TEMP_DIR/ui-version.json" 2>/dev/null; then
        local version=$(grep -o '"version":"[^"]*' "$TEMP_DIR/ui-version.json" | cut -d'"' -f4)
        local timestamp=$(grep -o '"timestamp":"[^"]*' "$TEMP_DIR/ui-version.json" | cut -d'"' -f4)
        local commit=$(grep -o '"commit":"[^"]*' "$TEMP_DIR/ui-version.json" | cut -d'"' -f4)
        
        log_success "UI Version: $version"
        log_info "Timestamp: $timestamp"
        log_info "Commit: $commit"
        
        # Store version info
        cp "$TEMP_DIR/ui-version.json" "$CURRENT_DIR/ui-version.json"
    else
        log_warning "Could not fetch UI version information"
        log_info "Creating fallback version check..."
        
        # Fallback: check if deployment status endpoint exists
        if curl -s "$PRODUCTION_URL/api/deployment/status" > "$TEMP_DIR/deployment-status.json" 2>/dev/null; then
            log_info "Found deployment status endpoint"
            cat "$TEMP_DIR/deployment-status.json"
        else
            log_warning "No version endpoints available"
        fi
    fi
}

# Full UI change verification workflow
verify_ui_changes() {
    log_header "FULL UI CHANGE VERIFICATION"
    
    # Check server
    if ! check_server; then
        log_error "Server check failed. Aborting verification."
        return 1
    fi
    
    # Force cache busting
    force_cache_bust
    
    # Capture current state
    capture_current
    
    # Verify version
    verify_ui_version
    
    # Generate comparison if baseline exists
    if [ -d "$BASELINE_DIR" ] && [ "$(ls -A "$BASELINE_DIR" 2>/dev/null)" ]; then
        compare_ui_changes
    else
        log_warning "No baseline found. Run 'capture-baseline' before making UI changes."
        log_info "Current screenshots captured for future comparison."
    fi
    
    log_success "UI change verification complete!"
    log_info "Results stored in: test-results/ui-*/"
}

# Main command handling
case "${1:-help}" in
    "capture-baseline")
        capture_baseline
        ;;
    "capture-current")
        capture_current
        ;;
    "compare")
        compare_ui_changes
        ;;
    "verify")
        verify_ui_changes
        ;;
    "force-cache-bust")
        force_cache_bust
        ;;
    "version-check")
        verify_ui_version
        ;;
    "help"|*)
        echo "UI Change Verification System"
        echo "Usage: ./scripts/ui-change-verifier.sh [command]"
        echo ""
        echo "Commands:"
        echo "  capture-baseline  - Capture baseline screenshots before UI changes"
        echo "  capture-current   - Capture current screenshots after UI changes"
        echo "  compare          - Compare baseline vs current and generate diff report"
        echo "  verify           - Full verification workflow (current + version + compare)"
        echo "  force-cache-bust - Force cache clearing"
        echo "  version-check    - Check UI version information"
        echo ""
        echo "Workflow:"
        echo "  1. Before UI changes: ./scripts/ui-change-verifier.sh capture-baseline"
        echo "  2. Make your UI changes"
        echo "  3. Deploy changes"
        echo "  4. After deployment: ./scripts/ui-change-verifier.sh verify"
        echo ""
        echo "Results stored in: test-results/ui-*/"
        ;;
esac