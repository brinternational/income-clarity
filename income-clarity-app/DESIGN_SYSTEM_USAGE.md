# Design System Usage Guide

## Overview
The Income Clarity Design System provides a comprehensive set of components for building consistent, accessible, and performant user interfaces. This guide covers the migration from hardcoded Tailwind styles to Design System components.

## ✅ Migration Status

### COMPLETED ✅
- **Homepage** (`/app/page.tsx`) - Fully migrated to Design System
- **Dashboard** (`/app/dashboard/page.tsx`) - Migrated to Card, Button, Grid, Container
- **Authentication Pages** - Both login and signup pages migrated
  - Login (`/app/auth/login/page.tsx`) - Card, Alert, TextField, Button
  - Signup (`/app/auth/signup/page.tsx`) - Card, Alert, TextField, Button
- **Settings Page** (`/app/settings/page.tsx`) - Already using Design System
- **Super Cards Main** (`/app/dashboard/super-cards/page.tsx`) - Already using Design System

### IN PROGRESS 🔄
- **Super Cards Components** - Hub components need migration from hardcoded styles
- **Super Cards Unified** - Has hardcoded background and layout styles

### PENDING ⏳
- **Super Cards Tab Components** - All tab sub-components
- **Other App Pages** (onboarding, pricing, demo)

## Design System Components

### Core Components

#### Button
```tsx
import { Button } from '@/components/design-system/core/Button'

// Replace hardcoded button styles
// OLD: className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
// NEW:
<Button variant="primary" size="md">
  Click me
</Button>

// Variants: primary, secondary, outline, ghost, danger, success, link
// Sizes: xs, sm, md, lg, xl
// Additional props: loading, leftIcon, rightIcon, fullWidth, href
```

#### Card
```tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/design-system/core/Card'

// Replace hardcoded card styles
// OLD: className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
// NEW:
<Card variant="default" size="md" radius="lg">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Card content here
  </CardContent>
</Card>

// Variants: default, elevated, outlined, filled, glass, gradient, interactive
// Sizes: xs, sm, md, lg, xl
// Additional props: hover, clickable, loading, disabled
```

#### Alert
```tsx
import { Alert } from '@/components/design-system/core/Alert'

// Replace hardcoded alert styles
// OLD: className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg"
// NEW:
<Alert variant="error" size="md">
  Error message here
</Alert>

// Variants: success, error, warning, info, default
// Additional props: title, description, dismissible, actions
```

#### Badge
```tsx
import { Badge } from '@/components/design-system/core/Badge'

// Replace hardcoded badge styles
// OLD: className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs"
// NEW:
<Badge variant="success" size="sm">
  Active
</Badge>

// Variants: default, primary, secondary, success, warning, error, info
// Sizes: xs, sm, md, lg
```

### Form Components

#### TextField & Specialized Fields
```tsx
import { 
  TextField, 
  EmailField, 
  PasswordField, 
  CurrencyField, 
  PercentageField 
} from '@/components/design-system/forms/TextField'

// Replace hardcoded input styles
// OLD: className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
// NEW:
<TextField
  label="Full Name"
  placeholder="Enter your name"
  value={value}
  onChange={onChange}
  errorMessage={error}
  leftIcon={<User className="h-5 w-5" />}
/>

// Specialized fields with built-in validation and formatting
<EmailField label="Email" />
<PasswordField label="Password" />
<CurrencyField label="Amount" />
<PercentageField label="Yield" />
```

#### Select
```tsx
import { Select } from '@/components/design-system/forms/Select'

<Select
  label="Choose Option"
  options={[
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' }
  ]}
  value={selectedValue}
  onChange={setSelectedValue}
/>
```

### Layout Components

#### Container
```tsx
import { Container } from '@/components/design-system/layout/Container'

// Replace hardcoded container styles
// OLD: className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
// NEW:
<Container maxWidth="7xl">
  Content here
</Container>

// Max widths: xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, full
```

#### Grid
```tsx
import { Grid } from '@/components/design-system/layout/Grid'

// Replace hardcoded grid styles
// OLD: className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
// NEW:
<Grid cols={{ base: 1, md: 2, lg: 4 }} gap="lg">
  Grid items here
</Grid>

// Gaps: xs, sm, md, lg, xl, 2xl
// Responsive breakpoints: base, sm, md, lg, xl, 2xl
```

#### Stack
```tsx
import { Stack } from '@/components/design-system/layout/Stack'

// Replace hardcoded flex column styles
// OLD: className="flex flex-col space-y-4"
// NEW:
<Stack space="md" direction="vertical">
  Stacked items here
</Stack>

// Directions: vertical, horizontal
// Spacing: xs, sm, md, lg, xl, 2xl
```

## Migration Patterns

