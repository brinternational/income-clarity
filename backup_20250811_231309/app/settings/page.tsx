'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useDataPersistence } from '@/contexts/DataPersistenceContext'
import { useAuthContext } from '@/contexts/AuthContext'
import { PushNotificationSetup } from '@/components/notifications/PushNotificationSetup'
import { TwoFactorSetup } from '@/components/auth/TwoFactorSetup'
import { Download, Upload, Trash2, ArrowLeft, Save, AlertCircle, Shield, Plus, Trash, AlertTriangle, CheckCircle, Cloud, RefreshCw } from 'lucide-react'
import type { NotificationPreferences, MFAStatus, MFAFactor } from '@/types'
import { useDataMigration } from '@/hooks/useDataMigration'
import { DataMigrationWizard } from '@/components/migration/DataMigrationWizard'
import { AppShell } from '@/components/AppShell'

// Force dynamic rendering for this page to prevent prerendering issues
export const dynamic = 'force-dynamic'

function SettingsContent() {
  const [mounted, setMounted] = useState(false)

  // Only render after hydration to prevent SSR issues
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  return <SettingsContentMounted />
}

function SettingsContentMounted() {
  const router = useRouter()
  const { user } = useAuthContext()
  const { hasLocalData, clearLocalData, exportData, importData } = useDataPersistence()
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importError, setImportError] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(null)
  
  // MFA state
  const [mfaStatus, setMfaStatus] = useState<MFAStatus | null>(null)
  const [showMfaSetup, setShowMfaSetup] = useState(false)
  const [mfaLoading, setMfaLoading] = useState(false)
  const [showDisableConfirm, setShowDisableConfirm] = useState<string | null>(null)
  const [disablePassword, setDisablePassword] = useState('')
  
  // Migration state
  const {
    canMigrate,
    isMigrating,
    migrationStatus,
    statusMessage,
    shouldPromptMigration,
    migrationStats,
    startMigration,
    downloadBackup
  } = useDataMigration()
  const [showMigrationWizard, setShowMigrationWizard] = useState(false)

  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `income-clarity-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const success = importData(content)
        if (success) {
          setShowImportDialog(false)
          setImportError('')
          // Refresh the page to show new data
          window.location.reload()
        } else {
          setImportError('Invalid backup file format')
        }
      } catch (error) {
        setImportError('Failed to import backup file')
      }
    }
    reader.readAsText(file)
  }

  const handleClearData = () => {
    clearLocalData()
    setShowClearConfirm(false)
    // Redirect to dashboard
    router.push('/')
  }

  // Handle notification preferences
  const handleNotificationPreferencesChange = async (preferences: NotificationPreferences) => {
    setNotificationPreferences(preferences)
    
    // Save to local storage for now (in production, would save to Supabase)
    try {
      localStorage.setItem('notification-preferences', JSON.stringify(preferences))
      
      // If user has a valid user email, use that as ID for API calls
      if (user?.email) {
        const response = await fetch('/api/notifications/schedule', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.email,
            preferences
          })
        });
        
        if (!response.ok) {
          // console.warn('Failed to save preferences to API:', response.statusText);
        }
      }
    } catch (error) {
      // Error handled by emergency recovery script

  // MFA handlers
  const loadMfaStatus = async () => {
    try {
      const response = await fetch('/api/auth/mfa/manage')
      const data = await response.json()
      
      if (response.ok && data.success) {
        setMfaStatus(data.status)
      } else {
        // console.error('Failed to load MFA status:', data.error)
      }
    } catch (error) {
      // Error handled by emergency recovery script

  const handleMfaSetupComplete = (factor: MFAFactor) => {
    setShowMfaSetup(false)
    loadMfaStatus() // Reload MFA status
  }

  const handleDisableMfa = async (factorId: string) => {
    if (!disablePassword) {
      alert('Please enter your password to disable two-factor authentication')
      return
    }

    setMfaLoading(true)
    
    try {
      const response = await fetch('/api/auth/mfa/manage', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          factorId,
          password: disablePassword
        })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setShowDisableConfirm(null)
        setDisablePassword('')
        loadMfaStatus() // Reload MFA status
        alert('Two-factor authentication has been disabled for this device.')
      } else {
        alert(data.error || 'Failed to disable two-factor authentication')
      }
    } catch (error) {
      // Error handled by emergency recovery script finally {
      setMfaLoading(false)
    }
  }

  // Load notification preferences and MFA status on component mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('notification-preferences');
      if (savedPreferences) {
        setNotificationPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      // console.error('Failed to load notification preferences:', error);
    }

    // Load MFA status
    loadMfaStatus()
  }, []);

  return (
    <AppShell 
      title="Income Clarity - Settings"
      showHeader={true}
      showBottomNav={true}
      showPWAInstaller={true}
    >
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profile Section */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Profile</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-slate-400">Email</label>
              <p className="font-medium text-white">{user?.email || 'Not signed in'}</p>
            </div>
            <div>
              <label className="text-sm text-slate-400">Name</label>
              <p className="font-medium text-white">{user?.name || 'Demo User'}</p>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Security</h2>
              <p className="text-sm text-slate-400">Manage your account security settings</p>
            </div>
          </div>
          
          {/* Two-Factor Authentication */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex-1">
                <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Add an extra layer of security to your account
                </p>
                {mfaStatus?.enabled && (
                  <div className="flex items-center space-x-2 mt-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-400">
                      {mfaStatus.factorCount} authenticator{mfaStatus.factorCount === 1 ? '' : 's'} configured
                    </span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {!mfaStatus?.enabled ? (
                  <button
                    onClick={() => setShowMfaSetup(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Enable</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowMfaSetup(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-white/10 backdrop-blur text-white text-sm rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Device</span>
                  </button>
                )}
              </div>
            </div>

            {/* MFA Factors List */}
            {mfaStatus?.factors && mfaStatus.factors.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-300">Your Authenticator Devices:</h4>
                {mfaStatus.factors.map((factor) => (
                  <div key={factor.id} className="flex items-center justify-between p-3 bg-white/10 backdrop-blur rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-white/20 rounded">
                        <Shield className="w-4 h-4 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{factor.friendlyName}</p>
                        <div className="flex items-center space-x-3 text-xs text-slate-400">
                          <span>Added {new Date(factor.createdAt).toLocaleDateString()}</span>
                          {factor.status === 'verified' ? (
                            <span className="flex items-center space-x-1 text-green-400">
                              <CheckCircle className="w-3 h-3" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-amber-400">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Pending verification</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowDisableConfirm(factor.id)}
                      className="flex items-center space-x-1 px-2 py-1 text-xs text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      title="Remove this authenticator"
                    >
                      <Trash className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Security Tips */}
            <div className="p-4 bg-blue-500/10 backdrop-blur rounded-lg border border-blue-500/20">
              <h4 className="text-sm font-medium text-blue-200 mb-2">Security Tips:</h4>
              <ul className="text-xs text-blue-300 space-y-1">
                <li>• Use an authenticator app like Google Authenticator, Authy, or 1Password</li>
                <li>• Save your backup codes in a secure location</li>
                <li>• Consider setting up multiple authenticators for redundancy</li>
                <li>• Keep your authenticator app updated</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Data Management</h2>
          
          <div className="space-y-4">
            {/* Data Storage Status */}
            <div className="p-4 bg-blue-500/10 backdrop-blur rounded-lg border border-blue-500/20">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-200">Local Storage Active</p>
                  <p className="text-sm text-blue-300 mt-1">
                    Your data is currently stored locally on this device. 
                    {hasLocalData ? ' You have saved data.' : ' No data saved yet.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Export Data */}
            <div>
              <button
                onClick={handleExport}
                disabled={!hasLocalData}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              <p className="text-sm text-slate-400 mt-2">
                Download a backup of all your portfolio and expense data
              </p>
            </div>

            {/* Import Data */}
            <div>
              <button
                onClick={() => setShowImportDialog(true)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur text-white rounded-lg hover:bg-white/20 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>Import Data</span>
              </button>
              <p className="text-sm text-slate-400 mt-2">
                Restore data from a previous backup
              </p>
            </div>

            {/* Clear Data */}
            <div className="pt-4 border-t">
              <button
                onClick={() => setShowClearConfirm(true)}
                disabled={!hasLocalData}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All Data</span>
              </button>
              <p className="text-sm text-slate-400 mt-2">
                Permanently delete all locally stored data
              </p>
            </div>
          </div>
        </div>

        {/* Push Notifications Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6 mb-6">
          <div className="mb-6">
            <PushNotificationSetup 
              onPreferencesChange={handleNotificationPreferencesChange}
              initialPreferences={notificationPreferences || undefined}
            />
          </div>
        </div>

        {/* Data & Sync Section */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Cloud className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Data & Sync</h2>
              <p className="text-sm text-slate-400">Manage your data synchronization and cloud backup</p>
            </div>
          </div>

          {/* Migration Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <div className="flex-1">
                <h3 className="font-medium text-white">Cloud Synchronization</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {statusMessage}
                </p>
                {canMigrate && migrationStats && (
                  <div className="flex items-center space-x-4 mt-2 text-sm text-blue-400">
                    {migrationStats.localStorage.portfolios > 0 && (
                      <span>{migrationStats.localStorage.portfolios} portfolio{migrationStats.localStorage.portfolios !== 1 ? 's' : ''}</span>
                    )}
                    {migrationStats.localStorage.expenses > 0 && (
                      <span>{migrationStats.localStorage.expenses} expense{migrationStats.localStorage.expenses !== 1 ? 's' : ''}</span>
                    )}
                    {migrationStats.localStorage.hasProfile && (
                      <span>User profile</span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {migrationStatus === 'completed' ? (
                  <div className="flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Synced</span>
                  </div>
                ) : migrationStatus === 'migrating' ? (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-sm font-medium">Syncing...</span>
                  </div>
                ) : canMigrate ? (
                  <button
                    onClick={() => setShowMigrationWizard(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Sync to Cloud</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 text-gray-500">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">No data to sync</span>
                  </div>
                )}
              </div>
            </div>

            {/* Migration Actions */}
            {migrationStatus === 'completed' && (
              <div className="p-4 bg-green-500/10 backdrop-blur rounded-lg border border-green-500/20">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-200">Data Successfully Synced</p>
                    <p className="text-sm text-green-300 mt-1">
                      Your data is safely stored in the cloud and automatically synchronized across all your devices.
                    </p>
                    <div className="mt-3">
                      <button
                        onClick={() => downloadBackup()}
                        className="text-sm text-green-300 hover:text-green-200 font-medium"
                      >
                        Download backup copy →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {canMigrate && migrationStatus === 'ready' && (
              <div className="p-4 bg-blue-500/10 backdrop-blur rounded-lg border border-blue-500/20">
                <div className="flex items-start space-x-3">
                  <Cloud className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-200">Ready for Cloud Sync</p>
                    <p className="text-sm text-blue-300 mt-1">
                      Your local data can be synchronized to the cloud for backup and multi-device access.
                      Estimated time: {migrationStats?.estimatedMigrationTime || '1-2 minutes'}.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!canMigrate && migrationStatus === 'no-data' && (
              <div className="p-4 bg-slate-500/10 backdrop-blur rounded-lg border border-slate-500/20">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-slate-200">No Local Data Found</p>
                    <p className="text-sm text-slate-300 mt-1">
                      Start using Income Clarity to track your portfolio and expenses. Your data will be automatically available for cloud sync.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Migration Benefits */}
            <div className="p-4 bg-blue-500/10 backdrop-blur rounded-lg border border-blue-500/20">
              <h4 className="text-sm font-medium text-blue-200 mb-2">Cloud Sync Benefits:</h4>
              <ul className="text-xs text-blue-300 space-y-1">
                <li>• Access your data from any device</li>
                <li>• Automatic backup and data protection</li>
                <li>• Real-time synchronization across devices</li>
                <li>• Secure encrypted storage</li>
              </ul>
            </div>
          </div>
        </div>
      
        {/* Import Dialog */}
      {showImportDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Import Data</h3>
            
            {importError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-300">
                {importError}
              </div>
            )}
            
            <p className="text-sm text-slate-300 mb-4">
              Select a backup file to import. This will replace all existing data.
            </p>
            
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="block w-full text-sm text-white border border-white/20 rounded-lg cursor-pointer bg-white/10 backdrop-blur focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => {
                  setShowImportDialog(false)
                  setImportError('')
                }}
                className="flex-1 px-4 py-2 text-white bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Dialog */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 text-white">Clear All Data?</h3>
            <p className="text-sm text-slate-300 mb-6">
              This will permanently delete all your portfolio and expense data stored on this device. 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 text-white bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MFA Setup Dialog */}
      <TwoFactorSetup
        isOpen={showMfaSetup}
        onSetupComplete={handleMfaSetupComplete}
        onCancel={() => setShowMfaSetup(false)}
      />

      {/* MFA Disable Confirmation Dialog */}
      {showDisableConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Disable Two-Factor Authentication</h3>
                <p className="text-sm text-slate-400">This will reduce your account security</p>
              </div>
            </div>
            
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-200">
                  <p className="font-medium">Warning:</p>
                  <p>Disabling two-factor authentication will make your account less secure. You'll only need your password to sign in.</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="disable-password" className="block text-sm font-medium text-slate-300 mb-2">
                Enter your password to confirm:
              </label>
              <input
                id="disable-password"
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/10 backdrop-blur text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400/50"
                placeholder="Your account password"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDisableConfirm(null)
                  setDisablePassword('')
                }}
                className="flex-1 px-4 py-2 text-white bg-white/10 backdrop-blur rounded-lg hover:bg-white/20 transition-colors"
                disabled={mfaLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDisableMfa(showDisableConfirm)}
                disabled={mfaLoading || !disablePassword}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {mfaLoading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                <span>Disable 2FA</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Migration Wizard Dialog */}
      {showMigrationWizard && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <DataMigrationWizard 
            onComplete={(success) => {
              setShowMigrationWizard(false)
              if (success) {
                // Show success message or refresh the page to show new sync status
                window.location.reload()
              }
            }}
            onCancel={() => setShowMigrationWizard(false)}
          />
        </div>
      )}
        </div>
      </main>
    </AppShell>
  )
}

export default SettingsContent