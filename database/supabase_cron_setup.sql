-- إعداد CRON Jobs في Supabase
-- Setup CRON Jobs in Supabase

-- 1. تفعيل pg_cron extension (يتم من خلال Supabase Dashboard)
-- Enable pg_cron extension (done through Supabase Dashboard)

-- 2. إنشاء جدول لتسجيل CRON jobs
-- Create table to log CRON jobs
CREATE TABLE IF NOT EXISTS cron_job_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  details JSONB
);

-- 3. إنشاء دالة للمطابقة الأسبوعية
-- Create function for weekly matching
CREATE OR REPLACE FUNCTION run_weekly_matching()
RETURNS TEXT AS $$
DECLARE
  result TEXT;
  profiles_count INTEGER;
  groups_created INTEGER;
BEGIN
  -- تسجيل بداية المهمة
  -- Log start of job
  INSERT INTO cron_job_logs (job_name, status, details)
  VALUES ('weekly_matching', 'started', '{"timestamp": "' || NOW() || '"}'::jsonb);

  -- التحقق من وجود ملفات شخصية كافية
  -- Check if there are enough profiles
  SELECT COUNT(*) INTO profiles_count
  FROM profiles 
  WHERE onboarding_completed = true 
    AND is_verified = true 
    AND deleted_at IS NULL;

  IF profiles_count < 3 THEN
    result := 'Not enough profiles for matching: ' || profiles_count;
    
    -- تسجيل الفشل
    -- Log failure
    UPDATE cron_job_logs 
    SET status = 'failed', 
        completed_at = NOW(),
        error_message = result
    WHERE job_name = 'weekly_matching' 
      AND status = 'started' 
      AND started_at = (
        SELECT MAX(started_at) 
        FROM cron_job_logs 
        WHERE job_name = 'weekly_matching'
      );
    
    RETURN result;
  END IF;

  -- إنشاء المطابقات (هذا مثال مبسط)
  -- Create matches (simplified example)
  -- يمكنك استدعاء API endpoint هنا بدلاً من ذلك
  -- You can call API endpoint here instead
  
  -- تسجيل النجاح
  -- Log success
  UPDATE cron_job_logs 
  SET status = 'completed', 
      completed_at = NOW(),
      details = details || ('{"profiles_count": ' || profiles_count || ', "groups_created": ' || groups_created || '}')::jsonb
  WHERE job_name = 'weekly_matching' 
    AND status = 'started' 
    AND started_at = (
      SELECT MAX(started_at) 
      FROM cron_job_logs 
      WHERE job_name = 'weekly_matching'
    );

  result := 'Weekly matching completed successfully. Profiles: ' || profiles_count;
  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- تسجيل الخطأ
    -- Log error
    UPDATE cron_job_logs 
    SET status = 'failed', 
        completed_at = NOW(),
        error_message = SQLERRM
    WHERE job_name = 'weekly_matching' 
      AND status = 'started' 
      AND started_at = (
        SELECT MAX(started_at) 
        FROM cron_job_logs 
        WHERE job_name = 'weekly_matching'
      );
    
    RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 4. طرق إنشاء CRON Jobs في Supabase
-- Methods to create CRON Jobs in Supabase

-- الطريقة الأولى: SQL Snippet (الأسهل)
-- Method 1: SQL Snippet (Easiest)
-- في Supabase Dashboard: Database → Cron → Create new cron job
-- Name: weekly-matching
-- Schedule: 0 16 * * 4 (كل خميس الساعة 4 مساءً)
-- Type: SQL Snippet
-- SQL Snippet:
SELECT run_weekly_matching();

-- الطريقة الثانية: Database Function
-- Method 2: Database Function
-- في Supabase Dashboard: Database → Cron → Create new cron job
-- Name: weekly-matching
-- Schedule: 0 16 * * 4
-- Type: Database function
-- Function: run_weekly_matching()

-- الطريقة الثالثة: HTTP Request (يتطلب pg_net)
-- Method 3: HTTP Request (requires pg_net)
-- في Supabase Dashboard: Database → Cron → Create new cron job
-- Name: weekly-matching-http
-- Schedule: 0 16 * * 4
-- Type: HTTP Request
-- URL: https://your-domain.vercel.app/api/cron/weekly-matching
-- Headers: {"Authorization": "Bearer your-cron-secret"}

-- الطريقة الرابعة: استخدام SQL المباشر (الطريقة القديمة)
-- Method 4: Direct SQL (Old method)
SELECT cron.schedule(
  'weekly-matching',                    -- اسم المهمة
  '0 16 * * 4',                        -- الجدولة: كل خميس الساعة 4 مساءً
  'SELECT run_weekly_matching();'       -- الدالة المراد تنفيذها
);

-- 5. إنشاء دالة للمطابقة الأسبوعية باستخدام HTTP Request
-- Create function for weekly matching using HTTP Request
CREATE OR REPLACE FUNCTION run_weekly_matching_http()
RETURNS TEXT AS $$
DECLARE
  response_data TEXT;
  request_id BIGINT;
