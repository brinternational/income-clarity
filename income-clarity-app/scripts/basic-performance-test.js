#!/usr/bin/env node

/**
 * Basic Performance Test
 * 
 * Tests server responsiveness without authentication
 * Identifies if the server is functioning at all
 */

const BASE_URL = 'http://localhost:3000';

async function testBasicConnectivity() {
  console.log('🔍 Testing basic server connectivity...\n');
  
  const endpoints = [
    '/',
    '/api/test/performance',
    '/api/test-performance',
    '/api/health',
    '/auth/login',
    '/dashboard',
  ];

  for (const endpoint of endpoints) {
    try {
      const startTime = performance.now();
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'GET',
        timeout: 10000 // 10 second timeout
      });
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      const status = response.ok ? '✅' : '❌';
      console.log(`${status} ${endpoint}: ${response.status} (${responseTime}ms)`);
      
      if (!response.ok && responseTime > 2000) {
        console.log(`   🚨 CRITICAL: >2s response time with error status`);
      }
      
    } catch (error) {
      console.log(`❌ ${endpoint}: ERROR - ${error.message}`);
    }
  }
}

async function main() {
  await testBasicConnectivity();
  console.log('\n📊 Basic connectivity test complete');
}

main().catch(console.error);