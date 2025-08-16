'use client'

import React, { useState } from 'react'
import { Cloud, X, Upload, ChevronRight } from 'lucide-react'
import { useDataMigration } from '@/hooks/useDataMigration'
import { DataMigrationWizard } from './DataMigrationWizard'

interface MigrationBannerProps {
  onDismiss?: () => void
  className?: string
}

export function MigrationBanner({ onDismiss, className = '' }: MigrationBannerProps) {
  const [showWizard, setShowWizard] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  
  const { 
    shouldPromptMigration, 
    migrationStats, 
    canMigrate 
  } = useDataMigration()

  // Don't show if dismissed or no data to migrate
  if (dismissed || !shouldPromptMigration || !canMigrate) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  const handleStartMigration = () => {
    setShowWizard(true)
  }

  const handleMigrationComplete = (success: boolean) => {
    setShowWizard(false)
    if (success) {
      setDismissed(true) // Auto-dismiss on success
    }
  }

  if (showWizard) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <DataMigrationWizard 
          onComplete={handleMigrationComplete}
          onCancel={() => setShowWizard(false)}
        />
      </div>
    )
  }

  return (
    <div className={`bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Cloud className="h-8 w-8" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              Sync Your Data to Cloud
            </h3>
            <p className="text-blue-100 text-sm mt-1">
              We found {migrationStats.localStorage.portfolios} portfolio
              {migrationStats.localStorage.portfolios !== 1 ? 's' : ''} and{' '}
              {migrationStats.localStorage.expenses} expense
              {migrationStats.localStorage.expenses !== 1 ? 's' : ''} in your browser.{' '}
              Sync them to access from any device and keep them safe.
            </p>
            <p className="text-blue-200 text-xs mt-2">
              Estimated time: {migrationStats.estimatedMigrationTime}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleStartMigration}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2 text-sm"
          >
            <Upload className="h-4 w-4" />
            <span>Sync Now</span>
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <button
            onClick={handleDismiss}
            className="text-blue-200 hover:text-white transition-colors p-1"
            title="Dismiss"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}