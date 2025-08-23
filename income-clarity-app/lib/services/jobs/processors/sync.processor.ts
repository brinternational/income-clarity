/**
 * Sync Job Processor
 * Handles all synchronization jobs with proper error handling and retry logic
 */

import { Job, Processor } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { syncOrchestrator, SyncType, SyncStatus } from '../../services/sync/sync-orchestrator.service';
import { logger } from '../../logger';
import { JOB_TYPES } from '../queue-config';

const prisma = new PrismaClient();

// Job data interfaces
interface BaseSyncJobData {
  userId: string;
  syncType: SyncType;
  metadata?: Record<string, any>;
  triggeredBy?: 'user' | 'system' | 'webhook' | 'cron';
  priority?: number;
}

interface YodleeSyncJobData extends BaseSyncJobData {
  forceRefresh?: boolean;
  accountIds?: string[];
  refreshOnly?: boolean;
}

interface StockPriceSyncJobData {
  symbols?: string[];
  forceUpdate?: boolean;
  batchSize?: number;
}

interface PortfolioRefreshJobData extends BaseSyncJobData {
  portfolioIds?: string[];
  recalculateAll?: boolean;
}

type SyncJobData = YodleeSyncJobData | StockPriceSyncJobData | PortfolioRefreshJobData;

/**
 * Main sync job processor
 */
export const syncProcessor: Processor<SyncJobData> = async (job: Job<SyncJobData>) => {
  const startTime = Date.now();
  let syncLogId: string | null = null;

  try {
    logger.info('Processing sync job', {
      jobId: job.id,
      jobName: job.name,
      attempt: job.attemptsMade + 1,
      maxAttempts: job.opts.attempts,
      data: job.data
    });

    // Update job progress
    await job.updateProgress(0);

    // Route to specific sync handler based on job type
    let result: any;
    
    switch (job.name) {
      case JOB_TYPES.SYNC.YODLEE_LOGIN:
      case JOB_TYPES.SYNC.YODLEE_MANUAL:
      case JOB_TYPES.SYNC.YODLEE_SCHEDULED:
      case JOB_TYPES.SYNC.YODLEE_WEBHOOK:
        result = await processYodleeSync(job);
        break;
        
      case JOB_TYPES.SYNC.STOCK_PRICES:
        result = await processStockPriceSync(job);
        break;
        
      case JOB_TYPES.SYNC.PORTFOLIO_REFRESH:
        result = await processPortfolioRefresh(job);
        break;
        
      default:
        throw new Error(`Unknown sync job type: ${job.name}`);
    }

    const duration = Date.now() - startTime;

    // Log successful completion
    logger.info('Sync job completed successfully', {
      jobId: job.id,
      jobName: job.name,
      duration,
      result: {
        success: result.success,
        itemsSynced: result.itemsSynced || 0,
        message: result.message
      }
    });

    // Update job progress to 100%
    await job.updateProgress(100);

    return {
      success: true,
      duration,
      ...result
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error('Sync job failed', {
      jobId: job.id,
      jobName: job.name,
      attempt: job.attemptsMade + 1,
      duration,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      data: job.data
    });

    // Determine if this is a retryable error
    const isRetryable = determineIfRetryable(error);
    
    if (!isRetryable) {
      // Mark job as permanently failed
      logger.error('Sync job marked as non-retryable', {
        jobId: job.id,
        errorType: error.name,
        errorMessage: error.message
      });
    }

    // Re-throw to let BullMQ handle retry logic
    throw error;
  }
};

/**
 * Process Yodlee synchronization jobs
 */
async function processYodleeSync(job: Job<YodleeSyncJobData>): Promise<{
  success: boolean;
  itemsSynced: number;
  message: string;
  syncLogId?: string;
}> {
  const { userId, syncType, metadata, forceRefresh, accountIds } = job.data;

  // Create sync log entry
  const syncLog = await prisma.syncLog.create({
    data: {
      userId,
      syncType,
      status: SyncStatus.IN_PROGRESS,
      startedAt: new Date(),
      metadata: metadata ? JSON.stringify(metadata) : null,
      jobId: job.id?.toString(),
    }
  });

  await job.updateProgress(10);

  try {
    // Determine sync type based on job name
    let actualSyncType: SyncType;
    switch (job.name) {
      case JOB_TYPES.SYNC.YODLEE_LOGIN:
        actualSyncType = SyncType.LOGIN;
        break;
      case JOB_TYPES.SYNC.YODLEE_MANUAL:
        actualSyncType = SyncType.MANUAL;
        break;
      case JOB_TYPES.SYNC.YODLEE_SCHEDULED:
        actualSyncType = SyncType.SCHEDULED;
        break;
      case JOB_TYPES.SYNC.YODLEE_WEBHOOK:
        actualSyncType = SyncType.WEBHOOK;
        break;
      default:
        actualSyncType = syncType;
    }

    await job.updateProgress(20);

    // Perform the actual sync
    const result = await syncOrchestrator.performSync(userId, actualSyncType, {
      forceRefresh,
      accountIds,
      jobId: job.id?.toString(),
      metadata
    });

    await job.updateProgress(90);

    if (result.success) {
      // Update sync log with success
      await prisma.syncLog.update({
        where: { id: syncLog.id },
        data: {
          status: SyncStatus.SUCCESS,
          completedAt: new Date(),
          itemsSynced: result.itemsSynced,
          duration: Date.now() - syncLog.startedAt.getTime()
        }
      });

      return {
        success: true,
        itemsSynced: result.itemsSynced || 0,
        message: `Successfully synced ${result.itemsSynced || 0} items`,
        syncLogId: syncLog.id
      };
    } else {
      throw new Error(`Sync failed: ${result.errors.join(', ')}`);
    }

  } catch (error) {
    // Update sync log with failure
    await prisma.syncLog.update({
      where: { id: syncLog.id },
      data: {
        status: SyncStatus.FAILED,
        completedAt: new Date(),
        errorMessage: error.message,
        duration: Date.now() - syncLog.startedAt.getTime()
      }
    });

    throw error;
  }
}

/**
 * Process stock price synchronization
 */
async function processStockPriceSync(job: Job<StockPriceSyncJobData>): Promise<{
  success: boolean;
  itemsSynced: number;
  message: string;
}> {
  const { symbols, forceUpdate, batchSize = 50 } = job.data;

  await job.updateProgress(10);

  try {
    // Get symbols to update (either provided or all active symbols)
    let symbolsToUpdate: string[];
    
    if (symbols && symbols.length > 0) {
      symbolsToUpdate = symbols;
    } else {
      // Get all unique symbols from active holdings
      const holdings = await prisma.holding.findMany({
        where: { isActive: true },
        select: { symbol: true },
        distinct: ['symbol']
      });
      symbolsToUpdate = holdings.map(h => h.symbol).filter(Boolean);
    }

    await job.updateProgress(20);

    if (symbolsToUpdate.length === 0) {
      return {
        success: true,
        itemsSynced: 0,
        message: 'No symbols to update'
      };
    }

    // Process symbols in batches
    let totalUpdated = 0;
    const batches = chunkArray(symbolsToUpdate, batchSize);
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const progress = 20 + (70 * (i / batches.length));
      await job.updateProgress(progress);

      try {
        // Import stock price service dynamically to avoid circular dependencies
        const { stockPriceService } = await import('../../services/stock-price.service');
        const updated = await stockPriceService.updatePricesBatch(batch, { forceUpdate });
        totalUpdated += updated;
        
        logger.info('Stock price batch updated', {
          jobId: job.id,
          batch: i + 1,
          total: batches.length,
          symbols: batch.length,
          updated
        });
        
      } catch (batchError) {
        logger.error('Stock price batch failed', {
          jobId: job.id,
          batch: i + 1,
          symbols: batch,
          error: batchError.message
        });
        // Continue with other batches
      }
    }

    await job.updateProgress(90);

    return {
      success: true,
      itemsSynced: totalUpdated,
      message: `Updated prices for ${totalUpdated} out of ${symbolsToUpdate.length} symbols`
    };

  } catch (error) {
    logger.error('Stock price sync failed', {
      jobId: job.id,
      error: error.message,
      symbols: symbols?.length || 'all'
    });
    throw error;
  }
}

/**
 * Process portfolio refresh jobs
 */
async function processPortfolioRefresh(job: Job<PortfolioRefreshJobData>): Promise<{
  success: boolean;
  itemsSynced: number;
  message: string;
}> {
  const { userId, portfolioIds, recalculateAll } = job.data;

  await job.updateProgress(10);

  try {
    // Get portfolios to refresh
    let portfoliosToRefresh;
    
    if (portfolioIds && portfolioIds.length > 0) {
      portfoliosToRefresh = await prisma.portfolio.findMany({
        where: {
          id: { in: portfolioIds },
          userId
        },
        include: {
          holdings: { where: { isActive: true } }
        }
      });
    } else {
      portfoliosToRefresh = await prisma.portfolio.findMany({
        where: { userId },
        include: {
          holdings: { where: { isActive: true } }
        }
      });
    }

    await job.updateProgress(20);

    if (portfoliosToRefresh.length === 0) {
      return {
        success: true,
        itemsSynced: 0,
        message: 'No portfolios to refresh'
      };
    }

    let totalRefreshed = 0;

    for (let i = 0; i < portfoliosToRefresh.length; i++) {
      const portfolio = portfoliosToRefresh[i];
      const progress = 20 + (70 * (i / portfoliosToRefresh.length));
      await job.updateProgress(progress);

      try {
        // Recalculate portfolio metrics
        await recalculatePortfolioMetrics(portfolio.id, recalculateAll);
        totalRefreshed++;
        
        logger.info('Portfolio refreshed', {
          jobId: job.id,
          portfolioId: portfolio.id,
          holdings: portfolio.holdings.length
        });
        
      } catch (portfolioError) {
        logger.error('Portfolio refresh failed', {
          jobId: job.id,
          portfolioId: portfolio.id,
          error: portfolioError.message
        });
        // Continue with other portfolios
      }
    }

    await job.updateProgress(90);

    return {
      success: true,
      itemsSynced: totalRefreshed,
      message: `Refreshed ${totalRefreshed} out of ${portfoliosToRefresh.length} portfolios`
    };

  } catch (error) {
    logger.error('Portfolio refresh failed', {
      jobId: job.id,
      error: error.message,
      userId,
      portfolioIds
    });
    throw error;
  }
}

/**
 * Recalculate portfolio metrics and performance
 */
async function recalculatePortfolioMetrics(portfolioId: string, recalculateAll = false): Promise<void> {
  // This would implement portfolio metric recalculation logic
  // For now, we'll implement a basic version
  
  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    include: {
      holdings: { where: { isActive: true } }
    }
  });

  if (!portfolio) {
    throw new Error(`Portfolio not found: ${portfolioId}`);
  }

  // Calculate total value and other metrics
  let totalValue = 0;
  let totalCost = 0;

  for (const holding of portfolio.holdings) {
    const holdingValue = holding.quantity * (holding.currentPrice || 0);
    const holdingCost = holding.quantity * (holding.averageCost || 0);
    
    totalValue += holdingValue;
    totalCost += holdingCost;
  }

  const totalGainLoss = totalValue - totalCost;
  const gainLossPercentage = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

  // Update portfolio with calculated metrics
  await prisma.portfolio.update({
    where: { id: portfolioId },
    data: {
      totalValue,
      totalCost,
      totalGainLoss,
      gainLossPercentage,
      lastCalculatedAt: new Date()
    }
  });
}

/**
 * Determine if an error is retryable
 */
function determineIfRetryable(error: Error): boolean {
  const nonRetryableErrors = [
    'Authentication failed',
    'Invalid user',
    'Permission denied',
    'Invalid account',
    'Malformed request'
  ];

  const retryableErrors = [
    'Network error',
    'Timeout',
    'Service unavailable',
    'Rate limit exceeded',
    'Database connection',
    'Temporary failure'
  ];

  // Check for explicitly non-retryable errors
  if (nonRetryableErrors.some(msg => error.message.toLowerCase().includes(msg.toLowerCase()))) {
    return false;
  }

  // Check for explicitly retryable errors
  if (retryableErrors.some(msg => error.message.toLowerCase().includes(msg.toLowerCase()))) {
    return true;
  }

  // Default to retryable for unknown errors
  return true;
}

/**
 * Utility function to chunk array into smaller arrays
 */
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// Export job data types for use in other modules
export type {
  BaseSyncJobData,
  YodleeSyncJobData,
  StockPriceSyncJobData,
  PortfolioRefreshJobData,
  SyncJobData
};