BEGIN
  -- تسجيل بداية المهمة
  -- Log start of job
  INSERT INTO cron_job_logs (job_name, status, details)
  VALUES ('weekly-matching-http', 'started', '{"method": "http", "timestamp": "' || NOW() || '"}'::jsonb);

  -- إرسال HTTP Request إلى API endpoint
  -- Send HTTP Request to API endpoint
  SELECT net.http_post(
    url := 'https://your-domain.vercel.app/api/cron/weekly-matching',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer your-cron-secret"}'::JSONB,
    body := '{}'::JSONB
  ) INTO request_id;

  -- تسجيل النجاح
  -- Log success
  UPDATE cron_job_logs 
  SET status = 'completed', 
      completed_at = NOW(),
      details = details || ('{"request_id": ' || request_id || '}')::jsonb
  WHERE job_name = 'weekly-matching-http' 
    AND status = 'started' 
    AND started_at = (
      SELECT MAX(started_at) 
      FROM cron_job_logs 
      WHERE job_name = 'weekly-matching-http'
    );

  RETURN 'HTTP request sent successfully. Request ID: ' || request_id;

EXCEPTION
  WHEN OTHERS THEN
    -- تسجيل الخطأ
    -- Log error
    UPDATE cron_job_logs 
    SET status = 'failed', 
        completed_at = NOW(),
        error_message = SQLERRM
    WHERE job_name = 'weekly-matching-http' 
      AND status = 'started' 
      AND started_at = (
        SELECT MAX(started_at) 
        FROM cron_job_logs 
        WHERE job_name = 'weekly-matching-http'
      );
    
    RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 6. إنشاء دالة لتنظيف السجلات القديمة
-- Create function to clean old logs
CREATE OR REPLACE FUNCTION cleanup_old_cron_logs()
RETURNS TEXT AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM cron_job_logs 
  WHERE started_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN 'Cleaned up ' || deleted_count || ' old cron logs';
END;
$$ LANGUAGE plpgsql;

-- 6. إنشاء CRON job لتنظيف السجلات
-- Create CRON job for cleanup
-- كل يوم في الساعة 2 صباحاً
-- Every day at 2 AM
SELECT cron.schedule(
  'cleanup-logs',
  '0 2 * * *',
  'SELECT cleanup_old_cron_logs();'
);

-- 7. عرض CRON jobs النشطة
-- Show active CRON jobs
SELECT * FROM cron.job;

-- 8. عرض سجلات CRON jobs
-- Show CRON job logs
SELECT * FROM cron_job_logs ORDER BY started_at DESC LIMIT 10;

-- 9. إيقاف CRON job (إذا لزم الأمر)
-- Stop CRON job (if needed)
-- SELECT cron.unschedule('weekly-matching');

-- 10. إعادة تشغيل CRON job
-- Restart CRON job
-- SELECT cron.schedule('weekly-matching', '0 16 * * 4', 'SELECT run_weekly_matching();');

-- ===============================================
-- دليل الإعداد التفصيلي
-- Detailed Setup Guide
-- ===============================================

/*
خطوات الإعداد في Supabase:

1. تفعيل Extensions:
   - اذهب إلى Database → Extensions
   - ابحث عن pg_cron واضغط Enable
   - ابحث عن pg_net واضغط Enable (للطلبات HTTP)

2. تشغيل هذا السكريبت:
   - اذهب إلى SQL Editor
   - انسخ والصق محتوى هذا الملف
   - اضغط Run

3. إنشاء CRON Job (اختر إحدى الطرق):

   الطريقة الأولى - SQL Snippet (الأسهل):
   - اذهب إلى Database → Cron
   - اضغط Create new cron job
   - Name: weekly-matching
   - Schedule: 0 16 * * 4
   - Type: SQL Snippet
   - SQL Snippet: SELECT run_weekly_matching();

   الطريقة الثانية - Database Function:
   - اذهب إلى Database → Cron
   - اضغط Create new cron job
   - Name: weekly-matching
   - Schedule: 0 16 * * 4
   - Type: Database function
   - Function: run_weekly_matching

   الطريقة الثالثة - HTTP Request:
   - اذهب إلى Database → Cron
   - اضغط Create new cron job
   - Name: weekly-matching-http
   - Schedule: 0 16 * * 4
   - Type: HTTP Request
   - URL: https://your-domain.vercel.app/api/cron/weekly-matching
   - Headers: {"Authorization": "Bearer your-cron-secret"}

4. مراقبة المهام:
   - عرض المهام النشطة: SELECT * FROM cron.job;
   - عرض السجلات: SELECT * FROM cron_job_logs ORDER BY started_at DESC;

5. جدولة CRON:
   - 0 16 * * 4 = كل خميس الساعة 4 مساءً UTC
   - 0 2 * * * = كل يوم الساعة 2 صباحاً UTC
   - */5 * * * * = كل 5 دقائق

ملاحظات مهمة:
- تأكد من تحديث URL في الطريقة الثالثة
- تأكد من إضافة CRON_SECRET الصحيح
- الأوقات بتوقيت UTC
- يمكن تشغيل المهام يدوياً للاختبار: SELECT run_weekly_matching();
*/
