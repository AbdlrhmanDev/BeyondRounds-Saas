-- ==============================================
-- BeyondRounds RLS Policies - Manual Deployment
-- ==============================================
-- This script can be run directly in Supabase SQL Editor
-- It creates comprehensive RLS policies for all tables

-- Step 1: Enable RLS on all tables
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

-- New Tables
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

-- Step 2: Create Helper Functions
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

-- Step 3: Create Essential Policies
-- ==============================================

-- PROFILES POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- MATCHES POLICIES
DROP POLICY IF EXISTS "Users can view own matches" ON public.matches;
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

DROP POLICY IF EXISTS "Admins can view all matches" ON public.matches;
CREATE POLICY "Admins can view all matches" ON public.matches
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can create matches" ON public.matches;
CREATE POLICY "Admins can create matches" ON public.matches
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update matches" ON public.matches;
CREATE POLICY "Admins can update matches" ON public.matches
  FOR UPDATE USING (public.is_admin());

-- MATCH_MEMBERS POLICIES
DROP POLICY IF EXISTS "Users can view own match members" ON public.match_members;
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

DROP POLICY IF EXISTS "Admins can view all match members" ON public.match_members;
CREATE POLICY "Admins can view all match members" ON public.match_members
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can create match members" ON public.match_members;
CREATE POLICY "Admins can create match members" ON public.match_members
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update match members" ON public.match_members;
CREATE POLICY "Admins can update match members" ON public.match_members
  FOR UPDATE USING (public.is_admin());

-- CHAT_ROOMS POLICIES
DROP POLICY IF EXISTS "Users can view own chat rooms" ON public.chat_rooms;
CREATE POLICY "Users can view own chat rooms" ON public.chat_rooms
  FOR SELECT USING (public.can_access_chat_room(id));

DROP POLICY IF EXISTS "Admins can view all chat rooms" ON public.chat_rooms;
CREATE POLICY "Admins can view all chat rooms" ON public.chat_rooms
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can create chat rooms" ON public.chat_rooms;
CREATE POLICY "Admins can create chat rooms" ON public.chat_rooms
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update chat rooms" ON public.chat_rooms;
CREATE POLICY "Admins can update chat rooms" ON public.chat_rooms
  FOR UPDATE USING (public.is_admin());

-- CHAT_MESSAGES POLICIES
DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view own chat messages" ON public.chat_messages
  FOR SELECT USING (public.can_access_chat_room(chat_room_id));

DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;
CREATE POLICY "Users can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    public.can_access_chat_room(chat_room_id)
    AND sender_id = public.current_profile_id()
  );

DROP POLICY IF EXISTS "Users can edit own messages" ON public.chat_messages;
CREATE POLICY "Users can edit own messages" ON public.chat_messages
  FOR UPDATE USING (
    sender_id = public.current_profile_id()
    AND public.can_access_chat_room(chat_room_id)
  );

DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;
CREATE POLICY "Users can delete own messages" ON public.chat_messages
  FOR UPDATE USING (
    sender_id = public.current_profile_id()
    AND public.can_access_chat_room(chat_room_id)
  );

DROP POLICY IF EXISTS "Admins can view all messages" ON public.chat_messages;
CREATE POLICY "Admins can view all messages" ON public.chat_messages
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can moderate messages" ON public.chat_messages;
CREATE POLICY "Admins can moderate messages" ON public.chat_messages
  FOR UPDATE USING (public.is_moderator_or_admin());

-- NOTIFICATIONS POLICIES
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (profile_id = public.current_profile_id());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (profile_id = public.current_profile_id());

DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (public.is_admin());

-- VERIFICATION_DOCUMENTS POLICIES
DROP POLICY IF EXISTS "Users can view own verification documents" ON public.verification_documents;
CREATE POLICY "Users can view own verification documents" ON public.verification_documents
  FOR SELECT USING (profile_id = public.current_profile_id());

DROP POLICY IF EXISTS "Users can create own verification documents" ON public.verification_documents;
CREATE POLICY "Users can create own verification documents" ON public.verification_documents
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

DROP POLICY IF EXISTS "Admins can view all verification documents" ON public.verification_documents;
CREATE POLICY "Admins can view all verification documents" ON public.verification_documents
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update verification documents" ON public.verification_documents;
CREATE POLICY "Admins can update verification documents" ON public.verification_documents
  FOR UPDATE USING (public.is_admin());

-- USER_PREFERENCES POLICIES
DROP POLICY IF EXISTS "Users can view own preferences" ON public.user_preferences;
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (profile_id = public.current_profile_id());

DROP POLICY IF EXISTS "Users can update own preferences" ON public.user_preferences;
CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (profile_id = public.current_profile_id());

DROP POLICY IF EXISTS "Users can create own preferences" ON public.user_preferences;
CREATE POLICY "Users can create own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

-- Success Message
SELECT 'Essential RLS policies created successfully!' as status;
