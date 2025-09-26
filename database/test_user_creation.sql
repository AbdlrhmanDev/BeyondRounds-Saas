-- ==============================================
-- Test User Creation Script
-- ==============================================
-- Run this after applying the ultra minimal fix to test user creation

-- Test creating a profile manually (simulating what the trigger should do)
INSERT INTO profiles (
    id,
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

-- Check if the profile was created
SELECT * FROM profiles WHERE email = 'test@example.com';

-- Clean up test data
DELETE FROM profiles WHERE email = 'test@example.com';

SELECT 'Test completed successfully!' as status;

