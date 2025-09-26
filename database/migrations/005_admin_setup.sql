-- ==============================================
-- Migration 005: Admin Setup
-- ==============================================
-- Run this script to set up admin user and permissions
-- IMPORTANT: Replace the email with your actual admin email

-- ==============================================
-- ADMIN USER SETUP
-- ==============================================

-- Set your email as admin (replace with your actual email)
-- This assumes you've already created the user through Supabase Auth
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'abdlrhmannabil2020@gmail.com';

-- If the user doesn't exist yet, you can create them manually:
-- 1. Go to Supabase Auth dashboard
-- 2. Create a new user with email: abdlrhmannabil2020@gmail.com
-- 3. Run the UPDATE statement above

-- ==============================================
-- ADMIN PERMISSIONS VERIFICATION
-- ==============================================

-- Verify admin user exists and has correct role
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_verified,
  is_paid,
  onboarding_completed,
  created_at
FROM profiles 
WHERE role = 'admin';

-- ==============================================
-- ADMIN FUNCTIONS TEST
-- ==============================================

-- Test admin functions (run as admin user)
-- Get system statistics
SELECT * FROM get_system_statistics();

-- Check verification requests
SELECT 
  vr.id,
  vr.status,
  p.first_name,
  p.last_name,
  p.email,
  vr.created_at
FROM verification_requests vr
JOIN profiles p ON vr.user_id = p.id
ORDER BY vr.created_at DESC;

-- ==============================================
-- ADMIN DASHBOARD QUERIES
-- ==============================================

-- Get all users with their verification and payment status
SELECT 
  p.id,
  p.email,
  p.first_name,
  p.last_name,
  p.city,
  p.specialties,
  p.is_verified,
  p.is_paid,
  p.onboarding_completed,
  p.profile_completion_percentage,
  p.created_at,
  p.last_active_at
FROM profiles p
ORDER BY p.created_at DESC;

-- Get recent matches
SELECT 
  m.id,
  m.group_name,
  m.status,
  m.match_week,
  m.group_size,
  m.average_compatibility_score,
  m.created_at,
  COUNT(mm.user_id) as actual_members
FROM matches m
LEFT JOIN match_members mm ON m.id = mm.match_id AND mm.is_active = true
GROUP BY m.id, m.group_name, m.status, m.match_week, m.group_size, m.average_compatibility_score, m.created_at
ORDER BY m.created_at DESC;

-- Get verification requests pending review
SELECT 
  vr.id,
  vr.user_id,
  p.first_name,
  p.last_name,
  p.email,
  vr.license_number,
  vr.license_state,
  vr.status,
  vr.created_at
FROM verification_requests vr
JOIN profiles p ON vr.user_id = p.id
WHERE vr.status = 'pending'
ORDER BY vr.created_at ASC;

-- Get payment history
SELECT 
  ph.id,
  ph.user_id,
  p.first_name,
  p.last_name,
  p.email,
  ph.amount,
  ph.currency,
  ph.status,
  ph.subscription_period_start,
  ph.subscription_period_end,
  ph.created_at
FROM payment_history ph
JOIN profiles p ON ph.user_id = p.id
ORDER BY ph.created_at DESC;

-- Get matching logs
SELECT 
  ml.id,
  ml.week,
  ml.groups_created,
  ml.eligible_users,
  ml.valid_pairs,
  ml.rollover_users,
  ml.reason,
  ml.error_message,
  ml.execution_time_ms,
  ml.created_at
FROM matching_logs ml
ORDER BY ml.created_at DESC;

-- ==============================================
-- ADMIN ACTIONS
-- ==============================================

-- Approve a verification request (replace with actual verification ID)
-- SELECT approve_verification_request('verification-uuid-here', 'admin-user-uuid-here');

-- Reject a verification request (replace with actual verification ID)
-- SELECT reject_verification_request('verification-uuid-here', 'admin-user-uuid-here', 'Reason for rejection');

-- ==============================================
-- CLEANUP OPERATIONS
-- ==============================================

-- Archive old matches (run periodically)
-- SELECT archive_old_matches();

-- Clean up old verification documents (run periodically)
-- SELECT cleanup_old_verification_documents();

-- Clean up old notifications (run periodically)
-- SELECT cleanup_old_notifications();

-- Clean up old matching logs (run periodically)
-- SELECT cleanup_old_matching_logs();

-- ==============================================
-- MONITORING QUERIES
-- ==============================================

-- Check system health
SELECT 
  'Total Users' as metric,
  COUNT(*)::TEXT as value
FROM profiles
UNION ALL
SELECT 
  'Verified Users',
  COUNT(*)::TEXT
FROM profiles WHERE is_verified = true
UNION ALL
SELECT 
  'Paid Users',
  COUNT(*)::TEXT
FROM profiles WHERE is_paid = true
UNION ALL
SELECT 
  'Active Matches',
  COUNT(*)::TEXT
FROM matches WHERE status = 'active'
UNION ALL
SELECT 
  'Pending Verifications',
  COUNT(*)::TEXT
FROM verification_requests WHERE status = 'pending'
UNION ALL
SELECT 
  'Messages Today',
  COUNT(*)::TEXT
FROM chat_messages WHERE created_at >= CURRENT_DATE;

-- Check user activity
SELECT 
  DATE_TRUNC('day', created_at) as date,
  COUNT(*) as new_users
FROM profiles
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Check match success rate
SELECT 
  DATE_TRUNC('week', created_at) as week,
  COUNT(*) as total_matches,
  AVG(group_size) as avg_group_size,
  AVG(average_compatibility_score) as avg_compatibility
FROM matches
WHERE created_at >= CURRENT_DATE - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY week DESC;

-- ==============================================
-- SECURITY CHECKS
-- ==============================================

-- Verify RLS is enabled on all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('profiles', 'matches', 'match_members', 'chat_messages', 'notifications', 'verification_requests', 'payment_history', 'user_preferences', 'matching_logs')
ORDER BY tablename;

-- Check admin policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
  AND policyname LIKE '%Admin%'
ORDER BY tablename, policyname;