### 1. Button Migration
```tsx
// BEFORE
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50">
  Submit
</button>

// AFTER
<Button variant="primary" size="md" disabled={isLoading}>
  Submit
</Button>
```

### 2. Card Migration
```tsx
// BEFORE
<div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
  <h3 className="text-xl font-bold mb-2">Title</h3>
  <p className="text-gray-600 mb-4">Description</p>
  <div>Content</div>
</div>

// AFTER
<Card variant="elevated" size="md" radius="lg" hover>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content
  </CardContent>
</Card>
```

### 3. Form Migration
```tsx
// BEFORE
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
  <input 
    type="email"
    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
    placeholder="Enter email"
  />
  {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
</div>

// AFTER
<EmailField
  label="Email"
  placeholder="Enter email"
  errorMessage={error}
  leftIcon={<Mail className="h-5 w-5" />}
/>
```

### 4. Alert Migration
```tsx
// BEFORE
<div className="bg-red-50 border border-red-200 rounded-lg p-4">
  <div className="flex">
    <AlertCircle className="h-5 w-5 text-red-400" />
    <div className="ml-3">
      <p className="text-sm text-red-800">Error message</p>
    </div>
  </div>
</div>

// AFTER
<Alert variant="error" size="sm">
  Error message
</Alert>
```

## Accessibility Features

All Design System components include:

- **Keyboard Navigation** - Tab, Enter, Escape, Arrow keys
- **Screen Reader Support** - ARIA labels, roles, and descriptions
- **Focus Management** - Visible focus indicators and logical focus flow
- **Color Contrast** - WCAG AA compliant contrast ratios
- **Touch Targets** - Minimum 44x44px touch targets
- **Semantic HTML** - Proper HTML elements and structure

## Performance Features

- **Optimized Bundle Size** - Tree-shakeable imports
- **Efficient Re-renders** - Memoized components and optimized state
- **Loading States** - Built-in loading and skeleton states
- **Progressive Enhancement** - Works without JavaScript
- **Responsive Design** - Mobile-first approach

## Best Practices

### 1. Always Use Design System Components
```tsx
// ❌ DON'T create custom button styles
<button className="px-4 py-2 bg-blue-500...">Click me</button>

// ✅ DO use Design System Button
<Button variant="primary">Click me</Button>
```

### 2. Use Semantic Variants
```tsx
// ❌ DON'T use generic styles
<Alert variant="default">Success message</Alert>

// ✅ DO use semantic variants
<Alert variant="success">Success message</Alert>
```

### 3. Leverage Responsive Props
```tsx
// ❌ DON'T use hardcoded responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// ✅ DO use responsive props
<Grid cols={{ base: 1, md: 2, lg: 4 }}>
```

### 4. Include Accessibility Props
```tsx
// ❌ DON'T forget accessibility
<Button onClick={handleClick}>Delete</Button>

// ✅ DO include accessibility props
<Button 
  onClick={handleClick}
  variant="danger"
  ariaLabel="Delete user account"
>
  Delete
</Button>
```

## Testing

All components should be tested for:

1. **Functionality** - Component works as expected
2. **Accessibility** - Screen reader and keyboard navigation
3. **Responsive Design** - Works across breakpoints
4. **Performance** - No unnecessary re-renders

### Testing Tools
- **Lighthouse** - Accessibility and performance audits
- **axe-core** - Automated accessibility testing
- **Jest + React Testing Library** - Unit and integration tests
- **Playwright** - End-to-end testing

## Migration Checklist

- [ ] Replace all hardcoded button styles with `Button` component
- [ ] Replace all card/container divs with `Card` component
- [ ] Replace all form inputs with `TextField`/specialized field components
- [ ] Replace all badges/pills with `Badge` component
- [ ] Replace all alerts with `Alert` component
- [ ] Use `Container`, `Grid`, and `Stack` for layouts
- [ ] Ensure all interactive elements have proper accessibility props
- [ ] Test with screen readers and keyboard navigation
- [ ] Validate color contrast ratios
- [ ] Test responsive design across breakpoints
- [ ] Run performance audits

## Examples

See the following files for migration examples:
- `/app/page.tsx` - Complete homepage with Design System
- `/app/dashboard/page.tsx` - Dashboard layout migration
- `/app/auth/login/page.tsx` - Form components migration
- `/app/auth/signup/page.tsx` - Complex form with validation

## Support

For questions or issues with the Design System:
1. Check this documentation
2. Review the component source code in `/components/design-system/`
3. Look at existing migration examples
4. Test components in Storybook (if available)

## Performance Budget

The Design System enforces these performance standards:
- **Load Time**: <3 seconds on 3G networks, <1 second on WiFi
- **Bundle Size**: <500KB for initial load, <2MB total application size
- **Accessibility Score**: 90%+ on automated testing tools
- **Core Web Vitals**: LCP <2.5s, FID <100ms, CLS <0.1