-- =====================================================
-- BeyondRounds Database Schema - CORRECTED VERSION
-- =====================================================
-- This schema fixes all issues found in the provided schema
-- and ensures compatibility with the existing database structure

-- =====================================================
-- 0) EXTENSIONS (PostgreSQL/Supabase Compatible)
-- =====================================================
-- Enable required extensions for functionality
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Text similarity search
CREATE EXTENSION IF NOT EXISTS "btree_gin";  -- GIN index support

-- =====================================================
-- 1) ENUMS (Type Safety & Data Integrity)
-- =====================================================
-- User roles and permissions
DO $$ BEGIN
  CREATE TYPE role_type AS ENUM ('user','moderator','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Gender options
DO $$ BEGIN
  CREATE TYPE gender_type AS ENUM ('male','female','non-binary','prefer-not-to-say');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Gender matching preferences
DO $$ BEGIN
  CREATE TYPE gender_pref_type AS ENUM ('no-preference','mixed','same-gender-only','same-gender-preferred');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Medical specialty matching preferences
DO $$ BEGIN
  CREATE TYPE specialty_pref_type AS ENUM ('no-preference','same','different');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Meeting frequency preferences
DO $$ BEGIN
  CREATE TYPE meeting_frequency AS ENUM ('weekly','bi-weekly','monthly','flexible');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Activity level preferences
DO $$ BEGIN
  CREATE TYPE activity_level AS ENUM ('very-active','active','moderately-active','occasionally-active','prefer-non-physical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Social energy preferences
DO $$ BEGIN
  CREATE TYPE social_energy_level AS ENUM ('high-energy-big-groups','moderate-energy-small-groups','low-key-intimate','varies-by-mood');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Conversation style preferences
DO $$ BEGIN
  CREATE TYPE conversation_style AS ENUM ('deep-meaningful','light-fun-casual','hobby-focused','professional-career','mix-everything');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Life stage categories
DO $$ BEGIN
  CREATE TYPE life_stage AS ENUM ('single-no-kids','relationship-no-kids','married-no-kids','young-children','older-children','empty-nester','prefer-not-say');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ideal weekend activity preferences
DO $$ BEGIN
  CREATE TYPE ideal_weekend AS ENUM ('adventure-exploration','relaxation-self-care','social-activities','cultural-activities','sports-fitness','home-projects-hobbies','mix-active-relaxing');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Currency types for payments
DO $$ BEGIN
  CREATE TYPE currency_type AS ENUM ('GBP','USD','EUR');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Billing interval options
DO $$ BEGIN
  CREATE TYPE billing_interval_type AS ENUM ('month','year');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Payment types
DO $$ BEGIN
  CREATE TYPE pay_type AS ENUM ('trial','subscription','one-time');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Subscription status
DO $$ BEGIN
  CREATE TYPE sub_status_type AS ENUM ('active','inactive','cancelled','past_due','trialing');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Verification status
DO $$ BEGIN
  CREATE TYPE verify_status_type AS ENUM ('pending','approved','rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =====================================================
-- 2) CORE TABLES
-- =====================================================

-- Audit log table for tracking changes
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL CHECK (operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])),
  record_id uuid,
  profile_id uuid,
  old_values jsonb,
  new_values jsonb,
  changed_fields text[] NOT NULL DEFAULT '{}'::text[], -- Fixed array syntax
  ip_address inet,
  user_agent text,
  session_id text,
  request_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT audit_log_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Chat rooms table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  is_archived boolean NOT NULL DEFAULT false,
  message_count integer NOT NULL DEFAULT 0,
  last_message_at timestamp with time zone NOT NULL DEFAULT now(),
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT chat_rooms_pkey PRIMARY KEY (id),
  CONSTRAINT chat_rooms_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id)
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_room_id uuid NOT NULL,
  match_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  reply_to_id uuid,
  content text NOT NULL,
  is_edited boolean NOT NULL DEFAULT false,
  edit_count integer NOT NULL DEFAULT 0,
  edited_at timestamp with time zone,
  deleted_at timestamp with time zone,
  is_flagged boolean NOT NULL DEFAULT false,
  flag_reason text,
  moderated_at timestamp with time zone,
  moderated_by uuid,
  search_vector tsvector,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_chat_room_id_fkey FOREIGN KEY (chat_room_id) REFERENCES public.chat_rooms(id),
  CONSTRAINT chat_messages_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT chat_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id),
  CONSTRAINT chat_messages_reply_to_id_fkey FOREIGN KEY (reply_to_id) REFERENCES public.chat_messages(id),
  CONSTRAINT chat_messages_moderated_by_fkey FOREIGN KEY (moderated_by) REFERENCES public.profiles(id)
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
  algorithm_version text NOT NULL DEFAULT 'v2.0'::text,
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
  profile1_id uuid NOT NULL,
  profile2_id uuid NOT NULL,
  CONSTRAINT match_history_pkey PRIMARY KEY (id),
  CONSTRAINT match_history_profile1_id_fkey FOREIGN KEY (profile1_id) REFERENCES public.profiles(id),
  CONSTRAINT match_history_profile2_id_fkey FOREIGN KEY (profile2_id) REFERENCES public.profiles(id)
);

