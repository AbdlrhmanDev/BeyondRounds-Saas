# 🕐 دليل إعداد CRON Jobs في Supabase

## 📋 المتطلبات الأساسية

### 1. تفعيل Extensions المطلوبة:
1. اذهب إلى **Supabase Dashboard**
2. اختر مشروعك
3. اذهب إلى **Database** → **Extensions**
4. ابحث عن **pg_cron** واضغط **Enable**
5. ابحث عن **pg_net** واضغط **Enable** (للطلبات HTTP)

### 2. تشغيل سكريبت الإعداد:
1. اذهب إلى **SQL Editor** في Supabase
2. انسخ والصق محتوى ملف `database/supabase_cron_setup.sql`
3. اضغط **Run**

---

## 🔧 طرق إنشاء CRON Jobs

### الطريقة الأولى: SQL Snippet (الأسهل) ⭐

1. اذهب إلى **Database** → **Cron**
2. اضغط **Create new cron job**
3. املأ البيانات:
   ```
   Name: weekly-matching
   Schedule: 0 16 * * 4
   Type: SQL Snippet
   SQL Snippet: SELECT run_weekly_matching();
   ```
4. اضغط **Create**

### الطريقة الثانية: Database Function

1. اذهب إلى **Database** → **Cron**
2. اضغط **Create new cron job**
3. املأ البيانات:
   ```
   Name: weekly-matching
   Schedule: 0 16 * * 4
   Type: Database function
   Function: run_weekly_matching
   ```
4. اضغط **Create**

### الطريقة الثالثة: HTTP Request

1. اذهب إلى **Database** → **Cron**
2. اضغط **Create new cron job**
3. املأ البيانات:
   ```
   Name: weekly-matching-http
   Schedule: 0 16 * * 4
   Type: HTTP Request
   URL: https://your-domain.vercel.app/api/cron/weekly-matching
   Headers: {"Authorization": "Bearer your-cron-secret"}
   ```
4. اضغط **Create**

---

## 📅 فهم جدولة CRON

| التعبير | المعنى | المثال |
|---------|--------|---------|
| `0 16 * * 4` | كل خميس الساعة 4 مساءً UTC | المطابقة الأسبوعية |
| `0 2 * * *` | كل يوم الساعة 2 صباحاً UTC | تنظيف السجلات |
| `*/5 * * * *` | كل 5 دقائق | اختبار سريع |
| `0 0 * * 0` | كل أحد منتصف الليل UTC | تقارير أسبوعية |

### صيغة CRON:
```
* * * * *
│ │ │ │ │
│ │ │ │ └── يوم الأسبوع (0-7, حيث 0 و 7 = الأحد)
│ │ │ └──── الشهر (1-12)
│ │ └────── يوم الشهر (1-31)
│ └──────── الساعة (0-23)
└────────── الدقيقة (0-59)
```

---

## 📊 مراقبة وإدارة المهام

### عرض المهام النشطة:
```sql
SELECT 
  jobid,
  jobname,
  schedule,
  command,
  active
FROM cron.job;
```

### عرض سجلات المهام:
```sql
SELECT 
  job_name,
  status,
  started_at,
  completed_at,
  error_message
FROM cron_job_logs 
ORDER BY started_at DESC 
LIMIT 20;
```

### تشغيل مهمة يدوياً (للاختبار):
```sql
SELECT run_weekly_matching();
```

### إيقاف مهمة:
```sql
SELECT cron.unschedule('weekly-matching');
```

### إعادة تشغيل مهمة:
```sql
SELECT cron.schedule(
  'weekly-matching',
  '0 16 * * 4',
  'SELECT run_weekly_matching();'
);
```

---

## ⚠️ ملاحظات مهمة

1. **التوقيت**: جميع الأوقات بتوقيت UTC
2. **الأمان**: تأكد من إضافة `CRON_SECRET` الصحيح للطريقة الثالثة
3. **الاختبار**: يمكن تشغيل المهام يدوياً قبل جدولتها
4. **المراقبة**: راقب السجلات بانتظام للتأكد من عمل المهام
5. **الصيانة**: سجلات المهام تُنظف تلقائياً كل 30 يوم

---

## 🔍 استكشاف الأخطاء

### إذا لم تعمل المهمة:
1. تحقق من تفعيل `pg_cron` extension
2. تحقق من صحة جدولة CRON
3. تحقق من السجلات: `SELECT * FROM cron_job_logs WHERE status = 'failed';`
4. تشغيل المهمة يدوياً للاختبار

### إذا فشلت الطلبات HTTP:
1. تحقق من تفعيل `pg_net` extension
2. تحقق من صحة URL
3. تحقق من صحة Headers
4. تحقق من `CRON_SECRET`

---

## 📈 إحصائيات المهام

```sql
SELECT 
  job_name,
  COUNT(*) as total_runs,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as successful_runs,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_runs,
  ROUND(
    AVG(EXTRACT(EPOCH FROM (completed_at - started_at))), 2
  ) as avg_duration_seconds
FROM cron_job_logs 
GROUP BY job_name;
```



