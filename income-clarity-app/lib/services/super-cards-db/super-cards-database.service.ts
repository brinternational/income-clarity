/**
 * Super Cards Database Service
 * Handles all database operations for the 5 Super Cards:
 * 1. Income Intelligence Hub
 * 2. Performance Hub  
 * 3. Portfolio Strategy Hub
 * 4. Tax Strategy Hub
 * 5. Financial Planning Hub
 */

import Database from 'better-sqlite3';
import { join } from 'path';
import { logger } from '@/lib/logger'
import { PrismaClient } from '@prisma/client'

// Types for Super Cards data structures
export interface IncomeHubData {
  id?: number;
  monthlyDividendIncome: number;
  grossMonthly: number;
  taxOwed: number;
  netMonthly: number;
  monthlyExpenses: number;
  availableToReinvest: number;
  aboveZeroLine: boolean;
  expenseMilestones?: ExpenseMilestone[];
  lastUpdated: Date;
}

export interface PerformanceHubData {
  id?: number;
  portfolioValue: number;
  spyPrice: number;
  totalReturn: number;
  dividendYield: number;
  monthlyDividends: number;
  yearlyDividends: number;
  spyComparison: number;
  holdings?: PortfolioHolding[];
  lastUpdated: Date;
}

export interface PortfolioStrategyHubData {
  id?: number;
  holdings: PortfolioHolding[];
  sectorAllocation: SectorAllocation[];
  riskMetrics: RiskMetrics;
  strategies: Strategy[];
  portfolioComposition?: any;
  rebalancingSuggestions?: any;
  healthMetrics?: any;
  riskAnalysis?: any;
  lastUpdated: Date;
}

export interface TaxStrategyHubData {
  id?: number;
  currentLocation: string;
  taxRate: number;
  strategies: TaxStrategy[];
  potentialSavings: number;
  lastUpdated: Date;
}

export interface FinancialPlanningHubData {
  id?: number;
  fireTargets: FIRETarget[];
  milestones: Milestone[];
  projections: FinancialProjection[];
  lastUpdated: Date;
}

// Supporting interfaces
export interface ExpenseMilestone {
  id: string;
  category: string;
  monthlyAmount: number;
  covered: boolean;
  priority: number;
}

export interface PortfolioHolding {
  symbol: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  dividendYield: number;
  annualDividend: number;
}

export interface SectorAllocation {
  sector: string;
  percentage: number;
  value: number;
}

export interface RiskMetrics {
  beta: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'pending';
}

export interface TaxStrategy {
  id: string;
  name: string;
  description: string;
  potentialSavings: number;
  complexity: 'low' | 'medium' | 'high';
}

export interface FIRETarget {
  id: string;
  type: 'lean' | 'fat' | 'coast' | 'barista';
  targetAmount: number;
  monthlyNeeded: number;
  yearsToTarget: number;
}

export interface Milestone {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  percentage: number;
  completed: boolean;
}

export interface FinancialProjection {
  year: number;
  portfolioValue: number;
  annualDividends: number;
  reinvestmentAmount: number;
}

