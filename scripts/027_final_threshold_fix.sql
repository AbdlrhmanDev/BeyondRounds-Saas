-- ========================================
-- FINAL THRESHOLD FIX - Lower to 0.2
-- ========================================
-- Based on diagnosis, highest score is 0.28, so we need threshold ≤ 0.2

-- Update get_valid_pairs with 0.2 threshold
DROP FUNCTION IF EXISTS get_valid_pairs();

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
            
            -- THRESHOLD: 0.2 (was 0.3)
            IF score >= 0.2 THEN
                user1_id := user1_record.user_id;
                user2_id := user2_record.user_id;
                match_score := score;
                RETURN NEXT;
            END IF;
        END LOOP;
    END LOOP;
END;
$$;

-- Update create_groups_greedy with 0.2 threshold
DROP FUNCTION IF EXISTS create_groups_greedy();

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
                
                -- THRESHOLD: 0.2 (was 0.3)
                IF test_score >= 0.2 AND test_score > best_score THEN
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
        -- THRESHOLD: 0.2 (was 0.3)
        IF array_length(current_group, 1) >= 3 AND 
           calculate_group_average_score(current_group) >= 0.2 AND
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

-- Test the new 0.2 threshold
SELECT 
    'Valid pairs with 0.2 threshold:' as status,
    COUNT(*) as pairs_count
FROM get_valid_pairs();

-- Show the valid pairs
SELECT 
    u1.first_name || ' & ' || u2.first_name as pair,
    u1.city,
    ROUND(vp.match_score, 3) as score
FROM get_valid_pairs() vp
JOIN get_eligible_users() u1 ON vp.user1_id = u1.user_id
JOIN get_eligible_users() u2 ON vp.user2_id = u2.user_id
ORDER BY vp.match_score DESC;

-- Now test the matching!
SELECT trigger_manual_matching();

-- Success message
SELECT 
    '🎉 THRESHOLD SET TO 0.2!' as status,
    'Groups should now be created successfully' as message;

