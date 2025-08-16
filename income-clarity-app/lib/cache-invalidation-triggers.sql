-- Cache Invalidation Database Triggers
-- Automatically invalidates cache when underlying data changes
-- Ensures data consistency across multi-level cache

-- Function to invalidate cache via HTTP webhook to Next.js API
CREATE OR REPLACE FUNCTION notify_cache_invalidation(
    invalidation_type TEXT,
    user_id UUID,
    table_name TEXT,
    record_id UUID DEFAULT NULL,
    affected_cards TEXT[] DEFAULT ARRAY['performance', 'income', 'lifestyle', 'strategy', 'quickActions']
)
RETURNS void AS $$
DECLARE
    webhook_url TEXT;
    payload JSONB;
    http_response JSONB;
BEGIN
    -- Get webhook URL from environment or settings
    webhook_url := current_setting('app.cache_invalidation_webhook_url', true);
    
    -- Skip if no webhook URL configured
    IF webhook_url IS NULL OR webhook_url = '' THEN
        RAISE NOTICE 'Cache invalidation webhook URL not configured - skipping invalidation';
        RETURN;
    END IF;

    -- Build invalidation payload
    payload := jsonb_build_object(
        'type', invalidation_type,
        'userId', user_id,
        'tableName', table_name,
        'recordId', record_id,
        'affectedCards', to_jsonb(affected_cards),
        'timestamp', now()::text,
        'source', 'database_trigger'
    );

    -- Log invalidation for debugging
    RAISE NOTICE 'Cache invalidation: % for user % (table: %, cards: %)', 
        invalidation_type, user_id, table_name, array_to_string(affected_cards, ',');

    -- Send HTTP notification (requires http extension)
    -- Note: This requires the http extension to be installed
    -- ALTER: SELECT http_post(webhook_url, payload::text, 'application/json');
    
    -- For now, just log to a cache_invalidation_log table
    INSERT INTO cache_invalidation_log (
        invalidation_type,
        user_id,
        table_name,
        record_id,
        affected_cards,
        payload,
        created_at
    ) VALUES (
        invalidation_type,
        user_id,
        table_name,
        record_id,
        affected_cards,
        payload,
        now()
    );

EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the main transaction
    RAISE NOTICE 'Cache invalidation failed: %', SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Create cache invalidation log table
