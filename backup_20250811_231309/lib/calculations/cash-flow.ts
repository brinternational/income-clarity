/**
 * Cash Flow Calculations for Income Clarity
 * Provides utilities for calculating cash flow metrics and projections
 */

interface Income {
  id: string;
  amount: number;
  date: string;
  recurring: boolean;
  frequency?: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  taxable: boolean;
  category: string;
}

interface Expense {
  id: string;
  amount: number;
  date: string;
  recurring: boolean;
  frequency?: 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
  essential: boolean;
  category: string;
}

interface CashFlowSummary {
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  taxableIncome: number;
  essentialExpenses: number;
  discretionaryExpenses: number;
  savingsRate: number;
  isAboveZero: boolean;
}

interface CashFlowProjection {
  month: string;
  income: number;
  expenses: number;
  netCashFlow: number;
  cumulativeCashFlow: number;
}

interface TaxBracket {
  federal: number;
  state: number;
  qualifiedDividendRate: number;
}

// Default tax rates for calculations
const DEFAULT_TAX_RATES: TaxBracket = {
  federal: 0.22, // 22% federal bracket
  state: 0.0, // 0% state (Puerto Rico advantage)
  qualifiedDividendRate: 0.15 // 15% on qualified dividends
};

/**
 * Calculate net income after taxes
 */
export function calculateNetIncome(incomes: Income[], taxRates: TaxBracket = DEFAULT_TAX_RATES): number {
  const totalGrossIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const taxableIncome = incomes
    .filter(income => income.taxable)
    .reduce((sum, income) => sum + income.amount, 0);

  // Simplified tax calculation - in reality this would be more complex
  const estimatedTaxes = calculateTaxes(taxableIncome, incomes, taxRates);
  
  return totalGrossIncome - estimatedTaxes;
}

/**
 * Calculate estimated taxes on income
 */
export function calculateTaxes(taxableIncome: number, incomes: Income[], taxRates: TaxBracket): number {
  // Separate dividend income for preferential tax treatment
  const dividendIncome = incomes
    .filter(income => income.taxable && income.category === 'DIVIDEND')
    .reduce((sum, income) => sum + income.amount, 0);
  
  const ordinaryIncome = taxableIncome - dividendIncome;

  // Calculate taxes
  const ordinaryTaxes = ordinaryIncome * (taxRates.federal + taxRates.state);
  const dividendTaxes = dividendIncome * taxRates.qualifiedDividendRate;

  return ordinaryTaxes + dividendTaxes;
}

/**
 * Calculate savings rate as percentage
 */
export function calculateSavingsRate(incomes: Income[], expenses: Expense[]): number {
  const netIncome = calculateNetIncome(incomes);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const netCashFlow = netIncome - totalExpenses;
  
  if (netIncome <= 0) return 0;
  
  return (netCashFlow / netIncome) * 100;
}

/**
 * Calculate above zero streak
 */
export function calculateAboveZeroStreak(history: CashFlowSummary[]): number {
  if (history.length === 0) return 0;
  
  let streak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].isAboveZero) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

/**
 * Project cash flow for future months
 */
export function projectCashFlow(
  incomes: Income[],
  expenses: Expense[],
  months: number
): CashFlowProjection[] {
  const projections: CashFlowProjection[] = [];
  let cumulativeCashFlow = 0;
  
  // Calculate monthly recurring amounts
  const monthlyRecurringIncome = getMonthlyRecurringAmount(incomes);
  const monthlyRecurringExpenses = getMonthlyRecurringAmount(expenses);
  
  for (let i = 1; i <= months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() + i);
    const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
    
    const monthlyIncome = monthlyRecurringIncome;
    const monthlyExpenses = monthlyRecurringExpenses;
    const netCashFlow = monthlyIncome - monthlyExpenses;
    
    cumulativeCashFlow += netCashFlow;
    
    projections.push({
      month: monthKey,
      income: monthlyIncome,
      expenses: monthlyExpenses,
      netCashFlow,
      cumulativeCashFlow
    });
  }
  
  return projections;
}

/**
 * Calculate monthly equivalent for recurring items
 */
function getMonthlyRecurringAmount(items: (Income | Expense)[]): number {
  return items
    .filter(item => item.recurring)
    .reduce((sum, item) => {
      const multipliers = {
        MONTHLY: 1,
        QUARTERLY: 1 / 3,
        ANNUALLY: 1 / 12
      };
      
      const multiplier = multipliers[item.frequency || 'MONTHLY'];
      return sum + (item.amount * multiplier);
    }, 0);
}

/**
 * Generate comprehensive cash flow summary
 */
export function generateCashFlowSummary(
  incomes: Income[],
  expenses: Expense[],
  taxRates: TaxBracket = DEFAULT_TAX_RATES
): CashFlowSummary {
  const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const taxableIncome = incomes
    .filter(income => income.taxable)
    .reduce((sum, income) => sum + income.amount, 0);
  
  const essentialExpenses = expenses
    .filter(expense => expense.essential)
    .reduce((sum, expense) => sum + expense.amount, 0);
  
  const discretionaryExpenses = expenses
    .filter(expense => !expense.essential)
    .reduce((sum, expense) => sum + expense.amount, 0);

  const netIncome = calculateNetIncome(incomes, taxRates);
  const netCashFlow = netIncome - totalExpenses;
  const savingsRate = netIncome > 0 ? (netCashFlow / netIncome) * 100 : 0;
  
  return {
    totalIncome,
    totalExpenses,
    netCashFlow,
    taxableIncome,
    essentialExpenses,
    discretionaryExpenses,
    savingsRate,
    isAboveZero: netCashFlow > 0
  };
}

