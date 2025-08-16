/**
 * Individual Portfolio API Routes
 * GET, PUT, DELETE operations for specific portfolios
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma-client'
import { z } from 'zod'

const DEFAULT_USER_ID = 'default-user'

const PortfolioUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  type: z.enum(['401k', 'IRA', 'Taxable', 'Crypto']).optional(),
  institution: z.string().optional(),
  isPrimary: z.boolean().optional()
})

interface RouteContext {
  params: { id: string }
}

// GET /api/portfolios/[id] - Get single portfolio with holdings
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = context.params
    console.log('📊 Fetching portfolio:', id)
    const portfolio = await prisma.portfolio.findFirst({
      where: { 
        id: id,
        userId: DEFAULT_USER_ID // Ensure user owns this portfolio
      },
      include: {
        holdings: {
          orderBy: [
            { shares: 'desc' }
          ]
        },
        _count: {
          select: { holdings: true }
        }
      }
    })

    if (!portfolio) {
      return NextResponse.json({
        success: false,
        error: 'Portfolio not found'
      }, { status: 404 })
    }

    // Calculate detailed metrics
    const totalValue = portfolio.holdings.reduce((sum, holding) => {
      return sum + (holding.shares * (holding.currentPrice || 0))
    }, 0)

    const totalCostBasis = portfolio.holdings.reduce((sum, holding) => {
      return sum + holding.costBasis
    }, 0)

    const totalGainLoss = totalValue - totalCostBasis
    const totalReturn = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0

    // Calculate annual dividend income
    const annualDividendIncome = portfolio.holdings.reduce((sum, holding) => {
      const dividendYield = holding.dividendYield || 0
      const marketValue = holding.shares * (holding.currentPrice || 0)
      return sum + (marketValue * dividendYield)
    }, 0)

    const portfolioWithMetrics = {
      ...portfolio,
      metrics: {
        totalValue,
        totalCostBasis,
        totalGainLoss,
        totalReturn,
        annualDividendIncome,
        monthlyDividendIncome: annualDividendIncome / 12,
        holdingsCount: portfolio.holdings.length
      }
    }

    console.log('✅ Portfolio retrieved with metrics')
    return NextResponse.json({
      success: true,
      data: portfolioWithMetrics
    })

  } catch (error) {
    console.error('❌ Error fetching portfolio:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )