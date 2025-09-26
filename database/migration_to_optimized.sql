-- =====================================================
-- Migration Script: Current Schema to Optimized Schema
-- =====================================================
-- This script adds the missing optimizations to your current schema
-- Run this AFTER your current schema is working

-- =====================================================
-- 1) Add Missing Performance Indexes
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
-- 2) Add Enhanced Security Functions (Safe to run multiple times)
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
-- 3) Add Enhanced RLS Policies (Skip if already exist)
-- =====================================================

-- Enhanced profiles policies (skip if exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'profiles_select_public'
    ) THEN
        CREATE POLICY profiles_select_public
        ON public.profiles
        FOR SELECT
        USING (deleted_at IS NULL);
    END IF;
END $$;

-- Enhanced verification policies (skip if exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'verification_documents' AND policyname = 'verification_documents_select_scope'
    ) THEN
        CREATE POLICY verification_documents_select_scope
        ON public.verification_documents
        FOR SELECT
        USING (
          profile_id = public.current_profile_id()
          OR public.is_moderator_or_admin()
        );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'verification_documents' AND policyname = 'verification_documents_update_scope'
    ) THEN
        CREATE POLICY verification_documents_update_scope
        ON public.verification_documents
        FOR UPDATE
        USING (
          profile_id = public.current_profile_id()
          OR public.is_moderator_or_admin()
        )
        WITH CHECK (true);
    END IF;
END $$;

-- Enhanced audit log policies (skip if exists)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'audit_log' AND policyname = 'audit_log_select_admin'
    ) THEN
        CREATE POLICY audit_log_select_admin
        ON public.audit_log
        FOR SELECT
        USING (public.is_admin());
    END IF;
END $$;

-- =====================================================
-- 4) Add Composite Indexes for Common Queries
-- =====================================================

-- Profile search combinations
CREATE INDEX IF NOT EXISTS idx_profiles_city_specialty ON public.profiles(city, medical_specialty);
CREATE INDEX IF NOT EXISTS idx_profiles_age_gender ON public.profiles(age, gender);

-- Match analysis indexes
CREATE INDEX IF NOT EXISTS idx_matches_week_size ON public.matches(match_week, group_size);
CREATE INDEX IF NOT EXISTS idx_match_members_profile_active ON public.match_members(profile_id, is_active);

-- Chat performance indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON public.chat_messages(chat_room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_match_created ON public.chat_messages(match_id, created_at DESC);

-- Feedback analysis indexes
CREATE INDEX IF NOT EXISTS idx_feedback_match_reviewer ON public.feedback(match_id, reviewer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewee_rating ON public.feedback(reviewee_id, overall_rating DESC);

-- =====================================================
-- 5) Add Missing Constraints (if needed)
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
-- Migration Complete
-- =====================================================
-- Your schema is now optimized with:
-- ✅ Enhanced performance indexes
-- ✅ Additional security functions
-- ✅ Improved RLS policies
-- ✅ Better query optimization
-- ✅ Maintained data integrity
