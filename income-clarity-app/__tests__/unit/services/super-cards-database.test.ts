/**
 * Super Cards Database Service Tests
 * Tests database operations for all super card hubs
 */

import { superCardsDatabase } from '@/lib/services/super-cards-db/super-cards-database.service'

// Mock better-sqlite3
const mockDb = {
  prepare: jest.fn(),
  close: jest.fn(),
}

const mockStatement = {
  run: jest.fn(),
  get: jest.fn(),
  all: jest.fn(),
}

jest.mock('better-sqlite3', () => {
  return jest.fn().mockImplementation(() => mockDb)
})

// Mock path module
jest.mock('path', () => ({
  join: jest.fn().mockReturnValue('/mock/path/super-cards.sqlite'),
}))

describe('Super Cards Database Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.prepare.mockReturnValue(mockStatement)
  })

  describe('Income Hub Operations', () => {
    it('should get income hub data successfully', async () => {
      const mockData = {
        id: 1,
        monthly_dividend_income: 4500,
        gross_monthly: 4500,
        tax_owed: 675,
        net_monthly: 3825,
        monthly_expenses: 3200,
        available_to_reinvest: 625,
        above_zero_line: 1,
        expense_milestones: JSON.stringify([
          { name: 'Food', target: 800, current: 750 }
        ]),
        last_updated: '2024-01-15T10:00:00.000Z'
      }

      mockStatement.get.mockReturnValue(mockData)

      const result = await superCardsDatabase.getIncomeHubData()

      expect(result).toBeDefined()
      expect(result?.monthlyDividendIncome).toBe(4500)
      expect(result?.aboveZeroLine).toBe(true)
      expect(result?.expenseMilestones).toHaveLength(1)
      expect(result?.expenseMilestones[0].name).toBe('Food')
    })

    it('should return null when no income hub data exists', async () => {
      mockStatement.get.mockReturnValue(null)

      const result = await superCardsDatabase.getIncomeHubData()

      expect(result).toBeNull()
    })

    it('should update income hub data successfully', async () => {
      mockStatement.run.mockReturnValue({ changes: 1 })

      const updateData = {
        monthlyDividendIncome: 5000,
        grossMonthly: 5000,
        taxOwed: 750,
        netMonthly: 4250,
        monthlyExpenses: 3400,
        availableToReinvest: 850,
        aboveZeroLine: true,
      }

      const result = await superCardsDatabase.updateIncomeHubData(updateData)

      expect(result).toBe(true)
      expect(mockStatement.run).toHaveBeenCalledWith(
        5000, 5000, 750, 4250, 3400, 850, 1
      )
    })

    it('should handle database errors gracefully', async () => {
      mockStatement.get.mockImplementation(() => {
        throw new Error('Database error')
      })

      const result = await superCardsDatabase.getIncomeHubData()

      expect(result).toBeNull()
    })
  })

  describe('Performance Hub Operations', () => {
    it('should get performance hub data successfully', async () => {
      const mockData = {
        id: 1,
        portfolio_value: 125000,
        total_return: 8.2,
        dividend_yield: 3.8,
        monthly_dividends: 4500,
        yearly_dividends: 54000,
        spy_comparison: 2.1,
        last_updated: '2024-01-15T10:00:00.000Z'
      }

      mockStatement.get.mockReturnValue(mockData)

      const result = await superCardsDatabase.getPerformanceHubData()

      expect(result).toBeDefined()
      expect(result?.portfolioValue).toBe(125000)
      expect(result?.totalReturn).toBe(8.2)
      expect(result?.dividendYield).toBe(3.8)
      expect(result?.spyComparison).toBe(2.1)
    })

    it('should update performance hub data successfully', async () => {
      mockStatement.run.mockReturnValue({ changes: 1 })

      const updateData = {
        portfolioValue: 130000,
        totalReturn: 8.5,
        dividendYield: 3.9,
        monthlyDividends: 4750,
        yearlyDividends: 57000,
        spyComparison: 2.3,
      }

      const result = await superCardsDatabase.updatePerformanceHubData(updateData)

      expect(result).toBe(true)
      expect(mockStatement.run).toHaveBeenCalledWith(
        130000, 8.5, 3.9, 4750, 57000, 2.3
      )
    })
  })

  describe('Portfolio Strategy Hub Operations', () => {
    it('should get portfolio strategy hub data successfully', async () => {
      const holdings = [
        { symbol: 'SCHD', allocation: 40 },
        { symbol: 'VTI', allocation: 30 },
      ]
      const sectorAllocation = [
        { sector: 'Technology', percentage: 35 },
        { sector: 'Financial', percentage: 25 },
      ]

      const mockData = {
        id: 1,
        holdings_json: JSON.stringify(holdings),
        sector_allocation_json: JSON.stringify(sectorAllocation),
        risk_metrics_json: JSON.stringify({ volatility: 0.15, sharpe: 1.2 }),
        strategies_json: JSON.stringify(['Core-Satellite', 'Dividend Growth']),
        last_updated: '2024-01-15T10:00:00.000Z'
      }

      mockStatement.get.mockReturnValue(mockData)

      const result = await superCardsDatabase.getPortfolioStrategyHubData()

      expect(result).toBeDefined()
      expect(result?.holdings).toHaveLength(2)
      expect(result?.sectorAllocation).toHaveLength(2)
      expect(result?.holdings[0].symbol).toBe('SCHD')
      expect(result?.sectorAllocation[0].sector).toBe('Technology')
    })

    it('should update portfolio strategy hub data successfully', async () => {
      mockStatement.run.mockReturnValue({ changes: 1 })

      const updateData = {
        holdings: [{ symbol: 'SCHD', allocation: 45 }],
        sectorAllocation: [{ sector: 'Technology', percentage: 40 }],
        riskMetrics: { volatility: 0.16, sharpe: 1.3 },
        strategies: ['Growth', 'Value'],
      }

      const result = await superCardsDatabase.updatePortfolioStrategyHubData(updateData)

      expect(result).toBe(true)
    })
  })

  describe('Tax Strategy Hub Operations', () => {
    it('should get tax strategy hub data successfully', async () => {
      const strategies = [
        { name: 'Tax Loss Harvesting', potential: 1200 },
        { name: 'Asset Location', potential: 800 },
      ]

      const mockData = {
        id: 1,
        current_location: 'California',
        tax_rate: 0.32,
        strategies_json: JSON.stringify(strategies),
        potential_savings: 2000,
        last_updated: '2024-01-15T10:00:00.000Z'
      }

      mockStatement.get.mockReturnValue(mockData)

      const result = await superCardsDatabase.getTaxStrategyHubData()

      expect(result).toBeDefined()
      expect(result?.currentLocation).toBe('California')
      expect(result?.taxRate).toBe(0.32)
      expect(result?.strategies).toHaveLength(2)
      expect(result?.potentialSavings).toBe(2000)
    })
  })

  describe('Financial Planning Hub Operations', () => {
    it('should get financial planning hub data successfully', async () => {
      const fireTargets = [
        { type: 'Lean FIRE', amount: 1000000, timeline: 15 },
        { type: 'Fat FIRE', amount: 2500000, timeline: 25 },
      ]
      const milestones = [
        { name: 'Emergency Fund', target: 25000, current: 20000 },
      ]

      const mockData = {
        id: 1,
        fire_targets_json: JSON.stringify(fireTargets),
        milestones_json: JSON.stringify(milestones),
        projections_json: JSON.stringify({ coastFI: 850000 }),
        last_updated: '2024-01-15T10:00:00.000Z'
      }

      mockStatement.get.mockReturnValue(mockData)

      const result = await superCardsDatabase.getFinancialPlanningHubData()

      expect(result).toBeDefined()
      expect(result?.fireTargets).toHaveLength(2)
      expect(result?.milestones).toHaveLength(1)
      expect(result?.fireTargets[0].type).toBe('Lean FIRE')
      expect(result?.milestones[0].name).toBe('Emergency Fund')
    })

    it('should update financial planning hub data successfully', async () => {
      mockStatement.run.mockReturnValue({ changes: 1 })

      const updateData = {
        fireTargets: [{ type: 'Coast FIRE', amount: 500000, timeline: 10 }],
        milestones: [{ name: 'House Down Payment', target: 50000, current: 30000 }],
        projections: { coastFI: 900000 },
      }

      const result = await superCardsDatabase.updateFinancialPlanningHubData(updateData)

      expect(result).toBe(true)
    })
  })

  describe('Portfolio Holdings Operations', () => {
    it('should get portfolio holdings successfully', async () => {
      const mockHoldings = [
        {
          id: 1,
          symbol: 'SCHD',
          shares: 586,
          avg_cost: 75.50,
          current_price: 78.25,
          dividend_yield: 3.8,
          annual_dividend: 4200
        },
        {
          id: 2,
          symbol: 'VTI',
          shares: 102,
          avg_cost: 220.00,
          current_price: 225.50,
          dividend_yield: 1.4,
          annual_dividend: 320
        }
      ]

      mockStatement.all.mockReturnValue(mockHoldings)

      const result = await superCardsDatabase.getPortfolioHoldings()

      expect(result).toHaveLength(2)
      expect(result[0].symbol).toBe('SCHD')
      expect(result[0].shares).toBe(586)
      expect(result[1].symbol).toBe('VTI')
      expect(result[1].currentPrice).toBe(225.50)
    })

    it('should return empty array when no holdings exist', async () => {
      mockStatement.all.mockReturnValue([])

      const result = await superCardsDatabase.getPortfolioHoldings()

      expect(result).toHaveLength(0)
    })

    it('should update portfolio holding successfully', async () => {
      mockStatement.run.mockReturnValue({ changes: 1 })

      const holding = {
        id: 1,
        symbol: 'SCHD',
        shares: 600,
        avgCost: 76.00,
        currentPrice: 79.00,
        dividendYield: 3.9,
        annualDividend: 4400
      }

      const result = await superCardsDatabase.updatePortfolioHolding(holding)

      expect(result).toBe(true)
      expect(mockStatement.run).toHaveBeenCalledWith(
        600, 76.00, 79.00, 3.9, 4400, 'SCHD'
      )
    })
  })

  describe('Database Initialization', () => {
    it('should initialize with sample data successfully', async () => {
      mockStatement.run.mockReturnValue({ changes: 1 })

      const result = await superCardsDatabase.initializeWithSampleData()

      expect(result).toBe(true)
    })

    it('should handle initialization errors gracefully', async () => {
      mockStatement.run.mockImplementation(() => {
        throw new Error('Initialization error')
      })

      const result = await superCardsDatabase.initializeWithSampleData()

      expect(result).toBe(false)
    })

    it('should close database connection', async () => {
      await superCardsDatabase.closeConnection()

      expect(mockDb.close).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle JSON parsing errors in complex data', async () => {
      const mockData = {
        id: 1,
        holdings_json: 'invalid json',
        sector_allocation_json: '[]',
        risk_metrics_json: '{}',
        strategies_json: '[]',
        last_updated: '2024-01-15T10:00:00.000Z'
      }

      mockStatement.get.mockReturnValue(mockData)

      const result = await superCardsDatabase.getPortfolioStrategyHubData()

      expect(result).toBeNull()
    })

    it('should handle database connection failures', async () => {
      mockDb.prepare.mockImplementation(() => {
        throw new Error('Connection failed')
      })

      const result = await superCardsDatabase.getIncomeHubData()

      expect(result).toBeNull()
    })

    it('should handle update failures gracefully', async () => {
      mockStatement.run.mockImplementation(() => {
        throw new Error('Update failed')
      })

      const result = await superCardsDatabase.updateIncomeHubData({
        monthlyDividendIncome: 5000
      })

      expect(result).toBe(false)
    })
  })
})