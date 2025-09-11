-- ========================================
-- TEST SCRIPT AFTER COMPLETE SETUP
-- ========================================
-- Run this after installing the complete system

-- Step 1: Verify your admin status
SELECT 
    auth.uid() as user_id,
    email,
    role,
    first_name,
    last_name,
    CASE 
        WHEN role = 'admin' THEN '✅ You are admin - can test matching'
        ELSE '❌ Not admin - cannot test matching'
    END as admin_status
FROM profiles 
WHERE id = auth.uid();

-- Step 2: Check if all functions exist
SELECT 
    'run_weekly_matching' as function_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'run_weekly_matching'
        ) THEN '✅ Function exists'
        ELSE '❌ Function missing'
    END as status
UNION ALL
SELECT 
    'trigger_manual_matching' as function_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'trigger_manual_matching'
        ) THEN '✅ Function exists'
        ELSE '❌ Function missing'
    END as status
UNION ALL
SELECT 
    'get_system_readiness' as function_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'get_system_readiness'
        ) THEN '✅ Function exists'
        ELSE '❌ Function missing'
    END as status;

-- Step 3: Check system readiness
SELECT 
    is_ready,
    eligible_users_count,
    cities_with_min_users,
    min_required_users,
    min_required_cities,
    CASE 
        WHEN is_ready THEN '🎉 System ready for matching!'
        ELSE '⚠️  Need ' || (min_required_users - eligible_users_count) || ' more users'
    END as readiness_message
FROM get_system_readiness();

-- Step 4: Show current eligible users (if any)
SELECT 
    COUNT(*) as total_eligible_users,
    COUNT(DISTINCT city) as cities_represented
FROM get_eligible_users();

-- Step 5: Show users by city
SELECT 
    city,
    COUNT(*) as users_count,
    CASE 
        WHEN COUNT(*) >= 3 THEN '✅ Meets minimum'
        ELSE '❌ Need ' || (3 - COUNT(*)) || ' more'
    END as status
FROM get_eligible_users()
GROUP BY city
ORDER BY users_count DESC;

-- Step 6: Check CRON job status
SELECT 
    jobname,
    schedule,
    command,
    active,
    'CRON job is set up and will run automatically' as status
FROM cron.job 
WHERE jobname = 'weekly-doctor-matching';

-- Step 7: Final instructions
SELECT 
    '🎯 NEXT STEPS:' as title,
    CASE 
        WHEN (SELECT is_ready FROM get_system_readiness()) THEN 
            'System is ready! You can test with: SELECT trigger_manual_matching();'
        ELSE 
            'System needs more users. Run the enable users script first.'
    END as instructions;

