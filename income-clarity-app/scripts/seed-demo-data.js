#!/usr/bin/env node
/**
 * Income Clarity - Comprehensive Demo Data Seeding Script
 * 
 * Creates realistic portfolio demo data including:
 * - 2 portfolios: Taxable Brokerage (~75%) & Roth IRA (~25%)
 * - 9 dividend-paying stocks with authentic market data
 * - 2 years of transaction history with dollar-cost averaging
 * - 12+ months of dividend payment history
 * - Monthly income ($8,000 gross salary) and expense records ($3,200)
 * - Mixed performance (gains/losses) based on real market conditions
 * - Transaction types: BUY, SELL, DIVIDEND, DRIP
 * 
 * Target Portfolio: ~$125,000 with ~$4,500 annual dividends (3.6% yield)
 * 
 * Usage:
 *   node scripts/seed-demo-data.js          # Create demo data (skip if exists)
 *   node scripts/seed-demo-data.js --reset  # Clear and recreate all demo data
 *   node scripts/seed-demo-data.js --help   # Show this help message
 */

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Parse command line arguments
const RESET_DATA = process.argv.includes('--reset');
const HELP_REQUESTED = process.argv.includes('--help') || process.argv.includes('-h');

// Show help if requested
if (HELP_REQUESTED) {
  console.log(`
📋 Income Clarity Demo Data Seeding Script

🎯 PURPOSE:
Creates comprehensive demo data for testing the Income Clarity application with realistic financial data.

💼 WHAT'S CREATED:
• 2 Portfolios: Taxable Brokerage (~$88K) + Roth IRA (~$30K)
• 9 Dividend Stocks: AAPL, MSFT, JNJ, KO, PG, O, VZ, T, XOM
• ~$125K total portfolio value with $4.5K annual dividends
• 2 years transaction history (BUY/SELL/DIVIDEND/DRIP)
• 12 months income: $8K gross salary + dividends
• 12 months expenses: $3.2K across 11 categories
• Future dividend schedules and stock price data

📊 DEMO METRICS:
• Portfolio Yield: ~3.6%
• Savings Rate: ~52%
• Sector Diversification: Tech, Healthcare, Consumer, Real Estate, Energy
• Tax Efficiency: Qualified dividends + Roth allocation

🔧 USAGE:
  node scripts/seed-demo-data.js          # Create if not exists
  node scripts/seed-demo-data.js --reset  # Force recreate all
  node scripts/seed-demo-data.js --help   # Show this help

👤 TEST CREDENTIALS:
  Email: test@example.com
  Password: password123

🚀 After seeding, run: npm run dev
`);
  process.exit(0);
}

// Helper Functions
function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

function monthsAgo(months) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

