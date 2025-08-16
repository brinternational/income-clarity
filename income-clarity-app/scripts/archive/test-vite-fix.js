#!/usr/bin/env node

/**
 * Test script to verify that Vite/React 404 errors have been fixed
 * 
 * This script tests that:
 * 1. Vite-specific requests return 204 No Content (not 404)
 * 2. Legitimate Next.js routes still work
 * 3. The server logs are clean
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

const viteRequests = [
  '/src/components/layout/Header.tsx',
  '/src/components/layout/BottomNav.tsx', 
  '/src/services/FIRECalculatorService.ts',
  '/@vite/client',
  '/src/App.tsx',
  '/src/main.tsx',
  '/src/index.css',
  '/vite.config.js'
];

const legitimateRequests = [
  '/',
  '/dashboard', 
  '/auth/login',
  '/profile'
];

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'HEAD'
    };

    const req = http.request(options, (res) => {
      resolve({
        path,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        headers: res.headers
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error(`Request timeout for ${path}`));
    });

    req.end();
  });
}

async function testViteFix() {
  // console.log('🧪 Testing Vite/React 404 Fix');
  // console.log('=' .repeat(50));
  
  let allPassed = true;

  // Test Vite requests should return 204
  // console.log('\n📦 Testing Vite requests (should return 204 No Content):');
  for (const path of viteRequests) {
    try {
      const result = await makeRequest(path);
      const expected = 204;
      const actual = result.statusCode;
      const passed = actual === expected;
      
      // console.log(`${passed ? '✅' : '❌'} ${path}: ${actual} ${result.statusMessage}`);
      
      if (passed && result.headers['x-blocked-reason']) {
        // console.log(`   🛡️  Blocked reason: ${result.headers['x-blocked-reason']}`);
      }
      
      if (!passed) {
        allPassed = false;
        // console.log(`   ❌  Expected ${expected}, got ${actual}`);
      }
    } catch (error) {
      // console.log(`❌ ${path}: Error - ${error.message}`);
      allPassed = false;
    }
  }

  // Test legitimate requests should work
  // console.log('\n🌐 Testing legitimate Next.js routes (should return 200 or 302):');
  for (const path of legitimateRequests) {
    try {
      const result = await makeRequest(path);
      const actual = result.statusCode;
      const passed = actual === 200 || actual === 302; // 302 for redirects
      
      // console.log(`${passed ? '✅' : '❌'} ${path}: ${actual} ${result.statusMessage}`);
      
      if (!passed) {
        allPassed = false;  
        // console.log(`   ❌  Expected 200 or 302, got ${actual}`);
      }
    } catch (error) {
      // console.log(`❌ ${path}: Error - ${error.message}`);
      allPassed = false;
    }
  }

  // Summary
  // console.log('\n' + '=' .repeat(50));
  if (allPassed) {
    // console.log('🎉 ALL TESTS PASSED! Vite/React 404 errors have been fixed.');
    // console.log('✅ Vite requests now return 204 No Content (no more 404s)');
    // console.log('✅ Legitimate Next.js routes still work correctly');
    // console.log('✅ Server logs should be clean of Vite-related 404 errors');
  } else {
    // console.log('❌ SOME TESTS FAILED! Please check the issues above.');
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  testViteFix().catch(error => {
    // console.error('Test script error:', error);
    process.exit(1);
  });
}

module.exports = { testViteFix };