// =========================================================
// COMPREHENSIVE SCHEMA TYPES
// =========================================================
// Core types for the updated database schema

/* eslint-disable @typescript-eslint/no-explicit-any */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// Enum types
export type GenderType = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'
export type RoleType = 'user' | 'admin' | 'moderator'
export type ActivityLevel = 'low' | 'moderate' | 'high'
export type SocialEnergyLevel = 'introvert' | 'ambivert' | 'extrovert'
export type ConversationStyle = 'deep' | 'light' | 'balanced'
export type LifeStage = 'student' | 'early_career' | 'mid_career' | 'senior' | 'retired'
export type IdealWeekend = 'relaxing' | 'adventurous' | 'social' | 'productive'
export type MeetingFrequency = 'weekly' | 'bi-weekly' | 'monthly'
export type GenderPreference = 'male' | 'female' | 'no-preference'
export type SpecialtyPreference = 'same' | 'different' | 'no-preference'
export type CurrencyType = 'GBP' | 'USD' | 'EUR'
export type PaymentType = 'subscription' | 'one_time'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due' | 'trialing'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'
export type MatchStatus = 'active' | 'completed' | 'cancelled' | 'archived'
export type PrivacyLevel = 'minimal' | 'standard' | 'detailed'

// Core entity interfaces
export interface Profile {
  id: string
  user_id: string
  email: string | null
  first_name: string
  last_name: string
  age: number | null
  gender: GenderType | null
  nationality: string | null
  city: string
  timezone: string
  role: RoleType
  is_verified: boolean
  is_banned: boolean
  ban_reason: string | null
  banned_until: string | null
  medical_specialty: string
  bio: string | null
  looking_for: string | null
  profile_completion: number
  onboarding_completed: boolean
  search_vector: unknown | null
  last_active_at: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  phone_number: string | null
}

export interface Match {
  id: string
  batch_id: string | null
  group_name: string | null
  match_week: string
  group_size: number
  average_compatibility: number | null
  algorithm_version: string
  matching_criteria: Json
  success_metrics: Json
  last_activity_at: string
  completion_date: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  status: MatchStatus | null
}

export interface MatchMember {
  id: string
  match_id: string
  profile_id: string
  compatibility_score: number | null
  compatibility_factors: Json
  joined_at: string
  left_at: string | null
  is_active: boolean
  leave_reason: string | null
  deleted_at: string | null
}

