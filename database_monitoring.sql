-- =====================================================
-- BeyondRounds Database Performance Monitoring
-- مراقبة أداء قاعدة البيانات
-- =====================================================

-- =====================================================
-- 1. Performance Monitoring Queries
-- استعلامات مراقبة الأداء
-- =====================================================

-- Query 1: Table Sizes and Row Counts
-- حجم الجداول وعدد الصفوف
CREATE OR REPLACE VIEW v_table_stats AS
SELECT 
  schemaname,
  tablename,
  n_tup_ins - n_tup_del as row_count,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as table_size,
  pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) as index_size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
  pg_total_relation_size(schemaname||'.'||tablename) as total_size_bytes
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Query 2: Index Usage Statistics
-- إحصائيات استخدام الفهارس
CREATE OR REPLACE VIEW v_index_usage AS
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched,
  CASE 
    WHEN idx_scan = 0 THEN 'UNUSED'
    WHEN idx_scan < 100 THEN 'LOW_USAGE'
    WHEN idx_scan < 1000 THEN 'MEDIUM_USAGE'
    ELSE 'HIGH_USAGE'
  END as usage_level
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Query 3: Slow Query Analysis
-- تحليل الاستعلامات البطيئة
CREATE OR REPLACE VIEW v_slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  CASE 
    WHEN mean_time > 10000 THEN 'CRITICAL'
    WHEN mean_time > 5000 THEN 'HIGH'
    WHEN mean_time > 1000 THEN 'MEDIUM'
    ELSE 'LOW'
  END as performance_level
FROM pg_stat_statements 
WHERE mean_time > 100  -- queries taking more than 100ms
ORDER BY mean_time DESC;

-- Query 4: Database Connection Statistics
-- إحصائيات اتصالات قاعدة البيانات
CREATE OR REPLACE VIEW v_connection_stats AS
SELECT 
  datname as database_name,
  numbackends as active_connections,
  xact_commit as transactions_committed,
  xact_rollback as transactions_rolled_back,
  blks_read as blocks_read,
  blks_hit as blocks_hit,
  tup_returned as tuples_returned,
  tup_fetched as tuples_fetched,
  tup_inserted as tuples_inserted,
  tup_updated as tuples_updated,
  tup_deleted as tuples_deleted
FROM pg_stat_database 
WHERE datname = current_database();

-- =====================================================
-- 2. Health Check Functions
-- دوال فحص الصحة
-- =====================================================

