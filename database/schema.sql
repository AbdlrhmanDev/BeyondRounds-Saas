-- ==============================================
-- BeyondRounds Complete Database Schema
-- ==============================================
-- This file contains the complete database schema for the BeyondRounds
-- medical professional networking platform.
-- 
-- Run this script in your Supabase SQL editor to set up the database.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================
-- CORE TABLES
-- ==============================================

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER CHECK (age >= 18 AND age <= 100),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not-to-say')),
  gender_preference TEXT NOT NULL DEFAULT 'no-preference' CHECK (gender_preference IN ('no-preference', 'mixed-preferred', 'same-gender-only', 'same-gender-preferred')),
  city TEXT NOT NULL,
  nationality TEXT,
  
  -- Medical Background
  medical_specialty TEXT,
  specialties TEXT[] DEFAULT '{}',
  specialty_preference TEXT CHECK (specialty_preference IN ('same-specialty', 'different-specialties', 'no-preference')),
  career_stage TEXT CHECK (career_stage IN ('medical-student', 'resident-1-2', 'resident-3-plus', 'fellow', 'attending-0-5', 'attending-5-plus', 'private-practice', 'academic-medicine', 'other')),
  
  -- Sports & Activities (JSONB for ratings)
  sports_activities JSONB DEFAULT '{}', -- Format: {"Running": 5, "Swimming": 3}
  activity_level TEXT CHECK (activity_level IN ('very-active', 'active', 'moderately-active', 'occasionally-active', 'non-physical')),
  
  -- Entertainment Preferences
  music_genres TEXT[] DEFAULT '{}',
  movie_genres TEXT[] DEFAULT '{}',
  other_interests TEXT[] DEFAULT '{}',
  
  -- Social Preferences
  meeting_activities TEXT[] DEFAULT '{}',
  social_energy_level TEXT CHECK (social_energy_level IN ('very-high', 'high', 'moderate', 'low', 'very-low')),
  conversation_style TEXT CHECK (conversation_style IN ('deep-philosophical', 'light-casual', 'professional-focused', 'mixed')),
  
  -- Availability
  preferred_times TEXT[] DEFAULT '{}',
  meeting_frequency TEXT CHECK (meeting_frequency IN ('weekly', 'bi-weekly', 'monthly', 'flexible')),
  
  -- Lifestyle
  dietary_preferences TEXT,
  life_stage TEXT CHECK (life_stage IN ('single', 'dating', 'married', 'parent', 'empty-nester')),
  looking_for TEXT[] DEFAULT '{}',
  ideal_weekend TEXT,
  
  -- System Fields
  is_verified BOOLEAN DEFAULT false,
  is_paid BOOLEAN DEFAULT false,
  onboarding_completed BOOLEAN DEFAULT false,
  profile_completion_percentage INTEGER DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches table (groups of matched users)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived', 'disbanded')),
  match_week DATE NOT NULL,
  group_size INTEGER NOT NULL DEFAULT 3 CHECK (group_size >= 3 AND group_size <= 4),
  average_compatibility_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match members junction table
