import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Users,
  MapPin,
  Search,
  Star,
  Clock,
  MessageSquare
} from 'lucide-react'
import Link from 'next/link'

interface Group {
  id: string
  name: string
  description: string
  specialty: string
  location: string
  member_count: number
  max_members: number
  created_at: string
  last_activity: string
  tags: string[]
  creator: {
    id: string
    name: string
    avatar_url?: string
  }
  members: Array<{
    id: string
    name: string
    avatar_url?: string
  }>
  compatibility_score?: number
  is_member: boolean
  is_private: boolean
}

interface GroupMatchingProps {
  currentUserId: string
  userSpecialty?: string
  userLocation?: string
}

export function GroupMatching({
  currentUserId: _currentUserId,
  userSpecialty = '',
  userLocation: _userLocation = ''
}: GroupMatchingProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [specialtyFilter, setSpecialtyFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('')
  const [sortBy, setSortBy] = useState('compatibility')

  // Mock data - in real app this would come from props or API
  const [groups] = useState<Group[]>([
    {
      id: '1',
      name: 'Cardiology Residents NYC',
      description: 'A group for cardiology residents in New York City to share knowledge, discuss cases, and network.',
      specialty: 'Cardiology',
      location: 'New York, NY',
      member_count: 24,
      max_members: 50,
      created_at: '2024-01-15',
      last_activity: '2 hours ago',
      tags: ['Residency', 'Case Studies', 'Networking'],
      creator: {
        id: 'creator1',
        name: 'Dr. Sarah Johnson',
        avatar_url: undefined
      },
      members: [
        { id: 'member1', name: 'Dr. Mike Chen' },
        { id: 'member2', name: 'Dr. Lisa Park' }
      ],
      compatibility_score: 95,
      is_member: false,
      is_private: false
    },
    {
      id: '2',
      name: 'Emergency Medicine Study Group',
      description: 'Weekly study sessions and case discussions for EM physicians and residents.',
      specialty: 'Emergency Medicine',
      location: 'Los Angeles, CA',
      member_count: 18,
      max_members: 30,
      created_at: '2024-02-01',
      last_activity: '1 day ago',
      tags: ['Study Group', 'Board Prep', 'Case Reviews'],
      creator: {
        id: 'creator2',
        name: 'Dr. James Wilson'
      },
      members: [
        { id: 'member3', name: 'Dr. Anna Rodriguez' },
        { id: 'member4', name: 'Dr. David Kim' }
      ],
      compatibility_score: 88,
      is_member: true,
      is_private: false
    },
    {
      id: '3',
      name: 'Women in Surgery',
      description: 'Supporting and empowering women in surgical specialties through mentorship and collaboration.',
      specialty: 'Surgery',
      location: 'Chicago, IL',
      member_count: 42,
      max_members: 100,
      created_at: '2023-11-20',
      last_activity: '3 hours ago',
      tags: ['Mentorship', 'Women in Medicine', 'Career Development'],
      creator: {
        id: 'creator3',
        name: 'Dr. Rachel Martinez'
      },
      members: [
        { id: 'member5', name: 'Dr. Jennifer Lee' },
        { id: 'member6', name: 'Dr. Maria Gonzalez' }
      ],
      compatibility_score: 72,
      is_member: false,
      is_private: false
    }
  ])

  const specialties = [
    'Cardiology', 'Emergency Medicine', 'Surgery', 'Internal Medicine',
    'Pediatrics', 'Neurology', 'Oncology', 'Psychiatry', 'Radiology'
  ]

  const filteredGroups = groups
    .filter(group => {
      const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           group.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSpecialty = !specialtyFilter || specialtyFilter === 'all' || group.specialty === specialtyFilter
      const matchesLocation = !locationFilter || group.location.toLowerCase().includes(locationFilter.toLowerCase())
      return matchesSearch && matchesSpecialty && matchesLocation
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'compatibility':
          return (b.compatibility_score || 0) - (a.compatibility_score || 0)
        case 'members':
          return b.member_count - a.member_count
        case 'activity':
          // Simple activity sort - in real app would use actual timestamps
          return a.last_activity.localeCompare(b.last_activity)
        default:
          return 0
      }
    })

  const handleJoinGroup = (groupId: string) => {
    // In real app, this would make an API call
    console.log('Joining group:', groupId)
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Find Your Groups</h1>
          <p className="text-gray-600">Discover and join professional groups in your specialty</p>
        </div>
        <Button asChild>
          <Link href="/groups/create">Create Group</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map(specialty => (
                  <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Location..."
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compatibility">Best Match</SelectItem>
                <SelectItem value="members">Most Members</SelectItem>
                <SelectItem value="activity">Recent Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Groups */}
      {userSpecialty && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Recommended for {userSpecialty}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups
              .filter(group => group.specialty === userSpecialty)
              .slice(0, 3)
              .map(group => (
                <Card key={group.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary">{group.compatibility_score}% match</Badge>
                      <Star className="h-4 w-4 text-yellow-500" />
                    </div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {group.description}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {group.member_count} members
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {group.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        Active {group.last_activity}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {group.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4">
                      {group.is_member ? (
                        <Button variant="outline" className="w-full" asChild>
                          <Link href={`/groups/${group.id}`}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Open Group
                          </Link>
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handleJoinGroup(group.id)}
                        >
                          Join Group
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* All Groups */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Groups ({filteredGroups.length})</h2>
        <div className="space-y-4">
          {filteredGroups.map(group => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{group.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{group.specialty}</span>
                          <span>•</span>
                          <span>{group.location}</span>
                          <span>•</span>
                          <span>{group.member_count} members</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-3">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {group.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>Active {group.last_activity}</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex flex-col space-y-2">
                    {group.compatibility_score && (
                      <Badge variant="secondary">
                        {group.compatibility_score}% match
                      </Badge>
                    )}
                    {group.is_member ? (
                      <Button variant="outline" asChild>
                        <Link href={`/groups/${group.id}`}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Open
                        </Link>
                      </Button>
                    ) : (
                      <Button onClick={() => handleJoinGroup(group.id)}>
                        Join Group
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredGroups.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No groups found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or create a new group.
            </p>
            <Button asChild>
              <Link href="/groups/create">Create New Group</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}