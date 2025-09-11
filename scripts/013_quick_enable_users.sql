-- ==============================================
-- QUICK USER ENABLEMENT FOR TESTING
-- This script helps you reach the minimum 6 users
-- ==============================================

-- Check current status
SELECT 
  'Current Status' as info,
  COUNT(*) as total_users,
  COUNT(*) FILTER (WHERE is_verified = true) as verified_users,
  COUNT(*) FILTER (WHERE is_verified = true AND is_paid = true) as paid_users,
  COUNT(*) FILTER (WHERE is_verified = true AND is_paid = true AND onboarding_completed = true) as eligible_users
FROM profiles;

-- Show users that could be enabled
SELECT 
  'Users that could be enabled' as info,
  first_name,
  last_name,
  email,
  city,
  is_verified,
  is_paid,
  onboarding_completed,
  CASE 
    WHEN NOT is_verified THEN 'Need verification'
    WHEN NOT is_paid THEN 'Need payment'
    WHEN NOT onboarding_completed THEN 'Need onboarding'
    ELSE 'Already eligible'
  END as status
FROM profiles
ORDER BY 
  CASE 
    WHEN is_verified AND is_paid AND NOT onboarding_completed THEN 1
    WHEN is_verified AND NOT is_paid THEN 2
    WHEN NOT is_verified THEN 3
    ELSE 4
  END,
  created_at DESC;

-- ==============================================
-- OPTION 1: ENABLE EXISTING USERS (RECOMMENDED)
-- ==============================================

-- Enable the most complete users first (those who just need one thing)
-- UNCOMMENT THE LINES BELOW TO ENABLE USERS:

/*
-- Enable users who just need onboarding completed
UPDATE profiles 
SET onboarding_completed = true
WHERE is_verified = true 
  AND is_paid = true 
  AND NOT onboarding_completed = true
  AND email NOT LIKE '%@beyondrounds.com'  -- Don't modify admin emails
RETURNING first_name, last_name, email, 'Onboarding completed' as action;

-- Enable users who just need payment
UPDATE profiles 
SET is_paid = true
WHERE is_verified = true 
  AND NOT is_paid = true
  AND email NOT LIKE '%@beyondrounds.com'
RETURNING first_name, last_name, email, 'Payment enabled' as action;

-- Enable users who just need verification (be careful with this in production)
UPDATE profiles 
SET is_verified = true
WHERE NOT is_verified = true
  AND email NOT LIKE '%@beyondrounds.com'
RETURNING first_name, last_name, email, 'Verification enabled' as action;
*/

-- ==============================================
-- OPTION 2: ADD TEST USERS
-- ==============================================

-- Add specific test users to reach minimum
-- UNCOMMENT BELOW TO ADD TEST USERS:

/*
INSERT INTO profiles (
  id, email, first_name, last_name, specialty, city, gender, gender_preference,
  interests, availability_slots, is_verified, is_paid, onboarding_completed, role, created_at
) VALUES
  (gen_random_uuid(), 'doctor1@test.com', 'Ahmad', 'Al-Rashid', 'Cardiology', 'Riyadh', 'male', 'no-preference', 
   ARRAY['AI', 'Fitness', 'Reading'], ARRAY['Thursday 4PM', 'Friday 10AM'], true, true, true, 'user', NOW()),
  (gen_random_uuid(), 'doctor2@test.com', 'Fatima', 'Al-Zahra', 'Internal Medicine', 'Jeddah', 'female', 'no-preference', 
   ARRAY['Wellness', 'Travel', 'Cooking'], ARRAY['Saturday 2PM', 'Sunday 10AM'], true, true, true, 'user', NOW()),
  (gen_random_uuid(), 'doctor3@test.com', 'Omar', 'Al-Fahad', 'Surgery', 'Riyadh', 'male', 'no-preference', 
   ARRAY['Sports', 'Technology', 'Music'], ARRAY['Friday 6PM', 'Saturday 7PM'], true, true, true, 'user', NOW())
ON CONFLICT (email) DO NOTHING
RETURNING first_name, last_name, email, city, 'Test user added' as action;
*/

-- ==============================================
-- CHECK RESULTS
-- ==============================================

-- After enabling users, check the new status
DO $$
DECLARE
  eligible_count INTEGER;
  cities_ready INTEGER;
  system_ready BOOLEAN;
BEGIN
  -- Get eligible users count
  SELECT get_eligible_users_count() INTO eligible_count;
  
  -- Get cities ready count
  SELECT COUNT(*) INTO cities_ready
  FROM (
    SELECT city, COUNT(*) as user_count
    FROM profiles 
    WHERE is_verified = true 
      AND is_paid = true 
      AND onboarding_completed = true
    GROUP BY city
    HAVING COUNT(*) >= 3
  ) city_counts;
  
  system_ready := (eligible_count >= 6 AND cities_ready >= 2);
  
  RAISE NOTICE '';
  RAISE NOTICE '🎯 UPDATED SYSTEM STATUS';
  RAISE NOTICE '=====================';
  RAISE NOTICE 'Eligible Users: %/6 %', 
    eligible_count, 
    CASE WHEN eligible_count >= 6 THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'Cities Ready: %/2 %', 
    cities_ready, 
    CASE WHEN cities_ready >= 2 THEN '✅' ELSE '❌' END;
  RAISE NOTICE 'System Ready: %', 
    CASE WHEN system_ready THEN '✅ YES - Ready for matching!' ELSE '❌ NO - Need more users/cities' END;
  RAISE NOTICE '';
  
  IF system_ready THEN
    RAISE NOTICE '🚀 You can now test the matching system!';
    RAISE NOTICE 'Run: SELECT trigger_manual_matching();';
  ELSE
    IF eligible_count < 6 THEN
      RAISE NOTICE '👥 Need % more eligible users', 6 - eligible_count;
    END IF;
    IF cities_ready < 2 THEN
      RAISE NOTICE '🏙️ Need % more cities with 3+ users', 2 - cities_ready;
    END IF;
  END IF;
  RAISE NOTICE '';
END $$;
