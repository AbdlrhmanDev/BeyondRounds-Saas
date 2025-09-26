-- =========================================================
-- COMPREHENSIVE SCHEMA MIGRATION
-- =========================================================
-- This migration updates the database to match the new comprehensive schema
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enum types
CREATE TYPE IF NOT EXISTS currency_type AS ENUM ('GBP', 'USD', 'EUR');
CREATE TYPE IF NOT EXISTS billing_interval_type AS ENUM ('month', 'year');
CREATE TYPE IF NOT EXISTS pay_type AS ENUM ('subscription', 'one_time');
CREATE TYPE IF NOT EXISTS sub_status_type AS ENUM ('active', 'inactive', 'cancelled', 'past_due', 'trialing');
CREATE TYPE IF NOT EXISTS verify_status_type AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE IF NOT EXISTS gender_type AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');
CREATE TYPE IF NOT EXISTS role_type AS ENUM ('user', 'admin', 'moderator');
CREATE TYPE IF NOT EXISTS gender_pref_type AS ENUM ('male', 'female', 'no-preference');
CREATE TYPE IF NOT EXISTS specialty_pref_type AS ENUM ('same', 'different', 'no-preference');
CREATE TYPE IF NOT EXISTS meeting_frequency AS ENUM ('weekly', 'bi-weekly', 'monthly');
CREATE TYPE IF NOT EXISTS activity_level AS ENUM ('low', 'moderate', 'high');
CREATE TYPE IF NOT EXISTS social_energy_level AS ENUM ('introvert', 'ambivert', 'extrovert');
CREATE TYPE IF NOT EXISTS conversation_style AS ENUM ('deep', 'light', 'balanced');
CREATE TYPE IF NOT EXISTS life_stage AS ENUM ('student', 'early_career', 'mid_career', 'senior', 'retired');
CREATE TYPE IF NOT EXISTS ideal_weekend AS ENUM ('relaxing', 'adventurous', 'social', 'productive');

-- Create or update my_profile_id function
CREATE OR REPLACE FUNCTION public.my_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Update profiles table with new fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone_number character varying,
ADD COLUMN IF NOT EXISTS gender gender_type,
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS role role_type NOT NULL DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason text,
ADD COLUMN IF NOT EXISTS banned_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS bio text CHECK (char_length(bio) <= 1000),
ADD COLUMN IF NOT EXISTS looking_for text,
ADD COLUMN IF NOT EXISTS search_vector tsvector,
ADD COLUMN IF NOT EXISTS last_active_at timestamp with time zone NOT NULL DEFAULT now();

-- Update email constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_email_check,
ADD CONSTRAINT profiles_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Update age constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_age_check,
ADD CONSTRAINT profiles_age_check CHECK (age >= 18 AND age <= 100);

-- Update chat_messages table
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS reply_to_id uuid,
ADD COLUMN IF NOT EXISTS is_edited boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS edit_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS edited_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_flagged boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS flag_reason text,
ADD COLUMN IF NOT EXISTS moderated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS moderated_by uuid,
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Add foreign key constraints for chat_messages
ALTER TABLE public.chat_messages 
DROP CONSTRAINT IF EXISTS chat_messages_reply_to_id_fkey,
ADD CONSTRAINT chat_messages_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.chat_messages(id),
DROP CONSTRAINT IF EXISTS chat_messages_moderated_by_fkey,
ADD CONSTRAINT chat_messages_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES public.profiles(id);

-- Update chat_rooms table
ALTER TABLE public.chat_rooms 
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS message_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_message_at timestamp with time zone NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}';

-- Update match_members table
ALTER TABLE public.match_members 
ADD COLUMN IF NOT EXISTS compatibility_score numeric CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
ADD COLUMN IF NOT EXISTS compatibility_factors jsonb NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS joined_at timestamp with time zone NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS left_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS leave_reason text;

