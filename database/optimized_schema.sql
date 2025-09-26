-- ==============================================
-- BeyondRounds Optimized Database Schema
-- ==============================================
-- Clean, normalized, and optimized schema for medical professional networking
-- 
-- Key Improvements:
-- 1. Consistent naming conventions (snake_case)
-- 2. Proper normalization and relationships
-- 3. Optimized indexes and constraints
-- 4. Clear separation of concerns
-- 5. Better data types and constraints

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==============================================
-- ENUMS AND CUSTOM TYPES
-- ==============================================

-- User roles
CREATE TYPE user_role AS ENUM ('user', 'admin', 'moderator');

-- Gender options
CREATE TYPE gender_type AS ENUM ('male', 'female', 'non_binary', 'prefer_not_to_say');

-- Gender preferences
CREATE TYPE gender_preference_type AS ENUM ('no_preference', 'mixed_preferred', 'same_gender_only', 'same_gender_preferred');

-- Specialty preferences
CREATE TYPE specialty_preference_type AS ENUM ('same_specialty', 'different_specialties', 'no_preference');

-- Career stages
CREATE TYPE career_stage_type AS ENUM (
  'medical_student', 
  'resident_1_2', 
  'resident_3_plus', 
  'fellow', 
  'attending_0_5', 
  'attending_5_plus', 
  'private_practice', 
  'academic_medicine', 
  'other'
);

-- Activity levels
CREATE TYPE activity_level_type AS ENUM (
  'very_active', 
  'active', 
  'moderately_active', 
  'occasionally_active', 
  'non_physical'
);

-- Social energy levels
CREATE TYPE social_energy_type AS ENUM (
  'very_high', 
  'high', 
  'moderate', 
  'low', 
  'very_low'
);

-- Conversation styles
CREATE TYPE conversation_style_type AS ENUM (
  'deep_philosophical', 
  'light_casual', 
  'professional_focused', 
  'mixed'
);

-- Meeting frequencies
CREATE TYPE meeting_frequency_type AS ENUM (
  'weekly', 
  'bi_weekly', 
  'monthly', 
  'flexible'
);

-- Life stages
CREATE TYPE life_stage_type AS ENUM (
  'single', 
  'dating', 
  'married', 
  'parent', 
  'empty_nester'
);

-- Match statuses
CREATE TYPE match_status_type AS ENUM (
  'active', 
  'completed', 
  'archived', 
  'disbanded'
);

-- Message types
CREATE TYPE message_type AS ENUM ('user', 'system', 'bot');

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'match_created', 
  'message_received', 
  'payment_reminder', 
  'verification_approved', 
  'system'
);

-- Verification statuses
CREATE TYPE verification_status_type AS ENUM (
  'pending', 
  'approved', 
  'rejected'
);

-- Payment statuses
CREATE TYPE payment_status_type AS ENUM (
  'succeeded', 
  'failed', 
  'pending', 
  'cancelled'
);

-- Subscription statuses
CREATE TYPE subscription_status_type AS ENUM (
  'active', 
  'inactive', 
  'cancelled', 
  'past_due'
);

-- Privacy levels
CREATE TYPE privacy_level_type AS ENUM (
  'minimal', 
  'standard', 
  'detailed'
);

-- ==============================================
-- CORE TABLES
-- ==============================================

-- Users table (extends auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  first_name TEXT NOT NULL CHECK (char_length(first_name) >= 1 AND char_length(first_name) <= 50),
  last_name TEXT NOT NULL CHECK (char_length(last_name) >= 1 AND char_length(last_name) <= 50),
  age INTEGER CHECK (age >= 18 AND age <= 100),
  gender gender_type,
  nationality TEXT CHECK (char_length(nationality) <= 50),
  city TEXT NOT NULL CHECK (char_length(city) >= 1 AND char_length(city) <= 100),
  timezone TEXT NOT NULL DEFAULT 'UTC' CHECK (char_length(timezone) <= 50),
  
  -- Medical Background
  medical_specialty TEXT CHECK (char_length(medical_specialty) <= 100),
  specialty_preference specialty_preference_type DEFAULT 'no_preference',
  career_stage career_stage_type,
  
  -- Activity and Lifestyle
  activity_level activity_level_type,
  social_energy_level social_energy_type,
  conversation_style conversation_style_type,
  meeting_frequency meeting_frequency_type,
  life_stage life_stage_type,
  
  -- Preferences
  dietary_preferences TEXT CHECK (char_length(dietary_preferences) <= 500),
  ideal_weekend TEXT CHECK (char_length(ideal_weekend) <= 500),
  
  -- System Fields
  role user_role NOT NULL DEFAULT 'user',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_banned BOOLEAN NOT NULL DEFAULT false,
  ban_reason TEXT,
  banned_until TIMESTAMP WITH TIME ZONE,
  profile_completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (profile_completion_percentage >= 0 AND profile_completion_percentage <= 100),
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  
  -- Search and Activity
  search_vector TSVECTOR,
  last_active_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- User specialties (normalized)
CREATE TABLE user_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialty TEXT NOT NULL CHECK (char_length(specialty) >= 1 AND char_length(specialty) <= 100),
  is_primary BOOLEAN NOT NULL DEFAULT false,
  years_experience INTEGER CHECK (years_experience >= 0 AND years_experience <= 50),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, specialty)
);

-- User interests (normalized)
CREATE TABLE user_interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  interest_type TEXT NOT NULL CHECK (interest_type IN ('music_genre', 'movie_genre', 'sport', 'hobby', 'other')),
  interest_value TEXT NOT NULL CHECK (char_length(interest_value) >= 1 AND char_length(interest_value) <= 100),
  priority INTEGER CHECK (priority >= 1 AND priority <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, interest_type, interest_value)
);

