'use client'

import React, { useState, useEffect } from 'react'
import { RefreshCw, Download, X, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface UpdateNotificationProps {
  onUpdate?: () => void
  onDismiss?: () => void
}

export function UpdateNotification({ onUpdate, onDismiss }: UpdateNotificationProps) {
  const [showNotification, setShowNotification] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateComplete, setUpdateComplete] = useState(false)
  const [serviceWorkerRegistration, setServiceWorkerRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return

    // Register service worker and listen for updates
    registerServiceWorkerAndListen()
  }, [])

  const registerServiceWorkerAndListen = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        setServiceWorkerRegistration(registration)

        // Listen for updates
        registration.addEventListener('updatefound', handleUpdateFound)

        // Check for waiting service worker (update ready)
        if (registration.waiting) {
          setShowNotification(true)
        }

        // Listen for controlling service worker change
        navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

      } catch (error) {
        // Error handled by emergency recovery script
      }
    }
  }

  const handleUpdateFound = () => {
    if (!serviceWorkerRegistration) return

    const newWorker = serviceWorkerRegistration.installing
    if (!newWorker) return

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        // New content available
        setShowNotification(true)
        
        // Show toast notification as well
        toast('New update available!', {
          icon: '🔄',
          duration: 6000,
        })
      }
    })
  }

  const handleControllerChange = () => {
    // Service worker has been updated and is now controlling the page
    setIsUpdating(false)
    setUpdateComplete(true)
    
    setTimeout(() => {
      setShowNotification(false)
      setUpdateComplete(false)
      
      // Show success message
      toast.success('App updated successfully!', {
        icon: '✅',
        duration: 4000,
      })
    }, 2000)
  }

  const handleUpdate = async () => {
    if (!serviceWorkerRegistration?.waiting) return

    setIsUpdating(true)
    onUpdate?.()

    // Tell the waiting service worker to skip waiting and become active
    serviceWorkerRegistration.waiting.postMessage({ type: 'SKIP_WAITING' })

    // Reload the page after a short delay to allow service worker to activate
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  const handleDismiss = () => {
    setShowNotification(false)
    onDismiss?.()
    
    // Show notification again after 5 minutes
    setTimeout(() => {
      if (serviceWorkerRegistration?.waiting) {
        setShowNotification(true)
      }
    }, 5 * 60 * 1000) // 5 minutes
  }

  if (!showNotification) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:bottom-6 md:right-6 md:w-96 z-50">
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 transform transition-all duration-300 animate-slide-up"
        style={{
          backgroundColor: 'var(--color-primary)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-primary)'
        }}
      >
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              {updateComplete ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <Download className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 
              className="text-sm font-semibold mb-1"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {updateComplete ? 'Update Complete!' : 'New Update Available'}
            </h3>
            
            <p 
              className="text-xs mb-3"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {updateComplete 
                ? 'Income Clarity has been updated with the latest features and improvements.'
                : 'A new version of Income Clarity is ready. Update now to get the latest features and improvements.'
              }
            </p>
            
            {!updateComplete && (
              <div className="flex space-x-2">
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="flex items-center space-x-1 bg-green-600 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3" />
                      <span>Update Now</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDismiss}
                  className="text-xs font-medium px-3 py-2 rounded-lg transition-colors hover:opacity-80"
                  style={{ 
                    color: 'var(--color-text-secondary)'
                  }}
                >
                  Later
                </button>
              </div>
            )}
          </div>
          
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 transition-colors"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {!updateComplete && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center space-x-4 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>Performance improvements</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Bug fixes</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>New features</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UpdateNotification