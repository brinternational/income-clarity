'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface SimpleAuthState {
  isAuthenticated: boolean
  user: { email: string; name: string } | null
  loading: boolean
}

interface SimpleAuthContextType extends SimpleAuthState {
  login: () => void
  logout: () => void
}

const SimpleAuthContext = createContext<SimpleAuthContextType | null>(null)

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimpleAuthState>({
    isAuthenticated: false,
    user: null,
    loading: false
  })

  const login = () => {
    setState({
      isAuthenticated: true,
      user: { email: 'demo@incomeclarity.app', name: 'Demo User' },
      loading: false
    })
  }

  const logout = () => {
    setState({
      isAuthenticated: false,
      user: null,
      loading: false
    })
  }

  return (
    <SimpleAuthContext.Provider value={{
      ...state,
      login,
      logout
    }}>
      {children}
    </SimpleAuthContext.Provider>
  )
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext)
  if (!context) {
    throw new Error('useSimpleAuth must be used within SimpleAuthProvider')
  }
  return context
}

export function RequireSimpleAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useSimpleAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return null // Will be handled by the login page
  }

  return <>{children}</>
}