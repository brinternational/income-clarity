#!/usr/bin/env node

/**
 * API Performance Test Script
 * Tests actual API endpoints to verify end-to-end performance improvements
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// console.log('🌐 API Performance Testing for Income Clarity Lite\n');
// console.log(`Testing against: ${BASE_URL}\n`);

// API endpoints to test
const apiTests = [
  {
    name: 'Health Check',
    endpoint: '/api/health-check',
    method: 'GET'
  },
  {
    name: 'Portfolio Hub API',
    endpoint: '/api/portfolio-hub',
    method: 'GET'
  },
  {
    name: 'Performance Hub API',
    endpoint: '/api/performance-hub',
    method: 'GET'
  },
  {
    name: 'Income Hub API',
    endpoint: '/api/income-hub',
    method: 'GET'
  },
  {
    name: 'Tax Hub API',
    endpoint: '/api/tax-hub',
    method: 'GET'
  },
  {
    name: 'Planning Hub API',
    endpoint: '/api/planning-hub',
    method: 'GET'
  },
  {
    name: 'Super Cards API',
    endpoint: '/api/super-cards',
    method: 'GET'
  },
  {
    name: 'Portfolios API',
    endpoint: '/api/portfolios',
    method: 'GET'
  },
  {
    name: 'Holdings API',
    endpoint: '/api/holdings',
    method: 'GET'
  },
  {
    name: 'Stock Price API',
    endpoint: '/api/stock-price?symbol=SPY',
    method: 'GET'
  }
];

// Function to make HTTP request with timing
function makeRequest(endpoint, method = 'GET') {
  return new Promise((resolve) => {
    const url = new URL(endpoint, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const startTime = process.hrtime.bigint();
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'User-Agent': 'IncomeClarity-Performance-Test/1.0',
        'Accept': 'application/json',
        'Connection': 'keep-alive'
      },
      timeout: 10000 // 10 second timeout
    };
    
    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
        
        let parsedData = null;
        let dataSize = data.length;
        
        try {
          if (res.headers['content-type']?.includes('application/json')) {
            parsedData = JSON.parse(data);
          }
        } catch (e) {
          // Not JSON or invalid JSON
        }
        
        resolve({
          success: true,
          statusCode: res.statusCode,
          duration,
          dataSize,
          contentType: res.headers['content-type'],
          headers: res.headers,
          data: parsedData,
          rawData: data.substring(0, 200) + (data.length > 200 ? '...' : '') // First 200 chars for debugging
        });
      });
    });
    
    req.on('error', (error) => {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1000000;
      
      resolve({
        success: false,
        error: error.message,
        duration
      });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Request timeout',
        duration: 10000
      });
    });
    
    req.end();
  });
}

// Run performance test on an endpoint
async function testEndpoint(testConfig) {
  // console.log(`📊 Testing: ${testConfig.name}`);
  // console.log(`   🔗 ${testConfig.method} ${testConfig.endpoint}`);
  
  const iterations = 5;
  const results = [];
  
  // Warm-up request
  await makeRequest(testConfig.endpoint, testConfig.method);
  
  // Run multiple iterations for accurate timing
  for (let i = 0; i < iterations; i++) {
    const result = await makeRequest(testConfig.endpoint, testConfig.method);
    results.push(result);
    
    // Small delay between requests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Analyze results
  const successfulResults = results.filter(r => r.success);
  const failedResults = results.filter(r => !r.success);
  
  if (successfulResults.length === 0) {
    // console.log(`   ❌ All requests failed`);
    failedResults.forEach((result, index) => {
      // console.log(`      ${index + 1}. ${result.error}`);
    });
    return {
      name: testConfig.name,
      endpoint: testConfig.endpoint,
      success: false,
      error: 'All requests failed'
    };
  }
  
  const avgTime = successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length;
  const minTime = Math.min(...successfulResults.map(r => r.duration));
  const maxTime = Math.max(...successfulResults.map(r => r.duration));
  const avgSize = Math.round(successfulResults.reduce((sum, r) => sum + r.dataSize, 0) / successfulResults.length);
  
  // Get status codes
  const statusCodes = [...new Set(successfulResults.map(r => r.statusCode))];
  const contentTypes = [...new Set(successfulResults.map(r => r.contentType))];
  
  // console.log(`   ⏱️  Avg: ${avgTime.toFixed(2)}ms | Min: ${minTime.toFixed(2)}ms | Max: ${maxTime.toFixed(2)}ms`);
  // console.log(`   📋 Status: ${statusCodes.join(', ')} | Size: ${(avgSize/1024).toFixed(2)}KB | Success: ${successfulResults.length}/${iterations}`);
  // console.log(`   📄 Type: ${contentTypes.join(', ')}`);
  
  // Show first successful response preview
  const firstSuccess = successfulResults[0];
  if (firstSuccess.data && typeof firstSuccess.data === 'object') {
    const keys = Object.keys(firstSuccess.data);
    // console.log(`   🔍 Response keys: ${keys.slice(0, 5).join(', ')}${keys.length > 5 ? '...' : ''}`);
  }
  
  if (failedResults.length > 0) {
    // console.log(`   ⚠️  ${failedResults.length} requests failed:`);
    failedResults.forEach((result, index) => {
      // console.log(`      ${index + 1}. ${result.error}`);
    });
  }
  
  return {
    name: testConfig.name,
    endpoint: testConfig.endpoint,
    success: true,
    avgTime,
    minTime,
    maxTime,
    avgSize,
    successRate: (successfulResults.length / iterations) * 100,
    statusCodes,
    contentTypes,
    iterations
  };
}

// Check if server is running
async function checkServerHealth() {
  // console.log('🔍 Checking server health...\n');
  
  try {
    const result = await makeRequest('/api/health-check', 'GET');
    if (result.success && result.statusCode === 200) {
      // console.log('✅ Server is running and responsive');
      // console.log(`   Response time: ${result.duration.toFixed(2)}ms`);
      // console.log(`   Status: ${result.statusCode}\n`);
      return true;
    } else {
      // console.log(`❌ Server health check failed: ${result.statusCode || result.error}`);
      return false;
    }
  } catch (error) {
    // console.log(`❌ Cannot connect to server: ${error.message}`);
    return false;
  }
}

// Main execution
async function runPerformanceTests() {
  const serverHealthy = await checkServerHealth();
  
  if (!serverHealthy) {
    // console.log('\n⚠️  Server is not responding. Please ensure:');
    // console.log('   1. The development server is running (npm run dev)');
    // console.log('   2. The server is accessible at', BASE_URL);
    // console.log('   3. No firewall is blocking the connection');
    return;
  }
  
  // console.log('🚀 Running API Performance Tests...\n');
  
  const results = [];
  
  // Test each endpoint
  for (const test of apiTests) {
    const result = await testEndpoint(test);
    results.push(result);
    // console.log(); // Add spacing between tests
    
    // Small delay between different endpoints
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Generate performance report
  // console.log('📈 API Performance Summary\n');
  
  const successfulResults = results.filter(r => r.success);
  const failedResults = results.filter(r => !r.success);
  
  // console.log(`📊 Overall Results:`);
  // console.log(`   Total endpoints tested: ${results.length}`);
  // console.log(`   Successful tests: ${successfulResults.length}`);
  // console.log(`   Failed tests: ${failedResults.length}`);
  
  if (successfulResults.length > 0) {
    const totalTime = successfulResults.reduce((sum, r) => sum + r.avgTime, 0);
    const avgResponseTime = totalTime / successfulResults.length;
    const avgSuccessRate = successfulResults.reduce((sum, r) => sum + r.successRate, 0) / successfulResults.length;
    
    // console.log(`   Average response time: ${avgResponseTime.toFixed(2)}ms`);
    // console.log(`   Average success rate: ${avgSuccessRate.toFixed(1)}%`);
    
    // Performance categories
    const fastAPIs = successfulResults.filter(r => r.avgTime < 100);
    const mediumAPIs = successfulResults.filter(r => r.avgTime >= 100 && r.avgTime < 500);
    const slowAPIs = successfulResults.filter(r => r.avgTime >= 500);
    
    // console.log(`\n🚦 Performance Categories:`);
    // console.log(`   🟢 Fast (<100ms): ${fastAPIs.length} endpoints`);
    // console.log(`   🟡 Medium (100-500ms): ${mediumAPIs.length} endpoints`);
    // console.log(`   🔴 Slow (>500ms): ${slowAPIs.length} endpoints`);
    
    // Show slow endpoints if any
    if (slowAPIs.length > 0) {
      // console.log(`\n⚠️  Slow Endpoints:`);
      slowAPIs.forEach(api => {
        // console.log(`   • ${api.name}: ${api.avgTime.toFixed(2)}ms`);
      });
    }
    
    // Performance targets assessment
    // console.log(`\n🎯 Performance Target Assessment:`);
    const under200ms = successfulResults.filter(r => r.avgTime < 200).length;
    const under100ms = successfulResults.filter(r => r.avgTime < 100).length;
    const under50ms = successfulResults.filter(r => r.avgTime < 50).length;
    
    // console.log(`   ✅ Under 200ms: ${under200ms}/${successfulResults.length} (${(under200ms/successfulResults.length*100).toFixed(1)}%)`);
    // console.log(`   ✅ Under 100ms: ${under100ms}/${successfulResults.length} (${(under100ms/successfulResults.length*100).toFixed(1)}%)`);
    // console.log(`   ✅ Under 50ms: ${under50ms}/${successfulResults.length} (${(under50ms/successfulResults.length*100).toFixed(1)}%)`);
  }
  
  if (failedResults.length > 0) {
    // console.log(`\n❌ Failed Endpoints:`);
    failedResults.forEach(result => {
      // console.log(`   • ${result.name} (${result.endpoint}): ${result.error}`);
    });
  }
  
  // console.log('\n✅ API performance testing complete!');
  
  // Recommendations based on results
  if (successfulResults.length > 0) {
    const avgResponseTime = successfulResults.reduce((sum, r) => sum + r.avgTime, 0) / successfulResults.length;
    
    // console.log('\n💡 Recommendations:');
    if (avgResponseTime < 100) {
      // console.log('   🎉 Excellent performance! All APIs are responding quickly.');
    } else if (avgResponseTime < 200) {
      // console.log('   ✅ Good performance. Consider optimizing slower endpoints.');
    } else {
      // console.log('   ⚠️  Performance needs improvement. Focus on database query optimization.');
    }
  }
}

// Run the tests
runPerformanceTests().catch(console.error);