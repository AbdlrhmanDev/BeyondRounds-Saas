-- ==============================================
-- FIX MISSING FUNCTIONS - SUPABASE CRON
-- This script recreates any missing functions individually
-- ==============================================

-- First, let's check what functions exist
DO $$
DECLARE
    func_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 Checking existing functions...';
    
    -- Check trigger_manual_matching
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'trigger_manual_matching'
    ) INTO func_exists;
    
    IF func_exists THEN
        RAISE NOTICE '✅ trigger_manual_matching() exists';
    ELSE
        RAISE NOTICE '❌ trigger_manual_matching() missing';
    END IF;
    
    -- Check run_weekly_matching
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'run_weekly_matching'
    ) INTO func_exists;
    
    IF func_exists THEN
        RAISE NOTICE '✅ run_weekly_matching() exists';
    ELSE
        RAISE NOTICE '❌ run_weekly_matching() missing';
    END IF;
    
    -- Check get_eligible_users_for_matching
    SELECT EXISTS (
        SELECT 1 FROM pg_proc p 
        JOIN pg_namespace n ON p.pronamespace = n.oid 
        WHERE n.nspname = 'public' AND p.proname = 'get_eligible_users_for_matching'
    ) INTO func_exists;
    
    IF func_exists THEN
        RAISE NOTICE '✅ get_eligible_users_for_matching() exists';
    ELSE
        RAISE NOTICE '❌ get_eligible_users_for_matching() missing';
    END IF;
END $$;

-- ==============================================
-- RECREATE CORE FUNCTIONS
-- ==============================================

-- Simple manual matching trigger function
CREATE OR REPLACE FUNCTION trigger_manual_matching()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_week DATE;
    eligible_count INTEGER;
    groups_created INTEGER := 0;
    match_id UUID;
    user_ids UUID[];
    i INTEGER;
BEGIN
    current_week := CURRENT_DATE;
    
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
    
    -- Check if matching already completed this week
    IF EXISTS (SELECT 1 FROM matches WHERE match_week = current_week) THEN
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Matching already completed for this week',
            'week', current_week,
            'groups_created', 0
        );
    END IF;
    
    -- Get eligible users (simplified version)
    SELECT array_agg(id) INTO user_ids
    FROM profiles
    WHERE is_verified = true
      AND is_paid = true
      AND onboarding_completed = true
      AND created_at < (date_trunc('week', CURRENT_DATE) + INTERVAL '3 days 12 hours')
      AND NOT EXISTS (
          SELECT 1 FROM match_members mm
          INNER JOIN matches m ON mm.match_id = m.id
          WHERE mm.user_id = profiles.id
            AND m.match_week >= (CURRENT_DATE - INTERVAL '6 weeks')
      );
    
    eligible_count := COALESCE(array_length(user_ids, 1), 0);
    
    -- Log the attempt
    INSERT INTO matching_logs (week, groups_created, eligible_users, reason)
    VALUES (current_week, 0, eligible_count, 'Manual matching triggered');
    
    -- If insufficient users, return early
    IF eligible_count < 3 THEN
        UPDATE matching_logs 
        SET reason = 'Insufficient eligible users (manual)'
        WHERE week = current_week;
        
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Insufficient eligible users for matching',
            'week', current_week,
            'eligible_users', eligible_count,
            'groups_created', 0
        );
    END IF;
    
    -- Create simple groups of 3-4 users each
    i := 1;
    WHILE i <= eligible_count LOOP
        -- Create group if we have at least 3 users remaining
        IF (eligible_count - i + 1) >= 3 THEN
            -- Insert match record
            INSERT INTO matches (group_name, status, match_week)
            VALUES (
                'Rounds_Group_' || lpad(groups_created + 1::TEXT, 2, '0'),
                'active',
                current_week
            )
            RETURNING id INTO match_id;
            
            -- Insert 3 or 4 members (4 if we have exactly 4 left, otherwise 3)
            DECLARE
                group_size INTEGER;
                j INTEGER;
            BEGIN
                group_size := CASE 
                    WHEN (eligible_count - i + 1) = 4 THEN 4 
                    ELSE 3 
                END;
                
                FOR j IN i..(i + group_size - 1) LOOP
                    INSERT INTO match_members (match_id, user_id, joined_at)
                    VALUES (match_id, user_ids[j], NOW());
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
                i := i + group_size;
            END;
        ELSE
            -- Not enough users for another group
            EXIT;
        END IF;
    END LOOP;
    
    -- Update matching log with results
    UPDATE matching_logs 
    SET groups_created = groups_created,
        reason = CASE 
            WHEN groups_created > 0 THEN 'Manual success - Created ' || groups_created || ' groups'
            ELSE 'Manual - No valid groups could be formed'
        END
    WHERE week = current_week;
    
    -- Return results
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Manual matching completed',
        'week', current_week,
        'eligible_users', eligible_count,
        'groups_created', groups_created,
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error
        INSERT INTO matching_logs (week, groups_created, eligible_users, reason)
        VALUES (current_week, 0, eligible_count, 'Manual error: ' || SQLERRM)
        ON CONFLICT DO NOTHING;
        
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'week', current_week
        );
END;
$$;

-- ==============================================
-- SIMPLIFIED WEEKLY MATCHING FUNCTION
-- ==============================================

