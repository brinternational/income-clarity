/**
 * LITE-036: Recent Stock Price Updates API
 * Returns recent manual price updates for the admin interface
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const ticker = url.searchParams.get('ticker');

    // Build query conditions
    const where: any = {};
    if (ticker) {
      where.ticker = ticker.toUpperCase();
    }

    // Get recent price updates
    const recentPrices = await prisma.stockPrice.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' },
        { date: 'desc' }
      ],
      take: Math.min(limit, 100) // Cap at 100 for performance
    });

    // Format response
    const formattedPrices = recentPrices.map(price => ({
      id: price.id,
      ticker: price.ticker,
      date: price.date.toISOString().split('T')[0],
      open: price.open,
      high: price.high,
      low: price.low,
      close: price.close,
      volume: price.volume,
      adjustedClose: price.adjustedClose,
      createdAt: price.createdAt.toISOString(),
      dayChange: calculateDayChange(price.open, price.close),
      dayChangePercent: calculateDayChangePercent(price.open, price.close)
    }));

    return NextResponse.json({
      success: true,
      count: formattedPrices.length,
      prices: formattedPrices
    });

  } catch (error: any) {
    console.error('[Recent Prices API] Error:', error);
return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )}
}

/**
 * Calculate day change in dollars
 */
function calculateDayChange(open: number, close: number): number {
  return Number((close - open).toFixed(2));
}

/**
 * Calculate day change percentage
 */
function calculateDayChangePercent(open: number, close: number): number {
  if (open === 0) return 0;
  return Number(((close - open) / open * 100).toFixed(2));
}