'use client'

import { ReactNode } from 'react'
import { useTheme } from '@/contexts/ThemeContext'

interface ThemeAwareWrapperProps {
  children: ReactNode
  className?: string
  applyGlassEffect?: boolean
}

export function ThemeAwareWrapper({ children, className = '', applyGlassEffect = false }: ThemeAwareWrapperProps) {
  const { currentTheme } = useTheme()
  
  const glassMorphThemes = ['apple-glass-dark', 'apple-glass-light']
  const isGlassTheme = glassMorphThemes.includes(currentTheme.id)
  
  const wrapperClasses = [
    className,
    'transition-all duration-300',
    applyGlassEffect && isGlassTheme ? 'glass-card' : '',
    currentTheme.id === 'cyberpunk-neon' ? 'cyberpunk-glow' : '',
    currentTheme.id === 'nature-fresh' ? 'nature-shadow' : '',
    currentTheme.id === 'material-design' ? 'material-shadow-2' : '',
  ].filter(Boolean).join(' ')

  return (
    <div 
      className={wrapperClasses}
      style={{
        backgroundColor: applyGlassEffect && isGlassTheme ? 'var(--glass-bg)' : 'var(--color-primary)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-text-primary)',
      }}
    >
      {children}
    </div>
  )
}