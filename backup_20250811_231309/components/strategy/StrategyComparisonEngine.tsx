'use client'

import { useState, useEffect, useMemo, memo } from 'react'
import { WithErrorBoundary } from '@/components/ui/ErrorBoundary'
import { SkeletonCardWrapper } from '@/components/ui/skeletons'
import { 
  BarChart3, TrendingUp, TrendingDown, Shield, DollarSign, 
  Info, Settings, HelpCircle, Sliders, Target, Calculator, 
  ChevronRight, ArrowUpDown, Eye, EyeOff
} from 'lucide-react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { useStaggeredCountingAnimation } from '@/hooks/useOptimizedAnimation'
import HelpButton, { helpContent } from '@/components/shared/HelpButton'
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar, Legend, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip
} from 'recharts'

// Strategy interfaces
interface Strategy {
  id: string
  name: string
  description: string
  icon: any
  color: string
  bgColor: string
  riskLevel: 'Low' | 'Medium' | 'High'
  complexity: 'Beginner' | 'Intermediate' | 'Advanced'
  minPortfolio: number
  taxEfficiency: number
  monthlyIncome: number
  annualIncome: number
  volatility: number
  pros: string[]
  cons: string[]
  bestFor: string[]
  mechanism: string
  timeCommitment: string
}

interface StrategyCalculationInputs {
  portfolioValue: number
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  taxLocation: string
  investmentExperience: 'beginner' | 'intermediate' | 'advanced'
  timeHorizon: number // years
  monthlyContributions: number
}

interface ComparisonMetrics {
  strategy: Strategy
  score: number
  monthlyIncomeProjection: number
  riskAdjustedReturn: number
  taxEfficiencyScore: number
  suitabilityScore: number
}

