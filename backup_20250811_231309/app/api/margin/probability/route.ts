import { NextRequest, NextResponse } from 'next/server';
import { 
  calculateMarginCallProbability, 
  calculateSafeMarginLevel,
  calculateMarginCostAnalysis,
  type MarginCallProbabilityRequest,
  type MarginCallProbabilityResponse 
} from '@/lib/margin-calculations';

/**
 * MARGIN CALL PROBABILITY API ENDPOINT
 * 
 * POST /api/margin/probability
 * 
 * Calculate the probability of margin call using Monte Carlo simulation.
 * Supports multiple time horizons and provides comprehensive risk analysis.
 * 
 * Request Body:
 * {
 *   portfolioValue: number;     // Total portfolio value
 *   marginUsed: number;         // Current margin balance
 *   maintenanceRequirement?: number; // Default 0.25 (25%)
 *   annualVolatility?: number;  // Default 0.16 (16%)
 *   daysToLookAhead?: number[]; // Default [30, 60, 90]
 *   iterations?: number;        // Default 5000
 * }
 * 
 * Response:
 * {
 *   probability30Days: number;
 *   probability60Days: number;
 *   probability90Days: number;
 *   riskLevel: 'low' | 'moderate' | 'high';
 *   safeDrawdownPercentage: number;
 *   safeDrawdownDollars: number;
 *   recommendations: string[];
 * }
 */

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Extract and validate required fields
    const {
      portfolioValue,
      marginUsed,
      maintenanceRequirement = 0.25,
      annualVolatility = 0.16,
      daysToLookAhead = [30, 60, 90],
      iterations = 5000
    } = body;

    // Input validation
    if (!portfolioValue || typeof portfolioValue !== 'number') {
      return NextResponse.json(
        { error: 'portfolioValue is required and must be a number' },
        { status: 400 }
      );
    }

    if (marginUsed === undefined || marginUsed === null || typeof marginUsed !== 'number') {
      return NextResponse.json(
        { error: 'marginUsed is required and must be a number' },
        { status: 400 }
      );
    }

    // Additional business logic validation
    if (portfolioValue <= 0) {
      return NextResponse.json(
        { error: 'Portfolio value must be positive' },
        { status: 400 }
      );
    }

    if (marginUsed < 0) {
      return NextResponse.json(
        { error: 'Margin used cannot be negative' },
        { status: 400 }
      );
    }

    if (marginUsed >= portfolioValue) {
      return NextResponse.json(
        { error: 'Margin used cannot equal or exceed portfolio value' },
        { status: 400 }
      );
    }

    // Handle edge case: No margin used
    if (marginUsed === 0) {
      return NextResponse.json({
        probability30Days: 0,
        probability60Days: 0,
        probability90Days: 0,
        riskLevel: 'low' as const,
        safeDrawdownPercentage: 100,
        safeDrawdownDollars: portfolioValue,
        recommendations: [
          '✅ NO MARGIN RISK: You have no margin exposure',
          '💡 OPPORTUNITY: Consider using margin to accelerate income growth',
          `📊 SAFE MARGIN CAPACITY: Up to $${calculateSafeMarginLevel(portfolioValue).toLocaleString()} could be used safely`
        ],
        calculationDetails: {
          currentMarginRatio: 0,
          liquidationThreshold: 0,
          breakEvenPoint: 100,
          stressTestScenarios: []
        }
      } satisfies MarginCallProbabilityResponse);
    }

    // Prepare calculation request
    const calculationRequest: MarginCallProbabilityRequest = {
      portfolioValue,
      marginUsed,
      maintenanceRequirement,
      annualVolatility,
      daysToLookAhead,
      iterations
    };

    // Perform margin call probability calculation
    const result = calculateMarginCallProbability(calculationRequest);

    // Add additional analysis
    const costAnalysis = calculateMarginCostAnalysis(marginUsed);
    const safeMarginLevel = calculateSafeMarginLevel(portfolioValue);

    // Enhanced response with additional insights
    const enhancedResponse = {
      ...result,
      additionalInsights: {
        costAnalysis,
        safeMarginLevel,
        marginEfficiency: {
          currentUtilization: (marginUsed / portfolioValue * 100).toFixed(1),
          safeUtilization: (safeMarginLevel / portfolioValue * 100).toFixed(1),
          utilizationScore: marginUsed <= safeMarginLevel ? 'Safe' : 'Over-leveraged'
        }
      }
    };

    return NextResponse.json(enhancedResponse, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, max-age=0',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    // console.error('Margin probability calculation error:', error);

    // Handle specific calculation errors
    if (error instanceof Error) {
      if (error.message.includes('Portfolio value') || 
          error.message.includes('Margin used') ||
          error.message.includes('Maintenance requirement')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Internal server error during margin call probability calculation',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/margin/probability
 * 
 * Health check and documentation endpoint
 */
export async function GET() {
  return NextResponse.json({
    service: 'Margin Call Probability Calculator',
    version: '1.0.0',
    status: 'operational',
    description: 'Monte Carlo simulation for margin call risk assessment',
    endpoints: {
      POST: {
        description: 'Calculate margin call probability',
        requiredFields: ['portfolioValue', 'marginUsed'],
        optionalFields: ['maintenanceRequirement', 'annualVolatility', 'daysToLookAhead', 'iterations']
      }
    },
    examples: {
      basic: {
        portfolioValue: 100000,
        marginUsed: 30000,
        description: '$100k portfolio with $30k margin (30% usage)'
      },
      conservative: {
        portfolioValue: 100000,
        marginUsed: 15000,
        maintenanceRequirement: 0.30,
        description: '$100k portfolio with $15k margin and 30% maintenance requirement'
      },
      aggressive: {
        portfolioValue: 100000,
        marginUsed: 45000,
        annualVolatility: 0.20,
        description: '$100k portfolio with $45k margin and 20% volatility assumption'
      }
    },
    riskLevels: {
      low: 'Probability < 5%',
      moderate: 'Probability 5-20%',
      high: 'Probability > 20%'
    },
    methodology: {
      simulation: 'Monte Carlo with 5,000 iterations by default',
      distribution: 'Normal distribution of returns',
      volatility: 'Historical SPY volatility (16% annual) as default',
      timeHorizons: '30, 60, and 90 days',
      maintenance: '25% maintenance requirement (industry standard)'
    }
  }, { 
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Content-Type': 'application/json'
    }
  });
}

/**
 * OPTIONS /api/margin/probability
 * 
 * CORS preflight support
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}