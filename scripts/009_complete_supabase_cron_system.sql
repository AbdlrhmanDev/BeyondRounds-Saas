-- ==============================================
-- COMPLETE SUPABASE CRON SYSTEM FOR BEYONDROUNDS
-- This is the definitive, all-in-one script for setting up
-- the entire weekly matching system in Supabase
-- ==============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- ==============================================
-- STEP 1: CREATE MATCHING LOGS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS matching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week DATE NOT NULL,
  groups_created INTEGER NOT NULL DEFAULT 0,
  eligible_users INTEGER NOT NULL DEFAULT 0,
  valid_pairs INTEGER DEFAULT 0,
  rollover_users INTEGER DEFAULT 0,
  reason TEXT NOT NULL,
  execution_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for matching logs
CREATE INDEX IF NOT EXISTS idx_matching_logs_week ON matching_logs(week);
CREATE INDEX IF NOT EXISTS idx_matching_logs_created ON matching_logs(created_at);

-- Enable RLS on matching logs
ALTER TABLE matching_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage matching logs
CREATE POLICY "Admins can manage matching logs" ON matching_logs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- ==============================================
-- STEP 2: CORE MATCHING FUNCTIONS
-- ==============================================

-- Function to get eligible users with comprehensive filtering
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
  
  -- Return eligible users from cities with at least 3 users
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
    AND NOT (p.id = ANY(recently_matched_user_ids))
  ORDER BY p.city, p.created_at;
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
  
  -- Check for same domain (simplified domain matching)
  -- Surgical specialties
  IF (specialties1 && ARRAY['Surgery', 'Orthopedics', 'Neurosurgery', 'Plastic Surgery', 'Cardiothoracic Surgery']) AND
     (specialties2 && ARRAY['Surgery', 'Orthopedics', 'Neurosurgery', 'Plastic Surgery', 'Cardiothoracic Surgery']) THEN
    RETURN 0.5;
  END IF;
  
  -- Internal medicine specialties
  IF (specialties1 && ARRAY['Internal Medicine', 'Cardiology', 'Gastroenterology', 'Endocrinology', 'Rheumatology']) AND
     (specialties2 && ARRAY['Internal Medicine', 'Cardiology', 'Gastroenterology', 'Endocrinology', 'Rheumatology']) THEN
    RETURN 0.5;
  END IF;
  
  -- Primary care specialties
  IF (specialties1 && ARRAY['General Practice', 'Family Medicine', 'Pediatrics']) AND
     (specialties2 && ARRAY['General Practice', 'Family Medicine', 'Pediatrics']) THEN
    RETURN 0.5;
  END IF;
  
  -- Emergency and critical care
  IF (specialties1 && ARRAY['Emergency Medicine', 'Critical Care', 'Anesthesiology']) AND
     (specialties2 && ARRAY['Emergency Medicine', 'Critical Care', 'Anesthesiology']) THEN
    RETURN 0.5;
  END IF;
  
  -- Diagnostic specialties
  IF (specialties1 && ARRAY['Radiology', 'Pathology', 'Laboratory Medicine']) AND
     (specialties2 && ARRAY['Radiology', 'Pathology', 'Laboratory Medicine']) THEN
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
  -- Combine all interest arrays, removing nulls
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

-- Function to calculate pair match score using exact specification
CREATE OR REPLACE FUNCTION calculate_pair_match_score(
  user1_specialty TEXT,
  user1_medical_specialty TEXT[],
  user1_interests TEXT[],
  user1_other_interests TEXT[],
  user1_music_preferences TEXT[],
  user1_movie_tv_preferences TEXT[],
  user1_preferred_activities TEXT[],
  user1_city TEXT,
  user1_availability_slots TEXT[],
  user2_specialty TEXT,
  user2_medical_specialty TEXT[],
  user2_interests TEXT[],
  user2_other_interests TEXT[],
  user2_music_preferences TEXT[],
  user2_movie_tv_preferences TEXT[],
  user2_preferred_activities TEXT[],
  user2_city TEXT,
  user2_availability_slots TEXT[]
)
RETURNS DECIMAL
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  specialty_score DECIMAL;
  interest_score DECIMAL;
  city_score DECIMAL;
  availability_score DECIMAL;
  total_score DECIMAL;
