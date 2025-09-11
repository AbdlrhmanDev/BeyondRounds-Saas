-- ========================================
-- COMPLETE RLS RESET AND FIX
-- ========================================
-- This script completely resets all RLS policies to fix infinite recursion

-- Step 1: Show current policies causing issues
SELECT 
    '=== CURRENT PROBLEMATIC POLICIES ===' as info,
    schemaname,
    tablename,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE tablename IN ('match_members', 'matches', 'profiles')
ORDER BY tablename, policyname;

-- Step 2: Completely disable RLS temporarily to break the recursion
ALTER TABLE match_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE matches DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL existing policies on these tables
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all policies on match_members
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'match_members'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON match_members';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
    
    -- Drop all policies on matches
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'matches'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON matches';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
    
    -- Drop problematic profiles policies
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname LIKE '%select%'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(policy_record.policyname) || ' ON profiles';
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Step 4: Create very simple, non-recursive policies
-- For match_members: users can only see their own records
CREATE POLICY "simple_match_members_policy" ON match_members
    FOR ALL USING (user_id = auth.uid());

-- For matches: users can see matches they're part of OR all active matches
CREATE POLICY "simple_matches_policy" ON matches
    FOR SELECT USING (
        status = 'active' OR 
        EXISTS (
            SELECT 1 FROM match_members mm 
            WHERE mm.match_id = matches.id 
            AND mm.user_id = auth.uid()
        )
    );

-- For profiles: authenticated users can read all profiles
CREATE POLICY "simple_profiles_read_policy" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

-- Step 5: Re-enable RLS
ALTER TABLE match_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Step 6: Test the new policies
SELECT 
    '=== TESTING NEW POLICIES ===' as test;

-- Test match_members query
SELECT 
    'match_members test' as table_name,
    COUNT(*) as record_count
FROM match_members 
LIMIT 1;

-- Test matches query  
SELECT 
    'matches test' as table_name,
    COUNT(*) as record_count
FROM matches 
LIMIT 1;

-- Test profiles query
SELECT 
    'profiles test' as table_name,
    COUNT(*) as record_count
FROM profiles 
LIMIT 1;

-- Step 7: Show final policies
SELECT 
    '=== FINAL POLICIES AFTER RESET ===' as info,
    tablename,
    policyname,
    cmd as operation
FROM pg_policies 
WHERE tablename IN ('match_members', 'matches', 'profiles')
ORDER BY tablename, policyname;

-- Step 8: Force refresh any cached policies
NOTIFY pgrst, 'reload schema';

SELECT 
    '🎉 COMPLETE RLS RESET COMPLETED!' as status,
    'All policies have been reset with simple, non-recursive logic' as message,
    'Test your debug dashboard now - infinite recursion should be gone!' as next_step;
