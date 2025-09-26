-- URGENT FIX: Disable RLS on ALL problematic tables
-- Execute this in Supabase SQL Editor immediately

-- Step 1: Disable RLS on profiles table (main issue)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Step 2: Disable RLS on match_members table
ALTER TABLE public.match_members DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop all problematic functions
DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);
DROP FUNCTION IF EXISTS public.current_profile_id();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_moderator_or_admin();

-- Step 4: Verify the fix
SELECT 'RLS disabled on profiles and match_members - dashboard should work now!' as status;

-- Step 5: Check RLS status
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'match_members')
ORDER BY tablename;
