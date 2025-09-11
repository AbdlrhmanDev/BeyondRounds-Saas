"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Stethoscope, 
  Activity, 
  Music, 
  Calendar,
  Heart,
  Home,
  Target,
  Phone,
  CheckCircle
} from "lucide-react"
import { 
  ProfileFormData,
  MEDICAL_SPECIALTIES,
  SPORTS_ACTIVITIES,
  MUSIC_PREFERENCES,
  MOVIE_TV_PREFERENCES,
  OTHER_INTERESTS,
  PREFERRED_ACTIVITIES,
  LOOKING_FOR_OPTIONS,
  AVAILABILITY_SLOTS,
  DIETARY_RESTRICTIONS
} from "@/lib/types/profile"

interface ComprehensiveProfileFormProps {
  initialData?: Partial<ProfileFormData>
  onSubmit: (data: ProfileFormData) => Promise<void>
  isLoading?: boolean
  stickyFooter?: boolean
}

export default function ComprehensiveProfileForm({ 
  initialData = {}, 
  onSubmit, 
  isLoading = false,
  stickyFooter = false
}: ComprehensiveProfileFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 8
  const [isCompleted, setIsCompleted] = useState(false)
  
  const [formData, setFormData] = useState<ProfileFormData>({
    // Basic Information
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    age: initialData.age,
    nationality: initialData.nationality || '',
    phoneNumber: initialData.phoneNumber || '',
    
    // Gender & Preferences
    gender: initialData.gender || '',
    genderPreference: initialData.genderPreference || 'no-preference',
    
    // Location
    city: initialData.city || '',
    
    // Medical Background
    medicalSpecialty: initialData.medicalSpecialty || [],
    specialtyPreference: initialData.specialtyPreference || 'no-preference',
    careerStage: initialData.careerStage || '',
    
    // Sports & Activities
    sportsActivities: initialData.sportsActivities || {},
    activityLevel: initialData.activityLevel || '',
    
    // Entertainment & Culture
    musicPreferences: initialData.musicPreferences || [],
    movieTvPreferences: initialData.movieTvPreferences || [],
    otherInterests: initialData.otherInterests || [],
    
    // Social Preferences
    preferredActivities: initialData.preferredActivities || [],
    socialEnergyLevel: initialData.socialEnergyLevel || '',
    conversationStyle: initialData.conversationStyle || '',
    
    // Availability & Logistics
    availabilitySlots: initialData.availabilitySlots || [],
    meetingFrequency: initialData.meetingFrequency || '',
    
    // Lifestyle & Values
    dietaryRestrictions: initialData.dietaryRestrictions || [],
    lifeStage: initialData.lifeStage || '',
    lookingFor: initialData.lookingFor || [],
    idealWeekend: initialData.idealWeekend || '',
    
    // Legacy fields
    specialty: initialData.specialty || '',
    interests: initialData.interests || [],
    bio: initialData.bio || ''
  })

  const updateField = (field: keyof ProfileFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const toggleArrayItem = (field: keyof ProfileFormData, item: string) => {
    const currentArray = formData[field] as string[]
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item]
    updateField(field, newArray)
  }

  const updateSportsRating = (sport: string, rating: number) => {
    setFormData(prev => ({
      ...prev,
      sportsActivities: {
        ...prev.sportsActivities,
        [sport]: rating
      }
    }))
  }

  const removeSport = (sport: string) => {
    setFormData(prev => {
      const newSports = { ...prev.sportsActivities }
      delete newSports[sport]
      return { ...prev, sportsActivities: newSports }
    })
  }

  const getStepProgress = () => (currentStep / totalSteps) * 100

  const canProceed = () => {
    switch (currentStep) {
      case 1: // Basic Information
        return formData.firstName && formData.lastName && formData.gender && formData.city
      case 2: // Medical Background
        return formData.medicalSpecialty.length > 0 && formData.careerStage
      case 3: // Sports & Activities
        return formData.activityLevel
      case 4: // Entertainment & Culture
        return formData.musicPreferences.length > 0 || formData.movieTvPreferences.length > 0 || formData.otherInterests.length > 0
      case 5: // Social Preferences
        return formData.socialEnergyLevel && formData.conversationStyle
      case 6: // Availability
        return formData.availabilitySlots.length > 0 && formData.meetingFrequency
      case 7: // Lifestyle & Values
        return formData.lifeStage && formData.lookingFor.length > 0
      case 8: // Final Review
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    // Sync legacy fields with new fields
    const submitData = {
      ...formData,
      specialty: formData.medicalSpecialty[0] || '', // Use first medical specialty as legacy specialty
      interests: [
        ...formData.musicPreferences,
        ...formData.movieTvPreferences,
        ...formData.otherInterests
      ] // Combine all interests for legacy field
    }
    
    try {
      await onSubmit(submitData)
      // Profile submission was successful, show completion state
      setIsCompleted(true)
    } catch (error) {
      console.error("Profile submission failed:", error)
      // Error handling is done by parent component via toast
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                Basic Information
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">Let's start with the basics about you</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateField('firstName', e.target.value)}
                    placeholder="Enter your first name"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateField('lastName', e.target.value)}
                    placeholder="Enter your last name"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="age" className="text-sm font-semibold text-gray-700">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    min="18"
                    max="100"
                    value={formData.age || ''}
                    onChange={(e) => updateField('age', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Your age"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality" className="text-sm font-semibold text-gray-700">
                    Nationality
                  </Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => updateField('nationality', e.target.value)}
                    placeholder="Your nationality"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => updateField('phoneNumber', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Gender *</Label>
                <RadioGroup 
                  value={formData.gender} 
                  onValueChange={(value) => updateField('gender', value)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50/50 transition-colors">
                    <RadioGroupItem value="male" id="male" className="border-gray-300" />
                    <Label htmlFor="male" className="font-medium text-gray-700 cursor-pointer">Male</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50/50 transition-colors">
                    <RadioGroupItem value="female" id="female" className="border-gray-300" />
                    <Label htmlFor="female" className="font-medium text-gray-700 cursor-pointer">Female</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50/50 transition-colors">
                    <RadioGroupItem value="prefer-not-to-say" id="prefer-not-say" className="border-gray-300" />
                    <Label htmlFor="prefer-not-say" className="font-medium text-gray-700 cursor-pointer">Prefer not to say</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="genderPreference" className="text-sm font-semibold text-gray-700">
                  Gender Preference for Groups
                </Label>
                <Select value={formData.genderPreference} onValueChange={(value) => updateField('genderPreference', value)}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white hover:bg-gray-50 transition-colors">
                    <SelectValue placeholder="Select your preference" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <SelectItem value="no-preference" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer px-3 py-2">No preference</SelectItem>
                    <SelectItem value="mixed" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer px-3 py-2">Mixed groups preferred</SelectItem>
                    <SelectItem value="same-gender-only" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer px-3 py-2">Same gender only</SelectItem>
                    <SelectItem value="same-gender-preferred" className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer px-3 py-2">Same gender preferred but mixed okay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="text-sm font-semibold text-gray-700">
                  City of Residence *
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Enter your city"
                  className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                />
              </div>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Stethoscope className="h-6 w-6 text-green-600" />
                </div>
                Medical Background
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">Tell us about your medical career and specialties</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">
                  Medical Specialty/Position (select all that apply) *
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-4 bg-gray-50/50 rounded-lg border border-gray-200">
                  {MEDICAL_SPECIALTIES.map((specialty) => (
                    <div key={specialty} className="flex items-center space-x-3 p-2 hover:bg-white hover:shadow-sm rounded-md transition-all duration-200">
                      <Checkbox
                        id={specialty}
                        checked={formData.medicalSpecialty.includes(specialty)}
                        onCheckedChange={() => toggleArrayItem('medicalSpecialty', specialty)}
                        className="border-gray-300 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                      />
                      <Label htmlFor={specialty} className="text-sm font-medium text-gray-700 cursor-pointer leading-relaxed">
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.medicalSpecialty.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.medicalSpecialty.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialtyPreference" className="text-sm font-semibold text-gray-700">
                  Specialty Preference for Groups
                </Label>
                <Select value={formData.specialtyPreference} onValueChange={(value) => updateField('specialtyPreference', value)}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500/20 bg-white hover:bg-gray-50 transition-colors">
                    <SelectValue placeholder="Select your preference" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <SelectItem value="same" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer px-3 py-2">Same specialty preferred</SelectItem>
                    <SelectItem value="different" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer px-3 py-2">Different specialties preferred</SelectItem>
                    <SelectItem value="no-preference" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer px-3 py-2">No preference</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="careerStage" className="text-sm font-semibold text-gray-700">
                  Career Stage *
                </Label>
                <Select value={formData.careerStage} onValueChange={(value) => updateField('careerStage', value)}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-green-500 focus:ring-green-500/20 bg-white hover:bg-gray-50 transition-colors">
                    <SelectValue placeholder="Select your career stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <SelectItem value="medical-student" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer px-3 py-2">Medical Student</SelectItem>
                    <SelectItem value="resident-1-2" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer px-3 py-2">Resident (1st-2nd year)</SelectItem>
                    <SelectItem value="resident-3plus" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer px-3 py-2">Resident (3rd+ year)</SelectItem>
                    <SelectItem value="fellow" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer px-3 py-2">Fellow</SelectItem>
                    <SelectItem value="attending-0-5" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer px-3 py-2">Attending/Consultant (0-5 years)</SelectItem>
                    <SelectItem value="attending-5plus" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer px-3 py-2">Attending/Consultant (5+ years)</SelectItem>
                    <SelectItem value="private-practice" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer px-3 py-2">Private Practice</SelectItem>
                    <SelectItem value="academic-medicine" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer px-3 py-2">Academic Medicine</SelectItem>
                    <SelectItem value="other" className="hover:bg-green-50 focus:bg-green-50 cursor-pointer px-3 py-2">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50/30">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Activity className="h-6 w-6 text-orange-600" />
                </div>
                Sports & Physical Activities
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">Share your favorite sports and activity level</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">
                  Sports You Enjoy (rate interest 1-5)
                </Label>
                
                {Object.keys(formData.sportsActivities).length > 0 && (
                  <div className="space-y-3">
                    {Object.entries(formData.sportsActivities).map(([sport, rating]) => (
                      <div key={sport} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                        <span className="font-medium text-gray-800">{sport}</span>
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => updateSportsRating(sport, star)}
                                className={`w-8 h-8 rounded-full text-lg font-bold transition-all duration-200 ${
                                  star <= rating 
                                    ? 'bg-yellow-400 text-white shadow-md hover:bg-yellow-500' 
                                    : 'bg-gray-200 text-gray-400 hover:bg-gray-300'
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeSport(sport)}
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <Select onValueChange={(sport) => updateSportsRating(sport, 3)}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 bg-white hover:bg-gray-50 transition-colors">
                    <SelectValue placeholder="Add a sport or activity..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {SPORTS_ACTIVITIES.filter(sport => !formData.sportsActivities[sport]).map((sport) => (
                      <SelectItem key={sport} value={sport} className="hover:bg-orange-50 focus:bg-orange-50 cursor-pointer px-3 py-2">{sport}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {Object.keys(formData.sportsActivities).length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Add sports and activities you enjoy!</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="activityLevel" className="text-sm font-semibold text-gray-700">
                  Overall Activity Level *
                </Label>
                <Select value={formData.activityLevel} onValueChange={(value) => updateField('activityLevel', value)}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 bg-white hover:bg-gray-50 transition-colors">
                    <SelectValue placeholder="Select your activity level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <SelectItem value="very-active" className="hover:bg-orange-50 focus:bg-orange-50 cursor-pointer px-3 py-2">Very active (5+ times/week)</SelectItem>
                    <SelectItem value="active" className="hover:bg-orange-50 focus:bg-orange-50 cursor-pointer px-3 py-2">Active (3-4 times/week)</SelectItem>
                    <SelectItem value="moderately-active" className="hover:bg-orange-50 focus:bg-orange-50 cursor-pointer px-3 py-2">Moderately active (1-2 times/week)</SelectItem>
                    <SelectItem value="occasionally-active" className="hover:bg-orange-50 focus:bg-orange-50 cursor-pointer px-3 py-2">Occasionally active</SelectItem>
                    <SelectItem value="prefer-non-physical" className="hover:bg-orange-50 focus:bg-orange-50 cursor-pointer px-3 py-2">Prefer non-physical activities</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Music className="h-6 w-6 text-purple-600" />
                </div>
                Entertainment & Culture
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">Share your entertainment preferences and cultural interests</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Music Preferences</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {MUSIC_PREFERENCES.map((music) => (
                    <div key={music} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50/50 transition-colors">
                      <Checkbox
                        id={music}
                        checked={formData.musicPreferences.includes(music)}
                        onCheckedChange={() => toggleArrayItem('musicPreferences', music)}
                        className="border-gray-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <Label htmlFor={music} className="text-sm font-medium text-gray-700 cursor-pointer">{music}</Label>
                    </div>
                  ))}
                </div>
                {formData.musicPreferences.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.musicPreferences.map((music) => (
                      <Badge key={music} variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                        {music}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Movies & TV Shows</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MOVIE_TV_PREFERENCES.map((movie) => (
                    <div key={movie} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50/50 transition-colors">
                      <Checkbox
                        id={movie}
                        checked={formData.movieTvPreferences.includes(movie)}
                        onCheckedChange={() => toggleArrayItem('movieTvPreferences', movie)}
                        className="border-gray-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <Label htmlFor={movie} className="text-sm font-medium text-gray-700 cursor-pointer">{movie}</Label>
                    </div>
                  ))}
                </div>
                {formData.movieTvPreferences.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.movieTvPreferences.map((movie) => (
                      <Badge key={movie} variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                        {movie}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Other Interests</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {OTHER_INTERESTS.map((interest) => (
                    <div key={interest} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50/50 transition-colors">
                      <Checkbox
                        id={interest}
                        checked={formData.otherInterests.includes(interest)}
                        onCheckedChange={() => toggleArrayItem('otherInterests', interest)}
                        className="border-gray-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                      />
                      <Label htmlFor={interest} className="text-sm font-medium text-gray-700 cursor-pointer">{interest}</Label>
                    </div>
                  ))}
                </div>
                {formData.otherInterests.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.otherInterests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 5:
        return (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-pink-50/30">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Heart className="h-6 w-6 text-pink-600" />
                </div>
                Social Preferences
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">Tell us about your social style and preferred activities</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Preferred Meeting Activities</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PREFERRED_ACTIVITIES.map((activity) => (
                    <div key={activity} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-pink-50/50 transition-colors">
                      <Checkbox
                        id={activity}
                        checked={formData.preferredActivities.includes(activity)}
                        onCheckedChange={() => toggleArrayItem('preferredActivities', activity)}
                        className="border-gray-300 data-[state=checked]:bg-pink-600 data-[state=checked]:border-pink-600"
                      />
                      <Label htmlFor={activity} className="text-sm font-medium text-gray-700 cursor-pointer">{activity}</Label>
                    </div>
                  ))}
                </div>
                {formData.preferredActivities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.preferredActivities.map((activity) => (
                      <Badge key={activity} variant="secondary" className="bg-pink-100 text-pink-800 border-pink-200">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="socialEnergyLevel" className="text-sm font-semibold text-gray-700">
                  Social Energy Level *
                </Label>
                <Select value={formData.socialEnergyLevel} onValueChange={(value) => updateField('socialEnergyLevel', value)}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-pink-500 focus:ring-pink-500/20 bg-white hover:bg-gray-50 transition-colors">
                    <SelectValue placeholder="Select your energy level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <SelectItem value="high-energy-big-groups" className="hover:bg-pink-50 focus:bg-pink-50 cursor-pointer px-3 py-2">High energy, love big groups</SelectItem>
                    <SelectItem value="moderate-energy-small-groups" className="hover:bg-pink-50 focus:bg-pink-50 cursor-pointer px-3 py-2">Moderate energy, prefer small groups</SelectItem>
                    <SelectItem value="low-key-intimate" className="hover:bg-pink-50 focus:bg-pink-50 cursor-pointer px-3 py-2">Low key, intimate settings preferred</SelectItem>
                    <SelectItem value="varies-by-mood" className="hover:bg-pink-50 focus:bg-pink-50 cursor-pointer px-3 py-2">Varies by mood</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="conversationStyle" className="text-sm font-semibold text-gray-700">
                  Conversation Style *
                </Label>
                <Select value={formData.conversationStyle} onValueChange={(value) => updateField('conversationStyle', value)}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-pink-500 focus:ring-pink-500/20 bg-white hover:bg-gray-50 transition-colors">
                    <SelectValue placeholder="Select your conversation style" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <SelectItem value="deep-meaningful" className="hover:bg-pink-50 focus:bg-pink-50 cursor-pointer px-3 py-2">Deep, meaningful conversations</SelectItem>
                    <SelectItem value="light-fun-casual" className="hover:bg-pink-50 focus:bg-pink-50 cursor-pointer px-3 py-2">Light, fun, casual chat</SelectItem>
                    <SelectItem value="hobby-focused" className="hover:bg-pink-50 focus:bg-pink-50 cursor-pointer px-3 py-2">Hobby-focused discussions</SelectItem>
                    <SelectItem value="professional-career" className="hover:bg-pink-50 focus:bg-pink-50 cursor-pointer px-3 py-2">Professional/career topics</SelectItem>
                    <SelectItem value="mix-everything" className="hover:bg-pink-50 focus:bg-pink-50 cursor-pointer px-3 py-2">Mix of everything</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )

      case 6:
        return (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50/30">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
                Availability & Logistics
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">When are you available to meet and connect?</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">
                  Preferred Meeting Times (select all that work) *
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {AVAILABILITY_SLOTS.map((slot) => (
                    <div key={slot} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-indigo-50/50 transition-colors">
                      <Checkbox
                        id={slot}
                        checked={formData.availabilitySlots.includes(slot)}
                        onCheckedChange={() => toggleArrayItem('availabilitySlots', slot)}
                        className="border-gray-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                      <Label htmlFor={slot} className="text-sm font-medium text-gray-700 cursor-pointer">{slot}</Label>
                    </div>
                  ))}
                </div>
                {formData.availabilitySlots.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.availabilitySlots.map((slot) => (
                      <Badge key={slot} variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                        {slot}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="meetingFrequency" className="text-sm font-semibold text-gray-700">
                  Meeting Frequency Preference *
                </Label>
                <Select value={formData.meetingFrequency} onValueChange={(value) => updateField('meetingFrequency', value)}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white hover:bg-gray-50 transition-colors">
                    <SelectValue placeholder="How often would you like to meet?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <SelectItem value="weekly" className="hover:bg-indigo-50 focus:bg-indigo-50 cursor-pointer px-3 py-2">Weekly</SelectItem>
                    <SelectItem value="bi-weekly" className="hover:bg-indigo-50 focus:bg-indigo-50 cursor-pointer px-3 py-2">Bi-weekly</SelectItem>
                    <SelectItem value="monthly" className="hover:bg-indigo-50 focus:bg-indigo-50 cursor-pointer px-3 py-2">Monthly</SelectItem>
                    <SelectItem value="as-schedules-allow" className="hover:bg-indigo-50 focus:bg-indigo-50 cursor-pointer px-3 py-2">As schedules allow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )

      case 7:
        return (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-teal-50/30">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Home className="h-6 w-6 text-teal-600" />
                </div>
                Lifestyle & Values
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">Share your lifestyle preferences and what you're looking for</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">Dietary Preferences/Restrictions</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {DIETARY_RESTRICTIONS.map((restriction) => (
                    <div key={restriction} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-teal-50/50 transition-colors">
                      <Checkbox
                        id={restriction}
                        checked={formData.dietaryRestrictions.includes(restriction)}
                        onCheckedChange={() => toggleArrayItem('dietaryRestrictions', restriction)}
                        className="border-gray-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
                      />
                      <Label htmlFor={restriction} className="text-sm font-medium text-gray-700 cursor-pointer">{restriction}</Label>
                    </div>
                  ))}
                </div>
                {formData.dietaryRestrictions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.dietaryRestrictions.map((restriction) => (
                      <Badge key={restriction} variant="secondary" className="bg-teal-100 text-teal-800 border-teal-200">
                        {restriction}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lifeStage" className="text-sm font-semibold text-gray-700">
                  Life Stage *
                </Label>
                <Select value={formData.lifeStage} onValueChange={(value) => updateField('lifeStage', value)}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 bg-white hover:bg-gray-50 transition-colors">
                    <SelectValue placeholder="Select your current life stage" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <SelectItem value="single-no-kids" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">Single, no kids</SelectItem>
                    <SelectItem value="relationship-no-kids" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">In a relationship, no kids</SelectItem>
                    <SelectItem value="married-no-kids" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">Married, no kids</SelectItem>
                    <SelectItem value="young-children" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">Have young children</SelectItem>
                    <SelectItem value="older-children" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">Have older children</SelectItem>
                    <SelectItem value="empty-nester" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">Empty nester</SelectItem>
                    <SelectItem value="prefer-not-say" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-semibold text-gray-700">
                  What you're looking for (select all that apply) *
                </Label>
                <div className="space-y-3">
                  {LOOKING_FOR_OPTIONS.map((option) => (
                    <div key={option} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-teal-50/50 transition-colors">
                      <Checkbox
                        id={option}
                        checked={formData.lookingFor.includes(option)}
                        onCheckedChange={() => toggleArrayItem('lookingFor', option)}
                        className="border-gray-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600 mt-0.5"
                      />
                      <Label htmlFor={option} className="text-sm font-medium text-gray-700 cursor-pointer leading-relaxed">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
                {formData.lookingFor.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.lookingFor.map((option) => (
                      <Badge key={option} variant="secondary" className="bg-teal-100 text-teal-800 border-teal-200">
                        {option.split(' (')[0]}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idealWeekend" className="text-sm font-semibold text-gray-700">
                  Describe your ideal weekend
                </Label>
                <Select value={formData.idealWeekend} onValueChange={(value) => updateField('idealWeekend', value)}>
                  <SelectTrigger className="h-11 border-gray-200 focus:border-teal-500 focus:ring-teal-500/20 bg-white hover:bg-gray-50 transition-colors">
                    <SelectValue placeholder="What's your perfect weekend like?" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    <SelectItem value="adventure-exploration" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">Adventure and exploration</SelectItem>
                    <SelectItem value="relaxation-self-care" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">Relaxation and self-care</SelectItem>
                    <SelectItem value="social-activities" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">Social activities with friends</SelectItem>
                    <SelectItem value="cultural-activities" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">Cultural activities (museums, shows)</SelectItem>
                    <SelectItem value="sports-fitness" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">Sports and fitness</SelectItem>
                    <SelectItem value="home-projects-hobbies" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">Home projects and hobbies</SelectItem>
                    <SelectItem value="mix-active-relaxing" className="hover:bg-teal-50 focus:bg-teal-50 cursor-pointer px-3 py-2">Mix of active and relaxing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )

      case 8:
        return (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl font-bold text-gray-800">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Target className="h-6 w-6 text-emerald-600" />
                </div>
                Review & Submit
              </CardTitle>
              <p className="text-gray-600 text-sm mt-2">Review your profile before connecting with fellow medical professionals</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Profile Summary</h3>
                <p className="text-gray-600">Here's how you'll appear to potential connections</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Basic Information
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><span className="font-medium">Name:</span> {formData.firstName} {formData.lastName}</p>
                      {formData.age && <p><span className="font-medium">Age:</span> {formData.age} years old</p>}
                      <p><span className="font-medium">Location:</span> {formData.city}</p>
                      {formData.phoneNumber && <p><span className="font-medium">Phone:</span> {formData.phoneNumber}</p>}
                      {formData.nationality && <p><span className="font-medium">Nationality:</span> {formData.nationality}</p>}
                    </div>
                  </div>

                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <Stethoscope className="h-4 w-4" />
                      Medical Background
                    </h4>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><span className="font-medium">Specialties:</span> {formData.medicalSpecialty.slice(0, 3).join(', ')}
                        {formData.medicalSpecialty.length > 3 && ` +${formData.medicalSpecialty.length - 3} more`}</p>
                      <p><span className="font-medium">Career Stage:</span> {formData.careerStage?.replace('-', ' ')}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Activity & Sports
                    </h4>
                    <div className="text-sm text-orange-700 space-y-1">
                      <p><span className="font-medium">Activity Level:</span> {formData.activityLevel?.replace('-', ' ')}</p>
                      {Object.keys(formData.sportsActivities).length > 0 && (
                        <p><span className="font-medium">Sports:</span> {Object.keys(formData.sportsActivities).slice(0, 3).join(', ')}
                          {Object.keys(formData.sportsActivities).length > 3 && ` +${Object.keys(formData.sportsActivities).length - 3} more`}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      Interests & Culture
                    </h4>
                    <div className="text-sm text-purple-700 space-y-1">
                      {formData.musicPreferences.length > 0 && (
                        <p><span className="font-medium">Music:</span> {formData.musicPreferences.slice(0, 3).join(', ')}
                          {formData.musicPreferences.length > 3 && ` +${formData.musicPreferences.length - 3} more`}</p>
                      )}
                      {formData.movieTvPreferences.length > 0 && (
                        <p><span className="font-medium">Movies/TV:</span> {formData.movieTvPreferences.slice(0, 3).join(', ')}
                          {formData.movieTvPreferences.length > 3 && ` +${formData.movieTvPreferences.length - 3} more`}</p>
                      )}
                      {formData.otherInterests.length > 0 && (
                        <p><span className="font-medium">Other:</span> {formData.otherInterests.slice(0, 3).join(', ')}
                          {formData.otherInterests.length > 3 && ` +${formData.otherInterests.length - 3} more`}</p>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <h4 className="font-semibold text-pink-800 mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Social Preferences
                    </h4>
                    <div className="text-sm text-pink-700 space-y-1">
                      <p><span className="font-medium">Energy Level:</span> {formData.socialEnergyLevel?.replace('-', ' ')}</p>
                      <p><span className="font-medium">Conversation:</span> {formData.conversationStyle?.replace('-', ' ')}</p>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Availability & Goals
                    </h4>
                    <div className="text-sm text-indigo-700 space-y-1">
                      <p><span className="font-medium">Meeting Frequency:</span> {formData.meetingFrequency?.replace('-', ' ')}</p>
                      <p><span className="font-medium">Available:</span> {formData.availabilitySlots.slice(0, 3).join(', ')}
                        {formData.availabilitySlots.length > 3 && ` +${formData.availabilitySlots.length - 3} more`}</p>
                      <p><span className="font-medium">Looking For:</span> {formData.lookingFor.slice(0, 2).map(item => item.split(' (')[0]).join(', ')}
                        {formData.lookingFor.length > 2 && ` +${formData.lookingFor.length - 2} more`}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-6 border-t border-gray-200">
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">🎉 Ready to Connect!</h4>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Your comprehensive profile will help us find the perfect medical professional matches for you. 
                    Start building meaningful connections with colleagues who share your interests and goals.
                  </p>
                </div>
                
                <Button 
                  onClick={handleSubmit} 
                  className="w-full max-w-md h-14 text-lg font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Saving Your Profile...
                    </>
                  ) : (
                    <>
                      <Target className="h-5 w-5 mr-2" />
                      Complete Profile & Start Connecting
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  // Success Card Component
  const SuccessCard = () => (
    <Card className="border-0 shadow-xl bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <h3 className="text-lg font-semibold text-green-800">Profile Complete!</h3>
        </div>
        <p className="text-green-700 mb-4">
          Congratulations! Your profile is now 100% complete. You're ready to start receiving weekly matches.
        </p>
        <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
          Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  )

  if (isCompleted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/20">
        <main className="flex-1">
          <div className="container mx-auto max-w-4xl px-4 pt-8 pb-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Setup Complete</h1>
              <p className="text-gray-600">Welcome to BeyondRounds!</p>
            </div>
          </div>
        </main>
        
        {stickyFooter ? (
          <div className="sticky bottom-0 z-30 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto max-w-4xl px-4 py-4">
              <SuccessCard />
            </div>
          </div>
        ) : (
          <div className="container mx-auto max-w-4xl px-4 pb-4 mt-auto">
            <SuccessCard />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-green-50/20">
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl px-4 pt-8 pb-6">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">Complete Your Profile</h1>
                <p className="text-gray-600">Help us find your perfect medical professional connections</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-500">Step</span>
                <div className="text-2xl font-bold text-blue-600">{currentStep} <span className="text-gray-400">/ {totalSteps}</span></div>
              </div>
            </div>
            <div className="relative">
              <Progress value={getStepProgress()} className="w-full h-3 bg-gray-200" />
              <div className="absolute top-0 left-0 h-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out"
                   style={{ width: `${getStepProgress()}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Basic Info</span>
              <span>Medical</span>
              <span>Sports</span>
              <span>Culture</span>
              <span>Social</span>
              <span>Schedule</span>
              <span>Lifestyle</span>
              <span>Review</span>
            </div>
          </div>

          {/* Form Step */}
          <div className="mb-8">
            {renderStep()}
          </div>
        </div>
      </main>

      {/* Navigation Footer */}
      {stickyFooter ? (
        <div className="sticky bottom-0 z-30 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto max-w-5xl px-4 py-4">
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-2 h-12 px-6 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              <div className="flex items-center gap-2 text-sm text-gray-500">
                {currentStep < totalSteps ? (
                  <>
                    <span>Progress:</span>
                    <div className="flex gap-1">
                      {Array.from({ length: totalSteps }, (_, i) => (
                        <div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            i < currentStep ? 'bg-green-500' : i === currentStep - 1 ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <span className="text-green-600 font-medium">Ready to submit!</span>
                )}
              </div>

              {currentStep < totalSteps && (
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto max-w-5xl px-4 pb-4 mt-auto">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2 h-12 px-6 border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              {currentStep < totalSteps ? (
                <>
                  <span>Progress:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: totalSteps }, (_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          i < currentStep ? 'bg-green-500' : i === currentStep - 1 ? 'bg-blue-500' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <span className="text-green-600 font-medium">Ready to submit!</span>
              )}
            </div>

            {currentStep < totalSteps && (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
