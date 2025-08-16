/**
 * LITE-038: Available Tickers API
 * Returns list of tickers that have price data in the database
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // console.log('[Tickers API] Fetching available tickers');
    // Get unique tickers from both stock prices and holdings
    const [stockPriceTickers, holdingTickers] = await Promise.all([
      // Tickers from stock_prices table
      prisma.stockPrice.findMany({
        select: {
          ticker: true
        },
        distinct: ['ticker'],
        orderBy: {
          ticker: 'asc'
        }
      }),

      // Tickers from holdings table
      prisma.holding.findMany({
        select: {
          ticker: true
        },
        distinct: ['ticker'],
        orderBy: {
          ticker: 'asc'
        }
      })
    ]);

    // Combine and deduplicate tickers
    const allTickers = new Set([
      ...stockPriceTickers.map(p => p.ticker),
      ...holdingTickers.map(h => h.ticker)
    ]);

    const tickersArray = Array.from(allTickers).sort();

    // Get additional stats for each ticker
    const tickerStats = await Promise.all(
      tickersArray.map(async (ticker) => {
        const [priceCount, latestPrice, holdings] = await Promise.all([
          // Count of price records
          prisma.stockPrice.count({
            where: { ticker }
          }),

          // Latest price record
          prisma.stockPrice.findFirst({
            where: { ticker },
            orderBy: { date: 'desc' }
          }),

          // Holdings for this ticker
          prisma.holding.findMany({
            where: { ticker },
            select: {
              shares: true,
              currentPrice: true
            }
          })
        ]);

        return {
          ticker,
          priceRecords: priceCount,
          latestPrice: latestPrice ? {
            date: latestPrice.date.toISOString().split('T')[0],
            close: latestPrice.close
          } : null,
          holdingsCount: holdings.length,
          totalShares: holdings.reduce((sum, h) => sum + h.shares, 0)
        };
      })
    );

    return NextResponse.json({
      success: true,
      count: tickersArray.length,
      tickers: tickersArray,
      detailed: tickerStats
    });

  } catch (error: any) {
    console.error('[Tickers API] Error:', error);
return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}