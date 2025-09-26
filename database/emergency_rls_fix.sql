-- ==============================================
-- Emergency RLS Fix - Disable All Admin Policies
-- ==============================================
-- This script temporarily disables all problematic RLS policies
-- Run this in your Supabase SQL Editor

-- Drop ALL admin policies that might cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all matches" ON matches;
DROP POLICY IF EXISTS "Admins can manage all matches" ON matches;
DROP POLICY IF EXISTS "Admins can view all match members" ON match_members;
DROP POLICY IF EXISTS "Admins can manage all match members" ON match_members;
DROP POLICY IF EXISTS "Admins can view all chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can manage all chat messages" ON chat_messages;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can view all payment history" ON payment_history;
DROP POLICY IF EXISTS "Admins can view all user preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admins can manage all user preferences" ON user_preferences;

-- Drop the problematic function
DROP FUNCTION IF EXISTS is_admin_user();

-- Create simple policies that don't cause recursion
-- Basic user policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Service role policies (these are safe)
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can create user preferences" ON user_preferences;

CREATE POLICY "Service role can create profiles" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can create user preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Fix user preferences policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

SELECT 'Emergency RLS fix completed - recursion should be resolved!' as status;

