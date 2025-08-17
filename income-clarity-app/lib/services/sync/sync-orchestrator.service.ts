/**
 * Sync Orchestrator Service
 * Manages data synchronization between Yodlee and Income Clarity
 */

import { PrismaClient, DataSource } from '@prisma/client';
import { YodleeClient } from '../yodlee/yodlee-client.service';
import { YodleeDataMapper } from '../yodlee/yodlee-data-mapper.service';
import { subscriptionService } from '../subscription/subscription.service';
import { featureGate, Feature } from '../subscription/feature-gate.service';

const prisma = new PrismaClient();

export enum SyncType {
  LOGIN = 'LOGIN',
  SCHEDULED = 'SCHEDULED',
  MANUAL = 'MANUAL',
  WEBHOOK = 'WEBHOOK',
}

export enum SyncStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
}

interface SyncResult {
  success: boolean;
  itemsSynced: number;
  errors: string[];
  holdings?: number;
  transactions?: number;
  accounts?: number;
}

export class SyncOrchestrator {
  private yodleeClient: YodleeClient;
  private dataMapper: YodleeDataMapper;
  private rateLimitMap: Map<string, Date> = new Map();

  constructor() {
    this.yodleeClient = new YodleeClient();
    this.dataMapper = new YodleeDataMapper();
  }

  /**
   * Main sync entry point
   */
  async performSync(userId: string, syncType: SyncType): Promise<SyncResult> {
    const startTime = Date.now();
    
    // Check if user can sync
    if (!await this.canSync(userId, syncType)) {
      throw new Error('Sync not allowed: Rate limit or permission denied');
    }

    // Start sync log
    const syncLog = await this.startSyncLog(userId, syncType);

    try {
      // Check premium status
      await featureGate.requireFeature(userId, Feature.BANK_SYNC);

      // Get Yodlee connection
      const connection = await this.getYodleeConnection(userId);
      if (!connection) {
        throw new Error('No Yodlee connection found');
      }

      // Fetch data from Yodlee
      const yodleeData = await this.fetchYodleeData(connection);

      // Sync accounts
      const accountsResult = await this.syncAccounts(connection.id, yodleeData.accounts);

      // Sync holdings
      const holdingsResult = await this.syncHoldings(userId, yodleeData.holdings);

      // Sync transactions
      const transactionsResult = await this.syncTransactions(userId, yodleeData.transactions);

      // Update last sync time
      await this.updateLastSyncTime(connection.id);

      // Complete sync log
      const duration = Date.now() - startTime;
      await this.completeSyncLog(syncLog.id, SyncStatus.SUCCESS, {
        itemsSynced: accountsResult.count + holdingsResult.count + transactionsResult.count,
        duration,
      });

      return {
        success: true,
        itemsSynced: accountsResult.count + holdingsResult.count + transactionsResult.count,
        errors: [],
        accounts: accountsResult.count,
        holdings: holdingsResult.count,
        transactions: transactionsResult.count,
      };

    } catch (error) {
      // Log failure
      const duration = Date.now() - startTime;
      await this.completeSyncLog(syncLog.id, SyncStatus.FAILED, {
        errorMessage: error.message,
        duration,
      });

      return {
        success: false,
        itemsSynced: 0,
        errors: [error.message],
      };
    }
  }

  /**
   * Check if sync is allowed
   */
  private async canSync(userId: string, syncType: SyncType): Promise<boolean> {
    // Check premium status
    const isPremium = await subscriptionService.isPremiumUser(userId);
    if (!isPremium) return false;

    // Check rate limits based on sync type
    const lastSync = this.rateLimitMap.get(userId);
    if (!lastSync) {
      this.rateLimitMap.set(userId, new Date());
      return true;
    }

    const timeSinceLastSync = Date.now() - lastSync.getTime();
    const limits = {
      [SyncType.LOGIN]: 4 * 60 * 60 * 1000, // 4 hours
      [SyncType.MANUAL]: 60 * 60 * 1000, // 1 hour
      [SyncType.SCHEDULED]: 0, // No limit for scheduled
      [SyncType.WEBHOOK]: 0, // No limit for webhooks
    };

    if (timeSinceLastSync < limits[syncType]) {
      return false;
    }

    this.rateLimitMap.set(userId, new Date());
    return true;
  }

  /**
   * Start sync log entry
   */
  private async startSyncLog(userId: string, syncType: SyncType) {
    return await prisma.syncLog.create({
      data: {
        userId,
        syncType,
        status: SyncStatus.PENDING,
        startedAt: new Date(),
      },
    });
  }

