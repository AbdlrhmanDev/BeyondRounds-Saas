-- ==============================================
-- Migration 003: Database Functions
-- ==============================================
-- Run this script after the RLS policies setup
-- This adds helper functions for matching algorithm and profile management

-- ==============================================
-- MATCHING ALGORITHM FUNCTIONS
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

-- Function to get eligible users for matching
CREATE OR REPLACE FUNCTION get_eligible_users_for_matching()
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  city TEXT,
  gender TEXT,
  gender_preference TEXT,
  medical_specialty TEXT,
  sports_activities JSONB,
  music_genres TEXT[],
  movie_genres TEXT[],
  other_interests TEXT[],
  meeting_activities TEXT[],
  social_energy_level TEXT,
  conversation_style TEXT,
  preferred_times TEXT[],
  meeting_frequency TEXT,
  life_stage TEXT,
  looking_for TEXT[],
  ideal_weekend TEXT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.city,
    p.gender,
    p.gender_preference,
    p.medical_specialty,
    p.sports_activities,
    p.music_genres,
    p.movie_genres,
    p.other_interests,
    p.meeting_activities,
    p.social_energy_level,
    p.conversation_style,
    p.preferred_times,
    p.meeting_frequency,
    p.life_stage,
    p.looking_for,
    p.ideal_weekend,
    p.created_at
  FROM profiles p
  WHERE p.is_verified = true 
    AND p.is_paid = true 
    AND p.onboarding_completed = true
    AND p.created_at <= (CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 4)::DATE + INTERVAL '12 hours'
    AND NOT EXISTS (
      SELECT 1 FROM matches m
      JOIN match_members mm ON m.id = mm.match_id
      WHERE mm.user_id = p.id 
        AND mm.is_active = true
        AND m.match_week > CURRENT_DATE - INTERVAL '6 weeks'
    )
    AND EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.city = p.city 
        AND p2.is_verified = true 
        AND p2.is_paid = true 
        AND p2.onboarding_completed = true
        AND p2.id != p.id
      HAVING COUNT(*) >= 2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate compatibility score between two users
