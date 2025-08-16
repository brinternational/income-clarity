import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma-client';
import { z } from 'zod';

// Query validation schema
const summaryQuerySchema = z.object({
  period: z.enum(['month', 'quarter', 'year']).default('month'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  year: z.string().optional().transform(val => val ? parseInt(val, 10) : new Date().getFullYear()),
  month: z.string().optional().transform(val => val ? parseInt(val, 10) : new Date().getMonth() + 1)
});

// Mock user ID - in production, get from authentication
const MOCK_USER_ID = 'user-demo-001';

// Helper function to get date range for period
function getDateRange(period: string, year: number, month?: number) {
  const currentDate = new Date();
  let startDate: Date;
  let endDate: Date;

  switch (period) {
    case 'month':
      if (month) {
        startDate = new Date(year, month - 1, 1);
        endDate = new Date(year, month, 0, 23, 59, 59);
      } else {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
      }
      break;
    
    case 'quarter':
      const currentQuarter = Math.floor(currentDate.getMonth() / 3);
      const startMonth = currentQuarter * 3;
      startDate = new Date(year, startMonth, 1);
      endDate = new Date(year, startMonth + 3, 0, 23, 59, 59);
      break;
      
    case 'year':
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31, 23, 59, 59);
      break;
      
    default:
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59);
  }

  return { startDate, endDate };
}

// GET /api/income/summary - Income summary by category
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const validatedQuery = summaryQuerySchema.parse(queryParams);
    const { period, startDate: customStartDate, endDate: customEndDate, year, month } = validatedQuery;

    // Determine date range
    let dateRange;
    if (customStartDate && customEndDate) {
      dateRange = {
        startDate: new Date(customStartDate),
        endDate: new Date(customEndDate)
      };
    } else {
      dateRange = getDateRange(period, year, month);
    }

    const { startDate, endDate } = dateRange;

    // Build where clause
    const where = {
      userId: MOCK_USER_ID,
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    // Get summary by category
    const categoryBreakdown = await prisma.income.groupBy({
      by: ['category'],
      where,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      },
      _avg: {
        amount: true
      }
    });

    // Get overall totals
    const overallSummary = await prisma.income.aggregate({
      where,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      },
      _avg: {
        amount: true
      }
    });

    // Get recurring vs one-time breakdown
    const recurringBreakdown = await prisma.income.groupBy({
      by: ['recurring'],
      where,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Get taxable vs non-taxable breakdown
    const taxableBreakdown = await prisma.income.groupBy({
      by: ['taxable'],
      where,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    });

    // Get monthly trend data if looking at year
    let monthlyTrend = null;
    if (period === 'year') {
      monthlyTrend = await prisma.income.groupBy({
        by: ['date'],
        where,
        _sum: {
          amount: true
        }
      });

      // Group by month
      const monthlyData: Record<string, { amount: number; count: number }> = {};
      
      // First get the data for each month
      const monthlyQuery = await prisma.$queryRaw<Array<{
        month: number;
        year: number;
        total_amount: number;
        count: number;
      }>>`
        SELECT 
          strftime('%m', date) as month,
          strftime('%Y', date) as year,
          SUM(amount) as total_amount,
          COUNT(*) as count
        FROM incomes 
        WHERE userId = ${MOCK_USER_ID} 
          AND date >= ${startDate.toISOString()}
          AND date <= ${endDate.toISOString()}
        GROUP BY strftime('%Y-%m', date)
        ORDER BY year, month
      `;

      monthlyTrend = monthlyQuery.map(item => ({
        month: `${item.year}-${item.month.toString().padStart(2, '0')}`,
        amount: Number(item.total_amount),
        count: Number(item.count)
      }));
    }

    // Calculate projections for recurring income
    const recurringIncomes = await prisma.income.findMany({
      where: {
        userId: MOCK_USER_ID,
        recurring: true
      }
    });

    const monthlyProjection = recurringIncomes.reduce((total, income) => {
      switch (income.frequency) {
        case 'MONTHLY':
          return total + income.amount;
        case 'QUARTERLY':
          return total + (income.amount / 3);
        case 'ANNUALLY':
          return total + (income.amount / 12);
        default:
          return total;
      }
    }, 0);

    const yearlyProjection = monthlyProjection * 12;

    // Format response data
    const response = {
      success: true,
      data: {
        period: {
          type: period,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          year,
          month
        },
        overall: {
          totalAmount: overallSummary._sum.amount || 0,
          totalEntries: overallSummary._count.id || 0,
          averageAmount: overallSummary._avg.amount || 0
        },
        categoryBreakdown: categoryBreakdown.map(item => ({
          category: item.category,
          totalAmount: item._sum.amount || 0,
          count: item._count.id || 0,
          averageAmount: item._avg.amount || 0,
          percentage: overallSummary._sum.amount 
            ? ((item._sum.amount || 0) / (overallSummary._sum.amount || 1)) * 100 
            : 0
        })),
        recurringBreakdown: recurringBreakdown.map(item => ({
          type: item.recurring ? 'recurring' : 'one-time',
          totalAmount: item._sum.amount || 0,
          count: item._count.id || 0,
          percentage: overallSummary._sum.amount 
            ? ((item._sum.amount || 0) / (overallSummary._sum.amount || 1)) * 100 
            : 0
        })),
        taxableBreakdown: taxableBreakdown.map(item => ({
          type: item.taxable ? 'taxable' : 'non-taxable',
          totalAmount: item._sum.amount || 0,
          count: item._count.id || 0,
          percentage: overallSummary._sum.amount 
            ? ((item._sum.amount || 0) / (overallSummary._sum.amount || 1)) * 100 
            : 0
        })),
        projections: {
          monthlyRecurring: monthlyProjection,
          yearlyRecurring: yearlyProjection,
          note: 'Based on current recurring income entries'
        },
        ...(monthlyTrend && { monthlyTrend })
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    // console.error('GET /api/income/summary error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to generate income summary'
    }, { status: 500 });
  }
}