-- ==============================================
-- BeyondRounds RLS Policies - Comprehensive & Secure
-- ==============================================
-- This script creates comprehensive Row Level Security policies
-- for all tables in the BeyondRounds application

-- First, ensure RLS is enabled on all tables
-- ==============================================

-- Core Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- New Tables from Schema Update
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_improvement_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_positive_aspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_meeting_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- Helper Functions
-- ==============================================

-- Function to get current user's profile ID
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Function to check if current user is admin or moderator
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'moderator') 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- Function to check if user is member of a match
CREATE OR REPLACE FUNCTION public.is_member_of_match(p_match_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.match_members mm
    JOIN public.profiles p ON mm.profile_id = p.id
    WHERE mm.match_id = p_match_id
    AND p.user_id = auth.uid()
    AND mm.is_active = true
  );
END;
$$;

-- Function to check if user can access chat room
CREATE OR REPLACE FUNCTION public.can_access_chat_room(p_chat_room_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.chat_rooms cr
    JOIN public.match_members mm ON cr.match_id = mm.match_id
    JOIN public.profiles p ON mm.profile_id = p.id
    WHERE cr.id = p_chat_room_id
    AND p.user_id = auth.uid()
    AND mm.is_active = true
  );
END;
$$;

-- ==============================================
-- PROFILES TABLE POLICIES
-- ==============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Admins can delete profiles (soft delete)
CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- ==============================================
-- MATCHES TABLE POLICIES
-- ==============================================

-- Users can view matches they are part of
CREATE POLICY "Users can view own matches" ON public.matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.match_members mm
      JOIN public.profiles p ON mm.profile_id = p.id
      WHERE mm.match_id = matches.id
      AND p.user_id = auth.uid()
      AND mm.is_active = true
    )
  );

-- Admins can view all matches
CREATE POLICY "Admins can view all matches" ON public.matches
  FOR SELECT USING (public.is_admin());

-- Admins can create matches
CREATE POLICY "Admins can create matches" ON public.matches
  FOR INSERT WITH CHECK (public.is_admin());

-- Admins can update matches
CREATE POLICY "Admins can update matches" ON public.matches
  FOR UPDATE USING (public.is_admin());

-- ==============================================
-- MATCH_MEMBERS TABLE POLICIES
-- ==============================================

-- Users can view match members for their matches
CREATE POLICY "Users can view own match members" ON public.match_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = match_members.profile_id
      AND p.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.match_members mm2
      JOIN public.profiles p2 ON mm2.profile_id = p2.id
      WHERE mm2.match_id = match_members.match_id
      AND p2.user_id = auth.uid()
      AND mm2.is_active = true
    )
  );

-- Admins can view all match members
CREATE POLICY "Admins can view all match members" ON public.match_members
  FOR SELECT USING (public.is_admin());

-- Admins can create match members
CREATE POLICY "Admins can create match members" ON public.match_members
  FOR INSERT WITH CHECK (public.is_admin());

-- Admins can update match members
CREATE POLICY "Admins can update match members" ON public.match_members
  FOR UPDATE USING (public.is_admin());

-- Users can update their own match member status (leave match)
CREATE POLICY "Users can update own match member status" ON public.match_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = match_members.profile_id
      AND p.user_id = auth.uid()
    )
  );

-- ==============================================
-- CHAT_ROOMS TABLE POLICIES
-- ==============================================

-- Users can view chat rooms for their matches
CREATE POLICY "Users can view own chat rooms" ON public.chat_rooms
  FOR SELECT USING (public.can_access_chat_room(id));

-- Admins can view all chat rooms
CREATE POLICY "Admins can view all chat rooms" ON public.chat_rooms
  FOR SELECT USING (public.is_admin());

-- Admins can create chat rooms
CREATE POLICY "Admins can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (public.is_admin());

-- Admins can update chat rooms
CREATE POLICY "Admins can update chat rooms" ON public.chat_rooms
  FOR UPDATE USING (public.is_admin());

-- ==============================================
-- CHAT_MESSAGES TABLE POLICIES
-- ==============================================

-- Users can view messages in their chat rooms
CREATE POLICY "Users can view own chat messages" ON public.chat_messages
  FOR SELECT USING (public.can_access_chat_room(chat_room_id));

-- Users can send messages in their chat rooms
CREATE POLICY "Users can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    public.can_access_chat_room(chat_room_id)
    AND sender_id = public.current_profile_id()
  );

