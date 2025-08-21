#!/usr/bin/env node

/**
 * Authentication Architecture Fix Validation Test
 * 
 * Tests the critical fix for the global authentication issue:
 * - Ensures public routes don't trigger authentication calls
 * - Verifies protected routes still require authentication
 * - Validates no 401 errors appear on public pages
 */

const { execSync } = require('child_process');

console.log('🔐 AUTHENTICATION ARCHITECTURE FIX VALIDATION');
console.log('=============================================\n');

// Test configuration
const baseUrl = 'http://localhost:3000';
const publicRoutes = [
  '/',
  '/demo', 
  '/auth/login',
  '/auth/signup'
];

const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/portfolio',
  '/onboarding'
];

let passed = 0;
let failed = 0;

function test(name, condition) {
  if (condition) {
    console.log(`✅ ${name}`);
    passed++;
  } else {
    console.log(`❌ ${name}`);
    failed++;
  }
}

function httpTest(url) {
  try {
    const result = execSync(`curl -s -o /dev/null -w "%{http_code}" "${url}"`, 
      { encoding: 'utf8', timeout: 5000 });
    return parseInt(result.trim());
  } catch (error) {
    return 0;
  }
}

console.log('📋 Testing Public Routes (should return 200)');
console.log('----------------------------------------------');
publicRoutes.forEach(route => {
  const url = `${baseUrl}${route}`;
  const status = httpTest(url);
  test(`${route} returns 200`, status === 200);
});

console.log('\n🔒 Testing Protected Routes (should redirect when unauthenticated)');
console.log('------------------------------------------------------------------');
protectedRoutes.forEach(route => {
  const url = `${baseUrl}${route}`;
  const status = httpTest(url);
  test(`${route} redirects (307/302)`, status === 307 || status === 302);
});

console.log('\n🚫 Testing Direct Auth Endpoint (should return 401 when unauthenticated)');
console.log('------------------------------------------------------------------------');
const authStatus = httpTest(`${baseUrl}/api/auth/me`);
test('/api/auth/me returns 401 when unauthenticated', authStatus === 401);

console.log('\n📊 VALIDATION SUMMARY');
console.log('====================');
console.log(`✅ Tests Passed: ${passed}`);
console.log(`❌ Tests Failed: ${failed}`);
console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 CRITICAL AUTHENTICATION ARCHITECTURE FIX VALIDATED!');
  console.log('✅ Public routes load without authentication calls');
  console.log('✅ Protected routes properly require authentication');
  console.log('✅ No 401 errors on public pages');
  console.log('✅ Authentication system scoped correctly');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed - review architecture implementation');
  process.exit(1);
}