-- =====================================================
-- BeyondRounds Updated Database Testing Script
-- سكريبت الاختبار المحدث لقاعدة البيانات
-- Enhanced tests for the improved schema with search vectors
-- =====================================================

-- =====================================================
-- 1. Enhanced Search Vector Testing
-- اختبار فهارس البحث المحسنة
-- =====================================================

-- Test Search Vector Integrity
-- اختبار سلامة فهارس البحث
CREATE OR REPLACE FUNCTION test_search_vector_integrity()
RETURNS TABLE(
    test_name text,
    status text,
    details text,
    recommendation text
) AS $$
DECLARE
    profiles_without_search_vector integer;
    messages_without_search_vector integer;
    profiles_with_empty_search_vector integer;
    messages_with_empty_search_vector integer;
BEGIN
    -- Test profiles search vector
    SELECT COUNT(*) INTO profiles_without_search_vector
    FROM profiles 
    WHERE search_vector IS NULL;
    
    SELECT COUNT(*) INTO profiles_with_empty_search_vector
    FROM profiles 
    WHERE search_vector = ''::tsvector;
    
    RETURN QUERY
    SELECT 
        'Profiles Search Vector Integrity'::text as test_name,
        CASE 
            WHEN profiles_without_search_vector = 0 AND profiles_with_empty_search_vector = 0 THEN 'PASS'::text
            ELSE 'FAIL'::text
        END as status,
        (profiles_without_search_vector + profiles_with_empty_search_vector)::text || ' profiles with invalid search vectors' as details,
        CASE 
            WHEN (profiles_without_search_vector + profiles_with_empty_search_vector) > 0 THEN 
                'Run: UPDATE profiles SET search_vector = default WHERE search_vector IS NULL OR search_vector = ''''::tsvector;'::text
            ELSE 'No action required'::text
        END as recommendation;
    
    -- Test chat messages search vector
    SELECT COUNT(*) INTO messages_without_search_vector
    FROM chat_messages 
    WHERE search_vector IS NULL;
    
    SELECT COUNT(*) INTO messages_with_empty_search_vector
    FROM chat_messages 
    WHERE search_vector = ''::tsvector;
    
    RETURN QUERY
    SELECT 
        'Chat Messages Search Vector Integrity'::text as test_name,
        CASE 
            WHEN messages_without_search_vector = 0 AND messages_with_empty_search_vector = 0 THEN 'PASS'::text
            ELSE 'FAIL'::text
        END as status,
        (messages_without_search_vector + messages_with_empty_search_vector)::text || ' messages with invalid search vectors' as details,
        CASE 
            WHEN (messages_without_search_vector + messages_with_empty_search_vector) > 0 THEN 
                'Run: UPDATE chat_messages SET search_vector = default WHERE search_vector IS NULL OR search_vector = ''''::tsvector;'::text
            ELSE 'No action required'::text
        END as recommendation;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. Advanced Search Performance Testing
-- اختبار أداء البحث المتقدم
-- =====================================================

-- Test Advanced Search Functions Performance
-- اختبار أداء دوال البحث المتقدم
CREATE OR REPLACE FUNCTION test_advanced_search_performance()
RETURNS TABLE(
    test_name text,
    execution_time numeric,
    results_count integer,
    performance_status text,
    recommendation text
) AS $$
DECLARE
    start_time timestamp;
    end_time timestamp;
    exec_time numeric;
    result_count integer;
