/**
 * Stock Price API Route
 * GET /api/stock-price?ticker=AAPL
 * Returns current stock price data with caching
 * LOCAL_MODE: Returns mock stock price data
 */

import { NextRequest, NextResponse } from 'next/server';
import { stockPriceService, StockPriceData, StockPriceError } from '@/lib/stock-price-service';
import { LocalModeUtils } from '@/lib/config/local-mode';
import { localStorageAdapter } from '@/lib/storage/local-storage-adapter';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ticker = searchParams.get('ticker');

    // Validate ticker parameter
    if (!ticker) {
      return NextResponse.json(
        { 
          ticker: 'UNKNOWN',
          error: 'Ticker parameter is required',
          code: 'INVALID_TICKER'
        } as StockPriceError,
        { status: 400 }
      );
    }

    // LOCAL_MODE: Return mock stock price data
    if (LocalModeUtils.isEnabled()) {
      LocalModeUtils.log('Stock Price API - LOCAL_MODE active', { ticker });
      
      const mockPrice = await localStorageAdapter.getStockPrice(ticker.toUpperCase());
      
      if (!mockPrice) {
        return NextResponse.json(
          {
            ticker: ticker.toUpperCase(),
            error: 'Stock not found in mock data',
            code: 'NOT_FOUND'
          } as StockPriceError,
          { status: 404 }
        );
      }

      // Simulate slight delay for realism
      await LocalModeUtils.simulateDelay(100);

      const priceData: StockPriceData = {
        ticker: ticker.toUpperCase(),
        price: mockPrice.price,
        change: mockPrice.change,
        changePercent: mockPrice.changePercent,
        timestamp: new Date().toISOString(),
        source: 'local_mock',
        cached: false,
        volume: Math.floor(Math.random() * 1000000) + 500000, // Mock volume
        dayHigh: mockPrice.price * 1.02,
        dayLow: mockPrice.price * 0.98,
        previousClose: mockPrice.price - mockPrice.change
      };

      return NextResponse.json(priceData, {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=30', // Shorter cache for mock data
          'Content-Type': 'application/json',
          'X-Local-Mode': 'true'
        }
      });
    }

    // Get stock price from service
    const result = await stockPriceService.getStockPrice(ticker);

    // Check if it's an error result
    if ('error' in result) {
      const errorResult = result as StockPriceError;
      
      // Map error codes to HTTP status codes
      const statusCode = getStatusCodeForError(errorResult.code);
      
      return NextResponse.json(errorResult, { status: statusCode });
    }

    // Success - return stock price data
    const priceData = result as StockPriceData;
    
    return NextResponse.json(priceData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes cache
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Stock price API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

/**
 * Map error codes to appropriate HTTP status codes
 */
function getStatusCodeForError(code: StockPriceError['code']): number {
  switch (code) {
    case 'INVALID_TICKER':
      return 400; // Bad Request
    case 'NOT_FOUND':
      return 404; // Not Found
    case 'RATE_LIMIT':
      return 429; // Too Many Requests
    case 'NETWORK_ERROR':
    case 'API_ERROR':
      return 502; // Bad Gateway
    default:
      return 500; // Internal Server Error
  }
}

/**
 * Health check endpoint
 * GET /api/stock-price?health=true
 */
export async function OPTIONS() {
  try {
    const health = await stockPriceService.getServiceHealth();
    
    return NextResponse.json({
      status: 'healthy',
      service: 'stock-price-api',
      timestamp: new Date().toISOString(),
      ...health
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'stock-price-api',
        error: 'Service unavailable'
      },
      { status: 503 }
    );
  }
}