import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma-client';
import { z } from 'zod';
import {
  generateCashFlowSummary,
  projectCashFlow,
  calculateMilestoneCoverage,
  calculateFIREProgress,
  analyzeSpendingPatterns
} from '@/lib/calculations/cash-flow';

// Query validation schema
const cashFlowQuerySchema = z.object({
  period: z.enum(['month', 'quarter', 'year']).default('month'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  year: z.string().optional().transform(val => val ? parseInt(val, 10) : new Date().getFullYear()),
  month: z.string().optional().transform(val => val ? parseInt(val, 10) : new Date().getMonth() + 1),
  projectionMonths: z.string().optional().transform(val => val ? parseInt(val, 10) : 12),
  includeProjections: z.string().optional().transform(val => val === 'true'),
  includeMilestones: z.string().optional().transform(val => val === 'true'),
  includeFIRE: z.string().optional().transform(val => val === 'true'),
  netWorth: z.string().optional().transform(val => val ? parseFloat(val) : 100000) // Default assumption
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

// GET /api/cash-flow - Cash flow analysis and projections
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const validatedQuery = cashFlowQuerySchema.parse(queryParams);
    const { 
      period, 
      startDate: customStartDate, 
      endDate: customEndDate, 
      year, 
      month,
      projectionMonths,
      includeProjections,
      includeMilestones,
      includeFIRE,
      netWorth
    } = validatedQuery;

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

    // Build where clause for the period
    const where = {
      userId: MOCK_USER_ID,
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    // Fetch income and expense data for the period
    const [incomes, expenses] = await Promise.all([
      prisma.income.findMany({ where }),
      prisma.expense.findMany({ where })
    ]);

    // Also get all recurring items for projections
    const [recurringIncomes, recurringExpenses] = await Promise.all([
      prisma.income.findMany({
        where: {
          userId: MOCK_USER_ID,
          recurring: true
        }
      }),
      prisma.expense.findMany({
        where: {
          userId: MOCK_USER_ID,
          recurring: true
        }
      })
    ]);

    // Generate cash flow summary
    const cashFlowSummary = generateCashFlowSummary(incomes, expenses);

    // Calculate monthly dividend income for milestones
    const monthlyDividendIncome = recurringIncomes
      .filter(income => income.category === 'DIVIDEND')
      .reduce((sum, income) => {
        const multipliers = {
          MONTHLY: 1,
          QUARTERLY: 1 / 3,
          ANNUALLY: 1 / 12
        };
        return sum + (income.amount * multipliers[income.frequency as keyof typeof multipliers || 'MONTHLY']);
      }, 0);

    // Base response
    const response: any = {
      success: true,
      data: {
        period: {
          type: period,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          year,
          month
        },
        summary: cashFlowSummary,
        breakdown: {
          incomes: {
            total: incomes.reduce((sum, income) => sum + income.amount, 0),
            count: incomes.length,
            byCategory: getBreakdownByCategory(incomes),
            recurringMonthly: getMonthlyRecurring(recurringIncomes)
          },
          expenses: {
            total: expenses.reduce((sum, expense) => sum + expense.amount, 0),
            count: expenses.length,
            byCategory: getBreakdownByCategory(expenses),
            recurringMonthly: getMonthlyRecurring(recurringExpenses),
            analysis: analyzeSpendingPatterns(expenses)
          }
        },
        monthlyDividendIncome,
        aboveZeroStatus: {
          isAboveZero: cashFlowSummary.isAboveZero,
          amount: cashFlowSummary.netCashFlow,
          percentage: cashFlowSummary.savingsRate
        }
      }
    };

    // Add projections if requested
    if (includeProjections) {
      const projections = projectCashFlow(recurringIncomes, recurringExpenses, projectionMonths);
      response.data.projections = {
        months: projectionMonths,
        data: projections,
        summary: {
          averageMonthlyIncome: projections.reduce((sum, p) => sum + p.income, 0) / projections.length,
          averageMonthlyExpenses: projections.reduce((sum, p) => sum + p.expenses, 0) / projections.length,
          averageNetCashFlow: projections.reduce((sum, p) => sum + p.netCashFlow, 0) / projections.length,
          finalCumulativeAmount: projections[projections.length - 1]?.cumulativeCashFlow || 0
        }
      };
    }

    // Add milestone coverage if requested
    if (includeMilestones) {
      const milestones = calculateMilestoneCoverage(monthlyDividendIncome, recurringExpenses);
      response.data.milestones = {
        monthlyDividendIncome,
        coverage: milestones,
        totalCovered: milestones.filter(m => m.coveredByDividends).length,
        percentageCovered: milestones.length > 0 ? (milestones.filter(m => m.coveredByDividends).length / milestones.length) * 100 : 0
      };
    }

    // Add FIRE progress if requested
    if (includeFIRE) {
      const annualExpenses = expenses.reduce((sum, expense) => {
        if (expense.recurring) {
          const multipliers = {
            MONTHLY: 12,
            QUARTERLY: 4,
            ANNUALLY: 1
          };
          return sum + (expense.amount * multipliers[expense.frequency as keyof typeof multipliers || 'MONTHLY']);
        }
        return sum + expense.amount; // Treat one-time as annual
      }, 0);

      const fireProgress = calculateFIREProgress(netWorth, annualExpenses);
      response.data.fireProgress = {
        ...fireProgress,
        currentNetWorth: netWorth,
        annualExpenses
      };
    }

    // Add historical trend for the year view
    if (period === 'year') {
      const monthlyTrend = await getMonthlyTrend(year);
      response.data.monthlyTrend = monthlyTrend;
    }

    return NextResponse.json(response);

  } catch (error) {
    // console.error('GET /api/cash-flow error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to generate cash flow analysis'
    }, { status: 500 });
  }
}

