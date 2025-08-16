'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotification: (id: string) => void
  clearAllNotifications: () => void
  hasPermission: boolean
  requestPermission: () => Promise<boolean>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [hasPermission, setHasPermission] = useState(false)

  // Initialize notification permission status
  useEffect(() => {
    if ('Notification' in window) {
      setHasPermission(Notification.permission === 'granted')
    }
  }, [])

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('income-clarity-notifications')
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
        setNotifications(parsed)
      } catch (error) {
        // Error handled by emergency recovery script
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('income-clarity-notifications', JSON.stringify(notifications))
  }, [notifications])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }

    setNotifications(prev => [newNotification, ...prev])

    // Send browser notification if permission granted
    if (hasPermission && 'Notification' in window) {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/icons/icon-192x192.svg',
        tag: newNotification.id,
        badge: '/icons/icon-192x192.svg'
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        browserNotification.close()
      }, 5000)

      // Handle click to mark as read and navigate if actionUrl
      browserNotification.onclick = () => {
        markAsRead(newNotification.id)
        if (notification.actionUrl) {
          window.open(notification.actionUrl, '_blank')
        }
        browserNotification.close()
      }
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      // console.warn('This browser does not support notifications')
      // return false
    }

    if (Notification.permission === 'granted') {
      setHasPermission(true)
      return true
    }

    if (Notification.permission === 'denied') {
      return false
    }

    const permission = await Notification.requestPermission()
    const granted = permission === 'granted'
    setHasPermission(granted)

    if (granted) {
      // Send welcome notification
      addNotification({
        title: 'Notifications Enabled!',
        message: 'You\'ll now receive updates about your portfolio and important events.',
        type: 'success'
      })
    }

    return granted
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotification,
        clearAllNotifications,
        hasPermission,
        requestPermission
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}