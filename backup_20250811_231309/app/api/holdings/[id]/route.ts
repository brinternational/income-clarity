/**
 * Individual Holding API Routes
 * GET, PUT, DELETE operations for specific holdings
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma-client'
import { z } from 'zod'

const DEFAULT_USER_ID = 'default-user'

const HoldingUpdateSchema = z.object({
  ticker: z.string().min(1).max(10).optional(),
  shares: z.number().positive().optional(),
  costBasis: z.number().positive().optional(),
  purchaseDate: z.string().refine((date) => !isNaN(Date.parse(date)), 'Invalid date format').optional(),
  currentPrice: z.number().positive().optional(),
  dividendYield: z.number().min(0).max(1).optional(),
  sector: z.string().optional()
})

interface RouteContext {
  params: { id: string }
}

// GET /api/holdings/[id] - Get single holding
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = context.params
    console.log('📊 Fetching holding:', id)
    const holding = await prisma.holding.findFirst({
      where: { id: id },
      include: {
        portfolio: {
          where: {
            userId: DEFAULT_USER_ID // Ensure user owns the portfolio
          }
        }
      }
    })

    if (!holding || !holding.portfolio) {
      return NextResponse.json({
        success: false,
        error: 'Holding not found'
      }, { status: 404 })
    }

    // Calculate metrics
    const currentValue = holding.shares * (holding.currentPrice || 0)
    const gainLoss = currentValue - holding.costBasis
    const returnPercentage = holding.costBasis > 0 ? (gainLoss / holding.costBasis) * 100 : 0
    const annualDividendIncome = currentValue * (holding.dividendYield || 0)

    const holdingWithMetrics = {
      ...holding,
      metrics: {
        currentValue,
        gainLoss,
        returnPercentage,
        annualDividendIncome,
        monthlyDividendIncome: annualDividendIncome / 12
      }
    }

    console.log('✅ Holding retrieved with metrics')
    return NextResponse.json({
      success: true,
      data: holdingWithMetrics
    })

  } catch (error) {
    console.error('❌ Error fetching holding:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )