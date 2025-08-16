#!/usr/bin/env node

/**
 * Database connection test script for Income Clarity SQLite database
 * Tests all database functionality including CRUD operations and relationships
 */

const path = require('path');

// Import the database client
async function testDatabase() {
  try {
    // For Node.js compatibility with TypeScript files
    const { PrismaClient } = require('../lib/generated/prisma');
    
    // Test basic connection manually since TypeScript import may not work in Node.js
    const prisma = new PrismaClient({
      log: ['error']
    });
    
    // console.log('🔄 Testing basic Prisma connection...');
    await prisma.$connect();
    // console.log('✅ Prisma client connected successfully');
    
    // Manual implementation of test functions
    const testDatabaseConnection = async () => {
      try {
        // console.log('🧪 Running comprehensive database tests...');
        
        // Test user creation
        const testUser = await prisma.user.create({
          data: {
            email: `test-${Date.now()}@incomeclarity.local`,
            passwordHash: 'test_hash_' + Date.now(),
            settings: JSON.stringify({ theme: 'dark', currency: 'USD' }),
            taxProfile: JSON.stringify({ state: 'CA', filingStatus: 'single' })
          }
        });
        // console.log('✅ User creation successful');
        
        // Test portfolio creation
        const testPortfolio = await prisma.portfolio.create({
          data: {
            userId: testUser.id,
            name: 'Test Portfolio',
            type: 'Taxable',
            isPrimary: true
          }
        });
        // console.log('✅ Portfolio creation successful');
        
        // Test holding creation
        const testHolding = await prisma.holding.create({
          data: {
            portfolioId: testPortfolio.id,
            ticker: 'SPY',
            shares: 10.0,
            costBasis: 4200.0,
            purchaseDate: new Date()
          }
        });
        // console.log('✅ Holding creation successful');
        
        // Test relationship queries
        const userWithData = await prisma.user.findUnique({
          where: { id: testUser.id },
          include: {
            portfolios: {
              include: {
                holdings: true
              }
            }
          }
        });
        
        if (userWithData && userWithData.portfolios.length > 0) {
          // console.log('✅ Relationship query successful');
        }
        
        // Cleanup
        await prisma.holding.delete({ where: { id: testHolding.id } });
        await prisma.portfolio.delete({ where: { id: testPortfolio.id } });
        await prisma.user.delete({ where: { id: testUser.id } });
        // console.log('✅ Cleanup successful');
        
        return true;
      } catch (error) {
        // console.error('❌ Database test error:', error);
        return false;
      }
    };
    
    const getDatabaseStats = async () => {
      const [userCount, portfolioCount, holdingCount] = await Promise.all([
        prisma.user.count(),
        prisma.portfolio.count(),
        prisma.holding.count()
      ]);
      
      return { users: userCount, portfolios: portfolioCount, holdings: holdingCount };
    };
    
    const databaseHealthCheck = async () => {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return { status: 'healthy', timestamp: new Date().toISOString() };
      } catch (error) {
        return { status: 'unhealthy', error: error.message };
      }
    };
    
    // console.log('🚀 Income Clarity Database Test Suite');
    // console.log('=====================================');
    
    // Run health check first
    // console.log('\n1️⃣ Health Check:');
    const health = await databaseHealthCheck();
    // console.log('Health Status:', health);
    
    if (health.status === 'unhealthy') {
      // console.error('❌ Database is not healthy, aborting tests');
      await prisma.$disconnect();
      process.exit(1);
    }
    
    // Get initial stats
    // console.log('\n2️⃣ Initial Database Stats:');
    const initialStats = await getDatabaseStats();
    // console.log(initialStats);
    
    // Run comprehensive connection test
    // console.log('\n3️⃣ Comprehensive Database Test:');
    const testResult = await testDatabaseConnection();
    
    if (!testResult) {
      // console.error('❌ Database tests failed');
      await prisma.$disconnect();
      process.exit(1);
    }
    
    // Get final stats
    // console.log('\n4️⃣ Final Database Stats:');
    const finalStats = await getDatabaseStats();
    // console.log(finalStats);
    
    // console.log('\n🎉 All database tests completed successfully!');
    // console.log('✅ Database is ready for production use');
    
    await prisma.$disconnect();
    process.exit(0);
    
  } catch (error) {
    // console.error('❌ Test suite failed:', error);
    
    // Enhanced error reporting
    if (error.code === 'MODULE_NOT_FOUND') {
      // console.error('💡 Hint: Make sure you run "npm run db:generate" first');
    } else if (error.message.includes('SQLITE_CANTOPEN')) {
      // console.error('💡 Hint: Make sure you run "npm run db:push" first');
    } else if (error.message.includes('no such table')) {
      // console.error('💡 Hint: Database schema may not be up to date, try "npm run db:push"');
    }
    
    // console.error('\n🔧 Troubleshooting steps:');
    // console.error('1. npm run db:push     # Create/update database');
    // console.error('2. npm run db:generate # Generate Prisma client');  
    // console.error('3. node scripts/test-db.js # Run this test again');
    
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };