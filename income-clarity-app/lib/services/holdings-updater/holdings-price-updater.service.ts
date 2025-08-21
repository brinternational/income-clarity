// Holdings Price Updater Service - Database Integration
import { prisma } from '@/lib/db';
import { stockPriceService } from '../stock/stock-price.service';
import { logger } from '@/lib/logger'

interface HoldingUpdate {
  id: string;
  ticker: string;
  currentPrice?: number;
  lastPriceUpdate?: Date;
}

interface UpdateResult {
  success: boolean;
  updated: number;
  errors: Array<{ ticker: string; holdingId: string; error: string }>;
  dataSource: 'polygon' | 'simulated';
  totalHoldings: number;
  skipped: number;
  executionTime: number;
}

class HoldingsPriceUpdaterService {
  private isUpdating = false;
  private lastUpdateTime: Date | null = null;
  private readonly UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes minimum between updates

  // Update all holdings with fresh prices
  async updateAllHoldingsPrices(forceUpdate: boolean = false): Promise<UpdateResult> {
    const startTime = Date.now();

    // Prevent concurrent updates
    if (this.isUpdating && !forceUpdate) {
      throw new Error('Price update already in progress. Use forceUpdate=true to override.');
    }

    // Rate limit checks (unless forced)
    if (!forceUpdate && this.lastUpdateTime) {
      const timeSinceLastUpdate = Date.now() - this.lastUpdateTime.getTime();
      if (timeSinceLastUpdate < this.UPDATE_INTERVAL) {
        const remainingTime = Math.ceil((this.UPDATE_INTERVAL - timeSinceLastUpdate) / 1000);
        throw new Error(`Please wait ${remainingTime} seconds before requesting another update.`);
      }
    }

    this.isUpdating = true;

    try {
      // Get all holdings from database
      const holdings = await prisma.holding.findMany({
        select: {
          id: true,
          ticker: true,
          currentPrice: true,
          updatedAt: true
        }
      });

      if (holdings.length === 0) {
        return {
          success: true,
          updated: 0,
          errors: [],
          dataSource: 'polygon',
          totalHoldings: 0,
          skipped: 0,
          executionTime: Date.now() - startTime
        };
      }

      // Group holdings by ticker to avoid duplicate API calls
      const tickerGroups = new Map<string, string[]>();
      holdings.forEach(holding => {
        if (!tickerGroups.has(holding.ticker)) {
          tickerGroups.set(holding.ticker, []);
        }
        tickerGroups.get(holding.ticker)!.push(holding.id);
      });

      const uniqueSymbols = Array.from(tickerGroups.keys());
      logger.log(`🔄 Updating prices for ${uniqueSymbols.length} unique symbols across ${holdings.length} holdings`);

      // Fetch fresh prices for all unique symbols
      const priceData = await stockPriceService.getMultipleStockPrices(uniqueSymbols);

      let updated = 0;
      let skipped = 0;
      const errors: Array<{ ticker: string; holdingId: string; error: string }> = [];

      // Update holdings in batches for better performance
      const batchSize = 10;
      const batches = [];

      for (let i = 0; i < holdings.length; i += batchSize) {
        batches.push(holdings.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        const updatePromises = batch.map(async (holding) => {
          const priceInfo = priceData.get(holding.ticker);

          if (!priceInfo) {
            errors.push({
              ticker: holding.ticker,
              holdingId: holding.id,
              error: 'Price data not available'
            });
            return false;
          }

          // Skip update if price hasn't changed and it's recent
          if (holding.currentPrice === priceInfo.price && 
              holding.updatedAt && 
              (Date.now() - holding.updatedAt.getTime() < 60 * 60 * 1000)) { // 1 hour
            skipped++;
            return false;
          }

          try {
            await prisma.holding.update({
              where: { id: holding.id },
              data: {
                currentPrice: priceInfo.price,
                updatedAt: new Date()
              }
            });
            return true;
          } catch (error) {
            errors.push({
              ticker: holding.ticker,
              holdingId: holding.id,
              error: error instanceof Error ? error.message : 'Database update failed'
            });
            return false;
          }
        });

        const batchResults = await Promise.all(updatePromises);
        updated += batchResults.filter(result => result).length;
      }

      // Update portfolio totals after price updates
      await this.updatePortfolioTotals();

      this.lastUpdateTime = new Date();
      const executionTime = Date.now() - startTime;

      logger.log(`✅ Price update completed: ${updated} updated, ${skipped} skipped, ${errors.length} errors (${executionTime}ms)`);

      return {
        success: true,
        updated,
        errors,
        dataSource: stockPriceService.getHealthStatus().dataSource,
        totalHoldings: holdings.length,
        skipped,
        executionTime
      };

    } catch (error) {
      logger.error('❌ Holdings price update failed:', error);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  // Update prices for specific portfolio
  async updatePortfolioHoldingsPrices(portfolioId: string): Promise<UpdateResult> {
    const startTime = Date.now();

    try {
      const holdings = await prisma.holding.findMany({
        where: { portfolioId },
        select: {
          id: true,
          ticker: true,
          currentPrice: true,
          updatedAt: true
        }
      });

      if (holdings.length === 0) {
        return {
          success: true,
          updated: 0,
          errors: [],
          dataSource: 'polygon',
          totalHoldings: 0,
          skipped: 0,
          executionTime: Date.now() - startTime
        };
      }

      const symbols = holdings.map(h => h.ticker);
      const priceData = await stockPriceService.getMultipleStockPrices(symbols);

      let updated = 0;
      let skipped = 0;
      const errors: Array<{ ticker: string; holdingId: string; error: string }> = [];

      for (const holding of holdings) {
        const priceInfo = priceData.get(holding.ticker);

        if (!priceInfo) {
          errors.push({
            ticker: holding.ticker,
            holdingId: holding.id,
            error: 'Price data not available'
          });
          continue;
        }

        // Skip if price is the same and recent
        if (holding.currentPrice === priceInfo.price && 
            holding.updatedAt && 
            (Date.now() - holding.updatedAt.getTime() < 30 * 60 * 1000)) { // 30 minutes
          skipped++;
          continue;
        }

        try {
          await prisma.holding.update({
            where: { id: holding.id },
            data: {
              currentPrice: priceInfo.price,
              updatedAt: new Date()
            }
          });
          updated++;
        } catch (error) {
          errors.push({
            ticker: holding.ticker,
            holdingId: holding.id,
            error: error instanceof Error ? error.message : 'Database update failed'
          });
        }
      }

      // Update this specific portfolio's totals
      await this.updatePortfolioTotals(portfolioId);

      return {
        success: true,
        updated,
        errors,
        dataSource: stockPriceService.getHealthStatus().dataSource,
        totalHoldings: holdings.length,
        skipped,
        executionTime: Date.now() - startTime
      };

    } catch (error) {
      logger.error(`❌ Portfolio ${portfolioId} price update failed:`, error);
      throw error;
    }
  }

  // Update portfolio calculated totals after price changes
  private async updatePortfolioTotals(portfolioId?: string): Promise<void> {
    try {
      const portfolios = portfolioId 
        ? await prisma.portfolio.findMany({ where: { id: portfolioId }, include: { holdings: true }})
        : await prisma.portfolio.findMany({ include: { holdings: true }});

      const updatePromises = portfolios.map(async (portfolio) => {
        let totalValue = 0;
        let totalCostBasis = 0;

        portfolio.holdings.forEach(holding => {
          const currentPrice = holding.currentPrice || holding.costBasis;
          const holdingValue = holding.shares * currentPrice;
          const holdingCostBasis = holding.shares * holding.costBasis;

          totalValue += holdingValue;
          totalCostBasis += holdingCostBasis;
        });

        const gainLoss = totalValue - totalCostBasis;
        const gainLossPercent = totalCostBasis > 0 ? (gainLoss / totalCostBasis) * 100 : 0;

        // Note: This assumes portfolio table has these calculated fields
        // You may need to adjust based on your actual schema
        return prisma.portfolio.update({
          where: { id: portfolio.id },
          data: {
            updatedAt: new Date()
            // Add totalValue, totalCostBasis, gainLoss, gainLossPercent if they exist in schema
          }
        });
      });

      await Promise.all(updatePromises);
    } catch (error) {
      logger.error('Error updating portfolio totals:', error);
      // Don't throw - this is a secondary operation
    }
  }

  // Get update status
  getUpdateStatus(): {
    isUpdating: boolean;
    lastUpdateTime: Date | null;
    nextUpdateAvailable: Date | null;
  } {
    const nextUpdateAvailable = this.lastUpdateTime 
      ? new Date(this.lastUpdateTime.getTime() + this.UPDATE_INTERVAL)
      : new Date();

    return {
      isUpdating: this.isUpdating,
      lastUpdateTime: this.lastUpdateTime,
      nextUpdateAvailable: nextUpdateAvailable > new Date() ? nextUpdateAvailable : new Date()
    };
  }

  // Manual refresh for specific holding
  async refreshHoldingPrice(holdingId: string): Promise<{
    success: boolean;
    holding?: any;
    error?: string;
  }> {
    try {
      const holding = await prisma.holding.findUnique({
        where: { id: holdingId }
      });

      if (!holding) {
        return {
          success: false,
          error: 'Holding not found'
        };
      }

      const priceData = await stockPriceService.getStockPrice(holding.ticker);

      const updatedHolding = await prisma.holding.update({
        where: { id: holdingId },
        data: {
          currentPrice: priceData.price,
          updatedAt: new Date()
        }
      });

      // Update portfolio totals
      await this.updatePortfolioTotals(holding.portfolioId);

      return {
        success: true,
        holding: {
          ...updatedHolding,
          priceChange: priceData.change,
          priceChangePercent: priceData.changePercent,
          dataSource: stockPriceService.getHealthStatus().dataSource
        }
      };

    } catch (error) {
      logger.error(`Error refreshing holding ${holdingId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Export singleton instance
export const holdingsPriceUpdaterService = new HoldingsPriceUpdaterService();
export type { UpdateResult };