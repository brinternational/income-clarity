/**
 * Portfolio Strategy Hub API Route
 * GET: Fetch portfolio strategy hub data
 * POST: Update portfolio strategy hub data
 */

import { NextRequest, NextResponse } from 'next/server';
import { superCardsDatabase } from '@/lib/services/super-cards-database.service';
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const portfolioStrategyData = await superCardsDatabase.getPortfolioStrategyHubData();
    
    if (!portfolioStrategyData) {
      // Initialize with sample data if no data exists
      await superCardsDatabase.initializeWithSampleData();
      const newPortfolioData = await superCardsDatabase.getPortfolioStrategyHubData();
      
      if (!newPortfolioData) {
        // Return fallback data if initialization fails
        return NextResponse.json({
          portfolioComposition: {
            stocks: 70,
            bonds: 20,
            reits: 5,
            cash: 5,
            holdings: [
              { symbol: 'SCHD', allocation: 30, value: 37500, shares: 586 },
              { symbol: 'VTI', allocation: 25, value: 31250, shares: 102 },
              { symbol: 'VXUS', allocation: 15, value: 18750, shares: 382 },
              { symbol: 'BND', allocation: 20, value: 25000, shares: 279 },
              { symbol: 'VNQ', allocation: 5, value: 6250, shares: 75 },
              { symbol: 'VMOT', allocation: 5, value: 6250, shares: 120 }
            ]
          },
          rebalancingSuggestions: {
            suggestions: [
              {
                id: 'rebalance-1',
                type: 'rebalance',
                priority: 'medium',
                action: 'Reduce SCHD allocation',
                description: 'SCHD is overweight by 3%. Consider trimming position.',
                impact: '+0.2% expected return',
                targetAllocation: 27,
                currentAllocation: 30
              },
              {
                id: 'rebalance-2',
                type: 'add',
                priority: 'low',
                action: 'Increase international exposure',
                description: 'Consider adding more to VXUS for global diversification.',
                impact: '-0.1% volatility',
                targetAllocation: 18,
                currentAllocation: 15
              }
            ],
            rebalanceNeeded: false,
            lastRebalance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
            nextRebalanceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
          },
          healthMetrics: {
            healthScore: 85,
            diversificationScore: 78,
            riskScore: 60,
            expenseRatio: 0.08,
            yieldScore: 92,
            grades: {
              overall: 'A',
              diversification: 'B+',
              cost: 'A+',
              risk: 'B',
              yield: 'A'
            }
          },
          sectorAllocation: {
            technology: 22.5,
            healthcare: 18.2,
            financials: 15.8,
            consumerDiscretionary: 12.3,
            industrials: 10.1,
            communication: 8.7,
            consumerStaples: 7.4,
            energy: 3.2,
            utilities: 1.8
          },
          riskAnalysis: {
            volatility: 0.165,
            sharpeRatio: 1.24,
            maxDrawdown: -0.18,
            beta: 0.92,
            riskLevel: 'moderate',
            riskMetrics: {
              valueAtRisk: -0.025,
              expectedShortfall: -0.038,
              correlationToSPY: 0.88
            },
            riskFactors: [
              {
                factor: 'Market Risk',
                exposure: 0.85,
                description: 'Correlated with overall market movements'
              },
              {
                factor: 'Interest Rate Risk',
                exposure: 0.35,
                description: 'Moderate sensitivity to interest rate changes'
              },
              {
                factor: 'Sector Concentration',
                exposure: 0.22,
                description: 'Well diversified across sectors'
              }
            ]
          },
          timestamp: new Date().toISOString()
        });
      }
      
      return NextResponse.json({
        portfolioComposition: newPortfolioData.portfolioComposition,
        rebalancingSuggestions: newPortfolioData.rebalancingSuggestions,
        healthMetrics: newPortfolioData.healthMetrics,
        sectorAllocation: newPortfolioData.sectorAllocation,
        riskAnalysis: newPortfolioData.riskAnalysis,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      portfolioComposition: portfolioStrategyData.portfolioComposition,
      rebalancingSuggestions: portfolioStrategyData.rebalancingSuggestions,
      healthMetrics: portfolioStrategyData.healthMetrics,
      sectorAllocation: portfolioStrategyData.sectorAllocation,
      riskAnalysis: portfolioStrategyData.riskAnalysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Portfolio Strategy Hub API error:', error);
    
    // Return fallback data on error
    return NextResponse.json({
      portfolioComposition: {
        stocks: 70,
        bonds: 20,
        reits: 5,
        cash: 5,
        holdings: [
          { symbol: 'SCHD', allocation: 30, value: 37500, shares: 586 },
          { symbol: 'VTI', allocation: 25, value: 31250, shares: 102 },
          { symbol: 'VXUS', allocation: 15, value: 18750, shares: 382 },
          { symbol: 'BND', allocation: 20, value: 25000, shares: 279 },
          { symbol: 'VNQ', allocation: 5, value: 6250, shares: 75 },
          { symbol: 'VMOT', allocation: 5, value: 6250, shares: 120 }
        ]
      },
      rebalancingSuggestions: {
        suggestions: [
          {
            id: 'rebalance-1',
            type: 'rebalance',
            priority: 'medium',
            action: 'Reduce SCHD allocation',
            description: 'SCHD is overweight by 3%. Consider trimming position.',
            impact: '+0.2% expected return',
            targetAllocation: 27,
            currentAllocation: 30
          }
        ],
        rebalanceNeeded: false,
        lastRebalance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        nextRebalanceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      },
      healthMetrics: {
        healthScore: 85,
        diversificationScore: 78,
        riskScore: 60,
        expenseRatio: 0.08,
        yieldScore: 92,
        grades: {
          overall: 'A',
          diversification: 'B+',
          cost: 'A+',
          risk: 'B',
          yield: 'A'
        }
      },
      sectorAllocation: {
        technology: 22.5,
        healthcare: 18.2,
        financials: 15.8,
        consumerDiscretionary: 12.3,
        industrials: 10.1,
        communication: 8.7,
        consumerStaples: 7.4,
        energy: 3.2,
        utilities: 1.8
      },
      riskAnalysis: {
        volatility: 0.165,
        sharpeRatio: 1.24,
        maxDrawdown: -0.18,
        beta: 0.92,
        riskLevel: 'moderate',
        riskMetrics: {
          valueAtRisk: -0.025,
          expectedShortfall: -0.038,
          correlationToSPY: 0.88
        },
        riskFactors: [
          {
            factor: 'Market Risk',
            exposure: 0.85,
            description: 'Correlated with overall market movements'
          },
          {
            factor: 'Interest Rate Risk',
            exposure: 0.35,
            description: 'Moderate sensitivity to interest rate changes'
          },
          {
            factor: 'Sector Concentration',
            exposure: 0.22,
            description: 'Well diversified across sectors'
          }
        ]
      },
      timestamp: new Date().toISOString()
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const success = await superCardsDatabase.updatePortfolioStrategyHubData(data);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Portfolio strategy hub data updated successfully' });
    } else {
      return NextResponse.json(
        { success: false, message: 'Failed to update portfolio strategy hub data' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error updating portfolio strategy hub data:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}