-- ==============================================
-- Migration 007: Fix Specialty Field References
-- ==============================================
-- This migration fixes the field name mismatch in database functions
-- Changes specialties[1] to medical_specialty to match the actual schema

-- Fix get_user_matches function
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

-- Fix get_eligible_users_for_matching function
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

-- Fix calculate_compatibility_score function
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

-- Fix calculate_profile_completion_percentage function
CREATE OR REPLACE FUNCTION calculate_profile_completion_percentage(profile_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
    total_fields INTEGER := 25; -- Total number of fields to check
    profile_record RECORD;
BEGIN
    -- Get the profile record
    SELECT * INTO profile_record FROM profiles WHERE id = profile_id;
    
    IF NOT FOUND THEN
        RETURN 0;
    END IF;
    
    -- Basic Info (5 fields)
    IF profile_record.first_name IS NOT NULL AND profile_record.first_name != '' THEN completion_score := completion_score + 1; END IF;
    IF profile_record.last_name IS NOT NULL AND profile_record.last_name != '' THEN completion_score := completion_score + 1; END IF;
    IF profile_record.age IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.gender IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.city IS NOT NULL AND profile_record.city != '' THEN completion_score := completion_score + 1; END IF;
    
    -- Medical Background (3 fields)
    IF profile_record.medical_specialty IS NOT NULL AND profile_record.medical_specialty != '' THEN completion_score := completion_score + 1; END IF;
    IF profile_record.specialty_preference IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.career_stage IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    
    -- Sports & Activities (2 fields)
    IF jsonb_object_keys(profile_record.sports_activities) IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.activity_level IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    
    -- Entertainment (3 fields)
    IF array_length(profile_record.music_genres, 1) > 0 THEN completion_score := completion_score + 1; END IF;
    IF array_length(profile_record.movie_genres, 1) > 0 THEN completion_score := completion_score + 1; END IF;
    IF array_length(profile_record.other_interests, 1) > 0 THEN completion_score := completion_score + 1; END IF;
    
    -- Social Preferences (3 fields)
    IF array_length(profile_record.meeting_activities, 1) > 0 THEN completion_score := completion_score + 1; END IF;
    IF profile_record.social_energy_level IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.conversation_style IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    
    -- Availability (2 fields)
    IF array_length(profile_record.preferred_times, 1) > 0 THEN completion_score := completion_score + 1; END IF;
    IF profile_record.meeting_frequency IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    
    -- Lifestyle (4 fields)
    IF profile_record.dietary_preferences IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.life_stage IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF array_length(profile_record.looking_for, 1) > 0 THEN completion_score := completion_score + 1; END IF;
    IF profile_record.ideal_weekend IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    
    -- Additional fields (3 fields)
    IF profile_record.gender_preference IS NOT NULL THEN completion_score := completion_score + 1; END IF;
    IF profile_record.nationality IS NOT NULL AND profile_record.nationality != '' THEN completion_score := completion_score + 1; END IF;
    IF profile_record.city IS NOT NULL AND profile_record.city != '' THEN completion_score := completion_score + 1; END IF;
    
    -- Calculate percentage
    RETURN ROUND((completion_score::DECIMAL / total_fields::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_profile_completion_percentage(UUID) IS 'Fixed version that uses medical_specialty instead of specialties array';
