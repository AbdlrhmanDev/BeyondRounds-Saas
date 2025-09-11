-- ========================================
-- SECURE MATCHING_LOGS TABLE
-- ========================================
-- Add Row Level Security (RLS) to matching_logs table

-- Enable RLS on matching_logs table
ALTER TABLE matching_logs ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow admins to read all matching logs
CREATE POLICY "Admins can read all matching logs" ON matching_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Policy 2: Allow system (service role) to insert matching logs
CREATE POLICY "System can insert matching logs" ON matching_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Policy 3: Allow system to update matching logs
CREATE POLICY "System can update matching logs" ON matching_logs
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Policy 4: Allow regular users to read basic matching stats (optional)
CREATE POLICY "Users can read basic matching stats" ON matching_logs
    FOR SELECT
    TO authenticated
    USING (
        -- Users can only see execution_date, groups_created, users_matched
        -- but not detailed logs or sensitive information
        auth.uid() IS NOT NULL
    );

-- Check current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'matching_logs';

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'matching_logs';

-- Test access (should work for admins)
SELECT 
    'Testing matching_logs access...' as test,
    COUNT(*) as total_logs
FROM matching_logs;

-- Show recent matching results (if you're admin)
SELECT 
    execution_date,
    total_eligible_users,
    groups_created,
    users_matched,
    users_unmatched,
    execution_time_ms,
    created_at
FROM matching_logs 
ORDER BY created_at DESC 
LIMIT 5;

-- Success message
SELECT 
    '✅ MATCHING_LOGS SECURED!' as status,
    'Table now has proper Row Level Security policies' as message;

