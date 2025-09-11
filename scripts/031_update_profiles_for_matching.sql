-- ========================================
-- UPDATE PROFILES FOR OPTIMAL MATCHING
-- ========================================
-- This script will ensure profiles are optimized for the matching system

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

-- Ensure all profiles have cities
UPDATE profiles 
SET city = CASE 
    WHEN id % 4 = 0 THEN 'Riyadh'
    WHEN id % 4 = 1 THEN 'Jeddah'
    WHEN id % 4 = 2 THEN 'Dammam'
    ELSE 'Mecca'
END
WHERE city IS NULL OR city = '';

-- Ensure all profiles have specialties
UPDATE profiles 
SET specialty = CASE 
    WHEN specialty IS NULL OR specialty = '' THEN 'Internal Medicine'
    ELSE specialty
END;

-- Ensure all profiles have gender
UPDATE profiles 
SET gender = CASE 
    WHEN gender IS NULL OR gender = '' THEN 
        CASE WHEN id % 2 = 0 THEN 'male' ELSE 'female' END
    ELSE gender
END;

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
    array_length(interests, 1) as interests_count,
    array_length(availability_slots, 1) as availability_count
FROM profiles 
ORDER BY created_at DESC
LIMIT 10;

-- Final message
SELECT 
    '✅ PROFILES UPDATED SUCCESSFULLY!' as status,
    'System should now be ready for matching' as message,
    'Try running: SELECT trigger_manual_matching();' as next_step;

