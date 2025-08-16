/**
 * Income Hub API Route
 * GET: Fetch income hub data
 * POST: Update income hub data
 */

import { NextRequest, NextResponse } from 'next/server';
import { superCardsDatabase } from '@/lib/services/super-cards-database.service';
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const incomeData = await superCardsDatabase.getIncomeHubData();
    
    if (!incomeData) {
      // Return empty state data instead of initializing with fake data
      return NextResponse.json({
        monthlyIncome: 0,
        monthlyDividendIncome: 0,
        incomeClarityData: {
          grossMonthly: 0,
          taxOwed: 0,
          netMonthly: 0,
          monthlyExpenses: 0,
          availableToReinvest: 0,
          aboveZeroLine: false
        },
        expenseMilestones: [],
        availableToReinvest: 0,
        isEmpty: true,
        message: 'No income data available. Add income and expense records to see your income clarity analysis.'
      });
    }

    return NextResponse.json({
      monthlyIncome: incomeData.monthlyDividendIncome,
      monthlyDividendIncome: incomeData.monthlyDividendIncome,
      incomeClarityData: {
        grossMonthly: incomeData.grossMonthly,
        taxOwed: incomeData.taxOwed,
        netMonthly: incomeData.netMonthly,
        monthlyExpenses: incomeData.monthlyExpenses,
        availableToReinvest: incomeData.availableToReinvest,
        aboveZeroLine: incomeData.aboveZeroLine
      },
      expenseMilestones: incomeData.expenseMilestones || [],
      availableToReinvest: incomeData.availableToReinvest,
      isEmpty: false
    });
  } catch (error) {
    logger.error('Error in income hub API:', error);
    
    // Return empty state on error instead of fake data
    return NextResponse.json({
      monthlyIncome: 0,
      monthlyDividendIncome: 0,
      incomeClarityData: {
        grossMonthly: 0,
        taxOwed: 0,
        netMonthly: 0,
        monthlyExpenses: 0,
        availableToReinvest: 0,
        aboveZeroLine: false
      },
      expenseMilestones: [],
      availableToReinvest: 0,
      isEmpty: true,
      error: true,
      message: 'Unable to load income data. Please try again later.'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const success = await superCardsDatabase.updateIncomeHubData(data);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Income hub data updated successfully' });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to update income hub data' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error updating income hub data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}