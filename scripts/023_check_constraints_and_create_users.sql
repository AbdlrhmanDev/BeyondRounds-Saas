-- ========================================
-- CHECK CONSTRAINTS AND CREATE VALID TEST USERS
-- ========================================

-- First, let's see the actual constraint definition
SELECT 
    constraint_name,
    check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%gender%';

-- Check existing profiles to see what values are actually used
SELECT DISTINCT 
    gender_preference,
    COUNT(*) as count
FROM profiles 
WHERE gender_preference IS NOT NULL
GROUP BY gender_preference
ORDER BY count DESC;

-- Let's also check the table definition
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('gender', 'gender_preference')
ORDER BY column_name;

-- Clean up any existing test users
DELETE FROM profiles WHERE email LIKE '%.test@example.com';

-- Create test users with the most basic approach - use NULL for gender_preference initially
-- We'll update them after seeing what values work

INSERT INTO profiles (
    id, email, first_name, last_name, specialty, city, gender,
    interests, availability_slots, is_verified, is_paid, onboarding_completed, created_at
) VALUES 
-- Riyadh users (4 users)
(
    uuid_generate_v4(),
    'dr.sarah.test@example.com',
    'Sarah', 'Al-Ahmed',
    'Internal Medicine',
    'Riyadh',
    'female',
    ARRAY['AI in Medicine', 'Research', 'Wellness'],
    ARRAY['Thursday 6PM', 'Friday 2PM', 'Saturday 10AM'],
    true, true, true,
    NOW() - INTERVAL '2 weeks'
),
(
    uuid_generate_v4(),
    'dr.ahmed.test@example.com',
    'Ahmed', 'Al-Rashid',
    'Cardiology',
    'Riyadh',
    'male',
    ARRAY['Sports Medicine', 'Research', 'Technology'],
    ARRAY['Thursday 6PM', 'Friday 10AM', 'Sunday 8PM'],
    true, true, true,
    NOW() - INTERVAL '3 weeks'
),
(
    uuid_generate_v4(),
    'dr.fatima.test@example.com',
    'Fatima', 'Al-Zahra',
    'Pediatrics',
    'Riyadh',
    'female',
    ARRAY['Child Health', 'Education', 'Community Service'],
    ARRAY['Friday 2PM', 'Saturday 4PM', 'Sunday 6PM'],
    true, true, true,
    NOW() - INTERVAL '1 week'
),
(
    uuid_generate_v4(),
    'dr.omar.test@example.com',
    'Omar', 'Al-Mansouri',
    'Emergency Medicine',
    'Riyadh',
    'male',
    ARRAY['Emergency Care', 'Training', 'Sports Medicine'],
    ARRAY['Thursday 6PM', 'Saturday 10AM', 'Sunday 8PM'],
    true, true, true,
    NOW() - INTERVAL '4 days'
),
-- Jeddah users (3 users)
(
    uuid_generate_v4(),
    'dr.layla.test@example.com',
    'Layla', 'Al-Harbi',
    'Dermatology',
    'Jeddah',
    'female',
    ARRAY['Skincare', 'Wellness', 'Research'],
    ARRAY['Friday 10AM', 'Saturday 2PM', 'Sunday 4PM'],
    true, true, true,
    NOW() - INTERVAL '10 days'
),
(
    uuid_generate_v4(),
    'dr.khalid.test@example.com',
    'Khalid', 'Al-Ghamdi',
    'Orthopedics',
    'Jeddah',
    'male',
    ARRAY['Sports Medicine', 'Surgery', 'Fitness'],
    ARRAY['Thursday 8PM', 'Friday 10AM', 'Saturday 6PM'],
    true, true, true,
    NOW() - INTERVAL '5 days'
),
(
    uuid_generate_v4(),
    'dr.nora.test@example.com',
    'Nora', 'Al-Otaibi',
    'Psychiatry',
    'Jeddah',
    'female',
    ARRAY['Mental Health', 'Wellness', 'Community Service'],
    ARRAY['Friday 2PM', 'Saturday 4PM', 'Sunday 10AM'],
    true, true, true,
    NOW() - INTERVAL '2 weeks'
),
-- Dammam user (1 user)
(
    uuid_generate_v4(),
    'dr.yusuf.test@example.com',
    'Yusuf', 'Al-Dosari',
    'Radiology',
    'Dammam',
    'male',
    ARRAY['Medical Imaging', 'Technology', 'Research'],
    ARRAY['Thursday 4PM', 'Friday 8PM', 'Saturday 12PM'],
    true, true, true,
    NOW() - INTERVAL '1 week'
);

-- Check what we created
SELECT 
    'Test users created successfully!' as status,
    COUNT(*) as total_created
FROM profiles 
WHERE email LIKE '%.test@example.com';

-- Show the test users we created
SELECT 
    first_name,
    last_name,
    city,
    gender,
    gender_preference,
    specialty
FROM profiles 
WHERE email LIKE '%.test@example.com'
ORDER BY city, first_name;

-- Show eligible users by city
SELECT 
    city,
    COUNT(*) as user_count,
    CASE 
        WHEN COUNT(*) >= 3 THEN '✅ Meets minimum'
        ELSE '❌ Below minimum (need 3)'
    END as status
FROM get_eligible_users()
GROUP BY city
ORDER BY user_count DESC;

-- Check system readiness
SELECT 
    is_ready,
    eligible_users_count,
    cities_with_min_users,
    CASE 
        WHEN is_ready THEN '🎉 System ready for matching!'
        ELSE '⚠️  Still need more: ' || (min_required_users - eligible_users_count) || ' users'
    END as readiness_status
FROM get_system_readiness();

-- Show what gender_preference values are actually allowed
SELECT 'Check the constraint output above to see valid gender_preference values' as note;

-- Final message
SELECT 
    '🚀 TEST DATA READY!' as message,
    'Run: SELECT trigger_manual_matching(); to test the system' as next_step;

