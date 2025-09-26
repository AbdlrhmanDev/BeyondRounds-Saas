-- ==============================================
-- Simple Profile Creation Test
-- ==============================================
-- Run this to test if we can create a profile manually

-- Test 1: Try to create a profile with minimal fields
INSERT INTO profiles (
    id,
    user_id,
    email,
    first_name,
    last_name,
    city,
    gender,
    role,
    is_verified,
    onboarding_completed,
    profile_completion_percentage
)
VALUES (
    gen_random_uuid(),
    gen_random_uuid(),
    'test@example.com',
    'Test',
    'User',
    'Test City',
    'prefer-not-to-say',
    'user',
    false,
    false,
    0
);

-- Check if it worked
SELECT 'Profile created successfully!' as result, * FROM profiles WHERE email = 'test@example.com';

-- Clean up
DELETE FROM profiles WHERE email = 'test@example.com';

SELECT 'Test completed!' as status;