  /**
   * Complete sync log entry
   */
  private async completeSyncLog(
    syncLogId: string,
    status: SyncStatus,
    data: {
      itemsSynced?: number;
      errorMessage?: string;
      duration?: number;
    }
  ) {
    return await prisma.syncLog.update({
      where: { id: syncLogId },
      data: {
        status,
        itemsSynced: data.itemsSynced || 0,
        errorMessage: data.errorMessage,
        duration: data.duration,
        completedAt: new Date(),
      },
    });
  }

  /**
   * Get user's Yodlee connection
   */
  private async getYodleeConnection(userId: string) {
    return await prisma.yodleeConnection.findUnique({
      where: { userId },
      include: { syncedAccounts: true },
    });
  }

  /**
   * Fetch data from Yodlee API
   */
  private async fetchYodleeData(connection: any) {
    // Get fresh access token
    const adminToken = await this.yodleeClient.authenticate();
    
    // In sandbox, use test user
    const userToken = process.env.NODE_ENV === 'production' 
      ? connection.accessToken 
      : adminToken;

    // Fetch accounts
    const accounts = await this.yodleeClient.getAccounts(userToken);

    // Fetch holdings for investment accounts
    const holdings = await this.yodleeClient.getHoldings(userToken);

    // Fetch recent transactions
    const fromDate = new Date();
    fromDate.setMonth(fromDate.getMonth() - 3); // Last 3 months
    const transactions = await this.yodleeClient.getTransactions(
      userToken,
      fromDate.toISOString().split('T')[0]
    );

    return {
      accounts,
      holdings,
      transactions,
    };
  }

  /**
   * Sync accounts to database
   */
  private async syncAccounts(connectionId: string, accounts: any[]) {
    let count = 0;

    for (const account of accounts) {
      await prisma.syncedAccount.upsert({
        where: { yodleeAccountId: account.id.toString() },
        create: {
          connectionId,
          yodleeAccountId: account.id.toString(),
          accountName: account.accountName || account.nickname || 'Unknown',
          accountType: account.accountType || 'UNKNOWN',
          accountNumber: account.accountNumber?.slice(-4),
          balance: account.balance?.amount || 0,
          currency: account.balance?.currency || 'USD',
          institution: account.providerName,
          lastRefreshed: new Date(account.lastUpdated || Date.now()),
          isActive: account.accountStatus === 'ACTIVE',
        },
        update: {
          accountName: account.accountName || account.nickname || 'Unknown',
          balance: account.balance?.amount || 0,
          lastRefreshed: new Date(account.lastUpdated || Date.now()),
          isActive: account.accountStatus === 'ACTIVE',
        },
      });
      count++;
    }

    return { count };
  }

