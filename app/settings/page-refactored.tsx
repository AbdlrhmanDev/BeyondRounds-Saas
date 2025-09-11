"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { 
  Settings,
  User, 
  CreditCard, 
  CheckCircle, 
  AlertCircle,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"

// Custom hooks
import { useAuth } from "@/hooks/use-auth"
import { useProfileForm } from "@/hooks/use-profile-form"

// Components
import { LoadingSpinner, ErrorMessage } from "@/components/ui/common"
import ComprehensiveProfileForm from "@/components/comprehensive-profile-form"
import { ProfileFormData, UserProfile } from "@/lib/types/profile"

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading, error: authError } = useAuth()
  const { isLoading: formLoading, error: formError, saveProfile, convertProfileToFormData } = useProfileForm(user?.id || null)
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return

      try {
        const supabase = createClient()
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Error loading profile:", profileError)
          return
        }

        setProfile(profileData)
      } catch (error) {
        console.error("Error loading profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleProfileSubmit = async (formData: ProfileFormData) => {
    try {
      await saveProfile(formData)
      
      // Refresh profile data
      if (user) {
        const supabase = createClient()
        const { data: updatedProfileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (updatedProfileData) {
          setProfile(updatedProfileData)
        }
      }

      // Show success message if profile is complete
      if (profile && profile.profile_completion_percentage && profile.profile_completion_percentage >= 80) {
        setTimeout(() => {
          toast.success("🎉 Profile complete! You're now ready for matching.", {
            duration: 5000,
            description: "You'll receive weekly matches every Thursday at 4 PM."
          })
        }, 1000)
      }
      
    } catch (error) {
      console.error("Profile submission failed:", error)
    }
  }

  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your settings...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (authError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage
          title="Authentication Error"
          message={authError}
          onRetry={() => window.location.reload()}
        />
      </div>
    )
  }

  // No profile state
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Profile Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              We couldn't load your profile data. Please try again or contact support.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Settings className="h-6 w-6" />
                  Settings
                </h1>
                <p className="text-gray-600">Manage your profile and preferences</p>
              </div>
            </div>
            
            {/* Profile Status */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  {profile.profile_completion_percentage && profile.profile_completion_percentage >= 80 ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                  )}
                  <span className="text-sm font-medium">
                    Profile {profile.profile_completion_percentage || 0}% Complete
                  </span>
                </div>
                <Progress value={profile.profile_completion_percentage || 0} className="w-32 h-2 mt-1" />
              </div>
              
              <div className="flex gap-2">
                {profile.is_verified && (
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {profile.is_paid && (
                  <Badge variant="default" className="bg-blue-100 text-blue-800">
                    <CreditCard className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Complete Your Profile</CardTitle>
                  <CardDescription>
                    Help us find the best matches for you by providing detailed information about your preferences and interests.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.profile_completion_percentage && profile.profile_completion_percentage < 80 && (
                    <Alert className="mb-6">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your profile is {profile.profile_completion_percentage}% complete. 
                        Complete your profile to get better matches and access all features.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  <ComprehensiveProfileForm
                    initialData={convertProfileToFormData(profile)}
                    onSubmit={handleProfileSubmit}
                    isLoading={formLoading}
                  />
                  
                  {/* Profile Completion Success Message */}
                  {profile.profile_completion_percentage && profile.profile_completion_percentage >= 80 && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <h3 className="text-lg font-semibold text-green-800">Profile Complete!</h3>
                      </div>
                      <p className="text-green-700 mb-4">
                        Congratulations! Your profile is now {profile.profile_completion_percentage}% complete. 
                        You're ready to start receiving weekly matches.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Link href="/dashboard">
                          <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                            Go to Dashboard
                          </Button>
                        </Link>
                        {!profile.is_verified && (
                          <Link href="/verify">
                            <Button variant="outline" className="w-full sm:w-auto">
                              Complete Verification
                            </Button>
                          </Link>
                        )}
                        {!profile.is_paid && (
                          <Link href="/pricing">
                            <Button variant="outline" className="w-full sm:w-auto">
                              View Subscription Plans
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your account preferences and security settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Account Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Email Address</Label>
                      <p className="text-sm text-gray-900">{profile.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Member Since</Label>
                      <p className="text-sm text-gray-900">
                        {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Account Status</Label>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={profile.is_verified ? "default" : "secondary"}>
                          {profile.is_verified ? "Verified" : "Unverified"}
                        </Badge>
                        <Badge variant={profile.is_paid ? "default" : "outline"}>
                          {profile.is_paid ? "Premium" : "Free"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Privacy & Safety</h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start">
                      Manage Privacy Settings
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Block List
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      Report an Issue
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4 text-red-600">Danger Zone</h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                      Deactivate Account
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing & Subscription</CardTitle>
                <CardDescription>
                  Manage your subscription and billing information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Current Plan</h3>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">
                          {profile.is_paid ? "Premium Plan" : "Free Plan"}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {profile.is_paid 
                            ? "Access to all features and unlimited matches"
                            : "Limited features and matches"
                          }
                        </p>
                      </div>
                      <Badge variant={profile.is_paid ? "default" : "outline"}>
                        {profile.is_paid ? "Active" : "Free"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {!profile.is_paid && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Upgrade to Premium</h3>
                    <div className="border rounded-lg p-4 bg-blue-50">
                      <h4 className="font-medium text-blue-900">Premium Benefits</h4>
                      <ul className="text-sm text-blue-800 mt-2 space-y-1">
                        <li>• Unlimited matches per week</li>
                        <li>• Advanced filtering options</li>
                        <li>• Priority customer support</li>
                        <li>• Exclusive events and features</li>
                      </ul>
                      <Button className="mt-4 w-full">
                        Upgrade to Premium
                      </Button>
                    </div>
                  </div>
                )}

                {profile.is_paid && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">Billing History</h3>
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No billing history available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

// Import statements
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
