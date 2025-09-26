-- ==============================================
-- Diagnostic Script - Check Profile Creation Issue
-- ==============================================
-- Run this to diagnose why profiles aren't being created

-- 1. Check if the trigger exists and is active
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if the function exists
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 3. Check current RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- 4. Check current policies on profiles table
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 5. Check recent auth users (last 10)
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 6. Check if profiles exist for recent users
SELECT 
    p.id,
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.created_at,
    u.created_at as auth_created_at
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
ORDER BY p.created_at DESC 
LIMIT 10;

-- 7. Check for orphaned auth users (users without profiles)
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.email_confirmed_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.id IS NULL
ORDER BY u.created_at DESC 
LIMIT 10;

-- 8. Test creating a profile manually (this will help identify the issue)
-- Uncomment the lines below to test manual profile creation
/*
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get the most recent user ID
    SELECT id INTO test_user_id 
    FROM auth.users 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Try to create a profile manually
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
        is_banned,
        onboarding_completed,
        profile_completion_percentage
    )
    VALUES (
        test_user_id,
        test_user_id,
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
    
    RAISE NOTICE 'Profile created successfully for user: %', test_user_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error creating profile: %', SQLERRM;
END $$;
*/

SELECT 'Diagnostic completed! Check the results above.' as status;


