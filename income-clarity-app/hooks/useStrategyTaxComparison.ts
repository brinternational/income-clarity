// Strategy tax comparison hook
export function useStrategyTaxComparison(params?: any) {
  return {
    strategies: [],
    loading: false,
    error: null,
    compareStrategies: (data?: any) => [],
    isLoading: false,
    calculateTaxImpact: (strategyId: string, portfolioValue: number) => ({
      taxRate: 0,
      taxAmount: 0,
      afterTaxIncome: 0,
      effectiveTaxRate: 0,
      grossReturn: 0,
      annualTax: 0
    }),
    getAfterTaxReturn: (strategyId: string) => 0
  };
}

export default useStrategyTaxComparison;