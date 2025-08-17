/**
 * Income Clarity Design System - Spacing Tokens
 * 
 * Consistent spacing scale for padding, margin, and gap properties.
 * Based on 4px base unit with exponential scaling.
 */

export const spacing = {
  // Base unit: 4px
  // Each step follows a mathematical progression for visual harmony
  
  // Micro spacing
  px: '1px',
  0: '0px',
  0.5: '2px',   // 0.125rem
  1: '4px',     // 0.25rem  - Base unit
  1.5: '6px',   // 0.375rem
  2: '8px',     // 0.5rem
  2.5: '10px',  // 0.625rem
  3: '12px',    // 0.75rem
  3.5: '14px',  // 0.875rem
  4: '16px',    // 1rem     - Common padding
  5: '20px',    // 1.25rem
  6: '24px',    // 1.5rem   - Common margin
  7: '28px',    // 1.75rem
  8: '32px',    // 2rem     - Section spacing
  9: '36px',    // 2.25rem
  10: '40px',   // 2.5rem
  11: '44px',   // 2.75rem
  12: '48px',   // 3rem     - Large spacing
  14: '56px',   // 3.5rem
  16: '64px',   // 4rem     - Component spacing
  20: '80px',   // 5rem
  24: '96px',   // 6rem     - Section dividers
  28: '112px',  // 7rem
  32: '128px',  // 8rem     - Page sections
  36: '144px',  // 9rem
  40: '160px',  // 10rem
  44: '176px',  // 11rem
  48: '192px',  // 12rem
  52: '208px',  // 13rem
  56: '224px',  // 14rem
  60: '240px',  // 15rem
  64: '256px',  // 16rem
  72: '288px',  // 18rem
  80: '320px',  // 20rem
  96: '384px',  // 24rem
  
  // Responsive spacing
  responsive: {
    xs: '8px',    // 0.5rem  - Mobile micro
    sm: '16px',   // 1rem    - Mobile base
    md: '24px',   // 1.5rem  - Mobile large
    lg: '32px',   // 2rem    - Desktop base
    xl: '48px',   // 3rem    - Desktop large
    '2xl': '64px', // 4rem    - Desktop extra large
    '3xl': '96px', // 6rem    - Section spacing
  },

  // Semantic spacing for specific use cases
  semantic: {
    // Form spacing
    'form-field-gap': '16px',        // Between form fields
    'form-label-gap': '8px',         // Between label and input
    'form-helper-gap': '4px',        // Between input and helper text
    'form-section-gap': '32px',      // Between form sections
    
    // Component spacing
    'component-padding-sm': '8px',   // Small components
    'component-padding-md': '16px',  // Medium components
    'component-padding-lg': '24px',  // Large components
    'component-gap-sm': '8px',       // Small component gaps
    'component-gap-md': '16px',      // Medium component gaps
    'component-gap-lg': '24px',      // Large component gaps
    
    // Layout spacing
    'layout-margin-sm': '16px',      // Small layout margins
    'layout-margin-md': '24px',      // Medium layout margins
    'layout-margin-lg': '48px',      // Large layout margins
    'layout-padding-sm': '16px',     // Small layout padding
    'layout-padding-md': '24px',     // Medium layout padding
    'layout-padding-lg': '48px',     // Large layout padding
    
    // Container spacing
    'container-padding-mobile': '16px',   // Mobile container padding
    'container-padding-desktop': '24px',  // Desktop container padding
    'container-max-width': '1200px',     // Max container width
    
    // Card spacing
    'card-padding-sm': '16px',       // Small card padding
    'card-padding-md': '24px',       // Medium card padding
    'card-padding-lg': '32px',       // Large card padding
    'card-gap': '16px',              // Gap between cards
    
    // Button spacing
    'button-padding-sm': '8px 16px',     // Small button
    'button-padding-md': '12px 24px',    // Medium button
    'button-padding-lg': '16px 32px',    // Large button
    'button-gap': '8px',                 // Gap between buttons
    
    // Navigation spacing
    'nav-padding': '16px',               // Navigation padding
    'nav-item-gap': '8px',              // Gap between nav items
    'nav-section-gap': '32px',          // Gap between nav sections
    
    // Dashboard spacing
    'dashboard-section-gap': '48px',     // Between dashboard sections
    'dashboard-card-gap': '24px',        // Between dashboard cards
    'dashboard-metric-gap': '16px',      // Between dashboard metrics
  },

  // Touch targets (minimum 44px for accessibility)
  touch: {
    minimum: '44px',      // Minimum touch target size
    comfortable: '48px',  // Comfortable touch target size
    spacious: '56px',     // Spacious touch target size
  },

  // Content spacing
  content: {
    'paragraph-gap': '16px',      // Between paragraphs
    'heading-gap-sm': '8px',      // Small heading margins
    'heading-gap-md': '16px',     // Medium heading margins
    'heading-gap-lg': '24px',     // Large heading margins
    'list-item-gap': '8px',       // Between list items
    'section-gap': '48px',        // Between content sections
  },
} as const

// CSS Variables for spacing
export const spacingCSSVariables = {
  '--spacing-px': spacing.px,
  '--spacing-0': spacing[0],
  '--spacing-1': spacing[1],
  '--spacing-2': spacing[2],
  '--spacing-3': spacing[3],
  '--spacing-4': spacing[4],
  '--spacing-6': spacing[6],
  '--spacing-8': spacing[8],
  '--spacing-12': spacing[12],
  '--spacing-16': spacing[16],
  '--spacing-24': spacing[24],
  '--spacing-32': spacing[32],
  '--spacing-48': spacing[48],
  '--spacing-64': spacing[64],
  '--spacing-96': spacing[96],
  
  // Semantic variables
  '--form-field-gap': spacing.semantic['form-field-gap'],
  '--component-padding-md': spacing.semantic['component-padding-md'],
  '--layout-margin-md': spacing.semantic['layout-margin-md'],
  '--card-padding-md': spacing.semantic['card-padding-md'],
  '--touch-minimum': spacing.touch.minimum,
} as const

// Utility functions for spacing calculations
export const spacingUtils = {
  // Convert spacing token to CSS value
  getValue: (token: keyof typeof spacing): string => {
    return spacing[token as keyof typeof spacing] as string
  },
  
  // Get responsive spacing based on screen size
  getResponsive: (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'): string => {
    return spacing.responsive[size]
  },
  
  // Get semantic spacing
  getSemantic: (token: keyof typeof spacing.semantic): string => {
    return spacing.semantic[token]
  },
  
  // Calculate spacing between elements
  gap: (multiplier: number = 1): string => {
    const baseGap = 16 // 1rem
    return `${baseGap * multiplier}px`
  },
  
  // Get container padding based on screen size
  getContainerPadding: (isMobile: boolean): string => {
    return isMobile 
      ? spacing.semantic['container-padding-mobile']
      : spacing.semantic['container-padding-desktop']
  },
} as const

export type SpacingToken = keyof typeof spacing
export type SemanticSpacing = keyof typeof spacing.semantic
export type ResponsiveSpacing = keyof typeof spacing.responsive