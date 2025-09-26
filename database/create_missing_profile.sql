-- ==============================================
-- Create Missing Profile for User
-- ==============================================
-- Run this in Supabase SQL Editor to create the missing profile
-- for user: eafceba3-e4f2-4899-8bfa-2da27423296d

-- First, check if the profile already exists
SELECT 
  id,
  user_id,
  email,
  first_name,
  last_name,
  onboarding_completed
FROM public.profiles 
WHERE user_id = 'eafceba3-e4f2-4899-8bfa-2da27423296d';

-- If no profile exists, create one
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
  medical_specialty
)
VALUES (
  'eafceba3-e4f2-4899-8bfa-2da27423296d',
  'user@example.com',
  '',
  '',
  'Not specified',
  'prefer-not-to-say',
  'user',
  false,
  false,
  false,
  'Not specified'
)
ON CONFLICT (user_id) DO NOTHING;

-- Verify the profile was created
SELECT 
  id,
  user_id,
  email,
  first_name,
  last_name,
  onboarding_completed,
  created_at
FROM public.profiles 
WHERE user_id = 'eafceba3-e4f2-4899-8bfa-2da27423296d';

-- Also check if we need to create the profile creation trigger
-- This trigger should automatically create profiles for new users
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
    medical_specialty
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
    'Not specified'
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

SELECT 'Profile creation setup completed!' as status;
