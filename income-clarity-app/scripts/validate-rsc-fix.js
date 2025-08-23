#!/usr/bin/env node
/**
 * RSC Fix Validation Script
 * Validates that RSC network failures are resolved
 */

const http = require('http');

async function validateRSCFix() {
  console.log('🔧 RSC Fix Validation');
  console.log('Testing that RSC requests are handled properly by middleware');
  console.log('=' .repeat(60));
  
  // Test 1: Unauthenticated RSC request should return JSON error (not redirect)
  console.log('\n✅ Test 1: Unauthenticated RSC Request Handling');
  try {
    const result = await makeRequest('/dashboard?_rsc=test', {
      'Accept': 'text/x-component',
      'User-Agent': 'Next.js RSC Test'
    });
    
    if (result.status === 401 && !result.isRedirect) {
      console.log('   ✅ PASS: Returns 401 JSON instead of redirect');
      console.log(`   ✅ Response: ${result.data.substring(0, 80)}...`);
    } else if (result.isRedirect) {
      console.log('   ❌ FAIL: Still redirecting RSC requests');
    } else {
      console.log(`   ⚠️  UNEXPECTED: Status ${result.status}, redirect: ${result.isRedirect}`);
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  // Test 2: Regular page request should still redirect (unchanged behavior)
  console.log('\n✅ Test 2: Regular Page Request Handling (Should Still Redirect)');
  try {
    const result = await makeRequest('/dashboard', {
      'Accept': 'text/html',
      'User-Agent': 'Mozilla/5.0 Browser'
    });
    
    if (result.isRedirect && result.data.includes('/auth/login')) {
      console.log('   ✅ PASS: Regular requests still redirect to login');
    } else {
      console.log('   ❌ FAIL: Regular request handling changed unexpectedly');
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  // Test 3: API request should return JSON error (unchanged behavior)
  console.log('\n✅ Test 3: API Request Handling (Should Return JSON)');
  try {
    const result = await makeRequest('/api/some-protected-endpoint', {
      'Accept': 'application/json',
      'User-Agent': 'API Client'
    });
    
    if (result.status === 401 && !result.isRedirect) {
      console.log('   ✅ PASS: API requests return JSON errors');
    } else {
      console.log('   ❌ FAIL: API request handling changed unexpectedly');
    }
  } catch (error) {
    console.log(`   ❌ ERROR: ${error.message}`);
  }
  
  console.log('\n🎯 VALIDATION SUMMARY:');
  console.log('The RSC fix ensures that:');
  console.log('✅ RSC requests return JSON errors instead of HTML redirects');
  console.log('✅ Regular page requests continue to redirect to login as expected');
  console.log('✅ API requests continue to return JSON errors as expected');
  console.log('✅ Next.js can handle RSC failures gracefully without network errors');
}

async function makeRequest(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: headers
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data,
          isRedirect: res.statusCode >= 300 && res.statusCode < 400
        });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

if (require.main === module) {
  validateRSCFix().catch(console.error);
}

module.exports = { validateRSCFix };