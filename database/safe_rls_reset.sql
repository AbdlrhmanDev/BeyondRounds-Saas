-- ==============================================
-- Safe RLS Reset - Step by Step
-- ==============================================
-- This script safely resets RLS step by step
-- Run this in your Supabase SQL Editor

-- Step 1: Drop triggers first (they depend on functions)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS create_user_preferences_trigger ON profiles;

-- Step 2: Drop functions with CASCADE to handle dependencies
DROP FUNCTION IF EXISTS is_admin_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_user_preferences() CASCADE;

-- Step 3: Disable RLS on main tables
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- Step 4: Drop all policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

-- Step 5: Drop all policies on user_preferences
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Service role can create user preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admins can view all user preferences" ON user_preferences;
DROP POLICY IF EXISTS "Admins can manage all user preferences" ON user_preferences;

-- Step 6: Handle other tables if they exist
DO $$
BEGIN
  -- Handle matches table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'matches') THEN
    ALTER TABLE matches DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view matches" ON matches;
    DROP POLICY IF EXISTS "Users can create matches" ON matches;
    DROP POLICY IF EXISTS "Users can update matches" ON matches;
    DROP POLICY IF EXISTS "Admins can view all matches" ON matches;
    DROP POLICY IF EXISTS "Admins can manage all matches" ON matches;
  END IF;

  -- Handle match_members table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'match_members') THEN
    ALTER TABLE match_members DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view match members" ON match_members;
    DROP POLICY IF EXISTS "Users can create match members" ON match_members;
    DROP POLICY IF EXISTS "Users can update match members" ON match_members;
    DROP POLICY IF EXISTS "Admins can view all match members" ON match_members;
    DROP POLICY IF EXISTS "Admins can manage all match members" ON match_members;
  END IF;

  -- Handle chat_messages table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'chat_messages') THEN
    ALTER TABLE chat_messages DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view chat messages" ON chat_messages;
    DROP POLICY IF EXISTS "Users can create chat messages" ON chat_messages;
    DROP POLICY IF EXISTS "Admins can view all chat messages" ON chat_messages;
    DROP POLICY IF EXISTS "Admins can manage all chat messages" ON chat_messages;
  END IF;

  -- Handle notifications table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications') THEN
    ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view notifications" ON notifications;
    DROP POLICY IF EXISTS "Users can create notifications" ON notifications;
    DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;
    DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
  END IF;

  -- Handle payment_history table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'payment_history') THEN
    ALTER TABLE payment_history DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view payment history" ON payment_history;
    DROP POLICY IF EXISTS "Admins can view all payment history" ON payment_history;
  END IF;

  -- Handle verification_requests table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'verification_requests') THEN
    ALTER TABLE verification_requests DISABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view verification requests" ON verification_requests;
    DROP POLICY IF EXISTS "Users can create verification requests" ON verification_requests;
    DROP POLICY IF EXISTS "Admins can view all verification requests" ON verification_requests;
    DROP POLICY IF EXISTS "Admins can manage all verification requests" ON verification_requests;
  END IF;
END $$;

SELECT 'Safe RLS reset completed! All policies, functions, and triggers removed.' as status;

