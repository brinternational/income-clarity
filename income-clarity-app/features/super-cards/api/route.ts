import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/logger'

// Type definitions for Super Card data
export interface SuperCardRequest {
  card: 'performance' | 'income' | 'tax' | 'strategy' | 'planning';
  userId: string;
  timeRange?: '30d' | '90d' | '1y' | 'all';
}

export interface SuperCardResponse {
  success: boolean;
  data?: any;
  error?: string;
  isEmpty?: boolean;
}

// Performance metrics calculation
async function getPerformanceData(userId: string, timeRange: string = '30d') {
  try {
    // Get portfolios and holdings
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: {
        holdings: true
      }
    });

    if (portfolios.length === 0) {
      return { isEmpty: true };
    }

    // Calculate total portfolio value and performance
    let totalValue = 0;
    let totalCostBasis = 0;
    let totalDividendYield = 0;
    let holdingCount = 0;

    for (const portfolio of portfolios) {
      for (const holding of portfolio.holdings) {
        const currentValue = (holding.currentPrice || 0) * holding.shares;
        totalValue += currentValue;
        totalCostBasis += holding.costBasis;
        totalDividendYield += (holding.dividendYield || 0);
        holdingCount++;
      }
    }

    const avgDividendYield = holdingCount > 0 ? totalDividendYield / holdingCount : 0;
    const totalReturn = totalCostBasis > 0 ? ((totalValue - totalCostBasis) / totalCostBasis) * 100 : 0;
    const unrealizedGainLoss = totalValue - totalCostBasis;

    // Get recent dividend income
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentDividends = await prisma.income.aggregate({
      where: {
        userId,
        category: 'DIVIDEND',
        date: {
          gte: thirtyDaysAgo
        }
      },
      _sum: {
        amount: true
      }
    });

    const monthlyDividendIncome = recentDividends._sum.amount || 0;

    return {
      totalValue,
      totalCostBasis,
      totalReturn,
      unrealizedGainLoss,
      avgDividendYield,
      monthlyDividendIncome,
      portfolioCount: portfolios.length,
      holdingCount
    };
  } catch (error) {
    logger.error('Error getting performance data:', error);
    throw error;
  }
}

