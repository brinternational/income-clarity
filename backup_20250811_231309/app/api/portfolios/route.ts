/**
 * Portfolio API Routes - CRUD Operations
 * SQLite/Prisma based portfolio management for Income Clarity Lite
 * Supports all portfolio operations with proper validation and error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma-client'
import { z } from 'zod'

// Default user ID for development (in production, get from session)
const DEFAULT_USER_ID = 'default-user'

// Validation schemas
const PortfolioCreateSchema = z.object({
  name: z.string().min(2, 'Portfolio name must be at least 2 characters').max(100),
  type: z.enum(['401k', 'IRA', 'Taxable', 'Crypto']),
  institution: z.string().optional(),
  isPrimary: z.boolean().optional().default(false)
})

const PortfolioUpdateSchema = PortfolioCreateSchema.partial()

// GET /api/portfolios - List all portfolios for user
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching portfolios for user:', DEFAULT_USER_ID)
    const portfolios = await prisma.portfolio.findMany({
      where: { userId: DEFAULT_USER_ID },
      include: {
        holdings: {
          select: {
            id: true,
            ticker: true,
            shares: true,
            costBasis: true,
            currentPrice: true,
            sector: true
          }
        },
        _count: {
          select: { holdings: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Calculate portfolio values
    const portfoliosWithMetrics = portfolios.map(portfolio => {
      const totalValue = portfolio.holdings.reduce((sum, holding) => {
        return sum + (holding.shares * (holding.currentPrice || 0))
      }, 0)

      const totalCostBasis = portfolio.holdings.reduce((sum, holding) => {
        return sum + holding.costBasis
      }, 0)

      const totalGainLoss = totalValue - totalCostBasis
      const totalReturn = totalCostBasis > 0 ? (totalGainLoss / totalCostBasis) * 100 : 0

      return {
        ...portfolio,
        metrics: {
          totalValue: totalValue,
          totalCostBasis: totalCostBasis,
          totalGainLoss: totalGainLoss,
          totalReturn: totalReturn,
          holdingsCount: portfolio.holdings.length
        }
      }
    })

    console.log('✅ Successfully retrieved', portfolios.length, 'portfolios')
    return NextResponse.json({
      success: true,
      data: portfoliosWithMetrics,
      count: portfolios.length
    })

  } catch (error) {
    console.error('❌ Error fetching portfolios:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )