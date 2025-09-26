-- ==============================================
-- Fix RPC Function - Handle Null auth.uid()
-- ==============================================
-- The issue is that auth.uid() returns null in server-side context
-- We need to fix the RPC function to handle this properly

-- 1. Fix the RPC function to accept user_id as parameter
CREATE OR REPLACE FUNCTION public.get_or_create_my_profile(user_id_param UUID DEFAULT NULL)
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.profiles;
  target_user_id UUID;
BEGIN
  -- Determine the user ID to use
  IF user_id_param IS NOT NULL THEN
    target_user_id := user_id_param;
  ELSE
    target_user_id := auth.uid();
  END IF;
  
  -- If still null, return error
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'No authenticated user found';
  END IF;

  -- جلب البروفايل الموجود
  SELECT * INTO p
  FROM public.profiles
  WHERE user_id = target_user_id;

  -- لو ما في بروفايل، أنشئ واحد جديد
  IF p.id IS NULL THEN
    INSERT INTO public.profiles (
      user_id, 
      email, 
      first_name, 
      last_name, 
      medical_specialty,
      city,
      gender,
      role,
      is_verified,
      is_banned,
      onboarding_completed
    )
    VALUES (
      target_user_id, 
      (SELECT email FROM auth.users WHERE id = target_user_id), 
      '', 
      '', 
      'general',
      'Not specified',
      'prefer-not-to-say',
      'user',
      false,
      false,
      false
    )
    RETURNING * INTO p;
  END IF;

  RETURN p;
END;
$$;

-- 2. Create a simpler RPC function for client-side use
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.profiles;
BEGIN
  -- جلب البروفايل الموجود فقط
  SELECT * INTO p
  FROM public.profiles
  WHERE user_id = auth.uid();

  -- لو ما في بروفايل، ارجع خطأ
  IF p.id IS NULL THEN
    RAISE EXCEPTION 'Profile not found for user';
  END IF;

  RETURN p;
END;
$$;

-- 3. Fix the trigger function to handle the user_id properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    email, 
    first_name, 
    last_name, 
    medical_specialty,
    city,
    gender,
    role,
    is_verified,
    is_banned,
    onboarding_completed
  )
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''), 
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'general',
    COALESCE(NEW.raw_user_meta_data->>'city', 'Not specified'),
    'prefer-not-to-say',
    'user',
    false,
    false,
    false
  )
  ON CONFLICT (user_id) DO NOTHING;  -- يمنع فشل إنشاء المستخدم
  
  RETURN NEW;
END;
$$;

-- 4. Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION public.get_or_create_my_profile(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- 5. Create profiles for existing users who don't have them
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN 
    SELECT u.id, u.email, u.raw_user_meta_data
    FROM auth.users u
    LEFT JOIN profiles p ON u.id = p.user_id
    WHERE p.id IS NULL
  LOOP
    BEGIN
      INSERT INTO public.profiles (
        user_id, 
        email, 
        first_name, 
        last_name, 
        medical_specialty,
        city,
        gender,
        role,
        is_verified,
        is_banned,
        onboarding_completed
      )
      VALUES (
        user_record.id,
        user_record.id,
        user_record.email,
        COALESCE(user_record.raw_user_meta_data->>'first_name', ''),
        COALESCE(user_record.raw_user_meta_data->>'last_name', ''),
        'general',
        COALESCE(user_record.raw_user_meta_data->>'city', 'Not specified'),
        'prefer-not-to-say',
        'user',
        false,
        false,
        false
      )
      ON CONFLICT (user_id) DO NOTHING;
      
      RAISE NOTICE 'Created profile for existing user: %', user_record.email;
      
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE 'Error creating profile for user %: %', user_record.email, SQLERRM;
    END;
  END LOOP;
END $$;

-- 6. إعادة تحميل schema لـ PostgREST
NOTIFY pgrst, 'reload schema';

SELECT 'RPC function fixed to handle null auth.uid()!' as status;