-- Function: Check Database Health
-- دالة فحص صحة قاعدة البيانات
CREATE OR REPLACE FUNCTION check_database_health()
RETURNS TABLE(
  check_name text,
  status text,
  details text,
  recommendation text
) AS $$
BEGIN
  -- Check 1: Unused Indexes
  RETURN QUERY
  SELECT 
    'Unused Indexes'::text as check_name,
    CASE 
      WHEN COUNT(*) = 0 THEN 'HEALTHY'::text
      ELSE 'WARNING'::text
    END as status,
    COUNT(*)::text || ' unused indexes found' as details,
    'Consider dropping unused indexes to improve write performance' as recommendation
  FROM pg_stat_user_indexes 
  WHERE schemaname = 'public' AND idx_scan = 0;
  
  -- Check 2: Large Tables Without Indexes
  RETURN QUERY
  SELECT 
    'Large Tables Without Indexes'::text as check_name,
    CASE 
      WHEN COUNT(*) = 0 THEN 'HEALTHY'::text
      ELSE 'WARNING'::text
    END as status,
    COUNT(*)::text || ' large tables without proper indexes' as details,
    'Add indexes to improve query performance' as recommendation
  FROM pg_stat_user_tables t
  WHERE schemaname = 'public' 
    AND pg_total_relation_size(schemaname||'.'||tablename) > 100000000  -- 100MB
    AND NOT EXISTS (
      SELECT 1 FROM pg_stat_user_indexes i 
      WHERE i.schemaname = t.schemaname AND i.tablename = t.tablename
    );
  
  -- Check 3: Missing Primary Keys
  RETURN QUERY
  SELECT 
    'Missing Primary Keys'::text as check_name,
    CASE 
      WHEN COUNT(*) = 0 THEN 'HEALTHY'::text
      ELSE 'CRITICAL'::text
    END as status,
    COUNT(*)::text || ' tables without primary keys' as details,
    'Add primary keys to all tables for data integrity' as recommendation
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints tc
      WHERE tc.table_schema = t.table_schema 
        AND tc.table_name = t.table_name 
        AND tc.constraint_type = 'PRIMARY KEY'
    );
  
  -- Check 4: Orphaned Records
  RETURN QUERY
  SELECT 
    'Orphaned Records'::text as check_name,
    CASE 
      WHEN COUNT(*) = 0 THEN 'HEALTHY'::text
      ELSE 'WARNING'::text
    END as status,
    COUNT(*)::text || ' orphaned records found' as details,
    'Clean up orphaned records to maintain data integrity' as recommendation
  FROM (
    SELECT COUNT(*) as orphaned_count FROM match_members mm
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = mm.profile_id)
    UNION ALL
    SELECT COUNT(*) FROM chat_messages cm
    WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = cm.sender_id)
  ) orphaned_checks;
  
  -- Check 5: Database Size
  RETURN QUERY
  SELECT 
    'Database Size'::text as check_name,
    CASE 
      WHEN pg_database_size(current_database()) < 1000000000 THEN 'HEALTHY'::text  -- 1GB
      WHEN pg_database_size(current_database()) < 5000000000 THEN 'WARNING'::text  -- 5GB
      ELSE 'CRITICAL'::text
    END as status,
    pg_size_pretty(pg_database_size(current_database())) as details,
    'Monitor database growth and consider archiving old data' as recommendation;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. Performance Optimization Recommendations
-- توصيات تحسين الأداء
-- =====================================================

-- Function: Get Performance Recommendations
-- دالة الحصول على توصيات الأداء
CREATE OR REPLACE FUNCTION get_performance_recommendations()
RETURNS TABLE(
  recommendation_type text,
  priority text,
  description text,
  sql_command text
) AS $$
BEGIN
  -- Recommendation 1: Add Missing Indexes
  RETURN QUERY
  SELECT 
    'Missing Index'::text as recommendation_type,
    'HIGH'::text as priority,
    'Add index on frequently queried columns' as description,
    'CREATE INDEX CONCURRENTLY idx_profiles_city_specialty ON profiles(city, medical_specialty);' as sql_command
  WHERE NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'profiles' AND indexname = 'idx_profiles_city_specialty'
  );
  
  -- Recommendation 2: Update Statistics
  RETURN QUERY
  SELECT 
    'Statistics Update'::text as recommendation_type,
    'MEDIUM'::text as priority,
    'Update table statistics for better query planning' as description,
    'ANALYZE profiles, matches, chat_messages, notifications;' as sql_command;
  
  -- Recommendation 3: Vacuum Tables
  RETURN QUERY
  SELECT 
    'Vacuum'::text as recommendation_type,
    'MEDIUM'::text as priority,
    'Vacuum tables to reclaim space and update statistics' as description,
    'VACUUM ANALYZE profiles, matches, chat_messages;' as sql_command;
  
  -- Recommendation 4: Check for Long Running Queries
  RETURN QUERY
  SELECT 
    'Query Optimization'::text as recommendation_type,
    'HIGH'::text as priority,
    'Review and optimize slow queries' as description,
    'SELECT * FROM v_slow_queries WHERE performance_level IN (''CRITICAL'', ''HIGH'');' as sql_command;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. Automated Maintenance Functions
-- دوال الصيانة التلقائية
-- =====================================================

