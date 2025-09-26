'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, X } from 'lucide-react'

const MEDICAL_SPECIALTIES = [
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
  'Other (specify)',
]

const SPECIALTY_PREFERENCES = [
  'Same specialty preferred',
  'Different specialties preferred',
  'No preference',
  'General Practice/Family Medicine preferred',
  'Internal Medicine preferred',
  'Surgery specialties preferred',
  'Pediatrics preferred',
  'Psychiatry preferred',
  'Emergency Medicine preferred',
  'Radiology/Imaging preferred',
  'Medical students/residents preferred',
  'Senior consultants preferred',
  'Academic medicine preferred',
  'Private practice preferred',
  'Hospital-based preferred',
  'Community medicine preferred',
]

const CAREER_STAGES = [
  { value: 'medical_student', label: 'Medical Student' },
  { value: 'resident_1_2', label: 'Resident (1st-2nd year)' },
  { value: 'resident_3_plus', label: 'Resident (3rd+ year)' },
  { value: 'fellow', label: 'Fellow' },
  { value: 'attending_0_5', label: 'Attending/Consultant (0-5 years)' },
  { value: 'attending_5_plus', label: 'Attending/Consultant (5+ years)' },
  { value: 'private_practice', label: 'Private Practice' },
  { value: 'academic_medicine', label: 'Academic Medicine' },
  { value: 'other', label: 'Other' },
]

const schema = z.object({
  medicalSpecialty: z.string().min(1, 'Please select your primary specialty'),
  additionalSpecialties: z.array(z.string()).max(10, 'Maximum 10 additional specialties allowed').optional(),
  specialtyPreferences: z.array(z.string()).max(8, 'Maximum 8 specialty preferences allowed').optional(),
  careerStage: z.string().min(1, 'Please select your career stage'),
  bio: z.string().min(20, 'Please write at least 20 characters about yourself').max(500, 'Bio must be under 500 characters'),
  lookingFor: z.array(z.string()).min(1, 'Please select what you\'re looking for'),
})

type FormData = z.infer<typeof schema>

interface MedicalBackgroundStepProps {
  data?: Partial<FormData>
  onNext: (formData: FormData) => void
  onPrevious: () => void
}

const LOOKING_FOR_OPTIONS = [
  'Networking',
  'Mentorship',
  'Study Partners',
  'Research Collaboration',
  'Social Connections',
  'Professional Development',
  'Career Guidance',
  'Friendship',
]

