import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  MessageCircle, 
  Users, 
  MapPin, 
  Stethoscope, 
  Target 
} from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { MatchCardProps } from '@/lib/types'

export function MatchCard({ match, getInitials, getLastMessage, getLastMessageTime }: MatchCardProps) {
  return (
    <Card className="group hover:shadow-xl transition-all duration-300 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-white/80">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-500 animate-pulse" />
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                {match.group_name}
              </h3>
              <Badge 
                variant={match.status === 'active' ? 'default' : 'secondary'}
                className={match.status === 'active' ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                {match.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {formatDistanceToNow(new Date(match.created_at), { addSuffix: true })}
              </Badge>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex -space-x-3">
                {match.match_members.slice(0, 5).map((member, index) => (
                  <Avatar key={index} className="w-10 h-10 border-3 border-white shadow-lg">
                    <AvatarFallback className="text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {getInitials(member.profiles.first_name || '', member.profiles.last_name || '')}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {match.match_members.length > 5 && (
                  <div className="w-10 h-10 rounded-full bg-gray-100 border-3 border-white shadow-lg flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600">
                      +{match.match_members.length - 5}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {match.match_members.length} members
                </span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {[...new Set(match.match_members.map(m => m.profiles.city))].join(', ')}
                </span>
              </div>
            </div>

            <div className="bg-gray-50/50 rounded-lg p-3 mb-4">
              <div className="text-sm text-gray-600 mb-2">
                <Stethoscope className="w-4 h-4 inline mr-2" />
                <strong>Specialties:</strong>{' '}
                {[...new Set(match.match_members.map(m => m.profiles.specialty))].join(', ')}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                <Users className="w-4 h-4 inline mr-2" />
                <strong>Members:</strong>{' '}
                {match.match_members.map(m => `${m.profiles.first_name} ${m.profiles.last_name}`).join(', ')}
              </div>
              <div className="text-sm text-gray-500">
                <MessageCircle className="w-4 h-4 inline mr-2" />
                {getLastMessage(match)}
                {getLastMessageTime(match) && (
                  <span className="ml-2 text-blue-500">• {getLastMessageTime(match)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 ml-4">
            <Link href={`/chat/${match.id}`}>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                <MessageCircle className="w-4 h-4 mr-2" />
                Open Chat
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="bg-white/50 backdrop-blur-sm">
              <Target className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}