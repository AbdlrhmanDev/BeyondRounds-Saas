-- =====================================================
-- Essential Performance Optimizations
-- =====================================================
-- This script adds only the most critical performance improvements
-- Safe to run multiple times

-- =====================================================
-- 1) Critical Performance Indexes
-- =====================================================

-- Profiles - Most important for matching
CREATE INDEX IF NOT EXISTS idx_profiles_city_specialty ON public.profiles(city, medical_specialty);
CREATE INDEX IF NOT EXISTS idx_profiles_age_gender ON public.profiles(age, gender);
CREATE INDEX IF NOT EXISTS idx_profiles_verified_active ON public.profiles(is_verified, last_active_at DESC);

-- Matches - Critical for weekly matching
CREATE INDEX IF NOT EXISTS idx_matches_week_size ON public.matches(match_week, group_size);
CREATE INDEX IF NOT EXISTS idx_match_members_profile_active ON public.match_members(profile_id, is_active);

-- Chat - Critical for real-time messaging
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON public.chat_messages(chat_room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_match_created ON public.chat_messages(match_id, created_at DESC);

-- Feedback - Important for analytics
CREATE INDEX IF NOT EXISTS idx_feedback_match_reviewer ON public.feedback(match_id, reviewer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewee_rating ON public.feedback(reviewee_id, overall_rating DESC);

-- =====================================================
-- 2) Essential Security Functions
-- =====================================================

-- Admin check function
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

-- Moderator or admin check function
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
-- 3) Critical Data Integrity Constraints
-- =====================================================

-- Prevent duplicate match members
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

-- Prevent duplicate message reactions
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

-- Prevent duplicate read status
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
-- 4) Quick Status Check
-- =====================================================

-- Show what was added
SELECT 
    'OPTIMIZATION COMPLETE' as status,
    'Critical indexes and functions added' as message,
    now() as completed_at;

-- Show current index count
SELECT 
    'Current Index Count' as metric,
    COUNT(*)::text as value
FROM pg_indexes 
WHERE schemaname = 'public';
