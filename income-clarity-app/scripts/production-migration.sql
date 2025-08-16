-- Production Database Migration Script
-- Income Clarity Application
-- Run this script to set up production database schema

BEGIN;

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- ============================================================================
-- USERS AND PROFILES
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE,
  full_name text,
  avatar_url text,
  risk_tolerance text CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive')),
  investment_experience text CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced')),
  tax_location text DEFAULT 'US',
  timezone text DEFAULT 'America/New_York',
  preferred_currency text DEFAULT 'USD',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- PORTFOLIOS
-- ============================================================================

CREATE TABLE IF NOT EXISTS portfolios (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  total_value numeric(12, 2) DEFAULT 0,
  total_annual_income numeric(10, 2) DEFAULT 0,
  yield_percentage numeric(5, 3) DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- HOLDINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS holdings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  portfolio_id uuid REFERENCES portfolios(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  shares numeric(12, 4) NOT NULL,
  cost_basis numeric(10, 4) NOT NULL,
  current_price numeric(10, 4),
  annual_dividend numeric(8, 4) DEFAULT 0,
  dividend_frequency text CHECK (dividend_frequency IN ('monthly', 'quarterly', 'semi-annually', 'annually', 'irregular')) DEFAULT 'quarterly',
  ex_dividend_date date,
  payment_date date,
  sector text,
  industry text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(portfolio_id, symbol)
);

-- ============================================================================
-- EXPENSES
-- ============================================================================

CREATE TABLE IF NOT EXISTS expenses (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  amount numeric(10, 2) NOT NULL,
  category text,
  frequency text CHECK (frequency IN ('monthly', 'quarterly', 'semi-annually', 'annually', 'one-time')) DEFAULT 'monthly',
  expense_date date DEFAULT CURRENT_DATE,
  is_essential boolean DEFAULT true,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- DIVIDEND HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS dividend_payments (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  holding_id uuid REFERENCES holdings(id) ON DELETE CASCADE NOT NULL,
  payment_date date NOT NULL,
  amount numeric(10, 4) NOT NULL,
  shares numeric(12, 4) NOT NULL,
  per_share numeric(8, 4) NOT NULL,
  tax_withheld numeric(8, 4) DEFAULT 0,
  currency text DEFAULT 'USD',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(holding_id, payment_date)
);

-- ============================================================================
-- STOCK PRICES CACHE
-- ============================================================================

CREATE TABLE IF NOT EXISTS stock_prices (
  symbol text PRIMARY KEY,
  price numeric(10, 4) NOT NULL,
  change_percent numeric(6, 3),
  volume bigint,
  market_cap bigint,
  pe_ratio numeric(6, 2),
  dividend_yield numeric(5, 3),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- MATERIALIZED VIEWS FOR PERFORMANCE
-- ============================================================================

-- Portfolio performance view
CREATE MATERIALIZED VIEW IF NOT EXISTS portfolio_performance AS
SELECT 
  p.id,
  p.user_id,
  p.name,
  p.total_value,
  p.total_annual_income,
  p.yield_percentage,
  COUNT(h.id) as holdings_count,
  COALESCE(SUM(h.shares * h.current_price), 0) as current_value,
  COALESCE(SUM(h.shares * h.annual_dividend), 0) as projected_annual_income,
  CASE 
    WHEN p.total_value > 0 THEN (COALESCE(SUM(h.shares * h.annual_dividend), 0) / p.total_value) * 100
    ELSE 0 
  END as actual_yield_percentage
FROM portfolios p
LEFT JOIN holdings h ON p.id = h.portfolio_id
GROUP BY p.id, p.user_id, p.name, p.total_value, p.total_annual_income, p.yield_percentage;

CREATE UNIQUE INDEX IF NOT EXISTS portfolio_performance_id_idx ON portfolio_performance (id);

-- Holdings performance view
CREATE MATERIALIZED VIEW IF NOT EXISTS holdings_performance AS
SELECT 
  h.id,
  h.portfolio_id,
  h.symbol,
  h.shares,
  h.cost_basis,
  h.current_price,
  h.annual_dividend,
  (h.shares * h.cost_basis) as total_cost,
  COALESCE((h.shares * h.current_price), 0) as current_value,
  COALESCE((h.shares * h.annual_dividend), 0) as annual_dividend_income,
  CASE 
    WHEN h.cost_basis > 0 THEN 
      ((COALESCE(h.current_price, h.cost_basis) - h.cost_basis) / h.cost_basis) * 100
    ELSE 0 
  END as gain_loss_percent,
  CASE 
    WHEN h.current_price > 0 AND h.annual_dividend > 0 THEN 
      (h.annual_dividend / h.current_price) * 100
    ELSE 0 
  END as current_yield_percent
FROM holdings h;

CREATE UNIQUE INDEX IF NOT EXISTS holdings_performance_id_idx ON holdings_performance (id);
CREATE INDEX IF NOT EXISTS holdings_performance_portfolio_idx ON holdings_performance (portfolio_id);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles (email);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON profiles (created_at);

-- Portfolios indexes
CREATE INDEX IF NOT EXISTS portfolios_user_id_idx ON portfolios (user_id);
CREATE INDEX IF NOT EXISTS portfolios_is_primary_idx ON portfolios (is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS portfolios_created_at_idx ON portfolios (created_at);

-- Holdings indexes
CREATE INDEX IF NOT EXISTS holdings_portfolio_id_idx ON holdings (portfolio_id);
CREATE INDEX IF NOT EXISTS holdings_symbol_idx ON holdings (symbol);
CREATE INDEX IF NOT EXISTS holdings_updated_at_idx ON holdings (updated_at);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS expenses_user_id_idx ON expenses (user_id);
CREATE INDEX IF NOT EXISTS expenses_category_idx ON expenses (category);
CREATE INDEX IF NOT EXISTS expenses_expense_date_idx ON expenses (expense_date);

-- Dividend payments indexes
CREATE INDEX IF NOT EXISTS dividend_payments_holding_id_idx ON dividend_payments (holding_id);
CREATE INDEX IF NOT EXISTS dividend_payments_payment_date_idx ON dividend_payments (payment_date);

-- Stock prices indexes
CREATE INDEX IF NOT EXISTS stock_prices_updated_at_idx ON stock_prices (updated_at);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

-- Update timestamps function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_portfolios_updated_at ON portfolios;
CREATE TRIGGER update_portfolios_updated_at 
  BEFORE UPDATE ON portfolios 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_holdings_updated_at ON holdings;
CREATE TRIGGER update_holdings_updated_at 
  BEFORE UPDATE ON holdings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_expenses_updated_at ON expenses;
CREATE TRIGGER update_expenses_updated_at 
  BEFORE UPDATE ON expenses 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Refresh materialized views function
CREATE OR REPLACE FUNCTION refresh_portfolio_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY portfolio_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY holdings_performance;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- CRON JOBS (if pg_cron is available)
-- ============================================================================

-- Refresh materialized views every 5 minutes
SELECT cron.schedule('refresh-portfolio-views', '*/5 * * * *', 'SELECT refresh_portfolio_views();');

-- Update stock prices cache every 2 hours (during market hours)
SELECT cron.schedule('update-stock-prices', '0 */2 * * MON-FRI', 'SELECT 1;'); -- Placeholder for stock price update

-- Clean old stock price data (older than 7 days)
SELECT cron.schedule('cleanup-old-prices', '0 2 * * *', 
  'DELETE FROM stock_prices WHERE updated_at < NOW() - INTERVAL ''7 days'';'
);

-- ============================================================================
-- RLS POLICIES (Row Level Security)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividend_payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Portfolios policies
CREATE POLICY "Users can view own portfolios" ON portfolios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios" ON portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios" ON portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios" ON portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- Holdings policies
CREATE POLICY "Users can view own holdings" ON holdings
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM portfolios WHERE id = holdings.portfolio_id
    )
  );

CREATE POLICY "Users can insert own holdings" ON holdings
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM portfolios WHERE id = holdings.portfolio_id
    )
  );

