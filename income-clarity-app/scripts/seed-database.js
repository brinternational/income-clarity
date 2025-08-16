/**
 * Enhanced Database Seed Script for Income Clarity
 * Creates realistic demo portfolio data with dividend stocks
 * Requirements: DEMO-001 through DEMO-007
 */

const { PrismaClient } = require('../lib/generated/prisma');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Helper function to create dates going back from today
function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

// Helper function to create monthly dates for dividend payments
function getQuarterlyDates(ticker, startDate = daysAgo(365)) {
  const dates = [];
  const current = new Date(startDate);
  const today = new Date();
  
  // Different payment patterns for different companies
  const paymentMonths = {
    'AAPL': [2, 5, 8, 11], // Feb, May, Aug, Nov
    'MSFT': [3, 6, 9, 12], // Mar, Jun, Sep, Dec
    'JNJ': [3, 6, 9, 12], // Mar, Jun, Sep, Dec
    'KO': [1, 4, 7, 10],  // Jan, Apr, Jul, Oct
    'VZ': [2, 5, 8, 11],  // Feb, May, Aug, Nov
    'T': [2, 5, 8, 11],   // Feb, May, Aug, Nov
    'PFE': [3, 6, 9, 12], // Mar, Jun, Sep, Dec
    'XOM': [3, 6, 9, 12], // Mar, Jun, Sep, Dec
    'CVX': [3, 6, 9, 12], // Mar, Jun, Sep, Dec
    'O': Array.from({length: 12}, (_, i) => i + 1) // Monthly for REIT
  };
  
  const months = paymentMonths[ticker] || [3, 6, 9, 12];
  
  while (current < today) {
    const currentMonth = current.getMonth() + 1;
    if (months.includes(currentMonth)) {
      dates.push(new Date(current));
    }
    current.setMonth(current.getMonth() + 1);
  }
  
  return dates;
}

