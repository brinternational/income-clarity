/**
 * Income Clarity Design System - Grid Component
 * 
 * Responsive grid layout system with flexible column configurations
 * and consistent spacing.
 */

'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { theme } from '../theme'

// Grid gap sizes
const gridGaps = {
  none: 'gap-0',
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
  '2xl': 'gap-12'
}

// Grid column configurations
const gridCols = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
  7: 'grid-cols-7',
  8: 'grid-cols-8',
  9: 'grid-cols-9',
  10: 'grid-cols-10',
  11: 'grid-cols-11',
  12: 'grid-cols-12'
}

// Grid auto-fit configurations for responsive layouts
const autoFitSizes = {
  xs: 'grid-cols-[repeat(auto-fit,minmax(200px,1fr))]',
  sm: 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]',
  md: 'grid-cols-[repeat(auto-fit,minmax(300px,1fr))]',
  lg: 'grid-cols-[repeat(auto-fit,minmax(350px,1fr))]',
  xl: 'grid-cols-[repeat(auto-fit,minmax(400px,1fr))]'
}

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  // Column configuration
  cols?: keyof typeof gridCols
  colsMobile?: keyof typeof gridCols
  colsTablet?: keyof typeof gridCols
  colsDesktop?: keyof typeof gridCols
  // Auto-fit responsive
  autoFit?: keyof typeof autoFitSizes
  // Gap configuration
  gap?: keyof typeof gridGaps
  gapX?: keyof typeof gridGaps
  gapY?: keyof typeof gridGaps
  // Alignment
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
  justifyItems?: 'start' | 'center' | 'end' | 'stretch'
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  alignContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  // Flow
  flow?: 'row' | 'col' | 'row-dense' | 'col-dense'
  // Semantic element
  as?: 'div' | 'section' | 'ul' | 'ol'
}

