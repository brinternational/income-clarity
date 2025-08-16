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

  constructor() {
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

  // Income Hub methods
  async getIncomeHubData(): Promise<IncomeHubData | null> {
    if (!this.db || !this.initialized) return null;

    try {
      const stmt = this.db.prepare('SELECT * FROM income_hub ORDER BY last_updated DESC LIMIT 1');
      const row = stmt.get() as any;
      
      if (!row) return null;

      // Get expense milestones
      const milestonesStmt = this.db.prepare('SELECT * FROM expense_milestones ORDER BY priority ASC');
      const milestones = milestonesStmt.all() as ExpenseMilestone[];

      return {
        id: row.id,
        monthlyDividendIncome: row.monthly_dividend_income,
        grossMonthly: row.gross_monthly,
        taxOwed: row.tax_owed,
        netMonthly: row.net_monthly,
        monthlyExpenses: row.monthly_expenses,
        availableToReinvest: row.available_to_reinvest,
        aboveZeroLine: Boolean(row.above_zero_line),
        expenseMilestones: milestones,
        lastUpdated: new Date(row.last_updated)
      };
    } catch (error) {
      logger.error('Error fetching Income Hub data:', error);
      return null;
    }
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

  // Performance Hub methods
  async getPerformanceHubData(): Promise<PerformanceHubData | null> {
    if (!this.db || !this.initialized) return null;

    try {
      const stmt = this.db.prepare('SELECT * FROM performance_hub ORDER BY last_updated DESC LIMIT 1');
      const row = stmt.get() as any;
      
      if (!row) return null;

      return {
        id: row.id,
        portfolioValue: row.portfolio_value,
        spyPrice: row.spy_price,
        totalReturn: row.total_return,
        dividendYield: row.dividend_yield,
        monthlyDividends: row.monthly_dividends,
        yearlyDividends: row.yearly_dividends,
        spyComparison: row.spy_comparison,
        lastUpdated: new Date(row.last_updated)
      };
    } catch (error) {
      logger.error('Error fetching Performance Hub data:', error);
      return null;
    }
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

  // Portfolio Strategy Hub methods
  async getPortfolioStrategyHubData(): Promise<PortfolioStrategyHubData | null> {
    if (!this.db || !this.initialized) return null;

    try {
      const stmt = this.db.prepare('SELECT * FROM portfolio_strategy_hub ORDER BY last_updated DESC LIMIT 1');
      const row = stmt.get() as any;
      
      if (!row) return null;

      return {
        id: row.id,
        holdings: JSON.parse(row.holdings_json),
        sectorAllocation: JSON.parse(row.sector_allocation_json),
        riskMetrics: JSON.parse(row.risk_metrics_json),
        strategies: JSON.parse(row.strategies_json),
        lastUpdated: new Date(row.last_updated)
      };
    } catch (error) {
      logger.error('Error fetching Portfolio Strategy Hub data:', error);
      return null;
    }
  }

  // Tax Strategy Hub methods
  async getTaxStrategyHubData(): Promise<TaxStrategyHubData | null> {
    if (!this.db || !this.initialized) return null;

    try {
      const stmt = this.db.prepare('SELECT * FROM tax_strategy_hub ORDER BY last_updated DESC LIMIT 1');
      const row = stmt.get() as any;
      
      if (!row) return null;

      return {
        id: row.id,
        currentLocation: row.current_location,
        taxRate: row.tax_rate,
        strategies: JSON.parse(row.strategies_json),
        potentialSavings: row.potential_savings,
        lastUpdated: new Date(row.last_updated)
      };
    } catch (error) {
      logger.error('Error fetching Tax Strategy Hub data:', error);
      return null;
    }
  }

  // Financial Planning Hub methods
  async getFinancialPlanningHubData(): Promise<FinancialPlanningHubData | null> {
    if (!this.db || !this.initialized) return null;

    try {
      const stmt = this.db.prepare('SELECT * FROM financial_planning_hub ORDER BY last_updated DESC LIMIT 1');
      const row = stmt.get() as any;
      
      if (!row) return null;

      return {
        id: row.id,
        fireTargets: JSON.parse(row.fire_targets_json),
        milestones: JSON.parse(row.milestones_json),
        projections: JSON.parse(row.projections_json),
        lastUpdated: new Date(row.last_updated)
      };
    } catch (error) {
      logger.error('Error fetching Financial Planning Hub data:', error);
      return null;
    }
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
  }
}

// Singleton instance
export const superCardsDatabase = new SuperCardsDatabaseService();

// Export the service class for testing
export default SuperCardsDatabaseService;