export interface ChatRoom {
  id: string
  match_id: string
  name: string
  description: string | null
  is_active: boolean
  is_archived: boolean
  message_count: number
  last_message_at: string
  settings: Json
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ChatMessage {
  id: string
  chat_room_id: string
  match_id: string
  sender_id: string
  reply_to_id: string | null
  content: string
  is_edited: boolean
  edit_count: number
  edited_at: string | null
  deleted_at: string | null
  is_flagged: boolean
  flag_reason: string | null
  moderated_at: string | null
  moderated_by: string | null
  search_vector: unknown | null
  created_at: string
}

export interface Notification {
  id: string
  profile_id: string
  title: string
  message: string
  data: Json
  is_read: boolean
  read_at: string | null
  is_sent: boolean
  sent_at: string | null
  delivery_attempts: number
  scheduled_for: string | null
  expires_at: string | null
  created_at: string
  deleted_at: string | null
}

export interface Feedback {
  id: string
  match_id: string
  reviewer_id: string
  reviewee_id: string
  did_meet: boolean
  would_meet_again: boolean | null
  overall_rating: number | null
  communication_rating: number | null
  punctuality_rating: number | null
  engagement_rating: number | null
  feedback_text: string | null
  safety_concern: boolean
  safety_details: string | null
  created_at: string
  deleted_at: string | null
}

export interface ProfilePreferences {
  id: string
  profile_id: string
  gender_preference: GenderPreference
  specialty_preference: SpecialtyPreference
  meeting_frequency: MeetingFrequency | null
  preferred_times: string | null
  dietary_preferences: string | null
  activity_level: ActivityLevel | null
  social_energy_level: SocialEnergyLevel | null
  conversation_style: ConversationStyle | null
  life_stage: LifeStage | null
  ideal_weekend: IdealWeekend | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface UserPreferences {
  id: string
  profile_id: string
  email_notifications: boolean
  push_notifications: boolean
  weekly_match_reminders: boolean
  marketing_emails: boolean
  privacy_level: PrivacyLevel
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface PaymentPlan {
  id: string
  name: string
  description: string | null
  price_cents: number
  currency: CurrencyType
  billing_interval: 'month' | 'year'
  stripe_price_id: string | null
  is_active: boolean
  trial_days: number
  features: Json
  created_at: string
  deleted_at: string | null
}

export interface Payment {
  id: string
  profile_id: string
  payment_plan_id: string | null
  stripe_payment_intent_id: string | null
  stripe_subscription_id: string | null
  amount_cents: number | null
  currency: CurrencyType
  payment_type: PaymentType
  payment_method_type: string | null
  refund_amount_cents: number
  refund_reason: string | null
  failure_reason: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface UserSubscription {
  id: string
  profile_id: string
  payment_plan_id: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  trial_end: string | null
  cancelled_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface VerificationDocument {
  id: string
  profile_id: string
  id_document_url: string | null
  selfie_url: string | null
  license_url: string | null
  status: VerificationStatus
  admin_notes: string | null
  submitted_at: string
  reviewed_at: string | null
  reviewed_by: string | null
  deleted_at: string | null
}

export interface ProfileInterest {
  id: string
  profile_id: string
  kind: string
  value: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ProfileSpecialty {
  id: string
  profile_id: string
  specialty: string
  is_primary: boolean
  years_experience: number | null
  created_at: string
  deleted_at: string | null
}

export interface ProfileAvailabilitySlot {
  id: string
  profile_id: string
  day_of_week: number
  start_time: string
  end_time: string
  timezone: string | null
  created_at: string
  deleted_at: string | null
}

export interface MessageReaction {
  id: string
  message_id: string
  profile_id: string
  emoji: string
  created_at: string
  deleted_at: string | null
}

export interface MessageReadStatus {
  id: string
  message_id: string
  profile_id: string
  read_at: string
}

export interface AuditLog {
  id: string
  table_name: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
  record_id: string | null
  profile_id: string | null
  old_values: Json | null
  new_values: Json | null
  changed_fields: string[]
  ip_address: string | null
  user_agent: string | null
  session_id: string | null
  request_id: string | null
  created_at: string
  deleted_at: string | null
}

// Insert types (for creating new records)
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type MatchInsert = Omit<Match, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type MatchMemberInsert = Omit<MatchMember, 'id' | 'joined_at'> & {
  id?: string
  joined_at?: string
}

export type ChatRoomInsert = Omit<ChatRoom, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type ChatMessageInsert = Omit<ChatMessage, 'id' | 'created_at' | 'sender_id'> & {
  id?: string
  created_at?: string
  sender_id?: string
}

export type NotificationInsert = Omit<Notification, 'id' | 'created_at'> & {
  id?: string
  created_at?: string
}

// Update types (for updating existing records)
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'user_id' | 'created_at'>>
export type MatchUpdate = Partial<Omit<Match, 'id' | 'created_at'>>
export type MatchMemberUpdate = Partial<Omit<MatchMember, 'id' | 'match_id' | 'profile_id'>>
export type ChatRoomUpdate = Partial<Omit<ChatRoom, 'id' | 'match_id' | 'created_at'>>
export type ChatMessageUpdate = Partial<Omit<ChatMessage, 'id' | 'chat_room_id' | 'match_id' | 'sender_id' | 'created_at'>>
export type NotificationUpdate = Partial<Omit<Notification, 'id' | 'profile_id' | 'created_at'>>

// Utility types for frontend use
export interface ProfileWithPreferences extends Profile {
  profile_preferences?: ProfilePreferences
  user_preferences?: UserPreferences
  profile_interests?: ProfileInterest[]
  profile_specialties?: ProfileSpecialty[]
  profile_availability_slots?: ProfileAvailabilitySlot[]
}

export interface ChatMessageWithSender extends ChatMessage {
  sender?: {
    id: string
    first_name: string
    last_name: string
    medical_specialty: string
    avatar?: string
  }
  reactions?: MessageReaction[]
  read_status?: MessageReadStatus[]
}

export interface MatchWithMembers extends Match {
  match_members?: (MatchMember & {
    profile?: Profile
  })[]
  chat_rooms?: ChatRoom[]
}

export interface ChatRoomWithMessages extends ChatRoom {
  chat_messages?: ChatMessageWithSender[]
  unread_count?: number
  last_message?: ChatMessageWithSender
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}