-- Function: Automated Maintenance
-- دالة الصيانة التلقائية
CREATE OR REPLACE FUNCTION run_automated_maintenance()
RETURNS TABLE(
  maintenance_task text,
  status text,
  details text
) AS $$
BEGIN
  -- Task 1: Update Statistics
  BEGIN
    ANALYZE profiles, matches, match_members, chat_messages, notifications, feedback;
    RETURN QUERY SELECT 'Update Statistics'::text, 'SUCCESS'::text, 'Statistics updated for all major tables'::text;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'Update Statistics'::text, 'FAILED'::text, SQLERRM::text;
  END;
  
  -- Task 2: Vacuum Tables
  BEGIN
    VACUUM ANALYZE profiles, matches, match_members, chat_messages, notifications;
    RETURN QUERY SELECT 'Vacuum Tables'::text, 'SUCCESS'::text, 'Tables vacuumed and analyzed'::text;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'Vacuum Tables'::text, 'FAILED'::text, SQLERRM::text;
  END;
  
  -- Task 3: Clean Up Orphaned Records
  BEGIN
    DELETE FROM match_members WHERE profile_id NOT IN (SELECT id FROM profiles);
    DELETE FROM chat_messages WHERE sender_id NOT IN (SELECT id FROM profiles);
    DELETE FROM notifications WHERE profile_id NOT IN (SELECT id FROM profiles);
    RETURN QUERY SELECT 'Clean Orphaned Records'::text, 'SUCCESS'::text, 'Orphaned records cleaned up'::text;
  EXCEPTION WHEN OTHERS THEN
    RETURN QUERY SELECT 'Clean Orphaned Records'::text, 'FAILED'::text, SQLERRM::text;
  END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. Monitoring Dashboard Queries
-- استعلامات لوحة المراقبة
-- =====================================================

-- Dashboard Query 1: System Overview
-- نظرة عامة على النظام
CREATE OR REPLACE VIEW v_system_overview AS
SELECT 
  'Database Size' as metric,
  pg_size_pretty(pg_database_size(current_database())) as value,
  'Total database size' as description
UNION ALL
SELECT 
  'Active Connections',
  numbackends::text,
  'Current active connections'
FROM pg_stat_database WHERE datname = current_database()
UNION ALL
SELECT 
  'Total Tables',
  COUNT(*)::text,
  'Number of tables in public schema'
FROM information_schema.tables WHERE table_schema = 'public'
UNION ALL
SELECT 
  'Total Indexes',
  COUNT(*)::text,
  'Number of indexes in public schema'
FROM pg_indexes WHERE schemaname = 'public';

-- Dashboard Query 2: Performance Metrics
-- مقاييس الأداء
CREATE OR REPLACE VIEW v_performance_metrics AS
SELECT 
  'Average Query Time' as metric,
  ROUND(AVG(mean_time), 2)::text || ' ms' as value,
  'Average execution time of queries' as description
FROM pg_stat_statements
UNION ALL
SELECT 
  'Total Queries Executed',
  SUM(calls)::text,
  'Total number of queries executed'
FROM pg_stat_statements
UNION ALL
SELECT 
  'Cache Hit Ratio',
  ROUND((blks_hit::numeric / (blks_hit + blks_read)) * 100, 2)::text || '%',
  'Percentage of cache hits'
FROM pg_stat_database WHERE datname = current_database()
UNION ALL
SELECT 
  'Index Usage Rate',
  ROUND((COUNT(*) FILTER (WHERE idx_scan > 0)::numeric / COUNT(*)) * 100, 2)::text || '%',
  'Percentage of indexes being used'
FROM pg_stat_user_indexes WHERE schemaname = 'public';

-- =====================================================
-- 6. Alert Functions
-- دوال التنبيهات
-- =====================================================

