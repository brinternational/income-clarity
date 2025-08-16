// Stock Price Service - Polygon.io Integration
import { cache } from 'react';
import { logger } from '@/lib/logger';

interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  timestamp: Date;
}

interface PolygonResponse {
  status: string;
  results?: Array<{
    c: number;  // close price
    o: number;  // open price
    h: number;  // high price
    l: number;  // low price
    v: number;  // volume
    t: number;  // timestamp
  }>;
  error?: string;
}

// Cache duration: 5 minutes for stock prices
const CACHE_DURATION = 5 * 60 * 1000;
const priceCache = new Map<string, { data: StockPrice; timestamp: number }>();

class StockPriceService {
  private apiKey: string;
  private baseUrl = 'https://api.polygon.io';
  private isPolygonAvailable: boolean = false;

  constructor() {
    this.apiKey = process.env.POLYGON_API_KEY || '';
    this.isPolygonAvailable = !!this.apiKey;
    
    if (!this.apiKey) {
      logger.warn('⚠️ POLYGON_API_KEY not configured - stock prices will be simulated');
    } else {
      logger.log('✅ Polygon API configured - using real stock prices');
    }
  }

  // Check if Polygon API is available and working
  async testApiConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    if (!this.apiKey) {
      return {
        success: false,
        message: 'API key not configured'
      };
    }