export const Grid = forwardRef<HTMLDivElement, GridProps>(
  ({
    className,
    cols = 1,
    colsMobile,
    colsTablet,
    colsDesktop,
    autoFit,
    gap = 'md',
    gapX,
    gapY,
    alignItems,
    justifyItems,
    justifyContent,
    alignContent,
    flow,
    as: Component = 'div',
    children,
    ...props
  }, ref) => {
    // Alignment classes
    const alignmentClasses = {
      alignItems: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch'
      },
      justifyItems: {
        start: 'justify-items-start',
        center: 'justify-items-center',
        end: 'justify-items-end',
        stretch: 'justify-items-stretch'
      },
      justifyContent: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly'
      },
      alignContent: {
        start: 'content-start',
        center: 'content-center',
        end: 'content-end',
        between: 'content-between',
        around: 'content-around',
        evenly: 'content-evenly'
      }
    }

    // Flow classes
    const flowClasses = {
      row: 'grid-flow-row',
      col: 'grid-flow-col',
      'row-dense': 'grid-flow-row-dense',
      'col-dense': 'grid-flow-col-dense'
    }

    // Build responsive column classes
    const getResponsiveColClass = (columns: keyof typeof gridCols, breakpoint?: string) => {
      const prefix = breakpoint ? `${breakpoint}:` : ''
      return `${prefix}${gridCols[columns]}`
    }

    // Base classes
    const baseClasses = cn(
      'grid',
      // Auto-fit or manual columns
      autoFit ? autoFitSizes[autoFit] : [
        getResponsiveColClass(colsMobile || cols),
        colsTablet && getResponsiveColClass(colsTablet, 'md'),
        colsDesktop && getResponsiveColClass(colsDesktop, 'lg')
      ].filter(Boolean),
      // Gap
      gapX ? `gap-x-${gapX.replace('gap-', '')}` : '',
      gapY ? `gap-y-${gapY.replace('gap-', '')}` : '',
      !gapX && !gapY && gridGaps[gap],
      // Alignment
      alignItems && alignmentClasses.alignItems[alignItems],
      justifyItems && alignmentClasses.justifyItems[justifyItems],
      justifyContent && alignmentClasses.justifyContent[justifyContent],
      alignContent && alignmentClasses.alignContent[alignContent],
      // Flow
      flow && flowClasses[flow],
      className
    )

    return (
      <Component
        ref={ref}
        className={baseClasses}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Grid.displayName = 'Grid'

// Grid Item component for spanning multiple columns/rows
export interface GridItemProps extends React.HTMLAttributes<HTMLDivElement> {
  // Column span
  colSpan?: number
  colSpanMobile?: number
  colSpanTablet?: number
  colSpanDesktop?: number
  // Row span
  rowSpan?: number
  rowSpanMobile?: number
  rowSpanTablet?: number
  rowSpanDesktop?: number
  // Start/End positions
  colStart?: number
  colEnd?: number
  rowStart?: number
  rowEnd?: number
  // Self alignment
  alignSelf?: 'start' | 'center' | 'end' | 'stretch'
  justifySelf?: 'start' | 'center' | 'end' | 'stretch'
  // Order
  order?: number
  // Semantic element
  as?: 'div' | 'li' | 'article' | 'section'
}

export const GridItem = forwardRef<HTMLDivElement, GridItemProps>(
  ({
    className,
    colSpan,
    colSpanMobile,
    colSpanTablet,
    colSpanDesktop,
    rowSpan,
    rowSpanMobile,
    rowSpanTablet,
    rowSpanDesktop,
    colStart,
    colEnd,
    rowStart,
    rowEnd,
    alignSelf,
    justifySelf,
    order,
    as: Component = 'div',
    children,
    ...props
  }, ref) => {
    // Helper function to generate span classes
    const getSpanClass = (span: number, type: 'col' | 'row', breakpoint?: string) => {
      const prefix = breakpoint ? `${breakpoint}:` : ''
      if (span === 1) return '' // Default span is 1
      return `${prefix}${type}-span-${span}`
    }

    // Self alignment classes
    const selfAlignmentClasses = {
      alignSelf: {
        start: 'self-start',
        center: 'self-center',
        end: 'self-end',
        stretch: 'self-stretch'
      },
      justifySelf: {
        start: 'justify-self-start',
        center: 'justify-self-center',
        end: 'justify-self-end',
        stretch: 'justify-self-stretch'
      }
    }

    // Build classes
    const itemClasses = cn(
      // Column spans
      colSpan && getSpanClass(colSpan, 'col'),
      colSpanMobile && getSpanClass(colSpanMobile, 'col'),
      colSpanTablet && getSpanClass(colSpanTablet, 'col', 'md'),
      colSpanDesktop && getSpanClass(colSpanDesktop, 'col', 'lg'),
      // Row spans
      rowSpan && getSpanClass(rowSpan, 'row'),
      rowSpanMobile && getSpanClass(rowSpanMobile, 'row'),
      rowSpanTablet && getSpanClass(rowSpanTablet, 'row', 'md'),
      rowSpanDesktop && getSpanClass(rowSpanDesktop, 'row', 'lg'),
      // Start/End positions
      colStart && `col-start-${colStart}`,
      colEnd && `col-end-${colEnd}`,
      rowStart && `row-start-${rowStart}`,
      rowEnd && `row-end-${rowEnd}`,
      // Self alignment
      alignSelf && selfAlignmentClasses.alignSelf[alignSelf],
      justifySelf && selfAlignmentClasses.justifySelf[justifySelf],
      // Order
      order && `order-${order}`,
      className
    )

    return (
      <Component
        ref={ref}
        className={itemClasses}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

GridItem.displayName = 'GridItem'

// Specialized grid components

// Dashboard Grid - Common layout for dashboard cards
export const DashboardGrid = forwardRef<HTMLDivElement, Omit<GridProps, 'autoFit'>>(
  ({ ...props }, ref) => (
    <Grid
      ref={ref}
      autoFit="md"
      gap="lg"
      {...props}
    />
  )
)

DashboardGrid.displayName = 'DashboardGrid'

// Card Grid - For displaying cards in a grid
export const CardGrid = forwardRef<HTMLDivElement, Omit<GridProps, 'cols' | 'autoFit'>>(
  ({ ...props }, ref) => (
    <Grid
      ref={ref}
      cols={1}
      colsTablet={2}
      colsDesktop={3}
      gap="md"
      {...props}
    />
  )
)

CardGrid.displayName = 'CardGrid'

// Stats Grid - For displaying statistics
export const StatsGrid = forwardRef<HTMLDivElement, Omit<GridProps, 'cols'>>(
  ({ ...props }, ref) => (
    <Grid
      ref={ref}
      cols={2}
      colsTablet={4}
      gap="md"
      {...props}
    />
  )
)

StatsGrid.displayName = 'StatsGrid'

// Export utility functions
export const getGridCols = (cols: keyof typeof gridCols) => {
  return gridCols[cols]
}

export const getGridGap = (gap: keyof typeof gridGaps) => {
  return gridGaps[gap]
}