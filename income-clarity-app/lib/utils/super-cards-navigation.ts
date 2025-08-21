import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

// Super Cards route mapping
export const SUPER_CARDS_ROUTES: Record<string, string> = {
  'performance': '/dashboard/super-cards/performance-hub',
  'income': '/dashboard/super-cards/income-intelligence',
  'tax': '/dashboard/super-cards/tax-strategy',
  'portfolio': '/dashboard/super-cards/portfolio-strategy',
  'planning': '/dashboard/super-cards/financial-planning'
}

export const MAIN_DASHBOARD_ROUTE = '/dashboard/super-cards'

/**
 * Creates a navigation handler for Super Cards individual pages
 * @param router - Next.js router instance
 * @returns Navigation handler function
 */
export function createSuperCardNavigationHandler(router: AppRouterInstance) {
  return (cardId: string | null) => {
    if (cardId === null) {
      // Navigate back to main dashboard
      router.push(MAIN_DASHBOARD_ROUTE)
    } else {
      // Navigate to other card
      const route = SUPER_CARDS_ROUTES[cardId]
      if (route) {
        router.push(route)
      }
    }
  }
}