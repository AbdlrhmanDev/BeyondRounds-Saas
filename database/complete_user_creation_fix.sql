-- ==============================================
-- Complete Database Fix for User Creation Issues
-- ==============================================
-- This script fixes all the database issues preventing user creation
-- Run this in your Supabase SQL Editor

-- 1. Fix Profile Trigger - Correct Field Names
-- ==============================================

-- Drop existing conflicting triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_user_preferences_trigger ON profiles;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS create_user_preferences();

-- Create corrected function to create profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id, -- Use id field as per actual schema
    email,
    first_name,
    last_name,
    city,
    gender,
    role,
    is_verified,
    is_paid, -- Use is_paid instead of is_banned
    onboarding_completed,
    profile_completion_percentage
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', 'Not specified'),
    'prefer-not-to-say', -- Required field with default value
    'user',
    false,
    false,
    false,
    0
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create corrected function to create user preferences on profile creation
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id) -- Use user_id field as per actual schema
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to create user preferences
CREATE TRIGGER create_user_preferences_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_preferences();

-- 2. Ensure Required Fields Have Defaults
-- ==============================================

-- Make sure gender_preference has a default value
ALTER TABLE profiles ALTER COLUMN gender_preference SET DEFAULT 'no-preference';

-- Make sure all required fields have proper defaults
ALTER TABLE profiles ALTER COLUMN city SET DEFAULT 'Not specified';

-- 3. Fix RLS Policies for Service Role
-- ==============================================

-- Allow service role to create profiles (for manual signup)
CREATE POLICY "Service role can create profiles" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Allow service role to create user preferences
CREATE POLICY "Service role can create user preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 4. Grant Necessary Permissions
-- ==============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_preferences TO authenticated;

-- Grant service role permissions
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.user_preferences TO service_role;

-- 5. Test the Fix
-- ==============================================

-- You can test this by trying to create a user through the manual signup API
-- The triggers should now work correctly with the proper field names

SELECT 'Database fix completed successfully!' as status;
