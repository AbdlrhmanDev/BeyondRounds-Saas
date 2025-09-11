-- ========================================
-- COMPREHENSIVE MATCHING DIAGNOSIS
-- ========================================
-- This script will diagnose every step of the matching process

-- Step 1: Check eligible users
SELECT '=== STEP 1: ELIGIBLE USERS ===' as step;
SELECT 
    first_name,
    last_name,
    city,
    specialty,
    gender,
    array_to_string(interests, ', ') as interests,
    array_to_string(availability_slots, ', ') as availability
FROM get_eligible_users()
ORDER BY city, first_name;

-- Step 2: Test specialty similarity function
SELECT '=== STEP 2: SPECIALTY SIMILARITY TESTS ===' as step;
SELECT 
    'Internal Medicine vs Family Medicine' as test,
    calculate_specialty_similarity('Internal Medicine', 'Family Medicine') as similarity;
SELECT 
    'Cardiology vs Cardiology' as test,
    calculate_specialty_similarity('Cardiology', 'Cardiology') as similarity;
SELECT 
    'Internal Medicine vs Dermatology' as test,
    calculate_specialty_similarity('Internal Medicine', 'Dermatology') as similarity;

-- Step 3: Test interests similarity function
SELECT '=== STEP 3: INTERESTS SIMILARITY TESTS ===' as step;
SELECT 
    'Sports Medicine overlap' as test,
    calculate_shared_interests_ratio(
        ARRAY['Sports Medicine', 'Research', 'Technology'],
        ARRAY['Sports Medicine', 'Surgery', 'Fitness']
    ) as interests_ratio;

-- Step 4: Test availability overlap function
SELECT '=== STEP 4: AVAILABILITY OVERLAP TESTS ===' as step;
SELECT 
    'Thursday 6PM overlap' as test,
    calculate_availability_overlap_ratio(
        ARRAY['Thursday 6PM', 'Friday 10AM', 'Sunday 8PM'],
        ARRAY['Thursday 6PM', 'Saturday 10AM', 'Sunday 8PM']
    ) as availability_ratio;

-- Step 5: Test pair scoring manually for specific users
SELECT '=== STEP 5: MANUAL PAIR SCORING ===' as step;
SELECT 
    u1.first_name || ' & ' || u2.first_name as pair,
    u1.city || ' - ' || u2.city as cities,
    calculate_specialty_similarity(u1.specialty, u2.specialty) as specialty_score,
    calculate_shared_interests_ratio(u1.interests, u2.interests) as interests_score,
    CASE WHEN u1.city = u2.city THEN 1.0 ELSE 0.0 END as city_score,
    calculate_availability_overlap_ratio(u1.availability_slots, u2.availability_slots) as availability_score,
    calculate_pair_match_score(u1.user_id, u2.user_id) as total_score
FROM get_eligible_users() u1
CROSS JOIN get_eligible_users() u2
WHERE u1.user_id < u2.user_id
ORDER BY calculate_pair_match_score(u1.user_id, u2.user_id) DESC
LIMIT 10;

-- Step 6: Check valid pairs with current threshold
SELECT '=== STEP 6: VALID PAIRS CHECK ===' as step;
SELECT 
    COUNT(*) as valid_pairs_count,
    'Pairs with score >= 0.3' as threshold_info
FROM get_valid_pairs();

-- Step 7: Show actual valid pairs if any exist
SELECT '=== STEP 7: ACTUAL VALID PAIRS ===' as step;
SELECT 
    u1.first_name || ' & ' || u2.first_name as pair,
    u1.city,
    vp.match_score
FROM get_valid_pairs() vp
JOIN get_eligible_users() u1 ON vp.user1_id = u1.user_id
JOIN get_eligible_users() u2 ON vp.user2_id = u2.user_id
ORDER BY vp.match_score DESC
LIMIT 10;

-- Step 8: Test gender balance function
SELECT '=== STEP 8: GENDER BALANCE TEST ===' as step;
SELECT 
    'Mixed group test' as test,
    has_good_gender_balance(ARRAY[
        (SELECT user_id FROM get_eligible_users() WHERE first_name = 'Ahmed' LIMIT 1),
        (SELECT user_id FROM get_eligible_users() WHERE first_name = 'Sarah' LIMIT 1),
        (SELECT user_id FROM get_eligible_users() WHERE first_name = 'Omar' LIMIT 1)
    ]) as gender_balance_result;

-- Step 9: Test group creation with very low threshold (0.1)
SELECT '=== STEP 9: ULTRA LOW THRESHOLD TEST ===' as step;
SELECT 
    COUNT(*) as pairs_with_01_threshold
FROM (
    SELECT calculate_pair_match_score(u1.user_id, u2.user_id) as score
    FROM get_eligible_users() u1
    CROSS JOIN get_eligible_users() u2
    WHERE u1.user_id < u2.user_id
) scores
WHERE score >= 0.1;

-- Step 10: Check if there are any issues with the test data
SELECT '=== STEP 10: TEST DATA VALIDATION ===' as step;
SELECT 
    COUNT(*) as total_test_users,
    COUNT(CASE WHEN is_verified THEN 1 END) as verified_count,
    COUNT(CASE WHEN is_paid THEN 1 END) as paid_count,
    COUNT(CASE WHEN onboarding_completed THEN 1 END) as onboarded_count,
    COUNT(DISTINCT city) as cities_count
FROM profiles 
WHERE email LIKE '%.test@example.com';

SELECT 
    '=== DIAGNOSIS COMPLETE ===' as final_message,
    'Check the results above to identify the issue' as instruction;

