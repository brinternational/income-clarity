/**
 * Prisma Client Configuration for Income Clarity SQLite Database
 * Provides singleton pattern for database connections with proper error handling
 */

import { PrismaClient } from '../generated/prisma';

declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Global Prisma client instance
 * Uses singleton pattern to prevent multiple instances in development
 */
export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  errorFormat: 'pretty',
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Test database connection and perform basic operations
 */
export async function testDatabaseConnection() {
  try {
    // console.log('🔄 Testing database connection...');

    // Test connection
    await prisma.$connect();
    // console.log('✅ Database connected successfully');

    // Test basic query
    const userCount = await prisma.user.count();
    // console.log(`📊 Current user count: ${userCount}`);

    // Create test user with comprehensive data
    // console.log('🧪 Creating test user...');
    // const testUser = await prisma.user.create({
      // data: {
        // email: `test-${Date.now()}@incomeclarity.local`,
        // passwordHash: 'test_hash_' + Date.now(),
        // settings: JSON.stringify({
          // theme: 'dark',
          // currency: 'USD',
          // locale: 'en-US',
          // notifications: true
        // }),
        // taxProfile: JSON.stringify({
          // state: 'CA',
          // filingStatus: 'single',
          // federalBracket: 0.22,
          // stateBracket: 0.133,
          // qualifiedDividendRate: 0.15
        })
      }
    // });
    
    // console.log('✅ Test user created:', {
      // id: testUser.id,
      // email: testUser.email,
      // createdAt: testUser.createdAt
    // });
    
    // Test relationship creation - create a portfolio for the user
    // console.log('🧪 Creating test portfolio...');
    // const testPortfolio = await prisma.portfolio.create({
      // data: {
        // userId: testUser.id,
        // name: 'Test Portfolio',
        // type: 'Taxable',
        // institution: 'Test Broker',
        // isPrimary: true
      }
    // });
    
    // console.log('✅ Test portfolio created:', {
      // id: testPortfolio.id,
      // name: testPortfolio.name,
      // type: testPortfolio.type
    // });
    
    // Test nested creation - add a holding to the portfolio
    // console.log('🧪 Creating test holding...');
    // const testHolding = await prisma.holding.create({
      // data: {
        // portfolioId: testPortfolio.id,
        // ticker: 'SPY',
        // shares: 10.5,
        // costBasis: 4200.00,
        // purchaseDate: new Date(),
        // currentPrice: 420.00,
        // dividendYield: 0.013,
        // sector: 'ETF',
        // metadata: JSON.stringify({
          // lastUpdated: new Date().toISOString(),
          // source: 'test'
        })
      }
    // });
    
    // console.log('✅ Test holding created:', {
      // id: testHolding.id,
      // ticker: testHolding.ticker,
      // shares: testHolding.shares
    // });
    
    // Test complex query with relationships
    // console.log('🧪 Testing relationship queries...');
    // const userWithPortfolios = await prisma.user.findUnique({
      // where: { id: testUser.id },
      // include: {
        // portfolios: {
          // include: {
            // holdings: true
          }
        }
      }
    // });
    
    if (userWithPortfolios) {
      // console.log('✅ Complex query successful:', {
        // userId: userWithPortfolios.id,
        // portfolioCount: userWithPortfolios.portfolios.length,
        // holdingsCount: userWithPortfolios.portfolios.reduce(
          // (total, portfolio) => total + portfolio.holdings.length,
          // 0
        // )
      // });
    }
    
    // Test additional tables
    // console.log('🧪 Testing additional models...');

    // Test income tracking
    const testIncome = await prisma.income.create({
      data: {
        userId: testUser.id,
        source: 'SPY Dividend',
        category: 'DIVIDEND',
        amount: 5.46,
        date: new Date(),
        recurring: true,
        frequency: 'QUARTERLY',
        taxable: true
      }
    });
    
    // Test expense tracking
    const testExpense = await prisma.expense.create({
      data: {
        userId: testUser.id,
        category: 'UTILITIES',
        merchant: 'Electric Company',
        amount: 120.50,
        date: new Date(),
        recurring: true,
        frequency: 'MONTHLY',
        priority: 8,
        essential: true
      }
    });
    
    // Test stock price data
    const testStockPrice = await prisma.stockPrice.create({
      data: {
        ticker: 'SPY',
        date: new Date(),
        open: 418.50,
        high: 422.30,
        low: 417.80,
        close: 420.00,
        volume: 50000000,
        adjustedClose: 420.00
      }
    });
    
    // console.log('✅ Additional models tested successfully');

    // Clean up test data
    // console.log('🧹 Cleaning up test data...');

    // Delete in reverse order due to foreign key constraints
    await prisma.holding.delete({ where: { id: testHolding.id } });
    await prisma.portfolio.delete({ where: { id: testPortfolio.id } });
    await prisma.income.delete({ where: { id: testIncome.id } });
    await prisma.expense.delete({ where: { id: testExpense.id } });
    await prisma.stockPrice.delete({ where: { id: testStockPrice.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    
    // console.log('✅ Test cleanup successful');

    // Final verification
    const finalUserCount = await prisma.user.count();
    // console.log(`📊 Final user count: ${finalUserCount}`);

    // console.log('🎉 All database tests passed successfully!');
    // return true;
    
  } catch (error) {
    // console.error('❌ Database test failed:', error);

    // Enhanced error reporting
    if (error instanceof Error) {
      // console.error('Error name:', error.name);
      // console.error('Error message:', error.message);
      if ('code' in error) {
        // console.error('Error code:', (error as any).code);
      }
    }
    
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Health check for database
 */
export async function databaseHealthCheck() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', timestamp: new Date().toISOString() };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats() {
  try {
    const [
      userCount,
      portfolioCount,
      holdingCount,
      transactionCount,
      incomeCount,
      expenseCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.portfolio.count(),
      prisma.holding.count(),
      prisma.transaction.count(),
      prisma.income.count(),
      prisma.expense.count()
    ]);
    
    return {
      users: userCount,
      portfolios: portfolioCount,
      holdings: holdingCount,
      transactions: transactionCount,
      incomes: incomeCount,
      expenses: expenseCount,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to get database stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Initialize database with any required setup
 */
export async function initializeDatabase() {
  try {
    // console.log('🔄 Initializing database...');

    // Run any initialization queries
    // For example, you could create indexes or initial data here
    
    // console.log('✅ Database initialization complete');
    // return true;
  } catch (error) {
    // console.error('❌ Database initialization failed:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;