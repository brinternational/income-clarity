import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger'

// SQLite-based expenses service
export const expensesService = {
  async getExpenses(userId: string): Promise<any[]> {
    try {
      const expenses = await prisma.expense.findMany({
        where: { userId },
        orderBy: { date: 'desc' }
      });
      return expenses;
    } catch (error) {
      logger.error('Error fetching expenses:', error);
      return [];
    }
  },
  
  async createExpense(userId: string, expense: any): Promise<any> {
    try {
      const newExpense = await prisma.expense.create({
        data: {
          userId,
          category: expense.category,
          merchant: expense.merchant,
          amount: expense.amount,
          date: new Date(expense.date),
          recurring: expense.recurring || false,
          frequency: expense.frequency,
          priority: expense.priority || 5,
          essential: expense.essential !== false,
          notes: expense.notes,
          metadata: expense.metadata ? JSON.stringify(expense.metadata) : null
        }
      });
      return newExpense;
    } catch (error) {
      logger.error('Error creating expense:', error);
      throw new Error('Failed to create expense');
    }
  },
  
  async updateExpense(userId: string, id: string, updates: any): Promise<any> {
    try {
      const updatedExpense = await prisma.expense.update({
        where: { id, userId },
        data: {
          ...updates,
          date: updates.date ? new Date(updates.date) : undefined,
          metadata: updates.metadata ? JSON.stringify(updates.metadata) : undefined
        }
      });
      return updatedExpense;
    } catch (error) {
      logger.error('Error updating expense:', error);
      throw new Error('Expense not found');
    }
  },
  
  async deleteExpense(userId: string, id: string): Promise<void> {
    try {
      await prisma.expense.delete({
        where: { id, userId }
      });
    } catch (error) {
      logger.error('Error deleting expense:', error);
      throw new Error('Failed to delete expense');
    }
  }
};

// SQLite-based portfolio service
export const portfolioService = {
  async getPortfolio(userId: string): Promise<any> {
    try {
      const portfolio = await prisma.portfolio.findFirst({
        where: { userId, isPrimary: true },
        include: { holdings: true }
      });
      return portfolio;
    } catch (error) {
      logger.error('Error fetching portfolio:', error);
      return null;
    }
  },
  
  async updatePortfolio(userId: string, portfolio: any): Promise<any> {
    try {
      const updatedPortfolio = await prisma.portfolio.update({
        where: { id: portfolio.id, userId },
        data: {
          name: portfolio.name,
          type: portfolio.type,
          institution: portfolio.institution,
          isPrimary: portfolio.isPrimary
        }
      });
      return updatedPortfolio;
    } catch (error) {
      logger.error('Error updating portfolio:', error);
      throw new Error('Portfolio not found');
    }
  },
  
  async getHoldings(userId: string): Promise<any[]> {
    try {
      const holdings = await prisma.holding.findMany({
        where: {
          portfolio: {
            userId
          }
        },
        include: {
          portfolio: true
        },
        orderBy: { ticker: 'asc' }
      });
      return holdings;
    } catch (error) {
      logger.error('Error fetching holdings:', error);
      return [];
    }
  },
  
  async addHolding(userId: string, holding: any): Promise<any> {
    try {
      // Get or create a primary portfolio
      let portfolio = await prisma.portfolio.findFirst({
        where: { userId, isPrimary: true }
      });
      
      if (!portfolio) {
        portfolio = await prisma.portfolio.create({
          data: {
            userId,
            name: 'Primary Portfolio',
            type: 'Taxable',
            isPrimary: true
          }
        });
      }

      const newHolding = await prisma.holding.create({
        data: {
          portfolioId: portfolio.id,
          ticker: holding.ticker.toUpperCase(),
          shares: holding.shares,
          costBasis: holding.costBasis,
          purchaseDate: new Date(holding.purchaseDate),
          currentPrice: holding.currentPrice,
          dividendYield: holding.dividendYield,
          sector: holding.sector,
          metadata: holding.metadata ? JSON.stringify(holding.metadata) : null
        }
      });
      return newHolding;
    } catch (error) {
      logger.error('Error adding holding:', error);
      throw new Error('Failed to add holding');
    }
  },
  
  async updateHolding(userId: string, id: string, updates: any): Promise<any> {
    try {
      const updatedHolding = await prisma.holding.update({
        where: { 
          id,
          portfolio: {
            userId
          }
        },
        data: {
          ...updates,
          purchaseDate: updates.purchaseDate ? new Date(updates.purchaseDate) : undefined,
          metadata: updates.metadata ? JSON.stringify(updates.metadata) : undefined
        }
      });
      return updatedHolding;
    } catch (error) {
      logger.error('Error updating holding:', error);
      throw new Error('Holding not found');
    }
  },
  
  async deleteHolding(userId: string, id: string): Promise<void> {
    try {
      await prisma.holding.delete({
        where: { 
          id,
          portfolio: {
            userId
          }
        }
      });
    } catch (error) {
      logger.error('Error deleting holding:', error);
      throw new Error('Failed to delete holding');
    }
  }
};

