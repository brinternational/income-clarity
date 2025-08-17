import { prisma } from '@/lib/prisma';
import { Logger } from '@/lib/logger';
import { yodleeClient } from './yodlee-client.service';
import { yodleeDataMapper } from './yodlee-data-mapper.service';
import { superCardsDatabase } from '../super-cards-db/super-cards-database.service';

const logger = new Logger('YodleeSyncService');

export class YodleeSyncService {
  /**
   * Sync all data for a user from Yodlee
   */
  async syncUserData(userId: string): Promise<void> {
    logger.info(`Starting sync for user ${userId}`);
    
    try {
      // Get Yodlee connection
      const connection = await prisma.yodleeConnection.findUnique({
        where: { userId },
      });

      if (!connection) {
        throw new Error('No Yodlee connection found for user');
      }

      // Get user token
      const userToken = await yodleeClient.getUserToken(connection.yodleeUserId);

      // Fetch latest data from Yodlee
      const [accounts, transactions, holdings] = await Promise.all([
        yodleeClient.getAccounts(userToken),
        yodleeClient.getTransactions(userToken, this.getDateRange().fromDate, this.getDateRange().toDate),
        yodleeClient.getHoldings(userToken),
      ]);

      logger.info(`Fetched ${accounts.length} accounts, ${transactions.length} transactions, ${holdings.length} holdings`);

      // Map data to our format
      const mappedAccounts = yodleeDataMapper.mapAccounts(accounts);
      const mappedTransactions = yodleeDataMapper.mapTransactions(transactions);
      const mappedHoldings = yodleeDataMapper.mapHoldings(holdings);

      // Update database
      await this.updateAccounts(connection.id, mappedAccounts);
      await this.updateTransactions(userId, mappedTransactions);
      await this.updateHoldings(userId, mappedHoldings);
      
      // Update portfolio metrics
      await this.updatePortfolioMetrics(userId, mappedHoldings);
      
      // Update income/expense data
      await this.updateIncomeExpenseData(userId, mappedTransactions);

      // Update last synced timestamp
      await prisma.yodleeConnection.update({
        where: { userId },
        data: { lastSyncedAt: new Date() },
      });

      logger.info(`Sync completed successfully for user ${userId}`);
    } catch (error) {
      logger.error(`Sync failed for user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Update synced accounts in database
   */
  private async updateAccounts(connectionId: string, accounts: any[]): Promise<void> {
    // Delete existing synced accounts
    await prisma.syncedAccount.deleteMany({
      where: { connectionId },
    });

    // Create new synced accounts
    await prisma.syncedAccount.createMany({
      data: accounts.map(account => ({
        connectionId,
        yodleeAccountId: account.yodleeAccountId,
        accountName: account.name,
        accountType: account.type.toUpperCase(),
        balance: account.balance,
        currency: account.currency,
        lastRefreshed: account.lastUpdated,
      })),
    });

    logger.info(`Updated ${accounts.length} accounts`);
  }

  /**
   * Update transactions in database
   */
  private async updateTransactions(userId: string, transactions: any[]): Promise<void> {
    // Get user's portfolio
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId },
    });

    if (!portfolio) {
      logger.warn('No portfolio found for user');
      return;
    }

    // Categorize transactions
    const incomeCategories = yodleeDataMapper.categorizeIncome(transactions);
    const expenseCategories = yodleeDataMapper.categorizeExpenses(transactions);

    // Update income records
    for (const transaction of transactions.filter(t => t.type === 'income')) {
      await prisma.income.upsert({
        where: {
          portfolioId_source_date: {
            portfolioId: portfolio.id,
            source: transaction.merchantName || 'Unknown',
            date: transaction.date,
          },
        },
        update: {
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
        },
        create: {
          portfolioId: portfolio.id,
          source: transaction.merchantName || 'Unknown',
          amount: transaction.amount,
          frequency: 'ONCE',
          category: transaction.category,
          date: transaction.date,
          description: transaction.description,
        },
      });
    }

    // Update expense records
    for (const transaction of transactions.filter(t => t.type === 'expense')) {
      await prisma.expense.upsert({
        where: {
          portfolioId_category_date: {
            portfolioId: portfolio.id,
            category: transaction.category,
            date: transaction.date,
          },
        },
        update: {
          amount: transaction.amount,
          description: transaction.description,
        },
        create: {
          portfolioId: portfolio.id,
          category: transaction.category,
          amount: transaction.amount,
          date: transaction.date,
          description: transaction.description,
        },
      });
    }

    logger.info(`Updated ${transactions.length} transactions`);
  }

  /**
   * Update investment holdings in database
   */
  private async updateHoldings(userId: string, holdings: any[]): Promise<void> {
    // Get user's portfolio
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId },
    });

    if (!portfolio) {
      logger.warn('No portfolio found for user');
      return;
    }

    // Group holdings by ticker
    const holdingsByTicker = holdings.reduce((acc, holding) => {
      if (!acc[holding.ticker]) {
        acc[holding.ticker] = {
          ticker: holding.ticker,
          name: holding.name,
          shares: 0,
          totalCost: 0,
          currentPrice: holding.currentPrice,
        };
      }
      acc[holding.ticker].shares += holding.shares;
      acc[holding.ticker].totalCost += holding.costBasis || 0;
      return acc;
    }, {} as Record<string, any>);

    // Update or create holdings
    for (const [ticker, data] of Object.entries(holdingsByTicker)) {
      const avgCost = data.totalCost / data.shares || 0;

      await prisma.holding.upsert({
        where: {
          portfolioId_ticker: {
            portfolioId: portfolio.id,
            ticker,
          },
        },
        update: {
          shares: data.shares,
          averageCost: avgCost,
          currentPrice: data.currentPrice,
          lastUpdated: new Date(),
        },
        create: {
          portfolioId: portfolio.id,
          ticker,
          name: data.name,
          shares: data.shares,
          averageCost: avgCost,
          currentPrice: data.currentPrice,
          sector: 'Technology', // Default, would need sector lookup service
          lastUpdated: new Date(),
        },
      });
    }

    logger.info(`Updated ${Object.keys(holdingsByTicker).length} holdings`);
  }

  /**
   * Update portfolio metrics
   */
  private async updatePortfolioMetrics(userId: string, holdings: any[]): Promise<void> {
    const metrics = yodleeDataMapper.calculatePortfolioMetrics(holdings);
    
    // Update portfolio with new metrics
    await prisma.portfolio.updateMany({
      where: { userId },
      data: {
        totalValue: metrics.totalValue,
        totalCost: metrics.totalCost,
        totalGain: metrics.totalGain,
        totalGainPercent: metrics.gainPercent,
        lastUpdated: new Date(),
      },
    });

    logger.info(`Updated portfolio metrics: Value=${metrics.totalValue}`);
  }

  /**
   * Update income and expense data
   */
  private async updateIncomeExpenseData(userId: string, transactions: any[]): Promise<void> {
    const incomeCategories = yodleeDataMapper.categorizeIncome(transactions);
    const expenseCategories = yodleeDataMapper.categorizeExpenses(transactions);

    // Store categorized data for Super Cards
    const portfolio = await prisma.portfolio.findFirst({
      where: { userId },
    });

    if (portfolio) {
      // Update portfolio with income/expense summaries
      await prisma.portfolio.update({
        where: { id: portfolio.id },
        data: {
          monthlyIncome: Object.values(incomeCategories).reduce((a, b) => a + b, 0) / 12,
          monthlyExpenses: Object.values(expenseCategories).reduce((a, b) => a + b, 0) / 12,
        },
      });
    }

    logger.info('Updated income/expense data');
  }

  /**
   * Get date range for transaction fetch (last 90 days)
   */
  private getDateRange(): { fromDate: string; toDate: string } {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 90);

    return {
      fromDate: fromDate.toISOString().split('T')[0],
      toDate: toDate.toISOString().split('T')[0],
    };
  }

  /**
   * Refresh specific account
   */
  async refreshAccount(userId: string, accountId: string): Promise<void> {
    logger.info(`Refreshing account ${accountId} for user ${userId}`);
    
    const connection = await prisma.yodleeConnection.findUnique({
      where: { userId },
    });

    if (!connection) {
      throw new Error('No Yodlee connection found');
    }

    const userToken = await yodleeClient.getUserToken(connection.yodleeUserId);
    await yodleeClient.refreshAccount(userToken, accountId);
    
    // Wait a bit for refresh to start, then check status
    setTimeout(async () => {
      const status = await yodleeClient.getRefreshStatus(userToken, accountId);
      logger.info(`Refresh status for account ${accountId}: ${JSON.stringify(status)}`);
    }, 5000);
  }

  /**
   * Check if user has Yodlee connection
   */
  async hasYodleeConnection(userId: string): Promise<boolean> {
    const connection = await prisma.yodleeConnection.findUnique({
      where: { userId },
    });
    return !!connection;
  }

  /**
   * Get last sync time
   */
  async getLastSyncTime(userId: string): Promise<Date | null> {
    const connection = await prisma.yodleeConnection.findUnique({
      where: { userId },
    });
    return connection?.lastSyncedAt || null;
  }
}

// Export singleton instance
export const yodleeSyncService = new YodleeSyncService();