-- Emergency RLS Fix - Disable RLS temporarily
-- Execute this in Supabase SQL Editor to test dashboard access

-- Temporarily disable RLS on match_members to test
ALTER TABLE public.match_members DISABLE ROW LEVEL SECURITY;

-- Test if we can access profiles now
SELECT 'RLS temporarily disabled on match_members' as status;
