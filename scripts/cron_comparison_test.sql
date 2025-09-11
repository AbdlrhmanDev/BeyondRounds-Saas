-- ==============================================
-- CRON COMPARISON TEST SCRIPT
-- This script helps you test both Vercel and Supabase CRON approaches
-- ==============================================

-- ==============================================
-- TEST 1: Check if pg_cron is available
-- ==============================================

DO $$
BEGIN
  -- Try to create pg_cron extension
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  RAISE NOTICE '✅ pg_cron extension is available - Supabase CRON is supported';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '❌ pg_cron extension not available - Use Vercel CRON instead';
    RAISE NOTICE 'Error: %', SQLERRM;
END $$;

-- ==============================================
-- TEST 2: Check current Supabase plan capabilities
-- ==============================================

DO $$
DECLARE
  extension_count INTEGER;
BEGIN
  -- Check if we can query cron jobs (indicates Pro plan)
  SELECT COUNT(*) INTO extension_count 
  FROM pg_extension 
  WHERE extname = 'pg_cron';
  
  IF extension_count > 0 THEN
    RAISE NOTICE '✅ Supabase Pro plan detected - pg_cron is enabled';
    
    -- Check if any cron jobs exist
    IF EXISTS (SELECT 1 FROM cron.job LIMIT 1) THEN
      RAISE NOTICE '📊 Existing cron jobs found:';
      FOR rec IN SELECT jobname, schedule, active FROM cron.job LOOP
        RAISE NOTICE '  • Job: %, Schedule: %, Active: %', rec.jobname, rec.schedule, rec.active;
      END LOOP;
    ELSE
      RAISE NOTICE 'ℹ️ No existing cron jobs found';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ pg_cron not enabled - may need Supabase Pro plan';
  END IF;
END $$;

-- ==============================================
-- TEST 3: Validate matching prerequisites
-- ==============================================

DO $$
DECLARE
  total_users INTEGER;
  eligible_users INTEGER;
  verified_users INTEGER;
  paid_users INTEGER;
  cities_with_min_users INTEGER;
BEGIN
  -- Count total users
  SELECT COUNT(*) INTO total_users FROM profiles;
  
  -- Count verified users
  SELECT COUNT(*) INTO verified_users FROM profiles WHERE is_verified = true;
  
  -- Count paid users
  SELECT COUNT(*) INTO paid_users FROM profiles WHERE is_paid = true;
  
  -- Count eligible users
  SELECT COUNT(*) INTO eligible_users 
  FROM profiles 
  WHERE is_verified = true 
    AND is_paid = true 
    AND onboarding_completed = true;
  
  -- Count cities with minimum users
  SELECT COUNT(*) INTO cities_with_min_users
  FROM (
    SELECT city, COUNT(*) as user_count
    FROM profiles 
    WHERE is_verified = true 
      AND is_paid = true 
      AND onboarding_completed = true
    GROUP BY city
    HAVING COUNT(*) >= 3
  ) city_counts;
  
  RAISE NOTICE '📊 User Statistics:';
  RAISE NOTICE '  • Total users: %', total_users;
  RAISE NOTICE '  • Verified users: %', verified_users;
  RAISE NOTICE '  • Paid users: %', paid_users;
  RAISE NOTICE '  • Eligible users: %', eligible_users;
  RAISE NOTICE '  • Cities with 3+ users: %', cities_with_min_users;
  
  IF eligible_users >= 6 THEN
    RAISE NOTICE '✅ Sufficient users for matching (need minimum 6)';
  ELSE
    RAISE NOTICE '⚠️ Insufficient users for matching (have %, need 6+)', eligible_users;
  END IF;
  
  IF cities_with_min_users >= 2 THEN
    RAISE NOTICE '✅ Sufficient cities for matching';
  ELSE
    RAISE NOTICE '⚠️ Need more cities with 3+ users each';
  END IF;
END $$;

-- ==============================================
-- TEST 4: Performance comparison simulation
-- ==============================================

DO $$
DECLARE
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  duration INTERVAL;
  eligible_count INTEGER;
