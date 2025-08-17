#!/usr/bin/env node

/**
 * Direct Yodlee Service Test
 * Tests the service configuration and basic functionality
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testYodleeService() {
  console.log('🧪 DIRECT YODLEE SERVICE TEST');
  console.log('==============================\n');

  // Test 1: Environment Variables
  console.log('📋 Environment Variables Check:');
  const requiredVars = [
    'YODLEE_CLIENT_ID',
    'YODLEE_CLIENT_SECRET', 
    'YODLEE_ADMIN_LOGIN',
    'YODLEE_API_URL',
    'YODLEE_FASTLINK_URL'
  ];
  
  const envStatus = {};
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    envStatus[varName] = value ? '✅ SET' : '❌ MISSING';
    console.log(`  ${varName}: ${envStatus[varName]}`);
    if (value && varName !== 'YODLEE_CLIENT_SECRET') {
      console.log(`    Value: ${value.substring(0, 20)}...`);
    }
  });
  
  // Test 2: Service Configuration
  console.log('\n🔧 Service Configuration Test:');
  try {
    // Mock the Yodlee client configuration check
    const clientId = process.env.YODLEE_CLIENT_ID;
    const clientSecret = process.env.YODLEE_CLIENT_SECRET;
    const adminLogin = process.env.YODLEE_ADMIN_LOGIN;
    
    const isConfigured = !!(clientId && clientSecret && adminLogin);
    
    console.log(`  Service Configured: ${isConfigured ? '✅ YES' : '❌ NO'}`);
    
    if (isConfigured) {
      console.log('  ✅ All required credentials present');
      console.log('  ✅ Ready for API calls');
    } else {
      const missing = [];
      if (!clientId) missing.push('YODLEE_CLIENT_ID');
      if (!clientSecret) missing.push('YODLEE_CLIENT_SECRET');
      if (!adminLogin) missing.push('YODLEE_ADMIN_LOGIN');
      console.log(`  ❌ Missing: ${missing.join(', ')}`);
    }
    
  } catch (error) {
    console.log(`  ❌ Configuration test failed: ${error.message}`);
  }
  
  // Test 3: API URL Validation
  console.log('\n🌐 API URL Validation:');
  const apiUrl = process.env.YODLEE_API_URL;
  const fastlinkUrl = process.env.YODLEE_FASTLINK_URL;
  
  if (apiUrl) {
    console.log(`  ✅ API URL: ${apiUrl}`);
    if (apiUrl.includes('sandbox')) {
      console.log('  📋 Environment: SANDBOX');
    } else {
      console.log('  🔴 Environment: PRODUCTION');
    }
  } else {
    console.log('  ❌ API URL not configured');
  }
  
  if (fastlinkUrl) {
    console.log(`  ✅ FastLink URL: ${fastlinkUrl}`);
  } else {
    console.log('  ❌ FastLink URL not configured');
  }
  
  // Test 4: Basic Service Health (mock)
  console.log('\n❤️  Service Health Check:');
  const allConfigured = requiredVars.every(varName => process.env[varName]);
  
  if (allConfigured) {
    console.log('  ✅ Service: READY');
    console.log('  ✅ Configuration: COMPLETE');
    console.log('  ✅ Status: Yodlee integration should work');
  } else {
    console.log('  ⚠️  Service: NOT READY');
    console.log('  ❌ Configuration: INCOMPLETE');
    console.log('  🔧 Action Required: Add missing environment variables');
  }
  
  // Summary
  console.log('\n📊 SUMMARY:');
  const configuredCount = requiredVars.filter(varName => process.env[varName]).length;
  console.log(`  Configuration: ${configuredCount}/${requiredVars.length} variables set`);
  
  if (configuredCount === requiredVars.length) {
    console.log('  🎉 Result: Yodlee service fully configured!');
    console.log('  💡 Next: Test bank connection in UI');
  } else {
    console.log('  ⚠️  Result: Configuration incomplete');
    console.log('  🔧 Next: Set missing environment variables');
  }
}

// Run the test
testYodleeService().catch(console.error);