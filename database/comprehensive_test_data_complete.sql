    -- ==============================================
-- BeyondRounds Comprehensive Test Data Script
-- إنشاء بيانات اختبار شاملة ومضمونة 100%
-- ==============================================

-- هذا السكريبت ينشئ نظاماً كاملاً للاختبار مع:
-- ✅ مستخدمين معتمدين في Supabase Auth
-- ✅ مطابقات ودفعات
-- ✅ محادثات ورسائل
-- ✅ تقييمات وإشعارات
-- ✅ إحصائيات شاملة

-- ==============================================
-- 1. إنشاء مستخدمين في Supabase Auth أولاً
-- ==============================================

-- ملاحظة: يجب تشغيل هذا الجزء في Supabase SQL Editor
-- أو استخدام scripts/create-test-users.js

-- إنشاء مستخدمين للاختبار
SELECT auth.admin.create_user(
  '{
    "email": "ahmed.hassan@medicalmeet.com",
    "password": "password123",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Ahmed",
      "last_name": "Hassan",
      "city": "Riyadh",
      "medical_specialty": "Cardiology"
    }
  }'
);

SELECT auth.admin.create_user(
  '{
    "email": "sara.alqahtani@medicalmeet.com", 
    "password": "password123",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Sara",
      "last_name": "Al-Qahtani",
      "city": "Riyadh",
      "medical_specialty": "Dermatology"
    }
  }'
);

SELECT auth.admin.create_user(
  '{
    "email": "omar.mohammed@medicalmeet.com",
    "password": "password123", 
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Omar",
      "last_name": "Mohammed",
      "city": "Jeddah",
      "medical_specialty": "Orthopedics"
    }
  }'
);

SELECT auth.admin.create_user(
  '{
    "email": "fatima.alzahra@medicalmeet.com",
    "password": "password123",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Fatima", 
      "last_name": "Al-Zahra",
      "city": "Riyadh",
      "medical_specialty": "Pediatrics"
    }
  }'
);

SELECT auth.admin.create_user(
  '{
    "email": "khalid.alfarisi@medicalmeet.com",
    "password": "password123",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Khalid",
      "last_name": "Al-Farisi", 
      "city": "Riyadh",
      "medical_specialty": "Emergency Medicine"
    }
  }'
);

SELECT auth.admin.create_user(
  '{
    "email": "layla.ibrahim@medicalmeet.com",
    "password": "password123",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Layla",
      "last_name": "Ibrahim",
      "city": "Jeddah", 
      "medical_specialty": "Psychiatry"
    }
  }'
);

SELECT auth.admin.create_user(
  '{
    "email": "yusuf.alnasser@medicalmeet.com",
    "password": "password123",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Yusuf",
      "last_name": "Al-Nasser",
      "city": "Riyadh",
      "medical_specialty": "Radiology"
    }
  }'
);

SELECT auth.admin.create_user(
  '{
    "email": "maryam.alkhalil@medicalmeet.com",
    "password": "password123",
    "email_confirm": true,
    "user_metadata": {
      "first_name": "Maryam",
      "last_name": "Al-Khalil",
      "city": "Riyadh",
      "medical_specialty": "Obstetrics and Gynecology"
    }
  }'
);

-- ==============================================
-- 2. إنشاء بروفايلات المستخدمين
-- ==============================================

-- إنشاء بروفايلات للمستخدمين الجدد
INSERT INTO public.profiles (
  user_id, email, first_name, last_name, medical_specialty, city,
  gender, role, is_verified, is_banned, onboarding_completed, 
  profile_completion, created_at, updated_at
)
SELECT 
  u.id,
  u.email,
  u.raw_user_meta_data->>'first_name',
  u.raw_user_meta_data->>'last_name', 
  u.raw_user_meta_data->>'medical_specialty',
  u.raw_user_meta_data->>'city',
  'prefer-not-to-say',
  'user',
  true,
  false,
  true,
  100,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.email LIKE '%@medicalmeet.com'
AND NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- ==============================================
-- 3. إنشاء دفعات المطابقة
-- ==============================================

INSERT INTO public.match_batches (
  batch_date, total_eligible_users, total_groups_created, 
  total_users_matched, algorithm_version, processing_started_at, processing_completed_at
)
VALUES 
  (current_date - interval '7 days', 8, 2, 6, 'v2.1', now() - interval '7 days 2 hours', now() - interval '7 days 1 hour'),
  (current_date, 8, 2, 8, 'v2.1', now() - interval '2 hours', now() - interval '1 hour')
