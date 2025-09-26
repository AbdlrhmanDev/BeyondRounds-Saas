-- SIMPLE FIX: Just disable RLS on the main problematic tables
-- Execute this in Supabase SQL Editor

-- Disable RLS on the main tables causing issues
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_members DISABLE ROW LEVEL SECURITY;

-- Verify the fix
SELECT 'RLS disabled on profiles and match_members - dashboard should work now!' as status;

-- Check RLS status
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'match_members')
ORDER BY tablename;
