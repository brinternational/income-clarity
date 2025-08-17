const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkYodleeData() {
  try {
    // Get demo user with all related data
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        yodleeConnection: {
          include: {
            syncedAccounts: true
          }
        },
        portfolios: {
          include: {
            holdings: {
              take: 5
            }
          }
        }
      }
    });

    if (!user) {
      console.log('Demo user not found!');
      return;
    }

    console.log('=== DEMO USER DATA ===');
    console.log('User:', user.email);
    console.log('Has Yodlee Connection:', !!user.yodleeConnection);
    
    if (user.yodleeConnection) {
      console.log('Yodlee User ID:', user.yodleeConnection.yodleeUserId);
      console.log('Synced Accounts:', user.yodleeConnection.syncedAccounts.length);
      user.yodleeConnection.syncedAccounts.forEach(acc => {
        console.log(`  - ${acc.accountName}: $${acc.currentBalance}`);
      });
    }

    console.log('\n=== PORTFOLIO HOLDINGS ===');
    user.portfolios.forEach(portfolio => {
      console.log(`Portfolio: ${portfolio.name}`);
      portfolio.holdings.forEach(holding => {
        console.log(`  - ${holding.symbol}: ${holding.quantity} shares (Source: ${holding.dataSource})`);
      });
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkYodleeData();
