-- ==============================================
-- إصلاح البروفايلات للمستخدمين الجدد
-- ==============================================

-- إنشاء أو تحديث البروفايلات للمستخدمين الجدد
INSERT INTO public.profiles (
  user_id, email, first_name, last_name, medical_specialty, city,
  gender, role, is_verified, is_banned, onboarding_completed, 
  profile_completion, created_at, updated_at
)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'first_name',
  u.raw_user_meta_data->>'last_name', 
  u.raw_user_meta_data->>'medical_specialty',
  u.raw_user_meta_data->>'city',
  'prefer-not-to-say',
  CASE 
    WHEN u.email = 'test.admin@beyondrounds.com' THEN 'admin'
    ELSE 'user'
  END,
  true,
  false,
  true,
  100,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email IN (
  'test.user@beyondrounds.com',
  'test.admin@beyondrounds.com', 
  'ahmed.doctor@beyondrounds.com',
  'sara.doctor@beyondrounds.com'
)
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- تحديث البروفايلات الموجودة
UPDATE public.profiles 
SET 
  role = CASE 
    WHEN email = 'test.admin@beyondrounds.com' THEN 'admin'
    ELSE 'user'
  END,
  is_verified = true,
  onboarding_completed = true,
  profile_completion = 100,
  updated_at = NOW()
WHERE email IN (
  'test.user@beyondrounds.com',
  'test.admin@beyondrounds.com',
  'ahmed.doctor@beyondrounds.com', 
  'sara.doctor@beyondrounds.com'
);

-- التحقق من النتائج
SELECT 
  '✅ تم إصلاح البروفايلات بنجاح!' as status,
  '===============================' as separator
UNION ALL
SELECT 
  'المستخدمون المتاحون لتسجيل الدخول:',
  ''
UNION ALL
SELECT 
  'البريد الإلكتروني: ' || email,
  'الدور: ' || role::text || ' | كلمة المرور: password123'
FROM public.profiles 
WHERE email IN (
  'test.user@beyondrounds.com',
  'test.admin@beyondrounds.com',
  'ahmed.doctor@beyondrounds.com',
  'sara.doctor@beyondrounds.com'
)
ORDER BY email;
