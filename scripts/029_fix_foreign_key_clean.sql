-- ========================================
-- FIX FOREIGN KEY CONSTRAINT (CLEAN VERSION)
-- ========================================
-- The match_members table references auth.users but our profiles use different IDs

-- Check what the current match_members table structure looks like
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'match_members' 
ORDER BY ordinal_position;

-- Check current foreign key constraints
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'match_members';

-- Drop the existing foreign key constraint
ALTER TABLE match_members DROP CONSTRAINT IF EXISTS match_members_user_id_fkey;

-- Add a new constraint that references profiles instead of auth.users
ALTER TABLE match_members 
ADD CONSTRAINT match_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Verify the constraint was added
SELECT 
    'Foreign key constraint updated successfully!' as status,
    'match_members.user_id now references profiles.id' as details;

-- Now test the matching again
SELECT trigger_manual_matching();

-- Check the results
SELECT 
    execution_date,
    total_eligible_users,
    groups_created,
    users_matched,
    users_unmatched,
    'SUCCESS!' as status
FROM matching_logs 
ORDER BY created_at DESC 
LIMIT 1;

-- Show the created groups if any
SELECT 
    m.group_name,
    COUNT(mm.user_id) as group_size,
    string_agg(p.first_name || ' ' || p.last_name, ', ') as members,
    string_agg(DISTINCT p.city, ', ') as cities,
    m.created_at
FROM matches m
JOIN match_members mm ON m.id = mm.match_id
JOIN profiles p ON mm.user_id = p.id
WHERE m.created_at >= CURRENT_DATE - INTERVAL '1 hour'
GROUP BY m.id, m.group_name, m.created_at
ORDER BY m.created_at DESC;

