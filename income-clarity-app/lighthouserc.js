module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000', 'http://localhost:3000/auth/login', 'http://localhost:3000/dashboard'],
      startServerCommand: 'npm run build && npm run start',
      startServerReadyPattern: 'Ready on',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        // Custom assertions for financial app requirements
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        // Security checks
        'uses-https': 'error',
        'is-on-https': 'error',
        // Mobile-specific checks
        'viewport': 'error',
        'content-width': 'error',
        // Accessibility checks
        'color-contrast': 'error',
        'button-name': 'error',
        'link-name': 'error',
        'label': 'error',
        'aria-allowed-attr': 'error',
        'aria-required-attr': 'error',
        'aria-valid-attr-value': 'error',
        'aria-valid-attr': 'error',
        'duplicate-id-aria': 'error',
        'heading-order': 'error',
        'image-alt': 'error',
        'input-image-alt': 'error',
        'meta-viewport': 'error',
        'tabindex': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}