BEGIN
    -- Test 1: Advanced Profile Search
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO result_count 
    FROM search_profiles_advanced('doctor cardiology', 'Cardiology', 'Riyadh', 50, 10);
    end_time := clock_timestamp();
    exec_time := EXTRACT(milliseconds FROM end_time - start_time);
    
    RETURN QUERY
    SELECT 
        'Advanced Profile Search'::text as test_name,
        exec_time,
        result_count,
        CASE 
            WHEN exec_time < 50 THEN 'EXCELLENT'::text
            WHEN exec_time < 100 THEN 'GOOD'::text
            WHEN exec_time < 200 THEN 'ACCEPTABLE'::text
            ELSE 'SLOW'::text
        END as performance_status,
        CASE 
            WHEN exec_time > 200 THEN 'Consider optimizing search indexes'::text
            WHEN exec_time > 100 THEN 'Monitor performance under load'::text
            ELSE 'Performance is acceptable'::text
        END as recommendation;
    
    -- Test 2: Chat Message Search (if chat rooms exist)
    IF EXISTS (SELECT 1 FROM chat_rooms LIMIT 1) THEN
        start_time := clock_timestamp();
        SELECT COUNT(*) INTO result_count 
        FROM search_chat_messages(
            (SELECT id FROM chat_rooms LIMIT 1), 
            'meeting discussion', 
            NULL, NULL, 20
        );
        end_time := clock_timestamp();
        exec_time := EXTRACT(milliseconds FROM end_time - start_time);
        
        RETURN QUERY
        SELECT 
            'Chat Message Search'::text as test_name,
            exec_time,
            result_count,
            CASE 
                WHEN exec_time < 30 THEN 'EXCELLENT'::text
                WHEN exec_time < 60 THEN 'GOOD'::text
                WHEN exec_time < 120 THEN 'ACCEPTABLE'::text
                ELSE 'SLOW'::text
            END as performance_status,
            CASE 
                WHEN exec_time > 120 THEN 'Consider optimizing chat message indexes'::text
                WHEN exec_time > 60 THEN 'Monitor chat search performance'::text
                ELSE 'Chat search performance is good'::text
            END as recommendation;
    END IF;
    
    -- Test 3: Global Search Performance
    start_time := clock_timestamp();
    SELECT COUNT(*) INTO result_count 
    FROM global_search('medical professional', 'all', NULL, 10);
    end_time := clock_timestamp();
    exec_time := EXTRACT(milliseconds FROM end_time - start_time);
    
    RETURN QUERY
    SELECT 
        'Global Search'::text as test_name,
        exec_time,
        result_count,
        CASE 
            WHEN exec_time < 100 THEN 'EXCELLENT'::text
            WHEN exec_time < 200 THEN 'GOOD'::text
            WHEN exec_time < 400 THEN 'ACCEPTABLE'::text
            ELSE 'SLOW'::text
        END as performance_status,
        CASE 
            WHEN exec_time > 400 THEN 'Global search needs optimization'::text
            WHEN exec_time > 200 THEN 'Monitor global search under load'::text
            ELSE 'Global search performance is acceptable'::text
        END as recommendation;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. Enhanced Index Usage Testing
-- اختبار استخدام الفهارس المحسن
-- =====================================================