-- Users can edit their own messages
CREATE POLICY "Users can edit own messages" ON public.chat_messages
  FOR UPDATE USING (
    sender_id = public.current_profile_id()
    AND public.can_access_chat_room(chat_room_id)
  );

-- Users can delete their own messages (soft delete)
CREATE POLICY "Users can delete own messages" ON public.chat_messages
  FOR UPDATE USING (
    sender_id = public.current_profile_id()
    AND public.can_access_chat_room(chat_room_id)
  );

-- Admins can view all messages
CREATE POLICY "Admins can view all messages" ON public.chat_messages
  FOR SELECT USING (public.is_admin());

-- Admins can moderate messages
CREATE POLICY "Admins can moderate messages" ON public.chat_messages
  FOR UPDATE USING (public.is_moderator_or_admin());

-- ==============================================
-- NOTIFICATIONS TABLE POLICIES
-- ==============================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (profile_id = public.current_profile_id());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (profile_id = public.current_profile_id());

-- Admins can create notifications
CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (public.is_admin());

-- ==============================================
-- VERIFICATION_DOCUMENTS TABLE POLICIES
-- ==============================================

-- Users can view their own verification documents
CREATE POLICY "Users can view own verification documents" ON public.verification_documents
  FOR SELECT USING (profile_id = public.current_profile_id());

-- Users can create their own verification documents
CREATE POLICY "Users can create own verification documents" ON public.verification_documents
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

-- Admins can view all verification documents
CREATE POLICY "Admins can view all verification documents" ON public.verification_documents
  FOR SELECT USING (public.is_admin());

-- Admins can update verification documents
CREATE POLICY "Admins can update verification documents" ON public.verification_documents
  FOR UPDATE USING (public.is_admin());

-- ==============================================
-- USER_PREFERENCES TABLE POLICIES
-- ==============================================

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (profile_id = public.current_profile_id());

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (profile_id = public.current_profile_id());

-- Users can create their own preferences
CREATE POLICY "Users can create own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

-- ==============================================
-- FEEDBACK TABLE POLICIES
-- ==============================================

-- Users can view feedback they gave or received
CREATE POLICY "Users can view own feedback" ON public.feedback
  FOR SELECT USING (
    reviewer_id = public.current_profile_id()
    OR reviewee_id = public.current_profile_id()
  );

-- Users can create feedback for their matches
CREATE POLICY "Users can create feedback" ON public.feedback
  FOR INSERT WITH CHECK (
    reviewer_id = public.current_profile_id()
    AND EXISTS (
      SELECT 1 FROM public.match_members mm
      JOIN public.profiles p ON mm.profile_id = p.id
      WHERE mm.match_id = feedback.match_id
      AND p.user_id = auth.uid()
    )
  );

-- Admins can view all feedback
CREATE POLICY "Admins can view all feedback" ON public.feedback
  FOR SELECT USING (public.is_admin());

-- ==============================================
-- FEEDBACK IMPROVEMENT AREAS POLICIES
-- ==============================================

-- Users can view improvement areas for their feedback
CREATE POLICY "Users can view own feedback improvement areas" ON public.feedback_improvement_areas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.feedback f
      WHERE f.id = feedback_improvement_areas.feedback_id
      AND (f.reviewer_id = public.current_profile_id() OR f.reviewee_id = public.current_profile_id())
    )
  );

-- Users can create improvement areas for their feedback
CREATE POLICY "Users can create feedback improvement areas" ON public.feedback_improvement_areas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feedback f
      WHERE f.id = feedback_improvement_areas.feedback_id
      AND f.reviewer_id = public.current_profile_id()
    )
  );

-- ==============================================
-- FEEDBACK POSITIVE ASPECTS POLICIES
-- ==============================================

-- Users can view positive aspects for their feedback
CREATE POLICY "Users can view own feedback positive aspects" ON public.feedback_positive_aspects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.feedback f
      WHERE f.id = feedback_positive_aspects.feedback_id
      AND (f.reviewer_id = public.current_profile_id() OR f.reviewee_id = public.current_profile_id())
    )
  );

-- Users can create positive aspects for their feedback
CREATE POLICY "Users can create feedback positive aspects" ON public.feedback_positive_aspects
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.feedback f
      WHERE f.id = feedback_positive_aspects.feedback_id
      AND f.reviewer_id = public.current_profile_id()
    )
  );

