import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma-client';
import { z } from 'zod';

// Analysis query schema
const analysisQuerySchema = z.object({
  budgetId: z.string().optional(),
  period: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY']).optional(),
  year: z.string().transform(val => val ? parseInt(val, 10) : new Date().getFullYear()).optional(),
  month: z.string().transform(val => val ? parseInt(val, 10) : undefined).optional(),
  compareWithPrevious: z.string().transform(val => val === 'true').optional(),
  includeTrends: z.string().transform(val => val === 'true').optional(),
  includeRecommendations: z.string().transform(val => val === 'true').optional()
});

// Mock user ID
const MOCK_USER_ID = 'user-demo-001';

// GET /api/budgets/analysis - Budget analysis and insights
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    
    const { 
      budgetId, 
      period, 
      year, 
      month, 
      compareWithPrevious,
      includeTrends,
      includeRecommendations
    } = analysisQuerySchema.parse(queryParams);

    let budgets;
    
    if (budgetId) {
      // Analyze specific budget
      budgets = await prisma.budget.findMany({
        where: { id: budgetId, userId: MOCK_USER_ID },
        include: { categories: true }
      });
    } else {
      // Analyze budgets by period
      const where: any = { userId: MOCK_USER_ID, isActive: true };
      if (period) where.period = period;
      
      budgets = await prisma.budget.findMany({
        where,
        include: { categories: true },
        orderBy: { createdAt: 'desc' }
      });
    }

    if (budgets.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No budgets found for analysis'
      }, { status: 404 });
    }

    // Perform comprehensive analysis
    const analysis = await performBudgetAnalysis(budgets, {
      year,
      month,
      compareWithPrevious,
      includeTrends,
      includeRecommendations
    });

    return NextResponse.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    // console.error('GET /api/budgets/analysis error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid query parameters',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to generate budget analysis'
    }, { status: 500 });
  }
}

