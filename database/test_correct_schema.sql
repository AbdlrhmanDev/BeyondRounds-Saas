-- ==============================================
-- Test Profile Creation with Correct Schema
-- ==============================================
-- Run this to test profile creation with the correct schema

-- Test creating a profile with correct field names
INSERT INTO profiles (
    user_id,
    email,
    first_name,
    last_name,
    city,
    gender,
    role,
    is_verified,
    is_banned,
    onboarding_completed,
    profile_completion_percentage
)
VALUES (
    gen_random_uuid(), -- This would normally be auth.users.id
    'test@example.com',
    'Test',
    'User',
    'Test City',
    'prefer-not-to-say',
    'user',
    false,
    false,
    false,
    0
);

-- Check if it worked
SELECT 'Profile created successfully!' as result, * FROM profiles WHERE email = 'test@example.com';

-- Test user preferences creation
INSERT INTO user_preferences (
    profile_id,
    email_notifications,
    push_notifications,
    weekly_match_reminders,
    marketing_emails,
    privacy_level
)
VALUES (
    (SELECT id FROM profiles WHERE email = 'test@example.com'),
    true,
    true,
    true,
    false,
    'standard'
);

-- Check if preferences were created
SELECT 'User preferences created successfully!' as result, * FROM user_preferences WHERE profile_id = (SELECT id FROM profiles WHERE email = 'test@example.com');

-- Clean up
DELETE FROM user_preferences WHERE profile_id = (SELECT id FROM profiles WHERE email = 'test@example.com');
DELETE FROM profiles WHERE email = 'test@example.com';

SELECT 'Test completed successfully!' as status;

