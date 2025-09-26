'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle,
  User,
  Stethoscope,
  Heart,
  Users,
  Calendar,
  Loader2
} from 'lucide-react'

interface CompleteStepProps {
  data: Record<string, unknown>
  onNext: (data?: Record<string, unknown>) => void
  onPrevious: () => void
  isSubmitting: boolean
  isLastStep: boolean
}

export default function CompleteStep({
  data,
  onNext,
  onPrevious,
  isSubmitting
}: CompleteStepProps) {
  const handleFinish = () => {
    onNext()
  }

  // Helper function to format array data
  const formatArrayData = (arr: string[] | undefined): string => {
    if (!arr || arr.length === 0) return 'None specified'
    if (arr.length <= 3) return arr.join(', ')
    return `${arr.slice(0, 3).join(', ')} and ${arr.length - 3} more`
  }


  // Helper function to format kebab-case to readable text
  const formatKebabCase = (text: string | undefined): string => {
    if (!text) return 'Not specified'
    return text.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  // Helper function to get basic info from nested data
  const getBasicInfo = (): {
    firstName: string;
    lastName: string;
    age: string;
    city: string;
    nationality: string;
  } => {
    const basic = (data.basic as Record<string, unknown>) || {}
    return {
      firstName: (typeof basic.fullName === 'string' ? basic.fullName.split(' ')[0] : undefined) || (typeof data.firstName === 'string' ? data.firstName : undefined) || 'Not specified',
      lastName: (typeof basic.fullName === 'string' ? basic.fullName.split(' ').slice(1).join(' ') : undefined) || (typeof data.lastName === 'string' ? data.lastName : undefined) || 'Not specified',
      age: (typeof basic.age === 'string' ? basic.age : undefined) || (typeof data.age === 'string' ? data.age : undefined) || 'Not specified',
      city: (typeof basic.city === 'string' ? basic.city : undefined) || (typeof data.city === 'string' ? data.city : undefined) || 'Not specified',
      nationality: (typeof basic.nationality === 'string' ? basic.nationality : undefined) || (typeof data.nationality === 'string' ? data.nationality : undefined) || 'Not specified'
    }
  }

  const basicInfo = getBasicInfo()

  return (
    <div className="space-y-8">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          User Setup Complete!
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Great job! We now have all the information we need to start matching you
          with compatible medical professionals in your area.
        </p>
      </div>

      {/* User Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">User Summary</CardTitle>
          <p className="text-sm text-gray-600">Here's what we've learned about you:</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-medium">
              <User className="w-4 h-4" />
              Basic Information
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span> {basicInfo.firstName} {basicInfo.lastName}
              </div>
              <div>
                <span className="text-gray-600">Age:</span> {basicInfo.age}
              </div>
              <div>
                <span className="text-gray-600">Location:</span> {basicInfo.city}
              </div>
              <div>
                <span className="text-gray-600">Nationality:</span> {basicInfo.nationality}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Medical Background */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-medium">
              <Stethoscope className="w-4 h-4" />
              Medical Background
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Primary Specialty:</span> {(data.medicalSpecialty as string | undefined) || 'Not specified'}
              </div>
              <div>
                <span className="text-gray-600">Career Stage:</span> {`${formatKebabCase(data.careerStage as string | undefined) || 'Not specified'}`}
              </div>
              <div>
                <span className="text-gray-600">Looking for:</span> {(data.lookingFor as string | undefined) || 'Not specified'}
              </div>
              {(() => {
                const specialties = data.specialties as string[] | undefined;
                if (specialties && Array.isArray(specialties) && specialties.length > 0) {
                  return (
                <div>
                      <span className="text-gray-600">Additional interests:</span> {formatArrayData(specialties as string[]) || 'None specified'}
                </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Interests */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-medium">
              <Heart className="w-4 h-4" />
              Interests & Activities
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Sports:</span> {formatArrayData(data.sports as string[] | undefined) || 'None specified'}
              </div>
              <div>
                <span className="text-gray-600">Activities:</span> {formatArrayData(data.activities as string[] | undefined) || 'None specified'}
              </div>
              <div>
                <span className="text-gray-600">Bio:</span> {(data.bio as string | undefined) || 'Not specified'}
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-medium">
              <Users className="w-4 h-4" />
              Social Preferences
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {(() => {
                const genderPreference = data.genderPreference as string | undefined;
                if (genderPreference && typeof genderPreference === 'string') {
                  return (
                <div>
                      <span className="text-gray-600">Gender preference:</span> {formatKebabCase(genderPreference as string) || 'Not specified'}
                    </div>
                  );
                }
                return null;
              })()}
              {(() => {
                const activityLevel = data.activityLevel as string | undefined;
                if (activityLevel && typeof activityLevel === 'string') {
                  return (
                    <div>
                      <span className="text-gray-600">Activity level:</span> {formatKebabCase(activityLevel as string) || 'Not specified'}
                </div>
                  );
                }
                return null;
              })()}
              {(() => {
                const socialEnergy = data.socialEnergy as string | undefined;
                if (socialEnergy && typeof socialEnergy === 'string') {
                  return (
                <div>
                      <span className="text-gray-600">Social energy:</span> {formatKebabCase(socialEnergy as string) || 'Not specified'}
                    </div>
                  );
                }
                return null;
              })()}
              {(() => {
                const meetingFrequency = data.meetingFrequency as string | undefined;
                if (meetingFrequency && typeof meetingFrequency === 'string') {
                  return (
                    <div>
                      <span className="text-gray-600">Meeting frequency:</span> {formatKebabCase(meetingFrequency as string) || 'Not specified'}
                </div>
                  );
                }
                return null;
              })()}
              {(() => {
                const conversationStyle = data.conversationStyle as string | undefined;
                if (conversationStyle && typeof conversationStyle === 'string') {
                  return (
                <div>
                      <span className="text-gray-600">Conversation style:</span> {formatKebabCase(conversationStyle as string) || 'Not specified'}
                </div>
                  );
                }
                return null;
              })()}
            </div>
          </div>

          <div className="border-t border-gray-200 my-6"></div>

          {/* Lifestyle */}
          {(data.lifeStage || data.idealWeekend) && (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-medium">
                  <Calendar className="w-4 h-4" />
                  Lifestyle
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {(() => {
                    const lifeStage = data.lifeStage as string | undefined;
                    if (lifeStage && typeof lifeStage === 'string') {
                      return (
                    <div>
                          <span className="text-gray-600">Life stage:</span> {formatKebabCase(lifeStage as string) || 'Not specified'}
                    </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
              <div className="border-t border-gray-200 my-6"></div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-700">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              1
            </div>
            <p className="text-sm">
              Our matching algorithm will analyze your profile and find compatible medical professionals
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              2
            </div>
            <p className="text-sm">
              You'll receive your first matches within 24 hours via email and in your dashboard
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              3
            </div>
            <p className="text-sm">
              Start connecting with your matches through our secure messaging system
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
              4
            </div>
            <p className="text-sm">
              Plan meetups and build meaningful professional and personal connections
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Go Back
        </Button>
        <Button
          onClick={handleFinish}
          disabled={isSubmitting}
          className="min-w-[120px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Setting up...
            </>
          ) : (
            'Complete Setup'
          )}
        </Button>
      </div>
    </div>
  )
}