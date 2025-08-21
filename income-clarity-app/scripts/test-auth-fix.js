#!/usr/bin/env node

/**
 * Test Script: Authentication State Management Fix
 * 
 * Tests the critical authentication fixes:
 * 1. /api/auth/me returns subscription data
 * 2. Session validation works correctly
 * 3. Premium status is properly calculated
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function testAuthenticationFix() {
  console.log('🔐 Testing Authentication State Management Fix...\n');
  
  try {
    // 1. Create test user with subscription
    console.log('1. Creating test user with premium subscription...');
    
    // Clean up existing test data
    await prisma.session.deleteMany({ where: { user: { email: 'test@example.com' } } });
    await prisma.userSubscription.deleteMany({ where: { user: { email: 'test@example.com' } } });
    await prisma.user.deleteMany({ where: { email: 'test@example.com' } });
    
    // Create user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        email: 'test@example.com',
        passwordHash: hashedPassword,
        onboarding_completed: true
      }
    });
    console.log('✅ User created:', user.email);
    
    // Create premium subscription
    const subscription = await prisma.userSubscription.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        plan: 'PREMIUM',
        status: 'ACTIVE',
        stripeCustomerId: 'cus_test_' + Date.now(),
        stripeSubId: 'sub_test_' + Date.now(),
        features: JSON.stringify({
          advancedTracking: true,
          aiEngine: true,
          unlimitedAccounts: true,
          premiumSupport: true
        })
      }
    });
    console.log('✅ Premium subscription created:', subscription.plan);
    
    // Create session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const session = await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        sessionToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });
    console.log('✅ Session created:', sessionToken.substring(0, 16) + '...');
    
    // 2. Test /api/auth/me endpoint response
    console.log('\n2. Testing /api/auth/me endpoint...');
    
    const response = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Cookie': `session-token=${sessionToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('✅ API Response received');
    console.log('📊 Raw API Response:');
    console.log(JSON.stringify(data, null, 2));
    
    // 3. Validate response structure
    console.log('\n3. Validating response structure...');
    
    const requiredFields = ['id', 'email', 'onboarding_completed', 'createdAt', 'isPremium', 'subscription'];
    const missingFields = requiredFields.filter(field => !(field in data.user));
    
    if (missingFields.length > 0) {
      throw new Error(`Missing fields: ${missingFields.join(', ')}`);
    }
    console.log('✅ All required fields present');
    
    // 4. Validate subscription data
    console.log('\n4. Validating subscription data...');
    
    if (!data.user.isPremium) {
      throw new Error('isPremium should be true for active subscription');
    }
    console.log('✅ isPremium correctly set to true');
    
    if (!data.user.subscription || data.user.subscription.status !== 'ACTIVE') {
      throw new Error('Subscription data missing or status not ACTIVE');
    }
    console.log('✅ Subscription data properly included');
    
    console.log('\n📊 Complete Response Structure:');
    console.log(JSON.stringify(data, null, 2));
    
    // 5. Test authentication state in AuthContext
    console.log('\n5. Authentication state validation complete!');
    console.log('✅ /api/auth/me now returns complete user data with subscription');
    console.log('✅ Premium status properly calculated');
    console.log('✅ AuthContext will receive all required fields');
    console.log('✅ Premium gates should now work correctly');
    
    console.log('\n🎉 AUTHENTICATION FIX SUCCESSFULLY VALIDATED!');
    console.log('\nNext steps:');
    console.log('1. Login with test@example.com / password123');
    console.log('2. Navigate to dashboard - should see premium features unlocked');
    console.log('3. Check browser console for auth state debug logs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testAuthenticationFix().catch(console.error);