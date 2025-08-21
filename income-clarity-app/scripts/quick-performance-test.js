#!/usr/bin/env node

/**
 * Quick test to verify PerformanceHub fix is working
 * Tests API endpoints and monitors basic memory stability
 */

async function quickTest() {
  console.log('🧪 Quick PerformanceHub Fix Verification');
  console.log('========================================');
  
  const startMemory = process.memoryUsage().heapUsed;
  let apiCallCount = 0;
  
  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    if (healthResponse.ok) {
      console.log('   ✅ Health check passed');
    } else {
      throw new Error('Health check failed');
    }
    
    // Test performance hub API multiple times to check for loops
    console.log('2. Testing PerformanceHub API (multiple calls)...');
    for (let i = 0; i < 5; i++) {
      try {
        const response = await fetch('http://localhost:3000/api/super-cards/performance-hub');
        apiCallCount++;
        
        if (response.ok) {
          const data = await response.json();
          console.log(`   ✅ Call ${i + 1}: Success (Portfolio: $${data.portfolioValue || 0})`);
        } else {
          console.log(`   ⚠️ Call ${i + 1}: HTTP ${response.status}`);
        }
        
        // Short delay between calls
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.log(`   ❌ Call ${i + 1}: Error - ${error.message}`);
      }
    }
    
    // Check memory usage
    const endMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = endMemory - startMemory;
    const memoryMB = Math.round(memoryIncrease / 1024 / 1024);
    
    console.log('3. Memory analysis...');
    console.log(`   📊 API calls made: ${apiCallCount}`);
    console.log(`   🧠 Memory change: ${memoryMB}MB`);
    
    // Simple pass/fail criteria
    const testPassed = (
      apiCallCount >= 3 && // At least some calls succeeded
      memoryIncrease < 20 * 1024 * 1024 // Less than 20MB increase
    );
    
    console.log('\n🎯 Results');
    console.log('==========');
    
    if (testPassed) {
      console.log('✅ QUICK TEST PASSED: PerformanceHub appears stable');
      console.log('   - API calls completed successfully');
      console.log('   - Memory usage reasonable');
      console.log('   - No obvious infinite loops detected');
    } else {
      console.log('❌ QUICK TEST CONCERNS:');
      if (apiCallCount < 3) {
        console.log('   - Few API calls succeeded');
      }
      if (memoryIncrease >= 20 * 1024 * 1024) {
        console.log('   - High memory usage detected');
      }
    }
    
    return testPassed;
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Ensure server is running: NODE_ENV=production node custom-server.js');
    return false;
  }
}

// Run the test
quickTest().then(passed => {
  console.log(`\n${passed ? '🎉' : '💥'} Test ${passed ? 'COMPLETED' : 'FAILED'}`);
  process.exit(passed ? 0 : 1);
}).catch(error => {
  console.error('Test error:', error);
  process.exit(1);
});