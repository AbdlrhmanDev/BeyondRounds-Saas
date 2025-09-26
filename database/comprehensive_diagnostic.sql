-- ==============================================
-- Comprehensive Database Diagnostic Script
-- ==============================================
-- Run this first to see what tables and columns actually exist

-- 1. Check what tables exist in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check what columns exist in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Check if user_preferences table exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'user_preferences'
) as user_preferences_table_exists;

-- 4. If user_preferences exists, check its columns
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'user_preferences'
ORDER BY ordinal_position;

-- 5. Check if specific columns exist in profiles
SELECT 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'gender_preference') THEN 'EXISTS' ELSE 'MISSING' END as gender_preference,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_paid') THEN 'EXISTS' ELSE 'MISSING' END as is_paid,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_name') THEN 'EXISTS' ELSE 'MISSING' END as last_name;
