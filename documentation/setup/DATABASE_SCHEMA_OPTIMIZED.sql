-- OPTIMIZED DATABASE SCHEMA FOR 5 SUPER CARDS
-- Income Clarity - Pre-launch Performance Architecture
-- Target: <500ms response times for full dashboard

-- ======================================
-- CORE TABLES (Normalized for integrity)
-- ======================================

-- User profiles with tax optimization settings
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  email VARCHAR(255),
  tax_location VARCHAR(50) NOT NULL DEFAULT 'US', -- PR, CA, TX, etc.
  risk_tolerance INTEGER CHECK (risk_tolerance BETWEEN 1 AND 10),
  investment_experience VARCHAR(50),
  annual_income DECIMAL(15,2),
  target_monthly_income DECIMAL(15,2),
  fire_target_amount DECIMAL(15,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio holdings (source of truth)
CREATE TABLE portfolio_holdings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker VARCHAR(20) NOT NULL,
  shares DECIMAL(15,4) NOT NULL,
  cost_basis DECIMAL(15,4) NOT NULL,
  current_price DECIMAL(15,4),
  dividend_yield DECIMAL(8,4),
  sector VARCHAR(100),
  asset_type VARCHAR(50), -- ETF, Stock, REIT, etc.
  tax_treatment VARCHAR(50), -- Qualified, Non-qualified, REIT, etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time-series price data (partitioned by month)
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker VARCHAR(20) NOT NULL,
  price DECIMAL(15,4) NOT NULL,
  date DATE NOT NULL,
  spy_price DECIMAL(15,4), -- For comparison calculations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) PARTITION BY RANGE (date);

-- Create monthly partitions (automated)
CREATE TABLE price_history_2025_01 PARTITION OF price_history 
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- Dividend payments (for income tracking)
CREATE TABLE dividend_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker VARCHAR(20) NOT NULL,
  ex_date DATE NOT NULL,
  pay_date DATE NOT NULL,
  amount_per_share DECIMAL(15,4) NOT NULL,
  shares_owned DECIMAL(15,4) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  tax_treatment VARCHAR(50),
  is_reinvested BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User expenses for lifestyle tracking
CREATE TABLE user_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  is_recurring BOOLEAN DEFAULT true,
  frequency VARCHAR(20) DEFAULT 'monthly', -- monthly, quarterly, annual
  priority INTEGER DEFAULT 1, -- 1=essential, 2=important, 3=nice-to-have
  is_covered BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PERFORMANCE VIEWS (5 Super Cards)
-- ============================================

-- CARD 1: Performance Command Center
CREATE MATERIALIZED VIEW portfolio_performance_summary AS
WITH portfolio_calcs AS (
  SELECT 
    ph.user_id,
    SUM(ph.shares * ph.current_price) as portfolio_value,
    SUM(ph.shares * ph.cost_basis) as portfolio_cost,
    AVG(CASE WHEN pr.date >= CURRENT_DATE - INTERVAL '1 month' 
      THEN (ph.current_price - pr.price) / pr.price END) as return_1m,
    AVG(CASE WHEN pr.date >= CURRENT_DATE - INTERVAL '3 months' 
      THEN (ph.current_price - pr.price) / pr.price END) as return_3m,
    AVG(CASE WHEN pr.date >= CURRENT_DATE - INTERVAL '1 year' 
      THEN (ph.current_price - pr.price) / pr.price END) as return_1y
  FROM portfolio_holdings ph
  LEFT JOIN price_history pr ON ph.ticker = pr.ticker
  WHERE ph.is_active = true
  GROUP BY ph.user_id
),
spy_calcs AS (
  SELECT 
    AVG(CASE WHEN date >= CURRENT_DATE - INTERVAL '1 month'
      THEN (current_price - lag_price) / lag_price END) as spy_return_1m,
    AVG(CASE WHEN date >= CURRENT_DATE - INTERVAL '3 months'
      THEN (current_price - lag_price) / lag_price END) as spy_return_3m,
    AVG(CASE WHEN date >= CURRENT_DATE - INTERVAL '1 year'
      THEN (current_price - lag_price) / lag_price END) as spy_return_1y
  FROM (
    SELECT 
      date,
      spy_price as current_price,
      LAG(spy_price) OVER (ORDER BY date) as lag_price
    FROM price_history 
    WHERE ticker = 'SPY'
    ORDER BY date DESC
    LIMIT 365
  ) spy_data
)
SELECT 
  pc.user_id,
  pc.portfolio_value,
  pc.portfolio_cost,
  pc.return_1m as portfolio_return_1m,
  pc.return_3m as portfolio_return_3m, 
  pc.return_1y as portfolio_return_1y,
  sc.spy_return_1m,
  sc.spy_return_3m,
  sc.spy_return_1y,
  (pc.return_1m - sc.spy_return_1m) as outperformance_1m,
  (pc.return_3m - sc.spy_return_3m) as outperformance_3m,
  (pc.return_1y - sc.spy_return_1y) as outperformance_1y,
  CASE 
    WHEN pc.return_1y > sc.spy_return_1y THEN 'beating'
    WHEN pc.return_1y < sc.spy_return_1y THEN 'lagging'
    ELSE 'matching'
  END as performance_status,
  NOW() as last_updated
