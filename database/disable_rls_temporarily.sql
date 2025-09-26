-- ==============================================
-- Temporary RLS Disable (Last Resort)
-- ==============================================
-- This script temporarily disables RLS on profiles table
-- Use ONLY if the emergency fix doesn't work
-- Run this in your Supabase SQL Editor

-- Temporarily disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Temporarily disable RLS on user_preferences table
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;

DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Service role can create user preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admins can view all user preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admins can manage all user preferences" ON user_preferences;

-- Drop the problematic function
DROP FUNCTION IF EXISTS is_admin_user();

SELECT 'RLS temporarily disabled - test login now!' as status;