CREATE TABLE IF NOT EXISTS cache_invalidation_log (
    id BIGSERIAL PRIMARY KEY,
    invalidation_type TEXT NOT NULL,
    user_id UUID NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    affected_cards TEXT[],
    payload JSONB,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for processing cache invalidations
CREATE INDEX IF NOT EXISTS idx_cache_invalidation_processing 
ON cache_invalidation_log(processed, created_at) 
WHERE processed = FALSE;

-- Index for user-based invalidation queries
CREATE INDEX IF NOT EXISTS idx_cache_invalidation_user 
ON cache_invalidation_log(user_id, created_at);

-- PORTFOLIO-related triggers (affects performance, income, strategy cards)

-- Portfolio updates trigger
CREATE OR REPLACE FUNCTION portfolio_cache_invalidation_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Determine the user_id
    DECLARE
        target_user_id UUID;
    BEGIN
        target_user_id := COALESCE(NEW.user_id, OLD.user_id);
        
        -- Invalidate performance, income, and strategy cards
        PERFORM notify_cache_invalidation(
            TG_OP,
            target_user_id,
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            ARRAY['performance', 'income', 'strategy', 'quickActions']
        );
        
        RETURN COALESCE(NEW, OLD);
    END;
END;
$$ LANGUAGE plpgsql;

-- Create portfolio triggers
DROP TRIGGER IF EXISTS portfolio_cache_invalidation ON portfolios;
CREATE TRIGGER portfolio_cache_invalidation
    AFTER INSERT OR UPDATE OR DELETE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION portfolio_cache_invalidation_trigger();

-- HOLDINGS-related triggers (affects performance, income, strategy cards)

CREATE OR REPLACE FUNCTION holdings_cache_invalidation_trigger()
RETURNS TRIGGER AS $$
BEGIN
    DECLARE
        target_user_id UUID;
        portfolio_record RECORD;
    BEGIN
        -- Get user_id from portfolio
        IF TG_OP = 'DELETE' THEN
            SELECT user_id INTO target_user_id 
            FROM portfolios 
            WHERE id = OLD.portfolio_id;
        ELSE
            SELECT user_id INTO target_user_id 
            FROM portfolios 
            WHERE id = NEW.portfolio_id;
        END IF;
        
        -- Holdings changes affect performance, income, and strategy
        PERFORM notify_cache_invalidation(
            TG_OP,
            target_user_id,
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            ARRAY['performance', 'income', 'strategy', 'quickActions']
        );
        
        RETURN COALESCE(NEW, OLD);
    END;
END;
$$ LANGUAGE plpgsql;

-- Create holdings triggers
DROP TRIGGER IF EXISTS holdings_cache_invalidation ON holdings;
CREATE TRIGGER holdings_cache_invalidation
    AFTER INSERT OR UPDATE OR DELETE ON holdings
    FOR EACH ROW EXECUTE FUNCTION holdings_cache_invalidation_trigger();

-- TRANSACTIONS-related triggers (affects all cards)

CREATE OR REPLACE FUNCTION transactions_cache_invalidation_trigger()
RETURNS TRIGGER AS $$
BEGIN
    DECLARE
        target_user_id UUID;
    BEGIN
        -- Get user_id from portfolio
        IF TG_OP = 'DELETE' THEN
            SELECT user_id INTO target_user_id 
            FROM portfolios 
            WHERE id = OLD.portfolio_id;
        ELSE
            SELECT user_id INTO target_user_id 
            FROM portfolios 
            WHERE id = NEW.portfolio_id;
        END IF;
        
        -- Transactions affect all cards
        PERFORM notify_cache_invalidation(
            TG_OP,
            target_user_id,
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            ARRAY['performance', 'income', 'lifestyle', 'strategy', 'quickActions']
        );
        
        RETURN COALESCE(NEW, OLD);
    END;
END;
$$ LANGUAGE plpgsql;

-- Create transactions triggers
DROP TRIGGER IF EXISTS transactions_cache_invalidation ON transactions;
CREATE TRIGGER transactions_cache_invalidation
    AFTER INSERT OR UPDATE OR DELETE ON transactions
    FOR EACH ROW EXECUTE FUNCTION transactions_cache_invalidation_trigger();

-- EXPENSES-related triggers (affects income, lifestyle cards)

CREATE OR REPLACE FUNCTION expenses_cache_invalidation_trigger()
RETURNS TRIGGER AS $$
BEGIN
    DECLARE
        target_user_id UUID;
    BEGIN
        target_user_id := COALESCE(NEW.user_id, OLD.user_id);
        
        -- Expenses affect income and lifestyle calculations
        PERFORM notify_cache_invalidation(
            TG_OP,
            target_user_id,
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            ARRAY['income', 'lifestyle', 'quickActions']
        );
        
        RETURN COALESCE(NEW, OLD);
    END;
END;
$$ LANGUAGE plpgsql;

-- Create expenses triggers
DROP TRIGGER IF EXISTS expenses_cache_invalidation ON expenses;
CREATE TRIGGER expenses_cache_invalidation
    AFTER INSERT OR UPDATE OR DELETE ON expenses
    FOR EACH ROW EXECUTE FUNCTION expenses_cache_invalidation_trigger();

-- FINANCIAL_GOALS-related triggers (affects lifestyle, strategy cards)

CREATE OR REPLACE FUNCTION financial_goals_cache_invalidation_trigger()
RETURNS TRIGGER AS $$
BEGIN
    DECLARE
        target_user_id UUID;
    BEGIN
        target_user_id := COALESCE(NEW.user_id, OLD.user_id);
        
        -- Financial goals affect lifestyle and strategy
        PERFORM notify_cache_invalidation(
            TG_OP,
            target_user_id,
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            ARRAY['lifestyle', 'strategy', 'quickActions']
        );
        
        RETURN COALESCE(NEW, OLD);
    END;
END;
$$ LANGUAGE plpgsql;

-- Create financial goals triggers (if table exists)
DROP TRIGGER IF EXISTS financial_goals_cache_invalidation ON financial_goals;
-- Note: Only create if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'financial_goals') THEN
        EXECUTE 'CREATE TRIGGER financial_goals_cache_invalidation
            AFTER INSERT OR UPDATE OR DELETE ON financial_goals
            FOR EACH ROW EXECUTE FUNCTION financial_goals_cache_invalidation_trigger()';
    END IF;
