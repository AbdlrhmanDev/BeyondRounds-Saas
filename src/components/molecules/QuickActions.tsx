'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Search,
  Users,
  Calendar,
  Settings,
  MessageSquare,
  UserPlus,
  Heart,
  MapPin,
  Edit3,
  Sparkles,
  Target
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import React from 'react'

interface QuickActionsProps {
  profileCompletion?: number
  hasUnreadMessages?: boolean
  hasNewMatches?: boolean
  upcomingMeetups?: number
  onCompleteProfile?: () => void
  onFindMatches?: () => void
  onViewMessages?: () => void
  onScheduleMeetup?: () => void
}

const ActionCard = ({
  title,
  description,
  icon: Icon,
  href,
  onClick,
  variant = 'default',
  badge,
  disabled = false,
  delay = 0
}: {
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  href?: string
  onClick?: () => void
  variant?: 'default' | 'primary' | 'success' | 'warning'
  badge?: string | number
  disabled?: boolean
  delay?: number
}) => {
  const variants = {
    default: 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md',
    primary: 'bg-blue-50 border-blue-200 hover:border-blue-300 hover:shadow-md',
    success: 'bg-green-50 border-green-200 hover:border-green-300 hover:shadow-md',
    warning: 'bg-yellow-50 border-yellow-200 hover:border-yellow-300 hover:shadow-md'
  }

  const iconColors = {
    default: 'text-gray-600',
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600'
  }

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={`
        relative p-4 rounded-lg border-2 transition-all cursor-pointer group
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-white ${iconColors[variant]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">{title}</h3>
            {description && (
              <p className="text-sm text-gray-600 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        {badge && (
          <Badge variant="secondary" className="ml-2">
            {badge}
          </Badge>
        )}
      </div>
    </motion.div>
  )

  if (href && !disabled) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

export default function QuickActions({
  profileCompletion = 0,
  hasUnreadMessages = false,
  hasNewMatches = false,
  upcomingMeetups = 0,
  onCompleteProfile,
  onFindMatches,
  onViewMessages,
  onScheduleMeetup
}: QuickActionsProps) {
  const needsProfileCompletion = profileCompletion < 80

  const quickActions = [
    // Priority actions based on profile state
    ...(needsProfileCompletion ? [{
      title: 'Complete Your User',
      description: `${profileCompletion}% complete - Add more details to get better matches`,
      icon: Edit3,
      onClick: onCompleteProfile,
      variant: 'warning' as const,
      badge: `${100 - profileCompletion}% left`,
      delay: 0
    }] : []),

    {
      title: 'Find New Matches',
      description: hasNewMatches ? 'New matches available!' : 'Discover compatible medical professionals',
      icon: hasNewMatches ? Sparkles : Search,
      onClick: onFindMatches,
      variant: hasNewMatches ? ('success' as const) : ('default' as const),
      badge: hasNewMatches ? 'New' : undefined,
      delay: 0.1
    },

    {
      title: 'Messages',
      description: hasUnreadMessages ? 'You have unread messages' : 'Connect with your matches',
      icon: MessageSquare,
      href: '/messages',
      onClick: onViewMessages,
      variant: hasUnreadMessages ? ('primary' as const) : ('default' as const),
      badge: hasUnreadMessages ? 'Unread' : undefined,
      delay: 0.2
    },

    {
      title: 'Schedule Meetup',
      description: upcomingMeetups > 0 ? `${upcomingMeetups} upcoming` : 'Plan to meet your matches',
      icon: Calendar,
      href: '/calendar',
      onClick: onScheduleMeetup,
      variant: 'default' as const,
      badge: upcomingMeetups > 0 ? upcomingMeetups : undefined,
      delay: 0.3
    }
  ]

  const additionalActions = [
    {
      title: 'Browse Groups',
      description: 'Join professional groups in your specialty',
      icon: Users,
      href: '/groups',
      delay: 0.4
    },
    {
      title: 'Local Events',
      description: 'Find medical events and conferences nearby',
      icon: MapPin,
      href: '/events',
      delay: 0.5
    },
    {
      title: 'User Settings',
      description: 'Manage your preferences and privacy',
      icon: Settings,
      href: '/settings',
      delay: 0.6
    },
    {
      title: 'Invite Friends',
      description: 'Invite colleagues to join BeyondRounds',
      icon: UserPlus,
      href: '/invite',
      delay: 0.7
    }
  ]

  return (
    <div className="space-y-6">
      {/* Priority Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickActions.map((action) => (
            <ActionCard key={action.title} {...action} />
          ))}
        </CardContent>
      </Card>

      {/* Additional Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
            Explore More
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {additionalActions.map((action) => (
              <ActionCard key={action.title} {...action} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Completion Tip */}
      {needsProfileCompletion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-full bg-blue-100">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900 mb-1">
                    Improve Your Match Quality
                  </h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Profiles with more details get 3x better matches. Complete your interests,
                    preferences, and bio to connect with more compatible professionals.
                  </p>
                  <Button
                    size="sm"
                    onClick={onCompleteProfile}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Complete User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}