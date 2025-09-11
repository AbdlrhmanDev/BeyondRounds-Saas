-- ========================================
-- FIXED: AUTHORIZE ALL USERS FOR MATCHING SYSTEM
-- ========================================
-- This script will authorize all users without using window functions in UPDATE

-- First, let's see current user status
SELECT 
    'CURRENT USER STATUS:' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
    COUNT(CASE WHEN is_paid = true THEN 1 END) as paid_users,
    COUNT(CASE WHEN onboarding_completed = true THEN 1 END) as onboarded_users,
    COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) as fully_authorized
FROM profiles;

-- Authorize ALL users for the matching system
UPDATE profiles 
SET 
    is_verified = true,
    is_paid = true,
    onboarding_completed = true
WHERE email IS NOT NULL;

-- Set admin role for specific users (add your email here)
UPDATE profiles 
SET role = 'admin' 
WHERE email IN (
    'abdlrhmannabil2020@gmail.com',
    'abdlrhmanalsbrí@gmail.com',
    'abdlrhmanalsbri@gmail.com'
);

-- Use a different approach for distributing cities - using hash of email
UPDATE profiles 
SET city = CASE (hashtext(email) % 4)
    WHEN 0 THEN 'Riyadh'
    WHEN 1 THEN 'Jeddah' 
    WHEN 2 THEN 'Dammam'
    ELSE 'Mecca'
END
WHERE city IS NULL;

-- Set specialties using hash
UPDATE profiles 
SET specialty = CASE (hashtext(email) % 8)
    WHEN 0 THEN 'Internal Medicine'
    WHEN 1 THEN 'Cardiology'
    WHEN 2 THEN 'Pediatrics'
    WHEN 3 THEN 'Emergency Medicine'
    WHEN 4 THEN 'Family Medicine'
    WHEN 5 THEN 'Dermatology'
    WHEN 6 THEN 'Orthopedics'
    ELSE 'Psychiatry'
END
WHERE specialty IS NULL;

-- Set gender using hash
UPDATE profiles 
SET gender = CASE (hashtext(email) % 2)
    WHEN 0 THEN 'male'
    ELSE 'female'
END
WHERE gender IS NULL;

-- Add interests based on specialty
UPDATE profiles 
SET interests = CASE specialty
    WHEN 'Internal Medicine' THEN ARRAY['Medical Research', 'Patient Care', 'Healthcare Innovation']
    WHEN 'Cardiology' THEN ARRAY['Heart Health', 'Sports Medicine', 'Research']
    WHEN 'Pediatrics' THEN ARRAY['Child Health', 'Education', 'Community Service']
    WHEN 'Emergency Medicine' THEN ARRAY['Emergency Care', 'Training', 'Critical Care']
    WHEN 'Family Medicine' THEN ARRAY['Primary Care', 'Wellness', 'Community Health']
    WHEN 'Dermatology' THEN ARRAY['Skincare', 'Wellness', 'Research']
    WHEN 'Orthopedics' THEN ARRAY['Sports Medicine', 'Surgery', 'Rehabilitation']
    WHEN 'Psychiatry' THEN ARRAY['Mental Health', 'Therapy', 'Wellness']
    ELSE ARRAY['Medical Research', 'Professional Development', 'Healthcare Innovation']
END
WHERE interests IS NULL OR array_length(interests, 1) IS NULL;

-- Add availability slots based on city
UPDATE profiles 
SET availability_slots = CASE city
    WHEN 'Riyadh' THEN ARRAY['Thursday 6PM', 'Friday 2PM', 'Saturday 10AM', 'Sunday 8PM']
    WHEN 'Jeddah' THEN ARRAY['Thursday 8PM', 'Friday 10AM', 'Saturday 2PM', 'Sunday 4PM']
    WHEN 'Dammam' THEN ARRAY['Thursday 4PM', 'Friday 8PM', 'Saturday 12PM', 'Sunday 6PM']
    WHEN 'Mecca' THEN ARRAY['Thursday 7PM', 'Friday 3PM', 'Saturday 11AM', 'Sunday 9PM']
    ELSE ARRAY['Thursday 6PM', 'Friday 2PM', 'Saturday 4PM', 'Sunday 10AM']
END
WHERE availability_slots IS NULL OR array_length(availability_slots, 1) IS NULL;

