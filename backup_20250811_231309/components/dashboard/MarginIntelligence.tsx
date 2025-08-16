'use client'

import { usePortfolio } from '@/contexts/PortfolioContext'

export function MarginIntelligence() {
  const { portfolio } = usePortfolio()

  // Mock calculations - in real app, these would come from context or API
  const marginUsed = portfolio?.marginUsed || 0
  const marginAvailable = 50000 // Mock available margin capacity
  const totalMarginCapacity = marginUsed + marginAvailable
  const utilizationRatio = totalMarginCapacity > 0 ? (marginUsed / totalMarginCapacity) * 100 : 0
  
  const monthlyInterestCost = marginUsed * 0.055 / 12 // 5.5% annual rate
  const velocityScore = marginUsed > 0 ? ((portfolio?.monthlyGrossIncome || 0) / marginUsed) * 1000 : 0 // Income per $1k margin
  
  // Risk assessment
  const riskLevel = utilizationRatio < 30 ? 'Low' : 
                   utilizationRatio < 60 ? 'Moderate' : 
                   utilizationRatio < 80 ? 'High' : 'Critical'
  
  const riskColor = utilizationRatio < 30 ? 'green' : 
                   utilizationRatio < 60 ? 'yellow' : 
                   utilizationRatio < 80 ? 'orange' : 'red'

  return (
    <div 
      className="rounded-xl shadow-lg p-6 transition-colors duration-300"
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      <div className="flex items-center space-x-4 mb-6">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300"
          style={{ backgroundColor: 'var(--color-warning-secondary)' }}
        >
          <span className="text-2xl">🧠</span>
        </div>
        <div>
          <h2 
            className="text-xl font-bold transition-colors duration-300"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Margin Intelligence
          </h2>
          <p 
            className="transition-colors duration-300"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            Risk assessment and optimization
          </p>
        </div>
      </div>

      {marginUsed === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4 opacity-50">💰</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Margin Used</h3>
          <p className="text-gray-600 mb-4">Consider using margin to accelerate income growth</p>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <span className="font-semibold">Available Margin:</span> ${marginAvailable.toLocaleString()}
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Potential additional monthly income: ~${(marginAvailable * 0.04).toFixed(0)}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Utilization Overview */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Margin Utilization</span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold
                ${riskColor === 'green' ? 'bg-green-100 text-green-800' :
                  riskColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  riskColor === 'orange' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'}`}>
                {riskLevel} Risk
              </span>
            </div>
            
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>${marginUsed.toLocaleString()} used</span>
                <span>{utilizationRatio.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500
                    ${riskColor === 'green' ? 'bg-green-500' :
                      riskColor === 'yellow' ? 'bg-yellow-500' :
                      riskColor === 'orange' ? 'bg-orange-500' :
                      'bg-red-500'}`}
                  style={{ width: `${Math.min(utilizationRatio, 100)}%` }}
                />
              </div>
            </div>
            
            <div className="text-xs text-gray-500">
              Available: ${marginAvailable.toLocaleString()}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {velocityScore.toFixed(1)}
              </div>
              <div className="text-sm text-blue-700">Velocity Score</div>
              <div className="text-xs text-gray-600 mt-1">Income per $1k margin</div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                ${monthlyInterestCost.toFixed(0)}
              </div>
              <div className="text-sm text-red-700">Monthly Cost</div>
              <div className="text-xs text-gray-600 mt-1">Interest expense</div>
            </div>
          </div>

          {/* Risk Insights */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Risk Assessment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Liquidation Buffer</span>
                <span className="font-medium">
                  {utilizationRatio < 80 ? 'Safe' : utilizationRatio < 90 ? 'Caution' : 'Danger'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Coverage</span>
                <span className="font-medium">
                  {(portfolio?.monthlyGrossIncome || 0) > monthlyInterestCost * 2 ? 'Strong' : 'Weak'}x
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Stress Test</span>
                <span className="font-medium">
                  {utilizationRatio < 50 ? 'Pass -30%' : utilizationRatio < 70 ? 'Pass -20%' : 'Fail -15%'}
                </span>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-semibold text-gray-900 mb-3">Smart Recommendations</h3>
            <div className="space-y-2">
              {utilizationRatio > 70 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-3">
                  <div className="text-sm font-medium text-red-800">Reduce Risk</div>
                  <div className="text-xs text-red-700">Consider reducing margin usage below 70%</div>
                </div>
              )}
              {utilizationRatio < 30 && marginAvailable > 10000 && (
                <div className="bg-green-50 border-l-4 border-green-400 p-3">
                  <div className="text-sm font-medium text-green-800">Growth Opportunity</div>
                  <div className="text-xs text-green-700">
                    Deploy ${Math.min(marginAvailable, 25000).toLocaleString()} additional margin
                  </div>
                </div>
              )}
              {velocityScore < 30 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
                  <div className="text-sm font-medium text-yellow-800">Optimize Efficiency</div>
                  <div className="text-xs text-yellow-700">Focus on higher-yield dividend stocks</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}