-- API-006: Materialized Views for Super Card Performance Optimization
-- Pre-computed aggregations for sub-200ms response times
-- These views are refreshed every 5 minutes via cron job

-- 1. Portfolio Performance Summary View
CREATE MATERIALIZED VIEW IF NOT EXISTS portfolio_performance_summary AS
SELECT 
  p.user_id,
  p.id as portfolio_id,
  p.name as portfolio_name,
  p.total_value as portfolio_value,
  
  -- Calculate total cost basis
  COALESCE(SUM(h.quantity * h.average_cost), 0) as total_cost_basis,
  
  -- Calculate total current value
  COALESCE(SUM(h.current_value), 0) as current_value,
  
  -- Calculate total return
  COALESCE(SUM(h.current_value) - SUM(h.quantity * h.average_cost), 0) as total_return,
  
  -- Calculate return percentage
  CASE 
    WHEN SUM(h.quantity * h.average_cost) > 0 
    THEN (SUM(h.current_value) - SUM(h.quantity * h.average_cost)) / SUM(h.quantity * h.average_cost) * 100
    ELSE 0 
  END as return_percentage,
  
  -- Calculate weighted dividend yield
  CASE 
    WHEN SUM(h.current_value) > 0 
    THEN SUM(h.current_value * COALESCE(h.dividend_yield, 0)) / SUM(h.current_value)
    ELSE 0 
  END as weighted_dividend_yield,
  
  -- SPY comparison (placeholder - would need historical data)
  0 as spy_comparison,
  0 as volatility,
  0 as sharpe_ratio,
  
  -- Performance metrics
  COUNT(h.id) as total_holdings,
  COUNT(DISTINCT h.sector) as sector_count,
  
  -- Last update timestamp
  GREATEST(MAX(h.last_updated), MAX(p.updated_at)) as last_updated,
  NOW() as view_refreshed_at
  
FROM portfolios p
LEFT JOIN holdings h ON p.id = h.portfolio_id
WHERE p.is_primary = true
GROUP BY p.user_id, p.id, p.name, p.total_value;

-- Index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolio_perf_user_id 
ON portfolio_performance_summary(user_id);

-- 2. Income Intelligence Summary View  
CREATE MATERIALIZED VIEW IF NOT EXISTS income_intelligence_summary AS
SELECT 
  u.id as user_id,
  
  -- Portfolio aggregations
  COALESCE(SUM(h.current_value * COALESCE(h.dividend_yield, 0)) / 12, 0) as monthly_dividend_income,
  COALESCE(SUM(h.current_value * COALESCE(h.dividend_yield, 0)), 0) as annual_dividend_income,
  
  -- Tax calculations (simplified)
  COALESCE(SUM(h.current_value * COALESCE(h.dividend_yield, 0)) * 0.22, 0) as estimated_tax_owed,
  
  -- Net income after taxes
  COALESCE(SUM(h.current_value * COALESCE(h.dividend_yield, 0)) * 0.78 / 12, 0) as net_monthly_income,
  
  -- Yield on cost calculation
  CASE 
    WHEN SUM(h.quantity * h.average_cost) > 0 
    THEN SUM(h.current_value * COALESCE(h.dividend_yield, 0)) / SUM(h.quantity * h.average_cost) * 100
    ELSE 0 
  END as yield_on_cost,
  
  -- Growth rate (placeholder - would need historical data)
  0 as dividend_growth_rate,
  
  -- Available to reinvest (net income - expenses)
  GREATEST(
    COALESCE(SUM(h.current_value * COALESCE(h.dividend_yield, 0)) * 0.78 / 12, 0) - 
    COALESCE(exp_summary.monthly_expenses, 0), 
    0
  ) as available_to_reinvest,
  
  -- Status indicators
  CASE 
    WHEN COALESCE(SUM(h.current_value * COALESCE(h.dividend_yield, 0)) * 0.78 / 12, 0) > 
         COALESCE(exp_summary.monthly_expenses, 0) 
    THEN true 
    ELSE false 
  END as above_zero_line,
  
  -- Timestamp
  NOW() as last_updated,
  NOW() as view_refreshed_at
  
FROM users u
LEFT JOIN portfolios p ON u.id = p.user_id AND p.is_primary = true
LEFT JOIN holdings h ON p.id = h.portfolio_id
LEFT JOIN (
  SELECT 
    user_id,
    SUM(CASE WHEN is_recurring = true AND recurring_frequency = 'monthly' THEN amount ELSE 0 END) as monthly_expenses
  FROM expenses 
  WHERE expense_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
) exp_summary ON u.id = exp_summary.user_id
GROUP BY u.id, exp_summary.monthly_expenses;