-- ==============================================
-- MATCH_BATCHES TABLE POLICIES
-- ==============================================

-- Admins can view all match batches
CREATE POLICY "Admins can view match batches" ON public.match_batches
  FOR SELECT USING (public.is_admin());

-- Admins can create match batches
CREATE POLICY "Admins can create match batches" ON public.match_batches
  FOR INSERT WITH CHECK (public.is_admin());

-- Admins can update match batches
CREATE POLICY "Admins can update match batches" ON public.match_batches
  FOR UPDATE USING (public.is_admin());

-- ==============================================
-- MATCH_HISTORY TABLE POLICIES
-- ==============================================

-- Users can view their own match history
CREATE POLICY "Users can view own match history" ON public.match_history
  FOR SELECT USING (
    profile1_id = public.current_profile_id()
    OR profile2_id = public.current_profile_id()
  );

-- Admins can view all match history
CREATE POLICY "Admins can view all match history" ON public.match_history
  FOR SELECT USING (public.is_admin());

-- Admins can create match history
CREATE POLICY "Admins can create match history" ON public.match_history
  FOR INSERT WITH CHECK (public.is_admin());

-- ==============================================
-- MESSAGE_REACTIONS TABLE POLICIES
-- ==============================================

-- Users can view reactions in their chat rooms
CREATE POLICY "Users can view message reactions" ON public.message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      WHERE cm.id = message_reactions.message_id
      AND public.can_access_chat_room(cm.chat_room_id)
    )
  );

-- Users can create reactions in their chat rooms
CREATE POLICY "Users can create message reactions" ON public.message_reactions
  FOR INSERT WITH CHECK (
    profile_id = public.current_profile_id()
    AND EXISTS (
      SELECT 1 FROM public.chat_messages cm
      WHERE cm.id = message_reactions.message_id
      AND public.can_access_chat_room(cm.chat_room_id)
    )
  );

-- Users can delete their own reactions
CREATE POLICY "Users can delete own reactions" ON public.message_reactions
  FOR DELETE USING (profile_id = public.current_profile_id());

-- ==============================================
-- MESSAGE_READ_STATUS TABLE POLICIES
-- ==============================================

-- Users can view read status for their messages
CREATE POLICY "Users can view message read status" ON public.message_read_status
  FOR SELECT USING (
    profile_id = public.current_profile_id()
    OR EXISTS (
      SELECT 1 FROM public.chat_messages cm
      WHERE cm.id = message_read_status.message_id
      AND cm.sender_id = public.current_profile_id()
    )
  );

-- Users can create read status for messages they can access
CREATE POLICY "Users can create message read status" ON public.message_read_status
  FOR INSERT WITH CHECK (
    profile_id = public.current_profile_id()
    AND EXISTS (
      SELECT 1 FROM public.chat_messages cm
      WHERE cm.id = message_read_status.message_id
      AND public.can_access_chat_room(cm.chat_room_id)
    )
  );

-- ==============================================
-- PAYMENT_PLANS TABLE POLICIES
-- ==============================================

-- All authenticated users can view active payment plans
CREATE POLICY "Users can view active payment plans" ON public.payment_plans
  FOR SELECT USING (is_active = true);

-- Admins can view all payment plans
CREATE POLICY "Admins can view all payment plans" ON public.payment_plans
  FOR SELECT USING (public.is_admin());

-- Admins can create payment plans
CREATE POLICY "Admins can create payment plans" ON public.payment_plans
  FOR INSERT WITH CHECK (public.is_admin());

-- Admins can update payment plans
CREATE POLICY "Admins can update payment plans" ON public.payment_plans
  FOR UPDATE USING (public.is_admin());

-- ==============================================
-- PAYMENTS TABLE POLICIES
-- ==============================================

-- Users can view their own payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (profile_id = public.current_profile_id());

-- Users can create their own payments
CREATE POLICY "Users can create own payments" ON public.payments
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON public.payments
  FOR SELECT USING (public.is_admin());

-- Admins can update payments
CREATE POLICY "Admins can update payments" ON public.payments
  FOR UPDATE USING (public.is_admin());

-- ==============================================
-- USER_SUBSCRIPTIONS TABLE POLICIES
-- ==============================================

-- Users can view their own subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (profile_id = public.current_profile_id());