-- Update matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS batch_id uuid,
ADD COLUMN IF NOT EXISTS group_name text,
ADD COLUMN IF NOT EXISTS group_size integer NOT NULL DEFAULT 3 CHECK (group_size >= 2 AND group_size <= 6),
ADD COLUMN IF NOT EXISTS average_compatibility numeric CHECK (average_compatibility >= 0 AND average_compatibility <= 100),
ADD COLUMN IF NOT EXISTS algorithm_version text NOT NULL DEFAULT 'v2.0',
ADD COLUMN IF NOT EXISTS matching_criteria jsonb NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS success_metrics jsonb NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS completion_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone NOT NULL DEFAULT now(),
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status = ANY (ARRAY['active', 'completed', 'cancelled', 'archived']));

-- Create new tables

-- Audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL CHECK (operation = ANY (ARRAY['INSERT', 'UPDATE', 'DELETE'])),
  record_id uuid,
  profile_id uuid,
  old_values jsonb,
  new_values jsonb,
  changed_fields text[] NOT NULL DEFAULT '{}',
  ip_address inet,
  user_agent text,
  session_id text,
  request_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT audit_log_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  reviewer_id uuid NOT NULL,
  reviewee_id uuid NOT NULL,
  did_meet boolean NOT NULL,
  would_meet_again boolean,
  overall_rating integer CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating integer CHECK (communication_rating >= 1 AND communication_rating <= 5),
  punctuality_rating integer CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  engagement_rating integer CHECK (engagement_rating >= 1 AND engagement_rating <= 5),
  feedback_text text,
  safety_concern boolean NOT NULL DEFAULT false,
  safety_details text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT feedback_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT feedback_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.profiles(id),
  CONSTRAINT feedback_reviewee_id_fkey FOREIGN KEY (reviewee_id) REFERENCES public.profiles(id)
);

-- Feedback improvement areas
CREATE TABLE IF NOT EXISTS public.feedback_improvement_areas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL,
  area text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedback_improvement_areas_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_improvement_areas_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES public.feedback(id)
);

-- Feedback positive aspects
CREATE TABLE IF NOT EXISTS public.feedback_positive_aspects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL,
  aspect text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedback_positive_aspects_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_positive_aspects_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES public.feedback(id)
);

-- Match batches
CREATE TABLE IF NOT EXISTS public.match_batches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  batch_date date NOT NULL UNIQUE,
  total_eligible_users integer NOT NULL DEFAULT 0,
  total_groups_created integer NOT NULL DEFAULT 0,
  total_users_matched integer NOT NULL DEFAULT 0,
  algorithm_version text NOT NULL DEFAULT 'v2.0',
  processing_started_at timestamp with time zone,
  processing_completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT match_batches_pkey PRIMARY KEY (id)
);

-- Match history
CREATE TABLE IF NOT EXISTS public.match_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  matched_at timestamp with time zone NOT NULL DEFAULT now(),
  week_start date,
  profile1_id uuid,
  profile2_id uuid,
  CONSTRAINT match_history_pkey PRIMARY KEY (id),
  CONSTRAINT match_history_profile1_id_fkey FOREIGN KEY (profile1_id) REFERENCES public.profiles(id),
  CONSTRAINT match_history_profile2_id_fkey FOREIGN KEY (profile2_id) REFERENCES public.profiles(id)
);

-- Message reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  profile_id uuid NOT NULL DEFAULT my_profile_id(),
  emoji text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT message_reactions_pkey PRIMARY KEY (id),
  CONSTRAINT message_reactions_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_messages(id),
  CONSTRAINT message_reactions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Message read status
CREATE TABLE IF NOT EXISTS public.message_read_status (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  profile_id uuid NOT NULL DEFAULT my_profile_id(),
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT message_read_status_pkey PRIMARY KEY (id),
  CONSTRAINT message_read_status_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_messages(id),
  CONSTRAINT message_read_status_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Payment plans
CREATE TABLE IF NOT EXISTS public.payment_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency currency_type NOT NULL DEFAULT 'GBP',
  billing_interval billing_interval_type NOT NULL DEFAULT 'month',
  stripe_price_id text UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  trial_days integer NOT NULL DEFAULT 0 CHECK (trial_days >= 0),
  features jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT payment_plans_pkey PRIMARY KEY (id)
);

