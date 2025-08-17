# Income Clarity Design System

A unified, accessible, and performant design system for the Income Clarity application. This design system ensures consistent UI/UX across all components and pages while maintaining excellent accessibility and performance standards.

## 🎯 Mission

Create a cohesive, professional, and accessible user interface that:
- **Unifies inconsistent UI** - Replaces fragmented styling with standardized components
- **Improves accessibility** - WCAG 2.1 AA compliance by default
- **Enhances performance** - Optimized components with minimal bundle impact
- **Accelerates development** - Reusable components with comprehensive documentation

## 📁 Structure

```
/components/design-system/
├── theme/                  # Design tokens and theme configuration
│   ├── colors.ts          # Color palette and semantic colors
│   ├── typography.ts      # Font families, sizes, and text styles
│   ├── spacing.ts         # Consistent spacing scale
│   ├── shadows.ts         # Shadow system for elevation
│   └── index.ts           # Unified theme export
├── core/                  # Atomic components (building blocks)
│   ├── Button.tsx         # Unified button component
│   ├── Input.tsx          # Base input component
│   ├── Card.tsx           # Container component
│   ├── Badge.tsx          # Status indicators
│   ├── Alert.tsx          # Notification component
│   └── index.ts           # Core components export
├── forms/                 # Form-specific components
│   ├── TextField.tsx      # Enhanced input with validation
│   ├── Select.tsx         # Dropdown component
│   ├── Checkbox.tsx       # Checkbox component
│   └── FormGroup.tsx      # Form layout component
├── layout/                # Layout and structure components
│   ├── Container.tsx      # Content container
│   ├── Grid.tsx           # Grid system
│   ├── Stack.tsx          # Stacking layout
│   └── Section.tsx        # Page sections
├── feedback/              # User feedback components
│   ├── Toast.tsx          # Notification toasts
│   ├── Modal.tsx          # Modal dialogs
│   ├── Spinner.tsx        # Loading indicators
│   └── Progress.tsx       # Progress indicators
├── navigation/            # Navigation components
│   ├── Navbar.tsx         # Top navigation
│   ├── Sidebar.tsx        # Side navigation
│   ├── Tabs.tsx           # Tab navigation
│   └── Breadcrumb.tsx     # Breadcrumb navigation
└── data-display/          # Data visualization components
    ├── Table.tsx          # Data tables
    ├── List.tsx           # Lists and items
    ├── Stat.tsx           # Statistics display
    └── Chart.tsx          # Chart wrapper
```

## 🎨 Design Tokens

### Colors

Our color system is built around financial clarity and accessibility:

#### Brand Colors
- **Primary**: Blue gradient (`brand-500` to `secondary-500`)
- **Secondary**: Emerald for success/income (`secondary-500`)
- **Financial**: Semantic colors for profit/loss/dividends

#### Usage
```tsx
import { colors } from '@/components/design-system/theme'

// CSS Custom Properties
<div className="bg-brand-500 text-white" />

// Semantic usage
<Badge variant="success" /> // Uses success color system
<StatusBadge status="positive" /> // Green for profits
```

### Typography

Responsive typography scale optimized for financial data:

```tsx
import { typography } from '@/components/design-system/theme'

// Predefined text styles
<h1 className="text-heading-1">Large Heading</h1>
<p className="text-body-base">Body text</p>
<span className="text-currency-lg">$1,234.56</span>
```

### Spacing

Consistent 4px-based spacing scale:

```tsx
import { spacing } from '@/components/design-system/theme'

// Semantic spacing
<div className="p-component-padding-md gap-component-gap-sm" />

// Standard scale
<div className="m-4 p-6 gap-8" /> // 16px, 24px, 32px
```

## 🧱 Core Components

### Button

Unified button replacing all existing button implementations:

```tsx
import { Button } from '@/components/design-system/core'

// Basic usage
<Button variant="primary" size="md">
  Click me
</Button>

// With icons and states
<Button 
  variant="success" 
  leftIcon={<CheckIcon />}
  loading={isLoading}
  disabled={isDisabled}
>
  Save Changes
</Button>

// Link button
<Button href="/dashboard" variant="outline">
  Go to Dashboard
</Button>
```

**Available Variants:**
- `primary` - Main brand actions (gradient)
- `secondary` - Supporting actions (glassmorphism)
- `outline` - Subtle actions
- `ghost` - Minimal visual weight
- `danger` - Destructive actions
- `success` - Positive actions
- `link` - Text-like appearance

### Input

Enhanced input component with validation and formatting:

```tsx
import { Input } from '@/components/design-system/core'

// Basic input
<Input 
  label="Email"
  placeholder="Enter your email"
  required
/>

// With validation states
<Input 
  label="Password"
  type="password"
  showPasswordToggle
  errorMessage="Password is required"
/>

// Currency input
<Input 
  label="Amount"
  currency
  numeric
  placeholder="0.00"
/>
```

### Card

Flexible container component:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/design-system/core'

<Card variant="elevated" clickable>
  <CardHeader>
    <CardTitle>Portfolio Summary</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Your portfolio performance...</p>
  </CardContent>
</Card>
```

## 📋 Form Components

### TextField

Enhanced input with built-in validation and formatting:

```tsx
import { TextField, CurrencyField, PercentageField } from '@/components/design-system/forms'

