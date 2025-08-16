-- Income Clarity Supabase Schema
-- This file contains the complete database schema with RLS policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types/enums
CREATE TYPE subscription_tier AS ENUM ('free', 'premium', 'enterprise');
CREATE TYPE risk_tolerance AS ENUM ('conservative', 'moderate', 'aggressive');
CREATE TYPE portfolio_type AS ENUM ('investment', 'retirement', 'emergency', 'savings');
CREATE TYPE asset_type AS ENUM ('stock', 'etf', 'bond', 'crypto', 'commodity', 'cash');
CREATE TYPE transaction_type AS ENUM ('buy', 'sell', 'dividend', 'split', 'deposit', 'withdrawal');
CREATE TYPE recurring_frequency AS ENUM ('daily', 'weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE goal_type AS ENUM ('retirement', 'emergency_fund', 'home_purchase', 'vacation', 'education', 'other');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  date_of_birth DATE,
  risk_tolerance risk_tolerance,
  financial_goals JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'
);

-- Portfolios table
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  portfolio_type portfolio_type NOT NULL,
  total_value NUMERIC(15,2) DEFAULT 0,
  target_allocation JSONB DEFAULT '{}',
  rebalance_threshold NUMERIC(5,2) DEFAULT 5.0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_rebalanced TIMESTAMPTZ,
  performance_benchmark TEXT DEFAULT 'SPY'
);

-- Holdings table
CREATE TABLE holdings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_type asset_type NOT NULL,
  quantity NUMERIC(15,8) NOT NULL DEFAULT 0,
  average_cost NUMERIC(15,4) NOT NULL DEFAULT 0,
  current_price NUMERIC(15,4) NOT NULL DEFAULT 0,
  current_value NUMERIC(15,2) NOT NULL DEFAULT 0,
  allocation_percentage NUMERIC(5,2) DEFAULT 0,
  target_percentage NUMERIC(5,2),
  sector TEXT,
  expense_ratio NUMERIC(5,4),
  dividend_yield NUMERIC(5,4),
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  holding_id UUID REFERENCES holdings(id) ON DELETE SET NULL,
  transaction_type transaction_type NOT NULL,
  symbol TEXT,
  quantity NUMERIC(15,8),
  price NUMERIC(15,4),
  amount NUMERIC(15,2) NOT NULL,
  fees NUMERIC(15,2) DEFAULT 0,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  source TEXT
);

-- Budgets table
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  monthly_limit NUMERIC(15,2) NOT NULL,
  current_spent NUMERIC(15,2) DEFAULT 0,
  alert_threshold NUMERIC(5,2) DEFAULT 80.0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  subcategory TEXT,
  amount NUMERIC(15,2) NOT NULL,
  description TEXT,
  expense_date DATE NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_frequency recurring_frequency,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
  is_essential BOOLEAN DEFAULT FALSE
);

-- Financial Goals table
CREATE TABLE financial_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  goal_type goal_type NOT NULL,
  target_amount NUMERIC(15,2) NOT NULL,
  current_amount NUMERIC(15,2) DEFAULT 0,
  target_date DATE,
  priority priority_level DEFAULT 'medium',
  is_achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  linked_portfolio_id UUID REFERENCES portfolios(id) ON DELETE SET NULL
);

-- User Sessions table (for security monitoring)
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for performance
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX idx_holdings_symbol ON holdings(symbol);
CREATE INDEX idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_category ON expenses(category);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);

-- Composite indexes
CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX idx_transactions_portfolio_date ON transactions(portfolio_id, transaction_date);
CREATE INDEX idx_holdings_portfolio_symbol ON holdings(portfolio_id, symbol);

-- Updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_financial_goals_updated_at BEFORE UPDATE ON financial_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for analytics
CREATE VIEW portfolio_performance AS
SELECT 
  p.id as portfolio_id,
  p.user_id,
  p.name as portfolio_name,
  p.total_value,
  SUM(h.quantity * h.average_cost) as total_cost,
  p.total_value - SUM(h.quantity * h.average_cost) as total_gain_loss,
  CASE 
    WHEN SUM(h.quantity * h.average_cost) > 0 
    THEN ((p.total_value - SUM(h.quantity * h.average_cost)) / SUM(h.quantity * h.average_cost)) * 100
    ELSE 0
  END as total_gain_loss_percentage,
  MAX(h.last_updated) as last_updated
FROM portfolios p
LEFT JOIN holdings h ON p.id = h.portfolio_id
GROUP BY p.id, p.user_id, p.name, p.total_value;

