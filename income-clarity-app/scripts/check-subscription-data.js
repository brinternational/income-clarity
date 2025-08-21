#!/usr/bin/env node

/**
 * Check Subscription Data Script
 * Verifies subscription data for test user
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Checking subscription data for test@example.com...\n');

    // Find user with subscription data
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        subscription: true,
        sessions: {
          where: { expiresAt: { gt: new Date() } },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!user) {
      console.log('❌ User test@example.com not found');
      return;
    }

    console.log('✅ User found:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Onboarding Complete: ${user.onboarding_completed}`);
    console.log(`  Created: ${user.createdAt}`);
    console.log(`  Active Sessions: ${user.sessions.length}`);

    if (user.subscription) {
      console.log('\n✅ Subscription found:');
      console.log(`  ID: ${user.subscription.id}`);
      console.log(`  Plan: ${user.subscription.plan}`);
      console.log(`  Status: ${user.subscription.status}`);
      console.log(`  Stripe Customer ID: ${user.subscription.stripeCustomerId || 'None'}`);
      console.log(`  Features: ${user.subscription.features || 'None'}`);
      console.log(`  Created: ${user.subscription.createdAt}`);
      console.log(`  Updated: ${user.subscription.updatedAt}`);

      const isPremium = user.subscription.status === 'ACTIVE' || user.subscription.status === 'TRIAL';
      console.log(`\n💎 Premium Status: ${isPremium ? '✅ PREMIUM' : '❌ NOT PREMIUM'}`);
    } else {
      console.log('\n❌ No subscription found');
    }

    // Test session validation
    if (user.sessions.length > 0) {
      console.log('\n🔍 Testing session validation...');
      const sessionToken = user.sessions[0].sessionToken;
      console.log(`  Session Token: ${sessionToken.substring(0, 8)}...`);

      // Import session service
      const { sessionService } = require('../lib/auth/session.service');
      const validation = await sessionService.validateSession(sessionToken);

      console.log(`  Session Valid: ${validation.isValid}`);
      if (validation.user) {
        console.log(`  User ID: ${validation.user.id}`);
        console.log(`  Email: ${validation.user.email}`);
        console.log(`  isPremium: ${validation.user.isPremium}`);
        if (validation.user.subscription) {
          console.log(`  Subscription Plan: ${validation.user.subscription.plan}`);
          console.log(`  Subscription Status: ${validation.user.subscription.status}`);
        } else {
          console.log(`  Subscription: null`);
        }
      }
    }

    console.log('\n📋 Summary:');
    const hasSub = !!user.subscription;
    const isPremium = hasSub && (user.subscription.status === 'ACTIVE' || user.subscription.status === 'TRIAL');
    console.log(`  Has Subscription: ${hasSub ? '✅' : '❌'}`);
    console.log(`  Is Premium: ${isPremium ? '✅' : '❌'}`);
    console.log(`  Expected API Response: ${isPremium ? 'Premium features enabled' : 'Premium gates shown'}`);

  } catch (error) {
    console.error('❌ Error checking subscription data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();