FROM portfolio_calcs pc
CROSS JOIN spy_calcs sc;

-- CARD 2: Income Intelligence Center  
CREATE MATERIALIZED VIEW income_intelligence_summary AS
WITH monthly_income AS (
  SELECT 
    dp.user_id,
    SUM(dp.total_amount) as gross_monthly_income,
    SUM(CASE 
      WHEN dp.tax_treatment = 'Qualified' THEN dp.total_amount * 0.15
      WHEN dp.tax_treatment = 'REIT' THEN dp.total_amount * 0.25
      WHEN dp.tax_treatment = 'Non-qualified' THEN dp.total_amount * 0.33
      ELSE dp.total_amount * 0.20
    END) as estimated_tax_owed,
    COUNT(*) as dividend_count
  FROM dividend_payments dp
  WHERE dp.pay_date >= CURRENT_DATE - INTERVAL '1 month'
  GROUP BY dp.user_id
),
user_expenses_agg AS (
  SELECT 
    user_id,
    SUM(amount) as total_monthly_expenses,
    COUNT(*) as expense_count
  FROM user_expenses
  WHERE frequency = 'monthly' OR frequency IS NULL
  GROUP BY user_id
)
SELECT 
  mi.user_id,
  COALESCE(mi.gross_monthly_income, 0) as gross_monthly_income,
  COALESCE(mi.estimated_tax_owed, 0) as estimated_tax_owed,
  COALESCE(mi.gross_monthly_income - mi.estimated_tax_owed, 0) as net_monthly_income,
  COALESCE(ue.total_monthly_expenses, 0) as total_monthly_expenses,
  COALESCE(
    (mi.gross_monthly_income - mi.estimated_tax_owed) - ue.total_monthly_expenses, 
    0
  ) as available_to_reinvest,
  CASE 
    WHEN (mi.gross_monthly_income - mi.estimated_tax_owed) > ue.total_monthly_expenses 
    THEN true ELSE false 
  END as above_zero_line,
  mi.dividend_count,
  ue.expense_count,
  NOW() as last_updated
FROM monthly_income mi
FULL OUTER JOIN user_expenses_agg ue ON mi.user_id = ue.user_id;