-- User preferences (normalized)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  gender_preference gender_preference_type NOT NULL DEFAULT 'no_preference',
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  weekly_match_reminders BOOLEAN NOT NULL DEFAULT true,
  marketing_emails BOOLEAN NOT NULL DEFAULT false,
  privacy_level privacy_level_type NOT NULL DEFAULT 'standard',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- User availability slots
CREATE TABLE user_availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME WITHOUT TIME ZONE NOT NULL,
  end_time TIME WITHOUT TIME ZONE NOT NULL CHECK (end_time > start_time),
  timezone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Match batches (for weekly matching)
CREATE TABLE match_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_date DATE NOT NULL UNIQUE,
  total_eligible_users INTEGER NOT NULL DEFAULT 0,
  total_groups_created INTEGER NOT NULL DEFAULT 0,
  total_users_matched INTEGER NOT NULL DEFAULT 0,
  algorithm_version TEXT NOT NULL DEFAULT 'v2.0',
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Matches (groups of matched users)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES match_batches(id),
  group_name TEXT NOT NULL CHECK (char_length(group_name) >= 1 AND char_length(group_name) <= 100),
  match_week DATE NOT NULL,
  group_size INTEGER NOT NULL DEFAULT 3 CHECK (group_size >= 2 AND group_size <= 6),
  average_compatibility_score DECIMAL(5,2) CHECK (average_compatibility_score >= 0 AND average_compatibility_score <= 100),
  algorithm_version TEXT NOT NULL DEFAULT 'v2.0',
  matching_criteria JSONB NOT NULL DEFAULT '{}',
  success_metrics JSONB NOT NULL DEFAULT '{}',
  last_activity_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Match members (junction table)
CREATE TABLE match_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  compatibility_score DECIMAL(5,2) CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  compatibility_factors JSONB NOT NULL DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  left_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  leave_reason TEXT,
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(match_id, user_id)
);

-- Chat rooms (for match groups)
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  description TEXT CHECK (char_length(description) <= 500),
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  message_count INTEGER NOT NULL DEFAULT 0,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reply_to_id UUID REFERENCES chat_messages(id),
  content TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 2000),
  message_type message_type NOT NULL DEFAULT 'user',
  is_edited BOOLEAN NOT NULL DEFAULT false,
  edit_count INTEGER NOT NULL DEFAULT 0,
  edited_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  is_flagged BOOLEAN NOT NULL DEFAULT false,
  flag_reason TEXT,
  moderated_at TIMESTAMP WITH TIME ZONE,
  moderated_by UUID REFERENCES users(id),
  search_vector TSVECTOR,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Message reactions
CREATE TABLE message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL CHECK (char_length(emoji) >= 1 AND char_length(emoji) <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(message_id, user_id, emoji)
);

-- Message read status
CREATE TABLE message_read_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES chat_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  message TEXT NOT NULL CHECK (char_length(message) >= 1 AND char_length(message) <= 1000),
  data JSONB NOT NULL DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  is_sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivery_attempts INTEGER NOT NULL DEFAULT 0,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Verification documents
CREATE TABLE verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  id_document_url TEXT,
  selfie_url TEXT,
  license_url TEXT,
  status verification_status_type NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES users(id),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Payment plans
CREATE TABLE payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  description TEXT CHECK (char_length(description) <= 500),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'GBP' CHECK (currency IN ('GBP', 'USD', 'EUR')),
  billing_interval TEXT NOT NULL DEFAULT 'month' CHECK (billing_interval IN ('month', 'year')),
  stripe_price_id TEXT UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  trial_days INTEGER NOT NULL DEFAULT 0 CHECK (trial_days >= 0),
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- User subscriptions
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_plan_id UUID REFERENCES payment_plans(id),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  status subscription_status_type NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_plan_id UUID REFERENCES payment_plans(id),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_subscription_id TEXT,
  amount_cents INTEGER CHECK (amount_cents >= 0),
  currency TEXT NOT NULL DEFAULT 'GBP' CHECK (currency IN ('GBP', 'USD', 'EUR')),
  payment_type TEXT NOT NULL DEFAULT 'subscription' CHECK (payment_type IN ('subscription', 'one_time')),
  payment_method_type TEXT,
  refund_amount_cents INTEGER NOT NULL DEFAULT 0 CHECK (refund_amount_cents >= 0),
  refund_reason TEXT,
  failure_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Feedback system
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  did_meet BOOLEAN NOT NULL,
  would_meet_again BOOLEAN,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  punctuality_rating INTEGER CHECK (punctuality_rating >= 1 AND punctuality_rating <= 5),
  engagement_rating INTEGER CHECK (engagement_rating >= 1 AND engagement_rating <= 5),
  feedback_text TEXT CHECK (char_length(feedback_text) <= 1000),
  safety_concern BOOLEAN NOT NULL DEFAULT false,
  safety_details TEXT CHECK (char_length(safety_details) <= 1000),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(match_id, reviewer_id, reviewee_id)
);

-- Feedback positive aspects
CREATE TABLE feedback_positive_aspects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  aspect TEXT NOT NULL CHECK (char_length(aspect) >= 1 AND char_length(aspect) <= 200),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Feedback improvement areas
CREATE TABLE feedback_improvement_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id UUID NOT NULL REFERENCES feedback(id) ON DELETE CASCADE,
  area TEXT NOT NULL CHECK (char_length(area) >= 1 AND char_length(area) <= 200),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Match history (for tracking past matches)
CREATE TABLE match_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  week_start DATE,
  user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  record_id UUID,
  user_id UUID REFERENCES users(id),
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[] NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  session_id TEXT,
  request_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);
