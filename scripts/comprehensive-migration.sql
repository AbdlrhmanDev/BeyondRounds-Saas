-- =========================================================
-- MIGRATION: Hardening schema + safe RLS (no recursion)
-- =========================================================

-- 0) Safety: enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1) Fix audit_log.changed_fields -> text[] (safe if already correct)
DO $$
DECLARE
  coltype text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='audit_log' AND column_name='changed_fields'
  ) THEN
    SELECT atttypid::regtype::text INTO coltype
    FROM pg_attribute a
    JOIN pg_class c ON a.attrelid=c.oid
    JOIN pg_namespace n ON n.oid=c.relnamespace
    WHERE n.nspname='public' AND c.relname='audit_log' AND a.attname='changed_fields';

    IF coltype IS DISTINCT FROM 'text[]' THEN
      ALTER TABLE public.audit_log
        ALTER COLUMN changed_fields TYPE text[] USING COALESCE(changed_fields::text[], '{}');
    END IF;

    ALTER TABLE public.audit_log
      ALTER COLUMN changed_fields SET NOT NULL,
      ALTER COLUMN changed_fields SET DEFAULT '{}'::text[];
  END IF;
END$$;

-- 2) Partial UNIQUEs to play nice with soft-delete
-- Email unique (ignore deleted)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='public' AND indexname='uniq_profiles_email_active'
  ) THEN
    CREATE UNIQUE INDEX uniq_profiles_email_active
    ON public.profiles (lower(email))
    WHERE deleted_at IS NULL AND email IS NOT NULL;
  END IF;
END$$;

-- One preference per profile (ignore deleted)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname='user_preferences_profile_id_key') THEN
    ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS user_preferences_profile_id_key;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uniq_user_prefs_profile_active'
  ) THEN
    CREATE UNIQUE INDEX uniq_user_prefs_profile_active
    ON public.user_preferences (profile_id)
    WHERE deleted_at IS NULL;
  END IF;
END$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname='profile_preferences_profile_id_key') THEN
    ALTER TABLE public.profile_preferences DROP CONSTRAINT IF EXISTS profile_preferences_profile_id_key;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uniq_prof_prefs_profile_active'
  ) THEN
    CREATE UNIQUE INDEX uniq_prof_prefs_profile_active
    ON public.profile_preferences (profile_id)
    WHERE deleted_at IS NULL;
  END IF;
END$$;

