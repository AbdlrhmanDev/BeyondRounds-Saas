# 🧪 BeyondRounds Matching System Testing Guide

## Overview

This guide provides comprehensive testing methods for your BeyondRounds weekly matching system, whether you're using Supabase CRON or Vercel CRON.

## 🎯 Testing Options

### Option 1: Enhanced Dashboard Testing (Recommended)

Your enhanced dashboard now includes built-in testing capabilities:

#### **For Admins:**
1. **Go to your dashboard** at `/dashboard`
2. **Click "Test Matching" button** in the top right
3. **View real-time results** including:
   - Eligible users count
   - Valid pairs found
   - Groups created
   - Execution time
   - Detailed breakdown

#### **Dashboard Features:**
- ✅ **Real-time statistics** - Current user counts and readiness
- ✅ **Matching history** - Past runs and results
- ✅ **System status** - Whether ready for matching
- ✅ **Admin controls** - Test matching, view CRON status
- ✅ **Progress tracking** - User verification and payment progress

### Option 2: Direct Database Testing (Supabase CRON)

If you're using Supabase CRON, test directly in SQL Editor:

```sql
-- 1. Check system readiness
SELECT * FROM get_matching_statistics();

-- 2. Check eligible users
SELECT get_eligible_users_count();

-- 3. Test matching algorithm (admin only)
SELECT trigger_manual_matching();

-- 4. View detailed results
SELECT * FROM get_matching_history(5);

-- 5. Check CRON job status
SELECT * FROM get_cron_job_status();
```

### Option 3: API Endpoint Testing (Vercel CRON)

If you're using Vercel CRON, test via API:

```bash
# Development testing
curl http://localhost:3000/api/cron/weekly-matching

# Production testing (with CRON_SECRET)
curl -X POST https://your-domain.com/api/cron/weekly-matching \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 🔧 Setting Up Test Data

### Create Test Users

To properly test the matching system, you need sufficient test data:

```sql
-- Check current user distribution
SELECT 
  city,
  COUNT(*) as users,
  COUNT(*) FILTER (WHERE is_verified = true) as verified,
  COUNT(*) FILTER (WHERE is_paid = true) as paid,
  COUNT(*) FILTER (WHERE onboarding_completed = true) as onboarded
FROM profiles 
GROUP BY city
ORDER BY users DESC;

-- For testing, you can temporarily modify user data
-- (DO THIS ONLY IN DEVELOPMENT!)
UPDATE profiles 
SET is_verified = true, is_paid = true, onboarding_completed = true
WHERE email LIKE '%test%' OR email LIKE '%demo%';
```

### Minimum Test Requirements

For successful testing, you need:
- ✅ **At least 6 eligible users** (verified + paid + onboarded)
- ✅ **At least 2 cities** with 3+ users each
- ✅ **Users with interests and availability** filled out
- ✅ **Admin role** for manual testing

## 📊 Understanding Test Results

### Successful Test Output

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
  "execution_time_ms": 1250
}
```

**What this means:**
- **15 eligible users** met all criteria
- **42 valid pairs** scored ≥ 0.55
- **3 groups created** with optimal matches
- **12 users matched** into groups
- **3 rollover candidates** will be prioritized next week
- **1.25 seconds** execution time

### Common Test Scenarios

#### Scenario 1: Insufficient Users
```json
{
  "success": true,
  "message": "Insufficient eligible users for matching",
  "eligible_users": 2,
  "groups_created": 0
}
```
**Solution:** Add more verified/paid users or temporarily modify existing users for testing

#### Scenario 2: No Valid Pairs
```json
{
  "success": true,
  "message": "No valid groups could be formed",
  "eligible_users": 8,
  "valid_pairs": 0,
  "groups_created": 0
}
```
**Solution:** Check user interests, availability, and city distribution

#### Scenario 3: Successful Matching
```json
{
  "groups_created": 2,
  "matched_users": 7,
  "rollover_candidates": 1
}
```
**Result:** Check `matches`, `match_members`, and `chat_messages` tables for created data

## 🔍 Debugging Common Issues

### Issue 1: "Admin access required"

