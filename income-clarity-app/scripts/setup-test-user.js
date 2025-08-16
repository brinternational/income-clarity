// Setup test user in database
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      console.log('✅ Test user already exists with ID:', existingUser.id);
      return existingUser;
    }

    // Hash password
    const password = 'password123';
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

    // Create user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash: `${salt}:${hash}`, // Store salt with hash
        onboarding_completed: true,
        settings: JSON.stringify({
          theme: 'light',
          notifications: true,
          currency: 'USD'
        }),
        taxProfile: JSON.stringify({
          location: 'California',
          filingStatus: 'single',
          federalRate: 0.15,
          stateRate: 0.093
        })
      }
    });

    console.log('✅ Test user created successfully with ID:', user.id);

    // Create a portfolio for the test user
    const portfolio = await prisma.portfolio.create({
      data: {
        userId: user.id,
        name: 'Main Portfolio',
        totalValue: 125000,
        cashBalance: 5000
      }
    });

    console.log('✅ Portfolio created with ID:', portfolio.id);

    // Create some holdings
    const holdings = [
      { symbol: 'SCHD', shares: 586, costBasis: 85.20 },
      { symbol: 'VTI', shares: 102, costBasis: 295.30 },
      { symbol: 'VXUS', shares: 382, costBasis: 65.40 },
      { symbol: 'BND', shares: 279, costBasis: 71.80 }
    ];

    for (const holding of holdings) {
      await prisma.holding.create({
        data: {
          portfolioId: portfolio.id,
          symbol: holding.symbol,
          shares: holding.shares,
          costBasis: holding.costBasis,
          currentPrice: holding.costBasis * (1 + Math.random() * 0.1) // Simulate some gain
        }
      });
    }

    console.log('✅ Holdings created');

    // Create some income records
    const incomes = [
      { source: 'SCHD Dividend', amount: 150, date: new Date('2024-01-15') },
      { source: 'VTI Dividend', amount: 75, date: new Date('2024-01-15') },
      { source: 'VXUS Dividend', amount: 50, date: new Date('2024-01-15') },
      { source: 'BND Interest', amount: 45, date: new Date('2024-01-15') }
    ];

    for (const income of incomes) {
      await prisma.income.create({
        data: {
          userId: user.id,
          source: income.source,
          amount: income.amount,
          date: income.date,
          type: 'dividend'
        }
      });
    }

    console.log('✅ Income records created');

    // Create some expenses
    const expenses = [
      { category: 'rent', description: 'Monthly Rent', amount: 2000 },
      { category: 'utilities', description: 'Utilities', amount: 250 },
      { category: 'food', description: 'Groceries', amount: 800 },
      { category: 'insurance', description: 'Insurance', amount: 450 },
      { category: 'entertainment', description: 'Entertainment', amount: 500 }
    ];

    for (const expense of expenses) {
      await prisma.expense.create({
        data: {
          userId: user.id,
          category: expense.category,
          description: expense.description,
          amount: expense.amount,
          date: new Date(),
          isRecurring: true,
          frequency: 'monthly'
        }
      });
    }

    console.log('✅ Expense records created');
    
    console.log('\n📋 Test User Credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('\n✅ Test user setup complete with sample data!');

    return user;

  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
createTestUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });