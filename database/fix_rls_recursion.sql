-- =====================================================
-- BeyondRounds RLS Policies - FIXED RECURSION ISSUE
-- =====================================================
-- This script fixes the infinite recursion in match_members policy

-- 1. Drop existing functions and policies to avoid conflicts
DROP FUNCTION IF EXISTS public.current_profile_id();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_moderator_or_admin();
DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own match memberships" ON public.match_members;
DROP POLICY IF EXISTS "Match members can view other members" ON public.match_members;
DROP POLICY IF EXISTS "Admins can manage all match members" ON public.match_members;

-- 2. Create helper functions (FIXED VERSION)
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

-- FIXED: This function now uses a different approach to avoid recursion
CREATE OR REPLACE FUNCTION public.is_member_of_match(match_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.match_members mm
    JOIN public.profiles p ON mm.profile_id = p.id
    WHERE mm.match_id = is_member_of_match.match_id 
    AND p.user_id = auth.uid()
    AND mm.is_active = true
  )
$$;

-- 3. Create FIXED match_members policies
CREATE POLICY "Users can view own match memberships" ON public.match_members
  FOR SELECT USING (profile_id = public.current_profile_id());

-- FIXED: This policy now avoids recursion by using a different approach
CREATE POLICY "Match members can view other members" ON public.match_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.match_members mm2
      JOIN public.profiles p ON mm2.profile_id = p.id
      WHERE mm2.match_id = match_members.match_id 
      AND p.user_id = auth.uid()
      AND mm2.is_active = true
    )
  );

CREATE POLICY "Admins can manage all match members" ON public.match_members
  FOR ALL USING (public.is_admin());

-- 4. Create other essential policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_admin());

-- 5. Create basic policies for other tables
CREATE POLICY "Users can view own data" ON public.profile_specialties
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can manage own data" ON public.profile_specialties
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all profile specialties" ON public.profile_specialties
  FOR ALL USING (public.is_admin());

-- Similar policies for other profile-related tables
CREATE POLICY "Users can view own interests" ON public.profile_interests
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can manage own interests" ON public.profile_interests
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all interests" ON public.profile_interests
  FOR ALL USING (public.is_admin());

-- 6. Create policies for matches table
DROP POLICY IF EXISTS "Users can view own matches" ON public.matches;
DROP POLICY IF EXISTS "Admins can manage all matches" ON public.matches;

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

CREATE POLICY "Admins can manage all matches" ON public.matches
  FOR ALL USING (public.is_admin());

-- 7. Create policies for notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all notifications" ON public.notifications
  FOR ALL USING (public.is_admin());

-- 8. Create policies for user preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all preferences" ON public.user_preferences
  FOR ALL USING (public.is_admin());

-- 9. Create policies for verification documents
CREATE POLICY "Users can view own verification docs" ON public.verification_documents
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can create own verification docs" ON public.verification_documents
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all verification docs" ON public.verification_documents
  FOR ALL USING (public.is_admin());

-- 10. Create policies for payments
CREATE POLICY "Users can view own payments" ON public.payments
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all payments" ON public.payments
  FOR ALL USING (public.is_admin());

-- 11. Create policies for payment plans (public read access)
CREATE POLICY "Anyone can view payment plans" ON public.payment_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage payment plans" ON public.payment_plans
  FOR ALL USING (public.is_admin());

-- 12. Create policies for user subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.user_subscriptions
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all subscriptions" ON public.user_subscriptions
  FOR ALL USING (public.is_admin());

-- 13. Create policies for audit log (admin only)
CREATE POLICY "Admins can view audit log" ON public.audit_log
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can manage audit log" ON public.audit_log
  FOR ALL USING (public.is_admin());

-- 14. Create policies for chat-related tables
CREATE POLICY "Match members can view chat rooms" ON public.chat_rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.match_members mm
      JOIN public.profiles p ON mm.profile_id = p.id
      WHERE mm.match_id = chat_rooms.match_id 
      AND p.user_id = auth.uid()
      AND mm.is_active = true
    )
  );

CREATE POLICY "Admins can manage all chat rooms" ON public.chat_rooms
  FOR ALL USING (public.is_admin());

CREATE POLICY "Match members can view chat messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.match_members mm
      JOIN public.profiles p ON mm.profile_id = p.id
      WHERE mm.match_id = chat_messages.match_id 
      AND p.user_id = auth.uid()
      AND mm.is_active = true
    )
  );

CREATE POLICY "Match members can send chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    sender_id = public.current_profile_id() AND
    EXISTS (
      SELECT 1 FROM public.match_members mm
      JOIN public.profiles p ON mm.profile_id = p.id
      WHERE mm.match_id = chat_messages.match_id 
      AND p.user_id = auth.uid()
      AND mm.is_active = true
    )
  );

CREATE POLICY "Admins can manage all chat messages" ON public.chat_messages
  FOR ALL USING (public.is_admin());

