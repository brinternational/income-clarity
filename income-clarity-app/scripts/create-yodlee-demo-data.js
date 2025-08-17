#!/usr/bin/env node

/**
 * Create Yodlee Demo Data
 * 
 * Since the Yodlee sandbox test user has no investment accounts or holdings,
 * this script creates realistic Yodlee-sourced data to demonstrate the integration.
 * 
 * This mimics what would happen if the user had real investment accounts.
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

// Mock holdings that would come from a real investment account
const MOCK_YODLEE_HOLDINGS = [
  {
    symbol: 'AAPL',
    description: 'Apple Inc.',
    quantity: 50,
    price: 175.84,
    value: 8792.00,
    costBasis: 8500.00,
    assetClassification: 'EQUITY_LARGE_CAP'
  },
  {
    symbol: 'MSFT',
    description: 'Microsoft Corporation',
    quantity: 30,
    price: 378.85,
    value: 11365.50,
    costBasis: 11000.00,
    assetClassification: 'EQUITY_LARGE_CAP'
  },
  {
    symbol: 'GOOGL',
    description: 'Alphabet Inc. Class A',
    quantity: 15,
    price: 2847.73,
    value: 42715.95,
    costBasis: 42000.00,
    assetClassification: 'EQUITY_LARGE_CAP'
  },
  {
    symbol: 'JNJ',
    description: 'Johnson & Johnson',
    quantity: 40,
    price: 159.23,
    value: 6369.20,
    costBasis: 6200.00,
    assetClassification: 'EQUITY_LARGE_CAP'
  },
  {
    symbol: 'KO',
    description: 'The Coca-Cola Company',
    quantity: 80,
    price: 63.45,
    value: 5076.00,
    costBasis: 4800.00,
    assetClassification: 'EQUITY_LARGE_CAP'
  }
];

async function main() {
  try {
    logger.info('🚀 Creating Yodlee Demo Data...');
    
    // 1. Find demo user
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
    
    if (!user || !user.yodleeConnection) {
      logger.error('❌ Demo user or Yodlee connection not found');
      process.exit(1);
    }
    
    logger.info(`✅ Found user: ${user.email}`);
    logger.info(`✅ Real synced accounts: ${user.yodleeConnection.syncedAccounts.length}`);
    
    // 2. Find a bank account to "pretend" is an investment account
    // In reality, this would be a real investment account from Yodlee
    const bankAccount = user.yodleeConnection.syncedAccounts.find(acc => 
      acc.accountType === 'SAVINGS' && acc.accountName === 'TESTDATA1'
    );
    
    if (!bankAccount) {
      logger.error('❌ No suitable account found to use as mock investment account');
      process.exit(1);
    }
    
    logger.info(`✅ Using ${bankAccount.accountName} as mock investment account`);
    
    // 3. Create or find investment portfolio linked to this account
    let investmentPortfolio = user.portfolios.find(p => p.yodleeAccountId === bankAccount.yodleeAccountId);
    
    if (!investmentPortfolio) {
      investmentPortfolio = await prisma.portfolio.create({
        data: {
          userId: user.id,
          name: 'Yodlee Investment Account',
          type: 'Investment',
          institution: bankAccount.institution,
          yodleeAccountId: bankAccount.yodleeAccountId,
          isPrimary: user.portfolios.length === 0,
        }
      });
      
      logger.info(`✅ Created investment portfolio: ${investmentPortfolio.name}`);
    } else {
      logger.info(`✅ Found existing portfolio: ${investmentPortfolio.name}`);
    }
    
    // 4. Clear existing holdings in this portfolio
    const deletedCount = await prisma.holding.deleteMany({
      where: {
        portfolioId: investmentPortfolio.id
      }
    });
    
    logger.info(`🗑️  Cleared ${deletedCount.count} existing holdings`);
    
    // 5. Create Yodlee-sourced holdings
    logger.info('📈 Creating Yodlee-sourced holdings...');
    let importedCount = 0;
    
    for (const holding of MOCK_YODLEE_HOLDINGS) {
      const holdingData = {
        portfolioId: investmentPortfolio.id,
        ticker: holding.symbol,
        name: holding.description,
        shares: holding.quantity,
        currentPrice: holding.price,
        costBasis: holding.costBasis,
        averageCost: holding.costBasis / holding.quantity,
        sector: holding.assetClassification,
        dataSource: 'YODLEE',
        // Note: yodleeAccountId field references SyncedAccount.id, not yodleeAccountId
        // Let's set it to null for now since it's optional
        yodleeAccountId: null,
        lastSyncedAt: new Date(),
        lastUpdated: new Date(),
        metadata: JSON.stringify({
          yodleeHoldingId: `mock_${holding.symbol}_${Date.now()}`,
          value: holding.value,
          assetClassification: holding.assetClassification,
          mockData: true,
          linkedYodleeAccountId: bankAccount.yodleeAccountId, // Store the real Yodlee ID in metadata
        })
      };
      
      const createdHolding = await prisma.holding.create({
        data: holdingData
      });
      
      logger.info(`✅ Created: ${holding.symbol} (${holding.quantity} shares) - $${holding.value.toFixed(2)}`);
      importedCount++;
    }
    
    // 6. Update portfolio totals
    const totalValue = MOCK_YODLEE_HOLDINGS.reduce((sum, h) => sum + h.value, 0);
    const totalCost = MOCK_YODLEE_HOLDINGS.reduce((sum, h) => sum + h.costBasis, 0);
    const totalGain = totalValue - totalCost;
    const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
    
    await prisma.portfolio.update({
      where: { id: investmentPortfolio.id },
      data: {
        totalValue,
        totalCost,
        totalGain,
        totalGainPercent,
        lastUpdated: new Date()
      }
    });
    
    logger.info(`📊 Updated portfolio totals: $${totalValue.toFixed(2)} value`);
    
    // 7. Update Yodlee connection last synced time
    await prisma.yodleeConnection.update({
      where: { id: user.yodleeConnection.id },
      data: { lastSyncedAt: new Date() }
    });
    
    // 8. Create some mock dividend income transactions (Yodlee-sourced)
    logger.info('💰 Creating mock dividend income (Yodlee-sourced)...');
    const dividendIncomes = [
      { ticker: 'AAPL', amount: 23.00, date: new Date('2024-08-15') },
      { ticker: 'MSFT', amount: 22.20, date: new Date('2024-08-10') },
      { ticker: 'JNJ', amount: 45.60, date: new Date('2024-08-05') },
      { ticker: 'KO', amount: 35.20, date: new Date('2024-07-25') },
    ];
    
    for (const dividend of dividendIncomes) {
      await prisma.income.create({
        data: {
          userId: user.id,
          portfolioId: investmentPortfolio.id,
          source: `${dividend.ticker} Dividend`,
          category: 'DIVIDEND',
          amount: dividend.amount,
          date: dividend.date,
          recurring: true,
          frequency: 'QUARTERLY',
          taxable: true,
          description: `Dividend payment from ${dividend.ticker}`,
          dataSource: 'YODLEE',
          yodleeAccountId: null, // SyncedAccount.id reference, set to null for now
          yodleeTransactionId: `mock_div_${dividend.ticker}_${dividend.date.getTime()}`,
          lastSyncedAt: new Date(),
          metadata: JSON.stringify({
            ticker: dividend.ticker,
            mockData: true
          })
        }
      });
      
      logger.info(`✅ Created dividend: ${dividend.ticker} - $${dividend.amount}`);
    }
    
    // 9. Final status check
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
    
    logger.info('🎉 Demo data creation completed!');
    logger.info(`✅ Created ${importedCount} Yodlee-sourced holdings`);
    logger.info(`✅ Created ${dividendIncomes.length} Yodlee-sourced dividend incomes`);
    logger.info(`✅ Total portfolio value: $${totalValue.toFixed(2)}`);
    
    logger.info('📊 Final Holdings Status:');
    logger.info(`  - Total Holdings: ${allHoldings.length}`);
    logger.info(`  - Yodlee Holdings: ${yodleeHoldingsCount}`);
    logger.info(`  - Manual Holdings: ${manualHoldingsCount}`);
    
    logger.info('\n✨ SUCCESS: Demo user now has Yodlee-sourced data!');
    logger.info('   Holdings are marked as dataSource: YODLEE');
    logger.info('   Income is marked as dataSource: YODLEE');
    logger.info('   Data is linked to real Yodlee account IDs');
    
  } catch (error) {
    logger.error('💥 Demo data creation failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };