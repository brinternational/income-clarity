/**
 * Income Clarity Design System - Section Component
 * 
 * Semantic section component for organizing page content
 * with consistent spacing and visual hierarchy.
 */

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'
import { Container } from './Container'

// Section variants for different visual styles
const sectionVariants = {
  // Default - transparent background
  default: [
    'bg-transparent'
  ].join(' '),

  // Subtle background
  subtle: [
    'bg-neutral-50 dark:bg-neutral-900'
  ].join(' '),

  // Card-like appearance
  card: [
    'bg-white dark:bg-neutral-800',
    'border border-neutral-200 dark:border-neutral-700',
    'rounded-lg shadow-sm'
  ].join(' '),

  // Elevated card
  elevated: [
    'bg-white dark:bg-neutral-800',
    'border border-neutral-200 dark:border-neutral-700',
    'rounded-lg shadow-md'
  ].join(' '),

  // Filled background
  filled: [
    'bg-neutral-100 dark:bg-neutral-800'
  ].join(' '),

  // Primary branded section
  primary: [
    'bg-gradient-to-br from-brand-500 to-secondary-500',
    'text-white'
  ].join(' '),

  // Secondary branded section
  secondary: [
    'bg-secondary-50 dark:bg-secondary-900/20',
    'border-l-4 border-secondary-500'
  ].join(' '),

  // Success section
  success: [
    'bg-success-50 dark:bg-success-900/20',
    'border-l-4 border-success-500'
  ].join(' '),

  // Warning section
  warning: [
    'bg-warning-50 dark:bg-warning-900/20',
    'border-l-4 border-warning-500'
  ].join(' '),

  // Error section
  error: [
    'bg-error-50 dark:bg-error-900/20',
    'border-l-4 border-error-500'
  ].join(' ')
}

// Section padding sizes
const sectionPadding = {
  none: 'py-0',
  xs: 'py-2',
  sm: 'py-4',
  md: 'py-8',
  lg: 'py-12',
  xl: 'py-16',
  '2xl': 'py-20',
  '3xl': 'py-24'
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  variant?: keyof typeof sectionVariants
  // Padding options
  padding?: keyof typeof sectionPadding
  paddingX?: keyof typeof sectionPadding
  paddingY?: keyof typeof sectionPadding
  // Container options
  contained?: boolean
  containerVariant?: 'responsive' | 'fluid' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  // Header content
  title?: string
  subtitle?: string
  description?: string
  // Header styling
  titleLevel?: 1 | 2 | 3 | 4 | 5 | 6
  centerHeader?: boolean
  // Actions
  action?: React.ReactNode
  // Layout
  fullWidth?: boolean
  fullHeight?: boolean
  // Semantic
  as?: 'section' | 'article' | 'aside' | 'main' | 'div'
}

