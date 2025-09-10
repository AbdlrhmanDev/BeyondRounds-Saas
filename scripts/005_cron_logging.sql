-- Additional database functions for cron job logging
-- Run this after the main schema script

-- ==============================================
-- MATCHING LOGS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS matching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week DATE NOT NULL,
  groups_created INTEGER NOT NULL DEFAULT 0,
  eligible_users INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for matching logs
CREATE INDEX IF NOT EXISTS idx_matching_logs_week ON matching_logs(week);
CREATE INDEX IF NOT EXISTS idx_matching_logs_created ON matching_logs(created_at);

-- Enable RLS on matching logs
ALTER TABLE matching_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view matching logs
CREATE POLICY "Admins can view matching logs" ON matching_logs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.email LIKE '%@beyondrounds.com'
  )
);

-- ==============================================
-- HELPER FUNCTIONS FOR CRON JOBS
-- ==============================================

-- Function to create matching logs table if it doesn't exist
CREATE OR REPLACE FUNCTION create_matching_logs_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function is called by the cron job to ensure the table exists
  -- The table creation is handled above, this is just a placeholder
  RETURN;
END;
$$;

-- Function to get matching statistics
CREATE OR REPLACE FUNCTION get_matching_stats()
RETURNS TABLE (
  total_matches INTEGER,
  active_matches INTEGER,
  total_users INTEGER,
  verified_users INTEGER,
  paid_users INTEGER,
  eligible_users INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM matches) as total_matches,
    (SELECT COUNT(*)::INTEGER FROM matches WHERE status = 'active') as active_matches,
    (SELECT COUNT(*)::INTEGER FROM profiles) as total_users,
    (SELECT COUNT(*)::INTEGER FROM profiles WHERE is_verified = true) as verified_users,
    (SELECT COUNT(*)::INTEGER FROM profiles WHERE is_paid = true) as paid_users,
    (SELECT COUNT(*)::INTEGER FROM profiles 
     WHERE is_verified = true AND is_paid = true 
     AND interests IS NOT NULL AND availability_slots IS NOT NULL) as eligible_users;
END;
$$;

-- Function to clean up old matching logs (keep 1 year)
CREATE OR REPLACE FUNCTION cleanup_old_matching_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM matching_logs 
  WHERE created_at < NOW() - INTERVAL '1 year';
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION create_matching_logs_table_if_not_exists() TO service_role;
GRANT EXECUTE ON FUNCTION get_matching_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_matching_logs() TO service_role;
