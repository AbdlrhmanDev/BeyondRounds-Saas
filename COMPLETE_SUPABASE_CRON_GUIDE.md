# 🚀 Complete Supabase CRON Setup for BeyondRounds

## Overview

This is the **definitive, all-in-one** Supabase CRON implementation for BeyondRounds. Everything you need is in one comprehensive script that implements the complete 7-step matching algorithm directly in your database.

## 🎯 What This Includes

### ✅ Complete 7-Step Algorithm
- **Step 1**: Fetch eligible users (verified, paid, onboarding complete, 6-week cooldown, city requirements)
- **Step 2**: Score pairs with exact formula (30% specialty + 40% interests + 20% city + 10% availability)
- **Step 3**: Greedy grouping with gender balance (3-4 person groups)
- **Step 4**: Database insertion (matches + match_members tables)
- **Step 5**: Chat message seeding (system welcome messages)
- **Step 6**: Notification preparation (logged for external processing)
- **Step 7**: Rollover candidate handling

### ✅ Production Features
- **Automatic scheduling** - Every Thursday at 16:00 UTC
- **Comprehensive logging** - All runs tracked in matching_logs table
- **Admin management** - Manual triggers and cron control
- **Error handling** - Robust exception handling and rollback
- **Performance monitoring** - Execution time tracking
- **Security** - RLS policies and role-based access

### ✅ Monitoring & Management
- Real-time statistics dashboard
- Matching history tracking
- Cron job status monitoring
- Manual testing capabilities
- Enable/disable controls

## 🚀 Quick Setup (5 Minutes)

### Step 1: Run the Complete Script

1. Open your **Supabase SQL Editor**
2. Copy the entire contents of `scripts/009_complete_supabase_cron_system.sql`
3. Paste and execute the script
4. Wait for completion (you'll see a success message)

### Step 2: Verify Installation

Run this verification query:

```sql
-- Check if everything was created successfully
SELECT 
  'Functions' as component,
  COUNT(*) as count
FROM pg_proc 
WHERE proname LIKE '%matching%'
UNION ALL
SELECT 
  'Cron Jobs' as component,
  COUNT(*) as count
FROM cron.job 
WHERE jobname = 'weekly-doctor-matching'
UNION ALL
SELECT 
  'Tables' as component,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matching_logs') THEN 1 ELSE 0 END
;
```

Expected output:
```
component  | count
-----------|------
Functions  | 15
Cron Jobs  | 1
Tables     | 1
```

### Step 3: Test the System

```sql
-- 1. Check your admin status
SELECT email, role FROM profiles WHERE id = auth.uid();

-- 2. Get current statistics
SELECT * FROM get_matching_statistics();

-- 3. Check eligible users
SELECT get_eligible_users_count();

-- 4. Test manual matching (admin only)
SELECT trigger_manual_matching();

-- 5. View matching history
SELECT * FROM get_matching_history(5);
```

## 📊 System Functions Reference

### Core Matching Functions
```sql
-- Get count of eligible users
SELECT get_eligible_users_count();

-- Get detailed statistics
SELECT * FROM get_matching_statistics();

-- Manual trigger (admin only)
SELECT trigger_manual_matching();

-- View matching history
SELECT * FROM get_matching_history(10);
```

### CRON Management Functions
```sql
-- Check cron job status
SELECT * FROM get_cron_job_status();

-- Setup/reset cron job (admin only)
SELECT setup_weekly_matching_cron();

-- Disable cron job (admin only)
SELECT disable_weekly_matching();

-- Re-enable cron job (admin only)
SELECT enable_weekly_matching();
```

### Monitoring Queries
```sql
-- Recent matching results
SELECT 
  week,
  groups_created,
  eligible_users,
  execution_time_ms,
  reason
FROM get_matching_history(5);

-- User readiness check
SELECT 
  total_users,
  verified_users,
  paid_users,
  eligible_users,
  matching_ready
FROM get_matching_statistics();

-- Active matches this week
SELECT 
  m.group_name,
  COUNT(mm.user_id) as member_count,
  m.created_at
FROM matches m
LEFT JOIN match_members mm ON m.id = mm.match_id
WHERE m.match_week = CURRENT_DATE
GROUP BY m.id, m.group_name, m.created_at;
```

## 🕐 Schedule Configuration

### Default Schedule
- **When**: Every Thursday at 16:00 UTC
- **Cron Expression**: `0 16 * * 4`
- **Job Name**: `weekly-doctor-matching`

### Timezone Adjustments

For different timezones, update the schedule:

```sql
-- For Saudi Arabia (UTC+3) - Run at 16:00 local time
SELECT cron.unschedule('weekly-doctor-matching');
SELECT cron.schedule(
  'weekly-doctor-matching',
  '0 13 * * 4',  -- 13:00 UTC = 16:00 Saudi time
  'SELECT run_weekly_matching();'
);

-- For EST (UTC-5) - Run at 16:00 local time  
SELECT cron.schedule(
  'weekly-doctor-matching',
  '0 21 * * 4',  -- 21:00 UTC = 16:00 EST
  'SELECT run_weekly_matching();'
);
```

## 📈 Performance & Scaling

### Expected Performance
- **Small database** (< 100 users): < 1 second
- **Medium database** (100-1000 users): 1-5 seconds  
- **Large database** (1000+ users): 5-30 seconds

### Optimization Tips
```sql
-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_profiles_matching 
ON profiles(is_verified, is_paid, onboarding_completed, city) 
WHERE is_verified = true AND is_paid = true AND onboarding_completed = true;

CREATE INDEX IF NOT EXISTS idx_matches_week ON matches(match_week);
CREATE INDEX IF NOT EXISTS idx_match_members_user_match ON match_members(user_id, match_id);
```

## 🔧 Configuration Options

### Algorithm Parameters

The matching algorithm uses these exact weights (as per your specification):

```sql
-- In calculate_pair_match_score function:
-- 30% specialty + 40% interests + 20% city + 10% availability
total_score := (specialty_score * 0.30) + 
               (interest_score * 0.40) + 
               (city_score * 0.20) + 
               (availability_score * 0.10);
```

### Matching Criteria

- **Minimum score**: 0.55 (pairs below this are rejected)
- **Re-match cooldown**: 6 weeks
- **City minimum**: 3 users per city
- **Group sizes**: 3-4 members
- **Gender balance**: Enforced per preferences

## 🚨 Troubleshooting

### Common Issues

#### 1. "extension pg_cron does not exist"
```sql
-- Check if pg_cron is available
CREATE EXTENSION IF NOT EXISTS pg_cron;
```
**Solution**: Upgrade to Supabase Pro plan

#### 2. "permission denied for schema cron"
**Solution**: Ensure you're running as database owner or service role

#### 3. "No eligible users found"
```sql
-- Debug user eligibility
SELECT 
  COUNT(*) FILTER (WHERE is_verified = true) as verified,
  COUNT(*) FILTER (WHERE is_paid = true) as paid,
  COUNT(*) FILTER (WHERE onboarding_completed = true) as onboarded,
  COUNT(*) as total
FROM profiles;
```

#### 4. "Admin access required"
```sql
-- Check/set admin role
SELECT role FROM profiles WHERE id = auth.uid();
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Debug Queries

```sql
-- Check system health
SELECT 
  'pg_cron available' as check,
  EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') as result
UNION ALL
SELECT 
  'Functions created' as check,
  (SELECT COUNT(*) FROM pg_proc WHERE proname LIKE '%matching%') > 10 as result
UNION ALL
SELECT 
  'Cron job scheduled' as check,
  EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'weekly-doctor-matching') as result
