-- =====================================================
-- BeyondRounds Updated Database Optimization Script
-- سكريبت التحسينات المحدث لقاعدة البيانات
-- Based on the improved schema with search vectors and fixes
-- =====================================================

-- =====================================================
-- Phase 1: Enhanced Indexes for Updated Schema
-- المرحلة الأولى: فهارس محسنة للمخطط المحدث
-- =====================================================

-- Enhanced Text Search Indexes
-- فهارس البحث النصي المحسنة
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_search_vector_weighted 
ON profiles USING gin(search_vector);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_search_vector 
ON chat_messages USING gin(search_vector);

-- Advanced Search Indexes
-- فهارس البحث المتقدم
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_name_search 
ON profiles USING gin(to_tsvector('simple', first_name || ' ' || last_name));

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_specialty_city_search 
ON profiles USING gin(to_tsvector('english', medical_specialty || ' ' || city));

-- Enhanced Performance Indexes
-- فهارس الأداء المحسنة
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_matching_advanced 
ON profiles(city, medical_specialty, is_verified, is_banned, profile_completion) 
WHERE deleted_at IS NULL AND onboarding_completed = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_active_week_advanced 
ON matches(status, match_week, group_size, average_compatibility) 
WHERE status = 'active' AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_rooms_active_match 
ON chat_rooms(is_active, match_id, last_message_at) 
WHERE is_active = true AND deleted_at IS NULL;

-- Chat System Enhanced Indexes
-- فهارس نظام الدردشة المحسنة
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_room_created_desc 
ON chat_messages(chat_room_id, created_at DESC) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_unread_count 
ON chat_messages(chat_room_id, created_at) 
WHERE deleted_at IS NULL AND is_flagged = false;

-- Notification System Enhanced Indexes
-- فهارس نظام الإشعارات المحسنة
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_unread_recent 
ON notifications(profile_id, created_at DESC) 
WHERE is_read = false AND deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_scheduled_delivery 
ON notifications(scheduled_for, is_sent, delivery_attempts) 
WHERE scheduled_for IS NOT NULL AND is_sent = false;

-- =====================================================
-- Phase 2: Advanced Search Functions
-- المرحلة الثانية: دوال البحث المتقدم
-- =====================================================

