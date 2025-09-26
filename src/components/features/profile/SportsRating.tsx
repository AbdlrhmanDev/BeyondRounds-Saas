"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Star, Activity } from 'lucide-react'
// Define sports activities locally
const SPORTS_ACTIVITIES = [
  'Running', 'Swimming', 'Cycling', 'Tennis', 'Basketball', 'Soccer',
  'Volleyball', 'Golf', 'Hiking', 'Rock Climbing', 'Yoga', 'Pilates',
  'Weightlifting', 'CrossFit', 'Martial Arts', 'Dancing', 'Skiing',
  'Snowboarding', 'Surfing', 'Sailing', 'Rowing', 'Boxing', 'Badminton',
  'Squash', 'Racquetball', 'Table Tennis', 'Bowling', 'Archery', 'Fencing'
]

interface SportsRatingProps {
  selectedSports: string[]
  sportsRatings: Record<string, number>
  onSportsChange: (sports: string[]) => void
  onRatingsChange: (ratings: Record<string, number>) => void
}

export default function SportsRating({ 
  selectedSports, 
  sportsRatings, 
  onSportsChange, 
  onRatingsChange 
}: SportsRatingProps) {
  const [showRatings, setShowRatings] = useState(false)

  const toggleSport = (sport: string) => {
    const newSports = selectedSports.includes(sport)
      ? selectedSports.filter(s => s !== sport)
      : [...selectedSports, sport]
    
    onSportsChange(newSports)
    
    // If removing a sport, also remove its rating
    if (!newSports.includes(sport)) {
      const newRatings = { ...sportsRatings }
      delete newRatings[sport]
      onRatingsChange(newRatings)
    }
  }

  const setRating = (sport: string, rating: number) => {
    onRatingsChange({
      ...sportsRatings,
      [sport]: rating
    })
  }

  const renderStars = (sport: string, currentRating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(sport, star)}
            className={`p-1 rounded transition-colors ${
              star <= currentRating 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
          >
            <Star className="h-4 w-4 fill-current" />
          </button>
        ))}
        <span className="text-sm text-gray-600 ml-2">
          {currentRating}/5
        </span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Sports & Physical Activities
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select sports you enjoy and rate your interest level (1-5 stars)
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Sports Selection */}
        <div>
          <Label className="text-base font-medium">Sports You Enjoy (multi-select)</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {SPORTS_ACTIVITIES.map((sport: string) => (
              <div key={sport} className="flex items-center space-x-2">
                <Checkbox
                  id={sport}
                  checked={selectedSports.includes(sport)}
                  onCheckedChange={() => toggleSport(sport)}
                />
                <Label htmlFor={sport} className="text-sm cursor-pointer">
                  {sport}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Section */}
        {selectedSports.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Rate Your Interest Level</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowRatings(!showRatings)}
              >
                {showRatings ? 'Hide Ratings' : 'Show Ratings'}
              </Button>
            </div>

            {showRatings && (
              <div className="space-y-3">
                {selectedSports.map((sport) => (
                  <div key={sport} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{sport}</Badge>
                    </div>
                    {renderStars(sport, sportsRatings[sport] || 0)}
                  </div>
                ))}
              </div>
            )}

            {/* Summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Selected Sports ({selectedSports.length})</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSports.map((sport) => (
                  <Badge key={sport} variant="outline" className="text-xs">
                    {sport} {sportsRatings[sport] ? `(${sportsRatings[sport]}/5)` : '(unrated)'}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Level */}
        <div>
          <Label className="text-base font-medium">Activity Level</Label>
          <p className="text-sm text-gray-600 mb-3">
            How often do you engage in physical activities?
          </p>
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: 'very_active', label: 'Very active (5+ times/week)' },
              { value: 'active', label: 'Active (3-4 times/week)' },
              { value: 'moderately_active', label: 'Moderately active (1-2 times/week)' },
              { value: 'occasionally_active', label: 'Occasionally active' },
              { value: 'non-physical', label: 'Prefer non-physical activities' }
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={option.value}
                  name="activityLevel"
                  value={option.value}
                  className="text-blue-600"
                />
                <Label htmlFor={option.value} className="text-sm cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