BEGIN
  RAISE NOTICE '🏃‍♂️ Performance Test: Fetching eligible users';
  
  start_time := clock_timestamp();
  
  -- Simulate the eligible users query
  SELECT COUNT(*) INTO eligible_count
  FROM profiles p
  WHERE p.is_verified = true
    AND p.is_paid = true
    AND p.onboarding_completed = true
    AND p.created_at < (date_trunc('week', CURRENT_DATE) + INTERVAL '3 days 12 hours')
    AND NOT EXISTS (
      SELECT 1 FROM match_members mm
      INNER JOIN matches m ON mm.match_id = m.id
      WHERE mm.user_id = p.id
        AND m.match_week >= (CURRENT_DATE - INTERVAL '6 weeks')
    );
  
  end_time := clock_timestamp();
  duration := end_time - start_time;
  
  RAISE NOTICE '⏱️ Query completed in: %', duration;
  RAISE NOTICE '📊 Eligible users found: %', eligible_count;
  
  IF duration < INTERVAL '1 second' THEN
    RAISE NOTICE '✅ Performance: Excellent (< 1 second)';
  ELSIF duration < INTERVAL '5 seconds' THEN
    RAISE NOTICE '✅ Performance: Good (< 5 seconds)';
  ELSE
    RAISE NOTICE '⚠️ Performance: Consider adding indexes';
  END IF;
END $$;

-- ==============================================
-- TEST 5: Check required indexes
-- ==============================================

DO $$
DECLARE
  missing_indexes TEXT[] := ARRAY[]::TEXT[];
BEGIN
  RAISE NOTICE '🔍 Checking required indexes for optimal performance...';
  
  -- Check for profiles matching index
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' 
    AND indexname = 'idx_profiles_matching'
  ) THEN
    missing_indexes := missing_indexes || 'idx_profiles_matching';
  END IF;
  
  -- Check for matches week index
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'matches' 
    AND indexname = 'idx_matches_week'
  ) THEN
    missing_indexes := missing_indexes || 'idx_matches_week';
  END IF;
  
  -- Check for match_members user index
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'match_members' 
    AND indexname = 'idx_match_members_user'
  ) THEN
    missing_indexes := missing_indexes || 'idx_match_members_user';
  END IF;
  
  IF array_length(missing_indexes, 1) IS NULL THEN
    RAISE NOTICE '✅ All required indexes are present';
  ELSE
    RAISE NOTICE '⚠️ Missing indexes: %', array_to_string(missing_indexes, ', ');
    RAISE NOTICE 'Run scripts/003_matching_indexes.sql to create missing indexes';
  END IF;
END $$;

-- ==============================================
-- RECOMMENDATION SUMMARY
-- ==============================================

DO $$
DECLARE
  has_pg_cron BOOLEAN;
  sufficient_users BOOLEAN;
  good_performance BOOLEAN;
BEGIN
  -- Check pg_cron availability
  SELECT EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) INTO has_pg_cron;
  
  -- Check user count
  SELECT EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE is_verified = true 
      AND is_paid = true 
      AND onboarding_completed = true
    HAVING COUNT(*) >= 6
  ) INTO sufficient_users;
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 RECOMMENDATION SUMMARY';
  RAISE NOTICE '========================';
  
  IF has_pg_cron AND sufficient_users THEN
    RAISE NOTICE '✅ RECOMMENDED: Use Supabase CRON';
    RAISE NOTICE '   • pg_cron is available';
    RAISE NOTICE '   • Sufficient user base';
    RAISE NOTICE '   • Better performance and security';
    RAISE NOTICE '   • Lower latency (no HTTP calls)';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '   1. Run scripts/007_supabase_cron_matching.sql';
    RAISE NOTICE '   2. Test with: SELECT trigger_manual_matching();';
    RAISE NOTICE '   3. Monitor with: SELECT * FROM get_matching_history();';
  ELSIF sufficient_users THEN
    RAISE NOTICE '⚠️ RECOMMENDED: Use Vercel CRON';
    RAISE NOTICE '   • pg_cron not available (need Supabase Pro)';
    RAISE NOTICE '   • Sufficient user base';
    RAISE NOTICE '   • More familiar development environment';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '   1. Keep existing vercel.json configuration';
    RAISE NOTICE '   2. Deploy to Vercel with CRON_SECRET';
    RAISE NOTICE '   3. Test endpoint: /api/cron/weekly-matching';
  ELSE
    RAISE NOTICE '⏳ WAIT: Build user base first';
    RAISE NOTICE '   • Need minimum 6 eligible users';
    RAISE NOTICE '   • Need 2+ cities with 3+ users each';
    RAISE NOTICE '   • Focus on user acquisition and verification';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '   1. Increase user signups and verification';
    RAISE NOTICE '   2. Re-run this test when you have more users';
    RAISE NOTICE '   3. Consider manual matching for early users';
  END IF;
  
  RAISE NOTICE '';
END $$;

