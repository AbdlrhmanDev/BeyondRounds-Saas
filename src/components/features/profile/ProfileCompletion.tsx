'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Progress } from '../../ui/progress';
import { Badge } from '../../ui/badge';
import { Avatar, Avatar as AvatarFallback } from '../../ui/avatar';
import { Checkbox } from '../../ui/checkbox';
import { 
  Camera, 
  MapPin, 
  Stethoscope, 
  Heart, 
  Users, 
  Calendar,
  CheckCircle,
  Plus,
  X,
  ArrowRight,
  Globe,
  MessageCircle,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthUser } from '@/hooks/features/auth/useAuthUser';
import { toast } from 'sonner';

interface ProfileCompletionProps {
  onNavigate: (page: string) => void;
  onComplete: (profileData: Record<string, unknown>) => void;
}

export function ProfileCompletion({ onNavigate, onComplete }: ProfileCompletionProps) {
  const { profile } = useAuthUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    // Profile Photo
    hasProfilePhoto: false,
    
    // Bio and Introduction
    bio: '',
    funFact: '',
    
    // Location Details
    neighborhood: '',
    workLocation: '',
    
    // Social Preferences
    groupSizePreference: 'small', // small, medium, large
    meetupFrequency: 'weekly', // weekly, biweekly, monthly
    
    // Additional Interests
    additionalInterests: [] as string[],
    languages: [] as string[],
    
    // Professional Networking
    openToNetworking: true,
    mentorshipInterest: false,
    
    // Communication Style
    communicationStyle: 'casual', // casual, professional, mixed
    responseTime: 'quick', // quick, moderate, relaxed
    
    // Privacy Settings
    profileVisibility: 'members', // public, members, matches
    shareWorkInfo: true
  });

  const [newInterest, setNewInterest] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const supabase = createClient();

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    // Load existing profile data if available
    if (profile) {
      setProfileData(prev => ({
        ...prev,
        bio: profile.bio || '',
        neighborhood: (profile as unknown as Record<string, unknown>).neighborhood as string || '',
        workLocation: (profile as unknown as Record<string, unknown>).work_location as string || '',
        additionalInterests: (profile as unknown as Record<string, unknown>).additional_interests as string[] || [],
        languages: (profile as unknown as Record<string, unknown>).languages as string[] || [],
        openToNetworking: (profile as unknown as Record<string, unknown>).open_to_networking as boolean ?? true,
        mentorshipInterest: (profile as unknown as Record<string, unknown>).mentorship_interest as boolean ?? false,
        communicationStyle: (profile as unknown as Record<string, unknown>).communication_style as string || 'casual',
        profileVisibility: (profile as unknown as Record<string, unknown>).profile_visibility as string || 'members',
        shareWorkInfo: (profile as unknown as Record<string, unknown>).share_work_info as boolean ?? true
      }));
    }
  }, [profile]);

  const handleInputChange = (field: string, value: unknown) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const addInterest = () => {
    if (newInterest.trim() && !profileData.additionalInterests.includes(newInterest.trim())) {
      setProfileData(prev => ({
        ...prev,
        additionalInterests: [...prev.additionalInterests, newInterest.trim()]
      }));
      setNewInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      additionalInterests: prev.additionalInterests.filter(i => i !== interest)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !profileData.languages.includes(newLanguage.trim())) {
      setProfileData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setProfileData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!profile?.id) {
      toast.error('Profile not found');
      return;
    }

    try {
      setIsSaving(true);

      // Save profile completion data to Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          bio: profileData.bio,
          fun_fact: profileData.funFact,
          neighborhood: profileData.neighborhood,
          work_location: profileData.workLocation,
          additional_interests: profileData.additionalInterests,
          languages: profileData.languages,
          open_to_networking: profileData.openToNetworking,
          mentorship_interest: profileData.mentorshipInterest,
          communication_style: profileData.communicationStyle,
          profile_visibility: profileData.profileVisibility,
          share_work_info: profileData.shareWorkInfo,
          profile_completion_step: 4, // Mark as completed
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) {
        throw error;
      }

      // Also save to profile_preferences table
      await supabase
        .from('profile_preferences')
        .upsert({
          profile_id: profile.id,
          group_size_preference: profileData.groupSizePreference,
          meetup_frequency: profileData.meetupFrequency,
          updated_at: new Date().toISOString()
        }, { onConflict: 'profile_id' });

      toast.success('Profile completed successfully!');
      onComplete(profileData);
      onNavigate('dashboard');
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('Failed to complete profile');
    } finally {
      setIsSaving(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Profile Photo & Bio
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Help other doctors get to know you better with a photo and personal introduction.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Photo */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {profile?.first_name?.[0] || 'U'}{profile?.last_name?.[0] || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white mb-2"
                    onClick={() => handleInputChange('hasProfilePhoto', true)}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    A friendly photo helps build trust and makes connections more personal.
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <Label htmlFor="bio">Tell others about yourself</Label>
                <Textarea
                  id="bio"
                  placeholder="I'm a passionate doctor who loves hiking, trying new restaurants, and exploring LA's cultural scene. I'm always up for coffee chats and outdoor adventures..."
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {profileData.bio.length}/500 characters
                </p>
              </div>

              {/* Fun Fact */}
              <div>
                <Label htmlFor="funFact">Share a fun fact about yourself</Label>
                <Input
                  id="funFact"
                  placeholder="e.g., I've traveled to 15 countries, I make amazing homemade pasta, I speak 4 languages..."
                  value={profileData.funFact}
                  onChange={(e) => handleInputChange('funFact', e.target.value)}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This helps start conversations and find common interests!
                </p>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location & Work Details
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Help us find nearby groups and optimize your matching experience.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="neighborhood">Preferred neighborhood/area</Label>
                <Input
                  id="neighborhood"
                  placeholder="e.g., Santa Monica, Beverly Hills, Downtown LA..."
                  value={profileData.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  We'll prioritize matches in your preferred area for convenient meetups
                </p>
              </div>

              <div>
                <Label htmlFor="workLocation">Primary work location</Label>
                <Input
                  id="workLocation"
                  placeholder="e.g., UCLA Medical Center, Cedars-Sinai, Kaiser Permanente..."
                  value={profileData.workLocation}
                  onChange={(e) => handleInputChange('workLocation', e.target.value)}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  This helps connect you with colleagues and nearby professionals
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="shareWorkInfo"
                    checked={profileData.shareWorkInfo}
                    onCheckedChange={(checked) => handleInputChange('shareWorkInfo', checked)}
                  />
                  <div>
                    <Label htmlFor="shareWorkInfo" className="cursor-pointer">
                      Share work information with matches
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Allow matched groups to see your hospital/clinic for networking opportunities
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Interests & Languages
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Add more details to help us find your perfect group matches.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Additional Interests */}
              <div>
                <Label>Additional interests or hobbies</Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profileData.additionalInterests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="pr-1">
                      {interest}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeInterest(interest)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add interest..."
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInterest()}
                  />
                  <Button onClick={addInterest} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Languages */}
              <div>
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Languages you speak
                </Label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {profileData.languages.map((language, index) => (
                    <Badge key={index} variant="secondary" className="pr-1">
                      {language}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeLanguage(language)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add language..."
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                  />
                  <Button onClick={addLanguage} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Connect with other multilingual doctors and diverse groups
                </p>
              </div>

              {/* Professional Networking */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="openToNetworking"
                    checked={profileData.openToNetworking}
                    onCheckedChange={(checked) => handleInputChange('openToNetworking', checked)}
                  />
                  <div>
                    <Label htmlFor="openToNetworking" className="cursor-pointer">
                      Open to professional networking
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Connect with doctors for career discussions and professional growth
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="mentorshipInterest"
                    checked={profileData.mentorshipInterest}
                    onCheckedChange={(checked) => handleInputChange('mentorshipInterest', checked)}
                  />
                  <div>
                    <Label htmlFor="mentorshipInterest" className="cursor-pointer">
                      Interested in mentorship opportunities
                    </Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Either as a mentor or mentee, depending on your experience level
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Communication & Privacy
              </CardTitle>
              <p className="text-gray-600 dark:text-gray-300">
                Set your preferences for how you connect and communicate with other doctors.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Group Size Preference */}
              <div>
                <Label>Preferred group size</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { value: 'small', label: 'Small (2-3)', icon: Users },
                    { value: 'medium', label: 'Medium (4-5)', icon: Users },
                    { value: 'large', label: 'Large (6+)', icon: Users }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={profileData.groupSizePreference === option.value ? "default" : "outline"}
                      className={`h-auto p-4 flex flex-col gap-2 ${
                        profileData.groupSizePreference === option.value ? "bg-blue-600 text-white" : ""
                      }`}
                      onClick={() => handleInputChange('groupSizePreference', option.value)}
                    >
                      <option.icon className="w-5 h-5" />
                      <span className="text-sm">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Meetup Frequency */}
              <div>
                <Label>How often would you like to meet?</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { value: 'weekly', label: 'Weekly', icon: Calendar },
                    { value: 'biweekly', label: 'Bi-weekly', icon: Calendar },
                    { value: 'monthly', label: 'Monthly', icon: Calendar }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={profileData.meetupFrequency === option.value ? "default" : "outline"}
                      className={`h-auto p-4 flex flex-col gap-2 ${
                        profileData.meetupFrequency === option.value ? "bg-blue-600 text-white" : ""
                      }`}
                      onClick={() => handleInputChange('meetupFrequency', option.value)}
                    >
                      <option.icon className="w-5 h-5" />
                      <span className="text-sm">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Communication Style */}
              <div>
                <Label>Communication style</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { value: 'casual', label: 'Casual & Fun' },
                    { value: 'professional', label: 'Professional' },
                    { value: 'mixed', label: 'Mixed' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={profileData.communicationStyle === option.value ? "default" : "outline"}
                      className={`h-auto p-3 ${
                        profileData.communicationStyle === option.value ? "bg-blue-600 text-white" : ""
                      }`}
                      onClick={() => handleInputChange('communicationStyle', option.value)}
                    >
                      <span className="text-sm">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Privacy Setting */}
              <div>
                <Label>Who can see your profile?</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {[
                    { value: 'public', label: 'All Users' },
                    { value: 'members', label: 'Verified Doctors' },
                    { value: 'matches', label: 'Matches Only' }
                  ].map((option) => (
                    <Button
                      key={option.value}
                      variant={profileData.profileVisibility === option.value ? "default" : "outline"}
                      className={`h-auto p-3 ${
                        profileData.profileVisibility === option.value ? "bg-blue-600 text-white" : ""
                      }`}
                      onClick={() => handleInputChange('profileVisibility', option.value)}
                    >
                      <span className="text-sm">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-blue-200 dark:border-blue-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl text-blue-700 dark:text-blue-300">BeyondRounds</span>
            </div>
            <Badge variant="secondary">Complete Your Profile</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl text-blue-800 dark:text-blue-200">
              Almost Ready! 
            </h1>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <Progress value={progress} className="mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            Complete your profile to get better matches and connect with doctors who share your interests.
          </p>
        </div>

        {/* Current Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Back
          </Button>
          
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => onNavigate('dashboard')}
              className="text-gray-600 hover:text-gray-700"
              disabled={isSaving}
            >
              Skip for now
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : currentStep === totalSteps ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Profile
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Skip Notice */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Don't worry!</strong> You can complete these sections later from your profile settings. 
            However, completing your profile now will help us find better matches for you right away.
          </p>
        </div>
      </div>
    </div>
  );
}
