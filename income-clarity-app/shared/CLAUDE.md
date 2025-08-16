# Shared Components - Context Documentation

## Overview
This folder contains reusable UI components, utilities, and shared functionality used across multiple features in the Income Clarity application.

## Folder Structure
```
shared/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, cards, etc.)
│   ├── forms/           # Form components and controls
│   ├── charts/          # Chart and visualization components
│   └── [shared]/        # Other shared utilities
├── hooks/               # Shared custom hooks
├── services/            # Shared business logic services
└── utils/               # Utility functions and helpers
```

## UI Components (`components/ui/`)
- **button.tsx**: Standardized button component
- **card.tsx**: Card layout component
- **LoadingSpinner.tsx**: Loading states
- **ErrorBoundary.tsx**: Error handling wrapper
- **AccessibleModal.tsx**: Accessible modal dialogs
- **skeletons.tsx**: Loading skeleton components

## Form Components (`components/forms/`)
- **Button.tsx**: Form-specific button styling
- **Input.tsx**: Text input with validation
- **Select.tsx**: Dropdown selection component
- **Textarea.tsx**: Multi-line text input
- **Toggle.tsx**: Switch/toggle component
- **FormField.tsx**: Wrapper for form fields
- **FormModal.tsx**: Modal form container

## Chart Components (`components/charts/`)
- **PerformanceChart.tsx**: Portfolio performance visualization
- **DividendCalendar.tsx**: Dividend payment timeline
- **PortfolioComposition.tsx**: Asset allocation charts
- **IncomeWaterfall.tsx**: Income flow visualization
- **TaxEfficiencyDashboard.tsx**: Tax analysis charts
- **YieldOnCostAnalysis.tsx**: Yield progression charts

## Shared Utilities
- **DataSourceIndicator.tsx**: Shows data freshness
- **TimeRangeSelector.tsx**: Date range picker
- **ShareButton.tsx**: Social sharing functionality
- **HelpButton.tsx**: Contextual help system
- **Sparkline.tsx**: Inline trend charts

## Design System
All shared components follow the Income Clarity design system:
- Consistent color palette using CSS custom properties
- Responsive design with mobile-first approach
- Accessibility compliance (WCAG 2.1 AA)
- Dark mode support via theme context
- Haptic feedback on mobile devices

## Usage Guidelines
1. **Import Path**: Use `@/shared/components/[category]/ComponentName`
2. **Props Interface**: All components export their props interface
3. **Styling**: Components use Tailwind CSS with theme variables
4. **Testing**: Each component includes unit tests
5. **Documentation**: Props and usage documented in TypeScript

## Integration Points
- **Theme System**: All components respect theme context
- **Authentication**: Form components integrate with auth state
- **Loading States**: UI components work with loading context
- **Error Handling**: Components use global error boundary
- **Accessibility**: All components support keyboard navigation

## Development Notes
- Components are built to be framework-agnostic where possible
- Each component follows atomic design principles
- Performance optimized with React.memo where appropriate
- TypeScript strict mode compliance
- Storybook stories for visual documentation