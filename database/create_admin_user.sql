-- ==============================================
-- إنشاء مستخدم أدمن للاختبار
-- ==============================================

-- هذا السكريبت ينشئ مستخدم أدمن في Supabase Auth
-- قم بتشغيله في محرر SQL في Supabase

-- إنشاء مستخدم أدمن
SELECT auth.admin.create_user(
  '{
    "email": "admin@beyondrounds.com",
    "password": "AdminPassword123!",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Admin",
      "last_name": "User",
      "city": "Riyadh",
      "medical_specialty": "Administration"
    }
  }'
);

-- التحقق من إنشاء المستخدم
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  user_metadata
FROM auth.users 
WHERE email = 'admin@beyondrounds.com';

-- ملاحظة: بعد إنشاء المستخدم في Auth، تحتاج إلى:
-- 1. إنشاء بروفايل في جدول profiles
-- 2. تعيين role = 'admin' في البروفايل
-- 3. تشغيل السكريبت التالي لإنشاء البروفايل

-- ==============================================
-- إنشاء بروفايل الأدمن
-- ==============================================

-- احصل على ID المستخدم أولاً
-- ثم استبدل 'USER_ID_HERE' بالـ ID الفعلي

INSERT INTO profiles (
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
  onboarding_completed,
  profile_completion_percentage,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@beyondrounds.com'),
  'admin@beyondrounds.com',
  'Admin',
  'User',
  'Administration',
  'Riyadh',
  'prefer-not-to-say',
  'admin',
  true,
  false,
  true,
  100,
  NOW(),
  NOW()
);

-- التحقق من إنشاء البروفايل
SELECT 
  p.*,
  u.email as auth_email
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email = 'admin@beyondrounds.com';

-- ==============================================
-- بيانات تسجيل الدخول للأدمن
-- ==============================================
-- البريد الإلكتروني: admin@beyondrounds.com
-- كلمة المرور: AdminPassword123!
-- الدور: admin
-- الوصول: لوحة تحكم الأدمن (/admin)
