-- ==============================================
-- Test Onboarding Flow - Debug Profile Update
-- ==============================================
-- Run this to test if the profile update is working correctly

-- 1. Check current profiles and their completion status
SELECT 
  user_id,
  email,
  first_name,
  last_name,
  onboarding_completed,
  profile_completion,
  created_at,
  updated_at
FROM profiles 
ORDER BY updated_at DESC 
LIMIT 5;

-- 2. Test updating a profile manually (replace with actual user_id)
-- Uncomment and modify the user_id below to test
/*
UPDATE profiles 
SET 
  first_name = 'Test',
  last_name = 'User',
  age = 25,
  gender = 'male',
  city = 'Test City',
  medical_specialty = 'general',
  onboarding_completed = true,
  profile_completion = 85,
  updated_at = NOW()
WHERE user_id = 'YOUR_USER_ID_HERE';

-- Check if the update worked
SELECT 
  user_id,
  first_name,
  last_name,
  onboarding_completed,
  profile_completion,
  updated_at
FROM profiles 
WHERE user_id = 'YOUR_USER_ID_HERE';
*/

-- 3. Test the RPC function
-- This should return the profile data
SELECT public.get_or_create_my_profile();

-- 4. Check if there are any RLS issues
-- Try to select profiles as authenticated user
SELECT COUNT(*) as profile_count FROM profiles;

SELECT 'Test completed! Check the results above.' as status;


