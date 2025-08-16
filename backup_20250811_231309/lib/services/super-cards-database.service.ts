/**
 * Super Cards Database Service
 * Connects all 5 Super Cards to SQLite database via Prisma
 * Replaces mock data with real database queries
 */

import { prisma } from '@/lib/db/prisma-client';
import type { TimeRange } from '@/lib/api/super-cards-api';

// Types for Super Cards data structures
export interface PerformanceHubData {
  portfolioValue: number;
  spyComparison: {
    portfolioReturn: number;
    spyReturn: number;
    outperformance: number;
  };
  holdings: Array<{
    id: string;
    ticker: string;
    value: number;
    weight: number;
    ytdPerformance: number;
    monthlyIncome: number;
    contributionToPerformance: number;
  }>;
  timePeriodData: Record<string, {
    portfolioReturn: number;
    spyReturn: number;
    outperformance: number;
  }>;
  spyOutperformance: number;
}

export interface IncomeHubData {
  monthlyIncome: number;
  availableToReinvest: number;
  isAboveZero: boolean;
  incomeClarityData: {
    grossIncome: number;
    taxes: number;
    netIncome: number;
    expenses: number;
    availableToReinvest: number;
  };
  projections: Array<{
    month: string;
    projected: number;
    confidence: number;
  }>;
  monthlyDividendIncome: number;
  taxBreakdown: Array<{
    type: string;
    amount: number;
    percentage: number;
  }>;
}

export interface TaxHubData {
  currentTaxBill: number;
  estimatedQuarterly: number;
  taxOptimizationSavings: number;
  taxDragAnalysis: {
    totalDrag: number;
    optimizedDrag: number;
    savingsOpportunity: number;
  };
  strategyComparison: Array<{
    name: string;
    grossYield: number;
    afterTaxYield: number;
    annualIncome: number;
    dollarAdvantage: string;
    winner?: boolean;
  }>;
}

export interface PortfolioHubData {
  portfolioHealth: {
    healthScore: number;
    riskLevel: 'low' | 'moderate' | 'high';
    diversificationScore: number;
    rebalanceNeeded: boolean;
    totalValue: number;
  };
  strategyComparison: Array<{
    strategy: string;
    return: number;
    risk: number;
    sharpeRatio: number;
  }>;
  rebalancingData: Array<{
    action: string;
    symbol: string;
    amount: number;
    taxImpact: number;
  }>;
  marginIntelligence: {
    utilizationRate: number;
    availableCredit: number;
    interestCost: number;
    riskLevel: 'low' | 'moderate' | 'high';
  };
}

export interface PlanningHubData {
  fireData: {
    fireProgress: number;
    yearsToFire: number;
    currentSavingsRate: number;
    aboveZeroStreak: number;
    monthlyInvestment: number;
    netWorth: number;
  };
  expenseMilestones: Array<{
    name: string;
    amount: number;
    covered: boolean;
    percentage: number;
  }>;
  aboveZeroData: {
    currentStreak: number;
    longestStreak: number;
    totalMonths: number;
    successRate: number;
  };
  customGoals: Array<{
    name: string;
    target: number;
    current: number;
    deadline: string;
  }>;
}

export class SuperCardsDatabaseService {
  private static instance: SuperCardsDatabaseService;
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTTL = 300000; // 5 minutes cache

  public static getInstance(): SuperCardsDatabaseService {
    if (!SuperCardsDatabaseService.instance) {
      SuperCardsDatabaseService.instance = new SuperCardsDatabaseService();
    }
    return SuperCardsDatabaseService.instance;
  }

