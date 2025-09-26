-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  operation text NOT NULL CHECK (operation = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])),
  record_id uuid,
  profile_id uuid,
  old_values jsonb,
  new_values jsonb,
  changed_fields ARRAY NOT NULL DEFAULT '{}'::text[],
  ip_address inet,
  user_agent text,
  session_id text,
  request_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT audit_log_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  chat_room_id uuid NOT NULL,
  match_id uuid NOT NULL,
  sender_id uuid NOT NULL DEFAULT my_profile_id(),
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
CREATE TABLE public.chat_rooms (
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
CREATE TABLE public.feedback (
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
CREATE TABLE public.feedback_improvement_areas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL,
  area text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedback_improvement_areas_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_improvement_areas_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES public.feedback(id)
);
CREATE TABLE public.feedback_positive_aspects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL,
  aspect text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT feedback_positive_aspects_pkey PRIMARY KEY (id),
  CONSTRAINT feedback_positive_aspects_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES public.feedback(id)
);
CREATE TABLE public.match_batches (
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
CREATE TABLE public.match_history (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  matched_at timestamp with time zone NOT NULL DEFAULT now(),
  week_start date,
  profile1_id uuid,
  profile2_id uuid,
  CONSTRAINT match_history_pkey PRIMARY KEY (id),
  CONSTRAINT match_history_profile1_id_fkey FOREIGN KEY (profile1_id) REFERENCES public.profiles(id),
  CONSTRAINT match_history_profile2_id_fkey FOREIGN KEY (profile2_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.match_members (
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
CREATE TABLE public.matches (
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
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'completed'::text, 'cancelled'::text, 'archived'::text])),
  CONSTRAINT matches_pkey PRIMARY KEY (id),
  CONSTRAINT matches_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES public.match_batches(id)
);
CREATE TABLE public.message_reactions (
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
CREATE TABLE public.message_read_status (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL,
  profile_id uuid NOT NULL DEFAULT my_profile_id(),
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT message_read_status_pkey PRIMARY KEY (id),
  CONSTRAINT message_read_status_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.chat_messages(id),
  CONSTRAINT message_read_status_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.notifications (
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
CREATE TABLE public.payment_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency USER-DEFINED NOT NULL DEFAULT 'GBP'::currency_type,
  billing_interval USER-DEFINED NOT NULL DEFAULT 'month'::billing_interval_type,
  stripe_price_id text UNIQUE,
  is_active boolean NOT NULL DEFAULT true,
  trial_days integer NOT NULL DEFAULT 0 CHECK (trial_days >= 0),
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT payment_plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  payment_plan_id uuid,
  stripe_payment_intent_id text UNIQUE,
  stripe_subscription_id text,
  amount_cents integer CHECK (amount_cents >= 0),
  currency USER-DEFINED NOT NULL DEFAULT 'GBP'::currency_type,
  payment_type USER-DEFINED NOT NULL DEFAULT 'subscription'::pay_type,
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
CREATE TABLE public.profile_availability_slots (
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
CREATE TABLE public.profile_interests (
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
CREATE TABLE public.profile_meeting_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  activity text NOT NULL,
  priority smallint CHECK (priority >= 1 AND priority <= 5),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT profile_meeting_activities_pkey PRIMARY KEY (id),
  CONSTRAINT profile_meeting_activities_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profile_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  gender_preference USER-DEFINED NOT NULL DEFAULT 'no-preference'::gender_pref_type,
  specialty_preference USER-DEFINED NOT NULL DEFAULT 'no-preference'::specialty_pref_type,
  meeting_frequency USER-DEFINED,
  preferred_times text,
  dietary_preferences text,
  activity_level USER-DEFINED,
  social_energy_level USER-DEFINED,
  conversation_style USER-DEFINED,
  life_stage USER-DEFINED,
  ideal_weekend USER-DEFINED,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  deleted_at timestamp with time zone,
  CONSTRAINT profile_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT profile_preferences_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.profile_specialties (
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
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text),
  first_name text NOT NULL,
  last_name text NOT NULL,
  age integer CHECK (age >= 18 AND age <= 100),
  gender USER-DEFINED,
  nationality text,
  city text NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC'::text,
  role USER-DEFINED NOT NULL DEFAULT 'user'::role_type,
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
  phone_number character varying,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.user_preferences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
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
CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  payment_plan_id uuid,
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text UNIQUE,
  status USER-DEFINED NOT NULL DEFAULT 'inactive'::sub_status_type,
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
CREATE TABLE public.verification_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  id_document_url text,
  selfie_url text,
  license_url text,
  status USER-DEFINED NOT NULL DEFAULT 'pending'::verify_status_type,
  admin_notes text,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  deleted_at timestamp with time zone,
  CONSTRAINT verification_documents_pkey PRIMARY KEY (id),
  CONSTRAINT verification_documents_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT verification_documents_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id)
);