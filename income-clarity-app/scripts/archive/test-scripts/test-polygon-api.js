#!/usr/bin/env node

/**
 * Test Polygon API Connection
 * Verifies that the Polygon API key is working correctly
 */

const https = require('https');

const API_KEY = process.env.POLYGON_API_KEY || 'ImksH64K_m3BjrjtSpQVYt0i3vjeopXa';
const TEST_SYMBOL = 'SPY';

// console.log('🔌 Testing Polygon API Connection...\n');

// Test function
function testPolygonAPI() {
  return new Promise((resolve, reject) => {
    const url = `https://api.polygon.io/v2/aggs/ticker/${TEST_SYMBOL}/prev?adjusted=true&apikey=${API_KEY}`;
    
    // console.log(`📡 Testing API endpoint: /v2/aggs/ticker/${TEST_SYMBOL}/prev`);
    // console.log(`🔑 Using API Key: ${API_KEY.substring(0, 8)}...${API_KEY.substring(API_KEY.length - 4)}`);
    
    const startTime = Date.now();
    
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        
        try {
          const parsedData = JSON.parse(data);
          
          // console.log(`⏱️  Response Time: ${responseTime}ms`);
          // console.log(`📊 HTTP Status: ${res.statusCode}`);
          // console.log(`📄 Content-Type: ${res.headers['content-type']}`);
          // console.log(`💾 Response Size: ${data.length} bytes\n`);
          
          if (res.statusCode === 200) {
            if (parsedData.status === 'OK' && parsedData.results && parsedData.results.length > 0) {
              const result = parsedData.results[0];
              // console.log('✅ API Test SUCCESSFUL!');
              // console.log(`📈 ${TEST_SYMBOL} Previous Day Data:`);
              // console.log(`   Open: $${result.o}`);
              // console.log(`   High: $${result.h}`);
              // console.log(`   Low: $${result.l}`);
              // console.log(`   Close: $${result.c}`);
              // console.log(`   Volume: ${result.v.toLocaleString()}`);
              // console.log(`   Date: ${new Date(result.t).toDateString()}`);
              resolve(true);
            } else {
              // console.log('❌ API Test FAILED: Invalid response structure');
              // console.log('Response:', JSON.stringify(parsedData, null, 2));
              resolve(false);
            }
          } else if (res.statusCode === 401) {
            // console.log('❌ API Test FAILED: Unauthorized (Invalid API Key)');
            // console.log('Response:', parsedData.error || data);
            resolve(false);
          } else if (res.statusCode === 403) {
            // console.log('❌ API Test FAILED: Forbidden (API Key may not have required permissions)');
            // console.log('Response:', parsedData.error || data);
            resolve(false);
          } else if (res.statusCode === 429) {
            // console.log('❌ API Test FAILED: Rate Limited');
            // console.log('Response:', parsedData.error || data);
            resolve(false);
          } else {
            // console.log(`❌ API Test FAILED: HTTP ${res.statusCode}`);
            // console.log('Response:', parsedData.error || data);
            resolve(false);
          }
        } catch (error) {
          // console.log('❌ API Test FAILED: Invalid JSON response');
          // console.log('Raw response:', data);
          // console.log('Parse error:', error.message);
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      // console.log('❌ API Test FAILED: Network error');
      // console.log('Error:', error.message);
      resolve(false);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      // console.log('❌ API Test FAILED: Request timeout (10s)');
      resolve(false);
    });
  });
}

// Run the test
async function main() {
  try {
    const success = await testPolygonAPI();
    
    // console.log('\n📋 Test Summary:');
    // console.log(`   API Status: ${success ? '✅ Working' : '❌ Failed'}`);
    // console.log(`   Test Date: ${new Date().toISOString()}`);
    // console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (success) {
      // console.log('\n🎉 Polygon API is working correctly!');
      // console.log('   ✓ Authentication successful');
      // console.log('   ✓ API response valid');
      // console.log('   ✓ Data structure correct');
    } else {
      // console.log('\n⚠️  Polygon API test failed!');
      // console.log('   Check your API key and network connection');
    }
    
    process.exit(success ? 0 : 1);
    
  } catch (error) {
    // console.error('❌ Test execution failed:', error);
    process.exit(1);
  }
}

main();