/**
 * Calculate milestone coverage based on expenses
 */
export function calculateMilestoneCoverage(
  monthlyDividendIncome: number,
  expenses: Expense[]
): Array<{
  id: string;
  category: string;
  monthlyAmount: number;
  coveredByDividends: boolean;
  progress: number;
}> {
  // Group expenses by category to calculate monthly amounts
  const categoryTotals: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const monthlyAmount = expense.recurring 
      ? getMonthlyAmount(expense.amount, expense.frequency)
      : expense.amount; // Treat one-time as monthly for simplicity
    
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + monthlyAmount;
  });

  // Define milestone order based on priority
  const milestoneOrder = [
    'UTILITIES',
    'INSURANCE', 
    'FOOD',
    'RENT',
    'ENTERTAINMENT'
  ];

  let remainingIncome = monthlyDividendIncome;
  
  return milestoneOrder.map(category => {
    const monthlyAmount = categoryTotals[category] || 0;
    const coveredByDividends = remainingIncome >= monthlyAmount;
    const progress = monthlyAmount > 0 ? Math.min((remainingIncome / monthlyAmount) * 100, 100) : 100;
    
    if (coveredByDividends) {
      remainingIncome -= monthlyAmount;
    } else {
      remainingIncome = 0;
    }
    
    return {
      id: category.toLowerCase(),
      category: formatCategoryName(category),
      monthlyAmount,
      coveredByDividends,
      progress
    };
  });
}

/**
 * Convert amount to monthly equivalent
 */
function getMonthlyAmount(amount: number, frequency?: string): number {
  const multipliers = {
    MONTHLY: 1,
    QUARTERLY: 1 / 3,
    ANNUALLY: 1 / 12
  };
  
  return amount * multipliers[frequency as keyof typeof multipliers || 'MONTHLY'];
}

/**
 * Format category names for display
 */
function formatCategoryName(category: string): string {
  const categoryNames: Record<string, string> = {
    'UTILITIES': 'Utilities',
    'INSURANCE': 'Insurance',
    'FOOD': 'Food & Groceries',
    'RENT': 'Rent/Mortgage',
    'ENTERTAINMENT': 'Entertainment'
  };
  
  return categoryNames[category] || category;
}

/**
 * Calculate Financial Independence progress
 */
export function calculateFIREProgress(
  netWorth: number,
  annualExpenses: number,
  targetWithdrawalRate: number = 0.04
): {
  fireNumber: number;
  progress: number;
  yearsToFire: number;
  monthlyInvestmentNeeded: number;
} {
  const fireNumber = annualExpenses / targetWithdrawalRate;
  const progress = netWorth > 0 ? (netWorth / fireNumber) * 100 : 0;
  
  // Simple FIRE calculation - assume 7% return and current savings rate
  const assumedReturn = 0.07;
  const yearsToFire = netWorth > 0 ? Math.log(fireNumber / netWorth) / Math.log(1 + assumedReturn) : Infinity;
  
  // Monthly investment needed calculation
  const monthsToFire = yearsToFire * 12;
  const monthlyReturn = assumedReturn / 12;
  const monthlyInvestmentNeeded = monthsToFire !== Infinity && monthsToFire > 0
    ? (fireNumber - netWorth) * monthlyReturn / (Math.pow(1 + monthlyReturn, monthsToFire) - 1)
    : 0;
  
  return {
    fireNumber,
    progress: Math.min(progress, 100),
    yearsToFire: Math.max(yearsToFire, 0),
    monthlyInvestmentNeeded: Math.max(monthlyInvestmentNeeded, 0)
  };
}

/**
 * Analyze spending patterns and provide insights
 */
export function analyzeSpendingPatterns(expenses: Expense[]): {
  topCategories: Array<{ category: string; amount: number; percentage: number }>;
  essentialRatio: number;
  recurringRatio: number;
  averagePriority: number;
} {
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Group by category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(expense => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });
  
  // Sort categories by amount
  const topCategories = Object.entries(categoryTotals)
    .map(([category, amount]) => ({
      category: formatCategoryName(category),
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  
  // Calculate ratios
  const essentialAmount = expenses.filter(e => e.essential).reduce((sum, e) => sum + e.amount, 0);
  const recurringAmount = expenses.filter(e => e.recurring).reduce((sum, e) => sum + e.amount, 0);
  const totalPriority = expenses.reduce((sum, e) => sum + (e.priority || 5), 0);
  
  return {
    topCategories,
    essentialRatio: totalExpenses > 0 ? (essentialAmount / totalExpenses) * 100 : 0,
    recurringRatio: totalExpenses > 0 ? (recurringAmount / totalExpenses) * 100 : 0,
    averagePriority: expenses.length > 0 ? totalPriority / expenses.length : 0
  };
}