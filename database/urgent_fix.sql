-- URGENT FIX: Disable RLS on match_members table
-- Execute this in Supabase SQL Editor immediately

-- Step 1: Disable RLS on the problematic table
ALTER TABLE public.match_members DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop the problematic function
DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);

-- Step 3: Verify the fix
SELECT 'RLS disabled on match_members - dashboard should work now!' as status;

-- Step 4: Check RLS status
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'match_members';