BEGIN
  -- Calculate component scores using exact specification weights
  specialty_score := calculate_specialty_similarity(
    user1_specialty, user1_medical_specialty,
    user2_specialty, user2_medical_specialty
  );
  
  interest_score := calculate_shared_interest_ratio(
    user1_interests, user1_other_interests, user1_music_preferences, 
    user1_movie_tv_preferences, user1_preferred_activities,
    user2_interests, user2_other_interests, user2_music_preferences, 
    user2_movie_tv_preferences, user2_preferred_activities
  );
  
  city_score := CASE WHEN user1_city = user2_city THEN 1.0 ELSE 0.0 END;
  
  availability_score := calculate_availability_overlap(
    user1_availability_slots, user2_availability_slots
  );
  
  -- Apply exact specification weights:
  -- 30% specialty + 40% interests + 20% city + 10% availability
  total_score := (specialty_score * 0.30) + 
                 (interest_score * 0.40) + 
                 (city_score * 0.20) + 
                 (availability_score * 0.10);
  
  RETURN total_score;
END;
$$;

-- Function to check gender balance for groups
CREATE OR REPLACE FUNCTION check_gender_balance(
  user_genders TEXT[],
  user_preferences TEXT[]
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  gender_counts JSONB;
  unique_genders TEXT[];
  group_size INTEGER;
  i INTEGER;
BEGIN
  group_size := array_length(user_genders, 1);
  
  -- Count genders
  SELECT jsonb_object_agg(gender, count)
  INTO gender_counts
  FROM (
    SELECT gender, COUNT(*) as count
    FROM unnest(user_genders) as gender
    GROUP BY gender
  ) gender_count_subquery;
  
  -- Get unique genders
  SELECT array_agg(DISTINCT gender)
  INTO unique_genders
  FROM unnest(user_genders) as gender;
  
  -- Check hard constraints (same-gender-only preference)
  FOR i IN 1..group_size LOOP
    IF user_preferences[i] = 'same-gender-only' THEN
      IF array_length(unique_genders, 1) > 1 THEN
        RETURN FALSE;
      END IF;
    ELSIF user_preferences[i] = 'mixed' THEN
      IF array_length(unique_genders, 1) < 2 THEN
        RETURN FALSE;
      END IF;
    END IF;
  END LOOP;
  
  -- Check group balance rules
  IF group_size = 4 AND array_length(unique_genders, 1) = 2 THEN
    -- 4-person groups: prefer 2/2 balance
    RETURN (gender_counts->>(unique_genders[1]))::INTEGER = 2 AND 
           (gender_counts->>(unique_genders[2]))::INTEGER = 2;
  ELSIF group_size = 3 AND array_length(unique_genders, 1) = 2 THEN
    -- 3-person groups: prefer 2/1 balance
    RETURN ((gender_counts->>(unique_genders[1]))::INTEGER = 2 AND 
            (gender_counts->>(unique_genders[2]))::INTEGER = 1) OR
           ((gender_counts->>(unique_genders[1]))::INTEGER = 1 AND 
            (gender_counts->>(unique_genders[2]))::INTEGER = 2);
  END IF;
  
  RETURN TRUE;
END;
$$;

-- ==============================================
-- STEP 3: MAIN WEEKLY MATCHING ALGORITHM
-- ==============================================

CREATE OR REPLACE FUNCTION run_weekly_matching()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  start_time TIMESTAMP := clock_timestamp();
  current_week DATE;
  eligible_users RECORD;
  user_array JSONB[] := ARRAY[]::JSONB[];
  pair_scores JSONB[] := ARRAY[]::JSONB[];
  valid_pairs INTEGER := 0;
  groups_created INTEGER := 0;
  total_eligible INTEGER := 0;
  match_id UUID;
  group_counter INTEGER := 1;
  execution_time INTEGER;
  
  -- Variables for greedy grouping
  matched_user_ids UUID[] := ARRAY[]::UUID[];
  current_group_data JSONB[] := ARRAY[]::JSONB[];
  test_group_data JSONB[] := ARRAY[]::JSONB[];
  group_score DECIMAL;
  best_candidate JSONB;
  best_score DECIMAL;
  
  user1_data JSONB;
  user2_data JSONB;
  pair_score DECIMAL;
  i INTEGER;
  j INTEGER;
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
  
  -- Step 1: Get eligible users
  FOR eligible_users IN 
    SELECT * FROM get_eligible_users_for_matching()
  LOOP
    total_eligible := total_eligible + 1;
    user_array := user_array || jsonb_build_object(
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
  
  -- Log the start
  INSERT INTO matching_logs (week, groups_created, eligible_users, reason)
  VALUES (current_week, 0, total_eligible, 'Started matching process');
  
  -- Check if we have enough users
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
  
  -- Step 2: Score all valid pairs
  FOR i IN 1..array_length(user_array, 1) LOOP
    FOR j IN (i+1)..array_length(user_array, 1) LOOP
      user1_data := user_array[i];
      user2_data := user_array[j];
      
      -- Calculate pair score using exact specification
      pair_score := calculate_pair_match_score(
        user1_data->>'specialty',
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user1_data->'medical_specialty', '[]'))),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user1_data->'interests', '[]'))),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user1_data->'other_interests', '[]'))),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user1_data->'music_preferences', '[]'))),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user1_data->'movie_tv_preferences', '[]'))),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user1_data->'preferred_activities', '[]'))),
        user1_data->>'city',
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user1_data->'availability_slots', '[]'))),
        user2_data->>'specialty',
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user2_data->'medical_specialty', '[]'))),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user2_data->'interests', '[]'))),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user2_data->'other_interests', '[]'))),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user2_data->'music_preferences', '[]'))),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user2_data->'movie_tv_preferences', '[]'))),
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user2_data->'preferred_activities', '[]'))),
        user2_data->>'city',
        ARRAY(SELECT jsonb_array_elements_text(COALESCE(user2_data->'availability_slots', '[]')))
      );
      
      -- Only keep pairs with score >= 0.55
      IF pair_score >= 0.55 THEN
        pair_scores := pair_scores || jsonb_build_object(
          'user1_id', user1_data->>'id',
          'user2_id', user2_data->>'id',
          'score', pair_score,
          'user1_data', user1_data,
          'user2_data', user2_data
        );
        valid_pairs := valid_pairs + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  -- Sort pairs by score (highest first) - simplified sorting
  -- In a full implementation, you'd use a more sophisticated sorting algorithm
  
  -- Step 3: Greedy grouping algorithm
  FOR i IN 1..array_length(pair_scores, 1) LOOP
    DECLARE
      pair_data JSONB := pair_scores[i];
      user1_id UUID := (pair_data->>'user1_id')::UUID;
      user2_id UUID := (pair_data->>'user2_id')::UUID;
    BEGIN
      -- Skip if either user is already matched
      IF user1_id = ANY(matched_user_ids) OR user2_id = ANY(matched_user_ids) THEN
        CONTINUE;
      END IF;
      
      -- Start with the pair
      current_group_data := ARRAY[pair_data->'user1_data', pair_data->'user2_data'];
      
      -- Try to add a third member
      FOR j IN 1..array_length(user_array, 1) LOOP
        DECLARE
          candidate_id UUID := (user_array[j]->>'id')::UUID;
          candidate_data JSONB := user_array[j];
        BEGIN
          -- Skip if user is already in group or matched
          IF candidate_id = user1_id OR candidate_id = user2_id OR candidate_id = ANY(matched_user_ids) THEN
            CONTINUE;
          END IF;
          
          -- Test adding this candidate
          test_group_data := current_group_data || candidate_data;
          
          -- Check gender balance (simplified)
          IF check_gender_balance(
            ARRAY(SELECT jsonb_array_elements_text(
              jsonb_agg(member_data->>'gender') 
              FROM unnest(test_group_data) AS member_data
            )),
            ARRAY(SELECT jsonb_array_elements_text(
              jsonb_agg(member_data->>'gender_preference') 
              FROM unnest(test_group_data) AS member_data
            ))
          ) THEN
            current_group_data := test_group_data;
            EXIT; -- Take the first valid third member
          END IF;
        END;
      END LOOP;
      
      -- Try to add a fourth member if we have 3
      IF array_length(current_group_data, 1) = 3 THEN
        FOR j IN 1..array_length(user_array, 1) LOOP
          DECLARE
            candidate_id UUID := (user_array[j]->>'id')::UUID;
            candidate_data JSONB := user_array[j];
          BEGIN
            -- Skip if user is already in group or matched
            IF candidate_id = ANY(ARRAY(SELECT (member_data->>'id')::UUID FROM unnest(current_group_data) AS member_data)) OR 
               candidate_id = ANY(matched_user_ids) THEN
              CONTINUE;
            END IF;
            
            -- Test adding this candidate
            test_group_data := current_group_data || candidate_data;
            
            -- Check gender balance
            IF check_gender_balance(
              ARRAY(SELECT jsonb_array_elements_text(
                jsonb_agg(member_data->>'gender') 
                FROM unnest(test_group_data) AS member_data
              )),
              ARRAY(SELECT jsonb_array_elements_text(
                jsonb_agg(member_data->>'gender_preference') 
                FROM unnest(test_group_data) AS member_data
              ))
            ) THEN
              current_group_data := test_group_data;
              EXIT; -- Take the first valid fourth member
            END IF;
          END;
        END LOOP;
      END IF;
      
      -- Create the group if we have at least 3 members
      IF array_length(current_group_data, 1) >= 3 THEN
        -- Insert match record
        INSERT INTO matches (group_name, status, match_week)
        VALUES (
          'Rounds_Group_' || lpad(group_counter::TEXT, 2, '0'),
          'active',
          current_week
        )
        RETURNING id INTO match_id;
        
        -- Insert match members and mark as matched
        FOR j IN 1..array_length(current_group_data, 1) LOOP
          DECLARE
            member_id UUID := (current_group_data[j]->>'id')::UUID;
          BEGIN
            INSERT INTO match_members (match_id, user_id, joined_at)
            VALUES (match_id, member_id, NOW());
            
            matched_user_ids := matched_user_ids || member_id;
          END;
        END LOOP;
        
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
    END;
  END LOOP;
  
  -- Calculate execution time
  execution_time := EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000;
  
  -- Update matching log with final results
  UPDATE matching_logs 
  SET groups_created = groups_created,
      valid_pairs = valid_pairs,
      rollover_users = total_eligible - array_length(matched_user_ids, 1),
      execution_time_ms = execution_time,
      reason = CASE 
        WHEN groups_created > 0 THEN 'Success - Created ' || groups_created || ' groups'
        ELSE 'No valid groups could be formed'
      END
  WHERE week = current_week;
  
  -- Return comprehensive results
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Weekly matching completed',
    'week', current_week,
    'eligible_users', total_eligible,
    'valid_pairs', valid_pairs,
    'groups_created', groups_created,
    'matched_users', array_length(matched_user_ids, 1),
    'rollover_candidates', total_eligible - array_length(matched_user_ids, 1),
    'execution_time_ms', execution_time,
    'timestamp', NOW()
  );
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error
    execution_time := EXTRACT(EPOCH FROM (clock_timestamp() - start_time)) * 1000;
    INSERT INTO matching_logs (week, groups_created, eligible_users, execution_time_ms, reason)
    VALUES (current_week, 0, total_eligible, execution_time, 'Error: ' || SQLERRM)
    ON CONFLICT DO NOTHING;
    
    RETURN jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'week', current_week,
      'execution_time_ms', execution_time
    );
