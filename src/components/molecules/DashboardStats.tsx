'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  MessageCircle,
  Eye,
  TrendingUp,
  Heart,
  Calendar,
  Star
} from 'lucide-react'
import { motion } from 'framer-motion'

interface DashboardStatsProps {
  stats: {
    totalMatches: number
    activeGroups: number
    messagesSent: number
    profileViews: number
    newMatchesToday?: number
    weeklyActivity?: number
    averageCompatibility?: number
    completedMeetups?: number
  }
  isLoading?: boolean
}

const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color = 'blue',
  delay = 0
}: {
  title: string
  value: string | number
  change?: string
  changeType?: 'increase' | 'decrease' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'red'
  delay?: number
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    red: 'bg-red-50 text-red-600 border-red-200'
  }

  const changeColors = {
    increase: 'text-green-600 bg-green-100',
    decrease: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
              {change && changeType && (
                <div className="flex items-center mt-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs px-2 py-1 ${changeColors[changeType]}`}
                  >
                    {changeType === 'increase' && '+'}
                    {change}
                  </Badge>
                </div>
              )}
            </div>
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const SkeletonStatCard = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
          <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </CardContent>
  </Card>
)

export default function DashboardStats({ stats, isLoading }: DashboardStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatCard key={i} />
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Matches',
      value: stats.totalMatches,
      change: stats.newMatchesToday ? `+${stats.newMatchesToday} today` : undefined,
      changeType: 'increase' as const,
      icon: Users,
      color: 'blue' as const
    },
    {
      title: 'Active Groups',
      value: stats.activeGroups,
      change: stats.activeGroups > 0 ? 'Active' : 'None yet',
      changeType: stats.activeGroups > 0 ? 'neutral' as const : 'neutral' as const,
      icon: MessageCircle,
      color: 'green' as const
    },
    {
      title: 'User Views',
      value: stats.profileViews || 0,
      change: stats.weeklyActivity ? `${stats.weeklyActivity}% this week` : undefined,
      changeType: (stats.weeklyActivity || 0) > 0 ? 'increase' as const : 'neutral' as const,
      icon: Eye,
      color: 'purple' as const
    },
    {
      title: 'Avg Compatibility',
      value: stats.averageCompatibility ? `${stats.averageCompatibility}%` : 'N/A',
      change: stats.averageCompatibility && stats.averageCompatibility > 70 ? 'Excellent' : 'Good',
      changeType: 'neutral' as const,
      icon: Star,
      color: 'orange' as const
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            delay={index * 0.1}
          />
        ))}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Weekly Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">
                {stats.weeklyActivity || 0}%
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {stats.weeklyActivity && stats.weeklyActivity > 0
                  ? 'More active than last week'
                  : 'Complete your profile to increase activity'
                }
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                Connections Made
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">
                {stats.messagesSent || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Messages sent this month
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Meetups
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold text-gray-900">
                {stats.completedMeetups || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Completed this month
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}