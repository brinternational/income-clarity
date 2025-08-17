#!/usr/bin/env node

/**
 * Fix Yodlee Account IDs
 * 
 * This script updates the database with the REAL Yodlee account IDs
 * returned from the API, replacing the fake ones that were created.
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const logger = {
  info: (msg, ...args) => console.log(`[INFO] ${msg}`, ...args),
  warn: (msg, ...args) => console.warn(`[WARN] ${msg}`, ...args),
  error: (msg, ...args) => console.error(`[ERROR] ${msg}`, ...args),
};

const DEMO_USER_EMAIL = 'test@example.com';
const TEST_USER_ID = 'sbMem68a0d5bfa0b691';

// Yodlee API configuration
const YODLEE_CONFIG = {
  baseUrl: process.env.YODLEE_API_URL || 'https://sandbox.api.yodlee.com/ysl',
  clientId: process.env.YODLEE_CLIENT_ID,
  clientSecret: process.env.YODLEE_CLIENT_SECRET,
  adminLogin: process.env.YODLEE_ADMIN_LOGIN,
  apiVersion: '1.1'
};

async function getYodleeAccessToken() {
  const response = await fetch(`${YODLEE_CONFIG.baseUrl}/auth/token`, {
    method: 'POST',
    headers: {
      'Api-Version': YODLEE_CONFIG.apiVersion,
      'Content-Type': 'application/x-www-form-urlencoded',
      'loginName': YODLEE_CONFIG.adminLogin,
    },
    body: new URLSearchParams({
      clientId: YODLEE_CONFIG.clientId,
      secret: YODLEE_CONFIG.clientSecret,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.token.accessToken;
}

async function getUserToken() {
  try {
    const response = await fetch(`${YODLEE_CONFIG.baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Api-Version': YODLEE_CONFIG.apiVersion,
        'Content-Type': 'application/x-www-form-urlencoded',
        'loginName': TEST_USER_ID,
      },
      body: new URLSearchParams({
        clientId: YODLEE_CONFIG.clientId,
        secret: YODLEE_CONFIG.clientSecret,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.token.accessToken;
    }
  } catch (error) {
    logger.warn('Could not get user-specific token, using admin token');
  }
  
  return await getYodleeAccessToken();
}

async function getYodleeAccounts(userToken) {
  const response = await fetch(`${YODLEE_CONFIG.baseUrl}/accounts`, {
    method: 'GET',
    headers: {
      'Api-Version': YODLEE_CONFIG.apiVersion,
      'Authorization': `Bearer ${userToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get Yodlee accounts: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.account || [];
}

async function main() {
  try {
    logger.info('🔧 Starting Yodlee Account Fix...');
    
    // 1. Find demo user
    const user = await prisma.user.findFirst({
      where: { email: DEMO_USER_EMAIL },
      include: {
        yodleeConnection: {
          include: {
            syncedAccounts: true
          }
        }
      }
    });
    
    if (!user || !user.yodleeConnection) {
      logger.error('❌ Demo user or Yodlee connection not found');
      process.exit(1);
    }
    
    logger.info(`✅ Found user: ${user.email}`);
    logger.info(`✅ Current synced accounts: ${user.yodleeConnection.syncedAccounts.length}`);
    
    // 2. Get real accounts from Yodlee API
    logger.info('🔑 Getting user token...');
    const userToken = await getUserToken();
    
    logger.info('📊 Fetching real accounts from Yodlee...');
    const realAccounts = await getYodleeAccounts(userToken);
    
    logger.info(`✅ Found ${realAccounts.length} real accounts from Yodlee:`);
    realAccounts.forEach((acc, i) => {
      logger.info(`  ${i + 1}. ${acc.accountName} (${acc.accountType}) - ID: ${acc.id} - Container: ${acc.CONTAINER}`);
    });
    
    // 3. Clear existing fake synced accounts
    logger.info('🗑️  Clearing existing fake synced accounts...');
    await prisma.syncedAccount.deleteMany({
      where: {
        connectionId: user.yodleeConnection.id
      }
    });
    
    // 4. Create new synced accounts with real IDs
    logger.info('✨ Creating new synced accounts with real IDs...');
    let createdCount = 0;
    
    for (const account of realAccounts) {
      const accountType = getAccountType(account);
      
      const syncedAccount = await prisma.syncedAccount.create({
        data: {
          connectionId: user.yodleeConnection.id,
          yodleeAccountId: account.id.toString(),
          accountName: account.accountName,
          accountType: accountType,
          accountNumber: account.accountNumber || 'N/A',
          balance: account.balance?.amount || 0,
          currency: account.balance?.currency || 'USD',
          institution: account.providerName || 'Unknown',
          lastRefreshed: new Date(),
          isActive: account.accountStatus === 'ACTIVE'
        }
      });
      
      logger.info(`✅ Created: ${syncedAccount.accountName} (${syncedAccount.accountType}) - ${syncedAccount.yodleeAccountId}`);
      createdCount++;
    }
    
    // 5. Update portfolios to remove old fake yodleeAccountId references
    logger.info('🔧 Updating portfolios to remove fake account references...');
    await prisma.portfolio.updateMany({
      where: {
        userId: user.id,
        yodleeAccountId: {
          not: null
        }
      },
      data: {
        yodleeAccountId: null
      }
    });
    
    // 6. Update holdings to remove fake account references
    logger.info('🔧 Updating holdings to remove fake account references...');
    await prisma.holding.updateMany({
      where: {
        portfolioId: {
          in: user.portfolios?.map(p => p.id) || []
        },
        yodleeAccountId: {
          not: null
        }
      },
      data: {
        yodleeAccountId: null
      }
    });
    
    // 7. Update last sync time
    await prisma.yodleeConnection.update({
      where: { id: user.yodleeConnection.id },
      data: { lastSyncedAt: new Date() }
    });
    
    logger.info('🎉 Account fix completed successfully!');
    logger.info(`✅ Created ${createdCount} real synced accounts`);
    logger.info('✅ Removed fake account ID references from portfolios and holdings');
    
    // 8. Show the reality check
    logger.info('\n📊 Reality Check:');
    logger.info('The Yodlee test user has:');
    realAccounts.forEach(acc => {
      logger.info(`  - ${acc.accountName}: ${acc.CONTAINER} (${getAccountType(acc)})`);
    });
    
    const investmentAccounts = realAccounts.filter(acc => acc.CONTAINER === 'investment');
    if (investmentAccounts.length === 0) {
      logger.warn('\n⚠️  IMPORTANT: The Yodlee test user has NO investment accounts!');
      logger.warn('   This means there will be no holdings/stocks data available.');
      logger.warn('   The test user only has bank and credit card accounts.');
      logger.warn('   This is normal for Yodlee sandbox test data.');
    }
    
  } catch (error) {
    logger.error('💥 Fix failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function getAccountType(yodleeAccount) {
  // Map Yodlee container types to our account types
  const containerMap = {
    'bank': yodleeAccount.accountType === 'CHECKING' ? 'CHECKING' : 'SAVINGS',
    'creditCard': 'CREDIT_CARD',
    'investment': 'INVESTMENT',
    'insurance': 'INSURANCE',
    'loan': 'LOAN'
  };
  
  return containerMap[yodleeAccount.CONTAINER] || 'OTHER';
}

if (require.main === module) {
  main();
}

module.exports = { main };