-- 3) UNIQUE constraints (idempotent; لا يفشل لو كانت موجودة)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uniq_match_members') THEN
    ALTER TABLE public.match_members
      ADD CONSTRAINT uniq_match_members UNIQUE (match_id, profile_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uniq_message_read') THEN
    ALTER TABLE public.message_read_status
      ADD CONSTRAINT uniq_message_read UNIQUE (message_id, profile_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uniq_message_reaction') THEN
    ALTER TABLE public.message_reactions
      ADD CONSTRAINT uniq_message_reaction UNIQUE (message_id, profile_id, emoji);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uniq_profile_interest') THEN
    ALTER TABLE public.profile_interests
      ADD CONSTRAINT uniq_profile_interest UNIQUE (profile_id, kind, value);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uniq_profile_specialty') THEN
    ALTER TABLE public.profile_specialties
      ADD CONSTRAINT uniq_profile_specialty UNIQUE (profile_id, specialty);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uniq_availability_slot') THEN
    ALTER TABLE public.profile_availability_slots
      ADD CONSTRAINT uniq_availability_slot UNIQUE (profile_id, day_of_week, start_time, end_time);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='uniq_feedback_triplet') THEN
    ALTER TABLE public.feedback
      ADD CONSTRAINT uniq_feedback_triplet UNIQUE (match_id, reviewer_id, reviewee_id);
  END IF;
END$$;

-- 4) Strengthen FKs with ON DELETE actions
-- profiles -> auth.users
ALTER TABLE IF EXISTS public.profiles
  DROP CONSTRAINT IF EXISTS profiles_user_id_fkey,
  ADD CONSTRAINT profiles_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop all existing FKs that reference profiles (we'll re-add key ones with proper actions)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT c.conname, t.relname
    FROM pg_constraint c
    JOIN pg_class t ON t.oid=c.conrelid
    JOIN pg_namespace n ON n.oid=t.relnamespace
    WHERE n.nspname='public' AND c.confrelid = 'public.profiles'::regclass
      AND c.contype='f'
  LOOP
    EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT IF EXISTS %I;', r.relname, r.conname);
  END LOOP;
END$$;

-- Re-add key FKs with proper actions
ALTER TABLE IF EXISTS public.chat_messages
  ADD CONSTRAINT chat_messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  ADD CONSTRAINT chat_messages_moderated_by_fkey
    FOREIGN KEY (moderated_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.chat_rooms
  DROP CONSTRAINT IF EXISTS chat_rooms_match_id_fkey,
  ADD CONSTRAINT chat_rooms_match_id_fkey
    FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.match_members
  DROP CONSTRAINT IF EXISTS match_members_match_id_fkey,
  ADD CONSTRAINT match_members_match_id_fkey
    FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS match_members_profile_id_fkey,
  ADD CONSTRAINT match_members_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.match_history
  DROP CONSTRAINT IF EXISTS match_history_profile1_id_fkey,
  ADD CONSTRAINT match_history_profile1_id_fkey
    FOREIGN KEY (profile1_id) REFERENCES public.profiles(id) ON DELETE SET NULL,
  DROP CONSTRAINT IF EXISTS match_history_profile2_id_fkey,
  ADD CONSTRAINT match_history_profile2_id_fkey
    FOREIGN KEY (profile2_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.message_reactions
  DROP CONSTRAINT IF EXISTS message_reactions_profile_id_fkey,
  ADD CONSTRAINT message_reactions_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS message_reactions_message_id_fkey,
  ADD CONSTRAINT message_reactions_message_id_fkey
    FOREIGN KEY (message_id) REFERENCES public.chat_messages(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.message_read_status
  DROP CONSTRAINT IF EXISTS message_read_status_profile_id_fkey,
  ADD CONSTRAINT message_read_status_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS message_read_status_message_id_fkey,
  ADD CONSTRAINT message_read_status_message_id_fkey
    FOREIGN KEY (message_id) REFERENCES public.chat_messages(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.notifications
  DROP CONSTRAINT IF EXISTS notifications_profile_id_fkey,
  ADD CONSTRAINT notifications_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.payments
  DROP CONSTRAINT IF EXISTS payments_profile_id_fkey,
  ADD CONSTRAINT payments_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS payments_payment_plan_id_fkey,
  ADD CONSTRAINT payments_payment_plan_id_fkey
    FOREIGN KEY (payment_plan_id) REFERENCES public.payment_plans(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.user_preferences
  DROP CONSTRAINT IF EXISTS user_preferences_profile_id_fkey,
  ADD CONSTRAINT user_preferences_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.user_subscriptions
  DROP CONSTRAINT IF EXISTS user_subscriptions_profile_id_fkey,
  ADD CONSTRAINT user_subscriptions_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS user_subscriptions_payment_plan_id_fkey,
  ADD CONSTRAINT user_subscriptions_payment_plan_id_fkey
    FOREIGN KEY (payment_plan_id) REFERENCES public.payment_plans(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.verification_documents
  DROP CONSTRAINT IF EXISTS verification_documents_profile_id_fkey,
  ADD CONSTRAINT verification_documents_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS verification_documents_reviewed_by_fkey,
  ADD CONSTRAINT verification_documents_reviewed_by_fkey
    FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.feedback
  DROP CONSTRAINT IF EXISTS feedback_match_id_fkey,
  ADD CONSTRAINT feedback_match_id_fkey
    FOREIGN KEY (match_id) REFERENCES public.matches(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS feedback_reviewer_id_fkey,
  ADD CONSTRAINT feedback_reviewer_id_fkey
    FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  DROP CONSTRAINT IF EXISTS feedback_reviewee_id_fkey,
  ADD CONSTRAINT feedback_reviewee_id_fkey
    FOREIGN KEY (reviewee_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.feedback_improvement_areas
  DROP CONSTRAINT IF EXISTS feedback_improvement_areas_feedback_id_fkey,
  ADD CONSTRAINT feedback_improvement_areas_feedback_id_fkey
    FOREIGN KEY (feedback_id) REFERENCES public.feedback(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.feedback_positive_aspects
  DROP CONSTRAINT IF EXISTS feedback_positive_aspects_feedback_id_fkey,
  ADD CONSTRAINT feedback_positive_aspects_feedback_id_fkey
    FOREIGN KEY (feedback_id) REFERENCES public.feedback(id) ON DELETE CASCADE;

-- 5) Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id     ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_city        ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted     ON public.profiles(deleted_at);

CREATE INDEX IF NOT EXISTS idx_mm_match             ON public.match_members(match_id);
CREATE INDEX IF NOT EXISTS idx_mm_profile           ON public.match_members(profile_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room   ON public.chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_match  ON public.chat_messages(match_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_flag   ON public.chat_messages(is_flagged) WHERE is_flagged = true;

CREATE INDEX IF NOT EXISTS idx_notifications_profile ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read    ON public.notifications(is_read);

-- GIN for tsvector columns
CREATE INDEX IF NOT EXISTS gin_profiles_search ON public.profiles USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS gin_messages_search ON public.chat_messages USING GIN (search_vector);

-- 6) Utility functions/triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END$$;

-- attach to tables with updated_at
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT t.relname
           FROM pg_attribute a
           JOIN pg_class t ON t.oid=a.attrelid
           JOIN pg_namespace n ON n.oid=t.relnamespace
           WHERE a.attname='updated_at' AND n.nspname='public'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_updated_at ON public.%I;', r.relname);
    EXECUTE format('CREATE TRIGGER trg_set_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();', r.relname);
  END LOOP;
END$$;

-- Optional: auto-build search_vector (adjust fields as needed)
CREATE OR REPLACE FUNCTION public.profiles_search_tsv()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('simple', coalesce(NEW.first_name,'') || ' ' || coalesce(NEW.last_name,'')), 'A') ||
    setweight(to_tsvector('simple', coalesce(NEW.medical_specialty,'')), 'B') ||
    setweight(to_tsvector('simple', coalesce(NEW.city,'')), 'C');
  RETURN NEW;
END$$;

DROP TRIGGER IF EXISTS trg_profiles_tsv ON public.profiles;
CREATE TRIGGER trg_profiles_tsv
BEFORE INSERT OR UPDATE OF first_name, last_name, medical_specialty, city
ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.profiles_search_tsv();

-- 7) RLS: safe, no recursion
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Clean existing policies on those tables (idempotent)
DO $$
DECLARE p RECORD;
BEGIN
  FOR p IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname='public' AND tablename IN
     ('profiles','match_members','chat_rooms','chat_messages','message_read_status',
      'message_reactions','notifications','profile_preferences','user_preferences','feedback')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', p.policyname, p.tablename);
  END LOOP;
END$$;

-- helper: get my profile_id (SECURITY DEFINER to escape RLS)
CREATE OR REPLACE FUNCTION public.my_profile_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid()
$$;

REVOKE ALL ON FUNCTION public.my_profile_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.my_profile_id() TO authenticated;

-- profiles: read own + peers in same match
CREATE POLICY profiles_select_own
ON public.profiles
FOR SELECT TO authenticated
USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY profiles_select_peers
ON public.profiles
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1
    FROM public.match_members mm_me
    JOIN public.match_members mm_them
      ON mm_me.match_id = mm_them.match_id
    WHERE mm_me.profile_id = public.my_profile_id()
      AND mm_them.profile_id = profiles.id
      AND COALESCE(mm_me.is_active, true)
      AND COALESCE(mm_them.is_active, true)
  )
);

CREATE POLICY profiles_insert_own
ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY profiles_update_own
ON public.profiles
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- (column-level perms to block sensitive updates)
REVOKE UPDATE ON public.profiles FROM authenticated;
GRANT UPDATE (
  first_name, last_name, age, gender, nationality, city, timezone,
  medical_specialty, bio, looking_for, profile_completion, onboarding_completed
) ON public.profiles TO authenticated;

-- match_members: see members of matches you are in
CREATE POLICY mm_select_my_matches
ON public.match_members
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.match_members mm
    WHERE mm.match_id = match_members.match_id
      AND mm.profile_id = public.my_profile_id()
  )
);

-- chat_rooms: visible if you are member in its match
CREATE POLICY chat_rooms_select_my
ON public.chat_rooms
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.match_members mm
    WHERE mm.match_id = chat_rooms.match_id
      AND mm.profile_id = public.my_profile_id()
  )
);

-- chat_messages: read if you are in same match; insert إذا أنت المرسل وعضو
CREATE POLICY chat_messages_select_my
ON public.chat_messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.match_members mm
    WHERE mm.match_id = chat_messages.match_id
      AND mm.profile_id = public.my_profile_id()
  )
);

