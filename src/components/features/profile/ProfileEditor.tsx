'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2,
  AlertCircle,
  Edit3
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

// Import existing form components
import ProfileForm from '@/components/organisms/ProfileForm'
import { type UserFormData, type GenderType } from '@/lib/types/database'

interface userData {
  // Basic Info
  first_name: string
  last_name: string
  age: number | null
  gender: string | null
  city: string
  nationality: string | null
  bio?: string | null

  // Professional Info
  medical_specialty?: string
  specialties?: string[]
  career_stage?: string | null
  looking_for?: string[] | null

  // Interests
  sports_activities?: Record<string, number>
  music_genres?: string[]
  movie_genres?: string[]
  other_interests?: string[]

  // Preferences
  gender_preference?: string
  specialty_preference?: string
  meeting_frequency?: string
  activity_level?: string
  social_energy_level?: string
  conversation_style?: string
  life_stage?: string
  ideal_weekend?: string
}

interface ProfileEditorProps {
  onProfileUpdate?: (user: userData) => void
  showCompletionPrompts?: boolean
}

export default function ProfileEditor({
  onProfileUpdate,
  showCompletionPrompts = true
}: ProfileEditorProps) {
  const { user, profile, refreshProfile } = useAuthUser()
  // const [activeTab, setActiveTab] = useState('basic') // Unused
  const [userData, setProfileData] = useState<Partial<UserFormData>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const supabase = createClient()

  // Load profile data
  useEffect(() => {
    if (!user || !profile) return

    const loadProfileData = async () => {
      try {
        setIsLoading(true)

        // Load main profile
        const mainProfile = {
          first_name: profile?.first_name || '',
          last_name: profile?.last_name || '',
          age: profile?.age?.toString() || '',
          gender: profile?.gender,
          city: profile?.city || '',
          nationality: profile?.nationality,
        }

        // Load professional data
        const { data: professionalData } = await supabase
          .from('profile_professional')
          .select('*')
          .eq('profile_id', user.id)
          .single()

        // Load interests data
        const { data: interestsData } = await supabase
          .from('profile_interests')
          .select('*')
          .eq('profile_id', user.id)
          .single()

        // Load preferences data
        const { data: preferencesData } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('profile_id', user.id)
          .single()

        const combinedData: Partial<UserFormData> = {
          firstName: mainProfile.first_name,
          lastName: mainProfile.last_name,
          age: mainProfile.age || undefined,
          gender: (mainProfile.gender as GenderType) || 'prefer-not-to-say',
          city: mainProfile.city,
          nationality: mainProfile.nationality || undefined,
          medicalSpecialty: professionalData?.medical_specialty,
          specialties: professionalData?.specialties || [],
          careerStage: professionalData?.career_stage,
          // musicGenres: interestsData?.music ? [interestsData.music] : [], // Not in UserFormData
          // movieGenres: interestsData?.movies ? [interestsData.movies] : [], // Not in UserFormData
          // otherInterests: interestsData?.other_interests ? [interestsData.other_interests] : [], // Not in UserFormData
          sports: interestsData?.sports_activities || [],
          genderPreference: preferencesData?.gender_preference,
          // specialtyPreference: preferencesData?.specialty_preference, // Not in UserFormData
          meetingFrequency: preferencesData?.meeting_frequency,
          activityLevel: preferencesData?.activity_level,
          socialEnergy: preferencesData?.social_energy_level,
          conversationStyle: preferencesData?.conversation_style,
          lifeStage: preferencesData?.life_stage,
          // idealWeekend: preferencesData?.ideal_weekend, // Not in UserFormData
          // meetingActivities: [], // Not in UserFormData
        }

        setProfileData(combinedData)

        // Calculate completion
        const completionData: Partial<userData> = {
          first_name: combinedData.firstName,
          last_name: combinedData.lastName,
          age: typeof combinedData.age === 'string' ? parseInt(combinedData.age) : combinedData.age,
          gender: combinedData.gender,
          city: combinedData.city,
          nationality: combinedData.nationality,
          medical_specialty: combinedData.medicalSpecialty,
          specialties: combinedData.specialties,
          career_stage: combinedData.careerStage,
          // music_genres: combinedData.musicGenres || [], // Not in UserFormData
          // movie_genres: combinedData.movieGenres || [], // Not in UserFormData
          // other_interests: combinedData.otherInterests || [], // Not in UserFormData
          sports_activities: combinedData.sports ? combinedData.sports.reduce((acc: Record<string, number>, sport: string) => ({ ...acc, [sport]: 1 }), {}) : {},
          gender_preference: combinedData.genderPreference,
          activity_level: combinedData.activityLevel,
          social_energy_level: combinedData.socialEnergy,
        }
        const completion = calculateProfileCompletion(completionData)
        setProfileCompletion(completion)

      } catch (error) {
        console.error('Error loading profile data:', error)
        toast.error('Failed to load profile data')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfileData()
  }, [user, profile])

  const calculateProfileCompletion = (data: Partial<userData>) => {
    const requiredFields = [
      'first_name', 'last_name', 'age', 'gender', 'city',
      'medical_specialty', 'career_stage', 'bio'
    ]

    const optionalFields = [
      'nationality', 'specialties', 'looking_for', 'sports_activities',
      'music_genres', 'other_interests', 'gender_preference',
      'activity_level', 'social_energy_level'
    ]

    let score = 0
    const maxScore = requiredFields.length * 10 + optionalFields.length * 5

    // Required fields (10 points each)
    requiredFields.forEach(field => {
      if (data[field as keyof userData]) {
        if (field === 'bio' && data.bio && data.bio.length > 20) {
          score += 10
        } else if (field !== 'bio') {
          score += 10
        }
      }
    })

    // Optional fields (5 points each)
    optionalFields.forEach(field => {
      const value = data[field as keyof userData]
      if (value) {
        if (Array.isArray(value) && value.length > 0) {
          score += 5
        } else if (typeof value === 'object' && Object.keys(value).length > 0) {
          score += 5
        } else if (typeof value === 'string' && value.length > 0) {
          score += 5
        }
      }
    })

    return Math.round((score / maxScore) * 100)
  }

  const handleSaveProfile = async (data: UserFormData) => {
    if (!user) return

    setIsSaving(true)
    try {
      // Update main profile
      const { error: profileError } = await supabase
        .from('users')
        .update({
          first_name: data.firstName,
          last_name: data.lastName,
          age: data.age,
          gender: data.gender,
          city: data.city,
          nationality: data.nationality,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (profileError) throw profileError

      // Update professional data
      if (data.medicalSpecialty || data.careerStage) {
        const { error: professionalError } = await supabase
          .from('profile_professional')
          .upsert({
            profile_id: user.id,
            medical_specialty: data.medicalSpecialty || '',
            specialties: data.specialties || [],
            career_stage: data.careerStage,
            updated_at: new Date().toISOString()
          }, { onConflict: 'profile_id' })

        if (professionalError) throw professionalError
      }

      // Update interests data
      const { error: interestsError } = await supabase
        .from('user_interests')
        .upsert({
          profile_id: user.id,
          music: null, // musicGenres not in UserFormData
          movies: null, // movieGenres not in UserFormData
          other_interests: null, // otherInterests not in UserFormData
          sports_activities: data.sports || [],
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id' })

      if (interestsError) throw interestsError

      // Update preferences data
      const { error: preferencesError } = await supabase
        .from('user_preferences')
        .upsert({
          profile_id: user.id,
          gender_preference: data.genderPreference || 'no_preference',
          specialty_preference: 'no-preference', // specialtyPreference not in UserFormData
          meeting_frequency: data.meetingFrequency,
          activity_level: data.activityLevel,
          social_energy_level: data.socialEnergy,
          conversation_style: data.conversationStyle,
          life_stage: data.lifeStage,
          ideal_weekend: null, // idealWeekend not in UserFormData
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id' })

      if (preferencesError) throw preferencesError

      // Update profile completion
      const profileDataForCompletion: Partial<userData> = {
        first_name: data.firstName,
        last_name: data.lastName,
        age: typeof data.age === 'string' ? parseInt(data.age) : data.age,
        gender: data.gender,
        city: data.city,
        nationality: data.nationality,
        medical_specialty: data.medicalSpecialty,
        specialties: data.specialties,
        career_stage: data.careerStage,
        // music_genres: data.musicGenres || [], // Not in UserFormData
        // movie_genres: data.movieGenres || [], // Not in UserFormData
        // other_interests: data.otherInterests || [], // Not in UserFormData
          sports_activities: data.sports ? data.sports.reduce((acc: Record<string, number>, sport: string) => ({ ...acc, [sport]: 1 }), {}) : {},
        gender_preference: data.genderPreference,
        activity_level: data.activityLevel,
        social_energy_level: data.socialEnergy,
      }
      
      const newCompletion = calculateProfileCompletion(profileDataForCompletion)
      const { error: completionError } = await supabase
        .from('users')
        .update({
          profile_completion_percentage: newCompletion,
          onboarding_completed: newCompletion >= 80
        })
        .eq('user_id', user.id)

      if (completionError) throw completionError

      setProfileData(data)
      setProfileCompletion(newCompletion)
      setHasUnsavedChanges(false)

      toast.success('User updated successfully!')

      // Refresh the auth context
      await refreshProfile()

      // Callback
      onProfileUpdate?.(data as unknown as userData)

    } catch (error) {
      console.error('Error updating user:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading user...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // const completionColor = profileCompletion >= 80 ? 'bg-green-500' :
  //                        profileCompletion >= 60 ? 'bg-yellow-500' : 'bg-red-500'

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* User Completion Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <Edit3 className="w-5 h-5 mr-2" />
                  Edit User
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Keep your information up to date for better matches
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {profileCompletion}%
                </div>
                <p className="text-sm text-gray-600">Complete</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>User completion</span>
                <span>
                  {profileCompletion < 80 ? 'Add more details for better matches' : 'User is complete!'}
                </span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Completion Prompts */}
      {showCompletionPrompts && profileCompletion < 80 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Boost your profile visibility!</strong> Profiles with more details get 3x better matches.
              Consider adding your bio, interests, and preferences.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Main User Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <ProfileForm
              initialData={userData}
              onSubmit={handleSaveProfile}
              isLoading={isSaving}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 z-50"
        >
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You have unsaved changes. Don't forget to save your profile!
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </div>
  )
}