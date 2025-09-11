// Comprehensive profile types for BeyondRounds matching system

export interface UserProfile {
  // Basic Information
  id: string
  email: string
  first_name: string
  last_name: string
  age?: number
  nationality?: string

  // Gender & Preferences
  gender: 'male' | 'female' | 'non-binary' | 'prefer-not-to-say'
  gender_preference: 'no-preference' | 'mixed' | 'same-gender-only' | 'same-gender-preferred'

  // Location
  city: string

  // Medical Background
  specialty: string // Legacy field, kept for compatibility
  medical_specialty: string[] // New multi-select field
  specialty_preference: 'same' | 'different' | 'no-preference'
  career_stage: CareerStage

  // Sports & Physical Activities
  sports_activities: Record<string, number> // Sport name -> interest rating (1-5)
  activity_level: ActivityLevel

  // Entertainment & Culture
  music_preferences: string[]
  movie_tv_preferences: string[]
  other_interests: string[]

  // Social Preferences
  preferred_activities: string[] // Ranked meeting activities
  social_energy_level: SocialEnergyLevel
  conversation_style: ConversationStyle

  // Availability & Logistics
  availability_slots: string[]
  meeting_frequency: MeetingFrequency

  // Lifestyle & Values
  dietary_restrictions: string[]
  life_stage: LifeStage
  looking_for: string[] // What they're seeking
  ideal_weekend: IdealWeekend

  // System Fields
  interests: string[] // Legacy field, kept for compatibility
  is_verified: boolean
  is_paid: boolean
  role: 'user' | 'admin'
  stripe_customer_id?: string
  profile_completion_percentage: number
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

// Enums and Types
export type CareerStage = 
  | 'medical-student'
  | 'resident-1-2'
  | 'resident-3plus'
  | 'fellow'
  | 'attending-0-5'
  | 'attending-5plus'
  | 'private-practice'
  | 'academic-medicine'
  | 'other'

export type ActivityLevel = 
  | 'very-active'
  | 'active'
  | 'moderately-active'
  | 'occasionally-active'
  | 'prefer-non-physical'

export type SocialEnergyLevel = 
  | 'high-energy-big-groups'
  | 'moderate-energy-small-groups'
  | 'low-key-intimate'
  | 'varies-by-mood'

export type ConversationStyle = 
  | 'deep-meaningful'
  | 'light-fun-casual'
  | 'hobby-focused'
  | 'professional-career'
  | 'mix-everything'

export type MeetingFrequency = 
  | 'weekly'
  | 'bi-weekly'
  | 'monthly'
  | 'as-schedules-allow'

export type LifeStage = 
  | 'single-no-kids'
  | 'relationship-no-kids'
  | 'married-no-kids'
  | 'young-children'
  | 'older-children'
  | 'empty-nester'
  | 'prefer-not-say'

export type IdealWeekend = 
  | 'adventure-exploration'
  | 'relaxation-self-care'
  | 'social-activities'
  | 'cultural-activities'
  | 'sports-fitness'
  | 'home-projects-hobbies'
  | 'mix-active-relaxing'

// Profile Form Data Interface
export interface ProfileFormData {
  // Basic Information
  firstName: string
  lastName: string
  age?: number
  nationality?: string
  phoneNumber?: string

  // Gender & Preferences
  gender: string
  genderPreference: string

  // Location
  city: string

  // Medical Background
  medicalSpecialty: string[]
  specialtyPreference: string
  careerStage: string

  // Sports & Activities
  sportsActivities: Record<string, number>
  activityLevel: string

  // Entertainment & Culture
  musicPreferences: string[]
  movieTvPreferences: string[]
  otherInterests: string[]

  // Social Preferences
  preferredActivities: string[]
  socialEnergyLevel: string
  conversationStyle: string

  // Availability & Logistics
  availabilitySlots: string[]
  meetingFrequency: string

  // Lifestyle & Values
  dietaryRestrictions: string[]
  lifeStage: string
  lookingFor: string[]
  idealWeekend: string

