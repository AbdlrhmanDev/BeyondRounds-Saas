-- ==============================================
-- البحث عن مراجع العمود الخطأ profile_completion_percentage
-- ==============================================
-- شغّل هذه الاستعلامات للبحث عن أي مرجع للعمود الخطأ

-- 1. البحث عن أي عمود/فيو يحمل الاسم الخطأ
SELECT n.nspname as schema, c.relname as object_name, a.attname as column_name
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE a.attname = 'profile_completion_percentage';

-- 2. البحث عن دوال PL/pgSQL تحتوي الاسم الخطأ
SELECT proname, prosrc
FROM pg_proc
WHERE prosrc ILIKE '%profile_completion_percentage%';

-- 3. البحث عن سياسات RLS قد تشير للعمود الخطأ
SELECT polname, relname as table_name,
       pg_get_expr(pol.polqual, pol.polrelid) as using_expr,
       pg_get_expr(pol.polwithcheck, pol.polrelid) as with_check_expr
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE pg_get_expr(pol.polqual, pol.polrelid) ILIKE '%profile_completion_percentage%'
   OR pg_get_expr(pol.polwithcheck, pol.polrelid) ILIKE '%profile_completion_percentage%';

-- 4. البحث عن تريغرز تحتوي الاسم الخطأ
SELECT tgname, tgrelid::regclass as table_name, pg_get_triggerdef(oid)
FROM pg_trigger
WHERE pg_get_triggerdef(oid) ILIKE '%profile_completion_percentage%';

-- 5. البحث عن أي views أو functions أخرى
SELECT schemaname, viewname, definition
FROM pg_views
WHERE definition ILIKE '%profile_completion_percentage%';

-- 6. التحقق من العمود الصحيح الموجود
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
  AND column_name LIKE '%profile_completion%';

SELECT 'البحث عن مراجع العمود الخطأ مكتمل!' as status;


