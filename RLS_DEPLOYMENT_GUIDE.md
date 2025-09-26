# 🔐 دليل تطبيق سياسات RLS يدوياً

## 📋 الخطوات المطلوبة:

### 1. اذهب إلى Supabase SQL Editor
- افتح مشروعك في Supabase Dashboard
- اذهب إلى SQL Editor
- انسخ والصق الأكواد التالية واحداً تلو الآخر

### 2. تفعيل RLS على الجداول الأساسية

```sql
-- تفعيل RLS على الجداول الأساسية
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
```

### 3. إنشاء الدوال المساعدة

```sql
-- دالة الحصول على معرف الملف الشخصي الحالي
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT id 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- دالة فحص صلاحيات الأدمن
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT role = 'admin' 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- دالة فحص صلاحيات المشرف أو الأدمن
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  RETURN (
    SELECT role IN ('admin', 'moderator') 
    FROM public.profiles 
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$;
```

### 4. إنشاء سياسات الملفات الشخصية

```sql
-- المستخدمون يمكنهم عرض ملفاتهم الشخصية فقط
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

-- المستخدمون يمكنهم تحديث ملفاتهم الشخصية فقط
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

-- المستخدمون يمكنهم إنشاء ملفاتهم الشخصية فقط
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- الأدمن يمكنه عرض جميع الملفات الشخصية
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

-- الأدمن يمكنه تحديث جميع الملفات الشخصية
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());
```

### 5. إنشاء سياسات المطابقات

```sql
-- المستخدمون يمكنهم عرض مطابقاتهم فقط
DROP POLICY IF EXISTS "Users can view own matches" ON public.matches;
CREATE POLICY "Users can view own matches" ON public.matches
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.match_members mm
      JOIN public.profiles p ON mm.profile_id = p.id
      WHERE mm.match_id = matches.id
      AND p.user_id = auth.uid()
      AND mm.is_active = true
    )
  );

-- الأدمن يمكنه عرض جميع المطابقات
DROP POLICY IF EXISTS "Admins can view all matches" ON public.matches;
CREATE POLICY "Admins can view all matches" ON public.matches
  FOR SELECT USING (public.is_admin());

-- الأدمن يمكنه إنشاء المطابقات
DROP POLICY IF EXISTS "Admins can create matches" ON public.matches;
CREATE POLICY "Admins can create matches" ON public.matches
  FOR INSERT WITH CHECK (public.is_admin());

-- الأدمن يمكنه تحديث المطابقات
DROP POLICY IF EXISTS "Admins can update matches" ON public.matches;
CREATE POLICY "Admins can update matches" ON public.matches
  FOR UPDATE USING (public.is_admin());
```

### 6. إنشاء سياسات الرسائل

```sql
-- المستخدمون يمكنهم عرض رسائل مطابقاتهم فقط
DROP POLICY IF EXISTS "Users can view own chat messages" ON public.chat_messages;
CREATE POLICY "Users can view own chat messages" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      JOIN public.match_members mm ON cr.match_id = mm.match_id
      JOIN public.profiles p ON mm.profile_id = p.id
      WHERE cr.id = chat_messages.chat_room_id
      AND p.user_id = auth.uid()
      AND mm.is_active = true
    )
  );

-- المستخدمون يمكنهم إرسال الرسائل في مطابقاتهم
DROP POLICY IF EXISTS "Users can send messages" ON public.chat_messages;
CREATE POLICY "Users can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      JOIN public.match_members mm ON cr.match_id = mm.match_id
      JOIN public.profiles p ON mm.profile_id = p.id
      WHERE cr.id = chat_messages.chat_room_id
      AND p.user_id = auth.uid()
      AND mm.is_active = true
    )
    AND sender_id = public.current_profile_id()
  );

-- المستخدمون يمكنهم تعديل رسائلهم فقط
DROP POLICY IF EXISTS "Users can edit own messages" ON public.chat_messages;
CREATE POLICY "Users can edit own messages" ON public.chat_messages
  FOR UPDATE USING (
    sender_id = public.current_profile_id()
    AND EXISTS (
      SELECT 1 FROM public.chat_rooms cr
      JOIN public.match_members mm ON cr.match_id = mm.match_id
      JOIN public.profiles p ON mm.profile_id = p.id
      WHERE cr.id = chat_messages.chat_room_id
      AND p.user_id = auth.uid()
      AND mm.is_active = true
    )
  );

-- الأدمن يمكنه عرض جميع الرسائل
DROP POLICY IF EXISTS "Admins can view all messages" ON public.chat_messages;
CREATE POLICY "Admins can view all messages" ON public.chat_messages
  FOR SELECT USING (public.is_admin());
```

