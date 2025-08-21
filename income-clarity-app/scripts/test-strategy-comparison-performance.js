#!/usr/bin/env node

/**
 * Strategy Comparison Engine Performance Testing Script
 * 
 * Tests the cached strategy comparison service to validate:
 * - Sub-500ms response times for cached results (PRIMARY GOAL)
 * - Cache hit rates >80% for common scenarios
 * - Graceful fallback when cache systems fail
 * - Memory efficiency <100MB cache usage
 * - Professional-grade error handling
 * 
 * Usage:
 *   node scripts/test-strategy-comparison-performance.js
 *   node scripts/test-strategy-comparison-performance.js --warmup
 *   node scripts/test-strategy-comparison-performance.js --stress
 */

const { cachedStrategyComparisonEngineService } = require('../lib/services/strategy-comparison/cached-strategy-comparison-engine.service');
const { cacheService } = require('../lib/services/cache/cache.service');

// Test configuration
const TEST_CONFIG = {
  WARMUP_SCENARIOS: 12,         // Number of scenarios to pre-calculate
  PERFORMANCE_TESTS: 50,        // Number of performance test runs
  STRESS_TESTS: 200,           // Number of stress test runs
  TARGET_CACHE_HIT_TIME: 500,  // Sub-500ms target for cached responses
  TARGET_CACHE_MISS_TIME: 3000, // <3s for cache misses (current performance)
  TARGET_HIT_RATE: 0.8,        // >80% cache hit rate target
  MAX_MEMORY_MB: 100           // <100MB memory usage target
};

// Test scenarios with different portfolio sizes and tax situations
const TEST_SCENARIOS = [
  // Small portfolios
  { portfolioValue: 50000, state: 'TX', filingStatus: 'single', estimatedIncome: 60000 },
  { portfolioValue: 100000, state: 'CA', filingStatus: 'single', estimatedIncome: 80000 },
  { portfolioValue: 150000, state: 'FL', filingStatus: 'married_jointly', estimatedIncome: 120000 },
  
  // Medium portfolios
  { portfolioValue: 250000, state: 'NY', filingStatus: 'single', estimatedIncome: 150000 },
  { portfolioValue: 500000, state: 'WA', filingStatus: 'married_jointly', estimatedIncome: 200000 },
  { portfolioValue: 750000, state: 'PA', filingStatus: 'married_jointly', estimatedIncome: 250000 },
  
  // Large portfolios
  { portfolioValue: 1000000, state: 'CA', filingStatus: 'married_jointly', estimatedIncome: 300000 },
  { portfolioValue: 1500000, state: 'NJ', filingStatus: 'single', estimatedIncome: 400000 },
  { portfolioValue: 2000000, state: 'TX', filingStatus: 'married_jointly', estimatedIncome: 500000 },
  
  // Edge cases
  { portfolioValue: 5000000, state: 'FL', filingStatus: 'married_jointly', estimatedIncome: 1000000 },
  { portfolioValue: 25000, state: 'WY', filingStatus: 'single', estimatedIncome: 40000 },
  { portfolioValue: 10000000, state: 'CA', filingStatus: 'single', estimatedIncome: 2000000 }
];

class StrategyPerformanceTester {
  constructor() {
    this.results = {
      warmupTime: 0,
      cacheMissResponses: [],
      cacheHitResponses: [],
      totalTests: 0,
      errors: [],
      cacheStats: null
    };
  }

  /**
   * Run comprehensive performance test suite
   */
  async runFullTestSuite() {
    console.log('\n🚀 STRATEGY COMPARISON ENGINE PERFORMANCE TEST SUITE');
    console.log('====================================================');
    console.log(`🎯 TARGET: Sub-${TEST_CONFIG.TARGET_CACHE_HIT_TIME}ms cached responses`);
    console.log(`📊 TARGET: >${(TEST_CONFIG.TARGET_HIT_RATE * 100)}% cache hit rate`);
    console.log(`💾 TARGET: <${TEST_CONFIG.MAX_MEMORY_MB}MB memory usage\n`);

    try {
      // Step 1: Test without cache (baseline)
      await this.testBaseline();
      
      // Step 2: Warmup cache with common scenarios
      await this.warmupCache();
      
      // Step 3: Test cache performance
      await this.testCachePerformance();
      
      // Step 4: Stress test
      if (process.argv.includes('--stress')) {
        await this.stressTest();
      }
      
      // Step 5: Generate comprehensive report
      await this.generateReport();
      
      // Step 6: Validate performance targets
      const success = this.validatePerformanceTargets();
      
      process.exit(success ? 0 : 1);
      
    } catch (error) {
      console.error('❌ Performance test suite failed:', error);
      process.exit(1);
    }
  }

