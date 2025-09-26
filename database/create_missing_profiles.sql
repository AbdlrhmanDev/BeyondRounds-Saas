-- ==============================================
-- إنشاء البروفايلات المفقودة للمستخدمين الجدد
-- ==============================================

-- إنشاء بروفايلات للمستخدمين الجدد الذين لا يملكون بروفايلات
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
  'user',
  true,
  false,
  true,
  100,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email LIKE '%@medicalmeet.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- التحقق من البروفايلات المُنشأة
SELECT 
  '✅ تم إنشاء البروفايلات بنجاح!' as status,
  '================================' as separator
UNION ALL
SELECT 
  'إجمالي المستخدمين في Auth: ' || count(*)::text,
  ''
FROM auth.users 
WHERE email LIKE '%@medicalmeet.com'
UNION ALL
SELECT 
  'إجمالي البروفايلات: ' || count(*)::text,
  ''
FROM public.profiles 
WHERE email LIKE '%@medicalmeet.com'
UNION ALL
SELECT 
  'المستخدمون الجاهزون للاختبار:',
  ''
UNION ALL
SELECT 
  email || ' - ' || first_name || ' ' || last_name,
  medical_specialty
FROM public.profiles 
WHERE email LIKE '%@medicalmeet.com'
ORDER BY email;
