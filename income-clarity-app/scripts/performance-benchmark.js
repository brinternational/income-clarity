/**
 * Performance Benchmark Script
 * Tests API performance before and after optimizations
 * Measures response times, cache hit rates, and system resources
 */

const axios = require('axios');
const { performance } = require('perf_hooks');

const BASE_URL = 'http://localhost:3000';
const TEST_ENDPOINTS = [
  '/api/super-cards/performance-hub',
  '/api/super-cards/income-hub',
  '/api/super-cards/portfolio-strategy-hub',
  '/api/super-cards/tax-strategy-hub',
  '/api/super-cards/financial-planning-hub',
  '/api/super-cards/optimized'
];

class PerformanceBenchmark {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      testConfig: {
        baseUrl: BASE_URL,
        iterations: 10,
        concurrency: 3,
        warmupRequests: 2
      },
      endpoints: {},
      summary: {}
    };
  }

  /**
   * Run a single HTTP request and measure performance
   */
  async measureRequest(url, requestNumber = 1) {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    
    try {
      const response = await axios.get(`${BASE_URL}${url}`, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'PerformanceBenchmark/1.0'
        }
      });
      
      const endTime = performance.now();
      const endMemory = process.memoryUsage();
      const duration = Math.round(endTime - startTime);
      
      return {
        success: true,
        status: response.status,
        duration,
        size: JSON.stringify(response.data).length,
        cached: response.headers['x-cache-status'] === 'HIT',
        memoryDelta: {
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal
        },
        headers: {
          cacheControl: response.headers['cache-control'],
          cacheStatus: response.headers['x-cache-status'],
          contentLength: response.headers['content-length'],
          contentType: response.headers['content-type']
        },
        data: {
          responseTime: response.data?.responseTime || null,
          cached: response.data?.cached || null,
          holdingsCount: response.data?.holdingsCount || response.data?.metadata?.responseTime || null
        }
      };
    } catch (error) {
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);
      
      return {
        success: false,
        status: error.response?.status || 0,
        duration,
        error: error.message,
        timeout: error.code === 'ECONNABORTED'
      };
    }
  }

  /**
   * Test an endpoint with multiple requests
   */
  async testEndpoint(endpoint, iterations = 10) {
    console.log(`🧪 Testing ${endpoint}...`);
    
    const results = [];
    
    // Warmup requests
    console.log('  🔥 Warming up cache...');
    for (let i = 0; i < 2; i++) {
      await this.measureRequest(endpoint, i + 1);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    }
    
    // Actual test requests
    console.log(`  📊 Running ${iterations} test requests...`);
    for (let i = 0; i < iterations; i++) {
      const result = await this.measureRequest(endpoint, i + 1);
      results.push(result);
      
      // Progress indicator
      if ((i + 1) % 3 === 0) {
        const avgDuration = results.slice(0, i + 1).reduce((sum, r) => sum + r.duration, 0) / (i + 1);
        console.log(`    ${i + 1}/${iterations} - Avg: ${Math.round(avgDuration)}ms`);
      }
      
      // Small delay between requests to simulate real usage
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Calculate statistics
    const successfulResults = results.filter(r => r.success);
    const durations = successfulResults.map(r => r.duration);
    const cacheHits = successfulResults.filter(r => r.cached).length;
    
    const stats = {
      endpoint,
      totalRequests: results.length,
      successfulRequests: successfulResults.length,
      failedRequests: results.length - successfulResults.length,
      cacheHitRate: successfulResults.length > 0 ? (cacheHits / successfulResults.length) * 100 : 0,
      performance: {
        min: Math.min(...durations),
        max: Math.max(...durations),
        avg: durations.reduce((sum, d) => sum + d, 0) / durations.length,
        p50: this.percentile(durations, 0.5),
        p95: this.percentile(durations, 0.95),
        p99: this.percentile(durations, 0.99)
      },
      responseSize: {
        min: Math.min(...successfulResults.map(r => r.size)),
        max: Math.max(...successfulResults.map(r => r.size)),
        avg: successfulResults.reduce((sum, r) => sum + r.size, 0) / successfulResults.length
      },
      results: results
    };
    
    console.log(`  ✅ ${endpoint}: ${Math.round(stats.performance.avg)}ms avg, ${Math.round(stats.cacheHitRate)}% cache hits`);
    
    return stats;
  }

  /**
   * Calculate percentile
   */
  percentile(array, p) {
    if (array.length === 0) return 0;
    const sorted = array.slice().sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Run concurrent requests to test load handling
   */
  async testConcurrency(endpoint, concurrency = 5, requests = 20) {
    console.log(`⚡ Testing concurrency for ${endpoint} (${concurrency} concurrent, ${requests} total)...`);
    
    const startTime = performance.now();
    const promises = [];
    const results = [];
    
    for (let i = 0; i < requests; i++) {
      const promise = this.measureRequest(endpoint, i + 1)
        .then(result => {
          results.push(result);
          return result;
        });
      promises.push(promise);
      
      // Limit concurrency
      if (promises.length >= concurrency) {
        await Promise.race(promises);
        // Remove completed promises
        const completedCount = results.length;
        promises.splice(0, completedCount - promises.length + concurrency);
      }
    }
    
    // Wait for remaining requests
    await Promise.all(promises);
    
    const totalTime = performance.now() - startTime;
    const successfulResults = results.filter(r => r.success);
    const avgDuration = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
    
    console.log(`  📊 Concurrency test: ${Math.round(totalTime)}ms total, ${Math.round(avgDuration)}ms avg response`);
    
    return {
      endpoint,
      concurrency,
      totalRequests: requests,
      totalTime: Math.round(totalTime),
      successRate: (successfulResults.length / requests) * 100,
      avgResponseTime: Math.round(avgDuration),
      requestsPerSecond: requests / (totalTime / 1000),
      results
    };
  }

  /**
   * Test cache performance specifically
   */
  async testCachePerformance() {
    console.log('🔄 Testing cache performance...');
    
    const cacheTestEndpoint = '/api/super-cards/optimized';
    
    // Clear cache first
    try {
      await axios.post(`${BASE_URL}${cacheTestEndpoint}`, { action: 'invalidate' });
      console.log('  🧹 Cache cleared');
    } catch (error) {
      console.log('  ⚠️ Cache clear failed (continuing anyway)');
    }
    
    // Test cold cache (first request)
    console.log('  ❄️ Testing cold cache...');
    const coldResult = await this.measureRequest(cacheTestEndpoint);
    
    // Test warm cache (subsequent requests)
    console.log('  🔥 Testing warm cache...');
    const warmResults = [];
    for (let i = 0; i < 5; i++) {
      const result = await this.measureRequest(cacheTestEndpoint);
      warmResults.push(result);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const avgWarmTime = warmResults.reduce((sum, r) => sum + r.duration, 0) / warmResults.length;
    const cacheHitRate = warmResults.filter(r => r.cached).length / warmResults.length * 100;
    
    console.log(`  📊 Cold: ${coldResult.duration}ms, Warm: ${Math.round(avgWarmTime)}ms, Hit rate: ${Math.round(cacheHitRate)}%`);
    
    return {
      coldCache: coldResult,
      warmCache: {
        avgDuration: avgWarmTime,
        cacheHitRate,
        results: warmResults
      },
      improvement: coldResult.success ? ((coldResult.duration - avgWarmTime) / coldResult.duration) * 100 : 0
    };
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    try {
      const response = await axios.post(`${BASE_URL}/api/super-cards/optimized`, { action: 'stats' });
      return response.data.cacheStats;
    } catch (error) {
      console.log('  ⚠️ Could not retrieve cache stats');
      return null;
    }
  }

  /**
   * Run complete benchmark suite
   */
  async runBenchmark() {
    console.log('🚀 Starting Performance Benchmark Suite');
    console.log('=' .repeat(60));
    
    const startTime = Date.now();
    
    // Test individual endpoints
    console.log('\\n📈 ENDPOINT PERFORMANCE TESTS');
    console.log('-' .repeat(40));
    
    for (const endpoint of TEST_ENDPOINTS) {
      try {
        const stats = await this.testEndpoint(endpoint, this.results.testConfig.iterations);
        this.results.endpoints[endpoint] = stats;
      } catch (error) {
        console.error(`❌ Failed to test ${endpoint}:`, error.message);
        this.results.endpoints[endpoint] = { error: error.message };
      }
      
      // Brief pause between endpoint tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Test concurrency
    console.log('\\n⚡ CONCURRENCY TESTS');
    console.log('-' .repeat(40));
    
    const concurrencyResults = {};
    const testEndpoint = '/api/super-cards/optimized';
    
    try {
      concurrencyResults[testEndpoint] = await this.testConcurrency(
        testEndpoint, 
        this.results.testConfig.concurrency, 
        15
      );
    } catch (error) {
      console.error(`❌ Concurrency test failed:`, error.message);
    }
    
    // Test cache performance
    console.log('\\n🔄 CACHE PERFORMANCE TESTS');
    console.log('-' .repeat(40));
    
    let cachePerformance = null;
    try {
      cachePerformance = await this.testCachePerformance();
    } catch (error) {
      console.error(`❌ Cache test failed:`, error.message);
    }
    
    // Get cache stats
    const cacheStats = await this.getCacheStats();
    
    // Calculate summary statistics
    const endpointStats = Object.values(this.results.endpoints).filter(s => s.performance);
    
    this.results.summary = {
      totalTime: Date.now() - startTime,
      endpointsTested: endpointStats.length,
      averageResponseTime: endpointStats.reduce((sum, s) => sum + s.performance.avg, 0) / endpointStats.length,
      fastestEndpoint: endpointStats.reduce((min, s) => s.performance.avg < min.performance.avg ? s : min),
      slowestEndpoint: endpointStats.reduce((max, s) => s.performance.avg > max.performance.avg ? s : max),
      overallCacheHitRate: endpointStats.reduce((sum, s) => sum + s.cacheHitRate, 0) / endpointStats.length,
      concurrency: concurrencyResults,
      cache: cachePerformance,
      cacheStats
    };
    
    // Display results
    this.displayResults();
    
    return this.results;
  }

  /**
   * Display benchmark results
   */
  displayResults() {
    console.log('\\n🎯 BENCHMARK RESULTS');
    console.log('=' .repeat(60));
    
    const { summary } = this.results;
    
    console.log(`⏱️  Total benchmark time: ${Math.round(summary.totalTime / 1000)}s`);
    console.log(`📊 Endpoints tested: ${summary.endpointsTested}`);
    console.log(`🏃 Average response time: ${Math.round(summary.averageResponseTime)}ms`);
    console.log(`🏆 Fastest endpoint: ${summary.fastestEndpoint?.endpoint} (${Math.round(summary.fastestEndpoint?.performance.avg)}ms)`);
    console.log(`🐌 Slowest endpoint: ${summary.slowestEndpoint?.endpoint} (${Math.round(summary.slowestEndpoint?.performance.avg)}ms)`);
    console.log(`📦 Overall cache hit rate: ${Math.round(summary.overallCacheHitRate)}%`);
    
    if (summary.cache) {
      console.log(`❄️  Cold cache performance: ${summary.cache.coldCache.duration}ms`);
      console.log(`🔥 Warm cache performance: ${Math.round(summary.cache.warmCache.avgDuration)}ms`);
      console.log(`🚀 Cache improvement: ${Math.round(summary.cache.improvement)}%`);
    }
    
    if (summary.cacheStats) {
      console.log(`💾 Cache hit rate: ${Math.round(summary.cacheStats.hitRate)}%`);
      console.log(`🗄️  Total cached keys: ${summary.cacheStats.totalKeys}`);
      console.log(`💭 Memory usage: ${Math.round(summary.cacheStats.memoryUsage * 100) / 100}MB`);
      console.log(`🔗 Redis connected: ${summary.cacheStats.redisConnected ? 'Yes' : 'No'}`);
    }
    
    console.log('\\n📋 DETAILED ENDPOINT RESULTS');
    console.log('-' .repeat(40));
    
    Object.entries(this.results.endpoints).forEach(([endpoint, stats]) => {
      if (stats.performance) {
        console.log(`${endpoint}:`);
        console.log(`  ⚡ Avg: ${Math.round(stats.performance.avg)}ms (${stats.performance.min}-${stats.performance.max}ms)`);
        console.log(`  📦 Cache hit rate: ${Math.round(stats.cacheHitRate)}%`);
        console.log(`  📊 Success rate: ${Math.round((stats.successfulRequests / stats.totalRequests) * 100)}%`);
        console.log('');
      }
    });
    
    console.log('✅ Benchmark complete!');
  }
}

// Run the benchmark if called directly
if (require.main === module) {
  const benchmark = new PerformanceBenchmark();
  
  benchmark.runBenchmark()
    .then(results => {
      console.log('\\n💾 Full results saved to benchmark-results.json');
      require('fs').writeFileSync(
        'benchmark-results.json', 
        JSON.stringify(results, null, 2)
      );
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Benchmark failed:', error);
      process.exit(1);
    });
}

module.exports = PerformanceBenchmark;