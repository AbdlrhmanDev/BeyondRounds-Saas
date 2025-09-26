-- =====================================================
-- Detailed Database Analysis
-- =====================================================
-- This script provides detailed analysis of your current database

-- =====================================================
-- 1) Index Analysis by Table
-- =====================================================
SELECT 
    tablename,
    COUNT(*) as index_count,
    STRING_AGG(indexname, ', ' ORDER BY indexname) as indexes
FROM pg_indexes 
WHERE schemaname = 'public' 
GROUP BY tablename
ORDER BY index_count DESC, tablename;

-- =====================================================
-- 2) Check for Critical Missing Indexes
-- =====================================================
WITH critical_indexes AS (
    SELECT 'profiles' as table_name, 'idx_profiles_city_specialty' as index_name, 'City + Specialty search' as purpose
    UNION ALL SELECT 'profiles', 'idx_profiles_age_gender', 'Age + Gender filtering'
    UNION ALL SELECT 'matches', 'idx_matches_week_size', 'Week + Group size queries'
    UNION ALL SELECT 'chat_messages', 'idx_chat_messages_room_created', 'Room + Created time'
    UNION ALL SELECT 'match_members', 'idx_match_members_profile_active', 'Profile + Active status'
)
SELECT 
    ci.table_name,
    ci.index_name,
    ci.purpose,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE schemaname = 'public' 
            AND tablename = ci.table_name 
            AND indexname = ci.index_name
        ) THEN '✅ EXISTS' 
        ELSE '❌ MISSING' 
    END as status
FROM critical_indexes ci
ORDER BY ci.table_name, ci.index_name;

-- =====================================================
-- 3) Function Analysis
-- =====================================================
SELECT 
    routine_name,
    routine_type,
    data_type,
    CASE 
        WHEN routine_name IN ('is_admin', 'is_moderator_or_admin', 'current_profile_id', 'is_member_of_match') 
        THEN '✅ Security Function'
        ELSE 'ℹ️ Other Function'
    END as category
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY category DESC, routine_name;

-- =====================================================
-- 4) Policy Analysis
-- =====================================================
SELECT 
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ' ORDER BY policyname) as policies
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY policy_count DESC, tablename;

-- =====================================================
-- 5) Constraint Analysis
-- =====================================================
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    CASE 
        WHEN tc.constraint_name LIKE '%_key' THEN '🔑 Unique/Primary'
        WHEN tc.constraint_name LIKE '%_fkey' THEN '🔗 Foreign Key'
        WHEN tc.constraint_name LIKE '%_check' THEN '✅ Check Constraint'
        ELSE 'ℹ️ Other'
    END as constraint_category
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- =====================================================
-- 6) Performance Recommendations
-- =====================================================
SELECT 
    'PERFORMANCE ANALYSIS' as section,
    'Your database has ' || COUNT(*) || ' indexes' as current_status,
    CASE 
        WHEN COUNT(*) >= 70 THEN '🟢 EXCELLENT - Well optimized'
        WHEN COUNT(*) >= 50 THEN '🟡 GOOD - Some optimization possible'
        ELSE '🔴 NEEDS OPTIMIZATION'
    END as recommendation
FROM pg_indexes 
WHERE schemaname = 'public'

UNION ALL

SELECT 
    'PERFORMANCE ANALYSIS',
    'Security functions: ' || COUNT(*) || ' available',
    CASE 
        WHEN COUNT(*) >= 4 THEN '🟢 EXCELLENT - Full security coverage'
        WHEN COUNT(*) >= 2 THEN '🟡 GOOD - Basic security'
        ELSE '🔴 NEEDS SECURITY FUNCTIONS'
    END
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('is_admin', 'is_moderator_or_admin', 'current_profile_id', 'is_member_of_match')

UNION ALL

SELECT 
    'PERFORMANCE ANALYSIS',
    'RLS Policies: ' || COUNT(*) || ' active',
    CASE 
        WHEN COUNT(*) >= 20 THEN '🟢 EXCELLENT - Comprehensive security'
        WHEN COUNT(*) >= 10 THEN '🟡 GOOD - Basic security coverage'
        ELSE '🔴 NEEDS MORE POLICIES'
    END
FROM pg_policies 
WHERE schemaname = 'public';

-- =====================================================
-- 7) Next Steps Recommendation
-- =====================================================
SELECT 
    'NEXT STEPS' as section,
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') >= 70 
        AND (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('is_admin', 'is_moderator_or_admin', 'current_profile_id', 'is_member_of_match')) >= 4
        THEN '🎉 Your database is excellently optimized! No immediate action needed.'
        WHEN (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') >= 50
        THEN '✅ Your database is well optimized. Consider running essential_optimizations.sql for minor improvements.'
        ELSE '⚠️ Consider running essential_optimizations.sql for better performance.'
    END as recommendation;
