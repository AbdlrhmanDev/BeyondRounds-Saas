-- =====================================================
-- BeyondRounds RLS Policies - COMPLETE FIX
-- =====================================================
-- Execute this SQL in Supabase SQL Editor to fix all RLS issues

-- Step 1: Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;

-- Step 2: Drop problematic functions
DROP FUNCTION IF EXISTS public.current_profile_id();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);

-- Step 3: Create simple, reliable helper functions
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

-- Step 4: Create simple, non-recursive policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- Step 5: Fix match_members policies (if table exists)
DROP POLICY IF EXISTS "Users can view own match memberships" ON public.match_members;
DROP POLICY IF EXISTS "Match members can view other members" ON public.match_members;
DROP POLICY IF EXISTS "Admins can manage all match members" ON public.match_members;

-- Only create if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'match_members' AND table_schema = 'public') THEN
        CREATE POLICY "Users can view own match memberships" ON public.match_members
          FOR SELECT USING (profile_id = public.current_profile_id());

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
    END IF;
END $$;

-- Step 6: Create policies for other profile-related tables
DO $$
BEGIN
    -- Profile specialties
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_specialties' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view own specialties" ON public.profile_specialties;
        DROP POLICY IF EXISTS "Users can manage own specialties" ON public.profile_specialties;
        DROP POLICY IF EXISTS "Admins can manage all specialties" ON public.profile_specialties;
        
        CREATE POLICY "Users can view own specialties" ON public.profile_specialties
          FOR SELECT USING (profile_id = public.current_profile_id());
        
        CREATE POLICY "Users can manage own specialties" ON public.profile_specialties
          FOR ALL USING (profile_id = public.current_profile_id());
        
        CREATE POLICY "Admins can manage all specialties" ON public.profile_specialties
          FOR ALL USING (public.is_admin());
    END IF;

    -- Profile interests
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profile_interests' AND table_schema = 'public') THEN
        DROP POLICY IF EXISTS "Users can view own interests" ON public.profile_interests;
        DROP POLICY IF EXISTS "Users can manage own interests" ON public.profile_interests;
        DROP POLICY IF EXISTS "Admins can manage all interests" ON public.profile_interests;
        
        CREATE POLICY "Users can view own interests" ON public.profile_interests
          FOR SELECT USING (profile_id = public.current_profile_id());
        
        CREATE POLICY "Users can manage own interests" ON public.profile_interests
          FOR ALL USING (profile_id = public.current_profile_id());
        
        CREATE POLICY "Admins can manage all interests" ON public.profile_interests
          FOR ALL USING (public.is_admin());
    END IF;
END $$;

-- Step 7: Test the fix
SELECT 'RLS policies fixed successfully!' as status;

-- Step 8: Verify policies are working
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'match_members', 'profile_specialties', 'profile_interests')
ORDER BY tablename, policyname;