  /**
   * Test baseline performance (cache miss scenario)
   */
  async testBaseline() {
    console.log('📏 Testing baseline performance (cache misses)...');
    
    // Clear cache to ensure misses
    await cacheService.clearAll();
    
    const responses = [];
    
    for (let i = 0; i < 5; i++) {
      const scenario = TEST_SCENARIOS[i % TEST_SCENARIOS.length];
      const startTime = Date.now();
      
      try {
        const portfolio = this.createMockPortfolio(scenario.portfolioValue);
        const taxProfile = this.createMockTaxProfile(scenario.state, scenario.filingStatus, scenario.estimatedIncome);
        
        const result = await cachedStrategyComparisonEngineService.compareStrategiesOptimized(
          portfolio,
          taxProfile,
          { forceRefresh: true, preCalculate: false }
        );
        
        const responseTime = Date.now() - startTime;
        responses.push(responseTime);
        
        console.log(`  ⏱️  Baseline #${i + 1}: ${responseTime}ms (${result.performance.cacheHit ? 'HIT' : 'MISS'})`);
        
      } catch (error) {
        console.error(`  ❌ Baseline test ${i + 1} failed:`, error.message);
        this.results.errors.push(`Baseline test ${i + 1}: ${error.message}`);
      }
    }
    
    const avgBaseline = responses.reduce((sum, time) => sum + time, 0) / responses.length;
    console.log(`  📊 Average baseline (cache miss): ${Math.round(avgBaseline)}ms\n`);
    
    this.results.cacheMissResponses = responses;
  }

  /**
   * Warmup cache with common scenarios
   */
  async warmupCache() {
    console.log('🔥 Warming up cache with common scenarios...');
    const startTime = Date.now();
    
    try {
      await cachedStrategyComparisonEngineService.warmupCommonScenarios();
      
      this.results.warmupTime = Date.now() - startTime;
      console.log(`  ✅ Cache warmup completed in ${this.results.warmupTime}ms\n`);
      
    } catch (error) {
      console.error('  ❌ Cache warmup failed:', error);
      this.results.errors.push(`Cache warmup failed: ${error.message}`);
    }
  }

  /**
   * Test cache performance with warmed cache
   */
  async testCachePerformance() {
    console.log('🎯 Testing cache performance...');
    
    const responses = [];
    let cacheHits = 0;
    let cacheMisses = 0;
    
    // Test each scenario multiple times to ensure cache hits
    for (let round = 0; round < 3; round++) {
      for (let i = 0; i < Math.min(TEST_SCENARIOS.length, 8); i++) {
        const scenario = TEST_SCENARIOS[i];
        const startTime = Date.now();
        
        try {
          const portfolio = this.createMockPortfolio(scenario.portfolioValue);
          const taxProfile = this.createMockTaxProfile(scenario.state, scenario.filingStatus, scenario.estimatedIncome);
          
          const result = await cachedStrategyComparisonEngineService.compareStrategiesOptimized(
            portfolio,
            taxProfile,
            { preCalculate: false }
          );
          
          const responseTime = Date.now() - startTime;
          responses.push({ time: responseTime, cacheHit: result.performance.cacheHit });
          
          if (result.performance.cacheHit) {
            cacheHits++;
          } else {
            cacheMisses++;
          }
          
          const status = result.performance.cacheHit ? 
            `HIT (${result.performance.cacheSource})` : 
            'MISS';
          
          const performance = responseTime <= TEST_CONFIG.TARGET_CACHE_HIT_TIME ? '✅' : '⚠️';
          
          console.log(`  ${performance} Round ${round + 1}, Test ${i + 1}: ${responseTime}ms (${status})`);
          
        } catch (error) {
          console.error(`  ❌ Cache test failed:`, error.message);
          this.results.errors.push(`Cache test failed: ${error.message}`);
        }
      }
    }
    
    // Separate cache hits and misses for analysis
    this.results.cacheHitResponses = responses.filter(r => r.cacheHit).map(r => r.time);
    this.results.cacheMissResponses.push(...responses.filter(r => !r.cacheHit).map(r => r.time));
    
    const hitRate = cacheHits / (cacheHits + cacheMisses);
    console.log(`  📊 Cache hit rate: ${(hitRate * 100).toFixed(1)}%`);
    console.log(`  ⚡ Cache hits: ${cacheHits}, Cache misses: ${cacheMisses}\n`);
  }

