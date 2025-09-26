import { Database } from '@/lib/types/database'

type User = Database['public']['Tables']['users']['Row']

export function calculateProfileCompletion(user: User): number {
  let score = 0
  
  // Basic Information (25 points total)
  if (user.first_name?.trim()) score += 8
  if (user.age) score += 3
  if (user.city?.trim()) score += 8
  if (user.nationality?.trim()) score += 2
  if (user.gender) score += 2
  if (user.gender_preference) score += 2

  // Medical Background (20 points total)
  if (user.specialties && user.specialties.length > 0) score += 10
  if (user.specialty_preference) score += 3
  if (user.career_stage) score += 7

  // Sports & Physical Activities (15 points total)
  if (user.sports_activities && Object.keys(user.sports_activities).length > 0) score += 8
  if (user.activity_level) score += 7

  // Entertainment & Culture (15 points total)
  if (user.music?.trim()) score += 5
  if (user.movies?.trim()) score += 5
  if (user.other_interests?.trim()) score += 5

  // Social Preferences (15 points total)
  if (user.meeting_activities && user.meeting_activities.length > 0) score += 8
  if (user.social_energy_level) score += 3
  if (user.conversation_style) score += 4

  // Availability & Logistics (10 points total)
  if (user.preferred_times?.trim()) score += 5
  if (user.meeting_frequency) score += 5

  // Lifestyle & Values (10 points total)
  if (user.dietary_preferences) score += 3
  if (user.life_stage) score += 3
  if (user.looking_for?.trim()) score += 4

  // Personality & Fun (5 points total)
  if (user.ideal_weekend) score += 5

  return Math.min(score, 100)
}

export function getProfileCompletionStatus(percentage: number): {
  status: 'incomplete' | 'partial' | 'complete'
  color: 'red' | 'yellow' | 'green'
  message: string
} {
  if (percentage < 30) {
    return {
      status: 'incomplete',
      color: 'red',
      message: 'Complete your basic information to start matching'
    }
  } else if (percentage < 70) {
    return {
      status: 'partial',
      color: 'yellow',
      message: 'Great progress! Complete more sections to improve matching compatibility'
    }
  } else if (percentage < 90) {
    return {
      status: 'partial',
      color: 'yellow',
      message: 'Almost there! Add a few more details to unlock premium features'
    }
  } else {
    return {
      status: 'complete',
      color: 'green',
      message: 'User complete! You\'re ready for optimal matching'
    }
  }
}

export function getMissingProfileSections(user: User): string[] {
  const missingSections: string[] = []
  
  // Basic Information
  if (!user.first_name?.trim()) missingSections.push('Full Name')
  if (!user.city?.trim()) missingSections.push('City of Residence')
  if (!user.gender) missingSections.push('Gender')
  if (!user.gender_preference) missingSections.push('Gender Preference')
  
  // Medical Background
  if (!user.specialties || user.specialties.length === 0) missingSections.push('Medical Specialties')
  if (!user.specialty_preference) missingSections.push('Specialty Preference')
  if (!user.career_stage) missingSections.push('Career Stage')
  
  // Sports & Physical Activities
  if (!user.sports_activities || Object.keys(user.sports_activities).length === 0) missingSections.push('Sports & Activities')
  if (!user.activity_level) missingSections.push('Activity Level')
  
  // Entertainment & Culture
  if (!user.music?.trim()) missingSections.push('Music Preferences')
  if (!user.movies?.trim()) missingSections.push('Movies & TV Shows')
  if (!user.other_interests?.trim()) missingSections.push('Other Interests')
  
  // Social Preferences
  if (!user.meeting_activities || user.meeting_activities.length === 0) missingSections.push('Meeting Activities')
  if (!user.social_energy_level) missingSections.push('Social Energy Level')
  if (!user.conversation_style) missingSections.push('Conversation Style')
  
  // Availability & Logistics
  if (!user.preferred_times?.trim()) missingSections.push('Preferred Meeting Times')
  if (!user.meeting_frequency) missingSections.push('Meeting Frequency')
  
  // Lifestyle & Values
  if (!user.dietary_preferences) missingSections.push('Dietary Preferences')
  if (!user.life_stage) missingSections.push('Life Stage')
  if (!user.looking_for?.trim()) missingSections.push('What You\'re Looking For')
  
  // Personality & Fun
  if (!user.ideal_weekend) missingSections.push('Ideal Weekend')
  
  return missingSections
}
