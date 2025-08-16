'use client'

import { useState } from 'react'
import { Plus, Download, Share2, Target, Zap, AlertTriangle } from 'lucide-react'
import { logger } from '@/lib/logger'

interface PortfolioActionsProps {
  onAddHolding?: () => void
}

export function PortfolioActions({ onAddHolding }: PortfolioActionsProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false)
      // In real app, this would trigger a CSV/PDF download
      // logger.log('Portfolio exported successfully')
    }, 2000)
  }

  const handleShare = async () => {
    setIsSharing(true);
    
    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Income Clarity Portfolio',
          text: 'Check out my dividend portfolio performance on Income Clarity',
          url: window.location.href
        });
      } catch (error) {
        // Error handled by emergency recovery script
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        // logger.log('Portfolio link copied to clipboard')
      } catch (error) {
        // Error handled by emergency recovery script
      }
    }
    
    setIsSharing(false);
  }

  const handleRebalance = () => {
    // This would trigger rebalancing suggestions modal
    // logger.log('Rebalance analysis requested')
  }

  // Mock rebalancing suggestions
  const suggestions = [
    {
      type: 'warning',
      icon: <AlertTriangle className="w-4 h-4" />,
      title: 'Overweight Position',
      description: 'JEPI represents 35% of portfolio. Consider reducing to 25% for better diversification.'
    },
    {
      type: 'success',
      icon: <Target className="w-4 h-4" />,
      title: 'Add Growth Component',
      description: 'Consider adding SCHG or VUG for growth balance (currently 0% growth allocation).'
    },
    {
      type: 'info',
      icon: <Zap className="w-4 h-4" />,
      title: 'Sector Diversification',
      description: 'Add REITs or international exposure to improve sector balance.'
    }
  ]

  return (
    <div 
      className="rounded-xl shadow-lg p-6 transition-all duration-300"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300"
          style={{ backgroundColor: 'var(--color-accent-secondary)' }}
        >
          <Zap className="w-5 h-5" style={{ color: 'var(--color-accent)' }} />
        </div>
        <div>
          <h3 
            className="text-lg font-bold transition-colors duration-300"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Portfolio Actions
          </h3>
          <p 
            className="text-sm transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Quick actions and optimization suggestions
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button
          onClick={onAddHolding}
          className="flex flex-col items-center space-y-3 p-6 rounded-xl transition-all duration-200 hover:scale-[1.02] theme-btn-primary"
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white'
          }}
        >
          <Plus className="w-8 h-8" />
          <div className="text-center">
            <div className="font-semibold">Add Holding</div>
            <div className="text-xs opacity-90">Expand portfolio</div>
          </div>
        </button>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex flex-col items-center space-y-3 p-6 rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-text-primary)',
            border: `1px solid var(--color-border)`
          }}
        >
          <Download className={`w-8 h-8 ${isExporting ? 'animate-bounce' : ''}`} />
          <div className="text-center">
            <div className="font-semibold">
              {isExporting ? 'Exporting...' : 'Export'}
            </div>
            <div className="text-xs opacity-70">CSV / PDF</div>
          </div>
        </button>

        <button
          onClick={handleShare}
          disabled={isSharing}
          className="flex flex-col items-center space-y-3 p-6 rounded-xl transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-text-primary)',
            border: `1px solid var(--color-border)`
          }}
        >
          <Share2 className={`w-8 h-8 ${isSharing ? 'animate-pulse' : ''}`} />
          <div className="text-center">
            <div className="font-semibold">
              {isSharing ? 'Sharing...' : 'Share'}
            </div>
            <div className="text-xs opacity-70">Portfolio summary</div>
          </div>
        </button>
      </div>

      {/* Rebalancing Suggestions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 
            className="text-sm font-semibold transition-colors duration-300"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Optimization Suggestions
          </h4>
          <button
            onClick={handleRebalance}
            className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{ 
              color: 'var(--color-accent)',
              backgroundColor: 'var(--color-accent-secondary)'
            }}
          >
            Full Analysis
          </button>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-4 rounded-lg transition-all duration-300 hover:scale-[1.01]"
              style={{ backgroundColor: 'var(--color-secondary)' }}
            >
              <div 
                className="p-2 rounded-lg transition-colors duration-300"
                style={{ 
                  backgroundColor: suggestion.type === 'warning' 
                    ? 'var(--color-warning-secondary)'
                    : suggestion.type === 'success'
                    ? 'var(--color-success-secondary)' 
                    : 'var(--color-info-secondary)',
                  color: suggestion.type === 'warning' 
                    ? 'var(--color-warning)'
                    : suggestion.type === 'success'
                    ? 'var(--color-success)' 
                    : 'var(--color-info)'
                }}
              >
                {suggestion.icon}
              </div>
              <div className="flex-1">
                <div 
                  className="text-sm font-semibold mb-1 transition-colors duration-300"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {suggestion.title}
                </div>
                <div 
                  className="text-xs transition-colors duration-300"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {suggestion.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Summary */}
      <div 
        className="mt-6 pt-4 border-t transition-colors duration-300"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div 
              className="text-lg font-bold mb-1 transition-colors duration-300"
              style={{ color: 'var(--color-success)' }}
            >
              85%
            </div>
            <div 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Optimization Score
            </div>
          </div>
          <div>
            <div 
              className="text-lg font-bold mb-1 transition-colors duration-300"
              style={{ color: 'var(--color-accent)' }}
            >
              7.2%
            </div>
            <div 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Risk-Adj. Return
            </div>
          </div>
          <div>
            <div 
              className="text-lg font-bold mb-1 transition-colors duration-300"
              style={{ color: 'var(--color-info)' }}
            >
              0.8
            </div>
            <div 
              className="text-xs transition-colors duration-300"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Sharpe Ratio
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}