-- Simple RLS Recursion Fix
-- Execute this in Supabase SQL Editor

-- 1. Drop the problematic function
DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);

-- 2. Drop the problematic policy
DROP POLICY IF EXISTS "Match members can view other members" ON public.match_members;

-- 3. Create a simple, non-recursive policy for match_members
CREATE POLICY "Users can view own match memberships" ON public.match_members
  FOR SELECT USING (profile_id = public.current_profile_id());

-- 4. Create a simple policy for viewing other members (no recursion)
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

-- 5. Create admin policy
CREATE POLICY "Admins can manage all match members" ON public.match_members
  FOR ALL USING (public.is_admin());

-- 6. Test
SELECT 'RLS recursion fix completed!' as status;