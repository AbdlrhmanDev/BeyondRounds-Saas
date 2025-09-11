-- ==============================================
-- SYSTEM READINESS CHECK FOR BEYONDROUNDS MATCHING
-- This function provides detailed feedback about matching readiness
-- ==============================================

-- Function to get detailed system readiness information
CREATE OR REPLACE FUNCTION get_system_readiness()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_users INTEGER;
  verified_users INTEGER;
  paid_users INTEGER;
  eligible_users INTEGER;
  cities_with_min_users INTEGER;
  city_breakdown JSONB;
  requirements_met JSONB;
  issues JSONB[] := ARRAY[]::JSONB[];
  recommendations JSONB[] := ARRAY[]::JSONB[];
  system_ready BOOLEAN := true;
  cutoff_time TIMESTAMP WITH TIME ZONE;
  six_weeks_ago DATE;
  recently_matched_count INTEGER;
BEGIN
  -- Calculate cutoff times
  cutoff_time := date_trunc('week', CURRENT_DATE) + INTERVAL '3 days 12 hours'; -- Thursday 12:00
  six_weeks_ago := CURRENT_DATE - INTERVAL '6 weeks';
  
  -- Get basic user counts
  SELECT COUNT(*) INTO total_users FROM profiles;
  SELECT COUNT(*) INTO verified_users FROM profiles WHERE is_verified = true;
  SELECT COUNT(*) INTO paid_users FROM profiles WHERE is_verified = true AND is_paid = true;
  
  -- Get recently matched users count
  SELECT COUNT(DISTINCT mm.user_id) INTO recently_matched_count
  FROM match_members mm
  INNER JOIN matches m ON mm.match_id = m.id
  WHERE m.match_week >= six_weeks_ago;
  
  -- Get eligible users count
  SELECT COUNT(*) INTO eligible_users
  FROM profiles p
  WHERE p.is_verified = true
    AND p.is_paid = true
    AND p.onboarding_completed = true
    AND p.created_at < cutoff_time
    AND NOT EXISTS (
      SELECT 1 FROM match_members mm
      INNER JOIN matches m ON mm.match_id = m.id
      WHERE mm.user_id = p.id
        AND m.match_week >= six_weeks_ago
    );
  
  -- Get city breakdown
  SELECT 
    jsonb_object_agg(
      city_data.city,
      jsonb_build_object(
        'total_users', city_data.total_users,
        'eligible_users', city_data.eligible_users,
        'meets_minimum', city_data.eligible_users >= 3
      )
    )
  INTO city_breakdown
  FROM (
    SELECT 
      p.city,
      COUNT(*) as total_users,
      COUNT(*) FILTER (
        WHERE p.is_verified = true
          AND p.is_paid = true
          AND p.onboarding_completed = true
          AND p.created_at < cutoff_time
          AND NOT EXISTS (
            SELECT 1 FROM match_members mm
            INNER JOIN matches m ON mm.match_id = m.id
            WHERE mm.user_id = p.id
              AND m.match_week >= six_weeks_ago
          )
      ) as eligible_users
    FROM profiles p
    WHERE p.city IS NOT NULL AND p.city != ''
    GROUP BY p.city
  ) city_data;
  
  -- Count cities with minimum users
  SELECT COUNT(*) INTO cities_with_min_users
  FROM (
    SELECT city, COUNT(*) as user_count
    FROM profiles p
    WHERE p.is_verified = true
      AND p.is_paid = true
      AND p.onboarding_completed = true
      AND p.created_at < cutoff_time
      AND NOT EXISTS (
        SELECT 1 FROM match_members mm
        INNER JOIN matches m ON mm.match_id = m.id
        WHERE mm.user_id = p.id
          AND m.match_week >= six_weeks_ago
      )
    GROUP BY city
    HAVING COUNT(*) >= 3
  ) city_counts;
  
  -- Check requirements and build issues/recommendations
  
  -- Requirement 1: At least 6 eligible users
  IF eligible_users < 6 THEN
    system_ready := false;
    issues := issues || jsonb_build_object(
      'type', 'insufficient_users',
      'message', 'Need at least 6 eligible users (currently ' || eligible_users || ')',
      'current', eligible_users,
      'required', 6,
      'priority', 'high'
    );
    
    -- Add specific recommendations based on the issue
    IF total_users < 6 THEN
      recommendations := recommendations || jsonb_build_object(
        'type', 'user_acquisition',
        'message', 'Focus on user acquisition - need more doctors to sign up',
        'action', 'marketing_campaign'
      );
    ELSIF verified_users < 6 THEN
      recommendations := recommendations || jsonb_build_object(
        'type', 'verification',
        'message', 'Help users complete verification process',
        'action', 'verification_reminder',
        'unverified_count', total_users - verified_users
      );
    ELSIF paid_users < 6 THEN
      recommendations := recommendations || jsonb_build_object(
        'type', 'subscription',
        'message', 'Encourage users to subscribe',
        'action', 'subscription_promotion',
        'unpaid_count', verified_users - paid_users
      );
    ELSE
      recommendations := recommendations || jsonb_build_object(
        'type', 'onboarding',
        'message', 'Help users complete their profiles',
        'action', 'onboarding_reminder'
      );
    END IF;
  END IF;
  
  -- Requirement 2: At least 2 cities with 3+ users each
  IF cities_with_min_users < 2 THEN
    system_ready := false;
    issues := issues || jsonb_build_object(
      'type', 'insufficient_cities',
      'message', 'Need at least 2 cities with 3+ users each (currently ' || cities_with_min_users || ' cities)',
      'current', cities_with_min_users,
      'required', 2,
      'priority', 'medium'
    );
    
    recommendations := recommendations || jsonb_build_object(
      'type', 'geographic_expansion',
      'message', 'Focus on growing user base in specific cities',
      'action', 'targeted_city_marketing'
    );
  END IF;
  
  -- Additional checks
  
  -- Check for users waiting too long (joined > 2 weeks ago but not matched)
  DECLARE
    waiting_users INTEGER;
  BEGIN
    SELECT COUNT(*) INTO waiting_users
    FROM profiles p
    WHERE p.is_verified = true
      AND p.is_paid = true
      AND p.onboarding_completed = true
      AND p.created_at < (CURRENT_DATE - INTERVAL '2 weeks')
      AND NOT EXISTS (
        SELECT 1 FROM match_members mm
        WHERE mm.user_id = p.id
      );
    
    IF waiting_users > 0 AND system_ready THEN
      recommendations := recommendations || jsonb_build_object(
        'type', 'user_retention',
        'message', waiting_users || ' users have been waiting for matches for over 2 weeks',
        'action', 'engagement_outreach',
        'waiting_count', waiting_users
      );
    END IF;
  END;
  
  -- Build requirements status
  requirements_met := jsonb_build_object(
    'minimum_users', jsonb_build_object(
      'required', 6,
      'current', eligible_users,
      'met', eligible_users >= 6,
      'percentage', ROUND((eligible_users::DECIMAL / 6 * 100), 1)
    ),
    'minimum_cities', jsonb_build_object(
      'required', 2,
      'current', cities_with_min_users,
      'met', cities_with_min_users >= 2,
      'percentage', ROUND((cities_with_min_users::DECIMAL / 2 * 100), 1)
    )
  );
  
  -- Return comprehensive status
  RETURN jsonb_build_object(
    'system_ready', system_ready,
    'last_checked', NOW(),
    'summary', jsonb_build_object(
      'total_users', total_users,
      'verified_users', verified_users,
      'paid_users', paid_users,
      'eligible_users', eligible_users,
      'cities_with_min_users', cities_with_min_users,
      'recently_matched_users', recently_matched_count
    ),
    'requirements', requirements_met,
    'city_breakdown', COALESCE(city_breakdown, '{}'::jsonb),
    'issues', array_to_json(issues)::jsonb,
    'recommendations', array_to_json(recommendations)::jsonb,
    'next_check_suggestion', 'Check again after addressing the issues above'
  );