CREATE POLICY "Users can update own holdings" ON holdings
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM portfolios WHERE id = holdings.portfolio_id
    )
  );

CREATE POLICY "Users can delete own holdings" ON holdings
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM portfolios WHERE id = holdings.portfolio_id
    )
  );

-- Expenses policies
CREATE POLICY "Users can view own expenses" ON expenses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses" ON expenses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses" ON expenses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses" ON expenses
  FOR DELETE USING (auth.uid() = user_id);

-- Dividend payments policies
CREATE POLICY "Users can view own dividend payments" ON dividend_payments
  FOR SELECT USING (
    auth.uid() IN (
      SELECT p.user_id 
      FROM portfolios p 
      JOIN holdings h ON p.id = h.portfolio_id 
      WHERE h.id = dividend_payments.holding_id
    )
  );

CREATE POLICY "Users can insert own dividend payments" ON dividend_payments
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT p.user_id 
      FROM portfolios p 
      JOIN holdings h ON p.id = h.portfolio_id 
      WHERE h.id = dividend_payments.holding_id
    )
  );

-- Stock prices - read-only for all authenticated users
ALTER TABLE stock_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can view stock prices" ON stock_prices
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert common stock symbols for caching
INSERT INTO stock_prices (symbol, price, updated_at) VALUES
  ('SPY', 400.00, NOW()),
  ('QQQ', 350.00, NOW()),
  ('VTI', 220.00, NOW()),
  ('AAPL', 180.00, NOW()),
  ('MSFT', 350.00, NOW())
ON CONFLICT (symbol) DO NOTHING;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these queries to verify the migration was successful:

-- Check tables exist
-- SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Check indexes exist
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename, indexname;

-- Check materialized views exist
-- SELECT schemaname, matviewname FROM pg_matviews WHERE schemaname = 'public';

-- Check RLS policies exist
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename;

-- Check cron jobs exist (if pg_cron is available)
-- SELECT * FROM cron.job;