-- ==============================================
-- Recreate Database Triggers
-- ==============================================
-- This script recreates the database triggers for user creation
-- Run this in your Supabase SQL Editor

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create user preferences
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (
    profile_id,
    email_notifications,
    push_notifications,
    weekly_match_reminders,
    marketing_emails,
    privacy_level
  )
  VALUES (
    NEW.id,
    true,
    true,
    true,
    false,
    'standard'
  )
  ON CONFLICT (profile_id) DO NOTHING;
  
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

SELECT 'Database triggers recreated successfully!' as status;