-- Fill in missing names if needed
UPDATE profiles 
SET 
    first_name = COALESCE(first_name, SPLIT_PART(SPLIT_PART(email, '@', 1), '.', 1)),
    last_name = COALESCE(last_name, SPLIT_PART(SPLIT_PART(email, '@', 1), '.', 2))
WHERE first_name IS NULL OR last_name IS NULL OR first_name = '' OR last_name = '';

-- Capitalize first letters of names
UPDATE profiles 
SET 
    first_name = INITCAP(first_name),
    last_name = INITCAP(last_name)
WHERE first_name IS NOT NULL AND last_name IS NOT NULL;

-- Show updated user status
SELECT 
    'UPDATED USER STATUS:' as info,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_users,
    COUNT(CASE WHEN is_paid = true THEN 1 END) as paid_users,
    COUNT(CASE WHEN onboarding_completed = true THEN 1 END) as onboarded_users,
    COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) as fully_authorized
FROM profiles;

-- Show distribution by city
SELECT 
    'USER DISTRIBUTION BY CITY:' as info,
    city,
    COUNT(*) as total_users,
    COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) as authorized_users,
    CASE 
        WHEN COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) >= 3 
        THEN '✅ Ready for matching'
        ELSE '❌ Need more users'
    END as status
FROM profiles 
WHERE city IS NOT NULL
GROUP BY city
ORDER BY authorized_users DESC;

-- Show specialty distribution
SELECT 
    'USER DISTRIBUTION BY SPECIALTY:' as info,
    specialty,
    COUNT(*) as user_count,
    string_agg(DISTINCT city, ', ') as cities
FROM profiles 
WHERE specialty IS NOT NULL
GROUP BY specialty
ORDER BY user_count DESC;

-- Show admin users
SELECT 
    'ADMIN USERS:' as info,
    email,
    first_name,
    last_name,
    role
FROM profiles 
WHERE role = 'admin';

-- Check system readiness
SELECT 
    'SYSTEM READINESS:' as info,
    is_ready,
    eligible_users_count,
    cities_with_min_users,
    CASE 
        WHEN is_ready THEN '🎉 System ready for matching!'
        ELSE '⚠️ Need more setup'
    END as status
FROM get_system_readiness();

-- Show sample authorized users
SELECT 
    'SAMPLE AUTHORIZED USERS:' as info,
    email,
    first_name,
    last_name,
    city,
    specialty,
    gender,
    array_to_string(interests, ', ') as interests,
    is_verified,
    is_paid,
    onboarding_completed
FROM profiles 
WHERE is_verified = true AND is_paid = true AND onboarding_completed = true
ORDER BY city, first_name
LIMIT 15;

-- If system is ready, trigger matching
DO $$
DECLARE
    readiness_result RECORD;
    matching_result JSONB;
BEGIN
    SELECT * INTO readiness_result FROM get_system_readiness();
    
    IF readiness_result.is_ready THEN
        RAISE NOTICE 'System is ready! Triggering matching...';
        SELECT trigger_manual_matching() INTO matching_result;
        RAISE NOTICE 'Matching completed! Result: %', matching_result;
    ELSE
        RAISE NOTICE 'System not ready yet. Eligible users: %, Cities with min users: %', 
            readiness_result.eligible_users_count, readiness_result.cities_with_min_users;
    END IF;
END $$;

-- Show matching results if any
SELECT 
    'LATEST MATCHING RESULTS:' as info,
    execution_date,
    total_eligible_users,
    groups_created,
    users_matched,
    users_unmatched,
    execution_time_ms
FROM matching_logs 
ORDER BY created_at DESC 
LIMIT 1;

-- Show created groups
SELECT 
    'CREATED GROUPS:' as info,
    m.group_name,
    COUNT(mm.user_id) as member_count,
    string_agg(p.first_name || ' ' || p.last_name, ', ' ORDER BY p.first_name) as members,
    string_agg(DISTINCT p.city, ', ') as cities,
    m.created_at
FROM matches m
JOIN match_members mm ON m.id = mm.match_id
JOIN profiles p ON mm.user_id = p.id
WHERE m.created_at >= CURRENT_DATE
GROUP BY m.id, m.group_name, m.created_at
ORDER BY m.created_at DESC;

-- Final success message
SELECT 
    '🎉 ALL USERS AUTHORIZED!' as status,
    'Users can now participate in matching' as message,
    'Refresh your dashboard to see results' as next_step;

