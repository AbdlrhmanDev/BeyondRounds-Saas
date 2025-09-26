'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heart, Calendar, Home } from 'lucide-react'

const schema = z.object({
  lifeStage: z.enum([
    'single',
    'dating',
    'married',
    'parent_young',
    'parent_older',
    'empty_nester',
    'prefer-not-to-say'
  ]).optional(),
  idealWeekend: z.enum([
    'adventure_exploration',
    'relaxation_self_care',
    'social_activities',
    'cultural_activities',
    'sports_fitness',
    'home_projects_hobbies',
    'mix_active_relaxing'
  ]).optional(),
})

type FormData = z.infer<typeof schema>

interface LifestyleGoalsStepProps {
  data: Record<string, unknown>
  onNext: (data: FormData) => void
  onPrevious: () => void
}

const LIFE_STAGE_OPTIONS = [
  { value: 'single', label: 'Single, no children' },
  { value: 'dating', label: 'In a relationship, no children' },
  { value: 'married', label: 'Married, no children' },
  { value: 'parent_young', label: 'Have young children (under 12)' },
  { value: 'parent_older', label: 'Have older children (12+)' },
  { value: 'empty_nester', label: 'Empty nester' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
]

const IDEAL_WEEKEND_OPTIONS = [
  { value: 'adventure_exploration', label: 'Adventure and exploration', description: 'Hiking, travel, trying new experiences' },
  { value: 'relaxation_self_care', label: 'Relaxation and self-care', description: 'Spa days, meditation, quiet time' },
  { value: 'social_activities', label: 'Social activities', description: 'Parties, gatherings, meeting people' },
  { value: 'cultural_activities', label: 'Cultural activities', description: 'Museums, theater, art exhibitions' },
  { value: 'sports_fitness', label: 'Sports and fitness', description: 'Gym, sports, outdoor activities' },
  { value: 'home_projects_hobbies', label: 'Home projects and hobbies', description: 'Crafts, gardening, home improvement' },
  { value: 'mix_active_relaxing', label: 'Mix of active and relaxing', description: 'Balance of various activities' },
]

export default function LifestyleGoalsStep({ data, onNext, onPrevious }: LifestyleGoalsStepProps) {
  const {
    handleSubmit,
    formState: { isValid = true },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      lifeStage: (data.lifeStage as 'single' | 'dating' | 'married' | 'parent_young' | 'parent_older' | 'empty_nester' | 'prefer-not-to-say') || undefined,
      idealWeekend: (data.idealWeekend as 'adventure_exploration' | 'relaxation_self_care' | 'social_activities' | 'cultural_activities' | 'sports_fitness' | 'home_projects_hobbies' | 'mix_active_relaxing') || undefined,
    },
    mode: 'onBlur',
  })

  const watchedLifeStage = watch('lifeStage')
  const watchedIdealWeekend = watch('idealWeekend')

  const onSubmit = (formData: FormData) => {
    onNext(formData)
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">Lifestyle Goals</h3>
        <p className="text-sm text-gray-600 mt-2">
          Tell us about your lifestyle preferences to help us find better matches
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Life Stage */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="w-5 h-5" />
            Life Stage
          </CardTitle>
          <p className="text-sm text-gray-600">
            This helps us understand your current life situation for better matching
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <RadioGroup
              value={watchedLifeStage}
              onValueChange={(value) => setValue('lifeStage', value as 'single' | 'dating' | 'married' | 'parent_young' | 'parent_older' | 'empty_nester' | 'prefer-not-to-say')}
              className="space-y-3"
            >
              {LIFE_STAGE_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* Ideal Weekend */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5" />
            Ideal Weekend
          </CardTitle>
          <p className="text-sm text-gray-600">
            How do you prefer to spend your free time?
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <RadioGroup
              value={watchedIdealWeekend}
              onValueChange={(value) => setValue('idealWeekend', value as 'adventure_exploration' | 'relaxation_self_care' | 'social_activities' | 'cultural_activities' | 'sports_fitness' | 'home_projects_hobbies' | 'mix_active_relaxing')}
              className="space-y-4"
            >
              {IDEAL_WEEKEND_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-start space-x-3">
                  <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
                  <div className="space-y-1">
                    <Label htmlFor={option.value} className="cursor-pointer font-medium">
                      {option.label}
                    </Label>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      {/* What This Means */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
            <Home className="w-5 h-5" />
            What This Means for Your Matches
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-700">
          <ul className="space-y-2">
            <li>• We'll prioritize matching you with people in similar life stages when possible</li>
            <li>• Your weekend preferences help us suggest compatible activity partners</li>
            <li>• These preferences factor into our compatibility algorithm</li>
            <li>• You can always update these settings later in your profile</li>
          </ul>
        </CardContent>
      </Card>

      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Privacy Note:</strong> Your life stage information is used only for matching purposes
          and won't be displayed to other users unless you choose to share it in your bio.
        </p>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="submit" disabled={!isValid}>
          Continue
        </Button>
      </div>
    </form>
    </div>
  )
}