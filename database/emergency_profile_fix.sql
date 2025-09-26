-- ==============================================
-- Emergency Profile Fix
-- ==============================================
-- This script creates the missing profile and fixes RLS policies
-- Run this in Supabase SQL Editor

-- Step 1: Temporarily disable RLS to create the profile
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Create the missing profile
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

-- Step 3: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Step 5: Create proper RLS policies
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      WHERE p.user_id = auth.uid() 
      AND p.role = 'admin'
    )
  );

-- Step 6: Verify the profile was created
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

-- Step 7: Verify RLS policies
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
    ELSE 'No USING clause'
  END as using_clause
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public'
ORDER BY policyname;

-- Step 8: Create the profile creation trigger for future users
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

SELECT 'Emergency profile fix completed successfully!' as status;
