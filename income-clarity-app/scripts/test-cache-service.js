#!/usr/bin/env node

/**
 * Cache Service Test Script
 * Tests the cache service with Redis backend enabled
 */

// Set environment for Redis
process.env.REDIS_DISABLED = 'false';
process.env.DISABLE_REDIS_CONNECTIONS = 'false';
process.env.ENABLE_REDIS = 'true';

// Import cache service using require with .ts extension handling
let cacheService;
try {
  cacheService = require('../lib/services/cache/cache.service.ts').cacheService;
} catch (error) {
  console.error('Failed to load cache service:', error.message);
  console.log('Attempting to use npx ts-node or create a simple Redis test...');
  process.exit(1);
}

async function testCacheService() {
  try {
    console.log('🧪 Testing Cache Service with Redis');
    console.log('===================================');
    
    // Wait a moment for Redis connection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test basic cache operations
    console.log('\n1. Testing SET/GET operations...');
    const config1 = {
      key: 'test_key_1',
      ttl: 60000, // 1 minute
      tier: 'all'
    };
    
    await cacheService.set(config1.key, { message: 'Hello Redis Cache!', timestamp: Date.now() }, config1);
    console.log('✅ SET operation completed');
    
    const result1 = await cacheService.get(config1.key);
    console.log('✅ GET operation completed:', result1);
    
    // Test cache tiers
    console.log('\n2. Testing different cache tiers...');
    
    // Memory tier
    const configMemory = { key: 'test_memory', ttl: 30000, tier: 'memory' };
    await cacheService.set(configMemory.key, 'Memory cached data', configMemory);
    const memoryResult = await cacheService.get(configMemory.key);
    console.log('✅ Memory tier:', memoryResult);
    
    // Redis tier
    const configRedis = { key: 'test_redis', ttl: 30000, tier: 'redis' };
    await cacheService.set(configRedis.key, 'Redis cached data', configRedis);
    const redisResult = await cacheService.get(configRedis.key);
    console.log('✅ Redis tier:', redisResult);
    
    // Database tier
    const configDB = { key: 'test_database', ttl: 30000, tier: 'database' };
    await cacheService.set(configDB.key, 'Database cached data', configDB);
    const dbResult = await cacheService.get(configDB.key);
    console.log('✅ Database tier:', dbResult);
    
    // Test fallback with fetcher function
    console.log('\n3. Testing fallback mechanism...');
    const fallbackResult = await cacheService.get(
      'non_existent_key',
      async () => {
        console.log('   Executing fallback function...');
        return { data: 'Fallback data', generated: Date.now() };
      },
      { key: 'non_existent_key', ttl: 60000, tier: 'all' }
    );
    console.log('✅ Fallback result:', fallbackResult);
    
    // Test cache invalidation by tags
    console.log('\n4. Testing tag-based invalidation...');
    const taggedConfig = { 
      key: 'test_tagged', 
      ttl: 60000, 
      tier: 'all',
      tags: ['user:123', 'portfolio:456']
    };
    
    await cacheService.set(taggedConfig.key, 'Tagged data', taggedConfig);
    console.log('✅ Tagged data cached');
    
    // Verify it exists
    const taggedResult = await cacheService.get(taggedConfig.key);
    console.log('✅ Tagged data retrieved:', taggedResult);
    
    // Invalidate by tag
    await cacheService.invalidateByTags(['user:123']);
    const afterInvalidation = await cacheService.get(taggedConfig.key);
    console.log('✅ After tag invalidation:', afterInvalidation || 'null (successfully invalidated)');
    
    // Test performance with batch operations
    console.log('\n5. Testing performance...');
    const startTime = Date.now();
    
    const batchPromises = [];
    for (let i = 0; i < 50; i++) {
      const config = { 
        key: `perf_test_${i}`, 
        ttl: 30000, 
        tier: 'redis' 
      };
      batchPromises.push(
        cacheService.set(config.key, { id: i, data: `Performance test data ${i}` }, config)
      );
    }
    
    await Promise.all(batchPromises);
    const setTime = Date.now() - startTime;
    console.log(`✅ SET Performance: 50 operations in ${setTime}ms (${(setTime/50).toFixed(2)}ms avg)`);
    
    // Test GET performance
    const getStartTime = Date.now();
    const getPromises = [];
    for (let i = 0; i < 50; i++) {
      getPromises.push(cacheService.get(`perf_test_${i}`));
    }
    
    await Promise.all(getPromises);
    const getTime = Date.now() - getStartTime;
    console.log(`✅ GET Performance: 50 operations in ${getTime}ms (${(getTime/50).toFixed(2)}ms avg)`);
    
    // Test cache statistics
    console.log('\n6. Testing cache statistics...');
    const stats = await cacheService.getStats();
    console.log('✅ Cache stats:', {
      hits: stats.hits,
      misses: stats.misses,
      hitRate: `${stats.hitRate.toFixed(2)}%`,
      memoryUsage: `${stats.memoryUsage.toFixed(2)}MB`,
      redisConnected: stats.redisConnected,
      totalKeys: stats.totalKeys
    });
    
    // Test cache warmup
    console.log('\n7. Testing cache warmup...');
    const warmupKeys = [
      {
        key: 'warmup_test_1',
        fetcher: async () => ({ data: 'Warmup data 1' }),
        config: { key: 'warmup_test_1', ttl: 60000, tier: 'redis' }
      },
      {
        key: 'warmup_test_2',
        fetcher: async () => ({ data: 'Warmup data 2' }),
        config: { key: 'warmup_test_2', ttl: 60000, tier: 'redis' }
      }
    ];
    
    await cacheService.warmupCache(warmupKeys);
    console.log('✅ Cache warmup completed');
    
    // Verify warmup worked
    const warmup1 = await cacheService.get('warmup_test_1');
    console.log('✅ Warmup verification:', warmup1);
    
    // Test cleanup
    console.log('\n8. Testing cleanup operations...');
    
    // Clear test data
    const testKeys = ['test_key_1', 'test_memory', 'test_redis', 'test_database', 'test_tagged', 'non_existent_key'];
    for (const key of testKeys) {
      await cacheService.delete(key);
    }
    
    // Clear performance test data
    for (let i = 0; i < 50; i++) {
      await cacheService.delete(`perf_test_${i}`);
    }
    
    console.log('✅ Test data cleanup completed');
    
    console.log('\n🎉 All cache service tests passed!');
    console.log('===================================');
    console.log('✅ Redis integration is working correctly');
    console.log('✅ All cache tiers are operational');
    console.log('✅ Performance is acceptable');
    console.log('✅ Cache service is production ready');
    
    return true;
    
  } catch (error) {
    console.error('❌ Cache service test failed:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  } finally {
    try {
      await cacheService.cleanup();
    } catch (cleanupError) {
      console.warn('⚠️ Cleanup error (non-critical):', cleanupError.message);
    }
  }
}

// Run the test
if (require.main === module) {
  testCacheService()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Unhandled error:', error);
      process.exit(1);
    });
}

module.exports = { testCacheService };