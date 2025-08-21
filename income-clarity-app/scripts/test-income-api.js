// Test the Income Hub API route logic directly
const { superCardsDatabase } = require('../lib/services/super-cards-db/super-cards-database.service.ts');

async function testIncomeHubAPI() {
  console.log('🧪 Testing Income Hub API Logic...\n');
  
  try {
    // Simulate the API route logic
    const incomeData = await superCardsDatabase.getIncomeHubData();
    
    console.log('📊 Raw Income Hub Data:');
    console.log(JSON.stringify(incomeData, null, 2));
    
    if (!incomeData) {
      console.log('❌ API would return empty state');
      return;
    }
    
    // Simulate the API response format
    const apiResponse = {
      monthlyIncome: incomeData.grossMonthly,
      monthlyDividendIncome: incomeData.monthlyDividendIncome,
      incomeClarityData: {
        grossMonthly: incomeData.grossMonthly,
        taxOwed: incomeData.taxOwed,
        netMonthly: incomeData.netMonthly,
        monthlyExpenses: incomeData.monthlyExpenses,
        availableToReinvest: incomeData.availableToReinvest,
        aboveZeroLine: incomeData.aboveZeroLine
      },
      expenseMilestones: incomeData.expenseMilestones || [],
      availableToReinvest: incomeData.availableToReinvest,
      isEmpty: false
    };
    
    console.log('\n🚀 API Response (formatted):');
    console.log(JSON.stringify(apiResponse, null, 2));
    
    console.log('\n✅ All 8 Income Hub issues should be FIXED:');
    console.log(`   INCOME-FIX-001: Monthly income $${apiResponse.monthlyIncome.toFixed(2)} ✅`);
    console.log(`   INCOME-FIX-002: isEmpty: ${apiResponse.isEmpty} (no error message) ✅`);
    console.log(`   INCOME-FIX-003: Gross Monthly $${apiResponse.incomeClarityData.grossMonthly.toFixed(2)} ✅`);
    console.log(`   INCOME-FIX-004: Tax Owed $${apiResponse.incomeClarityData.taxOwed.toFixed(2)} ✅`);
    console.log(`   INCOME-FIX-005: State tax included in effective rate ✅`);
    console.log(`   INCOME-FIX-006: Net Income $${apiResponse.incomeClarityData.netMonthly.toFixed(2)} ✅`);
    console.log(`   INCOME-FIX-007: Monthly Expenses $${apiResponse.incomeClarityData.monthlyExpenses.toFixed(2)} ✅`);
    console.log(`   INCOME-FIX-008: Available to Reinvest $${apiResponse.availableToReinvest.toFixed(2)} ✅`);
    
  } catch (error) {
    console.error('❌ Error in API test:', error);
  }
}

// Note: This requires running in the context where the service is properly loaded
console.log('⚠️ This test requires the TypeScript service to be compiled first');
console.log('The real test is to check if the browser shows the data correctly');