-- ==============================================
-- فحص جميع المستخدمين الموجودين في Supabase Auth
-- ==============================================

-- فحص المستخدمين في auth.users
SELECT 
  'المستخدمون في Supabase Auth:' as info,
  '============================' as separator
UNION ALL
SELECT 
  'البريد الإلكتروني: ' || email,
  'معرف المستخدم: ' || id
FROM auth.users 
ORDER BY email;

-- فحص البروفايلات المطابقة
SELECT 
  'البروفايلات في قاعدة البيانات:' as info,
  '===============================' as separator
UNION ALL
SELECT 
  'البريد الإلكتروني: ' || email,
  'الدور: ' || COALESCE(role::text, 'غير محدد')
FROM public.profiles 
ORDER BY email;

-- فحص المستخدمين الذين يمكنهم تسجيل الدخول
SELECT 
  'المستخدمون المتاحون لتسجيل الدخول:' as info,
  '===================================' as separator
UNION ALL
SELECT 
  'البريد الإلكتروني: ' || u.email,
  'كلمة المرور: password123'
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
WHERE u.email LIKE '%@medicalmeet.com' OR u.email LIKE '%@beyondrounds.com'
ORDER BY u.email;
