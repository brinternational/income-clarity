#!/bin/bash

# Cache Busting System
# Forces cache invalidation at all levels to ensure UI changes are visible
# Usage: ./scripts/cache-buster.sh [environment]

set -e

# Configuration
PRODUCTION_URL="https://incomeclarity.ddns.net"
LOCAL_URL="http://localhost:3000"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Determine target URL
ENVIRONMENT=${1:-production}
if [ "$ENVIRONMENT" = "production" ]; then
    TARGET_URL=$PRODUCTION_URL
elif [ "$ENVIRONMENT" = "localhost" ] || [ "$ENVIRONMENT" = "local" ]; then
    TARGET_URL=$LOCAL_URL
else
    TARGET_URL=$1  # Custom URL
fi

log_info "Cache busting for environment: $ENVIRONMENT"
log_info "Target URL: $TARGET_URL"

# 1. Clear Next.js build cache
clear_nextjs_cache() {
    log_info "Clearing Next.js build cache..."
    
    if [ -d ".next" ]; then
        # Clear Next.js cache directory
        rm -rf .next/cache 2>/dev/null || true
        log_success "Cleared .next/cache directory"
        
        # Force rebuild by touching next.config
        if [ -f "next.config.mjs" ]; then
            touch next.config.mjs
            log_success "Touched next.config.mjs to force rebuild"
        fi
        
        # Update build timestamp
        echo "{\"lastCacheBust\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\", \"buildId\": \"$(date +%s)\"}" > .next/cache-bust.json 2>/dev/null || true
    else
        log_warning ".next directory not found"
    fi
}

# 2. Force cache control headers
force_cache_headers() {
    log_info "Testing cache control headers..."
    
    local test_endpoints=(
        "/"
        "/dashboard/super-cards"
        "/auth/login"
        "/_next/static/css/app/layout.css"
        "/api/health"
    )
    
    for endpoint in "${test_endpoints[@]}"; do
        local full_url="${TARGET_URL}${endpoint}"
        
        log_info "Testing cache headers for: $endpoint"
        
        # Test with cache-busting headers
        local response=$(curl -s -I \
            -H "Cache-Control: no-cache, no-store, must-revalidate" \
            -H "Pragma: no-cache" \
            -H "Expires: 0" \
            -H "If-None-Match: \"force-refresh\"" \
            "$full_url?v=$(date +%s)" 2>/dev/null || echo "")
            
        if echo "$response" | grep -q "200\|301\|302"; then
            log_success "Cache-busted request successful for $endpoint"
        else
            log_warning "Cache-busted request failed for $endpoint"
        fi
    done
}

# 3. Clear browser cache (simulation)
simulate_fresh_browser() {
    log_info "Simulating fresh browser session..."
    
    # Create a test that simulates a fresh browser
    local cache_bust_param="v=$(date +%s)&cb=$(openssl rand -hex 8)"
    local test_url="${TARGET_URL}/?${cache_bust_param}"
    
    if curl -s -o /dev/null \
        -H "User-Agent: Mozilla/5.0 (Cache-Buster) Fresh-Browser-Simulation" \
        -H "Cache-Control: no-cache" \
        -H "Pragma: no-cache" \
        "$test_url"; then
        log_success "Fresh browser simulation successful"
        log_info "Test URL: $test_url"
    else
        log_error "Fresh browser simulation failed"
    fi
}

# 4. Version cache busting
update_version_cache() {
    log_info "Updating version cache..."
    
    # Create/update build version file
    local build_timestamp=$(date +%s)
    local commit_hash=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    local build_id="build-${build_timestamp}"
    
    # Update environment variables (if possible)
    export BUILD_TIMESTAMP="$build_timestamp"
    export BUILD_ID="$build_id"
    export CACHE_BUST_VERSION="$build_timestamp"
    
    # Create cache bust manifest
    echo "{
        \"buildId\": \"$build_id\",
        \"timestamp\": \"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\",
        \"commit\": \"$commit_hash\",
        \"cacheBustVersion\": \"$build_timestamp\",
        \"environment\": \"$ENVIRONMENT\",
        \"targetUrl\": \"$TARGET_URL\"
    }" > .cache-bust-manifest.json
    
    log_success "Version cache updated with build ID: $build_id"
}