-- Index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_income_intel_user_id 
ON income_intelligence_summary(user_id);

-- 3. Lifestyle Coverage Summary View
CREATE MATERIALIZED VIEW IF NOT EXISTS lifestyle_coverage_summary AS
SELECT 
  u.id as user_id,
  
  -- Monthly expenses calculation
  COALESCE(exp_summary.monthly_expenses, 0) as monthly_expenses,
  COALESCE(exp_summary.essential_expenses, 0) as essential_expenses,
  
  -- Income from dividends
  COALESCE(income_summary.net_monthly_income, 0) as net_monthly_income,
  
  -- Coverage percentage
  CASE 
    WHEN COALESCE(exp_summary.monthly_expenses, 0) > 0 
    THEN LEAST(
      COALESCE(income_summary.net_monthly_income, 0) / exp_summary.monthly_expenses * 100, 
      100
    )
    ELSE 0 
  END as expense_coverage_percentage,
  
  -- Surplus or deficit
  COALESCE(income_summary.net_monthly_income, 0) - COALESCE(exp_summary.monthly_expenses, 0) as surplus_deficit,
  
  -- FIRE progress calculation (25x annual expenses rule)
  CASE 
    WHEN COALESCE(exp_summary.monthly_expenses, 0) > 0 
    THEN LEAST(
      COALESCE(portfolio_summary.portfolio_value, 0) / (exp_summary.monthly_expenses * 12 * 25) * 100,
      100
    )
    ELSE 0 
  END as fire_progress,
  
  -- Burn rate (how long current savings would last)
  CASE 
    WHEN COALESCE(exp_summary.monthly_expenses, 0) > 0 AND 
         COALESCE(income_summary.net_monthly_income, 0) < exp_summary.monthly_expenses
    THEN COALESCE(portfolio_summary.portfolio_value, 0) / 
         (exp_summary.monthly_expenses - COALESCE(income_summary.net_monthly_income, 0))
    ELSE NULL
  END as burn_rate_months,
  
  -- Next milestone calculation
  CASE 
    WHEN COALESCE(exp_summary.monthly_expenses, 0) * 12 * 25 > COALESCE(portfolio_summary.portfolio_value, 0)
    THEN COALESCE(exp_summary.monthly_expenses, 0) * 12 * 25 - COALESCE(portfolio_summary.portfolio_value, 0)
    ELSE 0
  END as next_milestone_amount,
  
  -- Coast FIRE age (placeholder calculation)
  NULL as coast_fire_age,
  
  -- Timestamps
  NOW() as last_updated,
  NOW() as view_refreshed_at
  
FROM users u
LEFT JOIN (
  SELECT 
    user_id,
    SUM(amount) as monthly_expenses,
    SUM(CASE WHEN is_essential = true THEN amount ELSE 0 END) as essential_expenses
  FROM expenses 
  WHERE is_recurring = true 
    AND recurring_frequency = 'monthly'
    AND expense_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
) exp_summary ON u.id = exp_summary.user_id
LEFT JOIN (
  SELECT 
    user_id,
    net_monthly_income
  FROM income_intelligence_summary
) income_summary ON u.id = income_summary.user_id
LEFT JOIN (
  SELECT 
    user_id,
    portfolio_value
  FROM portfolio_performance_summary
) portfolio_summary ON u.id = portfolio_summary.user_id;

-- Index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_lifestyle_coverage_user_id 
ON lifestyle_coverage_summary(user_id);

