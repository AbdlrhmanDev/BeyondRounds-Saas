-- ==============================================
-- ENABLE USERS AND TEST MATCHING SYSTEM
-- ==============================================

RAISE NOTICE '🚀 ENABLING USERS FOR BEYONDROUNDS MATCHING';
RAISE NOTICE '==========================================';
RAISE NOTICE '';

-- Step 1: Enable payment for verified users with onboarding completed
UPDATE profiles 
SET is_paid = true
WHERE is_verified = true 
  AND onboarding_completed = true
  AND NOT is_paid = true
  AND email NOT LIKE '%@beyondrounds.com'  -- Don't modify admin emails
RETURNING first_name, last_name, email, city;

RAISE NOTICE '✅ Payment enabled for verified users with completed onboarding';
RAISE NOTICE '';

-- Step 2: Check updated system status
DO $$
DECLARE
  eligible_count INTEGER;
  cities_ready INTEGER;
  system_ready BOOLEAN;
  readiness_data JSONB;
BEGIN
  -- Get system readiness
  SELECT get_system_readiness() INTO readiness_data;
  eligible_count := (readiness_data->'summary'->>'eligible_users')::INTEGER;
  cities_ready := (readiness_data->'summary'->>'cities_with_min_users')::INTEGER;
  system_ready := (readiness_data->>'system_ready')::BOOLEAN;
  
  RAISE NOTICE '📊 UPDATED SYSTEM STATUS';
  RAISE NOTICE '=====================';
  RAISE NOTICE 'Total Users: %', readiness_data->'summary'->>'total_users';
  RAISE NOTICE 'Verified Users: %', readiness_data->'summary'->>'verified_users';
  RAISE NOTICE 'Paid Users: %', readiness_data->'summary'->>'paid_users';
  RAISE NOTICE 'Eligible Users: %/6 %', 
    eligible_count, 
    CASE WHEN eligible_count >= 6 THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Cities Ready: %/2 %', 
    cities_ready, 
    CASE WHEN cities_ready >= 2 THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'System Ready: %', 
    CASE WHEN system_ready THEN '✅ YES - Ready for matching!' ELSE '❌ NO - Need more users/cities' END;
  RAISE NOTICE '';
  
  IF system_ready THEN
    RAISE NOTICE '🎉 CONGRATULATIONS! Your system is now ready for matching!';
    RAISE NOTICE '';
    RAISE NOTICE '🧪 NEXT STEPS:';
    RAISE NOTICE '1. Test the matching algorithm: SELECT trigger_manual_matching();';
    RAISE NOTICE '2. Check your dashboard to see the updated status';
    RAISE NOTICE '3. View created groups and chat messages';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '⚠️ Still need more users or cities';
    IF eligible_count < 6 THEN
      RAISE NOTICE '   • Need % more eligible users', 6 - eligible_count;
    END IF;
    IF cities_ready < 2 THEN
      RAISE NOTICE '   • Need % more cities with 3+ users', 2 - cities_ready;
    END IF;
    RAISE NOTICE '';
  END IF;
END $$;

-- Step 3: Show city breakdown
RAISE NOTICE '🏙️ CITY BREAKDOWN';
RAISE NOTICE '================';

SELECT 
  city,
  current_users as total_users,
  eligible_users,
  CASE WHEN meets_minimum THEN '✅ Ready' ELSE '❌ Need more' END as status,
  recommendation
FROM get_city_recommendations()
ORDER BY eligible_users DESC;

RAISE NOTICE '';
RAISE NOTICE '📋 WHAT TO DO NEXT:';
RAISE NOTICE '';
RAISE NOTICE 'If system is ready:';
RAISE NOTICE '  → Run: SELECT trigger_manual_matching();';
RAISE NOTICE '  → Check dashboard for results';
RAISE NOTICE '  → View created groups and chat messages';
RAISE NOTICE '';
RAISE NOTICE 'If system still not ready:';
RAISE NOTICE '  → Enable more users or add test users';
RAISE NOTICE '  → Ensure geographic distribution across cities';
RAISE NOTICE '';
RAISE NOTICE '🎯 Your BeyondRounds matching system is almost ready!';
RAISE NOTICE '';
