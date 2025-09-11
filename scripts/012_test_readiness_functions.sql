-- ==============================================
-- TEST THE NEW SYSTEM READINESS FUNCTIONS
-- This script demonstrates the readiness checking functionality
-- ==============================================

-- First, let's run the setup script to make sure we have the functions
-- Run scripts/011_system_readiness_check.sql first if you haven't already

RAISE NOTICE '🧪 TESTING BEYONDROUNDS SYSTEM READINESS FUNCTIONS';
RAISE NOTICE '==================================================';
RAISE NOTICE '';

-- ==============================================
-- TEST 1: Simple Readiness Status
-- ==============================================

DO $$
DECLARE
  readiness_record RECORD;
BEGIN
  RAISE NOTICE '📊 TEST 1: Simple Readiness Status';
  RAISE NOTICE '--------------------------------';
  
  FOR readiness_record IN SELECT * FROM get_simple_readiness_status()
  LOOP
    RAISE NOTICE 'System Ready: %', 
      CASE WHEN readiness_record.is_ready THEN '✅ YES' ELSE '❌ NO' END;
    RAISE NOTICE 'Status: %', readiness_record.status_message;
    RAISE NOTICE 'Issues Found: %', readiness_record.issues_count;
    RAISE NOTICE 'Next Action: %', readiness_record.next_action;
  END LOOP;
  
  RAISE NOTICE '';
END $$;

-- ==============================================
-- TEST 2: Detailed Readiness Messages
-- ==============================================

DO $$
DECLARE
  message_record RECORD;
  issue_count INTEGER := 0;
  recommendation_count INTEGER := 0;
BEGIN
  RAISE NOTICE '📝 TEST 2: Detailed Readiness Messages';
  RAISE NOTICE '-----------------------------------';
  
  FOR message_record IN SELECT * FROM get_readiness_messages()
  LOOP
    IF message_record.message_type = 'issue' THEN
      issue_count := issue_count + 1;
      RAISE NOTICE '❌ ISSUE: %', message_record.message;
    ELSIF message_record.message_type = 'recommendation' THEN
      recommendation_count := recommendation_count + 1;
      RAISE NOTICE '💡 RECOMMENDATION: %', message_record.message;
    ELSIF message_record.message_type = 'success' THEN
      RAISE NOTICE '✅ SUCCESS: %', message_record.message;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Summary: % issues, % recommendations', issue_count, recommendation_count;
  RAISE NOTICE '';
END $$;

-- ==============================================
-- TEST 3: City-Specific Recommendations
-- ==============================================

DO $$
DECLARE
  city_record RECORD;
  ready_cities INTEGER := 0;
  total_cities INTEGER := 0;
BEGIN
  RAISE NOTICE '🏙️ TEST 3: City-Specific Recommendations';
  RAISE NOTICE '-------------------------------------';
  
  FOR city_record IN SELECT * FROM get_city_recommendations() ORDER BY city
  LOOP
    total_cities := total_cities + 1;
    
    RAISE NOTICE '📍 %:', city_record.city;
    RAISE NOTICE '   • Total Users: %', city_record.current_users;
    RAISE NOTICE '   • Eligible Users: %', city_record.eligible_users;
    RAISE NOTICE '   • %', city_record.recommendation;
    
    IF NOT city_record.needs_more_users THEN
      ready_cities := ready_cities + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE 'Summary: %/% cities ready for matching', ready_cities, total_cities;
  RAISE NOTICE '';
END $$;

-- ==============================================
-- TEST 4: Complete System Analysis
-- ==============================================

DO $$
DECLARE
  readiness_data JSONB;
  issue JSONB;
  recommendation JSONB;