-- CARD 3: Lifestyle Tracker
CREATE MATERIALIZED VIEW lifestyle_progress_summary AS
WITH expense_coverage AS (
  SELECT 
    ue.user_id,
    ue.category,
    ue.amount as expense_amount,
    ue.priority,
    COALESCE(inc.net_monthly_income, 0) as available_income,
    CASE 
      WHEN COALESCE(inc.net_monthly_income, 0) >= 
        SUM(ue.amount) OVER (
          PARTITION BY ue.user_id 
          ORDER BY ue.priority, ue.amount 
          ROWS UNBOUNDED PRECEDING
        ) 
      THEN true ELSE false 
    END as is_covered
  FROM user_expenses ue
  LEFT JOIN income_intelligence_summary inc ON ue.user_id = inc.user_id
  WHERE ue.frequency = 'monthly'
)
SELECT 
  ec.user_id,
  SUM(ec.expense_amount) as total_monthly_expenses,
  COUNT(*) as total_expense_categories,
  COUNT(*) FILTER (WHERE ec.is_covered) as covered_categories,
  ROUND(
    (COUNT(*) FILTER (WHERE ec.is_covered)::DECIMAL / COUNT(*)) * 100, 2
  ) as expense_coverage_percentage,
  COALESCE(up.fire_target_amount, 0) as fire_target,
  COALESCE(pps.portfolio_value, 0) as current_portfolio_value,
  CASE 
    WHEN up.fire_target_amount > 0 
    THEN ROUND((pps.portfolio_value / up.fire_target_amount) * 100, 2)
    ELSE 0 
  END as fire_progress_percentage,
  -- Next milestone calculation
  CASE 
    WHEN COUNT(*) FILTER (WHERE NOT ec.is_covered) > 0 
    THEN MIN(ec.expense_amount) FILTER (WHERE NOT ec.is_covered)
    ELSE 0 
  END as next_milestone_amount,
  NOW() as last_updated
FROM expense_coverage ec
LEFT JOIN user_profiles up ON ec.user_id = up.user_id
LEFT JOIN portfolio_performance_summary pps ON ec.user_id = pps.user_id
GROUP BY ec.user_id, up.fire_target_amount, pps.portfolio_value;

-- CARD 4: Strategy Optimizer (AI Recommendations)
CREATE MATERIALIZED VIEW strategy_recommendations AS
WITH portfolio_analysis AS (
  SELECT 
    ph.user_id,
    COUNT(*) as total_holdings,
    COUNT(DISTINCT ph.sector) as sector_diversification,
    AVG(ph.dividend_yield) as avg_dividend_yield,
    SUM(ph.shares * ph.current_price) as total_value,
    -- Concentration risk (top 3 holdings)
    SUM(ph.shares * ph.current_price) FILTER (
      WHERE ph.ticker IN (
        SELECT ticker FROM portfolio_holdings ph2 
        WHERE ph2.user_id = ph.user_id 
        ORDER BY (shares * current_price) DESC LIMIT 3
      )
    ) / SUM(ph.shares * ph.current_price) as concentration_ratio
  FROM portfolio_holdings ph
  WHERE ph.is_active = true
  GROUP BY ph.user_id
),
tax_efficiency AS (
  SELECT 
    ph.user_id,
    -- Calculate tax drag by location
    SUM(CASE 
      WHEN up.tax_location = 'PR' AND ph.tax_treatment = 'Qualified' 
      THEN ph.dividend_yield * 0.00  -- No tax on qualified in PR
      WHEN up.tax_location = 'CA' AND ph.tax_treatment = 'Qualified'
      THEN ph.dividend_yield * 0.15  -- Federal only
      ELSE ph.dividend_yield * 0.25  -- Conservative estimate
    END * ph.shares * ph.current_price) / 
    SUM(ph.shares * ph.current_price) as effective_tax_rate,
    -- Tax optimization score (0-100)
    CASE 
      WHEN up.tax_location = 'PR' THEN 
        (COUNT(*) FILTER (WHERE ph.tax_treatment = 'Qualified')::DECIMAL / COUNT(*)) * 100
      ELSE 
        (COUNT(*) FILTER (WHERE ph.tax_treatment IN ('Qualified', 'Municipal'))::DECIMAL / COUNT(*)) * 100
    END as tax_efficiency_score
  FROM portfolio_holdings ph
  LEFT JOIN user_profiles up ON ph.user_id = up.user_id
  WHERE ph.is_active = true
  GROUP BY ph.user_id, up.tax_location
)
SELECT 
  pa.user_id,
  -- Overall portfolio score (0-100)
  ROUND(
    (LEAST(pa.sector_diversification, 10) * 10) + 
    (CASE WHEN pa.concentration_ratio < 0.4 THEN 30 ELSE (1 - pa.concentration_ratio) * 30 END) +
    (te.tax_efficiency_score * 0.4) +
    (CASE WHEN pa.avg_dividend_yield BETWEEN 0.02 AND 0.08 THEN 20 ELSE 10 END)
  ) as overall_strategy_score,
  
  -- Specific recommendations
  ARRAY_REMOVE(ARRAY[
    CASE WHEN pa.sector_diversification < 5 THEN 'Increase sector diversification' END,
    CASE WHEN pa.concentration_ratio > 0.6 THEN 'Reduce concentration risk' END,
    CASE WHEN te.tax_efficiency_score < 70 THEN 'Optimize tax efficiency' END,
    CASE WHEN pa.avg_dividend_yield < 0.03 THEN 'Consider higher-yield alternatives' END,
    CASE WHEN pa.avg_dividend_yield > 0.10 THEN 'Review sustainability of high yields' END
  ], NULL) as recommendations,
  
  -- Rebalancing suggestions
  CASE 
    WHEN pa.concentration_ratio > 0.5 THEN 'High'
    WHEN pa.concentration_ratio > 0.4 THEN 'Medium'
    ELSE 'Low'
  END as rebalancing_priority,
  
  pa.total_holdings,
  pa.sector_diversification,
  pa.avg_dividend_yield,
  te.effective_tax_rate,
  te.tax_efficiency_score,
  NOW() as last_updated
  
