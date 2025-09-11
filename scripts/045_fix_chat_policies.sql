-- Enable RLS on chat_messages if not already enabled
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
DROP POLICY IF EXISTS "Users can view messages in their groups" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_policy" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_select_policy" ON chat_messages;

-- Create simple, non-conflicting policies for chat_messages

-- Allow users to insert messages
CREATE POLICY "chat_messages_insert_simple" ON chat_messages
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Allow users to view messages in groups they are members of
CREATE POLICY "chat_messages_select_simple" ON chat_messages
    FOR SELECT 
    USING (
        match_id IN (
            SELECT DISTINCT m.id
            FROM matches m
            JOIN match_members mm ON m.id = mm.match_id
            WHERE mm.user_id = auth.uid()
        )
        OR 
        user_id = auth.uid()
    );

-- Grant necessary permissions
GRANT SELECT, INSERT ON chat_messages TO authenticated;
GRANT SELECT ON profiles TO authenticated;
GRANT SELECT ON matches TO authenticated;
GRANT SELECT ON match_members TO authenticated;

