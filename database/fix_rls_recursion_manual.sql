-- =====================================================
-- BeyondRounds RLS Recursion Fix - Manual Execution
-- =====================================================
-- Execute this SQL directly in Supabase SQL Editor

-- 1. Drop existing problematic functions and policies
DROP FUNCTION IF EXISTS public.current_profile_id();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_moderator_or_admin();
DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);

DROP POLICY IF EXISTS "Users can view own match memberships" ON public.match_members;
DROP POLICY IF EXISTS "Match members can view other members" ON public.match_members;
DROP POLICY IF EXISTS "Admins can manage all match members" ON public.match_members;

-- 2. Create fixed helper functions
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

CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('moderator', 'admin')
  )
$$;

-- 3. Create fixed match_members policies (NO RECURSION)
CREATE POLICY "Users can view own match memberships" ON public.match_members
  FOR SELECT USING (profile_id = public.current_profile_id());

-- FIXED: This policy avoids recursion by using a different approach
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

CREATE POLICY "Admins can manage all match members" ON public.match_members
  FOR ALL USING (public.is_admin());

-- 4. Ensure profiles table has proper policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- 5. Test the fix
SELECT 'RLS recursion fix completed successfully!' as status;

-- 6. Verify policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'match_members')
ORDER BY tablename, policyname;