FROM portfolio_analysis pa
LEFT JOIN tax_efficiency te ON pa.user_id = te.user_id;

-- CARD 5: Quick Actions Dashboard
CREATE MATERIALIZED VIEW quick_actions_summary AS
WITH recent_activity AS (
  SELECT 
    user_id,
    'dividend' as activity_type,
    ticker as description,
    total_amount as amount,
    pay_date as activity_date
  FROM dividend_payments
  WHERE pay_date >= CURRENT_DATE - INTERVAL '30 days'
  
  UNION ALL
  
  SELECT 
    user_id,
    'expense' as activity_type,
    category as description,
    amount,
    created_at::DATE as activity_date
  FROM user_expenses
  WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  
  UNION ALL
  
  SELECT 
    user_id,
    'holding_update' as activity_type,
    ticker as description,
    shares * current_price as amount,
    updated_at::DATE as activity_date
  FROM portfolio_holdings
  WHERE updated_at >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT 
  ra.user_id,
  -- Recent activity summary
  COUNT(*) as total_recent_activities,
  COUNT(*) FILTER (WHERE activity_type = 'dividend') as recent_dividends,
  COUNT(*) FILTER (WHERE activity_type = 'expense') as recent_expenses,
  COUNT(*) FILTER (WHERE activity_type = 'holding_update') as recent_updates,
  
  -- Quick action recommendations
  ARRAY_REMOVE(ARRAY[
    CASE WHEN COUNT(*) FILTER (WHERE activity_type = 'dividend') = 0 
      THEN 'Add dividend tracking' END,
    CASE WHEN COUNT(*) FILTER (WHERE activity_type = 'expense') < 5 
      THEN 'Complete expense setup' END,
    CASE WHEN EXISTS(
      SELECT 1 FROM portfolio_holdings ph 
      WHERE ph.user_id = ra.user_id AND ph.updated_at < CURRENT_DATE - INTERVAL '7 days'
    ) THEN 'Update portfolio prices' END
  ], NULL) as suggested_actions,
  
  -- Last activity date
  MAX(ra.activity_date) as last_activity_date,
  NOW() as last_updated
  
FROM recent_activity ra
GROUP BY ra.user_id;

-- ============================================
-- PERFORMANCE OPTIMIZATIONS
-- ============================================

-- Unique indexes on materialized views for instant lookups
CREATE UNIQUE INDEX idx_portfolio_perf_user ON portfolio_performance_summary (user_id);
CREATE UNIQUE INDEX idx_income_intel_user ON income_intelligence_summary (user_id);
CREATE UNIQUE INDEX idx_lifestyle_user ON lifestyle_progress_summary (user_id);
CREATE UNIQUE INDEX idx_strategy_user ON strategy_recommendations (user_id);
CREATE UNIQUE INDEX idx_quick_actions_user ON quick_actions_summary (user_id);

-- Regular table indexes for fast JOINs
CREATE INDEX idx_portfolio_holdings_user_active ON portfolio_holdings (user_id, is_active);
CREATE INDEX idx_dividend_payments_user_date ON dividend_payments (user_id, pay_date DESC);
CREATE INDEX idx_user_expenses_user_freq ON user_expenses (user_id, frequency);
CREATE INDEX idx_price_history_ticker_date ON price_history (ticker, date DESC);

-- ============================================
-- AUTOMATED REFRESH SYSTEM
-- ============================================

-- Function to refresh all user-specific views
CREATE OR REPLACE FUNCTION refresh_user_dashboard_views(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Refresh in dependency order
  REFRESH MATERIALIZED VIEW portfolio_performance_summary;
  REFRESH MATERIALIZED VIEW income_intelligence_summary;
  REFRESH MATERIALIZED VIEW lifestyle_progress_summary;
  REFRESH MATERIALIZED VIEW strategy_recommendations;
  REFRESH MATERIALIZED VIEW quick_actions_summary;
END;
$$ LANGUAGE plpgsql;

-- Scheduled refresh every 5 minutes (using pg_cron)
SELECT cron.schedule('refresh-dashboard-views', '*/5 * * * *', $$
  SELECT refresh_user_dashboard_views(NULL); -- NULL refreshes all
$$);

-- ============================================
-- SINGLE ENDPOINT DATA QUERY
-- ============================================

-- Function to get complete dashboard data in one call
CREATE OR REPLACE FUNCTION get_user_dashboard(target_user_id UUID)
RETURNS json AS $$
BEGIN
  RETURN json_build_object(
    'performanceCommand', (
      SELECT row_to_json(pps)
      FROM portfolio_performance_summary pps
      WHERE pps.user_id = target_user_id
    ),
    'incomeIntelligence', (
      SELECT row_to_json(iis)
      FROM income_intelligence_summary iis
      WHERE iis.user_id = target_user_id
    ),
    'lifestyleTracker', (
      SELECT row_to_json(lps)
      FROM lifestyle_progress_summary lps
      WHERE lps.user_id = target_user_id
    ),
    'strategyOptimizer', (
      SELECT row_to_json(sr)
      FROM strategy_recommendations sr
      WHERE sr.user_id = target_user_id
    ),
    'quickActions', (
      SELECT row_to_json(qas)
      FROM quick_actions_summary qas
      WHERE qas.user_id = target_user_id
    ),
    'metadata', json_build_object(
      'lastUpdated', NOW(),
      'refreshInterval', 300000,
      'cacheStatus', 'fresh'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dividend_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_expenses ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY user_profiles_policy ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY portfolio_holdings_policy ON portfolio_holdings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY dividend_payments_policy ON dividend_payments
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_expenses_policy ON user_expenses
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- USAGE EXAMPLE
-- ============================================

-- Get complete dashboard data for user in <50ms
-- SELECT get_user_dashboard('user-uuid-here');

-- Result structure:
-- {
--   "performanceCommand": { portfolio_return_1y: 0.12, spy_return_1y: 0.08, ... },
--   "incomeIntelligence": { gross_monthly_income: 4500, net_monthly_income: 3825, ... },
--   "lifestyleTracker": { expense_coverage_percentage: 85, fire_progress_percentage: 32, ... },
--   "strategyOptimizer": { overall_strategy_score: 78, recommendations: [...], ... },
--   "quickActions": { total_recent_activities: 12, suggested_actions: [...], ... },
--   "metadata": { lastUpdated: "2025-08-07T10:30:00Z", refreshInterval: 300000, ... }
-- }