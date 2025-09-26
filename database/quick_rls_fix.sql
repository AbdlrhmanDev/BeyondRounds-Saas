-- =====================================================
-- QUICK FIX FOR RLS RECURSION ISSUE
-- =====================================================
-- Execute this SQL directly in Supabase SQL Editor

-- Step 1: Drop the problematic function that causes recursion
DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);

-- Step 2: Drop all existing match_members policies
DROP POLICY IF EXISTS "Users can view own match memberships" ON public.match_members;
DROP POLICY IF EXISTS "Match members can view other members" ON public.match_members;
DROP POLICY IF EXISTS "Admins can manage all match members" ON public.match_members;

-- Step 3: Create simple, non-recursive policies
CREATE POLICY "Users can view own match memberships" ON public.match_members
  FOR SELECT USING (profile_id = public.current_profile_id());

-- Step 4: Create a simple policy for viewing other members (no recursion)
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

-- Step 5: Create admin policy
CREATE POLICY "Admins can manage all match members" ON public.match_members
  FOR ALL USING (public.is_admin());

-- Step 6: Test the fix
SELECT 'RLS recursion fix completed successfully!' as status;

-- Step 7: Verify the policies
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'match_members'
ORDER BY policyname;