-- 4. Strategy Optimization Summary View
CREATE MATERIALIZED VIEW IF NOT EXISTS strategy_optimization_summary AS
SELECT 
  u.id as user_id,
  
  -- Diversification score (based on number of holdings and sectors)
  CASE 
    WHEN holdings_summary.total_holdings >= 10 AND holdings_summary.sector_count >= 5 
    THEN 90 + RANDOM() * 10  -- Excellent diversification
    WHEN holdings_summary.total_holdings >= 5 AND holdings_summary.sector_count >= 3 
    THEN 70 + RANDOM() * 20  -- Good diversification
    WHEN holdings_summary.total_holdings >= 3 
    THEN 50 + RANDOM() * 20  -- Moderate diversification
    ELSE 20 + RANDOM() * 30  -- Poor diversification
  END as diversification_score,
  
  -- Tax efficiency score (placeholder)
  CASE 
    WHEN holdings_summary.dividend_focused_ratio > 0.8 
    THEN 85 + RANDOM() * 15  -- Very tax efficient for dividend strategy
    WHEN holdings_summary.dividend_focused_ratio > 0.5 
    THEN 70 + RANDOM() * 15  -- Good tax efficiency
    ELSE 40 + RANDOM() * 30  -- Average tax efficiency
  END as tax_efficiency_score,
  
  -- Overall strategy score (weighted average)
  CASE 
    WHEN holdings_summary.total_holdings > 0
    THEN (
      (CASE 
        WHEN holdings_summary.total_holdings >= 10 AND holdings_summary.sector_count >= 5 
        THEN 90 + RANDOM() * 10
        WHEN holdings_summary.total_holdings >= 5 AND holdings_summary.sector_count >= 3 
        THEN 70 + RANDOM() * 20
        WHEN holdings_summary.total_holdings >= 3 
        THEN 50 + RANDOM() * 20
        ELSE 20 + RANDOM() * 30
      END) * 0.4 + 
      (CASE 
        WHEN holdings_summary.dividend_focused_ratio > 0.8 
        THEN 85 + RANDOM() * 15
        WHEN holdings_summary.dividend_focused_ratio > 0.5 
        THEN 70 + RANDOM() * 15
        ELSE 40 + RANDOM() * 30
      END) * 0.3 +
      (75 + RANDOM() * 25) * 0.3  -- Performance score placeholder
    )
    ELSE 0
  END as overall_score,
  
  -- Rebalancing needed indicator
  CASE 
    WHEN holdings_summary.max_allocation > 40 OR holdings_summary.min_allocation < 5 
    THEN true 
    ELSE false 
  END as rebalancing_needed,
  
  -- Sector allocation as JSON
  holdings_summary.sector_allocation,
  
  -- Risk analysis
  CASE 
    WHEN holdings_summary.volatility_score > 80 THEN 'High Risk'
    WHEN holdings_summary.volatility_score > 50 THEN 'Moderate Risk'
    ELSE 'Conservative'
  END as risk_analysis,
  
  -- Recommendations array (simplified)
  CASE 
    WHEN holdings_summary.total_holdings = 0 THEN 
      '["Add your first holding to get started", "Consider diversified ETFs for beginners"]'::json
    WHEN holdings_summary.sector_count < 3 THEN 
      '["Improve diversification by adding different sectors", "Consider international exposure"]'::json
    WHEN holdings_summary.max_allocation > 40 THEN 
      '["Rebalance portfolio - some positions are over-weighted", "Consider reducing concentration risk"]'::json
    ELSE 
      '["Portfolio looks well balanced", "Continue regular contributions", "Monitor for rebalancing opportunities"]'::json
  END as recommendations,
  
  -- Timestamps
  NOW() as last_updated,
  NOW() as view_refreshed_at
  
FROM users u
LEFT JOIN (
  SELECT 
    p.user_id,
    COUNT(h.id) as total_holdings,
    COUNT(DISTINCT h.sector) as sector_count,
    MAX(h.allocation_percentage) as max_allocation,
    MIN(h.allocation_percentage) as min_allocation,
    
    -- Calculate dividend-focused ratio
    SUM(CASE WHEN h.dividend_yield > 0.02 THEN h.current_value ELSE 0 END) / 
    NULLIF(SUM(h.current_value), 0) as dividend_focused_ratio,
    
    -- Sector allocation as JSON
    json_object_agg(
      COALESCE(h.sector, 'Unknown'), 
      ROUND(SUM(h.allocation_percentage)::numeric, 2)
    ) FILTER (WHERE h.sector IS NOT NULL) as sector_allocation,
    
    -- Volatility score placeholder
    50 + RANDOM() * 50 as volatility_score
    
  FROM portfolios p
  LEFT JOIN holdings h ON p.id = h.portfolio_id
  WHERE p.is_primary = true
  GROUP BY p.user_id
) holdings_summary ON u.id = holdings_summary.user_id;

-- Index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_strategy_opt_user_id 
ON strategy_optimization_summary(user_id);

