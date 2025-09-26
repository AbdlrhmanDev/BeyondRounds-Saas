'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Users,
  MessageCircle,
  Heart,
  UserPlus,
  Calendar,
  Bell,
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

interface ActivityItem {
  id: string
  type: 'new_match' | 'message_received' | 'group_joined' | 'meetup_scheduled' | 'profile_viewed' | 'interest_matched'
  title: string
  description: string
  timestamp: string
  user?: {
    name: string
    avatar?: string
    specialty?: string
  }
  isUnread?: boolean
  actionUrl?: string
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  isLoading?: boolean
  onMarkAsRead?: (activityId: string) => void
  onViewAll?: () => void
  maxItems?: number
}

const ActivityIcon = ({ type }: { type: ActivityItem['type'] }) => {
  const iconClasses = "w-4 h-4"

  switch (type) {
    case 'new_match':
      return <Heart className={`${iconClasses} text-red-500`} />
    case 'message_received':
      return <MessageCircle className={`${iconClasses} text-blue-500`} />
    case 'group_joined':
      return <Users className={`${iconClasses} text-green-500`} />
    case 'meetup_scheduled':
      return <Calendar className={`${iconClasses} text-purple-500`} />
    case 'profile_viewed':
      return <UserPlus className={`${iconClasses} text-orange-500`} />
    case 'interest_matched':
      return <Sparkles className={`${iconClasses} text-yellow-500`} />
    default:
      return <Bell className={`${iconClasses} text-gray-500`} />
  }
}

const ActivityTypeColors = {
  new_match: 'bg-red-50 border-red-200',
  message_received: 'bg-blue-50 border-blue-200',
  group_joined: 'bg-green-50 border-green-200',
  meetup_scheduled: 'bg-purple-50 border-purple-200',
  profile_viewed: 'bg-orange-50 border-orange-200',
  interest_matched: 'bg-yellow-50 border-yellow-200'
}

const SkeletonActivityItem = () => (
  <div className="flex items-start space-x-3 p-4 border-b last:border-b-0">
    <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
      <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
    </div>
  </div>
)

export default function ActivityFeed({
  activities,
  isLoading,
  onMarkAsRead,
  onViewAll,
  maxItems = 5
}: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems)
  const hasMore = activities.length > maxItems

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Bell className="w-5 h-5 mr-2 text-blue-600" />
            Recent Activity
          </CardTitle>
          {activities.some(a => a.isUnread) && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {activities.filter(a => a.isUnread).length} new
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div>
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonActivityItem key={i} />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium mb-2">No recent activity</h3>
            <p className="text-sm">
              Start connecting with other medical professionals to see your activity here.
            </p>
          </div>
        ) : (
          <div>
            {displayedActivities.map((activity, index) => {
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`
                    relative p-4 border-b last:border-b-0 cursor-pointer transition-colors
                    ${activity.isUnread ? ActivityTypeColors[activity.type] || 'bg-gray-50' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => activity.isUnread && onMarkAsRead?.(activity.id)}
                >
                  <div className="flex items-start space-x-3">
                    {/* Activity Icon */}
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                        <ActivityIcon type={activity.type} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            {activity.title}
                          </h4>

                          <p className="text-sm text-gray-600 line-clamp-2">
                            {activity.description}
                          </p>

                          {activity.user && (
                            <div className="flex items-center mt-2 space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                                <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                  {activity.user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">{activity.user.name}</span>
                                {activity.user.specialty && (
                                  <span className="ml-1">• {activity.user.specialty}</span>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                            </div>

                            {activity.actionUrl && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // Handle navigation or action
                                }}
                              >
                                View
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {activity.isUnread && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {/* View All Button */}
            {(hasMore || onViewAll) && (
              <div className="p-4 border-t bg-gray-50">
                <Button
                  variant="ghost"
                  className="w-full text-sm text-blue-600 hover:text-blue-800"
                  onClick={onViewAll}
                >
                  View All Activity
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}