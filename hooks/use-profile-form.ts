import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ProfileFormData, UserProfile } from '@/lib/types/profile'

export interface UseProfileFormReturn {
  isLoading: boolean
  error: string | null
  saveProfile: (formData: ProfileFormData) => Promise<void>
  convertProfileToFormData: (profile: UserProfile) => Partial<ProfileFormData>
}

export function useProfileForm(userId: string | null): UseProfileFormReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const saveProfile = useCallback(async (formData: ProfileFormData) => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    setIsLoading(true)
    setError(null)

    try {
      // Transform form data to profile update format
      const profileUpdate = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        age: formData.age,
        nationality: formData.nationality,
        gender: formData.gender,
        gender_preference: formData.genderPreference,
        city: formData.city,
        specialty: formData.specialty || formData.medicalSpecialty[0] || '',
        medical_specialty: formData.medicalSpecialty,
        specialty_preference: formData.specialtyPreference,
        career_stage: formData.careerStage,
        sports_activities: formData.sportsActivities,
        activity_level: formData.activityLevel,
        music_preferences: formData.musicPreferences,
        movie_tv_preferences: formData.movieTvPreferences,
        other_interests: formData.otherInterests,
        preferred_activities: formData.preferredActivities,
        social_energy_level: formData.socialEnergyLevel,
        conversation_style: formData.conversationStyle,
        availability_slots: formData.availabilitySlots,
        meeting_frequency: formData.meetingFrequency,
        dietary_restrictions: formData.dietaryRestrictions,
        life_stage: formData.lifeStage,
        looking_for: formData.lookingFor,
        ideal_weekend: formData.idealWeekend,
        interests: formData.interests,
        updated_at: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', userId)

      if (updateError) {
        throw new Error(`Failed to update profile: ${updateError.message}`)
      }

      toast.success('Profile updated successfully!')
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
      setError(errorMessage)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  const convertProfileToFormData = useCallback((profile: UserProfile): Partial<ProfileFormData> => {
    return {
      firstName: profile.first_name,
      lastName: profile.last_name,
      age: profile.age,
      nationality: profile.nationality,
      gender: profile.gender,
      genderPreference: profile.gender_preference,
      city: profile.city,
      specialty: profile.specialty,
      medicalSpecialty: profile.medical_specialty || [],
      specialtyPreference: profile.specialty_preference,
      careerStage: profile.career_stage,
      sportsActivities: profile.sports_activities || {},
      activityLevel: profile.activity_level,
      musicPreferences: profile.music_preferences || [],
      movieTvPreferences: profile.movie_tv_preferences || [],
      otherInterests: profile.other_interests || [],
      preferredActivities: profile.preferred_activities || [],
      socialEnergyLevel: profile.social_energy_level,
      conversationStyle: profile.conversation_style,
      availabilitySlots: profile.availability_slots || [],
      meetingFrequency: profile.meeting_frequency,
      dietaryRestrictions: profile.dietary_restrictions || [],
      lifeStage: profile.life_stage,
      lookingFor: profile.looking_for || [],
      idealWeekend: profile.ideal_weekend,
      interests: profile.interests || []
    }
  }, [])

  return {
    isLoading,
    error,
    saveProfile,
    convertProfileToFormData
  }
}