-- Advanced Profile Search Function
-- دالة البحث المتقدم في الملفات الشخصية
CREATE OR REPLACE FUNCTION search_profiles_advanced(
    search_term text,
    specialty_filter text DEFAULT NULL,
    city_filter text DEFAULT NULL,
    min_completion integer DEFAULT 50,
    limit_count integer DEFAULT 20
)
RETURNS TABLE(
    profile_id uuid,
    first_name text,
    last_name text,
    medical_specialty text,
    city text,
    bio text,
    profile_completion integer,
    search_rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.first_name,
        p.last_name,
        p.medical_specialty,
        p.city,
        p.bio,
        p.profile_completion,
        ts_rank(p.search_vector, plainto_tsquery('english', search_term)) as search_rank
    FROM profiles p
    WHERE 
        p.search_vector @@ plainto_tsquery('english', search_term)
        AND (specialty_filter IS NULL OR p.medical_specialty ILIKE '%' || specialty_filter || '%')
        AND (city_filter IS NULL OR p.city ILIKE '%' || city_filter || '%')
        AND p.profile_completion >= min_completion
        AND p.is_verified = true
        AND p.is_banned = false
        AND p.deleted_at IS NULL
    ORDER BY search_rank DESC, p.profile_completion DESC, p.last_active_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Chat Message Search Function
-- دالة البحث في الرسائل
CREATE OR REPLACE FUNCTION search_chat_messages(
    chat_room_id_param uuid,
    search_term text,
    date_from timestamp with time zone DEFAULT NULL,
    date_to timestamp with time zone DEFAULT NULL,
    limit_count integer DEFAULT 50
)
RETURNS TABLE(
    message_id uuid,
    sender_name text,
    content text,
    created_at timestamp with time zone,
    search_rank real
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.id,
        p.first_name || ' ' || p.last_name as sender_name,
        cm.content,
        cm.created_at,
        ts_rank(cm.search_vector, plainto_tsquery('english', search_term)) as search_rank
    FROM chat_messages cm
    JOIN profiles p ON cm.sender_id = p.id
    WHERE 
        cm.chat_room_id = chat_room_id_param
        AND cm.search_vector @@ plainto_tsquery('english', search_term)
        AND (date_from IS NULL OR cm.created_at >= date_from)
        AND (date_to IS NULL OR cm.created_at <= date_to)
        AND cm.deleted_at IS NULL
        AND cm.is_flagged = false
    ORDER BY search_rank DESC, cm.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Global Search Function
-- دالة البحث الشامل
CREATE OR REPLACE FUNCTION global_search(
    search_term text,
    search_type text DEFAULT 'all', -- 'profiles', 'messages', 'all'
    user_profile_id uuid DEFAULT NULL,
    limit_count integer DEFAULT 20
)
RETURNS TABLE(
    result_type text,
    result_id uuid,
    title text,
    description text,
    search_rank real,
    created_at timestamp with time zone
) AS $$
BEGIN
    -- Search in profiles
    IF search_type IN ('profiles', 'all') THEN
        RETURN QUERY
        SELECT 
            'profile'::text as result_type,
            p.id as result_id,
            p.first_name || ' ' || p.last_name as title,
            'Dr. ' || p.medical_specialty || ' in ' || p.city as description,
            ts_rank(p.search_vector, plainto_tsquery('english', search_term)) as search_rank,
            p.created_at
        FROM profiles p
        WHERE 
            p.search_vector @@ plainto_tsquery('english', search_term)
            AND p.is_verified = true
            AND p.is_banned = false
            AND p.deleted_at IS NULL
            AND (user_profile_id IS NULL OR p.id != user_profile_id)
        ORDER BY search_rank DESC
        LIMIT limit_count / 2;
    END IF;
    
    -- Search in messages (if user has access)
    IF search_type IN ('messages', 'all') AND user_profile_id IS NOT NULL THEN
        RETURN QUERY
        SELECT 
            'message'::text as result_type,
            cm.id as result_id,
            'Message from ' || p.first_name || ' ' || p.last_name as title,
            LEFT(cm.content, 100) || '...' as description,
            ts_rank(cm.search_vector, plainto_tsquery('english', search_term)) as search_rank,
            cm.created_at
        FROM chat_messages cm
        JOIN profiles p ON cm.sender_id = p.id
        JOIN chat_rooms cr ON cm.chat_room_id = cr.id
        JOIN match_members mm ON cr.match_id = mm.match_id
        WHERE 
            mm.profile_id = user_profile_id
            AND mm.is_active = true
            AND cm.search_vector @@ plainto_tsquery('english', search_term)
            AND cm.deleted_at IS NULL
            AND cm.is_flagged = false
        ORDER BY search_rank DESC
        LIMIT limit_count / 2;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Phase 3: Enhanced Triggers for Search Vectors
-- المرحلة الثالثة: محفزات محسنة لفهارس البحث
-- =====================================================

-- Enhanced Profile Search Vector Update Trigger
-- محفز تحديث فهرس البحث للملفات الشخصية المحسن
CREATE OR REPLACE FUNCTION update_profile_search_vector_enhanced()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := (
        setweight(to_tsvector('simple', COALESCE(NEW.first_name, '')), 'A') ||
        setweight(to_tsvector('simple', COALESCE(NEW.last_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.medical_specialty, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.nationality, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.bio, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.looking_for, '')), 'D')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS update_profile_search_vector_trigger ON profiles;
CREATE TRIGGER update_profile_search_vector_enhanced_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_search_vector_enhanced();

-- Enhanced Chat Message Search Vector Update Trigger
-- محفز تحديث فهرس البحث للرسائل المحسن
CREATE OR REPLACE FUNCTION update_chat_message_search_vector_enhanced()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('english', COALESCE(NEW.content, ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if exists and create new one
DROP TRIGGER IF EXISTS update_chat_message_search_vector_trigger ON chat_messages;
CREATE TRIGGER update_chat_message_search_vector_enhanced_trigger
    BEFORE INSERT OR UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_message_search_vector_enhanced();

-- =====================================================
-- Phase 4: Enhanced RLS Policies
-- المرحلة الرابعة: سياسات RLS محسنة
-- =====================================================

-- Enhanced Profile RLS Policies
-- سياسات RLS محسنة للملفات الشخصية
DROP POLICY IF EXISTS "Users can search profiles" ON profiles;
CREATE POLICY "Users can search verified profiles" ON profiles
    FOR SELECT USING (
        is_verified = true AND 
        is_banned = false AND 
        deleted_at IS NULL AND
        profile_completion >= 30
    );

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Enhanced Chat Message RLS Policies
-- سياسات RLS محسنة للرسائل
DROP POLICY IF EXISTS "Users can search messages in their matches" ON chat_messages;
CREATE POLICY "Users can search messages in active matches" ON chat_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM match_members mm 
            JOIN chat_rooms cr ON cr.match_id = mm.match_id
            WHERE cr.id = chat_messages.chat_room_id 
            AND mm.profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
            AND mm.is_active = true
            AND cr.is_active = true
        )
    );

-- =====================================================
-- Phase 5: Performance Monitoring Functions
-- المرحلة الخامسة: دوال مراقبة الأداء
-- =====================================================

-- Search Performance Monitor
-- مراقب أداء البحث
CREATE OR REPLACE FUNCTION monitor_search_performance()
RETURNS TABLE(
    search_type text,
    avg_response_time numeric,
    total_searches bigint,
    performance_level text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'Profile Search'::text as search_type,
        AVG(mean_time) as avg_response_time,
        SUM(calls) as total_searches,
        CASE 
            WHEN AVG(mean_time) < 50 THEN 'EXCELLENT'::text
            WHEN AVG(mean_time) < 100 THEN 'GOOD'::text
            WHEN AVG(mean_time) < 200 THEN 'ACCEPTABLE'::text
            ELSE 'SLOW'::text
        END as performance_level
    FROM pg_stat_statements 
    WHERE query ILIKE '%search_profiles%' OR query ILIKE '%ts_rank%'
    GROUP BY 'Profile Search'
    
    UNION ALL
    
    SELECT 
        'Message Search'::text as search_type,
        AVG(mean_time) as avg_response_time,
        SUM(calls) as total_searches,
        CASE 
            WHEN AVG(mean_time) < 30 THEN 'EXCELLENT'::text
            WHEN AVG(mean_time) < 60 THEN 'GOOD'::text
            WHEN AVG(mean_time) < 120 THEN 'ACCEPTABLE'::text
            ELSE 'SLOW'::text
        END as performance_level
    FROM pg_stat_statements 
    WHERE query ILIKE '%search_chat_messages%'
    GROUP BY 'Message Search';
END;
$$ LANGUAGE plpgsql;

-- Text Search Index Usage Monitor
-- مراقب استخدام فهارس البحث النصي
CREATE OR REPLACE FUNCTION monitor_text_search_usage()
RETURNS TABLE(
    table_name text,
    index_name text,
    index_size text,
    usage_count bigint,
    efficiency_rating text
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.tablename::text,
        i.indexname::text,
        pg_size_pretty(pg_relation_size(i.indexname::regclass)) as index_size,
        COALESCE(s.idx_scan, 0) as usage_count,
        CASE 
            WHEN COALESCE(s.idx_scan, 0) = 0 THEN 'UNUSED'::text
            WHEN COALESCE(s.idx_scan, 0) < 100 THEN 'LOW_USAGE'::text
            WHEN COALESCE(s.idx_scan, 0) < 1000 THEN 'MEDIUM_USAGE'::text
            ELSE 'HIGH_USAGE'::text
        END as efficiency_rating
    FROM pg_indexes i
    LEFT JOIN pg_stat_user_indexes s ON i.indexname = s.indexname
    WHERE (i.indexname LIKE '%search_vector%' OR i.indexname LIKE '%tsvector%')
    AND i.schemaname = 'public';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Phase 6: Data Validation and Cleanup
-- المرحلة السادسة: التحقق من البيانات والتنظيف
-- =====================================================

-- Update existing search vectors for profiles
-- تحديث فهارس البحث الموجودة للملفات الشخصية
UPDATE profiles 
SET search_vector = (
    setweight(to_tsvector('simple', COALESCE(first_name, '')), 'A') ||
    setweight(to_tsvector('simple', COALESCE(last_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(city, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(medical_specialty, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(nationality, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(bio, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(looking_for, '')), 'D')
)
WHERE search_vector IS NULL OR search_vector = ''::tsvector;

-- Update existing search vectors for chat messages
-- تحديث فهارس البحث الموجودة للرسائل
UPDATE chat_messages 
SET search_vector = to_tsvector('english', COALESCE(content, ''))
WHERE search_vector IS NULL OR search_vector = ''::tsvector;

-- =====================================================
-- Phase 7: Advanced Analytics Functions
-- المرحلة السابعة: دوال التحليلات المتقدمة
-- =====================================================

-- Search Analytics Function
-- دالة تحليلات البحث
CREATE OR REPLACE FUNCTION get_search_analytics(
    date_from timestamp with time zone DEFAULT CURRENT_DATE - INTERVAL '30 days',
    date_to timestamp with time zone DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    search_term text,
    search_count bigint,
    avg_results_count numeric,
    success_rate numeric
) AS $$
BEGIN
    -- This would require implementing search logging
    -- For now, return placeholder data structure
    RETURN QUERY
    SELECT 
        'cardiology'::text as search_term,
        100::bigint as search_count,
        15.5::numeric as avg_results_count,
        85.2::numeric as success_rate
    WHERE FALSE; -- Placeholder - implement actual logging
END;
$$ LANGUAGE plpgsql;

-- Profile Matching Analytics
-- تحليلات مطابقة الملفات الشخصية
CREATE OR REPLACE FUNCTION get_matching_analytics()
RETURNS TABLE(
    specialty text,
    city text,
    active_profiles bigint,
    avg_completion numeric,
    match_success_rate numeric
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.medical_specialty,
        p.city,
        COUNT(*) as active_profiles,
        AVG(p.profile_completion) as avg_completion,
        COALESCE(
            (SELECT COUNT(*)::numeric FROM match_members mm 
             JOIN matches m ON mm.match_id = m.id 
             WHERE mm.profile_id = p.id AND m.status = 'active') / 
            NULLIF(COUNT(*), 0) * 100, 0
        ) as match_success_rate
    FROM profiles p
    WHERE p.is_verified = true 
    AND p.is_banned = false 
    AND p.deleted_at IS NULL
    GROUP BY p.medical_specialty, p.city
    HAVING COUNT(*) >= 5
    ORDER BY active_profiles DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Phase 8: Final Optimizations
-- المرحلة الثامنة: التحسينات النهائية
-- =====================================================

-- Update table statistics
ANALYZE profiles;
ANALYZE chat_messages;
ANALYZE chat_rooms;
ANALYZE matches;
ANALYZE match_members;
ANALYZE notifications;

-- Vacuum tables for better performance
VACUUM ANALYZE profiles;
VACUUM ANALYZE chat_messages;
VACUUM ANALYZE chat_rooms;
VACUUM ANALYZE matches;
VACUUM ANALYZE match_members;

-- =====================================================
-- Execution Summary
-- ملخص التنفيذ
-- =====================================================

SELECT 
    'Enhanced Database Optimization Complete' as status,
    now() as completed_at,
    'Advanced search, enhanced indexes, and monitoring systems applied' as description;

-- Check new index usage
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
AND (indexname LIKE '%search%' OR indexname LIKE '%advanced%')
ORDER BY idx_scan DESC;

-- Test search performance
SELECT * FROM monitor_search_performance();
SELECT * FROM monitor_text_search_usage();