// Income intelligence calculation
async function getIncomeData(userId: string, timeRange: string = '30d') {
  try {
    const timeRangeMap = {
      '30d': 30,
      '90d': 90,
      '1y': 365,
      'all': 36500 // 100 years effectively
    };

    const daysBack = timeRangeMap[timeRange as keyof typeof timeRangeMap] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const incomes = await prisma.income.findMany({
      where: {
        userId,
        date: {
          gte: startDate
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    if (incomes.length === 0) {
      return { isEmpty: true };
    }

    // Calculate income metrics
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const dividendIncome = incomes.filter(i => i.category === 'DIVIDEND').reduce((sum, income) => sum + income.amount, 0);
    const averageMonthlyIncome = totalIncome / (daysBack / 30);
    
    // Calculate income growth
    const halfwayPoint = Math.floor(daysBack / 2);
    const halfwayDate = new Date();
    halfwayDate.setDate(halfwayDate.getDate() - halfwayPoint);

    const recentIncome = incomes.filter(i => i.date >= halfwayDate).reduce((sum, income) => sum + income.amount, 0);
    const olderIncome = incomes.filter(i => i.date < halfwayDate).reduce((sum, income) => sum + income.amount, 0);
    
    const incomeGrowth = olderIncome > 0 ? ((recentIncome - olderIncome) / olderIncome) * 100 : 0;

    // Income by category
    const incomeByCategory = incomes.reduce((acc, income) => {
      acc[income.category] = (acc[income.category] || 0) + income.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIncome,
      dividendIncome,
      averageMonthlyIncome,
      incomeGrowth,
      incomeByCategory,
      transactionCount: incomes.length
    };
  } catch (error) {
    logger.error('Error getting income data:', error);
    throw error;
  }
}

// Tax strategy calculation
async function getTaxData(userId: string) {
  try {
    // Get tax profile
    const taxProfile = await prisma.taxProfile.findUnique({
      where: { userId }
    });

    // Get current year income for tax calculations
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);

    const yearlyIncome = await prisma.income.aggregate({
      where: {
        userId,
        date: {
          gte: yearStart
        }
      },
      _sum: {
        amount: true
      }
    });

    const totalYearlyIncome = yearlyIncome._sum.amount || 0;

    if (totalYearlyIncome === 0 && !taxProfile) {
      return { isEmpty: true };
    }

    // Calculate tax estimates using tax profile or defaults
    const effectiveRate = taxProfile?.effectiveRate || 0.22;
    const marginalRate = taxProfile?.marginalRate || 0.22;
    const qualifiedDividendRate = taxProfile?.qualifiedDividendRate || 0.15;

    const estimatedTaxLiability = totalYearlyIncome * effectiveRate;
    const marginalTaxImpact = totalYearlyIncome * marginalRate;

    // Get dividend income for qualified dividend analysis
    const dividendIncome = await prisma.income.aggregate({
      where: {
        userId,
        category: 'DIVIDEND',
        date: {
          gte: yearStart
        }
      },
      _sum: {
        amount: true
      }
    });

    const totalDividendIncome = dividendIncome._sum.amount || 0;
    const qualifiedDividendTax = totalDividendIncome * qualifiedDividendRate;

    return {
      totalYearlyIncome,
      estimatedTaxLiability,
      marginalTaxImpact,
      effectiveRate,
      marginalRate,
      totalDividendIncome,
      qualifiedDividendTax,
      taxProfile: taxProfile || null
    };
  } catch (error) {
    logger.error('Error getting tax data:', error);
    throw error;
  }
}

// Portfolio strategy analysis
async function getStrategyData(userId: string) {
  try {
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: {
        holdings: true
      }
    });

    if (portfolios.length === 0) {
      return { isEmpty: true };
    }

    // Calculate sector allocation
    const sectorAllocation: Record<string, number> = {};
    let totalValue = 0;

    for (const portfolio of portfolios) {
      for (const holding of portfolio.holdings) {
        const currentValue = (holding.currentPrice || 0) * holding.shares;
        totalValue += currentValue;
        
        const sector = holding.sector || 'Unknown';
        sectorAllocation[sector] = (sectorAllocation[sector] || 0) + currentValue;
      }
    }

    // Calculate percentages
    const sectorPercentages = Object.entries(sectorAllocation).map(([sector, value]) => ({
      sector,
      percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
      value
    }));

    // Simple rebalancing suggestions (basic implementation)
    const rebalancingSuggestions = sectorPercentages
      .filter(s => s.percentage > 25) // Over-allocated sectors
      .map(s => ({
        action: 'REDUCE',
        sector: s.sector,
        currentPercentage: s.percentage,
        recommendedPercentage: 20,
        reasoning: `${s.sector} is over-allocated at ${s.percentage.toFixed(1)}%`
      }));

    return {
      sectorAllocation: sectorPercentages,
      rebalancingSuggestions,
      totalValue,
      diversificationScore: Math.min(Object.keys(sectorAllocation).length * 10, 100) // Simple score
    };
  } catch (error) {
    logger.error('Error getting strategy data:', error);
    throw error;
  }
}

// Financial planning analysis
async function getPlanningData(userId: string) {
  try {
    // Get financial goals
    const goals = await prisma.financialGoal.findMany({
      where: {
        userId,
        isActive: true
      }
    });

    // Get recent income and expenses for FIRE calculation
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [monthlyIncome, monthlyExpenses] = await Promise.all([
      prisma.income.aggregate({
        where: {
          userId,
          date: { gte: thirtyDaysAgo }
        },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: {
          userId,
          date: { gte: thirtyDaysAgo }
        },
        _sum: { amount: true }
      })
    ]);

    const totalMonthlyIncome = monthlyIncome._sum.amount || 0;
    const totalMonthlyExpenses = monthlyExpenses._sum.amount || 0;
    const monthlySavings = totalMonthlyIncome - totalMonthlyExpenses;
    const savingsRate = totalMonthlyIncome > 0 ? (monthlySavings / totalMonthlyIncome) * 100 : 0;

    // Get current portfolio value for FIRE calculations
    const portfolios = await prisma.portfolio.findMany({
      where: { userId },
      include: { holdings: true }
    });

    let totalNetWorth = 0;
    for (const portfolio of portfolios) {
      for (const holding of portfolio.holdings) {
        totalNetWorth += (holding.currentPrice || 0) * holding.shares;
      }
    }

    // FIRE calculations (simplified)
    const annualExpenses = totalMonthlyExpenses * 12;
    const fireNumber = annualExpenses * 25; // 4% rule
    const fireProgress = fireNumber > 0 ? (totalNetWorth / fireNumber) * 100 : 0;

    if (goals.length === 0 && totalNetWorth === 0) {
      return { isEmpty: true };
    }

    return {
      goals,
      totalNetWorth,
      monthlyIncome: totalMonthlyIncome,
      monthlyExpenses: totalMonthlyExpenses,
      monthlySavings,
      savingsRate,
      fireNumber,
      fireProgress,
      yearsToFire: monthlySavings > 0 ? Math.max(0, (fireNumber - totalNetWorth) / (monthlySavings * 12)) : null
    };
  } catch (error) {
    logger.error('Error getting planning data:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const card = searchParams.get('card') as SuperCardRequest['card'];
    const userId = searchParams.get('userId');
    const timeRange = searchParams.get('timeRange') || '30d';

    if (!card || !userId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: card and userId'
      }, { status: 400 });
    }

    let data;
    switch (card) {
      case 'performance':
        data = await getPerformanceData(userId, timeRange);
        break;
      case 'income':
        data = await getIncomeData(userId, timeRange);
        break;
      case 'tax':
        data = await getTaxData(userId);
        break;
      case 'strategy':
        data = await getStrategyData(userId);
        break;
      case 'planning':
        data = await getPlanningData(userId);
        break;
      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid card type'
        }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data,
      isEmpty: data?.isEmpty || false
    });

  } catch (error) {
    logger.error('Super Cards API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}