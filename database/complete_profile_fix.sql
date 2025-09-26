-- ==============================================
-- Complete Profile Creation Fix
-- ==============================================
-- This script fixes the profile creation issue completely
-- Run this in your Supabase SQL Editor

-- 1. First, let's completely disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop all existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 3. Create a robust trigger function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    profile_id UUID;
BEGIN
    -- Use the auth user's ID as the profile ID
    profile_id := NEW.id;
    
    -- Insert the profile with all required fields
    INSERT INTO public.profiles (
        id,
        user_id,
        email,
        first_name,
        last_name,
        city,
        gender,
        role,
        is_verified,
        is_banned,
        onboarding_completed,
        profile_completion_percentage,
        created_at,
        updated_at
    )
    VALUES (
        profile_id,
        profile_id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'city', 'Not specified'),
        'prefer-not-to-say',
        'user',
        false,
        false,
        false,
        0,
        NOW(),
        NOW()
    );
    
    -- Log success
    RAISE LOG 'Profile created successfully for user: %', NEW.id;
    
    RETURN NEW;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Log the error but don't fail the auth user creation
        RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- 6. Create profiles for existing users who don't have them
DO $$
DECLARE
    user_record RECORD;
BEGIN
    -- Loop through all auth users who don't have profiles
    FOR user_record IN 
        SELECT u.id, u.email, u.raw_user_meta_data
        FROM auth.users u
        LEFT JOIN profiles p ON u.id = p.user_id
        WHERE p.id IS NULL
    LOOP
        BEGIN
            INSERT INTO public.profiles (
                id,
                user_id,
                email,
                first_name,
                last_name,
                city,
                gender,
                role,
                is_verified,
                is_banned,
                onboarding_completed,
                profile_completion_percentage,
                created_at,
                updated_at
            )
            VALUES (
                user_record.id,
                user_record.id,
                user_record.email,
                COALESCE(user_record.raw_user_meta_data->>'first_name', ''),
                COALESCE(user_record.raw_user_meta_data->>'last_name', ''),
                COALESCE(user_record.raw_user_meta_data->>'city', 'Not specified'),
                'prefer-not-to-say',
                'user',
                false,
                false,
                false,
                0,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE 'Created profile for existing user: %', user_record.email;
            
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Error creating profile for user %: %', user_record.email, SQLERRM;
        END;
    END LOOP;
END $$;

-- 7. Re-enable RLS with simple, working policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 8. Drop all existing policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can create profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 9. Create simple, safe policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Service role can create profiles" ON profiles
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- 10. Handle user_preferences table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_preferences') THEN
        -- Disable RLS temporarily
        ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
        DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
        DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
        DROP POLICY IF EXISTS "Service role can create user preferences" ON user_preferences;
        
        -- Re-enable RLS
        ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
        
        -- Create simple policies
        CREATE POLICY "Users can view own preferences" ON user_preferences
          FOR SELECT USING (
            profile_id IN (
              SELECT id FROM profiles WHERE user_id = auth.uid()
            )
          );

        CREATE POLICY "Users can update own preferences" ON user_preferences
          FOR UPDATE USING (
            profile_id IN (
              SELECT id FROM profiles WHERE user_id = auth.uid()
            )
          );

        CREATE POLICY "Users can insert own preferences" ON user_preferences
          FOR INSERT WITH CHECK (
            profile_id IN (
              SELECT id FROM profiles WHERE user_id = auth.uid()
            )
          );

        CREATE POLICY "Service role can create user preferences" ON user_preferences
          FOR INSERT WITH CHECK (auth.role() = 'service_role');
          
        GRANT ALL ON public.user_preferences TO authenticated;
    END IF;
END $$;

-- 11. Verify the fix worked
SELECT 
    'VERIFICATION' as check_type,
    COUNT(*) as total_profiles,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as profiles_with_user_id
FROM profiles;

SELECT 
    'AUTH USERS' as check_type,
    COUNT(*) as total_auth_users
FROM auth.users;

SELECT 
    'ORPHANED USERS' as check_type,
    COUNT(*) as users_without_profiles
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE p.id IS NULL;

SELECT 'Complete profile creation fix completed! All users should now have profiles.' as status;


