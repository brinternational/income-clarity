#!/usr/bin/env node

/**
 * Create Test Account Script
 * Creates a test account with demo data for Income Clarity app
 * 
 * Usage: node scripts/create-test-account.js
 */

const { PrismaClient } = require('../lib/generated/prisma');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User'
};

async function createTestAccount() {
  try {
    console.log('🔍 Checking if test account already exists...');
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: TEST_USER.email }
    });

    if (existingUser) {
      console.log('✅ Test account already exists!');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   ID: ${existingUser.id}`);
      console.log(`   Created: ${existingUser.createdAt}`);
      return existingUser;
    }

    console.log('🔨 Creating test account...');

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(TEST_USER.password, saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: TEST_USER.email,
        passwordHash,
        settings: JSON.stringify({
          name: TEST_USER.name,
          theme: 'dark',
          notifications: true,
          currency: 'USD',
          experienceLevel: 'intermediate',
          riskTolerance: 7
        }),
        taxProfile: JSON.stringify({
          location: 'US',
          state: 'CA',
          filingStatus: 'single',
          taxYear: new Date().getFullYear(),
          federalBracket: 0.22,
          stateBracket: 0.093,
          qualifiedDividendRate: 0.15
        })
      }
    });

    console.log('✅ Test user created successfully!');
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);

    console.log('📊 Creating demo portfolio data...');

    // Create a demo portfolio
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: user.id,
        name: 'Demo Dividend Portfolio',
        type: 'Taxable',
        institution: 'Fidelity',
        isPrimary: true
      }
    });

    console.log('✅ Demo portfolio created');

    // Create demo holdings
    const holdings = [
      {
        portfolioId: portfolio.id,
        ticker: 'AAPL',
        shares: 50,
        costBasis: 150.00,
        purchaseDate: new Date('2024-01-15'),
        currentPrice: 190.50,
        dividendYield: 0.005,
        sector: 'Technology'
      },
      {
        portfolioId: portfolio.id,
        ticker: 'MSFT',
        shares: 30,
        costBasis: 280.00,
        purchaseDate: new Date('2024-02-01'),
        currentPrice: 410.20,
        dividendYield: 0.007,
        sector: 'Technology'
      },
      {
        portfolioId: portfolio.id,
        ticker: 'JNJ',
        shares: 25,
        costBasis: 160.00,
        purchaseDate: new Date('2024-01-20'),
        currentPrice: 155.75,
        dividendYield: 0.029,
        sector: 'Healthcare'
      },
      {
        portfolioId: portfolio.id,
        ticker: 'KO',
        shares: 100,
        costBasis: 58.50,
        purchaseDate: new Date('2024-03-01'),
        currentPrice: 62.25,
        dividendYield: 0.031,
        sector: 'Consumer Staples'
      },
      {
        portfolioId: portfolio.id,
        ticker: 'REALTY',
        shares: 75,
        costBasis: 65.00,
        purchaseDate: new Date('2024-02-15'),
        currentPrice: 68.80,
        dividendYield: 0.058,
        sector: 'Real Estate'
      }
    ];

    for (const holding of holdings) {
      await prisma.holding.create({ data: holding });
    }

    console.log(`✅ Created ${holdings.length} demo holdings`);

    // Create demo income records
    const incomeRecords = [
      {
        userId: user.id,
        source: 'AAPL',
        category: 'DIVIDEND',
        amount: 12.50,
        date: new Date('2024-08-01'),
        recurring: true,
        frequency: 'QUARTERLY',
        taxable: true,
        notes: 'Q3 2024 dividend payment'
      },
      {
        userId: user.id,
        source: 'MSFT',
        category: 'DIVIDEND',
        amount: 21.00,
        date: new Date('2024-08-15'),
        recurring: true,
        frequency: 'QUARTERLY',
        taxable: true,
        notes: 'Q3 2024 dividend payment'
      },
      {
        userId: user.id,
        source: 'JNJ',
        category: 'DIVIDEND',
        amount: 45.50,
        date: new Date('2024-07-10'),
        recurring: true,
        frequency: 'QUARTERLY',
        taxable: true,
        notes: 'Q2 2024 dividend payment'
      },
      {
        userId: user.id,
        source: 'KO',
        category: 'DIVIDEND',
        amount: 48.00,
        date: new Date('2024-07-01'),
        recurring: true,
        frequency: 'QUARTERLY',
        taxable: true,
        notes: 'Q2 2024 dividend payment'
      },
      {
        userId: user.id,
        source: 'REALTY',
        category: 'DIVIDEND',
        amount: 127.50,
        date: new Date('2024-08-01'),
        recurring: true,
        frequency: 'MONTHLY',
        taxable: true,
        notes: 'August 2024 monthly dividend'
      }
    ];

    for (const income of incomeRecords) {
      await prisma.income.create({ data: income });
    }

    console.log(`✅ Created ${incomeRecords.length} demo income records`);

    // Create demo expenses
    const expenses = [
      {
        userId: user.id,
        category: 'UTILITIES',
        merchant: 'PG&E',
        amount: 180.50,
        date: new Date('2024-08-01'),
        recurring: true,
        frequency: 'MONTHLY',
        priority: 9,
        essential: true,
        notes: 'Electricity and gas'
      },
      {
        userId: user.id,
        category: 'INSURANCE',
        merchant: 'State Farm',
        amount: 125.00,
        date: new Date('2024-08-01'),
        recurring: true,
        frequency: 'MONTHLY',
        priority: 9,
        essential: true,
        notes: 'Auto insurance'
      },
      {
        userId: user.id,
        category: 'FOOD',
        merchant: 'Safeway',
        amount: 450.00,
        date: new Date('2024-08-01'),
        recurring: true,
        frequency: 'MONTHLY',
        priority: 8,
        essential: true,
        notes: 'Groceries'
      },
      {
        userId: user.id,
        category: 'RENT',
        merchant: 'Bay Area Apartments',
        amount: 2200.00,
        date: new Date('2024-08-01'),
        recurring: true,
        frequency: 'MONTHLY',
        priority: 10,
        essential: true,
        notes: 'Monthly rent'
      },
      {
        userId: user.id,
        category: 'ENTERTAINMENT',
        merchant: 'Netflix',
        amount: 15.99,
        date: new Date('2024-08-01'),
        recurring: true,
        frequency: 'MONTHLY',
        priority: 3,
        essential: false,
        notes: 'Streaming subscription'
      }
    ];

    for (const expense of expenses) {
      await prisma.expense.create({ data: expense });
    }

    console.log(`✅ Created ${expenses.length} demo expense records`);

    // Create demo financial goals
    const goals = [
      {
        userId: user.id,
        name: 'Emergency Fund',
        description: '6 months of expenses for financial security',
        targetAmount: 18000.00,
        currentAmount: 12500.00,
        targetDate: new Date('2024-12-31'),
        category: 'EMERGENCY_FUND',
        priority: 10,
        isActive: true
      },
      {
        userId: user.id,
        name: 'FIRE Goal',
        description: 'Financial Independence with $1M portfolio',
        targetAmount: 1000000.00,
        currentAmount: 45000.00,
        targetDate: new Date('2035-01-01'),
        category: 'FIRE',
        priority: 9,
        isActive: true
      },
      {
        userId: user.id,
        name: 'Vacation Fund',
        description: 'European vacation next summer',
        targetAmount: 5000.00,
        currentAmount: 1200.00,
        targetDate: new Date('2025-06-01'),
        category: 'VACATION',
        priority: 5,
        isActive: true
      }
    ];

    for (const goal of goals) {
      await prisma.financialGoal.create({ data: goal });
    }

    console.log(`✅ Created ${goals.length} demo financial goals`);

    // Create tax profile record
    await prisma.taxProfile.create({
      data: {
        userId: user.id,
        state: 'CA',
        filingStatus: 'single',
        federalBracket: 0.22,
        stateBracket: 0.093,
        qualifiedDividendRate: 0.15,
        capitalGainsRate: 0.15,
        effectiveRate: 0.25,
        marginalRate: 0.315,
        taxYear: 2024
      }
    });

    console.log('✅ Created tax profile');

    // Create user settings record
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        theme: 'dark',
        currency: 'USD',
        locale: 'en-US',
        timezone: 'America/Los_Angeles',
        notifications: JSON.stringify({
          email: true,
          push: false,
          dividends: true,
          milestones: true
        }),
        privacy: JSON.stringify({
          shareData: false,
          analytics: true
        }),
        features: JSON.stringify({
          betaFeatures: true,
          advancedCharts: true
        })
      }
    });

    console.log('✅ Created user settings');

    console.log('\n🎉 Test account setup complete!');
    console.log('\n📋 Login Credentials:');
    console.log(`   Email: ${TEST_USER.email}`);
    console.log(`   Password: ${TEST_USER.password}`);
    console.log(`   User ID: ${user.id}`);
    
    console.log('\n📊 Demo Data Summary:');
    console.log(`   • 1 Portfolio with 5 holdings`);
    console.log(`   • ${incomeRecords.length} dividend income records`);
    console.log(`   • ${expenses.length} expense categories`);
    console.log(`   • ${goals.length} financial goals`);
    console.log(`   • Tax profile (CA resident)`);
    console.log(`   • User preferences configured`);

    console.log('\n🔗 Test URLs:');
    console.log(`   • Login: http://localhost:3000/auth/login`);
    console.log(`   • Dashboard: http://localhost:3000/dashboard`);
    console.log(`   • Super Cards: http://localhost:3000/dashboard/super-cards`);

    return user;

  } catch (error) {
    console.error('❌ Error creating test account:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  createTestAccount()
    .then(() => {
      console.log('\n✅ Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = createTestAccount;