ON CONFLICT (batch_date) DO NOTHING;

-- ==============================================
-- 4. الحصول على معرفات الدفعات
-- ==============================================

CREATE TEMP TABLE temp_batch_ids AS
SELECT 
    id as batch_id,
    batch_date,
    CASE 
        WHEN batch_date = current_date - interval '7 days' THEN 'last_week'
        WHEN batch_date = current_date THEN 'current_week'
    END as week_type
FROM public.match_batches 
WHERE batch_date IN (current_date - interval '7 days', current_date);

-- ==============================================
-- 5. إنشاء المطابقات
-- ==============================================

-- مطابقات الأسبوع الماضي
INSERT INTO public.matches (
    id, batch_id, group_name, match_week, group_size, 
    average_compatibility, algorithm_version, matching_criteria, success_metrics
)
SELECT 
    gen_random_uuid(),
    batch_id,
    'Medical Group ' || generate_series,
    current_date - interval '7 days',
    3,
    75 + random() * 20,
    'v2.1',
    '{"specialty_diversity": true, "age_range": "5_years"}',
    '{"initial_response_rate": 0.8, "meeting_completion_rate": 0.7}'
FROM temp_batch_ids
CROSS JOIN generate_series(1, 2)
WHERE week_type = 'last_week';

-- مطابقات الأسبوع الحالي
INSERT INTO public.matches (
    id, batch_id, group_name, match_week, group_size, 
    average_compatibility, algorithm_version, matching_criteria, success_metrics
)
SELECT 
    gen_random_uuid(),
    batch_id,
    'New Medical Group ' || generate_series,
    current_date,
    3,
    75 + random() * 20,
    'v2.1',
    '{"specialty_diversity": true, "age_range": "5_years"}',
    '{"initial_response_rate": 0.8, "meeting_completion_rate": 0.7}'
FROM temp_batch_ids
CROSS JOIN generate_series(1, 2)
WHERE week_type = 'current_week';

-- ==============================================
-- 6. إنشاء قائمة بالمطابقات المُنشأة
-- ==============================================

CREATE TEMP TABLE temp_new_matches AS
SELECT 
    id as match_id,
    group_name,
    match_week,
    row_number() OVER (ORDER BY created_at) as match_order
FROM public.matches 
WHERE group_name LIKE 'Medical Group%' OR group_name LIKE 'New Medical Group%'
ORDER BY created_at;

-- ==============================================
-- 7. الحصول على قائمة بالمستخدمين
-- ==============================================

CREATE TEMP TABLE temp_test_users AS
SELECT 
    id as profile_id,
    first_name || ' ' || last_name as full_name,
    row_number() OVER (ORDER BY random()) as user_order
FROM public.profiles 
WHERE email LIKE '%@medicalmeet.com'
ORDER BY random();

-- ==============================================
-- 8. إنشاء أعضاء المطابقات
-- ==============================================

-- توزيع المستخدمين: 3 لكل مطابقة
INSERT INTO public.match_members (
    match_id, profile_id, compatibility_score, compatibility_factors, joined_at, is_active
)
SELECT 
    tnm.match_id,
    ttu.profile_id,
    70 + random() * 25,
    jsonb_build_object(
        'specialty_match', random() > 0.5,
        'age_compatibility', 0.6 + random() * 0.3,
        'location_proximity', 0.7 + random() * 0.2,
        'interest_overlap', 0.5 + random() * 0.4
    ),
    tnm.match_week + interval '1 hour' * random(),
    true
FROM temp_new_matches tnm
CROSS JOIN temp_test_users ttu
WHERE ttu.user_order BETWEEN (tnm.match_order - 1) * 3 + 1 AND tnm.match_order * 3
AND tnm.match_order <= 4; -- أول 4 مطابقات فقط لضمان وجود مستخدمين كافيين

-- ==============================================
-- 9. إنشاء غرف المحادثة
-- ==============================================

INSERT INTO public.chat_rooms (match_id, name, description, is_active, message_count, last_message_at, settings)
SELECT 
    tnm.match_id,
    'Chat: ' || tnm.group_name,
    'Group chat for ' || tnm.group_name,
    true,
    0,
    tnm.match_week + interval '1 day' + interval '1 hour' * random() * 24,
    jsonb_build_object(
        'notifications_enabled', true,
        'file_sharing_enabled', true,
        'max_message_length', 1000
    )
