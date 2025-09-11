-- Check current RLS policies on chat_messages table
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
WHERE tablename = 'chat_messages'
ORDER BY policyname;

-- Check if RLS is enabled on chat_messages
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'chat_messages';

-- Check if chat_messages table exists and its structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
ORDER BY ordinal_position;

-- Test basic insert permission (this should work if RLS is properly configured)
-- DO NOT RUN THIS IN PRODUCTION - it's just to test permissions
-- INSERT INTO chat_messages (match_id, user_id, content, message_type) 
-- VALUES ('test-match-id', auth.uid(), 'Test message', 'user');

-- Check current user authentication
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role;

-- Check if there are any existing chat_messages
SELECT COUNT(*) as total_messages FROM chat_messages LIMIT 1;