END $$;

-- USER_PROFILES-related triggers (affects all cards for settings changes)

CREATE OR REPLACE FUNCTION user_profiles_cache_invalidation_trigger()
RETURNS TRIGGER AS $$
BEGIN
    DECLARE
        target_user_id UUID;
    BEGIN
        target_user_id := COALESCE(NEW.id, OLD.id);
        
        -- Profile changes can affect all cards
        PERFORM notify_cache_invalidation(
            TG_OP,
            target_user_id,
            TG_TABLE_NAME,
            target_user_id,
            ARRAY['performance', 'income', 'lifestyle', 'strategy', 'quickActions']
        );
        
        RETURN COALESCE(NEW, OLD);
    END;
END;
$$ LANGUAGE plpgsql;

-- Create user profiles triggers
DROP TRIGGER IF EXISTS user_profiles_cache_invalidation ON users;
CREATE TRIGGER user_profiles_cache_invalidation
    AFTER UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION user_profiles_cache_invalidation_trigger();

-- Function to process pending cache invalidations
CREATE OR REPLACE FUNCTION process_cache_invalidations(batch_size INT DEFAULT 100)
RETURNS TABLE (
    processed_count INT,
    error_count INT,
    oldest_pending TIMESTAMP WITH TIME ZONE,
    newest_pending TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
    rec RECORD;
    processed INT := 0;
    errors INT := 0;
    oldest_ts TIMESTAMP WITH TIME ZONE;
    newest_ts TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Get timestamp range of pending invalidations
    SELECT MIN(created_at), MAX(created_at) 
    INTO oldest_ts, newest_ts
    FROM cache_invalidation_log 
    WHERE processed = FALSE;
    
    -- Process pending invalidations in batches
    FOR rec IN 
        SELECT * FROM cache_invalidation_log 
        WHERE processed = FALSE 
        ORDER BY created_at ASC 
        LIMIT batch_size
    LOOP
        BEGIN
            -- Here you would make the actual HTTP call to your cache invalidation endpoint
            -- For now, just mark as processed
            UPDATE cache_invalidation_log 
            SET processed = TRUE 
            WHERE id = rec.id;
            
            processed := processed + 1;
            
        EXCEPTION WHEN OTHERS THEN
            -- Log error and continue
            errors := errors + 1;
            RAISE NOTICE 'Failed to process cache invalidation %: %', rec.id, SQLERRM;
        END;
    END LOOP;
    
    RETURN QUERY SELECT processed, errors, oldest_ts, newest_ts;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old cache invalidation logs
CREATE OR REPLACE FUNCTION cleanup_cache_invalidation_log(days_old INT DEFAULT 7)
RETURNS INT AS $$
DECLARE
    deleted_count INT;
BEGIN
    DELETE FROM cache_invalidation_log 
    WHERE processed = TRUE 
      AND created_at < NOW() - INTERVAL '1 day' * days_old;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Cleaned up % old cache invalidation logs', deleted_count;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get cache invalidation statistics
CREATE OR REPLACE FUNCTION get_cache_invalidation_stats()
RETURNS TABLE (
    total_invalidations BIGINT,
    pending_invalidations BIGINT,
    processed_invalidations BIGINT,
    invalidations_last_hour BIGINT,
    most_common_table TEXT,
    most_active_user UUID,
    avg_processing_delay_seconds NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    WITH stats AS (
        SELECT 
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE processed = FALSE) as pending,
            COUNT(*) FILTER (WHERE processed = TRUE) as processed,
            COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '1 hour') as recent
        FROM cache_invalidation_log
    ),
    table_stats AS (
        SELECT table_name, COUNT(*) as cnt
        FROM cache_invalidation_log
        GROUP BY table_name
        ORDER BY cnt DESC
        LIMIT 1
    ),
    user_stats AS (
        SELECT user_id, COUNT(*) as cnt
        FROM cache_invalidation_log
        GROUP BY user_id
        ORDER BY cnt DESC
        LIMIT 1
    )
    SELECT 
        s.total,
        s.pending,
        s.processed,
        s.recent,
        ts.table_name,
        us.user_id,
        0::NUMERIC -- Placeholder for processing delay
    FROM stats s
    CROSS JOIN table_stats ts
    CROSS JOIN user_stats us;