class SuperCardsDatabaseService {
  private db: Database.Database | null = null;
  private initialized = false;
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
    this.initialize();
  }

  private initialize() {
    try {
      const dbPath = join(process.cwd(), 'data', 'super-cards.sqlite');
      this.db = new Database(dbPath);
      this.createTables();
      this.initialized = true;
      logger.log('Super Cards Database initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Super Cards Database:', error);
      this.initialized = false;
    }
  }

  private createTables() {
    if (!this.db) return;

    // Income Hub table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS income_hub (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        monthly_dividend_income REAL NOT NULL,
        gross_monthly REAL NOT NULL,
        tax_owed REAL NOT NULL,
        net_monthly REAL NOT NULL,
        monthly_expenses REAL NOT NULL,
        available_to_reinvest REAL NOT NULL,
        above_zero_line BOOLEAN NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Performance Hub table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS performance_hub (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        portfolio_value REAL NOT NULL,
        spy_price REAL NOT NULL,
        total_return REAL NOT NULL,
        dividend_yield REAL NOT NULL,
        monthly_dividends REAL NOT NULL,
        yearly_dividends REAL NOT NULL,
        spy_comparison REAL NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Portfolio Strategy Hub table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS portfolio_strategy_hub (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        holdings_json TEXT NOT NULL,
        sector_allocation_json TEXT NOT NULL,
        risk_metrics_json TEXT NOT NULL,
        strategies_json TEXT NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tax Strategy Hub table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tax_strategy_hub (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        current_location TEXT NOT NULL,
        tax_rate REAL NOT NULL,
        strategies_json TEXT NOT NULL,
        potential_savings REAL NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Financial Planning Hub table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS financial_planning_hub (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fire_targets_json TEXT NOT NULL,
        milestones_json TEXT NOT NULL,
        projections_json TEXT NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Expense milestones table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS expense_milestones (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        monthly_amount REAL NOT NULL,
        covered BOOLEAN NOT NULL,
        priority INTEGER NOT NULL
      )
    `);

    // Portfolio holdings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS portfolio_holdings (
        symbol TEXT PRIMARY KEY,
        shares REAL NOT NULL,
        avg_cost REAL NOT NULL,
        current_price REAL NOT NULL,
        dividend_yield REAL NOT NULL,
        annual_dividend REAL NOT NULL,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    logger.log('Super Cards database tables created successfully');
  }

  // Helper method to get current user (for now, get first user)
  private async getCurrentUser() {
    try {
      const user = await this.prisma.user.findFirst();
      return user;
    } catch (error) {
      logger.error('Error fetching current user:', error);
      return null;
    }
  }

  // Income Hub methods - now uses real Prisma data
  async getIncomeHubData(): Promise<IncomeHubData | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        logger.warn('No user found for Income Hub data');
        return this.getDefaultIncomeHubData();
      }

      // Get real income and expense data
      const [incomes, expenses, holdings] = await Promise.all([
        this.prisma.income.findMany({ where: { userId: user.id } }),
        this.prisma.expense.findMany({ where: { userId: user.id } }),
        this.prisma.holding.findMany({
          where: { portfolio: { userId: user.id } },
          include: { portfolio: true }
        })
      ]);

      // Calculate monthly dividend income from holdings
      const monthlyDividendIncome = holdings.reduce((sum, holding) => {
        const value = holding.shares * (holding.currentPrice || 0);
        const annualDividend = value * ((holding.dividendYield || 0) / 100);
        return sum + (annualDividend / 12);
      }, 0);

      // Calculate monthly values
      const monthlyIncomes = incomes
        .filter(income => income.frequency === 'MONTHLY' || !income.frequency)
        .reduce((sum, income) => sum + income.amount, 0);
      
      const monthlyExpenses = expenses
        .filter(expense => expense.frequency === 'MONTHLY' || !expense.frequency)
        .reduce((sum, expense) => sum + expense.amount, 0);

      // Get tax profile for tax calculations
      const taxProfile = await this.prisma.taxProfile.findFirst({ where: { userId: user.id } });
      const effectiveTaxRate = taxProfile?.effectiveRate || 0.22;
      
      const grossMonthly = monthlyIncomes + monthlyDividendIncome;
      const taxOwed = grossMonthly * effectiveTaxRate;
      const netMonthly = grossMonthly - taxOwed;
      const availableToReinvest = netMonthly - monthlyExpenses;
      const aboveZeroLine = availableToReinvest > 0;

      // Create expense milestones from recent expenses
      const expenseMilestones: ExpenseMilestone[] = [
        {
          id: 'housing',
          category: 'Housing',
          monthlyAmount: expenses.filter(e => e.category === 'RENT').reduce((sum, e) => sum + e.amount, 0),
          covered: monthlyDividendIncome > 500,
          priority: 1
        },
        {
          id: 'utilities',
          category: 'Utilities', 
          monthlyAmount: expenses.filter(e => e.category === 'UTILITIES').reduce((sum, e) => sum + e.amount, 0),
          covered: monthlyDividendIncome > 200,
          priority: 2
        },
        {
          id: 'food',
          category: 'Food',
          monthlyAmount: expenses.filter(e => e.category === 'FOOD').reduce((sum, e) => sum + e.amount, 0),
          covered: monthlyDividendIncome > 400,
          priority: 3
        }
      ];

      return {
        id: 1,
        monthlyDividendIncome,
        grossMonthly,
        taxOwed,
        netMonthly,
        monthlyExpenses,
        availableToReinvest,
        aboveZeroLine,
        expenseMilestones,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error fetching Income Hub data:', error);
      return this.getDefaultIncomeHubData();
    }
  }

  private getDefaultIncomeHubData(): IncomeHubData {
    return {
      id: 1,
      monthlyDividendIncome: 0,
      grossMonthly: 0,
      taxOwed: 0,
      netMonthly: 0,
      monthlyExpenses: 0,
      availableToReinvest: 0,
      aboveZeroLine: false,
      expenseMilestones: [],
      lastUpdated: new Date()
    };
  }

  async updateIncomeHubData(data: Partial<IncomeHubData>): Promise<boolean> {
    if (!this.db || !this.initialized) return false;

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO income_hub (
          id, monthly_dividend_income, gross_monthly, tax_owed, net_monthly,
          monthly_expenses, available_to_reinvest, above_zero_line, last_updated
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run(
        data.monthlyDividendIncome || 0,
        data.grossMonthly || 0,
        data.taxOwed || 0,
        data.netMonthly || 0,
        data.monthlyExpenses || 0,
        data.availableToReinvest || 0,
        data.aboveZeroLine ? 1 : 0
      );

      return true;
    } catch (error) {
      logger.error('Error updating Income Hub data:', error);
      return false;
    }
  }

  // Performance Hub methods - now uses real Prisma data
  async getPerformanceHubData(): Promise<PerformanceHubData | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        logger.warn('No user found for Performance Hub data');
        return this.getDefaultPerformanceHubData();
      }

      // Get real holdings data
      const holdings = await this.prisma.holding.findMany({
        where: { portfolio: { userId: user.id } },
        include: { portfolio: true }
      });

      if (holdings.length === 0) {
        return this.getDefaultPerformanceHubData();
      }

      // Calculate portfolio metrics
      let portfolioValue = 0;
      let totalCostBasis = 0;
      let monthlyDividends = 0;
      let weightedYield = 0;

      const holdingsData: PortfolioHolding[] = holdings.map(holding => {
        const currentValue = holding.shares * (holding.currentPrice || 0);
        const costBasis = holding.shares * holding.costBasis;
        const annualDividend = currentValue * ((holding.dividendYield || 0) / 100);
        
        portfolioValue += currentValue;
        totalCostBasis += costBasis;
        monthlyDividends += annualDividend / 12;
        weightedYield += (holding.dividendYield || 0) * (currentValue / 1); // Will normalize later

        return {
          symbol: holding.ticker,
          shares: holding.shares,
          avgCost: holding.costBasis,
          currentPrice: holding.currentPrice || 0,
          dividendYield: holding.dividendYield || 0,
          annualDividend: annualDividend
        };
      });

      // Calculate weighted average dividend yield
      const dividendYield = portfolioValue > 0 ? weightedYield / portfolioValue * 100 : 0;
      const yearlyDividends = monthlyDividends * 12;
      const totalReturn = totalCostBasis > 0 ? ((portfolioValue - totalCostBasis) / totalCostBasis) * 100 : 0;
      
      // Mock SPY data (in production, fetch from API)
      const spyPrice = 580.50; // Current SPY price
      const spyComparison = totalReturn - 12; // Assume SPY returned 12% this year

      return {
        id: 1,
        portfolioValue,
        spyPrice,
        totalReturn,
        dividendYield,
        monthlyDividends,
        yearlyDividends,
        spyComparison,
        holdings: holdingsData,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error fetching Performance Hub data:', error);
      return this.getDefaultPerformanceHubData();
    }
  }

  private getDefaultPerformanceHubData(): PerformanceHubData {
    return {
      id: 1,
      portfolioValue: 0,
      spyPrice: 580.50,
      totalReturn: 0,
      dividendYield: 0,
      monthlyDividends: 0,
      yearlyDividends: 0,
      spyComparison: 0,
      holdings: [],
      lastUpdated: new Date()
    };
  }

  async updatePerformanceHubData(data: Partial<PerformanceHubData>): Promise<boolean> {
    if (!this.db || !this.initialized) return false;

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO performance_hub (
          id, portfolio_value, spy_price, total_return, dividend_yield,
          monthly_dividends, yearly_dividends, spy_comparison, last_updated
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run(
        data.portfolioValue || 0,
        data.spyPrice || 0,
        data.totalReturn || 0,
        data.dividendYield || 0,
        data.monthlyDividends || 0,
        data.yearlyDividends || 0,
        data.spyComparison || 0
      );

      return true;
    } catch (error) {
      logger.error('Error updating Performance Hub data:', error);
      return false;
    }
  }

  // Portfolio Strategy Hub methods - now uses real Prisma data
  async getPortfolioStrategyHubData(): Promise<PortfolioStrategyHubData | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        logger.warn('No user found for Portfolio Strategy Hub data');
        return this.getDefaultPortfolioStrategyHubData();
      }

      // Get real holdings data
      const holdings = await this.prisma.holding.findMany({
        where: { portfolio: { userId: user.id } },
        include: { portfolio: true }
      });

      if (holdings.length === 0) {
        return this.getDefaultPortfolioStrategyHubData();
      }

      // Transform holdings
      const holdingsData: PortfolioHolding[] = holdings.map(holding => ({
        symbol: holding.ticker,
        shares: holding.shares,
        avgCost: holding.costBasis,
        currentPrice: holding.currentPrice || 0,
        dividendYield: holding.dividendYield || 0,
        annualDividend: holding.shares * (holding.currentPrice || 0) * ((holding.dividendYield || 0) / 100)
      }));

      // Calculate sector allocation
      const sectorMap = new Map<string, number>();
      let totalValue = 0;

      holdings.forEach(holding => {
        const value = holding.shares * (holding.currentPrice || 0);
        const sector = holding.sector || 'Other';
        sectorMap.set(sector, (sectorMap.get(sector) || 0) + value);
        totalValue += value;
      });

      const sectorAllocation: SectorAllocation[] = Array.from(sectorMap.entries()).map(([sector, value]) => ({
        sector,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
        value
      }));

      // Calculate real risk metrics using historical data service
      let riskMetrics: RiskMetrics = {
        beta: 1.0, // Fallback beta
        volatility: 15.5, // Fallback volatility percentage
        sharpeRatio: 1.2, // Fallback Sharpe ratio
        maxDrawdown: 12.3 // Fallback max drawdown percentage
      };

      try {
        // Import and use historical data service for real risk calculations
        const { historicalDataService } = await import('@/lib/services/historical/historical-data.service');
        const realRiskMetrics = await historicalDataService.calculateRiskMetrics(user.id, '1Y');
        
        riskMetrics = {
          beta: realRiskMetrics.beta,
          volatility: realRiskMetrics.volatility,
          sharpeRatio: realRiskMetrics.sharpeRatio,
          maxDrawdown: realRiskMetrics.maxDrawdown
        };
      } catch (error) {
        logger.warn('Failed to calculate real risk metrics, using fallback values:', error);
      }

      // Define default strategies
      const strategies: Strategy[] = [
        {
          id: 'dividend-growth',
          name: 'Dividend Growth Strategy',
          description: 'Focus on companies with consistent dividend growth',
          status: 'active'
        },
        {
          id: 'sector-diversification',
          name: 'Sector Diversification',
          description: 'Maintain balanced exposure across different sectors',
          status: sectorAllocation.length > 3 ? 'active' : 'pending'
        },
        {
          id: 'rebalancing',
          name: 'Quarterly Rebalancing',
          description: 'Rebalance portfolio every quarter to maintain target allocation',
          status: 'pending'
        }
      ];

      return {
        id: 1,
        holdings: holdingsData,
        sectorAllocation,
        riskMetrics,
        strategies,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error fetching Portfolio Strategy Hub data:', error);
      return this.getDefaultPortfolioStrategyHubData();
    }
  }

  private getDefaultPortfolioStrategyHubData(): PortfolioStrategyHubData {
    return {
      id: 1,
      holdings: [],
      sectorAllocation: [],
      riskMetrics: {
        beta: 1.0,
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0
      },
      strategies: [],
      lastUpdated: new Date()
    };
  }

  // Tax Strategy Hub methods - now uses real Prisma data
  async getTaxStrategyHubData(): Promise<TaxStrategyHubData | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        logger.warn('No user found for Tax Strategy Hub data');
        return this.getDefaultTaxStrategyHubData();
      }

      // Get tax profile
      const taxProfile = await this.prisma.taxProfile.findFirst({ where: { userId: user.id } });
      
      const currentLocation = taxProfile?.state || 'Unknown';
      const taxRate = taxProfile?.effectiveRate || 0.22;
      const marginalRate = taxProfile?.marginalRate || 0.24;
      const stateTaxRate = taxProfile?.stateBracket || 0.05;

      // Calculate potential tax savings strategies
      const holdings = await this.prisma.holding.findMany({
        where: { portfolio: { userId: user.id } },
        include: { portfolio: true }
      });

      const portfolioValue = holdings.reduce((sum, h) => sum + (h.shares * (h.currentPrice || 0)), 0);
      const annualDividends = holdings.reduce((sum, h) => {
        const value = h.shares * (h.currentPrice || 0);
        return sum + (value * ((h.dividendYield || 0) / 100));
      }, 0);

      // Define tax strategies with calculated potential savings
      const strategies: TaxStrategy[] = [
        {
          id: 'tax-loss-harvesting',
          name: 'Tax Loss Harvesting',
          description: 'Realize losses to offset capital gains',
          potentialSavings: portfolioValue * 0.02 * marginalRate, // Assume 2% loss harvesting opportunity
          complexity: 'medium'
        },
        {
          id: 'asset-location',
          name: 'Asset Location Optimization',
          description: 'Place tax-inefficient investments in tax-advantaged accounts',
          potentialSavings: annualDividends * (marginalRate - 0.15), // Difference between ordinary and qualified dividend rates
          complexity: 'low'
        },
        {
          id: 'roth-conversion',
          name: 'Roth IRA Conversion',
          description: 'Convert traditional IRA funds to Roth during low-income years',
          potentialSavings: portfolioValue * 0.01 * 0.12, // Estimated long-term tax savings
          complexity: 'high'
        },
        {
          id: 'charitable-giving',
          name: 'Charitable Giving Strategy',
          description: 'Donate appreciated securities for tax deductions',
          potentialSavings: portfolioValue * 0.005 * marginalRate, // Assume 0.5% charitable giving
          complexity: 'medium'
        }
      ];

      const potentialSavings = strategies.reduce((sum, strategy) => sum + strategy.potentialSavings, 0);

      return {
        id: 1,
        currentLocation,
        taxRate,
        strategies,
        potentialSavings,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error fetching Tax Strategy Hub data:', error);
      return this.getDefaultTaxStrategyHubData();
    }
  }

  private getDefaultTaxStrategyHubData(): TaxStrategyHubData {
    return {
      id: 1,
      currentLocation: 'United States',
      taxRate: 0.22,
      strategies: [
        {
          id: 'setup-required',
          name: 'Tax Setup Required',
          description: 'Complete your tax profile to see personalized strategies',
          potentialSavings: 0,
          complexity: 'low'
        }
      ],
      potentialSavings: 0,
      lastUpdated: new Date()
    };
  }

  // Financial Planning Hub methods - now uses real Prisma data
  async getFinancialPlanningHubData(): Promise<FinancialPlanningHubData | null> {
    try {
      const user = await this.getCurrentUser();
      if (!user) {
        logger.warn('No user found for Financial Planning Hub data');
        return this.getDefaultFinancialPlanningHubData();
      }

      // Get current portfolio value and expenses
      const [holdings, expenses, goals] = await Promise.all([
        this.prisma.holding.findMany({
          where: { portfolio: { userId: user.id } },
          include: { portfolio: true }
        }),
        this.prisma.expense.findMany({ where: { userId: user.id } }),
        this.prisma.financialGoal.findMany({ where: { userId: user.id, isActive: true } })
      ]);

      const portfolioValue = holdings.reduce((sum, h) => sum + (h.shares * (h.currentPrice || 0)), 0);
      const monthlyExpenses = expenses
        .filter(expense => expense.frequency === 'MONTHLY' || !expense.frequency)
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      const annualExpenses = monthlyExpenses * 12;

      // Calculate FIRE targets using the 25x rule and variations
      const fireTargets: FIRETarget[] = [
        {
          id: 'lean-fire',
          type: 'lean',
          targetAmount: annualExpenses * 20, // 20x expenses for lean FIRE
          monthlyNeeded: (annualExpenses * 20 - portfolioValue) / 12 / 30, // Assume 30 years to target
          yearsToTarget: portfolioValue > 0 ? Math.max(1, (annualExpenses * 20 - portfolioValue) / (portfolioValue * 0.07)) : 30
        },
        {
          id: 'traditional-fire',
          type: 'fat',
          targetAmount: annualExpenses * 25, // Traditional 25x rule
          monthlyNeeded: (annualExpenses * 25 - portfolioValue) / 12 / 25,
          yearsToTarget: portfolioValue > 0 ? Math.max(1, (annualExpenses * 25 - portfolioValue) / (portfolioValue * 0.07)) : 25
        },
        {
          id: 'fat-fire',
          type: 'fat',
          targetAmount: annualExpenses * 30, // Fat FIRE with buffer
          monthlyNeeded: (annualExpenses * 30 - portfolioValue) / 12 / 20,
          yearsToTarget: portfolioValue > 0 ? Math.max(1, (annualExpenses * 30 - portfolioValue) / (portfolioValue * 0.07)) : 20
        },
        {
          id: 'coast-fire',
          type: 'coast',
          targetAmount: annualExpenses * 25, // Same as traditional but calculated differently
          monthlyNeeded: 0, // Coast FIRE means no additional contributions needed
          yearsToTarget: portfolioValue > 0 ? Math.log(annualExpenses * 25 / portfolioValue) / Math.log(1.07) : 40
        }
      ];

      // Create milestones based on current portfolio value
      const milestones: Milestone[] = [
        {
          id: 'first-10k',
          name: 'First $10,000',
          targetValue: 10000,
          currentValue: portfolioValue,
          percentage: Math.min(100, (portfolioValue / 10000) * 100),
          completed: portfolioValue >= 10000
        },
        {
          id: 'first-100k',
          name: 'First $100,000',
          targetValue: 100000,
          currentValue: portfolioValue,
          percentage: Math.min(100, (portfolioValue / 100000) * 100),
          completed: portfolioValue >= 100000
        },
        {
          id: 'first-500k',
          name: 'First $500,000',
          targetValue: 500000,
          currentValue: portfolioValue,
          percentage: Math.min(100, (portfolioValue / 500000) * 100),
          completed: portfolioValue >= 500000
        },
        {
          id: 'first-million',
          name: 'First Million',
          targetValue: 1000000,
          currentValue: portfolioValue,
          percentage: Math.min(100, (portfolioValue / 1000000) * 100),
          completed: portfolioValue >= 1000000
        }
      ];

      // Generate 10-year projections
      const projections: FinancialProjection[] = [];
      const currentYear = new Date().getFullYear();
      const annualReturn = 0.07; // 7% assumed annual return
      const monthlyContribution = Math.max(0, portfolioValue * 0.1 / 12); // Assume 10% of portfolio value as annual contribution

      let projectedValue = portfolioValue;
      for (let i = 0; i <= 10; i++) {
        const annualDividends = projectedValue * 0.03; // Assume 3% dividend yield
        projections.push({
          year: currentYear + i,
          portfolioValue: projectedValue,
          annualDividends,
          reinvestmentAmount: monthlyContribution * 12
        });
        
        // Project next year: current value * (1 + return) + annual contributions
        projectedValue = projectedValue * (1 + annualReturn) + (monthlyContribution * 12);
      }

      return {
        id: 1,
        fireTargets,
        milestones,
        projections,
        lastUpdated: new Date()
      };
    } catch (error) {
      logger.error('Error fetching Financial Planning Hub data:', error);
      return this.getDefaultFinancialPlanningHubData();
    }
  }

  private getDefaultFinancialPlanningHubData(): FinancialPlanningHubData {
    return {
      id: 1,
      fireTargets: [
        {
          id: 'setup-required',
          type: 'lean',
          targetAmount: 500000,
          monthlyNeeded: 1000,
          yearsToTarget: 25
        }
      ],
      milestones: [
        {
          id: 'getting-started',
          name: 'Getting Started',
          targetValue: 1000,
          currentValue: 0,
          percentage: 0,
          completed: false
        }
      ],
      projections: [],
      lastUpdated: new Date()
    };
  }

  async updatePortfolioStrategyHubData(data: Partial<PortfolioStrategyHubData>): Promise<boolean> {
    if (!this.db || !this.initialized) return false;

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO portfolio_strategy_hub (
          id, holdings_json, sector_allocation_json, risk_metrics_json, strategies_json, last_updated
        ) VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run(
        JSON.stringify(data.holdings || []),
        JSON.stringify(data.sectorAllocation || []),
        JSON.stringify(data.riskMetrics || {}),
        JSON.stringify(data.strategies || [])
      );

      return true;
    } catch (error) {
      logger.error('Error updating Portfolio Strategy Hub data:', error);
      return false;
    }
  }

  async updateFinancialPlanningHubData(data: Partial<FinancialPlanningHubData>): Promise<boolean> {
    if (!this.db || !this.initialized) return false;

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO financial_planning_hub (
          id, fire_targets_json, milestones_json, projections_json, last_updated
        ) VALUES (1, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run(
        JSON.stringify(data.fireTargets || []),
        JSON.stringify(data.milestones || []),
        JSON.stringify(data.projections || [])
      );

      return true;
    } catch (error) {
      logger.error('Error updating Financial Planning Hub data:', error);
      return false;
    }
  }

  async initializeWithSampleData(): Promise<boolean> {
    // This method provides fallback initialization
    // Since sample data was removed, this just ensures tables exist
    try {
      this.createTables();
      return true;
    } catch (error) {
      logger.error('Error initializing with sample data:', error);
      return false;
    }
  }

  // Portfolio holdings methods
  async getPortfolioHoldings(): Promise<PortfolioHolding[]> {
    if (!this.db || !this.initialized) return [];

    try {
      const stmt = this.db.prepare('SELECT * FROM portfolio_holdings ORDER BY symbol ASC');
      const rows = stmt.all() as any[];

      return rows.map(row => ({
        symbol: row.symbol,
        shares: row.shares,
        avgCost: row.avg_cost,
        currentPrice: row.current_price,
        dividendYield: row.dividend_yield,
        annualDividend: row.annual_dividend
      }));
    } catch (error) {
      logger.error('Error fetching portfolio holdings:', error);
      return [];
    }
  }

  async updatePortfolioHolding(holding: PortfolioHolding): Promise<boolean> {
    if (!this.db || !this.initialized) return false;

    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO portfolio_holdings (
          symbol, shares, avg_cost, current_price, dividend_yield,
          annual_dividend, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `);

      stmt.run(
        holding.symbol,
        holding.shares,
        holding.avgCost,
        holding.currentPrice,
        holding.dividendYield,
        holding.annualDividend
      );

      return true;
    } catch (error) {
      logger.error('Error updating portfolio holding:', error);
      return false;
    }
  }

  // Utility methods removed - no more sample data initialization
  // The application now requires real user data to function properly

  async closeConnection(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initialized = false;
    }
    await this.prisma.$disconnect();
  }
}

// Singleton instance
export const superCardsDatabase = new SuperCardsDatabaseService();

// Export the service class for testing
export default SuperCardsDatabaseService;