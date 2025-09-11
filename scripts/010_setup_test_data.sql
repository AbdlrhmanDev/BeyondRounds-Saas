-- ==============================================
-- SETUP TEST DATA FOR BEYONDROUNDS MATCHING
-- This script creates test users for testing the matching system
-- ==============================================

-- WARNING: This is for DEVELOPMENT/TESTING only!
-- Do NOT run this in production with real user data

-- ==============================================
-- STEP 1: SET ADMIN ROLE
-- ==============================================

-- Update your email to be admin (replace with your actual email)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'abdlrhmannabil2020@gmail.com';

-- ==============================================
-- STEP 2: CREATE TEST USERS (if needed)
-- ==============================================

-- Only run this if you need more test users
-- This creates sample users for testing purposes

DO $$
DECLARE
  test_user_id UUID;
  cities TEXT[] := ARRAY['Riyadh', 'Jeddah', 'Dammam', 'Mecca'];
  specialties TEXT[] := ARRAY['Cardiology', 'Internal Medicine', 'Surgery', 'Pediatrics', 'Emergency Medicine'];
  interests TEXT[] := ARRAY['AI', 'Wellness', 'Fitness', 'Reading', 'Travel', 'Cooking'];
  availability TEXT[] := ARRAY['Thursday 4PM', 'Friday 10AM', 'Saturday 2PM', 'Sunday 10AM'];
  i INTEGER;
BEGIN
  -- Create 12 test users (3 per city)
  FOR i IN 1..12 LOOP
    test_user_id := gen_random_uuid();
    
    -- Insert into profiles table
    INSERT INTO profiles (
      id,
      email,
      first_name,
      last_name,
      specialty,
      city,
      gender,
      gender_preference,
      interests,
      availability_slots,
      is_verified,
      is_paid,
      onboarding_completed,
      role,
      created_at
    ) VALUES (
      test_user_id,
      'test' || i || '@beyondrounds.com',
      'Test' || i,
      'Doctor',
      specialties[((i - 1) % array_length(specialties, 1)) + 1],
      cities[((i - 1) % array_length(cities, 1)) + 1],
      CASE WHEN i % 2 = 0 THEN 'female' ELSE 'male' END,
      'no-preference',
      interests[1:3], -- First 3 interests
      availability[1:2], -- First 2 availability slots
      true, -- verified
      true, -- paid
      true, -- onboarding completed
      'user',
      NOW() - INTERVAL '1 week' -- Created a week ago
    )
    ON CONFLICT (email) DO NOTHING; -- Skip if already exists
    
    RAISE NOTICE 'Created test user: test%@beyondrounds.com', i;
  END LOOP;
  
  RAISE NOTICE 'Test data setup completed!';
END $$;

-- ==============================================
-- STEP 3: VERIFY TEST DATA
-- ==============================================

-- Check the created test data
SELECT 
  'Test Users Created' as summary,
  COUNT(*) as count
FROM profiles 
WHERE email LIKE 'test%@beyondrounds.com'
UNION ALL
SELECT 
  'Total Eligible Users' as summary,
  get_eligible_users_count() as count
UNION ALL
SELECT 
  'Cities with 3+ Users' as summary,
  COUNT(*) as count
FROM (
  SELECT city, COUNT(*) as user_count
  FROM profiles 
  WHERE is_verified = true 
    AND is_paid = true 
    AND onboarding_completed = true
  GROUP BY city
  HAVING COUNT(*) >= 3
) city_stats;

-- ==============================================
-- STEP 4: ENABLE EXISTING USERS FOR TESTING
-- ==============================================

-- If you have existing users but they're not verified/paid,
-- you can temporarily enable them for testing:

-- UNCOMMENT BELOW TO ENABLE EXISTING USERS FOR TESTING
-- WARNING: Only do this in development!

/*
UPDATE profiles 
SET 
  is_verified = true,
  is_paid = true,
  onboarding_completed = true
WHERE 
  email NOT LIKE '%@beyondrounds.com' -- Don't modify admin emails
  AND (
    NOT is_verified OR 
    NOT is_paid OR 
    NOT onboarding_completed
  );
*/

-- ==============================================
-- STEP 5: TESTING COMMANDS
-- ==============================================

-- After running this script, test the system with:

-- 1. Check statistics
-- SELECT * FROM get_matching_statistics();

-- 2. Check eligible users
-- SELECT get_eligible_users_count();

-- 3. Test matching (admin only)
-- SELECT trigger_manual_matching();

-- 4. View results
-- SELECT * FROM get_matching_history(3);

-- ==============================================
-- CLEANUP (when done testing)
-- ==============================================

-- To remove test data when done:
-- DELETE FROM profiles WHERE email LIKE 'test%@beyondrounds.com';

RAISE NOTICE '';
RAISE NOTICE '🧪 TEST DATA SETUP COMPLETE!';
RAISE NOTICE '============================';
RAISE NOTICE '';
RAISE NOTICE '✅ Admin role set for abdlrhmannabil2020@gmail.com';
RAISE NOTICE '✅ Test users created (if needed)';
RAISE NOTICE '';
RAISE NOTICE '📋 NEXT STEPS:';
RAISE NOTICE '1. Go to your dashboard at /dashboard';
RAISE NOTICE '2. You should see the enhanced matching dashboard';
RAISE NOTICE '3. Click "Test Matching" button (admin only)';
RAISE NOTICE '4. View results in real-time';
RAISE NOTICE '';
RAISE NOTICE '🔧 TESTING COMMANDS:';
RAISE NOTICE '• Check stats: SELECT * FROM get_matching_statistics();';
RAISE NOTICE '• Test matching: SELECT trigger_manual_matching();';
RAISE NOTICE '• View history: SELECT * FROM get_matching_history();';
RAISE NOTICE '';
RAISE NOTICE '🎯 Your matching system is ready for testing!';
RAISE NOTICE '';

