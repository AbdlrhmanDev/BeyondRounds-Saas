// ==============================================
// Database Types - Complete Schema
// ==============================================
// Comprehensive database schema types and interfaces

/* eslint-disable no-unused-vars, @typescript-eslint/no-explicit-any */

// ==============================================
// ENUMS & BASIC TYPES
// ==============================================

export type UserRole = 'user' | 'admin' | 'moderator';
export type GenderType = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
export type GenderPreferenceType = 'no-preference' | 'mixed-preferred' | 'same-gender-only' | 'same-gender-preferred';
export type SpecialtyPreferenceType = 'same-specialty' | 'different-specialties' | 'no-preference';
export type CareerStageType = 
  | 'medical_student' 
  | 'resident_1_2' 
  | 'resident_3_plus' 
  | 'fellow' 
  | 'attending_0_5' 
  | 'attending_5_plus' 
  | 'private_practice' 
  | 'academic_medicine' 
  | 'other';
export type ActivityLevelType = 'very-active' | 'active' | 'moderately-active' | 'occasionally-active' | 'non-physical';
export type SocialEnergyType = 'very-high' | 'high' | 'moderate' | 'low' | 'very-low';
export type ConversationStyleType = 'deep-philosophical' | 'light-casual' | 'professional-focused' | 'mixed';
export type MeetingFrequencyType = 'weekly' | 'bi-weekly' | 'monthly' | 'flexible';
export type LifeStageType = 'single' | 'dating' | 'married' | 'parent' | 'empty-nester';
export type MatchStatusType = 'active' | 'completed' | 'cancelled' | 'archived';
export type MessageType = 'user' | 'system' | 'bot';
export type NotificationType = 'match-created' | 'message-received' | 'payment-reminder' | 'verification-approved' | 'system';
export type VerificationStatusType = 'pending' | 'approved' | 'rejected';
export type PaymentStatusType = 'succeeded' | 'failed' | 'pending' | 'cancelled';

// Additional enums from SQL schema
export type CurrencyType = 'GBP' | 'USD' | 'EUR';
export type BillingIntervalType = 'month' | 'year' | 'week';
export type PaymentType = 'subscription' | 'one-time';
export type SubscriptionStatusType = 'active' | 'inactive' | 'cancelled' | 'past-due' | 'trialing';
export type AuditOperationType = 'INSERT' | 'UPDATE' | 'DELETE';
export type CronJobStatusType = 'started' | 'completed' | 'failed';
export type PrivacyLevelType = 'minimal' | 'standard' | 'detailed';
export type IdealWeekendType = 'relaxing' | 'adventure' | 'social' | 'productive' | 'mixed';
export type DocumentType = 'id-card' | 'medical-license' | 'selfie';

// ==============================================
// MAIN DATABASE INTERFACE
// ==============================================