CREATE OR REPLACE FUNCTION calculate_compatibility_score(user1_id UUID, user2_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  user1 profiles%ROWTYPE;
  user2 profiles%ROWTYPE;
  specialty_score DECIMAL(3,2) := 0;
  interests_score DECIMAL(3,2) := 0;
  city_score DECIMAL(3,2) := 0;
  availability_score DECIMAL(3,2) := 0;
  total_score DECIMAL(3,2) := 0;
BEGIN
  -- Get user profiles
  SELECT * INTO user1 FROM profiles WHERE id = user1_id;
  SELECT * INTO user2 FROM profiles WHERE id = user2_id;
  
  -- Specialty similarity (30% weight)
  IF user1.medical_specialty = user2.medical_specialty THEN
    specialty_score := 1.0;
  ELSIF user1.specialty_preference = 'different-specialties' THEN
    specialty_score := 0.8;
  ELSE
    specialty_score := 0.5;
  END IF;
  
  -- Shared interests (40% weight)
  DECLARE
    shared_interests INTEGER := 0;
    total_interests INTEGER := 0;
  BEGIN
    -- Count shared music genres
    IF user1.music_genres IS NOT NULL AND user2.music_genres IS NOT NULL THEN
      shared_interests := shared_interests + array_length(user1.music_genres & user2.music_genres, 1);
      total_interests := total_interests + GREATEST(array_length(user1.music_genres, 1), array_length(user2.music_genres, 1));
    END IF;
    
    -- Count shared movie genres
    IF user1.movie_genres IS NOT NULL AND user2.movie_genres IS NOT NULL THEN
      shared_interests := shared_interests + array_length(user1.movie_genres & user2.movie_genres, 1);
      total_interests := total_interests + GREATEST(array_length(user1.movie_genres, 1), array_length(user2.movie_genres, 1));
    END IF;
    
    -- Count shared other interests
    IF user1.other_interests IS NOT NULL AND user2.other_interests IS NOT NULL THEN
      shared_interests := shared_interests + array_length(user1.other_interests & user2.other_interests, 1);
      total_interests := total_interests + GREATEST(array_length(user1.other_interests, 1), array_length(user2.other_interests, 1));
    END IF;
    
    -- Count shared meeting activities
    IF user1.meeting_activities IS NOT NULL AND user2.meeting_activities IS NOT NULL THEN
      shared_interests := shared_interests + array_length(user1.meeting_activities & user2.meeting_activities, 1);
      total_interests := total_interests + GREATEST(array_length(user1.meeting_activities, 1), array_length(user2.meeting_activities, 1));
    END IF;
    
    IF total_interests > 0 THEN
      interests_score := shared_interests::DECIMAL / total_interests::DECIMAL;
    ELSE
      interests_score := 0.5; -- Default if no interests specified
    END IF;
  END;
  
  -- Same city (20% weight)
  IF user1.city = user2.city THEN
    city_score := 1.0;
  ELSE
    city_score := 0.0;
  END IF;
  
  -- Availability overlap (10% weight)
  IF user1.preferred_times IS NOT NULL AND user2.preferred_times IS NOT NULL THEN
    DECLARE
      shared_times INTEGER := array_length(user1.preferred_times & user2.preferred_times, 1);
      total_times INTEGER := GREATEST(array_length(user1.preferred_times, 1), array_length(user2.preferred_times, 1));
    BEGIN
      IF total_times > 0 THEN
        availability_score := shared_times::DECIMAL / total_times::DECIMAL;
      ELSE
        availability_score := 0.5;
      END IF;
    END;
  ELSE
    availability_score := 0.5;
  END IF;
  
  -- Calculate weighted total score
  total_score := (0.30 * specialty_score) + 
                 (0.40 * interests_score) + 
                 (0.20 * city_score) + 
                 (0.10 * availability_score);
  
  RETURN ROUND(total_score, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- PROFILE MANAGEMENT FUNCTIONS
-- ==============================================

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name,
    is_verified,
    is_paid,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    false,
    false,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger for auto-creating profiles
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to create user preferences on profile creation
CREATE OR REPLACE FUNCTION create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user preferences
CREATE TRIGGER create_user_preferences_trigger
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_user_preferences();

-- ==============================================
-- NOTIFICATION FUNCTIONS
-- ==============================================

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  target_user_id UUID,
  notification_type TEXT,
  notification_title TEXT,
  notification_message TEXT,
  action_url TEXT DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    action_url,
    metadata
  )
  VALUES (
    target_user_id,
    notification_type,
    notification_title,
    notification_message,
    action_url,
    metadata
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_uuid UUID, user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications 
  SET is_read = true, read_at = NOW()
  WHERE id = notification_uuid AND user_id = user_uuid;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- CLEANUP FUNCTIONS
-- ==============================================

-- Function to clean up old verification documents (90 day retention)
CREATE OR REPLACE FUNCTION cleanup_old_verification_documents()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete verification documents older than 90 days
  DELETE FROM verification_requests 
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  -- Note: Storage files should be cleaned up separately via admin panel or cron job
END;
$$;

-- Function to archive old matches (6 months)
CREATE OR REPLACE FUNCTION archive_old_matches()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Archive matches older than 6 months
  UPDATE matches 
  SET status = 'archived'
  WHERE created_at < NOW() - INTERVAL '6 months'
  AND status = 'active';
END;
$$;

-- Function to clean up old notifications (1 year)
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete read notifications older than 1 year
  DELETE FROM notifications 
  WHERE is_read = true 
  AND created_at < NOW() - INTERVAL '1 year';
END;
$$;

-- Function to clean up old matching logs (keep for 2 years)
CREATE OR REPLACE FUNCTION cleanup_old_matching_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete matching logs older than 2 years
  DELETE FROM matching_logs 
  WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$;

-- ==============================================
-- ADMIN FUNCTIONS
-- ==============================================

-- Function to get system statistics
CREATE OR REPLACE FUNCTION get_system_statistics()
RETURNS TABLE (
  total_users INTEGER,
  verified_users INTEGER,
  paid_users INTEGER,
  active_matches INTEGER,
  total_matches INTEGER,
  messages_today INTEGER,
  verification_pending INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM profiles)::INTEGER as total_users,
    (SELECT COUNT(*) FROM profiles WHERE is_verified = true)::INTEGER as verified_users,
    (SELECT COUNT(*) FROM profiles WHERE is_paid = true)::INTEGER as paid_users,
    (SELECT COUNT(*) FROM matches WHERE status = 'active')::INTEGER as active_matches,
    (SELECT COUNT(*) FROM matches)::INTEGER as total_matches,
    (SELECT COUNT(*) FROM chat_messages WHERE created_at >= CURRENT_DATE)::INTEGER as messages_today,
    (SELECT COUNT(*) FROM verification_requests WHERE status = 'pending')::INTEGER as verification_pending;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to approve verification request
CREATE OR REPLACE FUNCTION approve_verification_request(
  verification_id UUID,
  admin_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  request_user_id UUID;
BEGIN
  -- Get the user ID from the verification request
  SELECT user_id INTO request_user_id
  FROM verification_requests
  WHERE id = verification_id AND status = 'pending';
  
  IF request_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update verification request
  UPDATE verification_requests
  SET status = 'approved',
      reviewed_by = admin_user_id,
      reviewed_at = NOW()
  WHERE id = verification_id;
  
  -- Update user profile
  UPDATE profiles
  SET is_verified = true,
      updated_at = NOW()
  WHERE id = request_user_id;
  
  -- Create notification
  PERFORM create_notification(
    request_user_id,
    'verification_approved',
    'Verification Approved!',
    'Your medical license verification has been approved. You can now access all features.',
    '/dashboard'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject verification request
CREATE OR REPLACE FUNCTION reject_verification_request(
  verification_id UUID,
  admin_user_id UUID,
  rejection_reason TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  request_user_id UUID;
BEGIN
  -- Get the user ID from the verification request
  SELECT user_id INTO request_user_id
  FROM verification_requests
  WHERE id = verification_id AND status = 'pending';
  
  IF request_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update verification request
  UPDATE verification_requests
  SET status = 'rejected',
      reviewed_by = admin_user_id,
      reviewed_at = NOW(),
      rejection_reason = rejection_reason
  WHERE id = verification_id;
  
  -- Create notification
  PERFORM create_notification(
    request_user_id,
    'verification_rejected',
    'Verification Rejected',
    'Your verification request was rejected: ' || rejection_reason,
    '/verify'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
