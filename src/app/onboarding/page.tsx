'use client'
 
import React, { useState, Suspense, lazy } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { User, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import type { UserFormData } from '@/lib/types'
import type { InstitutionData } from '@/components/molecules/MedicalInstitutionSelection'
import type { User as SupabaseUser } from '@supabase/supabase-js'

// Lazy load heavy components for better performance
const BasicInformationStep = lazy(() => import('@/components/onboarding/BasicInformationStep'))
const MedicalBackgroundStep = lazy(() => import('@/components/onboarding/MedicalBackgroundStep'))
const MedicalInstitutionSelection = lazy(() => import('@/components/molecules/MedicalInstitutionSelection'))
const InterestsStep = lazy(() => import('@/components/onboarding/InterestsStep'))
const LifestyleGoalsStep = lazy(() => import('@/components/onboarding/LifestyleGoalsStep'))
const PreferencesStep = lazy(() => import('@/components/onboarding/PreferencesStep'))
const AvailabilityStep = lazy(() => import('@/components/onboarding/AvailabilityStep'))
const VerificationStep = lazy(() => import('@/components/onboarding/VerificationStep'))
const CompleteStep = lazy(() => import('@/components/onboarding/CompleteStep'))
 
// Import types
// import type { InstitutionData } from '@/components/features/profile/MedicalInstitutionSelection' // Unused import
 
const ONBOARDING_STEPS = [
  { id: 'basic-info', title: 'Basic Information', component: BasicInformationStep },
  { id: 'medical-background', title: 'Medical Background', component: MedicalBackgroundStep },
  { id: 'medical-institutions', title: 'Medical Institutions', component: null }, // Custom component
  { id: 'interests', title: 'Interests', component: InterestsStep },
  { id: 'lifestyle-goals', title: 'Lifestyle Goals', component: LifestyleGoalsStep },
  { id: 'preferences', title: 'Preferences', component: PreferencesStep },
  { id: 'availability', title: 'Availability', component: AvailabilityStep },
  { id: 'verification', title: 'Identity Verification', component: VerificationStep },
  { id: 'complete', title: 'Complete', component: CompleteStep },
]
 
export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Partial<UserFormData> & { basic?: any }>({})
  const [institutions, setInstitutions] = useState<InstitutionData[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isCompleted, setIsCompleted] = useState(false)
 
  // Get user on component mount
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/auth/login')
        return
      }
      setUser(authUser as SupabaseUser)
    }
    getUser()
  }, [supabase, router])
 
  // Early return if completed to prevent re-renders
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  const currentStepData = ONBOARDING_STEPS[currentStep]
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100

  // Debug current step
  console.log('Current step:', { 
    currentStep, 
    stepId: currentStepData?.id, 
    stepTitle: currentStepData?.title,
    hasComponent: !!currentStepData?.component 
  })
 
  const handleNext = (stepData: Partial<UserFormData>) => {
    // Prevent navigation if already completed
    if (isCompleted) return
    
    console.log('handleNext called with:', { stepData, currentStep, totalSteps: ONBOARDING_STEPS.length })
    setFormData(prev => ({ ...prev, ...stepData }))
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      console.log('Moving to next step:', currentStep + 1)
      setCurrentStep(prev => prev + 1)
    } else {
      console.log('Completing onboarding')
      // Complete onboarding
      handleComplete()
    }
  }
 
  const handlePrevious = () => {
    // Prevent navigation if already completed
    if (isCompleted) return
    
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }
 
  const handleComplete = async () => {
    setIsLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
 
      console.log('Completing onboarding for user:', user.id)
 
      // Use the simple profile API
      const { profileAPI } = await import('@/lib/api')
      
      // Prepare form data for the API
      const completeFormData = {
        ...formData,
        completeOnboarding: true,
      }
 
      console.log('Calling createOrUpdateProfile with data:', completeFormData)

      // Check if profile exists first
      let existingProfile = null;
      try {
        existingProfile = await profileAPI.getProfile(user.id);
      } catch {
        console.log('No existing profile found, will create new one');
      }

      let updatedProfile;
      if (existingProfile) {
        // Update existing profile
        const ageValue = formData.basic?.age ? parseInt(formData.basic.age) : null;
        updatedProfile = await profileAPI.updateProfile(user.id, {
          first_name: formData.basic?.fullName?.split(' ')[0] || formData.firstName,
          last_name: formData.basic?.fullName?.split(' ').slice(1).join(' ') || formData.lastName,
          age: ageValue,
          gender: formData.basic?.gender || formData.gender,
          nationality: formData.basic?.nationality || formData.nationality,
          city: formData.basic?.city || formData.city,
          medical_specialty: formData.medicalSpecialty,
          onboarding_completed: true,
          profile_completion: 100,
        })
      } else {
        // Create new profile
        const ageValue = formData.basic?.age ? parseInt(formData.basic.age) : null;
        updatedProfile = await profileAPI.createProfile({
          user_id: user.id,
          first_name: formData.basic?.fullName?.split(' ')[0] || formData.firstName || '',
          last_name: formData.basic?.fullName?.split(' ').slice(1).join(' ') || formData.lastName || '',
          age: ageValue,
          gender: formData.basic?.gender || formData.gender,
          nationality: formData.basic?.nationality || formData.nationality,
          city: formData.basic?.city || formData.city || 'Not specified',
          medical_specialty: formData.medicalSpecialty || 'Not specified',
          onboarding_completed: true,
          profile_completion: 100,
        })
      }
 
      console.log('User completed successfully:', updatedProfile)
      toast.success('User completed successfully!')
      
      // Set completion flag to prevent re-renders
      setIsCompleted(true)
      
      // Redirect immediately to prevent page refresh/reset
      router.replace('/dashboard')
    } catch (error) {
      console.error('Error:', error)
      console.error('Error details:', error)
      toast.error(`Something went wrong: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }
 
  const renderStep = () => {
    if (currentStepData.id === 'medical-institutions') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Medical Institutions</h3>
          </div>
          
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading institutions...
            </div>
          }>
            <MedicalInstitutionSelection
              institutions={institutions}
              onInstitutionsChange={setInstitutions}
              maxInstitutions={3}
            />
          </Suspense>
          
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={handlePrevious}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button 
              onClick={() => handleNext({ 
                institutions: institutions.map(inst => ({
                  id: inst.name, // Use name as ID for now
                  name: inst.name,
                  type: inst.type,
                  location: `${inst.city}, ${inst.country}`,
                  website: undefined,
                  description: undefined
                }))
              })}
              disabled={institutions.length === 0}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            {/* Debug info */}
            <div className="text-xs text-gray-500 mt-2">
              Institutions selected: {institutions.length} (Button disabled: {institutions.length === 0 ? 'Yes' : 'No'})
            </div>
          </div>
        </div>
      )
    }
 
 
 
    if (currentStepData.component) {
      const StepComponent = currentStepData.component as React.ComponentType<{
        data?: Partial<UserFormData>
        // eslint-disable-next-line no-unused-vars
        onNext: (data: Partial<UserFormData>) => void
        onPrevious: () => void
        [key: string]: unknown
      }>
      const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
      
      // Special handling for CompleteStep
      if (currentStepData.id === 'complete') {
        return (
          <Suspense fallback={
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
              Loading...
            </div>
          }>
            <StepComponent
              data={formData}
              onNext={(data?: Partial<UserFormData>) => handleNext(data || {})}
              onPrevious={currentStep > 0 ? handlePrevious : () => {}}
              isSubmitting={isLoading}
              isLastStep={isLastStep}
            />
          </Suspense>
        )
      }
      
      return (
        <Suspense fallback={
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            Loading...
          </div>
        }>
          <StepComponent
            data={formData}
            onNext={(data?: Partial<UserFormData>) => handleNext(data || {})}
            onPrevious={currentStep > 0 ? handlePrevious : () => {}}
            userId={user?.id || ''}
          />
        </Suspense>
      )
    }
 
    return null
  }
 
  // Show loading while user is being fetched
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }
 
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Complete Your User
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Step {currentStep + 1} of {ONBOARDING_STEPS.length}: {currentStepData.title}
          </p>
        </div>
 
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            Progress
            {Math.round(progress)}%
          </div>
          <Progress value={progress} className="h-2" />
        </div>
 
        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              {currentStepData.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStep()}
          </CardContent>
        </Card>
 
        {/* Cancel Option */}
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}