    try {
      const startTime = Date.now();
      const testUrl = `${this.baseUrl}/v2/aggs/ticker/SPY/prev?apiKey=${this.apiKey}`;
      const response = await fetch(testUrl);
      const latency = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'OK' && data.results?.[0]) {
          this.isPolygonAvailable = true;
          return {
            success: true,
            message: 'API connection successful',
            latency
          };
        }
      }
      
      this.isPolygonAvailable = false;
      return {
        success: false,
        message: `API request failed: ${response.status}`
      };
    } catch (error) {
      this.isPolygonAvailable = false;
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Get health status of the service
  getHealthStatus(): {
    apiConfigured: boolean;
    apiAvailable: boolean;
    dataSource: 'polygon' | 'simulated';
    cacheSize: number;
  } {
    return {
      apiConfigured: !!this.apiKey,
      apiAvailable: this.isPolygonAvailable,
      dataSource: this.isPolygonAvailable ? 'polygon' : 'simulated',
      cacheSize: priceCache.size
    };
  }

  // Get current stock price (uses previous day's close)
  async getStockPrice(symbol: string): Promise<StockPrice> {
    // Check cache first
    const cached = priceCache.get(symbol);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    // If no API key, return simulated data
    if (!this.apiKey) {
      return this.getSimulatedPrice(symbol);
    }

    try {
      // Fetch previous day's data from Polygon
      const url = `${this.baseUrl}/v2/aggs/ticker/${symbol}/prev?apiKey=${this.apiKey}`;
      const response = await fetch(url);
      const data: PolygonResponse = await response.json();

      if (data.status !== 'OK' || !data.results?.[0]) {
        logger.error(`Failed to fetch ${symbol}:`, data.error || 'No data');
        return this.getSimulatedPrice(symbol);
      }

      const result = data.results[0];
      const previousClose = result.o; // Use open as previous close
      const currentPrice = result.c;
      const change = currentPrice - previousClose;
      const changePercent = (change / previousClose) * 100;

      const stockPrice: StockPrice = {
        symbol,
        price: currentPrice,
        change,
        changePercent,
        previousClose,
        timestamp: new Date(result.t)
      };

      // Cache the result
      priceCache.set(symbol, { data: stockPrice, timestamp: Date.now() });
      return stockPrice;

    } catch (error) {
      logger.error(`Error fetching ${symbol} price:`, error);
      return this.getSimulatedPrice(symbol);
    }
  }

  // Get multiple stock prices
  async getMultipleStockPrices(symbols: string[]): Promise<Map<string, StockPrice>> {
    const prices = new Map<string, StockPrice>();
    
    // Fetch prices in parallel
    const promises = symbols.map(symbol => this.getStockPrice(symbol));
    const results = await Promise.all(promises);
    
    symbols.forEach((symbol, index) => {
      prices.set(symbol, results[index]);
    });
    
    return prices;
  }

  // Get SPY benchmark price
  async getSPYPrice(): Promise<StockPrice> {
    return this.getStockPrice('SPY');
  }

  // Calculate portfolio value based on holdings
  async calculatePortfolioValue(holdings: Array<{ symbol: string; shares: number }>): Promise<{
    totalValue: number;
    holdings: Array<{ symbol: string; shares: number; price: number; value: number }>;
  }> {
    const symbols = holdings.map(h => h.symbol);
    const prices = await this.getMultipleStockPrices(symbols);
    
    let totalValue = 0;
    const holdingsWithPrices = holdings.map(holding => {
      const price = prices.get(holding.symbol)?.price || 0;
      const value = holding.shares * price;
      totalValue += value;
      
      return {
        symbol: holding.symbol,
        shares: holding.shares,
        price,
        value
      };
    });
    
    return { totalValue, holdings: holdingsWithPrices };
  }

  // Simulated prices for when API is not available
  private getSimulatedPrice(symbol: string): StockPrice {
    const basePrices: Record<string, number> = {
      'SPY': 642.69,
      'QQQ': 540.50,
      'SCHD': 85.20,
      'VTI': 295.30,
      'VXUS': 65.40,
      'BND': 71.80,
      'VOO': 590.20,
      'IWM': 225.60,
      'VIG': 195.80,
      'VYM': 125.40
    };
    
    const basePrice = basePrices[symbol] || 100;
    // Add small random variation for realism
    const variation = (Math.random() - 0.5) * 0.02; // +/- 1%
    const price = basePrice * (1 + variation);
    const previousClose = basePrice;
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;
    
    return {
      symbol,
      price,
      change,
      changePercent,
      previousClose,
      timestamp: new Date()
    };
  }

  // Get dividend data from Polygon
  async getDividendData(symbol: string, startDate?: string, endDate?: string): Promise<{
    dividends: Array<{
      exDate: Date;
      paymentDate: Date;
      amount: number;
      frequency: number;
    }>;
    dataSource: 'polygon' | 'simulated';
  }> {
    if (!this.apiKey) {
      return {
        dividends: this.getSimulatedDividends(symbol),
        dataSource: 'simulated'
      };
    }

    try {
      // Use 1 year default range if no dates provided
      const endDateStr = endDate || new Date().toISOString().split('T')[0];
      const startDateStr = startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const url = `${this.baseUrl}/v3/reference/dividends?ticker=${symbol}&ex_dividend_date.gte=${startDateStr}&ex_dividend_date.lte=${endDateStr}&apiKey=${this.apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status !== 'OK' || !data.results) {
        logger.warn(`No dividend data for ${symbol}, using simulated data`);
        return {
          dividends: this.getSimulatedDividends(symbol),
          dataSource: 'simulated'
        };
      }

      const dividends = data.results.map((div: any) => ({
        exDate: new Date(div.ex_dividend_date),
        paymentDate: new Date(div.pay_date || div.ex_dividend_date),
        amount: div.cash_amount || 0,
        frequency: div.frequency || 4 // Default to quarterly
      }));

      return {
        dividends,
        dataSource: 'polygon'
      };

    } catch (error) {
      logger.error(`Error fetching dividend data for ${symbol}:`, error);
      return {
        dividends: this.getSimulatedDividends(symbol),
        dataSource: 'simulated'
      };
    }
  }

  // Simulate dividend data for fallback
  private getSimulatedDividends(symbol: string): Array<{
    exDate: Date;
    paymentDate: Date;
    amount: number;
    frequency: number;
  }> {
    const simulatedYields: Record<string, number> = {
      'SPY': 0.013,
      'QQQ': 0.007,
      'SCHD': 0.035,
      'VTI': 0.015,
      'VXUS': 0.025,
      'BND': 0.028,
      'VOO': 0.014,
      'VIG': 0.018,
      'VYM': 0.029
    };

    const annualYield = simulatedYields[symbol] || 0.02;
    const quarterlyAmount = (annualYield / 4) * 100; // Assuming $100 share price
    
    const dividends = [];
    for (let i = 0; i < 4; i++) {
      const exDate = new Date();
      exDate.setMonth(exDate.getMonth() - (3 * i));
      exDate.setDate(15); // Mid-month ex-dates
      
      const paymentDate = new Date(exDate);
      paymentDate.setDate(paymentDate.getDate() + 7); // Payment 7 days after ex-date
      
      dividends.push({
        exDate,
        paymentDate,
        amount: quarterlyAmount,
        frequency: 4
      });
    }

    return dividends.reverse(); // Return in chronological order
  }

  // Update holdings with real-time prices (for batch operations)
  async updateHoldingsPrices(holdings: Array<{ id: string; ticker: string; currentPrice?: number }>): Promise<{
    updated: number;
    errors: Array<{ ticker: string; error: string }>;
    dataSource: 'polygon' | 'simulated';
  }> {
    const symbols = holdings.map(h => h.ticker);
    const prices = await this.getMultipleStockPrices(symbols);
    
    let updated = 0;
    const errors: Array<{ ticker: string; error: string }> = [];
    
    // Here we would typically update the database
    // For now, we return the information needed for the caller to update
    
    holdings.forEach(holding => {
      const priceData = prices.get(holding.ticker);
      if (priceData) {
        updated++;
      } else {
        errors.push({
          ticker: holding.ticker,
          error: 'Price data not available'
        });
      }
    });

    return {
      updated,
      errors,
      dataSource: this.isPolygonAvailable ? 'polygon' : 'simulated'
    };
  }

  // Rate limit handling with exponential backoff
  private async handleRateLimit(): Promise<void> {
    const delay = Math.min(1000 * Math.pow(2, Math.floor(Math.random() * 4)), 8000);
    logger.warn(`Rate limit detected, backing off for ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Clear cache (useful for testing or forced refresh)
  clearCache(): void {
    priceCache.clear();
  }
}

// Export singleton instance
export const stockPriceService = new StockPriceService();

// Export cached version for React Server Components (conditionally)
const getStockPriceInternal = async (symbol: string) => {
  return stockPriceService.getStockPrice(symbol);
};

const getSPYPriceInternal = async () => {
  return stockPriceService.getSPYPrice();
};

const getMultipleStockPricesInternal = async (symbols: string[]) => {
  return stockPriceService.getMultipleStockPrices(symbols);
};

// Use cache only if available (not in test environment)
export const getStockPrice = typeof cache === 'function' 
  ? cache(getStockPriceInternal) 
  : getStockPriceInternal;

export const getSPYPrice = typeof cache === 'function' 
  ? cache(getSPYPriceInternal) 
  : getSPYPriceInternal;

export const getMultipleStockPrices = typeof cache === 'function' 
  ? cache(getMultipleStockPricesInternal) 
  : getMultipleStockPricesInternal;

export type { StockPrice };