FROM temp_new_matches tnm;

-- ==============================================
-- 10. إنشاء رسائل بسيطة
-- ==============================================

-- قوالب الرسائل
CREATE TEMP TABLE temp_messages AS
SELECT 
    unnest(ARRAY[
        'Hello everyone! 😊',
        'Looking forward to meeting you all',
        'What time works best for everyone this week?',
        'Great to be part of this professional group',
        'Thanks for the warm welcome',
        'Excited to learn from experienced colleagues',
        'Shall we plan our first coffee meetup?',
        'Hope everyone is doing well',
        'Any interesting cases to discuss?',
        'Looking forward to our collaboration'
    ]) as content,
    generate_series(1, 10) as msg_id;

-- إضافة الرسائل
INSERT INTO public.chat_messages (
    chat_room_id, match_id, sender_id, content, created_at, search_vector
)
SELECT 
    cr.id as chat_room_id,
    cr.match_id,
    mm.profile_id as sender_id,
    tm.content,
    cr.last_message_at - interval '1 day' * random() * 6,
    to_tsvector('english', tm.content)
FROM public.chat_rooms cr
JOIN temp_new_matches tnm ON cr.match_id = tnm.match_id
JOIN public.match_members mm ON cr.match_id = mm.match_id
CROSS JOIN temp_messages tm
WHERE tm.msg_id <= 3 + floor(random() * 4)::int
AND random() < 0.7;

-- ==============================================
-- 11. إنشاء ردود فعل على الرسائل
-- ==============================================

INSERT INTO public.message_reactions (message_id, profile_id, emoji)
SELECT 
    cm.id,
    mm.profile_id,
    CASE floor(random() * 4)
        WHEN 0 THEN '👍'
        WHEN 1 THEN '❤️'
        WHEN 2 THEN '😊'
        ELSE '👏'
    END
FROM public.chat_messages cm
JOIN public.match_members mm ON cm.match_id = mm.match_id
WHERE mm.profile_id != cm.sender_id
AND random() < 0.3;

-- ==============================================
-- 12. إنشاء حالة قراءة الرسائل
-- ==============================================

INSERT INTO public.message_read_status (message_id, profile_id, read_at)
SELECT 
    cm.id,
    mm.profile_id,
    cm.created_at + interval '1 hour' * (1 + random() * 8)
FROM public.chat_messages cm
JOIN public.match_members mm ON cm.match_id = mm.match_id
WHERE mm.profile_id != cm.sender_id
AND random() < 0.8;

-- ==============================================
-- 13. إنشاء تقييمات للمطابقات المكتملة
-- ==============================================

INSERT INTO public.feedback (
    match_id, reviewer_id, reviewee_id, did_meet, would_meet_again,
    overall_rating, communication_rating, punctuality_rating, engagement_rating,
    feedback_text, safety_concern
)
SELECT 
    mm1.match_id,
    mm1.profile_id as reviewer_id,
    mm2.profile_id as reviewee_id,
    CASE WHEN random() < 0.85 THEN true ELSE false END,
    CASE WHEN random() < 0.75 THEN true ELSE false END,
    4 + floor(random() * 2)::int,
    4 + floor(random() * 2)::int,
    4 + floor(random() * 2)::int,
    4 + floor(random() * 2)::int,
    CASE floor(random() * 5)
        WHEN 0 THEN 'Excellent experience with professional colleagues'
        WHEN 1 THEN 'Great networking opportunity and meaningful discussions'
        WHEN 2 THEN 'Productive meeting, learned a lot from their expertise'
        WHEN 3 THEN 'Professional and courteous, great collaboration'
        ELSE 'Positive experience overall, looking forward to more meetings'
    END,
    false
FROM public.match_members mm1
JOIN public.match_members mm2 ON mm1.match_id = mm2.match_id
JOIN temp_new_matches tnm ON mm1.match_id = tnm.match_id
WHERE mm1.profile_id != mm2.profile_id
AND tnm.match_week < current_date
AND random() < 0.4;

-- ==============================================
-- 14. إنشاء إشعارات
-- ==============================================