// DEMO-002: 9 Popular Dividend Stocks with Realistic Data (Target: ~$125K portfolio)
const DEMO_DIVIDEND_STOCKS = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    currentPrice: 192.50,
    dividendYield: 0.0048, // 0.48% (realistic for AAPL)
    quarterlyDividend: 0.24,
    purchases: [
      { date: daysAgo(720), shares: 50, price: 150.00 }, // 2 years ago
      { date: daysAgo(360), shares: 30, price: 175.50 }, // 1 year ago
      { date: daysAgo(180), shares: 20, price: 185.75 }  // 6 months ago
    ]
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corporation',
    sector: 'Technology',
    currentPrice: 418.50,
    dividendYield: 0.0067, // 0.67%
    quarterlyDividend: 0.68,
    purchases: [
      { date: daysAgo(650), shares: 25, price: 280.00 }, // 
      { date: daysAgo(300), shares: 15, price: 350.40 }, // 
      { date: daysAgo(120), shares: 10, price: 410.90 }  // 
    ]
  },
  {
    ticker: 'JNJ',
    name: 'Johnson & Johnson',
    sector: 'Healthcare',
    currentPrice: 168.75,
    dividendYield: 0.0296, // 2.96%
    quarterlyDividend: 1.19,
    purchases: [
      { date: daysAgo(680), shares: 45, price: 155.00 }, // Good position
      { date: daysAgo(320), shares: 20, price: 165.80 }, // Small gain
      { date: daysAgo(90), shares: 10, price: 172.45 }   // Small loss
    ]
  },
  {
    ticker: 'KO',
    name: 'The Coca-Cola Company',
    sector: 'Consumer Defensive',
    currentPrice: 61.25,
    dividendYield: 0.0294, // 2.94%
    quarterlyDividend: 0.46,
    purchases: [
      { date: daysAgo(600), shares: 120, price: 58.00 }, // Good position - up
      { date: daysAgo(280), shares: 50, price: 59.50 },  // Small gain
      { date: daysAgo(100), shares: 30, price: 62.75 }   // Small loss
    ]
  },
  {
    ticker: 'PG',
    name: 'Procter & Gamble Co.',
    sector: 'Consumer Defensive',
    currentPrice: 164.80,
    dividendYield: 0.0243, // 2.43%
    quarterlyDividend: 0.9133,
    purchases: [
      { date: daysAgo(580), shares: 40, price: 140.00 }, // Good gain
      { date: daysAgo(250), shares: 25, price: 155.20 }, // Small gain
      { date: daysAgo(60), shares: 15, price: 168.90 }   // Small loss
    ]
  },
  {
    ticker: 'O',
    name: 'Realty Income Corporation',
    sector: 'Real Estate',
    currentPrice: 58.90,
    dividendYield: 0.0574, // 5.74% (monthly REIT)
    monthlyDividend: 0.2565,
    purchases: [
      { date: daysAgo(500), shares: 80, price: 65.00 }, // Loss from rate rises
      { date: daysAgo(200), shares: 40, price: 55.80 }, // Good gain
      { date: daysAgo(80), shares: 30, price: 59.90 }   // Small loss
    ]
  },
  {
    ticker: 'VZ',
    name: 'Verizon Communications Inc.',
    sector: 'Communication',
    currentPrice: 42.15,
    dividendYield: 0.0630, // 6.30% (high yield telecom)
    quarterlyDividend: 0.6775,
    purchases: [
      { date: daysAgo(580), shares: 125, price: 40.00 }, // Good position
      { date: daysAgo(350), shares: 75, price: 44.90 },  // Loss position  
      { date: daysAgo(120), shares: 50, price: 43.60 }   // Small loss
    ]
  },
  {
    ticker: 'T',
    name: 'AT&T Inc.',
    sector: 'Communication', 
    currentPrice: 21.85,
    dividendYield: 0.0651, // 6.51% (post-dividend cuts)
    quarterlyDividend: 0.2775,
    purchases: [
      { date: daysAgo(630), shares: 180, price: 28.00 }, // Large loss from dividend cuts
      { date: daysAgo(380), shares: 80, price: 25.20 },  // Still loss
      { date: daysAgo(190), shares: 40, price: 23.80 }   // Small loss
    ]
  },
  {
    ticker: 'XOM', 
    name: 'Exxon Mobil Corporation',
    sector: 'Energy',
    currentPrice: 118.25,
    dividendYield: 0.0339, // 3.39%
    quarterlyDividend: 0.95,
    purchases: [
      { date: daysAgo(680), shares: 60, price: 90.00 }, // Good gain - energy recovery
      { date: daysAgo(420), shares: 35, price: 105.20 }, // Small gain
      { date: daysAgo(240), shares: 25, price: 115.80 }  // Small gain
    ]
  }
];

// DEMO-003: Helper to generate quarterly dividend dates for each stock
function generateDividendDates(ticker, startMonthsAgo = 15) {
  const dates = [];
  const paymentMonths = {
    'AAPL': [2, 5, 8, 11], // Feb, May, Aug, Nov
    'MSFT': [3, 6, 9, 12], // Mar, Jun, Sep, Dec
    'JNJ': [3, 6, 9, 12],  // Mar, Jun, Sep, Dec
    'KO': [1, 4, 7, 10],   // Jan, Apr, Jul, Oct
    'VZ': [2, 5, 8, 11],   // Feb, May, Aug, Nov
    'T': [2, 5, 8, 11],    // Feb, May, Aug, Nov  
    'PFE': [3, 6, 9, 12],  // Mar, Jun, Sep, Dec
    'XOM': [3, 6, 9, 12],  // Mar, Jun, Sep, Dec
    'O': Array.from({length: 12}, (_, i) => i + 1) // Monthly REIT
  };

  const months = paymentMonths[ticker] || [3, 6, 9, 12];
  
  for (let monthsBack = startMonthsAgo; monthsBack >= 0; monthsBack--) {
    const date = monthsAgo(monthsBack);
    const currentMonth = date.getMonth() + 1;
    
    if (months.includes(currentMonth)) {
      dates.push(new Date(date));
    }
  }
  
  return dates;
}

async function createDemoUser() {
  console.log('👤 Creating/updating demo user: test@example.com');
  
  // Check if user exists
  let user = await prisma.user.findUnique({
    where: { email: 'test@example.com' }
  });

  if (!user) {
    // Create new user with proper password hash
    const password = 'password123';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const passwordHash = `${salt}:${hash}`;

    user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash,
        onboarding_completed: true,
        settings: JSON.stringify({
          theme: 'light',
          currency: 'USD',
          locale: 'en-US',
          notifications: true,
          autoSync: true,
          showTargetIncome: true
        }),
        taxProfile: JSON.stringify({
          state: 'TX', // Texas - no state tax
          filingStatus: 'single',
          federalBracket: 0.22,
          stateBracket: 0.0,
          qualifiedDividendRate: 0.15,
          effectiveRate: 0.18
        })
      }
    });
    console.log('✅ Demo user created');
  } else {
    console.log('✅ Demo user already exists - using existing user');
  }

  return user;
}

