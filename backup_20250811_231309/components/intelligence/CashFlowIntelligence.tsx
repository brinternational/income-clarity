'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, ChevronDown, ChevronUp } from 'lucide-react'
import { ReinvestmentAdvisor } from './ReinvestmentAdvisor'
import { TaxReserveFund } from './TaxReserveFund'
import { MonthlyTaxSetAside } from './MonthlyTaxSetAside'
import { TaxPaymentSchedule } from './TaxPaymentSchedule'

interface CashFlowIntelligenceProps {
  className?: string
}

export const CashFlowIntelligence = ({ className = '' }: CashFlowIntelligenceProps) => {
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm border theme-card glass-card ${className}`}
      style={{
        backgroundColor: 'var(--color-primary)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* Section Header */}
      <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between transition-all duration-200"
        >
          <div className="flex items-center space-x-3">
            <div 
              className="p-3 rounded-xl"
              style={{ backgroundColor: 'var(--color-info)', opacity: 0.1 }}
            >
              <Brain className="w-6 h-6" style={{ color: 'var(--color-info)' }} />
            </div>
            <div className="text-left">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Cash Flow Intelligence
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Advanced insights for tax planning and portfolio transitions
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
              4 insights
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
            ) : (
              <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-text-primary)' }} />
            )}
          </div>
        </button>
      </div>

      {/* Intelligence Components */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.5 }}
          className="p-6"
        >
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Row 1: Reinvestment Strategy and Tax Reserve */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <ReinvestmentAdvisor />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TaxReserveFund />
            </motion.div>

            {/* Row 2: Monthly Tax Planning and Payment Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <MonthlyTaxSetAside />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <TaxPaymentSchedule />
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}