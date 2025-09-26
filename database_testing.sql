-- =====================================================
-- BeyondRounds Database Testing & Validation Script
-- اختبار والتحقق من قاعدة البيانات
-- =====================================================

-- =====================================================
-- 1. Pre-Optimization Testing
-- اختبارات ما قبل التحسين
-- =====================================================

-- Test 1: Check Current Database State
-- فحص الحالة الحالية لقاعدة البيانات
DO $$
BEGIN
    RAISE NOTICE '=== Starting Database Pre-Optimization Tests ===';
    RAISE NOTICE 'Database: %', current_database();
    RAISE NOTICE 'Timestamp: %', now();
END $$;

-- Test 2: Check Table Existence and Structure
-- فحص وجود الجداول والهيكل
CREATE OR REPLACE FUNCTION test_table_structure()
RETURNS TABLE(
    test_name text,
    status text,
    details text
) AS $$
BEGIN
    -- Test main tables exist
    RETURN QUERY
    SELECT 
        'Core Tables Existence'::text as test_name,
        CASE 
            WHEN COUNT(*) = 25 THEN 'PASS'::text
            ELSE 'FAIL'::text
        END as status,
        COUNT(*)::text || ' tables found (expected: 25)' as details
    FROM information_schema.tables 
    WHERE table_schema = 'public';
    
    -- Test primary keys exist
    RETURN QUERY
    SELECT 
        'Primary Keys'::text as test_name,
        CASE 
            WHEN COUNT(*) >= 20 THEN 'PASS'::text
            ELSE 'FAIL'::text
        END as status,
        COUNT(*)::text || ' primary keys found' as details
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'PRIMARY KEY' AND table_schema = 'public';
    
    -- Test foreign keys exist
    RETURN QUERY
    SELECT 
        'Foreign Keys'::text as test_name,
        CASE 
            WHEN COUNT(*) >= 30 THEN 'PASS'::text
            ELSE 'FAIL'::text
        END as status,
        COUNT(*)::text || ' foreign keys found' as details
    FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';
END;
$$ LANGUAGE plpgsql;

-- Test 3: Check Data Integrity
-- فحص سلامة البيانات
CREATE OR REPLACE FUNCTION test_data_integrity()
RETURNS TABLE(
    test_name text,
    status text,
    details text
) AS $$
DECLARE
    orphaned_count integer;
BEGIN
    -- Test for orphaned records in match_members
    SELECT COUNT(*) INTO orphaned_count
    FROM match_members mm
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = mm.profile_id);
    
    RETURN QUERY
    SELECT 
        'Match Members Integrity'::text as test_name,
        CASE 
            WHEN orphaned_count = 0 THEN 'PASS'::text
            ELSE 'FAIL'::text
        END as status,
        orphaned_count::text || ' orphaned records found' as details;
    
    -- Test for orphaned chat messages
    SELECT COUNT(*) INTO orphaned_count
    FROM chat_messages cm
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = cm.sender_id);
    
    RETURN QUERY
    SELECT 
        'Chat Messages Integrity'::text as test_name,
        CASE 
            WHEN orphaned_count = 0 THEN 'PASS'::text
            ELSE 'FAIL'::text
        END as status,
        orphaned_count::text || ' orphaned records found' as details;
    
    -- Test for invalid email formats
    SELECT COUNT(*) INTO orphaned_count
    FROM profiles 
    WHERE email IS NOT NULL 
    AND email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
    
    RETURN QUERY
    SELECT 
        'Email Format Validation'::text as test_name,
        CASE 
            WHEN orphaned_count = 0 THEN 'PASS'::text
            ELSE 'FAIL'::text
        END as status,
        orphaned_count::text || ' invalid email formats found' as details;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. Performance Testing
-- اختبار الأداء
-- =====================================================

-- Test 4: Query Performance Baseline
-- خط الأساس لأداء الاستعلامات
CREATE OR REPLACE FUNCTION test_query_performance()
RETURNS TABLE(
    query_name text,
    execution_time numeric,
    status text
) AS $$
DECLARE
    start_time timestamp;
    end_time timestamp;
    exec_time numeric;
