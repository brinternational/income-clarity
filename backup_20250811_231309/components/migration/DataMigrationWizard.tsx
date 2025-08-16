'use client'

import React, { useState, useCallback } from 'react'
import { 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  Database, 
  ArrowRight,
  Download,
  Trash2,
  RefreshCw
} from 'lucide-react'
import { DataMigrationService, MigrationProgress, MigrationResult } from '@/lib/migration/data-migration.service'

interface DataMigrationWizardProps {
  onComplete?: (success: boolean) => void
  onCancel?: () => void
}

type WizardStep = 'detect' | 'preview' | 'migrate' | 'complete'

export function DataMigrationWizard({ onComplete, onCancel }: DataMigrationWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('detect')
  const [migrationData, setMigrationData] = useState(DataMigrationService.getMigrationPreview())
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [backup, setBackup] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // Check if user has data to migrate
  const hasLocalData = DataMigrationService.hasLocalStorageData()
  const stats = DataMigrationService.getMigrationStats()

  const handleStartMigration = useCallback(async () => {
    setIsLoading(true)
    setCurrentStep('migrate')
    
    // Create backup first
    const backupData = DataMigrationService.createLocalStorageBackup()
    setBackup(backupData)
    
    // Set progress callback
    DataMigrationService.setProgressCallback(setMigrationProgress)
    
    try {
      const result = await DataMigrationService.migrateToSupabase()
      setMigrationResult(result)
      setCurrentStep('complete')
      
      if (onComplete) {
        onComplete(result.success)
      }
    } catch (error: any) {
      setMigrationResult({
        success: false,
        migrated: { portfolios: 0, expenses: 0, profile: false },
        errors: [error.message],
        duration: 0
      })
      setCurrentStep('complete')
    }
    
    setIsLoading(false)
  }, [onComplete])

  const handleDownloadBackup = () => {
    if (!backup) return
    
    const blob = new Blob([backup], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `income-clarity-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClearLocalStorage = () => {
    if (confirm('Are you sure you want to clear your local data? This cannot be undone. Make sure you have downloaded your backup first.')) {
      DataMigrationService.clearLocalStorageAfterMigration(true)
      // Refresh migration data
      setMigrationData(DataMigrationService.getMigrationPreview())
    }
  }

  const renderDetectStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Database className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">
          Cloud Sync Available
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          We found data in your browser storage that can be synced to the cloud for backup and multi-device access.
        </p>
      </div>

      {hasLocalData ? (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-3">Data Found:</h4>
          <div className="space-y-2 text-sm">
            {stats.localStorage.hasProfile && (
              <div className="flex items-center text-blue-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                User profile and preferences
              </div>
            )}
            {stats.localStorage.portfolios > 0 && (
              <div className="flex items-center text-blue-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                {stats.localStorage.portfolios} portfolio{stats.localStorage.portfolios !== 1 ? 's' : ''}
              </div>
            )}
            {stats.localStorage.expenses > 0 && (
              <div className="flex items-center text-blue-700">
                <CheckCircle className="h-4 w-4 mr-2" />
                {stats.localStorage.expenses} expense{stats.localStorage.expenses !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <p className="text-sm text-blue-600 mt-3">
            Estimated migration time: {stats.estimatedMigrationTime}
          </p>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
          <p className="text-gray-600">No local data found to migrate.</p>
        </div>
      )}

      <div className="flex space-x-4">
        {hasLocalData && (
          <button
            onClick={() => setCurrentStep('preview')}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        )}
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
        >
          {hasLocalData ? 'Skip for Now' : 'Close'}
        </button>
      </div>
    </div>
  )

  const renderPreviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Upload className="mx-auto h-12 w-12 text-green-600 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">
          Ready to Migrate
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Review your data before syncing to the cloud. We'll create a backup first.
        </p>
      </div>

      <div className="space-y-4">
        {migrationData.profile && (
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <h4 className="font-medium text-green-900 mb-2">Profile</h4>
            <div className="text-sm text-green-700">
              <p>Profile data available for migration</p>
            </div>
          </div>
        )}

        {migrationData.portfolios.length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2">
              Portfolios ({migrationData.portfolios.length})
            </h4>
            <div className="space-y-2">
              {migrationData.portfolios.map((portfolio, index) => (
                <div key={portfolio.id} className="text-sm text-blue-700">
                  <span className="font-medium">{portfolio.name}</span>
                  <span className="text-blue-600 ml-2">
                    ({portfolio.holdings?.length || 0} holdings)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {migrationData.expenses.length > 0 && (
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 className="font-medium text-orange-900 mb-2">
              Expenses ({migrationData.expenses.length})
            </h4>
            <div className="text-sm text-orange-700">
              <p>Categories: {[...new Set(migrationData.expenses.map(e => e.category))].join(', ')}</p>
              <p>Date range: {migrationData.expenses.length > 0 ? 
                `${new Date(Math.min(...migrationData.expenses.map(e => new Date(e.date).getTime()))).toLocaleDateString()} - ${new Date(Math.max(...migrationData.expenses.map(e => new Date(e.date).getTime()))).toLocaleDateString()}` 
                : 'N/A'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-900">Before we start:</p>
            <ul className="mt-2 text-amber-700 space-y-1">
              <li>• A backup will be created automatically</li>
              <li>• Your local data will remain untouched during migration</li>
              <li>• You can continue using the app if migration fails</li>
              <li>• This process typically takes {stats.estimatedMigrationTime}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleStartMigration}
          disabled={isLoading}
          className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <RefreshCw className="animate-spin mr-2 h-4 w-4" />
              Starting...
            </>
          ) : (
            <>
              Start Migration <Upload className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
        <button
          onClick={() => setCurrentStep('detect')}
          disabled={isLoading}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
        >
          Back
        </button>
      </div>
    </div>
  )

  const renderMigrateStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <RefreshCw className="mx-auto h-12 w-12 text-blue-600 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">
          Migrating Your Data
        </h3>
        <p className="text-sm text-gray-600 mt-2">
          Please wait while we sync your data to the cloud...
        </p>
      </div>

      {migrationProgress && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900 capitalize">
                {migrationProgress.step}
              </h4>
              <span className="text-sm text-blue-600">
                {migrationProgress.completed}/{migrationProgress.total}
              </span>
            </div>
            
            <div className="w-full bg-blue-200 rounded-full h-2 mb-3">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${migrationProgress.total > 0 ? (migrationProgress.completed / migrationProgress.total) * 100 : 0}%` 
                }}
              />
            </div>

            {migrationProgress.message && (
              <p className="text-sm text-blue-700">{migrationProgress.message}</p>
            )}

            {migrationProgress.error && (
              <p className="text-sm text-red-600 mt-2">
                Error: {migrationProgress.error}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const renderCompleteStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        {migrationResult?.success ? (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Migration Completed Successfully!
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Your data has been synced to the cloud and is now available across all your devices.
            </p>
          </>
        ) : (
          <>
            <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              Migration Encountered Issues
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Some data couldn't be migrated. Your local data is safe and the app will continue working normally.
            </p>
          </>
        )}
      </div>

      {migrationResult && (
        <div className="space-y-4">
          <div className={`rounded-lg p-4 border ${
            migrationResult.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h4 className={`font-medium mb-3 ${
              migrationResult.success ? 'text-green-900' : 'text-red-900'
            }`}>
              Migration Results
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Profile:</span>
                <span className={migrationResult.migrated.profile ? 'text-green-600' : 'text-gray-500'}>
                  {migrationResult.migrated.profile ? '✓ Migrated' : '○ Not found'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Portfolios:</span>
                <span className={migrationResult.migrated.portfolios > 0 ? 'text-green-600' : 'text-gray-500'}>
                  {migrationResult.migrated.portfolios} migrated
                </span>
              </div>
              <div className="flex justify-between">
                <span>Expenses:</span>
                <span className={migrationResult.migrated.expenses > 0 ? 'text-green-600' : 'text-gray-500'}>
                  {migrationResult.migrated.expenses} migrated
                </span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-gray-600">
                  {(migrationResult.duration / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
          </div>

          {migrationResult.errors.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <h5 className="font-medium text-red-900 mb-2">Errors:</h5>
              <ul className="text-sm text-red-700 space-y-1">
                {migrationResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {backup && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-2">Backup Created</h5>
              <p className="text-sm text-blue-700 mb-3">
                A backup of your local data was created before migration.
              </p>
              <button
                onClick={handleDownloadBackup}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors flex items-center"
              >
                <Download className="h-4 w-4 mr-1" />
                Download Backup
              </button>
            </div>
          )}

          {migrationResult.success && (
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <h5 className="font-medium text-amber-900 mb-2">Clean Up Local Storage</h5>
              <p className="text-sm text-amber-700 mb-3">
                Your data is now safely stored in the cloud. You can optionally clear your browser storage to free up space.
              </p>
              <button
                onClick={handleClearLocalStorage}
                className="bg-amber-600 text-white px-3 py-1 rounded text-sm hover:bg-amber-700 transition-colors flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Local Data
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-4">
        <button
          onClick={() => onComplete?.(migrationResult?.success || false)}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  )

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {currentStep === 'detect' && renderDetectStep()}
      {currentStep === 'preview' && renderPreviewStep()}
      {currentStep === 'migrate' && renderMigrateStep()}
      {currentStep === 'complete' && renderCompleteStep()}
    </div>
  )
}