export interface Database {
  public: {
    Tables: {
      audit_log: {
        Row: AuditLog;
        Insert: AuditLogInsert;
        Update: AuditLogUpdate;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: ChatMessageInsert;
        Update: ChatMessageUpdate;
      };
      chat_rooms: {
        Row: ChatRoom;
        Insert: ChatRoomInsert;
        Update: ChatRoomUpdate;
      };
      cron_job_logs: {
        Row: CronJobLog;
        Insert: CronJobLogInsert;
        Update: CronJobLogUpdate;
      };
      feedback: {
        Row: Feedback;
        Insert: FeedbackInsert;
        Update: FeedbackUpdate;
      };
      feedback_improvement_areas: {
        Row: FeedbackImprovementArea;
        Insert: FeedbackImprovementAreaInsert;
        Update: FeedbackImprovementAreaUpdate;
      };
      feedback_positive_aspects: {
        Row: FeedbackPositiveAspect;
        Insert: FeedbackPositiveAspectInsert;
        Update: FeedbackPositiveAspectUpdate;
      };
      match_batches: {
        Row: MatchBatch;
        Insert: MatchBatchInsert;
        Update: MatchBatchUpdate;
      };
      match_history: {
        Row: MatchHistory;
        Insert: MatchHistoryInsert;
        Update: MatchHistoryUpdate;
      };
      match_members: {
        Row: MatchMember;
        Insert: MatchMemberInsert;
        Update: MatchMemberUpdate;
      };
      matches: {
        Row: Match;
        Insert: MatchInsert;
        Update: MatchUpdate;
      };
      matching_history: {
        Row: MatchingHistory;
        Insert: MatchingHistoryInsert;
        Update: MatchingHistoryUpdate;
      };
      message_reactions: {
        Row: MessageReaction;
        Insert: MessageReactionInsert;
        Update: MessageReactionUpdate;
      };
      message_read_status: {
        Row: MessageReadStatus;
        Insert: MessageReadStatusInsert;
        Update: MessageReadStatusUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      payment_plans: {
        Row: PaymentPlan;
        Insert: PaymentPlanInsert;
        Update: PaymentPlanUpdate;
      };
      payments: {
        Row: Payment;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
      };
      profile_availability_slots: {
        Row: ProfileAvailabilitySlot;
        Insert: ProfileAvailabilitySlotInsert;
        Update: ProfileAvailabilitySlotUpdate;
      };
      profile_interests: {
        Row: ProfileInterest;
        Insert: ProfileInterestInsert;
        Update: ProfileInterestUpdate;
      };
      profile_meeting_activities: {
        Row: ProfileMeetingActivity;
        Insert: ProfileMeetingActivityInsert;
        Update: ProfileMeetingActivityUpdate;
      };
      profile_preferences: {
        Row: ProfilePreference;
        Insert: ProfilePreferenceInsert;
        Update: ProfilePreferenceUpdate;
      };
      profile_specialties: {
        Row: ProfileSpecialty;
        Insert: ProfileSpecialtyInsert;
        Update: ProfileSpecialtyUpdate;
      };
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      user_preferences: {
        Row: UserPreference;
        Insert: UserPreferenceInsert;
        Update: UserPreferenceUpdate;
      };
      user_subscriptions: {
        Row: UserSubscription;
        Insert: UserSubscriptionInsert;
        Update: UserSubscriptionUpdate;
      };
      verification_documents: {
        Row: VerificationDocument;
        Insert: VerificationDocumentInsert;
        Update: VerificationDocumentUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      gender_type: GenderType;
      gender_preference_type: GenderPreferenceType;
      specialty_preference_type: SpecialtyPreferenceType;
      career_stage_type: CareerStageType;
      activity_level_type: ActivityLevelType;
      social_energy_type: SocialEnergyType;
      conversation_style_type: ConversationStyleType;
      meeting_frequency_type: MeetingFrequencyType;
      life_stage_type: LifeStageType;
      match_status_type: MatchStatusType;
      message_type: MessageType;
      notification_type: NotificationType;
      verification_status_type: VerificationStatusType;
      payment_status_type: PaymentStatusType;
      currency_type: CurrencyType;
      billing_interval_type: BillingIntervalType;
      payment_type: PaymentType;
      subscription_status_type: SubscriptionStatusType;
      audit_operation_type: AuditOperationType;
      cron_job_status_type: CronJobStatusType;
      privacy_level_type: PrivacyLevelType;
      ideal_weekend_type: IdealWeekendType;
      document_type: DocumentType;
    };
  };
}

// ==============================================
// AUDIT LOG TYPES
// ==============================================

export interface AuditLog {
  id: string;
  table_name: string;
  operation: AuditOperationType;
  record_id: string | null;
  profile_id: string | null;
  old_values: any | null;
  new_values: any | null;
  changed_fields: string[];
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  request_id: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface AuditLogInsert {
  id?: string;
  table_name: string;
  operation: AuditOperationType;
  record_id?: string | null;
  profile_id?: string | null;
  old_values?: any | null;
  new_values?: any | null;
  changed_fields?: string[];
  ip_address?: string | null;
  user_agent?: string | null;
  session_id?: string | null;
  request_id?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

export interface AuditLogUpdate {
  id?: string;
  table_name?: string;
  operation?: AuditOperationType;
  record_id?: string | null;
  profile_id?: string | null;
  old_values?: any | null;
  new_values?: any | null;
  changed_fields?: string[];
  ip_address?: string | null;
  user_agent?: string | null;
  session_id?: string | null;
  request_id?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

// ==============================================
// PROFILE TYPES
// ==============================================

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  first_name: string;
  last_name: string;
  age: number | null;
  gender: GenderType | null;
  nationality: string | null;
  city: string;
  timezone: string;
  role: UserRole;
  is_verified: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  banned_until: string | null;
  medical_specialty: string;
  bio: string | null;
  looking_for: string | null;
  profile_completion: number;
  onboarding_completed: boolean;
  last_active_at: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  phone_number: string | null;
  search_vector: string | null;
}

export interface ProfileInsert {
  id?: string;
  user_id: string;
  email?: string | null;
  first_name: string;
  last_name: string;
  age?: number | null;
  gender?: GenderType | null;
  nationality?: string | null;
  city: string;
  timezone?: string;
  role?: UserRole;
  is_verified?: boolean;
  is_banned?: boolean;
  ban_reason?: string | null;
  banned_until?: string | null;
  medical_specialty: string;
  bio?: string | null;
  looking_for?: string | null;
  profile_completion?: number;
  onboarding_completed?: boolean;
  last_active_at?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  phone_number?: string | null;
  search_vector?: string | null;
}

export interface ProfileUpdate {
  id?: string;
  user_id?: string;
  email?: string | null;
  first_name?: string;
  last_name?: string;
  age?: number | null;
  gender?: GenderType | null;
  nationality?: string | null;
  city?: string;
  timezone?: string;
  role?: UserRole;
  is_verified?: boolean;
  is_banned?: boolean;
  ban_reason?: string | null;
  banned_until?: string | null;
  medical_specialty?: string;
  bio?: string | null;
  looking_for?: string | null;
  profile_completion?: number;
  onboarding_completed?: boolean;
  last_active_at?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  phone_number?: string | null;
  search_vector?: string | null;
}

// ==============================================
// MATCH TYPES
// ==============================================

export interface Match {
  id: string;
  batch_id: string | null;
  group_name: string | null;
  match_week: string;
  group_size: number;
  average_compatibility: number | null;
  algorithm_version: string;
  matching_criteria: any;
  success_metrics: any;
  last_activity_at: string;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  status: MatchStatusType;
}

export interface MatchInsert {
  id?: string;
  batch_id?: string | null;
  group_name?: string | null;
  match_week: string;
  group_size?: number;
  average_compatibility?: number | null;
  algorithm_version?: string;
  matching_criteria?: any;
  success_metrics?: any;
  last_activity_at?: string;
  completion_date?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  status?: MatchStatusType;
}

export interface MatchUpdate {
  id?: string;
  batch_id?: string | null;
  group_name?: string | null;
  match_week?: string;
  group_size?: number;
  average_compatibility?: number | null;
  algorithm_version?: string;
  matching_criteria?: any;
  success_metrics?: any;
  last_activity_at?: string;
  completion_date?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  status?: MatchStatusType;
}

// ==============================================
// MATCH MEMBER TYPES
// ==============================================

export interface MatchMember {
  id: string;
  match_id: string;
  profile_id: string;
  compatibility_score: number | null;
  compatibility_factors: any;
  joined_at: string;
  left_at: string | null;
  is_active: boolean;
  leave_reason: string | null;
  deleted_at: string | null;
}

export interface MatchMemberInsert {
  id?: string;
  match_id: string;
  profile_id: string;
  compatibility_score?: number | null;
  compatibility_factors?: any;
  joined_at?: string;
  left_at?: string | null;
  is_active?: boolean;
  leave_reason?: string | null;
  deleted_at?: string | null;
}

export interface MatchMemberUpdate {
  id?: string;
  match_id?: string;
  profile_id?: string;
  compatibility_score?: number | null;
  compatibility_factors?: any;
  joined_at?: string;
  left_at?: string | null;
  is_active?: boolean;
  leave_reason?: string | null;
  deleted_at?: string | null;
}

// ==============================================
// CHAT TYPES
// ==============================================

export interface ChatRoom {
  id: string;
  match_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  is_archived: boolean;
  message_count: number;
  last_message_at: string;
  settings: any;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ChatRoomInsert {
  id?: string;
  match_id: string;
  name: string;
  description?: string | null;
  is_active?: boolean;
  is_archived?: boolean;
  message_count?: number;
  last_message_at?: string;
  settings?: any;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ChatRoomUpdate {
  id?: string;
  match_id?: string;
  name?: string;
  description?: string | null;
  is_active?: boolean;
  is_archived?: boolean;
  message_count?: number;
  last_message_at?: string;
  settings?: any;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ChatMessage {
  id: string;
  chat_room_id: string;
  match_id: string;
  sender_id: string;
  reply_to_id: string | null;
  content: string;
  is_edited: boolean;
  edit_count: number;
  edited_at: string | null;
  deleted_at: string | null;
  is_flagged: boolean;
  flag_reason: string | null;
  moderated_at: string | null;
  moderated_by: string | null;
  created_at: string;
  search_vector: string | null;
}

export interface ChatMessageInsert {
  id?: string;
  chat_room_id: string;
  match_id: string;
  sender_id?: string;
  reply_to_id?: string | null;
  content: string;
  is_edited?: boolean;
  edit_count?: number;
  edited_at?: string | null;
  deleted_at?: string | null;
  is_flagged?: boolean;
  flag_reason?: string | null;
  moderated_at?: string | null;
  moderated_by?: string | null;
  created_at?: string;
  search_vector?: string | null;
}

export interface ChatMessageUpdate {
  id?: string;
  chat_room_id?: string;
  match_id?: string;
  sender_id?: string;
  reply_to_id?: string | null;
  content?: string;
  is_edited?: boolean;
  edit_count?: number;
  edited_at?: string | null;
  deleted_at?: string | null;
  is_flagged?: boolean;
  flag_reason?: string | null;
  moderated_at?: string | null;
  moderated_by?: string | null;
  created_at?: string;
  search_vector?: string | null;
}

// ==============================================
// MESSAGE REACTION TYPES
// ==============================================

export interface MessageReaction {
  id: string;
  message_id: string;
  profile_id: string;
  emoji: string;
  created_at: string;
  deleted_at: string | null;
}

export interface MessageReactionInsert {
  id?: string;
  message_id: string;
  profile_id?: string;
  emoji: string;
  created_at?: string;
  deleted_at?: string | null;
}

export interface MessageReactionUpdate {
  id?: string;
  message_id?: string;
  profile_id?: string;
  emoji?: string;
  created_at?: string;
  deleted_at?: string | null;
}

// ==============================================
// MESSAGE READ STATUS TYPES
// ==============================================

export interface MessageReadStatus {
  id: string;
  message_id: string;
  profile_id: string;
  read_at: string;
}

export interface MessageReadStatusInsert {
  id?: string;
  message_id: string;
  profile_id?: string;
  read_at?: string;
}

export interface MessageReadStatusUpdate {
  id?: string;
  message_id?: string;
  profile_id?: string;
  read_at?: string;
}

// ==============================================
// NOTIFICATION TYPES
// ==============================================

export interface Notification {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  read_at: string | null;
  is_sent: boolean;
  sent_at: string | null;
  delivery_attempts: number;
  scheduled_for: string | null;
  expires_at: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface NotificationInsert {
  id?: string;
  profile_id: string;
  title: string;
  message: string;
  data?: any;
  is_read?: boolean;
  read_at?: string | null;
  is_sent?: boolean;
  sent_at?: string | null;
  delivery_attempts?: number;
  scheduled_for?: string | null;
  expires_at?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

export interface NotificationUpdate {
  id?: string;
  profile_id?: string;
  title?: string;
  message?: string;
  data?: any;
  is_read?: boolean;
  read_at?: string | null;
  is_sent?: boolean;
  sent_at?: string | null;
  delivery_attempts?: number;
  scheduled_for?: string | null;
  expires_at?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

// ==============================================
// VERIFICATION TYPES
// ==============================================

export interface VerificationDocument {
  id: string;
  profile_id: string;
  id_document_url: string | null;
  selfie_url: string | null;
  license_url: string | null;
  status: VerificationStatusType;
  admin_notes: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  deleted_at: string | null;
}

export interface VerificationDocumentInsert {
  id?: string;
  profile_id: string;
  id_document_url?: string | null;
  selfie_url?: string | null;
  license_url?: string | null;
  status?: VerificationStatusType;
  admin_notes?: string | null;
  submitted_at?: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  deleted_at?: string | null;
}

export interface VerificationDocumentUpdate {
  id?: string;
  profile_id?: string;
  id_document_url?: string | null;
  selfie_url?: string | null;
  license_url?: string | null;
  status?: VerificationStatusType;
  admin_notes?: string | null;
  submitted_at?: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  deleted_at?: string | null;
}

// ==============================================
// PREFERENCE TYPES
// ==============================================

export interface UserPreference {
  id: string;
  profile_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  weekly_match_reminders: boolean;
  marketing_emails: boolean;
  privacy_level: PrivacyLevelType;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UserPreferenceInsert {
  id?: string;
  profile_id: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  weekly_match_reminders?: boolean;
  marketing_emails?: boolean;
  privacy_level?: PrivacyLevelType;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface UserPreferenceUpdate {
  id?: string;
  profile_id?: string;
  email_notifications?: boolean;
  push_notifications?: boolean;
  weekly_match_reminders?: boolean;
  marketing_emails?: boolean;
  privacy_level?: PrivacyLevelType;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProfilePreference {
  id: string;
  profile_id: string;
  gender_preference: GenderPreferenceType;
  specialty_preference: SpecialtyPreferenceType;
  meeting_frequency: MeetingFrequencyType | null;
  preferred_times: string | null;
  dietary_preferences: string | null;
  activity_level: ActivityLevelType | null;
  social_energy_level: SocialEnergyType | null;
  conversation_style: ConversationStyleType | null;
  life_stage: LifeStageType | null;
  ideal_weekend: IdealWeekendType | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProfilePreferenceInsert {
  id?: string;
  profile_id: string;
  gender_preference?: GenderPreferenceType;
  specialty_preference?: SpecialtyPreferenceType;
  meeting_frequency?: MeetingFrequencyType | null;
  preferred_times?: string | null;
  dietary_preferences?: string | null;
  activity_level?: ActivityLevelType | null;
  social_energy_level?: SocialEnergyType | null;
  conversation_style?: ConversationStyleType | null;
  life_stage?: LifeStageType | null;
  ideal_weekend?: IdealWeekendType | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProfilePreferenceUpdate {
  id?: string;
  profile_id?: string;
  gender_preference?: GenderPreferenceType;
  specialty_preference?: SpecialtyPreferenceType;
  meeting_frequency?: MeetingFrequencyType | null;
  preferred_times?: string | null;
  dietary_preferences?: string | null;
  activity_level?: ActivityLevelType | null;
  social_energy_level?: SocialEnergyType | null;
  conversation_style?: ConversationStyleType | null;
  life_stage?: LifeStageType | null;
  ideal_weekend?: IdealWeekendType | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// ==============================================
// INTEREST TYPES
// ==============================================

export interface ProfileInterest {
  id: string;
  profile_id: string;
  kind: string;
  value: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ProfileInterestInsert {
  id?: string;
  profile_id: string;
  kind: string;
  value: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface ProfileInterestUpdate {
  id?: string;
  profile_id?: string;
  kind?: string;
  value?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// ==============================================
// SPECIALTY TYPES
// ==============================================

export interface ProfileSpecialty {
  id: string;
  profile_id: string;
  specialty: string;
  is_primary: boolean;
  years_experience: number | null;
  created_at: string;
  deleted_at: string | null;
}

export interface ProfileSpecialtyInsert {
  id?: string;
  profile_id: string;
  specialty: string;
  is_primary?: boolean;
  years_experience?: number | null;
  created_at?: string;
  deleted_at?: string | null;
}

export interface ProfileSpecialtyUpdate {
  id?: string;
  profile_id?: string;
  specialty?: string;
  is_primary?: boolean;
  years_experience?: number | null;
  created_at?: string;
  deleted_at?: string | null;
}

// ==============================================
// AVAILABILITY TYPES
// ==============================================

export interface ProfileAvailabilitySlot {
  id: string;
  profile_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface ProfileAvailabilitySlotInsert {
  id?: string;
  profile_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

export interface ProfileAvailabilitySlotUpdate {
  id?: string;
  profile_id?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  timezone?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

// ==============================================
// MEETING ACTIVITY TYPES
// ==============================================

export interface ProfileMeetingActivity {
  id: string;
  profile_id: string;
  activity: string;
  priority: number | null;
  created_at: string;
  deleted_at: string | null;
}

export interface ProfileMeetingActivityInsert {
  id?: string;
  profile_id: string;
  activity: string;
  priority?: number | null;
  created_at?: string;
  deleted_at?: string | null;
}

export interface ProfileMeetingActivityUpdate {
  id?: string;
  profile_id?: string;
  activity?: string;
  priority?: number | null;
  created_at?: string;
  deleted_at?: string | null;
}

// ==============================================
// PAYMENT TYPES
// ==============================================

export interface PaymentPlan {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  currency: CurrencyType;
  billing_interval: BillingIntervalType;
  stripe_price_id: string | null;
  is_active: boolean;
  trial_days: number;
  features: any;
  created_at: string;
  deleted_at: string | null;
}

export interface PaymentPlanInsert {
  id?: string;
  name: string;
  description?: string | null;
  price_cents: number;
  currency?: CurrencyType;
  billing_interval?: BillingIntervalType;
  stripe_price_id?: string | null;
  is_active?: boolean;
  trial_days?: number;
  features?: any;
  created_at?: string;
  deleted_at?: string | null;
}

export interface PaymentPlanUpdate {
  id?: string;
  name?: string;
  description?: string | null;
  price_cents?: number;
  currency?: CurrencyType;
  billing_interval?: BillingIntervalType;
  stripe_price_id?: string | null;
  is_active?: boolean;
  trial_days?: number;
  features?: any;
  created_at?: string;
  deleted_at?: string | null;
}

export interface Payment {
  id: string;
  profile_id: string;
  payment_plan_id: string | null;
  stripe_payment_intent_id: string | null;
  stripe_subscription_id: string | null;
  amount_cents: number | null;
  currency: CurrencyType;
  payment_type: PaymentType;
  payment_method_type: string | null;
  refund_amount_cents: number;
  refund_reason: string | null;
  failure_reason: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PaymentInsert {
  id?: string;
  profile_id: string;
  payment_plan_id?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_subscription_id?: string | null;
  amount_cents?: number | null;
  currency?: CurrencyType;
  payment_type?: PaymentType;
  payment_method_type?: string | null;
  refund_amount_cents?: number;
  refund_reason?: string | null;
  failure_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface PaymentUpdate {
  id?: string;
  profile_id?: string;
  payment_plan_id?: string | null;
  stripe_payment_intent_id?: string | null;
  stripe_subscription_id?: string | null;
  amount_cents?: number | null;
  currency?: CurrencyType;
  payment_type?: PaymentType;
  payment_method_type?: string | null;
  refund_amount_cents?: number;
  refund_reason?: string | null;
  failure_reason?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// ==============================================
// SUBSCRIPTION TYPES
// ==============================================

export interface UserSubscription {
  id: string;
  profile_id: string;
  payment_plan_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatusType;
  current_period_start: string | null;
  current_period_end: string | null;
  trial_end: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UserSubscriptionInsert {
  id?: string;
  profile_id: string;
  payment_plan_id?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  status?: SubscriptionStatusType;
  current_period_start?: string | null;
  current_period_end?: string | null;
  trial_end?: string | null;
  cancelled_at?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface UserSubscriptionUpdate {
  id?: string;
  profile_id?: string;
  payment_plan_id?: string | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  status?: SubscriptionStatusType;
  current_period_start?: string | null;
  current_period_end?: string | null;
  trial_end?: string | null;
  cancelled_at?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

// ==============================================
// FEEDBACK TYPES
// ==============================================

export interface Feedback {
  id: string;
  match_id: string;
  reviewer_id: string;
  reviewee_id: string;
  did_meet: boolean;
  would_meet_again: boolean | null;
  overall_rating: number | null;
  communication_rating: number | null;
  punctuality_rating: number | null;
  engagement_rating: number | null;
  feedback_text: string | null;
  safety_concern: boolean;
  safety_details: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface FeedbackInsert {
  id?: string;
  match_id: string;
  reviewer_id: string;
  reviewee_id: string;
  did_meet: boolean;
  would_meet_again?: boolean | null;
  overall_rating?: number | null;
  communication_rating?: number | null;
  punctuality_rating?: number | null;
  engagement_rating?: number | null;
  feedback_text?: string | null;
  safety_concern?: boolean;
  safety_details?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

export interface FeedbackUpdate {
  id?: string;
  match_id?: string;
  reviewer_id?: string;
  reviewee_id?: string;
  did_meet?: boolean;
  would_meet_again?: boolean | null;
  overall_rating?: number | null;
  communication_rating?: number | null;
  punctuality_rating?: number | null;
  engagement_rating?: number | null;
  feedback_text?: string | null;
  safety_concern?: boolean;
  safety_details?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

export interface FeedbackImprovementArea {
  id: string;
  feedback_id: string;
  area: string;
  created_at: string;
}

export interface FeedbackImprovementAreaInsert {
  id?: string;
  feedback_id: string;
  area: string;
  created_at?: string;
}

export interface FeedbackImprovementAreaUpdate {
  id?: string;
  feedback_id?: string;
  area?: string;
  created_at?: string;
}

export interface FeedbackPositiveAspect {
  id: string;
  feedback_id: string;
  aspect: string;
  created_at: string;
}

export interface FeedbackPositiveAspectInsert {
  id?: string;
  feedback_id: string;
  aspect: string;
  created_at?: string;
}

export interface FeedbackPositiveAspectUpdate {
  id?: string;
  feedback_id?: string;
  aspect?: string;
  created_at?: string;
}

// ==============================================
// BATCH & HISTORY TYPES
// ==============================================

export interface MatchBatch {
  id: string;
  batch_date: string;
  total_eligible_users: number;
  total_groups_created: number;
  total_users_matched: number;
  algorithm_version: string;
  processing_started_at: string | null;
  processing_completed_at: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface MatchBatchInsert {
  id?: string;
  batch_date: string;
  total_eligible_users?: number;
  total_groups_created?: number;
  total_users_matched?: number;
  algorithm_version?: string;
  processing_started_at?: string | null;
  processing_completed_at?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

export interface MatchBatchUpdate {
  id?: string;
  batch_date?: string;
  total_eligible_users?: number;
  total_groups_created?: number;
  total_users_matched?: number;
  algorithm_version?: string;
  processing_started_at?: string | null;
  processing_completed_at?: string | null;
  created_at?: string;
  deleted_at?: string | null;
}

export interface MatchHistory {
  id: string;
  matched_at: string;
  week_start: string | null;
  profile1_id: string | null;
  profile2_id: string | null;
}

export interface MatchHistoryInsert {
  id?: string;
  matched_at?: string;
  week_start?: string | null;
  profile1_id?: string | null;
  profile2_id?: string | null;
}

export interface MatchHistoryUpdate {
  id?: string;
  matched_at?: string;
  week_start?: string | null;
  profile1_id?: string | null;
  profile2_id?: string | null;
}

export interface MatchingHistory {
  id: string;
  profile_id: string;
  matched_at: string | null;
  week_number: number;
  year_number: number;
  match_group_id: string | null;
  created_at: string | null;
}

export interface MatchingHistoryInsert {
  id?: string;
  profile_id: string;
  matched_at?: string | null;
  week_number: number;
  year_number: number;
  match_group_id?: string | null;
  created_at?: string | null;
}

export interface MatchingHistoryUpdate {
  id?: string;
  profile_id?: string;
  matched_at?: string | null;
  week_number?: number;
  year_number?: number;
  match_group_id?: string | null;
  created_at?: string | null;
}

// ==============================================
// CRON JOB TYPES
// ==============================================

export interface CronJobLog {
  id: string;
  job_name: string;
  status: CronJobStatusType;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  details: any | null;
  created_at: string | null;
}

export interface CronJobLogInsert {
  id?: string;
  job_name: string;
  status: CronJobStatusType;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  details?: any | null;
  created_at?: string | null;
}

export interface CronJobLogUpdate {
  id?: string;
  job_name?: string;
  status?: CronJobStatusType;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string | null;
  details?: any | null;
  created_at?: string | null;
}

// ==============================================
// UTILITY TYPES
// ==============================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Helper types for common operations
export type TableName = keyof Database['public']['Tables'];
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// ==============================================
// FORM DATA TYPES
// ==============================================

export interface UserFormData {
  // Basic Info
  firstName: string;
  lastName: string;
  age: string;
  gender: GenderType;
  genderPreference: GenderPreferenceType;
  city: string;
  nationality: string;
  
  // Medical Background
  medicalSpecialty: string;
  specialties: string[];
  careerStage: CareerStageType;
  institutions: InstitutionData[];
  
  // Sports & Activities
  sports: string[];
  activities: string[];
  
  // Preferences
  meetingFrequency: MeetingFrequencyType;
  activityLevel: ActivityLevelType;
  socialEnergy: SocialEnergyType;
  conversationStyle: ConversationStyleType;
  lifeStage: LifeStageType;
  
  // Bio & Looking For
  bio: string;
  lookingFor: string;
  
  // Verification
  idDocument?: globalThis.File;
  medicalLicense?: globalThis.File;
  selfie?: globalThis.File;
}

export interface InstitutionData {
  id: string;
  name: string;
  type: string;
  location: string;
  website?: string;
  description?: string;
}