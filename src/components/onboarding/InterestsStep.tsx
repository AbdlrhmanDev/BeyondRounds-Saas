'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, X, Dumbbell, Music, Film, Coffee } from 'lucide-react'

const SPORTS_ACTIVITIES = [
  'Running', 'Yoga', 'Swimming', 'Cycling', 'Hiking', 'Tennis', 'Basketball',
  'Soccer', 'Golf', 'Rock Climbing', 'Skiing', 'Surfing', 'Boxing', 'CrossFit',
  'Pilates', 'Volleyball', 'Baseball', 'Football', 'Hockey', 'Martial Arts',
  'Dancing', 'Weightlifting', 'Walking', 'Other'
]

const MUSIC_GENRES = [
  'Pop', 'Rock', 'Hip Hop', 'Classical', 'Jazz', 'Country', 'Electronic',
  'R&B', 'Indie', 'Alternative', 'Folk', 'Blues', 'Reggae', 'Metal',
  'Punk', 'Gospel', 'World Music', 'Ambient', 'Other'
]

const MOVIE_GENRES = [
  'Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Fantasy',
  'Thriller', 'Documentary', 'Animation', 'Adventure', 'Mystery', 'Crime',
  'Western', 'War', 'Biography', 'Musical', 'Historical', 'Other'
]

const OTHER_INTERESTS = [
  'Reading', 'Cooking', 'Photography', 'Travel', 'Art', 'Gaming',
  'Gardening', 'Writing', 'Technology', 'Fashion', 'Wine Tasting',
  'Board Games', 'Volunteering', 'Learning Languages', 'Meditation',
  'Podcasts', 'Stand-up Comedy', 'Museums', 'Theater', 'Concerts'
]

const schema = z.object({
  sportsActivities: z.record(z.number().min(1).max(5)).optional(),
  musicGenres: z.array(z.string()).optional(),
  movieGenres: z.array(z.string()).optional(),
  otherInterests: z.array(z.string()).optional(),
})

type FormData = z.infer<typeof schema>

interface InterestsStepProps {
  data: Record<string, unknown>
  onNext: (data: FormData) => void
  onPrevious: () => void
}