CREATE VIEW user_financial_summary AS
SELECT 
  u.id as user_id,
  COALESCE(SUM(p.total_value), 0) as total_portfolio_value,
  COALESCE(monthly_expenses.total, 0) as total_monthly_expenses,
  CASE 
    WHEN emergency_fund.value > 0 AND monthly_expenses.total > 0
    THEN emergency_fund.value / monthly_expenses.total
    ELSE 0
  END as emergency_fund_ratio,
  CASE 
    WHEN income.monthly_income > 0 AND monthly_expenses.total > 0
    THEN ((income.monthly_income - monthly_expenses.total) / income.monthly_income) * 100
    ELSE 0
  END as savings_rate,
  CASE u.risk_tolerance
    WHEN 'conservative' THEN 25
    WHEN 'moderate' THEN 50  
    WHEN 'aggressive' THEN 75
    ELSE 50
  END as risk_score
FROM users u
LEFT JOIN portfolios p ON u.id = p.user_id
LEFT JOIN (
  SELECT 
    user_id, 
    total_value as value
  FROM portfolios 
  WHERE portfolio_type = 'emergency'
) emergency_fund ON u.id = emergency_fund.user_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(amount) as total
  FROM expenses 
  WHERE expense_date >= date_trunc('month', CURRENT_DATE)
    AND expense_date < date_trunc('month', CURRENT_DATE) + interval '1 month'
  GROUP BY user_id
) monthly_expenses ON u.id = monthly_expenses.user_id
LEFT JOIN (
  SELECT 
    u2.id as user_id,
    COALESCE((u2.preferences->>'monthly_income')::numeric, 0) as monthly_income
  FROM users u2
) income ON u.id = income.user_id
GROUP BY u.id, monthly_expenses.total, emergency_fund.value, income.monthly_income, u.risk_tolerance;

-- Functions for complex calculations
CREATE OR REPLACE FUNCTION calculate_portfolio_performance(
  portfolio_id UUID,
  start_date DATE DEFAULT NULL,
  end_date DATE DEFAULT NULL
)
RETURNS TABLE(
  total_return NUMERIC,
  annualized_return NUMERIC,
  volatility NUMERIC,
  sharpe_ratio NUMERIC
) AS $$
DECLARE
  start_value NUMERIC;
  end_value NUMERIC;
  days_diff INTEGER;
BEGIN
  -- Get portfolio value at start date (or earliest transaction date)
  SELECT COALESCE(SUM(amount), 0) INTO start_value
  FROM transactions t
  WHERE t.portfolio_id = $1
    AND t.transaction_date <= COALESCE(start_date, '1900-01-01');
  
  -- Get current portfolio value
  SELECT total_value INTO end_value
  FROM portfolios p
  WHERE p.id = $1;
  
  -- Calculate days difference
  days_diff := EXTRACT(days FROM (COALESCE(end_date, CURRENT_DATE) - COALESCE(start_date, '1900-01-01')));
  
  -- Calculate returns (simplified version)
  total_return := CASE 
    WHEN start_value > 0 THEN ((end_value - start_value) / start_value) * 100
    ELSE 0 
  END;
  
  annualized_return := CASE 
    WHEN days_diff > 0 AND start_value > 0 
    THEN (POWER((end_value / start_value), (365.0 / days_diff)) - 1) * 100
    ELSE 0 
  END;
  
  -- Simplified volatility and Sharpe ratio calculations
  volatility := 15.0; -- Placeholder - would need daily returns for real calculation
  sharpe_ratio := CASE 
    WHEN volatility > 0 THEN (annualized_return - 2.0) / volatility
    ELSE 0 
  END;
  
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION rebalance_portfolio(
  portfolio_id UUID,
  dry_run BOOLEAN DEFAULT TRUE
)
RETURNS TABLE(
  symbol TEXT,
  current_allocation NUMERIC,
  target_allocation NUMERIC,
  action TEXT,
  shares_to_trade NUMERIC
) AS $$
DECLARE
  holding_record RECORD;
  portfolio_total NUMERIC;
  target_value NUMERIC;
  current_value NUMERIC;
  difference NUMERIC;
