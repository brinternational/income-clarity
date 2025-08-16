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
  dashboard: '/super-cards',
  superCards: '/super-cards',
  
  // Individual Super Cards
  performanceHub: '/super-cards?card=performance',
  incomeHub: '/super-cards?card=income',
  taxHub: '/super-cards?card=tax',
  portfolioHub: '/super-cards?card=portfolio',
  planningHub: '/super-cards?card=planning',
  
  // Core app pages
  settings: '/settings',
  profile: '/profile',
  onboarding: '/onboarding',
  
  // Demo mode
  demo: '/dashboard/demo',
  
  // Redirect logic based on auth state
  getAuthRedirect: (isAuthenticated: boolean, isLocalMode: boolean) => {
    if (isLocalMode) {
      return '/super-cards'
    }
    return isAuthenticated ? '/super-cards' : '/auth/login'
  },
  
  // Get the appropriate dashboard route
  getDashboardRoute: () => {
    return '/super-cards'
  },

  // Get post-auth redirect route (onboarding for new users, Super Cards for existing)
  getPostAuthRedirect: (isNewUser: boolean = false) => {
    return isNewUser ? '/onboarding' : '/super-cards'
  },
  
  // Map old card routes to new Super Card routes
  mapOldRouteToNew: (oldRoute: string): string => {
    const routeMap: Record<string, string> = {
      '/dashboard': '/super-cards',
      '/dashboard/income': '/super-cards?card=income',
      '/dashboard/expenses': '/super-cards?card=planning',
      '/dashboard/portfolio': '/super-cards?card=portfolio',
      '/dashboard/strategy': '/super-cards?card=tax',
    }
    
    return routeMap[oldRoute] || oldRoute
  }
}

// Helper to check if we're in LOCAL_MODE
export const isLocalMode = () => {
  return process.env.NEXT_PUBLIC_LOCAL_MODE === 'true'
}

// Helper to get navigation items based on auth state
export const getNavigationItems = (isAuthenticated: boolean) => {
  const baseItems = [
    { label: 'Home', href: NAVIGATION_CONFIG.home },
  ]
  
  if (isAuthenticated || isLocalMode()) {
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