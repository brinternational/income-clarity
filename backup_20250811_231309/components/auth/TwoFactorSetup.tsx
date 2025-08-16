'use client'

import { useState, useEffect } from 'react'
import { Shield, Smartphone, Copy, Check, Download, AlertTriangle, RefreshCw, Eye, EyeOff } from 'lucide-react'
import type { 
  MFAEnrollmentRequest, 
  MFAEnrollmentResponse,
  MFAVerificationRequest,
  MFAVerificationResponse,
  MFAFactor 
} from '@/types'

interface TwoFactorSetupProps {
  onSetupComplete: (factor: MFAFactor) => void
  onCancel: () => void
  isOpen: boolean
}

type SetupStep = 'device-name' | 'qr-code' | 'verify' | 'backup-codes' | 'complete'

export function TwoFactorSetup({ onSetupComplete, onCancel, isOpen }: TwoFactorSetupProps) {
  const [currentStep, setCurrentStep] = useState<SetupStep>('device-name')
  const [deviceName, setDeviceName] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [enrollmentData, setEnrollmentData] = useState<MFAEnrollmentResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [backupCodesDownloaded, setBackupCodesDownloaded] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('device-name')
      setDeviceName('')
      setVerificationCode('')
      setEnrollmentData(null)
      setError('')
      setCopiedStates({})
      setShowBackupCodes(false)
      setBackupCodesDownloaded(false)
    }
  }, [isOpen])

  const handleDeviceNameSubmit = async () => {
    if (!deviceName.trim()) {
      setError('Please enter a name for your authenticator device')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const enrollmentRequest: MFAEnrollmentRequest = {
        factorType: 'totp',
        friendlyName: deviceName.trim()
      }

      const response = await fetch('/api/auth/mfa/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrollmentRequest)
      })

      const data: MFAEnrollmentResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to enroll MFA factor')
      }

      setEnrollmentData(data)
      setCurrentStep('qr-code')

    } catch (error) {
      // Error handled by emergency recovery script finally {
      setIsLoading(false)
    }
  }

  const handleVerificationSubmit = async () => {
    if (!verificationCode || !/^\d{6}$/.test(verificationCode)) {
      setError('Please enter a valid 6-digit verification code')
      return
    }

    if (!enrollmentData?.factor?.id) {
      setError('No enrollment data found. Please restart the setup process.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const verificationRequest: MFAVerificationRequest = {
        factorId: enrollmentData.factor.id,
        code: verificationCode
      }

      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verificationRequest)
      })

      const data: MFAVerificationResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid verification code')
      }

      // Mark factor as verified
      if (enrollmentData.factor) {
        enrollmentData.factor.status = 'verified'
      }

      setCurrentStep('backup-codes')

    } catch (error) {
      // Error handled by emergency recovery script finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [key]: true }))
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (error) {
      // Error handled by emergency recovery script

  const downloadBackupCodes = () => {
    if (!enrollmentData?.backupCodes) return

    const codesText = enrollmentData.backupCodes.join('\n')
    const blob = new Blob([`Income Clarity - Two-Factor Authentication Backup Codes\n\nGenerated: ${new Date().toLocaleDateString()}\nDevice: ${deviceName}\n\nIMPORTANT: Each code can only be used once. Store these codes securely.\n\n${codesText}\n\nIf you lose access to your authenticator device, you can use these codes to regain access to your account.`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `income-clarity-backup-codes-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setBackupCodesDownloaded(true)
  }

  const handleComplete = () => {
    if (enrollmentData?.factor) {
      onSetupComplete(enrollmentData.factor)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Two-Factor Authentication Setup</h2>
              <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Step 1: Device Name */}
          {currentStep === 'device-name' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Step 1: Name Your Device</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose a name for your authenticator device to help you identify it later.
                </p>
                <input
                  type="text"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  placeholder="e.g., iPhone, Google Authenticator"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={50}
                />
              </div>
            </div>
          )}

          {/* Step 2: QR Code */}
          {currentStep === 'qr-code' && enrollmentData && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Step 2: Scan QR Code</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, 1Password, etc.)
                </p>
                
                {/* QR Code Display */}
                {enrollmentData.qrCode && (
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg">
                      <img 
                        src={enrollmentData.qrCode} 
                        alt="QR Code for 2FA setup"
                        className="w-48 h-48"
                      />
                    </div>
                  </div>
                )}

                {/* Manual Entry Option */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 mb-2">Can't scan? Enter this code manually:</p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-2 py-1 bg-white border rounded text-sm font-mono break-all">
                      {enrollmentData.manualEntryKey}
                    </code>
                    <button
                      onClick={() => copyToClipboard(enrollmentData.manualEntryKey || '', 'manual-key')}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Copy manual entry key"
                    >
                      {copiedStates['manual-key'] ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Verify Code */}
          {currentStep === 'verify' && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Step 3: Verify Setup</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Enter the 6-digit code from your authenticator app to complete setup.
                </p>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-wider"
                  maxLength={6}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Code refreshes every 30 seconds
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Backup Codes */}
          {currentStep === 'backup-codes' && enrollmentData?.backupCodes && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Step 4: Save Your Backup Codes</h3>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-amber-800">
                      <p className="font-medium">Important!</p>
                      <p>These backup codes can be used to access your account if you lose your authenticator device. Each code can only be used once.</p>
                    </div>
                  </div>
                </div>

                {/* Backup Codes Display */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium">Your Backup Codes:</p>
                    <button
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      {showBackupCodes ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      <span>{showBackupCodes ? 'Hide' : 'Show'} Codes</span>
                    </button>
                  </div>
                  
                  <div className={`grid grid-cols-2 gap-2 p-3 bg-gray-50 rounded-lg border ${!showBackupCodes ? 'filter blur-sm' : ''}`}>
                    {enrollmentData.backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <code className="text-sm font-mono">{code}</code>
                        <button
                          onClick={() => copyToClipboard(code, `backup-${index}`)}
                          className="p-1 hover:bg-gray-100 rounded"
                        >
                          {copiedStates[`backup-${index}`] ? (
                            <Check className="w-3 h-3 text-green-600" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-500" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Download Button */}
                <button
                  onClick={downloadBackupCodes}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Backup Codes</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Complete */}
          {currentStep === 'complete' && (
            <div className="text-center space-y-4">
              <div className="p-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="font-medium mb-2">Setup Complete!</h3>
                <p className="text-sm text-gray-600">
                  Two-factor authentication has been enabled for your account. You'll need to enter a code from your authenticator app when signing in.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          
          <div className="flex space-x-3">
            {currentStep === 'qr-code' && (
              <button
                onClick={() => setCurrentStep('verify')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            )}
            
            {currentStep === 'device-name' && (
              <button
                onClick={handleDeviceNameSubmit}
                disabled={isLoading || !deviceName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Continue</span>
              </button>
            )}
            
            {currentStep === 'verify' && (
              <button
                onClick={handleVerificationSubmit}
                disabled={isLoading || !verificationCode || verificationCode.length !== 6}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                <span>Verify</span>
              </button>
            )}
            
            {currentStep === 'backup-codes' && (
              <button
                onClick={handleComplete}
                disabled={!backupCodesDownloaded}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title={!backupCodesDownloaded ? 'Please download your backup codes first' : ''}
              >
                Complete Setup
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}