-- Users can create their own subscriptions
CREATE POLICY "Users can create own subscriptions" ON public.user_subscriptions
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

-- Users can update their own subscriptions
CREATE POLICY "Users can update own subscriptions" ON public.user_subscriptions
  FOR UPDATE USING (profile_id = public.current_profile_id());

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions" ON public.user_subscriptions
  FOR SELECT USING (public.is_admin());

-- ==============================================
-- PROFILE AVAILABILITY SLOTS POLICIES
-- ==============================================

-- Users can view their own availability slots
CREATE POLICY "Users can view own availability slots" ON public.profile_availability_slots
  FOR SELECT USING (profile_id = public.current_profile_id());

-- Users can create their own availability slots
CREATE POLICY "Users can create own availability slots" ON public.profile_availability_slots
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

-- Users can update their own availability slots
CREATE POLICY "Users can update own availability slots" ON public.profile_availability_slots
  FOR UPDATE USING (profile_id = public.current_profile_id());

-- Users can delete their own availability slots
CREATE POLICY "Users can delete own availability slots" ON public.profile_availability_slots
  FOR DELETE USING (profile_id = public.current_profile_id());

-- ==============================================
-- PROFILE INTERESTS POLICIES
-- ==============================================

-- Users can view their own interests
CREATE POLICY "Users can view own interests" ON public.profile_interests
  FOR SELECT USING (profile_id = public.current_profile_id());

-- Users can create their own interests
CREATE POLICY "Users can create own interests" ON public.profile_interests
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

-- Users can update their own interests
CREATE POLICY "Users can update own interests" ON public.profile_interests
  FOR UPDATE USING (profile_id = public.current_profile_id());

-- Users can delete their own interests
CREATE POLICY "Users can delete own interests" ON public.profile_interests
  FOR DELETE USING (profile_id = public.current_profile_id());

-- ==============================================
-- PROFILE MEETING ACTIVITIES POLICIES
-- ==============================================

-- Users can view their own meeting activities
CREATE POLICY "Users can view own meeting activities" ON public.profile_meeting_activities
  FOR SELECT USING (profile_id = public.current_profile_id());

-- Users can create their own meeting activities
CREATE POLICY "Users can create own meeting activities" ON public.profile_meeting_activities
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

-- Users can update their own meeting activities
CREATE POLICY "Users can update own meeting activities" ON public.profile_meeting_activities
  FOR UPDATE USING (profile_id = public.current_profile_id());

-- Users can delete their own meeting activities
CREATE POLICY "Users can delete own meeting activities" ON public.profile_meeting_activities
  FOR DELETE USING (profile_id = public.current_profile_id());

-- ==============================================
-- PROFILE PREFERENCES POLICIES
-- ==============================================

-- Users can view their own preferences
CREATE POLICY "Users can view own profile preferences" ON public.profile_preferences
  FOR SELECT USING (profile_id = public.current_profile_id());

-- Users can create their own preferences
CREATE POLICY "Users can create own profile preferences" ON public.profile_preferences
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

-- Users can update their own preferences
CREATE POLICY "Users can update own profile preferences" ON public.profile_preferences
  FOR UPDATE USING (profile_id = public.current_profile_id());

-- ==============================================
-- PROFILE SPECIALTIES POLICIES
-- ==============================================

-- Users can view their own specialties
CREATE POLICY "Users can view own specialties" ON public.profile_specialties
  FOR SELECT USING (profile_id = public.current_profile_id());

-- Users can create their own specialties
CREATE POLICY "Users can create own specialties" ON public.profile_specialties
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

-- Users can update their own specialties
CREATE POLICY "Users can update own specialties" ON public.profile_specialties
  FOR UPDATE USING (profile_id = public.current_profile_id());

-- Users can delete their own specialties
CREATE POLICY "Users can delete own specialties" ON public.profile_specialties
  FOR DELETE USING (profile_id = public.current_profile_id());

-- ==============================================
-- AUDIT_LOG TABLE POLICIES
-- ==============================================

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_log
  FOR SELECT USING (public.is_admin());

-- Only admins can create audit logs
CREATE POLICY "Admins can create audit logs" ON public.audit_log
  FOR INSERT WITH CHECK (public.is_admin());

-- ==============================================
-- Success Message
-- ==============================================

SELECT 'RLS policies created successfully!' as status;







