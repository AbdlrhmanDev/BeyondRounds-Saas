# 🔐 دليل اختبار تسجيل الدخول - BeyondRounds

## ✅ تم إنشاء مستخدمين صالحين للاختبار

### 🔑 بيانات تسجيل الدخول المتاحة:

| البريد الإلكتروني | كلمة المرور | الدور | التخصص |
|-------------------|-------------|-------|---------|
| test.user@beyondrounds.com | password123 | user | General Practice |
| test.admin@beyondrounds.com | password123 | admin | Administration |
| ahmed.doctor@beyondrounds.com | password123 | user | Cardiology |
| sara.doctor@beyondrounds.com | password123 | user | Dermatology |

## 🚀 خطوات الاختبار:

### الخطوة 1: إصلاح البروفايلات
1. اذهب إلى Supabase SQL Editor
2. شغل السكريبت: `database/fix_valid_profiles.sql`
3. تأكد من ظهور رسالة "تم إصلاح البروفايلات بنجاح"

### الخطوة 2: اختبار تسجيل الدخول
1. اذهب إلى: http://localhost:3000/auth/login
2. استخدم أي من بيانات المستخدمين أعلاه
3. افتح Developer Tools (F12) → Console tab
4. راقب الرسائل التالية:

**للمستخدم العادي:**
```
useAuthUser: Profile loaded, role: user
Dashboard: Checking user role: user
```

**للأدمن:**
```
useAuthUser: Profile loaded, role: admin
useAuthUser: Admin user detected on path: /dashboard
useAuthUser: Redirecting admin to /admin
Dashboard: Checking user role: admin
Dashboard: User is admin, redirecting to /admin
```

### الخطوة 3: التحقق من التوجيه
- **المستخدمون العاديون**: يجب أن يذهبوا إلى `/dashboard`
- **الأدمن**: يجب أن يذهب إلى `/admin`

## 🔍 استكشاف الأخطاء:

### إذا ظهر خطأ "Invalid login credentials":
1. **تحقق من ملف `.env.local`**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://bpynucvjhrdgajzoxmyw.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
   ```

2. **أعد تشغيل الخادم**:
   ```bash
   npm run dev
   ```

3. **تحقق من المستخدمين في Supabase**:
   - اذهب إلى Supabase Dashboard
   - Authentication → Users
   - تأكد من وجود المستخدمين

### إذا لم يحدث توجيه:
1. **تحقق من console logs** - يجب أن تظهر الرسائل أعلاه
2. **تحقق من صفحة الوجهة** - قد تكون هناك أخطاء في الصفحة
3. **تحقق من middleware** - قد يكون يحجب التوجيه

### إذا ظهرت أخطاء JavaScript:
1. **تحقق من ملفات TypeScript** - قد تكون هناك أخطاء في الكود
2. **تحقق من imports** - قد تكون هناك مشاكل في الاستيراد
3. **تحقق من dependencies** - قد تكون هناك مشاكل في المكتبات

## 📋 قائمة التحقق:

- [ ] ملف `.env.local` موجود وصحيح
- [ ] الخادم يعمل (`npm run dev`)
- [ ] المستخدمون موجودون في Supabase Auth
- [ ] البروفايلات موجودة وصحيحة
- [ ] لا توجد أخطاء في console
- [ ] التوجيه يعمل حسب الدور
- [ ] الصفحات الوجهة تعمل بشكل صحيح

## 🎯 النتائج المتوقعة:

### تسجيل دخول ناجح:
- ✅ رسالة ترحيب في console
- ✅ توجيه صحيح حسب الدور
- ✅ عرض البيانات الشخصية
- ✅ وصول للوظائف المناسبة

### للأدمن:
- ✅ توجيه إلى `/admin`
- ✅ عرض لوحة تحكم الأدمن
- ✅ وصول لوظائف الإدارة

### للمستخدمين العاديين:
- ✅ توجيه إلى `/dashboard`
- ✅ عرض لوحة التحكم العادية
- ✅ وصول للوظائف العادية

## 📞 الدعم:

إذا استمرت المشاكل:
1. انسخ رسائل console كاملة
2. تحقق من Network tab للأخطاء
3. تأكد من تشغيل جميع السكريبتات
4. جرب مستخدمين مختلفين

---

**🎉 النظام جاهز للاختبار!**

استخدم أي من بيانات المستخدمين أعلاه لتسجيل الدخول واختبار جميع الوظائف.