// Helper functions
function getBreakdownByCategory(items: any[]): Record<string, { amount: number; count: number }> {
  return items.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { amount: 0, count: 0 };
    }
    acc[item.category].amount += item.amount;
    acc[item.category].count += 1;
    return acc;
  }, {} as Record<string, { amount: number; count: number }>);
}

function getMonthlyRecurring(items: any[]): number {
  return items
    .filter(item => item.recurring)
    .reduce((sum, item) => {
      const multipliers = {
        MONTHLY: 1,
        QUARTERLY: 1 / 3,
        ANNUALLY: 1 / 12
      };
      return sum + (item.amount * multipliers[item.frequency as keyof typeof multipliers || 'MONTHLY']);
    }, 0);
}

async function getMonthlyTrend(year: number): Promise<Array<{
  month: string;
  income: number;
  expenses: number;
  netCashFlow: number;
}>> {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59);

  // Get monthly income data
  const monthlyIncomeQuery = await prisma.$queryRaw<Array<{
    month: number;
    year: number;
    total_amount: number;
  }>>`
    SELECT 
      strftime('%m', date) as month,
      strftime('%Y', date) as year,
      SUM(amount) as total_amount
    FROM incomes 
    WHERE userId = ${MOCK_USER_ID} 
      AND date >= ${startDate.toISOString()}
      AND date <= ${endDate.toISOString()}
    GROUP BY strftime('%Y-%m', date)
    ORDER BY year, month
  `;

  // Get monthly expense data
  const monthlyExpenseQuery = await prisma.$queryRaw<Array<{
    month: number;
    year: number;
    total_amount: number;
  }>>`
    SELECT 
      strftime('%m', date) as month,
      strftime('%Y', date) as year,
      SUM(amount) as total_amount
    FROM expenses 
    WHERE userId = ${MOCK_USER_ID} 
      AND date >= ${startDate.toISOString()}
      AND date <= ${endDate.toISOString()}
    GROUP BY strftime('%Y-%m', date)
    ORDER BY year, month
  `;

  // Merge the data by month
  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  
  monthlyIncomeQuery.forEach(item => {
    const key = `${item.year}-${item.month.toString().padStart(2, '0')}`;
    if (!monthlyData[key]) monthlyData[key] = { income: 0, expenses: 0 };
    monthlyData[key].income = Number(item.total_amount);
  });

  monthlyExpenseQuery.forEach(item => {
    const key = `${item.year}-${item.month.toString().padStart(2, '0')}`;
    if (!monthlyData[key]) monthlyData[key] = { income: 0, expenses: 0 };
    monthlyData[key].expenses = Number(item.total_amount);
  });

  // Create array for all months of the year
  const result = [];
  for (let month = 1; month <= 12; month++) {
    const key = `${year}-${month.toString().padStart(2, '0')}`;
    const data = monthlyData[key] || { income: 0, expenses: 0 };
    
    result.push({
      month: key,
      income: data.income,
      expenses: data.expenses,
      netCashFlow: data.income - data.expenses
    });
  }

  return result;
}