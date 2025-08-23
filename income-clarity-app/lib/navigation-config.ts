// Navigation configuration for Income Clarity
// Maps between the old 18-card system and new 5 Super Card system

export const NAVIGATION_CONFIG = {
  // Main routes
  home: '/',
  landing: '/',
  
  // Auth routes
  login: '/auth/login',
  signup: '/auth/signup',
  
  // Dashboard routes  
  dashboard: '/dashboard/super-cards',
  superCards: '/dashboard/super-cards',
  
  // Individual Super Cards (new dedicated routes)
  performanceHub: '/dashboard/performance',
  incomeHub: '/dashboard/income',
  taxHub: '/dashboard/tax-strategy',
  portfolioHub: '/dashboard/portfolio-strategy',
  planningHub: '/dashboard/financial-planning',
  
  // Core app pages
  settings: '/settings',
  profile: '/profile',
  onboarding: '/onboarding',
  
  // Demo mode
  demo: '/dashboard/demo',
  
  // Redirect logic based on auth state
  getAuthRedirect: (isAuthenticated: boolean) => {
    return isAuthenticated ? '/dashboard/super-cards' : '/auth/login'
  },
  
  // Get the appropriate dashboard route
  getDashboardRoute: () => {
    return '/dashboard/super-cards'
  },

  // Get post-auth redirect route (onboarding for new users, Super Cards for existing)
  getPostAuthRedirect: (isNewUser: boolean = false) => {
    return isNewUser ? '/onboarding' : '/dashboard/super-cards'
  },
  
  // Map old card routes to new Super Card routes
  mapOldRouteToNew: (oldRoute: string): string => {
    const routeMap: Record<string, string> = {
      '/dashboard': '/dashboard/super-cards',
      '/dashboard/income': '/dashboard/income',
      '/dashboard/expenses': '/dashboard/financial-planning',
      '/dashboard/portfolio': '/dashboard/portfolio-strategy',
      '/dashboard/strategy': '/dashboard/tax-strategy',
      '/dashboard/performance': '/dashboard/performance',
      
      // Legacy query parameter routes to new dedicated routes
      '/super-cards?card=performance': '/dashboard/performance',
      '/super-cards?card=income': '/dashboard/income',
      '/super-cards?card=tax': '/dashboard/tax-strategy',
      '/super-cards?card=portfolio': '/dashboard/portfolio-strategy',
      '/super-cards?card=planning': '/dashboard/financial-planning',
      
      // Map old standalone /super-cards to new dashboard route
      '/super-cards': '/dashboard/super-cards',
    }
    
    return routeMap[oldRoute] || oldRoute
  }
}

// Helper to get navigation items based on auth state
export const getNavigationItems = (isAuthenticated: boolean) => {
  const baseItems = [
    { label: 'Home', href: NAVIGATION_CONFIG.home },
  ]
  
  if (isAuthenticated) {
    return [
      ...baseItems,
      { label: 'Dashboard', href: NAVIGATION_CONFIG.dashboard },
      { label: 'Settings', href: NAVIGATION_CONFIG.settings },
      { label: 'Profile', href: NAVIGATION_CONFIG.profile },
    ]
  }
  
  return [
    ...baseItems,
    { label: 'Login', href: NAVIGATION_CONFIG.login },
    { label: 'Sign Up', href: NAVIGATION_CONFIG.signup },
  ]
}

// Export types
export type NavigationItem = {
  label: string
  href: string
  icon?: React.ComponentType
}