/**
 * Income Clarity Design System - Shadow Tokens
 * 
 * Consistent shadow system for elevation and depth.
 * Supports both light and dark themes with optimized shadow colors.
 */

export const shadows = {
  // Base shadows - Light theme optimized
  light: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.35)',
  },

  // Dark theme shadows
  dark: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
    '3xl': '0 35px 60px -12px rgba(0, 0, 0, 0.7)',
  },

  // Colored shadows for special states
  colored: {
    // Brand color shadows
    brand: {
      sm: '0 1px 3px 0 rgba(14, 165, 233, 0.3), 0 1px 2px -1px rgba(14, 165, 233, 0.3)',
      md: '0 4px 6px -1px rgba(14, 165, 233, 0.3), 0 2px 4px -2px rgba(14, 165, 233, 0.3)',
      lg: '0 10px 15px -3px rgba(14, 165, 233, 0.3), 0 4px 6px -4px rgba(14, 165, 233, 0.3)',
    },
    // Success shadows
    success: {
      sm: '0 1px 3px 0 rgba(34, 197, 94, 0.3), 0 1px 2px -1px rgba(34, 197, 94, 0.3)',
      md: '0 4px 6px -1px rgba(34, 197, 94, 0.3), 0 2px 4px -2px rgba(34, 197, 94, 0.3)',
      lg: '0 10px 15px -3px rgba(34, 197, 94, 0.3), 0 4px 6px -4px rgba(34, 197, 94, 0.3)',
    },
    // Error shadows
    error: {
      sm: '0 1px 3px 0 rgba(239, 68, 68, 0.3), 0 1px 2px -1px rgba(239, 68, 68, 0.3)',
      md: '0 4px 6px -1px rgba(239, 68, 68, 0.3), 0 2px 4px -2px rgba(239, 68, 68, 0.3)',
      lg: '0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -4px rgba(239, 68, 68, 0.3)',
    },
    // Warning shadows
    warning: {
      sm: '0 1px 3px 0 rgba(245, 158, 11, 0.3), 0 1px 2px -1px rgba(245, 158, 11, 0.3)',
      md: '0 4px 6px -1px rgba(245, 158, 11, 0.3), 0 2px 4px -2px rgba(245, 158, 11, 0.3)',
      lg: '0 10px 15px -3px rgba(245, 158, 11, 0.3), 0 4px 6px -4px rgba(245, 158, 11, 0.3)',
    },
  },

  // Glassmorphism shadows (for backdrop elements)
  glass: {
    light: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    medium: '0 8px 32px 0 rgba(31, 38, 135, 0.5)',
    heavy: '0 8px 32px 0 rgba(31, 38, 135, 0.7)',
  },

  // Inner shadows for inset effects
  inner: {
    sm: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    md: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)',
    lg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)',
  },

  // Semantic shadows for UI components
  semantic: {
    // Card shadows
    card: {
      resting: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
      hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      active: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
    },
    
    // Button shadows
    button: {
      resting: '0 1px 2px 0 rgba(0, 0, 0, 0.1)',
      hover: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      active: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
      focus: '0 0 0 3px rgba(14, 165, 233, 0.3)',
    },
    
    // Modal shadows
    modal: {
      backdrop: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      content: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    },
    
    // Dropdown shadows
    dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    
    // Tooltip shadows
    tooltip: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    
    // Navigation shadows
    nav: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    
    // Input shadows
    input: {
      resting: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      focus: '0 0 0 3px rgba(14, 165, 233, 0.3), inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      error: '0 0 0 3px rgba(239, 68, 68, 0.3), inset 0 1px 2px 0 rgba(239, 68, 68, 0.1)',
    },
  },

  // Elevation system (Google Material Design inspired)
  elevation: {
    0: 'none',
    1: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    2: '0 2px 4px -1px rgba(0, 0, 0, 0.1), 0 2px 2px -2px rgba(0, 0, 0, 0.1)',
    3: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    4: '0 6px 8px -2px rgba(0, 0, 0, 0.1), 0 4px 6px -3px rgba(0, 0, 0, 0.1)',
    5: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    6: '0 12px 16px -4px rgba(0, 0, 0, 0.1), 0 6px 8px -6px rgba(0, 0, 0, 0.1)',
    7: '0 16px 20px -6px rgba(0, 0, 0, 0.1), 0 8px 10px -8px rgba(0, 0, 0, 0.1)',
    8: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  },
} as const

// CSS Variables for shadows
export const shadowCSSVariables = {
  '--shadow-xs': shadows.light.xs,
  '--shadow-sm': shadows.light.sm,
  '--shadow-md': shadows.light.md,
  '--shadow-lg': shadows.light.lg,
  '--shadow-xl': shadows.light.xl,
  '--shadow-2xl': shadows.light['2xl'],
  '--shadow-3xl': shadows.light['3xl'],
  
  // Semantic shadows
  '--shadow-card': shadows.semantic.card.resting,
  '--shadow-card-hover': shadows.semantic.card.hover,
  '--shadow-button': shadows.semantic.button.resting,
  '--shadow-button-hover': shadows.semantic.button.hover,
  '--shadow-modal': shadows.semantic.modal.content,
  '--shadow-dropdown': shadows.semantic.dropdown,
  '--shadow-nav': shadows.semantic.nav,
  
  // Colored shadows
  '--shadow-brand': shadows.colored.brand.md,
  '--shadow-success': shadows.colored.success.md,
  '--shadow-error': shadows.colored.error.md,
  '--shadow-warning': shadows.colored.warning.md,
} as const

// Utility functions for shadows
export const shadowUtils = {
  // Get shadow based on theme
  getThemed: (size: keyof typeof shadows.light, isDark: boolean): string => {
    return isDark ? shadows.dark[size] : shadows.light[size]
  },
  
  // Get elevation shadow
  getElevation: (level: keyof typeof shadows.elevation): string => {
    return shadows.elevation[level]
  },
  
  // Get semantic shadow
  getSemantic: (component: string, state: string = 'resting'): string => {
    const semantic = shadows.semantic as any
    return semantic[component]?.[state] || semantic[component] || shadows.light.sm
  },
  
  // Get colored shadow
  getColored: (color: keyof typeof shadows.colored, size: 'sm' | 'md' | 'lg' = 'md'): string => {
    return shadows.colored[color][size]
  },
  
  // Combine multiple shadows
  combine: (...shadowValues: string[]): string => {
    return shadowValues.filter(shadow => shadow && shadow !== 'none').join(', ')
  },
} as const

export type ShadowSize = keyof typeof shadows.light
export type ElevationLevel = keyof typeof shadows.elevation
export type ColoredShadow = keyof typeof shadows.colored
export type SemanticShadow = keyof typeof shadows.semantic