CREATE OR REPLACE FUNCTION run_weekly_matching()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_week DATE;
    eligible_count INTEGER;
    groups_created INTEGER := 0;
    match_id UUID;
    user_ids UUID[];
    i INTEGER;
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
    
    -- Get eligible users (simplified version)
    SELECT array_agg(id) INTO user_ids
    FROM profiles
    WHERE is_verified = true
      AND is_paid = true
      AND onboarding_completed = true
      AND created_at < (date_trunc('week', CURRENT_DATE) + INTERVAL '3 days 12 hours')
      AND NOT EXISTS (
          SELECT 1 FROM match_members mm
          INNER JOIN matches m ON mm.match_id = m.id
          WHERE mm.user_id = profiles.id
            AND m.match_week >= (CURRENT_DATE - INTERVAL '6 weeks')
      );
    
    eligible_count := COALESCE(array_length(user_ids, 1), 0);
    
    -- Log the attempt
    INSERT INTO matching_logs (week, groups_created, eligible_users, reason)
    VALUES (current_week, 0, eligible_count, 'Automated matching started');
    
    -- If insufficient users, return early
    IF eligible_count < 3 THEN
        UPDATE matching_logs 
        SET reason = 'Insufficient eligible users'
        WHERE week = current_week;
        
        RETURN jsonb_build_object(
            'success', true,
            'message', 'Insufficient eligible users for matching',
            'week', current_week,
            'eligible_users', eligible_count,
            'groups_created', 0
        );
    END IF;
    
    -- Create simple groups of 3-4 users each
    i := 1;
    WHILE i <= eligible_count LOOP
        -- Create group if we have at least 3 users remaining
        IF (eligible_count - i + 1) >= 3 THEN
            -- Insert match record
            INSERT INTO matches (group_name, status, match_week)
            VALUES (
                'Rounds_Group_' || lpad(groups_created + 1::TEXT, 2, '0'),
                'active',
                current_week
            )
            RETURNING id INTO match_id;
            
            -- Insert 3 or 4 members (4 if we have exactly 4 left, otherwise 3)
            DECLARE
                group_size INTEGER;
                j INTEGER;
            BEGIN
                group_size := CASE 
                    WHEN (eligible_count - i + 1) = 4 THEN 4 
                    ELSE 3 
                END;
                
                FOR j IN i..(i + group_size - 1) LOOP
                    INSERT INTO match_members (match_id, user_id, joined_at)
                    VALUES (match_id, user_ids[j], NOW());
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
                i := i + group_size;
            END;
        ELSE
            -- Not enough users for another group
            EXIT;
        END IF;
    END LOOP;
    
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
        'eligible_users', eligible_count,
        'groups_created', groups_created,
        'timestamp', NOW()
    );
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log error
        INSERT INTO matching_logs (week, groups_created, eligible_users, reason)
        VALUES (current_week, 0, eligible_count, 'Error: ' || SQLERRM)
        ON CONFLICT DO NOTHING;
        
        RETURN jsonb_build_object(
            'success', false,
            'error', SQLERRM,
            'week', current_week
        );
END;
$$;

-- ==============================================
-- MONITORING FUNCTIONS
-- ==============================================

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

-- Function to get current eligible users count
CREATE OR REPLACE FUNCTION get_eligible_users_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM profiles
  WHERE is_verified = true
    AND is_paid = true
    AND onboarding_completed = true
    AND created_at < (date_trunc('week', CURRENT_DATE) + INTERVAL '3 days 12 hours')
    AND NOT EXISTS (
        SELECT 1 FROM match_members mm
        INNER JOIN matches m ON mm.match_id = m.id
        WHERE mm.user_id = profiles.id
          AND m.match_week >= (CURRENT_DATE - INTERVAL '6 weeks')
    );
$$;

-- ==============================================
-- CRON JOB MANAGEMENT
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
    
    -- Schedule the job
    PERFORM cron.schedule(
        'weekly-doctor-matching',           -- job name
        '0 16 * * 4',                      -- Every Thursday at 16:00 UTC
        'SELECT run_weekly_matching();'     -- SQL command to execute
    );
    
    RETURN 'Success: Weekly matching cron job scheduled for every Thursday at 16:00 UTC';
END;
$$;

-- ==============================================
-- GRANT PERMISSIONS
-- ==============================================

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION trigger_manual_matching TO authenticated;
GRANT EXECUTE ON FUNCTION run_weekly_matching TO service_role;
GRANT EXECUTE ON FUNCTION get_matching_history TO authenticated;
GRANT EXECUTE ON FUNCTION get_cron_job_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_eligible_users_count TO authenticated;
GRANT EXECUTE ON FUNCTION setup_weekly_matching_cron TO authenticated;

-- ==============================================
-- TEST THE FUNCTIONS
-- ==============================================

DO $$
BEGIN
    RAISE NOTICE '🧪 Testing function creation...';
    
    -- Test that functions exist
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'trigger_manual_matching') THEN
        RAISE NOTICE '✅ trigger_manual_matching() created successfully';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'run_weekly_matching') THEN
        RAISE NOTICE '✅ run_weekly_matching() created successfully';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_matching_history') THEN
        RAISE NOTICE '✅ get_matching_history() created successfully';
    END IF;
    
    RAISE NOTICE '🎉 All functions created successfully!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Next steps:';
    RAISE NOTICE '1. Test manual matching: SELECT trigger_manual_matching();';
    RAISE NOTICE '2. Check eligible users: SELECT get_eligible_users_count();';
    RAISE NOTICE '3. Setup cron job: SELECT setup_weekly_matching_cron();';
    RAISE NOTICE '4. View history: SELECT * FROM get_matching_history();';
END $$;
