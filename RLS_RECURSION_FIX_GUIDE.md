# RLS Recursion Fix - Manual Solution

## 🚨 Critical Issue: Infinite Recursion in Profiles RLS Policies

The error `infinite recursion detected in policy for relation "profiles"` indicates that the RLS policies on the `profiles` table are causing infinite loops. This prevents ANY queries to the profiles table from working.

## 🔧 Solution: Complete RLS Policy Reset

### Step 1: Connect to Your Supabase Database

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the following commands in sequence:

### Step 2: Drop All Existing RLS Policies

```sql
-- Drop ALL existing RLS policies on profiles table
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;
DROP POLICY IF EXISTS "profiles_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_modify" ON profiles;
DROP POLICY IF EXISTS "profiles_select_simple" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_simple" ON profiles;
DROP POLICY IF EXISTS "profiles_update_simple" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_simple" ON profiles;
```

### Step 3: Create Simple, Non-Recursive RLS Policies

```sql
-- Simple select policy - allow authenticated users to read profiles
CREATE POLICY "profiles_select_simple" ON profiles
FOR SELECT
USING (
  auth.uid() IS NOT NULL
);

-- Simple insert policy - users can only insert their own profile
CREATE POLICY "profiles_insert_simple" ON profiles
FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

-- Simple update policy - users can only update their own profile
CREATE POLICY "profiles_update_simple" ON profiles
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);

-- Simple delete policy - users can only delete their own profile
CREATE POLICY "profiles_delete_simple" ON profiles
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND 
  user_id = auth.uid()
);
```

### Step 4: Ensure RLS is Enabled

```sql
-- Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Step 5: Test the Fix

```sql
-- Test query to verify the fix works
SELECT id, user_id, first_name, last_name 
FROM profiles 
LIMIT 1;
```

## 🎯 Alternative: Temporary Disable RLS (For Testing)

If you need immediate access while debugging, you can temporarily disable RLS:

```sql
-- TEMPORARY: Disable RLS on profiles table (NOT RECOMMENDED FOR PRODUCTION)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

**⚠️ WARNING**: Only use this for testing. Re-enable RLS immediately after testing:

```sql
-- Re-enable RLS after testing
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

## 🔍 What Caused the Recursion?

The infinite recursion typically happens when:

1. **Circular Policy References**: A policy references itself or creates a circular dependency
2. **Complex Policy Logic**: Policies that use complex joins or subqueries that reference the same table
3. **Multiple Conflicting Policies**: Overlapping policies that conflict with each other
4. **Policy Functions**: Policies that call functions which in turn query the same table

## ✅ Verification Steps

After applying the fix:

1. **Test Profile Queries**: Try querying profiles from your application
2. **Check Authentication**: Ensure users can still authenticate
3. **Test CRUD Operations**: Verify create, read, update, delete operations work
4. **Monitor Logs**: Watch for any new RLS-related errors

## 🚀 Next Steps

1. Run the SQL commands above in your Supabase SQL Editor
2. Restart your Next.js application
3. Test the chat functionality
4. Monitor for any remaining errors

The chat system should now work properly without the infinite recursion errors!


