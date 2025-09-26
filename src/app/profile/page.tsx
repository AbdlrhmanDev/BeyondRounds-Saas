'use client'
 
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  User,
  MapPin,
  Edit,
  Save,
  X,
  Camera,
  Stethoscope,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
 
export default function ProfilePage() {
  const { user, profile, isLoading } = useAuthUser()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    city: '',
    medical_specialty: '',
    age: 0
  })
  const [isSaving, setIsSaving] = useState(false)
 
  const supabase = createClient()
 
  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        city: profile.city || '',
        medical_specialty: profile.medical_specialty || '',
        age: profile.age || 0
      })
    }
  }, [profile])
 
  const handleSave = async () => {
    if (!user || !profile) return
 
    setIsSaving(true)
    try {
      // Get the user's profile ID
      const { data: userData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()
 
      if (profileError || !userData) {
        throw new Error('Could not find user profile')
      }
 
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: formData.first_name,
          last_name: formData.last_name,
          bio: formData.bio,
          city: formData.city,
          medical_specialty: formData.medical_specialty,
          age: formData.age,
          updated_at: new Date().toISOString()
        })
        .eq('id', userData.id)
 
      if (error) throw error
 
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }
 
  const handleCancel = () => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        bio: profile.bio || '',
        city: profile.city || '',
        medical_specialty: profile.medical_specialty || '',
        age: profile.age || 0
      })
    }
    setIsEditing(false)
  }
 
  if (!user) {
    return <ProtectedRoute><div /></ProtectedRoute>
  }
 
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950 flex items-center justify-center">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
 
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950 flex items-center justify-center">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="p-6 text-center">
            <User className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Profile Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              We couldn't load your profile. Please try refreshing the page.
            </p>
            <Button onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-blue-200 dark:border-blue-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                BeyondRounds
              </div>
            </div>
            <Badge variant="secondary">My Profile</Badge>
          </div>
        </div>
      </div>
 
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-blue-800 dark:text-blue-200">My Profile</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your professional profile and preferences
          </p>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src="/placeholder-user.jpg" alt={`${profile.first_name} ${profile.last_name}`} />
                    <AvatarFallback className="bg-blue-600 text-white text-2xl">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full"
                      variant="outline"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                
                <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-1">
                  {profile.first_name} {profile.last_name}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mb-2">{profile.medical_specialty}</p>
                
                <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profile.city}
                </div>
 
                <div className="space-y-2">
                  <Badge variant="secondary" className="w-full justify-center">
                    {profile.is_verified ? 'Verified' : 'Unverified'}
                  </Badge>
                  <Badge variant="outline" className="w-full justify-center">
                    {profile.profile_completion || 0}% Complete
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
 
          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-blue-700 dark:text-blue-300">Profile Information</CardTitle>
                  {!isEditing ? (
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => router.push('/profile/edit')} 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Button 
                        onClick={() => setIsEditing(true)} 
                        variant="outline"
                      >
                        Quick Edit
                      </Button>
                    </div>
                  ) : (
                    <div className="flex space-x-2">
                      <Button onClick={handleCancel} variant="outline">
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isSaving ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={user.email}
                        disabled
                        className="bg-gray-50 dark:bg-gray-800"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
 
                <Separator />
 
                {/* Professional Information */}
                <div>
                  <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-4">Professional Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="medical_specialty">Medical Specialty</Label>
                      <Input
                        id="medical_specialty"
                        value={formData.medical_specialty}
                        onChange={(e) => setFormData({ ...formData, medical_specialty: e.target.value })}
                        disabled={!isEditing}
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 0 })}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
 
                <Separator />
 
                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-4">Additional Information</h3>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        disabled={!isEditing}
                        rows={4}
                        placeholder="Tell us about yourself, your experience, and what you're looking for..."
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}