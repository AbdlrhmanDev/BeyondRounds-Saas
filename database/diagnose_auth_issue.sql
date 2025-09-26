-- Diagnostic script to identify the cause of Auth API 500 error
-- Run this in your Supabase SQL Editor

-- 1. Check for existing triggers on auth.users
SELECT
    schemaname,
    tablename,
    triggername,
    eventmanipulation,
    actionstatement
FROM information_schema.triggers
WHERE event_object_schema = 'auth'
AND event_object_table = 'users';

-- 2. Check for functions that might be called by triggers
SELECT
    n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_result(p.oid) AS result_type,
    pg_get_function_arguments(p.oid) AS arguments
FROM pg_proc p
LEFT JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname LIKE '%user%' OR p.proname LIKE '%profile%';

-- 3. Check RLS policies on profiles table
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'profiles';

-- 4. Check if profiles table has correct structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. Check constraints on profiles table
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
    ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public'
AND tc.table_name = 'profiles';

-- 6. Test profile creation manually (this should work if constraints are correct)
-- DO NOT RUN THIS - Just for reference
-- INSERT INTO profiles (user_id, email, first_name, last_name, city)
-- VALUES (
--     gen_random_uuid(),
--     'test@example.com',
--     'Test',
--     'User',
--     'Test City'
-- );

-- 7. Check for any other tables that might have triggers affecting auth.users
SELECT DISTINCT
    event_object_schema,
    event_object_table,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE action_statement LIKE '%auth%' OR action_statement LIKE '%user%';