CREATE POLICY chat_messages_insert_own
ON public.chat_messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = public.my_profile_id()
  AND EXISTS (
    SELECT 1 FROM public.match_members mm
    WHERE mm.match_id = chat_messages.match_id
      AND mm.profile_id = public.my_profile_id()
  )
);

CREATE POLICY chat_messages_update_own
ON public.chat_messages
FOR UPDATE TO authenticated
USING (sender_id = public.my_profile_id())
WITH CHECK (sender_id = public.my_profile_id());

-- message_read_status / reactions: own only
CREATE POLICY mread_select_own
ON public.message_read_status
FOR SELECT TO authenticated
USING (profile_id = public.my_profile_id());

CREATE POLICY mread_upsert_own
ON public.message_read_status
FOR INSERT TO authenticated
WITH CHECK (profile_id = public.my_profile_id());

CREATE POLICY mread_update_own
ON public.message_read_status
FOR UPDATE TO authenticated
USING (profile_id = public.my_profile_id())
WITH CHECK (profile_id = public.my_profile_id());

CREATE POLICY react_select_own
ON public.message_reactions
FOR SELECT TO authenticated
USING (profile_id = public.my_profile_id());

CREATE POLICY react_insert_own
ON public.message_reactions
FOR INSERT TO authenticated
WITH CHECK (profile_id = public.my_profile_id());

