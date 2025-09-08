-- Add indexes for better matching algorithm performance
CREATE INDEX IF NOT EXISTS idx_profiles_matching ON profiles(is_verified, is_paid, city) WHERE is_verified = true AND is_paid = true;

CREATE INDEX IF NOT EXISTS idx_matches_week ON matches(match_week);

CREATE INDEX IF NOT EXISTS idx_match_members_user ON match_members(user_id);

CREATE INDEX IF NOT EXISTS idx_match_members_match ON match_members(match_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_match ON chat_messages(match_id, created_at);

-- Add function to clean up old verification documents (90 day retention)
CREATE OR REPLACE FUNCTION cleanup_old_verification_documents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete verification documents older than 90 days
  DELETE FROM verification_documents 
  WHERE submitted_at < NOW() - INTERVAL '90 days';
  
  -- Note: Storage files should be cleaned up separately via admin panel or cron job
END;
$$;

-- Create trigger to automatically clean up old documents weekly
DROP TRIGGER IF EXISTS trigger_cleanup_verification_documents ON verification_documents;