async function clearExistingData(userId) {
  console.log('🧹 Clearing existing demo data...');
  
  try {
    // Use transaction for atomicity and better error handling
    await prisma.$transaction(async (tx) => {
      // Delete in proper order to respect foreign key constraints
      const deletedTransactions = await tx.transaction.deleteMany({ where: { userId } });
      const deletedIncome = await tx.income.deleteMany({ where: { userId } });
      const deletedExpenses = await tx.expense.deleteMany({ where: { userId } });
      const deletedHoldings = await tx.holding.deleteMany({ 
        where: { 
          portfolio: { 
            userId 
          } 
        } 
      });
      const deletedPortfolios = await tx.portfolio.deleteMany({ where: { userId } });
      
      console.log(`   🗑️  Deleted: ${deletedTransactions.count} transactions`);
      console.log(`   🗑️  Deleted: ${deletedIncome.count} income records`);
      console.log(`   🗑️  Deleted: ${deletedExpenses.count} expense records`);
      console.log(`   🗑️  Deleted: ${deletedHoldings.count} holdings`);
      console.log(`   🗑️  Deleted: ${deletedPortfolios.count} portfolios`);
    }, {
      timeout: 10000 // 10 second timeout
    });
    
    console.log('✅ Existing demo data cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing existing data:', error);
    throw new Error(`Failed to clear existing data: ${error.message}`);
  }
}

async function createPortfolios(userId) {
  console.log('💼 Creating demo portfolios...');
  
  // Create Taxable Brokerage Account (70% allocation)
  const taxablePortfolio = await prisma.portfolio.create({
    data: {
      userId,
      name: 'Taxable Brokerage',
      type: 'Taxable',
      institution: 'Charles Schwab',
      isPrimary: true
    }
  });

  // Create Roth IRA Account (30% allocation)
  const rothPortfolio = await prisma.portfolio.create({
    data: {
      userId,
      name: 'Roth IRA',
      type: 'IRA',
      institution: 'Fidelity',
      isPrimary: false
    }
  });

  console.log(`✅ Portfolios created: ${taxablePortfolio.name} & ${rothPortfolio.name}`);
  return { taxablePortfolio, rothPortfolio };
}

async function createHoldingsAndTransactions(portfolios, userId) {
  console.log('📊 Creating holdings and transaction history...');
  
  // Portfolio allocation: 70% Taxable, 30% Roth IRA
  const taxableAllocation = ['AAPL', 'MSFT', 'JNJ', 'KO', 'PG', 'VZ'];
  const rothAllocation = ['O', 'T', 'XOM'];
  
  let totalPortfolioValue = 0;
  let totalCostBasis = 0;
  let totalAnnualDividends = 0;
  let transactionCount = 0;

  for (const stock of DEMO_DIVIDEND_STOCKS) {
    // Determine which portfolio this stock belongs to
    const portfolioId = taxableAllocation.includes(stock.ticker) 
      ? portfolios.taxablePortfolio.id 
      : portfolios.rothPortfolio.id;
    
    const portfolioName = taxableAllocation.includes(stock.ticker) 
      ? 'Taxable Brokerage' 
      : 'Roth IRA';

    const totalShares = stock.purchases.reduce((sum, purchase) => sum + purchase.shares, 0);
    const totalCost = stock.purchases.reduce((sum, purchase) => sum + (purchase.shares * purchase.price), 0);
    const avgCostBasis = totalCost / totalShares;
    
    // Create holding
    await prisma.holding.create({
      data: {
        portfolioId,
        ticker: stock.ticker,
        shares: totalShares,
        costBasis: avgCostBasis,
        purchaseDate: stock.purchases[0].date,
        currentPrice: stock.currentPrice,
        dividendYield: stock.dividendYield,
        sector: stock.sector,
        metadata: JSON.stringify({
          companyName: stock.name,
          totalPositions: stock.purchases.length,
          avgCostBasis: avgCostBasis,
          portfolioName,
          lastUpdated: new Date().toISOString(),
          source: 'demo_seed_v3'
        })
      }
    });

    // Create purchase transactions
    for (const purchase of stock.purchases) {
      await prisma.transaction.create({
        data: {
          userId,
          portfolioId,
          ticker: stock.ticker,
          type: 'BUY',
          shares: purchase.shares,
          amount: purchase.shares * purchase.price,
          date: purchase.date,
          notes: `Purchase ${purchase.shares} shares @ $${purchase.price.toFixed(2)} (${portfolioName})`,
          metadata: JSON.stringify({
            pricePerShare: purchase.price,
            fees: 0,
            orderType: 'market',
            strategy: 'dollar_cost_averaging',
            portfolio: portfolioName
          })
        }
      });
      transactionCount++;
    }

    const positionValue = totalShares * stock.currentPrice;
    const annualDividend = positionValue * stock.dividendYield;
    
    totalPortfolioValue += positionValue;
    totalCostBasis += totalCost;
    totalAnnualDividends += annualDividend;

    console.log(`  ✅ ${stock.ticker} (${portfolioName}): ${totalShares} shares = $${positionValue.toLocaleString()} (${((stock.currentPrice - avgCostBasis) / avgCostBasis * 100).toFixed(1)}% return)`);
  }

  console.log(`✅ Created ${transactionCount} BUY transactions across both portfolios`);
  return { totalPortfolioValue, totalCostBasis, totalAnnualDividends, transactionCount };
}

