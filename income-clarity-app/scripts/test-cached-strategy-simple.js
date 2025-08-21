#!/usr/bin/env node

/**
 * Simple test of cached strategy comparison service
 * Tests basic functionality and performance
 */

console.log('🧪 Testing Cached Strategy Comparison Engine...\n');

async function simpleTest() {
  try {
    // Import the service
    const { cachedStrategyComparisonEngineService } = require('../lib/services/strategy-comparison/cached-strategy-comparison-engine.service');
    
    console.log('✅ Service imported successfully');

    // Create test portfolio and tax profile
    const testPortfolio = {
      totalValue: 500000,
      currentHoldings: [
        {
          ticker: 'SPY',
          name: 'SPDR S&P 500 ETF',
          shares: 555,
          currentPrice: 450,
          annualDividend: 7.2,
          accountType: 'taxable'
        },
        {
          ticker: 'BND',
          name: 'Vanguard Total Bond Market',
          shares: 1282,
          currentPrice: 78,
          annualDividend: 3.4,
          accountType: 'traditional'
        }
      ],
      accountTypes: {
        taxable: 300000,
        traditional: 150000,
        roth: 50000,
        brokerage: 0
      }
    };

    const testTaxProfile = {
      state: 'CA',
      filingStatus: 'single',
      estimatedIncome: 150000,
      federalTaxBracket: 0.22,
      stateTaxRate: 0.093,
      qualifiedDividendRate: 0.15,
      capitalGainsRate: 0.15
    };

    console.log('📊 Test data created');

    // Test 1: Cold start (cache miss)
    console.log('\n🔥 Test 1: Cold start calculation (cache miss expected)');
    const startTime1 = Date.now();
    
    const result1 = await cachedStrategyComparisonEngineService.compareStrategiesOptimized(
      testPortfolio,
      testTaxProfile,
      { forceRefresh: true }
    );
    
    const time1 = Date.now() - startTime1;
    console.log(`⏱️  Response time: ${time1}ms (Cache Hit: ${result1.performance.cacheHit})`);
    console.log(`💰 Annual improvement potential: $${result1.gapAnalysis.annualIncomeImprovement.toLocaleString()}`);

    // Test 2: Cached response (should be faster)
    console.log('\n🚀 Test 2: Cached calculation (cache hit expected)');
    const startTime2 = Date.now();
    
    const result2 = await cachedStrategyComparisonEngineService.compareStrategiesOptimized(
      testPortfolio,
      testTaxProfile
    );
    
    const time2 = Date.now() - startTime2;
    console.log(`⏱️  Response time: ${time2}ms (Cache Hit: ${result2.performance.cacheHit})`);
    console.log(`💰 Annual improvement potential: $${result2.gapAnalysis.annualIncomeImprovement.toLocaleString()}`);

    // Test 3: Performance validation
    console.log('\n🎯 Performance Validation:');
    console.log(`   Cache Hit Target: < 500ms`);
    console.log(`   Actual Cache Hit: ${time2}ms ${time2 < 500 ? '✅' : '❌'}`);
    console.log(`   Cache Miss Target: < 3000ms`);
    console.log(`   Actual Cache Miss: ${time1}ms ${time1 < 3000 ? '✅' : '❌'}`);

    // Test 4: Cache stats
    console.log('\n📈 Cache Statistics:');
    const stats = await cachedStrategyComparisonEngineService.getCacheStats();
    console.log(`   Hit Rate: ${stats.hitRate.toFixed(1)}%`);
    console.log(`   Avg Response Time: ${Math.round(stats.avgResponseTime)}ms`);
    console.log(`   Memory Usage: ${stats.memoryUsage.toFixed(1)}MB`);
    console.log(`   Efficiency: ${stats.cacheEfficiency}`);

    // Overall result
    const performanceGood = time2 < 500 && time1 < 3000;
    console.log('\n🏆 OVERALL RESULT:');
    console.log(`   Status: ${performanceGood ? '✅ PERFORMANCE TARGETS MET' : '⚠️ NEEDS OPTIMIZATION'}`);
    
    if (performanceGood) {
      console.log('   🎉 Strategy Comparison Engine caching is working optimally!');
      console.log('   📊 Sub-500ms cached responses achieved');
      console.log('   🚀 Ready for production workloads');
    } else {
      console.log('   🔧 Performance optimization needed');
    }

    return performanceGood;

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack.split('\n').slice(0, 5).join('\n'));
    }
    return false;
  }
}

// Run the test
simpleTest()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });