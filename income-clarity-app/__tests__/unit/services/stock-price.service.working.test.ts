/**
 * Stock Price Service Tests - WORKING VERSION
 * 
 * This test file demonstrates the correct interface for the StockPriceService
 * and provides functional tests that actually pass.
 */

import { stockPriceService } from '@/lib/services/stock-price.service';

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Stock Price Service - Working Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    process.env.POLYGON_API_KEY = 'test-api-key';
  });

  afterEach(() => {
    // Restore environment
    process.env.POLYGON_API_KEY = 'test-api-key';
  });

  describe('getStockPrice', () => {
    it('fetches stock price successfully with API key', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          c: 160.00, // close price
          o: 158.00, // open
          t: Date.now() // timestamp
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await stockPriceService.getStockPrice('AAPL');

      expect(result).toHaveProperty('symbol', 'AAPL');
      expect(result).toHaveProperty('price');
      expect(result).toHaveProperty('change');
      expect(result).toHaveProperty('changePercent');
      expect(result).toHaveProperty('previousClose');
      expect(result).toHaveProperty('timestamp');
      expect(typeof result.price).toBe('number');
      expect(result.price).toBe(160.00);
    });

    it('handles missing API key with simulated data', async () => {
      delete process.env.POLYGON_API_KEY;
      
      const result = await stockPriceService.getStockPrice('AAPL');
      
      expect(result).toHaveProperty('symbol', 'AAPL');
      expect(result).toHaveProperty('price');
      expect(typeof result.price).toBe('number');
      expect(result.price).toBeGreaterThan(0);
    });

    it('handles API errors gracefully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Rate limit exceeded' })
      } as Response);

      // Should fall back to simulated data instead of throwing
      const result = await stockPriceService.getStockPrice('AAPL');
      
      expect(result).toHaveProperty('symbol', 'AAPL');
      expect(result).toHaveProperty('price');
      expect(typeof result.price).toBe('number');
    });

    it('handles network errors by falling back to simulated data', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await stockPriceService.getStockPrice('AAPL');

      expect(result).toHaveProperty('symbol', 'AAPL');
      expect(result).toHaveProperty('price');
      expect(typeof result.price).toBe('number');
    });
  });

  describe('getSPYPrice', () => {
    it('gets SPY price successfully', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          c: 420.00,
          o: 418.00,
          t: Date.now()
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await stockPriceService.getSPYPrice();

      expect(result).toHaveProperty('symbol', 'SPY');
      expect(result).toHaveProperty('price');
      expect(typeof result.price).toBe('number');
    });
  });

  describe('getMultipleStockPrices', () => {
    it('fetches multiple stock prices', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          c: 160.00,
          o: 158.00,
          t: Date.now()
        }]
      };

      // Mock responses for each symbol
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const symbols = ['AAPL', 'MSFT', 'SPY'];
      const result = await stockPriceService.getMultipleStockPrices(symbols);

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(symbols.length);
      
      symbols.forEach(symbol => {
        expect(result.has(symbol)).toBe(true);
        const stockPrice = result.get(symbol);
        expect(stockPrice).toHaveProperty('symbol', symbol);
        expect(stockPrice).toHaveProperty('price');
      });
    });
  });

  describe('calculatePortfolioValue', () => {
    it('calculates total portfolio value', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          c: 160.00,
          o: 158.00,
          t: Date.now()
        }]
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const holdings = [
        { symbol: 'AAPL', shares: 100 },
        { symbol: 'MSFT', shares: 50 }
      ];

      const result = await stockPriceService.calculatePortfolioValue(holdings);

      expect(result).toHaveProperty('totalValue');
      expect(result).toHaveProperty('holdings');
      expect(typeof result.totalValue).toBe('number');
      expect(result.totalValue).toBeGreaterThan(0);
      expect(Array.isArray(result.holdings)).toBe(true);
      expect(result.holdings).toHaveLength(2);
      
      result.holdings.forEach(holding => {
        expect(holding).toHaveProperty('symbol');
        expect(holding).toHaveProperty('shares');
        expect(holding).toHaveProperty('price');
        expect(holding).toHaveProperty('value');
      });
    });
  });

  describe('Caching', () => {
    beforeEach(() => {
      // Clear any existing cache
      stockPriceService.clearCache();
    });

    it('caches successful responses', async () => {
      const mockResponse = {
        status: 'OK',
        results: [{
          c: 160.00,
          o: 158.00,
          t: Date.now()
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      // First call
      await stockPriceService.getStockPrice('AAPL');
      expect(mockFetch).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await stockPriceService.getStockPrice('AAPL');
      expect(mockFetch).toHaveBeenCalledTimes(1); // Still only 1 call
    });
  });
});