CREATE POLICY react_update_own
ON public.message_reactions
FOR UPDATE TO authenticated
USING (profile_id = public.my_profile_id())
WITH CHECK (profile_id = public.my_profile_id());

-- notifications: own only
CREATE POLICY notif_select_own
ON public.notifications
FOR SELECT TO authenticated
USING (profile_id = public.my_profile_id());

CREATE POLICY notif_update_own
ON public.notifications
FOR UPDATE TO authenticated
USING (profile_id = public.my_profile_id())
WITH CHECK (profile_id = public.my_profile_id());

-- preferences: own only
CREATE POLICY pprefs_rw_own
ON public.profile_preferences
FOR ALL TO authenticated
USING (profile_id = public.my_profile_id())
WITH CHECK (profile_id = public.my_profile_id());

CREATE POLICY uprefs_rw_own
ON public.user_preferences
FOR ALL TO authenticated
USING (profile_id = public.my_profile_id())
WITH CHECK (profile_id = public.my_profile_id());

-- feedback: تقرأ أو تكتب لو كنت المراجع أو المراجَع، أو عضو في نفس الماتش
CREATE POLICY feedback_select_my
ON public.feedback
FOR SELECT TO authenticated
USING (
  reviewer_id = public.my_profile_id()
  OR reviewee_id = public.my_profile_id()
  OR EXISTS (
    SELECT 1 FROM public.match_members mm
    WHERE mm.match_id = feedback.match_id
      AND mm.profile_id = public.my_profile_id()
  )
);

CREATE POLICY feedback_insert_my
ON public.feedback
FOR INSERT TO authenticated
WITH CHECK (reviewer_id = public.my_profile_id());

-- Service-role full access
CREATE POLICY profiles_service_all ON public.profiles           FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY mm_service_all       ON public.match_members      FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY cr_service_all       ON public.chat_rooms         FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY cm_service_all       ON public.chat_messages      FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY mrs_service_all      ON public.message_read_status FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY mr_service_all       ON public.message_reactions  FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY n_service_all        ON public.notifications      FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY pp_service_all       ON public.profile_preferences FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY up_service_all       ON public.user_preferences    FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY fb_service_all       ON public.feedback            FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Done.


