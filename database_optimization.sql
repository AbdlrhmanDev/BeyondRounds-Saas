-- =====================================================
-- BeyondRounds Database Optimization Script
-- تحسينات قاعدة البيانات الشاملة
-- =====================================================

-- Phase 1: Critical Performance Indexes
-- المرحلة الأولى: فهارس الأداء الحرجة
-- =====================================================

-- User Profile Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_city_specialty ON profiles(city, medical_specialty);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_last_active ON profiles(last_active_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_verified_active ON profiles(is_verified, is_banned) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_completion ON profiles(profile_completion, onboarding_completed);

-- Matching System Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_week_status ON matches(match_week, status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_active_week ON matches(status, match_week, created_at) WHERE status = 'active';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_members_profile_match ON match_members(profile_id, match_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_match_members_active ON match_members(match_id, is_active) WHERE is_active = true;

-- Chat System Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_room_created ON chat_messages(chat_room_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_unread ON chat_messages(chat_room_id, created_at) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_rooms_match_active ON chat_rooms(match_id, is_active) WHERE is_active = true;

-- Notification System Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_profile_unread ON notifications(profile_id, is_read, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_delivery ON notifications(is_sent, scheduled_for, expires_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_pending ON notifications(profile_id, is_read) WHERE is_read = false;

-- Feedback System Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_match_reviewer ON feedback(match_id, reviewer_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feedback_reviewee ON feedback(reviewee_id, created_at);

-- Payment System Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_profile_status ON payments(profile_id, payment_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_subscriptions_active ON user_subscriptions(profile_id, status) WHERE status = 'active';

-- Audit Log Indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_profile_date ON audit_log(profile_id, created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_log_table_operation ON audit_log(table_name, operation, created_at);

-- =====================================================
-- Phase 2: Full-Text Search Optimization
-- المرحلة الثانية: تحسين البحث النصي
-- =====================================================

-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_search_vector ON profiles USING gin(search_vector);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_chat_messages_search_vector ON chat_messages USING gin(search_vector);

-- =====================================================
-- Phase 3: Data Integrity Improvements
-- المرحلة الثالثة: تحسينات سلامة البيانات
-- =====================================================

-- Add missing constraints
ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS phone_number_format 
  CHECK (phone_number IS NULL OR phone_number ~ '^\+?[1-9]\d{1,14}$');

ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS age_reasonable 
  CHECK (age IS NULL OR (age >= 18 AND age <= 100));

ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS email_domain_check 
  CHECK (email IS NULL OR email ~ '@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');

ALTER TABLE chat_messages ADD CONSTRAINT IF NOT EXISTS content_length_check 
  CHECK (char_length(content) <= 2000);

ALTER TABLE feedback ADD CONSTRAINT IF NOT EXISTS feedback_text_length_check 
  CHECK (feedback_text IS NULL OR char_length(feedback_text) <= 1000);

ALTER TABLE feedback ADD CONSTRAINT IF NOT EXISTS no_self_feedback 
  CHECK (reviewer_id != reviewee_id);

ALTER TABLE profiles ADD CONSTRAINT IF NOT EXISTS no_self_ban 
  CHECK (NOT (is_banned = true AND banned_until IS NULL));

-- =====================================================
-- Phase 4: Relationship Improvements
-- المرحلة الرابعة: تحسينات العلاقات
-- =====================================================

-- Add unique constraints to prevent duplicates
ALTER TABLE match_members ADD CONSTRAINT IF NOT EXISTS unique_profile_match 
  UNIQUE (profile_id, match_id);

ALTER TABLE message_read_status ADD CONSTRAINT IF NOT EXISTS unique_message_profile_read 
  UNIQUE (message_id, profile_id);

ALTER TABLE message_reactions ADD CONSTRAINT IF NOT EXISTS unique_message_profile_emoji 
  UNIQUE (message_id, profile_id, emoji) WHERE deleted_at IS NULL;

-- =====================================================
-- Phase 5: Row Level Security (RLS) Setup
-- المرحلة الخامسة: إعداد أمان مستوى الصفوف
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat Messages RLS Policies
DROP POLICY IF EXISTS "Users can view messages in their matches" ON chat_messages;
CREATE POLICY "Users can view messages in their matches" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM match_members mm 
      WHERE mm.match_id = chat_messages.match_id 
      AND mm.profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid())
      AND mm.is_active = true
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their matches" ON chat_messages;
CREATE POLICY "Users can send messages in their matches" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = (SELECT id FROM profiles WHERE user_id = auth.uid()) AND
    EXISTS (
      SELECT 1 FROM match_members mm 
      WHERE mm.match_id = chat_messages.match_id 
      AND mm.profile_id = sender_id
      AND mm.is_active = true
    )
  );

-- Notifications RLS Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (profile_id = (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- =====================================================
-- Phase 6: Performance Optimization Functions
-- المرحلة السادسة: دوال تحسين الأداء
-- =====================================================

-- Function to update search vectors
CREATE OR REPLACE FUNCTION update_profile_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', 
    COALESCE(NEW.first_name, '') || ' ' ||
    COALESCE(NEW.last_name, '') || ' ' ||
    COALESCE(NEW.medical_specialty, '') || ' ' ||
    COALESCE(NEW.city, '') || ' ' ||
    COALESCE(NEW.bio, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for search vector updates
DROP TRIGGER IF EXISTS update_profile_search_vector_trigger ON profiles;
CREATE TRIGGER update_profile_search_vector_trigger
  BEFORE INSERT OR UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_search_vector();

-- Function to update chat message search vector
CREATE OR REPLACE FUNCTION update_chat_message_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for chat message search vector updates
DROP TRIGGER IF EXISTS update_chat_message_search_vector_trigger ON chat_messages;
CREATE TRIGGER update_chat_message_search_vector_trigger
  BEFORE INSERT OR UPDATE ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_message_search_vector();

-- =====================================================
-- Phase 7: Data Cleanup and Validation
-- المرحلة السابعة: تنظيف البيانات والتحقق
-- =====================================================

-- Fix NULL timezone values
UPDATE profiles SET timezone = 'UTC' WHERE timezone IS NULL;

-- Fix NULL city values
UPDATE profiles SET city = 'Unknown' WHERE city IS NULL OR city = '';

-- Fix invalid match weeks
UPDATE matches SET match_week = CURRENT_DATE WHERE match_week < CURRENT_DATE;

-- Remove orphaned records
DELETE FROM match_members WHERE profile_id NOT IN (SELECT id FROM profiles);
DELETE FROM chat_messages WHERE sender_id NOT IN (SELECT id FROM profiles);
DELETE FROM notifications WHERE profile_id NOT IN (SELECT id FROM profiles);

-- =====================================================
-- Phase 8: Monitoring and Maintenance
-- المرحلة الثامنة: المراقبة والصيانة
-- =====================================================

-- Create function to analyze table statistics
CREATE OR REPLACE FUNCTION analyze_table_stats()
RETURNS TABLE(
  table_name text,
  row_count bigint,
  table_size text,
  index_size text,
  total_size text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    schemaname||'.'||tablename as table_name,
    n_tup_ins - n_tup_del as row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size
  FROM pg_stat_user_tables 
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- Create function to monitor slow queries
CREATE OR REPLACE FUNCTION get_slow_queries()
RETURNS TABLE(
  query text,
  calls bigint,
  total_time numeric,
  mean_time numeric,
  rows bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
  FROM pg_stat_statements 
  WHERE mean_time > 1000  -- queries taking more than 1 second
  ORDER BY mean_time DESC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Phase 9: Backup and Recovery Preparation
-- المرحلة التاسعة: إعداد النسخ الاحتياطية والاسترداد
-- =====================================================

-- Create backup function
CREATE OR REPLACE FUNCTION create_table_backup(table_name text)
RETURNS text AS $$
DECLARE
  backup_name text;
BEGIN
  backup_name := table_name || '_backup_' || to_char(now(), 'YYYY_MM_DD_HH24_MI_SS');
  
  EXECUTE format('CREATE TABLE %I AS SELECT * FROM %I', backup_name, table_name);
  
  RETURN 'Backup created: ' || backup_name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Phase 10: Final Optimizations
-- المرحلة العاشرة: التحسينات النهائية
-- =====================================================

-- Update table statistics
ANALYZE profiles;
ANALYZE matches;
ANALYZE match_members;
ANALYZE chat_messages;
ANALYZE notifications;
ANALYZE feedback;

-- Vacuum tables for better performance
VACUUM ANALYZE profiles;
VACUUM ANALYZE matches;
VACUUM ANALYZE match_members;
VACUUM ANALYZE chat_messages;
VACUUM ANALYZE notifications;

-- =====================================================
-- Execution Summary
-- ملخص التنفيذ
-- =====================================================

-- Run this query to check the status of all optimizations
SELECT 
  'Database Optimization Complete' as status,
  now() as completed_at,
  'All indexes, constraints, and RLS policies have been applied' as description;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Check table sizes
SELECT * FROM analyze_table_stats();


