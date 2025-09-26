# Comprehensive Database Migration Guide

## 🚀 URGENT: Apply Schema Hardening Migration

Your database needs this comprehensive migration to:
- ✅ Harden schema with proper constraints
- ✅ Implement safe RLS policies (no recursion)
- ✅ Add proper foreign key constraints with ON DELETE actions
- ✅ Create performance indexes
- ✅ Add utility functions and triggers

## 📋 Manual Application Steps

### Step 1: Access Supabase Dashboard
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Go to **SQL Editor**

### Step 2: Execute Migration
1. Copy the entire contents of `scripts/comprehensive-migration.sql`
2. Paste into the SQL Editor
3. Click **"Run"**

### Step 3: Verify Success
The migration should complete successfully. Look for:
- ✅ Extensions created
- ✅ Constraints added
- ✅ Indexes created
- ✅ RLS policies updated
- ✅ Functions and triggers created

## 🔍 What This Migration Does

### 1. Schema Hardening
- Adds unique constraints to prevent data duplication
- Strengthens foreign key constraints with proper ON DELETE actions
- Creates partial unique indexes for soft-delete compatibility

### 2. Performance Improvements
- Adds indexes on frequently queried columns
- Creates GIN indexes for full-text search
- Optimizes query performance

### 3. Safe RLS Policies
- Removes recursive RLS policies that were causing infinite loops
- Implements the `my_profile_id()` helper function (SECURITY DEFINER)
- Creates granular, secure access policies

### 4. Data Integrity
- Ensures referential integrity with proper foreign keys
- Prevents orphaned records
- Maintains data consistency

## 🚨 Important Notes

1. **Backup First**: This migration is designed to be safe, but always backup your data
2. **Idempotent**: The migration can be run multiple times safely
3. **No Data Loss**: This migration only adds constraints and policies, no data is deleted
4. **Performance**: Your app will be faster after this migration

## 🔧 After Migration

Once the migration is complete:
1. Your chat functionality will work properly
2. Profile queries will no longer have recursion issues
3. Data integrity will be enforced
4. Performance will be improved

## 📞 Support

If you encounter any issues:
1. Check the SQL Editor error messages
2. Ensure you have the necessary permissions
3. Contact your database administrator if needed

---

**⚡ This migration is critical for your app's stability and performance!**


