/**
 * Test Stock Price API Implementation
 * This script tests all aspects of the stock price API integration
 */

const API_BASE = 'http://localhost:3000/api';

async function testAPI(description, url, expectedStatus = 200) {
  // console.log(`\n🧪 Testing: ${description}`);
  // console.log(`📋 URL: ${url}`);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    // console.log(`✅ Status: ${response.status} (expected: ${expectedStatus})`);
    // console.log(`📄 Response:`, JSON.stringify(data, null, 2));
    
    if (response.status === expectedStatus) {
      // console.log(`✅ PASS: ${description}`);
      return { success: true, data };
    } else {
      // console.log(`❌ FAIL: Expected status ${expectedStatus}, got ${response.status}`);
      return { success: false, data };
    }
  } catch (error) {
    // console.log(`❌ ERROR: ${error.message}`);
    return { success: false, error };
  }
}

async function testHealthCheck() {
  // console.log(`\n🏥 Testing Health Check`);
  
  try {
    const response = await fetch(`${API_BASE}/stock-price`, {
      method: 'OPTIONS'
    });
    const data = await response.json();
    
    // console.log(`✅ Health Status: ${data.status}`);
    // console.log(`📊 Cache Stats:`, data.cacheStats);
    // console.log(`🔑 Has API Key: ${data.hasApiKey}`);
    // console.log(`🏢 Provider: ${data.apiProvider}`);
    
    return data;
  } catch (error) {
    // console.log(`❌ Health Check Failed: ${error.message}`);
    return null;
  }
}

async function runAllTests() {
  // console.log('🚀 Starting Stock Price API Test Suite');
  // console.log('==========================================');
  
  const results = [];
  
  // Health Check
  await testHealthCheck();
  
  // Test 1: Missing ticker parameter
  results.push(await testAPI(
    'Missing ticker parameter',
    `${API_BASE}/stock-price`,
    400
  ));
  
  // Test 2: Invalid ticker format (too long)
  results.push(await testAPI(
    'Invalid ticker format (too long)',
    `${API_BASE}/stock-price?ticker=INVALID123`,
    400
  ));
  
  // Test 3: Invalid ticker format (numbers)
  results.push(await testAPI(
    'Invalid ticker format (with numbers)',
    `${API_BASE}/stock-price?ticker=ABC123`,
    400
  ));
  
  // Test 4: Valid ticker format but no API key (should show API error)
  results.push(await testAPI(
    'Valid ticker but no API key configured',
    `${API_BASE}/stock-price?ticker=AAPL`,
    502
  ));
  
  // Test 5: Another valid ticker
  results.push(await testAPI(
    'Another valid ticker (JEPI)',
    `${API_BASE}/stock-price?ticker=JEPI`,
    502
  ));
  
  // Test 6: Edge case - single letter ticker
  results.push(await testAPI(
    'Single letter ticker',
    `${API_BASE}/stock-price?ticker=F`,
    502
  ));
  
  // Test 7: Case sensitivity test
  results.push(await testAPI(
    'Lowercase ticker (should be normalized)',
    `${API_BASE}/stock-price?ticker=spy`,
    502
  ));
  
  // Summary
  // console.log('\n📊 TEST SUMMARY');
  // console.log('=================');
  
  const passed = results.filter(r => r.success).length;
  const total = results.length;
  
  // console.log(`✅ Passed: ${passed}/${total} tests`);
  // console.log(`❌ Failed: ${total - passed}/${total} tests`);
  
  if (passed === total) {
    // console.log('🎉 ALL TESTS PASSED!');
    // console.log('✅ API endpoint is working correctly');
    // console.log('✅ Error handling is functional');
    // console.log('✅ Validation logic is working');
    // console.log('✅ Ready for API key configuration');
  } else {
    // console.log('⚠️  Some tests failed - check implementation');
  }
  
  // Test instructions
  // console.log('\n🔧 SETUP INSTRUCTIONS');
  // console.log('=======================');
  // console.log('To enable live stock price fetching:');
  // console.log('1. Sign up for a free IEX Cloud account at https://iexcloud.io');
  // console.log('2. Get your API token from the console');
  // console.log('3. Add to your .env.local file:');
  // console.log('   IEX_CLOUD_API_KEY=pk_test_your_token_here');
  // console.log('4. Restart the development server');
  // console.log('5. Test with: curl "http://localhost:3000/api/stock-price?ticker=AAPL"');
  
  // console.log('\n🎯 INTEGRATION TESTING');
  // console.log('========================');
  // console.log('To test the frontend integration:');
  // console.log('1. Navigate to http://localhost:3000/dashboard');
  // console.log('2. Click on any portfolio management section');
  // console.log('3. Add a new holding');
  // console.log('4. Enter a ticker symbol (e.g., AAPL) and blur the field');
  // console.log('5. Check if the price field auto-populates (requires API key)');
  // console.log('6. Verify the refresh button works');
  // console.log('7. Test error cases with invalid tickers');
}

// Run tests if this script is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = { testAPI, testHealthCheck, runAllTests };