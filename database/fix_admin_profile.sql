-- ==============================================
-- إنشاء بروفايل للأدمن الموجود
-- ==============================================

-- إنشاء بروفايل للأدمن الموجود
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
  'admin', -- دور أدمن
  true,
  false,
  true,
  100,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email = 'admin.test@beyondrounds.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- تحديث البروفايل الموجود ليكون أدمن
UPDATE public.profiles 
SET 
  role = 'admin',
  is_verified = true,
  onboarding_completed = true,
  profile_completion = 100,
  updated_at = NOW()
WHERE email = 'admin.test@beyondrounds.com';

-- التحقق من الأدمن
SELECT 
  '✅ تم تحديث الأدمن بنجاح!' as status,
  '=========================' as separator
UNION ALL
SELECT 
  'البريد الإلكتروني: ' || email,
  'الدور: ' || role::text
FROM public.profiles 
WHERE email = 'admin.test@beyondrounds.com'
UNION ALL
SELECT 
  'كلمة المرور: AdminPassword123!',
  'الوصول: /admin'
UNION ALL
SELECT 
  '🔗 جرب تسجيل الدخول الآن',
  'admin.test@beyondrounds.com';