CREATE TABLE IF NOT EXISTS match_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  UNIQUE(match_id, user_id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- NULL for system messages
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'user' CHECK (message_type IN ('user', 'system', 'bot')),
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matching logs table (for CRON job tracking)
CREATE TABLE IF NOT EXISTS matching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week DATE NOT NULL,
  groups_created INTEGER NOT NULL DEFAULT 0,
  eligible_users INTEGER NOT NULL DEFAULT 0,
  valid_pairs INTEGER DEFAULT 0,
  rollover_users INTEGER DEFAULT 0,
  reason TEXT NOT NULL,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('match_created', 'message_received', 'payment_reminder', 'verification_approved', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Verification requests table
CREATE TABLE IF NOT EXISTS verification_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  license_number TEXT NOT NULL,
  license_state TEXT NOT NULL,
  license_image_url TEXT NOT NULL,
  photo_id_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment history table
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending', 'cancelled')),
  subscription_period_start DATE NOT NULL,
  subscription_period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences table (for advanced settings)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  weekly_match_reminders BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  privacy_level TEXT DEFAULT 'standard' CHECK (privacy_level IN ('minimal', 'standard', 'detailed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_specialties ON profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_paid ON profiles(is_paid);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at);

-- Matches table indexes
CREATE INDEX IF NOT EXISTS idx_matches_week ON matches(match_week);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at);

-- Match members indexes
CREATE INDEX IF NOT EXISTS idx_match_members_user_id ON match_members(user_id);
CREATE INDEX IF NOT EXISTS idx_match_members_match_id ON match_members(match_id);
CREATE INDEX IF NOT EXISTS idx_match_members_active ON match_members(is_active);

-- Chat messages indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_match_id ON chat_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);

-- Matching logs indexes
CREATE INDEX IF NOT EXISTS idx_matching_logs_week ON matching_logs(week);
CREATE INDEX IF NOT EXISTS idx_matching_logs_created_at ON matching_logs(created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Verification requests indexes
CREATE INDEX IF NOT EXISTS idx_verification_user_id ON verification_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_status ON verification_requests(status);

-- Payment history indexes
CREATE INDEX IF NOT EXISTS idx_payment_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_created_at ON payment_history(created_at);

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
CREATE OR REPLACE FUNCTION calculate_profile_completion(user_profile profiles)
RETURNS INTEGER AS $$
DECLARE
  completion_score INTEGER := 0;
  total_fields INTEGER := 0;
BEGIN
  -- Basic Info (25 points)
  total_fields := total_fields + 1;
  IF user_profile.first_name IS NOT NULL AND user_profile.first_name != '' THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_profile.gender IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_profile.city IS NOT NULL AND user_profile.city != '' THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Medical Background (20 points)
  total_fields := total_fields + 1;
  IF array_length(user_profile.specialties, 1) > 0 THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_profile.career_stage IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Sports & Activities (15 points)
  total_fields := total_fields + 1;
  IF user_profile.activity_level IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Social Preferences (15 points)
  total_fields := total_fields + 1;
  IF user_profile.social_energy_level IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_profile.conversation_style IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Availability (10 points)
  total_fields := total_fields + 1;
  IF array_length(user_profile.preferred_times, 1) > 0 THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_profile.meeting_frequency IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  -- Lifestyle (15 points)
  total_fields := total_fields + 1;
  IF user_profile.life_stage IS NOT NULL THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF array_length(user_profile.looking_for, 1) > 0 THEN
    completion_score := completion_score + 1;
  END IF;
  
  total_fields := total_fields + 1;
  IF user_profile.ideal_weekend IS NOT NULL AND user_profile.ideal_weekend != '' THEN
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

-- Triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_completion
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_completion();

CREATE TRIGGER update_profiles_last_active
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_last_active();

CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verification_requests_updated_at
  BEFORE UPDATE ON verification_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Matches policies
CREATE POLICY "Users can view matches they're in" ON matches
  FOR SELECT USING (
    id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

-- Match members policies
CREATE POLICY "Users can view match members for their matches" ON match_members
  FOR SELECT USING (
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can view their own match memberships" ON match_members
  FOR SELECT USING (user_id = auth.uid());

-- Chat messages policies
CREATE POLICY "Users can view messages from their matches" ON chat_messages
  FOR SELECT USING (
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can send messages to their matches" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    match_id IN (
      SELECT match_id FROM match_members 
      WHERE user_id = auth.uid() AND is_active = true
    )
  );

CREATE POLICY "Users can update their own messages" ON chat_messages
  FOR UPDATE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Verification requests policies
CREATE POLICY "Users can view own verification requests" ON verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own verification requests" ON verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Payment history policies
CREATE POLICY "Users can view own payment history" ON payment_history
  FOR SELECT USING (auth.uid() = user_id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ==============================================
-- ADMIN POLICIES (for admin users)
-- ==============================================

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all matches
CREATE POLICY "Admins can view all matches" ON matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all verification requests
CREATE POLICY "Admins can view all verification requests" ON verification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update verification requests" ON verification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can view all matching logs
CREATE POLICY "Admins can view all matching logs" ON matching_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ==============================================
-- HELPER FUNCTIONS
-- ==============================================

-- Function to get user's current matches
CREATE OR REPLACE FUNCTION get_user_matches(user_uuid UUID)
RETURNS TABLE (
  match_id UUID,
  group_name TEXT,
  status TEXT,
  match_week DATE,
  group_size INTEGER,
  average_compatibility_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE,
  members JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.group_name,
    m.status,
    m.match_week,
    m.group_size,
    m.average_compatibility_score,
    m.created_at,
    jsonb_agg(
      jsonb_build_object(
        'id', p.id,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'specialty', p.medical_specialty,
        'city', p.city
      )
    ) as members
  FROM matches m
  JOIN match_members mm ON m.id = mm.match_id
  JOIN profiles p ON mm.user_id = p.id
  WHERE mm.user_id = user_uuid AND mm.is_active = true
  GROUP BY m.id, m.group_name, m.status, m.match_week, m.group_size, m.average_compatibility_score, m.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get match messages
CREATE OR REPLACE FUNCTION get_match_messages(match_uuid UUID, user_uuid UUID)
RETURNS TABLE (
  id UUID,
  content TEXT,
  message_type TEXT,
  user_id UUID,
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
    cm.user_id,
    p.first_name,
    p.last_name,
    cm.created_at,
    cm.is_edited
  FROM chat_messages cm
  LEFT JOIN profiles p ON cm.user_id = p.id
  WHERE cm.match_id = match_uuid
  ORDER BY cm.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is eligible for matching
CREATE OR REPLACE FUNCTION is_user_eligible_for_matching(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_profile profiles%ROWTYPE;
  city_count INTEGER;
  last_match_date DATE;
BEGIN
  -- Get user profile
  SELECT * INTO user_profile FROM profiles WHERE id = user_uuid;
  
  -- Check basic requirements
  IF NOT user_profile.is_verified OR NOT user_profile.is_paid OR NOT user_profile.onboarding_completed THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user joined before this Thursday 12:00
  IF user_profile.created_at > (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 4)::DATE + INTERVAL '12 hours' THEN
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
  FROM profiles
  WHERE city = user_profile.city 
    AND is_verified = true 
    AND is_paid = true 
    AND onboarding_completed = true
    AND id != user_uuid;
  
  IF city_count < 2 THEN -- Need at least 2 others (3 total)
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- SAMPLE DATA (for development/testing)
-- ==============================================

-- Insert sample admin user (replace with actual admin user ID)
-- INSERT INTO profiles (
--   id, email, first_name, last_name, gender, city, specialties, 
--   is_verified, is_paid, onboarding_completed, role
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000', -- Replace with actual admin UUID
--   'admin@beyondrounds.com',
--   'Admin',
--   'User',
--   'prefer-not-to-say',
--   'San Francisco',
--   ARRAY['General Practice/Family Medicine'],
--   true,
--   true,
--   true,
--   'admin'
-- ) ON CONFLICT (id) DO NOTHING;

-- ==============================================
-- COMMENTS AND DOCUMENTATION
-- ==============================================

COMMENT ON TABLE profiles IS 'User profiles extending Supabase auth.users with medical professional data';
COMMENT ON TABLE matches IS 'Groups of matched users created by the weekly matching algorithm';
COMMENT ON TABLE match_members IS 'Junction table linking users to their match groups';
COMMENT ON TABLE chat_messages IS 'Messages exchanged within match groups';
COMMENT ON TABLE matching_logs IS 'Logs of weekly matching algorithm runs';
COMMENT ON TABLE notifications IS 'User notifications for various events';
COMMENT ON TABLE verification_requests IS 'Medical license verification requests';
COMMENT ON TABLE payment_history IS 'Stripe payment history for subscriptions';
COMMENT ON TABLE user_preferences IS 'User privacy and notification preferences';

-- ==============================================
-- SCHEMA SETUP COMPLETE
-- ==============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant service role permissions
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;