-- Function: Check for Critical Issues
-- دالة فحص المشاكل الحرجة
CREATE OR REPLACE FUNCTION check_critical_alerts()
RETURNS TABLE(
  alert_type text,
  severity text,
  message text,
  action_required text
) AS $$
BEGIN
  -- Alert 1: Database Size Too Large
  IF pg_database_size(current_database()) > 10000000000 THEN  -- 10GB
    RETURN QUERY SELECT 
      'Database Size'::text,
      'CRITICAL'::text,
      'Database size exceeds 10GB'::text,
      'Consider archiving old data or increasing storage'::text;
  END IF;
  
  -- Alert 2: Too Many Unused Indexes
  IF (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE schemaname = 'public' AND idx_scan = 0) > 10 THEN
    RETURN QUERY SELECT 
      'Unused Indexes'::text,
      'WARNING'::text,
      'More than 10 unused indexes detected'::text,
      'Review and drop unused indexes'::text;
  END IF;
  
  -- Alert 3: High Number of Orphaned Records
  IF (SELECT COUNT(*) FROM match_members WHERE profile_id NOT IN (SELECT id FROM profiles)) > 100 THEN
    RETURN QUERY SELECT 
      'Orphaned Records'::text,
      'WARNING'::text,
      'More than 100 orphaned records detected'::text,
      'Clean up orphaned records'::text;
  END IF;
  
  -- Alert 4: Slow Queries
  IF (SELECT COUNT(*) FROM pg_stat_statements WHERE mean_time > 5000) > 5 THEN
    RETURN QUERY SELECT 
      'Slow Queries'::text,
      'HIGH'::text,
      'More than 5 queries taking longer than 5 seconds'::text,
      'Optimize slow queries'::text;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. Usage Instructions
-- تعليمات الاستخدام
-- =====================================================

-- To use these monitoring tools, run the following queries:

-- 1. Check overall database health:
-- SELECT * FROM check_database_health();

-- 2. Get performance recommendations:
-- SELECT * FROM get_performance_recommendations();

-- 3. Run automated maintenance:
-- SELECT * FROM run_automated_maintenance();

-- 4. Check for critical alerts:
-- SELECT * FROM check_critical_alerts();

-- 5. View system overview:
-- SELECT * FROM v_system_overview;

-- 6. View performance metrics:
-- SELECT * FROM v_performance_metrics;

-- 7. Check table statistics:
-- SELECT * FROM v_table_stats;

-- 8. Check index usage:
-- SELECT * FROM v_index_usage;

-- 9. Check slow queries:
-- SELECT * FROM v_slow_queries;

-- =====================================================
-- 8. Scheduled Maintenance Setup
-- إعداد الصيانة المجدولة
-- =====================================================

-- Create a function to run daily maintenance
CREATE OR REPLACE FUNCTION daily_maintenance()
RETURNS void AS $$
BEGIN
  -- Update statistics
  ANALYZE profiles, matches, match_members, chat_messages, notifications, feedback;
  
  -- Vacuum tables
  VACUUM ANALYZE profiles, matches, match_members, chat_messages, notifications;
  
  -- Log maintenance completion
  INSERT INTO audit_log (table_name, operation, record_id, new_values)
  VALUES ('maintenance', 'UPDATE', gen_random_uuid(), 
          jsonb_build_object('maintenance_type', 'daily', 'completed_at', now()));
END;
$$ LANGUAGE plpgsql;

-- Create a function to run weekly maintenance
CREATE OR REPLACE FUNCTION weekly_maintenance()
RETURNS void AS $$
BEGIN
  -- Run daily maintenance
  PERFORM daily_maintenance();
  
  -- Additional weekly tasks
  VACUUM FULL profiles, matches, match_members, chat_messages, notifications;
  
  -- Log maintenance completion
  INSERT INTO audit_log (table_name, operation, record_id, new_values)
  VALUES ('maintenance', 'UPDATE', gen_random_uuid(), 
          jsonb_build_object('maintenance_type', 'weekly', 'completed_at', now()));
END;
$$ LANGUAGE plpgsql;


