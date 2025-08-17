#!/usr/bin/env node

/**
 * Premium User Onboarding Script
 * Upgrades test@example.com to premium tier for testing Yodlee integration
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function onboardPremiumUser() {
  console.log('🚀 Premium User Onboarding for test@example.com\n');
  console.log('═'.repeat(50));

  try {
    // 1. Find the test user
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: { subscription: true }
    });

    if (!testUser) {
      console.error('❌ Test user not found. Please run setup-test-user.js first.');
      process.exit(1);
    }

    console.log('✅ Found test user');
    console.log(`  Email: ${testUser.email}`);
    console.log(`  Current Premium Status: ${testUser.isPremium ? '✅' : '❌'}`);
    console.log('');

    // 2. Check current subscription
    if (testUser.subscription) {
      console.log('📊 Current Subscription:');
      console.log(`  Plan: ${testUser.subscription.plan}`);
      console.log(`  Status: ${testUser.subscription.status}`);
      console.log('');
    }

    // 3. Upgrade to Premium
    console.log('🔄 Upgrading to PREMIUM...');
    
    // Update user premium status
    await prisma.user.update({
      where: { id: testUser.id },
      data: {
        isPremium: true,
        premiumStartDate: new Date(),
        trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 day trial
      }
    });

    // Create or update subscription
    const subscription = await prisma.userSubscription.upsert({
      where: { userId: testUser.id },
      create: {
        userId: testUser.id,
        plan: 'PREMIUM',
        status: 'TRIAL',
        features: JSON.stringify([
          'Bank account synchronization',
          'Unlimited portfolios',
          'Real-time market data',
          'Advanced tax optimization',
          'Dividend forecasting',
          'Portfolio rebalancing suggestions',
          'Custom alerts',
          'Priority support'
        ]),
        usage: JSON.stringify({
          portfolios: 1,
          bankAccounts: 0,
          syncCount: 0,
          lastSync: null
        })
      },
      update: {
        plan: 'PREMIUM',
        status: 'TRIAL',
        features: JSON.stringify([
          'Bank account synchronization',
          'Unlimited portfolios',
          'Real-time market data',
          'Advanced tax optimization',
          'Dividend forecasting',
          'Portfolio rebalancing suggestions',
          'Custom alerts',
          'Priority support'
        ])
      }
    });

    console.log('✅ User upgraded to PREMIUM (14-day trial)');
    console.log('');

    // 4. Create initial sync log entry (for UI display)
    await prisma.syncLog.create({
      data: {
        userId: testUser.id,
        syncType: 'MANUAL',
        status: 'PENDING',
        itemsSynced: 0,
        startedAt: new Date()
      }
    });

    console.log('📝 Created initial sync log entry');
    console.log('');

    // 5. Display onboarding instructions
    console.log('═'.repeat(50));
    console.log('🎉 PREMIUM ONBOARDING COMPLETE!\n');
    console.log('📋 Next Steps to Test Yodlee Integration:\n');
    console.log('1. Login to Income Clarity');
    console.log('   URL: http://localhost:3000');
    console.log('   Email: test@example.com');
    console.log('   Password: password123\n');
    
    console.log('2. You should see:');
    console.log('   - Premium badge in header');
    console.log('   - Sync status indicator');
    console.log('   - "Bank Connections" in Settings\n');
    
    console.log('3. Connect a Bank Account:');
    console.log('   - Navigate to Settings → Bank Connections');
    console.log('   - Click "Connect Bank Account"');
    console.log('   - Use Yodlee test credentials:');
    console.log('     Provider: Dag Site');
    console.log('     Username: YodTest.site16441.2');
    console.log('     Password: site16441.2\n');
    
    console.log('4. Test Sync Features:');
    console.log('   - Manual sync button (rate limited to 1/hour)');
    console.log('   - View sync status in header');
    console.log('   - Check data source badges in Super Cards');
    console.log('   - Test reconciliation for duplicate holdings\n');
    
    console.log('5. View Premium Features:');
    console.log('   - Visit /pricing to see tier comparison');
    console.log('   - Visit /settings/billing to manage subscription');
    console.log('   - Check /admin/monitoring for system health\n');

    console.log('📊 Test User Status:');
    console.log(`  ✅ Premium: ${true}`);
    console.log(`  ✅ Plan: PREMIUM (Trial)`);
    console.log(`  ✅ Trial Ends: ${new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}`);
    console.log(`  ✅ Features: 8 premium features unlocked`);
    console.log('');

    console.log('🔐 Yodlee Test Account Info:');
    console.log('  The sandbox has 3 pre-linked accounts:');
    console.log('  - Checking: $44.78');
    console.log('  - Savings: $9,044.78');
    console.log('  - Credit Card: $1,636.44');
    console.log('');

    console.log('✨ Happy Testing!');
    console.log('═'.repeat(50));

  } catch (error) {
    console.error('❌ Error during onboarding:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the onboarding
onboardPremiumUser().catch(console.error);