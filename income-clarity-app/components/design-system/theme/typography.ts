/**
 * Income Clarity Design System - Typography Tokens
 * 
 * Consistent typography scale for all text elements.
 * Based on fluid typography with responsive scaling.
 */

export const typography = {
  // Font Families
  fontFamily: {
    sans: [
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ],
    mono: [
      'JetBrains Mono',
      'Fira Code',
      'SF Mono',
      'Monaco',
      'Inconsolata',
      'Roboto Mono',
      'source-code-pro',
      'Menlo',
      'monospace',
    ],
    display: [
      'Cal Sans',
      'Inter',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'sans-serif',
    ],
  },

  // Font Weights
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  // Font Sizes - Mobile First with Desktop Scaling
  fontSize: {
    xs: {
      mobile: '0.75rem',    // 12px
      desktop: '0.75rem',   // 12px
      lineHeight: '1rem',   // 16px
    },
    sm: {
      mobile: '0.875rem',   // 14px
      desktop: '0.875rem',  // 14px
      lineHeight: '1.25rem', // 20px
    },
    base: {
      mobile: '1rem',       // 16px
      desktop: '1rem',      // 16px
      lineHeight: '1.5rem', // 24px
    },
    lg: {
      mobile: '1.125rem',   // 18px
      desktop: '1.125rem',  // 18px
      lineHeight: '1.75rem', // 28px
    },
    xl: {
      mobile: '1.25rem',    // 20px
      desktop: '1.25rem',   // 20px
      lineHeight: '1.75rem', // 28px
    },
    '2xl': {
      mobile: '1.5rem',     // 24px
      desktop: '1.5rem',    // 24px
      lineHeight: '2rem',   // 32px
    },
    '3xl': {
      mobile: '1.875rem',   // 30px
      desktop: '1.875rem',  // 30px
      lineHeight: '2.25rem', // 36px
    },
    '4xl': {
      mobile: '2.25rem',    // 36px
      desktop: '2.25rem',   // 36px
      lineHeight: '2.5rem', // 40px
    },
    '5xl': {
      mobile: '3rem',       // 48px
      desktop: '3rem',      // 48px
      lineHeight: '1',      // 48px
    },
    '6xl': {
      mobile: '3.75rem',    // 60px
      desktop: '3.75rem',   // 60px
      lineHeight: '1',      // 60px
    },
    '7xl': {
      mobile: '4.5rem',     // 72px
      desktop: '4.5rem',    // 72px
      lineHeight: '1',      // 72px
    },
    '8xl': {
      mobile: '6rem',       // 96px
      desktop: '6rem',      // 96px
      lineHeight: '1',      // 96px
    },
    '9xl': {
      mobile: '8rem',       // 128px
      desktop: '8rem',      // 128px
      lineHeight: '1',      // 128px
    },
  },

  // Line Heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  // Letter Spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text Styles - Predefined combinations
  textStyles: {
    // Headings
    'heading-1': {
      fontSize: 'clamp(2.25rem, 4vw, 4.5rem)', // Responsive 36-72px
      fontWeight: '700',
      lineHeight: '1.1',
      letterSpacing: '-0.025em',
    },
    'heading-2': {
      fontSize: 'clamp(1.875rem, 3vw, 3.75rem)', // Responsive 30-60px
      fontWeight: '600',
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
    },
    'heading-3': {
      fontSize: 'clamp(1.5rem, 2.5vw, 3rem)', // Responsive 24-48px
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: '0em',
    },
    'heading-4': {
      fontSize: 'clamp(1.25rem, 2vw, 2.25rem)', // Responsive 20-36px
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0em',
    },
    'heading-5': {
      fontSize: 'clamp(1.125rem, 1.5vw, 1.5rem)', // Responsive 18-24px
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0em',
    },
    'heading-6': {
      fontSize: '1.125rem', // 18px
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0em',
    },

    // Body Text
    'body-lg': {
      fontSize: '1.125rem', // 18px
      fontWeight: '400',
      lineHeight: '1.6',
      letterSpacing: '0em',
    },
    'body-base': {
      fontSize: '1rem', // 16px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em',
    },
    'body-sm': {
      fontSize: '0.875rem', // 14px
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0em',
    },
    'body-xs': {
      fontSize: '0.75rem', // 12px
      fontWeight: '400',
      lineHeight: '1.4',
      letterSpacing: '0.025em',
    },

    // Special Styles
    'display': {
      fontSize: 'clamp(3rem, 5vw, 8rem)', // Responsive 48-128px
      fontWeight: '900',
      lineHeight: '1',
      letterSpacing: '-0.05em',
    },
    'subtitle': {
      fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', // Responsive 18-24px
      fontWeight: '500',
      lineHeight: '1.4',
      letterSpacing: '0em',
    },
    'caption': {
      fontSize: '0.75rem', // 12px
      fontWeight: '500',
      lineHeight: '1.4',
      letterSpacing: '0.05em',
      textTransform: 'uppercase' as const,
    },
    'overline': {
      fontSize: '0.625rem', // 10px
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },

    // Financial/Numeric
    'currency-lg': {
      fontSize: '2.25rem', // 36px
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.025em',
      fontFamily: 'JetBrains Mono, monospace',
    },
    'currency-base': {
      fontSize: '1.5rem', // 24px
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: '0em',
      fontFamily: 'JetBrains Mono, monospace',
    },
    'currency-sm': {
      fontSize: '1rem', // 16px
      fontWeight: '500',
      lineHeight: '1.4',
      letterSpacing: '0em',
      fontFamily: 'JetBrains Mono, monospace',
    },
    'percentage': {
      fontSize: '0.875rem', // 14px
      fontWeight: '600',
      lineHeight: '1.4',
      letterSpacing: '0.025em',
      fontFamily: 'JetBrains Mono, monospace',
    },
  },
} as const

// CSS Variables for typography
export const typographyCSSVariables = {
  '--font-sans': typography.fontFamily.sans.join(', '),
  '--font-mono': typography.fontFamily.mono.join(', '),
  '--font-display': typography.fontFamily.display.join(', '),
} as const

export type FontWeight = keyof typeof typography.fontWeight
export type FontSize = keyof typeof typography.fontSize
export type TextStyle = keyof typeof typography.textStyles
export type LineHeight = keyof typeof typography.lineHeight