// Auto-formatting currency
<CurrencyField 
  label="Investment Amount"
  validate={(value) => value < 0 ? "Amount must be positive" : null}
/>

// Percentage field
<PercentageField 
  label="Expected Return"
  helperText="Annual percentage return"
/>
```

### Select

Powerful dropdown with search and grouping:

```tsx
import { Select } from '@/components/design-system/forms'

const stockOptions = [
  { value: 'AAPL', label: 'Apple Inc.', group: 'Technology' },
  { value: 'MSFT', label: 'Microsoft', group: 'Technology' },
  { value: 'JNJ', label: 'Johnson & Johnson', group: 'Healthcare' }
]

<Select 
  label="Select Stock"
  options={stockOptions}
  searchable
  clearable
  onSelectionChange={(value) => console.log(value)}
/>
```

## 🎭 Component Variants

All components support consistent variant patterns:

### Sizes
- `xs` - Extra small (mobile-friendly)
- `sm` - Small
- `md` - Medium (default)
- `lg` - Large
- `xl` - Extra large

### States
- `default` - Normal state
- `hover` - Hover interaction
- `active` - Active/pressed state
- `disabled` - Disabled state
- `loading` - Loading state

### Semantic Variants
- `primary` - Brand color
- `secondary` - Secondary brand
- `success` - Positive actions/states
- `warning` - Caution states
- `error` - Negative states/errors
- `info` - Informational states

## ♿ Accessibility

All components are built with accessibility in mind:

### Standards
- **WCAG 2.1 AA compliance** - Color contrast, focus indicators, keyboard navigation
- **Semantic HTML** - Proper heading hierarchy, form labels, ARIA attributes
- **Screen reader support** - Descriptive labels, state announcements
- **Keyboard navigation** - Tab order, keyboard shortcuts, escape handling

### Implementation
```tsx
// Automatic accessibility features
<Button aria-label="Save portfolio changes">
  <SaveIcon />
</Button>

// Enhanced form accessibility
<TextField 
  label="Stock Symbol"
  required
  errorMessage="Please enter a valid symbol"
  helperText="e.g., AAPL, MSFT"
/>
```

## 🚀 Performance

### Bundle Optimization
- **Tree-shakeable exports** - Import only what you use
- **Minimal dependencies** - Core components use minimal external deps
- **Optimized animations** - GPU-accelerated transitions
- **Lazy loading** - Dynamic imports for heavy components

### Usage
```tsx
// Tree-shakeable imports
import { Button, Card } from '@/components/design-system/core'

// Lazy loading for heavy components
const Chart = lazy(() => import('@/components/design-system/data-display/Chart'))
```

## 📖 Migration Guide

### Replacing Existing Components

#### Buttons
```tsx
// OLD - Multiple button implementations
import { Button as OldButton } from '@/components/forms/Button'
import { Button as UIButton } from '@/components/ui/button'

// NEW - Unified button
import { Button } from '@/components/design-system/core'

// Migration
<OldButton variant="primary" loading={true} />
// becomes
<Button variant="primary" loading={true} />
```

#### Form Fields
```tsx
// OLD - Inconsistent inputs
import { Input } from '@/components/forms/Input'

// NEW - Enhanced text field
import { TextField, CurrencyField } from '@/components/design-system/forms'

// Migration
<Input error={!!error} leftIcon={<DollarSign />} />
// becomes
<CurrencyField errorMessage={error} />
```

### Page-by-Page Migration

1. **Settings Page** - Replace inline styles with Card components
2. **Dashboard** - Unify Super Card styling with Card variants
3. **Forms** - Replace form components with design system versions
4. **Navigation** - Standardize navigation components

## 🔧 Development

### Adding New Components

1. **Create component file** in appropriate directory
2. **Follow naming conventions** - PascalCase, descriptive names
3. **Include TypeScript interfaces** - Proper prop types
4. **Add accessibility features** - ARIA labels, keyboard support
5. **Write tests** - Unit tests for component behavior
6. **Update exports** - Add to index files

### Testing

```bash
# Run component tests
npm test -- --testPathPattern=design-system

# Accessibility testing
npm run test:a11y

# Visual regression testing
npm run test:visual
```

### Theme Customization

```tsx
// Extend the theme
import { theme } from '@/components/design-system/theme'

const customTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    brand: {
      ...theme.colors.brand,
      500: '#custom-color'
    }
  }
}
```

## 📚 Examples

See the [Storybook documentation](http://localhost:6006) for interactive examples and component playground.

## 🤝 Contributing

1. Follow the existing patterns and conventions
2. Ensure accessibility compliance
3. Include proper TypeScript types
4. Test across different devices and browsers
5. Update documentation for new features

## 📈 Roadmap

- [ ] Complete form components (Checkbox, Radio, FormGroup)
- [ ] Layout components (Container, Grid, Stack)
- [ ] Feedback components (Toast, Modal, Spinner)
- [ ] Navigation components (Navbar, Sidebar, Tabs)
- [ ] Data display components (Table, List, Stat)
- [ ] Advanced components (DatePicker, ColorPicker)
- [ ] Animation system
- [ ] Dark mode optimization
- [ ] Mobile-specific optimizations

---

For questions or contributions, please refer to the project documentation or create an issue in the repository.