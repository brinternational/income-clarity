'use client'

import { useState } from 'react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { PieChart, Building2, Zap, Home, TrendingUp, DollarSign } from 'lucide-react'
import type { Holding } from '@/types'

interface SectorData {
  name: string
  value: number
  percentage: number
  color: string
  icon: React.ReactNode
  holdings: string[]
}

// Type guard to ensure we have a valid holding
const isValidHolding = (holding: unknown): holding is Holding => {
  return holding && 
         typeof holding === 'object' && 
         'ticker' in holding && 
         'currentValue' in holding &&
         typeof (holding as Holding).currentValue === 'number'
}

export function SectorAllocationChart() {
  const { holdings } = usePortfolio()
  const [hoveredSector, setHoveredSector] = useState<string | null>(null)

  // Ensure holdings is always an array and filter out invalid holdings
  const safeHoldings = Array.isArray(holdings) 
    ? holdings.filter(isValidHolding) 
    : []

  if (!safeHoldings || safeHoldings.length === 0) {
    return (
      <div 
        className="rounded-xl shadow-lg p-6 transition-all duration-300"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="flex items-center space-x-3 mb-6">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: 'var(--color-accent-secondary)' }}
          >
            <PieChart className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h3 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Sector Allocation
            </h3>
            <p 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Portfolio sector breakdown
            </p>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="text-4xl mb-3 opacity-50">🏭</div>
          <p 
            className="text-sm transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Add holdings to see sector breakdown
          </p>
        </div>
      </div>
    )
  }

  // Sector mapping function
  const mapToStandardSector = (sector: string): { name: string; icon: React.ReactNode; color: string } => {
    const sectorLower = sector.toLowerCase()
    
    if (sectorLower.includes('tech') || sectorLower.includes('technology')) {
      return { name: 'Technology', icon: <Zap className="w-4 h-4" />, color: 'var(--color-info)' }
    }
    if (sectorLower.includes('equity') || sectorLower.includes('income') || sectorLower.includes('financial')) {
      return { name: 'Financials', icon: <DollarSign className="w-4 h-4" />, color: 'var(--color-success)' }
    }
    if (sectorLower.includes('real estate') || sectorLower.includes('reit')) {
      return { name: 'Real Estate', icon: <Home className="w-4 h-4" />, color: 'var(--color-warning)' }
    }
    if (sectorLower.includes('small cap')) {
      return { name: 'Small Cap', icon: <TrendingUp className="w-4 h-4" />, color: 'var(--color-error)' }
    }
    // Default to Diversified for Value, High Dividend, Diversified, etc.
    return { name: 'Diversified', icon: <Building2 className="w-4 h-4" />, color: 'var(--color-accent)' }
  }

  // Calculate sector allocations using safe holdings array
  const totalValue = safeHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0)
  
  // Group holdings by standardized sectors using safe holdings array
  const sectorGroups = safeHoldings.reduce((groups, holding) => {
      const sectorInfo = mapToStandardSector(holding.sector || 'Other')
      const sectorName = sectorInfo.name
    
    if (!groups[sectorName]) {
      groups[sectorName] = {
        name: sectorName,
        value: 0,
        percentage: 0,
        color: sectorInfo.color,
        icon: sectorInfo.icon,
        holdings: []
      }
    }
    
    groups[sectorName].value += holding.currentValue || 0
    groups[sectorName].holdings.push(holding.ticker || 'Unknown')
    
    return groups
  }, {} as { [key: string]: SectorData })

  // Calculate percentages and sort by value
  const sectorData = Object.values(sectorGroups).map(sector => ({
    ...sector,
    percentage: totalValue > 0 ? (sector.value / totalValue) * 100 : 0
  })).sort((a, b) => b.percentage - a.percentage)

  // Calculate pie chart segments
  let cumulativeAngle = 0
  const pieSegments = sectorData.map(sector => {
    const startAngle = cumulativeAngle
    const sweepAngle = (sector.percentage / 100) * 360
    cumulativeAngle += sweepAngle
    
    // Calculate path for SVG arc
    const startAngleRad = (startAngle - 90) * Math.PI / 180
    const endAngleRad = (startAngle + sweepAngle - 90) * Math.PI / 180
    const radius = 80
    const cx = 100
    const cy = 100
    
    const x1 = cx + radius * Math.cos(startAngleRad)
    const y1 = cy + radius * Math.sin(startAngleRad)
    const x2 = cx + radius * Math.cos(endAngleRad)
    const y2 = cy + radius * Math.sin(endAngleRad)
    
    const largeArc = sweepAngle > 180 ? 1 : 0
    const pathData = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ')
    
    return {
      ...sector,
      pathData,
      startAngle,
      sweepAngle
    }
  })

  return (
    <div 
      className="rounded-xl shadow-lg p-6 transition-all duration-300"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
            style={{ backgroundColor: 'var(--color-accent-secondary)' }}
          >
            <PieChart className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h3 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Sector Allocation
            </h3>
            <p 
              className="text-sm transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              ${(totalValue / 1000).toFixed(1)}k diversified
            </p>
          </div>
        </div>
        
        {/* Sector Count Badge */}
        <div 
          className="px-3 py-2 rounded-lg border"
          style={{ 
            backgroundColor: 'var(--color-secondary)',
            borderColor: 'var(--color-accent)',
            color: 'var(--color-accent)'
          }}
        >
          <div className="flex items-center space-x-1">
            <Building2 className="w-4 h-4" />
            <span className="text-xs font-semibold">
              {sectorData.length} Sectors
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Pie Chart */}
      <div className="relative w-56 h-56 mx-auto mb-6">
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full transform -rotate-90"
        >
          {pieSegments.map((segment) => (
            <g key={segment.name}>
              <path
                d={segment.pathData}
                fill={segment.color}
                stroke="var(--color-background)"
                strokeWidth="2"
                className={`transition-all duration-300 cursor-pointer ${
                  hoveredSector === segment.name ? 'opacity-100 drop-shadow-lg' : 'opacity-90'
                }`}
                style={{
                  filter: hoveredSector === segment.name 
                    ? 'brightness(1.1) drop-shadow(0 4px 8px rgba(0,0,0,0.2))' 
                    : 'none',
                  transform: hoveredSector === segment.name ? 'scale(1.02)' : 'scale(1)',
                  transformOrigin: '100px 100px'
                }}
                onMouseEnter={() => setHoveredSector(segment.name)}
                onMouseLeave={() => setHoveredSector(null)}
              />
            </g>
          ))}
        </svg>
        
        {/* Center Information */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {hoveredSector ? (
            <div className="text-center">
              <div 
                className="text-xl font-bold transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {sectorData.find(s => s.name === hoveredSector)?.percentage.toFixed(1)}%
              </div>
              <div 
                className="text-xs transition-colors duration-300"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                ${((sectorData.find(s => s.name === hoveredSector)?.value || 0) / 1000).toFixed(1)}k
              </div>
              <div 
                className="text-xs font-medium mt-1 transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {hoveredSector}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <div 
                className="text-2xl font-bold transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {sectorData.length}
              </div>
              <div 
                className="text-xs transition-colors duration-300"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Sectors
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sector List */}
      <div className="space-y-3">
        {sectorData.map((sector) => (
          <div 
            key={sector.name} 
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
              hoveredSector === sector.name ? 'transform scale-102' : ''
            }`}
            style={{ 
              backgroundColor: hoveredSector === sector.name 
                ? 'var(--color-secondary)' 
                : 'transparent'
            }}
            onMouseEnter={() => setHoveredSector(sector.name)}
            onMouseLeave={() => setHoveredSector(null)}
          >
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-4 h-4 rounded-full transition-all duration-300"
                  style={{ backgroundColor: sector.color }}
                />
                <div 
                  className="transition-colors duration-300"
                  style={{ color: sector.color }}
                >
                  {sector.icon}
                </div>
              </div>
              <div>
                <div 
                  className="font-semibold text-sm transition-colors duration-300"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {sector.name}
                </div>
                <div 
                  className="text-xs transition-colors duration-300"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {sector.holdings.join(', ')}
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div 
                className="text-sm font-semibold transition-colors duration-300"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {sector.percentage.toFixed(1)}%
              </div>
              <div 
                className="text-xs transition-colors duration-300"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                ${(sector.value / 1000).toFixed(1)}k
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Diversification Insight */}
      <div 
        className="mt-6 pt-4 border-t transition-colors duration-300"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center justify-between text-center">
          <div>
            <div 
              className="text-lg font-bold transition-colors duration-300"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {sectorData[0]?.percentage.toFixed(0)}%
            </div>
            <div 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Largest Sector
            </div>
          </div>
          <div>
            <div 
              className="text-lg font-bold transition-colors duration-300"
              style={{ 
                color: sectorData.length >= 4 ? 'var(--color-success)' : 
                       sectorData.length >= 3 ? 'var(--color-warning)' : 'var(--color-error)'
              }}
            >
              {sectorData.length >= 4 ? 'Excellent' : 
               sectorData.length >= 3 ? 'Good' : 'Basic'}
            </div>
            <div 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Diversification
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}