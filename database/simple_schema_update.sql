-- Simplified Database Schema Update Script
-- This script updates the existing database to match the provided schema

-- 1. Fix audit_log table
ALTER TABLE public.audit_log 
ALTER COLUMN changed_fields TYPE text[] USING changed_fields::text[];

-- 2. Update matches table to add missing columns
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled', 'archived')),
ADD COLUMN IF NOT EXISTS match_week date DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS batch_id uuid,
ADD COLUMN IF NOT EXISTS group_name text,
ADD COLUMN IF NOT EXISTS average_compatibility numeric CHECK (average_compatibility >= 0 AND average_compatibility <= 100),
ADD COLUMN IF NOT EXISTS algorithm_version text DEFAULT 'v2.0',
ADD COLUMN IF NOT EXISTS matching_criteria jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS success_metrics jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_activity_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS completion_date timestamp with time zone;

-- 3. Create match_batches table
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

-- 4. Create match_history table
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

-- 5. Create feedback tables
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

CREATE TABLE IF NOT EXISTS public.feedback_improvement_areas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL,
  area text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedback_improvement_areas_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_improvement_areas_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES public.feedback(id)
);

CREATE TABLE IF NOT EXISTS public.feedback_positive_aspects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL,
  aspect text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedback_positive_aspects_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_positive_aspects_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES public.feedback(id)
);

-- 6. Create message-related tables
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

CREATE TABLE IF NOT EXISTS public.message_read_status (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  profile_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT message_read_status_pkey PRIMARY KEY (id),
  CONSTRAINT message_read_status_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_messages(id),
  CONSTRAINT message_read_status_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- 7. Create payment-related tables
CREATE TABLE IF NOT EXISTS public.payment_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'GBP',
  billing_interval text NOT NULL DEFAULT 'month',
  stripe_price_id text UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  trial_days integer NOT NULL DEFAULT 0 CHECK (trial_days >= 0),
  features jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT payment_plans_pkey PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  payment_plan_id uuid,
  stripe_payment_intent_id text UNIQUE,
  stripe_subscription_id text,
  amount_cents integer CHECK (amount_cents >= 0),
  currency text NOT NULL DEFAULT 'GBP',
  payment_type text NOT NULL DEFAULT 'subscription',
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

CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  payment_plan_id uuid,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status text NOT NULL DEFAULT 'inactive',
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

-- 8. Create profile-related tables
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

CREATE TABLE IF NOT EXISTS public.profile_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE,
  gender_preference text NOT NULL DEFAULT 'no-preference',
  specialty_preference text NOT NULL DEFAULT 'no-preference',
  meeting_frequency text,
  preferred_times text,
  dietary_preferences text,
  activity_level text,
  social_energy_level text,
  conversation_style text,
  life_stage text,
  ideal_weekend text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT profile_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT profile_preferences_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

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

-- 9. Update notifications table
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS is_sent boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS delivery_attempts integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS scheduled_for timestamp with time zone,
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- 10. Update chat_rooms table
ALTER TABLE public.chat_rooms 
ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS message_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS settings jsonb NOT NULL DEFAULT '{}';

-- 11. Update chat_messages table
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS edit_count integer NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS edited_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_flagged boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS flag_reason text,
ADD COLUMN IF NOT EXISTS moderated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- 12. Update match_members table
ALTER TABLE public.match_members 
ADD COLUMN IF NOT EXISTS compatibility_factors jsonb NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS left_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS leave_reason text;

-- 13. Update profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nationality text,
ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS is_banned boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS ban_reason text,
ADD COLUMN IF NOT EXISTS banned_until timestamp with time zone,
ADD COLUMN IF NOT EXISTS search_vector tsvector,
ADD COLUMN IF NOT EXISTS last_active_at timestamp with time zone NOT NULL DEFAULT now();

-- 14. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_match_week ON public.matches(match_week);
CREATE INDEX IF NOT EXISTS idx_matches_batch_id ON public.matches(batch_id);
CREATE INDEX IF NOT EXISTS idx_match_members_compatibility ON public.match_members(compatibility_score);
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active_at);
CREATE INDEX IF NOT EXISTS idx_profiles_search_vector ON public.profiles USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_chat_messages_search_vector ON public.chat_messages USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_notifications_profile_read ON public.notifications(profile_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON public.notifications(scheduled_for) WHERE scheduled_for IS NOT NULL;

-- 15. Update existing data
-- Set match_week for existing matches
UPDATE public.matches 
SET match_week = DATE_TRUNC('week', created_at)::date 
WHERE match_week IS NULL;

-- Update search vectors for existing profiles
UPDATE public.profiles 
SET search_vector = to_tsvector('english', 
    COALESCE(first_name, '') || ' ' ||
    COALESCE(last_name, '') || ' ' ||
    COALESCE(medical_specialty, '') || ' ' ||
    COALESCE(city, '') || ' ' ||
    COALESCE(bio, '')
)
WHERE search_vector IS NULL;

-- Update search vectors for existing chat messages
UPDATE public.chat_messages 
SET search_vector = to_tsvector('english', COALESCE(content, ''))
WHERE search_vector IS NULL;

-- Success message
SELECT 'Database schema updated successfully!' as status;
