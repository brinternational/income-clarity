/**
 * LITE-038: Historical Stock Price Data API
 * Returns historical price data for a specific ticker and date range
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const ticker = url.searchParams.get('ticker');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Validate required parameters
    if (!ticker) {
      return NextResponse.json({
        success: false,
        message: 'Ticker symbol is required'
      }, { status: 400 });
    }

    if (!startDate || !endDate) {
      return NextResponse.json({
        success: false,
        message: 'Start date and end date are required'
      }, { status: 400 });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({
        success: false,
        message: 'Invalid date format'
      }, { status: 400 });
    }

    if (start > end) {
      return NextResponse.json({
        success: false,
        message: 'Start date must be before end date'
      }, { status: 400 });
    }

    // Limit date range to prevent excessive queries
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 1095) { // ~3 years
      return NextResponse.json({
        success: false,
        message: 'Date range cannot exceed 3 years'
      }, { status: 400 });
    }

    // console.log(`[Historical Prices] Fetching ${ticker} from ${startDate} to ${endDate}`);
    // Query historical price data
    const historicalPrices = await prisma.stockPrice.findMany({
      where: {
        ticker: ticker.toUpperCase(),
        date: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    // Format response data
    const formattedPrices = historicalPrices.map(price => ({
      date: price.date.toISOString().split('T')[0],
      open: price.open,
      high: price.high,
      low: price.low,
      close: price.close,
      volume: price.volume,
      adjustedClose: price.adjustedClose
    }));

    // Calculate basic statistics
    if (formattedPrices.length > 0) {
      const closes = formattedPrices.map(p => p.close);
      const volumes = formattedPrices.map(p => p.volume);
      
      const stats = {
        totalRecords: formattedPrices.length,
        dateRange: {
          start: formattedPrices[0].date,
          end: formattedPrices[formattedPrices.length - 1].date
        },
        priceRange: {
          min: Math.min(...closes),
          max: Math.max(...closes),
          avg: closes.reduce((a, b) => a + b, 0) / closes.length
        },
        volumeStats: {
          avg: volumes.reduce((a, b) => a + b, 0) / volumes.length,
          total: volumes.reduce((a, b) => a + b, 0)
        },
        performance: {
          totalReturn: closes.length > 1 ? ((closes[closes.length - 1] - closes[0]) / closes[0]) * 100 : 0,
          volatility: calculateVolatility(closes)
        }
      };

      return NextResponse.json({
        success: true,
        ticker: ticker.toUpperCase(),
        prices: formattedPrices,
        stats
      });
    } else {
      return NextResponse.json({
        success: true,
        ticker: ticker.toUpperCase(),
        prices: [],
        stats: null,
        message: 'No historical data found for the specified date range'
      });
    }

  } catch (error: any) {
    console.error('[Historical Prices API] Error:', error);
return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

/**
 * Calculate price volatility (standard deviation of daily returns)
 */
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;

  // Calculate daily returns
  const returns = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
  }

  // Calculate mean return
  const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;

  // Calculate variance
  const variance = returns.reduce((sum, returnVal) => {
    return sum + Math.pow(returnVal - meanReturn, 2);
  }, 0) / returns.length;

  // Return standard deviation (volatility)
  return Math.sqrt(variance);
}