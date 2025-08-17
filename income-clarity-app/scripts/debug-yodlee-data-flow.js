#!/usr/bin/env node

/**
 * Debug Yodlee Data Flow
 * CRITICAL: Debug why Yodlee test data isn't showing in our app
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugYodleeDataFlow() {
  console.log('🔍 DEBUGGING: Why Yodlee test data isn\'t showing in our app');
  console.log('='.repeat(80));
  
  try {
    // Step 1: Check our demo user
    console.log('\n📋 STEP 1: Checking demo user in database...');
    const demoUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        yodleeConnection: {
          include: {
            syncedAccounts: true
          }
        },
        portfolios: {
          include: {
            holdings: true
          }
        }
      }
    });
    
    if (!demoUser) {
      console.log('❌ Demo user not found!');
      return;
    }
    
    console.log('✅ Demo user found:', demoUser.email);
    console.log('   Yodlee connection:', demoUser.yodleeConnection ? 'EXISTS' : 'MISSING');
    
    if (demoUser.yodleeConnection) {
      console.log('   Yodlee user ID:', demoUser.yodleeConnection.yodleeUserId);
      console.log('   Synced accounts:', demoUser.yodleeConnection.syncedAccounts.length);
      console.log('   Last synced:', demoUser.yodleeConnection.lastSyncedAt);
      
      if (demoUser.yodleeConnection.syncedAccounts.length === 0) {
        console.log('⚠️  ISSUE: Yodlee connection exists but NO synced accounts');
        console.log('   This means user is connected to Yodlee but no bank/investment accounts linked');
      }
    }
    
    console.log('   Demo user portfolios:', demoUser.portfolios.length);
    if (demoUser.portfolios.length > 0) {
      demoUser.portfolios.forEach(portfolio => {
        console.log(`   Portfolio "${portfolio.name}": ${portfolio.holdings.length} holdings`);
        if (portfolio.holdings.length > 0) {
          console.log('   Sample holdings:', portfolio.holdings.slice(0, 3).map(h => h.symbol).join(', '));
        }
      });
    }
    
    // Step 2: Test Yodlee API directly
    console.log('\n🔗 STEP 2: Testing Yodlee API directly...');
    
    // Import the Yodlee client (use absolute path from scripts folder)
    const path = require('path');
    const clientPath = path.join(__dirname, '..', 'lib', 'services', 'yodlee', 'yodlee-client.service.ts');
    // For now, let's test Yodlee directly without importing the service
    console.log('   Skipping Yodlee client import due to TypeScript modules');
    
    if (!yodleeClient.isServiceConfigured()) {
      console.log('❌ Yodlee service not configured');
      console.log('   Missing environment variables:', yodleeClient.getConfigurationStatus().missingVars);
      return;
    }
    
    console.log('✅ Yodlee service is configured');
    
    // Test authentication
    try {
      console.log('   Testing Yodlee authentication...');
      const token = await yodleeClient.getAccessToken();
      console.log('   ✅ Got access token:', token.substring(0, 20) + '...');
      
      // Test getting user token for our demo user's Yodlee ID
      if (demoUser.yodleeConnection) {
        console.log('   Testing user token for:', demoUser.yodleeConnection.yodleeUserId);
        try {
          const userToken = await yodleeClient.getUserToken(demoUser.yodleeConnection.yodleeUserId);
          console.log('   ✅ Got user token:', userToken.substring(0, 20) + '...');
          
          // Test getting accounts from Yodlee
          console.log('   Testing get accounts from Yodlee...');
          const yodleeAccounts = await yodleeClient.getAccounts(userToken);
          console.log('   📊 Yodlee returned accounts:', yodleeAccounts.length);
          
          if (yodleeAccounts.length === 0) {
            console.log('   ⚠️  ISSUE: Yodlee returned 0 accounts for test user');
            console.log('   This means the test user has no linked bank/investment accounts');
            console.log('   Expected: Test users should have pre-linked investment accounts with holdings');
          } else {
            console.log('   Account types:', yodleeAccounts.map(acc => acc.accountType).join(', '));
            
            // Test getting holdings
            const investmentAccounts = yodleeAccounts.filter(acc => 
              acc.accountType && acc.accountType.toLowerCase().includes('investment')
            );
            
            if (investmentAccounts.length > 0) {
              console.log('   Testing get holdings for investment accounts...');
              const holdings = await yodleeClient.getHoldings(userToken, investmentAccounts.map(acc => acc.id));
              console.log('   📈 Yodlee returned holdings:', holdings.length);
              
              if (holdings.length > 0) {
                console.log('   Sample holdings:', holdings.slice(0, 3).map(h => `${h.symbol}(${h.quantity})`).join(', '));
                console.log('   🎉 SUCCESS: Yodlee is returning investment holdings!');
                console.log('   🔍 ISSUE: Holdings exist in Yodlee but not synced to our database');
              } else {
                console.log('   ⚠️  ISSUE: Investment accounts exist but no holdings returned');
              }
            } else {
              console.log('   ⚠️  ISSUE: No investment accounts found in Yodlee');
              console.log('   Available account types:', yodleeAccounts.map(acc => acc.accountType));
            }
          }
          
        } catch (error) {
          console.log('   ❌ Failed to get user token:', error.message);
          console.log('   This suggests the test user ID might be invalid');
        }
      }
      
    } catch (error) {
      console.log('   ❌ Yodlee authentication failed:', error.message);
      return;
    }
    
    // Step 3: Test the sync process
    console.log('\n🔄 STEP 3: Testing our sync process...');
    
    if (demoUser.yodleeConnection && demoUser.yodleeConnection.syncedAccounts.length === 0) {
      console.log('   Testing manual sync...');
      try {
        // Import the sync service
        const { YodleeSync } = require('../lib/services/yodlee/yodlee-sync.service');
        const yodleeSync = new YodleeSync();
        
        console.log('   Attempting to sync user data...');
        const syncResult = await yodleeSync.syncUserData(demoUser.id);
        console.log('   Sync result:', syncResult);
        
        // Check if accounts were synced
        const updatedUser = await prisma.user.findUnique({
          where: { id: demoUser.id },
          include: {
            yodleeConnection: {
              include: { syncedAccounts: true }
            }
          }
        });
        
        console.log('   Accounts after sync:', updatedUser.yodleeConnection.syncedAccounts.length);
        
      } catch (error) {
        console.log('   ❌ Sync failed:', error.message);
        console.log('   Stack:', error.stack);
      }
    }
    
    // Step 4: Summary and recommendations
    console.log('\n📝 SUMMARY & RECOMMENDATIONS:');
    console.log('='.repeat(50));
    
    if (!demoUser.yodleeConnection) {
      console.log('❌ CRITICAL: Demo user has no Yodlee connection');
      console.log('   Fix: Run user setup script to create Yodlee connection');
    } else if (demoUser.yodleeConnection.syncedAccounts.length === 0) {
      console.log('❌ CRITICAL: Yodlee connection exists but no synced accounts');
      console.log('   This is the root cause of seeing hardcoded demo data');
      console.log('   Possible causes:');
      console.log('   1. Test user has no linked accounts in Yodlee sandbox');
      console.log('   2. Sync process is not working correctly');
      console.log('   3. Test user ID is incorrect');
      console.log('   ');
      console.log('   Next steps:');
      console.log('   1. Verify test user has pre-linked investment accounts');
      console.log('   2. Test the sync process manually');
      console.log('   3. Check Yodlee FastLink integration for account linking');
    } else {
      console.log('✅ Demo user has synced accounts');
      console.log('   Check if holdings are properly imported and displayed');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the debug
debugYodleeDataFlow().catch(console.error);