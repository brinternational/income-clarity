#!/usr/bin/env node

/**
 * Yodlee Holdings Sync Script
 * 
 * This script fetches real holdings data from Yodlee API for the demo user
 * and imports them with dataSource: 'YODLEE' to replace manual demo data.
 * 
 * CRITICAL: This addresses the issue where demo user has Yodlee connection
 * but all holdings are still marked as MANUAL instead of YODLEE.
 */

require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
// Use built-in fetch (Node.js 18+)

const prisma = new PrismaClient();

// Simple logger
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

// Yodlee API helper functions
async function getYodleeAccessToken() {
  if (!YODLEE_CONFIG.clientId || !YODLEE_CONFIG.clientSecret || !YODLEE_CONFIG.adminLogin) {
    throw new Error('Missing Yodlee environment variables: YODLEE_CLIENT_ID, YODLEE_CLIENT_SECRET, YODLEE_ADMIN_LOGIN');
  }

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
    throw new Error(`Failed to get Yodlee access token: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  return data.token.accessToken;
}

async function getUserToken(yodleeUserId) {
  // For sandbox, try to get user-specific token or fallback to admin token
  try {
    const response = await fetch(`${YODLEE_CONFIG.baseUrl}/auth/token`, {
      method: 'POST',
      headers: {
        'Api-Version': YODLEE_CONFIG.apiVersion,
        'Content-Type': 'application/x-www-form-urlencoded',
        'loginName': yodleeUserId,
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
  
  // Fallback to admin token
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

async function getYodleeHoldings(userToken, accountIds = []) {
  const params = new URLSearchParams();
  if (accountIds.length) params.append('accountId', accountIds.join(','));

  const response = await fetch(`${YODLEE_CONFIG.baseUrl}/holdings?${params}`, {
    method: 'GET',
    headers: {
      'Api-Version': YODLEE_CONFIG.apiVersion,
      'Authorization': `Bearer ${userToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get Yodlee holdings: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.holding || [];
}

async function main() {
  try {
    logger.info('🚀 Starting Yodlee Holdings Sync...');
    
    // 1. Check if Yodlee is configured
    if (!YODLEE_CONFIG.clientId || !YODLEE_CONFIG.clientSecret || !YODLEE_CONFIG.adminLogin) {
      logger.error('❌ Yodlee not configured. Missing environment variables:');
      logger.error('  - YODLEE_CLIENT_ID:', !!YODLEE_CONFIG.clientId);
      logger.error('  - YODLEE_CLIENT_SECRET:', !!YODLEE_CONFIG.clientSecret);
      logger.error('  - YODLEE_ADMIN_LOGIN:', !!YODLEE_CONFIG.adminLogin);
      process.exit(1);
    }
    
    // 2. Find demo user and Yodlee connection
    const user = await prisma.user.findFirst({
      where: { email: DEMO_USER_EMAIL },
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
    
    if (!user) {
      logger.error('❌ Demo user not found');
      process.exit(1);
    }
    
    if (!user.yodleeConnection) {
      logger.error('❌ User has no Yodlee connection');
      process.exit(1);
    }
    
    logger.info(`✅ Found user: ${user.email}`);
    logger.info(`✅ Yodlee User ID: ${user.yodleeConnection.yodleeUserId}`);
    logger.info(`✅ Synced Accounts: ${user.yodleeConnection.syncedAccounts.length}`);
    
    // 3. Get user token for Yodlee API calls
    logger.info('🔑 Getting user token...');
    const userToken = await getUserToken(user.yodleeConnection.yodleeUserId);
    logger.info('✅ Got user token');
    
    // 4. Get investment accounts (where holdings should be)
    const investmentAccounts = user.yodleeConnection.syncedAccounts.filter(
      acc => acc.accountType === 'INVESTMENT'
    );
    
    if (investmentAccounts.length === 0) {
      logger.warn('⚠️  No investment accounts found');
      return;
    }
    
    logger.info(`📊 Found ${investmentAccounts.length} investment accounts:`);
    investmentAccounts.forEach(acc => {
      logger.info(`  - ${acc.accountName} (${acc.yodleeAccountId})`);
    });
    
    // 5. Fetch holdings from Yodlee
    logger.info('📈 Fetching holdings from Yodlee...');
    const accountIds = investmentAccounts.map(acc => acc.yodleeAccountId);
    const yodleeHoldings = await getYodleeHoldings(userToken, accountIds);
    
    logger.info(`✅ Fetched ${yodleeHoldings.length} holdings from Yodlee`);
    
    if (yodleeHoldings.length === 0) {
      logger.warn('⚠️  No holdings returned from Yodlee API');
      logger.info('This might be expected for sandbox test data');
      return;
    }
    
    // 6. Find or create portfolios for investment accounts
    const portfolioMap = new Map();
    
    for (const account of investmentAccounts) {
      let portfolio = user.portfolios.find(p => p.yodleeAccountId === account.yodleeAccountId);
      
      if (!portfolio) {
        // Create portfolio for this investment account
        portfolio = await prisma.portfolio.create({
          data: {
            userId: user.id,
            name: account.accountName,
            type: 'Investment',
            institution: account.institution || 'Unknown',
            yodleeAccountId: account.yodleeAccountId,
            isPrimary: user.portfolios.length === 0, // First one is primary
          }
        });
        
        logger.info(`✅ Created portfolio: ${portfolio.name}`);
      }
      
      portfolioMap.set(account.yodleeAccountId, portfolio);
    }
    
    // 7. Clear existing Yodlee holdings (clean slate)
    const deletedCount = await prisma.holding.deleteMany({
      where: {
        portfolioId: {
          in: Array.from(portfolioMap.values()).map(p => p.id)
        },
        dataSource: 'YODLEE'
      }
    });
    
    logger.info(`🗑️  Cleared ${deletedCount.count} existing Yodlee holdings`);
    
    // 8. Import Yodlee holdings
    let importedCount = 0;
    
    for (const holding of yodleeHoldings) {
      try {
        const portfolio = portfolioMap.get(holding.accountId);
        
        if (!portfolio) {
          logger.warn(`⚠️  No portfolio found for account ${holding.accountId}, skipping holding ${holding.symbol}`);
          continue;
        }
        
        // Create or update holding
        const holdingData = {
          portfolioId: portfolio.id,
          ticker: holding.symbol,
          name: holding.description,
          shares: holding.quantity,
          currentPrice: holding.price,
          costBasis: holding.costBasis || holding.value, // Use value if no cost basis
          averageCost: holding.costBasis ? holding.costBasis / holding.quantity : holding.price,
          sector: holding.assetClassification || null,
          dataSource: 'YODLEE',
          yodleeAccountId: holding.accountId,
          lastSyncedAt: new Date(),
          lastUpdated: new Date(),
          metadata: JSON.stringify({
            yodleeHoldingId: holding.id,
            value: holding.value,
            assetClassification: holding.assetClassification,
          })
        };
        
        // Use upsert to handle duplicates
        const upsertedHolding = await prisma.holding.upsert({
          where: {
            portfolioId_ticker: {
              portfolioId: portfolio.id,
              ticker: holding.symbol
            }
          },
          create: holdingData,
          update: {
            shares: holding.quantity,
            currentPrice: holding.price,
            dataSource: 'YODLEE',
            yodleeAccountId: holding.accountId,
            lastSyncedAt: new Date(),
            lastUpdated: new Date(),
            metadata: holdingData.metadata
          }
        });
        
        logger.info(`✅ Imported: ${holding.symbol} (${holding.quantity} shares) in ${portfolio.name}`);
        importedCount++;
        
      } catch (error) {
        logger.error(`❌ Failed to import holding ${holding.symbol}:`, error.message);
      }
    }
    
    // 9. Update Yodlee connection last synced time
    await prisma.yodleeConnection.update({
      where: { id: user.yodleeConnection.id },
      data: { lastSyncedAt: new Date() }
    });
    
    // 10. Update portfolio totals
    for (const portfolio of portfolioMap.values()) {
      const holdings = await prisma.holding.findMany({
        where: { portfolioId: portfolio.id }
      });
      
      const totalValue = holdings.reduce((sum, h) => sum + (h.shares * (h.currentPrice || 0)), 0);
      const totalCost = holdings.reduce((sum, h) => sum + (h.costBasis || 0), 0);
      const totalGain = totalValue - totalCost;
      const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
      
      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          totalValue,
          totalCost,
          totalGain,
          totalGainPercent,
          lastUpdated: new Date()
        }
      });
      
      logger.info(`📊 Updated portfolio ${portfolio.name}: $${totalValue.toFixed(2)} value`);
    }
    
    // 11. Summary
    logger.info('🎉 Sync completed successfully!');
    logger.info(`📈 Imported ${importedCount} holdings from Yodlee`);
    logger.info(`🔗 Linked to ${investmentAccounts.length} investment accounts`);
    logger.info('✅ Holdings now marked as dataSource: YODLEE');
    
    // Show current status
    const updatedUser = await prisma.user.findFirst({
      where: { id: user.id },
      include: {
        portfolios: {
          include: {
            holdings: true
          }
        }
      }
    });
    
    const allHoldings = updatedUser.portfolios.flatMap(p => p.holdings);
    const yodleeHoldingsCount = allHoldings.filter(h => h.dataSource === 'YODLEE').length;
    const manualHoldingsCount = allHoldings.filter(h => h.dataSource === 'MANUAL').length;
    
    logger.info('📊 Final Status:');
    logger.info(`  - Total Holdings: ${allHoldings.length}`);
    logger.info(`  - Yodlee Holdings: ${yodleeHoldingsCount}`);
    logger.info(`  - Manual Holdings: ${manualHoldingsCount}`);
    
  } catch (error) {
    logger.error('💥 Sync failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🛑 Received SIGINT, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🛑 Received SIGTERM, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

if (require.main === module) {
  main();
}

module.exports = { main };