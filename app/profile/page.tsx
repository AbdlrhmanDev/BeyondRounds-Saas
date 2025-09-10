"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Heart, 
  User, 
  Mail, 
  MapPin, 
  Stethoscope, 
  Edit, 
  Save, 
  X, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ArrowLeft,
  Phone,
  Calendar,
  Building
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  specialty: string
  city: string
  phone?: string
  bio?: string
  years_experience?: number
  hospital_affiliation?: string
  is_verified: boolean
  is_paid: boolean
  created_at: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({})
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push("/auth/login")
          return
        }
        setUser(user)

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError) {
          console.error("Error loading profile:", profileError)
          toast.error("Failed to load profile")
        } else {
          setProfile(profileData)
          setEditForm(profileData)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading profile:", error)
        setIsLoading(false)
        toast.error("Failed to load profile")
      }
    }

    loadProfile()
  }, [router, supabase])

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName && firstName.trim() ? firstName.trim()[0] : ''
    const last = lastName && lastName.trim() ? lastName.trim()[0] : ''
    return first || last ? `${first}${last}`.toUpperCase() : 'U'
  }

  const handleSave = async () => {
    if (!profile) return
    
    setIsSaving(true)
    try {
      const updateData: any = {
        first_name: editForm.first_name?.trim(),
        last_name: editForm.last_name?.trim(),
        specialty: editForm.specialty?.trim(),
        city: editForm.city?.trim(),
        bio: editForm.bio?.trim(),
        updated_at: new Date().toISOString()
      }

      // Only include optional fields if they have values
      if (editForm.phone?.trim()) updateData.phone = editForm.phone.trim()
      if (editForm.years_experience !== undefined && editForm.years_experience > 0) {
        updateData.years_experience = editForm.years_experience
      }
      if (editForm.hospital_affiliation?.trim()) {
        updateData.hospital_affiliation = editForm.hospital_affiliation.trim()
      }

      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", profile.id)

      if (error) {
        console.error("Error updating profile:", error)
        toast.error("Failed to update profile")
      } else {
        setProfile({ ...profile, ...editForm })
        setIsEditing(false)
        toast.success("Profile updated successfully!")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    }
    setIsSaving(false)
  }

  const handleCancel = () => {
    setEditForm(profile || {})
    setIsEditing(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Heart className="w-5 h-5 text-white animate-pulse" />
          </div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-blue-500/5">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">BeyondRounds</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Profile Header */}
        <div className="mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="p-8">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarFallback className="bg-gradient-to-r from-violet-500 to-blue-500 text-white text-2xl font-bold">
                      {profile ? getInitials(profile.first_name || '', profile.last_name || '') : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {profile ? `${profile.first_name || 'Unknown'} ${profile.last_name || 'User'}` : "User Profile"}
                    </h1>
                    <p className="text-lg text-gray-600 mb-4">{profile?.specialty}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {profile?.is_verified ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <span className="text-sm text-green-600 font-medium">Verified</span>
                          </>
                        ) : (
                          <>
                            <Clock className="w-5 h-5 text-amber-500" />
                            <span className="text-sm text-amber-600 font-medium">Pending Verification</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {profile?.is_paid ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-blue-500" />
                            <span className="text-sm text-blue-600 font-medium">Active Subscription</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <span className="text-sm text-red-600 font-medium">No Active Plan</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button 
                      onClick={() => setIsEditing(true)}
                      className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={editForm.first_name || ""}
                        onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={editForm.last_name || ""}
                        onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      value={editForm.specialty || ""}
                      onChange={(e) => setEditForm({ ...editForm, specialty: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={editForm.city || ""}
                      onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={editForm.phone || ""}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">{profile?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">{profile?.city}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Stethoscope className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Specialty</p>
                      <p className="text-gray-600">{profile?.specialty}</p>
                    </div>
                  </div>
                  
                  {profile?.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-gray-600">{profile.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="font-medium">Member Since</p>
                      <p className="text-gray-600">
                        {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        }) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <>
                  <div>
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      type="number"
                      value={editForm.years_experience || ""}
                      onChange={(e) => setEditForm({ ...editForm, years_experience: parseInt(e.target.value) || undefined })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="hospitalAffiliation">Hospital/Institution</Label>
                    <Input
                      id="hospitalAffiliation"
                      value={editForm.hospital_affiliation || ""}
                      onChange={(e) => setEditForm({ ...editForm, hospital_affiliation: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={editForm.bio || ""}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      placeholder="Tell us about your professional background, interests, and what you hope to gain from networking..."
                    />
                  </div>
                </>
              ) : (
                <>
                  {profile?.years_experience && (
                    <div>
                      <p className="font-medium">Years of Experience</p>
                      <p className="text-gray-600">{profile.years_experience} years</p>
                    </div>
                  )}
                  
                  {profile?.hospital_affiliation && (
                    <div>
                      <p className="font-medium">Hospital/Institution</p>
                      <p className="text-gray-600">{profile.hospital_affiliation}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="font-medium">Professional Bio</p>
                    <p className="text-gray-600">
                      {profile?.bio || "No bio provided yet. Click 'Edit Profile' to add your professional background and interests."}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Status */}
        <div className="mt-8">
          <Card className="bg-white/60 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-lg">
                  {profile?.is_verified ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <div>
                        <h3 className="font-semibold text-green-800">Verified Account</h3>
                        <p className="text-sm text-green-600">Your medical credentials have been verified</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Clock className="w-8 h-8 text-amber-500" />
                      <div>
                        <h3 className="font-semibold text-amber-800">Verification Pending</h3>
                        <p className="text-sm text-amber-600">Please complete verification to access all features</p>
                        <Link href="/verify" className="text-sm text-blue-600 hover:underline">
                          Complete Verification →
                        </Link>
                      </div>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-lg">
                  {profile?.is_paid ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-blue-500" />
                      <div>
                        <h3 className="font-semibold text-blue-800">Active Subscription</h3>
                        <p className="text-sm text-blue-600">Enjoying full access to all features</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-8 h-8 text-red-500" />
                      <div>
                        <h3 className="font-semibold text-red-800">No Active Plan</h3>
                        <p className="text-sm text-red-600">Subscribe to access weekly matches</p>
                        <Link href="/pricing" className="text-sm text-blue-600 hover:underline">
                          View Plans →
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
