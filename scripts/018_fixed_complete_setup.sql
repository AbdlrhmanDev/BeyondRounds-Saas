-- ========================================
-- FIXED COMPLETE SUPABASE CRON SETUP + ADMIN FIX
-- ========================================
-- This script handles existing functions properly by dropping and recreating them

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ========================================
-- STEP 1: DROP EXISTING FUNCTIONS (if they exist)
-- ========================================

-- Drop functions in reverse dependency order
DROP FUNCTION IF EXISTS trigger_manual_matching();
DROP FUNCTION IF EXISTS run_weekly_matching();
DROP FUNCTION IF EXISTS get_system_readiness();
DROP FUNCTION IF EXISTS log_matching_result(INT, INT, INT, INT, INT, JSONB);
DROP FUNCTION IF EXISTS send_welcome_message(UUID);
DROP FUNCTION IF EXISTS insert_match_records(UUID, UUID[], DECIMAL);
DROP FUNCTION IF EXISTS create_groups_greedy();
DROP FUNCTION IF EXISTS calculate_group_average_score(UUID[]);
DROP FUNCTION IF EXISTS has_good_gender_balance(UUID[]);
DROP FUNCTION IF EXISTS get_valid_pairs();
DROP FUNCTION IF EXISTS calculate_pair_match_score(UUID, UUID);
DROP FUNCTION IF EXISTS calculate_availability_overlap_ratio(TEXT[], TEXT[]);
DROP FUNCTION IF EXISTS calculate_shared_interests_ratio(TEXT[], TEXT[]);
DROP FUNCTION IF EXISTS calculate_specialty_similarity(TEXT, TEXT);
DROP FUNCTION IF EXISTS get_eligible_users();

-- ========================================
-- STEP 2: RECREATE ALL MATCHING FUNCTIONS
-- ========================================

-- Function 1: Get eligible users
CREATE OR REPLACE FUNCTION get_eligible_users()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    specialty TEXT,
    city TEXT,
    gender TEXT,
    gender_preference TEXT,
    interests TEXT[],
    availability_slots TEXT[],
    created_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.email,
        p.first_name,
        p.last_name,
        p.specialty,
        p.city,
        p.gender,
        p.gender_preference,
        p.interests,
        p.availability_slots,
        p.created_at
    FROM profiles p
    WHERE p.is_verified = true
      AND p.is_paid = true
      AND p.onboarding_completed = true
      AND p.created_at < (CURRENT_DATE + INTERVAL '12 hours') -- Before Thursday 12:00
      AND p.id NOT IN (
          -- Exclude users matched in the past 6 weeks
          SELECT DISTINCT mm.user_id
          FROM match_members mm
          JOIN matches m ON mm.match_id = m.id
          WHERE m.match_week > (CURRENT_DATE - INTERVAL '6 weeks')
      )
      AND p.city IN (
          -- Only cities with 3+ eligible users
          SELECT city
          FROM profiles p2
          WHERE p2.is_verified = true
            AND p2.is_paid = true
            AND p2.onboarding_completed = true
            AND p2.created_at < (CURRENT_DATE + INTERVAL '12 hours')
          GROUP BY city
          HAVING COUNT(*) >= 3
      );
END;
$$;

-- Function 2: Calculate specialty similarity
CREATE OR REPLACE FUNCTION calculate_specialty_similarity(specialty1 TEXT, specialty2 TEXT)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
    specialty_domains TEXT[][] := ARRAY[
        ARRAY['Internal Medicine', 'Family Medicine', 'General Practice'],
        ARRAY['Cardiology', 'Cardiac Surgery'],
        ARRAY['Neurology', 'Neurosurgery'],
        ARRAY['Orthopedics', 'Sports Medicine'],
        ARRAY['Pediatrics', 'Neonatology'],
        ARRAY['Obstetrics', 'Gynecology'],
        ARRAY['Psychiatry', 'Psychology'],
        ARRAY['Radiology', 'Nuclear Medicine'],
        ARRAY['Anesthesiology', 'Pain Management'],
        ARRAY['Emergency Medicine', 'Critical Care']
    ];
    domain TEXT[];
