'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Stethoscope, 
  Heart, 
  Save, 
  ArrowLeft,
  ArrowRight,
  Utensils
} from 'lucide-react'
import { type UserFormData } from '@/lib/types/database'

interface ProfileFormProps {
  initialData?: Partial<UserFormData>
  onSubmit: (data: UserFormData) => void
  onCancel?: () => void
  loading?: boolean
}

const MEDICAL_SPECIALTIES = [
  'Internal Medicine', 'Surgery', 'Pediatrics', 'Obstetrics & Gynecology',
  'Psychiatry', 'Radiology', 'Anesthesiology', 'Emergency Medicine',
  'Family Medicine', 'Cardiology', 'Neurology', 'Oncology', 'Orthopedics',
  'Dermatology', 'Ophthalmology', 'ENT', 'Urology', 'Pathology', 'Other'
]

const SPORTS_ACTIVITIES = [
  'Running', 'Swimming', 'Cycling', 'Tennis', 'Basketball', 'Soccer',
  'Golf', 'Yoga', 'Pilates', 'Weightlifting', 'Hiking', 'Rock Climbing',
  'Martial Arts', 'Dancing', 'Skiing', 'Snowboarding', 'Other'
]

const ACTIVITIES = [
  'Coffee/Tea', 'Dining Out', 'Museums', 'Art Galleries', 'Concerts',
  'Theater', 'Movies', 'Sports Events', 'Hiking', 'Beach', 'Travel',
  'Book Clubs', 'Wine Tasting', 'Cooking Classes', 'Volunteering', 'Other'
]

const LOOKING_FOR_OPTIONS = [
  'Professional networking', 'Mentorship', 'Collaboration opportunities',
  'Friendship', 'Study groups', 'Research partnerships', 'Career advice',
  'Social activities', 'Travel companions', 'Hobby sharing'
]