BEGIN
  -- Get portfolio total value
  SELECT total_value INTO portfolio_total
  FROM portfolios WHERE id = $1;
  
  -- Iterate through holdings
  FOR holding_record IN 
    SELECT h.*, p.target_allocation
    FROM holdings h
    JOIN portfolios p ON h.portfolio_id = p.id
    WHERE h.portfolio_id = $1
  LOOP
    current_allocation := holding_record.allocation_percentage;
    target_allocation := COALESCE(
      (holding_record.target_allocation->>holding_record.symbol)::NUMERIC, 
      0
    );
    
    IF target_allocation > 0 THEN
      target_value := portfolio_total * (target_allocation / 100);
      current_value := holding_record.current_value;
      difference := target_value - current_value;
      
      symbol := holding_record.symbol;
      
      IF ABS(difference) > (portfolio_total * 0.01) THEN -- 1% threshold
        IF difference > 0 THEN
          action := 'BUY';
          shares_to_trade := difference / holding_record.current_price;
        ELSE
          action := 'SELL';
          shares_to_trade := ABS(difference) / holding_record.current_price;
        END IF;
        
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_expense_trends(
  user_id UUID,
  months_back INTEGER DEFAULT 12
)
RETURNS TABLE(
  month TEXT,
  category TEXT,
  total_amount NUMERIC,
  transaction_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(expense_date, 'YYYY-MM') as month,
    e.category,
    SUM(e.amount) as total_amount,
    COUNT(*) as transaction_count
  FROM expenses e
  WHERE e.user_id = $1
    AND e.expense_date >= CURRENT_DATE - INTERVAL '1 month' * months_back
  GROUP BY TO_CHAR(expense_date, 'YYYY-MM'), e.category
  ORDER BY month DESC, total_amount DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Portfolios policies
CREATE POLICY "Users can view own portfolios" ON portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own portfolios" ON portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios" ON portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios" ON portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Holdings policies
CREATE POLICY "Users can view holdings in own portfolios" ON holdings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolios p 
      WHERE p.id = holdings.portfolio_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create holdings in own portfolios" ON holdings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios p 
      WHERE p.id = holdings.portfolio_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update holdings in own portfolios" ON holdings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM portfolios p 
      WHERE p.id = holdings.portfolio_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete holdings in own portfolios" ON holdings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM portfolios p 
      WHERE p.id = holdings.portfolio_id 
      AND p.user_id = auth.uid()
    )
  );

-- Transactions policies
CREATE POLICY "Users can view transactions in own portfolios" ON transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM portfolios p 
      WHERE p.id = transactions.portfolio_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create transactions in own portfolios" ON transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios p 
      WHERE p.id = transactions.portfolio_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update transactions in own portfolios" ON transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM portfolios p 
      WHERE p.id = transactions.portfolio_id 
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete transactions in own portfolios" ON transactions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM portfolios p 
      WHERE p.id = transactions.portfolio_id 
      AND p.user_id = auth.uid()
    )
  );

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Budgets policies
CREATE POLICY "Users can view own budgets" ON budgets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budgets" ON budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Financial goals policies
CREATE POLICY "Users can view own financial goals" ON financial_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own financial goals" ON financial_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial goals" ON financial_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial goals" ON financial_goals
  FOR DELETE USING (auth.uid() = user_id);

-- User sessions policies
CREATE POLICY "Users can view own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions" ON user_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions" ON user_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Constraints for data integrity
ALTER TABLE portfolios ADD CONSTRAINT portfolios_total_value_positive 
  CHECK (total_value >= 0);

ALTER TABLE holdings ADD CONSTRAINT holdings_quantity_positive 
  CHECK (quantity >= 0);

ALTER TABLE holdings ADD CONSTRAINT holdings_current_value_positive 
  CHECK (current_value >= 0);

ALTER TABLE expenses ADD CONSTRAINT expenses_amount_positive 
  CHECK (amount >= 0);

ALTER TABLE budgets ADD CONSTRAINT budgets_monthly_limit_positive 
  CHECK (monthly_limit >= 0);

ALTER TABLE budgets ADD CONSTRAINT budgets_current_spent_non_negative 
  CHECK (current_spent >= 0);

ALTER TABLE financial_goals ADD CONSTRAINT financial_goals_target_amount_positive 
  CHECK (target_amount > 0);

ALTER TABLE financial_goals ADD CONSTRAINT financial_goals_current_amount_non_negative 
  CHECK (current_amount >= 0);

-- Additional security: Ensure only one primary portfolio per user
CREATE UNIQUE INDEX idx_users_primary_portfolio 
  ON portfolios(user_id) 
  WHERE is_primary = true;

-- Additional security: Prevent negative balances in critical tables
CREATE OR REPLACE FUNCTION prevent_negative_portfolio_value()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_value < 0 THEN
    RAISE EXCEPTION 'Portfolio total value cannot be negative';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_portfolio_value_non_negative 
  BEFORE INSERT OR UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION prevent_negative_portfolio_value();

-- Function to handle user creation from auth trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on auth signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();