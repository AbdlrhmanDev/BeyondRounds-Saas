'use client'
 
import { useState, useEffect } from 'react'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import { createClient } from '@/lib/supabase/client'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  User,
  Save,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'
 
interface UserPreferences {
  email_notifications: boolean
  push_notifications: boolean
  weekly_match_reminders: boolean
  marketing_emails: boolean
  privacy_level: 'minimal' | 'standard' | 'detailed'
}
 
export default function SettingsPage() {
  const { user, profile, isLoading: authLoading } = useAuthUser()
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const supabase = createClient()
 
  useEffect(() => {
    if (user) {
      loadPreferences()
    }
  }, [user])
 
  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('profile_id', user?.id || '')
        .single()
 
      if (error && error.code !== 'PGRST116') {
        throw error
      }
 
      if (data) {
        const prefs = data as Record<string, unknown>
        setPreferences({
          email_notifications: Boolean(prefs.email_notifications),
          push_notifications: Boolean(prefs.push_notifications),
          weekly_match_reminders: Boolean(prefs.weekly_match_reminders),
          marketing_emails: Boolean(prefs.marketing_emails),
          privacy_level: (prefs.privacy_level as 'minimal' | 'standard' | 'detailed') || 'standard'
        })
      } else {
        // Create default preferences
        const defaultPrefs = {
          email_notifications: true,
          push_notifications: true,
          weekly_match_reminders: true,
          marketing_emails: false,
          privacy_level: 'standard' as const
        }
        
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert({
            user_id: user?.id || '',
            ...defaultPrefs
          } as Record<string, unknown>)
 
        if (!insertError) {
          setPreferences(defaultPrefs)
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
      toast.error('Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }
 
  const updatePreference = (key: keyof UserPreferences, value: boolean | string) => {
    if (!preferences) return
    
    setPreferences(prev => prev ? { ...prev, [key]: value } : null)
    setHasChanges(true)
  }
 
  const saveSettings = async () => {
    if (!preferences || !user) return
 
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        } as Record<string, unknown>)
 
      if (error) throw error
 
      setHasChanges(false)
      toast.success('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }
 
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }
 
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <SettingsIcon className="w-8 h-8 mr-3" />
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Manage your account preferences and privacy settings
            </p>
          </div>
 
          {hasChanges && (
            <Alert className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  
                    You have unsaved changes
                  
                  <Button size="sm" onClick={saveSettings} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
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
              </AlertDescription>
            </Alert>
          )}
 
          <div className="space-y-6">
            {/* Notification Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-primary" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive important updates via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.email_notifications ?? true}
                    onCheckedChange={(checked) => updatePreference('email_notifications', checked)}
                  />
                </div>
 
                <Separator />
 
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Get notified about new matches and messages
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.push_notifications ?? true}
                    onCheckedChange={(checked) => updatePreference('push_notifications', checked)}
                  />
                </div>
 
                <Separator />
 
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Weekly Match Reminders</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Remind me about new matches each week
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.weekly_match_reminders ?? true}
                    onCheckedChange={(checked) => updatePreference('weekly_match_reminders', checked)}
                  />
                </div>
 
                <Separator />
 
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Marketing Emails</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Receive updates about new features and tips
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.marketing_emails ?? false}
                    onCheckedChange={(checked) => updatePreference('marketing_emails', checked)}
                  />
                </div>
              </CardContent>
            </Card>
 
            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-primary" />
                  Privacy Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-base">Privacy Level</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Control how much information is shared with potential matches
                  </p>
                  <Select
                    value={preferences?.privacy_level ?? 'standard'}
                    onValueChange={(value: 'minimal' | 'standard' | 'detailed') => 
                      updatePreference('privacy_level', value)
                    }
                  >
                    <SelectTrigger className="max-w-xs">
                      <SelectValue placeholder="Select privacy level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minimal">
                        <div className="flex flex-col">
                          Minimal
                          Basic info only
                        </div>
                      </SelectItem>
                      <SelectItem value="standard">
                        <div className="flex flex-col">
                          Standard
                          Balanced sharing
                        </div>
                      </SelectItem>
                      <SelectItem value="detailed">
                        <div className="flex flex-col">
                          Detailed
                          Full profile visible
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
 
            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="mt-1">{profile?.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Account Status</Label>
                    <div className="flex items-center mt-1">
                      {profile?.is_verified ? (
                        'Verified'
                      ) : (
                        'Pending Verification'
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Member Since</Label>
                    <p className="mt-1">
                      {profile?.created_at ? 
                        new Date(profile.created_at).toLocaleDateString() : 
                        'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Subscription</Label>
                    <p className="mt-1 capitalize">
                      Inactive
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
 
            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <div>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Reset Changes
                </Button>
              </div>
              <Button onClick={saveSettings} disabled={!hasChanges || isSaving}>
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}