  /**
   * Sync holdings to database
   */
  private async syncHoldings(userId: string, holdings: any[]) {
    let count = 0;

    // Get user's portfolios
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
    });

    if (portfolios.length === 0) {
      // Create default portfolio for Yodlee data
      const portfolio = await prisma.portfolio.create({
        data: {
          userId,
          name: 'Yodlee Synced Portfolio',
          type: 'Taxable',
          institution: 'Yodlee',
        },
      });
      portfolios.push(portfolio);
    }

    const defaultPortfolio = portfolios[0];

    for (const holding of holdings) {
      const ticker = holding.symbol || holding.cusipNumber || `UNKNOWN_${holding.id}`;
      
      // Check if holding exists (manual entry)
      const existingHolding = await prisma.holding.findUnique({
        where: {
          portfolioId_ticker: {
            portfolioId: defaultPortfolio.id,
            ticker,
          },
        },
      });

      if (existingHolding && existingHolding.dataSource === DataSource.MANUAL) {
        // Mark for reconciliation
        await prisma.holding.update({
          where: { id: existingHolding.id },
          data: {
            isReconciled: false,
            yodleeAccountId: holding.accountId?.toString(),
          },
        });
      } else {
        // Create or update Yodlee holding
        await prisma.holding.upsert({
          where: {
            portfolioId_ticker: {
              portfolioId: defaultPortfolio.id,
              ticker,
            },
          },
          create: {
            portfolioId: defaultPortfolio.id,
            ticker,
            name: holding.description || holding.securityName,
            shares: holding.quantity || 0,
            costBasis: holding.costBasis?.amount,
            currentPrice: holding.price?.amount,
            dataSource: DataSource.YODLEE,
            yodleeAccountId: holding.accountId?.toString(),
            lastSyncedAt: new Date(),
            sector: this.mapSector(holding.securityType),
            metadata: JSON.stringify(holding),
          },
          update: {
            shares: holding.quantity || 0,
            currentPrice: holding.price?.amount,
            lastSyncedAt: new Date(),
            metadata: JSON.stringify(holding),
          },
        });
      }
      count++;
    }

    return { count };
  }

  /**
   * Sync transactions to database
   */
  private async syncTransactions(userId: string, transactions: any[]) {
    let incomeCount = 0;
    let expenseCount = 0;

    for (const transaction of transactions) {
      const amount = Math.abs(transaction.amount?.amount || 0);
      const date = new Date(transaction.transactionDate || transaction.date);
      
      // Categorize transaction
      const isDividend = this.isDividendTransaction(transaction);
      const isIncome = transaction.baseType === 'CREDIT' || isDividend;

      if (isIncome) {
        // Sync as income
        await prisma.income.create({
          data: {
            userId,
            source: transaction.merchant?.name || transaction.description || 'Unknown',
            category: isDividend ? 'DIVIDEND' : 'OTHER',
            amount,
            date,
            description: transaction.description,
            dataSource: DataSource.YODLEE,
            yodleeAccountId: transaction.accountId?.toString(),
            yodleeTransactionId: transaction.id?.toString(),
            lastSyncedAt: new Date(),
            metadata: JSON.stringify(transaction),
          },
        });
        incomeCount++;
      } else {
        // Sync as expense
        await prisma.expense.create({
          data: {
            userId,
            category: this.mapExpenseCategory(transaction.category),
            merchant: transaction.merchant?.name,
            amount,
            date,
            description: transaction.description,
            dataSource: DataSource.YODLEE,
            yodleeAccountId: transaction.accountId?.toString(),
            yodleeTransactionId: transaction.id?.toString(),
            lastSyncedAt: new Date(),
            metadata: JSON.stringify(transaction),
          },
        });
        expenseCount++;
      }
    }

    return { count: incomeCount + expenseCount, incomeCount, expenseCount };
  }

  /**
   * Update last sync time
   */
  private async updateLastSyncTime(connectionId: string) {
    await prisma.yodleeConnection.update({
      where: { id: connectionId },
      data: { lastSyncedAt: new Date() },
    });
  }

  /**
   * Map Yodlee security type to sector
   */
  private mapSector(securityType: string): string {
    const sectorMap: Record<string, string> = {
      'EQUITY': 'Technology',
      'ETF': 'Diversified',
      'MUTUAL_FUND': 'Diversified',
      'BOND': 'Fixed Income',
      'CD': 'Fixed Income',
      'OPTION': 'Derivatives',
    };
    return sectorMap[securityType] || 'Other';
  }

  /**
   * Check if transaction is a dividend
   */
  private isDividendTransaction(transaction: any): boolean {
    const description = (transaction.description || '').toLowerCase();
    const category = (transaction.category || '').toLowerCase();
    
    return (
      description.includes('dividend') ||
      description.includes('div') ||
      category.includes('dividend') ||
      transaction.subType === 'DIVIDEND'
    );
  }

  /**
   * Map Yodlee category to expense category
   */
  private mapExpenseCategory(yodleeCategory: string): string {
    const categoryMap: Record<string, string> = {
      'Food and Dining': 'FOOD',
      'Bills & Utilities': 'UTILITIES',
      'Shopping': 'ENTERTAINMENT',
      'Transportation': 'TRANSPORTATION',
      'Healthcare': 'HEALTHCARE',
      'Insurance': 'INSURANCE',
      'Home': 'RENT',
    };
    return categoryMap[yodleeCategory] || 'OTHER';
  }

  /**
   * Trigger login sync if needed
   */
  async syncOnLogin(userId: string): Promise<void> {
    const connection = await this.getYodleeConnection(userId);
    if (!connection) return;

    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    if (!connection.lastSyncedAt || connection.lastSyncedAt < fourHoursAgo) {
      // Run sync in background
      this.performSync(userId, SyncType.LOGIN).catch(console.error);
    }
  }

  /**
   * Get sync status for UI
   */
  async getSyncStatus(userId: string): Promise<{
    isEnabled: boolean;
    lastSync?: Date;
    nextSync?: Date;
    isSyncing: boolean;
    accountsConnected: number;
  }> {
    const connection = await this.getYodleeConnection(userId);
    
    if (!connection) {
      return {
        isEnabled: false,
        isSyncing: false,
        accountsConnected: 0,
      };
    }

    // Check if currently syncing
    const activeSyncLog = await prisma.syncLog.findFirst({
      where: {
        userId,
        status: { in: [SyncStatus.PENDING, SyncStatus.IN_PROGRESS] },
      },
      orderBy: { startedAt: 'desc' },
    });

    // Calculate next sync time
    const nextSync = connection.lastSyncedAt
      ? new Date(connection.lastSyncedAt.getTime() + 24 * 60 * 60 * 1000) // Daily
      : undefined;

    return {
      isEnabled: true,
      lastSync: connection.lastSyncedAt || undefined,
      nextSync,
      isSyncing: !!activeSyncLog,
      accountsConnected: connection.syncedAccounts.length,
    };
  }
}

// Export singleton instance
export const syncOrchestrator = new SyncOrchestrator();