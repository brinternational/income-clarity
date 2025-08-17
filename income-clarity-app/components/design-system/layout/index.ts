/**
 * Income Clarity Design System - Layout Components Index
 * 
 * Central export for all layout components.
 * These components provide structure and organization for content.
 */

// Container Components
export { 
  Container, 
  PageContainer, 
  SectionContainer, 
  CardContainer, 
  NarrowContainer, 
  WideContainer,
  type ContainerProps, 
  getContainerVariant 
} from './Container'

// Grid System
export { 
  Grid, 
  GridItem, 
  DashboardGrid, 
  CardGrid, 
  StatsGrid,
  type GridProps, 
  type GridItemProps, 
  getGridCols, 
  getGridGap 
} from './Grid'

// Stack System
export { 
  Stack, 
  VStack, 
  HStack, 
  ResponsiveStack, 
  Spacer, 
  FormStack, 
  ButtonStack, 
  NavStack, 
  CardStack,
  type StackProps, 
  type VStackProps, 
  type HStackProps, 
  type ResponsiveStackProps, 
  type SpacerProps, 
  getStackSpacing 
} from './Stack'

// Section Components
export { 
  Section, 
  HeroSection, 
  FeatureSection, 
  ContentSection, 
  CardSection, 
  StatsSection, 
  CTASection,
  type SectionProps, 
  getSectionVariant, 
  getSectionPadding 
} from './Section'

// Common layout types
export type LayoutDirection = 'horizontal' | 'vertical'
export type LayoutSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
export type LayoutAlignment = 'start' | 'center' | 'end' | 'stretch'
export type LayoutJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'