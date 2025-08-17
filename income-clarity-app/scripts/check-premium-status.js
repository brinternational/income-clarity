#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' },
      include: {
        subscription: true
      }
    });

    console.log('=== USER PREMIUM STATUS ===\n');
    console.log('User:', user.email);
    console.log('Tier:', user.tier);
    
    if (user.subscription) {
      console.log('\nSubscription Details:');
      console.log('- Status:', user.subscription.status);
      console.log('- Plan:', user.subscription.plan);
      console.log('- Trial Ends:', user.subscription.trialEndsAt);
      console.log('- Period Ends:', user.subscription.currentPeriodEnd);
      
      const now = new Date();
      const trialEnd = new Date(user.subscription.trialEndsAt);
      const isTrialActive = trialEnd > now;
      
      console.log('\n✅ Premium Status:', user.tier === 'PREMIUM' ? 'ACTIVE' : 'INACTIVE');
      console.log('✅ Trial Status:', isTrialActive ? 'ACTIVE' : 'EXPIRED');
      
      if (!isTrialActive && user.tier !== 'PREMIUM') {
        console.log('\n⚠️ Trial expired and user is not premium!');
        console.log('Upgrading user to PREMIUM...');
        
        // Upgrade to premium
        await prisma.user.update({
          where: { id: user.id },
          data: { tier: 'PREMIUM' }
        });
        
        await prisma.subscription.update({
          where: { id: user.subscription.id },
          data: { 
            status: 'ACTIVE',
            plan: 'PREMIUM',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
          }
        });
        
        console.log('✅ User upgraded to PREMIUM successfully!');
      }
    } else {
      console.log('\n❌ No subscription found! Creating premium subscription...');
      
      // Create subscription
      await prisma.subscription.create({
        data: {
          userId: user.id,
          status: 'ACTIVE',
          plan: 'PREMIUM',
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        }
      });
      
      await prisma.user.update({
        where: { id: user.id },
        data: { tier: 'PREMIUM' }
      });
      
      console.log('✅ Premium subscription created!');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