export default function InterestsStep({ data, onNext, onPrevious }: InterestsStepProps) {
  const [sportsActivities, setSportsActivities] = useState<Record<string, number>>(
    (data.sportsActivities as Record<string, number>) || {}
  )
  const [musicGenres, setMusicGenres] = useState<string[]>((data.musicGenres as string[]) || [])
  const [movieGenres, setMovieGenres] = useState<string[]>((data.movieGenres as string[]) || [])
  const [otherInterests, setOtherInterests] = useState<string[]>((data.otherInterests as string[]) || [])

  const {
    handleSubmit,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sportsActivities: (data.sportsActivities as Record<string, number>) || {},
      musicGenres: (data.musicGenres as string[]) || [],
      movieGenres: (data.movieGenres as string[]) || [],
      otherInterests: (data.otherInterests as string[]) || [],
    },
    mode: 'onBlur',
  })

  const handleSportsToggle = (sport: string) => {
    const updated = { ...sportsActivities }
    if (sport in updated) {
      delete updated[sport]
    } else {
      updated[sport] = 3 // Default to medium interest
    }
    setSportsActivities(updated)
    setValue('sportsActivities', updated)
  }

  const handleSportsRatingChange = (sport: string, rating: number[]) => {
    const updated = { ...sportsActivities, [sport]: rating[0] }
    setSportsActivities(updated)
    setValue('sportsActivities', updated)
  }

  const handleGenreToggle = (genre: string, category: 'music' | 'movie') => {
    const currentList = category === 'music' ? musicGenres : movieGenres
    const setFunction = category === 'music' ? setMusicGenres : setMovieGenres
    const fieldName = category === 'music' ? 'musicGenres' : 'movieGenres'

    const updated = currentList.includes(genre)
      ? currentList.filter(g => g !== genre)
      : [...currentList, genre]

    setFunction(updated)
    setValue(fieldName, updated)
  }

  const handleOtherInterestToggle = (interest: string) => {
    const updated = otherInterests.includes(interest)
      ? otherInterests.filter(i => i !== interest)
      : [...otherInterests, interest]

    setOtherInterests(updated)
    setValue('otherInterests', updated)
  }

  const onSubmit = (_formData: FormData) => {
    onNext({
      sportsActivities,
      musicGenres,
      movieGenres,
      otherInterests,
    })
  }

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Low Interest'
      case 2: return 'Some Interest'
      case 3: return 'Moderate Interest'
      case 4: return 'High Interest'
      case 5: return 'Very High Interest'
      default: return 'No Rating'
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Sports & Physical Activities */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Dumbbell className="w-5 h-5" />
            Sports & Physical Activities
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select activities you enjoy and rate your interest level (1-5 scale)
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SPORTS_ACTIVITIES.map((sport) => (
                <div key={sport} className="flex items-center space-x-2">
                  <Checkbox
                    id={`sport-${sport}`}
                    checked={sport in sportsActivities}
                    onCheckedChange={() => handleSportsToggle(sport)}
                  />
                  <Label htmlFor={`sport-${sport}`} className="text-sm cursor-pointer">
                    {sport}
                  </Label>
                </div>
              ))}
            </div>

            {Object.keys(sportsActivities).length > 0 && (
              <div className="space-y-4 mt-6">
                <h4 className="font-medium text-sm">Rate Your Interest Level:</h4>
                {Object.entries(sportsActivities).map(([sport, rating]) => (
                  <div key={sport} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{sport}</span>
                      <Badge variant="outline" className="text-xs">
                        {getRatingLabel(rating)}
                      </Badge>
                    </div>
                    <Slider
                      value={[rating]}
                      onValueChange={(value) => handleSportsRatingChange(sport, value)}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Music Preferences */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Music className="w-5 h-5" />
            Music Preferences
          </CardTitle>
          <p className="text-sm text-gray-600">
            What genres do you enjoy listening to?
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MUSIC_GENRES.map((genre) => (
              <div key={genre} className="flex items-center space-x-2">
                <Checkbox
                  id={`music-${genre}`}
                  checked={musicGenres.includes(genre)}
                  onCheckedChange={() => handleGenreToggle(genre, 'music')}
                />
                <Label htmlFor={`music-${genre}`} className="text-sm cursor-pointer">
                  {genre}
                </Label>
              </div>
            ))}
          </div>
          {musicGenres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {musicGenres.map((genre) => (
                <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                  {genre}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleGenreToggle(genre, 'music')}
                  />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Movie Preferences */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Film className="w-5 h-5" />
            Movie & TV Preferences
          </CardTitle>
          <p className="text-sm text-gray-600">
            What genres do you like to watch?
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MOVIE_GENRES.map((genre) => (
              <div key={genre} className="flex items-center space-x-2">
                <Checkbox
                  id={`movie-${genre}`}
                  checked={movieGenres.includes(genre)}
                  onCheckedChange={() => handleGenreToggle(genre, 'movie')}
                />
                <Label htmlFor={`movie-${genre}`} className="text-sm cursor-pointer">
                  {genre}
                </Label>
              </div>
            ))}
          </div>
          {movieGenres.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {movieGenres.map((genre) => (
                <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                  {genre}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleGenreToggle(genre, 'movie')}
                  />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Interests */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Coffee className="w-5 h-5" />
            Other Interests & Hobbies
          </CardTitle>
          <p className="text-sm text-gray-600">
            What else do you enjoy doing in your free time?
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {OTHER_INTERESTS.map((interest) => (
              <div key={interest} className="flex items-center space-x-2">
                <Checkbox
                  id={`interest-${interest}`}
                  checked={otherInterests.includes(interest)}
                  onCheckedChange={() => handleOtherInterestToggle(interest)}
                />
                <Label htmlFor={`interest-${interest}`} className="text-sm cursor-pointer">
                  {interest}
                </Label>
              </div>
            ))}
          </div>
          {otherInterests.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {otherInterests.map((interest) => (
                <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                  {interest}
                  <X
                    className="w-3 h-3 cursor-pointer"
                    onClick={() => handleOtherInterestToggle(interest)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Don't worry if you don't see all your interests listed. You can always update your profile later!
        </AlertDescription>
      </Alert>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button type="submit">
          Continue
        </Button>
      </div>
    </form>
  )
}