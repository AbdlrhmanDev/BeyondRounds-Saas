-- ========================================
-- FIX MATCHING_LOGS TABLE STRUCTURE
-- ========================================
-- This script fixes the column mismatch in matching_logs table

-- First, let's see what columns exist in the current matching_logs table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'matching_logs' 
ORDER BY ordinal_position;

-- Drop the existing matching_logs table and recreate with correct structure
DROP TABLE IF EXISTS matching_logs CASCADE;

-- Create matching_logs table with the correct structure
CREATE TABLE matching_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_date DATE NOT NULL,
    total_eligible_users INT NOT NULL,
    groups_created INT NOT NULL,
    users_matched INT NOT NULL,
    users_unmatched INT NOT NULL,
    execution_time_ms INT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'matching_logs' 
ORDER BY ordinal_position;

-- Test the log_matching_result function
SELECT log_matching_result(5, 1, 3, 2, 100, '{"test": true}'::jsonb);

-- Verify the test record was inserted
SELECT * FROM matching_logs ORDER BY created_at DESC LIMIT 1;

-- Now test the full matching system
SELECT trigger_manual_matching();

-- Success message
SELECT 
    '✅ matching_logs table fixed!' as status,
    'You can now run trigger_manual_matching() successfully' as message;