### 7. إنشاء سياسات الإشعارات

```sql
-- المستخدمون يمكنهم عرض إشعاراتهم فقط
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (profile_id = public.current_profile_id());

-- المستخدمون يمكنهم تحديث إشعاراتهم فقط
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (profile_id = public.current_profile_id());

-- الأدمن يمكنه إنشاء الإشعارات
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.is_admin());

-- الأدمن يمكنه عرض جميع الإشعارات
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
CREATE POLICY "Admins can view all notifications" ON public.notifications
  FOR SELECT USING (public.is_admin());
```

### 8. إنشاء سياسات مستندات التحقق

```sql
-- المستخدمون يمكنهم عرض مستندات التحقق الخاصة بهم فقط
DROP POLICY IF EXISTS "Users can view own verification documents" ON public.verification_documents;
CREATE POLICY "Users can view own verification documents" ON public.verification_documents
  FOR SELECT USING (profile_id = public.current_profile_id());

-- المستخدمون يمكنهم إنشاء مستندات التحقق الخاصة بهم فقط
DROP POLICY IF EXISTS "Users can create own verification documents" ON public.verification_documents;
CREATE POLICY "Users can create own verification documents" ON public.verification_documents
  FOR INSERT WITH CHECK (profile_id = public.current_profile_id());

-- الأدمن يمكنه عرض جميع مستندات التحقق
DROP POLICY IF EXISTS "Admins can view all verification documents" ON public.verification_documents;
CREATE POLICY "Admins can view all verification documents" ON public.verification_documents
  FOR SELECT USING (public.is_admin());

-- الأدمن يمكنه تحديث مستندات التحقق
DROP POLICY IF EXISTS "Admins can update verification documents" ON public.verification_documents;
CREATE POLICY "Admins can update verification documents" ON public.verification_documents
  FOR UPDATE USING (public.is_admin());
```

### 9. اختبار السياسات

```sql
-- اختبار الدوال المساعدة
SELECT public.current_profile_id();
SELECT public.is_admin();
SELECT public.is_moderator_or_admin();

-- اختبار الوصول للجداول
SELECT COUNT(*) FROM public.profiles;
SELECT COUNT(*) FROM public.matches;
SELECT COUNT(*) FROM public.chat_messages;
```

## ✅ النتيجة المتوقعة:

بعد تطبيق جميع السياسات:
- ✅ المستخدمون يرون بياناتهم فقط
- ✅ الأدمن يرى جميع البيانات
- ✅ الرسائل محمية حسب العضوية
- ✅ المطابقات محمية حسب المشاركة
- ✅ الإشعارات شخصية لكل مستخدم

## 🚨 ملاحظات مهمة:

1. **تطبق السياسات واحداً تلو الآخر** لتجنب الأخطاء
2. **اختبر كل سياسة** بعد تطبيقها
3. **احتفظ بنسخة احتياطية** من قاعدة البيانات
4. **تأكد من وجود مستخدم أدمن** قبل تطبيق السياسات

## 🎯 حالة المشروع بعد التطبيق:

**المشروع سيكون محمياً بالكامل ومستعد للإنتاج!** 🚀







