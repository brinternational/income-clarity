// API Route for Stock Prices with Polygon Integration
import { NextRequest, NextResponse } from 'next/server';
import { stockPriceService } from '@/lib/services/stock/stock-price.service';
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbols = searchParams.get('symbols');
    const symbol = searchParams.get('symbol'); // Support single symbol too
    
    if (!symbols && !symbol) {
      return NextResponse.json(
        { error: 'Symbol(s) parameter required' },
        { status: 400 }
      );
    }
    
    // Handle single symbol request
    if (symbol) {
      const price = await stockPriceService.getStockPrice(symbol.toUpperCase());
      return NextResponse.json({
        ...price,
        dataSource: process.env.POLYGON_API_KEY ? 'polygon' : 'simulated'
      });
    }
    
    // Handle multiple symbols
    const symbolList = symbols!.split(',').map(s => s.trim().toUpperCase());
    
    if (symbolList.length === 1) {
      // Single symbol request
      const price = await stockPriceService.getStockPrice(symbolList[0]);
      return NextResponse.json({
        ...price,
        dataSource: process.env.POLYGON_API_KEY ? 'polygon' : 'simulated'
      });
    } else {
      // Multiple symbols request
      const prices = await stockPriceService.getMultipleStockPrices(symbolList);
      
      // Convert Map to object for JSON serialization
      const pricesObject: Record<string, any> = {};
      prices.forEach((value, key) => {
        pricesObject[key] = value;
      });
      
      return NextResponse.json({
        prices: pricesObject,
        count: prices.size,
        dataSource: process.env.POLYGON_API_KEY ? 'polygon' : 'simulated',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Stock prices API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock prices' },
      { status: 500 }
    );
  }
}

// POST endpoint for batch operations and special actions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Batch fetch multiple symbols
    if (body.symbols && Array.isArray(body.symbols)) {
      const prices = await stockPriceService.getMultipleStockPrices(body.symbols);
      
      // Convert Map to array for easier client consumption
      const pricesArray = Array.from(prices.values());
      
      return NextResponse.json({
        prices: pricesArray,
        count: pricesArray.length,
        dataSource: process.env.POLYGON_API_KEY ? 'polygon' : 'simulated',
        timestamp: new Date().toISOString()
      });
    }
    
    // SPY benchmark special endpoint
    if (body.action === 'spy-benchmark') {
      const spyPrice = await stockPriceService.getSPYPrice();
      return NextResponse.json({
        ...spyPrice,
        dataSource: process.env.POLYGON_API_KEY ? 'polygon' : 'simulated'
      });
    }
    
    // Calculate portfolio value with holdings
    if (body.action === 'portfolio-value' && body.holdings) {
      const portfolioValue = await stockPriceService.calculatePortfolioValue(body.holdings);
      return NextResponse.json({
        ...portfolioValue,
        dataSource: process.env.POLYGON_API_KEY ? 'polygon' : 'simulated',
        timestamp: new Date().toISOString()
      });
    }
    
    // Get dividend data
    if (body.action === 'get-dividends') {
      const { symbol, startDate, endDate } = body;
      
      if (!symbol) {
        return NextResponse.json(
          { error: 'Symbol required for dividend data' },
          { status: 400 }
        );
      }

      const dividendData = await stockPriceService.getDividendData(symbol, startDate, endDate);
      return NextResponse.json({
        symbol,
        ...dividendData,
        timestamp: new Date().toISOString()
      });
    }

    // Get health status
    if (body.action === 'health-status') {
      const healthStatus = stockPriceService.getHealthStatus();
      let connectionTest = null;

      // Test connection if requested
      if (body.testConnection) {
        connectionTest = await stockPriceService.testApiConnection();
      }

      return NextResponse.json({
        health: healthStatus,
        connection: connectionTest,
        timestamp: new Date().toISOString()
      });
    }

    // Clear cache action (useful for forcing refresh)
    if (body.action === 'clear-cache') {
      stockPriceService.clearCache();
      return NextResponse.json({
        success: true,
        message: 'Cache cleared successfully'
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid request. Provide symbols array or valid action.' },
      { status: 400 }
    );
  } catch (error) {
    logger.error('Stock prices API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}