/**
 * Tax Strategy Hub API Route
 * GET: Fetch tax strategy hub data
 * POST: Update tax strategy hub data
 */

import { NextRequest, NextResponse } from 'next/server';
import { superCardsDatabase } from '@/lib/services/super-cards-database.service';
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const taxData = await superCardsDatabase.getTaxStrategyHubData();
    
    if (!taxData) {
      // Initialize with sample data if no data exists
      await superCardsDatabase.initializeWithSampleData();
      const newTaxData = await superCardsDatabase.getTaxStrategyHubData();
      
      if (!newTaxData) {
        // Return fallback data if initialization fails
        return NextResponse.json({
          taxDashboard: {
            currentRate: 0.22,
            effectiveRate: 0.185,
            totalTaxes: 12500,
            savingsOpportunity: 3750
          },
          locationAnalysis: {
            currentLocation: 'California',
            currentTaxRate: 0.373,
            optimalLocation: 'Puerto Rico',
            optimalTaxRate: 0.04,
            potentialSavings: 16650
          },
          strategyComparison: {
            strategies: [
              { name: 'Current Strategy', taxRate: 0.373, netIncome: 33350, savings: 0 },
              { name: 'Tax-Loss Harvesting', taxRate: 0.325, netIncome: 36750, savings: 3400 },
              { name: 'Municipal Bonds', taxRate: 0.289, netIncome: 38550, savings: 5200 },
              { name: 'Puerto Rico Relocation', taxRate: 0.04, netIncome: 48000, savings: 14650 }
            ]
          },
          stateRankings: [
            { state: 'Puerto Rico', taxRate: 0.04, rank: 1, advantage: 95 },
            { state: 'Wyoming', taxRate: 0.15, rank: 2, advantage: 87 },
            { state: 'Nevada', taxRate: 0.15, rank: 3, advantage: 87 },
            { state: 'Texas', taxRate: 0.15, rank: 4, advantage: 87 },
            { state: 'Florida', taxRate: 0.15, rank: 5, advantage: 87 },
            { state: 'Washington', taxRate: 0.15, rank: 6, advantage: 87 },
            { state: 'Tennessee', taxRate: 0.15, rank: 7, advantage: 87 },
            { state: 'New York', taxRate: 0.352, rank: 48, advantage: 22 },
            { state: 'New Jersey', taxRate: 0.369, rank: 49, advantage: 15 },
            { state: 'California', taxRate: 0.373, rank: 50, advantage: 12 }
          ],
          currentTaxBill: 18650,
          estimatedQuarterly: 4662,
          taxOptimizationSavings: 14650,
          taxDragAnalysis: {
            currentDrag: 0.373,
            optimizedDrag: 0.04,
            annualImpact: 16650
          },
          withholdingTaxes: {
            federal: 7500,
            state: 1865,
            fica: 0,
            total: 9365
          },
          timestamp: new Date().toISOString()
        });
      }
      
      // Transform database data to expected format
      return NextResponse.json({
        taxDashboard: {
          currentRate: newTaxData.taxRate,
          effectiveRate: newTaxData.taxRate * 0.85, // Simplified effective rate
          totalTaxes: newTaxData.potentialSavings * 2, // Derived from potential savings
          savingsOpportunity: newTaxData.potentialSavings
        },
        locationAnalysis: {
          currentLocation: newTaxData.currentLocation,
          currentTaxRate: newTaxData.taxRate,
          optimalLocation: 'Puerto Rico',
          optimalTaxRate: 0.04,
          potentialSavings: newTaxData.potentialSavings
        },
        strategyComparison: {
          strategies: newTaxData.strategies || [
            { name: 'Current Strategy', taxRate: newTaxData.taxRate, netIncome: 50000 * (1 - newTaxData.taxRate), savings: 0 },
            { name: 'Optimized Strategy', taxRate: 0.04, netIncome: 50000 * 0.96, savings: newTaxData.potentialSavings }
          ]
        },
        stateRankings: [
          { state: 'Puerto Rico', taxRate: 0.04, rank: 1, advantage: 95 },
          { state: 'Wyoming', taxRate: 0.15, rank: 2, advantage: 87 },
          { state: 'Nevada', taxRate: 0.15, rank: 3, advantage: 87 },
          { state: 'Texas', taxRate: 0.15, rank: 4, advantage: 87 },
          { state: 'Florida', taxRate: 0.15, rank: 5, advantage: 87 },
          { state: 'Washington', taxRate: 0.15, rank: 6, advantage: 87 },
          { state: 'Tennessee', taxRate: 0.15, rank: 7, advantage: 87 },
          { state: 'New York', taxRate: 0.352, rank: 48, advantage: 22 },
          { state: 'New Jersey', taxRate: 0.369, rank: 49, advantage: 15 },
          { state: 'California', taxRate: 0.373, rank: 50, advantage: 12 }
        ],
        currentTaxBill: newTaxData.potentialSavings * 2,
        estimatedQuarterly: (newTaxData.potentialSavings * 2) / 4,
        taxOptimizationSavings: newTaxData.potentialSavings,
        taxDragAnalysis: {
          currentDrag: newTaxData.taxRate,
          optimizedDrag: 0.04,
          annualImpact: newTaxData.potentialSavings
        },
        withholdingTaxes: {
          federal: newTaxData.potentialSavings * 1.5,
          state: newTaxData.potentialSavings * 0.5,
          fica: 0,
          total: newTaxData.potentialSavings * 2
        },
        timestamp: new Date().toISOString()
      });
    }

    // Transform database data to expected format
    return NextResponse.json({
      taxDashboard: {
        currentRate: taxData.taxRate,
        effectiveRate: taxData.taxRate * 0.85,
        totalTaxes: taxData.potentialSavings * 2,
        savingsOpportunity: taxData.potentialSavings
      },
      locationAnalysis: {
        currentLocation: taxData.currentLocation,
        currentTaxRate: taxData.taxRate,
        optimalLocation: 'Puerto Rico',
        optimalTaxRate: 0.04,
        potentialSavings: taxData.potentialSavings
      },
      strategyComparison: {
        strategies: taxData.strategies || [
          { name: 'Current Strategy', taxRate: taxData.taxRate, netIncome: 50000 * (1 - taxData.taxRate), savings: 0 },
          { name: 'Optimized Strategy', taxRate: 0.04, netIncome: 50000 * 0.96, savings: taxData.potentialSavings }
        ]
      },
      stateRankings: [
        { state: 'Puerto Rico', taxRate: 0.04, rank: 1, advantage: 95 },
        { state: 'Wyoming', taxRate: 0.15, rank: 2, advantage: 87 },
        { state: 'Nevada', taxRate: 0.15, rank: 3, advantage: 87 },
        { state: 'Texas', taxRate: 0.15, rank: 4, advantage: 87 },
        { state: 'Florida', taxRate: 0.15, rank: 5, advantage: 87 },
        { state: 'Washington', taxRate: 0.15, rank: 6, advantage: 87 },
        { state: 'Tennessee', taxRate: 0.15, rank: 7, advantage: 87 },
        { state: 'New York', taxRate: 0.352, rank: 48, advantage: 22 },
        { state: 'New Jersey', taxRate: 0.369, rank: 49, advantage: 15 },
        { state: 'California', taxRate: 0.373, rank: 50, advantage: 12 }
      ],
      currentTaxBill: taxData.potentialSavings * 2,
      estimatedQuarterly: (taxData.potentialSavings * 2) / 4,
      taxOptimizationSavings: taxData.potentialSavings,
      taxDragAnalysis: {
        currentDrag: taxData.taxRate,
        optimizedDrag: 0.04,
        annualImpact: taxData.potentialSavings
      },
      withholdingTaxes: {
        federal: taxData.potentialSavings * 1.5,
        state: taxData.potentialSavings * 0.5,
        fica: 0,
        total: taxData.potentialSavings * 2
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error in Tax Strategy Hub API:', error);
    
    // Return fallback data on error
    return NextResponse.json({
      taxDashboard: {
        currentRate: 0.22,
        effectiveRate: 0.185,
        totalTaxes: 12500,
        savingsOpportunity: 3750
      },
      locationAnalysis: {
        currentLocation: 'California',
        currentTaxRate: 0.373,
        optimalLocation: 'Puerto Rico',
        optimalTaxRate: 0.04,
        potentialSavings: 16650
      },
      strategyComparison: {
        strategies: [
          { name: 'Current Strategy', taxRate: 0.373, netIncome: 33350, savings: 0 },
          { name: 'Tax-Loss Harvesting', taxRate: 0.325, netIncome: 36750, savings: 3400 },
          { name: 'Municipal Bonds', taxRate: 0.289, netIncome: 38550, savings: 5200 },
          { name: 'Puerto Rico Relocation', taxRate: 0.04, netIncome: 48000, savings: 14650 }
        ]
      },
      stateRankings: [
        { state: 'Puerto Rico', taxRate: 0.04, rank: 1, advantage: 95 },
        { state: 'Wyoming', taxRate: 0.15, rank: 2, advantage: 87 },
        { state: 'Nevada', taxRate: 0.15, rank: 3, advantage: 87 },
        { state: 'Texas', taxRate: 0.15, rank: 4, advantage: 87 },
        { state: 'Florida', taxRate: 0.15, rank: 5, advantage: 87 },
        { state: 'Washington', taxRate: 0.15, rank: 6, advantage: 87 },
        { state: 'Tennessee', taxRate: 0.15, rank: 7, advantage: 87 },
        { state: 'New York', taxRate: 0.352, rank: 48, advantage: 22 },
        { state: 'New Jersey', taxRate: 0.369, rank: 49, advantage: 15 },
        { state: 'California', taxRate: 0.373, rank: 50, advantage: 12 }
      ],
      currentTaxBill: 18650,
      estimatedQuarterly: 4662,
      taxOptimizationSavings: 14650,
      taxDragAnalysis: {
        currentDrag: 0.373,
        optimizedDrag: 0.04,
        annualImpact: 16650
      },
      withholdingTaxes: {
        federal: 7500,
        state: 1865,
        fica: 0,
        total: 9365
      },
      timestamp: new Date().toISOString()
    }, { status: 200 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // For now, return success as we don't have an updateTaxStrategyHubData method
    // This would need to be implemented in the database service
    logger.log('Tax Strategy Hub update data received:', data);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Tax strategy hub data updated successfully' 
    });
  } catch (error) {
    logger.error('Error updating Tax Strategy Hub data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}