-- Test Enhanced Indexes Exist and Are Used
-- اختبار وجود واستخدام الفهارس المحسنة
CREATE OR REPLACE FUNCTION test_enhanced_indexes()
RETURNS TABLE(
    index_name text,
    table_name text,
    index_type text,
    status text,
    usage_count bigint,
    recommendation text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.indexname::text as index_name,
        i.tablename::text as table_name,
        CASE 
            WHEN i.indexdef LIKE '%gin%' THEN 'GIN'::text
            WHEN i.indexdef LIKE '%btree%' THEN 'BTREE'::text
            WHEN i.indexdef LIKE '%gist%' THEN 'GIST'::text
            ELSE 'OTHER'::text
        END as index_type,
        CASE 
            WHEN i.indexname IS NOT NULL THEN 'EXISTS'::text
            ELSE 'MISSING'::text
        END as status,
        COALESCE(s.idx_scan, 0) as usage_count,
        CASE 
            WHEN COALESCE(s.idx_scan, 0) = 0 THEN 'Index exists but not used - investigate'::text
            WHEN COALESCE(s.idx_scan, 0) < 10 THEN 'Low usage - monitor'::text
            WHEN COALESCE(s.idx_scan, 0) < 100 THEN 'Moderate usage - good'::text
            ELSE 'High usage - excellent'::text
        END as recommendation
    FROM pg_indexes i
    LEFT JOIN pg_stat_user_indexes s ON i.indexname = s.indexname AND i.schemaname = s.schemaname
    WHERE i.schemaname = 'public'
    AND (
        i.indexname LIKE '%search_vector%' OR 
        i.indexname LIKE '%advanced%' OR 
        i.indexname LIKE '%enhanced%' OR
        i.indexname LIKE '%weighted%'
    )
    ORDER BY usage_count DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. Schema Improvements Validation
-- التحقق من تحسينات المخطط
-- =====================================================

-- Test Schema Improvements
-- اختبار تحسينات المخطط
CREATE OR REPLACE FUNCTION test_schema_improvements()
RETURNS TABLE(
    improvement_name text,
    status text,
    details text,
    validation_query text
) AS $$
BEGIN
    -- Test 1: audit_log changed_fields fix
    RETURN QUERY
    SELECT 
        'Audit Log changed_fields Default'::text as improvement_name,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'audit_log' 
                AND column_name = 'changed_fields' 
                AND column_default LIKE '%ARRAY[]%'
            ) THEN 'FIXED'::text
            ELSE 'NOT_FIXED'::text
        END as status,
        'changed_fields column should have ARRAY[]::text[] default'::text as details,
        'SELECT column_default FROM information_schema.columns WHERE table_name = ''audit_log'' AND column_name = ''changed_fields'';'::text as validation_query;
    
    -- Test 2: chat_messages search_vector default
    RETURN QUERY
    SELECT 
        'Chat Messages Search Vector Default'::text as improvement_name,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'chat_messages' 
                AND column_name = 'search_vector' 
                AND column_default IS NOT NULL
            ) THEN 'IMPLEMENTED'::text
            ELSE 'MISSING'::text
        END as status,
        'chat_messages should have search_vector with default value'::text as details,
        'SELECT column_default FROM information_schema.columns WHERE table_name = ''chat_messages'' AND column_name = ''search_vector'';'::text as validation_query;
    
    -- Test 3: profiles enhanced search_vector
    RETURN QUERY
    SELECT 
        'Profiles Enhanced Search Vector'::text as improvement_name,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'profiles' 
                AND column_name = 'search_vector' 
                AND column_default LIKE '%setweight%'
            ) THEN 'ENHANCED'::text
            ELSE 'BASIC'::text
        END as status,
        'profiles should have weighted search_vector with setweight'::text as details,
        'SELECT column_default FROM information_schema.columns WHERE table_name = ''profiles'' AND column_name = ''search_vector'';'::text as validation_query;
    
    -- Test 4: chat_rooms unique match_id
    RETURN QUERY
    SELECT 
        'Chat Rooms Unique Match ID'::text as improvement_name,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.table_constraints tc
                JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
                WHERE tc.table_name = 'chat_rooms' 
                AND ccu.column_name = 'match_id'
                AND tc.constraint_type = 'UNIQUE'
            ) THEN 'IMPLEMENTED'::text
            ELSE 'MISSING'::text
        END as status,
        'chat_rooms.match_id should have UNIQUE constraint'::text as details,
        'SELECT constraint_type FROM information_schema.table_constraints tc JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name WHERE tc.table_name = ''chat_rooms'' AND ccu.column_name = ''match_id'';'::text as validation_query;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. Load Testing for Enhanced Features
-- اختبار الحمولة للميزات المحسنة
-- =====================================================

-- Enhanced Load Testing
-- اختبار الحمولة المحسن
CREATE OR REPLACE FUNCTION test_enhanced_load()
RETURNS TABLE(
    test_scenario text,
    concurrent_operations integer,
    avg_response_time numeric,
    success_rate numeric,
    performance_status text
) AS $$
DECLARE
    start_time timestamp;
    end_time timestamp;
    total_time numeric;
    successful_ops integer := 0;
    total_ops integer := 20;
