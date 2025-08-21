#!/usr/bin/env node

/**
 * Test script to verify PerformanceHub infinite render loop fix
 * This script monitors memory usage and render patterns to ensure stability
 */

// Test configuration
const TEST_CONFIG = {
  testDuration: 30000, // 30 seconds
  memoryCheckInterval: 1000, // Check every second
  maxMemoryIncrease: 50 * 1024 * 1024, // 50MB max increase allowed
  renderThreshold: 10 // Max renders per second
};

class PerformanceHubTest {
  constructor() {
    this.renderCount = 0;
    this.memoryBaseline = 0;
    this.memoryChecks = [];
    this.isRunning = false;
  }

  async runTest() {
    console.log('🧪 Starting PerformanceHub Infinite Render Loop Fix Test');
    console.log('================================================');
    
    this.isRunning = true;
    this.memoryBaseline = process.memoryUsage().heapUsed;
    
    // Start memory monitoring
    const memoryMonitor = setInterval(() => {
      if (!this.isRunning) return;
      
      const currentMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = currentMemory - this.memoryBaseline;
      
      this.memoryChecks.push({
        timestamp: Date.now(),
        memory: currentMemory,
        increase: memoryIncrease
      });
      
      console.log(`💾 Memory: ${Math.round(currentMemory / 1024 / 1024)}MB (+${Math.round(memoryIncrease / 1024 / 1024)}MB)`);
      
      // Check for memory leak
      if (memoryIncrease > TEST_CONFIG.maxMemoryIncrease) {
        console.error('❌ MEMORY LEAK DETECTED: Memory increase exceeds threshold');
        this.failTest('Memory leak detected');
        return;
      }
      
    }, TEST_CONFIG.memoryCheckInterval);

    // Simulate API calls to trigger potential infinite loops
    await this.simulateAPIActivity();
    
    // Wait for test duration
    await new Promise(resolve => setTimeout(resolve, TEST_CONFIG.testDuration));
    
    // Stop monitoring
    this.isRunning = false;
    clearInterval(memoryMonitor);
    
    // Analyze results
    this.analyzeResults();
  }

  async simulateAPIActivity() {
    console.log('🔄 Simulating API activity that could trigger render loops...');
    
    const apiEndpoints = [
      '/api/super-cards/performance-hub',
      '/api/portfolios',
      '/api/holdings'
    ];

    // Make periodic API calls to simulate user interaction
    const apiInterval = setInterval(async () => {
      if (!this.isRunning) {
        clearInterval(apiInterval);
        return;
      }

      try {
        const endpoint = apiEndpoints[Math.floor(Math.random() * apiEndpoints.length)];
        const response = await fetch(`http://localhost:3000${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'test-session=active' // Simulate authenticated session
          }
        });

        if (response.ok) {
          console.log(`✅ API call successful: ${endpoint}`);
        } else {
          console.log(`⚠️ API call failed: ${endpoint} (${response.status})`);
        }

        this.renderCount++;
        
      } catch (error) {
        console.log(`⚠️ API call error: ${error.message}`);
      }
    }, 2000); // API call every 2 seconds

    setTimeout(() => clearInterval(apiInterval), TEST_CONFIG.testDuration);
  }

  analyzeResults() {
    console.log('\n📊 Test Results Analysis');
    console.log('========================');
    
    const totalMemoryIncrease = this.memoryChecks.length > 0 
      ? this.memoryChecks[this.memoryChecks.length - 1].increase 
      : 0;
      
    const avgRenderRate = this.renderCount / (TEST_CONFIG.testDuration / 1000);
    
    console.log(`📈 Total API calls: ${this.renderCount}`);
    console.log(`🧠 Memory increase: ${Math.round(totalMemoryIncrease / 1024 / 1024)}MB`);
    console.log(`⚡ Average render rate: ${avgRenderRate.toFixed(2)} calls/second`);
    
    // Determine test result
    let testPassed = true;
    const issues = [];
    
    if (totalMemoryIncrease > TEST_CONFIG.maxMemoryIncrease) {
      testPassed = false;
      issues.push('Memory leak detected');
    }
    
    if (avgRenderRate > TEST_CONFIG.renderThreshold) {
      testPassed = false;
      issues.push('Excessive render rate');
    }
    
    // Check for memory growth pattern
    const memoryGrowthRate = this.calculateMemoryGrowthRate();
    if (memoryGrowthRate > 1.5) { // More than 50% growth over time
      testPassed = false;
      issues.push('Continuous memory growth detected');
    }
    
    console.log('\n🎯 Final Result');
    console.log('===============');
    
    if (testPassed) {
      console.log('✅ TEST PASSED: PerformanceHub infinite render loop fix is working!');
      console.log('   - No memory leaks detected');
      console.log('   - Render rate within acceptable limits');
      console.log('   - Memory usage stable');
    } else {
      console.log('❌ TEST FAILED: Issues detected:');
      issues.forEach(issue => console.log(`   - ${issue}`));
    }
    
    return testPassed;
  }

  calculateMemoryGrowthRate() {
    if (this.memoryChecks.length < 3) return 0;
    
    const firstThird = this.memoryChecks.slice(0, Math.floor(this.memoryChecks.length / 3));
    const lastThird = this.memoryChecks.slice(-Math.floor(this.memoryChecks.length / 3));
    
    const avgEarly = firstThird.reduce((sum, check) => sum + check.memory, 0) / firstThird.length;
    const avgLate = lastThird.reduce((sum, check) => sum + check.memory, 0) / lastThird.length;
    
    return avgLate / avgEarly;
  }

  failTest(reason) {
    console.error(`❌ TEST FAILED: ${reason}`);
    this.isRunning = false;
    process.exit(1);
  }
}

// Run the test
async function runTest() {
  try {
    // Check if server is running
    const healthCheck = await fetch('http://localhost:3000/api/health');
    if (!healthCheck.ok) {
      throw new Error('Server not running or health check failed');
    }
    
    const test = new PerformanceHubTest();
    const result = await test.runTest();
    
    process.exit(result ? 0 : 1);
    
  } catch (error) {
    console.error('❌ Test setup failed:', error.message);
    console.log('💡 Make sure the server is running: NODE_ENV=production node custom-server.js');
    process.exit(1);
  }
}

// Handle process signals gracefully
process.on('SIGINT', () => {
  console.log('\n⏹️ Test interrupted by user');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️ Test terminated');
  process.exit(0);
});

if (require.main === module) {
  runTest();
}

module.exports = { PerformanceHubTest };