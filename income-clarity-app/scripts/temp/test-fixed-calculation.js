const { PrismaClient } = require('@prisma/client');

// Simulate the fixed calculation logic
async function testFixedCalculation() {
  const prisma = new PrismaClient();
  
  const user = await prisma.user.findUnique({
    where: { email: 'test@example.com' },
    include: {
      portfolios: {
        include: { holdings: true }
      }
    }
  });
  
  if (!user || !user.portfolios.length) {
    console.log('No user data found');
    return;
  }
  
  const allHoldings = user.portfolios.flatMap(p => p.holdings);
  console.log('🔍 TESTING FIXED CALCULATION LOGIC:');
  console.log('Total raw holdings:', allHoldings.length);
  
  // Apply the FIXED logic
  const holdingMap = new Map();
  allHoldings.forEach(holding => {
    const symbol = holding.ticker;
    let totalCostForHolding;
    
    if (holding.dataSource === 'MANUAL') {
      // MANUAL: costBasis is per-share, multiply by shares
      totalCostForHolding = holding.costBasis * holding.shares;
      console.log(`MANUAL ${symbol}: ${holding.costBasis} * ${holding.shares} = ${totalCostForHolding.toFixed(2)}`);
    } else {
      // YODLEE: costBasis is already total
      totalCostForHolding = holding.costBasis;
      console.log(`YODLEE ${symbol}: ${totalCostForHolding.toFixed(2)} (already total)`);
    }
    
    if (holdingMap.has(symbol)) {
      const existing = holdingMap.get(symbol);
      existing.shares += holding.shares;
      existing.totalCost += totalCostForHolding;
    } else {
      holdingMap.set(symbol, {
        symbol,
        shares: holding.shares,
        totalCost: totalCostForHolding
      });
    }
  });
  
  // Calculate portfolio totals
  const stockPrices = {
    'AAPL': 234.50, 'MSFT': 428.90, 'GOOGL': 186.20, 'JNJ': 176.64, 'KO': 62.50,
    'PG': 100.92, 'VZ': 99.49, 'O': 58.48, 'T': 28.87, 'XOM': 106.49
  };
  
  let totalPortfolioValue = 0;
  let totalCostBasis = 0;
  
  console.log('\n📊 PORTFOLIO CALCULATION:');
  Array.from(holdingMap.values()).forEach(holding => {
    const price = stockPrices[holding.symbol] || 100;
    const value = holding.shares * price;
    
    totalPortfolioValue += value;
    totalCostBasis += holding.totalCost;
    
    const gainLoss = value - holding.totalCost;
    const gainLossPercent = holding.totalCost > 0 ? (gainLoss / holding.totalCost * 100) : 0;
    
    console.log(`${holding.symbol}: $${value.toFixed(0)} value, $${holding.totalCost.toFixed(0)} cost, ${gainLossPercent.toFixed(1)}% return`);
  });
  
  const portfolioReturn = totalCostBasis > 0 ? (totalPortfolioValue - totalCostBasis) / totalCostBasis : 0;
  
  console.log('\n✅ FINAL RESULTS:');
  console.log(`Portfolio Value: $${totalPortfolioValue.toFixed(0)}`);
  console.log(`Cost Basis: $${totalCostBasis.toFixed(0)}`);
  console.log(`Portfolio Return: ${(portfolioReturn * 100).toFixed(1)}%`);
  console.log(`SPY Return: 6.1%`);
  console.log(`Outperformance: ${((portfolioReturn - 0.061) * 100).toFixed(1)}%`);
  
  await prisma.$disconnect();
}

testFixedCalculation().catch(console.error);