// Realistic dividend stock data with current market prices and yields
const DIVIDEND_STOCKS = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    currentPrice: 225.50,
    dividendYield: 0.0040, // 0.40%
    quarterlyDividend: 0.25,
    purchases: [
      { date: daysAgo(720), shares: 25, price: 175.50 }, // 2 years ago
      { date: daysAgo(540), shares: 15, price: 195.20 }, // 1.5 years ago  
      { date: daysAgo(360), shares: 20, price: 180.75 }, // 1 year ago
      { date: daysAgo(180), shares: 10, price: 210.30 }  // 6 months ago
    ]
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology', 
    currentPrice: 420.25,
    dividendYield: 0.0065, // 0.65%
    quarterlyDividend: 0.75,
    purchases: [
      { date: daysAgo(690), shares: 15, price: 385.40 },
      { date: daysAgo(450), shares: 10, price: 395.60 },
      { date: daysAgo(270), shares: 8, price: 410.90 }
    ]
  },
  {
    ticker: 'JNJ',
    name: 'Johnson & Johnson',
    sector: 'Healthcare',
    currentPrice: 158.75,
    dividendYield: 0.0290, // 2.90%
    quarterlyDividend: 1.19,
    purchases: [
      { date: daysAgo(650), shares: 40, price: 165.20 },
      { date: daysAgo(400), shares: 25, price: 175.80 },
      { date: daysAgo(200), shares: 15, price: 162.45 }
    ]
  },
  {
    ticker: 'KO',
    name: 'The Coca-Cola Company',
    sector: 'Consumer Defensive',
    currentPrice: 62.30,
    dividendYield: 0.0310, // 3.10%
    quarterlyDividend: 0.48,
    purchases: [
      { date: daysAgo(600), shares: 80, price: 58.90 },
      { date: daysAgo(320), shares: 50, price: 64.20 },
      { date: daysAgo(150), shares: 30, price: 61.75 }
    ]
  },
  {
    ticker: 'VZ',
    name: 'Verizon Communications Inc.',
    sector: 'Telecom',
    currentPrice: 41.20,
    dividendYield: 0.0640, // 6.40%
    quarterlyDividend: 0.67,
    purchases: [
      { date: daysAgo(580), shares: 120, price: 52.40 }, // Higher cost basis - showing loss
      { date: daysAgo(350), shares: 60, price: 48.90 },
      { date: daysAgo(120), shares: 40, price: 43.60 }
    ]
  },
  {
    ticker: 'T',
    name: 'AT&T Inc.',
    sector: 'Telecom',
    currentPrice: 22.15,
    dividendYield: 0.0720, // 7.20%
    quarterlyDividend: 0.28,
    purchases: [
      { date: daysAgo(630), shares: 200, price: 28.50 }, // Higher cost basis - showing loss
      { date: daysAgo(380), shares: 150, price: 25.20 },
      { date: daysAgo(190), shares: 100, price: 23.80 }
    ]
  },
  {
    ticker: 'PFE', 
    name: 'Pfizer Inc.',
    sector: 'Healthcare',
    currentPrice: 28.40,
    dividendYield: 0.0580, // 5.80%
    quarterlyDividend: 0.42,
    purchases: [
      { date: daysAgo(560), shares: 150, price: 32.80 },
      { date: daysAgo(290), shares: 100, price: 31.50 },
      { date: daysAgo(100), shares: 75, price: 29.20 }
    ]
  },
  {
    ticker: 'XOM',
    name: 'Exxon Mobil Corporation',
    sector: 'Energy',
    currentPrice: 118.60,
    dividendYield: 0.0320, // 3.20%
    quarterlyDividend: 0.95,
    purchases: [
      { date: daysAgo(680), shares: 30, price: 95.40 },
      { date: daysAgo(420), shares: 20, price: 108.20 },
      { date: daysAgo(240), shares: 15, price: 115.80 }
    ]
  },
  {
    ticker: 'O',
    name: 'Realty Income Corporation',
    sector: 'Real Estate',
    currentPrice: 58.25,
    dividendYield: 0.0560, // 5.60%
    monthlyDividend: 0.263, // Monthly REIT payment
    purchases: [
      { date: daysAgo(500), shares: 100, price: 62.40 },
      { date: daysAgo(300), shares: 75, price: 55.80 },
      { date: daysAgo(160), shares: 50, price: 59.90 }
    ]
  },
  {
    ticker: 'CVX',
    name: 'Chevron Corporation', 
    sector: 'Energy',
    currentPrice: 155.80,
    dividendYield: 0.0330, // 3.30%
    quarterlyDividend: 1.42,
    purchases: [
      { date: daysAgo(710), shares: 25, price: 145.20 },
      { date: daysAgo(460), shares: 15, price: 162.40 },
      { date: daysAgo(210), shares: 12, price: 158.90 }
    ]
  }
];

