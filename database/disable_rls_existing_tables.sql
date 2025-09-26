-- ==============================================
-- Disable RLS on Existing Tables Only
-- ==============================================
-- This script disables RLS only on tables that exist
-- Run this in your Supabase SQL Editor

-- Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on user_preferences table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
    ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

-- Drop policies for user_preferences if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
    DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
    DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
    DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
    DROP POLICY IF EXISTS "Service role can create user preferences" ON user_preferences;
    DROP POLICY IF EXISTS "Admins can view all user preferences" ON user_preferences;
    DROP POLICY IF EXISTS "Admins can manage all user preferences" ON user_preferences;
  END IF;
END $$;

-- Drop the problematic function
DROP FUNCTION IF EXISTS is_admin_user();

SELECT 'RLS disabled on existing tables - test login now!' as status;

