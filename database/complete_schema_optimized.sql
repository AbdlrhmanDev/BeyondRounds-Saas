-- =====================================================
-- BeyondRounds Database Schema - Complete & Optimized
-- =====================================================
-- This schema defines the complete database structure for BeyondRounds
-- medical professional matching platform with proper relationships,
-- security policies, and performance optimizations.

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
  CREATE TYPE meeting_freq_type AS ENUM ('weekly','bi-weekly','monthly','as-schedules-allow');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Activity level preferences
DO $$ BEGIN
  CREATE TYPE activity_level_type AS ENUM ('very-active','active','moderately-active','occasionally-active','prefer-non-physical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Social energy preferences
DO $$ BEGIN
  CREATE TYPE social_energy_type AS ENUM ('high-energy-big-groups','moderate-energy-small-groups','low-key-intimate','varies-by-mood');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Conversation style preferences
DO $$ BEGIN
  CREATE TYPE conversation_style_type AS ENUM ('deep-meaningful','light-fun-casual','hobby-focused','professional-career','mix-everything');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Life stage categories
DO $$ BEGIN
  CREATE TYPE life_stage_type AS ENUM ('single-no-kids','relationship-no-kids','married-no-kids','young-children','older-children','empty-nester','prefer-not-say');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ideal weekend activity preferences
DO $$ BEGIN
  CREATE TYPE ideal_weekend_type AS ENUM ('adventure-exploration','relaxation-self-care','social-activities','cultural-activities','sports-fitness','home-projects-hobbies','mix-active-relaxing');
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
-- 2) CORE: Profiles Table (Single Source of Truth)
-- =====================================================
-- Main profiles table containing essential user information
-- Links to auth.users for authentication
CREATE TABLE IF NOT EXISTS public.profiles (
  -- Primary identification
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic information
  email                text UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  first_name           text NOT NULL,
  last_name            text NOT NULL,
  age                  int CHECK (age BETWEEN 18 AND 100),
  gender               gender_type,
  nationality          text,
  
  -- Location and timezone
  city                 text NOT NULL,
  timezone             text NOT NULL DEFAULT 'UTC',
  
  -- System fields
  role                 role_type NOT NULL DEFAULT 'user',
  is_verified          boolean NOT NULL DEFAULT false,
  is_banned            boolean NOT NULL DEFAULT false,
  ban_reason           text,
  banned_until         timestamptz,
  
  -- Professional information
  medical_specialty    text NOT NULL,  -- Primary specialty field
  
  -- Profile content
  bio                  text,
  looking_for          text,
  
  -- Profile management
  profile_completion   int NOT NULL DEFAULT 0 CHECK (profile_completion BETWEEN 0 AND 100),
  onboarding_completed boolean NOT NULL DEFAULT false,
  
  -- Search optimization
  search_vector        tsvector,
  
  -- Activity tracking
  last_active_at       timestamptz NOT NULL DEFAULT now(),
  
  -- Audit fields
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz
);

