-- =====================================================
-- BeyondRounds RLS Policies - COMPLETE SETUP
-- =====================================================
-- This script creates all necessary Row Level Security policies
-- Run this in your Supabase SQL Editor

-- =====================================================
-- 1) HELPER FUNCTIONS
-- =====================================================

-- Function to get current user's profile ID
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
$$;

-- Function to check if current user is moderator or admin
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('moderator', 'admin')
  )
$$;

-- Function to check if current user is member of a match
CREATE OR REPLACE FUNCTION public.is_member_of_match(match_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.match_members 
    WHERE match_id = is_member_of_match.match_id 
    AND profile_id = public.current_profile_id()
    AND is_active = true
  )
$$;

-- =====================================================
-- 2) ENABLE RLS ON ALL TABLES
-- =====================================================

-- Core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_meeting_activities ENABLE ROW LEVEL SECURITY;

-- Matching system
ALTER TABLE public.match_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;

-- Chat system
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;

-- Feedback system
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_positive_aspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_improvement_areas ENABLE ROW LEVEL SECURITY;

-- Payment system
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Notification system
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Verification system
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- User preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3) PROFILES TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- =====================================================
-- 4) PROFILE SATELLITE TABLES POLICIES
-- =====================================================

-- Profile specialties
CREATE POLICY "Users can manage own specialties" ON public.profile_specialties
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all specialties" ON public.profile_specialties
  FOR ALL USING (public.is_admin());

-- Profile interests
CREATE POLICY "Users can manage own interests" ON public.profile_interests
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all interests" ON public.profile_interests
  FOR ALL USING (public.is_admin());

-- Profile preferences
CREATE POLICY "Users can manage own preferences" ON public.profile_preferences
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all preferences" ON public.profile_preferences
  FOR ALL USING (public.is_admin());

-- Profile availability slots
CREATE POLICY "Users can manage own availability" ON public.profile_availability_slots
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all availability" ON public.profile_availability_slots
  FOR ALL USING (public.is_admin());

-- Profile meeting activities
CREATE POLICY "Users can manage own activities" ON public.profile_meeting_activities
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all activities" ON public.profile_meeting_activities
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 5) MATCHING SYSTEM POLICIES
-- =====================================================

-- Match batches (admin only)
CREATE POLICY "Admins can manage match batches" ON public.match_batches
  FOR ALL USING (public.is_admin());

-- Matches (members can view, admins can manage)
CREATE POLICY "Match members can view matches" ON public.matches
  FOR SELECT USING (public.is_member_of_match(id));

CREATE POLICY "Admins can manage all matches" ON public.matches
  FOR ALL USING (public.is_admin());

-- Match members
CREATE POLICY "Users can view own match memberships" ON public.match_members
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Match members can view other members" ON public.match_members
  FOR SELECT USING (public.is_member_of_match(match_id));

CREATE POLICY "Admins can manage all match members" ON public.match_members
  FOR ALL USING (public.is_admin());

-- Match history (read-only for members, full access for admins)
CREATE POLICY "Users can view own match history" ON public.match_history
  FOR SELECT USING (
    profile1_id = public.current_profile_id() OR 
    profile2_id = public.current_profile_id()
  );

CREATE POLICY "Admins can manage all match history" ON public.match_history
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 6) CHAT SYSTEM POLICIES
-- =====================================================

-- Chat rooms (members can view, admins can manage)
CREATE POLICY "Match members can view chat rooms" ON public.chat_rooms
  FOR SELECT USING (public.is_member_of_match(match_id));

CREATE POLICY "Admins can manage all chat rooms" ON public.chat_rooms
  FOR ALL USING (public.is_admin());

-- Chat messages (members can view and insert, admins can manage)
CREATE POLICY "Match members can view messages" ON public.chat_messages
  FOR SELECT USING (public.is_member_of_match(match_id));

CREATE POLICY "Match members can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender_id = public.current_profile_id() AND 
    public.is_member_of_match(match_id)
  );