BEGIN
    -- Exact match
    IF specialty1 = specialty2 THEN
        RETURN 1.0;
    END IF;
    
    -- Check if in same domain
    FOREACH domain SLICE 1 IN ARRAY specialty_domains LOOP
        IF specialty1 = ANY(domain) AND specialty2 = ANY(domain) THEN
            RETURN 0.5;
        END IF;
    END LOOP;
    
    -- No similarity
    RETURN 0.0;
END;
$$;

-- Function 3: Calculate shared interests ratio
CREATE OR REPLACE FUNCTION calculate_shared_interests_ratio(interests1 TEXT[], interests2 TEXT[])
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
    shared_count INT;
    total_unique_count INT;
BEGIN
    -- Count shared interests
    SELECT COUNT(*)
    INTO shared_count
    FROM unnest(interests1) AS i1
    WHERE i1 = ANY(interests2);
    
    -- Count total unique interests
    SELECT COUNT(DISTINCT interest)
    INTO total_unique_count
    FROM (
        SELECT unnest(interests1) AS interest
        UNION
        SELECT unnest(interests2) AS interest
    ) combined;
    
    -- Return ratio
    IF total_unique_count = 0 THEN
        RETURN 0.0;
    END IF;
    
    RETURN shared_count::DECIMAL / total_unique_count::DECIMAL;
END;
$$;

-- Function 4: Calculate availability overlap ratio
CREATE OR REPLACE FUNCTION calculate_availability_overlap_ratio(availability1 TEXT[], availability2 TEXT[])
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
    shared_count INT;
    total_unique_count INT;
BEGIN
    -- Count shared availability slots
    SELECT COUNT(*)
    INTO shared_count
    FROM unnest(availability1) AS a1
    WHERE a1 = ANY(availability2);
    
    -- Count total unique slots
    SELECT COUNT(DISTINCT slot)
    INTO total_unique_count
    FROM (
        SELECT unnest(availability1) AS slot
        UNION
        SELECT unnest(availability2) AS slot
    ) combined;
    
    -- Return ratio
    IF total_unique_count = 0 THEN
        RETURN 0.0;
    END IF;
    
    RETURN shared_count::DECIMAL / total_unique_count::DECIMAL;
END;
$$;

-- Function 5: Calculate pair match score
CREATE OR REPLACE FUNCTION calculate_pair_match_score(
    user1_id UUID,
    user2_id UUID
)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
    user1_record RECORD;
    user2_record RECORD;
    specialty_sim DECIMAL;
    interests_ratio DECIMAL;
    same_city DECIMAL;
    availability_ratio DECIMAL;
    match_score DECIMAL;
BEGIN
    -- Get user records
    SELECT * INTO user1_record FROM get_eligible_users() WHERE user_id = user1_id;
    SELECT * INTO user2_record FROM get_eligible_users() WHERE user_id = user2_id;
    
    -- Calculate components
    specialty_sim := calculate_specialty_similarity(user1_record.specialty, user2_record.specialty);
    interests_ratio := calculate_shared_interests_ratio(user1_record.interests, user2_record.interests);
    same_city := CASE WHEN user1_record.city = user2_record.city THEN 1.0 ELSE 0.0 END;
    availability_ratio := calculate_availability_overlap_ratio(user1_record.availability_slots, user2_record.availability_slots);
    
    -- Calculate weighted score
    match_score := 0.30 * specialty_sim + 0.40 * interests_ratio + 0.20 * same_city + 0.10 * availability_ratio;
    
    RETURN match_score;
END;
$$;

