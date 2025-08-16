-- Development RLS Policies for Mock Authentication
-- This script adds temporary RLS policies to allow development with mock user ID
-- IMPORTANT: These policies should be removed in production!

-- Add development policies for the mock user ID
-- Mock User ID: '550e8400-e29b-41d4-a716-446655440000'

-- ==================================================
-- USERS TABLE - Development Policies
-- ==================================================

-- Allow mock user to insert/update their profile
CREATE POLICY "Allow mock user profile operations" ON users
  FOR ALL USING (id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
  WITH CHECK (id = '550e8400-e29b-41d4-a716-446655440000'::uuid);

-- ==================================================
-- PORTFOLIOS TABLE - Development Policies
-- ==================================================

-- Allow mock user to manage their portfolios
CREATE POLICY "Allow mock user portfolio operations" ON portfolios
  FOR ALL USING (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
  WITH CHECK (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid);

-- ==================================================
-- HOLDINGS TABLE - Development Policies
-- ==================================================

-- Allow mock user to manage holdings in their portfolios
CREATE POLICY "Allow mock user holdings operations" ON holdings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM portfolios p 
      WHERE p.id = holdings.portfolio_id 
      AND p.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios p 
      WHERE p.id = holdings.portfolio_id 
      AND p.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
    )
  );

-- ==================================================
-- TRANSACTIONS TABLE - Development Policies
-- ==================================================

-- Allow mock user to manage transactions in their portfolios
CREATE POLICY "Allow mock user transaction operations" ON transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM portfolios p 
      WHERE p.id = transactions.portfolio_id 
      AND p.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM portfolios p 
      WHERE p.id = transactions.portfolio_id 
      AND p.user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid
    )
  );

-- ==================================================
-- EXPENSES TABLE - Development Policies
-- ==================================================

-- Allow mock user to manage their expenses
CREATE POLICY "Allow mock user expense operations" ON expenses
  FOR ALL USING (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
  WITH CHECK (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid);

-- ==================================================
-- BUDGETS TABLE - Development Policies
-- ==================================================

-- Allow mock user to manage their budgets
CREATE POLICY "Allow mock user budget operations" ON budgets
  FOR ALL USING (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
  WITH CHECK (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid);

-- ==================================================
-- FINANCIAL_GOALS TABLE - Development Policies
-- ==================================================

-- Allow mock user to manage their financial goals
CREATE POLICY "Allow mock user financial goal operations" ON financial_goals
  FOR ALL USING (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
  WITH CHECK (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid);

-- ==================================================
-- USER_SESSIONS TABLE - Development Policies
-- ==================================================

-- Allow mock user to manage their sessions
CREATE POLICY "Allow mock user session operations" ON user_sessions
  FOR ALL USING (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid)
  WITH CHECK (user_id = '550e8400-e29b-41d4-a716-446655440000'::uuid);

-- ==================================================
-- VERIFICATION QUERIES
-- ==================================================

-- Verify the mock user exists (if not, create them)
INSERT INTO users (id, email, full_name, created_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000'::uuid,
  'demo@incomeclarity.app',
  'Demo User',
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Test query to verify policies work
-- This should succeed after applying the policies
-- SELECT id, email, full_name FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000'::uuid;

-- ==================================================
-- CLEANUP SCRIPT FOR PRODUCTION
-- ==================================================
-- When ready for production, run this to remove development policies:
-- 
-- DROP POLICY "Allow mock user profile operations" ON users;
-- DROP POLICY "Allow mock user portfolio operations" ON portfolios;
-- DROP POLICY "Allow mock user holdings operations" ON holdings;
-- DROP POLICY "Allow mock user transaction operations" ON transactions;
-- DROP POLICY "Allow mock user expense operations" ON expenses;
-- DROP POLICY "Allow mock user budget operations" ON budgets;
-- DROP POLICY "Allow mock user financial goal operations" ON financial_goals;
-- DROP POLICY "Allow mock user session operations" ON user_sessions;
-- 
-- DELETE FROM users WHERE id = '550e8400-e29b-41d4-a716-446655440000'::uuid;