# 🚨 Supabase CRON Troubleshooting Guide

## Error: function trigger_manual_matching() does not exist

This error means the SQL functions weren't created properly. Here's how to fix it step by step.

## 🔧 Quick Fix

### Step 1: Run the Fix Script

Copy and paste this into your Supabase SQL Editor:

```sql
-- Copy the entire contents of scripts/008_fix_missing_functions.sql
-- This will recreate all missing functions
```

### Step 2: Verify Functions Exist

After running the fix script, check that functions were created:

```sql
-- Check if functions exist
SELECT 
  proname as function_name,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE proname IN (
  'trigger_manual_matching',
  'run_weekly_matching', 
  'get_matching_history',
  'get_eligible_users_count'
)
ORDER BY proname;
```

You should see output like:
```
function_name              | return_type
---------------------------|-------------
get_eligible_users_count   | integer
get_matching_history       | TABLE(...)
run_weekly_matching        | jsonb
trigger_manual_matching    | jsonb
```

### Step 3: Test the Functions

```sql
-- Test 1: Check eligible users count
SELECT get_eligible_users_count();

-- Test 2: Try manual matching (admin only)
SELECT trigger_manual_matching();

-- Test 3: View matching history
SELECT * FROM get_matching_history(5);
```

## 🔍 Common Issues and Solutions

### Issue 1: "extension pg_cron does not exist"

**Cause**: You don't have Supabase Pro plan or pg_cron isn't enabled.

**Solution**:
```sql
-- Try to enable pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;
```

If this fails, you need to:
- Upgrade to Supabase Pro plan, OR
- Use Vercel CRON instead (your existing setup)

### Issue 2: "permission denied for schema cron"

**Cause**: Insufficient database permissions.

**Solution**:
```sql
-- Check your current role
SELECT current_user, session_user;

-- If you're not postgres/service_role, you may need admin to run the setup
```

### Issue 3: "relation matching_logs does not exist"

**Cause**: The matching_logs table wasn't created.

**Solution**:
```sql
-- Create the matching_logs table
CREATE TABLE IF NOT EXISTS matching_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week DATE NOT NULL,
  groups_created INTEGER NOT NULL DEFAULT 0,
  eligible_users INTEGER NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_matching_logs_week ON matching_logs(week);

-- Enable RLS
ALTER TABLE matching_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for admins
CREATE POLICY "Admins can manage matching logs" ON matching_logs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
```

### Issue 4: "Unauthorized - Admin access required"

**Cause**: Your user account doesn't have admin role.

**Solution**:
```sql
-- Check your current role
SELECT role FROM profiles WHERE id = auth.uid();

-- If you're not admin, update your role (run as superuser)
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Issue 5: Functions created but cron job not working

**Solution**:
```sql
-- Setup the cron job
SELECT setup_weekly_matching_cron();

-- Check if cron job was created
SELECT * FROM cron.job WHERE jobname = 'weekly-doctor-matching';

-- If no results, pg_cron might not be available
```

## 🧪 Complete Test Sequence

Run these queries in order to verify everything works:

```sql
-- 1. Check pg_cron availability
SELECT EXISTS (
  SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
) as pg_cron_available;

-- 2. Check if functions exist
SELECT COUNT(*) as functions_count
FROM pg_proc 
WHERE proname IN (
  'trigger_manual_matching',
  'run_weekly_matching', 
  'get_matching_history'
);
-- Should return 3

-- 3. Check if matching_logs table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'matching_logs'
) as matching_logs_exists;

-- 4. Check your admin status
SELECT 
  email,
  role,
  CASE WHEN role = 'admin' THEN '✅ Admin' ELSE '❌ Not Admin' END as status
FROM profiles 
WHERE id = auth.uid();

-- 5. Check eligible users count
SELECT get_eligible_users_count() as eligible_users;

-- 6. Test manual matching (if admin)
SELECT trigger_manual_matching();

-- 7. Check cron job status
SELECT * FROM get_cron_job_status();
```

## 🔄 Alternative: Use Vercel CRON Instead

If you're having persistent issues with Supabase CRON, your existing Vercel CRON setup is already perfect:

### Stick with Vercel CRON if:
- You don't have Supabase Pro plan
- You prefer TypeScript over SQL
- You want easier debugging and development
- You're having permission issues with pg_cron

### Your Vercel setup is already configured:
- ✅ `vercel.json` - Thursday 16:00 schedule
- ✅ `app/api/cron/weekly-matching/route.ts` - Complete matching logic
- ✅ `lib/weekly-matching-engine.ts` - Full 7-step algorithm

Just deploy to Vercel and add your `CRON_SECRET` environment variable!

## 🆘 Still Having Issues?

### Debug Information to Collect:

```sql
-- 1. Database version and extensions
SELECT version();
SELECT * FROM pg_extension WHERE extname IN ('pg_cron', 'uuid-ossp');

-- 2. Current user and permissions
SELECT current_user, session_user;
SELECT * FROM profiles WHERE id = auth.uid();

-- 3. Table structure
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'matches', 'match_members', 'chat_messages', 'matching_logs');

-- 4. Function list
SELECT proname FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname LIKE '%match%';
```

### Contact Support With:
1. Your Supabase plan (Free/Pro/Enterprise)
2. The debug information from above
3. The exact error message you're seeing
4. Which step in the setup process failed

## 🎯 Recommended Approach

**For most users, I recommend sticking with Vercel CRON because:**
- ✅ It's already implemented and working
- ✅ No Pro plan requirement
- ✅ Easier to debug and modify
- ✅ More familiar development environment

**Only switch to Supabase CRON if:**
- ✅ You have Supabase Pro plan
- ✅ You want maximum performance (no HTTP calls)
- ✅ You're comfortable with SQL development
- ✅ You successfully completed the setup without issues

Your existing Vercel CRON implementation is production-ready and follows the exact same 7-step specification!

