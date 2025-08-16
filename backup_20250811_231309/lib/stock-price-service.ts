/**
 * Stock Price Service
 * Handles fetching real-time stock prices from Polygon.io API
 * Includes caching, error handling, and rate limiting
 * LOCAL_MODE: Uses mock stock price data when enabled
 */

import { cacheService } from './cache-service';
import { LocalModeUtils } from './config/local-mode';
import { localStorageAdapter } from './storage/local-storage-adapter';

export interface StockPriceData {
  ticker: string;
  price: number;
  currency: string;
  lastUpdated: string;
  source: string;
  changePercent?: number;
  change?: number;
  marketCap?: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
}

export interface StockPriceError {
  ticker: string;
  error: string;
  code: 'INVALID_TICKER' | 'API_ERROR' | 'RATE_LIMIT' | 'NETWORK_ERROR' | 'NOT_FOUND' | 'NO_DATA';
  retryAfter?: number;
}

class StockPriceService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly cacheKeyPrefix = 'stock-price:';

  constructor() {
    this.apiKey = process.env.POLYGON_API_KEY || process.env.STOCK_API_KEY || '';
    this.baseUrl = process.env.POLYGON_BASE_URL || 'https://api.polygon.io';
    
    if (!this.apiKey) {
      // console.warn('Stock price service: No API key configured. Set POLYGON_API_KEY environment variable.');
    }
  }

  /**
   * Get stock price with caching
   */
  async getStockPrice(ticker: string): Promise<StockPriceData | StockPriceError> {
    if (!ticker || typeof ticker !== 'string') {
      return {
        ticker: ticker || 'UNKNOWN',
        error: 'Invalid ticker symbol provided',
        code: 'INVALID_TICKER'
      };
    }

    const normalizedTicker = ticker.toUpperCase().trim();
    
    // Validate ticker format (1-5 uppercase letters)
    if (!/^[A-Z]{1,5}$/.test(normalizedTicker)) {
      return {
        ticker: normalizedTicker,
        error: 'Ticker must be 1-5 letters only',
        code: 'INVALID_TICKER'
      };
    }

    // LOCAL_MODE: Return mock stock price data
    if (LocalModeUtils.isEnabled()) {
      LocalModeUtils.log('Stock Price Service - LOCAL_MODE active', { ticker: normalizedTicker });
      
      const mockPrice = await localStorageAdapter.getStockPrice(normalizedTicker);
      
      if (!mockPrice) {
        return {
          ticker: normalizedTicker,
          error: 'Stock not found in mock data',
          code: 'NOT_FOUND'
        };
      }

      // Simulate API delay
      await LocalModeUtils.simulateDelay(100);

      return {
        ticker: normalizedTicker,
        price: mockPrice.price,
        currency: 'USD',
        lastUpdated: new Date().toISOString(),
        source: 'local_mock',
        changePercent: mockPrice.changePercent,
        change: mockPrice.change,
        volume: Math.floor(Math.random() * 1000000) + 500000, // Mock volume
        high: mockPrice.price * 1.02,
        low: mockPrice.price * 0.98,
        open: mockPrice.price - mockPrice.change
      };
    }

    // Check cache first
    const cacheKey = `${this.cacheKeyPrefix}${normalizedTicker}`;
    const cachedData = await cacheService.get<StockPriceData>(cacheKey);
    
    if (cachedData) {
      // console.log(`Cache hit for ${normalizedTicker}`);
      // return cachedData;
    }

    // If no API key, return error
    if (!this.apiKey) {
      return {
        ticker: normalizedTicker,
        error: 'Stock price service not configured. API key required.',
        code: 'API_ERROR'
      };
    }

    try {
      // console.log(`Fetching price for ${normalizedTicker} from Polygon.io`);
      // const data = await this.fetchFromPolygon(normalizedTicker);
      
      // Cache successful response
      await cacheService.set(cacheKey, data);
      
      return data;
    } catch (error) {
      // console.error(`Error fetching price for ${normalizedTicker}:`, error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Income-Clarity-App/1.0',
        'Authorization': `Bearer ${this.apiKey}`
      },
      // 10 second timeout
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Ticker ${ticker} not found`);
      }
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || '60';
        throw new Error(`Rate limit exceeded, retry after ${retryAfter}s`);
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Polygon API authentication failed: ${response.status}`);
      }
      if (response.status >= 500) {
        throw new Error(`Polygon API server error: ${response.status}`);
      }
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const responseData = await response.json();
    
    // Validate response structure
    if (!responseData || responseData.status !== 'OK' || !responseData.results || !Array.isArray(responseData.results)) {
      throw new Error('Invalid response structure from Polygon API');
    }

    if (responseData.results.length === 0) {
      throw new Error(`No price data available for ticker ${ticker}`);
    }

    const data = responseData.results[0];
    
    // Validate required price data
    if (!data || typeof data.c !== 'number') {
      throw new Error('Invalid price data from Polygon API');
    }

    // Calculate change percent if we have open and close prices
    const changePercent = data.o && data.c ? ((data.c - data.o) / data.o) * 100 : undefined;
    const change = data.o && data.c ? data.c - data.o : undefined;

    return {
      ticker: ticker.toUpperCase(),
      price: data.c, // Close price
      currency: 'USD',
      lastUpdated: new Date().toISOString(),
      source: 'Polygon.io',
      changePercent: changePercent,
      change: change,
      volume: data.v || undefined,
      high: data.h || undefined,
      low: data.l || undefined,
      open: data.o || undefined
    };
  }

  /**
   * Handle and categorize errors
   */
  private handleError(ticker: string, error: any): StockPriceError {
    const errorMessage = error?.message || 'Unknown error';
    
    if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return {
        ticker,
        error: `Ticker "${ticker}" not found. Please verify the symbol.`,
        code: 'NOT_FOUND'
      };
    }
    
    if (errorMessage.includes('Rate limit') || errorMessage.includes('429')) {
      const retryMatch = errorMessage.match(/retry after (\d+)/);
      return {
        ticker,
        error: 'API rate limit exceeded. Please try again in a moment.',
        code: 'RATE_LIMIT',
        retryAfter: retryMatch ? parseInt(retryMatch[1]) : 60
      };
    }
    
    if (errorMessage.includes('timeout') || errorMessage.includes('network')) {
      return {
        ticker,
        error: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR'
      };
    }
    
    if (errorMessage.includes('server error') || errorMessage.includes('500')) {
      return {
        ticker,
        error: 'Stock price service temporarily unavailable. Please try again later.',
        code: 'API_ERROR'
      };
    }

    if (errorMessage.includes('authentication failed') || errorMessage.includes('401') || errorMessage.includes('403')) {
      return {
        ticker,
        error: 'API authentication failed. Please check your API key.',
        code: 'API_ERROR'
      };
    }

    if (errorMessage.includes('No price data available')) {
      return {
        ticker,
        error: `No recent price data available for "${ticker}". It may not be a valid stock symbol or market is closed.`,
        code: 'NO_DATA'
      };
    }
    
    return {
      ticker,
      error: 'Failed to fetch stock price. Please try again.',
      code: 'API_ERROR'
    };
  }

  /**
   * Get multiple stock prices (batch operation)
   */
  async getMultipleStockPrices(tickers: string[]): Promise<(StockPriceData | StockPriceError)[]> {
    const promises = tickers.map(ticker => this.getStockPrice(ticker));
    return Promise.all(promises);
  }

  /**
   * Get service health and cache stats
   */
  async getServiceHealth() {
    return {
      hasApiKey: !!this.apiKey,
      apiProvider: 'Polygon.io',
      cacheStats: await cacheService.getStats(),
      endpoints: {
        previousDayAggregates: `${this.baseUrl}/v2/aggs/ticker/{symbol}/prev`,
        lastTrade: `${this.baseUrl}/v1/last/stocks/{symbol}`
      },
      rateLimit: '5 calls per minute (free tier)',
      documentation: 'https://polygon.io/docs'
    };
  }

  /**
   * Clear cache for specific ticker or all cache
   */
  async clearCache(ticker?: string): Promise<boolean> {
    if (ticker) {
      const cacheKey = `${this.cacheKeyPrefix}${ticker.toUpperCase()}`;
      return cacheService.delete(cacheKey);
    } else {
      await cacheService.clear();
      return true;
    }
  }
}

// Export singleton instance
export const stockPriceService = new StockPriceService();

// Export class for testing or custom instances
export { StockPriceService };