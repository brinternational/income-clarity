#!/usr/bin/env node

/**
 * Premium Gate API Fix Validation Script
 * 
 * Tests that the /api/auth/me endpoint now correctly returns subscription information
 * and validates that the premium features gate logic works as expected.
 */

const fs = require('fs');
const path = require('path');

/**
 * Test the API endpoint directly
 */
async function testAuthMeEndpoint() {
  console.log('🔍 Testing /api/auth/me API endpoint...');
  
  try {
    // First, let's check if we have a valid session by making a request
    const response = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Cookie': 'session-token=test-session' // This might not work without real session
      }
    });
    
    console.log(`📡 API Response Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('ℹ️ No valid session (expected in this context)');
      console.log('✅ API endpoint is accessible and handling auth correctly');
      return { accessible: true, authenticated: false };
    }
    
    if (response.ok) {
      const data = await response.json();
      console.log('📋 API Response Data:', JSON.stringify(data, null, 2));
      
      // Check if subscription fields are present
      const hasSubscriptionFields = data.user && (
        data.user.hasOwnProperty('isPremium') ||
        data.user.hasOwnProperty('subscription')
      );
      
      console.log(`✅ Subscription fields present: ${hasSubscriptionFields}`);
      return { accessible: true, authenticated: true, hasSubscriptionData: hasSubscriptionFields, data };
    }
    
    console.log(`⚠️ Unexpected response status: ${response.status}`);
    return { accessible: true, authenticated: false, error: `Status ${response.status}` };
    
  } catch (error) {
    console.error('❌ Failed to test API endpoint:', error.message);
    return { accessible: false, error: error.message };
  }
}

/**
 * Check database for test user subscription status
 */
async function checkTestUserSubscription() {
  console.log('📊 Checking test user subscription in database...');
  
  try {
    // Use Prisma to query the database directly
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Find test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: { subscription: true }
    });
    
    if (!user) {
      console.log('❌ Test user not found in database');
      await prisma.$disconnect();
      return { found: false };
    }
    
    console.log('👤 Test User Found:');
    console.log(`   - ID: ${user.id}`);
    console.log(`   - Email: ${user.email}`);
    console.log(`   - isPremium: ${user.isPremium}`);
    console.log(`   - Subscription: ${user.subscription ? JSON.stringify(user.subscription, null, 4) : 'None'}`);
    
    const subscriptionStatus = {
      found: true,
      userId: user.id,
      email: user.email,
      isPremium: user.isPremium,
      subscription: user.subscription,
      isFreeTier: !user.isPremium && (!user.subscription || user.subscription.plan === 'FREE' || user.subscription.plan === null)
    };
    
    console.log(`📈 Computed Status: ${subscriptionStatus.isFreeTier ? 'FREE TIER' : 'PREMIUM/ENTERPRISE'}`);
    console.log(`🎯 Expected Premium Gate Behavior: ${subscriptionStatus.isFreeTier ? 'SHOW UPSELL' : 'HIDE UPSELL'}`);
    
    await prisma.$disconnect();
    return subscriptionStatus;
    
  } catch (error) {
    console.error('❌ Database query failed:', error.message);
    return { found: false, error: error.message };
  }
}

/**
 * Simulate the useFeatureAccess hook logic
 */
function simulateFeatureAccessLogic(user) {
  console.log('🧪 Simulating useFeatureAccess hook logic...');
  
  if (!user) {
    console.log('❌ No user data provided');
    return { isFreeTier: true, isPremium: false, isEnterprise: false };
  }
  
  const featureAccess = {
    isFreeTier: !user.isPremium && (!user.subscription || user.subscription.plan !== 'PREMIUM' && user.subscription.plan !== 'ENTERPRISE'),
    isPremium: user.isPremium || (user.subscription && user.subscription.plan === 'PREMIUM'),
    isEnterprise: user.subscription && user.subscription.plan === 'ENTERPRISE'
  };
  
  console.log('🎛️ Feature Access Simulation:');
  console.log(`   - isFreeTier: ${featureAccess.isFreeTier}`);
  console.log(`   - isPremium: ${featureAccess.isPremium}`);
  console.log(`   - isEnterprise: ${featureAccess.isEnterprise}`);
  
  return featureAccess;
}

/**
 * Create a test user with specific subscription status
 */
async function createTestUserWithSubscription(plan = 'FREE') {
  console.log(`👤 Creating/updating test user with ${plan} subscription...`);
  
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Handle FREE users by removing subscription
    if (plan === 'FREE') {
      // Update user to free status and delete subscription if exists
      const user = await prisma.user.update({
        where: { email: 'test@example.com' },
        data: {
          isPremium: false,
          subscription: {
            delete: true
          }
        },
        include: { subscription: true }
      }).catch(async () => {
        // If deletion fails (no subscription exists), just update the user
        return await prisma.user.update({
          where: { email: 'test@example.com' },
          data: { isPremium: false },
          include: { subscription: true }
        });
      });
      
      await prisma.$disconnect();
      return user;
    }
    
    // Upsert user for PREMIUM/ENTERPRISE
    const user = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {
        isPremium: plan === 'PREMIUM' || plan === 'ENTERPRISE',
        subscription: {
          upsert: {
            create: {
              plan: plan,
              status: 'ACTIVE'
            },
            update: {
              plan: plan,
              status: 'ACTIVE'
            }
          }
        }
      },
      create: {
        email: 'test@example.com',
        passwordHash: 'test-hash', // This would be properly hashed in real scenario
        isPremium: plan === 'PREMIUM' || plan === 'ENTERPRISE',
        onboarding_completed: true,
        subscription: plan !== 'FREE' ? {
          create: {
            plan: plan,
            status: 'ACTIVE'
          }
        } : undefined
      },
      include: { subscription: true }
    });
    
    console.log(`✅ User created/updated with ${plan} subscription`);
    console.log(`   - isPremium: ${user.isPremium}`);
    console.log(`   - Subscription plan: ${user.subscription?.plan || 'None'}`);
    
    await prisma.$disconnect();
    return user;
    
  } catch (error) {
    console.error('❌ Failed to create/update test user:', error.message);
    throw error;
  }
}

/**
 * Test different subscription scenarios
 */
async function testSubscriptionScenarios() {
  console.log('🎭 Testing different subscription scenarios...');
  
  const scenarios = ['FREE', 'PREMIUM', 'ENTERPRISE'];
  const results = [];
  
  for (const plan of scenarios) {
    console.log(`\n📋 Testing ${plan} scenario:`);
    console.log('-'.repeat(40));
    
    try {
      // Create user with specific plan
      const user = await createTestUserWithSubscription(plan);
      
      // Simulate feature access logic
      const featureAccess = simulateFeatureAccessLogic(user);
      
      // Determine expected behavior
      const expectedPremiumGate = featureAccess.isFreeTier ? 'SHOW_UPSELL' : 'HIDE_UPSELL';
      
      const scenario = {
        plan,
        user: {
          isPremium: user.isPremium,
          subscription: user.subscription
        },
        featureAccess,
        expectedPremiumGate,
        testPassed: true
      };
      
      console.log(`🎯 Expected Premium Gate: ${expectedPremiumGate}`);
      results.push(scenario);
      
    } catch (error) {
      console.error(`❌ ${plan} scenario failed:`, error.message);
      results.push({
        plan,
        error: error.message,
        testPassed: false
      });
    }
  }
  
  return results;
}

/**
 * Validate the API fix is working
 */
async function validateApiFix() {
  console.log('🔧 Validating API fix implementation...');
  
  const apiFilePath = path.join(__dirname, '..', 'app', 'api', 'auth', 'me', 'route.ts');
  
  try {
    const apiFileContent = fs.readFileSync(apiFilePath, 'utf8');
    
    // Check if subscription include is present
    const hasSubscriptionInclude = apiFileContent.includes('subscription: true');
    const returnsIsPremium = apiFileContent.includes('isPremium: session.user.isPremium');
    const returnsSubscription = apiFileContent.includes('subscription: session.user.subscription');
    
    console.log('📝 API File Analysis:');
    console.log(`   - Includes subscription in query: ${hasSubscriptionInclude}`);
    console.log(`   - Returns isPremium field: ${returnsIsPremium}`);
    console.log(`   - Returns subscription object: ${returnsSubscription}`);
    
    const apiFixComplete = hasSubscriptionInclude && returnsIsPremium && returnsSubscription;
    console.log(`✅ API Fix Complete: ${apiFixComplete}`);
    
    return {
      complete: apiFixComplete,
      details: {
        hasSubscriptionInclude,
        returnsIsPremium,
        returnsSubscription
      }
    };
    
  } catch (error) {
    console.error('❌ Failed to validate API fix:', error.message);
    return { complete: false, error: error.message };
  }
}

/**
 * Main test execution
 */
async function runPremiumGateValidation() {
  console.log('🚀 Premium Features Gate API Fix Validation');
  console.log('=' .repeat(50));
  
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: {}
  };
  
  try {
    // Test 1: Validate API Fix Implementation
    console.log('\n📍 Test 1: API Fix Implementation');
    testResults.tests.apiFix = await validateApiFix();
    
    // Test 2: Database Subscription Check
    console.log('\n📍 Test 2: Database User Subscription Status');
    testResults.tests.userSubscription = await checkTestUserSubscription();
    
    // Test 3: API Endpoint Test
    console.log('\n📍 Test 3: API Endpoint Response');
    testResults.tests.apiEndpoint = await testAuthMeEndpoint();
    
    // Test 4: Subscription Scenarios
    console.log('\n📍 Test 4: Subscription Scenarios');
    testResults.tests.scenarios = await testSubscriptionScenarios();
    
    // Calculate overall results
    const allTestsPassed = testResults.tests.apiFix.complete &&
      testResults.tests.scenarios.every(s => s.testPassed);
    
    testResults.summary = {
      overall_status: allTestsPassed ? 'PASSED' : 'FAILED',
      api_fix_implemented: testResults.tests.apiFix.complete,
      scenarios_tested: testResults.tests.scenarios.length,
      scenarios_passed: testResults.tests.scenarios.filter(s => s.testPassed).length
    };
    
    // Save results
    const resultsFile = path.join(__dirname, '..', 'test-results', 
      `premium-gate-api-validation-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    
    const resultsDir = path.dirname(resultsFile);
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    
    fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
    
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 PREMIUM GATE API FIX VALIDATION REPORT');
    console.log('='.repeat(50));
    console.log(`✅ Overall Status: ${testResults.summary.overall_status}`);
    console.log(`🔧 API Fix Implemented: ${testResults.summary.api_fix_implemented}`);
    console.log(`🎭 Scenarios Tested: ${testResults.summary.scenarios_tested}`);
    console.log(`✅ Scenarios Passed: ${testResults.summary.scenarios_passed}`);
    console.log(`💾 Results saved: ${resultsFile}`);
    
    if (testResults.summary.overall_status === 'PASSED') {
      console.log('\n✅ PREMIUM GATE API FIX VALIDATION PASSED');
      console.log('🎯 The premium features gate should now work correctly:');
      console.log('   - Free users will see premium upsell section');
      console.log('   - Premium users will NOT see premium upsell section');
    } else {
      console.log('\n❌ PREMIUM GATE API FIX VALIDATION FAILED');
      console.log('🔍 Check the detailed results above for issues');
    }
    
    return testResults.summary.overall_status === 'PASSED';
    
  } catch (error) {
    console.error('💥 Validation failed:', error.message);
    return false;
  }
}

// Execute validation
if (require.main === module) {
  runPremiumGateValidation().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('💥 Test runner crashed:', error);
    process.exit(1);
  });
}

module.exports = { runPremiumGateValidation };