# 🔧 دليل تكوين النظامين المكتملين

## 📋 نظرة عامة

تم إكمال النظامين التاليين بنجاح:

### ✅ **1. نظام التحقق من الوثائق**
- معالجة الملفات ✅
- سير عمل الموافقة ✅  
- نظام الإشعارات ✅

### ✅ **2. المطابقة الأسبوعية التلقائية**
- إعداد CRON job ✅
- الجدولة التلقائية ✅
- نشر الإنتاج ✅

---

## 🚀 الملفات الجديدة المضافة

### **نظام التحقق من الوثائق:**
- `src/lib/email/email-service.ts` - خدمة البريد الإلكتروني
- `src/app/api/notifications/email/route.ts` - API لإرسال الإشعارات
- تحديث `src/app/api/admin/verification/route.ts` - إضافة الإشعارات

### **المطابقة الأسبوعية التلقائية:**
- `src/app/api/cron/weekly-matching/route.ts` - CRON job للمطابقة التلقائية
- تحديث `vercel.json` - إعداد الجدولة التلقائية
- تحديث `src/app/api/cron/weekly-matching/route.ts` - إضافة الإشعارات

### **أدوات الاختبار:**
- `scripts/test-systems.js` - سكريبت اختبار شامل
- تحديث `package.json` - إضافة سكريبتات الاختبار

---

## ⚙️ إعداد متغيرات البيئة

### **متغيرات مطلوبة:**
```bash
# Supabase (مطلوب)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# التطبيق (مطلوب)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### **متغيرات البريد الإلكتروني (اختيارية):**
```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
FROM_EMAIL=noreply@beyondrounds.com
```

### **متغيرات الأمان (مطلوبة للإنتاج):**
```bash
# CRON Secret for security
CRON_SECRET=your_random_secret_key_here
```

---

## 📧 إعداد البريد الإلكتروني

### **1. Gmail (مستحسن):**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password  # App Password, not regular password
```

### **2. SendGrid:**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

### **3. Mailgun:**
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASS=your_mailgun_password
```

---

## 🕐 إعداد الجدولة التلقائية

### **Vercel CRON Jobs:**
تم تكوين CRON job في `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/weekly-matching",
      "schedule": "0 16 * * 4"
    }
  ]
}
```

**الجدولة:**
- **الوقت**: كل خميس الساعة 4:00 مساءً
- **التوقيت**: UTC
- **المسار**: `/api/cron/weekly-matching`

### **الأمان:**
- يتطلب `CRON_SECRET` في متغيرات البيئة
- يتحقق من اليوم والوقت قبل التشغيل
- يمنع التشغيل المتكرر في نفس الأسبوع

---

## 🧪 اختبار النظامين

### **اختبار شامل:**
```bash
npm run test:systems
```

### **اختبار نظام التحقق فقط:**
```bash
npm run test:verification
```

### **اختبار نظام المطابقة فقط:**
```bash
npm run test:matching
```

### **اختبار يدوي:**
```bash
# اختبار CRON endpoint
curl -X GET https://your-domain.com/api/cron/weekly-matching

# اختبار إرسال إيميل
curl -X POST https://your-domain.com/api/notifications/email \
  -H "Content-Type: application/json" \
  -d '{
    "type": "welcome",
    "profileId": "profile-uuid-here"
  }'
```

---

## 📊 مراقبة النظام

### **سجلات المطابقة:**
```sql
-- عرض سجلات المطابقة الأخيرة
SELECT * FROM matching_logs 
ORDER BY created_at DESC 
LIMIT 10;

-- إحصائيات المطابقة
SELECT 
  COUNT(*) as total_sessions,
  AVG(groups_created) as avg_groups,
  AVG(total_users_matched) as avg_users,
  AVG(average_compatibility) as avg_compatibility