  // Legacy fields
  specialty: string
  interests: string[]
  bio?: string
}

// Matching Algorithm Types
export interface MatchScore {
  userId1: string
  userId2: string
  score: number
  breakdown: {
    medicalSpecialty: number
    interests: number
    socialPreferences: number
    availability: number
    geographic: number
    lifestyle: number
  }
}

export interface MatchGroup {
  members: UserProfile[]
  averageScore: number
  groupId: string
}

// Compatibility Score Display
export interface CompatibilityScore {
  percentage: number
  description: string
  level: 'excellent' | 'great' | 'good' | 'decent' | 'moderate'
}

// Constants for form options
export const MEDICAL_SPECIALTIES = [
  'General Practice/Family Medicine',
  'Internal Medicine',
  'Surgery (General)',
  'Pediatrics',
  'Cardiology',
  'Neurology',
  'Psychiatry',
  'Emergency Medicine',
  'Anesthesiology',
  'Radiology',
  'Pathology',
  'Dermatology',
  'Ophthalmology',
  'Orthopedics',
  'Gynecology',
  'Urology',
  'Oncology',
  'Medical Student',
  'Resident',
  'Fellow',
  'Other'
] as const

export const SPORTS_ACTIVITIES = [
  'Running/Jogging',
  'Cycling',
  'Swimming',
  'Gym/Weight Training',
  'Tennis',
  'Football/Soccer',
  'Basketball',
  'Volleyball',
  'Rock Climbing/Bouldering',
  'Hiking',
  'Yoga',
  'Pilates',
  'Martial Arts',
  'Golf',
  'Skiing/Snowboarding',
  'Dancing',
  'Team Sports (general)',
  'Water Sports',
  'Other'
] as const

export const MUSIC_PREFERENCES = [
  'Pop',
  'Rock',
  'Hip-Hop/Rap',
  'Electronic/EDM',
  'Classical',
  'Jazz',
  'Country',
  'R&B/Soul',
  'Indie/Alternative',
  'Folk',
  'Reggae',
  'Latin',
  'World Music',
  'Metal',
  'Blues',
  'Other'
] as const

export const MOVIE_TV_PREFERENCES = [
  'Action/Adventure',
  'Comedy',
  'Drama',
  'Horror/Thriller',
  'Sci-Fi/Fantasy',
  'Documentaries',
  'Romance',
  'Crime/Mystery',
  'Historical',
  'Animated',
  'Foreign Films',
  'TV Series Binge-watcher',
  'Netflix originals',
  'Other'
] as const

export const OTHER_INTERESTS = [
  'Reading',
  'Cooking/Baking',
  'Photography',
  'Travel',
  'Art/Museums',
  'Board Games',
  'Video Games',
  'Podcasts',
  'Wine/Beer Tasting',
  'Coffee Culture',
  'Gardening',
  'DIY/Crafts',
  'Volunteering',
  'Technology/Gadgets',
  'Fashion',
  'Other'
] as const

export const PREFERRED_ACTIVITIES = [
  'Coffee/Café meetups',
  'Dinner at restaurants',
  'Casual drinks/bar',
  'Outdoor activities/walks',
  'Sports activities',
  'Movie/theater outings',
  'Museums/cultural events',
  'House parties/home gatherings',
  'Concerts/live music',
  'Fitness activities together',
  'Weekend trips/day trips',
  'Game nights',
  'Other'
] as const

export const LOOKING_FOR_OPTIONS = [
  'Casual friendships (grab a coffee, hang out, chill)',
  'Close friendships (deeper, long-term connection)',
  'Activity partners (sports, gym, hobbies, events)',
  'A social group to belong to (regular circle of doctors)',
  'Professional peer connections (sharing knowledge, same specialty or hospital)',
  'Mentorship (giving or receiving guidance)',
  'Entrepreneurial connections (doctors building projects/businesses together)',
  'Networking & opportunities (expanding your doctor circle globally)',
  'Study / learning partners (for exams, courses, or medical education)',
  'Travel buddies (short trips, conferences, or holidays)'
] as const

export const AVAILABILITY_SLOTS = [
  'Friday evening',
  'Saturday morning',
  'Saturday afternoon',
  'Saturday evening',
  'Sunday morning',
  'Sunday afternoon',
  'Sunday evening',
  'Weekday evenings (if available)'
] as const

export const DIETARY_RESTRICTIONS = [
  'No restrictions',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-free',
  'Other allergies/restrictions'
] as const

// Helper functions
export function getCompatibilityDescription(percentage: number): CompatibilityScore {
  if (percentage >= 90) {
    return { percentage, description: "Excellent Match! You have tons in common", level: 'excellent' }
  } else if (percentage >= 80) {
    return { percentage, description: "Great Match! Strong compatibility", level: 'great' }
  } else if (percentage >= 70) {
    return { percentage, description: "Good Match! Several shared interests", level: 'good' }
  } else if (percentage >= 60) {
    return { percentage, description: "Decent Match! Some common ground", level: 'decent' }
  } else {
    return { percentage, description: "Moderate Match! Room to explore differences", level: 'moderate' }
  }
}
