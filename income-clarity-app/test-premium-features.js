#!/usr/bin/env node

/**
 * Test Premium Features Script
 * Tests the premium user flow without browser
 */

const fs = require('fs');
const { execSync } = require('child_process');

async function testPremiumFlow() {
  try {
    console.log('🔍 Testing Premium User Flow\n');

    // Step 1: Login and get session cookie
    console.log('1. Logging in as test@example.com...');
    const loginResponse = execSync(`curl -s -c cookies.txt -d '{"email":"test@example.com","password":"password123"}' -H "Content-Type: application/json" -X POST http://localhost:3000/api/auth/login`);
    const loginData = JSON.parse(loginResponse);
    console.log(`   ✅ Login successful - User ID: ${loginData.user.id}`);

    // Step 2: Test /api/auth/me endpoint
    console.log('\n2. Testing /api/auth/me endpoint...');
    const meResponse = execSync(`curl -s -b cookies.txt http://localhost:3000/api/auth/me`);
    const meData = JSON.parse(meResponse);
    
    console.log(`   User ID: ${meData.user.id}`);
    console.log(`   Email: ${meData.user.email}`);
    console.log(`   isPremium: ${meData.user.isPremium}`);
    console.log(`   Subscription Plan: ${meData.user.subscription?.plan || 'None'}`);
    console.log(`   Subscription Status: ${meData.user.subscription?.status || 'None'}`);

    // Step 3: Check feature access logic
    console.log('\n3. Testing feature access logic...');
    const isPremium = meData.user.isPremium || meData.user.subscription?.plan === 'PREMIUM';
    console.log(`   Feature Access Check (isPremium): ${isPremium}`);
    
    if (isPremium) {
      console.log('   ✅ PREMIUM features should be ENABLED');
      console.log('   ✅ FeatureGate components should NOT show locks');
    } else {
      console.log('   ❌ PREMIUM features should be DISABLED');
      console.log('   ❌ FeatureGate components should show locks');
    }

    // Step 4: Test super cards endpoints (premium features)
    console.log('\n4. Testing premium endpoints...');
    
    const endpoints = [
      '/api/super-cards/performance-hub',
      '/api/super-cards/income-intelligence-hub',
      '/api/super-cards/tax-strategy-hub',
      '/api/super-cards/portfolio-strategy-hub',
      '/api/super-cards/financial-planning-hub'
    ];

    for (const endpoint of endpoints) {
      try {
        const response = execSync(`curl -s -b cookies.txt http://localhost:3000${endpoint}`);
        const data = JSON.parse(response);
        
        if (data.error) {
          console.log(`   ❌ ${endpoint}: ${data.error}`);
        } else {
          console.log(`   ✅ ${endpoint}: Success`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint}: Parse error or network issue`);
      }
    }

    // Step 5: Summary and diagnosis
    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('='.repeat(50));
    
    if (meData.user.isPremium && meData.user.subscription?.status === 'ACTIVE') {
      console.log('✅ API IS WORKING CORRECTLY:');
      console.log('   • User has isPremium: true');
      console.log('   • User has ACTIVE subscription');
      console.log('   • User should see premium features');
      console.log('\n🔍 IF PREMIUM GATES ARE STILL SHOWING:');
      console.log('   • Issue is in the frontend React components');
      console.log('   • Check useAuth() context state');
      console.log('   • Check FeatureGate component logic');
      console.log('   • May be a hydration/SSR issue');
    } else {
      console.log('❌ API ISSUE DETECTED:');
      console.log('   • isPremium or subscription status not set correctly');
      console.log('   • Backend subscription logic needs fixing');
    }

    // Cleanup
    if (fs.existsSync('cookies.txt')) {
      fs.unlinkSync('cookies.txt');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testPremiumFlow();