-- Function 6: Get valid pairs
CREATE OR REPLACE FUNCTION get_valid_pairs()
RETURNS TABLE (
    user1_id UUID,
    user2_id UUID,
    match_score DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
    user1_record RECORD;
    user2_record RECORD;
    score DECIMAL;
BEGIN
    FOR user1_record IN SELECT * FROM get_eligible_users() LOOP
        FOR user2_record IN SELECT * FROM get_eligible_users() WHERE user_id > user1_record.user_id LOOP
            score := calculate_pair_match_score(user1_record.user_id, user2_record.user_id);
            
            IF score >= 0.55 THEN
                user1_id := user1_record.user_id;
                user2_id := user2_record.user_id;
                match_score := score;
                RETURN NEXT;
            END IF;
        END LOOP;
    END LOOP;
END;
$$;

-- Function 7: Check gender balance
CREATE OR REPLACE FUNCTION has_good_gender_balance(user_ids UUID[])
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    male_count INT := 0;
    female_count INT := 0;
    nonbinary_count INT := 0;
    user_id UUID;
    user_gender TEXT;
    total_users INT;
BEGIN
    total_users := array_length(user_ids, 1);
    
    FOREACH user_id IN ARRAY user_ids LOOP
        SELECT gender INTO user_gender FROM profiles WHERE id = user_id;
        
        CASE user_gender
            WHEN 'male' THEN male_count := male_count + 1;
            WHEN 'female' THEN female_count := female_count + 1;
            ELSE nonbinary_count := nonbinary_count + 1;
        END CASE;
    END LOOP;
    
    -- 3-person group: 2-1 balance acceptable
    IF total_users = 3 THEN
        RETURN (male_count = 2 AND female_count = 1) OR 
               (male_count = 1 AND female_count = 2) OR
               (nonbinary_count > 0);
    END IF;
    
    -- 4-person group: 2-2 balance preferred, but 3-1 acceptable
    IF total_users = 4 THEN
        RETURN (male_count = 2 AND female_count = 2) OR
               (male_count = 3 AND female_count = 1) OR
               (male_count = 1 AND female_count = 3) OR
               (nonbinary_count > 0);
    END IF;
    
    RETURN FALSE;
END;
$$;

-- Function 8: Calculate group average score
CREATE OR REPLACE FUNCTION calculate_group_average_score(user_ids UUID[])
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
DECLARE
    total_score DECIMAL := 0;
    pair_count INT := 0;
    i INT;
    j INT;
    score DECIMAL;
BEGIN
    FOR i IN 1..array_length(user_ids, 1) LOOP
        FOR j IN (i+1)..array_length(user_ids, 1) LOOP
            score := calculate_pair_match_score(user_ids[i], user_ids[j]);
            total_score := total_score + score;
            pair_count := pair_count + 1;
        END LOOP;
    END LOOP;
    
    IF pair_count = 0 THEN
        RETURN 0.0;
    END IF;
    
    RETURN total_score / pair_count;
END;
$$;

-- Function 9: Create groups using greedy algorithm
CREATE OR REPLACE FUNCTION create_groups_greedy()
RETURNS TABLE (
    group_id UUID,
    user_ids UUID[],
    average_score DECIMAL
)
LANGUAGE plpgsql
AS $$
DECLARE
    pair_record RECORD;
    used_users UUID[] := '{}';
    current_group UUID[];
    potential_user UUID;
    best_score DECIMAL;
    test_score DECIMAL;
    eligible_users_for_expansion UUID[];
BEGIN
    -- Get all valid pairs ordered by score
    FOR pair_record IN 
        SELECT * FROM get_valid_pairs() 
        ORDER BY match_score DESC
    LOOP
        -- Skip if either user is already used
        IF pair_record.user1_id = ANY(used_users) OR pair_record.user2_id = ANY(used_users) THEN
            CONTINUE;
        END IF;
        
        -- Start new group with this pair
        current_group := ARRAY[pair_record.user1_id, pair_record.user2_id];
        
        -- Try to expand to 3-4 members
        FOR expansion_round IN 1..2 LOOP
            best_score := 0;
            potential_user := NULL;
            
            -- Get eligible users not yet in group or used
            SELECT ARRAY(
                SELECT u.user_id 
                FROM get_eligible_users() u
                WHERE u.user_id != ALL(current_group)
                  AND u.user_id != ALL(used_users)
            ) INTO eligible_users_for_expansion;
            
            -- Find best user to add
            FOREACH potential_user IN ARRAY eligible_users_for_expansion LOOP
                test_score := calculate_group_average_score(current_group || potential_user);
                
                IF test_score >= 0.55 AND test_score > best_score THEN
                    best_score := test_score;
                END IF;
            END LOOP;
            
            -- Add best user if found
            IF best_score > 0 THEN
                FOREACH potential_user IN ARRAY eligible_users_for_expansion LOOP
                    test_score := calculate_group_average_score(current_group || potential_user);
                    
                    IF test_score = best_score AND has_good_gender_balance(current_group || potential_user) THEN
                        current_group := current_group || potential_user;
                        EXIT;
                    END IF;
                END LOOP;
            ELSE
                EXIT; -- No good additions found
            END IF;
        END LOOP;
        
        -- Finalize group if it meets criteria
        IF array_length(current_group, 1) >= 3 AND 
           calculate_group_average_score(current_group) >= 0.55 AND
           has_good_gender_balance(current_group) THEN
            
            group_id := uuid_generate_v4();
            user_ids := current_group;
            average_score := calculate_group_average_score(current_group);
            used_users := used_users || current_group;
            
            RETURN NEXT;
        END IF;
    END LOOP;
END;
$$;

-- Function 10: Insert match records
CREATE OR REPLACE FUNCTION insert_match_records(
    p_group_id UUID,
    p_user_ids UUID[],
    p_average_score DECIMAL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    match_id UUID;
    user_id UUID;
    group_name TEXT;
BEGIN
    -- Generate group name
    group_name := 'Rounds_Group_' || EXTRACT(WEEK FROM CURRENT_DATE) || '_' || 
                  substring(p_group_id::text from 1 for 8);
    
    -- Insert match record
    INSERT INTO matches (id, group_name, created_at, match_week, status)
    VALUES (p_group_id, group_name, NOW(), CURRENT_DATE, 'active')
    RETURNING id INTO match_id;
    
    -- Insert match members
    FOREACH user_id IN ARRAY p_user_ids LOOP
        INSERT INTO match_members (id, match_id, user_id, joined_at)
        VALUES (uuid_generate_v4(), match_id, user_id, NOW());
    END LOOP;
    
    RETURN match_id;
END;
$$;

-- Function 11: Send welcome message
CREATE OR REPLACE FUNCTION send_welcome_message(p_match_id UUID)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    welcome_message TEXT;
BEGIN
    welcome_message := '👋 Welcome to your Rounds group! Feel free to introduce yourselves — your shared interests made this match possible.';
    
    INSERT INTO chat_messages (id, match_id, user_id, content, message_type, created_at)
    VALUES (uuid_generate_v4(), p_match_id, NULL, welcome_message, 'system', NOW());
END;
$$;

-- Function 12: Log matching results
CREATE OR REPLACE FUNCTION log_matching_result(
    p_total_eligible INT,
    p_groups_created INT,
    p_users_matched INT,
    p_users_unmatched INT,
    p_execution_time_ms INT,
    p_details JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO matching_logs (
        id, 
        execution_date, 
        total_eligible_users, 
        groups_created, 
        users_matched, 
        users_unmatched, 
        execution_time_ms,
        details,
        created_at
    ) VALUES (
        uuid_generate_v4(),
        CURRENT_DATE,
        p_total_eligible,
        p_groups_created,
        p_users_matched,
        p_users_unmatched,
        p_execution_time_ms,
        p_details,
        NOW()
    );
END;
$$;

-- Function 13: Get system readiness
CREATE OR REPLACE FUNCTION get_system_readiness()
RETURNS TABLE (
    is_ready BOOLEAN,
    eligible_users_count INT,
    cities_with_min_users INT,
    min_required_users INT,
    min_required_cities INT
)
LANGUAGE plpgsql
AS $$
DECLARE
    eligible_count INT;
    cities_count INT;
BEGIN
    -- Count eligible users
    SELECT COUNT(*) INTO eligible_count FROM get_eligible_users();
    
    -- Count cities with 3+ eligible users
    SELECT COUNT(*) INTO cities_count
    FROM (
        SELECT city
        FROM get_eligible_users()
        GROUP BY city
        HAVING COUNT(*) >= 3
    ) city_counts;
    
    -- Return readiness status
    is_ready := eligible_count >= 6 AND cities_count >= 2;
    eligible_users_count := eligible_count;
    cities_with_min_users := cities_count;
    min_required_users := 6;
    min_required_cities := 2;
    
    RETURN NEXT;
END;
$$;

-- Function 14: Trigger manual matching (admin only)
CREATE OR REPLACE FUNCTION trigger_manual_matching()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_user_role TEXT;
    result JSONB;
BEGIN
    -- Check if user is admin
    SELECT role INTO current_user_role 
    FROM profiles 
    WHERE id = auth.uid();
    
    IF current_user_role != 'admin' THEN
        RAISE EXCEPTION 'Unauthorized - Admin access required';
    END IF;
    
    -- Run the matching
    SELECT run_weekly_matching() INTO result;
    
    RETURN result;
END;
$$;

-- Function 15: Main weekly matching function
CREATE OR REPLACE FUNCTION run_weekly_matching()
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    execution_time_ms INT;
    eligible_users_count INT;
    groups_created INT := 0;
    users_matched INT := 0;
    users_unmatched INT;
    group_record RECORD;
    match_id UUID;
    result JSONB;
    readiness_check RECORD;
BEGIN
    start_time := clock_timestamp();
    
    -- Check system readiness
    SELECT * INTO readiness_check FROM get_system_readiness();
    
    IF NOT readiness_check.is_ready THEN
        result := jsonb_build_object(
            'success', false,
            'message', 'System not ready for matching',
            'eligible_users', readiness_check.eligible_users_count,
            'cities_with_min_users', readiness_check.cities_with_min_users,
            'requirements', jsonb_build_object(
                'min_users', readiness_check.min_required_users,
                'min_cities', readiness_check.min_required_cities
            )
        );
        
        -- Log the attempt
        PERFORM log_matching_result(
            readiness_check.eligible_users_count,
            0,
            0,
            readiness_check.eligible_users_count,
            0,
            result
        );
        
        RETURN result;
    END IF;
    
    eligible_users_count := readiness_check.eligible_users_count;
    
    -- Create groups
    FOR group_record IN SELECT * FROM create_groups_greedy() LOOP
        match_id := insert_match_records(
            group_record.group_id,
            group_record.user_ids,
            group_record.average_score
        );
        
        PERFORM send_welcome_message(match_id);
        
        groups_created := groups_created + 1;
        users_matched := users_matched + array_length(group_record.user_ids, 1);
    END LOOP;
    
    users_unmatched := eligible_users_count - users_matched;
    
    end_time := clock_timestamp();
    execution_time_ms := EXTRACT(EPOCH FROM (end_time - start_time)) * 1000;
    
    -- Build result
    result := jsonb_build_object(
        'success', true,
        'execution_date', CURRENT_DATE,
        'eligible_users', eligible_users_count,
        'groups_created', groups_created,
        'users_matched', users_matched,
        'users_unmatched', users_unmatched,
        'execution_time_ms', execution_time_ms
    );
    
    -- Log the result
    PERFORM log_matching_result(
        eligible_users_count,
        groups_created,
        users_matched,
        users_unmatched,
        execution_time_ms,
        result
    );
    
    RETURN result;
END;
$$;

-- ========================================
-- STEP 3: CREATE REQUIRED TABLES (if not exist)
-- ========================================

-- Create matching_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS matching_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_date DATE NOT NULL,
    total_eligible_users INT NOT NULL,
    groups_created INT NOT NULL,
    users_matched INT NOT NULL,
    users_unmatched INT NOT NULL,
    execution_time_ms INT NOT NULL,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- STEP 4: SET UP CRON JOB
-- ========================================

-- Remove existing cron job if it exists
SELECT cron.unschedule('weekly-doctor-matching');

-- Schedule the weekly matching for Thursday at 4:00 PM
SELECT cron.schedule(
    'weekly-doctor-matching',
    '0 16 * * 4',
    'SELECT run_weekly_matching();'
);

-- ========================================
-- STEP 5: SET CURRENT USER AS ADMIN
-- ========================================

-- Update current user to be admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = auth.uid();

-- ========================================
-- STEP 6: VERIFICATION AND TESTING
-- ========================================

-- Check current user status
SELECT 
    auth.uid() as user_id,
    email,
    role,
    first_name,
    last_name,
    '✅ User is now admin and can test matching' as status
FROM profiles 
WHERE id = auth.uid();

-- Check system readiness
SELECT 
    is_ready,
    eligible_users_count,
    cities_with_min_users,
    CASE 
        WHEN is_ready THEN '🎉 System is ready for matching!'
        ELSE '⚠️  System needs more users: ' || min_required_users || ' users in ' || min_required_cities || ' cities'
    END as readiness_message
FROM get_system_readiness();

-- Show CRON job status
SELECT 
    '✅ CRON job scheduled successfully!' as cron_status,
    'Runs every Thursday at 4:00 PM' as schedule,
    'Functions installed and ready' as functions_status;

-- Final success message
SELECT 
    '🎉 SETUP COMPLETE!' as status,
    'You can now test with: SELECT trigger_manual_matching();' as next_step;