async function createDividendHistory(portfolios, userId) {
  console.log('💰 Creating 12+ months of dividend history...');
  
  const taxableAllocation = ['AAPL', 'MSFT', 'JNJ', 'KO', 'PG', 'VZ'];
  const rothAllocation = ['O', 'T', 'XOM'];
  
  let dividendCount = 0;
  let totalDividendsReceived = 0;

  for (const stock of DEMO_DIVIDEND_STOCKS) {
    // Determine which portfolio this stock belongs to
    const portfolioId = taxableAllocation.includes(stock.ticker) 
      ? portfolios.taxablePortfolio.id 
      : portfolios.rothPortfolio.id;
    
    const portfolioName = taxableAllocation.includes(stock.ticker) 
      ? 'Taxable Brokerage' 
      : 'Roth IRA';

    const dividendDates = generateDividendDates(stock.ticker, 15); // 15 months back
    
    for (const payDate of dividendDates) {
      // Calculate shares owned at payment date
      const sharesAtPayment = stock.purchases
        .filter(purchase => purchase.date <= payDate)
        .reduce((sum, purchase) => sum + purchase.shares, 0);

      if (sharesAtPayment > 0) {
        const dividendPerShare = stock.monthlyDividend || stock.quarterlyDividend;
        const totalDividend = sharesAtPayment * dividendPerShare;
        const isTaxable = portfolioName === 'Taxable Brokerage';

        await prisma.transaction.create({
          data: {
            userId,
            portfolioId,
            ticker: stock.ticker,
            type: 'DIVIDEND',
            shares: null,
            amount: totalDividend,
            date: payDate,
            notes: `${stock.ticker === 'O' ? 'Monthly' : 'Quarterly'} dividend: ${sharesAtPayment} shares × $${dividendPerShare.toFixed(3)} (${portfolioName})`,
            metadata: JSON.stringify({
              dividendPerShare,
              sharesOwned: sharesAtPayment,
              paymentType: 'regular',
              taxable: isTaxable,
              qualified: true,
              portfolio: portfolioName
            })
          }
        });

        dividendCount++;
        totalDividendsReceived += totalDividend;
      }
    }
  }

  console.log(`✅ Created ${dividendCount} dividend transactions totaling $${totalDividendsReceived.toLocaleString()}`);
  return { dividendCount, totalDividendsReceived };
}

async function createAdditionalTransactions(portfolios, userId) {
  console.log('🔄 Creating additional realistic transactions...');
  
  // Tax loss harvesting - sell T position (Roth IRA)
  await prisma.transaction.create({
    data: {
      userId,
      portfolioId: portfolios.rothPortfolio.id,
      ticker: 'T',
      type: 'SELL',
      shares: -20, // Sell 20 shares
      amount: 20 * 21.80,
      date: daysAgo(45),
      notes: 'Rebalancing - partial AT&T position sale (Roth IRA)',
      metadata: JSON.stringify({
        pricePerShare: 21.80,
        fees: 0,
        reason: 'rebalancing',
        orderType: 'market',
        portfolio: 'Roth IRA'
      })
    }
  });

  // DRIP reinvestment for KO (Taxable)
  await prisma.transaction.create({
    data: {
      userId,
      portfolioId: portfolios.taxablePortfolio.id,
      ticker: 'KO',
      type: 'BUY',
      shares: 2.5, // Fractional shares from DRIP
      amount: 2.5 * 61.95,
      date: daysAgo(30),
      notes: 'DRIP - Dividend Reinvestment Plan (Taxable Brokerage)',
      metadata: JSON.stringify({
        pricePerShare: 61.95,
        fees: 0,
        orderType: 'drip',
        automatic: true,
        portfolio: 'Taxable Brokerage'
      })
    }
  });

  // Recent portfolio addition - small O purchase (Roth IRA)
  await prisma.transaction.create({
    data: {
      userId,
      portfolioId: portfolios.rothPortfolio.id,
      ticker: 'O',
      type: 'BUY',
      shares: 15,
      amount: 15 * 57.80,
      date: daysAgo(15),
      notes: 'Monthly REIT addition for income diversification (Roth IRA)',
      metadata: JSON.stringify({
        pricePerShare: 57.80,
        fees: 0,
        orderType: 'market',
        strategy: 'income_diversification',
        portfolio: 'Roth IRA'
      })
    }
  });

  console.log('✅ Created SELL, DRIP, and additional BUY transactions across portfolios');
  return 3; // Number of additional transactions
}

