export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          target_monthly_income: number | null
          current_age: number | null
          retirement_goal: number | null
          tax_filing_status: 'single' | 'married_filing_jointly' | 'married_filing_separately' | 'head_of_household' | null
          state_of_residence: string | null
          theme_preference: string
          haptic_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          target_monthly_income?: number | null
          current_age?: number | null
          retirement_goal?: number | null
          tax_filing_status?: 'single' | 'married_filing_jointly' | 'married_filing_separately' | 'head_of_household' | null
          state_of_residence?: string | null
          theme_preference?: string
          haptic_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          target_monthly_income?: number | null
          current_age?: number | null
          retirement_goal?: number | null
          tax_filing_status?: 'single' | 'married_filing_jointly' | 'married_filing_separately' | 'head_of_household' | null
          state_of_residence?: string | null
          theme_preference?: string
          haptic_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          date_of_birth: string | null
          risk_tolerance: 'conservative' | 'moderate' | 'aggressive' | null
          financial_goals: Json | null
          created_at: string
          updated_at: string
          last_login: string | null
          subscription_tier: 'free' | 'premium' | 'enterprise'
          subscription_expires_at: string | null
          preferences: Json | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          risk_tolerance?: 'conservative' | 'moderate' | 'aggressive' | null
          financial_goals?: Json | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          subscription_expires_at?: string | null
          preferences?: Json | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          date_of_birth?: string | null
          risk_tolerance?: 'conservative' | 'moderate' | 'aggressive' | null
          financial_goals?: Json | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          subscription_expires_at?: string | null
          preferences?: Json | null
        }
        Relationships: []
      }
      portfolios: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          portfolio_type: 'investment' | 'retirement' | 'emergency' | 'savings'
          total_value: number
          target_allocation: Json | null
          rebalance_threshold: number
          is_primary: boolean
          created_at: string
          updated_at: string
          last_rebalanced: string | null
          performance_benchmark: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          portfolio_type: 'investment' | 'retirement' | 'emergency' | 'savings'
          total_value?: number
          target_allocation?: Json | null
          rebalance_threshold?: number
          is_primary?: boolean
          created_at?: string
          updated_at?: string
          last_rebalanced?: string | null
          performance_benchmark?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          portfolio_type?: 'investment' | 'retirement' | 'emergency' | 'savings'
          total_value?: number
          target_allocation?: Json | null
          rebalance_threshold?: number
          is_primary?: boolean
          created_at?: string
          updated_at?: string
          last_rebalanced?: string | null
          performance_benchmark?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      holdings: {
        Row: {
          id: string
          portfolio_id: string
          symbol: string
          name: string
          asset_type: 'stock' | 'etf' | 'bond' | 'crypto' | 'commodity' | 'cash'
          quantity: number
          average_cost: number
          current_price: number
          current_value: number
          allocation_percentage: number
          target_percentage: number | null
          sector: string | null
          expense_ratio: number | null
          dividend_yield: number | null
          last_updated: string
          created_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          portfolio_id: string
          symbol: string
          name: string
          asset_type: 'stock' | 'etf' | 'bond' | 'crypto' | 'commodity' | 'cash'
          quantity: number
          average_cost: number
          current_price: number
          current_value: number
          allocation_percentage: number
          target_percentage?: number | null
          sector?: string | null
          expense_ratio?: number | null
          dividend_yield?: number | null
          last_updated?: string
          created_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          portfolio_id?: string
          symbol?: string
          name?: string
          asset_type?: 'stock' | 'etf' | 'bond' | 'crypto' | 'commodity' | 'cash'
          quantity?: number
          average_cost?: number
          current_price?: number
          current_value?: number
          allocation_percentage?: number
          target_percentage?: number | null
          sector?: string | null
          expense_ratio?: number | null
          dividend_yield?: number | null
          last_updated?: string
          created_at?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "holdings_portfolio_id_fkey"
            columns: ["portfolio_id"]
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          portfolio_id: string
          holding_id: string | null
          transaction_type: 'buy' | 'sell' | 'dividend' | 'split' | 'deposit' | 'withdrawal'
          symbol: string | null
          quantity: number | null
          price: number | null
          amount: number
          fees: number
          transaction_date: string
          created_at: string
          notes: string | null
          source: string | null
        }
        Insert: {
          id?: string
          portfolio_id: string
          holding_id?: string | null
          transaction_type: 'buy' | 'sell' | 'dividend' | 'split' | 'deposit' | 'withdrawal'
          symbol?: string | null
          quantity?: number | null
          price?: number | null
          amount: number
          fees?: number
          transaction_date: string
          created_at?: string
          notes?: string | null
          source?: string | null
        }
        Update: {
          id?: string
          portfolio_id?: string
          holding_id?: string | null
          transaction_type?: 'buy' | 'sell' | 'dividend' | 'split' | 'deposit' | 'withdrawal'
          symbol?: string | null
          quantity?: number | null
          price?: number | null
          amount?: number
          fees?: number
          transaction_date?: string
          created_at?: string
          notes?: string | null
          source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_portfolio_id_fkey"
            columns: ["portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_holding_id_fkey"
            columns: ["holding_id"]
            isOneToOne: false
            referencedRelation: "holdings"
            referencedColumns: ["id"]
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category: string
          subcategory: string | null
          amount: number
          description: string | null
          expense_date: string
          is_recurring: boolean
          recurring_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null
          tags: string[] | null
          created_at: string
          updated_at: string
          budget_id: string | null
          is_essential: boolean
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          subcategory?: string | null
          amount: number
          description?: string | null
          expense_date: string
          is_recurring?: boolean
          recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          budget_id?: string | null
          is_essential?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          subcategory?: string | null
          amount?: number
          description?: string | null
          expense_date?: string
          is_recurring?: boolean
          recurring_frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
          budget_id?: string | null
          is_essential?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          }
        ]
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          name: string
          category: string
          monthly_limit: number
          current_spent: number
          alert_threshold: number
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          category: string
          monthly_limit: number
          current_spent?: number
          alert_threshold?: number
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          category?: string
          monthly_limit?: number
          current_spent?: number
          alert_threshold?: number
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      financial_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          goal_type: 'retirement' | 'emergency_fund' | 'home_purchase' | 'vacation' | 'education' | 'other'
          target_amount: number
          current_amount: number
          target_date: string | null
          priority: 'low' | 'medium' | 'high'
          is_achieved: boolean
          created_at: string
          updated_at: string
          linked_portfolio_id: string | null
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          goal_type: 'retirement' | 'emergency_fund' | 'home_purchase' | 'vacation' | 'education' | 'other'
          target_amount: number
          current_amount?: number
          target_date?: string | null
          priority?: 'low' | 'medium' | 'high'
          is_achieved?: boolean
          created_at?: string
          updated_at?: string
          linked_portfolio_id?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          goal_type?: 'retirement' | 'emergency_fund' | 'home_purchase' | 'vacation' | 'education' | 'other'
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          priority?: 'low' | 'medium' | 'high'
          is_achieved?: boolean
          created_at?: string
          updated_at?: string
          linked_portfolio_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "financial_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_goals_linked_portfolio_id_fkey"
            columns: ["linked_portfolio_id"]
            isOneToOne: false
            referencedRelation: "portfolios"
            referencedColumns: ["id"]
          }
        ]
      }
      user_sessions: {
        Row: {
          id: string
          user_id: string
          session_token: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
          expires_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          user_id: string
          session_token: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          expires_at: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          session_token?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          expires_at?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      portfolio_performance: {
        Row: {
          portfolio_id: string | null
          user_id: string | null
          portfolio_name: string | null
          total_value: number | null
          total_cost: number | null
          total_gain_loss: number | null
          total_gain_loss_percentage: number | null
          last_updated: string | null
        }
        Relationships: []
      }
      user_financial_summary: {
        Row: {
          user_id: string | null
          total_portfolio_value: number | null
          total_monthly_expenses: number | null
          emergency_fund_ratio: number | null
          savings_rate: number | null
          risk_score: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_portfolio_performance: {
        Args: {
          portfolio_id: string
          start_date?: string
          end_date?: string
        }
        Returns: {
          total_return: number
          annualized_return: number
          volatility: number
          sharpe_ratio: number
        }[]
      }
      rebalance_portfolio: {
        Args: {
          portfolio_id: string
          dry_run?: boolean
        }
        Returns: {
          symbol: string
          current_allocation: number
          target_allocation: number
          action: string
          shares_to_trade: number
        }[]
      }
      get_expense_trends: {
        Args: {
          user_id: string
          months_back?: number
        }
        Returns: {
          month: string
          category: string
          total_amount: number
          transaction_count: number
        }[]
      }
    }
    Enums: {
      subscription_tier: 'free' | 'premium' | 'enterprise'
      risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
      portfolio_type: 'investment' | 'retirement' | 'emergency' | 'savings'
      asset_type: 'stock' | 'etf' | 'bond' | 'crypto' | 'commodity' | 'cash'
      transaction_type: 'buy' | 'sell' | 'dividend' | 'split' | 'deposit' | 'withdrawal'
      recurring_frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
      goal_type: 'retirement' | 'emergency_fund' | 'home_purchase' | 'vacation' | 'education' | 'other'
      priority_level: 'low' | 'medium' | 'high'
    }
  }
}

// Type helpers for easier usage
export type User = Database['public']['Tables']['users']['Row']
export type Portfolio = Database['public']['Tables']['portfolios']['Row']
export type Holding = Database['public']['Tables']['holdings']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type Expense = Database['public']['Tables']['expenses']['Row']
export type Budget = Database['public']['Tables']['budgets']['Row']
export type FinancialGoal = Database['public']['Tables']['financial_goals']['Row']
export type UserSession = Database['public']['Tables']['user_sessions']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type PortfolioInsert = Database['public']['Tables']['portfolios']['Insert']
export type HoldingInsert = Database['public']['Tables']['holdings']['Insert']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert']
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert']
export type FinancialGoalInsert = Database['public']['Tables']['financial_goals']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type PortfolioUpdate = Database['public']['Tables']['portfolios']['Update']
export type HoldingUpdate = Database['public']['Tables']['holdings']['Update']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update']
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update']
export type FinancialGoalUpdate = Database['public']['Tables']['financial_goals']['Update']

// Enum types
export type SubscriptionTier = Database['public']['Enums']['subscription_tier']
export type RiskTolerance = Database['public']['Enums']['risk_tolerance']
export type PortfolioType = Database['public']['Enums']['portfolio_type']
export type AssetType = Database['public']['Enums']['asset_type']
export type TransactionType = Database['public']['Enums']['transaction_type']
export type RecurringFrequency = Database['public']['Enums']['recurring_frequency']
export type GoalType = Database['public']['Enums']['goal_type']
export type PriorityLevel = Database['public']['Enums']['priority_level']

// View types
export type PortfolioPerformance = Database['public']['Views']['portfolio_performance']['Row']
export type UserFinancialSummary = Database['public']['Views']['user_financial_summary']['Row']

// Function return types
export type PortfolioPerformanceMetrics = Database['public']['Functions']['calculate_portfolio_performance']['Returns'][0]
export type RebalanceRecommendation = Database['public']['Functions']['rebalance_portfolio']['Returns'][0]
export type ExpenseTrend = Database['public']['Functions']['get_expense_trends']['Returns'][0]