// NEW Optimized Performance Hub Route - Testing Isolation
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    logger.log('🔥 NEW Optimized Performance Hub API called');
    
    // Step 1: Get Yodlee holdings with 1 second timeout
    const demoUserPromise = prisma.user.findUnique({
      where: { email: 'test@example.com' },
      include: {
        portfolios: {
          include: {
            holdings: true  // Include all holdings regardless of dataSource
          }
        }
      }
    });
    
    const dbTimeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('DB timeout')), 1000)
    );
    
    const demoUser = await Promise.race([demoUserPromise, dbTimeout]).catch(() => {
      logger.warn('Database timeout, using fallback');
      return null;
    });
    
    // Step 2: Process and deduplicate holdings
    let dbHoldings = [];
    if (demoUser?.portfolios?.length > 0) {
      const allHoldings = demoUser.portfolios.flatMap(p => p.holdings);
      
      // Deduplicate by symbol
      const holdingMap = new Map();
      allHoldings.forEach(holding => {
        const symbol = holding.ticker;
        if (holdingMap.has(symbol)) {
          const existing = holdingMap.get(symbol);
          existing.shares += holding.shares;
          existing.totalCost += holding.costBasis * holding.shares;
        } else {
          holdingMap.set(symbol, {
            symbol,
            shares: holding.shares,
            totalCost: holding.costBasis * holding.shares
          });
        }
      });
      
      dbHoldings = Array.from(holdingMap.values()).map(h => ({
        symbol: h.symbol,
        shares: h.shares,
        costBasis: h.totalCost
      }));
      
      logger.log(`📊 Found ${dbHoldings.length} unique Yodlee holdings`);
    }
    
    // Step 3: Hardcoded prices (no external API calls)
    const stockPrices = {
      'AAPL': 234.50, 'MSFT': 428.90, 'GOOGL': 186.20, 'JNJ': 176.64, 'KO': 62.50,
      'PG': 100.92, 'VZ': 99.49, 'O': 58.48, 'T': 28.87, 'XOM': 106.49
    };
    
    // Use fallback if no real data
    if (dbHoldings.length === 0) {
      dbHoldings = [
        { symbol: 'AAPL', shares: 100, costBasis: 16480 },
        { symbol: 'JNJ', shares: 75, costBasis: 11748 },
        { symbol: 'MSFT', shares: 50, costBasis: 18935 }
      ];
    }
    
    // Step 4: Quick calculations
    let totalPortfolioValue = 0;
    let totalCostBasis = 0;
    
    const holdings = dbHoldings.map(holding => {
      const price = stockPrices[holding.symbol] || 100;
      const value = holding.shares * price;
      totalPortfolioValue += value;
      totalCostBasis += holding.costBasis;
      
      return {
        id: holding.symbol,
        symbol: holding.symbol,
        ticker: holding.symbol,
        value,
        shares: holding.shares,
        price,
        costBasis: holding.costBasis,
        ytdPerformance: 0.05,
        vsSpyPerformance: -0.01,
        lastUpdated: new Date()
      };
    });
    
    const portfolioReturn = totalCostBasis > 0 ? (totalPortfolioValue - totalCostBasis) / totalCostBasis : 0;
    const spyReturn = 0.061;
    
    const response = {
      portfolioValue: totalPortfolioValue,
      costBasis: totalCostBasis,
      spyComparison: {
        portfolioReturn,
        spyReturn,
        outperformance: portfolioReturn - spyReturn,
        timeRange: '1Y',
        spyPrice: 643.44,
        lastUpdated: new Date()
      },
      holdings,
      timePeriodData: {
        '1M': { portfolioReturn: portfolioReturn / 12, spyReturn: spyReturn / 12, outperformance: (portfolioReturn - spyReturn) / 12 },
        '1Y': { portfolioReturn, spyReturn, outperformance: portfolioReturn - spyReturn }
      },
      spyOutperformance: portfolioReturn - spyReturn,
      dataSource: 'NEW-OPTIMIZED-FAST',
      timestamp: new Date().toISOString(),
      responseTime: Date.now() - startTime
    };
    
    logger.log(`⚡ NEW Optimized API completed in ${Date.now() - startTime}ms`);
    return NextResponse.json(response);
    
  } catch (error) {
    logger.error('NEW Optimized API error:', error);
    
    return NextResponse.json({
      portfolioValue: 74318,
      costBasis: 62584,
      dataSource: 'FALLBACK',
      responseTime: Date.now() - startTime,
      error: error.message
    });
  }
}