-- Matches table
CREATE TABLE IF NOT EXISTS public.matches (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  batch_id uuid,
  group_name text,
  match_week date NOT NULL,
  group_size integer NOT NULL DEFAULT 3 CHECK (group_size >= 2 AND group_size <= 6),
  average_compatibility numeric CHECK (average_compatibility >= 0::numeric AND average_compatibility <= 100::numeric),
  algorithm_version text NOT NULL DEFAULT 'v2.0'::text,
  matching_criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  success_metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_activity_at timestamp with time zone NOT NULL DEFAULT now(),
  completion_date timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.match_batches(id)
);

-- Match members
CREATE TABLE IF NOT EXISTS public.match_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  compatibility_score numeric CHECK (compatibility_score >= 0::numeric AND compatibility_score <= 100::numeric),
  compatibility_factors jsonb NOT NULL DEFAULT '{}'::jsonb,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  left_at timestamp with time zone,
  is_active boolean NOT NULL DEFAULT true,
  leave_reason text,
  deleted_at timestamp with time zone,
  CONSTRAINT match_members_pkey PRIMARY KEY (id),
  CONSTRAINT match_members_match_id_fkey FOREIGN KEY (match_id) REFERENCES public.matches(id),
  CONSTRAINT match_members_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Message reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  profile_id uuid NOT NULL,
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
  profile_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT message_read_status_pkey PRIMARY KEY (id),
  CONSTRAINT message_read_status_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_messages(id),
  CONSTRAINT message_read_status_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_read boolean NOT NULL DEFAULT false,
  read_at timestamp with time zone,
  is_sent boolean NOT NULL DEFAULT false,
  sent_at timestamp with time zone,
  delivery_attempts integer NOT NULL DEFAULT 0,
  scheduled_for timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- Payment plans
CREATE TABLE IF NOT EXISTS public.payment_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency currency_type NOT NULL DEFAULT 'GBP'::currency_type,
  billing_interval billing_interval_type NOT NULL DEFAULT 'month'::billing_interval_type,
  stripe_price_id text UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  trial_days integer NOT NULL DEFAULT 0 CHECK (trial_days >= 0),
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
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
  currency currency_type NOT NULL DEFAULT 'GBP'::currency_type,
  payment_type pay_type NOT NULL DEFAULT 'subscription'::pay_type,
  payment_method_type text,
  refund_amount_cents integer NOT NULL DEFAULT 0 CHECK (refund_amount_cents >= 0),
  refund_reason text,
  failure_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_payment_plan_id_fkey FOREIGN KEY (payment_plan_id) REFERENCES public.payment_plans(id),
  CONSTRAINT payments_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
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
  profile_id uuid NOT NULL UNIQUE,
  gender_preference gender_pref_type NOT NULL DEFAULT 'no-preference'::gender_pref_type,
  specialty_preference specialty_pref_type NOT NULL DEFAULT 'no-preference'::specialty_pref_type,
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

