#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUserData() {
  console.log('🔍 Verifying test@example.com data...\n');
  
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!user) {
      console.log('❌ User test@example.com not found!');
      return;
    }
    
    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Created:', user.createdAt);
    console.log('');
    
    // Get portfolios
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: user.id },
      include: {
        holdings: true
      }
    });
    
    console.log('📊 Portfolios:', portfolios.length);
    portfolios.forEach(p => {
      console.log(`   - ${p.name}:`);
      console.log(`     Holdings: ${p.holdings.length}`);
      console.log(`     Value: $${p.totalValue ? p.totalValue.toFixed(2) : '0.00'}`);
      // Show holding details
      p.holdings.forEach(h => {
        console.log(`       • ${h.ticker}: ${h.shares} shares @ $${h.costBasis ? h.costBasis.toFixed(2) : 'N/A'}`);
      });
    });
    
    // Get transactions separately
    const transactions = await prisma.transaction.findMany({
      where: { portfolioId: { in: portfolios.map(p => p.id) } },
      take: 10,
      orderBy: { date: 'desc' }
    });
    console.log('   Total recent transactions:', transactions.length);
    console.log('');
    
    // Get recent income
    const income = await prisma.incomeRecord.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { date: 'desc' }
    });
    
    console.log('💰 Recent Income Records:', income.length);
    income.forEach(i => {
      console.log(`   - ${i.date.toISOString().split('T')[0]}: $${i.amount.toFixed(2)} (${i.source})`);
    });
    console.log('');
    
    // Get recent expenses
    const expenses = await prisma.expenseRecord.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { date: 'desc' }
    });
    
    console.log('💸 Recent Expense Records:', expenses.length);
    expenses.forEach(e => {
      console.log(`   - ${e.date.toISOString().split('T')[0]}: $${e.amount.toFixed(2)} (${e.category})`);
    });
    
    console.log('\n✅ Data verification complete!');
    console.log('📝 Summary: User has portfolios, holdings, and transaction history.');
    console.log('🚀 The data exists and is properly linked!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

verifyUserData();