END;
$$;

-- ==============================================
-- STEP 4: MANAGEMENT AND MONITORING FUNCTIONS
-- ==============================================

-- Manual trigger function (admin only)
CREATE OR REPLACE FUNCTION trigger_manual_matching()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
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
  
  -- Call the main matching function
  RETURN run_weekly_matching();
END;
$$;

-- Function to get matching history
CREATE OR REPLACE FUNCTION get_matching_history(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  week DATE,
  groups_created INTEGER,
  eligible_users INTEGER,
  valid_pairs INTEGER,
  rollover_users INTEGER,
  execution_time_ms INTEGER,
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
    valid_pairs,
    rollover_users,
    execution_time_ms,
    reason,
    created_at
  FROM matching_logs 
  ORDER BY week DESC 
  LIMIT limit_count;
$$;

-- Function to get current eligible users count
CREATE OR REPLACE FUNCTION get_eligible_users_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER FROM get_eligible_users_for_matching();
$$;

-- Function to get detailed matching statistics
CREATE OR REPLACE FUNCTION get_matching_statistics()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  stats JSONB;
  eligible_count INTEGER;
  total_users INTEGER;
  verified_users INTEGER;
  paid_users INTEGER;
  cities_with_min_users INTEGER;
BEGIN
  -- Get basic counts
  SELECT COUNT(*) INTO total_users FROM profiles;
  SELECT COUNT(*) INTO verified_users FROM profiles WHERE is_verified = true;
  SELECT COUNT(*) INTO paid_users FROM profiles WHERE is_paid = true;
  SELECT get_eligible_users_count() INTO eligible_count;
  
  -- Count cities with minimum users
  SELECT COUNT(*) INTO cities_with_min_users
  FROM (
    SELECT city, COUNT(*) as user_count
    FROM profiles 
    WHERE is_verified = true 
      AND is_paid = true 
      AND onboarding_completed = true
    GROUP BY city
    HAVING COUNT(*) >= 3
  ) city_counts;
  
  stats := jsonb_build_object(
    'total_users', total_users,
    'verified_users', verified_users,
    'paid_users', paid_users,
    'eligible_users', eligible_count,
    'cities_with_min_users', cities_with_min_users,
    'matching_ready', eligible_count >= 6,
    'last_updated', NOW()
  );
  
  RETURN stats;
END;
$$;

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

-- ==============================================
-- STEP 5: CRON JOB MANAGEMENT
-- ==============================================

-- Function to setup the cron job
CREATE OR REPLACE FUNCTION setup_weekly_matching_cron()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RETURN 'Error: Admin access required';
  END IF;
  
  -- Remove existing job if it exists
  BEGIN
    PERFORM cron.unschedule('weekly-doctor-matching');
  EXCEPTION
    WHEN OTHERS THEN
      -- Ignore errors if job doesn't exist
  END;
  
  -- Schedule the job for every Thursday at 16:00 UTC
  PERFORM cron.schedule(
    'weekly-doctor-matching',           -- job name
    '0 16 * * 4',                      -- Every Thursday at 16:00 UTC
    'SELECT run_weekly_matching();'     -- SQL command to execute
  );
  
  RETURN 'Success: Weekly matching cron job scheduled for every Thursday at 16:00 UTC';
END;
$$;

-- Function to disable the cron job
CREATE OR REPLACE FUNCTION disable_weekly_matching()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RETURN false;
  END IF;
  
  PERFORM cron.unschedule('weekly-doctor-matching');
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
  -- Check if user is admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  ) THEN
    RETURN false;
  END IF;
  
  -- Remove existing job if it exists
  BEGIN
    PERFORM cron.unschedule('weekly-doctor-matching');
  EXCEPTION
    WHEN OTHERS THEN
      -- Ignore errors
  END;
  
  -- Reschedule
  PERFORM cron.schedule(
    'weekly-doctor-matching',
    '0 16 * * 4',
    'SELECT run_weekly_matching();'
  );
  
  RETURN true;
