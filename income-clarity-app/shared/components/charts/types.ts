// TypeScript types for all chart components

// Performance Chart Types
export interface PerformanceDataPoint {
  date: string
  portfolioValue: number
  spyValue: number
  dividendIncome: number
  cumulativeDividends: number
}

// Dividend Projections Types
export interface DividendDataPoint {
  month: string
  actualIncome: number | null
  projectedIncome: number
  cumulativeIncome: number
  cumulativeProjected: number
  yoyGrowth: number
  confidenceLevel: number
}

// Portfolio Composition Types
export interface HoldingData {
  symbol: string
  name: string
  value: number
  percentage: number
  sector: string
  dividendYield: number
  risk: 'Low' | 'Medium' | 'High'
}

export interface SectorData {
  name: string
  value: number
  percentage: number
  color: string
  icon: React.ReactNode
  holdings: HoldingData[]
  avgYield: number
  riskLevel: string
}

// Income Waterfall Types
export interface WaterfallData {
  category: string
  value: number
  cumulativeValue: number
  type: 'positive' | 'negative' | 'total'
  icon: React.ReactNode
  description: string
  details?: string[]
}

// Dividend Calendar Types
export interface DividendEvent {
  symbol: string
  companyName: string
  date: string
  amount: number
  type: 'ex-dividend' | 'payment' | 'announcement'
  frequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual'
  yield: number
}

// Yield on Cost Analysis Types
export interface YieldData {
  symbol: string
  companyName: string
  currentYield: number
  yieldOnCost: number
  costBasis: number
  currentPrice: number
  yearsHeld: number
  totalGainLoss: number
  dividendGrowthRate: number
  dividendGrowthYears: number
  isDividendAristocrat: boolean
  isDividendKing: boolean
}

// Milestone Tracker Types
export interface Milestone {
  id: string
  name: string
  description: string
  targetAmount: number
  currentAmount: number
  icon: React.ReactNode
  color: string
  category: 'essential' | 'comfort' | 'freedom'
  isCompleted: boolean
  completedDate?: string
  estimatedCompletion?: string
  priority: number
}

// Tax Efficiency Types
export interface LocationTaxData {
  location: string
  state: string
  federalRate: number
  stateRate: number
  totalRate: number
  grossIncome: number
  totalTax: number
  netIncome: number
  annualSavings: number
  specialProgram?: string
  programDetails?: string
}

// Common Chart Props
export interface ChartBaseProps {
  className?: string
  loading?: boolean
  error?: string | null
  onExport?: (format: 'png' | 'csv') => void
}

// Chart Theme
export interface ChartTheme {
  colors: {
    primary: string
    success: string
    warning: string
    error: string
    info: string
    purple: string
    gray: string
  }
  fonts: {
    body: string
    heading: string
  }
  spacing: {
    xs: number
    sm: number
    md: number
    lg: number
    xl: number
  }
}

// Responsive Breakpoints
export type ChartBreakpoint = 'mobile' | 'tablet' | 'desktop'

// Chart View Types
export type ChartView = 'chart' | 'table' | 'summary'
export type TimeRange = '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL'

// Animation Types
export interface ChartAnimation {
  enabled: boolean
  duration: number
  delay?: number
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out'
}

// Export Types
export type ExportFormat = 'png' | 'jpg' | 'svg' | 'pdf' | 'csv' | 'json'

export interface ExportOptions {
  format: ExportFormat
  filename?: string
  quality?: number // For image exports
  width?: number
  height?: number
}