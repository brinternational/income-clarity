#!/usr/bin/env node

const { SimpleAuth } = require('../lib/auth/simple-auth');
const { simpleDB } = require('../lib/database/simple-db');

async function setupDemoUser() {
  try {
    console.log('🚀 Setting up demo user and portfolio data...');

    // Create demo user
    const demoUser = await SimpleAuth.createDemoUser();
    
    if (!demoUser.success) {
      console.log('ℹ️ Demo user already exists:', demoUser.user?.email);
    } else {
      console.log('✅ Demo user created:', demoUser.user?.email);
    }

    const userId = demoUser.user.id;

    // Create demo portfolio
    const portfolioResult = simpleDB.createPortfolio(
      userId, 
      'My Investment Portfolio', 
      'Demo portfolio for Income Clarity'
    );
    
    console.log('✅ Demo portfolio created with ID:', portfolioResult.lastInsertRowid);
    const portfolioId = portfolioResult.lastInsertRowid;

    // Add demo holdings
    const demoHoldings = [
      { symbol: 'AAPL', shares: 100, costBasis: 150.00 },
      { symbol: 'MSFT', shares: 50, costBasis: 300.00 },
      { symbol: 'GOOGL', shares: 25, costBasis: 2500.00 },
      { symbol: 'TSLA', shares: 30, costBasis: 800.00 },
      { symbol: 'NVDA', shares: 40, costBasis: 400.00 }
    ];

    for (const holding of demoHoldings) {
      const holdingResult = simpleDB.addHolding(
        portfolioId,
        holding.symbol,
        holding.shares,
        holding.costBasis
      );
      
      // Update with current price (mock data)
      const mockCurrentPrice = holding.costBasis * (0.8 + Math.random() * 0.4); // ±20% variation
      simpleDB.updateHoldingPrice(holdingResult.lastInsertRowid, mockCurrentPrice);
      
      console.log(`✅ Added ${holding.symbol}: ${holding.shares} shares @ $${holding.costBasis}`);
    }

    // Add demo dividends
    const today = new Date();
    const lastQuarter = new Date(today.getFullYear(), today.getMonth() - 3, 1);
    
    // Get holdings to add dividends
    const holdings = simpleDB.getPortfolioHoldings(portfolioId);
    
    for (const holding of holdings) {
      // Add quarterly dividend
      const dividendAmount = holding.shares * 0.50; // $0.50 per share
      simpleDB.addDividend(
        holding.id,
        dividendAmount,
        lastQuarter.toISOString().split('T')[0],
        new Date(lastQuarter.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      );
      
      console.log(`✅ Added dividend for ${holding.symbol}: $${dividendAmount}`);
    }

    console.log('🎉 Demo setup complete!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('\n🚀 You can now start the application with: npm run dev');

  } catch (error) {
    console.error('❌ Demo setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupDemoUser();
}

module.exports = { setupDemoUser };