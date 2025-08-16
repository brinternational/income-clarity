'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calculator, TrendingDown, PiggyBank, Building2, FileText, Download, Share2, AlertCircle, Target, Zap, Award, Info, ChevronDown, ChevronUp } from 'lucide-react'
import { usePortfolio } from '@/contexts/PortfolioContext'
import { useUserProfile } from '@/contexts/UserProfileContext'
import { exportElementAsImage, exportDataAsCSV } from '@/utils/exportUtils'
import { logger } from '@/lib/logger'

export function TaxPlanning() {
  const { portfolio, holdings } = usePortfolio()
  const { profileData } = useUserProfile()
  const [activeTab, setActiveTab] = useState<'overview' | 'roth' | 'municipal' | 'section199a'>('overview')
  const [rothAmount, setRothAmount] = useState(6500)
  const [isExporting, setIsExporting] = useState(false)
  const [expandedTip, setExpandedTip] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Mock tax calculations based on user profile and portfolio
  const annualDividendIncome = (portfolio?.monthlyGrossIncome || 0) * 12
  const taxRate = profileData?.taxInfo?.federalRate || 0.22 // Default to 22%
  const stateRate = profileData?.taxInfo?.stateRate || 0.05 // Default to 5%
  const totalTaxRate = taxRate + stateRate

  const quarterlyTaxEstimate = (annualDividendIncome * totalTaxRate) / 4
  const annualTaxEstimate = annualDividendIncome * totalTaxRate
  const afterTaxIncome = annualDividendIncome - annualTaxEstimate

  // Tax efficiency score (higher is better)
  const qualifiedDividendPercentage = 0.85 // Mock: 85% of dividends are qualified
  const taxEfficiencyScore = Math.round(qualifiedDividendPercentage * 100)
  
  // Roth IRA calculations
  const calculateRothBenefit = (contribution: number, years: number = 30, returnRate: number = 0.07) => {
    const traditionalAfterTax = contribution * (1 - taxRate)
    const rothValue = contribution * Math.pow(1 + returnRate, years)
    const traditionalValue = (contribution * Math.pow(1 + returnRate, years)) * (1 - taxRate)
    return rothValue - traditionalValue
  }
  
  const rothBenefit = calculateRothBenefit(rothAmount)
  
  // Municipal bond tax equivalent yield
  const calculateTaxEquivalentYield = (municipalYield: number) => {
    return municipalYield / (1 - totalTaxRate)
  }
  
  // Section 199A deduction (simplified)
  const section199aDeduction = annualDividendIncome * 0.20 // Up to 20% deduction on qualified business income
  const section199aSavings = section199aDeduction * taxRate
  
  // Export functions
  const handleExportImage = async () => {
    if (!cardRef.current) return
    setIsExporting(true)
    
    try {
      await exportElementAsImage(cardRef.current, {
        filename: 'tax-planning-summary',
        backgroundColor: '#ffffff'
      })
    } catch (error) {
      // logger.error('Export failed:', error)
    // } finally {
      setIsExporting(false)
    }
  }
  
  const handleExportData = () => {
    const exportData = {
      annualDividendIncome,
      annualTaxEstimate,
      afterTaxIncome,
      taxEfficiencyScore,
      rothContribution: rothAmount,
      rothBenefit,
      section199aDeduction,
      section199aSavings,
      quarterlyEstimates: quarters.map((q, i) => ({
        quarter: q.name,
        dueDate: q.dueDate,
        amount: quarterlyTaxEstimate,
        status: i < currentQuarter ? 'completed' : i === currentQuarter ? 'current' : 'upcoming'
      })),
      exportDate: new Date().toISOString()
    }
    
    exportDataAsCSV([exportData], 'tax-planning-summary')
  }
  
  // Tax optimization tips
  const taxTips = [
    {
      id: 'tax-loss-harvesting',
      title: 'Tax-Loss Harvesting',
      description: 'Offset capital gains with strategic losses',
      savings: '$500-2,000',
      complexity: 'Medium',
      details: 'Sell underperforming investments to offset capital gains. Be aware of wash sale rules (30-day period). Can carry forward $3,000 in losses annually against ordinary income.'
    },
    {
      id: 'asset-location',
      title: 'Asset Location Optimization',
      description: 'Place high-yield investments in tax-advantaged accounts',
      savings: '$1,000-5,000',
      complexity: 'Low',
      details: 'Keep dividend-heavy stocks in IRAs/401ks, growth stocks in taxable accounts. REITs and bonds work best in tax-deferred accounts due to higher tax rates.'
    },
    {
      id: 'municipal-bonds',
      title: 'Municipal Bonds',
      description: 'Tax-free income for high earners',
      savings: `$${Math.round(annualDividendIncome * 0.1 * totalTaxRate)}`,
      complexity: 'Low',
      details: `With your ${(totalTaxRate * 100).toFixed(0)}% tax rate, a 4% municipal bond equals a ${calculateTaxEquivalentYield(0.04).toFixed(2)}% taxable yield.`
    },
    {
      id: 'roth-conversion',
      title: 'Roth Conversion Ladder',
      description: 'Convert traditional IRA funds during low-income years',
      savings: '$2,000-10,000',
      complexity: 'High',
      details: 'Convert traditional IRA funds to Roth during years with lower income. Pay taxes now at lower rates to avoid higher future rates. Consider 5-year rule for conversions.'
    }
  ]

  // Quarters for current year
  const currentYear = new Date().getFullYear()
  const quarters = [
    { name: 'Q1', months: 'Jan-Mar', dueDate: `Apr 15, ${currentYear}` },
    { name: 'Q2', months: 'Apr-Jun', dueDate: `Jun 15, ${currentYear}` },
    { name: 'Q3', months: 'Jul-Sep', dueDate: `Sep 15, ${currentYear}` },
    { name: 'Q4', months: 'Oct-Dec', dueDate: `Jan 15, ${currentYear + 1}` }
  ]

  const currentQuarter = Math.floor((new Date().getMonth()) / 3)

  return (
    <motion.div 
      ref={cardRef}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <motion.div 
            className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Calculator className="w-6 h-6 text-amber-600" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tax Planning</h2>
            <p className="text-gray-600">Optimization strategies and estimates</p>
          </div>
        </div>
        
        {/* Export Controls */}
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={handleExportData}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Export data as CSV"
          >
            <Download className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={handleExportImage}
            disabled={isExporting}
            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Export as image"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: FileText },
          { id: 'roth', label: 'Roth IRA', icon: PiggyBank },
          { id: 'municipal', label: 'Muni Bonds', icon: Building2 },
          { id: 'section199a', label: 'Section 199A', icon: Award }
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {annualDividendIncome === 0 ? (
          <motion.div 
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key="empty-state"
          >
            <motion.div 
              className="text-4xl mb-4 opacity-50"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              📊
            </motion.div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tax Planning Needed</h3>
            <p className="text-gray-600">Add dividend holdings to see tax estimates</p>
          </motion.div>
        ) : (
          <motion.div 
            className="space-y-6"
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'overview' && (
              <>
                {/* Annual Tax Summary */}
                <motion.div 
                  className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg p-6"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <motion.div 
                        className="text-3xl font-bold text-green-600 mb-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                      >
                        ${annualDividendIncome.toLocaleString()}
                      </motion.div>
                      <div className="text-sm text-gray-700 font-medium">Annual Dividends</div>
                    </div>
                    <div>
                      <motion.div 
                        className="text-3xl font-bold text-red-600 mb-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
                      >
                        ${annualTaxEstimate.toLocaleString()}
                      </motion.div>
                      <div className="text-sm text-gray-700 font-medium">Est. Taxes Owed</div>
                    </div>
                    <div>
                      <motion.div 
                        className="text-3xl font-bold text-blue-600 mb-2"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring" }}
                      >
                        ${afterTaxIncome.toLocaleString()}
                      </motion.div>
                      <div className="text-sm text-gray-700 font-medium">After-Tax Income</div>
                    </div>
                  </div>
                </motion.div>

                {/* Tax Efficiency Score */}
                <motion.div 
                  className="bg-blue-50 rounded-lg p-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-blue-900">Tax Efficiency Score</h3>
                      <p className="text-sm text-blue-700">
                        {taxEfficiencyScore}% of dividends qualify for preferential rates
                      </p>
                    </div>
                    <motion.div 
                      className="text-3xl font-bold text-blue-600"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: "spring" }}
                    >
                      {taxEfficiencyScore}/100
                    </motion.div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <motion.div 
                        className="h-2 bg-blue-600 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${taxEfficiencyScore}%` }}
                        transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Quarterly Estimates */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="font-semibold text-gray-900 mb-4">Quarterly Tax Estimates</h3>
                  <div className="space-y-3">
                    {quarters.map((quarter, index) => {
                      const isPast = index < currentQuarter
                      const isCurrent = index === currentQuarter
                      const isFuture = index > currentQuarter

                      return (
                        <motion.div 
                          key={quarter.name}
                          className={`flex items-center justify-between p-4 rounded-lg border ${
                            isPast ? 'border-gray-300 bg-gray-50' :
                            isCurrent ? 'border-blue-300 bg-blue-50' :
                            'border-yellow-300 bg-yellow-50'
                          }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 + index * 0.1 }}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                              isPast ? 'bg-gray-200 text-gray-600' :
                              isCurrent ? 'bg-blue-200 text-blue-700' :
                              'bg-yellow-200 text-yellow-700'
                            }`}>
                              {quarter.name}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{quarter.months} {currentYear}</div>
                              <div className="text-sm text-gray-600">Due: {quarter.dueDate}</div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              isPast ? 'text-gray-600' :
                              isCurrent ? 'text-blue-600' :
                              'text-yellow-600'
                            }`}>
                              ${quarterlyTaxEstimate.toFixed(0)}
                            </div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              isPast ? 'bg-gray-200 text-gray-700' :
                              isCurrent ? 'bg-blue-200 text-blue-700' :
                              'bg-yellow-200 text-yellow-700'
                            }`}>
                              {isPast ? 'Completed' : isCurrent ? 'Current' : 'Upcoming'}
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>
              </>
            )}

            {activeTab === 'roth' && (
              <motion.div 
                className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <PiggyBank className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Roth IRA Calculator</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Annual Contribution: ${rothAmount.toLocaleString()}
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max="6500"
                      step="500"
                      value={rothAmount}
                      onChange={(e) => setRothAmount(parseInt(e.target.value))}
                      className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>$1,000</span>
                      <span>$6,500</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        ${Math.round(rothBenefit).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-700">30-Year Benefit</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        ${Math.round(rothAmount * Math.pow(1.07, 30)).toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-700">Tax-Free Growth</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'municipal' && (
              <motion.div 
                className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Building2 className="w-6 h-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Municipal Bonds</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="text-sm text-gray-700">
                    With your combined tax rate of {(totalTaxRate * 100).toFixed(1)}%, 
                    municipal bonds can provide tax-equivalent yields higher than taxable bonds.
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {[3.0, 3.5, 4.0, 4.5].map((muniYield) => (
                      <div key={muniYield} className="bg-white rounded-lg p-4 text-center">
                        <div className="text-lg font-bold text-green-600">
                          {muniYield.toFixed(1)}% Muni
                        </div>
                        <div className="text-sm text-gray-500">equals</div>
                        <div className="text-lg font-bold text-gray-900">
                          {calculateTaxEquivalentYield(muniYield / 100).toFixed(2)}%
                        </div>
                        <div className="text-xs text-gray-600">taxable yield</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <div className="text-sm text-amber-800">
                        <strong>Consider:</strong> State-specific municipal bonds may be 
                        exempt from both federal and state taxes, increasing the benefit.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 'section199a' && (
              <motion.div 
                className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Award className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Section 199A Deduction</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="text-sm text-gray-700">
                    The Section 199A deduction allows up to 20% deduction on qualified 
                    business income, including some dividend income from pass-through entities.
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-2xl font-bold text-purple-600">
                        ${section199aDeduction.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-700">Potential Deduction</div>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-600">
                        ${section199aSavings.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-700">Tax Savings</div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start space-x-2">
                      <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <strong>Eligible:</strong> REITs, MLPs, and some dividend income 
                        from pass-through entities. Consult a tax professional for specifics.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tax Optimization Tips - shown for all tabs */}
            <motion.div 
              className="border-t border-gray-200 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Tax Optimization Tips</h3>
              </div>
              
              <div className="space-y-3">
                {taxTips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    className="border border-gray-200 rounded-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                  >
                    <button
                      onClick={() => setExpandedTip(expandedTip === tip.id ? null : tip.id)}
                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-2 h-2 rounded-full ${
                          tip.complexity === 'Low' ? 'bg-green-500' :
                          tip.complexity === 'Medium' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium text-gray-900">{tip.title}</div>
                          <div className="text-sm text-gray-600">{tip.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-green-600">{tip.savings}</span>
                        {expandedTip === tip.id ? (
                          <ChevronUp className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {expandedTip === tip.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                            <p className="text-sm text-gray-700">{tip.details}</p>
                            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                              <span>Complexity: {tip.complexity}</span>
                              <span>Est. Savings: {tip.savings}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Enhanced Quick Actions */}
            <motion.div 
              className="flex space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <motion.button 
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FileText className="w-4 h-4" />
                <span>Download Tax Report</span>
              </motion.button>
              <motion.button 
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Calculator className="w-4 h-4" />
                <span>Schedule Tax Review</span>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}