END;
$$;

-- Function to get simple readiness status (for dashboard)
CREATE OR REPLACE FUNCTION get_simple_readiness_status()
RETURNS TABLE (
  is_ready BOOLEAN,
  status_message TEXT,
  issues_count INTEGER,
  next_action TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  readiness_data JSONB;
  issues_array JSONB;
BEGIN
  SELECT get_system_readiness() INTO readiness_data;
  SELECT readiness_data->'issues' INTO issues_array;
  
  RETURN QUERY SELECT 
    (readiness_data->>'system_ready')::BOOLEAN as is_ready,
    CASE 
      WHEN (readiness_data->>'system_ready')::BOOLEAN THEN 'System ready for matching'
      ELSE 'System not ready - ' || jsonb_array_length(issues_array) || ' issues found'
    END as status_message,
    jsonb_array_length(issues_array) as issues_count,
    CASE 
      WHEN (readiness_data->>'system_ready')::BOOLEAN THEN 'Ready to match users'
      ELSE (readiness_data->'recommendations'->0->>'message')
    END as next_action;
END;
$$;

-- Function to get user-friendly readiness messages
CREATE OR REPLACE FUNCTION get_readiness_messages()
RETURNS TABLE (
  message_type TEXT,
  message TEXT,
  priority TEXT,
  action_needed TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  readiness_data JSONB;
  issue JSONB;
  recommendation JSONB;
BEGIN
  SELECT get_system_readiness() INTO readiness_data;
  
  -- Return issues as user-friendly messages
  FOR issue IN SELECT * FROM jsonb_array_elements(readiness_data->'issues')
  LOOP
    RETURN QUERY SELECT 
      'issue'::TEXT as message_type,
      (issue->>'message')::TEXT as message,
      (issue->>'priority')::TEXT as priority,
      'Address this requirement'::TEXT as action_needed;
  END LOOP;
  
  -- Return recommendations as user-friendly messages
  FOR recommendation IN SELECT * FROM jsonb_array_elements(readiness_data->'recommendations')
  LOOP
    RETURN QUERY SELECT 
      'recommendation'::TEXT as message_type,
      (recommendation->>'message')::TEXT as message,
      'medium'::TEXT as priority,
      (recommendation->>'action')::TEXT as action_needed;
  END LOOP;
  
  -- If system is ready, return success message
  IF (readiness_data->>'system_ready')::BOOLEAN THEN
    RETURN QUERY SELECT 
      'success'::TEXT as message_type,
      'System is ready for matching! All requirements are met.'::TEXT as message,
      'info'::TEXT as priority,
      'matching_ready'::TEXT as action_needed;
  END IF;
END;
$$;

-- Function to get city-specific recommendations
CREATE OR REPLACE FUNCTION get_city_recommendations()
RETURNS TABLE (
  city TEXT,
  current_users INTEGER,
  eligible_users INTEGER,
  needs_more_users BOOLEAN,
  users_needed INTEGER,
  recommendation TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  readiness_data JSONB;
  city_data JSONB;
  city_name TEXT;
BEGIN
  SELECT get_system_readiness() INTO readiness_data;
  
  -- Loop through each city in the breakdown
  FOR city_name, city_data IN SELECT * FROM jsonb_each(readiness_data->'city_breakdown')
  LOOP
    RETURN QUERY SELECT 
      city_name,
      (city_data->>'total_users')::INTEGER as current_users,
      (city_data->>'eligible_users')::INTEGER as eligible_users,
      NOT (city_data->>'meets_minimum')::BOOLEAN as needs_more_users,
      GREATEST(0, 3 - (city_data->>'eligible_users')::INTEGER) as users_needed,
      CASE 
        WHEN (city_data->>'meets_minimum')::BOOLEAN THEN 
          '✅ This city has enough users for matching'
        ELSE 
          '⚠️ Need ' || GREATEST(0, 3 - (city_data->>'eligible_users')::INTEGER) || ' more eligible users'
      END as recommendation;
  END LOOP;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_system_readiness TO authenticated;
GRANT EXECUTE ON FUNCTION get_simple_readiness_status TO authenticated;
GRANT EXECUTE ON FUNCTION get_readiness_messages TO authenticated;
GRANT EXECUTE ON FUNCTION get_city_recommendations TO authenticated;

-- ==============================================
-- TESTING THE NEW FUNCTIONS
-- ==============================================

DO $$
DECLARE
  readiness_result JSONB;
BEGIN
  RAISE NOTICE '🔍 TESTING SYSTEM READINESS FUNCTIONS';
  RAISE NOTICE '=====================================';
  RAISE NOTICE '';
  
  -- Test the main readiness function
  SELECT get_system_readiness() INTO readiness_result;
  
  RAISE NOTICE '📊 System Status: %', 
    CASE WHEN (readiness_result->>'system_ready')::BOOLEAN 
         THEN '✅ READY' 
         ELSE '❌ NOT READY' 
    END;
  
  RAISE NOTICE '👥 Eligible Users: %', readiness_result->'summary'->>'eligible_users';
  RAISE NOTICE '🏙️ Cities Ready: %', readiness_result->'summary'->>'cities_with_min_users';
  RAISE NOTICE '⚠️ Issues Found: %', jsonb_array_length(readiness_result->'issues');
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 AVAILABLE FUNCTIONS:';
  RAISE NOTICE '• get_system_readiness() - Complete detailed status';
  RAISE NOTICE '• get_simple_readiness_status() - Quick status for dashboard';
  RAISE NOTICE '• get_readiness_messages() - User-friendly messages';
  RAISE NOTICE '• get_city_recommendations() - City-specific advice';
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TEST COMMANDS:';
  RAISE NOTICE '• SELECT * FROM get_simple_readiness_status();';
  RAISE NOTICE '• SELECT * FROM get_readiness_messages();';
  RAISE NOTICE '• SELECT * FROM get_city_recommendations();';
  RAISE NOTICE '';
END $$;