BEGIN
    -- Test 1: Profile search query
    start_time := clock_timestamp();
    PERFORM * FROM profiles WHERE city = 'Riyadh' AND medical_specialty = 'Cardiology' LIMIT 10;
    end_time := clock_timestamp();
    exec_time := EXTRACT(milliseconds FROM end_time - start_time);
    
    RETURN QUERY
    SELECT 
        'Profile Search'::text as query_name,
        exec_time,
        CASE 
            WHEN exec_time < 100 THEN 'EXCELLENT'::text
            WHEN exec_time < 500 THEN 'GOOD'::text
            WHEN exec_time < 1000 THEN 'ACCEPTABLE'::text
            ELSE 'SLOW'::text
        END as status;
    
    -- Test 2: Match lookup query
    start_time := clock_timestamp();
    PERFORM m.*, mm.* FROM matches m 
    JOIN match_members mm ON m.id = mm.match_id 
    WHERE m.status = 'active' LIMIT 10;
    end_time := clock_timestamp();
    exec_time := EXTRACT(milliseconds FROM end_time - start_time);
    
    RETURN QUERY
    SELECT 
        'Match Lookup'::text as query_name,
        exec_time,
        CASE 
            WHEN exec_time < 100 THEN 'EXCELLENT'::text
            WHEN exec_time < 500 THEN 'GOOD'::text
            WHEN exec_time < 1000 THEN 'ACCEPTABLE'::text
            ELSE 'SLOW'::text
        END as status;
    
    -- Test 3: Chat messages query
    start_time := clock_timestamp();
    PERFORM * FROM chat_messages 
    WHERE chat_room_id = (SELECT id FROM chat_rooms LIMIT 1)
    ORDER BY created_at DESC LIMIT 50;
    end_time := clock_timestamp();
    exec_time := EXTRACT(milliseconds FROM end_time - start_time);
    
    RETURN QUERY
    SELECT 
        'Chat Messages'::text as query_name,
        exec_time,
        CASE 
            WHEN exec_time < 100 THEN 'EXCELLENT'::text
            WHEN exec_time < 500 THEN 'GOOD'::text
            WHEN exec_time < 1000 THEN 'ACCEPTABLE'::text
            ELSE 'SLOW'::text
        END as status;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. Post-Optimization Validation
-- التحقق بعد التحسين
-- =====================================================

