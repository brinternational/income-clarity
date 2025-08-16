# Testing Guide for Income Clarity App

This document outlines the comprehensive testing strategy and guidelines for the Income Clarity application.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Test Types](#test-types)
- [Test Structure](#test-structure)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Testing Guidelines](#testing-guidelines)
- [CI/CD Integration](#cicd-integration)
- [Coverage Requirements](#coverage-requirements)

## Testing Philosophy

Our testing approach follows the **Testing Pyramid** principle:

1. **Unit Tests (70%)** - Fast, isolated tests for individual functions and components
2. **Integration Tests (20%)** - Test component interactions and API integrations
3. **E2E Tests (10%)** - Test complete user workflows

### Quality Standards

- **80% minimum code coverage** as per Development Cycle SOP
- **Zero critical accessibility violations**
- **Performance budget compliance** (LCP < 2.5s, CLS < 0.1)
- **Mobile-first responsive design** validation

## Test Types

### 1. Unit Tests (`__tests__/`)

Test individual functions, components, and hooks in isolation.

```bash
# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

**Key Areas:**
- Financial calculations (`lib/calculations.ts`)
- Authentication hooks (`hooks/useAuth.ts`)
- Utility functions
- Component logic (isolated)

### 2. Component Tests (`__tests__/components/`)

Test React components with user interactions and rendering.

```bash
# Run component tests
npm run test -- --testPathPattern=components
```

**Testing Approach:**
- Render components with realistic props
- Test user interactions (clicks, form submissions)
- Verify accessibility requirements
- Test responsive behavior

### 3. Integration Tests (`__tests__/lib/api/`)

Test API services and data flow between components.

```bash
# Run integration tests
npm run test -- --testPathPattern=api
```

**Key Areas:**
- Authentication service integration
- Supabase client interactions
- Data persistence and retrieval
- Error handling and recovery

### 4. Mobile Responsiveness Tests (`__tests__/mobile/`)

Validate mobile-first design and touch interactions.

```bash
# Run mobile tests
npm run test -- --testPathPattern=mobile
```

**Testing Focus:**
- Viewport breakpoints (320px, 768px, 1024px+)
- Touch-friendly elements (min 44px)
- Mobile-specific layouts
- Performance on mobile devices

### 5. End-to-End Tests (`e2e/`)

Test complete user workflows using Playwright.

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run mobile E2E tests
npx playwright test --grep="Mobile"
```

**Critical User Flows:**
- User registration and authentication
- Dashboard data loading and display
- Portfolio performance calculations
- Mobile navigation and interactions

## Test Structure

### File Organization

```
income-clarity-app/
├── __tests__/
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginForm.test.tsx
│   │   └── dashboard/
│   │       └── SPYComparison.test.tsx
│   ├── hooks/
│   │   └── useAuth.test.ts
│   ├── lib/
│   │   ├── api/
│   │   │   └── auth.service.test.ts
│   │   └── calculations.test.ts
│   ├── mobile/
│   │   └── responsiveness.test.tsx
│   └── utils/
│       └── test-utils.tsx
├── e2e/
│   ├── auth.spec.ts
│   └── dashboard.spec.ts
├── jest.config.js
├── jest.setup.js
└── playwright.config.ts
```

### Naming Conventions

- **Unit tests**: `*.test.ts/tsx`
- **E2E tests**: `*.spec.ts`
- **Test utilities**: `test-utils.tsx`
- **Mock files**: `__mocks__/`

## Running Tests

### Local Development

```bash
# Install dependencies
npm install

# Run all unit/integration tests
npm run test

# Run with coverage report
npm run test:coverage

# Run E2E tests (requires dev server)
npm run dev  # In one terminal
npm run test:e2e  # In another terminal

# Run specific test file
npm run test LoginForm.test.tsx

# Run tests matching pattern
npm run test -- --testNamePattern="should handle login"
```

### Test Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --watchAll=false",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:all": "npm test -- --watchAll=false && npm run test:e2e",
    "test:quick": "npm test -- --watchAll=false && npm run test:e2e -- --reporter=dot",
    "prebuild": "npm run test:all",
    "ci": "npm run lint && npm run test:all && npm run build"
  }
}
```

#### New Combined Test Scripts (TEST-001 Implementation)

These scripts were added to prevent runtime errors like React Error #418 from reaching users:

- **`test:all`**: Runs both unit tests and E2E tests sequentially. Tests must pass before proceeding to the next step.
- **`test:quick`**: Fast version for development - runs unit tests and E2E tests with minimal output (dot reporter).
- **`prebuild`**: Automatically runs `test:all` before every build. **Build will fail if tests fail**.
- **`ci`**: Complete CI pipeline that runs linting, all tests, and build in sequence. Any failure stops the pipeline.

**Usage Examples:**

```bash
# Run all tests (unit + E2E)
npm run test:all

# Quick test run for development
npm run test:quick

# Build with automatic testing (prebuild hook)
npm run build  # This will run test:all first

# Complete CI pipeline
npm run ci  # lint -> test:all -> build
```

**Important**: The `prebuild` hook ensures that **no code can be built if tests are failing**. This prevents deployment of broken code and catches issues like React Error #418 before they reach users.

## Writing Tests

### Unit Test Example

```typescript
import { calculateIncomeClarityStats } from '@/lib/calculations'
import { createMockPortfolio, createMockUserWithLocation } from '@/tests/utils/test-utils'

describe('calculateIncomeClarityStats', () => {
  it('should calculate net income after taxes correctly', () => {
    const portfolio = createMockPortfolio({ monthlyGrossIncome: 1000 })
    const user = createMockUserWithLocation()
    
    const result = calculateIncomeClarityStats(portfolio, user)
    
    expect(result.grossMonthly).toBe(1000)
    expect(result.netMonthly).toBeLessThan(1000) // After taxes
    expect(result.taxOwed).toBeGreaterThan(0)
  })
})
```

### Component Test Example

```typescript
import { render, screen, fireEvent } from '@/tests/utils/test-utils'
import { LoginForm } from '@/components/auth/LoginForm'

describe('LoginForm', () => {
  it('should handle form submission', async () => {
    const mockSignIn = jest.fn().mockResolvedValue({ success: true })
    
    render(<LoginForm />, {
      authValue: { signIn: mockSignIn }
    })
    
    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test'

test('should complete authentication flow', async ({ page }) => {
  await page.goto('/auth/login')
  
  await page.getByLabel('Email address').fill('test@example.com')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: /sign in/i }).click()
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.getByText('Portfolio Performance')).toBeVisible()
})
```

## Testing Guidelines

### 1. Test Behavior, Not Implementation

**Good:**
```typescript
it('should display success message after form submission', async () => {
  // Test what the user sees/experiences
})
```

**Bad:**
```typescript
it('should call setState with correct parameters', () => {
  // Testing implementation details
})
```

### 2. Use Descriptive Test Names

```typescript
// Good
it('should redirect to dashboard after successful login')
it('should show error message when login fails with invalid credentials')
it('should disable submit button when form is incomplete')

// Bad  
it('should work')
it('should test login')
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should calculate tax correctly for qualified dividends', () => {
  // Arrange
  const portfolio = createMockPortfolio({ monthlyIncome: 1000 })
  const user = createMockUser({ taxRates: { qualified: 0.15 } })
  
  // Act
  const result = calculateTax(portfolio, user)
  
  // Assert
  expect(result.taxOwed).toBe(150)
})
```

### 4. Test Edge Cases

```typescript
describe('calculateIncomeClarityStats edge cases', () => {
  it('should handle zero income gracefully', () => {
    const result = calculateIncomeClarityStats(zeroIncomePortfolio, user)
    expect(result.aboveZeroLine).toBe(false)
  })
  
  it('should handle extremely high income', () => {
    const result = calculateIncomeClarityStats(millionDollarPortfolio, user)
    // Should not crash or return NaN
    expect(result.netMonthly).toBeGreaterThan(0)
  })
})
```

### 5. Mock External Dependencies

```typescript
// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  createClientComponentClient: () => mockSupabaseClient
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush })
}))
```

### 6. Test Accessibility

```typescript
it('should be accessible', async () => {
  render(<LoginForm />)
  
  // Check for proper labels
  expect(screen.getByLabelText('Email address')).toBeInTheDocument()
  expect(screen.getByLabelText('Password')).toBeInTheDocument()
  
  // Check focus management
  await user.tab()
  expect(screen.getByLabelText('Email address')).toHaveFocus()
})
```

### 7. Test Mobile Responsiveness

```typescript
it('should be responsive on mobile', async () => {
  // Mock mobile viewport
  mockMatchMedia(375)
  
  render(<Dashboard />)
  
  // Check mobile-specific elements
  expect(screen.getByTestId('mobile-nav')).toBeVisible()
  expect(screen.getByTestId('hamburger-menu')).toBeVisible()
})
```

## CI/CD Integration

### GitHub Actions Workflow

Our CI/CD pipeline runs:

1. **Linting and Type Checking**
2. **Unit and Integration Tests** (with coverage)
3. **Build Verification**
4. **E2E Tests** (Chrome, Firefox, Safari)
5. **Mobile Tests** (Pixel 5, iPhone 12)
6. **Security Audit**
7. **Performance Tests** (Lighthouse CI)
8. **Accessibility Tests**

### Coverage Reports

- Uploaded to Codecov
- 80% minimum threshold enforced
- Branch protection requires passing tests

### Performance Budgets

- **Largest Contentful Paint**: < 2.5s
- **First Contentful Paint**: < 1.8s
- **Cumulative Layout Shift**: < 0.1
- **Total Blocking Time**: < 300ms

## Coverage Requirements

### Minimum Coverage Thresholds

```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

