// Data Visualization Charts for Income Clarity
// Modern, responsive chart components built with Recharts

export { PerformanceChart } from './PerformanceChart'
export { DividendProjections } from './DividendProjections'
export { PortfolioComposition } from './PortfolioComposition'
export { IncomeWaterfall } from './IncomeWaterfall'
export { DividendCalendar } from './DividendCalendar'
export { YieldOnCostAnalysis } from './YieldOnCostAnalysis'
export { MilestoneTracker } from './MilestoneTracker'
export { TaxEfficiencyDashboard } from './TaxEfficiencyDashboard'

// Chart Types and Interfaces
export type {
  // Performance Chart Types
  PerformanceDataPoint,
  
  // Dividend Projections Types
  DividendDataPoint,
  
  // Portfolio Composition Types
  HoldingData,
  SectorData,
  
  // Income Waterfall Types
  WaterfallData,
  
  // Dividend Calendar Types
  DividendEvent,
  
  // Yield on Cost Types
  YieldData,
  
  // Milestone Tracker Types
  Milestone,
  
  // Tax Efficiency Types
  LocationTaxData,
} from './types'

// Common Chart Utilities
export const chartUtils = {
  // Color palettes for consistent theming
  colors: {
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#06b6d4',
    purple: '#8b5cf6',
    gray: '#6b7280',
  },
  
  // Format currency
  formatCurrency: (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  },
  
  // Format percentage
  formatPercentage: (value: number, decimals = 1): string => {
    return `${value.toFixed(decimals)}%`
  },
  
  // Format large numbers
  formatCompactNumber: (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
    return value.toString()
  },
  
  // Get responsive chart dimensions
  getChartDimensions: (containerWidth: number) => {
    if (containerWidth < 640) {
      return { width: '100%', height: 250 } // Mobile
    } else if (containerWidth < 1024) {
      return { width: '100%', height: 350 } // Tablet
    } else {
      return { width: '100%', height: 400 } // Desktop
    }
  },
  
  // Export chart data to CSV
  exportToCSV: (data: any[], filename: string) => {
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
}