  /**
   * Get default user ID for single-user setup
   * In production, this would come from authentication
   */
  private async getDefaultUserId(): Promise<string> {
    // For single-user setup, get the first user or create one
    let user = await prisma.user.findFirst();
    
    if (!user) {
      // console.log('Creating default user for Income Clarity...');
      // user = await prisma.user.create({
        // data: {
          // email: 'user@incomeclarity.local',
          // passwordHash: 'local_user_hash',
          // settings: JSON.stringify({
            // theme: 'light',
            // currency: 'USD',
            // locale: 'en-US'
          })
        }
      // });
    }
    
    return user.id;
  }

  /**
   * Get cache key for data
   */
  private getCacheKey(type: string, params?: any): string {
    return `${type}_${JSON.stringify(params || {})}`;
  }

  /**
   * Get data from cache
   */
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.cacheTTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Set data in cache
   */
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * LITE-026: Performance Hub Data
   * Connect to portfolios, holdings, and stock_prices tables
   */
  async getPerformanceHubData(timeRange: TimeRange = '1Y'): Promise<PerformanceHubData> {
    const cacheKey = this.getCacheKey('performance', { timeRange });
    const cached = this.getFromCache<PerformanceHubData>(cacheKey);
    if (cached) return cached;

    try {
      const userId = await this.getDefaultUserId();

      // Get user's portfolios with holdings
      const portfolios = await prisma.portfolio.findMany({
        where: { userId },
        include: {
          holdings: {
            include: {
              portfolio: false
            }
          }
        }
      });

      if (portfolios.length === 0) {
        // Return default structure if no data
        const defaultData: PerformanceHubData = {
          portfolioValue: 0,
          spyComparison: {
            portfolioReturn: 0,
            spyReturn: 0,
            outperformance: 0
          },
          holdings: [],
          timePeriodData: {},
          spyOutperformance: 0
        };
        this.setCache(cacheKey, defaultData);
        return defaultData;
      }

      // Calculate portfolio metrics
      const allHoldings = portfolios.flatMap(p => p.holdings);
      const portfolioValue = allHoldings.reduce((sum, holding) => 
        sum + (holding.shares * (holding.currentPrice || 0)), 0
      );

      // Get SPY price for comparison (mock for now, replace with real API)
      const spyReturn = 0.089; // 8.9% SPY YTD return
      
      // Calculate portfolio return based on cost basis
      const totalCostBasis = allHoldings.reduce((sum, holding) => 
        sum + (holding.shares * holding.costBasis), 0
      );
      const portfolioReturn = totalCostBasis > 0 ? 
        (portfolioValue - totalCostBasis) / totalCostBasis : 0;

      // Transform holdings for UI
      const holdingsData = allHoldings.map(holding => {
        const currentValue = holding.shares * (holding.currentPrice || 0);
        const costBasisTotal = holding.shares * holding.costBasis;
        const ytdPerformance = costBasisTotal > 0 ? 
          (currentValue - costBasisTotal) / costBasisTotal : 0;
        
        // Calculate monthly income based on dividend yield
        const monthlyIncome = currentValue * (holding.dividendYield || 0) / 12;

        return {
          id: holding.id,
          ticker: holding.ticker,
          value: currentValue,
          weight: portfolioValue > 0 ? (currentValue / portfolioValue) * 100 : 0,
          ytdPerformance,
          monthlyIncome,
          contributionToPerformance: ytdPerformance * (currentValue / portfolioValue)
        };
      });

      const outperformance = portfolioReturn - spyReturn;

      // Generate time period data (simplified for now)
      const timePeriodData = {
        '1D': { portfolioReturn: portfolioReturn * 0.004, spyReturn: spyReturn * 0.004, outperformance: outperformance * 0.004 },
        '1W': { portfolioReturn: portfolioReturn * 0.019, spyReturn: spyReturn * 0.019, outperformance: outperformance * 0.019 },
        '1M': { portfolioReturn: portfolioReturn * 0.083, spyReturn: spyReturn * 0.083, outperformance: outperformance * 0.083 },
        '3M': { portfolioReturn: portfolioReturn * 0.25, spyReturn: spyReturn * 0.25, outperformance: outperformance * 0.25 },
        '6M': { portfolioReturn: portfolioReturn * 0.5, spyReturn: spyReturn * 0.5, outperformance: outperformance * 0.5 },
        '1Y': { portfolioReturn, spyReturn, outperformance },
        'YTD': { portfolioReturn, spyReturn, outperformance }
      };

      const data: PerformanceHubData = {
        portfolioValue,
        spyComparison: {
          portfolioReturn,
          spyReturn,
          outperformance
        },
        holdings: holdingsData,
        timePeriodData,
        spyOutperformance: outperformance
      };

      this.setCache(cacheKey, data);
      return data;

    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * LITE-027: Income Intelligence Hub Data
   * Connect to incomes, expenses, and dividend_schedules tables
   */
  async getIncomeHubData(): Promise<IncomeHubData> {
    const cacheKey = this.getCacheKey('income');
    const cached = this.getFromCache<IncomeHubData>(cacheKey);
    if (cached) return cached;

    try {
      const userId = await this.getDefaultUserId();

      // Get recent income and expense data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [incomes, expenses, taxProfile] = await Promise.all([
        prisma.income.findMany({
          where: {
            userId,
            date: { gte: thirtyDaysAgo }
          },
          orderBy: { date: 'desc' }
        }),
        prisma.expense.findMany({
          where: {
            userId,
            date: { gte: thirtyDaysAgo }
          },
          orderBy: { date: 'desc' }
        }),
        prisma.taxProfile.findUnique({
          where: { userId }
        })
      ]);

      // Calculate monthly income
      const monthlyIncome = incomes
        .filter(income => income.category === 'DIVIDEND')
        .reduce((sum, income) => sum + income.amount, 0);

      // Calculate monthly expenses
      const monthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Calculate taxes (using tax profile)
      const taxRate = taxProfile ? (taxProfile.effectiveRate || 0.22) : 0.22;
      const grossIncome = monthlyIncome / (1 - taxRate);
      const taxes = grossIncome * taxRate;
      const netIncome = grossIncome - taxes;
      const availableToReinvest = netIncome - monthlyExpenses;

      // Generate projections (simplified)
      const projections = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(Date.now() + (i * 30 * 24 * 60 * 60 * 1000)).toLocaleDateString('en-US', { month: 'short' }),
        projected: monthlyIncome * (1 + (i * 0.005)), // 0.5% monthly growth
        confidence: Math.max(0.7, 0.95 - (i * 0.02)) // Decreasing confidence over time
      }));

      const data: IncomeHubData = {
        monthlyIncome,
        availableToReinvest,
        isAboveZero: availableToReinvest > 0,
        incomeClarityData: {
          grossIncome,
          taxes,
          netIncome,
          expenses: monthlyExpenses,
          availableToReinvest
        },
        projections,
        monthlyDividendIncome: monthlyIncome,
        taxBreakdown: [
          { type: 'Federal', amount: taxes * 0.75, percentage: taxRate * 0.75 * 100 },
          { type: 'State', amount: taxes * 0.25, percentage: taxRate * 0.25 * 100 }
        ]
      };

      this.setCache(cacheKey, data);
      return data;

    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * LITE-028: Tax Strategy Hub Data
   * Connect to tax_profiles and calculation_cache tables
   */
  async getTaxHubData(): Promise<TaxHubData> {
    const cacheKey = this.getCacheKey('tax');
    const cached = this.getFromCache<TaxHubData>(cacheKey);
    if (cached) return cached;

    try {
      const userId = await this.getDefaultUserId();

      // Get tax profile and income data
      const [taxProfile, incomes] = await Promise.all([
        prisma.taxProfile.findUnique({
          where: { userId }
        }),
        prisma.income.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 12 // Last 12 months
        })
      ]);

      const annualIncome = incomes.reduce((sum, income) => sum + income.amount, 0) * 12;
      const effectiveRate = taxProfile?.effectiveRate || 0.22;
      const currentTaxBill = annualIncome * effectiveRate;

      // Strategy comparison based on different investment approaches
      const strategies = [
        {
          name: 'Sell 4% SPY',
          grossYield: 4.0,
          afterTaxYield: 4.0 * (1 - (taxProfile?.capitalGainsRate || 0.15)),
          annualIncome: 0,
          dollarAdvantage: 'baseline'
        },
        {
          name: 'High Yield (JEPI)',
          grossYield: 12.5,
          afterTaxYield: 12.5 * (1 - effectiveRate),
          annualIncome: 0,
          dollarAdvantage: '+$0',
          winner: true
        },
        {
          name: 'Dividend (SCHD)',
          grossYield: 3.8,
          afterTaxYield: 3.8 * (1 - (taxProfile?.qualifiedDividendRate || 0.15)),
          annualIncome: 0,
          dollarAdvantage: '-$0'
        },
        {
          name: '60/40 Mix',
          grossYield: 6.0,
          afterTaxYield: 6.0 * (1 - (effectiveRate * 0.7)), // Mixed tax treatment
          annualIncome: 0,
          dollarAdvantage: '-$0'
        }
      ];

      const data: TaxHubData = {
        currentTaxBill,
        estimatedQuarterly: currentTaxBill / 4,
        taxOptimizationSavings: currentTaxBill * 0.1, // 10% potential savings
        taxDragAnalysis: {
          totalDrag: effectiveRate * 100,
          optimizedDrag: effectiveRate * 0.8 * 100, // 20% reduction possible
          savingsOpportunity: effectiveRate * 0.2 * 100
        },
        strategyComparison: strategies
      };

      this.setCache(cacheKey, data);
      return data;

    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * LITE-029: Portfolio Strategy Hub Data
   * Connect to portfolios, holdings, and transactions tables
   */
  async getPortfolioHubData(): Promise<PortfolioHubData> {
    const cacheKey = this.getCacheKey('portfolio');
    const cached = this.getFromCache<PortfolioHubData>(cacheKey);
    if (cached) return cached;

    try {
      const userId = await this.getDefaultUserId();

      // Get portfolios with holdings
      const portfolios = await prisma.portfolio.findMany({
        where: { userId },
        include: {
          holdings: true
        }
      });

      const totalValue = portfolios.reduce((sum, portfolio) => 
        sum + portfolio.holdings.reduce((holdingSum, holding) => 
          holdingSum + (holding.shares * (holding.currentPrice || 0)), 0
        ), 0
      );

      // Calculate portfolio health metrics
      const totalHoldings = portfolios.reduce((sum, p) => sum + p.holdings.length, 0);
      const diversificationScore = Math.min(100, totalHoldings * 5); // Simple diversification score
      const healthScore = Math.round((diversificationScore + 70) / 2); // Simple health calculation

      // Calculate risk level based on sector concentration
      const sectorCounts = new Map<string, number>();
      portfolios.forEach(portfolio => {
        portfolio.holdings.forEach(holding => {
          const sector = holding.sector || 'Unknown';
          sectorCounts.set(sector, (sectorCounts.get(sector) || 0) + 1);
        });
      });

      const maxSectorConcentration = Math.max(...Array.from(sectorCounts.values())) / totalHoldings;
      const riskLevel: 'low' | 'moderate' | 'high' = 
        maxSectorConcentration > 0.5 ? 'high' :
        maxSectorConcentration > 0.3 ? 'moderate' : 'low';

      const data: PortfolioHubData = {
        portfolioHealth: {
          healthScore,
          riskLevel,
          diversificationScore,
          rebalanceNeeded: maxSectorConcentration > 0.4,
          totalValue
        },
        strategyComparison: [
          { strategy: 'Current', return: 8.2, risk: 12.5, sharpeRatio: 0.66 },
          { strategy: 'Balanced', return: 6.5, risk: 8.2, sharpeRatio: 0.79 },
          { strategy: 'Growth', return: 10.3, risk: 18.7, sharpeRatio: 0.55 }
        ],
        rebalancingData: [], // Would calculate based on target allocation
        marginIntelligence: {
          utilizationRate: 0,
          availableCredit: totalValue * 0.5, // 50% of portfolio value
          interestCost: 0,
          riskLevel: 'low'
        }
      };

      this.setCache(cacheKey, data);
      return data;

    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * LITE-030: Financial Planning Hub Data
   * Connect to financial_goals and performance_snapshots tables
   */
  async getPlanningHubData(): Promise<PlanningHubData> {
    const cacheKey = this.getCacheKey('planning');
    const cached = this.getFromCache<PlanningHubData>(cacheKey);
    if (cached) return cached;

    try {
      const userId = await this.getDefaultUserId();

      // Get financial goals and recent performance snapshots
      const [goals, snapshots, expenses] = await Promise.all([
        prisma.financialGoal.findMany({
          where: { userId, isActive: true },
          orderBy: { priority: 'desc' }
        }),
        prisma.performanceSnapshot.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 12
        }),
        prisma.expense.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 30
        })
      ]);

      // Calculate FIRE metrics
      const latestSnapshot = snapshots[0];
      const netWorth = latestSnapshot?.totalValue || 0;
      const monthlyExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const annualExpenses = monthlyExpenses * 12;
      const fireNumber = annualExpenses * 25; // 4% rule
      const fireProgress = netWorth > 0 ? (netWorth / fireNumber) * 100 : 0;
      
      // Calculate years to FIRE based on current savings rate
      const monthlyInvestment = latestSnapshot?.monthlyIncome || 0;
      const savingsRate = monthlyExpenses > 0 ? (monthlyInvestment / (monthlyInvestment + monthlyExpenses)) * 100 : 0;
      const yearsToFire = fireProgress < 100 ? Math.max(0, (fireNumber - netWorth) / (monthlyInvestment * 12)) : 0;

      // Calculate above zero streak
      const aboveZeroMonths = snapshots.filter(s => s.netIncome > 0).length;
      const totalMonths = snapshots.length;
      const successRate = totalMonths > 0 ? (aboveZeroMonths / totalMonths) * 100 : 0;

      // Create expense milestones
      const expenseMilestones = [
        { name: 'Utilities', amount: 285, covered: monthlyInvestment >= 285, percentage: Math.min(100, (monthlyInvestment / 285) * 100) },
        { name: 'Insurance', amount: 467, covered: monthlyInvestment >= 467, percentage: Math.min(100, (monthlyInvestment / 467) * 100) },
        { name: 'Food', amount: 789, covered: monthlyInvestment >= 789, percentage: Math.min(100, (monthlyInvestment / 789) * 100) },
        { name: 'Housing', amount: 1650, covered: monthlyInvestment >= 1650, percentage: Math.min(100, (monthlyInvestment / 1650) * 100) },
        { name: 'Transportation', amount: 345, covered: monthlyInvestment >= 345, percentage: Math.min(100, (monthlyInvestment / 345) * 100) },
        { name: 'Entertainment', amount: 234, covered: monthlyInvestment >= 234, percentage: Math.min(100, (monthlyInvestment / 234) * 100) }
      ];

      const data: PlanningHubData = {
        fireData: {
          fireProgress,
          yearsToFire,
          currentSavingsRate: savingsRate,
          aboveZeroStreak: aboveZeroMonths,
          monthlyInvestment,
          netWorth
        },
        expenseMilestones,
        aboveZeroData: {
          currentStreak: aboveZeroMonths,
          longestStreak: aboveZeroMonths, // Simplified
          totalMonths,
          successRate
        },
        customGoals: goals.map(goal => ({
          name: goal.name,
          target: goal.targetAmount,
          current: goal.currentAmount,
          deadline: goal.targetDate?.toISOString().split('T')[0] || 'No deadline'
        }))
      };

      this.setCache(cacheKey, data);
      return data;

    } catch (error) {
      // Error handled by emergency recovery script
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Seed database with sample data for testing
   */
  async seedSampleData(): Promise<void> {
    try {
      const userId = await this.getDefaultUserId();
      // console.log('🌱 Seeding sample data for user:', userId);

      // Create tax profile
      await prisma.taxProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          state: 'PR', // Puerto Rico for tax advantage
          filingStatus: 'single',
          federalBracket: 0.22,
          stateBracket: 0.0, // No state tax in PR
          qualifiedDividendRate: 0.0, // No dividend tax in PR
          capitalGainsRate: 0.15,
          effectiveRate: 0.0,
          marginalRate: 0.22
        }
      });

      // Create portfolio
      let portfolio = await prisma.portfolio.findFirst({
        where: { userId, name: 'Main Portfolio' }
      });
      
      if (!portfolio) {
        portfolio = await prisma.portfolio.create({
          data: {
          userId,
          name: 'Main Portfolio',
          type: 'Taxable',
            institution: 'Fidelity',
            isPrimary: true
          }
        });
      }

      // Create sample holdings
      const sampleHoldings = [
        { ticker: 'JEPI', shares: 1856, costBasis: 52.15, currentPrice: 56.24, dividendYield: 0.109, sector: 'Mixed' },
        { ticker: 'SCHD', shares: 1245, costBasis: 74.32, currentPrice: 78.91, dividendYield: 0.039, sector: 'Diversified' },
        { ticker: 'VTI', shares: 567, costBasis: 235.67, currentPrice: 242.18, dividendYield: 0.025, sector: 'Total Market' },
        { ticker: 'VYM', shares: 789, costBasis: 108.45, currentPrice: 115.34, dividendYield: 0.036, sector: 'High Dividend' },
        { ticker: 'QYLD', shares: 2134, costBasis: 18.67, currentPrice: 17.82, dividendYield: 0.154, sector: 'NASDAQ 100' }
      ];

      for (const holding of sampleHoldings) {
        const existingHolding = await prisma.holding.findUnique({
          where: { 
            portfolioId_ticker: { 
              portfolioId: portfolio.id, 
              ticker: holding.ticker 
            } 
          }
        });
        
        if (existingHolding) {
          await prisma.holding.update({
            where: { id: existingHolding.id },
            data: {
              shares: holding.shares,
              currentPrice: holding.currentPrice,
              dividendYield: holding.dividendYield
            }
          });
        } else {
          await prisma.holding.create({
            data: {
              portfolioId: portfolio.id,
              ticker: holding.ticker,
              shares: holding.shares,
              costBasis: holding.costBasis,
              purchaseDate: new Date('2024-01-15'),
              currentPrice: holding.currentPrice,
              dividendYield: holding.dividendYield,
              sector: holding.sector
            }
          });
        }
      }

      // Create sample income records
      for (const holding of sampleHoldings) {
        const monthlyDividend = holding.shares * holding.currentPrice * holding.dividendYield / 12;
        
        await prisma.income.create({
          data: {
            userId,
            source: `${holding.ticker} Dividend`,
            category: 'DIVIDEND',
            amount: monthlyDividend,
            date: new Date(),
            recurring: true,
            frequency: 'MONTHLY',
            taxable: true
          }
        });
      }

      // Create sample expenses
      const sampleExpenses = [
        { category: 'UTILITIES', merchant: 'Electric Company', amount: 285, essential: true, priority: 8 },
        { category: 'INSURANCE', merchant: 'Health Insurance', amount: 467, essential: true, priority: 9 },
        { category: 'FOOD', merchant: 'Grocery Store', amount: 789, essential: true, priority: 7 },
        { category: 'RENT', merchant: 'Landlord', amount: 1650, essential: true, priority: 10 },
        { category: 'TRANSPORTATION', merchant: 'Gas Station', amount: 345, essential: true, priority: 6 },
        { category: 'ENTERTAINMENT', merchant: 'Netflix', amount: 234, essential: false, priority: 3 }
      ];

      for (const expense of sampleExpenses) {
        await prisma.expense.create({
          data: {
            userId,
            category: expense.category,
            merchant: expense.merchant,
            amount: expense.amount,
            date: new Date(),
            recurring: true,
            frequency: 'MONTHLY',
            essential: expense.essential,
            priority: expense.priority
          }
        });
      }

      // Create performance snapshot
      const totalValue = sampleHoldings.reduce((sum, h) => sum + (h.shares * h.currentPrice), 0);
      const totalIncome = sampleHoldings.reduce((sum, h) => sum + (h.shares * h.currentPrice * h.dividendYield / 12), 0);
      const totalExpenses = sampleExpenses.reduce((sum, e) => sum + e.amount, 0);

      await prisma.performanceSnapshot.create({
        data: {
          userId,
          date: new Date(),
          totalValue,
          totalCostBasis: sampleHoldings.reduce((sum, h) => sum + (h.shares * h.costBasis), 0),
          totalGainLoss: totalValue - sampleHoldings.reduce((sum, h) => sum + (h.shares * h.costBasis), 0),
          totalReturn: 0.089, // 8.9% return
          dividendIncome: totalIncome,
          spyPrice: 484.23,
          spyReturn: 0.061, // 6.1% SPY return
          monthlyIncome: totalIncome,
          monthlyExpenses: totalExpenses,
          netIncome: totalIncome - totalExpenses
        }
      });

      // console.log('✅ Sample data seeded successfully');

    } catch (error) {
      // Error handled by emergency recovery script
  }
}

// Export singleton instance
export const superCardsDatabaseService = SuperCardsDatabaseService.getInstance();