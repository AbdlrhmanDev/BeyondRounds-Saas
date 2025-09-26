-- =====================================================
-- Safe Migration Script - No Errors Version
-- =====================================================
-- This script safely adds optimizations without causing errors
-- Safe to run multiple times

-- =====================================================
-- 1) Add Missing Performance Indexes (Safe)
-- =====================================================

-- Profiles performance indexes
CREATE INDEX IF NOT EXISTS idx_profiles_city_specialty ON public.profiles(city, medical_specialty);
CREATE INDEX IF NOT EXISTS idx_profiles_age_gender ON public.profiles(age, gender);
CREATE INDEX IF NOT EXISTS idx_profiles_verified_active ON public.profiles(is_verified, last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles (last_active_at DESC);

-- Match-related performance indexes
CREATE INDEX IF NOT EXISTS idx_matches_week_size ON public.matches(match_week, group_size);
CREATE INDEX IF NOT EXISTS idx_match_members_profile_active ON public.match_members(profile_id, is_active);
CREATE INDEX IF NOT EXISTS idx_match_members_compatibility ON public.match_members(compatibility_score DESC);

-- Chat performance indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON public.chat_messages(chat_room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_match_created ON public.chat_messages(match_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_flagged ON public.chat_messages(is_flagged);

-- Feedback performance indexes
CREATE INDEX IF NOT EXISTS idx_feedback_match_reviewer ON public.feedback(match_id, reviewer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewee_rating ON public.feedback(reviewee_id, overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_safety ON public.feedback(safety_concern);

-- Notification performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_profile_read_scheduled ON public.notifications(profile_id, is_read, scheduled_for);

-- =====================================================
-- 2) Add Enhanced Security Functions (Safe)
-- =====================================================

-- Check if current user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND deleted_at IS NULL
  );
$$;

-- Check if current user has moderator or admin role
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND role IN ('moderator', 'admin') 
      AND deleted_at IS NULL
  );
$$;

-- =====================================================
-- 3) Add Missing Constraints (Safe)
-- =====================================================

-- Add unique constraint for match_members if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'match_members_match_id_profile_id_key'
    ) THEN
        ALTER TABLE public.match_members 
        ADD CONSTRAINT match_members_match_id_profile_id_key UNIQUE (match_id, profile_id);
    END IF;
END $$;

-- Add unique constraint for message_reactions if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'message_reactions_message_id_profile_id_emoji_key'
    ) THEN
        ALTER TABLE public.message_reactions 
        ADD CONSTRAINT message_reactions_message_id_profile_id_emoji_key UNIQUE (message_id, profile_id, emoji);
    END IF;
END $$;

-- Add unique constraint for message_read_status if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'message_read_status_message_id_profile_id_key'
    ) THEN
        ALTER TABLE public.message_read_status 
        ADD CONSTRAINT message_read_status_message_id_profile_id_key UNIQUE (message_id, profile_id);
    END IF;
END $$;

-- =====================================================
-- 4) Check Current Status
-- =====================================================

-- Display current indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
    AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- Display current functions
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('is_admin', 'is_moderator_or_admin', 'current_profile_id', 'is_member_of_match');

-- Display current policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- Migration Complete - Safe Version
-- =====================================================
-- ✅ Added performance indexes
-- ✅ Added security functions  
-- ✅ Added missing constraints
-- ✅ No errors - safe to run multiple times