export default function ProfileForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  loading = false 
}: ProfileFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<UserFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    age: initialData?.age || '',
    gender: initialData?.gender || 'prefer-not-to-say',
    city: initialData?.city || '',
    nationality: initialData?.nationality || '',
    medicalSpecialty: initialData?.medicalSpecialty || '',
    careerStage: initialData?.careerStage || 'medical_student',
    bio: initialData?.bio || '',
    lookingFor: initialData?.lookingFor || '',
    specialties: initialData?.specialties || [],
    sports: initialData?.sports || [],
    activities: initialData?.activities || [],
    institutions: initialData?.institutions || [],
    genderPreference: initialData?.genderPreference || 'no-preference',
    activityLevel: initialData?.activityLevel || 'moderately-active',
    socialEnergy: initialData?.socialEnergy || 'high',
    conversationStyle: initialData?.conversationStyle || 'mixed',
    meetingFrequency: initialData?.meetingFrequency || 'monthly',
    lifeStage: initialData?.lifeStage || 'single'
  })

  const totalSteps = 4

  const updateFormData = (key: keyof UserFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const toggleArrayValue = (key: 'specialties' | 'sports' | 'activities', value: string) => {
    setFormData(prev => {
      const currentArray = prev[key] || []
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value]
      return { ...prev, [key]: newArray }
    })
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.age)
      case 2:
        return !!(formData.medicalSpecialty && formData.careerStage)
      case 3:
        return !!(formData.specialties && formData.specialties.length > 0)
      case 4:
        return true // Optional step
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateFormData('age', e.target.value)}
                  placeholder="Enter your age"
                  min="18"
                  max="100"
                />
              </div>
              <div>
                <Label>Gender</Label>
                <RadioGroup value={formData.gender} onValueChange={(value) => updateFormData('gender', value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-binary" id="non-binary" />
                    <Label htmlFor="non-binary">Non-binary</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="prefer-not-to-say" id="prefer-not-to-say" />
                    <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateFormData('city', e.target.value)}
                  placeholder="Enter your city"
                />
              </div>
              <div>
                <Label htmlFor="nationality">Nationality</Label>
                <Input
                  id="nationality"
                  value={formData.nationality}
                  onChange={(e) => updateFormData('nationality', e.target.value)}
                  placeholder="Enter your nationality"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Stethoscope className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Medical Background</h2>
            </div>
            
            <div>
              <Label>Medical Specialty *</Label>
              <Select value={formData.medicalSpecialty} onValueChange={(value) => updateFormData('medicalSpecialty', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your medical specialty" />
                </SelectTrigger>
                <SelectContent>
                  {MEDICAL_SPECIALTIES.map((specialty: string) => (
                    <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Career Stage *</Label>
              <RadioGroup value={formData.careerStage} onValueChange={(value) => updateFormData('careerStage', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medical_student" id="medical_student" />
                  <Label htmlFor="medical_student">Medical Student</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="resident" id="resident" />
                  <Label htmlFor="resident">Resident</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fellow" id="fellow" />
                  <Label htmlFor="fellow">Fellow</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="attending" id="attending" />
                  <Label htmlFor="attending">Attending Physician</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retired" id="retired" />
                  <Label htmlFor="retired">Retired</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Heart className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Interests & Activities</h2>
            </div>
            
            <div>
              <Label>Medical Specialties of Interest (multi-select) *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {MEDICAL_SPECIALTIES.map((specialty: string) => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <Checkbox
                      id={specialty}
                      checked={formData.specialties.includes(specialty)}
                      onCheckedChange={() => toggleArrayValue('specialties', specialty)}
                    />
                    <Label htmlFor={specialty} className="text-sm">{specialty}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Sports & Physical Activities (multi-select)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {SPORTS_ACTIVITIES.map((sport: string) => (
                  <div key={sport} className="flex items-center space-x-2">
                    <Checkbox
                      id={sport}
                      checked={formData.sports.includes(sport)}
                      onCheckedChange={() => toggleArrayValue('sports', sport)}
                    />
                    <Label htmlFor={sport} className="text-sm">{sport}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Activities You Enjoy (multi-select)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {ACTIVITIES.map((activity: string) => (
                  <div key={activity} className="flex items-center space-x-2">
                    <Checkbox
                      id={activity}
                      checked={formData.activities.includes(activity)}
                      onCheckedChange={() => toggleArrayValue('activities', activity)}
                    />
                    <Label htmlFor={activity} className="text-sm">{activity}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>What you're looking for (select all that apply)</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {LOOKING_FOR_OPTIONS.map((option: string) => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={option}
                      checked={(formData.lookingFor || '').includes(option)}
                      onCheckedChange={() => {
                        const currentLookingFor = (formData.lookingFor || '').split(',').filter(Boolean)
                        const newLookingFor = currentLookingFor.includes(option)
                          ? currentLookingFor.filter((item: string) => item !== option)
                          : [...currentLookingFor, option]
                        updateFormData('lookingFor', newLookingFor.join(','))
                      }}
                    />
                    <Label htmlFor={option} className="text-sm">{option}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-6">
              <Utensils className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Lifestyle & Preferences</h2>
            </div>
            
            <div>
              <Label>Gender Preference</Label>
              <RadioGroup value={formData.genderPreference} onValueChange={(value) => updateFormData('genderPreference', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no-preference" id="no-preference" />
                  <Label htmlFor="no-preference">No preference</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="mixed" />
                  <Label htmlFor="mixed">Mixed groups</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="same-gender-only" id="same-gender-only" />
                  <Label htmlFor="same-gender-only">Same gender only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="same-gender-preferred" id="same-gender-preferred" />
                  <Label htmlFor="same-gender-preferred">Same gender preferred</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Activity Level</Label>
              <RadioGroup value={formData.activityLevel} onValueChange={(value) => updateFormData('activityLevel', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-active" id="very-active" />
                  <Label htmlFor="very-active">Very active (5+ times/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active (3-4 times/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderately-active" id="moderately-active" />
                  <Label htmlFor="moderately-active">Moderately active (1-2 times/week)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="occasionally-active" id="occasionally-active" />
                  <Label htmlFor="occasionally-active">Occasionally active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="non-physical" id="non-physical" />
                  <Label htmlFor="non-physical">Prefer non-physical activities</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Social Energy Level</Label>
              <RadioGroup value={formData.socialEnergy} onValueChange={(value) => updateFormData('socialEnergy', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-high" id="very-high" />
                  <Label htmlFor="very-high">Very high energy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High energy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" />
                  <Label htmlFor="moderate">Moderate energy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low energy</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-low" id="very-low" />
                  <Label htmlFor="very-low">Very low energy</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Conversation Style</Label>
              <RadioGroup value={formData.conversationStyle} onValueChange={(value) => updateFormData('conversationStyle', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deep-philosophical" id="deep-philosophical" />
                  <Label htmlFor="deep-philosophical">Deep, philosophical discussions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light-casual" id="light-casual" />
                  <Label htmlFor="light-casual">Light, casual conversations</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="professional-focused" id="professional-focused" />
                  <Label htmlFor="professional-focused">Professional/career focused</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="mixed" />
                  <Label htmlFor="mixed">Mix of everything</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Meeting Frequency</Label>
              <RadioGroup value={formData.meetingFrequency} onValueChange={(value) => updateFormData('meetingFrequency', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly">Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bi-weekly" id="bi-weekly" />
                  <Label htmlFor="bi-weekly">Bi-weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monthly" id="monthly" />
                  <Label htmlFor="monthly">Monthly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="flexible" id="flexible" />
                  <Label htmlFor="flexible">Flexible</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Life Stage</Label>
              <RadioGroup value={formData.lifeStage} onValueChange={(value) => updateFormData('lifeStage', value)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single">Single</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dating" id="dating" />
                  <Label htmlFor="dating">Dating</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="married" id="married" />
                  <Label htmlFor="married">Married</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="parent" id="parent" />
                  <Label htmlFor="parent">Parent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="empty-nester" id="empty-nester" />
                  <Label htmlFor="empty-nester">Empty nester</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Setup
            </CardTitle>
            <Badge variant="outline">
              Step {currentStep} of {totalSteps}
            </Badge>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          {renderStepContent()}
          
          <Separator className="my-6" />
          
          <div className="flex justify-between">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex gap-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              
              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNext}
                  disabled={!validateStep(currentStep)}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={loading || !validateStep(currentStep)}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Profile
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}