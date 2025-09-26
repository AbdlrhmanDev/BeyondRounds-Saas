-- =====================================================
-- EMERGENCY FIX - TEMPORARILY DISABLE RLS
-- =====================================================
-- Execute this SQL directly in Supabase SQL Editor
-- This will allow dashboard access while we fix the recursion issue

-- Temporarily disable RLS on match_members table
ALTER TABLE public.match_members DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'match_members';

-- Test message
SELECT 'RLS temporarily disabled on match_members - dashboard should work now!' as status;