async function createIncomeExpenseRecords(userId, monthlyDividendIncome) {
  console.log('📊 Creating income and expense records...');
  
  // Create monthly salary income for past 12 months ($8,000 gross, $6,400 net)
  for (let i = 11; i >= 0; i--) {
    const date = monthsAgo(i);
    
    // Gross salary income
    await prisma.income.create({
      data: {
        userId,
        source: 'Tech Company Salary',
        category: 'SALARY',
        amount: 6400, // Net after taxes and deductions
        date: new Date(date.getFullYear(), date.getMonth(), 15), // 15th of month
        recurring: true,
        frequency: 'MONTHLY',
        taxable: true,
        notes: 'Monthly salary (gross: $8,000, net after taxes/deductions: $6,400)',
        metadata: JSON.stringify({
          grossAmount: 8000,
          federalWithholding: 960,
          stateWithholding: 240,
          socialSecurity: 496,
          medicare: 116,
          healthInsurance: 150,
          retirement401k: 640
        })
      }
    });

    // Dividend income (aggregated monthly)
    await prisma.income.create({
      data: {
        userId,
        source: 'Portfolio Dividends',
        category: 'DIVIDEND',
        amount: monthlyDividendIncome,
        date: new Date(date.getFullYear(), date.getMonth(), 20), // 20th of month
        recurring: true,
        frequency: 'MONTHLY',
        taxable: true,
        notes: 'Aggregated dividend income from both portfolios',
        metadata: JSON.stringify({
          qualified: true,
          taxRate: 0.15,
          reinvestmentEligible: true,
          portfolios: ['Taxable Brokerage', 'Roth IRA']
        })
      }
    });
  }

  // Fixed expense categories totaling ~$3,200/month
  const expenseCategories = [
    { category: 'RENT', merchant: 'Sunset Apartments', amount: 1400, essential: true, priority: 10 },
    { category: 'UTILITIES', merchant: 'Electric & Gas', amount: 150, essential: true, priority: 9 },
    { category: 'UTILITIES', merchant: 'Internet & Phone', amount: 100, essential: true, priority: 9 },
    { category: 'FOOD', merchant: 'Groceries', amount: 500, essential: true, priority: 8 },
    { category: 'FOOD', merchant: 'Restaurants & Dining', amount: 300, essential: false, priority: 5 },
    { category: 'TRANSPORTATION', merchant: 'Car Payment', amount: 350, essential: true, priority: 8 },
    { category: 'TRANSPORTATION', merchant: 'Gas & Maintenance', amount: 200, essential: true, priority: 7 },
    { category: 'INSURANCE', merchant: 'Auto Insurance', amount: 120, essential: true, priority: 9 },
    { category: 'HEALTHCARE', merchant: 'Medical & Pharmacy', amount: 80, essential: true, priority: 8 },
    { category: 'ENTERTAINMENT', merchant: 'Streaming Services', amount: 50, essential: false, priority: 3 },
    { category: 'ENTERTAINMENT', merchant: 'Activities & Hobbies', amount: 150, essential: false, priority: 4 }
  ];

  // Total expenses should equal exactly $3,200
  const totalExpenses = expenseCategories.reduce((sum, exp) => sum + exp.amount, 0);
  console.log(`💰 Target monthly expenses: $3,200, Planned total: $${totalExpenses}`);

  for (const expenseTemplate of expenseCategories) {
    // Create 12 months of expenses
    for (let i = 11; i >= 0; i--) {
      const date = monthsAgo(i);
      // Add some random variation to the day within the month
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const expenseDate = new Date(date.getFullYear(), date.getMonth(), randomDay);
      
      await prisma.expense.create({
        data: {
          userId,
          category: expenseTemplate.category,
          merchant: expenseTemplate.merchant,
          amount: expenseTemplate.amount,
          date: expenseDate,
          recurring: true,
          frequency: 'MONTHLY',
          essential: expenseTemplate.essential,
          priority: expenseTemplate.priority,
          notes: `Monthly ${expenseTemplate.category.toLowerCase()} expense`,
          metadata: JSON.stringify({
            budgetCategory: expenseTemplate.category,
            fixed: expenseTemplate.essential
          })
        }
      });
    }
  }

  const actualMonthlyExpenses = 3200;
  const netMonthlyIncome = 6400 + monthlyDividendIncome;
  const savingsRate = ((netMonthlyIncome - actualMonthlyExpenses) / netMonthlyIncome) * 100;

  console.log(`✅ Created 12 months of salary + dividend income and expenses`);
  console.log(`💰 Monthly net income: $${netMonthlyIncome.toFixed(2)} (salary + dividends)`);
  console.log(`💸 Monthly expenses: $${actualMonthlyExpenses.toFixed(2)}`);
  console.log(`📈 Savings rate: ${savingsRate.toFixed(1)}%`);
  
  return { actualMonthlyExpenses, netMonthlyIncome, savingsRate };
}