-- Profiles table (main user table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  first_name text NOT NULL,
  last_name text NOT NULL,
  age integer CHECK (age >= 18 AND age <= 100),
  gender gender_type,
  nationality text,
  city text NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC'::text,
  role role_type NOT NULL DEFAULT 'user'::role_type,
  is_verified boolean NOT NULL DEFAULT false,
  is_banned boolean NOT NULL DEFAULT false,
  ban_reason text,
  banned_until timestamp with time zone,
  medical_specialty text NOT NULL,
  bio text CHECK (char_length(bio) <= 1000),
  looking_for text,
  profile_completion integer NOT NULL DEFAULT 0 CHECK (profile_completion >= 0 AND profile_completion <= 100),
  onboarding_completed boolean NOT NULL DEFAULT false,
  search_vector tsvector,
  last_active_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

-- User preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE,
  email_notifications boolean NOT NULL DEFAULT true,
  push_notifications boolean NOT NULL DEFAULT true,
  weekly_match_reminders boolean NOT NULL DEFAULT true,
  marketing_emails boolean NOT NULL DEFAULT false,
  privacy_level text NOT NULL DEFAULT 'standard'::text CHECK (privacy_level = ANY (ARRAY['minimal'::text, 'standard'::text, 'detailed'::text])),
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
  status sub_status_type NOT NULL DEFAULT 'inactive'::sub_status_type,
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
  status verify_status_type NOT NULL DEFAULT 'pending'::verify_status_type,
  admin_notes text,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  deleted_at timestamp with time zone,
  CONSTRAINT verification_documents_pkey PRIMARY KEY (id),
  CONSTRAINT verification_documents_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT verification_documents_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id)
);

-- =====================================================
-- 3) INDEXES FOR PERFORMANCE
-- =====================================================

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON public.audit_log (table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_profile_id ON public.audit_log (profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log (created_at DESC);

-- Chat room indexes
CREATE INDEX IF NOT EXISTS idx_chat_rooms_match_id ON public.chat_rooms (match_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON public.chat_rooms (is_active);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message ON public.chat_rooms (last_message_at DESC);

-- Chat message indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages (chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON public.chat_messages (sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_search ON public.chat_messages USING GIN (search_vector);

-- Feedback indexes
CREATE INDEX IF NOT EXISTS idx_feedback_match_id ON public.feedback (match_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewer_id ON public.feedback (reviewer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewee_id ON public.feedback (reviewee_id);

-- Match indexes
CREATE INDEX IF NOT EXISTS idx_matches_batch_id ON public.matches (batch_id);
CREATE INDEX IF NOT EXISTS idx_matches_week ON public.matches (match_week);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON public.matches (created_at DESC);

-- Match member indexes
CREATE INDEX IF NOT EXISTS idx_match_members_match_id ON public.match_members (match_id);
CREATE INDEX IF NOT EXISTS idx_match_members_profile_id ON public.match_members (profile_id);
CREATE INDEX IF NOT EXISTS idx_match_members_active ON public.match_members (is_active);

-- Message reaction indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON public.message_reactions (message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_profile_id ON public.message_reactions (profile_id);

-- Message read status indexes
CREATE INDEX IF NOT EXISTS idx_message_read_status_message_id ON public.message_read_status (message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_profile_id ON public.message_read_status (profile_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_profile_id ON public.notifications (profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications (created_at DESC);

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payments_profile_id ON public.payments (profile_id);
CREATE INDEX IF NOT EXISTS idx_payments_plan_id ON public.payments (payment_plan_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON public.payments (stripe_payment_intent_id);

-- Profile specialty indexes
CREATE INDEX IF NOT EXISTS idx_profile_specialties_profile_id ON public.profile_specialties (profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_specialties_primary ON public.profile_specialties (is_primary);

-- Profile interest indexes
CREATE INDEX IF NOT EXISTS idx_profile_interests_profile_id ON public.profile_interests (profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_interests_kind ON public.profile_interests (kind);

-- Profile preference indexes
CREATE INDEX IF NOT EXISTS idx_profile_preferences_profile_id ON public.profile_preferences (profile_id);

-- User subscription indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_profile_id ON public.user_subscriptions (profile_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions (status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON public.user_subscriptions (stripe_customer_id);

-- Verification document indexes
CREATE INDEX IF NOT EXISTS idx_verification_documents_profile_id ON public.verification_documents (profile_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON public.verification_documents (status);

-- =====================================================
-- 4) COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.audit_log IS 'Tracks all changes to database records for audit purposes';
COMMENT ON TABLE public.chat_rooms IS 'Chat rooms associated with matches for group communication';
COMMENT ON TABLE public.chat_messages IS 'Individual messages within chat rooms';
COMMENT ON TABLE public.feedback IS 'User feedback after meetings/matches';
COMMENT ON TABLE public.matches IS 'Weekly matching groups created by the algorithm';
COMMENT ON TABLE public.match_members IS 'Users assigned to specific matches';
COMMENT ON TABLE public.profiles IS 'Main user profile information linked to auth.users';
COMMENT ON TABLE public.payments IS 'Payment transactions and subscription management';
COMMENT ON TABLE public.notifications IS 'User notifications and alerts';