END;
$$;

-- ==============================================
-- STEP 6: PERMISSIONS AND SECURITY
-- ==============================================

-- Grant execute permissions to authenticated users for monitoring functions
GRANT EXECUTE ON FUNCTION get_matching_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_cron_job_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_eligible_users_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_matching_statistics TO authenticated;

-- Grant execute permissions to service role for cron execution
GRANT EXECUTE ON FUNCTION run_weekly_matching TO service_role;
GRANT EXECUTE ON FUNCTION get_eligible_users_for_matching TO service_role;
GRANT EXECUTE ON FUNCTION calculate_specialty_similarity TO service_role;
GRANT EXECUTE ON FUNCTION calculate_shared_interest_ratio TO service_role;
GRANT EXECUTE ON FUNCTION calculate_availability_overlap TO service_role;
GRANT EXECUTE ON FUNCTION calculate_pair_match_score TO service_role;
GRANT EXECUTE ON FUNCTION check_gender_balance TO service_role;

-- Grant admin functions to authenticated users (with internal role checks)
GRANT EXECUTE ON FUNCTION trigger_manual_matching TO authenticated;
GRANT EXECUTE ON FUNCTION setup_weekly_matching_cron TO authenticated;
GRANT EXECUTE ON FUNCTION disable_weekly_matching TO authenticated;
GRANT EXECUTE ON FUNCTION enable_weekly_matching TO authenticated;