**Problem:** User doesn't have admin role
```sql
-- Check current role
SELECT email, role FROM profiles WHERE id = auth.uid();

-- Set admin role (run as superuser)
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Issue 2: "No eligible users found"

**Problem:** Users don't meet eligibility criteria
```sql
-- Debug user eligibility
SELECT 
  id,
  first_name,
  email,
  is_verified,
  is_paid,
  onboarding_completed,
  created_at,
  city,
  CASE 
    WHEN NOT is_verified THEN 'Not verified'
    WHEN NOT is_paid THEN 'Not paid'
    WHEN NOT onboarding_completed THEN 'Onboarding incomplete'
    WHEN created_at >= (date_trunc('week', CURRENT_DATE) + INTERVAL '3 days 12 hours') THEN 'Joined too recently'
    ELSE 'Eligible'
  END as status
FROM profiles
ORDER BY created_at DESC;
```

### Issue 3: "Function does not exist"

**Problem:** Supabase functions not created properly
```sql
-- Check if functions exist
SELECT proname FROM pg_proc WHERE proname LIKE '%matching%';

-- If missing, re-run the setup script
-- scripts/009_complete_supabase_cron_system.sql
```

### Issue 4: Low match scores

**Problem:** Users have incompatible profiles
```sql
-- Check user interests and specialties
SELECT 
  first_name,
  specialty,
  city,
  interests,
  availability_slots
FROM profiles
WHERE is_verified = true AND is_paid = true
ORDER BY city, specialty;
```

## 📈 Performance Testing

### Load Testing

Test with different user counts:

```sql
-- Small dataset (10-20 users)
SELECT trigger_manual_matching();

-- Medium dataset (50-100 users)  
-- Large dataset (200+ users)
```

Expected performance:
- **< 50 users**: < 1 second
- **50-200 users**: 1-5 seconds
- **200+ users**: 5-30 seconds

### Memory Usage

Monitor execution time in results:
```json
{
  "execution_time_ms": 1250
}
```

If execution time > 30 seconds, consider:
- Adding database indexes
- Optimizing the algorithm
- Breaking into smaller batches

## 🎯 Testing Checklist

### Pre-Testing Checklist
- [ ] Admin role assigned to test user
- [ ] At least 6 eligible users in database
- [ ] Users distributed across 2+ cities (3+ users each)
- [ ] Users have filled interests and availability
- [ ] No recent matches (if testing re-matching prevention)

### During Testing
- [ ] Test runs without errors
- [ ] Execution time is reasonable (< 30s)
- [ ] Groups are created with 3-4 members
- [ ] Gender balance is respected
- [ ] Chat messages are seeded
- [ ] Results are logged to matching_logs table

### Post-Testing Verification
- [ ] Check `matches` table for new records
- [ ] Check `match_members` table for group members
- [ ] Check `chat_messages` table for welcome messages
- [ ] Verify no duplicate matches in same week
- [ ] Confirm rollover candidates are identified

## 🚀 Automated Testing Script

Create a comprehensive test script:

```sql
-- Complete testing workflow
DO $$
DECLARE
  test_result JSONB;
  stats_result JSONB;
BEGIN
  RAISE NOTICE '🧪 Starting BeyondRounds Matching System Test';
  RAISE NOTICE '================================================';
  
  -- Step 1: Check system readiness
  SELECT get_matching_statistics() INTO stats_result;
  RAISE NOTICE '📊 System Statistics: %', stats_result;
  
  -- Step 2: Check eligible users
  RAISE NOTICE '👥 Eligible Users: %', get_eligible_users_count();
  
  -- Step 3: Run matching test
  SELECT trigger_manual_matching() INTO test_result;
  RAISE NOTICE '🎯 Matching Result: %', test_result;
  
  -- Step 4: Check CRON status
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_cron_job_status') THEN
    RAISE NOTICE '⏰ CRON Status: Available';
  ELSE
    RAISE NOTICE '⏰ CRON Status: Not available (using Vercel CRON)';
  END IF;
  
  RAISE NOTICE '✅ Test completed successfully!';
END $$;
```

## 📞 Support & Troubleshooting

If you encounter issues:

1. **Check the enhanced dashboard** for real-time diagnostics
2. **Run the debugging queries** provided above
3. **Verify your database setup** using the testing checklist
4. **Check execution logs** in the matching_logs table
5. **Ensure proper permissions** and admin role assignment

Your matching system is now fully testable and ready for production! 🎉