// Export with both names for compatibility
export const portfoliosService = portfolioService;

// SQLite-based profiles service
export const profilesService = {
  async getProfile(userId: string): Promise<any> {
    try {
      const userSettings = await prisma.userSettings.findUnique({
        where: { userId }
      });
      
      const taxProfile = await prisma.taxProfile.findUnique({
        where: { userId }
      });

      return {
        userSettings,
        taxProfile
      };
    } catch (error) {
      logger.error('Error fetching profile:', error);
      return null;
    }
  },
  
  async updateProfile(userId: string, profile: any): Promise<any> {
    try {
      const { userSettings, taxProfile } = profile;
      
      let updatedUserSettings = null;
      let updatedTaxProfile = null;

      if (userSettings) {
        updatedUserSettings = await prisma.userSettings.upsert({
          where: { userId },
          update: {
            theme: userSettings.theme,
            currency: userSettings.currency,
            locale: userSettings.locale,
            timezone: userSettings.timezone,
            notifications: userSettings.notifications ? JSON.stringify(userSettings.notifications) : null,
            privacy: userSettings.privacy ? JSON.stringify(userSettings.privacy) : null,
            features: userSettings.features ? JSON.stringify(userSettings.features) : null
          },
          create: {
            userId,
            theme: userSettings.theme || 'light',
            currency: userSettings.currency || 'USD',
            locale: userSettings.locale || 'en-US',
            timezone: userSettings.timezone || 'America/New_York',
            notifications: userSettings.notifications ? JSON.stringify(userSettings.notifications) : null,
            privacy: userSettings.privacy ? JSON.stringify(userSettings.privacy) : null,
            features: userSettings.features ? JSON.stringify(userSettings.features) : null
          }
        });
      }

      if (taxProfile) {
        updatedTaxProfile = await prisma.taxProfile.upsert({
          where: { userId },
          update: {
            state: taxProfile.state,
            filingStatus: taxProfile.filingStatus,
            federalBracket: taxProfile.federalBracket,
            stateBracket: taxProfile.stateBracket,
            qualifiedDividendRate: taxProfile.qualifiedDividendRate,
            capitalGainsRate: taxProfile.capitalGainsRate,
            effectiveRate: taxProfile.effectiveRate,
            marginalRate: taxProfile.marginalRate,
            taxYear: taxProfile.taxYear
          },
          create: {
            userId,
            state: taxProfile.state,
            filingStatus: taxProfile.filingStatus || 'single',
            federalBracket: taxProfile.federalBracket || 0.22,
            stateBracket: taxProfile.stateBracket || 0.0,
            qualifiedDividendRate: taxProfile.qualifiedDividendRate || 0.15,
            capitalGainsRate: taxProfile.capitalGainsRate || 0.15,
            effectiveRate: taxProfile.effectiveRate || 0.22,
            marginalRate: taxProfile.marginalRate || 0.22,
            taxYear: taxProfile.taxYear || 2024
          }
        });
      }

      return {
        userSettings: updatedUserSettings,
        taxProfile: updatedTaxProfile
      };
    } catch (error) {
      logger.error('Error updating profile:', error);
      throw new Error('Failed to update profile');
    }
  }
};

// Export any other services that might be needed
export default {
  expensesService,
  portfolioService,
  portfoliosService
};