export const Section = forwardRef<HTMLElement, SectionProps>(
  ({
    className,
    variant = 'default',
    padding = 'lg',
    paddingX,
    paddingY,
    contained = true,
    containerVariant = 'responsive',
    title,
    subtitle,
    description,
    titleLevel = 2,
    centerHeader = false,
    action,
    fullWidth = false,
    fullHeight = false,
    as: Component = 'section',
    children,
    ...props
  }, ref) => {
    // Base classes
    const baseClasses = cn(
      'w-full',
      fullHeight && 'min-h-screen',
      fullWidth && 'w-screen',
      // Padding
      paddingY || sectionPadding[padding],
      paddingX && sectionPadding[paddingX],
      // Variant styling
      sectionVariants[variant],
      className
    )

    // Title component based on level
    const TitleComponent = `h${titleLevel}` as keyof JSX.IntrinsicElements
    
    // Title classes based on level
    const titleClasses = {
      1: 'text-4xl font-bold tracking-tight',
      2: 'text-3xl font-bold tracking-tight',
      3: 'text-2xl font-semibold',
      4: 'text-xl font-semibold',
      5: 'text-lg font-medium',
      6: 'text-base font-medium'
    }

    // Header content
    const headerContent = (title || subtitle || description || action) && (
      <div className={cn(
        'mb-8',
        centerHeader && 'text-center',
        !centerHeader && action && 'flex items-start justify-between gap-4'
      )}>
        <div className={cn(centerHeader && 'mx-auto max-w-3xl')}>
          {title && (
            <TitleComponent className={cn(
              titleClasses[titleLevel],
              variant === 'primary' ? 'text-white' :
              variant === 'error' ? 'text-error-900 dark:text-error-100' :
              variant === 'warning' ? 'text-warning-900 dark:text-warning-100' :
              variant === 'success' ? 'text-success-900 dark:text-success-100' :
              variant === 'secondary' ? 'text-secondary-900 dark:text-secondary-100' :
              'text-neutral-900 dark:text-neutral-100'
            )}>
              {title}
            </TitleComponent>
          )}
          
          {subtitle && (
            <p className={cn(
              'text-lg font-medium',
              title && 'mt-2',
              variant === 'primary' ? 'text-white/90' :
              variant === 'error' ? 'text-error-700 dark:text-error-200' :
              variant === 'warning' ? 'text-warning-700 dark:text-warning-200' :
              variant === 'success' ? 'text-success-700 dark:text-success-200' :
              variant === 'secondary' ? 'text-secondary-700 dark:text-secondary-200' :
              'text-neutral-700 dark:text-neutral-300'
            )}>
              {subtitle}
            </p>
          )}
          
          {description && (
            <p className={cn(
              'text-base',
              (title || subtitle) && 'mt-4',
              variant === 'primary' ? 'text-white/80' :
              variant === 'error' ? 'text-error-600 dark:text-error-300' :
              variant === 'warning' ? 'text-warning-600 dark:text-warning-300' :
              variant === 'success' ? 'text-success-600 dark:text-success-300' :
              variant === 'secondary' ? 'text-secondary-600 dark:text-secondary-300' :
              'text-neutral-600 dark:text-neutral-400'
            )}>
              {description}
            </p>
          )}
        </div>
        
        {action && !centerHeader && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
        
        {action && centerHeader && (
          <div className="mt-6">
            {action}
          </div>
        )}
      </div>
    )

    // Content
    const content = (
      <>
        {headerContent}
        {children}
      </>
    )

    return (
      <Component
        ref={ref}
        className={baseClasses}
        {...props}
      >
        {contained ? (
          <Container variant={containerVariant}>
            {content}
          </Container>
        ) : (
          content
        )}
      </Component>
    )
  }
)

Section.displayName = 'Section'

// Specialized section components

// Hero Section - For landing page heroes
export const HeroSection = forwardRef<HTMLElement, Omit<SectionProps, 'variant' | 'padding' | 'titleLevel' | 'centerHeader'>>(
  ({ ...props }, ref) => (
    <Section
      ref={ref}
      variant="primary"
      padding="3xl"
      titleLevel={1}
      centerHeader
      fullWidth
      {...props}
    />
  )
)

HeroSection.displayName = 'HeroSection'

// Feature Section - For feature highlights
export const FeatureSection = forwardRef<HTMLElement, Omit<SectionProps, 'variant' | 'centerHeader'>>(
  ({ ...props }, ref) => (
    <Section
      ref={ref}
      variant="subtle"
      centerHeader
      {...props}
    />
  )
)

FeatureSection.displayName = 'FeatureSection'

// Content Section - For main content areas
export const ContentSection = forwardRef<HTMLElement, Omit<SectionProps, 'variant'>>(
  ({ ...props }, ref) => (
    <Section
      ref={ref}
      variant="default"
      {...props}
    />
  )
)

ContentSection.displayName = 'ContentSection'

// Card Section - For card-like content
export const CardSection = forwardRef<HTMLElement, Omit<SectionProps, 'variant'>>(
  ({ ...props }, ref) => (
    <Section
      ref={ref}
      variant="card"
      {...props}
    />
  )
)

CardSection.displayName = 'CardSection'

// Stats Section - For displaying statistics
export const StatsSection = forwardRef<HTMLElement, Omit<SectionProps, 'variant' | 'padding'>>(
  ({ ...props }, ref) => (
    <Section
      ref={ref}
      variant="filled"
      padding="xl"
      {...props}
    />
  )
)

StatsSection.displayName = 'StatsSection'

// Call to Action Section
export const CTASection = forwardRef<HTMLElement, Omit<SectionProps, 'variant' | 'centerHeader'>>(
  ({ ...props }, ref) => (
    <Section
      ref={ref}
      variant="secondary"
      centerHeader
      {...props}
    />
  )
)

CTASection.displayName = 'CTASection'

// Export utility functions
export const getSectionVariant = (variant: keyof typeof sectionVariants) => {
  return sectionVariants[variant]
}

export const getSectionPadding = (padding: keyof typeof sectionPadding) => {
  return sectionPadding[padding]
}