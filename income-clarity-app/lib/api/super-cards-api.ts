// Super Cards API - Client-side API that calls server endpoints
// Database operations handled server-side through API routes

import { logger } from '@/lib/logger';

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'YTD' | 'ALL' | 'MAX';

export interface SuperCardData {
  id: string;
  type: 'income' | 'performance' | 'portfolio' | 'tax' | 'financial';
  data: any;
  lastUpdated: Date;
}

export const SuperCardsAPI = {
  // Legacy stub methods (deprecated)
  getCards: async () => [],
  getCard: async (id: string) => null,
  updateCard: async (id: string, data: any) => null,
  createCard: async (data: any) => null,
  deleteCard: async (id: string) => null
};

// New unified API with HTTP calls to server endpoints
export const superCardsAPI = {
  // Income Intelligence Hub
  async fetchIncomeHub(): Promise<{
    monthlyIncome?: number;
    monthlyDividendIncome?: number;
    incomeClarityData?: any;
    expenseMilestones?: any[];
    availableToReinvest?: number;
  }> {
    try {
      const response = await fetch('/api/super-cards/income-hub', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch income hub data');
      }
      return await response.json();
    } catch (error) {
      logger.error('Error fetching Income Hub data:', error);
      
      // Return fallback data if API call fails
      return {
        monthlyIncome: 4500,
        monthlyDividendIncome: 4500,
        incomeClarityData: {
          grossMonthly: 4500,
          taxOwed: 675,
          netMonthly: 3825,
          monthlyExpenses: 3200,
          availableToReinvest: 625,
          aboveZeroLine: true
        },
        expenseMilestones: [
          { id: 'utilities', category: 'Utilities', monthlyAmount: 250, covered: true, priority: 1 },
          { id: 'insurance', category: 'Insurance', monthlyAmount: 500, covered: true, priority: 2 },
          { id: 'food', category: 'Food', monthlyAmount: 800, covered: true, priority: 3 },
          { id: 'housing', category: 'Housing', monthlyAmount: 1650, covered: true, priority: 4 },
          { id: 'entertainment', category: 'Entertainment', monthlyAmount: 500, covered: false, priority: 5 }
        ],
        availableToReinvest: 625
      };
    }
  },

  // Performance Hub
  async fetchPerformanceHub(): Promise<any> {
    try {
      const response = await fetch('/api/super-cards/performance-hub', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch performance hub data');
      }
      return await response.json();
    } catch (error) {
      logger.error('Error fetching Performance Hub data:', error);
      
      // Return fallback data if API call fails
      return {
        portfolioValue: 125000,
        spyComparison: {
          portfolioReturn: 0.082,
          spyReturn: 0.061,
          outperformance: 0.021
        },
        holdings: [
          { id: 1, ticker: 'AAPL', shares: 100, avgCost: 150, currentPrice: 175, ytdPerformance: 0.15 },
          { id: 2, ticker: 'MSFT', shares: 75, avgCost: 280, currentPrice: 315, ytdPerformance: 0.12 },
          { id: 3, ticker: 'GOOGL', shares: 50, avgCost: 2400, currentPrice: 2650, ytdPerformance: 0.08 }
        ],
        timePeriodData: {
          '1Y': { portfolioReturn: 0.082, spyReturn: 0.061, outperformance: 0.021 },
          '6M': { portfolioReturn: 0.045, spyReturn: 0.032, outperformance: 0.013 },
          '3M': { portfolioReturn: 0.022, spyReturn: 0.018, outperformance: 0.004 }
        },
        spyOutperformance: 0.021,
        chartData: [],
        isEmpty: false
      };
    }
  },

  // Portfolio Strategy Hub  
  async fetchPortfolioStrategyHub(): Promise<any> {
    try {
      const response = await fetch('/api/super-cards/portfolio-strategy-hub', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio strategy hub data');
      }
      return await response.json();
    } catch (error) {
      logger.error('Error fetching Portfolio Strategy Hub data:', error);
      
      // Return fallback data if API call fails
      return {
        holdings: [
          { symbol: 'AAPL', weight: 0.25, recommendation: 'Hold' },
          { symbol: 'MSFT', weight: 0.20, recommendation: 'Buy' },
          { symbol: 'GOOGL', weight: 0.15, recommendation: 'Hold' }
        ],
        rebalancingSuggestions: [
          { action: 'Reduce AAPL position by 5%', priority: 'medium' },
          { action: 'Increase MSFT position by 3%', priority: 'high' }
        ],
        portfolioHealth: {
          score: 85,
          diversification: 'Good',
          riskLevel: 'Moderate'
        },
        isEmpty: false
      };
    }
  },

  // Tax Strategy Hub
  async fetchTaxStrategyHub(): Promise<any> {
    try {
      const response = await fetch('/api/super-cards/tax-strategy-hub', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tax strategy hub data');
      }
      return await response.json();
    } catch (error) {
      logger.error('Error fetching Tax Strategy Hub data:', error);
      
      // Return fallback data if API call fails
      return {
        currentTaxBill: 12500,
        taxStrategies: [
          { name: 'Tax-Loss Harvesting', potentialSavings: 2500, complexity: 'medium' },
          { name: 'Asset Location Optimization', potentialSavings: 1800, complexity: 'low' },
          { name: 'Roth Conversion', potentialSavings: 3200, complexity: 'high' }
        ],
        projectedSavings: 7500,
        taxEfficiency: 0.78,
        isEmpty: false
      };
    }
  },

  // Financial Planning Hub
  async fetchFinancialPlanningHub(): Promise<any> {
    try {
      const response = await fetch('/api/super-cards/financial-planning-hub', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch financial planning hub data');
      }
      return await response.json();
    } catch (error) {
      logger.error('Error fetching Financial Planning Hub data:', error);
      
      // Return fallback data if API call fails
      return {
        fireProgress: 0.23,
        yearsToFire: 12,
        currentNetWorth: 125000,
        targetNetWorth: 1250000,
        monthlyInvestment: 3500,
        currentSavingsRate: 0.35,
        aboveZeroStreak: 8,
        milestones: [
          { name: 'Emergency Fund', target: 50000, current: 45000, completed: false },
          { name: 'First $100K', target: 100000, current: 125000, completed: true },
          { name: 'Coast FI', target: 400000, current: 125000, completed: false }
        ],
        projections: {
          conservative: { years: 15, amount: 1250000 },
          moderate: { years: 12, amount: 1250000 },
          aggressive: { years: 10, amount: 1250000 }
        },
        isEmpty: false
      };
    }
  },

  // Portfolio Holdings
  async fetchPortfolioHoldings() {
    try {
      const response = await fetch('/api/super-cards/portfolio-holdings', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch portfolio holdings');
      }
      return await response.json();
    } catch (error) {
      logger.error('Error fetching portfolio holdings:', error);
      return [];
    }
  },

  // Update methods
  async updateIncomeHub(data: any): Promise<boolean> {
    try {
      const response = await fetch('/api/super-cards/income-hub', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (error) {
      logger.error('Error updating Income Hub data:', error);
      return false;
    }
  },

  async updatePerformanceHub(data: any): Promise<boolean> {
    try {
      const response = await fetch('/api/super-cards/performance-hub', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      return response.ok;
    } catch (error) {
      logger.error('Error updating Performance Hub data:', error);
      return false;
    }
  },

  // Financial Planning Hub
  async fetchPlanningHub(): Promise<{
    fireProgress?: number;
    yearsToFire?: number;
    currentSavingsRate?: number;
    aboveZeroStreak?: number;
    monthlyInvestment?: number;
    netWorth?: number;
    milestones?: any[];
  }> {
    try {
      const response = await fetch('/api/super-cards/planning-hub', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch planning hub data');
      }
      return await response.json();
    } catch (error) {
      logger.error('Error fetching Planning Hub data:', error);
      
      // Return fallback data if API call fails
      return {
        fireProgress: 0.15,
        yearsToFire: 12,
        currentSavingsRate: 0.25,
        aboveZeroStreak: 8,
        monthlyInvestment: 2000,
        netWorth: 150000,
        milestones: []
      };
    }
  }
};

export default SuperCardsAPI;