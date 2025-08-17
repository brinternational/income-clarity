/**
 * Income Clarity Design System - Stack Component
 * 
 * Flexible stacking layout component for arranging elements
 * vertically or horizontally with consistent spacing.
 */

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Stack spacing sizes
const stackSpacing = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12',
  '3xl': 'gap-16'
}

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  // Direction
  direction?: 'horizontal' | 'vertical'
  // Spacing
  spacing?: keyof typeof stackSpacing
  spacingMobile?: keyof typeof stackSpacing
  spacingTablet?: keyof typeof stackSpacing
  spacingDesktop?: keyof typeof stackSpacing
  // Alignment
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  // Wrapping
  wrap?: boolean
  reverse?: boolean
  // Dividers
  divider?: React.ReactNode
  // Responsive direction changes
  directionMobile?: 'horizontal' | 'vertical'
  directionTablet?: 'horizontal' | 'vertical'
  directionDesktop?: 'horizontal' | 'vertical'
  // Semantic element
  as?: 'div' | 'section' | 'ul' | 'ol' | 'nav' | 'header' | 'footer'
}

export const Stack = forwardRef<HTMLDivElement, StackProps>(
  ({
    className,
    direction = 'vertical',
    spacing = 'md',
    spacingMobile,
    spacingTablet,
    spacingDesktop,
    align,
    justify,
    wrap = false,
    reverse = false,
    divider,
    directionMobile,
    directionTablet,
    directionDesktop,
    as: Component = 'div',
    children,
    ...props
  }, ref) => {
    // Direction classes
    const directionClasses = {
      vertical: 'flex-col',
      horizontal: 'flex-row'
    }

    // Alignment classes
    const alignmentClasses = {
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch'
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly'
      }
    }

    // Build responsive direction classes
    const getResponsiveDirectionClass = (dir: 'horizontal' | 'vertical', breakpoint?: string) => {
      const prefix = breakpoint ? `${breakpoint}:` : ''
      return `${prefix}${directionClasses[dir]}`
    }

    // Build responsive spacing classes
    const getResponsiveSpacingClass = (space: keyof typeof stackSpacing, breakpoint?: string) => {
      const prefix = breakpoint ? `${breakpoint}:` : ''
      return `${prefix}${stackSpacing[space]}`
    }

    // Base classes
    const baseClasses = cn(
      'flex',
      // Direction
      getResponsiveDirectionClass(directionMobile || direction),
      directionTablet && getResponsiveDirectionClass(directionTablet, 'md'),
      directionDesktop && getResponsiveDirectionClass(directionDesktop, 'lg'),
      // Reverse
      reverse && (
        direction === 'vertical' ? 'flex-col-reverse' : 'flex-row-reverse'
      ),
      // Spacing
      getResponsiveSpacingClass(spacingMobile || spacing),
      spacingTablet && getResponsiveSpacingClass(spacingTablet, 'md'),
      spacingDesktop && getResponsiveSpacingClass(spacingDesktop, 'lg'),
      // Alignment
      align && alignmentClasses.align[align],
      justify && alignmentClasses.justify[justify],
      // Wrapping
      wrap && 'flex-wrap',
      className
    )

    // Handle dividers
    const childrenArray = React.Children.toArray(children)
    const childrenWithDividers = divider
      ? childrenArray.reduce<React.ReactNode[]>((acc, child, index) => {
          acc.push(child)
          if (index < childrenArray.length - 1) {
            acc.push(
              <div key={`divider-${index}`} className="flex-shrink-0">
                {divider}
              </div>
            )
          }
          return acc
        }, [])
      : children

    return (
      <Component
        ref={ref}
        className={baseClasses}
        {...props}
      >
        {childrenWithDividers}
      </Component>
    )
  }
)

Stack.displayName = 'Stack'

// Vertical Stack (VStack) - Convenience component
export interface VStackProps extends Omit<StackProps, 'direction'> {}

export const VStack = forwardRef<HTMLDivElement, VStackProps>(
  ({ ...props }, ref) => (
    <Stack
      ref={ref}
      direction="vertical"
      {...props}
    />
  )
)

VStack.displayName = 'VStack'

// Horizontal Stack (HStack) - Convenience component
export interface HStackProps extends Omit<StackProps, 'direction'> {}

export const HStack = forwardRef<HTMLDivElement, HStackProps>(
  ({ ...props }, ref) => (
    <Stack
      ref={ref}
      direction="horizontal"
      {...props}
    />
  )
)

HStack.displayName = 'HStack'

// Responsive Stack - Changes direction based on screen size
export interface ResponsiveStackProps extends Omit<StackProps, 'directionMobile' | 'directionTablet' | 'directionDesktop'> {
  breakpoint?: 'sm' | 'md' | 'lg'
}

export const ResponsiveStack = forwardRef<HTMLDivElement, ResponsiveStackProps>(
  ({ breakpoint = 'md', ...props }, ref) => {
    const responsiveProps = {
      directionMobile: 'vertical' as const,
      ...(breakpoint === 'sm' && { directionTablet: 'horizontal' as const }),
      ...(breakpoint === 'md' && { directionTablet: 'horizontal' as const }),
      ...(breakpoint === 'lg' && { 
        directionTablet: 'vertical' as const,
        directionDesktop: 'horizontal' as const 
      })
    }

    return (
      <Stack
        ref={ref}
        direction="vertical"
        {...responsiveProps}
        {...props}
      />
    )
  }
)

ResponsiveStack.displayName = 'ResponsiveStack'

// Spacer component for pushing elements apart in stacks
export interface SpacerProps {
  size?: keyof typeof stackSpacing
  className?: string
}

export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(
  ({ size = 'md', className }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex-1',
        stackSpacing[size],
        className
      )}
      aria-hidden="true"
    />
  )
)

Spacer.displayName = 'Spacer'

// Specialized stack components

// Form Stack - For form layouts
export const FormStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction' | 'spacing'>>(
  ({ ...props }, ref) => (
    <VStack
      ref={ref}
      spacing="lg"
      {...props}
    />
  )
)

FormStack.displayName = 'FormStack'

// Button Stack - For button groups
export const ButtonStack = forwardRef<HTMLDivElement, Omit<StackProps, 'spacing'>>(
  ({ direction = 'horizontal', ...props }, ref) => (
    <Stack
      ref={ref}
      direction={direction}
      spacing="sm"
      wrap
      {...props}
    />
  )
)

ButtonStack.displayName = 'ButtonStack'

// Nav Stack - For navigation items
export const NavStack = forwardRef<HTMLDivElement, Omit<StackProps, 'as' | 'spacing'>>(
  ({ direction = 'horizontal', ...props }, ref) => (
    <Stack
      ref={ref}
      as="nav"
      direction={direction}
      spacing="md"
      align="center"
      {...props}
    />
  )
)

NavStack.displayName = 'NavStack'

// Card Stack - For stacking cards
export const CardStack = forwardRef<HTMLDivElement, Omit<StackProps, 'direction' | 'spacing'>>(
  ({ ...props }, ref) => (
    <VStack
      ref={ref}
      spacing="lg"
      {...props}
    />
  )
)

CardStack.displayName = 'CardStack'

// Export utility functions
export const getStackSpacing = (spacing: keyof typeof stackSpacing) => {
  return stackSpacing[spacing]
}