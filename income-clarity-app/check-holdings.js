const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHoldings() {
  try {
    // Get holdings with data source
    const holdings = await prisma.holding.findMany({
      select: {
        ticker: true,
        dataSource: true,
        shares: true,
        currentPrice: true,
        yodleeAccountId: true
      },
      take: 10
    });

    console.log('=== FIRST 10 HOLDINGS IN DATABASE ===');
    holdings.forEach(h => {
      console.log(h.ticker + ': ' + h.shares + ' shares @ $' + h.currentPrice);
      console.log('  Source: ' + h.dataSource + ', Yodlee Account: ' + (h.yodleeAccountId || 'None'));
    });

    // Count by source
    const counts = await prisma.holding.groupBy({
      by: ['dataSource'],
      _count: true
    });

    console.log('\n=== TOTAL HOLDINGS BY SOURCE ===');
    counts.forEach(c => {
      console.log(c.dataSource + ': ' + c._count + ' holdings');
    });

    // Check if any holdings are linked to Yodlee accounts
    const yodleeHoldings = await prisma.holding.count({
      where: {
        yodleeAccountId: { not: null }
      }
    });

    console.log('\nHoldings linked to Yodlee accounts: ' + yodleeHoldings);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkHoldings();
