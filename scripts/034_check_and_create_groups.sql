-- ========================================
-- CHECK AND CREATE GROUPS
-- ========================================
-- Let's diagnose why no groups are showing and create some

-- Step 1: Check system readiness
SELECT 
    '=== SYSTEM READINESS CHECK ===' as step,
    is_ready,
    eligible_users_count,
    cities_with_min_users,
    min_required_users,
    min_required_cities
FROM get_system_readiness();

-- Step 2: Check eligible users
SELECT 
    '=== ELIGIBLE USERS ===' as step,
    COUNT(*) as total_eligible
FROM get_eligible_users();

-- Step 3: Show eligible users by city
SELECT 
    '=== USERS BY CITY ===' as step,
    city,
    COUNT(*) as user_count,
    string_agg(first_name || ' ' || last_name, ', ') as users
FROM get_eligible_users()
GROUP BY city
ORDER BY user_count DESC;

-- Step 4: Check if any matches exist
SELECT 
    '=== EXISTING MATCHES ===' as step,
    COUNT(*) as total_matches,
    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_matches
FROM matches;

-- Step 5: Show existing matches if any
SELECT 
    '=== MATCH DETAILS ===' as step,
    id,
    group_name,
    status,
    created_at
FROM matches
ORDER BY created_at DESC
LIMIT 10;

-- Step 6: Check match members
SELECT 
    '=== MATCH MEMBERS ===' as step,
    COUNT(*) as total_members
FROM match_members;

-- Step 7: Test valid pairs
SELECT 
    '=== VALID PAIRS TEST ===' as step,
    COUNT(*) as valid_pairs_count
FROM get_valid_pairs();

-- Step 8: Show some valid pairs
SELECT 
    '=== SAMPLE VALID PAIRS ===' as step,
    u1.first_name || ' & ' || u2.first_name as pair,
    u1.city,
    ROUND(vp.match_score, 3) as score
FROM get_valid_pairs() vp
JOIN get_eligible_users() u1 ON vp.user1_id = u1.user_id
JOIN get_eligible_users() u2 ON vp.user2_id = u2.user_id
ORDER BY vp.match_score DESC
LIMIT 5;

-- Step 9: Force create groups if system is ready but no groups exist
DO $$
DECLARE
    readiness_result RECORD;
    match_count INT;
    group_id UUID;
    user_ids UUID[];
    user_record RECORD;
    counter INT := 0;
BEGIN
    -- Check readiness
    SELECT * INTO readiness_result FROM get_system_readiness();
    SELECT COUNT(*) INTO match_count FROM matches WHERE status = 'active';
    
    RAISE NOTICE 'System ready: %, Existing matches: %', readiness_result.is_ready, match_count;
    
    IF readiness_result.is_ready AND match_count = 0 THEN
        RAISE NOTICE 'System is ready but no groups exist. Creating groups manually...';
        
        -- Get eligible users and create groups of 3
        user_ids := ARRAY[]::UUID[];
        FOR user_record IN SELECT * FROM get_eligible_users() ORDER BY city, user_id LOOP
            user_ids := user_ids || user_record.user_id;
            counter := counter + 1;
            
            -- Create group when we have 3 users
            IF counter = 3 THEN
                group_id := uuid_generate_v4();
                
                -- Insert match
                INSERT INTO matches (id, group_name, created_at, match_week, status)
                VALUES (group_id, 'Rounds_Group_' || counter/3, NOW(), CURRENT_DATE, 'active');
                
                -- Insert members
                FOR i IN 1..3 LOOP
                    INSERT INTO match_members (id, match_id, user_id, joined_at)
                    VALUES (uuid_generate_v4(), group_id, user_ids[i], NOW());
                END LOOP;
                
                -- Send welcome message
                INSERT INTO chat_messages (id, match_id, user_id, content, message_type, created_at)
                VALUES (uuid_generate_v4(), group_id, NULL, 
                        '👋 Welcome to your Rounds group! Feel free to introduce yourselves.',
                        'system', NOW());
                
                RAISE NOTICE 'Created group: % with % users', 'Rounds_Group_' || counter/3, 3;
                
                -- Reset for next group
                user_ids := ARRAY[]::UUID[];
                counter := 0;
            END IF;
        END LOOP;
        
        -- Handle remaining users (create smaller group if 2 users left)
        IF counter = 2 THEN
            group_id := uuid_generate_v4();
            
            INSERT INTO matches (id, group_name, created_at, match_week, status)
            VALUES (group_id, 'Rounds_Group_Small', NOW(), CURRENT_DATE, 'active');
            
            FOR i IN 1..2 LOOP
                INSERT INTO match_members (id, match_id, user_id, joined_at)
                VALUES (uuid_generate_v4(), group_id, user_ids[i], NOW());
            END LOOP;
            
            INSERT INTO chat_messages (id, match_id, user_id, content, message_type, created_at)
            VALUES (uuid_generate_v4(), group_id, NULL, 
                    '👋 Welcome to your Rounds group! Feel free to introduce yourselves.',
                    'system', NOW());
                    
            RAISE NOTICE 'Created small group with % users', 2;
        END IF;
        
    ELSIF NOT readiness_result.is_ready THEN
        RAISE NOTICE 'System not ready: need % users in % cities', 
            readiness_result.min_required_users, readiness_result.min_required_cities;
    ELSE
        RAISE NOTICE 'Groups already exist: %', match_count;
    END IF;
END $$;

-- Step 10: Check results
SELECT 
    '=== FINAL RESULTS ===' as step,
    COUNT(*) as total_groups_created
FROM matches
WHERE created_at >= CURRENT_DATE;

-- Step 11: Show created groups
SELECT 
    '=== CREATED GROUPS ===' as step,
    m.group_name,
    COUNT(mm.user_id) as member_count,
    string_agg(p.first_name || ' ' || p.last_name, ', ') as members,
    string_agg(DISTINCT p.city, ', ') as cities
FROM matches m
JOIN match_members mm ON m.id = mm.match_id
JOIN profiles p ON mm.user_id = p.id
WHERE m.created_at >= CURRENT_DATE
GROUP BY m.id, m.group_name
ORDER BY m.created_at;

-- Final message
SELECT 
    '🎉 GROUPS CREATED!' as status,
    'Refresh your dashboard to see the groups' as next_step;

