'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Heart,
  MessageCircle,
  User,
  MapPin,
  Stethoscope,
  Calendar,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface MatchCardProps {
  match: {
    id: string
    name: string
    specialty: string | null
    careerStage?: string | null
    city?: string | null
    age?: number | null
    compatibility: number | null
    lastActive: string
    avatar?: string
    bio?: string | null
    commonInterests?: string[]
    isOnline?: boolean
  }
  onMessage?: (matchId: string) => void
  onViewProfile?: (matchId: string) => void
  showCompatibilityBreakdown?: boolean
}

export default function MatchCard({
  match,
  onMessage,
  onViewProfile,
  showCompatibilityBreakdown = false
}: MatchCardProps) {

  const getCompatibilityColor = (score: number | null) => {
    if (!score) return 'text-gray-400'
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getCompatibilityLabel = (score: number | null) => {
    if (!score) return 'Unknown'
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Fair Match'
    return 'Poor Match'
  }

  const formatCareerStage = (stage: string | null) => {
    if (!stage) return null
    return stage.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const initials = match.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={match.avatar} alt={match.name} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {match.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {match.name}
                </h3>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  {match.specialty && (
                    <div className="flex items-center">
                      <Stethoscope className="w-3 h-3 mr-1" />
                      <span className="truncate">{match.specialty}</span>
                    </div>
                  )}
                </div>
                {match.careerStage && (
                  <div className="text-xs text-gray-500 mt-0.5">
                    {formatCareerStage(match.careerStage)}
                  </div>
                )}
              </div>
            </div>

            {match.compatibility && (
              <div className="text-right">
                <div className={`text-lg font-bold ${getCompatibilityColor(match.compatibility)}`}>
                  {match.compatibility}%
                </div>
                <div className="text-xs text-gray-500">
                  match
                </div>
              </div>
            )}
          </div>

          {/* Location and Age */}
          <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
            <div className="flex items-center space-x-4">
              {match.city && (
                <div className="flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>{match.city}</span>
                </div>
              )}
              {match.age && (
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1" />
                  <span>{match.age} years old</span>
                </div>
              )}
            </div>
            <div className="text-xs">
              {match.lastActive}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Compatibility Score */}
          {match.compatibility && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Compatibility</span>
                <span className={`font-medium ${getCompatibilityColor(match.compatibility)}`}>
                  {getCompatibilityLabel(match.compatibility)}
                </span>
              </div>
              <Progress
                value={match.compatibility}
                className="h-2"
                // You might want to add a color variant prop to Progress component
              />
            </div>
          )}

          {/* Bio Preview */}
          {match.bio && (
            <div className="mb-4">
              <p className="text-sm text-gray-700 line-clamp-2">
                {match.bio}
              </p>
            </div>
          )}

          {/* Common Interests */}
          {match.commonInterests && match.commonInterests.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-2">Common Interests</div>
              <div className="flex flex-wrap gap-1">
                {match.commonInterests.slice(0, 3).map((interest) => (
                  <Badge key={interest} variant="secondary" className="text-xs">
                    {interest}
                  </Badge>
                ))}
                {match.commonInterests.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{match.commonInterests.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onViewProfile?.(match.id)}
            >
              <User className="w-4 h-4 mr-2" />
              View User
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onMessage?.(match.id)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <div className="flex space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="w-4 h-4 text-gray-500 hover:text-red-500" />
              </button>
              <Link
                href={`/calendar?with=${match.id}`}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Calendar className="w-4 h-4 text-gray-500 hover:text-blue-500" />
              </Link>
            </div>

            <Link
              href={`/matches/${match.id}`}
              className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              View Details
              <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}