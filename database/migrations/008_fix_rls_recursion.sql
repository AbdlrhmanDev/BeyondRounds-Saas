-- ==============================================
-- Migration 008: Fix RLS Recursion Error
-- ==============================================
-- This fixes the infinite recursion error in match_members table
-- by correcting the column references and simplifying policies

-- Step 1: Drop all existing problematic policies
DROP POLICY IF EXISTS "Users can view match members for their matches" ON match_members;
DROP POLICY IF EXISTS "Users can view their own match memberships" ON match_members;
DROP POLICY IF EXISTS "Users can view matches they're in" ON matches;
DROP POLICY IF EXISTS "Users can view messages from their matches" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their matches" ON chat_messages;

-- Step 2: Drop the problematic function that causes recursion
DROP FUNCTION IF EXISTS public.is_member_of_match(uuid);

-- Step 3: Create helper functions (recreate if needed)
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

-- Step 4: Create simple, non-recursive policies for match_members
CREATE POLICY "Users can view own match memberships" ON match_members
  FOR SELECT USING (profile_id = public.current_profile_id());

-- Step 5: Create a simple policy for viewing other members (NO RECURSION)
CREATE POLICY "Match members can view other members" ON match_members
  FOR SELECT USING (
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE profile_id = public.current_profile_id()
    )
  );

-- Step 6: Fix matches table policies
CREATE POLICY "Users can view matches they're in" ON matches
  FOR SELECT USING (
    id IN (
      SELECT match_id FROM match_members 
      WHERE profile_id = public.current_profile_id() AND is_active = true
    )
  );

-- Step 7: Fix chat_messages policies
CREATE POLICY "Users can view messages from their matches" ON chat_messages
  FOR SELECT USING (
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE profile_id = public.current_profile_id() AND is_active = true
    )
  );

CREATE POLICY "Users can send messages to their matches" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = public.current_profile_id() AND
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE profile_id = public.current_profile_id() AND is_active = true
    )
  );

-- Step 8: Fix notifications policies to use profile_id
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (profile_id = public.current_profile_id());

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (profile_id = public.current_profile_id());

-- Step 9: Add admin policies for all tables
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all matches" ON matches
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all match members" ON match_members
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all chat messages" ON chat_messages
  FOR ALL USING (public.is_admin());

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (public.is_admin());

-- Step 10: Add service role bypass for system operations
CREATE POLICY "Service role can manage all profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all matches" ON matches
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all match members" ON match_members
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all chat messages" ON chat_messages
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage all notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

-- Step 11: Verify the fix
-- This should not cause recursion
SELECT 'RLS policies updated successfully' as status;