// Comprehensive budget analysis function
async function performBudgetAnalysis(budgets: any[], options: any) {
  const results = [];

  for (const budget of budgets) {
    const startDate = new Date(budget.startDate);
    const endDate = new Date(budget.endDate);

    // Get expenses for this budget period
    const expenses = await prisma.expense.findMany({
      where: {
        userId: MOCK_USER_ID,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate category performance
    const categoryAnalysis = budget.categories.map((category: any) => {
      const categoryExpenses = expenses.filter(exp => exp.category === category.category);
      const actualSpent = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const budgetedAmount = category.budgetedAmount;
      const variance = actualSpent - budgetedAmount;
      const variancePercentage = budgetedAmount > 0 ? (variance / budgetedAmount) * 100 : 0;

      // Spending pattern analysis
      const spendingPattern = analyzeSpendingPattern(categoryExpenses, startDate, endDate);

      return {
        category: category.category,
        budgeted: budgetedAmount,
        actual: actualSpent,
        variance,
        variancePercentage,
        performance: getPerformanceRating(variancePercentage),
        isOverBudget: variance > 0,
        spendingPattern,
        expenseCount: categoryExpenses.length,
        averageExpense: categoryExpenses.length > 0 ? actualSpent / categoryExpenses.length : 0,
        priority: category.priority,
        essential: category.essential
      };
    });

    // Overall budget performance
    const totalBudgeted = budget.totalBudget;
    const totalActual = categoryAnalysis.reduce((sum, cat) => sum + cat.actual, 0);
    const totalVariance = totalActual - totalBudgeted;
    const totalVariancePercentage = totalBudgeted > 0 ? (totalVariance / totalBudgeted) * 100 : 0;

    // Budget health metrics
    const healthMetrics = calculateHealthMetrics(categoryAnalysis, budget);

    // Spending velocity analysis
    const velocityAnalysis = calculateSpendingVelocity(expenses, startDate, endDate);

    // Risk assessment
    const riskAssessment = assessBudgetRisk(categoryAnalysis, velocityAnalysis, budget);

    results.push({
      budget: {
        id: budget.id,
        name: budget.name,
        period: budget.period,
        startDate,
        endDate
      },
      overall: {
        totalBudgeted,
        totalActual,
        variance: totalVariance,
        variancePercentage: totalVariancePercentage,
        performance: getPerformanceRating(totalVariancePercentage),
        isOverBudget: totalVariance > 0
      },
      categories: categoryAnalysis,
      healthMetrics,
      velocityAnalysis,
      riskAssessment,
      insights: generateInsights(categoryAnalysis, healthMetrics, riskAssessment)
    });
  }

  // Generate comparative analysis if requested
  let comparison = null;
  if (options.compareWithPrevious && results.length > 1) {
    comparison = generateComparativeAnalysis(results);
  }

  // Generate recommendations if requested
  let recommendations = null;
  if (options.includeRecommendations) {
    recommendations = generateRecommendations(results);
  }

  return {
    summary: generateSummary(results),
    budgets: results,
    comparison,
    recommendations,
    generatedAt: new Date().toISOString()
  };
}

// Helper functions
function analyzeSpendingPattern(expenses: any[], startDate: Date, endDate: Date) {
  if (expenses.length === 0) {
    return { pattern: 'no_data', consistency: 0, trend: 'stable' };
  }

  // Group expenses by week
  const weeklySpending = groupExpensesByWeek(expenses);
  const weeklyAmounts = Object.values(weeklySpending);

  // Calculate consistency (coefficient of variation)
  const mean = weeklyAmounts.reduce((sum, amt) => sum + amt, 0) / weeklyAmounts.length;
  const variance = weeklyAmounts.reduce((sum, amt) => sum + Math.pow(amt - mean, 2), 0) / weeklyAmounts.length;
  const standardDeviation = Math.sqrt(variance);
  const consistency = mean > 0 ? (1 - (standardDeviation / mean)) * 100 : 0;

  // Determine trend
  const firstHalf = weeklyAmounts.slice(0, Math.ceil(weeklyAmounts.length / 2));
  const secondHalf = weeklyAmounts.slice(Math.ceil(weeklyAmounts.length / 2));
  const firstHalfAvg = firstHalf.reduce((sum, amt) => sum + amt, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, amt) => sum + amt, 0) / secondHalf.length;

  let trend = 'stable';
  if (secondHalfAvg > firstHalfAvg * 1.1) trend = 'increasing';
  else if (secondHalfAvg < firstHalfAvg * 0.9) trend = 'decreasing';

  return {
    pattern: consistency > 70 ? 'consistent' : consistency > 40 ? 'moderate' : 'erratic',
    consistency: Math.max(0, Math.min(100, consistency)),
    trend,
    weeklyAverage: mean,
    peakWeek: Math.max(...weeklyAmounts),
    lowWeek: Math.min(...weeklyAmounts)
  };
}

function groupExpensesByWeek(expenses: any[]) {
  const weeks: Record<string, number> = {};
  
  expenses.forEach(expense => {
    const date = new Date(expense.date);
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    const key = `${year}-W${week}`;
    
    weeks[key] = (weeks[key] || 0) + expense.amount;
  });
  
  return weeks;
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getPerformanceRating(variancePercentage: number): string {
  if (variancePercentage <= -10) return 'excellent';
  if (variancePercentage <= 5) return 'good';
  if (variancePercentage <= 15) return 'fair';
  if (variancePercentage <= 25) return 'poor';
  return 'critical';
}

function calculateHealthMetrics(categories: any[], budget: any) {
  const essentialCategories = categories.filter(cat => cat.essential);
  const discretionaryCategories = categories.filter(cat => !cat.essential);
  
  const essentialOverages = essentialCategories.filter(cat => cat.isOverBudget).length;
  const discretionaryOverages = discretionaryCategories.filter(cat => cat.isOverBudget).length;
  
  const avgVariance = categories.reduce((sum, cat) => sum + Math.abs(cat.variancePercentage), 0) / categories.length;
  
  return {
    overallScore: Math.max(0, 100 - avgVariance),
    essentialCategoriesOverBudget: essentialOverages,
    discretionaryCategoriesOverBudget: discretionaryOverages,
    categoriesOnTrack: categories.filter(cat => !cat.isOverBudget).length,
    averageVariance: avgVariance,
    worstPerformingCategory: categories.reduce((worst, cat) => 
      cat.variancePercentage > worst.variancePercentage ? cat : worst, categories[0])?.category,
    bestPerformingCategory: categories.reduce((best, cat) => 
      cat.variancePercentage < best.variancePercentage ? cat : best, categories[0])?.category
  };
}

function calculateSpendingVelocity(expenses: any[], startDate: Date, endDate: Date) {
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const dailyAverage = totalDays > 0 ? totalAmount / totalDays : 0;
  
  // Calculate recent velocity (last 7 days)
  const recent7Days = expenses.filter(exp => {
    const expDate = new Date(exp.date);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return expDate >= cutoff;
  });
  const recent7DaysAmount = recent7Days.reduce((sum, exp) => sum + exp.amount, 0);
  const recentDailyAverage = recent7DaysAmount / 7;
  
  return {
    dailyAverage,
    recentDailyAverage,
    velocityChange: dailyAverage > 0 ? ((recentDailyAverage - dailyAverage) / dailyAverage) * 100 : 0,
    trend: recentDailyAverage > dailyAverage * 1.1 ? 'accelerating' : 
           recentDailyAverage < dailyAverage * 0.9 ? 'decelerating' : 'stable'
  };
}

function assessBudgetRisk(categories: any[], velocity: any, budget: any) {
  let riskScore = 0;
  const risks = [];
  
  // Essential categories over budget
  const essentialOverages = categories.filter(cat => cat.essential && cat.isOverBudget);
  if (essentialOverages.length > 0) {
    riskScore += essentialOverages.length * 20;
    risks.push(`${essentialOverages.length} essential categories over budget`);
  }
  
  // High spending velocity
  if (velocity.velocityChange > 25) {
    riskScore += 15;
    risks.push('Spending velocity is accelerating');
  }
  
  // Categories with poor consistency
  const erraticCategories = categories.filter(cat => 
    cat.spendingPattern.pattern === 'erratic'
  );
  if (erraticCategories.length > categories.length * 0.5) {
    riskScore += 10;
    risks.push('More than half of categories show erratic spending patterns');
  }
  
  // High variance categories
  const highVarianceCategories = categories.filter(cat => 
    Math.abs(cat.variancePercentage) > 30
  );
  if (highVarianceCategories.length > 0) {
    riskScore += highVarianceCategories.length * 5;
    risks.push(`${highVarianceCategories.length} categories with high variance (>30%)`);
  }
  
  return {
    riskScore: Math.min(100, riskScore),
    riskLevel: riskScore < 20 ? 'low' : riskScore < 50 ? 'medium' : 'high',
    risks,
    riskFactors: {
      essentialOverages: essentialOverages.length,
      velocityRisk: velocity.velocityChange > 25,
      consistencyRisk: erraticCategories.length,
      varianceRisk: highVarianceCategories.length
    }
  };
}

function generateInsights(categories: any[], health: any, risk: any) {
  const insights = [];
  
  // Performance insights
  if (health.overallScore > 80) {
    insights.push({ type: 'positive', message: 'Excellent budget adherence! You\'re staying within budget across most categories.' });
  } else if (health.overallScore < 50) {
    insights.push({ type: 'warning', message: 'Budget performance needs attention. Consider reviewing spending patterns.' });
  }
  
  // Category-specific insights
  const overBudgetCategories = categories.filter(cat => cat.isOverBudget);
  if (overBudgetCategories.length > 0) {
    const worstCategory = overBudgetCategories.reduce((worst, cat) => 
      cat.variancePercentage > worst.variancePercentage ? cat : worst);
    insights.push({ 
      type: 'alert', 
      message: `${worstCategory.category} is ${worstCategory.variancePercentage.toFixed(1)}% over budget` 
    });
  }
  
  // Trend insights
  const increasingCategories = categories.filter(cat => cat.spendingPattern.trend === 'increasing');
  if (increasingCategories.length > 0) {
    insights.push({ 
      type: 'info', 
      message: `Spending is increasing in ${increasingCategories.length} categories. Monitor these closely.` 
    });
  }
  
  return insights;
}

function generateSummary(results: any[]) {
  const totalBudgets = results.length;
  const overBudgetCount = results.filter(r => r.overall.isOverBudget).length;
  const avgPerformanceScore = results.reduce((sum, r) => sum + r.healthMetrics.overallScore, 0) / totalBudgets;
  const highRiskBudgets = results.filter(r => r.riskAssessment.riskLevel === 'high').length;
  
  return {
    totalBudgets,
    budgetsOnTrack: totalBudgets - overBudgetCount,
    budgetsOverBudget: overBudgetCount,
    averagePerformanceScore: avgPerformanceScore,
    highRiskBudgets,
    overallHealth: avgPerformanceScore > 80 ? 'excellent' : 
                   avgPerformanceScore > 60 ? 'good' : 
                   avgPerformanceScore > 40 ? 'fair' : 'poor'
  };
}

function generateComparativeAnalysis(results: any[]) {
  // Compare most recent with previous budget
  if (results.length < 2) return null;
  
  const current = results[0];
  const previous = results[1];
  
  return {
    performanceChange: current.healthMetrics.overallScore - previous.healthMetrics.overallScore,
    varianceChange: current.overall.variancePercentage - previous.overall.variancePercentage,
    riskChange: current.riskAssessment.riskScore - previous.riskAssessment.riskScore,
    improvementAreas: current.categories.filter((cat, index) => 
      cat.performance === 'good' && previous.categories[index]?.performance === 'poor'
    ).map(cat => cat.category),
    deterioratingAreas: current.categories.filter((cat, index) => 
      cat.performance === 'poor' && previous.categories[index]?.performance === 'good'
    ).map(cat => cat.category)
  };
}

function generateRecommendations(results: any[]) {
  const recommendations = [];
  
  for (const result of results) {
    const { categories, healthMetrics, riskAssessment } = result;
    
    // High-risk category recommendations
    const overBudgetCategories = categories.filter(cat => cat.isOverBudget);
    overBudgetCategories.forEach(cat => {
      if (cat.essential) {
        recommendations.push({
          type: 'urgent',
          category: cat.category,
          message: `Essential category over budget by ${cat.variancePercentage.toFixed(1)}%. Consider reallocating from discretionary categories.`
        });
      } else {
        recommendations.push({
          type: 'important',
          category: cat.category,
          message: `Reduce spending in ${cat.category} by ${Math.abs(cat.variance).toFixed(0)} to get back on track.`
        });
      }
    });
    
    // Consistency recommendations
    const erraticCategories = categories.filter(cat => cat.spendingPattern.pattern === 'erratic');
    erraticCategories.forEach(cat => {
      recommendations.push({
        type: 'improvement',
        category: cat.category,
        message: `${cat.category} shows erratic spending. Consider setting weekly spending limits.`
      });
    });
    
    // Velocity recommendations
    if (result.velocityAnalysis.trend === 'accelerating') {
      recommendations.push({
        type: 'warning',
        category: 'overall',
        message: 'Spending velocity is increasing. Review recent purchases and identify unnecessary expenses.'
      });
    }
  }
  
  return recommendations;
}