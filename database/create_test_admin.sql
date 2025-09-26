-- ==============================================
-- إنشاء مستخدم أدمن للاختبار
-- ==============================================

-- إنشاء مستخدم أدمن جديد
SELECT auth.admin.create_user(
  '{
    "email": "admin.test@beyondrounds.com",
    "password": "AdminPassword123!",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Admin",
      "last_name": "Test",
      "city": "Riyadh",
      "medical_specialty": "Administration"
    }
  }'
);

-- إنشاء بروفايل للأدمن
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

-- التحقق من إنشاء الأدمن
SELECT 
  '✅ تم إنشاء الأدمن بنجاح!' as status,
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
