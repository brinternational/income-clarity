/**
 * Portfolios API Routes Tests
 * Tests CRUD operations for portfolios
 */

import { GET as portfoliosGET, POST as portfoliosPOST } from '@/app/api/portfolios/route'
import { GET as portfolioGET, PUT as portfolioPUT, DELETE as portfolioDELETE } from '@/app/api/portfolios/[id]/route'
import { NextRequest } from 'next/server'

// Mock Prisma
jest.mock('@/lib/db', () => ({
  prisma: {
    portfolio: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    holding: {
      findMany: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    session: {
      findUnique: jest.fn(),
    },
  },
}))

describe('Portfolios API Routes', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  }

  const mockSession = {
    id: 'session-1',
    userId: 'user-1',
    user: mockUser,
  }

  const mockPortfolio = {
    id: 'portfolio-1',
    name: 'Test Portfolio',
    type: 'TAXABLE',
    institution: 'Test Broker',
    isPrimary: true,
    userId: 'user-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    const { prisma } = require('@/lib/db')
    prisma.session.findUnique.mockResolvedValue(mockSession)
  })

  describe('GET /api/portfolios', () => {
    it('should return user portfolios with statistics', async () => {
      const { prisma } = require('@/lib/db')
      
      prisma.portfolio.findMany.mockResolvedValue([mockPortfolio])
      prisma.holding.count.mockResolvedValue(5)
      prisma.holding.aggregate.mockResolvedValue({
        _sum: { shares: 100 },
        _avg: { costBasis: 50 },
      })

      const request = new NextRequest('http://localhost:3000/api/portfolios', {
        method: 'GET',
        headers: {
          cookie: 'session-token=valid-token',
        },
      })

      const response = await portfoliosGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.portfolios).toHaveLength(1)
      expect(data.portfolios[0].name).toBe('Test Portfolio')
      expect(data.portfolios[0].stats).toBeDefined()
      expect(data.portfolios[0].stats.totalHoldings).toBe(5)
    })

    it('should return 401 for unauthenticated request', async () => {
      const { prisma } = require('@/lib/db')
      prisma.session.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/portfolios', {
        method: 'GET',
      })

      const response = await portfoliosGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Not authenticated')
    })

    it('should handle empty portfolio list', async () => {
      const { prisma } = require('@/lib/db')
      prisma.portfolio.findMany.mockResolvedValue([])

      const request = new NextRequest('http://localhost:3000/api/portfolios', {
        method: 'GET',
        headers: {
          cookie: 'session-token=valid-token',
        },
      })

      const response = await portfoliosGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.portfolios).toHaveLength(0)
    })
  })

  describe('POST /api/portfolios', () => {
    it('should create a new portfolio', async () => {
      const { prisma } = require('@/lib/db')
      prisma.portfolio.create.mockResolvedValue({
        ...mockPortfolio,
        id: 'portfolio-2',
        name: 'New Portfolio',
      })

      const body = {
        name: 'New Portfolio',
        type: 'TAXABLE',
        institution: 'New Broker',
        isPrimary: false,
      }

      const request = new NextRequest('http://localhost:3000/api/portfolios', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          cookie: 'session-token=valid-token',
          'content-type': 'application/json',
        },
      })

      const response = await portfoliosPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.portfolio.name).toBe('New Portfolio')
      expect(prisma.portfolio.create).toHaveBeenCalledWith({
        data: {
          name: 'New Portfolio',
          type: 'TAXABLE',
          institution: 'New Broker',
          isPrimary: false,
          userId: 'user-1',
        },
      })
    })

    it('should validate required fields', async () => {
      const body = {
        // Missing name
        type: 'TAXABLE',
      }

      const request = new NextRequest('http://localhost:3000/api/portfolios', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          cookie: 'session-token=valid-token',
          'content-type': 'application/json',
        },
      })

      const response = await portfoliosPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Name is required')
    })

    it('should validate portfolio type', async () => {
      const body = {
        name: 'Test Portfolio',
        type: 'INVALID_TYPE',
      }

      const request = new NextRequest('http://localhost:3000/api/portfolios', {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {
          cookie: 'session-token=valid-token',
          'content-type': 'application/json',
        },
      })

      const response = await portfoliosPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('Invalid portfolio type')
    })
  })

  describe('GET /api/portfolios/[id]', () => {
    it('should return specific portfolio with holdings', async () => {
      const { prisma } = require('@/lib/db')
      
      const portfolioWithHoldings = {
        ...mockPortfolio,
        holdings: [
          {
            id: 'holding-1',
            ticker: 'SCHD',
            shares: 100,
            costBasis: 50,
            currentPrice: 55,
            portfolioId: 'portfolio-1',
          },
        ],
      }

      prisma.portfolio.findUnique.mockResolvedValue(portfolioWithHoldings)

      const request = new NextRequest('http://localhost:3000/api/portfolios/portfolio-1', {
        method: 'GET',
        headers: {
          cookie: 'session-token=valid-token',
        },
      })

      const response = await portfolioGET(request, { params: { id: 'portfolio-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.portfolio.name).toBe('Test Portfolio')
      expect(data.portfolio.holdings).toHaveLength(1)
      expect(data.portfolio.holdings[0].ticker).toBe('SCHD')
    })

    it('should return 404 for non-existent portfolio', async () => {
      const { prisma } = require('@/lib/db')
      prisma.portfolio.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/portfolios/non-existent', {
        method: 'GET',
        headers: {
          cookie: 'session-token=valid-token',
        },
      })

      const response = await portfolioGET(request, { params: { id: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Portfolio not found')
    })

    it('should return 403 for unauthorized access', async () => {
      const { prisma } = require('@/lib/db')
      const unauthorizedPortfolio = {
        ...mockPortfolio,
        userId: 'other-user',
      }
      prisma.portfolio.findUnique.mockResolvedValue(unauthorizedPortfolio)

      const request = new NextRequest('http://localhost:3000/api/portfolios/portfolio-1', {
        method: 'GET',
        headers: {
          cookie: 'session-token=valid-token',
        },
      })

      const response = await portfolioGET(request, { params: { id: 'portfolio-1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Access denied')
    })
  })

  describe('PUT /api/portfolios/[id]', () => {
    it('should update portfolio successfully', async () => {
      const { prisma } = require('@/lib/db')
      
      prisma.portfolio.findUnique.mockResolvedValue(mockPortfolio)
      prisma.portfolio.update.mockResolvedValue({
        ...mockPortfolio,
        name: 'Updated Portfolio',
      })

      const body = {
        name: 'Updated Portfolio',
        institution: 'Updated Broker',
      }

      const request = new NextRequest('http://localhost:3000/api/portfolios/portfolio-1', {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          cookie: 'session-token=valid-token',
          'content-type': 'application/json',
        },
      })

      const response = await portfolioPUT(request, { params: { id: 'portfolio-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.portfolio.name).toBe('Updated Portfolio')
      expect(prisma.portfolio.update).toHaveBeenCalledWith({
        where: { id: 'portfolio-1' },
        data: {
          name: 'Updated Portfolio',
          institution: 'Updated Broker',
        },
      })
    })

    it('should validate ownership before update', async () => {
      const { prisma } = require('@/lib/db')
      const unauthorizedPortfolio = {
        ...mockPortfolio,
        userId: 'other-user',
      }
      prisma.portfolio.findUnique.mockResolvedValue(unauthorizedPortfolio)

      const body = {
        name: 'Updated Portfolio',
      }

      const request = new NextRequest('http://localhost:3000/api/portfolios/portfolio-1', {
        method: 'PUT',
        body: JSON.stringify(body),
        headers: {
          cookie: 'session-token=valid-token',
          'content-type': 'application/json',
        },
      })

      const response = await portfolioPUT(request, { params: { id: 'portfolio-1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Access denied')
    })
  })

  describe('DELETE /api/portfolios/[id]', () => {
    it('should delete portfolio successfully', async () => {
      const { prisma } = require('@/lib/db')
      
      prisma.portfolio.findUnique.mockResolvedValue(mockPortfolio)
      prisma.portfolio.delete.mockResolvedValue(mockPortfolio)

      const request = new NextRequest('http://localhost:3000/api/portfolios/portfolio-1', {
        method: 'DELETE',
        headers: {
          cookie: 'session-token=valid-token',
        },
      })

      const response = await portfolioDELETE(request, { params: { id: 'portfolio-1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(prisma.portfolio.delete).toHaveBeenCalledWith({
        where: { id: 'portfolio-1' },
      })
    })

    it('should validate ownership before deletion', async () => {
      const { prisma } = require('@/lib/db')
      const unauthorizedPortfolio = {
        ...mockPortfolio,
        userId: 'other-user',
      }
      prisma.portfolio.findUnique.mockResolvedValue(unauthorizedPortfolio)

      const request = new NextRequest('http://localhost:3000/api/portfolios/portfolio-1', {
        method: 'DELETE',
        headers: {
          cookie: 'session-token=valid-token',
        },
      })

      const response = await portfolioDELETE(request, { params: { id: 'portfolio-1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Access denied')
    })

    it('should return 404 for non-existent portfolio', async () => {
      const { prisma } = require('@/lib/db')
      prisma.portfolio.findUnique.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/portfolios/non-existent', {
        method: 'DELETE',
        headers: {
          cookie: 'session-token=valid-token',
        },
      })

      const response = await portfolioDELETE(request, { params: { id: 'non-existent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Portfolio not found')
    })
  })
})