'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  MessageSquare, 
  Send, 
  Users, 
  MapPin, 
  Stethoscope,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

// Import our recommended query hooks
import { 
  useCurrentProfile, 
  useMatchPeers, 
  useSendMessage, 
  useUpdateProfile 
} from '@/hooks/features/profile/useProfileQueries'

/**
 * Example component demonstrating all recommended frontend query patterns
 * This shows how to use the optimized queries in your components
 */
export default function RecommendedQueriesExample() {
  const [matchId, setMatchId] = useState<string>('')
  const [messageContent, setMessageContent] = useState('')
  const [profileUpdates, setProfileUpdates] = useState({
    city: '',
    bio: ''
  })

  // 1. جلب بروفايل المستخدم الحالي (Get current user profile)
  const { 
    profile, 
    isLoading: profileLoading, 
    error: profileError,
    refetch: refetchProfile 
  } = useCurrentProfile()

  // 2. زملاء نفس الـ match (Peers in same match)
  const { 
    peers, 
    isLoading: peersLoading, 
    error: peersError,
    refetch: refetchPeers 
  } = useMatchPeers(matchId)

  // 3. إرسال رسالة (Send message)
  const { sendMessage } = useSendMessage()

  // 4. تحديث بروفايلك فقط (Update your profile only)
  const { updateProfile } = useUpdateProfile()

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !matchId) {
      toast.error('Please enter a message and match ID')
      return
    }

    try {
      await sendMessage(matchId, matchId, messageContent)
      toast.success('Message sent successfully!')
      setMessageContent('')
    } catch (error) {
      toast.error('Failed to send message')
    }
  }

  const handleUpdateProfile = async () => {
    if (!profileUpdates.city && !profileUpdates.bio) {
      toast.error('Please enter some updates')
      return
    }

    try {
      await updateProfile(profileUpdates)
      toast.success('Profile updated successfully!')
      setProfileUpdates({ city: '', bio: '' })
      refetchProfile()
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleGetPeers = () => {
    if (!matchId.trim()) {
      toast.error('Please enter a match ID')
      return
    }
    refetchPeers()
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Recommended Query Patterns Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 1. Current User Profile */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              1. جلب بروفايل المستخدم الحالي (Get Current User Profile)
            </h3>
            
            {profileLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading profile...</span>
              </div>
            ) : profileError ? (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Error: {profileError.message}</span>
              </div>
            ) : profile ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      {profile.first_name?.[0]}{profile.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">
                      {profile.first_name} {profile.last_name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {profile.city || 'Not specified'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" />
                        {profile.medical_specialty || 'Not specified'}
                      </div>
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {profile.profile_completion || 0}% Complete
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-gray-500">No profile found</div>
            )}
          </div>

          <Separator />

          {/* 2. Match Peers */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-4 h-4" />
              2. زملاء نفس الـ match (Peers in Same Match)
            </h3>
            
            <div className="flex gap-2">
              <Input
                placeholder="Enter Match ID"
                value={matchId}
                onChange={(e) => setMatchId(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleGetPeers} disabled={peersLoading}>
                {peersLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Get Peers'
                )}
              </Button>
            </div>

            {peersError ? (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Error: {peersError.message}</span>
              </div>
            ) : peers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {peers.map((peer) => (
                  <motion.div
                    key={peer.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 dark:bg-green-950 p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-green-600 text-white text-xs">
                          {peer.first_name?.[0]}{peer.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {peer.first_name} {peer.last_name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {peer.medical_specialty} • {peer.city}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : matchId && !peersLoading ? (
              <div className="text-gray-500">No peers found for this match</div>
            ) : null}
          </div>

          <Separator />

          {/* 3. Send Message */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              3. إرسال رسالة (Send Message)
            </h3>
            
            <div className="space-y-2">
              <Textarea
                placeholder="Type your message..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                rows={3}
              />
              <Button 
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || !matchId}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>

          <Separator />

          {/* 4. Update Profile */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              4. تحديث بروفايلك فقط (Update Your Profile Only)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">City</label>
                <Input
                  placeholder="Enter new city"
                  value={profileUpdates.city}
                  onChange={(e) => setProfileUpdates(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Bio</label>
                <Textarea
                  placeholder="Enter bio"
                  value={profileUpdates.bio}
                  onChange={(e) => setProfileUpdates(prev => ({ ...prev, bio: e.target.value }))}
                  rows={2}
                />
              </div>
            </div>
            
            <Button 
              onClick={handleUpdateProfile}
              disabled={!profileUpdates.city && !profileUpdates.bio}
              className="w-full"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Update Profile
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}


