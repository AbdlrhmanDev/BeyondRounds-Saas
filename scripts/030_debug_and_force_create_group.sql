-- ========================================
-- DEBUG AND FORCE CREATE A TEST GROUP
-- ========================================
-- Let's bypass the complex algorithm and manually create a group to test

-- First, let's check what's in our matching logs
SELECT 
    'Latest matching attempt:' as info,
    execution_date,
    total_eligible_users,
    groups_created,
    users_matched,
    users_unmatched,
    details
FROM matching_logs 
ORDER BY created_at DESC 
LIMIT 1;

-- Check if we have valid pairs
SELECT 
    'Valid pairs found:' as info,
    COUNT(*) as pairs_count
FROM get_valid_pairs();

-- Show the valid pairs
SELECT 
    'Top valid pairs:' as info,
    u1.first_name || ' & ' || u2.first_name as pair,
    u1.city,
    ROUND(vp.match_score, 3) as score
FROM get_valid_pairs() vp
JOIN get_eligible_users() u1 ON vp.user1_id = u1.user_id
JOIN get_eligible_users() u2 ON vp.user2_id = u2.user_id
ORDER BY vp.match_score DESC
LIMIT 5;

-- Let's manually create a test group with the best scoring pair
-- First, get the top pair
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
    match_id UUID;
    group_name TEXT;
    pair_record RECORD;
    user_record RECORD;
BEGIN
    -- Get the highest scoring pair
    SELECT vp.user1_id, vp.user2_id INTO user1_id, user2_id
    FROM get_valid_pairs() vp
    ORDER BY vp.match_score DESC
    LIMIT 1;
    
    IF user1_id IS NOT NULL AND user2_id IS NOT NULL THEN
        -- Find a third user from the same city
        SELECT u.user_id INTO user3_id
        FROM get_eligible_users() u
        WHERE u.user_id NOT IN (user1_id, user2_id)
          AND u.city = (SELECT city FROM get_eligible_users() WHERE user_id = user1_id)
        LIMIT 1;
        
        -- Create the match
        match_id := uuid_generate_v4();
        group_name := 'Test_Group_' || substring(match_id::text from 1 for 8);
        
        -- Insert into matches table
        INSERT INTO matches (id, group_name, created_at, match_week, status)
        VALUES (match_id, group_name, NOW(), CURRENT_DATE, 'active');
        
        -- Insert members
        INSERT INTO match_members (id, match_id, user_id, joined_at)
        VALUES 
            (uuid_generate_v4(), match_id, user1_id, NOW()),
            (uuid_generate_v4(), match_id, user2_id, NOW());
            
        -- Add third member if found
        IF user3_id IS NOT NULL THEN
            INSERT INTO match_members (id, match_id, user_id, joined_at)
            VALUES (uuid_generate_v4(), match_id, user3_id, NOW());
        END IF;
        
        -- Send welcome message
        INSERT INTO chat_messages (id, match_id, user_id, content, message_type, created_at)
        VALUES (uuid_generate_v4(), match_id, NULL, 
                '👋 Welcome to your test Rounds group! This group was created manually for testing.',
                'system', NOW());
                
        RAISE NOTICE 'Successfully created test group: %', group_name;
    ELSE
        RAISE NOTICE 'No valid pairs found to create a group';
    END IF;
END $$;

-- Check if the group was created
SELECT 
    'Groups after manual creation:' as info,
    COUNT(*) as total_groups
FROM matches;

-- Show the created group
SELECT 
    m.group_name,
    COUNT(mm.user_id) as group_size,
    string_agg(p.first_name || ' ' || p.last_name, ', ') as members,
    string_agg(DISTINCT p.city, ', ') as cities,
    m.created_at
FROM matches m
JOIN match_members mm ON m.id = mm.match_id
JOIN profiles p ON mm.user_id = p.id
GROUP BY m.id, m.group_name, m.created_at
ORDER BY m.created_at DESC;

-- Show welcome message
SELECT 
    m.group_name,
    cm.content,
    cm.created_at
FROM chat_messages cm
JOIN matches m ON cm.match_id = m.id
WHERE cm.message_type = 'system'
ORDER BY cm.created_at DESC
LIMIT 1;

SELECT 'Manual group creation completed!' as final_status;

