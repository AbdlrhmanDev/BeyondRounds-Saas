'use client'
 
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  User, 
  Bell,
  Shield,
  Eye,
  Stethoscope,
  Loader2
} from 'lucide-react'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
 
export default function ProfileSettingsPage() {
  const { user, profile, isLoading } = useAuthUser()
  const router = useRouter()
  const supabase = createClient()
 
  const [formData, setFormData] = useState({
    // Privacy Settings
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    matchNotifications: true,
    messageNotifications: true,
    
    // Account Settings
    twoFactorEnabled: false,
    dataSharing: false,
    
    // Professional Settings
    specialty: '',
    hospital: '',
    bio: '',
    lookingFor: ''
  })
 
  const [isSaving, setIsSaving] = useState(false)
 
  useEffect(() => {
    if (profile) {
      setFormData({
        profileVisibility: 'public', // Default value since not in Profile interface
        showEmail: false, // Default value since not in Profile interface
        showPhone: false, // Default value since not in Profile interface
        showLocation: true, // Default value since not in Profile interface
        emailNotifications: true, // Default value since not in Profile interface
        pushNotifications: true, // Default value since not in Profile interface
        matchNotifications: true, // Default value since not in Profile interface
        messageNotifications: true, // Default value since not in Profile interface
        twoFactorEnabled: false, // Default value since not in Profile interface
        dataSharing: false, // Default value since not in Profile interface
        specialty: profile.medical_specialty || '',
        hospital: '', // Default value since not in Profile interface
        bio: profile.bio || '',
        lookingFor: profile.looking_for || ''
      })
    }
  }, [profile])
 
  const handleSave = async () => {
    if (!user || !profile) return
 
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          medical_specialty: formData.specialty,
          bio: formData.bio,
          looking_for: formData.lookingFor,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
 
      if (error) throw error
 
      toast.success('Settings updated successfully!')
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    } finally {
      setIsSaving(false)
    }
  }
 
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950 flex items-center justify-center">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-300">Loading settings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
 
  if (!user || !profile) {
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
                onClick={() => router.push('/profile')}
                className="text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                BeyondRounds
              </div>
            </div>
            <Badge variant="secondary">Profile Settings</Badge>
          </div>
        </div>
      </div>
 
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-blue-800 dark:text-blue-200">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your privacy, notifications, and account preferences
          </p>
        </div>
 
        <div className="space-y-6">
          {/* Privacy Settings */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="profileVisibility">Profile Visibility</Label>
                <Select 
                  value={formData.profileVisibility} 
                  onValueChange={(value) => setFormData({ ...formData, profileVisibility: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public - Visible to all users</SelectItem>
                    <SelectItem value="members">Members Only - Visible to registered users</SelectItem>
                    <SelectItem value="private">Private - Only visible to matches</SelectItem>
                  </SelectContent>
                </Select>
              </div>
 
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Email Address</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow other users to see your email address
                    </p>
                  </div>
                  <Switch
                    checked={formData.showEmail}
                    onCheckedChange={(checked) => setFormData({ ...formData, showEmail: checked })}
                  />
                </div>
 
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Phone Number</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow other users to see your phone number
                    </p>
                  </div>
                  <Switch
                    checked={formData.showPhone}
                    onCheckedChange={(checked) => setFormData({ ...formData, showPhone: checked })}
                  />
                </div>
 
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Location</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow other users to see your city and location
                    </p>
                  </div>
                  <Switch
                    checked={formData.showLocation}
                    onCheckedChange={(checked) => setFormData({ ...formData, showLocation: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
 
          {/* Notification Settings */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
                />
              </div>
 
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={formData.pushNotifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, pushNotifications: checked })}
                />
              </div>
 
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Match Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified when you have new matches
                  </p>
                </div>
                <Switch
                  checked={formData.matchNotifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, matchNotifications: checked })}
                />
              </div>
 
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Message Notifications</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get notified when you receive new messages
                  </p>
                </div>
                <Switch
                  checked={formData.messageNotifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, messageNotifications: checked })}
                />
              </div>
            </CardContent>
          </Card>
 
          {/* Security Settings */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  checked={formData.twoFactorEnabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, twoFactorEnabled: checked })}
                />
              </div>
 
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Sharing</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Allow anonymous data sharing for research purposes
                  </p>
                </div>
                <Switch
                  checked={formData.dataSharing}
                  onCheckedChange={(checked) => setFormData({ ...formData, dataSharing: checked })}
                />
              </div>
            </CardContent>
          </Card>
 
          {/* Professional Information */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Stethoscope className="w-5 h-5" />
                Professional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="specialty">Medical Specialty</Label>
                <Input
                  id="specialty"
                  value={formData.specialty}
                  onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                />
              </div>
 
              <div>
                <Label htmlFor="hospital">Hospital/Institution</Label>
                <Input
                  id="hospital"
                  value={formData.hospital}
                  onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                />
              </div>
 
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell other doctors about yourself..."
                  rows={4}
                />
              </div>
 
              <div>
                <Label htmlFor="lookingFor">What are you looking for?</Label>
                <Textarea
                  id="lookingFor"
                  value={formData.lookingFor}
                  onChange={(e) => setFormData({ ...formData, lookingFor: e.target.value })}
                  placeholder="Describe what you're looking for in professional connections..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
 
          {/* Save Actions */}
          <div className="flex gap-4 pt-6">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1 md:flex-none"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/profile')}
              className="flex-1 md:flex-none"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}