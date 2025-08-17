#!/usr/bin/env node

/**
 * Simple Yodlee Debug - Focus on the core issue
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugYodlee() {
  console.log('🔍 YODLEE DEBUG: Why are we seeing demo data instead of Yodlee test data?');
  console.log('='.repeat(80));
  
  try {
    // Check demo user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        yodleeConnection: {
          include: { syncedAccounts: true }
        },
        portfolios: {
          include: { holdings: true }
        }
      }
    });
    
    console.log('\n📊 CURRENT STATE:');
    console.log('User found:', !!user);
    console.log('Yodlee connection:', !!user?.yodleeConnection);
    console.log('Yodlee user ID:', user?.yodleeConnection?.yodleeUserId || 'NONE');
    console.log('Synced accounts:', user?.yodleeConnection?.syncedAccounts?.length || 0);
    console.log('Last synced:', user?.yodleeConnection?.lastSyncedAt || 'NEVER');
    console.log('Demo portfolios:', user?.portfolios?.length || 0);
    
    if (user?.portfolios?.length > 0) {
      user.portfolios.forEach(portfolio => {
        console.log(`\n📈 Portfolio: ${portfolio.name}`);
        console.log(`   Holdings: ${portfolio.holdings.length}`);
        if (portfolio.holdings.length > 0) {
          portfolio.holdings.forEach(holding => {
            console.log(`   - ${holding.symbol || 'NO_SYMBOL'}: ${holding.shares} shares`);
          });
        }
      });
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    if (!user?.yodleeConnection) {
      console.log('❌ ISSUE: No Yodlee connection - user not linked to Yodlee');
      console.log('   SOLUTION: Create Yodlee connection for user');
    } else if (user.yodleeConnection.syncedAccounts.length === 0) {
      console.log('❌ ISSUE: Yodlee connection exists but NO synced accounts');
      console.log('   This is why we see hardcoded demo data instead of Yodlee test data');
      console.log('   CAUSE: Test user may not have linked bank/investment accounts');
      console.log('   SOLUTIONS:');
      console.log('   1. Link test investment accounts via Yodlee FastLink');
      console.log('   2. Use a different test user with pre-linked accounts');
      console.log('   3. Manually trigger account sync');
    } else {
      console.log('✅ User has synced accounts - issue may be elsewhere');
    }
    
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Test Yodlee API directly with test user');
    console.log('2. Check if test user has accounts in Yodlee sandbox');
    console.log('3. Run Yodlee FastLink to link accounts');
    console.log('4. Trigger manual sync');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugYodlee().catch(console.error);