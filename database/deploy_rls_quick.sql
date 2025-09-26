-- =====================================================
-- BeyondRounds RLS Policies - QUICK DEPLOY
-- =====================================================
-- Copy and paste this entire script into your Supabase SQL Editor
-- This will create all necessary RLS policies

-- 1. Helper Functions
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

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

-- Drop existing function if it exists with different parameter name
DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);

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

-- 2. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_meeting_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_positive_aspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_improvement_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 3. Profiles table policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE USING (public.is_admin());

-- 4. Profile satellite tables policies
CREATE POLICY "Users can manage own specialties" ON public.profile_specialties
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all specialties" ON public.profile_specialties
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can manage own interests" ON public.profile_interests
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all interests" ON public.profile_interests
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can manage own preferences" ON public.profile_preferences
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all preferences" ON public.profile_preferences
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can manage own availability" ON public.profile_availability_slots
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all availability" ON public.profile_availability_slots
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can manage own activities" ON public.profile_meeting_activities
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all activities" ON public.profile_meeting_activities
  FOR ALL USING (public.is_admin());

-- 5. Matching system policies
CREATE POLICY "Admins can manage match batches" ON public.match_batches
  FOR ALL USING (public.is_admin());

CREATE POLICY "Match members can view matches" ON public.matches
  FOR SELECT USING (public.is_member_of_match(id));

CREATE POLICY "Admins can manage all matches" ON public.matches
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own match memberships" ON public.match_members
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Match members can view other members" ON public.match_members
  FOR SELECT USING (public.is_member_of_match(match_id));

CREATE POLICY "Admins can manage all match members" ON public.match_members
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own match history" ON public.match_history
  FOR SELECT USING (
    profile1_id = public.current_profile_id() OR 
    profile2_id = public.current_profile_id()
  );

CREATE POLICY "Admins can manage all match history" ON public.match_history
  FOR ALL USING (public.is_admin());

-- 6. Chat system policies
CREATE POLICY "Match members can view chat rooms" ON public.chat_rooms
  FOR SELECT USING (public.is_member_of_match(match_id));

CREATE POLICY "Admins can manage all chat rooms" ON public.chat_rooms
  FOR ALL USING (public.is_admin());

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

CREATE POLICY "Match members can manage reactions" ON public.message_reactions
  FOR ALL USING (
    public.is_member_of_match(
      (SELECT match_id FROM public.chat_messages WHERE id = message_reactions.message_id)
    )
  );

CREATE POLICY "Admins can manage all reactions" ON public.message_reactions
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can manage own read status" ON public.message_read_status
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can view all read status" ON public.message_read_status
  FOR SELECT USING (public.is_admin());

-- 7. Feedback system policies
CREATE POLICY "Users can create feedback" ON public.feedback
  FOR INSERT WITH CHECK (reviewer_id = public.current_profile_id());

CREATE POLICY "Users can view own feedback" ON public.feedback
  FOR SELECT USING (
    reviewer_id = public.current_profile_id() OR 
    reviewee_id = public.current_profile_id()
  );

CREATE POLICY "Admins can manage all feedback" ON public.feedback
  FOR ALL USING (public.is_admin());

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

-- 8. Payment system policies
CREATE POLICY "Users can view active payment plans" ON public.payment_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all payment plans" ON public.payment_plans
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can create own payments" ON public.payments
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
  FOR ALL USING (public.is_admin());

-- 9. Notification system policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (public.is_admin());

-- 10. Verification system policies
CREATE POLICY "Users can view own verification docs" ON public.verification_documents
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can create own verification docs" ON public.verification_documents
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all verification docs" ON public.verification_documents
  FOR ALL USING (public.is_admin());

-- 11. User preferences policies
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can view all user preferences" ON public.user_preferences
  FOR SELECT USING (public.is_admin());

-- 12. Audit log policies
CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT USING (public.is_admin());

-- 13. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- 14. Verification query
SELECT 
    'POLICY CREATION SUMMARY' as report_section,
    'Total Policies Created: ' || COUNT(*) as info
FROM pg_policies 
WHERE schemaname = 'public';