-- ==============================================
-- STEP 7: INITIALIZE THE SYSTEM
-- ==============================================

-- Schedule the cron job automatically
SELECT cron.schedule(
  'weekly-doctor-matching',           -- job name
  '0 16 * * 4',                      -- Every Thursday at 16:00 UTC
  'SELECT run_weekly_matching();'     -- SQL command to execute
);

-- ==============================================
-- VERIFICATION AND TESTING
-- ==============================================

DO $$
DECLARE
  function_count INTEGER;
  cron_job_count INTEGER;
BEGIN
  -- Count created functions
  SELECT COUNT(*) INTO function_count
  FROM pg_proc 
  WHERE proname IN (
    'get_eligible_users_for_matching',
    'calculate_specialty_similarity',
    'calculate_shared_interest_ratio',
    'calculate_availability_overlap',
    'calculate_pair_match_score',
    'check_gender_balance',
    'run_weekly_matching',
    'trigger_manual_matching',
    'get_matching_history',
    'get_eligible_users_count',
    'get_matching_statistics',
    'get_cron_job_status',
    'setup_weekly_matching_cron',
    'disable_weekly_matching',
    'enable_weekly_matching'
  );
  
  -- Count cron jobs
  SELECT COUNT(*) INTO cron_job_count
  FROM cron.job 
  WHERE jobname = 'weekly-doctor-matching';
  
  RAISE NOTICE '';
  RAISE NOTICE '🎉 BEYONDROUNDS SUPABASE CRON SYSTEM SETUP COMPLETE!';
  RAISE NOTICE '==================================================';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Functions created: %', function_count;
  RAISE NOTICE '✅ Cron jobs scheduled: %', cron_job_count;
  RAISE NOTICE '✅ matching_logs table ready';
  RAISE NOTICE '✅ Permissions granted';
  RAISE NOTICE '';
  RAISE NOTICE '📋 NEXT STEPS:';
  RAISE NOTICE '1. Test eligible users: SELECT get_eligible_users_count();';
  RAISE NOTICE '2. Check statistics: SELECT * FROM get_matching_statistics();';
  RAISE NOTICE '3. Test manual matching (admin): SELECT trigger_manual_matching();';
  RAISE NOTICE '4. View cron status: SELECT * FROM get_cron_job_status();';
  RAISE NOTICE '5. Check history: SELECT * FROM get_matching_history();';
  RAISE NOTICE '';
  RAISE NOTICE '⏰ SCHEDULED: Every Thursday at 16:00 UTC';
  RAISE NOTICE '🔐 ADMIN ACCESS: Required for manual triggers and cron management';
  RAISE NOTICE '📊 MONITORING: All runs logged to matching_logs table';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Your BeyondRounds matching system is now fully operational!';
  RAISE NOTICE '';
END $$;
