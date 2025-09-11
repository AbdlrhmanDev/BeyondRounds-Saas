// Core application types
export interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  specialty: string
  city: string
  is_verified: boolean
  is_paid: boolean
  gender?: string
  interests?: string[]
  bio?: string
  profile_image_url?: string
  created_at?: string
  updated_at?: string
  profile_completion_percentage?: number
}

export interface Match {
  id: string
  group_name: string
  status: 'active' | 'inactive' | 'completed'
  match_week: string
  created_at: string
  updated_at?: string
  match_members: MatchMember[]
  chat_messages: ChatMessage[]
}

export interface MatchMember {
  user_id: string
  joined_at: string
  profiles: UserProfile
}

export interface ChatMessage {
  id?: string
  content: string
  created_at: string
  message_type: 'text' | 'system' | 'image' | 'file'
  user_id?: string
  sender_name?: string
}

export interface AvailableGroup {
  id: string
  group_name: string
  member_count: number
  cities: string[]
  specialties: string[]
  created_at: string
  can_join: boolean
  max_members?: number
}

export interface Notification {
  id: number
  type: 'match' | 'message' | 'system' | 'profile' | 'payment'
  message: string
  time: string
  unread: boolean
  action_url?: string
  metadata?: Record<string, any>
}

export interface DashboardStats {
  totalMatches: number
  thisWeekMatches: number
  activeChats: number
  completionRate: number
}

// Component prop types
export interface LoadingSpinnerProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export interface ErrorMessageProps {
  message: string
  className?: string
}

export interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export interface DashboardHeaderProps {
  profile: UserProfile | null
  searchTerm: string
  onSearchChange: (value: string) => void
  notifications: Notification[]
  onSignOut: () => void
}

export interface WelcomeSectionProps {
  profile: UserProfile | null
  stats: DashboardStats
}

export interface StatsGridProps {
  profile: UserProfile | null
  stats: DashboardStats
}

export interface MatchCardProps {
  match: Match
  getInitials: (firstName: string, lastName: string) => string
  getLastMessage: (match: Match) => string
  getLastMessageTime: (match: Match) => string
  onViewDetails?: (matchId: string) => void
}

export interface HeroSectionProps {
  user: any // Supabase User type
}

export interface HowItWorksStepProps {
  stepNumber: number
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
  gradientFrom: string
  gradientTo: string
}

export interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  gradientFrom: string
  gradientTo: string
}

export interface TestimonialCardProps {
  quote: string
  author: string
  role: string
  initials: string
  gradientFrom: string
  gradientTo: string
}

// Hook return types
export interface UseAuthReturn {
  user: any | null // Supabase User type
  profile: UserProfile | null
  loading: boolean
  error: string | null
  signOut: () => Promise<void>
  isProfileComplete: boolean
}

export interface UseDashboardReturn {
  matches: Match[]
  availableGroups: AvailableGroup[]
  notifications: Notification[]
  isJoining: string | null
  loading: boolean
  isLoading: boolean
  error: string | null
  profile: UserProfile | null
  stats: DashboardStats
  joinGroup: (groupId: string) => Promise<void>
  markNotificationAsRead: (id: number) => void
  getWeeklyStats: () => DashboardStats
  getLastMessage: (match: Match) => string
  getLastMessageTime: (match: Match) => string
  getInitials: (firstName: string, lastName: string) => string
  loadDashboardData: () => Promise<void>
  refreshData: () => Promise<void>
}

export interface UseLandingAuthReturn {
  user: any | null // Supabase User type
  loading: boolean
}

// API response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

export interface SupabaseError {
  message: string
  details?: string
  hint?: string
  code?: string
}

// Form types
export interface ProfileFormData {
  first_name: string
  last_name: string
  specialty: string
  city: string
  bio?: string
  interests?: string[]
}

export interface VerificationFormData {
  medical_license: File | null
  photo_id: File | null
  additional_documents?: File[]
}

// Utility types
export type TabValue = 'overview' | 'groups' | 'available' | 'activity' | 'notifications'

export type MatchStatus = 'active' | 'inactive' | 'completed'

export type NotificationType = 'match' | 'message' | 'system' | 'profile' | 'payment'

export type MessageType = 'text' | 'system' | 'image' | 'file'

// Theme and styling types
export interface GradientConfig {
  from: string
  to: string
}

export interface AnimationConfig {
  duration: number
  delay?: number
  easing?: string
}
