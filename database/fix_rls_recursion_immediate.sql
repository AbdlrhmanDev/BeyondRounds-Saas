-- =====================================================
-- BeyondRounds RLS Recursion Fix - IMMEDIATE SOLUTION
-- =====================================================
-- Execute this SQL directly in Supabase SQL Editor to fix the infinite recursion

-- Step 1: Drop the problematic function that causes recursion
DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);

-- Step 2: Drop all existing match_members policies
DROP POLICY IF EXISTS "Users can view own match memberships" ON public.match_members;
DROP POLICY IF EXISTS "Match members can view other members" ON public.match_members;
DROP POLICY IF EXISTS "Admins can manage all match members" ON public.match_members;

-- Step 3: Ensure helper functions exist (recreate if needed)
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
$$;

-- Step 4: Create simple, non-recursive policies for match_members
CREATE POLICY "Users can view own match memberships" ON public.match_members
  FOR SELECT USING (profile_id = public.current_profile_id());

-- Step 5: Create a simple policy for viewing other members (NO RECURSION)
CREATE POLICY "Match members can view other members" ON public.match_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.match_members mm2
      JOIN public.profiles p ON mm2.profile_id = p.id
      WHERE mm2.match_id = match_members.match_id 
      AND p.user_id = auth.uid()
      AND mm2.is_active = true
    )
  );

-- Step 6: Create admin policy
CREATE POLICY "Admins can manage all match members" ON public.match_members
  FOR ALL USING (public.is_admin());

-- Step 7: Ensure profiles table has proper policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- Step 8: Test the fix
SELECT 'RLS recursion fix completed successfully!' as status;

-- Step 9: Verify the policies
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('match_members', 'profiles')
ORDER BY tablename, policyname;
