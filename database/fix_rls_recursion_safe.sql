-- ==============================================
-- Fix Infinite Recursion in RLS Policies (Safe Version)
-- ==============================================
-- This script fixes the infinite recursion issue in profiles policies
-- Only handles tables that actually exist
-- Run this in your Supabase SQL Editor

-- Drop problematic admin policies that cause infinite recursion
-- Only drop policies for tables that exist
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

-- Create a function to check admin role without recursion
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = auth.uid() 
    AND raw_user_meta_data->>'role' = 'admin'
  );
$$;

-- Create corrected admin policies using the function
-- Only create policies for tables that exist
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin_user());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin_user());

-- Check if matches table exists before creating policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'matches') THEN
    CREATE POLICY "Admins can view all matches" ON matches
      FOR SELECT USING (is_admin_user());

    CREATE POLICY "Admins can manage all matches" ON matches
      FOR ALL USING (is_admin_user());
  END IF;
END $$;

-- Check if match_members table exists before creating policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_members') THEN
    CREATE POLICY "Admins can view all match members" ON match_members
      FOR SELECT USING (is_admin_user());

    CREATE POLICY "Admins can manage all match members" ON match_members
      FOR ALL USING (is_admin_user());
  END IF;
END $$;

-- Check if chat_messages table exists before creating policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages') THEN
    CREATE POLICY "Admins can view all chat messages" ON chat_messages
      FOR SELECT USING (is_admin_user());

    CREATE POLICY "Admins can manage all chat messages" ON chat_messages
      FOR ALL USING (is_admin_user());
  END IF;
END $$;

-- Check if notifications table exists before creating policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    CREATE POLICY "Admins can view all notifications" ON notifications
      FOR SELECT USING (is_admin_user());

    CREATE POLICY "Admins can manage all notifications" ON notifications
      FOR ALL USING (is_admin_user());
  END IF;
END $$;

-- Check if payment_history table exists before creating policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_history') THEN
    CREATE POLICY "Admins can view all payment history" ON payment_history
      FOR SELECT USING (is_admin_user());
  END IF;
END $$;

-- Check if user_preferences table exists before creating policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
    CREATE POLICY "Admins can view all user preferences" ON user_preferences
      FOR SELECT USING (is_admin_user());

    CREATE POLICY "Admins can manage all user preferences" ON user_preferences
      FOR ALL USING (is_admin_user());
  END IF;
END $$;

-- Fix user preferences policies to use correct field
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;

-- Create corrected user preferences policies
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

SELECT 'RLS policies fixed - infinite recursion resolved!' as status;