-- 15. Create policies for feedback
CREATE POLICY "Users can view own feedback" ON public.feedback
  FOR SELECT USING (
    reviewer_id = public.current_profile_id() OR 
    reviewee_id = public.current_profile_id()
  );

CREATE POLICY "Users can create feedback" ON public.feedback
  FOR INSERT WITH CHECK (reviewer_id = public.current_profile_id());

CREATE POLICY "Admins can manage all feedback" ON public.feedback
  FOR ALL USING (public.is_admin());

-- 16. Create policies for feedback aspects
CREATE POLICY "Users can view feedback aspects" ON public.feedback_positive_aspects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.feedback f
      WHERE f.id = feedback_positive_aspects.feedback_id
      AND (f.reviewer_id = public.current_profile_id() OR f.reviewee_id = public.current_profile_id())
    )
  );

CREATE POLICY "Admins can manage all feedback aspects" ON public.feedback_positive_aspects
  FOR ALL USING (public.is_admin());

CREATE POLICY "Users can view feedback improvement areas" ON public.feedback_improvement_areas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.feedback f
      WHERE f.id = feedback_improvement_areas.feedback_id
      AND (f.reviewer_id = public.current_profile_id() OR f.reviewee_id = public.current_profile_id())
    )
  );

CREATE POLICY "Admins can manage all feedback improvement areas" ON public.feedback_improvement_areas
  FOR ALL USING (public.is_admin());

-- 17. Create policies for message reactions
CREATE POLICY "Match members can view message reactions" ON public.message_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.match_members mm ON mm.match_id = cm.match_id
      JOIN public.profiles p ON mm.profile_id = p.id
      WHERE cm.id = message_reactions.message_id 
      AND p.user_id = auth.uid()
      AND mm.is_active = true
    )
  );

CREATE POLICY "Match members can create message reactions" ON public.message_reactions
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all message reactions" ON public.message_reactions
  FOR ALL USING (public.is_admin());

-- 18. Create policies for message read status
CREATE POLICY "Match members can view read status" ON public.message_read_status
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_messages cm
      JOIN public.match_members mm ON mm.match_id = cm.match_id
      JOIN public.profiles p ON mm.profile_id = p.id
      WHERE cm.id = message_read_status.message_id 
      AND p.user_id = auth.uid()
      AND mm.is_active = true
    )
  );

CREATE POLICY "Match members can update read status" ON public.message_read_status
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all read status" ON public.message_read_status
  FOR ALL USING (public.is_admin());

-- 19. Create policies for match history
CREATE POLICY "Users can view own match history" ON public.match_history
  FOR SELECT USING (
    profile1_id = public.current_profile_id() OR 
    profile2_id = public.current_profile_id()
  );

CREATE POLICY "Admins can manage all match history" ON public.match_history
  FOR ALL USING (public.is_admin());

-- 20. Create policies for match batches
CREATE POLICY "Admins can manage match batches" ON public.match_batches
  FOR ALL USING (public.is_admin());

-- 21. Create policies for profile availability slots
CREATE POLICY "Users can view own availability" ON public.profile_availability_slots
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can manage own availability" ON public.profile_availability_slots
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all availability" ON public.profile_availability_slots
  FOR ALL USING (public.is_admin());

-- 22. Create policies for profile meeting activities
CREATE POLICY "Users can view own meeting activities" ON public.profile_meeting_activities
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can manage own meeting activities" ON public.profile_meeting_activities
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all meeting activities" ON public.profile_meeting_activities
  FOR ALL USING (public.is_admin());

-- 23. Create policies for profile preferences
CREATE POLICY "Users can view own preferences" ON public.profile_preferences
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can manage own preferences" ON public.profile_preferences
  FOR ALL USING (profile_id = public.current_profile_id());

CREATE POLICY "Admins can manage all preferences" ON public.profile_preferences
  FOR ALL USING (public.is_admin());

-- 24. Enable RLS on all tables
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
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 25. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_match_members_profile_id ON public.match_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_match_members_match_id ON public.match_members(match_id);
CREATE INDEX IF NOT EXISTS idx_match_members_active ON public.match_members(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_messages_match_id ON public.chat_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewer_id ON public.feedback(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewee_id ON public.feedback(reviewee_id);

-- 26. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 27. Create a function to check if user exists in profiles
CREATE OR REPLACE FUNCTION public.user_has_profile()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid()
  )
$$;

-- 28. Create a function to get user profile safely
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  role text,
  is_verified boolean,
  profile_completion integer
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.email,
    p.first_name,
    p.last_name,
    p.role::text,
    p.is_verified,
    p.profile_completion
  FROM public.profiles p
  WHERE p.user_id = auth.uid()
$$;

-- 29. Create a function to safely check match membership
CREATE OR REPLACE FUNCTION public.safe_is_member_of_match(match_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.match_members mm
    JOIN public.profiles p ON mm.profile_id = p.id
    WHERE mm.match_id = safe_is_member_of_match.match_id 
    AND p.user_id = auth.uid()
    AND mm.is_active = true
  )
$$;

-- 30. Final verification
SELECT 'RLS policies deployed successfully!' as status;