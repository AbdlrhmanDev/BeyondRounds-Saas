-- ==============================================
-- Temporary RLS Disable for Testing
-- ==============================================
-- Run this to temporarily disable RLS and test profile creation

-- Disable RLS on profiles table temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Test creating a profile
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
SELECT 'Profile created with RLS disabled!' as result, * FROM profiles WHERE email = 'test@example.com';

-- Clean up
DELETE FROM profiles WHERE email = 'test@example.com';

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

SELECT 'RLS test completed!' as status;
