import { createClientComponentClient } from '../supabase-client'
import type { 
  Expense, 
  ExpenseInsert, 
  ExpenseUpdate, 
  Budget,
  BudgetInsert,
  BudgetUpdate,
  ExpenseTrend
} from '../database.types'

export class ExpensesService {
  private static instance: ExpensesService
  private supabase: ReturnType<typeof createClientComponentClient>

  constructor() {
    this.supabase = createClientComponentClient()
  }

  static getInstance(): ExpensesService {
    if (!ExpensesService.instance) {
      ExpensesService.instance = new ExpensesService()
    }
    return ExpensesService.instance
  }

  // Expense CRUD operations
  async createExpense(expense: ExpenseInsert) {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .insert(expense)
        .select()
        .single()

      if (error) throw error

      // Update budget current_spent if budget_id is provided
      if (expense.budget_id) {
        await this.updateBudgetSpent(expense.budget_id, expense.amount, 'add')
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getExpenses(
    userId: string, 
    options: {
      startDate?: string
      endDate?: string
      category?: string
      limit?: number
      offset?: number
    } = {}
  ) {
    try {
      let query = this.supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('expense_date', { ascending: false })

      if (options.startDate) {
        query = query.gte('expense_date', options.startDate)
      }

      if (options.endDate) {
        query = query.lte('expense_date', options.endDate)
      }

      if (options.category) {
        query = query.eq('category', options.category)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
      }

      const { data, error } = await query

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getExpense(expenseId: string) {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateExpense(expenseId: string, updates: ExpenseUpdate) {
    try {
      // Get original expense to handle budget updates
      const { data: originalExpense, error: fetchError } = await this.supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .single()

      if (fetchError) throw fetchError

      const { data, error } = await this.supabase
        .from('expenses')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', expenseId)
        .select()
        .single()

      if (error) throw error

      // Handle budget updates
      if (originalExpense.budget_id && updates.amount !== undefined) {
        const amountDifference = updates.amount - originalExpense.amount
        await this.updateBudgetSpent(originalExpense.budget_id, amountDifference, 'add')
      }

      // If budget_id changed, update both old and new budgets
      if (updates.budget_id && updates.budget_id !== originalExpense.budget_id) {
        if (originalExpense.budget_id) {
          await this.updateBudgetSpent(originalExpense.budget_id, originalExpense.amount, 'subtract')
        }
        await this.updateBudgetSpent(updates.budget_id, data.amount, 'add')
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async deleteExpense(expenseId: string) {
    try {
      // Get expense to handle budget updates
      const { data: expense, error: fetchError } = await this.supabase
        .from('expenses')
        .select('*')
        .eq('id', expenseId)
        .single()

      if (fetchError) throw fetchError

      const { data, error } = await this.supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId)
        .select()
        .single()

      if (error) throw error

      // Update budget if expense was associated with one
      if (expense.budget_id) {
        await this.updateBudgetSpent(expense.budget_id, expense.amount, 'subtract')
      }

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Budget CRUD operations
  async createBudget(budget: BudgetInsert) {
    try {
      const { data, error } = await this.supabase
        .from('budgets')
        .insert(budget)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getBudgets(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async updateBudget(budgetId: string, updates: BudgetUpdate) {
    try {
      const { data, error } = await this.supabase
        .from('budgets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', budgetId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async deleteBudget(budgetId: string) {
    try {
      const { data, error } = await this.supabase
        .from('budgets')
        .update({ is_active: false })
        .eq('id', budgetId)
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Expense analytics and insights
  async getExpensesByCategory(
    userId: string, 
    startDate?: string, 
    endDate?: string
  ) {
    try {
      let query = this.supabase
        .from('expenses')
        .select('category, amount')
        .eq('user_id', userId)

      if (startDate) {
        query = query.gte('expense_date', startDate)
      }

      if (endDate) {
        query = query.lte('expense_date', endDate)
      }

      const { data, error } = await query

      if (error) throw error

      // Group by category and sum amounts
      const categoryTotals = data?.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount
        return acc
      }, {} as Record<string, number>) || {}

      return { data: categoryTotals, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getMonthlyExpenseTrends(
    userId: string, 
    monthsBack = 12
  ): Promise<{ data: ExpenseTrend[] | null; error: any }> {
    try {
      const { data, error } = await this.supabase
        .rpc('get_expense_trends', {
          user_id: userId,
          months_back: monthsBack
        })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getRecurringExpenses(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .eq('is_recurring', true)
        .order('amount', { ascending: false })

      if (error) throw error

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getBudgetAlerts(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('budgets')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (error) throw error

      // Filter budgets that are over alert threshold
      const alertBudgets = data?.filter(budget => {
        const spentPercentage = (budget.current_spent / budget.monthly_limit) * 100
        return spentPercentage >= budget.alert_threshold
      }) || []

      return { data: alertBudgets, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Bulk operations
  async importExpenses(expenses: ExpenseInsert[]) {
    try {
      const { data, error } = await this.supabase
        .from('expenses')
        .insert(expenses)
        .select()

      if (error) throw error

      // Update budgets for expenses with budget_id
      const budgetUpdates = new Map<string, number>()
      expenses.forEach(expense => {
        if (expense.budget_id) {
          budgetUpdates.set(
            expense.budget_id,
            (budgetUpdates.get(expense.budget_id) || 0) + expense.amount
          )
        }
      })

      await Promise.all(
        Array.from(budgetUpdates.entries()).map(([budgetId, amount]) =>
          this.updateBudgetSpent(budgetId, amount, 'add')
        )
      )

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async getExpenseInsights(userId: string) {
    try {
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
      const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7) + '-01'

      // Get current month expenses
      const { data: currentExpenses } = await this.getExpenses(userId, {
        startDate: currentMonth
      })

      // Get last month expenses
      const { data: lastMonthExpenses } = await this.getExpenses(userId, {
        startDate: lastMonth,
        endDate: currentMonth
      })

      const currentTotal = currentExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0
      const lastMonthTotal = lastMonthExpenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0

      const monthOverMonthChange = lastMonthTotal > 0 
        ? ((currentTotal - lastMonthTotal) / lastMonthTotal) * 100 
        : 0

      // Get top categories
      const { data: categoryBreakdown } = await this.getExpensesByCategory(userId, currentMonth)

      const topCategories = categoryBreakdown 
        ? Object.entries(categoryBreakdown)
            .sort(([,a], [,b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([category, amount]) => ({ category, amount }))
        : []

      return {
        data: {
          currentMonthTotal: currentTotal,
          lastMonthTotal: lastMonthTotal,
          monthOverMonthChange,
          topCategories,
          totalExpenses: currentExpenses?.length || 0
        },
        error: null
      }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Real-time subscriptions
  subscribeToExpenseChanges(userId: string, callback: (payload: any) => void) {
    const subscription = this.supabase
      .channel(`expenses-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    return subscription
  }

  subscribeToBudgetChanges(userId: string, callback: (payload: any) => void) {
    const subscription = this.supabase
      .channel(`budgets-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'budgets',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe()

    return subscription
  }

  // Private helper methods
  private async updateBudgetSpent(budgetId: string, amount: number, operation: 'add' | 'subtract') {
    try {
      const { data: budget, error: fetchError } = await this.supabase
        .from('budgets')
        .select('current_spent')
        .eq('id', budgetId)
        .single()

      if (fetchError) throw fetchError

      const newAmount = operation === 'add' 
        ? budget.current_spent + amount
        : Math.max(0, budget.current_spent - amount)

      await this.supabase
        .from('budgets')
        .update({ 
          current_spent: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', budgetId)

    } catch (error) {
      // Error handled by emergency recovery script
    }
  }

  // Expense categorization helper
  async suggestCategory(description: string): Promise<string> {
    // Simple rule-based categorization
    // In a real app, you might use ML or external APIs
    const categoryRules = {
      'Food & Dining': ['restaurant', 'food', 'grocery', 'dining', 'coffee', 'lunch', 'dinner'],
      'Transportation': ['gas', 'fuel', 'uber', 'lyft', 'taxi', 'parking', 'car', 'bus', 'train'],
      'Shopping': ['amazon', 'store', 'retail', 'clothing', 'electronics'],
      'Entertainment': ['movie', 'concert', 'game', 'streaming', 'netflix', 'spotify'],
      'Utilities': ['electric', 'water', 'internet', 'phone', 'cable'],
      'Healthcare': ['doctor', 'pharmacy', 'medical', 'health', 'hospital'],
      'Finance': ['bank', 'fee', 'interest', 'loan', 'credit']
    }

    const lowerDescription = description.toLowerCase()
    
    for (const [category, keywords] of Object.entries(categoryRules)) {
      if (keywords.some(keyword => lowerDescription.includes(keyword))) {
        return category
      }
    }

    return 'Other'
  }
}

export const expensesService = ExpensesService.getInstance()