# 🕐 Supabase CRON Job Setup for BeyondRounds

## Overview

This guide shows you how to set up the BeyondRounds Weekly Matching Engine to run directly in your Supabase database using **pg_cron**. This approach runs the matching algorithm entirely within PostgreSQL, eliminating the need for external CRON services.

## ⚠️ Prerequisites

1. **Supabase Pro Plan** - pg_cron extension requires a paid plan
2. **Database Extensions** - Ability to enable PostgreSQL extensions
3. **Admin Access** - Supabase dashboard access for SQL execution

## 🚀 Setup Instructions

### Step 1: Enable pg_cron Extension

In your Supabase SQL Editor, run:

```sql
-- Enable the pg_cron extension (Pro plan required)
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

### Step 2: Run the Complete Setup Script

Execute the complete setup script in your Supabase SQL Editor:

```bash
# Copy and paste the contents of scripts/007_supabase_cron_matching.sql
# into your Supabase SQL Editor and execute
```

This script will:
- ✅ Create all necessary database functions
- ✅ Set up the weekly matching algorithm
- ✅ Schedule the CRON job for every Thursday at 16:00 UTC
- ✅ Create monitoring and management functions

### Step 3: Verify Installation

Check if the CRON job is scheduled:

```sql
-- Verify the cron job is scheduled
SELECT * FROM cron.job WHERE jobname = 'weekly-doctor-matching';
```

You should see output like:
```
jobid | schedule  | command                        | jobname
------|-----------|--------------------------------|------------------------
1     | 0 16 * * 4| SELECT run_weekly_matching();  | weekly-doctor-matching
```

## 🎯 How It Works

### Database Functions Created

1. **`get_eligible_users_for_matching()`**
   - Fetches users meeting all eligibility criteria
   - Handles 6-week re-matching cooldown
   - Enforces city minimum (3+ users)

2. **`calculate_specialty_similarity()`**
   - Scores medical specialty compatibility
   - Supports both legacy and new specialty fields

3. **`calculate_shared_interest_ratio()`**
   - Calculates interest overlap across all categories
   - Combines interests, hobbies, music, movies, activities

4. **`calculate_availability_overlap()`**
   - Measures availability slot compatibility

5. **`run_weekly_matching()`**
   - Main matching engine function
   - Creates groups and database records
   - Seeds chat messages
   - Logs results

### CRON Schedule

```sql
-- Runs every Thursday at 16:00 UTC
SELECT cron.schedule(
  'weekly-doctor-matching',           -- Job name
  '0 16 * * 4',                      -- Every Thursday at 16:00 UTC
  'SELECT run_weekly_matching();'     -- Command to execute
);
```

## 🔧 Management Functions

### Manual Trigger (Admin Only)

```sql
-- Manually run matching (for testing)
SELECT trigger_manual_matching();
```

### Check Matching History

```sql
-- Get last 10 matching runs
SELECT * FROM get_matching_history(10);
```

### Monitor CRON Job Status

```sql
-- Check if cron job is active
SELECT * FROM get_cron_job_status();
```

### Disable/Enable CRON Job

```sql
-- Disable matching (admin only)
SELECT disable_weekly_matching();

-- Re-enable matching (admin only)  
SELECT enable_weekly_matching();
```

## 📊 Monitoring & Logging

All matching runs are logged to the `matching_logs` table:

```sql
-- View recent matching logs
SELECT 
  week,
  groups_created,
  eligible_users,
  reason,
  created_at