END;
$$ LANGUAGE plpgsql;

-- Schedule cache invalidation processing (requires pg_cron)
-- This would run every minute to process pending invalidations
-- SELECT cron.schedule('process-cache-invalidations', '* * * * *', 'SELECT process_cache_invalidations(50);');

-- Schedule cleanup of old invalidation logs (weekly)
-- SELECT cron.schedule('cleanup-cache-logs', '0 2 * * SUN', 'SELECT cleanup_cache_invalidation_log(7);');

-- Grant permissions
GRANT EXECUTE ON FUNCTION notify_cache_invalidation TO authenticated;
GRANT EXECUTE ON FUNCTION process_cache_invalidations TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_cache_invalidation_log TO authenticated;
GRANT EXECUTE ON FUNCTION get_cache_invalidation_stats TO authenticated;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE ON cache_invalidation_log TO authenticated;

-- Create view for monitoring cache invalidations
CREATE OR REPLACE VIEW cache_invalidation_summary AS
SELECT 
    DATE_TRUNC('hour', created_at) as hour,
    table_name,
    invalidation_type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE processed = TRUE) as processed_count,
    COUNT(*) FILTER (WHERE processed = FALSE) as pending_count,
    array_agg(DISTINCT unnest(affected_cards)) as all_affected_cards
FROM cache_invalidation_log
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY DATE_TRUNC('hour', created_at), table_name, invalidation_type
ORDER BY hour DESC, count DESC;

GRANT SELECT ON cache_invalidation_summary TO authenticated;

-- Example usage queries:
/*
-- Check recent invalidations
SELECT * FROM cache_invalidation_log WHERE created_at >= NOW() - INTERVAL '1 hour' ORDER BY created_at DESC;

-- Get invalidation statistics
SELECT * FROM get_cache_invalidation_stats();

-- View hourly summary
SELECT * FROM cache_invalidation_summary ORDER BY hour DESC LIMIT 20;

-- Process pending invalidations manually
SELECT process_cache_invalidations(100);

-- Clean up old logs
SELECT cleanup_cache_invalidation_log(7);
*/

COMMENT ON FUNCTION notify_cache_invalidation IS 'Triggers cache invalidation for affected Super Cards when data changes';
COMMENT ON TABLE cache_invalidation_log IS 'Log of all cache invalidation events triggered by data changes';
COMMENT ON FUNCTION process_cache_invalidations IS 'Processes pending cache invalidation requests in batches';
COMMENT ON FUNCTION get_cache_invalidation_stats IS 'Returns statistics about cache invalidation activity';
COMMENT ON VIEW cache_invalidation_summary IS 'Hourly summary of cache invalidation activity by table and type';