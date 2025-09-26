-- ==============================================
-- Database Schema Diagnostic Script
-- ==============================================
-- Run this first to see what columns actually exist in your profiles table

-- Check what columns exist in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if gender_preference column exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'gender_preference'
) as gender_preference_exists;

-- Check if is_paid column exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'is_paid'
) as is_paid_exists;
