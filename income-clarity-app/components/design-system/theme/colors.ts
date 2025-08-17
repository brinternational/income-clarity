/**
 * Income Clarity Design System - Color Tokens
 * 
 * Unified color palette for consistent theming across the application.
 * Based on Tailwind CSS color system with custom brand colors.
 */

export const colors = {
  // Brand Colors - Primary income clarity identity
  brand: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Primary brand color
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Secondary Colors - Emerald for success/income
  secondary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981', // Secondary brand color
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
    950: '#022c22',
  },

  // Neutral Colors - For backgrounds and text
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Semantic Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16',
  },

  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03',
  },

  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554',
  },

  // Financial Colors - Specific to income tracking
  financial: {
    profit: '#22c55e',     // Green for gains
    loss: '#ef4444',       // Red for losses
    dividend: '#8b5cf6',   // Purple for dividends
    interest: '#06b6d4',   // Cyan for interest
    tax: '#f59e0b',        // Amber for taxes
    expense: '#ef4444',    // Red for expenses
  },

  // Glass/Backdrop Colors
  glass: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.15)',
    heavy: 'rgba(255, 255, 255, 0.25)',
    dark: 'rgba(0, 0, 0, 0.1)',
    darkMedium: 'rgba(0, 0, 0, 0.15)',
    darkHeavy: 'rgba(0, 0, 0, 0.25)',
  },

  // Border Colors
  border: {
    light: 'rgba(255, 255, 255, 0.1)',
    medium: 'rgba(255, 255, 255, 0.2)',
    heavy: 'rgba(255, 255, 255, 0.3)',
  },
} as const

// CSS Variable mappings for runtime color switching
export const cssVariables = {
  '--color-brand-50': colors.brand[50],
  '--color-brand-100': colors.brand[100],
  '--color-brand-200': colors.brand[200],
  '--color-brand-300': colors.brand[300],
  '--color-brand-400': colors.brand[400],
  '--color-brand-500': colors.brand[500],
  '--color-brand-600': colors.brand[600],
  '--color-brand-700': colors.brand[700],
  '--color-brand-800': colors.brand[800],
  '--color-brand-900': colors.brand[900],
  '--color-brand-950': colors.brand[950],
  
  '--color-secondary-50': colors.secondary[50],
  '--color-secondary-100': colors.secondary[100],
  '--color-secondary-200': colors.secondary[200],
  '--color-secondary-300': colors.secondary[300],
  '--color-secondary-400': colors.secondary[400],
  '--color-secondary-500': colors.secondary[500],
  '--color-secondary-600': colors.secondary[600],
  '--color-secondary-700': colors.secondary[700],
  '--color-secondary-800': colors.secondary[800],
  '--color-secondary-900': colors.secondary[900],
  '--color-secondary-950': colors.secondary[950],
  
  // Add other color mappings as needed
} as const

export type ColorToken = keyof typeof colors
export type BrandColorStep = keyof typeof colors.brand
export type SemanticColor = 'success' | 'warning' | 'error' | 'info'