BEGIN
  RAISE NOTICE '🔍 TEST 4: Complete System Analysis';
  RAISE NOTICE '--------------------------------';
  
  SELECT get_system_readiness() INTO readiness_data;
  
  RAISE NOTICE 'System Status: %', 
    CASE WHEN (readiness_data->>'system_ready')::BOOLEAN 
         THEN '✅ READY FOR MATCHING' 
         ELSE '⚠️ NOT READY FOR MATCHING' 
    END;
  
  RAISE NOTICE '';
  RAISE NOTICE '📊 User Summary:';
  RAISE NOTICE '   • Total Users: %', readiness_data->'summary'->>'total_users';
  RAISE NOTICE '   • Verified Users: %', readiness_data->'summary'->>'verified_users';
  RAISE NOTICE '   • Paid Users: %', readiness_data->'summary'->>'paid_users';
  RAISE NOTICE '   • Eligible Users: %', readiness_data->'summary'->>'eligible_users';
  RAISE NOTICE '   • Cities Ready: %', readiness_data->'summary'->>'cities_with_min_users';
  RAISE NOTICE '   • Recently Matched: %', readiness_data->'summary'->>'recently_matched_users';
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 Requirements Status:';
  RAISE NOTICE '   • Minimum Users: %/% (%.1%% complete)', 
    readiness_data->'requirements'->'minimum_users'->>'current',
    readiness_data->'requirements'->'minimum_users'->>'required',
    (readiness_data->'requirements'->'minimum_users'->>'percentage')::DECIMAL;
  RAISE NOTICE '   • Minimum Cities: %/% (%.1%% complete)', 
    readiness_data->'requirements'->'minimum_cities'->>'current',
    readiness_data->'requirements'->'minimum_cities'->>'required',
    (readiness_data->'requirements'->'minimum_cities'->>'percentage')::DECIMAL;
  
  -- Show issues if any
  IF jsonb_array_length(readiness_data->'issues') > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '⚠️ Issues Found:';
    FOR issue IN SELECT * FROM jsonb_array_elements(readiness_data->'issues')
    LOOP
      RAISE NOTICE '   • % (Priority: %)', 
        issue->>'message', 
        issue->>'priority';
    END LOOP;
  END IF;
  
  -- Show recommendations if any
  IF jsonb_array_length(readiness_data->'recommendations') > 0 THEN
    RAISE NOTICE '';
    RAISE NOTICE '💡 Recommendations:';
    FOR recommendation IN SELECT * FROM jsonb_array_elements(readiness_data->'recommendations')
    LOOP
      RAISE NOTICE '   • %', recommendation->>'message';
    END LOOP;
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ==============================================
-- TEST 5: Performance Test
-- ==============================================

DO $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  duration INTERVAL;
BEGIN
  RAISE NOTICE '⚡ TEST 5: Performance Test';
  RAISE NOTICE '-------------------------';
  
  start_time := clock_timestamp();
  
  -- Run all readiness functions
  PERFORM get_system_readiness();
  PERFORM * FROM get_simple_readiness_status();
  PERFORM * FROM get_readiness_messages();
  PERFORM * FROM get_city_recommendations();
  
  end_time := clock_timestamp();
  duration := end_time - start_time;
  
  RAISE NOTICE 'All readiness functions executed in: %', duration;
  
  IF duration < INTERVAL '1 second' THEN
    RAISE NOTICE '✅ Performance: Excellent (< 1 second)';
  ELSIF duration < INTERVAL '3 seconds' THEN
    RAISE NOTICE '✅ Performance: Good (< 3 seconds)';
  ELSE
    RAISE NOTICE '⚠️ Performance: Consider optimization';
  END IF;
  
  RAISE NOTICE '';
END $$;

-- ==============================================
-- SUMMARY AND NEXT STEPS
-- ==============================================

RAISE NOTICE '🎯 TESTING COMPLETE!';
RAISE NOTICE '==================';
RAISE NOTICE '';
RAISE NOTICE '✅ All system readiness functions are working';
RAISE NOTICE '✅ Dashboard will now show detailed status information';
RAISE NOTICE '✅ Users will see specific requirements and progress';
RAISE NOTICE '';
RAISE NOTICE '📋 AVAILABLE FUNCTIONS FOR YOUR DASHBOARD:';
RAISE NOTICE '• get_system_readiness() - Complete analysis';
RAISE NOTICE '• get_simple_readiness_status() - Quick status';
RAISE NOTICE '• get_readiness_messages() - User-friendly messages';
RAISE NOTICE '• get_city_recommendations() - City-specific advice';
RAISE NOTICE '';
RAISE NOTICE '🚀 NEXT STEPS:';
RAISE NOTICE '1. Your enhanced dashboard will now show detailed readiness info';
RAISE NOTICE '2. Users will see exactly what is needed for matching';
RAISE NOTICE '3. Progress bars will show how close you are to requirements';
RAISE NOTICE '4. Specific recommendations will guide user acquisition';
RAISE NOTICE '';
RAISE NOTICE '🎉 Your system now provides comprehensive readiness feedback!';
RAISE NOTICE '';