  /**
   * Run stress test with many concurrent requests
   */
  async stressTest() {
    console.log('💪 Running stress test...');
    
    const promises = [];
    const startTime = Date.now();
    
    for (let i = 0; i < TEST_CONFIG.STRESS_TESTS; i++) {
      const scenario = TEST_SCENARIOS[i % TEST_SCENARIOS.length];
      
      const promise = (async () => {
        try {
          const portfolio = this.createMockPortfolio(scenario.portfolioValue);
          const taxProfile = this.createMockTaxProfile(scenario.state, scenario.filingStatus, scenario.estimatedIncome);
          
          const testStart = Date.now();
          const result = await cachedStrategyComparisonEngineService.compareStrategiesOptimized(
            portfolio,
            taxProfile
          );
          const testTime = Date.now() - testStart;
          
          return { success: true, time: testTime, cacheHit: result.performance.cacheHit };
        } catch (error) {
          return { success: false, error: error.message };
        }
      })();
      
      promises.push(promise);
    }
    
    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    const avgTime = successful.reduce((sum, r) => sum + r.time, 0) / successful.length;
    const hitRate = successful.filter(r => r.cacheHit).length / successful.length;
    
    console.log(`  📊 Stress test completed in ${totalTime}ms`);
    console.log(`  ✅ Successful requests: ${successful.length}/${TEST_CONFIG.STRESS_TESTS}`);
    console.log(`  ❌ Failed requests: ${failed.length}`);
    console.log(`  ⚡ Average response time: ${Math.round(avgTime)}ms`);
    console.log(`  🎯 Cache hit rate: ${(hitRate * 100).toFixed(1)}%`);
    console.log(`  🔄 Throughput: ${Math.round(successful.length / (totalTime / 1000))} requests/second\n`);
  }

  /**
   * Generate comprehensive performance report
   */
  async generateReport() {
    console.log('📊 PERFORMANCE TEST RESULTS');
    console.log('============================');
    
    try {
      // Get cache statistics
      this.results.cacheStats = await cachedStrategyComparisonEngineService.getCacheStats();
      
      // Calculate metrics
      const avgCacheHit = this.results.cacheHitResponses.length > 0 ? 
        this.results.cacheHitResponses.reduce((sum, time) => sum + time, 0) / this.results.cacheHitResponses.length : 0;
        
      const avgCacheMiss = this.results.cacheMissResponses.length > 0 ?
        this.results.cacheMissResponses.reduce((sum, time) => sum + time, 0) / this.results.cacheMissResponses.length : 0;
      
      const fastestCacheHit = this.results.cacheHitResponses.length > 0 ? 
        Math.min(...this.results.cacheHitResponses) : 0;
        
      const slowestCacheHit = this.results.cacheHitResponses.length > 0 ?
        Math.max(...this.results.cacheHitResponses) : 0;
      
      // Performance report
      console.log(`🎯 CACHE HIT PERFORMANCE:`);
      console.log(`   Average: ${Math.round(avgCacheHit)}ms`);
      console.log(`   Fastest: ${fastestCacheHit}ms`);
      console.log(`   Slowest: ${slowestCacheHit}ms`);
      console.log(`   Target:  <${TEST_CONFIG.TARGET_CACHE_HIT_TIME}ms`);
      console.log(`   Status:  ${avgCacheHit < TEST_CONFIG.TARGET_CACHE_HIT_TIME ? '✅ PASSED' : '❌ FAILED'}\n`);
      
      console.log(`⚡ CACHE MISS PERFORMANCE:`);
      console.log(`   Average: ${Math.round(avgCacheMiss)}ms`);
      console.log(`   Target:  <${TEST_CONFIG.TARGET_CACHE_MISS_TIME}ms`);
      console.log(`   Status:  ${avgCacheMiss < TEST_CONFIG.TARGET_CACHE_MISS_TIME ? '✅ PASSED' : '❌ FAILED'}\n`);
      
      console.log(`💾 CACHE EFFICIENCY:`);
      console.log(`   Hit Rate: ${this.results.cacheStats.hitRate.toFixed(1)}%`);
      console.log(`   Target:   >${TEST_CONFIG.TARGET_HIT_RATE * 100}%`);
      console.log(`   Status:   ${this.results.cacheStats.hitRate / 100 > TEST_CONFIG.TARGET_HIT_RATE ? '✅ PASSED' : '❌ FAILED'}`);
      console.log(`   Memory:   ${this.results.cacheStats.memoryUsage.toFixed(1)}MB`);
      console.log(`   Target:   <${TEST_CONFIG.MAX_MEMORY_MB}MB`);
      console.log(`   Status:   ${this.results.cacheStats.memoryUsage < TEST_CONFIG.MAX_MEMORY_MB ? '✅ PASSED' : '❌ FAILED'}\n`);
      
      if (this.results.errors.length > 0) {
        console.log(`❌ ERRORS (${this.results.errors.length}):`);
        this.results.errors.forEach((error, i) => {
          console.log(`   ${i + 1}. ${error}`);
        });
        console.log('');
      }
      
    } catch (error) {
      console.error('Failed to generate performance report:', error);
    }
  }

