'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Slider } from '../../ui/slider';
import { Checkbox } from '../../ui/checkbox';
import { Badge } from '../../ui/badge';
import { Separator } from '../../ui/separator';
import { 
  ArrowLeft, 
  Clock, 
  Heart, 
  Shield,
  Calendar,
  MessageCircle,
  Stethoscope,
  Save,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthUser } from '@/hooks/features/auth/useAuthUser';
import { toast } from 'sonner';

interface PreferencesProps {
  user: Record<string, unknown> | null;
  onNavigate: (page: string) => void;
}

export function Preferences({ user, onNavigate }: PreferencesProps) {
  const { profile } = useAuthUser();
  const [preferences, setPreferences] = useState({
    // Matching Preferences
    maxGroupSize: 4,
    minGroupSize: 3,
    ageRange: [25, 45],
    genderPreference: 'any',
    locationRadius: 25,
    specialtyPreference: 'any',
    
    // Availability
    weekdayEvening: true,
    weekdayMorning: false,
    weekendMorning: true,
    weekendEvening: true,
    
    // Communication
    emailMatches: true,
    emailReminders: true,
    pushNotifications: true,
    smsUpdates: false,
    
    // Privacy
    profileVisibility: 'members',
    showLastSeen: true,
    showOnlineStatus: true,
    allowDirectMessages: true,
    
    // Activity Preferences
    selectedActivities: ['Coffee Meetups', 'Hiking', 'Restaurants', 'Cultural Events'],
    matchingFrequency: 'weekly'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (user?.id) {
      loadPreferences();
    }
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      
      // Try to load from profile_preferences table
      const { data: profilePrefs, error: profileError } = await supabase
        .from('profile_preferences')
        .select('*')
        .eq('profile_id', profile?.id)
        .single();

      if (profilePrefs && !profileError) {
        // Map database preferences to component state
        setPreferences(prev => ({
          ...prev,
          maxGroupSize: profilePrefs.max_group_size || prev.maxGroupSize,
          minGroupSize: profilePrefs.min_group_size || prev.minGroupSize,
          locationRadius: profilePrefs.location_radius || prev.locationRadius,
          specialtyPreference: profilePrefs.specialty_preference || prev.specialtyPreference,
          matchingFrequency: profilePrefs.matching_frequency || prev.matchingFrequency,
          weekdayEvening: profilePrefs.weekday_evening ?? prev.weekdayEvening,
          weekdayMorning: profilePrefs.weekday_morning ?? prev.weekdayMorning,
          weekendMorning: profilePrefs.weekend_morning ?? prev.weekendMorning,
          weekendEvening: profilePrefs.weekend_evening ?? prev.weekendEvening,
          emailMatches: profilePrefs.email_matches ?? prev.emailMatches,
          emailReminders: profilePrefs.email_reminders ?? prev.emailReminders,
          pushNotifications: profilePrefs.push_notifications ?? prev.pushNotifications,
          smsUpdates: profilePrefs.sms_updates ?? prev.smsUpdates,
          profileVisibility: profilePrefs.profile_visibility || prev.profileVisibility,
          showLastSeen: profilePrefs.show_last_seen ?? prev.showLastSeen,
          showOnlineStatus: profilePrefs.show_online_status ?? prev.showOnlineStatus,
          allowDirectMessages: profilePrefs.allow_direct_messages ?? prev.allowDirectMessages,
          selectedActivities: profilePrefs.selected_activities || prev.selectedActivities
        }));
      }

      // Also try to load from localStorage as fallback
      const savedPreferences = localStorage.getItem('userPreferences');
      if (savedPreferences && !profilePrefs) {
        const localPrefs = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...localPrefs }));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      // Fallback to localStorage
      const savedPreferences = localStorage.getItem('userPreferences');
      if (savedPreferences) {
        const localPrefs = JSON.parse(savedPreferences);
        setPreferences(prev => ({ ...prev, ...localPrefs }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferenceChange = (key: string, value: unknown) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const handleActivityToggle = (activity: string) => {
    setPreferences(prev => ({
      ...prev,
      selectedActivities: prev.selectedActivities.includes(activity)
        ? prev.selectedActivities.filter(a => a !== activity)
        : [...prev.selectedActivities, activity]
    }));
  };

  const handleSave = async () => {
    if (!user?.id || !profile?.id) {
      toast.error('User profile not found');
      return;
    }

    try {
      setIsSaving(true);

      // Save to profile_preferences table
      const { error: dbError } = await supabase
        .from('profile_preferences')
        .upsert({
          profile_id: profile.id,
          max_group_size: preferences.maxGroupSize,
          min_group_size: preferences.minGroupSize,
          location_radius: preferences.locationRadius,
          specialty_preference: preferences.specialtyPreference,
          matching_frequency: preferences.matchingFrequency,
          weekday_evening: preferences.weekdayEvening,
          weekday_morning: preferences.weekdayMorning,
          weekend_morning: preferences.weekendMorning,
          weekend_evening: preferences.weekendEvening,
          email_matches: preferences.emailMatches,
          email_reminders: preferences.emailReminders,
          push_notifications: preferences.pushNotifications,
          sms_updates: preferences.smsUpdates,
          profile_visibility: preferences.profileVisibility,
          show_last_seen: preferences.showLastSeen,
          show_online_status: preferences.showOnlineStatus,
          allow_direct_messages: preferences.allowDirectMessages,
          selected_activities: preferences.selectedActivities,
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id' });

      if (dbError) {
        console.warn('Database save failed, saving to localStorage:', dbError);
      }

      // Always save to localStorage as backup
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
      
      toast.success('Preferences saved successfully!');
      onNavigate('dashboard');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const activityOptions = [
    'Coffee Meetups', 'Hiking', 'Restaurants', 'Cultural Events', 'Sports',
    'Museums', 'Concerts', 'Wine Tasting', 'Book Clubs', 'Cooking Classes',
    'Photography', 'Travel', 'Volunteering', 'Fitness', 'Beach Activities'
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950 flex items-center justify-center">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-300">Loading preferences...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
                onClick={() => onNavigate('dashboard')}
                className="text-blue-600 hover:text-blue-700"
                disabled={isSaving}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl text-blue-700 dark:text-blue-300">BeyondRounds</span>
              </div>
            </div>
            <Badge variant="secondary">Preferences</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-blue-800 dark:text-blue-200">Your Preferences</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Customize your BeyondRounds experience to find the perfect matches and meetups.
          </p>
        </div>

        <div className="space-y-6">
          {/* Matching Preferences */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Matching Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Group Size */}
              <div className="space-y-4">
                <Label>Preferred Group Size</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-300">Minimum Members</Label>
                    <Select 
                      value={preferences.minGroupSize.toString()} 
                      onValueChange={(value) => handlePreferenceChange('minGroupSize', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 members</SelectItem>
                        <SelectItem value="3">3 members</SelectItem>
                        <SelectItem value="4">4 members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-300">Maximum Members</Label>
                    <Select 
                      value={preferences.maxGroupSize.toString()} 
                      onValueChange={(value) => handlePreferenceChange('maxGroupSize', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 members</SelectItem>
                        <SelectItem value="4">4 members</SelectItem>
                        <SelectItem value="5">5 members</SelectItem>
                        <SelectItem value="6">6 members</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Age Range */}
              <div className="space-y-3">
                <Label>Preferred Age Range: {preferences.ageRange[0]} - {preferences.ageRange[1]} years</Label>
                <Slider
                  value={preferences.ageRange}
                  onValueChange={(value) => handlePreferenceChange('ageRange', value)}
                  min={22}
                  max={65}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* Location */}
              <div className="space-y-3">
                <Label>Location Radius: {preferences.locationRadius} miles</Label>
                <Slider
                  value={[preferences.locationRadius]}
                  onValueChange={(value) => handlePreferenceChange('locationRadius', value[0])}
                  min={5}
                  max={50}
                  step={5}
                  className="w-full"
                />
              </div>

              {/* Gender Preference */}
              <div>
                <Label>Gender Preference</Label>
                <Select 
                  value={preferences.genderPreference} 
                  onValueChange={(value) => handlePreferenceChange('genderPreference', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Gender</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="mixed">Mixed Groups Preferred</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Specialty Preference */}
              <div>
                <Label>Medical Specialty Preference</Label>
                <Select 
                  value={preferences.specialtyPreference} 
                  onValueChange={(value) => handlePreferenceChange('specialtyPreference', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Specialty</SelectItem>
                    <SelectItem value="similar">Similar to Mine</SelectItem>
                    <SelectItem value="different">Different from Mine</SelectItem>
                    <SelectItem value="mixed">Mixed Specialties</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Availability */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Weekday Mornings</Label>
                  <Switch
                    checked={preferences.weekdayMorning}
                    onCheckedChange={(checked) => handlePreferenceChange('weekdayMorning', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Weekday Evenings</Label>
                  <Switch
                    checked={preferences.weekdayEvening}
                    onCheckedChange={(checked) => handlePreferenceChange('weekdayEvening', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Weekend Mornings</Label>
                  <Switch
                    checked={preferences.weekendMorning}
                    onCheckedChange={(checked) => handlePreferenceChange('weekendMorning', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Weekend Evenings</Label>
                  <Switch
                    checked={preferences.weekendEvening}
                    onCheckedChange={(checked) => handlePreferenceChange('weekendEvening', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Matching Frequency</Label>
                <Select 
                  value={preferences.matchingFrequency} 
                  onValueChange={(value) => handlePreferenceChange('matchingFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Every 2 Weeks</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Activity Preferences */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Activity Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Label>Select activities you're interested in:</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {activityOptions.map((activity) => (
                  <div key={activity} className="flex items-center space-x-2">
                    <Checkbox
                      id={activity}
                      checked={preferences.selectedActivities.includes(activity)}
                      onCheckedChange={() => handleActivityToggle(activity)}
                    />
                    <Label htmlFor={activity} className="text-sm">{activity}</Label>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Label className="text-sm text-gray-600 dark:text-gray-300">Selected Activities:</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {preferences.selectedActivities.map((activity) => (
                    <Badge key={activity} variant="secondary" className="text-xs">
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Communication Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email New Matches</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you have new group matches</p>
                  </div>
                  <Switch
                    checked={preferences.emailMatches}
                    onCheckedChange={(checked) => handlePreferenceChange('emailMatches', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Reminders</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive reminders about upcoming meetups</p>
                  </div>
                  <Switch
                    checked={preferences.emailReminders}
                    onCheckedChange={(checked) => handlePreferenceChange('emailReminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Get notified on your device</p>
                  </div>
                  <Switch
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange('pushNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>SMS Updates</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Receive important updates via text</p>
                  </div>
                  <Switch
                    checked={preferences.smsUpdates}
                    onCheckedChange={(checked) => handlePreferenceChange('smsUpdates', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Profile Visibility</Label>
                <Select 
                  value={preferences.profileVisibility} 
                  onValueChange={(value) => handlePreferenceChange('profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="members">All Members</SelectItem>
                    <SelectItem value="matched">Matched Groups Only</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Last Seen</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Let others see when you were last active</p>
                  </div>
                  <Switch
                    checked={preferences.showLastSeen}
                    onCheckedChange={(checked) => handlePreferenceChange('showLastSeen', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Online Status</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Display when you're currently online</p>
                  </div>
                  <Switch
                    checked={preferences.showOnlineStatus}
                    onCheckedChange={(checked) => handlePreferenceChange('showOnlineStatus', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Direct Messages</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Let matched members message you directly</p>
                  </div>
                  <Switch
                    checked={preferences.allowDirectMessages}
                    onCheckedChange={(checked) => handlePreferenceChange('allowDirectMessages', checked)}
                  />
                </div>
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
                  Save Preferences
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate('dashboard')}
              disabled={isSaving}
              className="flex-1 md:flex-none"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}



