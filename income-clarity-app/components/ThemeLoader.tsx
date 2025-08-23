'use client'

import { useEffect } from 'react'

export function ThemeLoader() {
  useEffect(() => {
    // Apply theme on app load - consistent with server rendering
    // Server defaults to dark mode, so we only need to handle light themes
    // Use the same localStorage key as ThemeContext to prevent conflicts
    const savedThemeId = localStorage.getItem('income-clarity-theme')
    if (savedThemeId) {
      const isLightTheme = !savedThemeId.includes('dark') && !savedThemeId.includes('cyberpunk') && !savedThemeId.includes('ocean') && !savedThemeId.includes('midnight')
      if (isLightTheme) {
        // Remove dark class for light themes (server defaults to dark)
        document.documentElement.classList.remove('dark')
      }
      // Dark themes do nothing since server already renders with dark class
    }
    // No localStorage means new user - server already defaults to dark mode
  }, [])

  // This component renders nothing but loads theme early
  return null
}