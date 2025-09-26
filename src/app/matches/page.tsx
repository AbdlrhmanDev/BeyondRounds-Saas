"use client"
 
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Heart, 
  MessageCircle, 
  MapPin, 
  Calendar,
  Star,
  Filter,
  Search,
  MoreVertical,
  Phone,
  Video,
  Coffee,
  Mountain,
  BookOpen,
  Circle,
  Music,
  Wine,
  Snowflake,
  Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'
 
interface Match {
  id: string
  name: string
  specialty: string
  hospital: string
  compatibility: number
  lastActive: string
  avatar: string
  interests: string[]
  location: string
  age: number
  careerStage: string
  mutualInterests: number
  status: string
  bio?: string
  phone?: string
  email?: string
}
 
export default function MatchesPage() {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
 
  useEffect(() => {
    loadMatches()
  }, [])
 
  const loadMatches = async () => {
    setIsLoading(true)
    try {
      console.log('🔄 Loading matches...')
      
      const response = await fetch('/api/matches')
      const result = await response.json()
 
      if (!result.success) {
        throw new Error(result.error || 'Failed to load matches')
      }
 
      console.log(`📊 Loaded ${result.data?.length || 0} matches`)
      setMatches(result.data || [])
    } catch (error) {
      console.error('Failed to load matches:', error)
      toast.error('Failed to load matches')
    } finally {
      setIsLoading(false)
    }
  }
 
  const handleMatchAction = async (matchId: string, action: 'like' | 'message') => {
    setIsProcessing(matchId)
    try {
      if (action === 'like') {
        const response = await fetch('/api/matches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user1Id: 'f4322027-66bd-4016-98f2-96fe8416896c', // Current user
            user2Id: matchId,
            action: 'like'
          })
        })
 
        const result = await response.json()
 
        if (!result.success) {
          throw new Error(result.error || 'Failed to process match')
        }
 
        toast.success('Match created! 🎉')
        
        // Update the match status
        setMatches(prev => prev.map(match => 
          match.id === matchId 
            ? { ...match, status: 'active' }
            : match
        ))
      } else if (action === 'message') {
        // First create a match if it doesn't exist
        const response = await fetch('/api/matches', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user1Id: 'f4322027-66bd-4016-98f2-96fe8416896c', // Current user
            user2Id: matchId,
            action: 'like'
          })
        })
 
        const result = await response.json()
 
        if (!result.success) {
          throw new Error(result.error || 'Failed to create match')
        }
 
        toast.success('Match created! Starting conversation...')
        
        // Update the match status
        setMatches(prev => prev.map(match => 
          match.id === matchId 
            ? { ...match, status: 'active' }
            : match
        ))
 
        // Navigate to chat or open chat modal
        // Navigate to messages page where they can find their new chat
        setTimeout(() => {
          window.location.href = '/messages'
        }, 1000)
      }
    } catch (error) {
      console.error('Failed to process match action:', error)
      toast.error('Failed to process action')
    } finally {
      setIsProcessing(null)
    }
  }
 
  const filteredMatches = matches.filter(match => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'new') return match.status === 'new'
    if (selectedFilter === 'active') return match.status === 'active'
    if (selectedFilter === 'pending') return match.status === 'pending'
    return true
  })
 
  const getCompatibilityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-purple-600 bg-purple-100'
    return 'text-orange-600 bg-orange-100'
  }
 
  const getCompatibilityText = (score: number) => {
    if (score >= 90) return 'Excellent Match!'
    if (score >= 80) return 'Great Match!'
    if (score >= 70) return 'Good Match!'
    return 'Decent Match!'
  }
 
  const getInterestIcon = (interest: string) => {
    switch (interest.toLowerCase()) {
      case 'coffee': return Coffee
      case 'hiking': return Mountain
      case 'reading': return BookOpen
      case 'tennis': return Circle
      case 'music': return Music
      case 'wine': return Wine
      case 'rock climbing': return Mountain
      case 'skiing': return Snowflake
      case 'dancing': return Music
      default: return Heart
    }
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Your Matches
              </h1>
              <p className="text-xl text-gray-600">
                Connect with compatible medical professionals
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>
 
        {/* Filter Tabs */}
        <div className="mb-8">
          <div className="flex space-x-4">
            {[
              { key: 'all', label: 'All Matches', count: matches.length },
              { key: 'new', label: 'New', count: matches.filter(m => m.status === 'new').length },
              { key: 'active', label: 'Active', count: matches.filter(m => m.status === 'active').length },
              { key: 'pending', label: 'Pending', count: matches.filter(m => m.status === 'pending').length }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setSelectedFilter(filter.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === filter.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </div>
 
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            Loading matches...
          </div>
        )}
 
        {/* Matches Grid */}
        {!isLoading && (
          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMatches.map((match) => {
              return (
                <Card key={match.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                          {match.avatar}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{match.name}</CardTitle>
                          <p className="text-gray-600 text-sm">{match.specialty}</p>
                          <p className="text-gray-500 text-xs">{match.hospital}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Compatibility Score */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        Compatibility
                        <Badge className={`${getCompatibilityColor(match.compatibility)} text-sm`}>
                          {match.compatibility}%
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{getCompatibilityText(match.compatibility)}</p>
                      <p className="text-xs text-gray-500">{match.mutualInterests} shared interests</p>
                    </div>
 
                    {/* Basic Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {match.location} • Age {match.age}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 mr-2" />
                        {match.careerStage}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Last active {match.lastActive}
                      </div>
                    </div>
 
                    {/* Bio */}
                    {match.bio && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">{match.bio}</p>
                      </div>
                    )}
 
                    {/* Interests */}
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {match.interests.map((interest, index) => {
                          const Icon = getInterestIcon(interest)
                          return (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Icon className="w-3 h-3 mr-1" />
                              {interest}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
 
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleMatchAction(match.id, 'message')}
                        disabled={isProcessing === match.id}
                      >
                        {isProcessing === match.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <MessageCircle className="w-4 h-4 mr-2" />
                        )}
                        Message
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleMatchAction(match.id, 'like')}
                        disabled={isProcessing === match.id}
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
 
        {/* No Matches State */}
        {!isLoading && filteredMatches.length === 0 && (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600 mb-6">
                {selectedFilter === 'all' 
                  ? "You don't have any matches yet. Complete your profile to get started!"
                  : `No ${selectedFilter} matches at the moment.`
                }
              </p>
              <div className="flex space-x-4 justify-center">
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={loadMatches}>
                  Refresh Matches
                </Button>
                <Button variant="outline">
                  Complete User
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
 
        {/* Stats Summary */}
        {!isLoading && matches.length > 0 && (
          <div className="mt-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Match Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{matches.length}</div>
                    <p className="text-sm text-gray-600">Total Matches</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {matches.filter(m => m.compatibility >= 90).length}
                    </div>
                    <p className="text-sm text-gray-600">Excellent Matches</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {matches.filter(m => m.status === 'active').length}
                    </div>
                    <p className="text-sm text-gray-600">Active Conversations</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 mb-1">
                      {matches.length > 0 ? Math.round(matches.reduce((acc, m) => acc + m.compatibility, 0) / matches.length) : 0}
                    </div>
                    <p className="text-sm text-gray-600">Avg Compatibility</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}