BEGIN
    -- Test 1: Concurrent Profile Searches
    start_time := clock_timestamp();
    
    FOR i IN 1..total_ops LOOP
        BEGIN
            PERFORM * FROM search_profiles_advanced('medical', NULL, NULL, 30, 5);
            successful_ops := successful_ops + 1;
        EXCEPTION WHEN OTHERS THEN
            -- Count failed operations
            NULL;
        END;
    END LOOP;
    
    end_time := clock_timestamp();
    total_time := EXTRACT(milliseconds FROM end_time - start_time);
    
    RETURN QUERY
    SELECT 
        'Concurrent Profile Searches'::text as test_scenario,
        total_ops::integer as concurrent_operations,
        total_time / total_ops as avg_response_time,
        (successful_ops::numeric / total_ops * 100) as success_rate,
        CASE 
            WHEN total_time / total_ops < 100 AND successful_ops = total_ops THEN 'EXCELLENT'::text
            WHEN total_time / total_ops < 200 AND successful_ops >= total_ops * 0.9 THEN 'GOOD'::text
            WHEN total_time / total_ops < 500 AND successful_ops >= total_ops * 0.8 THEN 'ACCEPTABLE'::text
            ELSE 'POOR'::text
        END as performance_status;
    
    -- Reset for next test
    successful_ops := 0;
    
    -- Test 2: Mixed Operations (Search + Database Operations)
    start_time := clock_timestamp();
    
    FOR i IN 1..10 LOOP
        BEGIN
            -- Profile search
            PERFORM * FROM search_profiles_advanced('doctor', NULL, NULL, 50, 3);
            -- Profile lookup
            PERFORM * FROM profiles WHERE is_verified = true LIMIT 3;
            -- Match lookup
            PERFORM * FROM matches WHERE status = 'active' LIMIT 3;
            successful_ops := successful_ops + 1;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
    
    end_time := clock_timestamp();
    total_time := EXTRACT(milliseconds FROM end_time - start_time);
    
    RETURN QUERY
    SELECT 
        'Mixed Search + DB Operations'::text as test_scenario,
        10::integer as concurrent_operations,
        total_time / 10 as avg_response_time,
        (successful_ops::numeric / 10 * 100) as success_rate,
        CASE 
            WHEN total_time / 10 < 150 AND successful_ops = 10 THEN 'EXCELLENT'::text
            WHEN total_time / 10 < 300 AND successful_ops >= 9 THEN 'GOOD'::text
            WHEN total_time / 10 < 600 AND successful_ops >= 8 THEN 'ACCEPTABLE'::text
            ELSE 'POOR'::text
        END as performance_status;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. Comprehensive Test Suite Runner
-- مشغل مجموعة الاختبارات الشاملة
-- =====================================================

-- Enhanced Test Suite Runner
-- مشغل مجموعة الاختبارات المحسن
CREATE OR REPLACE FUNCTION run_enhanced_database_tests()
RETURNS void AS $$
BEGIN
    RAISE NOTICE '=== BeyondRounds Enhanced Database Test Suite ===';
    RAISE NOTICE 'Testing enhanced schema with search vectors and improvements...';
    RAISE NOTICE '';
    
    -- Test 1: Search Vector Integrity
    RAISE NOTICE '1. Testing Search Vector Integrity:';
    PERFORM * FROM test_search_vector_integrity();
    
    -- Test 2: Advanced Search Performance
    RAISE NOTICE '2. Testing Advanced Search Performance:';
    PERFORM * FROM test_advanced_search_performance();
    
    -- Test 3: Enhanced Index Usage
    RAISE NOTICE '3. Testing Enhanced Index Usage:';
    PERFORM * FROM test_enhanced_indexes();
    
    -- Test 4: Schema Improvements Validation
    RAISE NOTICE '4. Testing Schema Improvements:';
    PERFORM * FROM test_schema_improvements();
    
    -- Test 5: Enhanced Load Testing
    RAISE NOTICE '5. Testing Enhanced Load Performance:';
    PERFORM * FROM test_enhanced_load();
    
    RAISE NOTICE '';
    RAISE NOTICE '=== Enhanced Database Test Suite Complete ===';
    RAISE NOTICE 'Review results above for any issues or optimization opportunities.';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. Enhanced Test Report Generator