export default function MedicalBackgroundStep({ data = {}, onNext, onPrevious }: MedicalBackgroundStepProps) {
  const [additionalSpecialties, setAdditionalSpecialties] = useState<string[]>(
    data.additionalSpecialties || []
  )
  const [specialtyPreferences, setSpecialtyPreferences] = useState<string[]>(
    data.specialtyPreferences || []
  )
  const [lookingFor, setLookingFor] = useState<string[]>(data.lookingFor || [])

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      medicalSpecialty: data.medicalSpecialty || '',
      additionalSpecialties: data.additionalSpecialties || [],
      specialtyPreferences: data.specialtyPreferences || [],
      careerStage: data.careerStage || '',
      bio: data.bio || '',
      lookingFor: data.lookingFor || [],
    },
    mode: 'onChange',
  })

  const watchedSpecialty = watch('medicalSpecialty')
  const watchedCareerStage = watch('careerStage')
  const watchedBio = watch('bio')
  const watchedLookingFor = watch('lookingFor')

  // Debug logging
  useEffect(() => {
    console.log('Form validation state:', {
      isValid,
      errors,
      medicalSpecialty: watchedSpecialty,
      careerStage: watchedCareerStage,
      bio: watchedBio,
      lookingFor: watchedLookingFor,
      bioLength: watchedBio?.length || 0
    })
  }, [isValid, errors, watchedSpecialty, watchedCareerStage, watchedBio, watchedLookingFor])

  // Sync form state with local state on mount
  useEffect(() => {
    setValue('additionalSpecialties', additionalSpecialties, { shouldValidate: true })
    setValue('specialtyPreferences', specialtyPreferences, { shouldValidate: true })
    setValue('lookingFor', lookingFor, { shouldValidate: true })
  }, [setValue, additionalSpecialties, specialtyPreferences, lookingFor])

  const handleSpecialtyToggle = (specialty: string) => {
    const updated = additionalSpecialties.includes(specialty)
      ? additionalSpecialties.filter(s => s !== specialty)
      : [...additionalSpecialties, specialty]

    setAdditionalSpecialties(updated)
    setValue('additionalSpecialties', updated, { shouldValidate: true })
  }

  const handleSpecialtyPreferencesToggle = (preference: string) => {
    const updated = specialtyPreferences.includes(preference)
      ? specialtyPreferences.filter(p => p !== preference)
      : [...specialtyPreferences, preference]

    setSpecialtyPreferences(updated)
    setValue('specialtyPreferences', updated, { shouldValidate: true })
  }

  const handleLookingForToggle = (option: string) => {
    const updated = lookingFor.includes(option)
      ? lookingFor.filter(o => o !== option)
      : [...lookingFor, option]

    setLookingFor(updated)
    setValue('lookingFor', updated, { shouldValidate: true })
    trigger('lookingFor')
  }

  const onSubmit = (formData: FormData) => {
    // Use formData properties directly to avoid ESLint unused variable warning
    const combinedData = {
      medicalSpecialty: formData.medicalSpecialty,
      careerStage: formData.careerStage,
      bio: formData.bio,
      additionalSpecialties,
      specialtyPreferences,
      lookingFor,
    }
    onNext(combinedData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="medicalSpecialty">Primary Medical Specialty *</Label>
        <Select value={watchedSpecialty} onValueChange={(value) => setValue('medicalSpecialty', value)}>
          <SelectTrigger className={errors.medicalSpecialty ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select your primary specialty" />
          </SelectTrigger>
          <SelectContent>
            {MEDICAL_SPECIALTIES.map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.medicalSpecialty && (
          <p className="text-sm text-red-600">{errors.medicalSpecialty.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Additional Specialties or Interests (Optional)</Label>
          <div className="text-sm text-gray-500">
            {additionalSpecialties.length}/10 selected
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Select any additional medical specialties you're interested in or have experience with
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {MEDICAL_SPECIALTIES.filter(s => s !== watchedSpecialty && s !== 'Other (specify)').map((specialty) => (
            <div key={specialty} className="flex items-center space-x-2">
              <Checkbox
                id={`specialty-${specialty}`}
                checked={additionalSpecialties.includes(specialty)}
                onCheckedChange={() => handleSpecialtyToggle(specialty)}
                disabled={additionalSpecialties.length >= 10 && !additionalSpecialties.includes(specialty)}
              />
              <Label
                htmlFor={`specialty-${specialty}`}
                className={`text-sm cursor-pointer ${
                  additionalSpecialties.length >= 10 && !additionalSpecialties.includes(specialty) 
                    ? 'text-gray-400' 
                    : ''
                }`}
              >
                {specialty}
              </Label>
            </div>
          ))}
        </div>
        {additionalSpecialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {additionalSpecialties.map((specialty) => (
              <Badge key={specialty} variant="secondary" className="flex items-center gap-1">
                {specialty}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleSpecialtyToggle(specialty)}
                />
              </Badge>
            ))}
          </div>
        )}
        {additionalSpecialties.length >= 10 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've reached the maximum of 10 additional specialties. Remove one to add another.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="careerStage">Career Stage *</Label>
        <Select value={watchedCareerStage} onValueChange={(value) => setValue('careerStage', value)}>
          <SelectTrigger className={errors.careerStage ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select your career stage" />
          </SelectTrigger>
          <SelectContent>
            {CAREER_STAGES.map((stage) => (
              <SelectItem key={stage.value} value={stage.value}>
                {stage.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.careerStage && (
          <p className="text-sm text-red-600">{errors.careerStage.message}</p>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Specialty Preference for Groups (Optional)</Label>
          <div className="text-sm text-gray-500">
            {specialtyPreferences.length}/8 selected
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Select your preferences for group composition and networking
        </p>
        <div className="grid grid-cols-2 gap-2">
          {SPECIALTY_PREFERENCES.map((preference) => (
            <div key={preference} className="flex items-center space-x-2">
              <Checkbox
                id={`preference-${preference}`}
                checked={specialtyPreferences.includes(preference)}
                onCheckedChange={() => handleSpecialtyPreferencesToggle(preference)}
                disabled={specialtyPreferences.length >= 8 && !specialtyPreferences.includes(preference)}
              />
              <Label
                htmlFor={`preference-${preference}`}
                className={`text-sm cursor-pointer ${
                  specialtyPreferences.length >= 8 && !specialtyPreferences.includes(preference) 
                    ? 'text-gray-400' 
                    : ''
                }`}
              >
                {preference}
              </Label>
            </div>
          ))}
        </div>
        {specialtyPreferences.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {specialtyPreferences.map((preference) => (
              <Badge key={preference} variant="outline" className="flex items-center gap-1">
                {preference}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleSpecialtyPreferencesToggle(preference)}
                />
              </Badge>
            ))}
          </div>
        )}
        {specialtyPreferences.length >= 8 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You've reached the maximum of 8 specialty preferences. Remove one to add another.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">About You *</Label>
        <p className="text-sm text-gray-600">
          Tell other medical professionals about yourself, your interests, and what makes you unique
        </p>
        <Textarea
          id="bio"
          {...register('bio')}
          placeholder="I'm a cardiology resident who loves hiking and is passionate about preventive medicine..."
          className={`min-h-[100px] ${errors.bio ? 'border-red-500' : ''}`}
          maxLength={500}
        />
        <div className="flex justify-between text-sm text-gray-500">
          {errors.bio ? (
            <p className="text-red-600">{errors.bio.message}</p>
          ) : (
            <p>Minimum 20 characters</p>
          )}
          <p>{watch('bio')?.length || 0}/500</p>
        </div>
      </div>

      <div className="space-y-3">
        <Label>What are you looking for? *</Label>
        <p className="text-sm text-gray-600">
          Select all that apply to help us understand your goals
        </p>
        <div className="grid grid-cols-2 gap-2">
          {LOOKING_FOR_OPTIONS.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`looking-for-${option}`}
                checked={lookingFor.includes(option)}
                onCheckedChange={() => handleLookingForToggle(option)}
              />
              <Label
                htmlFor={`looking-for-${option}`}
                className="text-sm cursor-pointer"
              >
                {option}
              </Label>
            </div>
          ))}
        </div>
        {lookingFor.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {lookingFor.map((option) => (
              <Badge key={option} variant="outline" className="flex items-center gap-1">
                {option}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => handleLookingForToggle(option)}
                />
              </Badge>
            ))}
          </div>
        )}
        {errors.lookingFor && (
          <p className="text-sm text-red-600">{errors.lookingFor.message}</p>
        )}
      </div>

      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the errors above to continue.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="submit" disabled={!isValid}>
          Continue
        </Button>
      </div>
    </form>
  )
}