-- Payments
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  payment_plan_id uuid,
  stripe_payment_intent_id text UNIQUE,
  stripe_subscription_id text,
  amount_cents integer CHECK (amount_cents >= 0),
  currency currency_type NOT NULL DEFAULT 'GBP',
  payment_type pay_type NOT NULL DEFAULT 'subscription',
  payment_method_type text,
  refund_amount_cents integer NOT NULL DEFAULT 0 CHECK (refund_amount_cents >= 0),
  refund_reason text,
  failure_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT payments_payment_plan_id_fkey FOREIGN KEY (payment_plan_id) REFERENCES public.payment_plans(id)
);

-- Profile availability slots
CREATE TABLE IF NOT EXISTS public.profile_availability_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  day_of_week smallint NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  timezone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT profile_availability_slots_pkey PRIMARY KEY (id),
  CONSTRAINT profile_availability_slots_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Profile interests
CREATE TABLE IF NOT EXISTS public.profile_interests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  kind text NOT NULL,
  value text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT profile_interests_pkey PRIMARY KEY (id),
  CONSTRAINT profile_interests_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Profile meeting activities
CREATE TABLE IF NOT EXISTS public.profile_meeting_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  activity text NOT NULL,
  priority smallint CHECK (priority >= 1 AND priority <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT profile_meeting_activities_pkey PRIMARY KEY (id),
  CONSTRAINT profile_meeting_activities_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Profile preferences
CREATE TABLE IF NOT EXISTS public.profile_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  gender_preference gender_pref_type NOT NULL DEFAULT 'no-preference',
  specialty_preference specialty_pref_type NOT NULL DEFAULT 'no-preference',
  meeting_frequency meeting_frequency,
  preferred_times text,
  dietary_preferences text,
  activity_level activity_level,
  social_energy_level social_energy_level,
  conversation_style conversation_style,
  life_stage life_stage,
  ideal_weekend ideal_weekend,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT profile_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT profile_preferences_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Profile specialties
CREATE TABLE IF NOT EXISTS public.profile_specialties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  specialty text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  years_experience integer CHECK (years_experience >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT profile_specialties_pkey PRIMARY KEY (id),
  CONSTRAINT profile_specialties_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- User preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  weekly_match_reminders boolean NOT NULL DEFAULT true,
  marketing_emails boolean NOT NULL DEFAULT false,
  privacy_level text NOT NULL DEFAULT 'standard' CHECK (privacy_level = ANY (ARRAY['minimal', 'standard', 'detailed'])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT user_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT user_preferences_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  payment_plan_id uuid,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status sub_status_type NOT NULL DEFAULT 'inactive',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  trial_end timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT user_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT user_subscriptions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT user_subscriptions_payment_plan_id_fkey FOREIGN KEY (payment_plan_id) REFERENCES public.payment_plans(id)
);

-- Verification documents
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  id_document_url text,
  selfie_url text,
  license_url text,
  status verify_status_type NOT NULL DEFAULT 'pending',
  admin_notes text,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  deleted_at timestamp with time zone,
  CONSTRAINT verification_documents_pkey PRIMARY KEY (id),
  CONSTRAINT verification_documents_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT verification_documents_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id)
);

-- Add foreign key for matches.batch_id
ALTER TABLE public.matches 
DROP CONSTRAINT IF EXISTS matches_batch_id_fkey,
ADD CONSTRAINT matches_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.match_batches(id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at);
CREATE INDEX IF NOT EXISTS idx_profiles_search_vector ON public.profiles USING gin(search_vector);

CREATE INDEX IF NOT EXISTS idx_match_members_match_id ON public.match_members(match_id);
CREATE INDEX IF NOT EXISTS idx_match_members_profile_id ON public.match_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_match_members_is_active ON public.match_members(is_active);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_room_id ON public.chat_messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_is_flagged ON public.chat_messages(is_flagged);
CREATE INDEX IF NOT EXISTS idx_chat_messages_search_vector ON public.chat_messages USING gin(search_vector);

CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_matches ON public.matches;
CREATE TRIGGER set_updated_at_matches BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_chat_rooms ON public.chat_rooms;
CREATE TRIGGER set_updated_at_chat_rooms BEFORE UPDATE ON public.chat_rooms FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_profile_interests ON public.profile_interests;
CREATE TRIGGER set_updated_at_profile_interests BEFORE UPDATE ON public.profile_interests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_profile_preferences ON public.profile_preferences;
CREATE TRIGGER set_updated_at_profile_preferences BEFORE UPDATE ON public.profile_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_user_preferences ON public.user_preferences;
CREATE TRIGGER set_updated_at_user_preferences BEFORE UPDATE ON public.user_preferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_payments ON public.payments;
CREATE TRIGGER set_updated_at_payments BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_updated_at_user_subscriptions ON public.user_subscriptions;
CREATE TRIGGER set_updated_at_user_subscriptions BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_meeting_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Create safe RLS policies
-- Profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
FOR UPDATE TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Match members policies (using the fixed version)
DROP POLICY IF EXISTS "mm_select_my_matches" ON public.match_members;
CREATE POLICY "mm_select_my_matches" ON public.match_members
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.match_members mm
    WHERE mm.match_id = match_members.match_id
      AND mm.profile_id = public.my_profile_id()
  )
);

-- Chat messages policies
DROP POLICY IF EXISTS "chat_messages_select" ON public.chat_messages;
CREATE POLICY "chat_messages_select" ON public.chat_messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.match_members mm
    WHERE mm.match_id = chat_messages.match_id
      AND mm.profile_id = public.my_profile_id()
  )
);

DROP POLICY IF EXISTS "chat_messages_insert" ON public.chat_messages;
CREATE POLICY "chat_messages_insert" ON public.chat_messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = public.my_profile_id() AND
  EXISTS (
    SELECT 1
    FROM public.match_members mm
    WHERE mm.match_id = chat_messages.match_id
      AND mm.profile_id = public.my_profile_id()
  )
);

-- Notifications policies
DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications
FOR SELECT TO authenticated
USING (profile_id = public.my_profile_id());

-- Service role policies for admin operations
DROP POLICY IF EXISTS "service_all_profiles" ON public.profiles;
CREATE POLICY "service_all_profiles" ON public.profiles
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "service_all_match_members" ON public.match_members;
CREATE POLICY "service_all_match_members" ON public.match_members
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "service_all_chat_messages" ON public.chat_messages;
CREATE POLICY "service_all_chat_messages" ON public.chat_messages
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "service_all_notifications" ON public.notifications;
CREATE POLICY "service_all_notifications" ON public.notifications
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Create unique constraints to prevent duplicates
ALTER TABLE public.match_members 
DROP CONSTRAINT IF EXISTS match_members_match_profile_unique,
ADD CONSTRAINT match_members_match_profile_unique UNIQUE (match_id, profile_id);

ALTER TABLE public.message_read_status 
DROP CONSTRAINT IF EXISTS message_read_status_message_profile_unique,
ADD CONSTRAINT message_read_status_message_profile_unique UNIQUE (message_id, profile_id);

ALTER TABLE public.message_reactions 
DROP CONSTRAINT IF EXISTS message_reactions_message_profile_emoji_unique,
ADD CONSTRAINT message_reactions_message_profile_emoji_unique UNIQUE (message_id, profile_id, emoji);

ALTER TABLE public.profile_preferences 
DROP CONSTRAINT IF EXISTS profile_preferences_profile_unique,
ADD CONSTRAINT profile_preferences_profile_unique UNIQUE (profile_id);

ALTER TABLE public.user_preferences 
DROP CONSTRAINT IF EXISTS user_preferences_profile_unique,
ADD CONSTRAINT user_preferences_profile_unique UNIQUE (profile_id);

-- Success message
SELECT 'Comprehensive schema migration completed successfully!' as result;


