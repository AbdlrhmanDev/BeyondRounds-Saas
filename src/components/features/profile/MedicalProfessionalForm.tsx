'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
// import { Alert, AlertDescription } from '@/components/ui/alert' // Unused
import { Separator } from '@/components/ui/separator'
import { Stethoscope, CheckCircle, AlertCircle, Info, Users, Building2, GraduationCap } from 'lucide-react'

// Import our new components
import MedicalInstitutionFields from './MedicalInstitutionFields'

// Define local types
interface InstitutionData {
  name: string
  country: string
  type: string
  city: string
  state: string
}

interface MedicalProfileValidation {
  isValid: boolean
  errors: Array<{ field: string; message: string }>
  warnings: Array<{ field: string; message: string }>
  completionScore: number
}

interface MedicalProfile {
  id: string
  specialties: string[]
  careerStage: string
  specialtyPreference: string
  institutions: InstitutionData[]
  city: string
  gender: string
  genderPreference: string
  age?: number
}

interface MatchingResult {
  user2: MedicalProfile
  compatibility: { overall: number }
  matchReasons: string[]
}

interface MedicalProfessionalFormProps {
  onSubmit?: (data: Record<string, unknown>) => void
  onCancel?: () => void
  isLoading?: boolean
}

export default function MedicalProfessionalForm({ 
  onSubmit, 
  onCancel, 
  isLoading = false 
}: MedicalProfessionalFormProps) {
  // Form state
  const [specialties, setSpecialties] = useState<string[]>([])
  const [careerStage, setCareerStage] = useState<string>('')
  const [specialtyPreference, setSpecialtyPreference] = useState<string>('no_preference')
  const [institutions, setInstitutions] = useState<InstitutionData[]>([])
  const [basicInfo, setBasicInfo] = useState({
    firstName: '',
    lastName: '',
    age: '',
    city: '',
    gender: 'male'
  })

  // Validation state
  const [validation, setValidation] = useState<MedicalProfileValidation | null>(null)
  const [showValidation, setShowValidation] = useState(false)

  // Sample users for matching demonstration
  const [sampleProfiles] = useState<MedicalProfile[]>([
    {
      id: '1',
      specialties: ['Internal Medicine', 'Cardiology'],
      careerStage: 'attending_5_plus',
      specialtyPreference: 'same_specialty',
      institutions: [
        { name: 'Harvard Medical School', country: 'United States', type: 'Medical School', city: 'Boston', state: 'MA' }
      ],
      city: 'Boston',
      gender: 'male',
      genderPreference: 'no_preference',
      age: 45
    },
    {
      id: '2',
      specialties: ['Emergency Medicine', 'Critical Care Medicine'],
      careerStage: 'fellow',
      specialtyPreference: 'different_specialties',
      institutions: [
        { name: 'Johns Hopkins School of Medicine', country: 'United States', type: 'Medical School', city: 'Baltimore', state: 'MD' }
      ],
      city: 'Baltimore',
      gender: 'female',
      genderPreference: 'no_preference',
      age: 32
    }
  ])

  const [matchingResults, setMatchingResults] = useState<MatchingResult[]>([])

  // Validate form data
  const validateForm = () => {
    const validationResult: MedicalProfileValidation = {
      isValid: specialties.length > 0 && careerStage !== '',
      errors: [],
      warnings: [],
      completionScore: 0
    }
    
    if (specialties.length === 0) {
      validationResult.errors.push({ field: 'specialties', message: 'Please select at least one specialty' })
    }
    if (careerStage === '') {
      validationResult.errors.push({ field: 'careerStage', message: 'Please select a career stage' })
    }
    
    setValidation(validationResult)
    setShowValidation(true)
    return validationResult.isValid
  }

  // Demonstrate matching with sample users
  const demonstrateMatching = () => {
    if (specialties.length === 0 || !careerStage) {
      console.log('Please select specialties and career stage first')
      return
    }

    const results: MatchingResult[] = sampleProfiles.map(user => ({
      user2: user,
      compatibility: { overall: Math.random() * 0.4 + 0.6 }, // Random score between 60-100%
      matchReasons: ['Similar specialties', 'Same career stage']
    }))
    setMatchingResults(results)
  }

  const handleSubmit = () => {
    if (validateForm()) {
      const formData = {
        specialties,
        careerStage,
        specialtyPreference,
        institutions,
        basicInfo
      }
      onSubmit?.(formData)
    }
  }

  const validationStatus = validation ? {
    color: validation.isValid ? 'green' : validation.errors.length > 0 ? 'red' : 'yellow',
    message: validation.isValid ? 'Profile is valid' : validation.errors.length > 0 ? 'Please fix errors' : 'Profile needs attention'
  } : null

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Stethoscope className="h-8 w-8 text-blue-600" />
            Medical Professional User
          </CardTitle>
          <p className="text-gray-600">
            Complete your medical background information to enable better matching with other healthcare professionals.
          </p>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <input
                    type="text"
                    value={basicInfo.firstName}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    type="text"
                    value={basicInfo.lastName}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Age</label>
                  <input
                    type="number"
                    value={basicInfo.age}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, age: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Age"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <input
                    type="text"
                    value={basicInfo.city}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Gender</label>
                  <select
                    value={basicInfo.gender}
                    onChange={(e) => setBasicInfo(prev => ({ ...prev, gender: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specialty Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-blue-600" />
                Medical Specialties
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {['Internal Medicine', 'Emergency Medicine', 'Cardiology', 'Pediatrics', 'Surgery', 'Psychiatry'].map((specialty) => (
                  <div key={specialty} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={specialty}
                      checked={specialties.includes(specialty)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSpecialties([...specialties, specialty])
                        } else {
                          setSpecialties(specialties.filter(s => s !== specialty))
                        }
                      }}
                    />
                    <label htmlFor={specialty} className="text-sm">{specialty}</label>
                  </div>
                ))}
              </div>
              {showValidation && validation?.errors.find(e => e.field === 'specialties') && (
                <p className="text-red-500 text-sm">{validation.errors.find(e => e.field === 'specialties')?.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Career Stage Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-blue-600" />
                Career Stage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {['Medical Student', 'Resident', 'Fellow', 'Attending Physician'].map((stage) => (
                  <div key={stage} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={stage}
                      name="careerStage"
                      value={stage}
                      checked={careerStage === stage}
                      onChange={(e) => setCareerStage(e.target.value)}
                    />
                    <label htmlFor={stage} className="text-sm">{stage}</label>
                  </div>
                ))}
              </div>
              {showValidation && validation?.errors.find(e => e.field === 'careerStage') && (
                <p className="text-red-500 text-sm">{validation.errors.find(e => e.field === 'careerStage')?.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Specialty Preference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Specialty Preference for Matching
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="specialtyPreference"
                    value="same_specialty"
                    checked={specialtyPreference === 'same_specialty'}
                    onChange={(e) => setSpecialtyPreference(e.target.value)}
                  />
                  <span>Same specialty preferred</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="specialtyPreference"
                    value="different_specialties"
                    checked={specialtyPreference === 'different_specialties'}
                    onChange={(e) => setSpecialtyPreference(e.target.value)}
                  />
                  <span>Different specialties preferred</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="specialtyPreference"
                    value="no_preference"
                    checked={specialtyPreference === 'no_preference'}
                    onChange={(e) => setSpecialtyPreference(e.target.value)}
                  />
                  <span>No preference</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Medical Institutions */}
          <Card>
            <CardContent className="pt-6">
              <MedicalInstitutionFields
                institutions={institutions}
                onInstitutionsChange={setInstitutions}
                error={showValidation ? validation?.errors.find(e => e.field === 'institutions')?.message : undefined}
                maxInstitutions={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Validation Status */}
          {showValidation && validation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {validationStatus?.color === 'green' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : validationStatus?.color === 'yellow' ? (
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  Validation Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className={`p-3 rounded-lg ${
                  validationStatus?.color === 'green' ? 'bg-green-50 border border-green-200' :
                  validationStatus?.color === 'yellow' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-red-50 border border-red-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    validationStatus?.color === 'green' ? 'text-green-800' :
                    validationStatus?.color === 'yellow' ? 'text-yellow-800' :
                    'text-red-800'
                  }`}>
                    {validationStatus?.message}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Completion Score: {validation.completionScore}%
                  </p>
                </div>

                {validation.errors.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-red-800 mb-2">Errors:</h4>
                    <ul className="space-y-1">
                      {validation.errors.map((error, index) => (
                        <li key={index} className="text-xs text-red-700 flex items-center gap-1">
                          <div className="w-1 h-1 bg-red-500 rounded-full" />
                          {error.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Warnings:</h4>
                    <ul className="space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <li key={index} className="text-xs text-yellow-700 flex items-center gap-1">
                          <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                          {warning.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Matching Demo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
                Matching Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Test your profile against sample medical professionals to see compatibility scores.
              </p>
              <Button 
                onClick={demonstrateMatching}
                className="w-full"
                disabled={specialties.length === 0 || !careerStage}
              >
                Test Matching
              </Button>

              {matchingResults.length > 0 && (
                <div className="space-y-3">
                  <Separator />
                  <h4 className="text-sm font-medium">Matching Results:</h4>
                  {matchingResults.map((result, index) => (
                    <div key={index} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {result.user2.specialties.join(', ')}
                        </span>
                        <Badge variant="outline">
                          {Math.round(result.compatibility.overall * 100)}%
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <p>Career: {result.user2.careerStage}</p>
                        <p>Location: {result.user2.city}</p>
                        {result.matchReasons.length > 0 && (
                          <p className="text-green-600">
                            ✓ {result.matchReasons[0]}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Button 
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save User'}
                </Button>
                {onCancel && (
                  <Button 
                    variant="outline" 
                    onClick={onCancel}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
