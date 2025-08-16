'use client'

import { useEffect } from 'react'

export function ThemeLoader() {
  useEffect(() => {
    // Apply theme on app load before React hydration
    // Use the same localStorage key as ThemeContext to prevent conflicts
    const savedThemeId = localStorage.getItem('income-clarity-theme')
    if (savedThemeId) {
      // For now, just apply dark mode for dark themes
      const isDarkTheme = savedThemeId.includes('dark') || savedThemeId.includes('cyberpunk') || savedThemeId.includes('ocean') || savedThemeId.includes('midnight')
      if (isDarkTheme) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [])

  // This component renders nothing but loads theme early
  return null
}