async function main() {
  console.log('🌱 Starting enhanced database seed with realistic demo data...');
  console.log('📋 Requirements: DEMO-001 through DEMO-007');

  try {
    // Check database connection
    await prisma.$connect();
    console.log('✅ Database connected');

    // Clear existing data (in reverse order due to foreign keys)
    console.log('🧹 Cleaning existing data...');
    
    await prisma.transaction.deleteMany({});
    await prisma.dividendSchedule.deleteMany({});
    await prisma.holding.deleteMany({});
    await prisma.portfolio.deleteMany({});
    await prisma.income.deleteMany({});
    await prisma.expense.deleteMany({});
    await prisma.stockPrice.deleteMany({});
    await prisma.calculationCache.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✅ Existing data cleared');

    // Create demo user (REQUIREMENT: Use test@example.com)
    console.log('👤 Creating demo user...');
    const demoUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: 'demo_password_hash_not_real', // This is just for demo
        settings: JSON.stringify({
          theme: 'light',
          currency: 'USD',
          locale: 'en-US',
          notifications: true,
          autoSync: true,
          showTargetIncome: true
        }),
        taxProfile: JSON.stringify({
          state: 'FL', // Florida - no state tax
          filingStatus: 'single',
          federalBracket: 0.22,
          stateBracket: 0.0, // No state tax in FL
          qualifiedDividendRate: 0.15, // 15% on qualified dividends
          effectiveRate: 0.18,
          taxAdvantaged: false
        })
      }
    });

    console.log(`✅ Demo user created: ${demoUser.email}`);

    // Create main portfolio
    console.log('💼 Creating portfolio...');
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: demoUser.id,
        name: 'Dividend Growth Portfolio',
        type: 'Taxable',
        institution: 'Charles Schwab',
        isPrimary: true
      }
    });

    console.log(`✅ Portfolio created: ${portfolio.name}`);

    // DEMO-001 & DEMO-002: Create holdings with realistic dividend stocks
    console.log('📊 Creating realistic dividend stock holdings...');
    
    let totalPortfolioValue = 0;
    let totalAnnualDividends = 0;
    
    for (const stock of DIVIDEND_STOCKS) {
      // Calculate total shares and weighted average cost basis
      const totalShares = stock.purchases.reduce((sum, purchase) => sum + purchase.shares, 0);
      const totalCost = stock.purchases.reduce((sum, purchase) => sum + (purchase.shares * purchase.price), 0);
      const weightedAvgCostBasis = totalCost / totalShares;
      
      // Create holding record
      await prisma.holding.create({
        data: {
          portfolioId: portfolio.id,
          ticker: stock.ticker,
          shares: totalShares,
          costBasis: weightedAvgCostBasis,
          purchaseDate: stock.purchases[0].date, // First purchase date
          currentPrice: stock.currentPrice,
          dividendYield: stock.dividendYield,
          sector: stock.sector,
          metadata: JSON.stringify({
            companyName: stock.name,
            lastUpdated: new Date().toISOString(),
            source: 'enhanced_seed',
            totalPositions: stock.purchases.length,
            avgCostBasis: weightedAvgCostBasis
          })
        }
      });

      const positionValue = totalShares * stock.currentPrice;
      const annualDividend = positionValue * stock.dividendYield;
      totalPortfolioValue += positionValue;
      totalAnnualDividends += annualDividend;

      console.log(`  ✅ ${stock.ticker} (${stock.sector}): ${totalShares} shares @ $${stock.currentPrice} = $${positionValue.toLocaleString()}`);
      console.log(`     💰 Annual dividend: $${annualDividend.toFixed(2)} (${(stock.dividendYield * 100).toFixed(2)}% yield)`);
    }

    console.log(`📈 Total portfolio value: $${totalPortfolioValue.toLocaleString()}`);
    console.log(`💵 Total annual dividends: $${totalAnnualDividends.toLocaleString()}`);

    // DEMO-003: Create historical purchase transactions
    console.log('📝 Creating historical purchase transactions...');
    
    let transactionCount = 0;
    
    for (const stock of DIVIDEND_STOCKS) {
      for (const purchase of stock.purchases) {
        await prisma.transaction.create({
          data: {
            userId: demoUser.id,
            portfolioId: portfolio.id,
            ticker: stock.ticker,
            type: 'BUY',
            shares: purchase.shares,
            amount: purchase.shares * purchase.price,
            date: purchase.date,
            notes: `Purchase of ${purchase.shares} shares at $${purchase.price}`,
            metadata: JSON.stringify({
              pricePerShare: purchase.price,
              fees: 0, // Commission-free trading
              orderType: 'market',
              source: 'enhanced_seed'
            })
          }
        });
        transactionCount++;
      }
    }

    console.log(`✅ Created ${transactionCount} BUY transactions`);

    // DEMO-004: Create dividend payment history for past 12 months
    console.log('💰 Creating dividend payment history...');
    
    let dividendTransactionCount = 0;
    let totalDividendsReceived = 0;
    
    for (const stock of DIVIDEND_STOCKS) {
      const paymentDates = getQuarterlyDates(stock.ticker);
      
      for (const payDate of paymentDates) {
        // Calculate shares owned at the time of payment
        const sharesAtPayment = stock.purchases
          .filter(purchase => purchase.date <= payDate)
          .reduce((sum, purchase) => sum + purchase.shares, 0);
        
        if (sharesAtPayment > 0) {
          const dividendPerShare = stock.monthlyDividend || stock.quarterlyDividend;
          const totalDividend = sharesAtPayment * dividendPerShare;
          
          // Create dividend transaction
          await prisma.transaction.create({
            data: {
              userId: demoUser.id,
              portfolioId: portfolio.id,
              ticker: stock.ticker,
              type: 'DIVIDEND',
              shares: null, // Dividends don't change share count
              amount: totalDividend,
              date: payDate,
              notes: `Quarterly dividend payment: ${sharesAtPayment} shares × $${dividendPerShare}`,
              metadata: JSON.stringify({
                dividendPerShare: dividendPerShare,
                sharesOwned: sharesAtPayment,
                paymentType: 'regular',
                taxable: true,
                source: 'enhanced_seed'
              })
            }
          });
          
          dividendTransactionCount++;
          totalDividendsReceived += totalDividend;
        }
      }
    }

    console.log(`✅ Created ${dividendTransactionCount} DIVIDEND transactions`);
    console.log(`💵 Total dividends received (12 months): $${totalDividendsReceived.toLocaleString()}`);

    // DEMO-007: Add some SELL transactions and DRIP reinvestments
    console.log('🔄 Creating additional transaction types...');
    
    // Sell partial AAPL position
    await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        portfolioId: portfolio.id,
        ticker: 'AAPL',
        type: 'SELL',
        shares: -10, // Negative for sell
        amount: 10 * 215.50, // Sold at different price
        date: daysAgo(90),
        notes: 'Partial position sale for rebalancing',
        metadata: JSON.stringify({
          pricePerShare: 215.50,
          fees: 0,
          orderType: 'market',
          reason: 'rebalancing',
          source: 'enhanced_seed'
        })
      }
    });

    // DRIP reinvestment for KO
    await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        portfolioId: portfolio.id,
        ticker: 'KO',
        type: 'BUY',
        shares: 2.5, // Fractional shares from DRIP
        amount: 2.5 * 61.80,
        date: daysAgo(60),
        notes: 'Dividend reinvestment (DRIP)',
        metadata: JSON.stringify({
          pricePerShare: 61.80,
          fees: 0,
          orderType: 'drip',
          automatic: true,
          source: 'enhanced_seed'
        })
      }
    });

    console.log('✅ Created SELL and DRIP transactions');

    // Create income records from dividends (aggregated monthly)
    console.log('📊 Creating monthly dividend income records...');
    
    const monthlyDividendIncome = totalAnnualDividends / 12;
    
    for (let i = 11; i >= 0; i--) {
      const incomeDate = daysAgo(i * 30);
      
      await prisma.income.create({
        data: {
          userId: demoUser.id,
          source: 'Portfolio Dividends',
          category: 'DIVIDEND',
          amount: monthlyDividendIncome,
          date: incomeDate,
          recurring: true,
          frequency: 'MONTHLY',
          taxable: true,
          notes: 'Aggregated dividend income from dividend growth portfolio',
          metadata: JSON.stringify({
            portfolioId: portfolio.id,
            taxQualified: true,
            source: 'enhanced_seed'
          })
        }
      });
    }

    console.log(`✅ Created 12 monthly dividend income records: $${monthlyDividendIncome.toFixed(2)}/month`);

    // Create realistic expense records (working toward FIRE - dividends cover ~65%)
    console.log('💳 Creating realistic expense records...');
    
    const targetExpenseRatio = 0.65; // Dividends should cover 65% of expenses
    const monthlyExpenseTarget = monthlyDividendIncome / targetExpenseRatio;
    
    const expenseCategories = [
      { category: 'RENT', merchant: 'Apartment Complex', amount: 1850, essential: true, priority: 10 },
      { category: 'UTILITIES', merchant: 'Electric & Gas', amount: 185, essential: true, priority: 8 },
      { category: 'INSURANCE', merchant: 'Health Insurance', amount: 420, essential: true, priority: 9 },
      { category: 'FOOD', merchant: 'Grocery Shopping', amount: 650, essential: true, priority: 7 },
      { category: 'TRANSPORTATION', merchant: 'Car Payment & Gas', amount: 520, essential: true, priority: 6 },
      { category: 'HEALTHCARE', merchant: 'Medical & Dental', amount: 180, essential: true, priority: 8 },
      { category: 'ENTERTAINMENT', merchant: 'Streaming & Dining', amount: 280, essential: false, priority: 3 },
      { category: 'SHOPPING', merchant: 'Miscellaneous', amount: 200, essential: false, priority: 2 }
    ];

    // Scale expenses to match target ratio
    const totalPlannedExpenses = expenseCategories.reduce((sum, exp) => sum + exp.amount, 0);
    const scaleFactor = monthlyExpenseTarget / totalPlannedExpenses;
    
    for (const expenseTemplate of expenseCategories) {
      const scaledAmount = expenseTemplate.amount * scaleFactor;
      
      // Create 12 months of expense records
      for (let i = 11; i >= 0; i--) {
        const expenseDate = daysAgo(i * 30);
        
        await prisma.expense.create({
          data: {
            userId: demoUser.id,
            category: expenseTemplate.category,
            merchant: expenseTemplate.merchant,
            amount: scaledAmount,
            date: expenseDate,
            recurring: true,
            frequency: 'MONTHLY',
            essential: expenseTemplate.essential,
            priority: expenseTemplate.priority,
            notes: `Monthly ${expenseTemplate.category.toLowerCase()} expense`,
            metadata: JSON.stringify({
              budgetCategory: expenseTemplate.category,
              fireTracker: true,
              source: 'enhanced_seed'
            })
          }
        });
      }
      
      console.log(`  ✅ ${expenseTemplate.category}: $${scaledAmount.toFixed(2)}/month`);
    }

    const totalMonthlyExpenses = monthlyExpenseTarget;
    const dividendCoverageRatio = (monthlyDividendIncome / totalMonthlyExpenses);
    
    console.log(`📊 Monthly expenses: $${totalMonthlyExpenses.toFixed(2)}`);
    console.log(`📈 Dividend coverage: ${(dividendCoverageRatio * 100).toFixed(1)}% (target: 65%)`);

    // Create future dividend schedules
    console.log('📅 Creating future dividend schedules...');
    
    let scheduledDividendCount = 0;
    
    for (const stock of DIVIDEND_STOCKS) {
      const currentShares = stock.purchases.reduce((sum, purchase) => sum + purchase.shares, 0);
      const dividendPerShare = stock.monthlyDividend || stock.quarterlyDividend;
      
      // Create next 4 quarterly payments (or 12 monthly for REIT)
      const paymentsToCreate = stock.ticker === 'O' ? 12 : 4;
      
      for (let i = 1; i <= paymentsToCreate; i++) {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + (stock.ticker === 'O' ? i : i * 3));
        
        await prisma.dividendSchedule.create({
          data: {
            ticker: stock.ticker,
            exDate: new Date(futureDate.getTime() - (2 * 24 * 60 * 60 * 1000)), // 2 days before pay
            recordDate: new Date(futureDate.getTime() - (1 * 24 * 60 * 60 * 1000)), // 1 day before pay  
            payDate: futureDate,
            amount: dividendPerShare,
            frequency: stock.ticker === 'O' ? 'MONTHLY' : 'QUARTERLY',
            paymentType: 'REGULAR',
            currency: 'USD'
          }
        });
        
        scheduledDividendCount++;
      }
    }

    console.log(`✅ Created ${scheduledDividendCount} future dividend schedules`);

    // Create stock price data for performance comparison  
    console.log('📈 Creating stock price data for comparison...');
    
    const stocksForPricing = ['SPY', 'QQQ', 'VTI', ...DIVIDEND_STOCKS.map(s => s.ticker)];
    
    for (const ticker of stocksForPricing) {
      let price;
      if (ticker === 'SPY') price = { open: 484.20, high: 487.10, low: 482.30, close: 485.75, volume: 45000000 };
      else if (ticker === 'QQQ') price = { open: 390.50, high: 394.20, low: 389.80, close: 392.45, volume: 32000000 };
      else if (ticker === 'VTI') price = { open: 242.10, high: 244.50, low: 241.60, close: 243.80, volume: 28000000 };
      else {
        const stock = DIVIDEND_STOCKS.find(s => s.ticker === ticker);
        if (stock) {
          const variance = stock.currentPrice * 0.02; // 2% daily variance
          price = {
            open: stock.currentPrice - (variance * 0.5),
            high: stock.currentPrice + variance,
            low: stock.currentPrice - variance,
            close: stock.currentPrice,
            volume: Math.floor(Math.random() * 10000000) + 1000000
          };
        }
      }
      
      if (price) {
        await prisma.stockPrice.create({
          data: {
            ticker: ticker,
            date: new Date(),
            open: price.open,
            high: price.high, 
            low: price.low,
            close: price.close,
            volume: price.volume,
            adjustedClose: price.close
          }
        });
      }
    }

    console.log(`✅ Created stock price data for ${stocksForPricing.length} tickers`);

    // Calculate final summary metrics
    const costBasisTotal = DIVIDEND_STOCKS.reduce((sum, stock) => {
      const totalShares = stock.purchases.reduce((s, p) => s + p.shares, 0);
      const totalCost = stock.purchases.reduce((s, p) => s + (p.shares * p.price), 0);
      return sum + totalCost;
    }, 0);

    const unrealizedGains = totalPortfolioValue - costBasisTotal;
    const unrealizedGainsPercent = (unrealizedGains / costBasisTotal) * 100;
    const fireProgress = dividendCoverageRatio;
    const monthsToFire = fireProgress >= 1 ? 0 : Math.ceil((1 - fireProgress) / 0.02); // Assuming 2% monthly progress

    console.log('\n🎉 ENHANCED SEED SUMMARY (DEMO-001 to DEMO-007):');
    console.log('==================================================');
    console.log(`👤 User: ${demoUser.email}`);
    console.log(`💼 Portfolio: ${portfolio.name} (${portfolio.institution})`);
    console.log(`📊 Holdings: ${DIVIDEND_STOCKS.length} dividend stocks across ${[...new Set(DIVIDEND_STOCKS.map(s => s.sector))].length} sectors`);
    console.log(`💰 Portfolio Value: $${totalPortfolioValue.toLocaleString()}`);
    console.log(`📈 Cost Basis: $${costBasisTotal.toLocaleString()}`);
    console.log(`💵 Unrealized Gains: $${unrealizedGains.toLocaleString()} (${unrealizedGainsPercent.toFixed(1)}%)`);
    console.log(`🔄 Transactions: ${transactionCount + dividendTransactionCount + 2} total (BUY, SELL, DIVIDEND, DRIP)`);
    console.log(`💰 Annual Dividend Income: $${totalAnnualDividends.toLocaleString()}`);
    console.log(`📊 Monthly Dividend Income: $${monthlyDividendIncome.toFixed(2)}`);
    console.log(`💳 Monthly Expenses: $${totalMonthlyExpenses.toFixed(2)}`);
    console.log(`🎯 FIRE Progress: ${(fireProgress * 100).toFixed(1)}% (dividend coverage)`);
    
    if (monthsToFire > 0) {
      console.log(`⏰ Estimated months to FIRE: ${monthsToFire} (at current growth rate)`);
    } else {
      console.log(`🔥 FIRE ACHIEVED! Dividend income exceeds expenses`);
    }
    
    console.log('\n📈 Sector Diversification:');
    const sectorBreakdown = {};
    DIVIDEND_STOCKS.forEach(stock => {
      const shares = stock.purchases.reduce((sum, purchase) => sum + purchase.shares, 0);
      const value = shares * stock.currentPrice;
      if (!sectorBreakdown[stock.sector]) {
        sectorBreakdown[stock.sector] = { value: 0, percentage: 0 };
      }
      sectorBreakdown[stock.sector].value += value;
    });
    
    Object.keys(sectorBreakdown).forEach(sector => {
      const percentage = (sectorBreakdown[sector].value / totalPortfolioValue) * 100;
      console.log(`  ${sector}: $${sectorBreakdown[sector].value.toLocaleString()} (${percentage.toFixed(1)}%)`);
    });
    
    console.log('\n🎉 Enhanced database seeded successfully!');
    console.log('\nDemo Features Available:');
    console.log('• Realistic dividend stock portfolio with 10 popular companies');
    console.log('• 2-year purchase history showing dollar-cost averaging');
    console.log('• 12 months of dividend payment history');  
    console.log('• Mix of profitable and losing positions');
    console.log('• Comprehensive sector diversification');
    console.log('• FIRE progress tracking (65% dividend coverage)');
    console.log('• Transaction history including BUY, SELL, DIVIDEND, DRIP');
    console.log('• Future dividend schedules');
    console.log('• Stock price data for performance comparison');
    console.log('\n🚀 Ready to explore Income Clarity with realistic data!');

  } catch (error) {
    console.error('❌ Enhanced seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Export for use in reset API
module.exports = { main, DIVIDEND_STOCKS, daysAgo };

// Run the seed if called directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}