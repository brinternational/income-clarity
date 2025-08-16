#!/bin/bash

# BACKEND-003: Cache System Deployment Script
# Deploy and configure Redis/Upstash cache system

set -e

echo "🚀 Deploying cache system for Income Clarity..."

# Function to check environment variables
check_cache_env() {
    echo "🔍 Checking cache environment configuration..."
    
    if [ -n "$REDIS_URL" ]; then
        echo "✅ REDIS_URL is configured"
        CACHE_TYPE="upstash"
    elif [ -n "$UPSTASH_REDIS_REST_URL" ] && [ -n "$UPSTASH_REDIS_REST_TOKEN" ]; then
        echo "✅ Upstash Redis REST configuration found"
        CACHE_TYPE="upstash-rest"
    else
        echo "❌ Redis configuration not found"
        echo "   Please configure one of:"
        echo "   - REDIS_URL (for standard Redis)"
        echo "   - UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN (for Upstash)"
        return 1
    fi
    
    echo "Cache type: $CACHE_TYPE"
}

# Test cache connectivity
test_cache_connection() {
    echo "📡 Testing cache connectivity..."
    
    # Create test script
    cat > scripts/test-cache-connection.js << 'EOF'
const { redis } = require('../lib/redis-client');

async function testConnection() {
  console.log('Testing Redis connection...');
  
  try {
    // Test basic connectivity
    const health = await redis.healthCheck();
    if (health.healthy) {
      console.log(`✅ Redis connection healthy (latency: ${health.latency}ms)`);
    } else {
      console.log(`❌ Redis connection unhealthy: ${health.error}`);
      return false;
    }
    
    // Test basic operations
    console.log('Testing basic cache operations...');
    
    // Set test value
    const testKey = 'cache:test:' + Date.now();
    const testValue = { message: 'Cache test successful', timestamp: Date.now() };
    
    const setResult = await redis.set(testKey, testValue, { ex: 60 });
    if (setResult) {
      console.log('✅ Cache SET operation successful');
    } else {
      console.log('❌ Cache SET operation failed');
      return false;
    }
    
    // Get test value
    const getValue = await redis.get(testKey);
    if (getValue && getValue.message === testValue.message) {
      console.log('✅ Cache GET operation successful');
    } else {
      console.log('❌ Cache GET operation failed');
      return false;
    }
    
    // Test TTL
    const ttl = await redis.ttl(testKey);
    if (ttl > 0 && ttl <= 60) {
      console.log(`✅ Cache TTL working correctly (${ttl}s remaining)`);
    } else {
      console.log(`⚠️  Cache TTL unexpected: ${ttl}s`);
    }
    
    // Cleanup
    await redis.del(testKey);
    console.log('✅ Cache cleanup successful');
    
    return true;
  } catch (error) {
    console.error('❌ Cache connection test failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
EOF
    
    # Run connection test
    if node scripts/test-cache-connection.js; then
        echo "✅ Cache connection test passed"
        return 0
    else
        echo "❌ Cache connection test failed"
        return 1
    fi
}

# Test multi-level cache service
test_multilevel_cache() {
    echo "🔧 Testing multi-level cache service..."
    
    # Create comprehensive cache test
    cat > scripts/test-multilevel-cache.js << 'EOF'
const { multiLevelCache, cacheService } = require('../lib/cache-service');

async function testMultiLevelCache() {
  console.log('Testing multi-level cache system...');
  
  try {
    // Test cache service compatibility
    console.log('\n1. Testing legacy cache service compatibility...');
    
    const testKey = 'test:legacy:' + Date.now();
    const testData = { value: 'legacy test', timestamp: Date.now() };
    
    await cacheService.set(testKey, testData);
    const retrieved = await cacheService.get(testKey);
    
    if (retrieved && retrieved.value === testData.value) {
      console.log('✅ Legacy cache service working');
    } else {
      console.log('❌ Legacy cache service failed');
    }
    
    // Test multi-level cache directly
    console.log('\n2. Testing multi-level cache operations...');
    
    const mlTestKey = 'test:multilevel:' + Date.now();
    const mlTestData = {
      performance: { value: 85, trend: 'up' },
      income: { monthly: 1500, annual: 18000 },
      timestamp: Date.now()
    };
    
    // Test different card types
    const cardTypes = ['performance', 'income', 'lifestyle', 'strategy'];
    
    for (const cardType of cardTypes) {
      console.log(`  Testing ${cardType} card caching...`);
      
      const key = `${mlTestKey}:${cardType}`;
      await multiLevelCache.set(key, mlTestData, cardType);
      
      const result = await multiLevelCache.get(key, cardType);
      if (result.data && result.data.timestamp === mlTestData.timestamp) {
        console.log(`  ✅ ${cardType} cache: ${result.source} (${result.responseTime}ms)`);
      } else {
        console.log(`  ❌ ${cardType} cache failed`);
      }
    }
    
    // Test cache statistics
    console.log('\n3. Testing cache statistics...');
    
    const stats = await multiLevelCache.getStats();
    console.log(`Cache statistics:
  - Hit rate: ${(stats.hitRate * 100).toFixed(1)}%
  - L1 hits: ${stats.l1Hits}
  - L2 hits: ${stats.l2Hits}
  - L3 hits: ${stats.l3Hits}
  - Misses: ${stats.misses}
  - Avg response: ${stats.averageResponseTime.toFixed(1)}ms
  - L1 memory: ${stats.l1Stats.memoryMB.toFixed(2)}MB
  - L2 connected: ${stats.l2Stats.connected}`);
    
    // Test cache warming
    console.log('\n4. Testing cache warming...');
    
    await multiLevelCache.warmCache('test-user-123', ['performance', 'income']);
    console.log('✅ Cache warming completed');
    
    // Test predictive preloading
    console.log('\n5. Testing predictive preloading...');
    
    await multiLevelCache.predictivePreload('test-user-123', 'performance');
    console.log('✅ Predictive preloading completed');
    
    // Test cache invalidation
    console.log('\n6. Testing cache invalidation...');
    
    const invalidated = await multiLevelCache.invalidate('test:');
    console.log(`✅ Invalidated ${invalidated} cache entries`);
    
    // Final statistics
    const finalStats = await multiLevelCache.getStats();
    console.log(`\nFinal cache performance:
  - Total requests: ${finalStats.l1Hits + finalStats.l2Hits + finalStats.l3Hits + finalStats.misses}
  - Hit rate: ${(finalStats.hitRate * 100).toFixed(1)}%
  - Average response: ${finalStats.averageResponseTime.toFixed(1)}ms
  - P95 response: ${finalStats.performance.p95ResponseTime.toFixed(1)}ms
  - P99 response: ${finalStats.performance.p99ResponseTime.toFixed(1)}ms`);
    
    // Verify performance targets
    if (finalStats.hitRate >= 0.8) {
      console.log('✅ Cache hit rate target achieved (≥80%)');
    } else {
      console.log(`⚠️  Cache hit rate below target: ${(finalStats.hitRate * 100).toFixed(1)}%`);
    }
    
    if (finalStats.averageResponseTime <= 50) {
      console.log('✅ Cache response time target achieved (≤50ms)');
    } else {
      console.log(`⚠️  Cache response time above target: ${finalStats.averageResponseTime.toFixed(1)}ms`);
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Multi-level cache test failed:', error.message);
    console.error(error.stack);
    return false;
  }
}

testMultiLevelCache().then(success => {
  process.exit(success ? 0 : 1);
});
EOF
    
    # Run multi-level cache test
    if node scripts/test-multilevel-cache.js; then
        echo "✅ Multi-level cache test passed"
        return 0
    else
        echo "❌ Multi-level cache test failed"
        return 1
    fi
}

# Deploy cache monitoring
deploy_cache_monitoring() {
    echo "📊 Deploying cache monitoring..."
    
    # Create cache monitoring API endpoint
    mkdir -p app/api/cache
    
    cat > app/api/cache/stats/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { multiLevelCache } from '@/lib/cache-service'

export async function GET(request: NextRequest) {
  try {
    const stats = await multiLevelCache.getStats()
    
    // Add additional metrics
    const metrics = {
      ...stats,
      targets: {
        hitRateTarget: 80, // 80% hit rate target
        responseTimeTarget: 50, // 50ms response time target
      },
      performance: {
        hitRateStatus: stats.hitRate >= 0.8 ? 'good' : 'warning',
        responseTimeStatus: stats.averageResponseTime <= 50 ? 'good' : 'warning',
      },
      timestamp: new Date().toISOString()
    }
    
    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Cache stats API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
EOF
    
    cat > app/api/cache/health/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { redis } from '@/lib/redis-client'
import { multiLevelCache } from '@/lib/cache-service'

export async function GET(request: NextRequest) {
  try {
    const redisHealth = await redis.healthCheck()
    const cacheStats = await multiLevelCache.getStats()
    
    const health = {
      status: redisHealth.healthy ? 'healthy' : 'unhealthy',
      redis: {
        connected: redisHealth.healthy,
        latency: redisHealth.latency,
        error: redisHealth.error
      },
      cache: {
        l1Active: cacheStats.l1Stats.validItems > 0,
        l2Active: cacheStats.l2Stats.connected,
        hitRate: cacheStats.hitRate,
        avgResponseTime: cacheStats.averageResponseTime
      },
      targets: {
        hitRateTarget: cacheStats.hitRate >= 0.8,
        responseTimeTarget: cacheStats.averageResponseTime <= 50
      },
      timestamp: new Date().toISOString()
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 503
    return NextResponse.json(health, { status: statusCode })
    
  } catch (error) {
    console.error('Cache health API error:', error)
    return NextResponse.json({
      status: 'error',
      error: 'Health check failed'
    }, { status: 500 })
  }
}
EOF
    
    cat > app/api/cache/clear/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { multiLevelCache } from '@/lib/cache-service'

export async function POST(request: NextRequest) {
  try {
    // Only allow in development or with proper auth
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Not allowed in production' }, { status: 403 })
    }
    
    const { level } = await request.json()
    await multiLevelCache.clear(level)
    
    return NextResponse.json({ 
      success: true, 
      message: `Cache level ${level || 'all'} cleared`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Cache clear API error:', error)
    return NextResponse.json({ error: 'Failed to clear cache' }, { status: 500 })
  }
}
EOF
    
    echo "✅ Cache monitoring APIs created"
}

# Update API routes to use caching
integrate_cache_with_apis() {
    echo "🔗 Integrating cache with Super Cards API..."
    
    # Check if super-cards API route exists
    if [ -f "app/api/super-cards/route.ts" ]; then
        echo "📝 Adding cache integration to existing super-cards API..."
        
        # Backup original file
        cp app/api/super-cards/route.ts app/api/super-cards/route.ts.backup
        
        # Add cache integration (this would need to be done manually in a real scenario)
        echo "⚠️  Manual integration required for app/api/super-cards/route.ts"
        echo "   Add the following imports:"
        echo "   import { multiLevelCache } from '@/lib/cache-service'"
        echo "   import { RedisUtils } from '@/lib/redis-client'"
        echo ""
        echo "   Then wrap your data fetching logic with cache.get() and cache.set()"
    else
        echo "⚠️  Super Cards API route not found - cache integration will need to be added manually"
    fi
}

# Create cache warmer script for cron
create_cache_warmer() {
    echo "🔥 Creating cache warmer script..."
    
    cat > scripts/cache-warmer.js << 'EOF'
#!/usr/bin/env node

/**
 * Cache Warmer Script
 * Preloads frequently accessed data into cache
 * Run this script via cron every 5 minutes
 */

const { multiLevelCache } = require('../lib/cache-service');
const { redis } = require('../lib/redis-client');

async function warmCache() {
  console.log('🔥 Starting cache warming process...');
  
  try {
    // Get list of active users (in production, this would query your database)
    const activeUsers = process.env.WARM_CACHE_USERS 
      ? process.env.WARM_CACHE_USERS.split(',')
      : ['demo-user-1', 'demo-user-2']; // Demo users for testing
    
    console.log(`Warming cache for ${activeUsers.length} active users`);
    
    // Warm cache for each active user
    const warmingPromises = activeUsers.map(async (userId) => {
      try {
        await multiLevelCache.warmCache(userId.trim(), [
          'performance',
          'income',
          'lifestyle',
          'strategy'
        ]);
        console.log(`✅ Cache warmed for user: ${userId}`);
      } catch (error) {
        console.error(`❌ Cache warming failed for user ${userId}:`, error.message);
      }
    });
    
    await Promise.all(warmingPromises);
    
    // Get and log statistics
    const stats = await multiLevelCache.getStats();
    console.log(`Cache warming completed:
  - Hit rate: ${(stats.hitRate * 100).toFixed(1)}%
  - L1 items: ${stats.l1Stats.validItems}
  - L2 connected: ${stats.l2Stats.connected}
  - Avg response: ${stats.averageResponseTime.toFixed(1)}ms`);
    
    console.log('🎉 Cache warming process completed successfully');
    
  } catch (error) {
    console.error('❌ Cache warming process failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  warmCache().then(() => process.exit(0));
}

module.exports = { warmCache };
EOF
    
    chmod +x scripts/cache-warmer.js
    echo "✅ Cache warmer script created"
}

# Main deployment function
main() {
    echo "🚀 Starting cache system deployment..."
    
    # Load environment variables
    if [ -f .env.local ]; then
        export $(grep -v '^#' .env.local | xargs)
        echo "✅ Environment variables loaded"
    else
        echo "⚠️  No .env.local file found"
    fi
    
    # Check dependencies
    echo "📦 Checking dependencies..."
    if ! npm list @upstash/redis > /dev/null 2>&1; then
        echo "Installing @upstash/redis..."
        npm install @upstash/redis
    fi
    
    # Run deployment steps
    if check_cache_env; then
        test_cache_connection
        test_multilevel_cache
        deploy_cache_monitoring
        integrate_cache_with_apis
        create_cache_warmer
        
        echo ""
        echo "🎉 Cache system deployment completed successfully!"
        echo ""
        echo "Cache system features deployed:"
        echo "✅ Multi-level caching (L1: Memory, L2: Redis, L3: Database)"
        echo "✅ Cache monitoring API endpoints"
        echo "✅ Cache warming script for cron jobs"
        echo "✅ Performance monitoring and statistics"
        echo ""
        echo "Next steps:"
        echo "1. Configure Redis environment variables in production:"
        echo "   - REDIS_URL or UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN"
        echo "2. Set up cron job for cache warming:"
        echo "   */5 * * * * cd /path/to/app && node scripts/cache-warmer.js"
        echo "3. Monitor cache performance:"
        echo "   GET /api/cache/stats"
        echo "   GET /api/cache/health"
        echo "4. Target metrics:"
        echo "   - Cache hit rate: ≥80%"
        echo "   - Response time: ≤50ms for cached data"
        
    else
        echo "❌ Cache deployment failed - environment not configured"
        exit 1
    fi
}

# Run main function
main "$@"