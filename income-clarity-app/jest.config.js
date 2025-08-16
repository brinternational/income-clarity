const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.simple.js'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Test environment
  testEnvironment: 'jsdom',
  
  // Module name mapping for absolute imports
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(png|jpg|jpeg|gif|webp|svg|ico)$': '<rootDir>/__mocks__/fileMock.js',
  },
  
  // Transform ignore patterns to handle ES modules
  transformIgnorePatterns: [
    'node_modules/(?!(isows|@supabase|@testing-library|recharts|d3-|internmap)/)',
  ],
  
  // Test file patterns
  testMatch: [
    '<rootDir>/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/**/?(*.)+(spec|test).{js,jsx,ts,tsx}',
  ],

  // Ignore test utility files and Playwright tests
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/utils/',
    '<rootDir>/__tests__/fixtures/',
    '<rootDir>/__tests__/e2e/',
    '<rootDir>/__tests__/page-objects/',
    '<rootDir>/node_modules/',
    '<rootDir>/tests/',
    '<rootDir>/.*\\.e2e\\.test\\..*',
    '<rootDir>/.*\\.spec\\..*',
    '<rootDir>/.*playwright.*',
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'hooks/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
  ],
  
  // Coverage thresholds (80% as per SOP requirements)
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Transform files
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
  
  // Handle ES modules properly
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  
  
  // Test timeout
  testTimeout: 10000,
  
  // Verbose output
  verbose: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)