CREATE POLICY "Message senders can edit own messages" ON public.chat_messages
  FOR UPDATE USING (sender_id = public.current_profile_id());

CREATE POLICY "Admins can manage all messages" ON public.chat_messages
  FOR ALL USING (public.is_admin());

-- Message reactions (members can manage, admins can manage all)
CREATE POLICY "Match members can manage reactions" ON public.message_reactions
  FOR ALL USING (
    public.is_member_of_match(
      (SELECT match_id FROM public.chat_messages WHERE id = message_reactions.message_id)
    )
  );

CREATE POLICY "Admins can manage all reactions" ON public.message_reactions
  FOR ALL USING (public.is_admin());

-- Message read status (members can manage, admins can view all)
CREATE POLICY "Users can manage own read status" ON public.message_read_status
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can view all read status" ON public.message_read_status
  FOR SELECT USING (public.is_admin());

-- =====================================================
-- 7) FEEDBACK SYSTEM POLICIES
-- =====================================================

-- Feedback (users can create and view own, admins can manage all)
CREATE POLICY "Users can create feedback" ON public.feedback
  FOR INSERT WITH CHECK (reviewer_id = public.current_profile_id());

CREATE POLICY "Users can view own feedback" ON public.feedback
  FOR SELECT USING (
    reviewer_id = public.current_profile_id() OR 
    reviewee_id = public.current_profile_id()
  );

CREATE POLICY "Admins can manage all feedback" ON public.feedback
  FOR ALL USING (public.is_admin());

-- Feedback aspects (same as feedback)
CREATE POLICY "Users can manage own feedback aspects" ON public.feedback_positive_aspects
  FOR ALL USING (
    feedback_id IN (
      SELECT id FROM public.feedback 
      WHERE reviewer_id = public.current_profile_id()
    )
  );

CREATE POLICY "Admins can manage all feedback aspects" ON public.feedback_positive_aspects
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can manage own feedback areas" ON public.feedback_improvement_areas
  FOR ALL USING (
    feedback_id IN (
      SELECT id FROM public.feedback 
      WHERE reviewer_id = public.current_profile_id()
    )
  );

CREATE POLICY "Admins can manage all feedback areas" ON public.feedback_improvement_areas
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 8) PAYMENT SYSTEM POLICIES
-- =====================================================

-- Payment plans (read-only for users, full access for admins)
CREATE POLICY "Users can view active payment plans" ON public.payment_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all payment plans" ON public.payment_plans
  FOR ALL USING (public.is_admin());

-- Payments (users can view own, admins can manage all)
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can create own payments" ON public.payments
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (public.is_admin());

-- User subscriptions (users can view own, admins can manage all)
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 9) NOTIFICATION SYSTEM POLICIES
-- =====================================================

-- Notifications (users can view and update own, admins can manage all)
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 10) VERIFICATION SYSTEM POLICIES
-- =====================================================

-- Verification documents (users can view own, admins can manage all)
CREATE POLICY "Users can view own verification docs" ON public.verification_documents
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can create own verification docs" ON public.verification_documents
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all verification docs" ON public.verification_documents
  FOR ALL USING (public.is_admin());

-- =====================================================
-- 11) USER PREFERENCES POLICIES
-- =====================================================

-- User preferences (users can manage own, admins can view all)
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can view all user preferences" ON public.user_preferences
  FOR SELECT USING (public.is_admin());

-- =====================================================
-- 12) AUDIT LOG POLICIES
-- =====================================================

-- Audit log (read-only for admins)
CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT USING (public.is_admin());

-- =====================================================
-- 13) GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- =====================================================
-- 14) VERIFICATION QUERIES
-- =====================================================

-- Check that policies were created
SELECT 
    'POLICY CREATION SUMMARY' as report_section,
    'Total Policies Created: ' || COUNT(*) as info
FROM pg_policies 
WHERE schemaname = 'public';

-- List all policies by table
SELECT 
    tablename,
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
