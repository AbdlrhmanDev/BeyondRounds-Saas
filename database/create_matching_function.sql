-- سكريبت إنشاء دالة المطابقة الأسبوعية
-- Weekly Matching Function Creation Script

-- 1. إنشاء جدول لتسجيل CRON jobs (إذا لم يكن موجوداً)
-- Create table to log CRON jobs (if not exists)
CREATE TABLE IF NOT EXISTS cron_job_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('started', 'completed', 'failed')),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. إنشاء دالة للمطابقة الأسبوعية
-- Create function for weekly matching
CREATE OR REPLACE FUNCTION run_weekly_matching()
RETURNS TEXT AS $$
DECLARE
  result TEXT;
  profiles_count INTEGER;
  groups_created INTEGER := 0;
  current_week INTEGER;
BEGIN
  -- تسجيل بداية المهمة
  -- Log start of job
  INSERT INTO cron_job_logs (job_name, status, details)
  VALUES ('weekly-matching', 'started', '{"timestamp": "' || NOW() || '"}'::jsonb);

  -- الحصول على رقم الأسبوع الحالي
  -- Get current week number
  current_week := EXTRACT(WEEK FROM NOW());

  -- التحقق من وجود ملفات شخصية كافية
  -- Check if there are enough profiles
  SELECT COUNT(*) INTO profiles_count
  FROM profiles 
  WHERE onboarding_completed = true 
    AND is_verified = true 
    AND deleted_at IS NULL
    AND (last_matched_at IS NULL OR EXTRACT(WEEK FROM last_matched_at) < current_week);

  IF profiles_count < 3 THEN
    result := 'Not enough profiles for matching: ' || profiles_count;
    
    -- تسجيل الفشل
    -- Log failure
    UPDATE cron_job_logs 
    SET status = 'failed', 
        completed_at = NOW(),
        error_message = result
    WHERE job_name = 'weekly-matching' 
      AND status = 'started' 
      AND started_at = (
        SELECT MAX(started_at) 
        FROM cron_job_logs 
        WHERE job_name = 'weekly-matching'
      );
    
    RETURN result;
  END IF;

  -- إنشاء المطابقات (مثال مبسط)
  -- Create matches (simplified example)
  -- هنا يمكنك إضافة منطق المطابقة الفعلي
  -- Here you can add the actual matching logic
  
  -- تسجيل النجاح
  -- Log success
  UPDATE cron_job_logs 
  SET status = 'completed', 
      completed_at = NOW(),
      details = details || ('{"profiles_count": ' || profiles_count || ', "groups_created": ' || groups_created || ', "week": ' || current_week || '}')::jsonb
  WHERE job_name = 'weekly-matching' 
    AND status = 'started' 
    AND started_at = (
      SELECT MAX(started_at) 
      FROM cron_job_logs 
      WHERE job_name = 'weekly-matching'
    );

  result := 'Weekly matching completed successfully. Profiles: ' || profiles_count || ', Week: ' || current_week;
  RETURN result;

EXCEPTION
  WHEN OTHERS THEN
    -- تسجيل الخطأ
    -- Log error
    UPDATE cron_job_logs 
    SET status = 'failed', 
        completed_at = NOW(),
        error_message = SQLERRM
    WHERE job_name = 'weekly-matching' 
      AND status = 'started' 
      AND started_at = (
        SELECT MAX(started_at) 
        FROM cron_job_logs 
        WHERE job_name = 'weekly-matching'
      );
    
    RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- 3. اختبار الدالة
-- Test the function
SELECT run_weekly_matching();

-- 4. عرض السجلات
-- Show logs
SELECT * FROM cron_job_logs ORDER BY started_at DESC LIMIT 5;