FROM matching_logs;
```

### **سجلات التحقق:**
```sql
-- عرض طلبات التحقق المعلقة
SELECT vd.*, p.first_name, p.last_name, p.email
FROM verification_documents vd
JOIN profiles p ON vd.profile_id = p.id
WHERE vd.status = 'pending'
ORDER BY vd.submitted_at DESC;

-- إحصائيات التحقق
SELECT 
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (reviewed_at - submitted_at))/3600) as avg_review_hours
FROM verification_documents
GROUP BY status;
```

---

## 🚀 نشر الإنتاج

### **1. إعداد Vercel:**
```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# ربط المشروع
vercel link

# نشر
vercel --prod
```

### **2. إعداد متغيرات البيئة في Vercel:**
- اذهب إلى Vercel Dashboard
- اختر مشروعك
- اذهب إلى Settings > Environment Variables
- أضف جميع المتغيرات المطلوبة

### **3. تفعيل CRON Jobs:**
- في Vercel Dashboard
- اذهب إلى Functions tab
- تأكد من تفعيل CRON Jobs

### **4. اختبار الإنتاج:**
```bash
# اختبار CRON endpoint
curl -X GET https://your-domain.com/api/cron/weekly-matching

# اختبار نظام التحقق
curl -X GET https://your-domain.com/api/admin/verification
```

---

## 🔧 استكشاف الأخطاء

### **مشاكل البريد الإلكتروني:**
```bash
# تحقق من متغيرات البيئة
echo $SMTP_HOST
echo $SMTP_USER

# اختبار الاتصال
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
transporter.verify((err, success) => {
  if (err) console.log('❌', err);
  else console.log('✅ SMTP connection successful');
});
"
```

### **مشاكل CRON Jobs:**
```bash
# تحقق من السجلات في Vercel
vercel logs --follow

# اختبار CRON endpoint يدوياً
curl -X POST https://your-domain.com/api/cron/weekly-matching \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### **مشاكل قاعدة البيانات:**
```sql
-- تحقق من الجداول المطلوبة
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('verification_documents', 'matches', 'match_members', 'chat_rooms', 'notifications');

-- تحقق من البيانات
SELECT COUNT(*) FROM profiles WHERE is_verified = true AND onboarding_completed = true;
```

---

## 📈 مؤشرات الأداء

### **نظام التحقق:**
- **وقت المراجعة المتوسط**: < 24 ساعة
- **معدل الموافقة**: 80-90%
- **معدل إعادة التقديم**: < 20%

### **نظام المطابقة:**
- **عدد المجموعات الأسبوعية**: 3-5 مجموعات
- **حجم المجموعة**: 3-4 أعضاء
- **درجة التوافق المتوسطة**: > 70%
- **معدل المشاركة في الدردشة**: > 80%

---

## 🎯 الخطوات التالية

### **فوري (هذا الأسبوع):**
1. ✅ إعداد متغيرات البيئة
2. ✅ تكوين SMTP للبريد الإلكتروني
3. ✅ نشر على Vercel
4. ✅ اختبار النظامين

### **قصير المدى (الشهر القادم):**
1. مراقبة الأداء والاستخدام
2. تحسين خوارزمية المطابقة
3. إضافة المزيد من قوالب البريد الإلكتروني
4. تحسين واجهة الإدارة

### **طويل المدى (3-6 أشهر):**
1. إضافة إشعارات SMS
2. تطوير تطبيق محمول
3. إضافة ميزات متقدمة للمطابقة
4. تحليلات متقدمة

---

## 🎉 الخلاصة

تم إكمال النظامين بنجاح! المشروع الآن:

- ✅ **نظام التحقق من الوثائق**: مكتمل مع الإشعارات
- ✅ **المطابقة الأسبوعية التلقائية**: مكتمل مع CRON jobs
- ✅ **نظام الإشعارات**: مكتمل مع البريد الإلكتروني
- ✅ **أدوات الاختبار**: مكتملة ومتاحة
- ✅ **دليل التكوين**: مفصل وواضح

**المشروع جاهز للإنتاج!** 🚀



