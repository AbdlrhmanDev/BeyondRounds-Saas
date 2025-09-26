'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { X, Users, Activity, MessageCircle, Utensils } from 'lucide-react'

const schema = z.object({
  genderPreference: z.enum(['no_preference', 'mixed', 'same_gender_only', 'same_gender_preferred']),
  specialtyPreference: z.enum(['same', 'different', 'no_preference']),
  meetingFrequency: z.enum(['weekly', 'bi_weekly', 'monthly', 'flexible']).optional(),
  meetingActivities: z.array(z.string()).optional(),
  activityLevel: z.enum(['very_active', 'active', 'moderately_active', 'occasionally_active', 'non_physical']).optional(),
  socialEnergyLevel: z.enum(['very_high', 'high', 'moderate', 'low']).optional(),
  conversationStyle: z.enum(['deep_philosophical', 'light_casual', 'hobby_focused', 'professional_focused', 'mixed']).optional(),
  dietaryPreferences: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface PreferencesStepProps {
  data: Record<string, unknown>
  onNext: (data: FormData) => void
  onPrevious: () => void
}

const MEETING_ACTIVITIES = [
  'Coffee/Tea meetups',
  'Lunch/Dinner',
  'Sports activities',
  'Study sessions',
  'Research collaboration',
  'Hiking/Walking',
  'Museum visits',
  'Gym workouts',
  'Professional conferences',
  'Book clubs',
  'Movie nights',
  'Board games',
  'Volunteer work',
  'Art/Cultural events',
  'Networking events',
]

const DIETARY_PREFERENCES = [
  'No restrictions',
  'Vegetarian',
  'Vegan',
  'Halal',
  'Kosher',
  'Gluten-free',
  'Lactose intolerant',
  'Nut allergies',
  'Other dietary restrictions',
]

export default function PreferencesStep({ data, onNext, onPrevious }: PreferencesStepProps) {
  const [meetingActivities, setMeetingActivities] = useState<string[]>(
    (data.meetingActivities as string[]) || []
  )

  const {
    handleSubmit,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      genderPreference: (data.genderPreference as 'no_preference' | 'mixed' | 'same_gender_only' | 'same_gender_preferred') || 'no_preference',
      specialtyPreference: (data.specialtyPreference as 'same' | 'different' | 'no_preference') || 'no_preference',
      meetingFrequency: (data.meetingFrequency as 'weekly' | 'bi_weekly' | 'monthly' | 'flexible') || undefined,
      meetingActivities: (data.meetingActivities as string[]) || [],
      activityLevel: (data.activityLevel as 'very_active' | 'active' | 'moderately_active' | 'occasionally_active' | 'non_physical') || undefined,
      socialEnergyLevel: (data.socialEnergyLevel as 'very_high' | 'high' | 'moderate' | 'low') || undefined,
      conversationStyle: (data.conversationStyle as 'deep_philosophical' | 'light_casual' | 'hobby_focused' | 'professional_focused' | 'mixed') || undefined,
      dietaryPreferences: (data.dietaryPreferences as string) || '',
    },
    mode: 'onBlur',
  })

  const watchedGenderPreference = watch('genderPreference')
  const watchedSpecialtyPreference = watch('specialtyPreference')
  const watchedMeetingFrequency = watch('meetingFrequency')
  const watchedActivityLevel = watch('activityLevel')
  const watchedSocialEnergyLevel = watch('socialEnergyLevel')
  const watchedConversationStyle = watch('conversationStyle')
  const watchedDietaryPreferences = watch('dietaryPreferences')

  const handleActivityToggle = (activity: string) => {
    const updated = meetingActivities.includes(activity)
      ? meetingActivities.filter(a => a !== activity)
      : [...meetingActivities, activity]

    setMeetingActivities(updated)
    setValue('meetingActivities', updated)
  }

  const onSubmit = (formData: FormData) => {
    onNext({
      ...formData,
      meetingActivities,
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Gender Preference */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" />
            Group Composition Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Gender preference for group meetups *</Label>
            <RadioGroup
              value={watchedGenderPreference}
              onValueChange={(value) => setValue('genderPreference', value as 'no_preference' | 'mixed' | 'same_gender_only' | 'same_gender_preferred')}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no_preference" id="no_preference" />
                <Label htmlFor="no_preference">No preference</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="mixed" />
                <Label htmlFor="mixed">Mixed gender groups preferred</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="same_gender_preferred" id="same_gender_preferred" />
                <Label htmlFor="same_gender_preferred">Same gender preferred (but mixed okay)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="same_gender_only" id="same_gender_only" />
                <Label htmlFor="same_gender_only">Same gender only</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>Medical specialty preference *</Label>
            <RadioGroup
              value={watchedSpecialtyPreference}
              onValueChange={(value) => setValue('specialtyPreference', value as 'same' | 'different' | 'no_preference')}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no_preference" id="spec-no_preference" />
                <Label htmlFor="spec-no_preference">No preference</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="same" id="same-specialty" />
                <Label htmlFor="same-specialty">Same specialty preferred</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="different" id="different-specialties" />
                <Label htmlFor="different-specialties">Different specialties preferred</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Meeting Preferences */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5" />
            Meeting Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="meetingFrequency">Preferred meeting frequency</Label>
            <Select value={watchedMeetingFrequency} onValueChange={(value) => setValue('meetingFrequency', value as 'weekly' | 'bi_weekly' | 'monthly' | 'flexible')}>
              <SelectTrigger>
                <SelectValue placeholder="How often would you like to meet?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="flexible">As schedules allow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Preferred meeting activities</Label>
            <p className="text-sm text-gray-600">
              Select all activities you'd enjoy doing with your matches
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {MEETING_ACTIVITIES.map((activity) => (
                <div key={activity} className="flex items-center space-x-2">
                  <Checkbox
                    id={`activity-${activity}`}
                    checked={meetingActivities.includes(activity)}
                    onCheckedChange={() => handleActivityToggle(activity)}
                  />
                  <Label htmlFor={`activity-${activity}`} className="text-sm cursor-pointer">
                    {activity}
                  </Label>
                </div>
              ))}
            </div>
            {meetingActivities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {meetingActivities.map((activity) => (
                  <Badge key={activity} variant="outline" className="flex items-center gap-1">
                    {activity}
                    <X
                      className="w-3 h-3 cursor-pointer"
                      onClick={() => handleActivityToggle(activity)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Style */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5" />
            Social Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="activityLevel">Activity level</Label>
            <Select value={watchedActivityLevel} onValueChange={(value) => setValue('activityLevel', value as 'very_active' | 'active' | 'moderately_active' | 'occasionally_active' | 'non_physical')}>
              <SelectTrigger>
                <SelectValue placeholder="How active are you?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very_active">Very active (daily exercise/sports)</SelectItem>
                <SelectItem value="active">Active (regular exercise)</SelectItem>
                <SelectItem value="moderately_active">Moderately active (some exercise)</SelectItem>
                <SelectItem value="occasionally_active">Occasionally active</SelectItem>
                <SelectItem value="non_physical">Prefer non-physical activities</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialEnergyLevel">Social energy level</Label>
            <Select value={watchedSocialEnergyLevel} onValueChange={(value) => setValue('socialEnergyLevel', value as 'very_high' | 'high' | 'moderate' | 'low')}>
              <SelectTrigger>
                <SelectValue placeholder="What's your social style?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="very_high">High energy, love big groups</SelectItem>
                <SelectItem value="high">Moderate energy, prefer small groups</SelectItem>
                <SelectItem value="moderate">Low-key, intimate conversations</SelectItem>
                <SelectItem value="low">Varies by mood</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="conversationStyle">Conversation style</Label>
            <Select value={watchedConversationStyle} onValueChange={(value) => setValue('conversationStyle', value as 'deep_philosophical' | 'light_casual' | 'hobby_focused' | 'professional_focused' | 'mixed')}>
              <SelectTrigger>
                <SelectValue placeholder="What conversation style do you prefer?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="deep_philosophical">Deep, meaningful conversations</SelectItem>
                <SelectItem value="light_casual">Light, fun, and casual</SelectItem>
                <SelectItem value="hobby_focused">Hobby and interest focused</SelectItem>
                <SelectItem value="professional_focused">Professional and career focused</SelectItem>
                <SelectItem value="mixed">Mix of everything</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dietary Preferences */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Utensils className="w-5 h-5" />
            Dietary Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="dietaryPreferences">Dietary restrictions or preferences</Label>
            <Select value={watchedDietaryPreferences} onValueChange={(value) => setValue('dietaryPreferences', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select any dietary preferences" />
              </SelectTrigger>
              <SelectContent>
                {DIETARY_PREFERENCES.map((pref) => (
                  <SelectItem key={pref} value={pref}>
                    {pref}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="submit">
          Continue
        </Button>
      </div>
    </form>
  )
}