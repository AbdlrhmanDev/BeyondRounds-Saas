-- =====================================================
-- QUICK RLS FIX - Run this immediately
-- =====================================================
-- Execute this SQL in Supabase SQL Editor

-- Step 1: Temporarily disable RLS to test
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Test if this fixes the issue
SELECT 'RLS disabled for testing - try login now!' as status;

-- Step 3: After confirming login works, re-enable with simple policies
-- (Run this after testing)
/*
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create simple policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );
*/


