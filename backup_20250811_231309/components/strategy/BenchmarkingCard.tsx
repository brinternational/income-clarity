'use client'

import { useState, useEffect, memo } from 'react'
import { Target, TrendingUp, Users, Award, BarChart3, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation'

interface BenchmarkData {
  name: string
  symbol: string
  performance: number
  yield: number
  volatility: number
  comparison: 'outperforming' | 'underperforming' | 'neutral'
  icon: any
  color: string
}

interface PeerComparison {
  metric: string
  yourValue: number
  peerAverage: number
  percentile: number
  status: 'above' | 'below' | 'average'
}

interface BenchmarkingData {
  benchmarks: BenchmarkData[]
  peerComparisons: PeerComparison[]
  overallRanking: number
  portfolioScore: number
  improvementAreas: string[]
}

const BenchmarkingCardComponent = () => {
  const { profileData, incomeClarityData } = useUserProfile()
  const { portfolio } = usePortfolio()
  const [isVisible, setIsVisible] = useState(false)
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>('SPY')

  const calculateBenchmarking = (): BenchmarkingData => {
    const benchmarks: BenchmarkData[] = [
      {
        name: 'S&P 500',
        symbol: 'SPY',
        performance: 8.2,
        yield: 1.8,
        volatility: 20.1,
        comparison: 'underperforming', // Placeholder
        icon: TrendingUp,
        color: 'text-blue-600'
      },
      {
        name: 'Dividend Aristocrats',
        symbol: 'NOBL',
        performance: 7.8,
        yield: 2.1,
        volatility: 18.5,
        comparison: 'outperforming',
        icon: Award,
        color: 'text-purple-600'
      },
      {
        name: 'High Dividend ETF',
        symbol: 'HDV',
        performance: 6.5,
        yield: 3.8,
        volatility: 16.2,
        comparison: 'outperforming',
        icon: BarChart3,
        color: 'text-green-600'
      },
      {
        name: 'Covered Call ETF',
        symbol: 'JEPI',
        performance: 5.1,
        yield: 8.2,
        volatility: 12.8,
        comparison: 'neutral',
        icon: Target,
        color: 'text-orange-600'
      }
    ]

    const peerComparisons: PeerComparison[] = [
      {
        metric: 'Monthly Income',
        yourValue: incomeClarityData?.grossMonthly || 3825,
        peerAverage: 3200,
        percentile: 68,
        status: 'above'
      },
      {
        metric: 'Tax Efficiency',
        yourValue: profileData?.location?.state === 'Puerto Rico' ? 95 : 82,
        peerAverage: 75,
        percentile: 78,
        status: 'above'
      },
      {
        metric: 'Dividend Yield',
        yourValue: 4.2,
        peerAverage: 3.8,
        percentile: 62,
        status: 'above'
      },
      {
        metric: 'Portfolio Volatility',
        yourValue: 18.5,
        peerAverage: 21.2,
        percentile: 72,
        status: 'above' // Lower volatility is better
      },
      {
        metric: 'Expense Coverage',
        yourValue: incomeClarityData?.availableToReinvest && incomeClarityData?.monthlyExpenses 
          ? ((incomeClarityData.availableToReinvest + incomeClarityData.monthlyExpenses) / incomeClarityData.monthlyExpenses) * 100
          : 120,
        peerAverage: 105,
        percentile: 71,
        status: 'above'
      }
    ]

    const portfolioScore = Math.round(peerComparisons.reduce((sum, comp) => sum + comp.percentile, 0) / peerComparisons.length)
    const overallRanking = portfolioScore > 80 ? 1 : portfolioScore > 60 ? 2 : portfolioScore > 40 ? 3 : 4

    const improvementAreas = peerComparisons
      .filter(comp => comp.percentile < 60)
      .map(comp => `Improve ${comp.metric.toLowerCase()}`)
      .slice(0, 3)

    if (improvementAreas.length === 0) {
      improvementAreas.push('Continue current strategy', 'Consider portfolio diversification', 'Monitor market conditions')
    }

    return {
      benchmarks,
      peerComparisons,
      overallRanking,
      portfolioScore,
      improvementAreas
    }
  }

  const benchmarkingData = calculateBenchmarking()
  const selectedBenchmarkData = benchmarkingData.benchmarks.find(b => b.symbol === selectedBenchmark)

  const animatedValues = useStaggeredCountingAnimation(
    {
      score: benchmarkingData.portfolioScore,
      income: benchmarkingData.peerComparisons[0].yourValue,
      efficiency: benchmarkingData.peerComparisons[1].yourValue,
      yield: benchmarkingData.peerComparisons[2].yourValue,
      volatility: benchmarkingData.peerComparisons[3].yourValue,
      coverage: benchmarkingData.peerComparisons[4].yourValue,
    },
    1000,
    150
  )

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getComparisonIcon = (comparison: string) => {
    if (comparison === 'outperforming') return <ArrowUp className="w-4 h-4 text-green-600" />
    if (comparison === 'underperforming') return <ArrowDown className="w-4 h-4 text-red-600" />
    return <Minus className="w-4 h-4 text-slate-500" />
  }

  const getPercentileColor = (percentile: number) => {
    if (percentile >= 80) return 'text-green-600 bg-green-100'
    if (percentile >= 60) return 'text-blue-600 bg-blue-100'
    if (percentile >= 40) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getRankingText = (ranking: number) => {
    if (ranking === 1) return { text: 'Top Quartile', color: 'text-green-600', bg: 'bg-green-100' }
    if (ranking === 2) return { text: 'Above Average', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (ranking === 3) return { text: 'Average', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { text: 'Below Average', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const rankingStyle = getRankingText(benchmarkingData.overallRanking)

  return (
    <div className={`premium-card hover-lift p-4 sm:p-6 lg:p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800 mb-1">
            Performance Benchmarking
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Compare your strategy against market benchmarks and peers
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-green-50 to-blue-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <Target className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" />
        </div>
      </div>

      {/* Overall Score */}
      <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-green-50 rounded-xl border border-slate-100">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600 mb-2">
              {Math.round(animatedValues.score)}
            </div>
            <div className="text-sm sm:text-base text-slate-600 mb-2">Portfolio Score</div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${rankingStyle.bg} ${rankingStyle.color}`}>
              {rankingStyle.text}
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5 text-slate-500" />
              <span className="text-sm text-slate-600">vs Peer Average</span>
            </div>
            <div className="text-xs text-slate-500">
              Based on {benchmarkingData.peerComparisons.length} metrics
            </div>
          </div>
        </div>
      </div>

      {/* Benchmark Comparison */}
      <div className="mb-6">
        <h4 className="font-semibold text-slate-700 mb-4">Market Benchmarks</h4>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {benchmarkingData.benchmarks.map((benchmark) => (
            <button
              key={benchmark.symbol}
              onClick={() => setSelectedBenchmark(benchmark.symbol)}
              className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                selectedBenchmark === benchmark.symbol
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-700 text-sm">{benchmark.symbol}</span>
                {getComparisonIcon(benchmark.comparison)}
              </div>
              <div className="text-xs text-slate-500 mb-1">{benchmark.name}</div>
              <div className="text-sm font-semibold text-slate-700">
                {benchmark.performance.toFixed(1)}%
              </div>
            </button>
          ))}
        </div>

        {selectedBenchmarkData && (
          <div className="p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <selectedBenchmarkData.icon className={`w-5 h-5 ${selectedBenchmarkData.color}`} />
              <h5 className="font-semibold text-slate-700">{selectedBenchmarkData.name}</h5>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-slate-700">
                  {selectedBenchmarkData.performance.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">Annual Return</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-700">
                  {selectedBenchmarkData.yield.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">Dividend Yield</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-slate-700">
                  {selectedBenchmarkData.volatility.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">Volatility</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Peer Comparison */}
      <div className="mb-6">
        <h4 className="font-semibold text-slate-700 mb-4">Peer Comparison</h4>
        
        <div className="space-y-3">
          {benchmarkingData.peerComparisons.map((comparison, index) => (
            <div
              key={comparison.metric}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-all"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-slate-700 text-sm">{comparison.metric}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getPercentileColor(comparison.percentile)}`}>
                    {comparison.percentile}th percentile
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  You: {comparison.metric === 'Monthly Income' ? '$' : ''}
                  {comparison.yourValue.toFixed(comparison.metric === 'Monthly Income' ? 0 : 1)}
                  {comparison.metric.includes('Yield') || comparison.metric.includes('Efficiency') || comparison.metric.includes('Volatility') || comparison.metric.includes('Coverage') ? '%' : ''}
                  {' '} vs Peer Avg: {comparison.metric === 'Monthly Income' ? '$' : ''}
                  {comparison.peerAverage.toFixed(comparison.metric === 'Monthly Income' ? 0 : 1)}
                  {comparison.metric.includes('Yield') || comparison.metric.includes('Efficiency') || comparison.metric.includes('Volatility') || comparison.metric.includes('Coverage') ? '%' : ''}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {comparison.status === 'above' ? (
                  <ArrowUp className="w-4 h-4 text-green-600" />
                ) : comparison.status === 'below' ? (
                  <ArrowDown className="w-4 h-4 text-red-600" />
                ) : (
                  <Minus className="w-4 h-4 text-slate-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement Recommendations */}
      <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg sm:rounded-xl border border-blue-100">
        <h4 className="font-semibold text-slate-700 mb-3">Key Improvement Areas</h4>
        <div className="space-y-2">
          {benchmarkingData.improvementAreas.map((area, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-slate-600">{area}</p>
            </div>
          ))}
        </div>
        
        {benchmarkingData.portfolioScore >= 75 && (
          <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">
                Excellent performance! You're outperforming most peers.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(BenchmarkingCardComponent)