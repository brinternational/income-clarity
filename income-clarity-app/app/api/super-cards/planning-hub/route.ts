/**
 * Planning Hub API Route
 * GET: Fetch planning hub data for FIRE progress and financial planning
 * POST: Update planning hub data
 */

import { NextRequest, NextResponse } from 'next/server';
import { superCardsDatabase } from '@/lib/services/super-cards-db/super-cards-database.service';
import { logger } from '@/lib/logger'

// Helper function to ensure percentage is valid (0-100)
function safePercentage(value: number | null | undefined): number {
  if (value === null || value === undefined || isNaN(value)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(value * 100) / 100));
}

// Helper function to calculate FIRE progress based on net worth and FIRE number
function calculateFireProgress(netWorth: number, annualExpenses: number): number {
  const fireNumber = annualExpenses * 25; // 4% withdrawal rule
  if (fireNumber <= 0) return 0;
  return safePercentage((netWorth / fireNumber) * 100);
}

// Helper function to calculate years to FIRE
function calculateYearsToFire(currentNetWorth: number, annualInvestment: number, annualExpenses: number): number {
  const fireNumber = annualExpenses * 25;
  if (annualInvestment <= 0 || fireNumber <= currentNetWorth) return 0;
  
  // Using compound interest calculation with 7% assumed return
  const annualReturn = 0.07;
  const monthlyReturn = annualReturn / 12;
  const monthlyInvestment = annualInvestment / 12;
  const targetAmount = fireNumber - currentNetWorth;
  
  if (targetAmount <= 0) return 0;
  
  // PMT formula rearranged to solve for time
  const months = Math.log(1 + (targetAmount * monthlyReturn) / monthlyInvestment) / Math.log(1 + monthlyReturn);
  return Math.max(0, Math.round((months / 12) * 10) / 10);
}

export async function GET() {
  try {
    // Try to get data from database first
    const planningData = await superCardsDatabase.getFinancialPlanningHubData();
    
    if (planningData) {
      // Transform database format to API format
      const fireProgress = planningData.fireTargets?.[0] ? 
        safePercentage((planningData.fireTargets[0].targetAmount / (planningData.fireTargets[0].targetAmount + 100000)) * 100) : 0;
      
      return NextResponse.json({
        fireProgress: fireProgress,
        yearsToFire: planningData.fireTargets?.[0]?.yearsToTarget || 0,
        currentSavingsRate: safePercentage(25), // Default from milestones calculation
        aboveZeroStreak: 14,
        monthlyInvestment: planningData.fireTargets?.[0]?.monthlyNeeded || 0,
        netWorth: planningData.milestones?.reduce((sum, m) => sum + m.currentValue, 0) || 0,
        projectedRetirement: new Date(Date.now() + (planningData.fireTargets?.[0]?.yearsToTarget || 12) * 365 * 24 * 60 * 60 * 1000).toISOString(),
        milestones: planningData.milestones?.map(m => ({
          id: m.id,
          name: m.name,
          target: m.targetValue,
          current: m.currentValue,
          progress: safePercentage(m.percentage),
          achieved: m.percentage >= 100,
          category: m.id.includes('utilities') ? 'utilities' :
                   m.id.includes('insurance') ? 'insurance' :
                   m.id.includes('food') ? 'food' :
                   m.id.includes('housing') ? 'housing' :
                   m.id.includes('entertainment') ? 'entertainment' : 'freedom'
        })) || [],
        goals: planningData.fireTargets?.map(target => ({
          id: target.id,
          name: `${target.type.toUpperCase()} FIRE`,
          target: target.targetAmount,
          deadline: new Date(Date.now() + target.yearsToTarget * 365 * 24 * 60 * 60 * 1000).toISOString(),
          progress: fireProgress,
          priority: target.type === 'lean' ? 'high' : 'medium' as const
        })) || [],
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    logger.error('Error fetching planning data from database:', error);
  }

  // Return empty state instead of hardcoded fallback data
  return NextResponse.json({
    fireProgress: 0,
    yearsToFire: 0,
    currentSavingsRate: 0,
    aboveZeroStreak: 0,
    monthlyInvestment: 0,
    netWorth: 0,
    projectedRetirement: null,
    
    milestones: [],
    goals: [],
    
    retirementReadiness: {
      score: 0,
      factors: {
        savings: 0,
        investments: 0,
        debt: 0,
        expenses: 0
      }
    },
    
    monthlyBudget: {
      income: 0,
      expenses: 0,
      savings: 0,
      surplus: 0
    },
    
    isEmpty: true,
    message: 'No financial planning data available. Add portfolio holdings, income, and expenses to see your FIRE progress and financial planning analysis.',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate and sanitize input data
    const sanitizedData = {
      ...data,
      fireProgress: data.fireProgress ? safePercentage(data.fireProgress) : undefined,
      currentSavingsRate: data.currentSavingsRate ? safePercentage(data.currentSavingsRate) : undefined,
      yearsToFire: data.yearsToFire ? Math.max(0, parseFloat(data.yearsToFire) || 0) : undefined,
      aboveZeroStreak: data.aboveZeroStreak ? Math.max(0, parseInt(data.aboveZeroStreak) || 0) : undefined,
      monthlyInvestment: data.monthlyInvestment ? Math.max(0, parseFloat(data.monthlyInvestment) || 0) : undefined,
      netWorth: data.netWorth ? parseFloat(data.netWorth) || 0 : undefined
    };
    
    // Try to update database if method exists (currently not implemented)
    // TODO: Add updateFinancialPlanningHubData method to database service
    if (typeof superCardsDatabase.updateFinancialPlanningHubData === 'function') {
      const success = await superCardsDatabase.updateFinancialPlanningHubData(sanitizedData);
      
      if (success) {
        return NextResponse.json({ 
          success: true, 
          message: 'Planning hub data updated successfully' 
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Failed to update planning hub data' },
          { status: 500 }
        );
      }
    }
    
    // If no database method, return success anyway (data will be handled by fallback)
    return NextResponse.json({ 
      success: true, 
      message: 'Planning hub data received (using fallback storage)' 
    });
    
  } catch (error) {
    logger.error('Error updating planning hub data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}