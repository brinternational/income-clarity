/**
 * Historical Data Service
 * Provides real historical portfolio performance data using Polygon API
 * Replaces mock/hardcoded historical data with actual market data
 */

import { prisma } from '@/lib/db';
import { stockPriceService } from './stock/stock-price.service';
import { logger } from '@/lib/logger';

interface HistoricalDataPoint {
  date: Date;
  portfolioValue: number;
  costBasis: number;
  dailyChange: number;
  percentChange: number;
  spyPrice: number;
  spyReturn: number;
  outperformance: number;
}

interface RiskMetricsCalculation {
  beta: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  alpha: number;
  correlation: number;
  trackingError: number;
  informationRatio: number;
  dataPoints: number;
  confidence: number;
}

interface TimeRangeData {
  portfolioReturn: number;
  spyReturn: number;
  outperformance: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
}

export class HistoricalDataService {
  private readonly POLYGON_API_KEY = process.env.POLYGON_API_KEY;
  private readonly RISK_FREE_RATE = 0.05; // 5% Treasury rate - should be fetched from API
  
  /**
   * Fetch historical prices from Polygon API
   */
  async fetchHistoricalPrices(
    ticker: string, 
    fromDate: Date, 
    toDate: Date
  ): Promise<Array<{ date: Date; close: number; open: number; high: number; low: number; volume: number }>> {
    if (!this.POLYGON_API_KEY) {
      throw new Error('Polygon API key not configured');
    }

    try {
      const from = fromDate.toISOString().split('T')[0];
      const to = toDate.toISOString().split('T')[0];
      
      const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${from}/${to}?adjusted=true&sort=asc&apikey=${this.POLYGON_API_KEY}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status !== 'OK' || !data.results) {
        throw new Error(`Failed to fetch historical data for ${ticker}: ${data.error || 'No results'}`);
      }
      
      return data.results.map((result: any) => ({
        date: new Date(result.t),
        close: result.c,
        open: result.o,
        high: result.h,
        low: result.l,
        volume: result.v
      }));
    } catch (error) {
      logger.error(`Error fetching historical prices for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Store historical prices in database
   */
  async storeHistoricalPrices(
    ticker: string, 
    prices: Array<{ date: Date; close: number; open: number; high: number; low: number; volume: number }>
  ): Promise<void> {
    try {
      const historicalPrices = prices.map(price => ({
        ticker,
        date: price.date,
        close: price.close,
        open: price.open,
        high: price.high,
        low: price.low,
        volume: price.volume,
        changePercent: price.open > 0 ? ((price.close - price.open) / price.open) * 100 : 0,
        source: 'polygon'
      }));

      // Use upsert to handle duplicates
      for (const priceData of historicalPrices) {
        await prisma.historicalPrice.upsert({
          where: {
            ticker_date: {
              ticker: priceData.ticker,
              date: priceData.date
            }
          },
          update: {
            close: priceData.close,
            open: priceData.open,
            high: priceData.high,
            low: priceData.low,
            volume: priceData.volume,
            changePercent: priceData.changePercent
          },
          create: priceData
        });
      }

      logger.log(`Stored ${historicalPrices.length} historical prices for ${ticker}`);
    } catch (error) {
      logger.error(`Error storing historical prices for ${ticker}:`, error);
      throw error;
    }
  }

  /**
   * Calculate historical portfolio value using real price data
   */
  async calculateHistoricalPortfolioValue(
    userId: string,
    timeRange: '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | 'All' = '1Y'
  ): Promise<HistoricalDataPoint[]> {
    try {
      // Get user's holdings
      const holdings = await prisma.holding.findMany({
        where: {
          portfolio: { userId }
        },
        include: {
          portfolio: true
        }
      });

      if (holdings.length === 0) {
        return [];
      }

      // Calculate date range
      const endDate = new Date();
      const startDate = this.getStartDate(timeRange);
      
      // Get unique tickers
      const tickers = [...new Set(holdings.map(h => h.ticker)), 'SPY'];
      
      // Fetch historical data for all tickers
      const historicalDataPromises = tickers.map(ticker => 
        this.getHistoricalPricesFromDB(ticker, startDate, endDate)
      );
      
      const allHistoricalData = await Promise.all(historicalDataPromises);
      const historicalDataMap = new Map(
        tickers.map((ticker, index) => [ticker, allHistoricalData[index]])
      );

      // Get SPY data for comparison
      const spyData = historicalDataMap.get('SPY') || [];
      
      // Calculate portfolio value for each date
      const portfolioHistory: HistoricalDataPoint[] = [];
      const allDates = this.getAllTradingDates(startDate, endDate, spyData);
      
      let previousPortfolioValue = 0;
      let previousSpyPrice = 0;
      
      for (const date of allDates) {
        let portfolioValue = 0;
        let costBasis = 0;
        
        // Calculate portfolio value for this date
        for (const holding of holdings) {
          const tickerData = historicalDataMap.get(holding.ticker) || [];
          const priceOnDate = this.findPriceOnDate(tickerData, date);
          
          if (priceOnDate) {
            portfolioValue += holding.shares * priceOnDate.close;
            costBasis += holding.shares * (holding.costBasis || priceOnDate.close);
          }
        }
        
        // Get SPY price for this date
        const spyPriceData = this.findPriceOnDate(spyData, date);
        const spyPrice = spyPriceData?.close || previousSpyPrice;
        
        if (portfolioValue > 0 && spyPrice > 0) {
          const dailyChange = previousPortfolioValue > 0 ? portfolioValue - previousPortfolioValue : 0;
          const percentChange = previousPortfolioValue > 0 ? (dailyChange / previousPortfolioValue) * 100 : 0;
          const spyDailyReturn = previousSpyPrice > 0 ? ((spyPrice - previousSpyPrice) / previousSpyPrice) * 100 : 0;
          const outperformance = percentChange - spyDailyReturn;
          
          portfolioHistory.push({
            date,
            portfolioValue,
            costBasis,
            dailyChange,
            percentChange,
            spyPrice,
            spyReturn: spyDailyReturn,
            outperformance
          });
          
          previousPortfolioValue = portfolioValue;
          previousSpyPrice = spyPrice;
        }
      }
      
      logger.log(`Calculated ${portfolioHistory.length} historical data points for user ${userId}`);
      return portfolioHistory;
      
    } catch (error) {
      logger.error(`Error calculating historical portfolio value:`, error);
      throw error;
    }
  }

  /**
   * Calculate real risk metrics using historical data
   */
  async calculateRiskMetrics(
    userId: string,
    timeRange: '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' = '1Y'
  ): Promise<RiskMetricsCalculation> {
    try {
      const historicalData = await this.calculateHistoricalPortfolioValue(userId, timeRange);
      
      if (historicalData.length < 30) {
        throw new Error('Insufficient data points for risk calculations (minimum 30 required)');
      }
      
      // Calculate returns
      const portfolioReturns = historicalData.map(d => d.percentChange / 100);
      const spyReturns = historicalData.map(d => d.spyReturn / 100);
      const excessReturns = portfolioReturns.map((r, i) => r - spyReturns[i]);
      
      // Calculate volatility (standard deviation of returns)
      const volatility = this.calculateStandardDeviation(portfolioReturns) * Math.sqrt(252); // Annualized
      const spyVolatility = this.calculateStandardDeviation(spyReturns) * Math.sqrt(252);
      
      // Calculate beta (portfolio sensitivity to market)
      const beta = this.calculateBeta(portfolioReturns, spyReturns);
      
      // Calculate correlation with SPY
      const correlation = this.calculateCorrelation(portfolioReturns, spyReturns);
      
      // Calculate average returns for metrics
      const avgPortfolioReturn = this.calculateMean(portfolioReturns) * 252; // Annualized
      const avgSpyReturn = this.calculateMean(spyReturns) * 252;
      const avgExcessReturn = avgPortfolioReturn - this.RISK_FREE_RATE;
      
      // Calculate Sharpe ratio
      const sharpeRatio = volatility > 0 ? avgExcessReturn / volatility : 0;
      
      // Calculate alpha (excess return vs expected return based on CAPM)
      const expectedReturn = this.RISK_FREE_RATE + beta * (avgSpyReturn - this.RISK_FREE_RATE);
      const alpha = avgPortfolioReturn - expectedReturn;
      
      // Calculate tracking error
      const trackingError = this.calculateStandardDeviation(excessReturns) * Math.sqrt(252);
      
      // Calculate information ratio
      const informationRatio = trackingError > 0 ? (avgPortfolioReturn - avgSpyReturn) / trackingError : 0;
      
      // Calculate maximum drawdown
      const maxDrawdown = this.calculateMaxDrawdown(historicalData.map(d => d.portfolioValue));
      
      const riskMetrics: RiskMetricsCalculation = {
        beta,
        sharpeRatio,
        volatility: volatility * 100, // Convert to percentage
        maxDrawdown: maxDrawdown * 100, // Convert to percentage
        alpha: alpha * 100, // Convert to percentage
        correlation,
        trackingError: trackingError * 100, // Convert to percentage
        informationRatio,
        dataPoints: historicalData.length,
        confidence: historicalData.length >= 250 ? 0.95 : historicalData.length >= 100 ? 0.85 : 0.75
      };
      
      // Store calculated metrics in database
      await this.storeRiskMetrics(userId, riskMetrics, timeRange);
      
      return riskMetrics;
      
    } catch (error) {
      logger.error(`Error calculating risk metrics:`, error);
      throw error;
    }
  }

  /**
   * Get time period data with real calculations
   */
  async getTimeRangeData(userId: string): Promise<Record<string, TimeRangeData>> {
    const timeRanges: Array<'1M' | '3M' | '6M' | '1Y' | '2Y'> = ['1M', '3M', '6M', '1Y', '2Y'];
    const results: Record<string, TimeRangeData> = {};
    
    for (const range of timeRanges) {
      try {
        const historicalData = await this.calculateHistoricalPortfolioValue(userId, range);
        const riskMetrics = await this.calculateRiskMetrics(userId, range);
        
        if (historicalData.length > 0) {
          const firstValue = historicalData[0].portfolioValue;
          const lastValue = historicalData[historicalData.length - 1].portfolioValue;
          const portfolioReturn = firstValue > 0 ? ((lastValue - firstValue) / firstValue) : 0;
          
          // Calculate SPY return for same period
          const firstSpyPrice = historicalData[0].spyPrice;
          const lastSpyPrice = historicalData[historicalData.length - 1].spyPrice;
          const spyReturn = firstSpyPrice > 0 ? ((lastSpyPrice - firstSpyPrice) / firstSpyPrice) : 0;
          
          results[range] = {
            portfolioReturn,
            spyReturn,
            outperformance: portfolioReturn - spyReturn,
            volatility: riskMetrics.volatility,
            sharpeRatio: riskMetrics.sharpeRatio,
            maxDrawdown: riskMetrics.maxDrawdown
          };
        }
      } catch (error) {
        logger.error(`Error calculating ${range} time range data:`, error);
        // Provide fallback data
        results[range] = {
          portfolioReturn: 0,
          spyReturn: 0,
          outperformance: 0,
          volatility: 0,
          sharpeRatio: 0,
          maxDrawdown: 0
        };
      }
    }
    
    return results;
  }

  /**
   * Initialize historical data for a user's portfolio
   */
  async initializeHistoricalData(userId: string): Promise<void> {
    try {
      const holdings = await prisma.holding.findMany({
        where: {
          portfolio: { userId }
        }
      });
      
      if (holdings.length === 0) {
        logger.warn(`No holdings found for user ${userId}`);
        return;
      }
      
      const tickers = [...new Set(holdings.map(h => h.ticker)), 'SPY'];
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years
      
      // Fetch and store historical data for all tickers
      for (const ticker of tickers) {
        try {
          const prices = await this.fetchHistoricalPrices(ticker, startDate, endDate);
          await this.storeHistoricalPrices(ticker, prices);
          
          // Rate limiting - wait 200ms between requests
          await new Promise(resolve => setTimeout(resolve, 200));
        } catch (error) {
          logger.error(`Failed to initialize historical data for ${ticker}:`, error);
        }
      }
      
      logger.log(`Initialized historical data for ${tickers.length} tickers for user ${userId}`);
    } catch (error) {
      logger.error(`Error initializing historical data:`, error);
      throw error;
    }
  }

  // Helper methods
  private getStartDate(timeRange: string): Date {
    const endDate = new Date();
    const daysMap: Record<string, number> = {
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '2Y': 730,
      '5Y': 1825,
      'All': 3650 // 10 years max
    };
    
    const days = daysMap[timeRange] || 365;
    return new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);
  }

  private async getHistoricalPricesFromDB(ticker: string, startDate: Date, endDate: Date) {
    return await prisma.historicalPrice.findMany({
      where: {
        ticker,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });
  }

  private getAllTradingDates(startDate: Date, endDate: Date, spyData: any[]): Date[] {
    // Use SPY data to determine trading dates (excludes weekends/holidays)
    return spyData.map(d => d.date).filter(date => date >= startDate && date <= endDate);
  }

  private findPriceOnDate(priceData: any[], date: Date) {
    return priceData.find(p => p.date.toDateString() === date.toDateString());
  }

  private calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = this.calculateMean(values);
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = this.calculateMean(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
  }

  private calculateBeta(portfolioReturns: number[], marketReturns: number[]): number {
    const portfolioMean = this.calculateMean(portfolioReturns);
    const marketMean = this.calculateMean(marketReturns);
    
    let covariance = 0;
    let marketVariance = 0;
    
    for (let i = 0; i < portfolioReturns.length; i++) {
      covariance += (portfolioReturns[i] - portfolioMean) * (marketReturns[i] - marketMean);
      marketVariance += Math.pow(marketReturns[i] - marketMean, 2);
    }
    
    covariance /= portfolioReturns.length - 1;
    marketVariance /= marketReturns.length - 1;
    
    return marketVariance > 0 ? covariance / marketVariance : 0;
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    const xMean = this.calculateMean(x);
    const yMean = this.calculateMean(y);
    
    let numerator = 0;
    let xSumSquares = 0;
    let ySumSquares = 0;
    
    for (let i = 0; i < x.length; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      numerator += xDiff * yDiff;
      xSumSquares += xDiff * xDiff;
      ySumSquares += yDiff * yDiff;
    }
    
    const denominator = Math.sqrt(xSumSquares * ySumSquares);
    return denominator > 0 ? numerator / denominator : 0;
  }

  private calculateMaxDrawdown(values: number[]): number {
    let maxDrawdown = 0;
    let peak = values[0];
    
    for (const value of values) {
      if (value > peak) {
        peak = value;
      }
      
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    }
    
    return maxDrawdown;
  }

  private async storeRiskMetrics(userId: string, metrics: RiskMetricsCalculation, timeRange: string): Promise<void> {
    try {
      await prisma.riskMetrics.upsert({
        where: {
          userId_portfolioId_date_calculationPeriod: {
            userId,
            portfolioId: null, // Aggregated portfolio metrics
            date: new Date(),
            calculationPeriod: timeRange
          }
        },
        update: {
          beta: metrics.beta,
          sharpeRatio: metrics.sharpeRatio,
          volatility: metrics.volatility,
          maxDrawdown: metrics.maxDrawdown,
          alpha: metrics.alpha,
          correlation: metrics.correlation,
          trackingError: metrics.trackingError,
          informationRatio: metrics.informationRatio,
          dataPoints: metrics.dataPoints,
          confidence: metrics.confidence
        },
        create: {
          userId,
          portfolioId: null,
          date: new Date(),
          beta: metrics.beta,
          sharpeRatio: metrics.sharpeRatio,
          volatility: metrics.volatility,
          maxDrawdown: metrics.maxDrawdown,
          alpha: metrics.alpha,
          correlation: metrics.correlation,
          trackingError: metrics.trackingError,
          informationRatio: metrics.informationRatio,
          calculationPeriod: timeRange,
          dataPoints: metrics.dataPoints,
          confidence: metrics.confidence
        }
      });
    } catch (error) {
      logger.error('Error storing risk metrics:', error);
    }
  }
}

// Export singleton instance
export const historicalDataService = new HistoricalDataService();