-- Test 5: Index Validation
-- التحقق من الفهارس
CREATE OR REPLACE FUNCTION test_indexes_exist()
RETURNS TABLE(
    index_name text,
    table_name text,
    status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        indexname::text as index_name,
        tablename::text as table_name,
        CASE 
            WHEN indexname IS NOT NULL THEN 'EXISTS'::text
            ELSE 'MISSING'::text
        END as status
    FROM (
        VALUES 
        ('idx_profiles_email', 'profiles'),
        ('idx_profiles_city_specialty', 'profiles'),
        ('idx_profiles_last_active', 'profiles'),
        ('idx_matches_week_status', 'matches'),
        ('idx_chat_messages_room_created', 'chat_messages'),
        ('idx_notifications_profile_unread', 'notifications'),
        ('idx_match_members_profile_match', 'match_members'),
        ('idx_feedback_match_reviewer', 'feedback')
    ) AS expected_indexes(idx_name, tbl_name)
    LEFT JOIN pg_indexes ON indexname = idx_name AND tablename = tbl_name AND schemaname = 'public';
END;
$$ LANGUAGE plpgsql;

-- Test 6: Constraint Validation
-- التحقق من القيود
CREATE OR REPLACE FUNCTION test_constraints_exist()
RETURNS TABLE(
    constraint_name text,
    table_name text,
    constraint_type text,
    status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.constraint_name::text,
        tc.table_name::text,
        tc.constraint_type::text,
        'EXISTS'::text as status
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
    AND tc.constraint_name IN (
        'phone_number_format',
        'age_reasonable',
        'email_domain_check',
        'content_length_check',
        'feedback_text_length_check',
        'no_self_feedback',
        'no_self_ban',
        'unique_profile_match'
    );
END;
$$ LANGUAGE plpgsql;

-- Test 7: RLS Policy Validation
-- التحقق من سياسات RLS
CREATE OR REPLACE FUNCTION test_rls_policies()
RETURNS TABLE(
    table_name text,
    rls_enabled boolean,
    policy_count bigint,
    status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.relname::text as table_name,
        c.relrowsecurity as rls_enabled,
        COUNT(p.polname) as policy_count,
        CASE 
            WHEN c.relrowsecurity = true AND COUNT(p.polname) > 0 THEN 'CONFIGURED'::text
            WHEN c.relrowsecurity = true AND COUNT(p.polname) = 0 THEN 'RLS_ENABLED_NO_POLICIES'::text
            ELSE 'RLS_DISABLED'::text
        END as status
    FROM pg_class c
    LEFT JOIN pg_policy p ON c.oid = p.polrelid
    WHERE c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    AND c.relkind = 'r'
    AND c.relname IN ('profiles', 'chat_messages', 'feedback', 'notifications')
    GROUP BY c.relname, c.relrowsecurity;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. Load Testing Functions
-- دوال اختبار الحمولة
-- =====================================================

-- Test 8: Concurrent Connection Test
-- اختبار الاتصالات المتزامنة
CREATE OR REPLACE FUNCTION test_concurrent_load()
RETURNS TABLE(
    test_scenario text,
    concurrent_queries integer,
    avg_response_time numeric,
    status text
) AS $$
DECLARE
    start_time timestamp;
    end_time timestamp;
    total_time numeric;
BEGIN
    -- Simulate concurrent profile searches
    start_time := clock_timestamp();
    
    -- Run multiple queries in sequence (simulating concurrent load)
    FOR i IN 1..10 LOOP
        PERFORM * FROM profiles WHERE is_verified = true LIMIT 5;
        PERFORM * FROM matches WHERE status = 'active' LIMIT 5;
        PERFORM * FROM chat_messages ORDER BY created_at DESC LIMIT 10;
    END LOOP;
    
    end_time := clock_timestamp();
    total_time := EXTRACT(milliseconds FROM end_time - start_time);
    
    RETURN QUERY
    SELECT 
        'Profile + Match + Chat Queries'::text as test_scenario,
        10::integer as concurrent_queries,
        total_time / 10 as avg_response_time,
        CASE 
            WHEN total_time / 10 < 50 THEN 'EXCELLENT'::text
            WHEN total_time / 10 < 100 THEN 'GOOD'::text
            WHEN total_time / 10 < 200 THEN 'ACCEPTABLE'::text
            ELSE 'SLOW'::text
        END as status;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. Complete Test Suite Runner
-- مشغل مجموعة الاختبارات الكاملة
-- =====================================================

-- Main test runner function
CREATE OR REPLACE FUNCTION run_complete_database_tests()
RETURNS void AS $$
BEGIN
    RAISE NOTICE '=== BeyondRounds Database Test Suite ===';
    RAISE NOTICE 'Starting comprehensive database tests...';
    RAISE NOTICE '';
    
    -- Test 1: Table Structure
    RAISE NOTICE '1. Testing Table Structure:';
    PERFORM * FROM test_table_structure();
    
    -- Test 2: Data Integrity
    RAISE NOTICE '2. Testing Data Integrity:';
    PERFORM * FROM test_data_integrity();
    
    -- Test 3: Query Performance
    RAISE NOTICE '3. Testing Query Performance:';
    PERFORM * FROM test_query_performance();
    
    -- Test 4: Index Validation
    RAISE NOTICE '4. Testing Index Existence:';
    PERFORM * FROM test_indexes_exist();
    
    -- Test 5: Constraint Validation
    RAISE NOTICE '5. Testing Constraints:';
    PERFORM * FROM test_constraints_exist();
    
    -- Test 6: RLS Policies
    RAISE NOTICE '6. Testing RLS Policies:';
    PERFORM * FROM test_rls_policies();
    
    -- Test 7: Load Testing
    RAISE NOTICE '7. Testing Concurrent Load:';
    PERFORM * FROM test_concurrent_load();
    
    RAISE NOTICE '';
    RAISE NOTICE '=== Database Test Suite Complete ===';
    RAISE NOTICE 'Review results above for any FAIL status items.';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. Test Result Analysis
-- تحليل نتائج الاختبار
-- =====================================================

-- Function to generate test report
CREATE OR REPLACE FUNCTION generate_test_report()
RETURNS TABLE(
    section text,
    test_name text,
    status text,
    details text,
    recommendation text
) AS $$
BEGIN
    -- Structure Tests
    RETURN QUERY
    SELECT 
        'Structure'::text as section,
        t.test_name,
        t.status,
        t.details,
        CASE 
            WHEN t.status = 'FAIL' THEN 'Review database schema and fix missing components'::text
            ELSE 'No action required'::text
        END as recommendation
    FROM test_table_structure() t;
    
    -- Integrity Tests
    RETURN QUERY
    SELECT 
        'Data Integrity'::text as section,
        t.test_name,
        t.status,
        t.details,
        CASE 
            WHEN t.status = 'FAIL' THEN 'Clean up data inconsistencies before proceeding'::text
            ELSE 'No action required'::text
        END as recommendation
    FROM test_data_integrity() t;
    
    -- Performance Tests
    RETURN QUERY
    SELECT 
        'Performance'::text as section,
        t.query_name as test_name,
        t.status,
        t.execution_time::text || ' ms' as details,
        CASE 
            WHEN t.status = 'SLOW' THEN 'Consider adding indexes or optimizing query'::text
            WHEN t.status = 'ACCEPTABLE' THEN 'Monitor performance and consider optimization'::text
            ELSE 'Performance is acceptable'::text
        END as recommendation
    FROM test_query_performance() t;
    
    -- Index Tests
    RETURN QUERY
    SELECT 
        'Indexes'::text as section,
        t.index_name as test_name,
        t.status,
        'Table: ' || t.table_name as details,
        CASE 
            WHEN t.status = 'MISSING' THEN 'Create the missing index for better performance'::text
            ELSE 'Index exists'::text
        END as recommendation
    FROM test_indexes_exist() t;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. Usage Instructions
-- تعليمات الاستخدام
-- =====================================================

-- To run the complete test suite:
-- SELECT run_complete_database_tests();

-- To get detailed test results:
-- SELECT * FROM generate_test_report();

-- To run individual test categories:
-- SELECT * FROM test_table_structure();
-- SELECT * FROM test_data_integrity();
-- SELECT * FROM test_query_performance();
-- SELECT * FROM test_indexes_exist();
-- SELECT * FROM test_constraints_exist();
-- SELECT * FROM test_rls_policies();
-- SELECT * FROM test_concurrent_load();

-- =====================================================
-- 8. Automated Testing Setup
-- إعداد الاختبار التلقائي
-- =====================================================

-- Create a function for automated daily testing
CREATE OR REPLACE FUNCTION daily_database_health_check()
RETURNS void AS $$
BEGIN
    -- Run basic health checks
    INSERT INTO audit_log (table_name, operation, record_id, new_values)
    SELECT 
        'health_check'::text,
        'TEST'::text,
        gen_random_uuid(),
        jsonb_build_object(
            'test_type', 'daily_health_check',
            'timestamp', now(),
            'results', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'test', test_name,
                        'status', status,
                        'details', details
                    )
                )
                FROM test_data_integrity()
            )
        );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Final Test Execution
-- تنفيذ الاختبار النهائي
-- =====================================================

-- Uncomment the following line to run tests immediately:
-- SELECT run_complete_database_tests();


