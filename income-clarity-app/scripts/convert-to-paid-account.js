/**
 * Convert test@example.com to paid PREMIUM account
 * Fixes disconnect between User and UserSubscription tables
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const SUBSCRIPTION_PLANS = {
  PREMIUM: {
    id: 'PREMIUM',
    name: 'Premium',
    features: [
      'Automatic bank sync via Yodlee',
      'Unlimited portfolios',
      'Real-time market data',
      'Advanced tax optimization',
      'Dividend forecasting',
      'Portfolio rebalancing suggestions',
      'Custom alerts',
      'Priority support',
    ]
  }
};

async function convertToPaidAccount() {
  const email = 'test@example.com';
  
  try {
    console.log('🔄 Converting test account to paid status...\n');

    // Check current state
    const user = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true },
    });

    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('📊 BEFORE STATE:');
    console.log(`   User isPremium: ${user.isPremium}`);
    console.log(`   User premiumEndDate: ${user.premiumEndDate}`);
    console.log(`   User trialEndDate: ${user.trialEndDate}`);
    console.log(`   Subscription plan: ${user.subscription?.plan}`);
    console.log(`   Subscription status: ${user.subscription?.status}\n`);

    // Perform conversion in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update User table to mark as premium
      await tx.user.update({
        where: { id: user.id },
        data: {
          isPremium: true,
          premiumStartDate: new Date(), // Start now
          premiumEndDate: null, // No expiration (permanent)
          trialEndDate: null, // Remove trial end date
        },
      });

      // 2. Update UserSubscription table
      await tx.userSubscription.update({
        where: { userId: user.id },
        data: {
          plan: 'PREMIUM',
          status: 'ACTIVE', // Paid active status
          features: JSON.stringify(SUBSCRIPTION_PLANS.PREMIUM.features),
          updatedAt: new Date(),
        },
      });

      console.log('✅ User and subscription records updated');
    });

    // Verify the changes
    const updatedUser = await prisma.user.findUnique({
      where: { email },
      include: { subscription: true },
    });

    console.log('📊 AFTER STATE:');
    console.log(`   User isPremium: ${updatedUser.isPremium}`);
    console.log(`   User premiumStartDate: ${updatedUser.premiumStartDate}`);
    console.log(`   User premiumEndDate: ${updatedUser.premiumEndDate}`);
    console.log(`   User trialEndDate: ${updatedUser.trialEndDate}`);
    console.log(`   Subscription plan: ${updatedUser.subscription?.plan}`);
    console.log(`   Subscription status: ${updatedUser.subscription?.status}`);
    
    if (updatedUser.subscription?.features) {
      const features = JSON.parse(updatedUser.subscription.features);
      console.log(`   Features enabled: ${features.length}`);
    }

    console.log('\n🎉 SUCCESS: Test account converted to paid PREMIUM status!');
    console.log('\n🔧 Next steps:');
    console.log('   1. Login to test@example.com');
    console.log('   2. Verify no trial warnings appear');
    console.log('   3. Check that all premium features are accessible');
    console.log('   4. Confirm subscription shows as ACTIVE/PREMIUM');

  } catch (error) {
    console.error('❌ Error converting account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  convertToPaidAccount().catch(console.error);
}

module.exports = { convertToPaidAccount };