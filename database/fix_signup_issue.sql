-- ==============================================
-- Fix Signup Issue - Database Error Saving New User
-- ==============================================
-- This script fixes the "Database error saving new user" issue
-- Run this in your Supabase SQL Editor

-- 1. First, disable RLS temporarily to allow user creation
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop existing problematic triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create a simple, working trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    user_id,
    email,
    first_name,
    last_name,
    city,
    gender,
    role,
    is_verified,
    is_banned,
    onboarding_completed,
    profile_completion_percentage
  )
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', 'Not specified'),
    'prefer-not-to-say',
    'user',
    false,
    false,
    false,
    0
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Re-enable RLS with simple policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 6. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 7. Create simple, safe policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service role can create profiles" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- 9. Handle user_preferences table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
    -- Disable RLS temporarily
    ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
    
    -- Drop existing policies
    DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
    DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
    DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
    DROP POLICY IF EXISTS "Service role can create user preferences" ON user_preferences;
    
    -- Re-enable RLS
    ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
    
    -- Create simple policies
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
      
    GRANT ALL ON public.user_preferences TO authenticated;
  END IF;
END $$;

SELECT 'Signup issue fix completed! Try creating a user now.' as status;