INSERT INTO public.notifications (
    profile_id, title, message, data, is_read, read_at, is_sent, sent_at
)
SELECT 
    ttu.profile_id,
    CASE floor(random() * 4)
        WHEN 0 THEN 'New Match Found! 🎉'
        WHEN 1 THEN 'New Message in Chat'
        WHEN 2 THEN 'Meeting Reminder'
        ELSE 'Feedback Request'
    END,
    CASE floor(random() * 4)
        WHEN 0 THEN 'We found perfect colleagues for you this week!'
        WHEN 1 THEN 'You have new messages from your group members'
        WHEN 2 THEN 'Don''t forget your scheduled meetup today'
        ELSE 'Please share feedback about your recent meeting'
    END,
    jsonb_build_object(
        'type', CASE floor(random() * 4)
            WHEN 0 THEN 'new_match'
            WHEN 1 THEN 'new_message' 
            WHEN 2 THEN 'meeting_reminder'
            ELSE 'feedback_request'
        END,
        'priority', CASE WHEN random() < 0.2 THEN 'high' ELSE 'normal' END
    ),
    random() < 0.75,
    CASE WHEN random() < 0.75 THEN now() - interval '1 hour' * random() * 48 ELSE NULL END,
    true,
    now() - interval '1 hour' * random() * 72
FROM temp_test_users ttu
CROSS JOIN generate_series(1, 2)
WHERE random() < 0.9;

-- ==============================================
-- 15. تحديث الإحصائيات النهائية
-- ==============================================

-- تحديث عدد الرسائل في غرف المحادثة
UPDATE public.chat_rooms 
SET message_count = (
    SELECT count(*) 
    FROM public.chat_messages cm 
    WHERE cm.chat_room_id = chat_rooms.id
)
WHERE match_id IN (SELECT match_id FROM temp_new_matches);

-- تحديث آخر نشاط للمطابقات
UPDATE public.matches 
SET last_activity_at = GREATEST(
    last_activity_at,
    COALESCE((
        SELECT max(cm.created_at) 
        FROM public.chat_messages cm 
        WHERE cm.match_id = matches.id
    ), last_activity_at)
)
WHERE id IN (SELECT match_id FROM temp_new_matches);

-- ==============================================
-- 16. تنظيف الجداول المؤقتة
-- ==============================================

DROP TABLE temp_batch_ids;
DROP TABLE temp_new_matches;
DROP TABLE temp_test_users;
DROP TABLE temp_messages;

-- ==============================================
-- 17. عرض النتائج النهائية
-- ==============================================

SELECT 
    '🎉 تم إنشاء النظام بنجاح!' as status,
    '=========================' as separator
UNION ALL
SELECT 
    'إجمالي المستخدمين: ' || count(*)::text,
    ''
FROM public.profiles 
WHERE email LIKE '%@medicalmeet.com'
UNION ALL
SELECT 
    'إجمالي المطابقات: ' || count(*)::text,
    ''
FROM public.matches 
WHERE group_name LIKE '%Medical Group%'
UNION ALL
SELECT 
    'غرف المحادثة: ' || count(*)::text,
    ''
FROM public.chat_rooms cr
JOIN public.matches m ON cr.match_id = m.id
WHERE m.group_name LIKE '%Medical Group%'
UNION ALL
SELECT 
    'إجمالي الرسائل: ' || count(*)::text,
    ''
FROM public.chat_messages cm
JOIN public.profiles p ON cm.sender_id = p.id
WHERE p.email LIKE '%@medicalmeet.com'
UNION ALL
SELECT 
    'التقييمات: ' || count(*)::text,
    ''
FROM public.feedback f
JOIN public.profiles p ON f.reviewer_id = p.id
WHERE p.email LIKE '%@medicalmeet.com'
UNION ALL
SELECT 
    'متوسط التقييم: ' || round(avg(overall_rating), 1)::text || '/5',
    ''
FROM public.feedback f
JOIN public.profiles p ON f.reviewer_id = p.id
WHERE p.email LIKE '%@medicalmeet.com'
UNION ALL
SELECT 
    'الإشعارات: ' || count(*)::text,
    ''
FROM public.notifications n
JOIN public.profiles p ON n.profile_id = p.id
WHERE p.email LIKE '%@medicalmeet.com'
UNION ALL
SELECT 
    '✅ النظام جاهز للاختبار!',
    'استخدم أي إيميل @medicalmeet.com + password123';