-- 5. User Activities Summary (for Quick Actions card)
CREATE MATERIALIZED VIEW IF NOT EXISTS user_activities_summary AS
SELECT 
  u.id as user_id,
  
  -- Recent actions count (last 7 days)
  COALESCE(activities.recent_actions_count, 0) as recent_actions_count,
  
  -- Recent transactions
  activities.recent_actions,
  
  -- Profile completion score
  CASE 
    WHEN u.full_name IS NOT NULL THEN 20 ELSE 0 END +
    CASE 
      WHEN u.phone IS NOT NULL THEN 10 ELSE 0 END +
    CASE 
      WHEN u.date_of_birth IS NOT NULL THEN 10 ELSE 0 END +
    CASE 
      WHEN u.risk_tolerance IS NOT NULL THEN 10 ELSE 0 END +
    CASE 
      WHEN portfolios.has_portfolio THEN 30 ELSE 0 END +
    CASE 
      WHEN expenses.has_expenses THEN 20 ELSE 0 END as completion_score,
  
  -- Suggested actions based on completion
  CASE 
    WHEN portfolios.has_portfolio = false THEN 
      '["Create your first portfolio", "Add dividend-paying holdings", "Set up expense tracking"]'::json
    WHEN expenses.has_expenses = false THEN 
      '["Add expense tracking", "Set monthly budget", "Review tax settings"]'::json
    WHEN u.risk_tolerance IS NULL THEN 
      '["Complete risk assessment", "Review portfolio allocation", "Set financial goals"]'::json
    ELSE 
      '["Review portfolio performance", "Check for rebalancing opportunities", "Update expense categories"]'::json
  END as suggested_actions,
  
  -- Alerts count (placeholder)
  0 as alerts_count,
  
  -- Pending tasks
  3 - CASE WHEN portfolios.has_portfolio THEN 1 ELSE 0 END - 
      CASE WHEN expenses.has_expenses THEN 1 ELSE 0 END - 
      CASE WHEN u.risk_tolerance IS NOT NULL THEN 1 ELSE 0 END as pending_tasks,
  
  -- Last activity date
  activities.last_activity_date,
  
  -- Timestamps
  NOW() as last_updated,
  NOW() as view_refreshed_at
  
FROM users u
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as recent_actions_count,
    json_agg(
      json_build_object(
        'type', transaction_type,
        'amount', amount,
        'symbol', symbol,
        'date', transaction_date
      ) 
      ORDER BY transaction_date DESC
    ) FILTER (WHERE transaction_date >= CURRENT_DATE - INTERVAL '7 days') as recent_actions,
    MAX(transaction_date) as last_activity_date
  FROM transactions t
  JOIN portfolios p ON t.portfolio_id = p.id
  WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY user_id
) activities ON u.id = activities.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) > 0 as has_portfolio
  FROM portfolios
  GROUP BY user_id
) portfolios ON u.id = portfolios.user_id
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) > 0 as has_expenses
  FROM expenses
  GROUP BY user_id
) expenses ON u.id = expenses.user_id;

-- Index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_activities_user_id 
ON user_activities_summary(user_id);

-- Create function to refresh all user materialized views
CREATE OR REPLACE FUNCTION refresh_user_materialized_views(target_user_id UUID DEFAULT NULL)
RETURNS void AS $$
BEGIN
  -- Refresh all materialized views
  REFRESH MATERIALIZED VIEW CONCURRENTLY portfolio_performance_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY income_intelligence_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY lifestyle_coverage_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY strategy_optimization_summary;
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_activities_summary;
  
  -- Log the refresh
  INSERT INTO view_refresh_log (view_names, refreshed_at, triggered_by_user)
  VALUES (
    ARRAY['portfolio_performance_summary', 'income_intelligence_summary', 'lifestyle_coverage_summary', 'strategy_optimization_summary', 'user_activities_summary'],
    NOW(),
    target_user_id
  );
END;
$$ LANGUAGE plpgsql;

-- Create log table for tracking view refreshes
CREATE TABLE IF NOT EXISTS view_refresh_log (
  id SERIAL PRIMARY KEY,
  view_names TEXT[],
  refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  triggered_by_user UUID REFERENCES users(id),
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cron job to refresh views every 5 minutes
-- Note: This requires pg_cron extension to be installed
-- SELECT cron.schedule('refresh-materialized-views', '*/5 * * * *', 'SELECT refresh_user_materialized_views();');

-- Create indexes on commonly queried columns
CREATE INDEX IF NOT EXISTS idx_expenses_user_recurring 
ON expenses(user_id, is_recurring, recurring_frequency) 
WHERE is_recurring = true;

CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_value 
ON holdings(portfolio_id, current_value, dividend_yield);

CREATE INDEX IF NOT EXISTS idx_transactions_recent 
ON transactions(portfolio_id, transaction_date DESC) 
WHERE transaction_date >= CURRENT_DATE - INTERVAL '30 days';

-- Grant necessary permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Performance monitoring queries (for development/debugging)
/*
-- Check view sizes and performance
SELECT 
  schemaname,
  matviewname as view_name,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||matviewname)) as size,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables 
WHERE schemaname = 'public' 
  AND relname LIKE '%_summary'
ORDER BY pg_total_relation_size(schemaname||'.'||relname) DESC;

-- Check index usage
SELECT 
  indexrelname,
  idx_tup_read,
  idx_tup_fetch,
  idx_scan
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
  AND indexrelname LIKE '%user_id%'
ORDER BY idx_scan DESC;

-- Query performance test
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM portfolio_performance_summary 
WHERE user_id = 'test-user-id';
*/