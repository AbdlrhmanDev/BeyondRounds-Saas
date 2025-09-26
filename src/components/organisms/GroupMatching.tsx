'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { 
  ArrowLeft, 
  Users, 
  Heart, 
  MapPin, 
  Clock, 
  RefreshCw, 
  Check, 
  X,
  Sparkles,
  Calendar,
  MessageCircle,
  Star,
  Stethoscope,
  Loader2,
  AlertCircle,
  Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client';
import { useAuthUser } from '@/hooks/features/auth/useAuthUser';
import { toast } from 'sonner';

interface GroupMatch {
  id: string;
  name: string;
  members: GroupMember[];
  commonInterests: string[];
  compatibility: number;
  meetingPreference: string;
  location: string;
  description: string;
  nextPlannedActivity?: string;
  matchReason: string;
  groupSize: number;
  averageCompatibility: number;
  lastActivityAt: string;
  created_at: string;
  status: string;
  matchWeek: string;
}

interface GroupMember {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  city: string;
  age: number;
}

interface GroupMatchingProps {
  user: Record<string, unknown>
  onNavigate: (page: string) => void
}

export function GroupMatching({ user, onNavigate }: GroupMatchingProps) {
  const { profile } = useAuthUser();
  const [isMatching, setIsMatching] = useState(false);
  const [matchingProgress, setMatchingProgress] = useState(0);
  const [currentMatches, setCurrentMatches] = useState<GroupMatch[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rlsError, setRlsError] = useState(false);
  const [matchingPreferences, setMatchingPreferences] = useState({
    groupSize: 3,
    maxDistance: 50,
    minCompatibility: 70,
    specialties: [] as string[],
    interests: [] as string[]
  });

  const supabase = createClient();

  // Load existing matches on component mount
  useEffect(() => {
    loadExistingMatches();
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      // Load preferences from localStorage only to avoid RLS issues
      const savedPreferences = localStorage.getItem('matchingPreferences');
      if (savedPreferences) {
        const preferences = JSON.parse(savedPreferences);
        setMatchingPreferences(preferences);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const saveUserPreferences = async () => {
    try {
      // Save preferences to localStorage only to avoid RLS issues
      localStorage.setItem('matchingPreferences', JSON.stringify(matchingPreferences));
      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    }
  };

  const loadExistingMatches = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);
      setRlsError(false);

      // Try to get user's existing matches
      const { data: userMatches, error: matchesError } = await supabase
        .from('match_members')
        .select(`
          *,
          matches(
            id,
            group_name,
            group_size,
            average_compatibility,
            last_activity_at,
            created_at,
            status,
            match_week
          )
        `)
        .eq('profile_id', user.id)
        .eq('is_active', true);

      // Handle RLS infinite recursion error
      if (matchesError?.code === '42P17') {
        console.warn('RLS infinite recursion detected. Skipping existing matches load.');
        setRlsError(true);
        setIsLoading(false);
        return;
      }

      if (matchesError) throw matchesError;

      // Get group members for each match
      const matchesWithMembers = await Promise.all(
        (userMatches || []).map(async (match) => {
          try {
            const { data: members, error: membersError } = await supabase
              .from('match_members')
              .select(`
                profile_id,
                profiles (
                  id,
                  first_name,
                  last_name,
                  medical_specialty,
                  city,
                  age
                )
              `)
              .eq('match_id', match.match_id)
              .eq('is_active', true);

            if (membersError) {
              console.warn('Error loading members for match:', match.match_id, membersError);
              return null;
            }

            // Get common interests for this group
            const { data: interests, error: interestsError } = await supabase
              .from('profile_interests')
              .select('kind, value')
              .in('profile_id', members?.map(m => m.profile_id) || []);

            if (interestsError) {
              console.warn('Error loading interests:', interestsError);
            }

            // Calculate common interests
            const commonInterests = calculateCommonInterests(interests || []);

            return {
              id: match.matches.id,
              name: match.matches.group_name,
              members: members?.map(m => {
                const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
                return {
                  id: profile?.id,
                  name: `${profile?.first_name || ''} ${profile?.last_name || ''}`,
                  specialty: profile?.medical_specialty || 'General Practice',
                  city: profile?.city || 'Unknown',
                  age: profile?.age || 30
                };
              }) || [],
              commonInterests,
              compatibility: Math.round(match.matches.average_compatibility || 0),
              meetingPreference: 'Flexible', // Default value since column doesn't exist
              location: 'TBD', // Default value since column doesn't exist
              description: 'A group of medical professionals looking to connect.',
              matchReason: `High compatibility (${Math.round(match.matches.average_compatibility || 0)}%) based on shared interests and location proximity.`,
              groupSize: match.matches.group_size || 0,
              averageCompatibility: match.matches.average_compatibility || 0,
              lastActivityAt: match.matches.last_activity_at || match.matches.created_at,
              created_at: match.matches.created_at,
              status: match.matches.status || 'active',
              matchWeek: match.matches.match_week
            };
          } catch (error) {
            console.warn('Error processing match:', match.match_id, error);
            return null;
          }
        })
      );

      const validMatches = matchesWithMembers.filter(match => match !== null);
      setCurrentMatches(validMatches);
      
      if (validMatches.length > 0) {
        setShowResults(true);
      }
    } catch (error: any) {
      console.error('Error loading existing matches:', error);
      
      // Check if it's an RLS error
      if ((error as any)?.code === '42P17') {
        setRlsError(true);
        setError('Database access temporarily restricted. You can still find new matches!');
      } else {
        setError('Failed to load existing matches');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCommonInterests = (interests: any[]) => {
    const interestCounts: Record<string, number> = {};
    
    interests.forEach(interest => {
      // With the new schema, interests are stored as key-value pairs
      // where kind is the category (music, movies, sports, etc.) and value is the specific interest
      if (interest.kind && interest.value) {
        const key = `${interest.kind}:${interest.value}`;
        interestCounts[key] = (interestCounts[key] || 0) + 1;
      }
    });

    // Return interests that appear in at least 2 members
    return Object.entries(interestCounts)
      .filter(([_, count]) => count >= 2)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([interest, _]) => interest);
  };

  const startMatching = async () => {
    if (!user?.id || !profile) {
      toast.error('User profile not found');
      return;
    }

    setIsMatching(true);
    setMatchingProgress(0);
    setShowResults(false);
    setError(null);

    try {
      // Simulate matching algorithm progress
      const progressInterval = setInterval(() => {
        setMatchingProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 200);

      // Call the matching API
      const response = await fetch('/api/matching/find-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          profileId: profile.id,
          preferences: {
            groupSize: matchingPreferences.groupSize,
            maxDistance: matchingPreferences.maxDistance,
            minCompatibility: matchingPreferences.minCompatibility,
            specialties: matchingPreferences.specialties.length > 0 ? matchingPreferences.specialties : (profile.medical_specialty ? [profile.medical_specialty] : [])
          }
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to find matches');
      }

      // Wait for progress to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCurrentMatches(result.data.matches || []);
      setShowResults(true);
      setIsMatching(false);

      if (result.data.matches?.length === 0) {
        toast.info('No new matches found. Try adjusting your preferences!');
      } else {
        toast.success(`Found ${result.data.matches?.length} new group matches!`);
      }

    } catch (error) {
      console.error('Error during matching:', error);
      setError('Failed to find matches. Please try again.');
      setIsMatching(false);
      toast.error('Failed to find matches');
    }
  };

  const handleGroupAction = async (groupId: string, action: 'join' | 'pass') => {
    try {
      if (action === 'join') {
        // Join the group
        const response = await fetch('/api/matching/join-group', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            groupId: groupId
          })
        });

        const result = await response.json();

        if (result.success) {
          toast.success('Successfully joined the group!');
          onNavigate('messages');
        } else {
          throw new Error(result.error || 'Failed to join group');
        }
      } else {
        // Pass on the group
        const response = await fetch('/api/matching/pass-group', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            groupId: groupId
          })
        });

        const result = await response.json();

        if (result.success) {
          // Remove group from current matches
          setCurrentMatches(prev => prev.filter(match => match.id !== groupId));
          toast.success('Group passed');
        } else {
          throw new Error(result.error || 'Failed to pass group');
        }
      }
    } catch (error) {
      console.error('Error handling group action:', error);
      toast.error(`Failed to ${action} group`);
    }
  };

  const getMatchingSteps = () => [
    'Analyzing your profile and preferences...',
    'Finding doctors with similar interests...',
    'Checking location and schedule compatibility...',
    'Evaluating personality and specialty matches...',
    'Creating optimal group combinations...',
    'Finalizing your matches...'
  ];

  const currentStep = Math.floor((matchingProgress / 100) * getMatchingSteps().length);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950 flex items-center justify-center">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-300">Loading your matches...</p>
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
                onClick={() => onNavigate(user.isAdmin ? 'admin-dashboard' : 'dashboard')}
                className="text-blue-600 hover:text-blue-700"
                disabled={isMatching}
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
            <Badge variant="secondary">Group Matching</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* RLS Error Warning */}
        {rlsError && (
          <Card className="mb-6 border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                    Database Access Temporarily Restricted
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                    We can't load your existing matches right now due to security settings, but you can still find new matches!
                  </p>
                  <details className="text-xs text-yellow-600 dark:text-yellow-400">
                    <summary className="cursor-pointer hover:text-yellow-800 dark:hover:text-yellow-200">
                      Technical Details (for developers)
                    </summary>
                    <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded">
                      <p className="mb-1"><strong>Error:</strong> Row Level Security infinite recursion on match_members table</p>
                      <p className="mb-1"><strong>Fix:</strong> Update RLS policies in Supabase</p>
                      <p><strong>Suggested policy:</strong> CREATE POLICY "Users can view their own match members" ON match_members FOR SELECT USING (profile_id = auth.uid());</p>
                    </div>
                  </details>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRlsError(false)}
                  className="text-yellow-600 hover:text-yellow-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && !rlsError && (
          <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl mb-4 text-blue-800 dark:text-blue-200">
            Find Your Perfect Group Match
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Our intelligent matching algorithm connects you with doctors who share your interests, 
            schedule, and friendship goals.
          </p>
        </div>

        {!isMatching && !showResults && (
          <>
            {/* Matching Preferences */}
            <Card className="mb-8 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-300">Matching Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">Group Size</label>
                    <select 
                      value={matchingPreferences.groupSize}
                      onChange={(e) => setMatchingPreferences(prev => ({ ...prev, groupSize: parseInt(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    >
                      <option value={2}>2 members</option>
                      <option value={3}>3 members</option>
                      <option value={4}>4 members</option>
                      <option value={5}>5 members</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">Minimum Compatibility</label>
                    <select 
                      value={matchingPreferences.minCompatibility}
                      onChange={(e) => setMatchingPreferences(prev => ({ ...prev, minCompatibility: parseInt(e.target.value) }))}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                    >
                      <option value={60}>60%</option>
                      <option value={70}>70%</option>
                      <option value={80}>80%</option>
                      <option value={90}>90%</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm text-gray-600 dark:text-gray-300 mb-2 block">Preferred Specialties</label>
                  <div className="flex flex-wrap gap-2">
                    {['Emergency Medicine', 'Internal Medicine', 'Family Medicine', 'Surgery', 'Cardiology', 'Pediatrics', 'Psychiatry', 'Radiology', 'Anesthesiology', 'Orthopedics'].map(specialty => (
                      <Badge 
                        key={specialty}
                        variant={matchingPreferences.specialties.includes(specialty) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setMatchingPreferences(prev => ({
                            ...prev,
                            specialties: prev.specialties.includes(specialty)
                              ? prev.specialties.filter(s => s !== specialty)
                              : [...prev.specialties, specialty]
                          }))
                        }}
                      >
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={saveUserPreferences}
                    variant="outline"
                    size="sm"
                  >
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="mb-8 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-blue-700 dark:text-blue-300 text-center">How Our Matching Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg mb-2 text-blue-700 dark:text-blue-300">Smart Analysis</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      We analyze your profile, interests, availability, and personality to understand what you're looking for
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg mb-2 text-green-700 dark:text-green-300">Perfect Groups</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      We create small groups of 3-4 doctors with high compatibility and shared interests
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-lg mb-2 text-purple-700 dark:text-purple-300">Lasting Friendships</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Our matches have a 85% success rate in forming lasting friendships beyond the first meetup
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card className="mb-8 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl mb-2 text-blue-700 dark:text-blue-300">Ready to Find New Groups?</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Based on your profile, we'll find 3-5 highly compatible groups for you to consider joining.
                  </p>
                  <Button
                    onClick={startMatching}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Matching
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Matching Process */}
        {isMatching && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                  <RefreshCw className="w-10 h-10 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
                <h2 className="text-2xl mb-4 text-blue-700 dark:text-blue-300">Finding Your Perfect Matches</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {getMatchingSteps()[currentStep] || 'Completing the matching process...'}
                </p>
                <div className="max-w-md mx-auto">
                  <Progress value={matchingProgress} className="mb-4" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {Math.round(matchingProgress)}% Complete
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}


        {/* Results */}
        {showResults && currentMatches.length > 0 && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl mb-4 text-blue-800 dark:text-blue-200">
                🎉 We Found {currentMatches.length} Great Matches for You!
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                These groups have high compatibility with your interests and availability. 
                Choose the ones that excite you most!
              </p>
              
              {/* Match Statistics */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl text-blue-700 dark:text-blue-300 font-bold">
                    {Math.round(currentMatches.reduce((sum, match) => sum + match.compatibility, 0) / currentMatches.length)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Average Compatibility</div>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl text-green-700 dark:text-green-300 font-bold">
                    {currentMatches.reduce((sum, match) => sum + match.members.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Members</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="text-2xl text-purple-700 dark:text-purple-300 font-bold">
                    {new Set(currentMatches.flatMap(match => match.commonInterests)).size}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Unique Interests</div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {currentMatches.map((match, index) => (
                <Card key={match.id} className="border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Group Info */}
                      <div className="lg:col-span-2">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl text-blue-700 dark:text-blue-300 mb-2">{match.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-3">{match.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{match.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>{match.meetingPreference}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{match.members.length} members</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-lg text-blue-700 dark:text-blue-300">
                                {match.compatibility}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Compatibility</p>
                          </div>
                        </div>

                        {/* Members */}
                        <div className="mb-4">
                          <h4 className="text-sm text-gray-600 dark:text-gray-300 mb-2">Members</h4>
                          <div className="flex items-center gap-3">
                            {match.members.map((member) => (
                              <div key={member.id} className="flex items-center gap-2">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm text-blue-700 dark:text-blue-300">{member.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{member.specialty}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Common Interests */}
                        <div className="mb-4">
                          <h4 className="text-sm text-gray-600 dark:text-gray-300 mb-2">Common Interests</h4>
                          <div className="flex flex-wrap gap-2">
                            {match.commonInterests.map((interest, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {interest}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Next Activity */}
                        {match.nextPlannedActivity && (
                          <div className="mb-4 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                              <span className="text-sm text-green-700 dark:text-green-300">Next Planned Activity</span>
                            </div>
                            <p className="text-green-800 dark:text-green-200">{match.nextPlannedActivity}</p>
                          </div>
                        )}

                        {/* Match Reason */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                          <p className="text-sm text-blue-800 dark:text-blue-200">
                            <strong>Why this match:</strong> {match.matchReason}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="lg:col-span-1 flex flex-col justify-center">
                        <div className="space-y-3">
                          <Button
                            onClick={() => handleGroupAction(match.id, 'join')}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Join This Group
                          </Button>
                          <Button
                            onClick={() => handleGroupAction(match.id, 'pass')}
                            variant="outline"
                            className="w-full"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Pass
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full text-blue-600 hover:text-blue-700"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Preview Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Actions Footer */}
            <div className="text-center mt-8 p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg mb-2 text-blue-700 dark:text-blue-300">Want Different Matches?</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Not seeing the perfect fit? We can find more groups based on different criteria.
              </p>
              <Button
                onClick={startMatching}
                variant="outline"
                className="mr-3"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Find More Matches
              </Button>
              <Button
                onClick={() => onNavigate('dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Dashboard
              </Button>
            </div>
          </>
        )}

        {showResults && currentMatches.length === 0 && (
          <Card className="border-gray-200 dark:border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-xl mb-4 text-gray-700 dark:text-gray-300">No More Matches Available</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You've reviewed all available matches. New groups are created weekly, so check back soon!
              </p>
              <Button
                onClick={() => onNavigate('dashboard')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}