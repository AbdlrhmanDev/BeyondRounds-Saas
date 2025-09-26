-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_positive_aspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_improvement_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- USER POLICIES
-- ==============================================

-- Users can view own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert own profile
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can view other users' basic info (for matching)
CREATE POLICY "Users can view other users basic info" ON users
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND
    is_verified = true AND
    is_banned = false
  );

-- ==============================================
-- USER SPECIALTIES POLICIES
-- ==============================================

CREATE POLICY "Users can view own specialties" ON user_specialties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own specialties" ON user_specialties
  FOR ALL USING (auth.uid() = user_id);

-- ==============================================
-- USER INTERESTS POLICIES
-- ==============================================

CREATE POLICY "Users can view own interests" ON user_interests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own interests" ON user_interests
  FOR ALL USING (auth.uid() = user_id);

-- ==============================================
-- USER PREFERENCES POLICIES
-- ==============================================

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own preferences" ON user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- ==============================================
-- USER AVAILABILITY POLICIES
-- ==============================================

CREATE POLICY "Users can view own availability" ON user_availability_slots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own availability" ON user_availability_slots
  FOR ALL USING (auth.uid() = user_id);

-- ==============================================
-- MATCH POLICIES
-- ==============================================

-- Users can view matches they're in
CREATE POLICY "Users can view their matches" ON matches
  FOR SELECT USING (
    id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can view match members for their matches
CREATE POLICY "Users can view match members" ON match_members
  FOR SELECT USING (
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can view their own match memberships
CREATE POLICY "Users can view own match memberships" ON match_members
  FOR SELECT USING (user_id = auth.uid());

-- ==============================================
-- CHAT POLICIES
-- ==============================================

-- Users can view chat rooms for their matches
CREATE POLICY "Users can view their chat rooms" ON chat_rooms
  FOR SELECT USING (
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can view messages from their matches
CREATE POLICY "Users can view match messages" ON chat_messages
  FOR SELECT USING (
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can send messages to their matches
CREATE POLICY "Users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update own messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = sender_id);

-- Users can react to messages in their matches
CREATE POLICY "Users can react to messages" ON message_reactions
  FOR ALL USING (
    auth.uid() = user_id AND
    message_id IN (
      SELECT cm.id FROM chat_messages cm
      JOIN match_members mm ON cm.match_id = mm.match_id
      WHERE mm.user_id = auth.uid() AND mm.is_active = true
    )
  );

-- Users can mark messages as read in their matches
CREATE POLICY "Users can mark messages as read" ON message_read_status
  FOR ALL USING (
    auth.uid() = user_id AND
    message_id IN (
      SELECT cm.id FROM chat_messages cm
      JOIN match_members mm ON cm.match_id = mm.match_id
      WHERE mm.user_id = auth.uid() AND mm.is_active = true
    )
  );

-- ==============================================
-- NOTIFICATION POLICIES
-- ==============================================

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ==============================================
-- VERIFICATION POLICIES
-- ==============================================

CREATE POLICY "Users can view own verification documents" ON verification_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verification documents" ON verification_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- PAYMENT POLICIES
-- ==============================================

CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Payment plans are public
CREATE POLICY "Payment plans are public" ON payment_plans
  FOR SELECT USING (is_active = true);

-- ==============================================
-- FEEDBACK POLICIES
-- ==============================================

CREATE POLICY "Users can view feedback for their matches" ON feedback
  FOR SELECT USING (
    auth.uid() = reviewer_id OR auth.uid() = reviewee_id OR
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can create feedback for their matches" ON feedback
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can manage feedback aspects" ON feedback_positive_aspects
  FOR ALL USING (
    feedback_id IN (
      SELECT id FROM feedback WHERE reviewer_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage feedback improvement areas" ON feedback_improvement_areas
  FOR ALL USING (
    feedback_id IN (
      SELECT id FROM feedback WHERE reviewer_id = auth.uid()
    )
  );

-- ==============================================
-- ADMIN POLICIES
-- ==============================================

-- Admin can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can update all users
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all matches
CREATE POLICY "Admins can view all matches" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all verification documents
CREATE POLICY "Admins can view all verification documents" ON verification_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update verification documents" ON verification_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all match batches
CREATE POLICY "Admins can view all match batches" ON match_batches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all audit logs
CREATE POLICY "Admins can view all audit logs" ON audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==============================================
-- SERVICE ROLE POLICIES
-- ==============================================

-- Service role can do everything (for CRON jobs, etc.)
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON match_batches
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON matches
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON match_members
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access" ON audit_log
  FOR ALL USING (auth.role() = 'service_role');

-- ==============================================
-- GRANTS AND PERMISSIONS
-- ==============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant service role permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

-- ==============================================
-- COMMENTS AND DOCUMENTATION
-- ==============================================

COMMENT ON TABLE users IS 'User profiles extending Supabase auth.users with medical professional data';
COMMENT ON TABLE user_specialties IS 'User medical specialties with experience levels';
COMMENT ON TABLE user_interests IS 'User interests and preferences for matching';
COMMENT ON TABLE user_preferences IS 'User privacy and notification preferences';
COMMENT ON TABLE user_availability_slots IS 'User availability for meetings';
COMMENT ON TABLE match_batches IS 'Weekly matching algorithm execution batches';
COMMENT ON TABLE matches IS 'Groups of matched users created by the weekly matching algorithm';
COMMENT ON TABLE match_members IS 'Junction table linking users to their match groups';
COMMENT ON TABLE chat_rooms IS 'Chat rooms for match groups';
COMMENT ON TABLE chat_messages IS 'Messages exchanged within match groups';
COMMENT ON TABLE message_reactions IS 'Emoji reactions on chat messages';
COMMENT ON TABLE message_read_status IS 'Message read status tracking';
COMMENT ON TABLE notifications IS 'User notifications for various events';
COMMENT ON TABLE verification_documents IS 'Medical license verification documents';
COMMENT ON TABLE payment_plans IS 'Available subscription payment plans';
COMMENT ON TABLE user_subscriptions IS 'User subscription status and billing';
COMMENT ON TABLE payments IS 'Payment history and transaction records';
COMMENT ON TABLE feedback IS 'User feedback on match experiences';
COMMENT ON TABLE feedback_positive_aspects IS 'Positive aspects mentioned in feedback';
COMMENT ON TABLE feedback_improvement_areas IS 'Areas for improvement mentioned in feedback';
COMMENT ON TABLE match_history IS 'Historical record of all matches';
COMMENT ON TABLE audit_log IS 'Audit trail for all database operations';

-- ==============================================
-- SCHEMA SETUP COMPLETE
-- ==============================================
