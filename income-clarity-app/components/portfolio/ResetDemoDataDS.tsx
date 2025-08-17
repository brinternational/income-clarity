/**
 * Manual Portfolio Entry - Reset Demo Data
 * DEMO-008: "Reset to Demo Data" button with confirmation modal
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/design-system/core/Button'
import { ConfirmationModal } from '@/components/design-system/feedback/Modal'
import { Alert } from '@/components/design-system/core/Alert'
import { RotateCcw, Database, AlertTriangle } from 'lucide-react'
import { logger } from '@/lib/logger'

interface ResetDemoDataProps {
  onSuccess?: () => void
  variant?: 'button' | 'card'
  className?: string
}

export function ResetDemoDataDS({ 
  onSuccess,
  variant = 'button',
  className = ''
}: ResetDemoDataProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleReset = async () => {
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      logger.log('🔄 Resetting to demo data...')

      const response = await fetch('/api/demo/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reset to demo data')
      }

      const result = await response.json()
      logger.log('✅ Demo data reset successful:', result)
      
      setSuccess(true)
      setShowConfirmModal(false)
      
      // Call success callback after a brief delay to show success message
      setTimeout(() => {
        onSuccess?.()
        setSuccess(false)
      }, 2000)
      
    } catch (err) {
      logger.error('❌ Error resetting demo data:', err)
      setError(err instanceof Error ? err.message : 'Failed to reset to demo data')
    } finally {
      setLoading(false)
    }
  }

  const renderButton = () => (
    <Button
      variant="outline"
      onClick={() => setShowConfirmModal(true)}
      disabled={loading}
      leftIcon={<RotateCcw className="w-4 h-4" />}
      className={className}
    >
      Reset to Demo Data
    </Button>
  )

  const renderCard = () => (
    <div className={`bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-2 bg-brand-100 dark:bg-brand-900/20 rounded-lg">
          <Database className="w-6 h-6 text-brand-600 dark:text-brand-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            Demo Portfolio Data
          </h3>
          
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
            Reset your portfolio to sample data with popular stocks and realistic transactions. 
            This will replace all your current holdings and transaction history.
          </p>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">Warning</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              This action cannot be undone. All your current portfolio data will be permanently deleted.
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowConfirmModal(true)}
            disabled={loading}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reset to Demo Data
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Success Message */}
      {success && (
        <Alert variant="success" className="mb-4">
          Demo data has been successfully loaded! Your portfolio now contains sample holdings.
        </Alert>
      )}
      
      {/* Error Message */}
      {error && (
        <Alert variant="error" className="mb-4">
          {error}
        </Alert>
      )}
      
      {/* Render based on variant */}
      {variant === 'button' ? renderButton() : renderCard()}
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        open={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Reset to Demo Data"
        description="Are you sure you want to reset your portfolio to demo data? This will permanently delete all your current holdings, transactions, and income records."
        confirmLabel="Yes, Reset Data"
        cancelLabel="Cancel"
        variant="danger"
        loading={loading}
        onConfirm={handleReset}
        onCancel={() => setShowConfirmModal(false)}
      >
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">This action cannot be undone</span>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              All your current data will be permanently deleted and replaced with:
            </p>
            <ul className="mt-2 text-sm text-amber-700 dark:text-amber-300 list-disc list-inside space-y-1">
              <li>Sample portfolio with popular stocks (AAPL, MSFT, GOOGL, etc.)</li>
              <li>Realistic purchase transactions with different dates</li>
              <li>Sample dividend payments and income records</li>
              <li>Demonstration data for all Super Cards features</li>
            </ul>
          </div>
          
          <div className="bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg p-4">
            <div className="flex items-center gap-2 text-brand-800 dark:text-brand-200 mb-2">
              <Database className="w-5 h-5" />
              <span className="font-medium">What you'll get</span>
            </div>
            <p className="text-sm text-brand-700 dark:text-brand-300">
              The demo data is perfect for testing all features and seeing how the app works with a realistic portfolio.
            </p>
          </div>
        </div>
      </ConfirmationModal>
    </>
  )
}