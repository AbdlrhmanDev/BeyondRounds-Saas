-- ==============================================
-- Re-enable RLS with Safe Policies
-- ==============================================
-- This script re-enables RLS with safe policies
-- Run this when you want to restore security
-- Run this in your Supabase SQL Editor

-- Re-enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Re-enable RLS on user_preferences table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
    ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

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

SELECT 'RLS re-enabled with safe policies!' as status;
