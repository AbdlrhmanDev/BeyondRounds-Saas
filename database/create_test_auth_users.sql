-- ==============================================
-- BeyondRounds Test Users Creation Script
-- Creates authenticated users in Supabase Auth
-- ==============================================

-- This script creates test users in Supabase Auth with proper passwords
-- Run this in your Supabase SQL Editor after setting up your environment

-- Note: This script uses Supabase's auth.admin functions
-- You need to run this with service role permissions

-- ==============================================
-- CREATE TEST USERS IN SUPABASE AUTH
-- ==============================================

-- Test User 1: Ahmed Hassan (Cardiology)
SELECT auth.admin.create_user(
  '{
    "email": "ahmed.hassan@test.beyondrounds.com",
    "password": "TestPassword123!",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Ahmed",
      "last_name": "Hassan",
      "city": "Riyadh",
      "medical_specialty": "Cardiology"
    }
  }'
);

-- Test User 2: Sara Al-Qahtani (Dermatology)
SELECT auth.admin.create_user(
  '{
    "email": "sara.alqahtani@test.beyondrounds.com",
    "password": "TestPassword123!",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Sara",
      "last_name": "Al-Qahtani",
      "city": "Riyadh",
      "medical_specialty": "Dermatology"
    }
  }'
);

-- Test User 3: Omar Mohammed (Orthopedics)
SELECT auth.admin.create_user(
  '{
    "email": "omar.mohammed@test.beyondrounds.com",
    "password": "TestPassword123!",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Omar",
      "last_name": "Mohammed",
      "city": "Riyadh",
      "medical_specialty": "Orthopedics"
    }
  }'
);

-- Test User 4: Fatima Al-Zahra (Pediatrics)
SELECT auth.admin.create_user(
  '{
    "email": "fatima.alzahra@test.beyondrounds.com",
    "password": "TestPassword123!",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Fatima",
      "last_name": "Al-Zahra",
      "city": "Riyadh",
      "medical_specialty": "Pediatrics"
    }
  }'
);

-- Test User 5: Khalid Al-Farisi (Emergency Medicine)
SELECT auth.admin.create_user(
  '{
    "email": "khalid.alfarisi@test.beyondrounds.com",
    "password": "TestPassword123!",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Khalid",
      "last_name": "Al-Farisi",
      "city": "Riyadh",
      "medical_specialty": "Emergency Medicine"
    }
  }'
);

-- ==============================================
-- VERIFY USERS WERE CREATED
-- ==============================================

-- Check if users were created successfully
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  user_metadata
FROM auth.users 
WHERE email LIKE '%@test.beyondrounds.com'
ORDER BY created_at DESC;

-- ==============================================
-- NOTES
-- ==============================================

-- After running this script:
-- 1. The users will be created in Supabase Auth
-- 2. You can login with any of these credentials:
--    - Email: ahmed.hassan@test.beyondrounds.com
--    - Password: TestPassword123!
-- 3. The profile creation will be handled by your app's triggers
-- 4. If profiles don't exist, run the comprehensive_test_data_25_users.sql script
--    to create the corresponding profile data

-- ==============================================
-- TROUBLESHOOTING
-- ==============================================

-- If you get permission errors:
-- 1. Make sure you're using the service role key
-- 2. Check that RLS policies allow profile creation
-- 3. Verify the auth triggers are set up correctly

-- If profiles aren't created automatically:
-- 1. Check the auth.users trigger exists
-- 2. Run the profile creation script manually
-- 3. Verify the handle_new_user() function works
