'use client'

import { useState, useEffect, useRef } from 'react'
import { Shield, RefreshCw, AlertTriangle, Key } from 'lucide-react'
import type { 
  MFAVerificationRequest,
  MFAVerificationResponse 
} from '@/types'

interface TwoFactorVerifyProps {
  factorId: string
  userEmail?: string
  onVerificationSuccess: () => void
  onCancel: () => void
  onUseBackupCode: () => void
}

export function TwoFactorVerify({ 
  factorId, 
  userEmail,
  onVerificationSuccess, 
  onCancel,
  onUseBackupCode 
}: TwoFactorVerifyProps) {
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(30) // 30 second countdown for code refresh
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Countdown timer for code refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 30)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleVerificationSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!verificationCode || !/^\d{6}$/.test(verificationCode)) {
      setError('Please enter a valid 6-digit verification code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const verificationRequest: MFAVerificationRequest = {
        factorId,
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
        setRemainingAttempts(data.remainingAttempts || null)
        throw new Error(data.error || 'Verification failed')
      }

      // Success - notify parent component
      onVerificationSuccess()

    } catch (error) {
      // console.error('Verification error:', error)
      // setError(error instanceof Error ? error.message : 'Verification failed')
      
      // Clear the input for retry
      setVerificationCode('')
      inputRef.current?.focus()
      
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    // Only allow digits, max 6 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 6)
    setVerificationCode(cleanValue)
    
    // Clear error when user starts typing
    if (error) {
      setError('')
    }

    // Auto-submit when 6 digits are entered
    if (cleanValue.length === 6) {
      setTimeout(() => {
        handleVerificationSubmit()
      }, 100) // Small delay to ensure state is updated
    }
  }

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length === 6) {
      handleVerificationSubmit()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
        <p className="text-gray-600">
          Enter the 6-digit code from your authenticator app
          {userEmail && (
            <>
              <br />
              <span className="text-sm">for {userEmail}</span>
            </>
          )}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm text-red-700">{error}</p>
            {remainingAttempts !== null && (
              <p className="text-xs text-red-600 mt-1">
                {remainingAttempts > 0 
                  ? `${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining`
                  : 'Too many failed attempts. Please try again later.'
                }
              </p>
            )}
          </div>
        </div>
      )}

      {/* Verification Form */}
      <form onSubmit={handleVerificationSubmit} className="space-y-6">
        <div>
          <label htmlFor="verification-code" className="sr-only">
            Verification Code
          </label>
          <input
            ref={inputRef}
            id="verification-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={verificationCode}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="000000"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-mono tracking-wider"
            maxLength={6}
            disabled={isLoading || remainingAttempts === 0}
          />
          
          {/* Code refresh countdown */}
          <div className="flex items-center justify-center mt-2 text-xs text-gray-500">
            <RefreshCw className={`w-3 h-3 mr-1 ${timeLeft <= 5 ? 'animate-spin' : ''}`} />
            <span>Code refreshes in {timeLeft}s</span>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || verificationCode.length !== 6 || remainingAttempts === 0}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          <span>Verify Code</span>
        </button>
      </form>

      {/* Alternative Options */}
      <div className="mt-8 space-y-4">
        {/* Backup Code Option */}
        <div className="text-center">
          <button
            onClick={onUseBackupCode}
            className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isLoading}
          >
            <Key className="w-4 h-4" />
            <span>Use backup code instead</span>
          </button>
        </div>

        {/* Cancel Option */}
        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            Cancel and return to login
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Need help?</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Make sure your device's time is synchronized</li>
          <li>• The code changes every 30 seconds</li>
          <li>• Check your authenticator app (Google Authenticator, Authy, etc.)</li>
          <li>• Use a backup code if you can't access your authenticator</li>
        </ul>
      </div>
    </div>
  )
}

interface BackupCodeVerifyProps {
  onVerificationSuccess: () => void
  onCancel: () => void
  onUseAuthenticator: () => void
}

export function BackupCodeVerify({ 
  onVerificationSuccess, 
  onCancel, 
  onUseAuthenticator 
}: BackupCodeVerifyProps) {
  const [backupCode, setBackupCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleBackupCodeSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()

    if (!backupCode || !/^[A-Z0-9]{8}$/.test(backupCode.toUpperCase())) {
      setError('Please enter a valid 8-character backup code')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ backupCode: backupCode.toUpperCase() })
      })

      const data: MFAVerificationResponse = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid backup code')
      }

      onVerificationSuccess()

    } catch (error) {
      // console.error('Backup code verification error:', error)
      // setError(error instanceof Error ? error.message : 'Invalid backup code')
      setBackupCode('')
      inputRef.current?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    // Only allow alphanumeric characters, max 8 characters
    const cleanValue = value.replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 8)
    setBackupCode(cleanValue)
    
    if (error) {
      setError('')
    }

    // Auto-submit when 8 characters are entered
    if (cleanValue.length === 8) {
      setTimeout(() => {
        handleBackupCodeSubmit()
      }, 100)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Key className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Backup Code</h2>
        <p className="text-gray-600">
          Enter one of your 8-character backup codes
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Backup Code Form */}
      <form onSubmit={handleBackupCodeSubmit} className="space-y-6">
        <div>
          <label htmlFor="backup-code" className="sr-only">
            Backup Code
          </label>
          <input
            ref={inputRef}
            id="backup-code"
            type="text"
            autoComplete="one-time-code"
            value={backupCode}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="ABC12345"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-center text-xl font-mono tracking-wider"
            maxLength={8}
            disabled={isLoading}
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || backupCode.length !== 8}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
          <span>Verify Backup Code</span>
        </button>
      </form>

      {/* Alternative Options */}
      <div className="mt-8 space-y-4">
        <div className="text-center">
          <button
            onClick={onUseAuthenticator}
            className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isLoading}
          >
            <Shield className="w-4 h-4" />
            <span>Use authenticator app instead</span>
          </button>
        </div>

        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isLoading}
          >
            Cancel and return to login
          </button>
        </div>
      </div>

      {/* Warning */}
      <div className="mt-8 p-4 bg-amber-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-amber-800">
            <p className="font-medium">Important:</p>
            <p>Each backup code can only be used once. After using this code, it will be permanently disabled.</p>
          </div>
        </div>
      </div>
    </div>
  )
}