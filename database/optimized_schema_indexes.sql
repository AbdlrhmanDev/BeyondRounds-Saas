-- ==============================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==============================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_users_verified ON users(is_verified);
CREATE INDEX idx_users_banned ON users(is_banned);
CREATE INDEX idx_users_onboarding ON users(onboarding_completed);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_last_active ON users(last_active_at);
CREATE INDEX idx_users_search_vector ON users USING GIN(search_vector);

-- User specialties indexes
CREATE INDEX idx_user_specialties_user_id ON user_specialties(user_id);
CREATE INDEX idx_user_specialties_specialty ON user_specialties(specialty);
CREATE INDEX idx_user_specialties_primary ON user_specialties(is_primary);

-- User interests indexes
CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX idx_user_interests_type ON user_interests(interest_type);
CREATE INDEX idx_user_interests_value ON user_interests(interest_value);

-- User preferences indexes
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_user_preferences_privacy ON user_preferences(privacy_level);

-- User availability indexes
CREATE INDEX idx_user_availability_user_id ON user_availability_slots(user_id);
CREATE INDEX idx_user_availability_day ON user_availability_slots(day_of_week);

-- Match batches indexes
CREATE INDEX idx_match_batches_date ON match_batches(batch_date);
CREATE INDEX idx_match_batches_created_at ON match_batches(created_at);

-- Matches indexes
CREATE INDEX idx_matches_batch_id ON matches(batch_id);
CREATE INDEX idx_matches_week ON matches(match_week);
CREATE INDEX idx_matches_group_size ON matches(group_size);
CREATE INDEX idx_matches_created_at ON matches(created_at);
CREATE INDEX idx_matches_last_activity ON matches(last_activity_at);

-- Match members indexes
CREATE INDEX idx_match_members_user_id ON match_members(user_id);
CREATE INDEX idx_match_members_match_id ON match_members(match_id);
CREATE INDEX idx_match_members_active ON match_members(is_active);
CREATE INDEX idx_match_members_compatibility ON match_members(compatibility_score);

-- Chat rooms indexes
CREATE INDEX idx_chat_rooms_match_id ON chat_rooms(match_id);
CREATE INDEX idx_chat_rooms_active ON chat_rooms(is_active);
CREATE INDEX idx_chat_rooms_last_message ON chat_rooms(last_message_at);

-- Chat messages indexes
CREATE INDEX idx_chat_messages_room_id ON chat_messages(chat_room_id);
CREATE INDEX idx_chat_messages_match_id ON chat_messages(match_id);
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_type ON chat_messages(message_type);
CREATE INDEX idx_chat_messages_search_vector ON chat_messages USING GIN(search_vector);

-- Message reactions indexes
CREATE INDEX idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX idx_message_reactions_user_id ON message_reactions(user_id);

-- Message read status indexes
CREATE INDEX idx_message_read_status_message_id ON message_read_status(message_id);
CREATE INDEX idx_message_read_status_user_id ON message_read_status(user_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_for);

-- Verification documents indexes
CREATE INDEX idx_verification_documents_user_id ON verification_documents(user_id);
CREATE INDEX idx_verification_documents_status ON verification_documents(status);
CREATE INDEX idx_verification_documents_submitted ON verification_documents(submitted_at);

-- Payment plans indexes
CREATE INDEX idx_payment_plans_active ON payment_plans(is_active);
CREATE INDEX idx_payment_plans_stripe_price ON payment_plans(stripe_price_id);

-- User subscriptions indexes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);
CREATE INDEX idx_user_subscriptions_stripe_subscription ON user_subscriptions(stripe_subscription_id);

-- Payments indexes
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_stripe_intent ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Feedback indexes
CREATE INDEX idx_feedback_match_id ON feedback(match_id);
CREATE INDEX idx_feedback_reviewer_id ON feedback(reviewer_id);
CREATE INDEX idx_feedback_reviewee_id ON feedback(reviewee_id);
CREATE INDEX idx_feedback_created_at ON feedback(created_at);

-- Feedback aspects indexes
CREATE INDEX idx_feedback_positive_aspects_feedback_id ON feedback_positive_aspects(feedback_id);
CREATE INDEX idx_feedback_improvement_areas_feedback_id ON feedback_improvement_areas(feedback_id);

-- Match history indexes
CREATE INDEX idx_match_history_matched_at ON match_history(matched_at);
CREATE INDEX idx_match_history_user1_id ON match_history(user1_id);
CREATE INDEX idx_match_history_user2_id ON match_history(user2_id);

-- Audit log indexes
CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX idx_audit_log_operation ON audit_log(operation);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- ==============================================
-- FUNCTIONS AND TRIGGERS
-- ==============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_record users)
RETURNS INTEGER AS $$
DECLARE
  completion_score INTEGER := 0;
  total_fields INTEGER := 0;