### Priority Areas for Testing

1. **Financial Calculations** (100% coverage required)
2. **Authentication Logic** (95% coverage required)
3. **Data Persistence** (90% coverage required)
4. **User Interface Components** (80% coverage required)

### Coverage Exclusions

- Type definition files (`*.d.ts`)
- Configuration files
- Test utilities
- Mock files

## Best Practices

### 1. Keep Tests Simple and Focused

- One assertion per test when possible
- Test one behavior at a time
- Use descriptive test names

### 2. Make Tests Independent

- Each test should run in isolation
- No shared state between tests
- Clean up after each test

### 3. Use Realistic Test Data

- Use factories for creating test data
- Mirror production data structures
- Include edge cases in test data

### 4. Performance Considerations

- Mock heavy dependencies
- Use shallow rendering when appropriate
- Clean up resources (timers, subscriptions)

### 5. Maintainability

- Keep tests close to the code they test
- Update tests when requirements change
- Refactor test code like production code

## Debugging Tests

### Jest Debugging

```bash
# Run specific test with debug info
npm run test -- --verbose LoginForm.test.tsx

# Debug with Node.js debugger
node --inspect-brk node_modules/.bin/jest --runInBand LoginForm.test.tsx
```

### Playwright Debugging

```bash
# Run with headed browser
npx playwright test --headed

# Use Playwright Inspector
npx playwright test --debug

# Generate test code
npx playwright codegen localhost:3000
```

### Common Issues

1. **Async/Await Issues**: Use `waitFor` for async operations
2. **Mock Issues**: Ensure mocks are properly reset between tests
3. **DOM Cleanup**: Use cleanup utilities to prevent memory leaks
4. **Timing Issues**: Use proper waiting strategies instead of arbitrary timeouts

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Accessibility Testing Guide](https://web.dev/accessibility-testing/)
- [Performance Testing](https://web.dev/performance-testing/)

---

For questions or contributions to this testing guide, please refer to the project's contribution guidelines.