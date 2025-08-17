#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get demo user with all data
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' },
      include: {
        yodleeConnection: {
          include: { syncedAccounts: true }
        },
        portfolios: {
          include: {
            holdings: {
              select: {
                ticker: true,
                shares: true,
                currentPrice: true,
                dataSource: true,
                yodleeAccountId: true
              }
            }
          }
        }
      }
    });

    console.log('=== YODLEE INTEGRATION STATUS ===\n');

    // Show Yodlee connection
    if (user.yodleeConnection) {
      console.log('✅ Yodlee Connection:', user.yodleeConnection.yodleeUserId);
      console.log('✅ Last Synced:', user.yodleeConnection.lastSyncedAt);
      console.log('✅ Real Accounts:', user.yodleeConnection.syncedAccounts.length);
      user.yodleeConnection.syncedAccounts.forEach(acc => {
        console.log(`   - ${acc.accountName} (${acc.accountType}): ${acc.yodleeAccountId}`);
      });
    }

    // Count holdings by source
    const allHoldings = user.portfolios.flatMap(p => p.holdings);
    const yodleeCount = allHoldings.filter(h => h.dataSource === 'YODLEE').length;
    const manualCount = allHoldings.filter(h => h.dataSource === 'MANUAL').length;

    console.log('\n📊 HOLDINGS BY SOURCE:');
    console.log(`Total: ${allHoldings.length}`);
    console.log(`Yodlee: ${yodleeCount} ${yodleeCount > 0 ? '✅' : '❌'}`);
    console.log(`Manual: ${manualCount}`);

    // Show Yodlee holdings
    if (yodleeCount > 0) {
      console.log('\n💰 YODLEE HOLDINGS:');
      const yodleeHoldings = allHoldings.filter(h => h.dataSource === 'YODLEE');
      let totalValue = 0;
      yodleeHoldings.forEach(h => {
        const value = h.shares * h.currentPrice;
        totalValue += value;
        console.log(`${h.ticker}: ${h.shares} shares @ $${h.currentPrice} = $${value.toFixed(2)}`);
      });
      console.log(`\nTotal Yodlee Portfolio Value: $${totalValue.toFixed(2)}`);
    }

    // Check income records
    const incomes = await prisma.income.findMany({
      where: { 
        userId: user.id,
        dataSource: 'YODLEE'
      },
      select: {
        source: true,
        amount: true,
        category: true,
        date: true
      }
    });

    if (incomes.length > 0) {
      console.log(`\n💵 YODLEE INCOME RECORDS: ${incomes.length}`);
      const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
      console.log(`Total Yodlee Income: $${totalIncome.toFixed(2)}`);
    }

    // Final status
    if (yodleeCount > 0) {
      console.log('\n🎉 SUCCESS: Demo user has Yodlee-sourced data!');
    } else {
      console.log('\n❌ ISSUE: No Yodlee holdings found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