BEGIN
  -- Basic Info (30 points)
  total_fields := total_fields + 1;
  IF user_record.first_name IS NOT NULL AND user_record.first_name != '' THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_record.last_name IS NOT NULL AND user_record.last_name != '' THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_record.gender IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_record.age IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_record.city IS NOT NULL AND user_record.city != '' THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Medical Background (25 points)
  total_fields := total_fields + 1;
  IF user_record.medical_specialty IS NOT NULL AND user_record.medical_specialty != '' THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_record.career_stage IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Activity and Lifestyle (20 points)
  total_fields := total_fields + 1;
  IF user_record.activity_level IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_record.social_energy_level IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_record.conversation_style IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Preferences (15 points)
  total_fields := total_fields + 1;
  IF user_record.meeting_frequency IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_record.life_stage IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Lifestyle (10 points)
  total_fields := total_fields + 1;
  IF user_record.ideal_weekend IS NOT NULL AND user_record.ideal_weekend != '' THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Calculate percentage
  IF total_fields = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((completion_score::DECIMAL / total_fields::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql;

-- Function to update profile completion percentage
CREATE OR REPLACE FUNCTION update_profile_completion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.profile_completion_percentage := calculate_profile_completion(NEW);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update last_active_at
CREATE OR REPLACE FUNCTION update_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_user_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.first_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.last_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.medical_specialty, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.nationality, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update message search vector
CREATE OR REPLACE FUNCTION update_message_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is eligible for matching
CREATE OR REPLACE FUNCTION is_user_eligible_for_matching(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_record users%ROWTYPE;
  city_count INTEGER;
  last_match_date DATE;
BEGIN
  -- Get user profile
  SELECT * INTO user_record FROM users WHERE id = user_uuid;
  
  -- Check basic requirements
  IF NOT user_record.is_verified OR user_record.is_banned OR NOT user_record.onboarding_completed THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user joined before this Thursday 12:00
  IF user_record.created_at > (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 4)::DATE + INTERVAL '12 hours' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user was matched in past 6 weeks
  SELECT MAX(m.match_week) INTO last_match_date
  FROM matches m
  JOIN match_members mm ON m.id = mm.match_id
  WHERE mm.user_id = user_uuid AND mm.is_active = true;
  
  IF last_match_date IS NOT NULL AND last_match_date > CURRENT_DATE - INTERVAL '6 weeks' THEN
    RETURN FALSE;
  END IF;
  
  -- Check if city has at least 3 eligible users
  SELECT COUNT(*) INTO city_count
  FROM users
  WHERE city = user_record.city 
    AND is_verified = true 
    AND is_banned = false
    AND onboarding_completed = true
    AND id != user_uuid;
  
  IF city_count < 2 THEN -- Need at least 2 others (3 total)
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's current matches
CREATE OR REPLACE FUNCTION get_user_matches(user_uuid UUID)
RETURNS TABLE (
  match_id UUID,
  group_name TEXT,
  match_week DATE,
  group_size INTEGER,
  average_compatibility_score DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE,
  members JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.group_name,
    m.match_week,
    m.group_size,
    m.average_compatibility_score,
    m.created_at,
    jsonb_agg(
      jsonb_build_object(
        'id', u.id,
        'first_name', u.first_name,
        'last_name', u.last_name,
        'specialty', u.medical_specialty,
        'city', u.city
      )
    ) as members
  FROM matches m
  JOIN match_members mm ON m.id = mm.match_id
  JOIN users u ON mm.user_id = u.id
  WHERE mm.user_id = user_uuid AND mm.is_active = true
  GROUP BY m.id, m.group_name, m.match_week, m.group_size, m.average_compatibility_score, m.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get match messages
CREATE OR REPLACE FUNCTION get_match_messages(match_uuid UUID, user_uuid UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  message_type message_type,
  sender_id UUID,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  is_edited BOOLEAN
) AS $$
BEGIN
  -- Check if user is member of this match
  IF NOT EXISTS (
    SELECT 1 FROM match_members 
    WHERE match_id = match_uuid AND user_id = user_uuid AND is_active = true
  ) THEN
    RAISE EXCEPTION 'User is not a member of this match';
  END IF;

  RETURN QUERY
  SELECT 
    cm.id,
    cm.content,
    cm.message_type,
    cm.sender_id,
    u.first_name,
    u.last_name,
    cm.created_at,
    cm.is_edited
  FROM chat_messages cm
  LEFT JOIN users u ON cm.sender_id = u.id
  WHERE cm.match_id = match_uuid
  ORDER BY cm.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_completion
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER update_users_last_active
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();

CREATE TRIGGER update_users_search_vector
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_user_search_vector();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at
  BEFORE UPDATE ON chat_rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_messages_search_vector
  BEFORE INSERT OR UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_message_search_vector();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
