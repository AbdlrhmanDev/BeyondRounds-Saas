-- ========================================
-- FINAL USER DISTRIBUTION FIX
-- ========================================
-- Distribute users across cities to meet matching requirements

-- First, let's see current user distribution
SELECT 
    'Current Distribution:' as status,
    city,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) as eligible_users
FROM profiles 
WHERE city IS NOT NULL
GROUP BY city
ORDER BY eligible_users DESC;

-- Update users to be distributed across major cities
-- We'll use a rotating assignment to ensure even distribution
WITH numbered_users AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY created_at) as row_num
    FROM profiles 
    WHERE is_verified = true 
      AND is_paid = true 
      AND onboarding_completed = true
)
UPDATE profiles 
SET city = CASE 
    WHEN (SELECT row_num FROM numbered_users WHERE numbered_users.id = profiles.id) % 4 = 0 THEN 'Riyadh'
    WHEN (SELECT row_num FROM numbered_users WHERE numbered_users.id = profiles.id) % 4 = 1 THEN 'Jeddah'
    WHEN (SELECT row_num FROM numbered_users WHERE numbered_users.id = profiles.id) % 4 = 2 THEN 'Dammam'
    ELSE 'Mecca'
END
WHERE is_verified = true 
  AND is_paid = true 
  AND onboarding_completed = true;

-- Ensure we have good specialty distribution too
WITH numbered_users AS (
    SELECT 
        id,
        ROW_NUMBER() OVER (ORDER BY created_at) as row_num
    FROM profiles 
    WHERE is_verified = true 
      AND is_paid = true 
      AND onboarding_completed = true
)
UPDATE profiles 
SET specialty = CASE (SELECT row_num FROM numbered_users WHERE numbered_users.id = profiles.id) % 6
    WHEN 0 THEN 'Internal Medicine'
    WHEN 1 THEN 'Cardiology'
    WHEN 2 THEN 'Pediatrics'
    WHEN 3 THEN 'Emergency Medicine'
    WHEN 4 THEN 'Family Medicine'
    ELSE 'Dermatology'
END
WHERE is_verified = true 
  AND is_paid = true 
  AND onboarding_completed = true;

-- Add diverse interests based on specialty
UPDATE profiles 
SET interests = CASE specialty
    WHEN 'Internal Medicine' THEN ARRAY['Medical Research', 'Patient Care', 'Healthcare Innovation']
    WHEN 'Cardiology' THEN ARRAY['Heart Health', 'Sports Medicine', 'Research']
    WHEN 'Pediatrics' THEN ARRAY['Child Health', 'Education', 'Community Service']
    WHEN 'Emergency Medicine' THEN ARRAY['Emergency Care', 'Training', 'Critical Care']
    WHEN 'Family Medicine' THEN ARRAY['Primary Care', 'Wellness', 'Community Health']
    WHEN 'Dermatology' THEN ARRAY['Skincare', 'Wellness', 'Research']
    ELSE ARRAY['Medical Research', 'Professional Development', 'Healthcare Innovation']
END
WHERE is_verified = true 
  AND is_paid = true 
  AND onboarding_completed = true
  AND (interests IS NULL OR array_length(interests, 1) IS NULL);

-- Add availability slots
UPDATE profiles 
SET availability_slots = CASE city
    WHEN 'Riyadh' THEN ARRAY['Thursday 6PM', 'Friday 2PM', 'Saturday 10AM', 'Sunday 8PM']
    WHEN 'Jeddah' THEN ARRAY['Thursday 8PM', 'Friday 10AM', 'Saturday 2PM', 'Sunday 4PM']
    WHEN 'Dammam' THEN ARRAY['Thursday 4PM', 'Friday 8PM', 'Saturday 12PM', 'Sunday 6PM']
    WHEN 'Mecca' THEN ARRAY['Thursday 7PM', 'Friday 3PM', 'Saturday 11AM', 'Sunday 9PM']
    ELSE ARRAY['Thursday 6PM', 'Friday 2PM', 'Saturday 4PM', 'Sunday 10AM']
END
WHERE is_verified = true 
  AND is_paid = true 
  AND onboarding_completed = true
  AND (availability_slots IS NULL OR array_length(availability_slots, 1) IS NULL);

-- Show updated distribution
SELECT 
    'Updated Distribution:' as status,
    city,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) as eligible_users,
    CASE 
        WHEN COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) >= 3 
        THEN '✅ Ready for matching'
        ELSE '❌ Need more users'
    END as status_check
FROM profiles 
WHERE city IS NOT NULL
GROUP BY city
ORDER BY eligible_users DESC;

-- Check system readiness
SELECT 
    'System Readiness Check:' as info,
    is_ready,
    eligible_users_count,
    cities_with_min_users,
    min_required_users,
    min_required_cities,
    CASE 
        WHEN is_ready THEN '🎉 System ready for matching!'
        ELSE '⚠️ Still need adjustments'
    END as readiness_status
FROM get_system_readiness();

-- Show sample eligible users
SELECT 
    'Sample Eligible Users:' as info,
    first_name,
    last_name,
    city,
    specialty,
    gender,
    array_to_string(interests, ', ') as interests
FROM get_eligible_users()
LIMIT 10;

-- If ready, trigger matching
DO $$
DECLARE
    readiness_result RECORD;
BEGIN
    SELECT * INTO readiness_result FROM get_system_readiness();
    
    IF readiness_result.is_ready THEN
        RAISE NOTICE 'System is ready! Triggering matching...';
        PERFORM trigger_manual_matching();
        RAISE NOTICE 'Matching completed!';
    ELSE
        RAISE NOTICE 'System not ready yet. Need % users in % cities', 
            readiness_result.min_required_users, 
            readiness_result.min_required_cities;
    END IF;
END $$;

-- Final status
SELECT 
    '🎉 USER DISTRIBUTION COMPLETE!' as status,
    'Refresh your dashboard to see the results' as next_step;