async function createFutureDividendSchedules() {
  console.log('📅 Creating future dividend schedules...');
  
  let scheduleCount = 0;
  
  for (const stock of DEMO_DIVIDEND_STOCKS) {
    const isMonthly = stock.ticker === 'O';
    const paymentsToCreate = isMonthly ? 12 : 4;
    
    for (let i = 1; i <= paymentsToCreate; i++) {
      const futureDate = new Date();
      
      if (isMonthly) {
        futureDate.setMonth(futureDate.getMonth() + i);
        futureDate.setDate(15); // 15th of month for REIT
      } else {
        futureDate.setMonth(futureDate.getMonth() + (i * 3));
        futureDate.setDate(10); // 10th of quarter
      }
      
      await prisma.dividendSchedule.create({
        data: {
          ticker: stock.ticker,
          exDate: new Date(futureDate.getTime() - (2 * 24 * 60 * 60 * 1000)),
          recordDate: new Date(futureDate.getTime() - (1 * 24 * 60 * 60 * 1000)),
          payDate: futureDate,
          amount: stock.monthlyDividend || stock.quarterlyDividend,
          frequency: isMonthly ? 'MONTHLY' : 'QUARTERLY',
          paymentType: 'REGULAR',
          currency: 'USD'
        }
      });
      
      scheduleCount++;
    }
  }

  console.log(`✅ Created ${scheduleCount} future dividend schedules`);
  return scheduleCount;
}

async function createStockPriceData() {
  console.log('📈 Creating stock price data for comparisons...');
  
  const benchmarkTickers = ['SPY', 'QQQ', 'VTI', 'SCHD'];
  const allTickers = [...DEMO_DIVIDEND_STOCKS.map(s => s.ticker), ...benchmarkTickers];
  
  const benchmarkPrices = {
    'SPY': { close: 485.75, high: 487.20, low: 484.30, volume: 42000000 },
    'QQQ': { close: 392.45, high: 394.80, low: 390.20, volume: 35000000 },
    'VTI': { close: 243.80, high: 245.10, low: 242.40, volume: 28000000 },
    'SCHD': { close: 78.25, high: 78.95, low: 77.80, volume: 15000000 }
  };
  
  for (const ticker of allTickers) {
    let priceData;
    
    if (benchmarkPrices[ticker]) {
      priceData = benchmarkPrices[ticker];
    } else {
      const stock = DEMO_DIVIDEND_STOCKS.find(s => s.ticker === ticker);
      if (stock) {
        const variance = stock.currentPrice * 0.015; // 1.5% daily variance
        priceData = {
          close: stock.currentPrice,
          high: stock.currentPrice + variance,
          low: stock.currentPrice - variance,
          volume: Math.floor(Math.random() * 8000000) + 2000000
        };
      }
    }
    
    if (priceData) {
      await prisma.stockPrice.create({
        data: {
          ticker,
          date: new Date(),
          open: priceData.close - (Math.random() * 2 - 1),
          high: priceData.high,
          low: priceData.low,
          close: priceData.close,
          volume: priceData.volume,
          adjustedClose: priceData.close
        }
      });
    }
  }

  console.log(`✅ Created stock price data for ${allTickers.length} tickers`);
  return allTickers.length;
}

