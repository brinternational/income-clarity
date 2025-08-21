-- Performance Optimization Database Indexes
-- Added for better query performance on commonly accessed fields

-- User-related indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_premium_status ON users(isPremium, premiumEndDate);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(createdAt);

-- Session indexes (already exist but ensuring)
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(sessionToken);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(userId);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expiresAt);

-- Portfolio indexes
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(userId);
CREATE INDEX IF NOT EXISTS idx_portfolios_user_primary ON portfolios(userId, isPrimary);
CREATE INDEX IF NOT EXISTS idx_portfolios_yodlee_account ON portfolios(yodleeAccountId);
CREATE INDEX IF NOT EXISTS idx_portfolios_updated_at ON portfolios(updatedAt);

-- Holdings indexes (critical for performance)
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON holdings(portfolioId);
CREATE INDEX IF NOT EXISTS idx_holdings_ticker ON holdings(ticker);
CREATE INDEX IF NOT EXISTS idx_holdings_data_source ON holdings(dataSource);
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_ticker ON holdings(portfolioId, ticker);
CREATE INDEX IF NOT EXISTS idx_holdings_yodlee_account ON holdings(yodleeAccountId);
CREATE INDEX IF NOT EXISTS idx_holdings_last_synced ON holdings(lastSyncedAt);
CREATE INDEX IF NOT EXISTS idx_holdings_updated_at ON holdings(updatedAt);

-- Transaction indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(userId, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_ticker_type ON transactions(ticker, type);
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id ON transactions(portfolioId);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- Income indexes
CREATE INDEX IF NOT EXISTS idx_incomes_user_date ON incomes(userId, date DESC);
CREATE INDEX IF NOT EXISTS idx_incomes_category_date ON incomes(category, date DESC);
CREATE INDEX IF NOT EXISTS idx_incomes_data_source ON incomes(dataSource);
CREATE INDEX IF NOT EXISTS idx_incomes_yodlee_account ON incomes(yodleeAccountId);
CREATE INDEX IF NOT EXISTS idx_incomes_recurring ON incomes(recurring, frequency);
CREATE INDEX IF NOT EXISTS idx_incomes_last_synced ON incomes(lastSyncedAt);

-- Expense indexes
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(userId, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category_date ON expenses(category, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_data_source ON expenses(dataSource);
CREATE INDEX IF NOT EXISTS idx_expenses_yodlee_account ON expenses(yodleeAccountId);
CREATE INDEX IF NOT EXISTS idx_expenses_recurring ON expenses(recurring, frequency);
CREATE INDEX IF NOT EXISTS idx_expenses_essential ON expenses(essential);

-- Stock price indexes
CREATE INDEX IF NOT EXISTS idx_stock_prices_ticker_date ON stock_prices(ticker, date DESC);
CREATE INDEX IF NOT EXISTS idx_historical_prices_ticker_date ON historical_prices(ticker, date DESC);
CREATE INDEX IF NOT EXISTS idx_historical_prices_date ON historical_prices(date DESC);

-- Portfolio snapshot indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_date ON portfolio_snapshots(userId, date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_portfolio_date ON portfolio_snapshots(portfolioId, date DESC);

-- Risk metrics indexes
CREATE INDEX IF NOT EXISTS idx_risk_metrics_user_period ON risk_metrics(userId, calculationPeriod);
CREATE INDEX IF NOT EXISTS idx_risk_metrics_date ON risk_metrics(date DESC);

-- Performance snapshot indexes
CREATE INDEX IF NOT EXISTS idx_performance_snapshots_user_date ON performance_snapshots(userId, date DESC);

-- Cache indexes
CREATE INDEX IF NOT EXISTS idx_cache_entries_key ON cache_entries(key);
CREATE INDEX IF NOT EXISTS idx_cache_entries_created_at ON cache_entries(createdAt);
CREATE INDEX IF NOT EXISTS idx_calculation_cache_expires ON calculation_cache(expiresAt);

-- Dividend schedule indexes
CREATE INDEX IF NOT EXISTS idx_dividend_schedules_ticker_ex_date ON dividend_schedules(ticker, exDate DESC);
CREATE INDEX IF NOT EXISTS idx_dividend_schedules_pay_date ON dividend_schedules(payDate);

-- Financial goals indexes
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_active ON financial_goals(userId, isActive);
CREATE INDEX IF NOT EXISTS idx_financial_goals_target_date ON financial_goals(targetDate);

-- Yodlee integration indexes
CREATE INDEX IF NOT EXISTS idx_yodlee_connections_user ON yodlee_connections(userId);
CREATE INDEX IF NOT EXISTS idx_yodlee_connections_yodlee_user ON yodlee_connections(yodleeUserId);
CREATE INDEX IF NOT EXISTS idx_synced_accounts_connection ON synced_accounts(connectionId);
CREATE INDEX IF NOT EXISTS idx_synced_accounts_yodlee_id ON synced_accounts(yodleeAccountId);

-- Subscription indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON user_subscriptions(userId);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_status ON user_subscriptions(plan, status);

-- Sync and webhook indexes
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_started ON sync_logs(userId, startedAt DESC);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_user_processed ON webhook_logs(userId, processedAt DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event ON webhook_logs(event);
CREATE INDEX IF NOT EXISTS idx_queued_syncs_priority_scheduled ON queued_syncs(priority, scheduledAt);
CREATE INDEX IF NOT EXISTS idx_queued_syncs_user_type ON queued_syncs(userId, syncType);

-- Cron job indexes
CREATE INDEX IF NOT EXISTS idx_cron_job_logs_job_started ON cron_job_logs(jobName, startedAt DESC);

-- Email preferences indexes
CREATE INDEX IF NOT EXISTS idx_email_preferences_user ON email_preferences(userId);
CREATE INDEX IF NOT EXISTS idx_email_preferences_email ON email_preferences(email);

-- User settings indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user ON user_settings(userId);

-- Tax profile indexes
CREATE INDEX IF NOT EXISTS idx_tax_profiles_user ON tax_profiles(userId);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_source_updated ON holdings(portfolioId, dataSource, updatedAt DESC);
CREATE INDEX IF NOT EXISTS idx_incomes_user_source_date ON incomes(userId, dataSource, date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_user_source_date ON expenses(userId, dataSource, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_portfolio_date ON transactions(userId, portfolioId, date DESC);

-- Analyze tables for optimal query planning
ANALYZE;