UNION ALL
SELECT 
  'Matching logs table' as check,
  EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matching_logs') as result;
```

## 📊 Sample Output

### Successful Matching Run
```json
{
  "success": true,
  "message": "Weekly matching completed",
  "week": "2025-09-12",
  "eligible_users": 15,
  "valid_pairs": 42,
  "groups_created": 3,
  "matched_users": 12,
  "rollover_candidates": 3,
  "execution_time_ms": 1250,
  "timestamp": "2025-09-12T16:00:01.234Z"
}
```

### Statistics Dashboard
```json
{
  "total_users": 50,
  "verified_users": 35,
  "paid_users": 30,
  "eligible_users": 15,
  "cities_with_min_users": 4,
  "matching_ready": true,
  "last_updated": "2025-09-12T10:30:00Z"
}
```

## 🔄 Migration from Vercel CRON

If switching from Vercel CRON:

1. **Disable Vercel CRON**:
   ```json
   // Remove from vercel.json
   {
     "crons": []
   }
   ```

2. **Run Supabase setup**:
   Execute `scripts/009_complete_supabase_cron_system.sql`

3. **Test migration**:
   ```sql
   SELECT trigger_manual_matching();
   ```

4. **Monitor for one week** to ensure proper operation

## 🎯 Advantages of This Implementation

### ✅ **Complete & Production-Ready**
- Full 7-step algorithm implementation
- Comprehensive error handling
- Performance monitoring
- Security policies

### ✅ **Database-Native Performance**
- No HTTP calls or external dependencies
- Atomic database transactions
- Optimized SQL queries
- Minimal latency

### ✅ **Easy Management**
- Admin dashboard functions
- One-click enable/disable
- Comprehensive logging
- Manual testing capabilities

### ✅ **Scalable Architecture**
- Handles databases of any size
- Efficient indexing strategy
- Memory-optimized algorithms
- Background execution

## 🚀 You're All Set!

Your BeyondRounds matching system is now fully operational with Supabase CRON. The system will:

- ✅ **Run automatically** every Thursday at 16:00 UTC
- ✅ **Create optimal groups** using the exact 7-step specification
- ✅ **Log all results** for monitoring and debugging
- ✅ **Handle errors gracefully** with comprehensive exception handling
- ✅ **Scale efficiently** as your user base grows

**Next Steps:**
1. Monitor the `matching_logs` table for weekly results
2. Use the admin functions to manage the system
3. Check the statistics dashboard regularly
4. Adjust the schedule if needed for your timezone

Your doctors will now be automatically matched every Thursday based on their specialties, interests, and availability! 🎉