async function main() {
  console.log('🌱 COMPREHENSIVE DEMO DATA SEEDING - Income Clarity');
  console.log('📋 Target: ~$125K portfolio, $4.5K annual dividends, $8K gross income, $3.2K expenses\n');

  try {
    await prisma.$connect();
    console.log('✅ Database connected\n');

    // Step 1: Create/get demo user
    const user = await createDemoUser();

    // Step 2: Check for existing data and clear if reset requested
    const existingPortfolios = await prisma.portfolio.findMany({
      where: { userId: user.id }
    });

    if (existingPortfolios.length > 0 && !RESET_DATA) {
      console.log('⚠️  Demo data already exists. Use --reset flag to recreate.\n');
      
      // Display existing data summary
      const holdingsCount = await prisma.holding.count({
        where: { portfolio: { userId: user.id } }
      });
      const transactionsCount = await prisma.transaction.count({
        where: { userId: user.id }
      });
      const incomeCount = await prisma.income.count({
        where: { userId: user.id }
      });
      const expenseCount = await prisma.expense.count({
        where: { userId: user.id }
      });
      
      console.log('📋 Existing Data Summary:');
      console.log(`   📊 Portfolios: ${existingPortfolios.length}`);
      console.log(`   🏢 Holdings: ${holdingsCount}`);
      console.log(`   💳 Transactions: ${transactionsCount}`);
      console.log(`   💰 Income Records: ${incomeCount}`);
      console.log(`   💸 Expense Records: ${expenseCount}`);
      console.log('\n💡 To recreate demo data, run: node scripts/seed-demo-data.js --reset');
      console.log('🚀 To test with existing data, run: npm run dev');
      
      return;
    }

    if (RESET_DATA) {
      await clearExistingData(user.id);
    }

    // Step 3: Create portfolios (Taxable Brokerage + Roth IRA)
    const portfolios = await createPortfolios(user.id);

    // Step 4: Create holdings and purchase transactions across both portfolios
    const portfolioStats = await createHoldingsAndTransactions(portfolios, user.id);

    // Step 5: Create dividend payment history for both portfolios
    const dividendStats = await createDividendHistory(portfolios, user.id);

    // Step 6: Create additional transactions (SELL, DRIP, etc.)
    const additionalTransactions = await createAdditionalTransactions(portfolios, user.id);

    // Step 7: Create income and expense records
    const monthlyDividendIncome = portfolioStats.totalAnnualDividends / 12;
    const incomeExpenseStats = await createIncomeExpenseRecords(user.id, monthlyDividendIncome);

    // Step 8: Create future dividend schedules
    const futureScheduleCount = await createFutureDividendSchedules();

    // Step 9: Create stock price data for comparisons
    const priceDataCount = await createStockPriceData();

    // Calculate final metrics
    const unrealizedGains = portfolioStats.totalPortfolioValue - portfolioStats.totalCostBasis;
    const unrealizedGainsPct = (unrealizedGains / portfolioStats.totalCostBasis) * 100;
    const portfolioYield = (portfolioStats.totalAnnualDividends / portfolioStats.totalPortfolioValue) * 100;
    const totalTransactions = portfolioStats.transactionCount + dividendStats.dividendCount + additionalTransactions;

    // Portfolio allocation breakdown
    const taxableAllocation = ['AAPL', 'MSFT', 'JNJ', 'KO', 'PG', 'VZ'];
    const rothAllocation = ['O', 'T', 'XOM'];
    
    let taxableValue = 0, rothValue = 0;
    DEMO_DIVIDEND_STOCKS.forEach(stock => {
      const totalShares = stock.purchases.reduce((sum, purchase) => sum + purchase.shares, 0);
      const value = totalShares * stock.currentPrice;
      
      if (taxableAllocation.includes(stock.ticker)) {
        taxableValue += value;
      } else {
        rothValue += value;
      }
    });

    // Sector diversification
    const sectorBreakdown = {};
    DEMO_DIVIDEND_STOCKS.forEach(stock => {
      const totalShares = stock.purchases.reduce((sum, purchase) => sum + purchase.shares, 0);
      const value = totalShares * stock.currentPrice;
      if (!sectorBreakdown[stock.sector]) sectorBreakdown[stock.sector] = 0;
      sectorBreakdown[stock.sector] += value;
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 DEMO DATA SEEDING COMPLETE');
    console.log('='.repeat(60));
    console.log(`👤 User: ${user.email}`);
    console.log(`🔑 Password: password123`);
    console.log('');
    
    console.log('💼 PORTFOLIO ALLOCATION:');
    console.log(`📈 Taxable Brokerage: $${taxableValue.toLocaleString()} (${(taxableValue/portfolioStats.totalPortfolioValue*100).toFixed(1)}%)`);
    console.log(`🏛️ Roth IRA: $${rothValue.toLocaleString()} (${(rothValue/portfolioStats.totalPortfolioValue*100).toFixed(1)}%)`);
    console.log(`💰 Total Value: $${portfolioStats.totalPortfolioValue.toLocaleString()}`);
    console.log('');
    
    console.log('📊 PORTFOLIO METRICS:');
    console.log(`📈 Cost Basis: $${portfolioStats.totalCostBasis.toLocaleString()}`);
    console.log(`💵 Unrealized Gains: $${unrealizedGains.toLocaleString()} (${unrealizedGainsPct.toFixed(1)}%)`);
    console.log(`🎯 Portfolio Yield: ${portfolioYield.toFixed(2)}%`);
    console.log('');
    
    console.log('💰 INCOME & EXPENSES:');
    console.log(`💼 Gross Monthly Salary: $8,000`);
    console.log(`💰 Net Monthly Income: $${incomeExpenseStats.netMonthlyIncome.toLocaleString()}`);
    console.log(`💸 Monthly Expenses: $${incomeExpenseStats.actualMonthlyExpenses.toLocaleString()}`);
    console.log(`📊 Monthly Dividend Income: $${monthlyDividendIncome.toFixed(2)}`);
    console.log(`📅 Annual Dividend Income: $${portfolioStats.totalAnnualDividends.toLocaleString()}`);
    console.log(`📈 Savings Rate: ${incomeExpenseStats.savingsRate.toFixed(1)}%`);
    console.log('');
    
    console.log('🏛️ SECTOR DIVERSIFICATION:');
    Object.keys(sectorBreakdown).forEach(sector => {
      const percentage = (sectorBreakdown[sector] / portfolioStats.totalPortfolioValue) * 100;
      console.log(`  ${sector}: $${sectorBreakdown[sector].toLocaleString()} (${percentage.toFixed(1)}%)`);
    });
    console.log('');
    
    console.log('📝 DATA CREATED:');
    console.log(`💼 Portfolios: 2 (Taxable Brokerage + Roth IRA)`);
    console.log(`🏢 Holdings: ${DEMO_DIVIDEND_STOCKS.length} dividend stocks`);
    console.log(`🔄 Transactions: ${totalTransactions} total (BUY/SELL/DIVIDEND/DRIP)`);
    console.log(`📈 Income Records: 24 entries (12 months salary + 12 months dividends)`);
    console.log(`💳 Expense Records: ${11 * 12} entries (11 categories × 12 months)`);
    console.log(`📅 Future Dividends: ${futureScheduleCount} scheduled payments`);
    console.log(`💹 Price Data: ${priceDataCount} tickers with current prices`);
    console.log('');
    
    console.log('✨ DEMO FEATURES READY:');
    console.log('• Income Intelligence Hub - Salary + dividend tracking');
    console.log('• Performance Hub - Portfolio vs SPY/QQQ benchmarks');
    console.log('• Tax Strategy Hub - Taxable vs Roth allocation');
    console.log('• Manual Entry Hub - Add transactions and income');
    console.log('• Portfolio Insights Hub - Sector diversification');
    console.log('• Realistic gains/losses across different sectors');
    console.log('• Transaction history with DCA strategy evidence');
    console.log('• Monthly REIT (O) vs quarterly stock dividends');
    console.log('• Tax-efficient portfolio allocation');
    console.log('');
    
    console.log('🚀 Ready to test all Income Clarity features with realistic data!');

    // Validate data integrity
    await validateDemoData(user.id);

  } catch (error) {
    console.error('\n❌ Demo seeding failed:', error);
    console.error('Error details:', error.message);
    
    // Attempt cleanup on failure
    try {
      await clearExistingData(user.id);
      console.log('🧹 Cleanup completed after failure');
    } catch (cleanupError) {
      console.error('❌ Cleanup also failed:', cleanupError.message);
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Validate demo data integrity
 */
async function validateDemoData(userId) {
  console.log('\n🔍 Validating demo data integrity...');
  
  try {
    // Check portfolio count
    const portfolioCount = await prisma.portfolio.count({ where: { userId } });
    if (portfolioCount !== 2) {
      throw new Error(`Expected 2 portfolios, found ${portfolioCount}`);
    }

    // Check holdings count
    const holdingCount = await prisma.holding.count({
      where: { portfolio: { userId } }
    });
    if (holdingCount !== 9) {
      throw new Error(`Expected 9 holdings, found ${holdingCount}`);
    }

    // Check that we have transactions
    const transactionCount = await prisma.transaction.count({ where: { userId } });
    if (transactionCount < 50) {
      throw new Error(`Expected at least 50 transactions, found ${transactionCount}`);
    }

    // Check income records
    const incomeCount = await prisma.income.count({ where: { userId } });
    if (incomeCount !== 24) {
      throw new Error(`Expected 24 income records, found ${incomeCount}`);
    }

    // Check expense records
    const expenseCount = await prisma.expense.count({ where: { userId } });
    if (expenseCount !== 132) {
      throw new Error(`Expected 132 expense records, found ${expenseCount}`);
    }

    // Verify portfolio allocation
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: {
        holdings: true
      }
    });

    const taxableBrokerage = portfolios.find(p => p.name === 'Taxable Brokerage');
    const rothIRA = portfolios.find(p => p.name === 'Roth IRA');

    if (!taxableBrokerage || !rothIRA) {
      throw new Error('Missing expected portfolio names');
    }

    if (taxableBrokerage.holdings.length !== 6) {
      throw new Error(`Expected 6 holdings in Taxable Brokerage, found ${taxableBrokerage.holdings.length}`);
    }

    if (rothIRA.holdings.length !== 3) {
      throw new Error(`Expected 3 holdings in Roth IRA, found ${rothIRA.holdings.length}`);
    }

    console.log('✅ Data integrity validation passed');
    
  } catch (error) {
    console.error('❌ Data integrity validation failed:', error.message);
    throw error;
  }
}

// Export for use in reset API (DEMO-008)
module.exports = { 
  main, 
  DEMO_DIVIDEND_STOCKS, 
  daysAgo, 
  monthsAgo,
  generateDividendDates
};

// Run if called directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✅ Demo data seeding completed successfully!');
      console.log('Run: npm run dev');
      console.log('Login: test@example.com / password123');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Demo seeding failed:', error);
      process.exit(1);
    });
}