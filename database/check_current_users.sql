-- ==============================================
-- فحص بيانات المستخدمين الحاليين
-- ==============================================

-- فحص المستخدمين في Supabase Auth
SELECT 
  'المستخدمون في Supabase Auth:' as info,
  '============================' as separator
UNION ALL
SELECT 
  'البريد الإلكتروني: ' || email,
  'الدور: ' || COALESCE(raw_user_meta_data->>'role', 'غير محدد')
FROM auth.users 
WHERE email LIKE '%@medicalmeet.com' OR email LIKE '%@beyondrounds.com'
ORDER BY email;

-- فحص البروفايلات
SELECT 
  'البروفايلات في قاعدة البيانات:' as info,
  '===============================' as separator
UNION ALL
SELECT 
  'البريد الإلكتروني: ' || email,
  'الدور: ' || COALESCE(role::text, 'غير محدد')
FROM public.profiles 
WHERE email LIKE '%@medicalmeet.com' OR email LIKE '%@beyondrounds.com'
ORDER BY email;

-- فحص المستخدمين الذين لديهم دور admin
SELECT 
  'المستخدمون الأدمن:' as info,
  '===================' as separator
UNION ALL
SELECT 
  'البريد الإلكتروني: ' || email,
  'معرف المستخدم: ' || user_id
FROM public.profiles 
WHERE role = 'admin'
ORDER BY email;
