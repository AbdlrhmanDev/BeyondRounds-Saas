-- ========================================
-- CREATE TEST USERS FOR MATCHING SYSTEM
-- ========================================
-- This script creates 8 test users across 3 cities to test the matching system

-- First, let's see current user count
SELECT 
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN is_verified = true AND is_paid = true AND onboarding_completed = true THEN 1 END) as eligible_count
FROM profiles;

-- Create test users if they don't exist
-- Note: These are fake users for testing only

-- Riyadh users (4 users)
INSERT INTO profiles (
    id, email, first_name, last_name, specialty, city, gender, gender_preference,
    interests, availability_slots, is_verified, is_paid, onboarding_completed, created_at
) VALUES 
-- User 1: Dr. Sarah (Riyadh)
(
    uuid_generate_v4(),
    'dr.sarah.test@example.com',
    'Sarah', 'Al-Ahmed',
    'Internal Medicine',
    'Riyadh',
    'female',
    'any',
    ARRAY['AI in Medicine', 'Research', 'Wellness'],
    ARRAY['Thursday 6PM', 'Friday 2PM', 'Saturday 10AM'],
    true, true, true,
    NOW() - INTERVAL '2 weeks'
),
-- User 2: Dr. Ahmed (Riyadh)
(
    uuid_generate_v4(),
    'dr.ahmed.test@example.com',
    'Ahmed', 'Al-Rashid',
    'Cardiology',
    'Riyadh',
    'male',
    'any',
    ARRAY['Sports Medicine', 'Research', 'Technology'],
    ARRAY['Thursday 6PM', 'Friday 10AM', 'Sunday 8PM'],
    true, true, true,
    NOW() - INTERVAL '3 weeks'
),
-- User 3: Dr. Fatima (Riyadh)
(
    uuid_generate_v4(),
    'dr.fatima.test@example.com',
    'Fatima', 'Al-Zahra',
    'Pediatrics',
    'Riyadh',
    'female',
    'any',
    ARRAY['Child Health', 'Education', 'Community Service'],
    ARRAY['Friday 2PM', 'Saturday 4PM', 'Sunday 6PM'],
    true, true, true,
    NOW() - INTERVAL '1 week'
),
-- User 4: Dr. Omar (Riyadh)
(
    uuid_generate_v4(),
    'dr.omar.test@example.com',
    'Omar', 'Al-Mansouri',
    'Emergency Medicine',
    'Riyadh',
    'male',
    'any',
    ARRAY['Emergency Care', 'Training', 'Sports Medicine'],
    ARRAY['Thursday 6PM', 'Saturday 10AM', 'Sunday 8PM'],
    true, true, true,
    NOW() - INTERVAL '4 days'
);

-- Jeddah users (3 users)
INSERT INTO profiles (
    id, email, first_name, last_name, specialty, city, gender, gender_preference,
    interests, availability_slots, is_verified, is_paid, onboarding_completed, created_at
) VALUES 
-- User 5: Dr. Layla (Jeddah)
(
    uuid_generate_v4(),
    'dr.layla.test@example.com',
    'Layla', 'Al-Harbi',
    'Dermatology',
    'Jeddah',
    'female',
    'any',
    ARRAY['Skincare', 'Wellness', 'Research'],
    ARRAY['Friday 10AM', 'Saturday 2PM', 'Sunday 4PM'],
    true, true, true,
    NOW() - INTERVAL '10 days'
),
-- User 6: Dr. Khalid (Jeddah)
(
    uuid_generate_v4(),
    'dr.khalid.test@example.com',
    'Khalid', 'Al-Ghamdi',
    'Orthopedics',
    'Jeddah',
    'male',
    'any',
    ARRAY['Sports Medicine', 'Surgery', 'Fitness'],
    ARRAY['Thursday 8PM', 'Friday 10AM', 'Saturday 6PM'],
    true, true, true,
    NOW() - INTERVAL '5 days'
),
-- User 7: Dr. Nora (Jeddah)
(
    uuid_generate_v4(),
    'dr.nora.test@example.com',
    'Nora', 'Al-Otaibi',
    'Psychiatry',
    'Jeddah',
    'female',
    'any',
    ARRAY['Mental Health', 'Wellness', 'Community Service'],
    ARRAY['Friday 2PM', 'Saturday 4PM', 'Sunday 10AM'],
    true, true, true,
    NOW() - INTERVAL '2 weeks'
);

-- Dammam user (1 user - to show rollover)
INSERT INTO profiles (
    id, email, first_name, last_name, specialty, city, gender, gender_preference,
    interests, availability_slots, is_verified, is_paid, onboarding_completed, created_at
) VALUES 
-- User 8: Dr. Yusuf (Dammam) - will be unmatched due to city requirement
(
    uuid_generate_v4(),
    'dr.yusuf.test@example.com',
    'Yusuf', 'Al-Dosari',
    'Radiology',
    'Dammam',
    'male',
    'any',
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

-- Final message
SELECT 
    '🚀 TEST DATA READY!' as message,
    'Run: SELECT trigger_manual_matching(); to test the system' as next_step;

