import { User, Portfolio, Holding, IncomeClarityResult, ExpenseMilestone } from '@/types';

// Calculate net income after taxes
export function calculateIncomeClarityStats(
  portfolio: Portfolio, 
  user: User
): IncomeClarityResult {
  let totalTax = 0;
  
  // Calculate tax per holding based on treatment
  (portfolio.holdings || []).forEach(holding => {
    const monthlyIncome = holding.monthlyIncome || 0;
    
    switch (holding.taxTreatment) {
      case 'qualified':
        totalTax += monthlyIncome * user.location.taxRates.qualified;
        break;
      case 'ordinary':
        totalTax += monthlyIncome * user.location.taxRates.ordinaryIncome;
        break;
      case 'roc':
        totalTax += 0; // Return of capital not taxed
        break;
      case 'mixed':
        // Use 19a statement data (Phase 2) - for now assume 50/50
        totalTax += monthlyIncome * user.location.taxRates.ordinaryIncome * 0.5;
        break;
    }
  });

  const grossMonthly = portfolio.monthlyGrossIncome;
  const netMonthly = grossMonthly - totalTax;
  const availableToReinvest = netMonthly - user.goals.monthlyExpenses;
  
  return {
    grossMonthly,
    taxOwed: totalTax,
    netMonthly,
    monthlyExpenses: user.goals.monthlyExpenses,
    availableToReinvest,
    aboveZeroLine: availableToReinvest > 0
  };
}

// Calculate SPY comparison
export function calculateSPYComparison(holdings: Holding[]): {
  portfolioReturn: number;
  spyReturn: number;
  outperformance: number;
  beatingMarket: boolean;
} {
  // Mock SPY return for demo
  const spyYTDReturn = 0.082; // 8.2%
  
  const totalValue = holdings.reduce((sum, h) => sum + (h.currentValue || 0), 0);
  const weightedReturn = holdings.reduce((sum, h) => {
    const weight = (h.currentValue || 0) / totalValue;
    return sum + ((h.ytdPerformance || 0) * weight);
  }, 0);
  
  return {
    portfolioReturn: weightedReturn,
    spyReturn: spyYTDReturn,
    outperformance: weightedReturn - spyYTDReturn,
    beatingMarket: weightedReturn > spyYTDReturn
  };
}

// Calculate expense milestones with gamification
export function calculateExpenseMilestones(
  monthlyIncome: number,
  expenses: { name: string; amount: number }[]
): ExpenseMilestone[] {
  // Sort expenses low to high for gamification
  const sortedExpenses = [...expenses].sort((a, b) => a.amount - b.amount);
  
  let runningTotal = 0;
  
  return sortedExpenses.map((expense, index) => {
    runningTotal += expense.amount;
    const covered = monthlyIncome >= runningTotal;
    const percentageCovered = Math.min(
      (monthlyIncome - (runningTotal - expense.amount)) / expense.amount * 100,
      100
    );
    
    return {
      id: `expense-${index}`,
      name: expense.name,
      amount: expense.amount,
      covered,
      percentageCovered: Math.max(0, percentageCovered),
      monthlyIncomeNeeded: Math.max(0, runningTotal - monthlyIncome)
    };
  });
}

// Calculate overall expense coverage percentage
export function calculateTotalCoverage(monthlyIncome: number, totalExpenses: number): number {
  return Math.min((monthlyIncome / totalExpenses) * 100, 100);
}