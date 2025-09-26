-- ==============================================
-- إصلاح دالة RPC والـ Trigger - استخدام العمود الصحيح
-- ==============================================

-- 1. إصلاح دالة RPC لاستخدام العمود الصحيح
CREATE OR REPLACE FUNCTION public.get_or_create_my_profile()
RETURNS public.profiles
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.profiles;
BEGIN
  -- جلب البروفايل الموجود
  SELECT * INTO p
  FROM public.profiles
  WHERE user_id = auth.uid();

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
      auth.uid(), 
      (SELECT email FROM auth.users WHERE id = auth.uid()), 
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

-- 2. إصلاح التريغر لاستخدام العمود الصحيح
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

-- 3. إعادة إنشاء التريغر
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. إصلاح سياسات RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- حذف السياسات القديمة
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "service_role_all_access" ON public.profiles;

-- إنشاء سياسات جديدة بسيطة وآمنة
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "service_role_all_access"
ON public.profiles FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- 5. منح الصلاحيات اللازمة
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_my_profile() TO authenticated;

-- 6. إنشاء بروفايلات للمستخدمين الموجودين الذين لا يملكون بروفايلات
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

-- 7. إعادة تحميل schema لـ PostgREST
NOTIFY pgrst, 'reload schema';

-- 8. التحقق من النتائج
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

SELECT 'إصلاح دالة RPC والـ Trigger مكتمل! تم استخدام العمود الصحيح.' as status;


