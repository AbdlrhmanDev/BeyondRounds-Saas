-- =====================================================
-- Database Status Check Script
-- =====================================================
-- This script checks the current status of your database

-- =====================================================
-- 1) Check Current Indexes
-- =====================================================
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- =====================================================
-- 2) Check Current Functions
-- =====================================================
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('is_admin', 'is_moderator_or_admin', 'current_profile_id', 'is_member_of_match')
ORDER BY routine_name;

-- =====================================================
-- 3) Check Current Policies
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- 4) Check Table Sizes
-- =====================================================
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- 5) Check Missing Indexes (Performance Critical)
-- =====================================================
-- Check if critical indexes exist
SELECT 
    'profiles' as table_name,
    'idx_profiles_city_specialty' as missing_index,
    'Composite index for city + specialty searches' as description
WHERE NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND indexname = 'idx_profiles_city_specialty'
)

UNION ALL

SELECT 
    'matches' as table_name,
    'idx_matches_week_size' as missing_index,
    'Composite index for week + group size queries' as description
WHERE NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'matches' 
    AND indexname = 'idx_matches_week_size'
)

UNION ALL

SELECT 
    'chat_messages' as table_name,
    'idx_chat_messages_room_created' as missing_index,
    'Composite index for room + created_at queries' as description
WHERE NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'chat_messages' 
    AND indexname = 'idx_chat_messages_room_created'
);

-- =====================================================
-- 6) Check Missing Constraints
-- =====================================================
-- Check for missing unique constraints
SELECT 
    'match_members' as table_name,
    'UNIQUE constraint on (match_id, profile_id)' as missing_constraint,
    'Prevents duplicate members in same match' as description
WHERE NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'match_members_match_id_profile_id_key'
)

UNION ALL

SELECT 
    'message_reactions' as table_name,
    'UNIQUE constraint on (message_id, profile_id, emoji)' as missing_constraint,
    'Prevents duplicate reactions from same user' as description
WHERE NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'message_reactions_message_id_profile_id_emoji_key'
)

UNION ALL

SELECT 
    'message_read_status' as table_name,
    'UNIQUE constraint on (message_id, profile_id)' as missing_constraint,
    'Prevents duplicate read status from same user' as description
WHERE NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'message_read_status_message_id_profile_id_key'
);

-- =====================================================
-- 7) Summary Report
-- =====================================================
SELECT 
    'DATABASE STATUS SUMMARY' as report_section,
    'Total Tables: ' || COUNT(*) as info
FROM pg_tables 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'DATABASE STATUS SUMMARY',
    'Total Indexes: ' || COUNT(*)
FROM pg_indexes 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'DATABASE STATUS SUMMARY',
    'Total Policies: ' || COUNT(*)
FROM pg_policies 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'DATABASE STATUS SUMMARY',
    'Total Functions: ' || COUNT(*)
FROM information_schema.routines 
WHERE routine_schema = 'public';


