-- ==============================================
-- Ultra Simple RLS Fix - Only Existing Tables
-- ==============================================
-- This script only fixes RLS for tables that actually exist
-- Run this in your Supabase SQL Editor

-- Drop ALL policies that might cause recursion
-- Only drop policies for tables that exist
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;

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

-- Create simple, safe policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service role can create profiles" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Create simple, safe policies for user_preferences if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
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

    CREATE POLICY "Service role can create user preferences" ON user_preferences
      FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

SELECT 'Ultra simple RLS fix completed!' as status;

