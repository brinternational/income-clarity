'use client'

import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Globe, Zap, AlertTriangle } from 'lucide-react'

export type ConnectionType = 'ethernet' | 'wifi' | '4g' | '3g' | '2g' | 'slow-2g' | 'unknown'
export type ConnectionStatus = 'online' | 'offline' | 'slow'

interface ConnectionStatusProps {
  className?: string
  showText?: boolean
  compact?: boolean
}

interface NetworkInformation extends EventTarget {
  downlink?: number
  effectiveType?: '4g' | '3g' | '2g' | 'slow-2g'
  rtt?: number
  saveData?: boolean
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'
}

export function ConnectionStatus({ className = '', showText = true, compact = false }: ConnectionStatusProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState<ConnectionType>('unknown')
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null)

  useEffect(() => {
    // Initial status
    updateConnectionStatus()

    // Listen for online/offline events
    window.addEventListener('online', updateConnectionStatus)
    window.addEventListener('offline', updateConnectionStatus)

    // Listen for connection changes
    const connection = (navigator as any).connection as NetworkInformation
    if (connection) {
      connection.addEventListener('change', updateConnectionStatus)
    }

    return () => {
      window.removeEventListener('online', updateConnectionStatus)
      window.removeEventListener('offline', updateConnectionStatus)
      if (connection) {
        connection.removeEventListener('change', updateConnectionStatus)
      }
    }
  }, [])

  const updateConnectionStatus = () => {
    const online = navigator.onLine
    setIsOnline(online)

    if (!online) {
      setConnectionType('unknown')
      setIsSlowConnection(false)
      setDownloadSpeed(null)
      return
    }

    // Get connection information if available
    const connection = (navigator as any).connection as NetworkInformation
    if (connection) {
      // Connection type
      if (connection.type) {
        setConnectionType(connection.type as ConnectionType)
      }

      // Speed information
      if (connection.downlink) {
        setDownloadSpeed(connection.downlink)
      }

      // Slow connection detection
      const effectiveType = connection.effectiveType
      const isSlowType = effectiveType === 'slow-2g' || effectiveType === '2g'
      const isSlowDownlink = connection.downlink && connection.downlink < 1 // Less than 1 Mbps
      
      setIsSlowConnection(isSlowType || Boolean(isSlowDownlink))
    }
  }

  const getConnectionDisplay = () => {
    if (!isOnline) {
      return {
        icon: WifiOff,
        text: 'Offline',
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950',
        description: 'No internet connection'
      }
    }

    if (isSlowConnection) {
      return {
        icon: AlertTriangle,
        text: 'Slow',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50 dark:bg-yellow-950',
        description: `Slow connection${downloadSpeed ? ` (${downloadSpeed} Mbps)` : ''}`
      }
    }

    // Fast connection
    const iconMap: Record<ConnectionType, any> = {
      wifi: Wifi,
      ethernet: Zap,
      '4g': Globe,
      '3g': Globe,
      '2g': Globe,
      'slow-2g': AlertTriangle,
      unknown: Wifi
    }

    return {
      icon: iconMap[connectionType] || Wifi,
      text: 'Online',
      color: 'text-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950',
      description: `Connected${downloadSpeed ? ` (${downloadSpeed} Mbps)` : ''}`
    }
  }

  const status = getConnectionDisplay()
  const Icon = status.icon

  if (compact) {
    return (
      <div 
        className={`inline-flex items-center ${className}`}
        title={status.description}
      >
        <Icon className={`w-4 h-4 ${status.color}`} />
      </div>
    )
  }

  return (
    <div 
      className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${status.bgColor} ${status.color} ${className}`}
      title={status.description}
    >
      <Icon className="w-4 h-4" />
      {showText && (
        <span className="hidden sm:inline">{status.text}</span>
      )}
      
      {/* Connection type indicator */}
      {isOnline && connectionType !== 'unknown' && (
        <span className="hidden md:inline text-xs opacity-75">
          {connectionType.toUpperCase()}
        </span>
      )}
    </div>
  )
}

// Hook for using connection status in other components
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [connectionType, setConnectionType] = useState<ConnectionType>('unknown')
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [downloadSpeed, setDownloadSpeed] = useState<number | null>(null)

  useEffect(() => {
    const updateStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setConnectionType('unknown')
        setIsSlowConnection(false)
        setDownloadSpeed(null)
        return
      }

      const connection = (navigator as any).connection as NetworkInformation
      if (connection) {
        if (connection.type) {
          setConnectionType(connection.type as ConnectionType)
        }

        if (connection.downlink) {
          setDownloadSpeed(connection.downlink)
        }

        const effectiveType = connection.effectiveType
        const isSlowType = effectiveType === 'slow-2g' || effectiveType === '2g'
        const isSlowDownlink = connection.downlink && connection.downlink < 1
        
        setIsSlowConnection(isSlowType || Boolean(isSlowDownlink))
      }
    }

    updateStatus()
    
    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    
    const connection = (navigator as any).connection as NetworkInformation
    if (connection) {
      connection.addEventListener('change', updateStatus)
    }

    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
      if (connection) {
        connection.removeEventListener('change', updateStatus)
      }
    }
  }, [])

  return {
    isOnline,
    connectionType,
    isSlowConnection,
    downloadSpeed
  }
}

export default ConnectionStatus