-- Performance indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_search_gin ON public.profiles USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles (city);
CREATE INDEX IF NOT EXISTS idx_profiles_specialty_trgm ON public.profiles USING GIN (medical_specialty gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_verified ON public.profiles (is_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles (last_active_at DESC);

-- =====================================================
-- 3) Profile Satellite Tables (Normalized Structure)
-- =====================================================

-- Additional medical specialties (normalized, no arrays)
CREATE TABLE IF NOT EXISTS public.profile_specialties (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialty       text NOT NULL,
  is_primary      boolean NOT NULL DEFAULT false,
  years_experience int CHECK (years_experience >= 0),
  created_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_profile_specialties_profile ON public.profile_specialties(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_specialties_name_trgm ON public.profile_specialties USING GIN (specialty gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_profile_specialties_primary ON public.profile_specialties(is_primary);

-- User interests (flexible categorization)
CREATE TABLE IF NOT EXISTS public.profile_interests (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind        text NOT NULL,   -- music | movies | sport | hobby | other
  value       text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_profile_interests_profile ON public.profile_interests(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_interests_kind ON public.profile_interests(kind);

-- Matching preferences (structured preferences)
CREATE TABLE IF NOT EXISTS public.profile_preferences (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id             uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  gender_preference      gender_pref_type NOT NULL DEFAULT 'no-preference',
  specialty_preference   specialty_pref_type NOT NULL DEFAULT 'no-preference',
  meeting_frequency      meeting_freq_type,
  preferred_times        text, -- Free text (can be normalized to slots table later)
  dietary_preferences    text,
  activity_level         activity_level_type,
  social_energy_level    social_energy_type,
  conversation_style     conversation_style_type,
  life_stage             life_stage_type,
  ideal_weekend          ideal_weekend_type,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now(),
  deleted_at             timestamptz
);

CREATE INDEX IF NOT EXISTS idx_profile_preferences_profile ON public.profile_preferences(profile_id);

-- Preferred meeting activities (instead of arrays)
CREATE TABLE IF NOT EXISTS public.profile_meeting_activities (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity    text NOT NULL,        -- e.g., coffee, hiking, museum
  priority    smallint CHECK (priority BETWEEN 1 AND 5),
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_profile_meeting_activities_profile ON public.profile_meeting_activities(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_meeting_activities_priority ON public.profile_meeting_activities(priority);

-- Weekly availability slots
CREATE TABLE IF NOT EXISTS public.profile_availability_slots (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time  time NOT NULL,
  end_time    time NOT NULL,
  timezone    text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_profile_availability_profile ON public.profile_availability_slots(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_availability_day ON public.profile_availability_slots(day_of_week);

-- User notification preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id               uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications      boolean NOT NULL DEFAULT true,
  push_notifications       boolean NOT NULL DEFAULT true,
  weekly_match_reminders   boolean NOT NULL DEFAULT true,
  marketing_emails         boolean NOT NULL DEFAULT false,
  privacy_level            text NOT NULL DEFAULT 'standard' CHECK (privacy_level IN ('minimal','standard','detailed')),
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  deleted_at               timestamptz
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_profile ON public.user_preferences(profile_id);

-- =====================================================
-- 4) Matching Domain (Batches, Matches, Members, Chat)
-- =====================================================

-- Match batches for weekly matching runs
CREATE TABLE IF NOT EXISTS public.match_batches (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_date               date NOT NULL UNIQUE,
  total_eligible_users     int NOT NULL DEFAULT 0,
  total_groups_created     int NOT NULL DEFAULT 0,
  total_users_matched      int NOT NULL DEFAULT 0,
  algorithm_version        text NOT NULL DEFAULT 'v2.0',
  processing_started_at    timestamptz,
  processing_completed_at  timestamptz,
  created_at               timestamptz NOT NULL DEFAULT now(),
  deleted_at               timestamptz
);

CREATE INDEX IF NOT EXISTS idx_match_batches_date ON public.match_batches(batch_date);
CREATE INDEX IF NOT EXISTS idx_match_batches_processing ON public.match_batches(processing_started_at);

-- Individual matches/groups
CREATE TABLE IF NOT EXISTS public.matches (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id                   uuid REFERENCES public.match_batches(id) ON DELETE SET NULL,
  group_name                 text,
  match_week                 date NOT NULL,
  group_size                 int NOT NULL DEFAULT 3 CHECK (group_size BETWEEN 2 AND 6),
  average_compatibility      numeric CHECK (average_compatibility >= 0 AND average_compatibility <= 100),
  algorithm_version          text NOT NULL DEFAULT 'v2.0',
  matching_criteria          jsonb NOT NULL DEFAULT '{}'::jsonb,
  success_metrics            jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_activity_at           timestamptz NOT NULL DEFAULT now(),
  completion_date            timestamptz,
  created_at                 timestamptz NOT NULL DEFAULT now(),
  updated_at                 timestamptz NOT NULL DEFAULT now(),
  deleted_at                 timestamptz
);

CREATE INDEX IF NOT EXISTS idx_matches_week ON public.matches(match_week);
CREATE INDEX IF NOT EXISTS idx_matches_batch ON public.matches(batch_id);
CREATE INDEX IF NOT EXISTS idx_matches_activity ON public.matches(last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_compatibility ON public.matches(average_compatibility DESC);

-- Match members (users in each match)
CREATE TABLE IF NOT EXISTS public.match_members (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id                uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  profile_id              uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  compatibility_score     numeric CHECK (compatibility_score BETWEEN 0 AND 100),
  compatibility_factors   jsonb NOT NULL DEFAULT '{}'::jsonb,
  joined_at               timestamptz NOT NULL DEFAULT now(),
  left_at                 timestamptz,
  is_active               boolean NOT NULL DEFAULT true,
  leave_reason            text,
  deleted_at              timestamptz,
  UNIQUE (match_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_match_members_match ON public.match_members(match_id);
CREATE INDEX IF NOT EXISTS idx_match_members_profile ON public.match_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_match_members_active ON public.match_members(is_active);
CREATE INDEX IF NOT EXISTS idx_match_members_compatibility ON public.match_members(compatibility_score DESC);

-- Chat rooms (one per match typically)
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id        uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  name            text NOT NULL,
  description     text,
  is_active       boolean NOT NULL DEFAULT true,
  is_archived     boolean NOT NULL DEFAULT false,
  message_count   int NOT NULL DEFAULT 0,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  settings        jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_chat_room_per_match ON public.chat_rooms(match_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON public.chat_rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message ON public.chat_rooms(last_message_at DESC);

-- Chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id   uuid NOT NULL REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  match_id       uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id      uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reply_to_id    uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,
  content        text NOT NULL,
  is_edited      boolean NOT NULL DEFAULT false,
  edit_count     int NOT NULL DEFAULT 0,
  edited_at      timestamptz,
  deleted_at     timestamptz,
  is_flagged     boolean NOT NULL DEFAULT false,
  flag_reason    text,
  moderated_at   timestamptz,
  moderated_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  search_vector  tsvector,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_time ON public.chat_messages(chat_room_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_match_time ON public.chat_messages(match_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON public.chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_search ON public.chat_messages USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_chat_messages_flagged ON public.chat_messages(is_flagged);

-- Message reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji       text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz,
  UNIQUE (message_id, profile_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_message_reactions_message ON public.message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_profile ON public.message_reactions(profile_id);

-- Message read status
CREATE TABLE IF NOT EXISTS public.message_read_status (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id  uuid NOT NULL REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  profile_id  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  read_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (message_id, profile_id)
);

CREATE INDEX IF NOT EXISTS idx_message_read_status_message ON public.message_read_status(message_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_profile ON public.message_read_status(profile_id);

-- Match history (pairwise snapshots for analytics)
CREATE TABLE IF NOT EXISTS public.match_history (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  matched_at    timestamptz NOT NULL DEFAULT now(),
  week_start    date,
  profile1_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile2_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_match_history_profiles ON public.match_history(profile1_id, profile2_id);
CREATE INDEX IF NOT EXISTS idx_match_history_week ON public.match_history(week_start);
CREATE INDEX IF NOT EXISTS idx_match_history_matched_at ON public.match_history(matched_at DESC);

-- =====================================================
-- 5) Feedback System (Normalized Structure)
-- =====================================================

-- Main feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id               uuid NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  reviewer_id            uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id            uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  did_meet               boolean NOT NULL,
  would_meet_again       boolean,
  overall_rating         int CHECK (overall_rating BETWEEN 1 AND 5),
  communication_rating   int CHECK (communication_rating BETWEEN 1 AND 5),
  punctuality_rating     int CHECK (punctuality_rating BETWEEN 1 AND 5),
  engagement_rating      int CHECK (engagement_rating BETWEEN 1 AND 5),
  feedback_text          text,
  safety_concern         boolean NOT NULL DEFAULT false,
  safety_details         text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  deleted_at             timestamptz
);

CREATE INDEX IF NOT EXISTS idx_feedback_match ON public.feedback(match_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewer ON public.feedback(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewee ON public.feedback(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON public.feedback(overall_rating DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_safety ON public.feedback(safety_concern);

-- Positive aspects (normalized)
CREATE TABLE IF NOT EXISTS public.feedback_positive_aspects (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id  uuid NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  aspect       text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_positive_feedback ON public.feedback_positive_aspects(feedback_id);

-- Improvement areas (normalized)
CREATE TABLE IF NOT EXISTS public.feedback_improvement_areas (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id  uuid NOT NULL REFERENCES public.feedback(id) ON DELETE CASCADE,
  area         text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feedback_improvement_feedback ON public.feedback_improvement_areas(feedback_id);

-- =====================================================
-- 6) Payments & Subscriptions System
-- =====================================================

-- Payment plans configuration
CREATE TABLE IF NOT EXISTS public.payment_plans (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  description       text,
  price_cents       int NOT NULL CHECK (price_cents >= 0),
  currency          currency_type NOT NULL DEFAULT 'GBP',
  billing_interval  billing_interval_type NOT NULL DEFAULT 'month',
  stripe_price_id   text UNIQUE,
  is_active         boolean NOT NULL DEFAULT true,
  trial_days        int NOT NULL DEFAULT 0 CHECK (trial_days >= 0),
  features          jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

CREATE INDEX IF NOT EXISTS idx_payment_plans_active ON public.payment_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_payment_plans_stripe ON public.payment_plans(stripe_price_id);

-- User subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id              uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_plan_id         uuid REFERENCES public.payment_plans(id) ON DELETE SET NULL,
  stripe_customer_id      text UNIQUE,
  stripe_subscription_id  text UNIQUE,
  status                  sub_status_type NOT NULL DEFAULT 'inactive',
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  trial_end               timestamptz,
  cancelled_at            timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  deleted_at              timestamptz
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_profile ON public.user_subscriptions(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON public.user_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription ON public.user_subscriptions(stripe_subscription_id);

-- Payment transactions
CREATE TABLE IF NOT EXISTS public.payments (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id                  uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_plan_id             uuid REFERENCES public.payment_plans(id) ON DELETE SET NULL,
  stripe_payment_intent_id    text UNIQUE,
  stripe_subscription_id      text,
  amount_cents                int CHECK (amount_cents >= 0),
  currency                    currency_type NOT NULL DEFAULT 'GBP',
  payment_type                pay_type NOT NULL DEFAULT 'subscription',
  payment_method_type         text,
  refund_amount_cents         int NOT NULL DEFAULT 0 CHECK (refund_amount_cents >= 0),
  refund_reason               text,
  failure_reason              text,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  deleted_at                  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_payments_profile_time ON public.payments(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON public.payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_type ON public.payments(payment_type);

-- =====================================================
-- 7) Notifications & Verification System
-- =====================================================

-- User notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         text NOT NULL,
  message       text NOT NULL,
  data          jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_read       boolean NOT NULL DEFAULT false,
  read_at       timestamptz,
  is_sent       boolean NOT NULL DEFAULT false,
  sent_at       timestamptz,
  delivery_attempts int NOT NULL DEFAULT 0,
  scheduled_for timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_notifications_profile ON public.notifications(profile_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(profile_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON public.notifications(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_notifications_expires ON public.notifications(expires_at);

-- Verification documents
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  id_document_url text,
  selfie_url    text,
  license_url   text,
  status        verify_status_type NOT NULL DEFAULT 'pending',
  admin_notes   text,
  submitted_at  timestamptz NOT NULL DEFAULT now(),
  reviewed_at   timestamptz,
  reviewed_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_verification_documents_profile ON public.verification_documents(profile_id);
CREATE INDEX IF NOT EXISTS idx_verification_documents_status ON public.verification_documents(status);
CREATE INDEX IF NOT EXISTS idx_verification_documents_submitted ON public.verification_documents(submitted_at DESC);

-- =====================================================
-- 8) Audit Log System (Generic Tracking)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name      text NOT NULL,
  operation       text NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')),
  record_id       uuid,
  profile_id      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  old_values      jsonb,
  new_values      jsonb,
  changed_fields  text[] NOT NULL DEFAULT '{}',
  ip_address      inet,
  user_agent      text,
  session_id      text,
  request_id      text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_audit_table_time ON public.audit_log(table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_profile ON public.audit_log(profile_id);
CREATE INDEX IF NOT EXISTS idx_audit_operation ON public.audit_log(operation);
CREATE INDEX IF NOT EXISTS idx_audit_record_id ON public.audit_log(record_id);

-- =====================================================
-- 9) Security Helper Functions for RLS
-- =====================================================

-- Check if current user is a member of a specific match
CREATE OR REPLACE FUNCTION public.is_member_of_match(p_match_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.match_members mm
    JOIN public.profiles p ON p.id = mm.profile_id
    WHERE mm.match_id = p_match_id
      AND p.user_id = auth.uid()
      AND mm.is_active = true
      AND mm.deleted_at IS NULL
  );
$$;

-- Get current user's profile ID
CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() AND deleted_at IS NULL;
$$;

-- Check if current user has admin role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND role = 'admin' 
      AND deleted_at IS NULL
  );
$$;

-- Check if current user has moderator or admin role
CREATE OR REPLACE FUNCTION public.is_moderator_or_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
      AND role IN ('moderator', 'admin') 
      AND deleted_at IS NULL
  );
$$;

-- =====================================================
-- 10) Row Level Security (RLS) Setup
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_meeting_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.match_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_members ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_status ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_positive_aspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_improvement_areas ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.payment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 11) RLS Policies Implementation
-- =====================================================

-- ---------- Profiles Policies ----------
-- Public read access for profile information (needed for matching)
CREATE POLICY profiles_select_public
ON public.profiles
FOR SELECT
USING (deleted_at IS NULL);

-- Users can only modify their own profile
CREATE POLICY profiles_owner_modify
ON public.profiles
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY profiles_owner_delete
ON public.profiles
FOR DELETE 
USING (user_id = auth.uid());

-- Users can insert their own profile (usually once during onboarding)
CREATE POLICY profiles_insert_self
ON public.profiles
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- ---------- Profile Satellite Tables Policies ----------
-- Users can only access their own satellite data
CREATE POLICY profile_specialties_select_own
ON public.profile_specialties
FOR SELECT
USING (profile_id = public.current_profile_id());

CREATE POLICY profile_specialties_all_own
ON public.profile_specialties
FOR ALL
USING (profile_id = public.current_profile_id())
WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY profile_interests_select_own
ON public.profile_interests
FOR SELECT
USING (profile_id = public.current_profile_id());

CREATE POLICY profile_interests_all_own
ON public.profile_interests
FOR ALL
USING (profile_id = public.current_profile_id())
WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY profile_preferences_select_own
ON public.profile_preferences
FOR SELECT
USING (profile_id = public.current_profile_id());

CREATE POLICY profile_preferences_all_own
ON public.profile_preferences
FOR ALL
USING (profile_id = public.current_profile_id())
WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY profile_meeting_activities_select_own
ON public.profile_meeting_activities
FOR SELECT
USING (profile_id = public.current_profile_id());

CREATE POLICY profile_meeting_activities_all_own
ON public.profile_meeting_activities
FOR ALL
USING (profile_id = public.current_profile_id())
WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY profile_availability_slots_select_own
ON public.profile_availability_slots
FOR SELECT
USING (profile_id = public.current_profile_id());

CREATE POLICY profile_availability_slots_all_own
ON public.profile_availability_slots
FOR ALL
USING (profile_id = public.current_profile_id())
WITH CHECK (profile_id = public.current_profile_id());

CREATE POLICY user_preferences_select_own
ON public.user_preferences
FOR SELECT
USING (profile_id = public.current_profile_id());

CREATE POLICY user_preferences_all_own
ON public.user_preferences
FOR ALL
USING (profile_id = public.current_profile_id())
WITH CHECK (profile_id = public.current_profile_id());

-- ---------- Match System Policies ----------
-- Users can only see matches they are members of
CREATE POLICY matches_select_member
ON public.matches
FOR SELECT
USING (public.is_member_of_match(id));

-- Prevent manual match creation/modification (use service role)
REVOKE ALL ON public.matches FROM PUBLIC;

-- Match members policies
CREATE POLICY match_members_select_member
ON public.match_members
FOR SELECT
USING (public.is_member_of_match(match_id));

-- Prevent manual member management (use service role)
REVOKE ALL ON public.match_members FROM PUBLIC;

-- ---------- Chat System Policies ----------
-- Users can only see chat rooms for matches they're in
CREATE POLICY chat_rooms_select_member
ON public.chat_rooms
FOR SELECT
USING (public.is_member_of_match(match_id));

-- Prevent manual chat room creation (use service role)
REVOKE ALL ON public.chat_rooms FROM PUBLIC;

-- Chat messages policies
CREATE POLICY chat_messages_select_member
ON public.chat_messages
FOR SELECT
USING (public.is_member_of_match(match_id));

-- Users can only send messages to matches they're members of
CREATE POLICY chat_messages_insert_member
ON public.chat_messages
FOR INSERT
WITH CHECK (
  public.is_member_of_match(match_id) 
  AND sender_id = public.current_profile_id()
);

-- Users can only edit/delete their own messages
CREATE POLICY chat_messages_update_owner
ON public.chat_messages
FOR UPDATE
USING (sender_id = public.current_profile_id())
WITH CHECK (sender_id = public.current_profile_id());

CREATE POLICY chat_messages_delete_owner
ON public.chat_messages
FOR DELETE
USING (sender_id = public.current_profile_id());

-- Message reactions policies
CREATE POLICY message_reactions_select_member
ON public.message_reactions
FOR SELECT
USING (public.is_member_of_match(
  (SELECT match_id FROM public.chat_messages WHERE id = message_id)
));

CREATE POLICY message_reactions_all_member
ON public.message_reactions
FOR ALL
USING (public.is_member_of_match(
  (SELECT match_id FROM public.chat_messages WHERE id = message_id)
))
WITH CHECK (
  public.is_member_of_match(
    (SELECT match_id FROM public.chat_messages WHERE id = message_id)
  )
  AND profile_id = public.current_profile_id()
);

-- Message read status policies
CREATE POLICY message_read_status_select_member
ON public.message_read_status
FOR SELECT
USING (public.is_member_of_match(
  (SELECT match_id FROM public.chat_messages WHERE id = message_id)
));

CREATE POLICY message_read_status_all_member
ON public.message_read_status
FOR ALL
USING (public.is_member_of_match(
  (SELECT match_id FROM public.chat_messages WHERE id = message_id)
))
WITH CHECK (
  public.is_member_of_match(
    (SELECT match_id FROM public.chat_messages WHERE id = message_id)
  )
  AND profile_id = public.current_profile_id()
);

-- ---------- Feedback System Policies ----------
-- Users can see feedback for matches they're members of
CREATE POLICY feedback_select_member
ON public.feedback
FOR SELECT
USING (public.is_member_of_match(match_id));

-- Users can only submit feedback for matches they're members of
CREATE POLICY feedback_insert_member
ON public.feedback
FOR INSERT
WITH CHECK (
  public.is_member_of_match(match_id)
  AND reviewer_id = public.current_profile_id()
);

-- Users can only modify their own feedback
CREATE POLICY feedback_update_owner
ON public.feedback
FOR UPDATE
USING (reviewer_id = public.current_profile_id())
WITH CHECK (reviewer_id = public.current_profile_id());

CREATE POLICY feedback_delete_owner
ON public.feedback
FOR DELETE
USING (reviewer_id = public.current_profile_id());

-- Feedback aspects policies
CREATE POLICY feedback_positive_aspects_select_member
ON public.feedback_positive_aspects
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.feedback f 
    WHERE f.id = feedback_id 
    AND public.is_member_of_match(f.match_id)
  )
);

CREATE POLICY feedback_positive_aspects_all_owner
ON public.feedback_positive_aspects
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.feedback f 
    WHERE f.id = feedback_id 
    AND f.reviewer_id = public.current_profile_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.feedback f 
    WHERE f.id = feedback_id 
    AND f.reviewer_id = public.current_profile_id()
  )
);

CREATE POLICY feedback_improvement_areas_select_member
ON public.feedback_improvement_areas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.feedback f 
    WHERE f.id = feedback_id 
    AND public.is_member_of_match(f.match_id)
  )
);

CREATE POLICY feedback_improvement_areas_all_owner
ON public.feedback_improvement_areas
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.feedback f 
    WHERE f.id = feedback_id 
    AND f.reviewer_id = public.current_profile_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.feedback f 
    WHERE f.id = feedback_id 
    AND f.reviewer_id = public.current_profile_id()
  )
);

-- ---------- Payment System Policies ----------
-- Users can only see their own payments
CREATE POLICY payments_select_owner
ON public.payments
FOR SELECT
USING (profile_id = public.current_profile_id());

-- Users can insert their own payments (via service role typically)
CREATE POLICY payments_insert_owner
ON public.payments
FOR INSERT
WITH CHECK (profile_id = public.current_profile_id());

-- Prevent manual payment modification (use service role)
REVOKE UPDATE, DELETE ON public.payments FROM PUBLIC;

-- Payment plans are publicly readable
CREATE POLICY payment_plans_select_all
ON public.payment_plans
FOR SELECT
USING (true);

-- Prevent manual plan modification (use service role)
REVOKE INSERT, UPDATE, DELETE ON public.payment_plans FROM PUBLIC;

-- Users can only see their own subscriptions
CREATE POLICY user_subscriptions_select_owner
ON public.user_subscriptions
FOR SELECT
USING (profile_id = public.current_profile_id());

-- Prevent manual subscription modification (use service role)
REVOKE INSERT, UPDATE, DELETE ON public.user_subscriptions FROM PUBLIC;

-- ---------- Notification System Policies ----------
-- Users can only see their own notifications
CREATE POLICY notifications_select_owner
ON public.notifications
FOR SELECT
USING (profile_id = public.current_profile_id());

CREATE POLICY notifications_all_owner
ON public.notifications
FOR ALL
USING (profile_id = public.current_profile_id())
WITH CHECK (profile_id = public.current_profile_id());

-- ---------- Verification System Policies ----------
-- Users can see their own verification documents
-- Moderators and admins can see all verification documents
CREATE POLICY verification_documents_select_scope
ON public.verification_documents
FOR SELECT
USING (
  profile_id = public.current_profile_id()
  OR public.is_moderator_or_admin()
);

-- Users can only submit their own verification documents
CREATE POLICY verification_documents_insert_owner
ON public.verification_documents
FOR INSERT
WITH CHECK (profile_id = public.current_profile_id());

-- Users can update their own documents, moderators/admins can update any
CREATE POLICY verification_documents_update_scope
ON public.verification_documents
FOR UPDATE
USING (
  profile_id = public.current_profile_id()
  OR public.is_moderator_or_admin()
)
WITH CHECK (true);

-- ---------- Audit Log Policies ----------
-- Only admins can access audit logs
REVOKE ALL ON public.audit_log FROM PUBLIC;

CREATE POLICY audit_log_select_admin
ON public.audit_log
FOR SELECT
USING (public.is_admin());

-- =====================================================
-- 12) Additional Performance Indexes
-- =====================================================

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_profiles_city_specialty ON public.profiles(city, medical_specialty);
CREATE INDEX IF NOT EXISTS idx_profiles_age_gender ON public.profiles(age, gender);
CREATE INDEX IF NOT EXISTS idx_profiles_verified_active ON public.profiles(is_verified, last_active_at DESC);

-- Match-related performance indexes
CREATE INDEX IF NOT EXISTS idx_matches_week_size ON public.matches(match_week, group_size);
CREATE INDEX IF NOT EXISTS idx_match_members_profile_active ON public.match_members(profile_id, is_active);

-- Chat performance indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON public.chat_messages(chat_room_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_match_created ON public.chat_messages(match_id, created_at DESC);

-- Feedback performance indexes
CREATE INDEX IF NOT EXISTS idx_feedback_match_reviewer ON public.feedback(match_id, reviewer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewee_rating ON public.feedback(reviewee_id, overall_rating DESC);

-- Notification performance indexes
CREATE INDEX IF NOT EXISTS idx_notifications_profile_read_scheduled ON public.notifications(profile_id, is_read, scheduled_for);

-- =====================================================
-- 13) Schema Documentation Summary
-- =====================================================
-- 
-- This schema implements a comprehensive medical professional matching platform with:
-- 
-- CORE TABLES:
-- - profiles: Main user information and professional details
-- - profile_specialties: Additional medical specialties (normalized)
-- - profile_interests: User interests categorized by type
-- - profile_preferences: Matching preferences and criteria
-- - profile_meeting_activities: Preferred meeting activities
-- - profile_availability_slots: Weekly availability schedule
-- - user_preferences: Notification and privacy settings
-- 
-- MATCHING SYSTEM:
-- - match_batches: Weekly matching runs and statistics
-- - matches: Individual match groups
-- - match_members: Users in each match with compatibility scores
-- - match_history: Historical matching data for analytics
-- 
-- COMMUNICATION:
-- - chat_rooms: Chat rooms for each match
-- - chat_messages: Individual messages with threading support
-- - message_reactions: Emoji reactions on messages
-- - message_read_status: Read receipts for messages
-- 
-- FEEDBACK SYSTEM:
-- - feedback: Main feedback records
-- - feedback_positive_aspects: Positive feedback aspects (normalized)
-- - feedback_improvement_areas: Improvement suggestions (normalized)
-- 
-- PAYMENT SYSTEM:
-- - payment_plans: Subscription plan configurations
-- - user_subscriptions: User subscription status
-- - payments: Payment transaction records
-- 
-- SYSTEM FEATURES:
-- - notifications: User notification system
-- - verification_documents: Identity verification workflow
-- - audit_log: Comprehensive audit trail
-- 
-- SECURITY:
-- - Row Level Security (RLS) enabled on all tables
-- - Comprehensive policies for data access control
-- - Helper functions for security checks
-- - Proper foreign key relationships with cascade deletes
-- 
-- PERFORMANCE:
-- - Strategic indexing for common query patterns
-- - GIN indexes for text search capabilities
-- - Composite indexes for multi-column queries
-- - Proper constraint definitions for data integrity
--
-- =====================================================
