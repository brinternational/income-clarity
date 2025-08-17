/**
 * Income Clarity Design System - Container Component
 * 
 * Responsive container component with consistent max-widths
 * and padding for different screen sizes.
 */

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Container variants for different use cases
const containerVariants = {
  // Full width with responsive padding
  fluid: [
    'w-full',
    'px-4 sm:px-6 lg:px-8'
  ].join(' '),

  // Responsive max-widths
  responsive: [
    'w-full',
    'max-w-7xl mx-auto',
    'px-4 sm:px-6 lg:px-8'
  ].join(' '),

  // Fixed max-widths
  sm: [
    'w-full max-w-sm mx-auto',
    'px-4'
  ].join(' '),

  md: [
    'w-full max-w-md mx-auto',
    'px-4'
  ].join(' '),

  lg: [
    'w-full max-w-lg mx-auto',
    'px-4'
  ].join(' '),

  xl: [
    'w-full max-w-xl mx-auto',
    'px-4 sm:px-6'
  ].join(' '),

  '2xl': [
    'w-full max-w-2xl mx-auto',
    'px-4 sm:px-6'
  ].join(' '),

  '3xl': [
    'w-full max-w-3xl mx-auto',
    'px-4 sm:px-6 lg:px-8'
  ].join(' '),

  '4xl': [
    'w-full max-w-4xl mx-auto',
    'px-4 sm:px-6 lg:px-8'
  ].join(' '),

  '5xl': [
    'w-full max-w-5xl mx-auto',
    'px-4 sm:px-6 lg:px-8'
  ].join(' '),

  '6xl': [
    'w-full max-w-6xl mx-auto',
    'px-4 sm:px-6 lg:px-8'
  ].join(' '),

  '7xl': [
    'w-full max-w-7xl mx-auto',
    'px-4 sm:px-6 lg:px-8'
  ].join(' '),

  // No padding - useful for nested containers
  bare: [
    'w-full max-w-7xl mx-auto'
  ].join(' ')
}

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof containerVariants
  // Custom max-width
  maxWidth?: string
  // Centering options
  centerContent?: boolean
  // Padding options
  noPadding?: boolean
  paddingX?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  // Semantic element
  as?: 'div' | 'main' | 'section' | 'article' | 'aside' | 'header' | 'footer'
}

export const Container = forwardRef<HTMLDivElement, ContainerProps>(
  ({
    className,
    variant = 'responsive',
    maxWidth,
    centerContent = false,
    noPadding = false,
    paddingX,
    paddingY,
    as: Component = 'div',
    children,
    style,
    ...props
  }, ref) => {
    // Padding classes
    const paddingXClasses = {
      none: 'px-0',
      sm: 'px-2 sm:px-3',
      md: 'px-4 sm:px-6',
      lg: 'px-4 sm:px-6 lg:px-8',
      xl: 'px-6 sm:px-8 lg:px-12'
    }

    const paddingYClasses = {
      none: 'py-0',
      sm: 'py-2',
      md: 'py-4',
      lg: 'py-6',
      xl: 'py-8'
    }

    // Base classes
    const baseClasses = cn(
      containerVariants[variant],
      centerContent && 'flex items-center justify-center min-h-full',
      noPadding && 'px-0',
      paddingX && paddingXClasses[paddingX],
      paddingY && paddingYClasses[paddingY],
      className
    )

    // Custom styles
    const customStyle = {
      ...style,
      ...(maxWidth && { maxWidth })
    }

    return (
      <Component
        ref={ref}
        className={baseClasses}
        style={customStyle}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Container.displayName = 'Container'

// Specialized container components

// Page Container - For main page content
export const PageContainer = forwardRef<HTMLDivElement, Omit<ContainerProps, 'as'>>(
  ({ ...props }, ref) => (
    <Container
      ref={ref}
      as="main"
      variant="responsive"
      paddingY="lg"
      {...props}
    />
  )
)

PageContainer.displayName = 'PageContainer'

// Section Container - For page sections
export const SectionContainer = forwardRef<HTMLDivElement, Omit<ContainerProps, 'as'>>(
  ({ ...props }, ref) => (
    <Container
      ref={ref}
      as="section"
      variant="responsive"
      paddingY="md"
      {...props}
    />
  )
)

SectionContainer.displayName = 'SectionContainer'

// Card Container - For card-like content areas
export const CardContainer = forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, ...props }, ref) => (
    <Container
      ref={ref}
      variant="bare"
      className={cn(
        'bg-white dark:bg-neutral-800',
        'border border-neutral-200 dark:border-neutral-700',
        'rounded-lg p-6',
        'shadow-sm',
        className
      )}
      {...props}
    />
  )
)

CardContainer.displayName = 'CardContainer'

// Narrow Container - For forms and focused content
export const NarrowContainer = forwardRef<HTMLDivElement, Omit<ContainerProps, 'variant'>>(
  ({ ...props }, ref) => (
    <Container
      ref={ref}
      variant="2xl"
      {...props}
    />
  )
)

NarrowContainer.displayName = 'NarrowContainer'

// Wide Container - For dashboards and data displays
export const WideContainer = forwardRef<HTMLDivElement, Omit<ContainerProps, 'variant'>>(
  ({ ...props }, ref) => (
    <Container
      ref={ref}
      variant="7xl"
      {...props}
    />
  )
)

WideContainer.displayName = 'WideContainer'

// Export utility functions
export const getContainerVariant = (variant: keyof typeof containerVariants) => {
  return containerVariants[variant]
}