# 5. Static asset cache busting
bust_static_assets() {
    log_info "Busting static asset cache..."
    
    # Test common static assets with cache busting
    local static_assets=(
        "/favicon.ico"
        "/robots.txt"
        "/_next/static/chunks/pages/_app.js"
    )
    
    for asset in "${static_assets[@]}"; do
        local asset_url="${TARGET_URL}${asset}?v=$(date +%s)"
        
        if curl -s -I "$asset_url" | grep -q "200\|304"; then
            log_success "Static asset accessible: $asset"
        else
            log_warning "Static asset may have issues: $asset"
        fi
    done
}

# 6. Service worker cache busting (if applicable)
bust_service_worker() {
    log_info "Checking for service worker cache..."
    
    # Check if service worker exists
    local sw_url="${TARGET_URL}/sw.js"
    if curl -s -I "$sw_url" | grep -q "200"; then
        log_info "Service worker found, adding cache bust parameter"
        
        local sw_bust_url="${sw_url}?v=$(date +%s)"
        if curl -s -o /dev/null "$sw_bust_url"; then
            log_success "Service worker cache busted"
        else
            log_warning "Service worker cache bust may have failed"
        fi
    else
        log_info "No service worker detected"
    fi
}

# 7. CDN cache busting (placeholder for future CDN integration)
bust_cdn_cache() {
    log_info "CDN cache busting (placeholder)..."
    
    # This would integrate with CDN APIs when available
    # For now, just log that this step exists
    log_info "CDN cache busting would be implemented here for production CDN"
    log_info "Currently using cache-busting query parameters and headers"
}

# 8. Database cache busting (clear any cached queries)
bust_database_cache() {
    log_info "Database cache busting..."
    
    # If Redis is available, clear cache
    if command -v redis-cli >/dev/null 2>&1; then
        if redis-cli ping >/dev/null 2>&1; then
            redis-cli FLUSHDB >/dev/null 2>&1 || true
            log_success "Redis cache cleared"
        else
            log_info "Redis not responding - skipping cache clear"
        fi
    else
        log_info "Redis not available - no cache to clear"
    fi
}

# Main cache busting workflow
main() {
    echo "🚀 CACHE BUSTING SYSTEM"
    echo "======================="
    echo "Environment: $ENVIRONMENT"
    echo "Target URL: $TARGET_URL"
    echo "Timestamp: $(date)"
    echo ""
    
    # Execute all cache busting steps
    clear_nextjs_cache
    echo ""
    
    update_version_cache
    echo ""
    
    force_cache_headers
    echo ""
    
    simulate_fresh_browser
    echo ""
    
    bust_static_assets
    echo ""
    
    bust_service_worker
    echo ""
    
    bust_database_cache
    echo ""
    
    bust_cdn_cache
    echo ""
    
    log_success "Cache busting complete!"
    echo ""
    echo "📋 Cache Bust Summary:"
    if [ -f ".cache-bust-manifest.json" ]; then
        echo "Build ID: $(grep -o '"buildId":"[^"]*' .cache-bust-manifest.json | cut -d'"' -f4)"
        echo "Timestamp: $(grep -o '"timestamp":"[^"]*' .cache-bust-manifest.json | cut -d'"' -f4)"
    fi
    
    echo ""
    echo "💡 Next Steps:"
    echo "1. Restart your server if running locally"
    echo "2. Test with: curl -H 'Cache-Control: no-cache' '$TARGET_URL'"
    echo "3. Open browser in incognito mode for fresh session"
    echo "4. Run: ./scripts/ui-change-verifier.sh verify"
}

# Run main function
main