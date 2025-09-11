-- ==============================================
-- FIX ADMIN ACCESS AND TEST MATCHING
-- ==============================================

RAISE NOTICE '🔧 FIXING ADMIN ACCESS FOR BEYONDROUNDS';
RAISE NOTICE '=====================================';
RAISE NOTICE '';

-- Step 1: Check current user
DO $$
DECLARE
  current_user_record RECORD;
BEGIN
  SELECT 
    auth.uid() as user_id,
    email,
    role,
    first_name,
    last_name
  INTO current_user_record
  FROM profiles 
  WHERE id = auth.uid();
  
  IF current_user_record.user_id IS NOT NULL THEN
    RAISE NOTICE '👤 Current User: % (%) - Role: %', 
      current_user_record.first_name || ' ' || current_user_record.last_name,
      current_user_record.email,
      COALESCE(current_user_record.role, 'user');
  ELSE
    RAISE NOTICE '❌ No user found - are you logged in?';
  END IF;
END $$;

-- Step 2: Set current user as admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = auth.uid()
RETURNING 
  first_name, 
  last_name, 
  email, 
  role,
  'Admin role granted' as status;

RAISE NOTICE '✅ Admin role granted to current user';
RAISE NOTICE '';

-- Step 3: Also set the main admin email as admin (if it exists)
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'abdlrhmannabil2020@gmail.com'
  AND id != auth.uid()  -- Don't update if it's the same user
RETURNING 
  first_name, 
  last_name, 
  email, 
  role,
  'Admin role granted to main admin email' as status;

-- Step 4: Verify admin access
DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count
  FROM profiles 
  WHERE role = 'admin';
  
  RAISE NOTICE '👑 Total Admin Users: %', admin_count;
  RAISE NOTICE '';
END $$;

-- Step 5: Test the matching function
RAISE NOTICE '🧪 TESTING MATCHING FUNCTION';
RAISE NOTICE '===========================';

DO $$
DECLARE
  test_result JSONB;
BEGIN
  -- Try to run the matching function
  BEGIN
    SELECT trigger_manual_matching() INTO test_result;
    
    RAISE NOTICE '✅ SUCCESS! Matching function executed';
    RAISE NOTICE 'Result: %', test_result;
    RAISE NOTICE '';
    
    -- Show summary of results
    IF (test_result->>'success')::BOOLEAN THEN
      RAISE NOTICE '🎉 MATCHING RESULTS:';
      RAISE NOTICE '   • Week: %', test_result->>'week';
      RAISE NOTICE '   • Eligible Users: %', test_result->>'eligible_users';
      RAISE NOTICE '   • Groups Created: %', test_result->>'groups_created';
      IF (test_result->>'groups_created')::INTEGER > 0 THEN
        RAISE NOTICE '   • Matched Users: %', test_result->>'matched_users';
        RAISE NOTICE '   • Rollover Candidates: %', test_result->>'rollover_candidates';
        RAISE NOTICE '   • Execution Time: %ms', test_result->>'execution_time_ms';
      END IF;
    ELSE
      RAISE NOTICE '⚠️ Matching completed but no groups created';
      RAISE NOTICE 'Reason: %', test_result->>'message';
    END IF;
    
  EXCEPTION
    WHEN OTHERS THEN
      RAISE NOTICE '❌ Error running matching function: %', SQLERRM;
      RAISE NOTICE 'This might mean the functions are not installed yet.';
  END;
END $$;

RAISE NOTICE '';
RAISE NOTICE '📋 NEXT STEPS:';
RAISE NOTICE '';
RAISE NOTICE 'If matching worked:';
RAISE NOTICE '  ✅ Check your dashboard - it should show created groups';
RAISE NOTICE '  ✅ Check matches table: SELECT * FROM matches ORDER BY created_at DESC;';
RAISE NOTICE '  ✅ Check chat messages: SELECT * FROM chat_messages ORDER BY created_at DESC;';
RAISE NOTICE '';
RAISE NOTICE 'If matching failed:';
RAISE NOTICE '  → Run the complete Supabase CRON setup first';
RAISE NOTICE '  → scripts/009_complete_supabase_cron_system.sql';
RAISE NOTICE '';
RAISE NOTICE '🎯 You should now have admin access and can test matching!';
RAISE NOTICE '';