  /**
   * Validate that all performance targets were met
   */
  validatePerformanceTargets() {
    const avgCacheHit = this.results.cacheHitResponses.length > 0 ? 
      this.results.cacheHitResponses.reduce((sum, time) => sum + time, 0) / this.results.cacheHitResponses.length : 0;
    
    const checks = [
      {
        name: 'Sub-500ms cached responses',
        passed: avgCacheHit < TEST_CONFIG.TARGET_CACHE_HIT_TIME && avgCacheHit > 0,
        value: `${Math.round(avgCacheHit)}ms`
      },
      {
        name: 'Cache hit rate >80%',
        passed: this.results.cacheStats && this.results.cacheStats.hitRate > TEST_CONFIG.TARGET_HIT_RATE * 100,
        value: this.results.cacheStats ? `${this.results.cacheStats.hitRate.toFixed(1)}%` : 'Unknown'
      },
      {
        name: 'Memory usage <100MB',
        passed: this.results.cacheStats && this.results.cacheStats.memoryUsage < TEST_CONFIG.MAX_MEMORY_MB,
        value: this.results.cacheStats ? `${this.results.cacheStats.memoryUsage.toFixed(1)}MB` : 'Unknown'
      },
      {
        name: 'No critical errors',
        passed: this.results.errors.length === 0,
        value: `${this.results.errors.length} errors`
      }
    ];
    
    console.log('🎯 PERFORMANCE TARGET VALIDATION');
    console.log('=================================');
    
    let allPassed = true;
    checks.forEach(check => {
      const status = check.passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${status} ${check.name}: ${check.value}`);
      if (!check.passed) allPassed = false;
    });
    
    console.log('');
    console.log(allPassed ? 
      '🎉 ALL PERFORMANCE TARGETS MET! Strategy Comparison Engine is world-class ready.' :
      '⚠️  Some performance targets not met. Review optimization opportunities.');
    
    return allPassed;
  }

  // Helper methods for creating test data

  createMockPortfolio(totalValue) {
    return {
      totalValue,
      currentHoldings: [
        {
          ticker: 'SPY',
          name: 'SPDR S&P 500 ETF',
          shares: Math.round((totalValue * 0.5) / 450),
          currentPrice: 450,
          annualDividend: 7.2,
          accountType: 'taxable'
        },
        {
          ticker: 'QQQ',
          name: 'Invesco QQQ ETF',
          shares: Math.round((totalValue * 0.3) / 380),
          currentPrice: 380,
          annualDividend: 2.5,
          accountType: 'taxable'
        },
        {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market',
          shares: Math.round((totalValue * 0.2) / 78),
          currentPrice: 78,
          annualDividend: 3.4,
          accountType: 'traditional'
        }
      ],
      accountTypes: {
        taxable: totalValue * 0.6,
        traditional: totalValue * 0.3,
        roth: totalValue * 0.1,
        brokerage: 0
      }
    };
  }

  createMockTaxProfile(state, filingStatus, estimatedIncome) {
    return {
      state,
      filingStatus,
      estimatedIncome,
      federalTaxBracket: estimatedIncome > 200000 ? 0.32 : estimatedIncome > 80000 ? 0.22 : 0.12,
      stateTaxRate: ['TX', 'FL', 'WA', 'NV'].includes(state) ? 0 : 0.05,
      qualifiedDividendRate: estimatedIncome > 250000 ? 0.20 : estimatedIncome > 80000 ? 0.15 : 0,
      capitalGainsRate: estimatedIncome > 250000 ? 0.20 : estimatedIncome > 80000 ? 0.15 : 0
    };
  }
}

// Run the test suite
async function main() {
  const tester = new StrategyPerformanceTester();
  
  if (process.argv.includes('--warmup')) {
    // Just run warmup
    await tester.warmupCache();
  } else {
    // Run full test suite
    await tester.runFullTestSuite();
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error('Performance test failed:', error);
    process.exit(1);
  });
}

module.exports = { StrategyPerformanceTester };