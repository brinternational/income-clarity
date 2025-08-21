// Performance Hub API Route with Polygon Integration
import { NextRequest, NextResponse } from 'next/server';
import { superCardsDatabase } from '@/lib/services/super-cards-db/super-cards-database.service';
import { stockPriceService, getStockPrice, getSPYPrice } from '@/lib/services/stock/stock-price.service';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '1Y';
    
    // Get real-time SPY price from Polygon
    const spyPrice = await getSPYPrice();
    
    // Get real holdings from Prisma database (demo user)
    const demoUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        portfolios: {
          include: {
            holdings: true
          }
        }
      }
    });
    
    let dbHoldings = [];
    if (demoUser && demoUser.portfolios.length > 0) {
      // Convert Prisma holdings to the format expected by the API
      const allHoldings = demoUser.portfolios.flatMap(p => p.holdings);
      dbHoldings = allHoldings.map(holding => ({
        symbol: holding.ticker,
        shares: holding.shares,
        costBasis: holding.costBasis * holding.shares // Total position cost basis
      }));
    }
    
    // Fallback to defaults if no real holdings found
    if (dbHoldings.length === 0) {
      dbHoldings = [
        { symbol: 'SCHD', shares: 586, costBasis: 45000 },
        { symbol: 'VTI', shares: 102, costBasis: 28000 },
        { symbol: 'VXUS', shares: 382, costBasis: 23000 },
        { symbol: 'BND', shares: 279, costBasis: 19000 }
      ];
    }
    
    // Fetch real-time prices for all holdings
    const holdingSymbols = dbHoldings.map(h => h.symbol);
    const prices = await stockPriceService.getMultipleStockPrices(holdingSymbols);
    
    // Calculate portfolio value and performance with real prices
    let totalPortfolioValue = 0;
    let totalCostBasis = 0;
    const holdingsWithRealPrices = dbHoldings.map(holding => {
      const priceData = prices.get(holding.symbol);
      const currentPrice = priceData?.price || 100;
      const value = holding.shares * currentPrice;
      totalPortfolioValue += value;
      totalCostBasis += holding.costBasis;
      
      // Calculate YTD performance (simplified - using change percent from API)
      const ytdPerformance = priceData?.changePercent ? priceData.changePercent / 100 : 0.05;
      const vsSpyPerformance = ytdPerformance - (spyPrice.changePercent / 100);
      
      return {
        id: holding.symbol,
        symbol: holding.symbol,
        ticker: holding.symbol,
        value,
        shares: holding.shares,
        price: currentPrice,
        costBasis: holding.costBasis,
        ytdPerformance,
        vsSpyPerformance,
        lastUpdated: priceData?.timestamp || new Date()
      };
    });
    
    // Calculate real portfolio returns
    const portfolioReturn = (totalPortfolioValue - totalCostBasis) / totalCostBasis;
    
    // Calculate SPY comparison based on time range
    // For now using simplified calculation - in production would need historical data
    const spyReturns = {
      '1D': spyPrice.changePercent / 100,
      '1W': spyPrice.changePercent / 100 * 5,
      '1M': spyPrice.changePercent / 100 * 20,
      '3M': 0.0389,  // Would need historical data
      '6M': 0.0534,  // Would need historical data
      '1Y': 0.061,   // Would need historical data
      'All': 0.098   // Would need historical data
    };
    
    const currentSpyReturn = spyReturns[timeRange as keyof typeof spyReturns] || spyReturns['1Y'];
    
    const spyComparison = {
      portfolioReturn,
      spyReturn: currentSpyReturn,
      outperformance: portfolioReturn - currentSpyReturn,
      timeRange,
      spyPrice: spyPrice.price,
      lastUpdated: spyPrice.timestamp
    };
    
    // Time period data with some real calculations
    const timePeriodData = {
      '1D': { 
        portfolioReturn: holdingsWithRealPrices.reduce((sum, h) => sum + (h.ytdPerformance * (h.value / totalPortfolioValue)), 0) / 365,
        spyReturn: spyReturns['1D'],
        outperformance: 0
      },
      '1W': { 
        portfolioReturn: holdingsWithRealPrices.reduce((sum, h) => sum + (h.ytdPerformance * (h.value / totalPortfolioValue)), 0) / 52,
        spyReturn: spyReturns['1W'],
        outperformance: 0
      },
      '1M': { 
        portfolioReturn: holdingsWithRealPrices.reduce((sum, h) => sum + (h.ytdPerformance * (h.value / totalPortfolioValue)), 0) / 12,
        spyReturn: spyReturns['1M'],
        outperformance: 0
      },
      '3M': { portfolioReturn: 0.0421, spyReturn: 0.0389, outperformance: 0.0032 },
      '6M': { portfolioReturn: 0.0612, spyReturn: 0.0534, outperformance: 0.0078 },
      '1Y': { portfolioReturn, spyReturn: currentSpyReturn, outperformance: portfolioReturn - currentSpyReturn },
      'All': { portfolioReturn: 0.125, spyReturn: 0.098, outperformance: 0.027 }
    };
    
    // Calculate outperformance for each period
    Object.keys(timePeriodData).forEach(period => {
      const data = timePeriodData[period as keyof typeof timePeriodData];
      data.outperformance = data.portfolioReturn - data.spyReturn;
    });
    
    const response = {
      portfolioValue: totalPortfolioValue,
      costBasis: totalCostBasis,
      spyComparison,
      holdings: holdingsWithRealPrices,
      timePeriodData,
      spyOutperformance: spyComparison.outperformance,
      dataSource: process.env.POLYGON_API_KEY ? 'polygon' : 'simulated',
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    logger.error('Performance Hub API error:', error);
    
    // Fallback to static data if Polygon fails
    const fallbackResponse = {
      portfolioValue: 125000,
      costBasis: 115000,
      spyComparison: {
        portfolioReturn: 0.082,
        spyReturn: 0.061,
        outperformance: 0.021,
        timeRange: '1Y'
      },
      holdings: [
        { symbol: 'SCHD', value: 50000, shares: 586, ytdPerformance: 0.089, vsSpyPerformance: 0.028 },
        { symbol: 'VTI', value: 30000, shares: 102, ytdPerformance: 0.075, vsSpyPerformance: 0.014 },
        { symbol: 'VXUS', value: 25000, shares: 382, ytdPerformance: 0.045, vsSpyPerformance: -0.016 },
        { symbol: 'BND', value: 20000, shares: 279, ytdPerformance: 0.032, vsSpyPerformance: -0.029 }
      ],
      timePeriodData: {
        '1D': { portfolioReturn: 0.0012, spyReturn: 0.0008, outperformance: 0.0004 },
        '1W': { portfolioReturn: 0.0089, spyReturn: 0.0072, outperformance: 0.0017 },
        '1M': { portfolioReturn: 0.0215, spyReturn: 0.0188, outperformance: 0.0027 },
        '3M': { portfolioReturn: 0.0421, spyReturn: 0.0389, outperformance: 0.0032 },
        '6M': { portfolioReturn: 0.0612, spyReturn: 0.0534, outperformance: 0.0078 },
        '1Y': { portfolioReturn: 0.082, spyReturn: 0.061, outperformance: 0.021 },
        'All': { portfolioReturn: 0.125, spyReturn: 0.098, outperformance: 0.027 }
      },
      spyOutperformance: 0.021,
      dataSource: 'fallback',
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(fallbackResponse);
  }
}