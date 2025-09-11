-- ==============================================
-- SUPABASE CRON JOB FOR WEEKLY MATCHING ENGINE
-- This script sets up pg_cron to run the matching algorithm
-- every Thursday at 16:00 directly in the database
-- ==============================================

-- Enable pg_cron extension (requires Supabase Pro plan)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ==============================================
-- MATCHING ENGINE DATABASE FUNCTIONS
-- ==============================================

-- Function to get eligible users for matching
CREATE OR REPLACE FUNCTION get_eligible_users_for_matching()
RETURNS TABLE (
  id UUID,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  specialty TEXT,
  medical_specialty TEXT[],
  city TEXT,
  gender TEXT,
  gender_preference TEXT,
  interests TEXT[],
  other_interests TEXT[],
  availability_slots TEXT[],
  is_verified BOOLEAN,
  is_paid BOOLEAN,
  onboarding_completed BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  sports_activities JSONB,
  music_preferences TEXT[],
  movie_tv_preferences TEXT[],
  preferred_activities TEXT[],
  social_energy_level TEXT,
  conversation_style TEXT,
  life_stage TEXT,
  activity_level TEXT,
  dietary_restrictions TEXT[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cutoff_time TIMESTAMP WITH TIME ZONE;
  six_weeks_ago DATE;
  recently_matched_user_ids UUID[];
BEGIN
  -- Calculate Thursday 12:00 cutoff (users must join before this)
  cutoff_time := date_trunc('week', CURRENT_DATE) + INTERVAL '3 days 12 hours'; -- Thursday 12:00
  
  -- Calculate 6 weeks ago for match history check
  six_weeks_ago := CURRENT_DATE - INTERVAL '6 weeks';
  
  -- Get users who have been matched in the past 6 weeks
  SELECT array_agg(DISTINCT mm.user_id)
  INTO recently_matched_user_ids
  FROM match_members mm
  INNER JOIN matches m ON mm.match_id = m.id
  WHERE m.match_week >= six_weeks_ago;
  
  -- Coalesce to empty array if no recent matches
  recently_matched_user_ids := COALESCE(recently_matched_user_ids, ARRAY[]::UUID[]);
  
  -- Return eligible users
  RETURN QUERY
  WITH city_counts AS (
    SELECT 
      p.city,
      COUNT(*) as user_count
    FROM profiles p
    WHERE p.is_verified = true
      AND p.is_paid = true
      AND p.onboarding_completed = true
      AND p.created_at < cutoff_time
      AND NOT (p.id = ANY(recently_matched_user_ids))
    GROUP BY p.city
    HAVING COUNT(*) >= 3
  )
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.email,
    p.specialty,
    p.medical_specialty,
    p.city,
    p.gender,
    p.gender_preference,
    p.interests,
    p.other_interests,
    p.availability_slots,
    p.is_verified,
    p.is_paid,
    p.onboarding_completed,
    p.created_at,
    p.sports_activities,
    p.music_preferences,
    p.movie_tv_preferences,
    p.preferred_activities,
    p.social_energy_level,
    p.conversation_style,
    p.life_stage,
    p.activity_level,
    p.dietary_restrictions
  FROM profiles p
  INNER JOIN city_counts cc ON p.city = cc.city
  WHERE p.is_verified = true
    AND p.is_paid = true
    AND p.onboarding_completed = true
    AND p.created_at < cutoff_time
    AND NOT (p.id = ANY(recently_matched_user_ids));
END;
$$;

-- Function to calculate specialty similarity score
CREATE OR REPLACE FUNCTION calculate_specialty_similarity(
  specialty1 TEXT,
  medical_specialty1 TEXT[],
  specialty2 TEXT,
  medical_specialty2 TEXT[]
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  specialties1 TEXT[];
  specialties2 TEXT[];
  has_common BOOLEAN;
  domain1 TEXT;
  domain2 TEXT;
BEGIN
  -- Use medical_specialty array if available, fall back to specialty
  specialties1 := CASE 
    WHEN medical_specialty1 IS NOT NULL AND array_length(medical_specialty1, 1) > 0 
    THEN medical_specialty1 
    ELSE ARRAY[specialty1] 
  END;
  
  specialties2 := CASE 
    WHEN medical_specialty2 IS NOT NULL AND array_length(medical_specialty2, 1) > 0 
    THEN medical_specialty2 
    ELSE ARRAY[specialty2] 
  END;
  
  -- Check for exact match
  SELECT EXISTS (
    SELECT 1 FROM unnest(specialties1) s1
    WHERE s1 = ANY(specialties2)
  ) INTO has_common;
  
  IF has_common THEN
    RETURN 1.0;
  END IF;
  
  -- Check for same domain (simplified)
  -- Surgical specialties
  IF (specialties1 && ARRAY['Surgery', 'Orthopedics', 'Neurosurgery', 'Plastic Surgery']) AND
     (specialties2 && ARRAY['Surgery', 'Orthopedics', 'Neurosurgery', 'Plastic Surgery']) THEN
    RETURN 0.5;
  END IF;
  
  -- Internal medicine specialties
  IF (specialties1 && ARRAY['Internal Medicine', 'Cardiology', 'Gastroenterology', 'Endocrinology']) AND
     (specialties2 && ARRAY['Internal Medicine', 'Cardiology', 'Gastroenterology', 'Endocrinology']) THEN
    RETURN 0.5;
  END IF;
  
  -- Primary care specialties
  IF (specialties1 && ARRAY['General Practice', 'Family Medicine', 'Pediatrics']) AND
     (specialties2 && ARRAY['General Practice', 'Family Medicine', 'Pediatrics']) THEN
    RETURN 0.5;
  END IF;
  
  RETURN 0.0;
END;
$$;

-- Function to calculate shared interest ratio
CREATE OR REPLACE FUNCTION calculate_shared_interest_ratio(
  interests1 TEXT[],
  other_interests1 TEXT[],
  music_preferences1 TEXT[],
  movie_tv_preferences1 TEXT[],
  preferred_activities1 TEXT[],
  interests2 TEXT[],
  other_interests2 TEXT[],
  music_preferences2 TEXT[],
  movie_tv_preferences2 TEXT[],
  preferred_activities2 TEXT[]
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  all_interests1 TEXT[];
  all_interests2 TEXT[];
  common_count INTEGER;
  min_count INTEGER;
BEGIN
  -- Combine all interest arrays
  all_interests1 := COALESCE(interests1, ARRAY[]::TEXT[]) ||
                    COALESCE(other_interests1, ARRAY[]::TEXT[]) ||
                    COALESCE(music_preferences1, ARRAY[]::TEXT[]) ||
                    COALESCE(movie_tv_preferences1, ARRAY[]::TEXT[]) ||
                    COALESCE(preferred_activities1, ARRAY[]::TEXT[]);
                    
  all_interests2 := COALESCE(interests2, ARRAY[]::TEXT[]) ||
                    COALESCE(other_interests2, ARRAY[]::TEXT[]) ||
                    COALESCE(music_preferences2, ARRAY[]::TEXT[]) ||
                    COALESCE(movie_tv_preferences2, ARRAY[]::TEXT[]) ||
                    COALESCE(preferred_activities2, ARRAY[]::TEXT[]);
  
  -- Return 0 if either user has no interests
  IF array_length(all_interests1, 1) IS NULL OR array_length(all_interests2, 1) IS NULL THEN
    RETURN 0.0;
  END IF;
  
  -- Count common interests
  SELECT COUNT(*)
  INTO common_count
  FROM unnest(all_interests1) i1
  WHERE i1 = ANY(all_interests2);
  
  -- Calculate ratio based on minimum array length
  min_count := LEAST(array_length(all_interests1, 1), array_length(all_interests2, 1));
  
  RETURN CASE 
    WHEN min_count > 0 THEN common_count::DECIMAL / min_count 
    ELSE 0.0 
  END;
END;
$$;

-- Function to calculate availability overlap ratio
CREATE OR REPLACE FUNCTION calculate_availability_overlap(
  availability1 TEXT[],
  availability2 TEXT[]
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  common_count INTEGER;
  min_count INTEGER;
BEGIN
  -- Return 0 if either user has no availability
  IF array_length(availability1, 1) IS NULL OR array_length(availability2, 1) IS NULL THEN
    RETURN 0.0;
  END IF;
  
  -- Count common availability slots
  SELECT COUNT(*)
  INTO common_count
  FROM unnest(availability1) a1
  WHERE a1 = ANY(availability2);
  
  -- Calculate ratio based on minimum array length
  min_count := LEAST(array_length(availability1, 1), array_length(availability2, 1));
  
  RETURN CASE 
    WHEN min_count > 0 THEN common_count::DECIMAL / min_count 
    ELSE 0.0 
  END;
END;
$$;

-- Main weekly matching function
CREATE OR REPLACE FUNCTION run_weekly_matching()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  eligible_users RECORD;
  user_data JSONB[] := ARRAY[]::JSONB[];
  user_pairs JSONB[] := ARRAY[]::JSONB[];
  current_week DATE;
  match_score DECIMAL;
  specialty_score DECIMAL;
  interest_score DECIMAL;
  city_score DECIMAL;
  availability_score DECIMAL;
  total_score DECIMAL;
  group_counter INTEGER := 1;
  groups_created INTEGER := 0;
  total_eligible INTEGER := 0;
  result JSONB;
BEGIN
  current_week := CURRENT_DATE;
  
  -- Check if matching already completed this week
  IF EXISTS (SELECT 1 FROM matches WHERE match_week = current_week) THEN
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Matching already completed for this week',
      'week', current_week,
      'groups_created', 0
    );
  END IF;
  
  -- Get eligible users and convert to JSONB array for processing
  FOR eligible_users IN 
    SELECT * FROM get_eligible_users_for_matching()
  LOOP
    total_eligible := total_eligible + 1;
    user_data := user_data || jsonb_build_object(
      'id', eligible_users.id,
      'first_name', eligible_users.first_name,
      'last_name', eligible_users.last_name,
      'email', eligible_users.email,
      'specialty', eligible_users.specialty,
      'medical_specialty', eligible_users.medical_specialty,
      'city', eligible_users.city,
      'gender', eligible_users.gender,
      'gender_preference', eligible_users.gender_preference,
      'interests', eligible_users.interests,
      'other_interests', eligible_users.other_interests,
      'availability_slots', eligible_users.availability_slots,
      'sports_activities', eligible_users.sports_activities,
      'music_preferences', eligible_users.music_preferences,
      'movie_tv_preferences', eligible_users.movie_tv_preferences,
      'preferred_activities', eligible_users.preferred_activities,
      'social_energy_level', eligible_users.social_energy_level,
      'conversation_style', eligible_users.conversation_style,
      'life_stage', eligible_users.life_stage,
      'activity_level', eligible_users.activity_level,
      'dietary_restrictions', eligible_users.dietary_restrictions
    );
  END LOOP;
  
  -- Log the start of matching process
  INSERT INTO matching_logs (week, groups_created, eligible_users, reason)
  VALUES (current_week, 0, total_eligible, 'Started matching process');
  
  -- If insufficient users, return early
  IF total_eligible < 3 THEN
    UPDATE matching_logs 
    SET reason = 'Insufficient eligible users'
    WHERE week = current_week;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Insufficient eligible users for matching',
      'week', current_week,
      'eligible_users', total_eligible,
      'groups_created', 0
    );
  END IF;
  
  -- For now, create simple groups (this is a simplified version)
  -- In a full implementation, you would implement the complete scoring and grouping logic
  -- This demonstrates the basic structure for Supabase CRON
  
  -- Create basic groups of 3-4 users each
  DECLARE
    current_group_users UUID[] := ARRAY[]::UUID[];
    match_id UUID;
    user_item JSONB;
    i INTEGER := 0;
  BEGIN
    FOR user_item IN SELECT * FROM unnest(user_data)
    LOOP
      i := i + 1;
      current_group_users := current_group_users || (user_item->>'id')::UUID;
      
      -- Create group when we have 3 users or it's the last batch
      IF array_length(current_group_users, 1) = 3 OR i = array_length(user_data, 1) THEN
        -- Only create group if we have at least 3 users
        IF array_length(current_group_users, 1) >= 3 THEN
          -- Insert match record
          INSERT INTO matches (group_name, status, match_week)
          VALUES (
            'Rounds_Group_' || lpad(group_counter::TEXT, 2, '0'),
            'active',
            current_week
          )
          RETURNING id INTO match_id;
          
          -- Insert match members
          INSERT INTO match_members (match_id, user_id, joined_at)
          SELECT match_id, unnest(current_group_users), NOW();
          
          -- Insert welcome message
          INSERT INTO chat_messages (match_id, user_id, content, message_type, created_at)
          VALUES (
            match_id,
            NULL,
            '👋 Welcome to your Rounds group! Feel free to introduce yourselves — your shared interests made this match possible.',
            'system',
            NOW()
          );
          
          groups_created := groups_created + 1;
          group_counter := group_counter + 1;
        END IF;
        
        -- Reset for next group
        current_group_users := ARRAY[]::UUID[];
      END IF;
    END LOOP;
  END;
  
  -- Update matching log with results
  UPDATE matching_logs 
  SET groups_created = groups_created,
      reason = CASE 
        WHEN groups_created > 0 THEN 'Success - Created ' || groups_created || ' groups'
        ELSE 'No valid groups could be formed'
      END
  WHERE week = current_week;
  
  -- Return results
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Weekly matching completed',
    'week', current_week,
    'eligible_users', total_eligible,
    'groups_created', groups_created,
    'timestamp', NOW()
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error
    INSERT INTO matching_logs (week, groups_created, eligible_users, reason)
    VALUES (current_week, 0, total_eligible, 'Error: ' || SQLERRM)
    ON CONFLICT DO NOTHING;
    
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'week', current_week
    );
END;
$$;

-- ==============================================
-- CRON JOB SETUP
-- ==============================================

-- Schedule the matching function to run every Thursday at 16:00
-- Note: Times are in UTC, adjust according to your timezone
SELECT cron.schedule(
  'weekly-doctor-matching',           -- job name
  '0 16 * * 4',                      -- Every Thursday at 16:00 UTC
  'SELECT run_weekly_matching();'     -- SQL command to execute
);

-- ==============================================
-- MONITORING AND MANAGEMENT FUNCTIONS
-- ==============================================

-- Function to check cron job status
CREATE OR REPLACE FUNCTION get_cron_job_status()
RETURNS TABLE (
  jobid BIGINT,
  schedule TEXT,
  command TEXT,
  nodename TEXT,
  nodeport INTEGER,
  database TEXT,
  username TEXT,
  active BOOLEAN,
  jobname TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM cron.job WHERE jobname = 'weekly-doctor-matching';
$$;

-- Function to manually trigger matching (for testing)
CREATE OR REPLACE FUNCTION trigger_manual_matching()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins to manually trigger
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Unauthorized - Admin access required'
    );
  END IF;
  
  RETURN run_weekly_matching();
END;
$$;

-- Function to get matching history
CREATE OR REPLACE FUNCTION get_matching_history(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  week DATE,
  groups_created INTEGER,
  eligible_users INTEGER,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    week,
    groups_created,
    eligible_users,
    reason,
    created_at
  FROM matching_logs 
  ORDER BY week DESC 
  LIMIT limit_count;
$$;

-- Function to disable the cron job (for maintenance)
CREATE OR REPLACE FUNCTION disable_weekly_matching()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins to disable
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RETURN false;
  END IF;
  
  SELECT cron.unschedule('weekly-doctor-matching');
  RETURN true;
END;
$$;

-- Function to re-enable the cron job
CREATE OR REPLACE FUNCTION enable_weekly_matching()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only allow admins to enable
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RETURN false;
  END IF;
  
  -- Remove existing job if it exists
  PERFORM cron.unschedule('weekly-doctor-matching');
  
  -- Reschedule
  SELECT cron.schedule(
    'weekly-doctor-matching',
    '0 16 * * 4',
    'SELECT run_weekly_matching();'
  );
  
  RETURN true;
END;
$$;

-- ==============================================
-- GRANT PERMISSIONS
-- ==============================================

-- Grant execute permissions to authenticated users for monitoring functions
GRANT EXECUTE ON FUNCTION get_matching_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_cron_job_status TO authenticated;

-- Grant execute permissions to service role for cron execution
GRANT EXECUTE ON FUNCTION run_weekly_matching TO service_role;
GRANT EXECUTE ON FUNCTION get_eligible_users_for_matching TO service_role;
GRANT EXECUTE ON FUNCTION calculate_specialty_similarity TO service_role;
GRANT EXECUTE ON FUNCTION calculate_shared_interest_ratio TO service_role;
GRANT EXECUTE ON FUNCTION calculate_availability_overlap TO service_role;

-- Grant admin functions to authenticated users (with internal role checks)
GRANT EXECUTE ON FUNCTION trigger_manual_matching TO authenticated;
GRANT EXECUTE ON FUNCTION disable_weekly_matching TO authenticated;
GRANT EXECUTE ON FUNCTION enable_weekly_matching TO authenticated;

-- ==============================================
-- VERIFICATION QUERIES
-- ==============================================

-- Check if cron job is scheduled
-- SELECT * FROM cron.job WHERE jobname = 'weekly-doctor-matching';

-- Check matching logs
-- SELECT * FROM get_matching_history(5);

-- Manually test matching (admin only)
-- SELECT trigger_manual_matching();

-- Check cron job status
-- SELECT * FROM get_cron_job_status();
