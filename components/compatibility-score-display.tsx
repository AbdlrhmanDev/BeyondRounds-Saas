"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Heart, 
  Users, 
  Stethoscope, 
  Activity, 
  Calendar, 
  MapPin, 
  Home,
  Info
} from "lucide-react"
import { CompatibilityScore, MatchScore } from "@/lib/types/profile"

interface CompatibilityScoreDisplayProps {
  compatibility: CompatibilityScore
  matchScore?: MatchScore
  showBreakdown?: boolean
  className?: string
}

export default function CompatibilityScoreDisplay({ 
  compatibility, 
  matchScore, 
  showBreakdown = false,
  className = "" 
}: CompatibilityScoreDisplayProps) {
  const getScoreColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'bg-green-500'
      case 'great':
        return 'bg-blue-500'
      case 'good':
        return 'bg-yellow-500'
      case 'decent':
        return 'bg-orange-500'
      case 'moderate':
        return 'bg-gray-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getBadgeVariant = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'default' as const
      case 'great':
        return 'secondary' as const
      case 'good':
        return 'outline' as const
      case 'decent':
        return 'outline' as const
      case 'moderate':
        return 'outline' as const
      default:
        return 'outline' as const
    }
  }

  const formatBreakdownLabel = (key: string) => {
    switch (key) {
      case 'medicalSpecialty':
        return 'Medical Specialty'
      case 'interests':
        return 'Interests'
      case 'socialPreferences':
        return 'Social Preferences'
      case 'availability':
        return 'Availability'
      case 'geographic':
        return 'Geographic'
      case 'lifestyle':
        return 'Lifestyle'
      default:
        return key
    }
  }

  const getBreakdownIcon = (key: string) => {
    switch (key) {
      case 'medicalSpecialty':
        return <Stethoscope className="h-4 w-4" />
      case 'interests':
        return <Heart className="h-4 w-4" />
      case 'socialPreferences':
        return <Users className="h-4 w-4" />
      case 'availability':
        return <Calendar className="h-4 w-4" />
      case 'geographic':
        return <MapPin className="h-4 w-4" />
      case 'lifestyle':
        return <Home className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg">Compatibility Score</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    This score is calculated based on medical specialty (20%), 
                    interests (40%), social preferences (20%), availability (10%), 
                    geographic proximity (5%), and lifestyle compatibility (5%).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Score Display */}
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-3">
              <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  strokeDasharray="100, 100"
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  className={getScoreColor(compatibility.level)}
                  strokeDasharray={`${compatibility.percentage}, 100`}
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">{compatibility.percentage}%</span>
              </div>
            </div>
            
            <Badge variant={getBadgeVariant(compatibility.level)} className="mb-2">
              {compatibility.level.charAt(0).toUpperCase() + compatibility.level.slice(1)} Match
            </Badge>
            
            <p className="text-sm text-gray-600 max-w-xs mx-auto">
              {compatibility.description}
            </p>
          </div>

          {/* Breakdown Display */}
          {showBreakdown && matchScore && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium text-sm text-gray-700">Compatibility Breakdown</h4>
              {Object.entries(matchScore.breakdown).map(([key, score]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getBreakdownIcon(key)}
                      <span>{formatBreakdownLabel(key)}</span>
                    </div>
                    <span className="font-medium">{Math.round(score * 100)}%</span>
                  </div>
                  <Progress 
                    value={score * 100} 
                    className="h-2" 
                  />
                </div>
              ))}
            </div>
          )}

          {/* Weight Information */}
          {showBreakdown && (
            <div className="pt-3 border-t">
              <h4 className="font-medium text-sm text-gray-700 mb-2">Scoring Weights</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div>• Medical Specialty: 20%</div>
                <div>• Interests: 40%</div>
                <div>• Social Preferences: 20%</div>
                <div>• Availability: 10%</div>
                <div>• Geographic: 5%</div>
                <div>• Lifestyle: 5%</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Simplified version for inline display
export function CompatibilityBadge({ 
  compatibility, 
  showPercentage = true 
}: { 
  compatibility: CompatibilityScore
  showPercentage?: boolean 
}) {
  const getScoreColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'great':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'good':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'decent':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'moderate':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <Badge 
      variant="outline" 
      className={`${getScoreColor(compatibility.level)} font-medium`}
    >
      {showPercentage && `${compatibility.percentage}% `}
      {compatibility.level.charAt(0).toUpperCase() + compatibility.level.slice(1)} Match
    </Badge>
  )
}

// Mini version for cards
export function CompatibilityMini({ 
  compatibility 
}: { 
  compatibility: CompatibilityScore 
}) {
  const getScoreColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'text-green-600'
      case 'great':
        return 'text-blue-600'
      case 'good':
        return 'text-yellow-600'
      case 'decent':
        return 'text-orange-600'
      case 'moderate':
        return 'text-gray-600'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`text-sm font-medium ${getScoreColor(compatibility.level)}`}>
        {compatibility.percentage}%
      </div>
      <div className="text-xs text-gray-500">
        {compatibility.level} match
      </div>
    </div>
  )
}
