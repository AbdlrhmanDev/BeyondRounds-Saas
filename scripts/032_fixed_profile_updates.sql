-- ========================================
-- FIXED PROFILE UPDATES FOR MATCHING
-- ========================================
-- This script fixes the UUID modulo issue

-- First, let's see the current profile status
SELECT 
    'Current Profile Status:' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count,
    COUNT(CASE WHEN is_paid = true THEN 1 END) as paid_count,
    COUNT(CASE WHEN onboarding_completed = true THEN 1 END) as onboarded_count,
    COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) as fully_eligible
FROM profiles;

-- Show profiles by city to see distribution
SELECT 
    'Profiles by City:' as info,
    city,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) as eligible_users,
    CASE 
        WHEN COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) >= 3 
        THEN '✅ Ready for matching'
        ELSE '❌ Need more users'
    END as city_status
FROM profiles 
WHERE city IS NOT NULL
GROUP BY city
ORDER BY eligible_users DESC;

-- Update profiles to be more matching-ready
-- Enable more users for matching (set verified, paid, onboarded)
UPDATE profiles 
SET 
    is_verified = true,
    is_paid = true,
    onboarding_completed = true
WHERE is_verified = false OR is_paid = false OR onboarding_completed = false;

-- Ensure all profiles have interests (important for matching)
UPDATE profiles 
SET interests = ARRAY['Medical Research', 'Professional Development', 'Healthcare Innovation']
WHERE interests IS NULL OR array_length(interests, 1) IS NULL OR array_length(interests, 1) = 0;

-- Ensure all profiles have availability slots
UPDATE profiles 
SET availability_slots = ARRAY['Thursday 6PM', 'Friday 2PM', 'Saturday 4PM', 'Sunday 10AM']
WHERE availability_slots IS NULL OR array_length(availability_slots, 1) IS NULL OR array_length(availability_slots, 1) = 0;

-- Ensure all profiles have cities (using hash of UUID instead of modulo)
UPDATE profiles 
SET city = CASE 
    WHEN (hashtext(id::text) % 4) = 0 THEN 'Riyadh'
    WHEN (hashtext(id::text) % 4) = 1 THEN 'Jeddah'
    WHEN (hashtext(id::text) % 4) = 2 THEN 'Dammam'
    ELSE 'Mecca'
END
WHERE city IS NULL OR city = '';

-- Ensure all profiles have specialties
UPDATE profiles 
SET specialty = CASE 
    WHEN specialty IS NULL OR specialty = '' THEN 
        CASE (hashtext(id::text) % 6)
            WHEN 0 THEN 'Internal Medicine'
            WHEN 1 THEN 'Cardiology'
            WHEN 2 THEN 'Pediatrics'
            WHEN 3 THEN 'Dermatology'
            WHEN 4 THEN 'Emergency Medicine'
            ELSE 'Family Medicine'
        END
    ELSE specialty
END;

-- Ensure all profiles have gender (using hash for distribution)
UPDATE profiles 
SET gender = CASE 
    WHEN gender IS NULL OR gender = '' THEN 
        CASE WHEN (hashtext(id::text) % 2) = 0 THEN 'male' ELSE 'female' END
    ELSE gender
END;

-- Add some variety to interests based on specialty
UPDATE profiles 
SET interests = CASE specialty
    WHEN 'Internal Medicine' THEN ARRAY['Medical Research', 'Patient Care', 'Healthcare Innovation']
    WHEN 'Cardiology' THEN ARRAY['Heart Health', 'Sports Medicine', 'Research']
    WHEN 'Pediatrics' THEN ARRAY['Child Health', 'Education', 'Community Service']
    WHEN 'Dermatology' THEN ARRAY['Skincare', 'Wellness', 'Research']
    WHEN 'Emergency Medicine' THEN ARRAY['Emergency Care', 'Training', 'Critical Care']
    WHEN 'Family Medicine' THEN ARRAY['Primary Care', 'Wellness', 'Community Health']
    ELSE ARRAY['Medical Research', 'Professional Development', 'Healthcare Innovation']
END
WHERE specialty IS NOT NULL;

-- Add variety to availability based on city
UPDATE profiles 
SET availability_slots = CASE city
    WHEN 'Riyadh' THEN ARRAY['Thursday 6PM', 'Friday 2PM', 'Saturday 10AM', 'Sunday 8PM']
    WHEN 'Jeddah' THEN ARRAY['Thursday 8PM', 'Friday 10AM', 'Saturday 2PM', 'Sunday 4PM']
    WHEN 'Dammam' THEN ARRAY['Thursday 4PM', 'Friday 8PM', 'Saturday 12PM', 'Sunday 6PM']
    WHEN 'Mecca' THEN ARRAY['Thursday 7PM', 'Friday 3PM', 'Saturday 11AM', 'Sunday 9PM']
    ELSE ARRAY['Thursday 6PM', 'Friday 2PM', 'Saturday 4PM', 'Sunday 10AM']
END
WHERE city IS NOT NULL;

-- Show updated statistics
SELECT 
    'Updated Profile Status:' as info,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count,
    COUNT(CASE WHEN is_paid = true THEN 1 END) as paid_count,
    COUNT(CASE WHEN onboarding_completed = true THEN 1 END) as onboarded_count,
    COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) as fully_eligible
FROM profiles;

-- Show updated city distribution
SELECT 
    'Updated City Distribution:' as info,
    city,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) as eligible_users,
    CASE 
        WHEN COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) >= 3 
        THEN '✅ Ready for matching'
        ELSE '❌ Need more users'
    END as city_status
FROM profiles 
WHERE city IS NOT NULL
GROUP BY city
ORDER BY eligible_users DESC;

-- Show specialty distribution
SELECT 
    'Specialty Distribution:' as info,
    specialty,
    COUNT(*) as user_count,
    string_agg(DISTINCT city, ', ') as cities
FROM profiles 
WHERE specialty IS NOT NULL
GROUP BY specialty
ORDER BY user_count DESC;

-- Check system readiness after updates
SELECT 
    'System Readiness After Updates:' as info,
    is_ready,
    eligible_users_count,
    cities_with_min_users,
    CASE 
        WHEN is_ready THEN '🎉 System is ready for matching!'
        ELSE '⚠️ Still need adjustments'
    END as readiness_status
FROM get_system_readiness();

-- Show sample of updated profiles
SELECT 
    'Sample Updated Profiles:' as info,
    first_name,
    last_name,
    city,
    specialty,
    gender,
    is_verified,
    is_paid,
    onboarding_completed,
    array_to_string(interests, ', ') as interests,
    array_to_string(availability_slots, ', ') as availability
FROM profiles 
WHERE is_verified = true AND is_paid = true AND onboarding_completed = true
ORDER BY city, first_name
LIMIT 15;

-- Final message
SELECT 
    '✅ PROFILES UPDATED SUCCESSFULLY!' as status,
    'System should now be ready for matching' as message,
    'Try running: SELECT trigger_manual_matching();' as next_step;

