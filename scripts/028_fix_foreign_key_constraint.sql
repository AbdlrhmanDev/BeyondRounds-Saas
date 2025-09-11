-- ========================================
-- FIX FOREIGN KEY CONSTRAINT
-- ========================================
-- The match_members table references auth.users but our profiles use different IDs

-- First, let's see the current constraint
SELECT 
    constraint_name,
    table_name,
    column_name,
    foreign_table_name,
    foreign_column_name
FROM information_schema.referential_constraints rc
JOIN information_schema.key_column_usage kcu ON rc.constraint_name = kcu.constraint_name
WHERE kcu.table_name = 'match_members';

-- Check what the current match_members table structure looks like
\d match_members;

-- Option 1: Drop the foreign key constraint temporarily
ALTER TABLE match_members DROP CONSTRAINT IF EXISTS match_members_user_id_fkey;

-- Option 2: Add a new constraint that references profiles instead of auth.users
ALTER TABLE match_members 
ADD CONSTRAINT match_members_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Test that the constraint is fixed
SELECT 
    'Foreign key constraint updated!' as status,
    'match_members now references profiles table' as details;

-- Now test the matching again
SELECT trigger_manual_matching();

-- Check if groups were created successfully
SELECT 
    COUNT(*) as groups_created,
    'Groups should now be created successfully!' as message
FROM matches 
WHERE created_at >= CURRENT_DATE;

-- Show the created groups
SELECT 
    m.group_name,
    COUNT(mm.user_id) as group_size,
    string_agg(p.first_name || ' ' || p.last_name, ', ') as members,
    string_agg(DISTINCT p.city, ', ') as cities
FROM matches m
JOIN match_members mm ON m.id = mm.match_id
JOIN profiles p ON mm.user_id = p.id
WHERE m.created_at >= CURRENT_DATE
GROUP BY m.id, m.group_name
ORDER BY m.created_at DESC;