const StrategyComparisonEngine = () => {
  // Context hooks
  const { portfolio } = usePortfolio()
  const { profileData } = useUserProfile()
  
  // State management
  const [inputs, setInputs] = useState<StrategyCalculationInputs>({
    portfolioValue: portfolio?.totalValue || 150000,
    riskTolerance: 'moderate',
    taxLocation: profileData?.location?.state || 'Other',
    investmentExperience: 'intermediate',
    timeHorizon: 10,
    monthlyContributions: 0
  })
  
  const [selectedStrategy, setSelectedStrategy] = useState<string>('4-percent-rule')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [viewMode, setViewMode] = useState<'cards' | 'chart'>('cards')
  const [isVisible, setIsVisible] = useState(false)

  // Strategy calculation functions
  const calculate4PercentRule = (inputs: StrategyCalculationInputs): Strategy => {
    const { portfolioValue, taxLocation } = inputs
    const annualWithdrawal = portfolioValue * 0.04
    const monthlyIncome = annualWithdrawal / 12
    
    // Tax efficiency varies by location and withdrawal strategy
    const taxEfficiency = taxLocation === 'Puerto Rico' ? 95 : 
                         ['Texas', 'Florida', 'Nevada', 'Wyoming'].includes(taxLocation) ? 85 : 75
    
    return {
      id: '4-percent-rule',
      name: '4% Rule',
      description: 'Traditional retirement withdrawal strategy - withdraw 4% annually',
      icon: Calculator,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      riskLevel: 'Low',
      complexity: 'Beginner',
      minPortfolio: 25000,
      taxEfficiency,
      monthlyIncome,
      annualIncome: annualWithdrawal,
      volatility: 15, // Based on diversified portfolio
      pros: [
        'Time-tested approach (Trinity Study)',
        'Simple to understand and implement',
        'Preserves capital in most scenarios',
        'Works with any portfolio composition',
        'Automatic inflation adjustment'
      ],
      cons: [
        'May not maximize income potential',
        'Rigid withdrawal schedule',
        'Doesn\'t account for market conditions',
        'May withdraw from principal',
        'Tax treatment varies by account type'
      ],
      bestFor: [
        'Traditional retirement planning',
        'Conservative investors',
        'Those wanting simplicity',
        'Mixed account types (401k, IRA, taxable)'
      ],
      mechanism: 'Annual withdrawal of 4% of initial portfolio value, adjusted for inflation',
      timeCommitment: 'Minimal - annual rebalancing'
    }
  }

  const calculateCoveredCalls = (inputs: StrategyCalculationInputs): Strategy => {
    const { portfolioValue, taxLocation, riskTolerance } = inputs
    
    // Covered call premium typically 1-3% monthly depending on market conditions
    const premiumRate = riskTolerance === 'conservative' ? 0.015 : 
                       riskTolerance === 'moderate' ? 0.025 : 0.035
    
    const monthlyIncome = portfolioValue * premiumRate
    const annualIncome = monthlyIncome * 12
    
    // Covered call income is taxed as short-term capital gains (ordinary rates)
    const taxEfficiency = taxLocation === 'Puerto Rico' ? 80 : 
                         ['Texas', 'Florida', 'Nevada', 'Wyoming'].includes(taxLocation) ? 65 : 55
    
    return {
      id: 'covered-calls',
      name: 'Covered Calls Strategy',
      description: 'Generate income by selling call options on stock holdings',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      riskLevel: 'Medium',
      complexity: 'Advanced',
      minPortfolio: 50000,
      taxEfficiency,
      monthlyIncome,
      annualIncome,
      volatility: 12, // Lower than underlying due to premium income
      pros: [
        'High monthly income generation',
        'Reduces portfolio volatility',
        'Can enhance returns in sideways markets',
        'Works with existing stock positions',
        'Flexible strike price selection'
      ],
      cons: [
        'Caps upside potential if called away',
        'Income taxed at ordinary rates',
        'Requires active management',
        'Complex for beginners',
        'May require rolling positions'
      ],
      bestFor: [
        'Experienced options traders',
        'Large portfolios ($50k+)',
        'Those comfortable with complexity',
        'Sideways/slightly bullish markets'
      ],
      mechanism: 'Sell call options against stock holdings, collect premiums monthly',
      timeCommitment: 'High - weekly monitoring and position management'
    }
  }

  const calculateDividendIncome = (inputs: StrategyCalculationInputs): Strategy => {
    const { portfolioValue, taxLocation, riskTolerance } = inputs
    
    // Dividend yield varies by strategy focus
    const dividendYield = riskTolerance === 'conservative' ? 0.035 : 
                         riskTolerance === 'moderate' ? 0.045 : 0.065
    
    const annualIncome = portfolioValue * dividendYield
    const monthlyIncome = annualIncome / 12
    
    // Qualified dividends get preferential tax treatment
    const taxEfficiency = taxLocation === 'Puerto Rico' ? 95 : 
                         ['Texas', 'Florida', 'Nevada', 'Wyoming'].includes(taxLocation) ? 90 : 85
    
    return {
      id: 'dividend-income',
      name: 'Dividend Income Focus',
      description: 'Build portfolio of dividend-paying stocks and ETFs',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      riskLevel: 'Medium',
      complexity: 'Intermediate',
      minPortfolio: 25000,
      taxEfficiency,
      monthlyIncome,
      annualIncome,
      volatility: 20, // Higher volatility but growing income
      pros: [
        'Tax-efficient qualified dividends',
        'Income tends to grow over time',
        'Participate in capital appreciation',
        'Many quality companies to choose from',
        'Can reinvest for compound growth'
      ],
      cons: [
        'Income can be cut during recessions',
        'Higher volatility than bonds',
        'Concentration in dividend sectors',
        'May lag growth stocks in bull markets',
        'Requires research and selection'
      ],
      bestFor: [
        'Long-term income investors',
        'Those wanting growing income',
        'Tax-efficient income seekers',
        'Investors comfortable with volatility'
      ],
      mechanism: 'Invest in dividend-paying stocks, REITs, and dividend-focused ETFs',
      timeCommitment: 'Medium - quarterly dividend research and rebalancing'
    }
  }

  // Calculate all strategies
  const strategies = useMemo(() => [
    calculate4PercentRule(inputs),
    calculateCoveredCalls(inputs),
    calculateDividendIncome(inputs)
  ], [inputs])

  // Selected strategy data
  const selectedStrategyData = strategies.find(s => s.id === selectedStrategy)

  // Animated values for selected strategy
  const animatedValues = useStaggeredCountingAnimation(
    {
      monthlyIncome: selectedStrategyData?.monthlyIncome || 0,
      annualIncome: selectedStrategyData?.annualIncome || 0,
      taxEfficiency: selectedStrategyData?.taxEfficiency || 0,
      volatility: selectedStrategyData?.volatility || 0,
    },
    1000,
    150
  )

  // Comparison data for charts
  const comparisonData = strategies.map(strategy => ({
    name: strategy.name.replace(' Strategy', '').replace(' Focus', ''),
    'Monthly Income': Math.round(strategy.monthlyIncome),
    'Tax Efficiency': strategy.taxEfficiency,
    'Risk Level': strategy.riskLevel === 'Low' ? 1 : strategy.riskLevel === 'Medium' ? 2 : 3,
    'Complexity': strategy.complexity === 'Beginner' ? 1 : strategy.complexity === 'Intermediate' ? 2 : 3,
    volatility: strategy.volatility
  }))

  const radarData = strategies.map(strategy => ({
    strategy: strategy.name.split(' ')[0],
    Income: Math.round((strategy.monthlyIncome / Math.max(...strategies.map(s => s.monthlyIncome))) * 100),
    'Tax Efficiency': strategy.taxEfficiency,
    Simplicity: strategy.complexity === 'Beginner' ? 100 : strategy.complexity === 'Intermediate' ? 60 : 30,
    'Capital Preservation': strategy.riskLevel === 'Low' ? 100 : strategy.riskLevel === 'Medium' ? 70 : 40
  }))

  // Effect for initial animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Helper functions
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-600 bg-green-100'
      case 'Medium': return 'text-yellow-600 bg-yellow-100'
      case 'High': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Beginner': return 'text-green-600 bg-green-100'
      case 'Intermediate': return 'text-blue-600 bg-blue-100'
      case 'Advanced': return 'text-purple-600 bg-purple-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className={`premium-card hover-lift p-4 sm:p-6 lg:p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800">
              Strategy Comparison Engine
            </h3>
            <HelpButton 
              {...helpContent.strategyComparisonEngine}
              size="sm"
              position="bottom-left"
            />
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Compare 4% Rule, Covered Calls, and Dividend Income strategies
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-purple-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        {/* Portfolio Value Slider */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="portfolio-value-slider" className="text-sm font-medium text-slate-700">
              Portfolio Value
            </label>
            <span className="text-sm text-slate-600">
              ${inputs.portfolioValue.toLocaleString()}
            </span>
          </div>
          <input
            id="portfolio-value-slider"
            type="range"
            min="25000"
            max="2000000"
            step="25000"
            value={inputs.portfolioValue}
            onChange={(e) => setInputs(prev => ({ ...prev, portfolioValue: parseInt(e.target.value) }))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
            aria-label={`Portfolio Value: $${inputs.portfolioValue.toLocaleString()}`}
          />
          <div className="flex justify-between text-xs text-slate-500">
            <span>$25K</span>
            <span>$500K</span>
            <span>$1M</span>
            <span>$2M</span>
          </div>
        </div>

        {/* Risk Tolerance */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Risk Tolerance</label>
          <div className="flex space-x-2">
            {[
              { key: 'conservative', label: 'Conservative' },
              { key: 'moderate', label: 'Moderate' },
              { key: 'aggressive', label: 'Aggressive' }
            ].map((risk) => (
              <button
                key={risk.key}
                onClick={() => setInputs(prev => ({ ...prev, riskTolerance: risk.key as any }))}
                className={`flex-1 px-3 py-2 text-sm rounded-lg transition-all ${
                  inputs.riskTolerance === risk.key
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {risk.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="w-4 h-4 text-slate-500" />
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              {showAdvanced ? 'Hide' : 'Show'} Advanced Options
            </button>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'cards' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Card View"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'chart' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
              title="Chart View"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="grid md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
            <div className="space-y-2">
              <label htmlFor="time-horizon-slider" className="text-sm font-medium text-slate-700">Time Horizon (Years)</label>
              <input
                id="time-horizon-slider"
                type="range"
                min="1"
                max="30"
                value={inputs.timeHorizon}
                onChange={(e) => setInputs(prev => ({ ...prev, timeHorizon: parseInt(e.target.value) }))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                aria-label={`Time Horizon: ${inputs.timeHorizon} years`}
              />
              <span className="text-sm text-slate-600">{inputs.timeHorizon} years</span>
            </div>
            <div className="space-y-2">
              <label htmlFor="monthly-contributions" className="text-sm font-medium text-slate-700">Monthly Contributions</label>
              <input
                id="monthly-contributions"
                type="number"
                value={inputs.monthlyContributions}
                onChange={(e) => setInputs(prev => ({ ...prev, monthlyContributions: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="$0"
                aria-label="Monthly Contributions in dollars"
              />
            </div>
          </div>
        )}
      </div>

      {/* Strategy Comparison */}
      {viewMode === 'cards' ? (
        <div className="space-y-4">
          {/* Strategy Cards */}
          <div className="grid gap-4">
            {strategies.map((strategy, index) => (
              <div
                key={strategy.id}
                className={`group cursor-pointer transition-all duration-300 ${
                  selectedStrategy === strategy.id 
                    ? 'ring-2 ring-blue-200 scale-[1.02]' 
                    : 'hover:shadow-md'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => setSelectedStrategy(strategy.id)}
              >
                <div className="p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className={`p-3 rounded-xl ${strategy.bgColor}`}>
                        <strategy.icon className={`w-5 h-5 ${strategy.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-800 text-lg">{strategy.name}</h4>
                        <p className="text-sm text-slate-600 mt-1">{strategy.description}</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getRiskColor(strategy.riskLevel)}`}>
                            {strategy.riskLevel} Risk
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${getComplexityColor(strategy.complexity)}`}>
                            {strategy.complexity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${
                      selectedStrategy === strategy.id ? 'rotate-90' : ''
                    }`} />
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className={`text-xl font-bold ${strategy.color}`}>
                        ${Math.round(strategy.monthlyIncome).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-500">Monthly Income</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-700">
                        {strategy.taxEfficiency}%
                      </div>
                      <div className="text-xs text-slate-500">Tax Efficiency</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-slate-700">
                        {strategy.volatility}%
                      </div>
                      <div className="text-xs text-slate-500">Volatility</div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {selectedStrategy === strategy.id && (
                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-slide-down">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold text-green-600 mb-2">Pros</h5>
                          <ul className="space-y-1">
                            {strategy.pros.map((pro, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start">
                                <div className="w-1 h-1 bg-green-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-red-600 mb-2">Cons</h5>
                          <ul className="space-y-1">
                            {strategy.cons.map((con, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start">
                                <div className="w-1 h-1 bg-red-600 rounded-full mr-2 mt-2 flex-shrink-0" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold text-slate-700 mb-2">Best For</h5>
                          <ul className="space-y-1">
                            {strategy.bestFor.map((item, i) => (
                              <li key={i} className="text-sm text-slate-600 flex items-start">
                                <Target className="w-3 h-3 text-blue-600 mr-2 mt-1 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-700 mb-2">Key Details</h5>
                          <div className="space-y-2 text-sm text-slate-600">
                            <div>
                              <span className="font-medium">Mechanism:</span> {strategy.mechanism}
                            </div>
                            <div>
                              <span className="font-medium">Time Commitment:</span> {strategy.timeCommitment}
                            </div>
                            <div>
                              <span className="font-medium">Min. Portfolio:</span> ${strategy.minPortfolio.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Chart View */
        <div className="space-y-6">
          {/* Income Comparison Bar Chart */}
          <div className="p-4 bg-white rounded-lg border border-slate-100">
            <h4 className="font-semibold text-slate-700 mb-4">Monthly Income Comparison</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [`$${value}`, name]}
                    labelFormatter={(label) => `Strategy: ${label}`}
                  />
                  <Bar dataKey="Monthly Income" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Radar Chart Comparison */}
          <div className="p-4 bg-white rounded-lg border border-slate-100">
            <h4 className="font-semibold text-slate-700 mb-4">Strategy Comparison Radar</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="strategy" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="4% Rule" dataKey="Income" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} />
                  <Radar name="Covered Calls" dataKey="Income" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                  <Radar name="Dividend" dataKey="Income" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      {selectedStrategyData && (
        <div className="mt-6 p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border border-slate-100">
          <div className="flex items-center space-x-3 mb-4">
            <selectedStrategyData.icon className={`w-5 h-5 ${selectedStrategyData.color}`} />
            <h4 className="font-semibold text-slate-700">{selectedStrategyData.name} - Summary</h4>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700">
                ${Math.round(animatedValues.monthlyIncome).toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">Monthly Income</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700">
                ${Math.round(animatedValues.annualIncome).toLocaleString()}
              </div>
              <div className="text-sm text-slate-500">Annual Income</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${selectedStrategyData.color}`}>
                {Math.round(animatedValues.taxEfficiency)}%
              </div>
              <div className="text-sm text-slate-500">Tax Efficiency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700">
                {Math.round(animatedValues.volatility)}%
              </div>
              <div className="text-sm text-slate-500">Expected Volatility</div>
            </div>
          </div>
        </div>
      )}

      {/* Educational Info */}
      <div className="mt-6 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg sm:rounded-xl border border-blue-100">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-slate-700 mb-2">Strategy Recommendations</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <p>
                <strong>For Beginners:</strong> Start with the 4% Rule for its simplicity and proven track record.
              </p>
              <p>
                <strong>For Income Seekers:</strong> Dividend Income Focus offers growing income with tax advantages.
              </p>
              <p>
                <strong>For Advanced Investors:</strong> Covered Calls can boost income but require active management.
              </p>
              <p>
                <strong>Important:</strong> Consider your tax situation, as it significantly impacts net income. 
                {inputs.taxLocation === 'Puerto Rico' ? ' Puerto Rico residents have significant tax advantages.' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { StrategyComparisonEngine }
export default memo(StrategyComparisonEngine)