FROM matching_logs 
ORDER BY week DESC 
LIMIT 5;
```

Example output:
```
week       | groups_created | eligible_users | reason
-----------|----------------|----------------|------------------
2025-09-12 | 3             | 15             | Success - Created 3 groups
2025-09-05 | 0             | 8              | Insufficient eligible users
2025-08-29 | 4             | 18             | Success - Created 4 groups
```

## 🌍 Timezone Configuration

The CRON job runs at **16:00 UTC**. To adjust for your local timezone:

### Saudi Arabia (UTC+3)
- 16:00 UTC = 19:00 Saudi time
- To run at 16:00 Saudi time, use: `'0 13 * * 4'` (13:00 UTC)

### Update Timezone Example
```sql
-- Reschedule for 16:00 Saudi time (13:00 UTC)
SELECT cron.unschedule('weekly-doctor-matching');
SELECT cron.schedule(
  'weekly-doctor-matching',
  '0 13 * * 4',  -- 13:00 UTC = 16:00 Saudi time
  'SELECT run_weekly_matching();'
);
```

## 🔐 Security & Permissions

### Function Security
- All functions use `SECURITY DEFINER` for proper permissions
- Admin functions check user roles internally
- Service role has execution permissions for CRON

### RLS Policies
- `matching_logs` table has RLS enabled
- Only admins can view matching logs
- Regular users can view their own match data

## 🚨 Troubleshooting

### Common Issues

1. **"pg_cron extension not found"**
   - Ensure you're on Supabase Pro plan
   - Enable the extension: `CREATE EXTENSION IF NOT EXISTS pg_cron;`

2. **"Permission denied for cron.schedule"**
   - Ensure you're running as a superuser or service role
   - Check database permissions

3. **"No eligible users found"**
   - Verify users have `is_verified = true` and `is_paid = true`
   - Check `onboarding_completed = true`
   - Ensure cities have 3+ users

4. **CRON job not running**
   - Check job status: `SELECT * FROM cron.job;`
   - Verify schedule format
   - Check database logs for errors

### Debug Queries

```sql
-- Check eligible users count
SELECT COUNT(*) FROM get_eligible_users_for_matching();

-- Test matching manually
SELECT trigger_manual_matching();

-- View all cron jobs
SELECT * FROM cron.job;

-- Check recent logs
SELECT * FROM matching_logs ORDER BY created_at DESC LIMIT 5;
```

## 📈 Performance Optimization

### Database Indexes
Ensure these indexes exist for optimal performance:

```sql
-- Core matching indexes
CREATE INDEX IF NOT EXISTS idx_profiles_matching 
ON profiles(is_verified, is_paid, city) 
WHERE is_verified = true AND is_paid = true;

CREATE INDEX IF NOT EXISTS idx_profiles_onboarding 
ON profiles(onboarding_completed) 
WHERE onboarding_completed = true;

CREATE INDEX IF NOT EXISTS idx_matches_week 
ON matches(match_week);

CREATE INDEX IF NOT EXISTS idx_match_members_user 
ON match_members(user_id);
```

## 🆚 Comparison: Supabase CRON vs Vercel CRON

| Feature | Supabase CRON | Vercel CRON |
|---------|---------------|-------------|
| **Cost** | Included with Pro plan | Free with limits |
| **Reliability** | High (database-native) | High (Vercel infrastructure) |
| **Latency** | Very low (no API calls) | Higher (HTTP requests) |
| **Debugging** | SQL logs in database | Vercel function logs |
| **Complexity** | Medium (SQL functions) | Low (TypeScript/JavaScript) |
| **Scalability** | Database-limited | Serverless auto-scaling |
| **Maintenance** | Database management | Code deployment |

## 🎯 Advantages of Supabase CRON

### ✅ Benefits
- **No external dependencies** - Everything runs in your database
- **Lower latency** - No HTTP requests or API calls
- **Better security** - No exposed endpoints
- **Atomic operations** - Database transactions ensure consistency
- **Centralized logging** - All logs in your database
- **Cost effective** - No additional serverless function costs

### ⚠️ Considerations
- **Pro plan required** - pg_cron needs paid Supabase plan
- **SQL complexity** - More complex than JavaScript/TypeScript
- **Limited debugging** - Fewer debugging tools than application code
- **Database load** - Processing happens in your database

## 🔄 Migration from Vercel CRON

If you're switching from Vercel CRON to Supabase CRON:

1. **Disable Vercel CRON**:
   ```json
   // Remove from vercel.json
   {
     "crons": []
   }
   ```

2. **Run Supabase setup script**:
   ```sql
   -- Execute scripts/007_supabase_cron_matching.sql
   ```

3. **Test the migration**:
   ```sql
   SELECT trigger_manual_matching();
   ```

4. **Monitor for one week** to ensure proper operation

## 📞 Support

If you encounter issues:

1. Check Supabase logs in your dashboard
2. Run debug queries provided above
3. Verify your database plan supports pg_cron
4. Review matching_logs table for error details

---

**🎉 Your Supabase CRON job is now ready to automatically match doctors every Thursday at 16:00!**

The system will run entirely within your database, providing reliable, low-latency matching with comprehensive logging and monitoring capabilities.

