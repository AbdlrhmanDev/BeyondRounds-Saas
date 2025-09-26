-- ==============================================
-- Ultra Minimal Database Fix - Handle Existing Policies
-- ==============================================
-- This script creates the most minimal trigger possible and handles existing policies
-- Run this in your Supabase SQL Editor

-- Drop existing conflicting triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_user_preferences_trigger ON profiles;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS create_user_preferences();

-- Create ultra minimal function to create profile when auth user is created
-- Only using the absolute minimum fields
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
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Handle existing policies gracefully
-- Drop existing service role policies if they exist
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;
DROP POLICY IF EXISTS "Service role can create user preferences" ON user_preferences;

-- Create service role policies
CREATE POLICY "Service role can create profiles" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Only create user preferences policy if the table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
    CREATE POLICY "Service role can create user preferences" ON user_preferences
      FOR INSERT WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;

SELECT 'Ultra minimal database fix completed!' as status;
