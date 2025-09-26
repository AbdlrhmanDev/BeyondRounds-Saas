-- ==============================================
-- Migration 002: Row Level Security Policies
-- ==============================================
-- Run this script after the initial schema setup
-- This sets up comprehensive RLS policies for data protection

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE matching_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view matches they're in" ON matches;
DROP POLICY IF EXISTS "Users can view match members for their matches" ON match_members;
DROP POLICY IF EXISTS "Users can view their own match memberships" ON match_members;
DROP POLICY IF EXISTS "Users can view messages from their matches" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their matches" ON chat_messages;
DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can create own verification requests" ON verification_requests;
DROP POLICY IF EXISTS "Users can view own payment history" ON payment_history;
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;

-- ==============================================
-- USER POLICIES
-- ==============================================

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Matches policies
CREATE POLICY "Users can view matches they're in" ON matches
  FOR SELECT USING (
    id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Match members policies
CREATE POLICY "Users can view match members for their matches" ON match_members
  FOR SELECT USING (
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can view their own match memberships" ON match_members
  FOR SELECT USING (user_id = auth.uid());

-- Chat messages policies
CREATE POLICY "Users can view messages from their matches" ON chat_messages
  FOR SELECT USING (
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can send messages to their matches" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update their own messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Verification requests policies
CREATE POLICY "Users can view own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verification requests" ON verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment history policies
CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- ADMIN POLICIES
-- ==============================================

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all matches
CREATE POLICY "Admins can view all matches" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all matches" ON matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all match members
CREATE POLICY "Admins can view all match members" ON match_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all match members" ON match_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all chat messages
CREATE POLICY "Admins can view all chat messages" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all chat messages" ON chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all verification requests
CREATE POLICY "Admins can view all verification requests" ON verification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update verification requests" ON verification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all matching logs
CREATE POLICY "Admins can view all matching logs" ON matching_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all matching logs" ON matching_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all notifications
CREATE POLICY "Admins can view all notifications" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all payment history
CREATE POLICY "Admins can view all payment history" ON payment_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all user preferences
CREATE POLICY "Admins can view all user preferences" ON user_preferences
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all user preferences" ON user_preferences
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==============================================
-- SERVICE ROLE POLICIES (for CRON jobs and server operations)
-- ==============================================

-- Service role can manage matching logs
CREATE POLICY "Service role can manage matching logs" ON matching_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Service role can read profiles for matching
CREATE POLICY "Service role can read profiles for matching" ON profiles
  FOR SELECT USING (auth.role() = 'service_role');

-- Service role can create matches
CREATE POLICY "Service role can create matches" ON matches
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Service role can create match members
CREATE POLICY "Service role can create match members" ON match_members
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Service role can create chat messages
CREATE POLICY "Service role can create chat messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Service role can create notifications
CREATE POLICY "Service role can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ==============================================
-- HELPER FUNCTIONS FOR RLS
-- ==============================================

-- Function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = uid AND role = 'admin'
  );
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(uid uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM profiles WHERE id = uid),
    'user'
  );
$$;

-- Function to check if user is verified and paid
CREATE OR REPLACE FUNCTION is_user_verified_and_paid(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = uid AND is_verified = true AND is_paid = true
  );
$$;

-- Function to check if user completed onboarding
CREATE OR REPLACE FUNCTION is_user_onboarded(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = uid AND onboarding_completed = true
  );
$$;