-- منشئ تقارير الاختبار المحسن
-- =====================================================

-- Generate Enhanced Test Report
-- إنشاء تقرير الاختبار المحسن
CREATE OR REPLACE FUNCTION generate_enhanced_test_report()
RETURNS TABLE(
    section text,
    test_name text,
    status text,
    details text,
    recommendation text,
    priority text
) AS $$
BEGIN
    -- Search Vector Tests
    RETURN QUERY
    SELECT 
        'Search Vectors'::text as section,
        t.test_name,
        t.status,
        t.details,
        t.recommendation,
        CASE 
            WHEN t.status = 'FAIL' THEN 'HIGH'::text
            ELSE 'LOW'::text
        END as priority
    FROM test_search_vector_integrity() t;
    
    -- Performance Tests
    RETURN QUERY
    SELECT 
        'Search Performance'::text as section,
        t.test_name,
        t.performance_status as status,
        t.execution_time::text || ' ms (' || t.results_count || ' results)' as details,
        t.recommendation,
        CASE 
            WHEN t.performance_status = 'SLOW' THEN 'HIGH'::text
            WHEN t.performance_status = 'ACCEPTABLE' THEN 'MEDIUM'::text
            ELSE 'LOW'::text
        END as priority
    FROM test_advanced_search_performance() t;
    
    -- Index Usage Tests
    RETURN QUERY
    SELECT 
        'Index Usage'::text as section,
        t.index_name as test_name,
        t.status,
        'Usage: ' || t.usage_count || ' scans' as details,
        t.recommendation,
        CASE 
            WHEN t.usage_count = 0 THEN 'MEDIUM'::text
            WHEN t.usage_count < 10 THEN 'LOW'::text
            ELSE 'INFO'::text
        END as priority
    FROM test_enhanced_indexes() t;
    
    -- Schema Improvement Tests
    RETURN QUERY
    SELECT 
        'Schema Improvements'::text as section,
        t.improvement_name as test_name,
        t.status,
        t.details,
        CASE 
            WHEN t.status IN ('NOT_FIXED', 'MISSING') THEN 'Apply the schema improvement'::text
            ELSE 'Schema improvement is implemented'::text
        END as recommendation,
        CASE 
            WHEN t.status IN ('NOT_FIXED', 'MISSING') THEN 'MEDIUM'::text
            ELSE 'INFO'::text
        END as priority
    FROM test_schema_improvements() t;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. Usage Instructions for Enhanced Testing
-- تعليمات الاستخدام للاختبار المحسن
-- =====================================================

-- To run the enhanced test suite:
-- SELECT run_enhanced_database_tests();

-- To get detailed enhanced test results:
-- SELECT * FROM generate_enhanced_test_report() ORDER BY 
--   CASE priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 WHEN 'LOW' THEN 3 ELSE 4 END,
--   section, test_name;

-- To run individual enhanced test categories:
-- SELECT * FROM test_search_vector_integrity();
-- SELECT * FROM test_advanced_search_performance();
-- SELECT * FROM test_enhanced_indexes();
-- SELECT * FROM test_schema_improvements();
-- SELECT * FROM test_enhanced_load();

-- To monitor search performance:
-- SELECT * FROM monitor_search_performance();
-- SELECT * FROM monitor_text_search_usage();

-- =====================================================
-- Final Test Execution
-- تنفيذ الاختبار النهائي
-- =====================================================

-- Uncomment to run enhanced tests immediately:
-- SELECT run_enhanced_database_tests();


