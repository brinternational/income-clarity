/**
 * Income Clarity Design System - Theme Index
 * 
 * Central export for all design tokens and theme utilities.
 * This creates a unified theme system for consistent UI across the application.
 */

import { colors, cssVariables as colorCSSVariables } from './colors'
import { typography, typographyCSSVariables } from './typography'
import { spacing, spacingCSSVariables } from './spacing'
import { shadows, shadowCSSVariables } from './shadows'

// Breakpoints for responsive design
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const

// Border radius scale
export const borderRadius = {
  none: '0px',
  xs: '2px',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  '3xl': '24px',
  full: '9999px',
} as const

// Z-index scale
export const zIndex = {
  auto: 'auto',
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modal: '1040',
  popover: '1050',
  tooltip: '1060',
  toast: '1070',
  max: '2147483647',
} as const

// Transition and animation tokens
export const transitions = {
  duration: {
    fastest: '100ms',
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
    slowest: '500ms',
  },
  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
  property: {
    all: 'all',
    colors: 'color, background-color, border-color',
    opacity: 'opacity',
    shadow: 'box-shadow',
    transform: 'transform',
  },
} as const

// Unified theme object
export const theme = {
  colors,
  typography,
  spacing,
  shadows,
  breakpoints,
  borderRadius,
  zIndex,
  transitions,
} as const

// Complete CSS variables object
export const cssVariables = {
  ...colorCSSVariables,
  ...typographyCSSVariables,
  ...spacingCSSVariables,
  ...shadowCSSVariables,
  
  // Breakpoints
  '--breakpoint-xs': breakpoints.xs,
  '--breakpoint-sm': breakpoints.sm,
  '--breakpoint-md': breakpoints.md,
  '--breakpoint-lg': breakpoints.lg,
  '--breakpoint-xl': breakpoints.xl,
  '--breakpoint-2xl': breakpoints['2xl'],
  
  // Border radius
  '--radius-none': borderRadius.none,
  '--radius-xs': borderRadius.xs,
  '--radius-sm': borderRadius.sm,
  '--radius-md': borderRadius.md,
  '--radius-lg': borderRadius.lg,
  '--radius-xl': borderRadius.xl,
  '--radius-2xl': borderRadius['2xl'],
  '--radius-3xl': borderRadius['3xl'],
  '--radius-full': borderRadius.full,
  
  // Z-index
  '--z-dropdown': zIndex.dropdown,
  '--z-modal': zIndex.modal,
  '--z-tooltip': zIndex.tooltip,
  '--z-toast': zIndex.toast,
  
  // Transitions
  '--transition-fast': `${transitions.duration.fast} ${transitions.easing.easeOut}`,
  '--transition-normal': `${transitions.duration.normal} ${transitions.easing.easeOut}`,
  '--transition-slow': `${transitions.duration.slow} ${transitions.easing.easeOut}`,
  '--transition-spring': `${transitions.duration.normal} ${transitions.easing.spring}`,
} as const

// Theme mode utilities
export const themeModes = {
  light: 'light',
  dark: 'dark',
  system: 'system',
} as const

// Component variants
export const componentVariants = {
  size: ['xs', 'sm', 'md', 'lg', 'xl'] as const,
  variant: ['primary', 'secondary', 'outline', 'ghost', 'danger', 'success'] as const,
  state: ['default', 'hover', 'active', 'disabled', 'loading'] as const,
} as const

// Utility function to apply CSS variables
export const applyCSSVariables = (element: HTMLElement): void => {
  Object.entries(cssVariables).forEach(([property, value]) => {
    element.style.setProperty(property, value)
  })
}

// Utility function to get theme value
export const getThemeValue = (path: string): any => {
  return path.split('.').reduce((obj, key) => obj?.[key], theme)
}

// Utility function for responsive values
export const responsive = <T>(values: Partial<Record<keyof typeof breakpoints, T>>): string => {
  return Object.entries(values)
    .map(([breakpoint, value]) => {
      const bp = breakpoints[breakpoint as keyof typeof breakpoints]
      return bp === breakpoints.xs 
        ? String(value)
        : `@media (min-width: ${bp}) { ${value} }`
    })
    .join(' ')
}

// Type definitions
export type ThemeColor = keyof typeof colors
export type ThemeSpacing = keyof typeof spacing  
export type ThemeShadow = keyof typeof shadows.light
export type ThemeBreakpoint = keyof typeof breakpoints
export type ThemeBorderRadius = keyof typeof borderRadius
export type ThemeZIndex = keyof typeof zIndex
export type ThemeMode = keyof typeof themeModes
export type ComponentSize = typeof componentVariants.size[number]
export type ComponentVariant = typeof componentVariants.variant[number]
export type ComponentState = typeof componentVariants.state[number]

// Export individual theme parts for specific imports
export { 
  colors, 
  typography, 
  spacing, 
  shadows,
  breakpoints,
  borderRadius,
  zIndex,
  transitions
}

// Default export
export default theme