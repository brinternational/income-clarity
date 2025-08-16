'use client'

import { useState, useEffect, memo } from 'react'
import { BookOpen, Search, TrendingUp, Calculator, FileText, BarChart3, ExternalLink, Star } from 'lucide-react'

interface ResearchTool {
  id: string
  name: string
  description: string
  category: 'ETF Analysis' | 'Market Data' | 'Tax Tools' | 'Educational'
  icon: any
  url: string
  isPremium: boolean
  rating: number
  features: string[]
}

interface ResearchCategory {
  name: string
  tools: ResearchTool[]
  icon: any
  color: string
  bg: string
}

const ResearchHubCardComponent = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('ETF Analysis')

  const researchTools: ResearchTool[] = [
    {
      id: 'etf-database',
      name: 'ETF Database',
      description: 'Comprehensive ETF analysis and screening tool',
      category: 'ETF Analysis',
      icon: BarChart3,
      url: 'https://etfdb.com',
      isPremium: false,
      rating: 4.5,
      features: ['ETF Screening', 'Holdings Analysis', 'Performance Charts', 'Dividend History']
    },
    {
      id: 'portfolio-visualizer',
      name: 'Portfolio Visualizer',
      description: 'Advanced portfolio backtesting and analysis',
      category: 'ETF Analysis',
      icon: TrendingUp,
      url: 'https://portfoliovisualizer.com',
      isPremium: true,
      rating: 4.8,
      features: ['Backtesting', 'Factor Analysis', 'Monte Carlo', 'Asset Correlation']
    },
    {
      id: 'yahoo-finance',
      name: 'Yahoo Finance',
      description: 'Real-time market data and financial news',
      category: 'Market Data',
      icon: Search,
      url: 'https://finance.yahoo.com',
      isPremium: false,
      rating: 4.2,
      features: ['Real-time Quotes', 'Financial News', 'Earnings Calendar', 'Options Data']
    },
    {
      id: 'seekingalpha',
      name: 'Seeking Alpha',
      description: 'Investment research and dividend analysis',
      category: 'Market Data',
      icon: FileText,
      url: 'https://seekingalpha.com',
      isPremium: true,
      rating: 4.3,
      features: ['Dividend Analysis', 'Earnings Transcripts', 'Investment Ideas', 'Ratings']
    },
    {
      id: 'tax-calculator',
      name: 'Federal Tax Calculator',
      description: 'Calculate federal tax impact on dividend income',
      category: 'Tax Tools',
      icon: Calculator,
      url: '#',
      isPremium: false,
      rating: 4.0,
      features: ['Tax Bracket Calculation', 'Dividend Tax Rates', 'Quarterly Estimates']
    },
    {
      id: 'bogleheads',
      name: 'Bogleheads Community',
      description: 'Educational forum for passive investing strategies',
      category: 'Educational',
      icon: BookOpen,
      url: 'https://bogleheads.org',
      isPremium: false,
      rating: 4.7,
      features: ['Community Forum', 'Investment Wiki', 'Portfolio Reviews', 'Tax Strategies']
    }
  ]

  const categories: ResearchCategory[] = [
    {
      name: 'ETF Analysis',
      tools: researchTools.filter(tool => tool.category === 'ETF Analysis'),
      icon: BarChart3,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      name: 'Market Data',
      tools: researchTools.filter(tool => tool.category === 'Market Data'),
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      name: 'Tax Tools',
      tools: researchTools.filter(tool => tool.category === 'Tax Tools'),
      icon: Calculator,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      name: 'Educational',
      tools: researchTools.filter(tool => tool.category === 'Educational'),
      icon: BookOpen,
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ]

  const activeTools = categories.find(cat => cat.name === activeCategory)?.tools || []

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleToolClick = (tool: ResearchTool) => {
    if (tool.url !== '#') {
      window.open(tool.url, '_blank', 'noopener,noreferrer')
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)
    }
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-3 h-3 fill-yellow-400/50 text-yellow-400" />)
    }
    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />)
    }
    
    return stars
  }

  return (
    <div className={`premium-card hover-lift p-4 sm:p-6 lg:p-8 ${
      isVisible ? 'animate-slide-up' : 'opacity-0'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6 sm:mb-8">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg lg:text-display-xs font-display font-semibold text-slate-800 mb-1">
            Research Hub
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Quick access to essential investment research tools
          </p>
        </div>
        <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg sm:rounded-xl flex-shrink-0">
          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => setActiveCategory(category.name)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
              activeCategory === category.name
                ? `${category.bg} ${category.color} font-medium`
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <category.icon className="w-4 h-4" />
            <span className="text-sm">{category.name}</span>
            <span className="text-xs bg-slate-200 text-slate-600 px-1 py-0.5 rounded">
              {category.tools.length}
            </span>
          </button>
        ))}
      </div>

      {/* Research Tools */}
      <div className="space-y-4">
        {activeTools.map((tool, index) => (
          <div
            key={tool.id}
            className="group cursor-pointer transition-all duration-300 hover:shadow-sm"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => handleToolClick(tool)}
          >
            <div className="p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                    <tool.icon className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">
                        {tool.name}
                      </h4>
                      {tool.isPremium && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                          Premium
                        </span>
                      )}
                      {tool.url !== '#' && (
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-colors" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 mb-2">{tool.description}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-0.5">
                        {renderStars(tool.rating)}
                      </div>
                      <span className="text-xs text-slate-500">({tool.rating})</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {tool.features.map((feature, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
        <h4 className="font-semibold text-slate-700 mb-3">Quick Research Actions</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => window.open('https://etfdb.com/screener/', '_blank')}
            className="flex items-center space-x-2 p-3 bg-white rounded-lg hover:shadow-sm transition-all text-left"
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-sm font-medium text-slate-700">Screen ETFs</div>
              <div className="text-xs text-slate-500">Find dividend ETFs by criteria</div>
            </div>
          </button>
          
          <button
            onClick={() => window.open('https://portfoliovisualizer.com/backtest-portfolio', '_blank')}
            className="flex items-center space-x-2 p-3 bg-white rounded-lg hover:shadow-sm transition-all text-left"
          >
            <TrendingUp className="w-4 h-4 text-green-600" />
            <div>
              <div className="text-sm font-medium text-slate-700">Backtest Strategy</div>
              <div className="text-xs text-slate-500">Historical performance analysis</div>
            </div>
          </button>
          
          <button className="flex items-center space-x-2 p-3 bg-white rounded-lg hover:shadow-sm transition-all text-left">
            <Calculator className="w-4 h-4 text-purple-600" />
            <div>
              <div className="text-sm font-medium text-slate-700">Tax Calculator</div>
              <div className="text-xs text-slate-500">Built-in tax impact analysis</div>
            </div>
          </button>
          
          <button
            onClick={() => window.open('https://bogleheads.org/wiki/Getting_started', '_blank')}
            className="flex items-center space-x-2 p-3 bg-white rounded-lg hover:shadow-sm transition-all text-left"
          >
            <BookOpen className="w-4 h-4 text-orange-600" />
            <div>
              <div className="text-sm font-medium text-slate-700">Learn Basics</div>
              <div className="text-xs text-slate-500">Investment education resources</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(ResearchHubCardComponent)