import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Users, 
  BarChart3, 
  Zap 
} from 'lucide-react'
import Link from 'next/link'
import { StatsGridProps } from '@/lib/types'

export function StatsGrid({ profile, stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Verification Status */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Verification Status</CardTitle>
          {profile?.is_verified ? (
            <CheckCircle className="w-5 h-5 text-green-600" />
          ) : (
            <Clock className="w-5 h-5 text-amber-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">
            {profile?.is_verified ? 'Verified' : 'Pending'}
          </div>
          <p className="text-xs text-green-700 mt-1">
            {profile?.is_verified ? 'Your account is verified ✓' : 'Complete verification to start matching'}
          </p>
          {!profile?.is_verified && (
            <Link href="/verify" className="mt-3 inline-block">
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                Complete Verification
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Subscription Status */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Subscription</CardTitle>
          {profile?.is_paid ? (
            <CheckCircle className="w-5 h-5 text-blue-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">
            {profile?.is_paid ? 'Active' : 'Inactive'}
          </div>
          <p className="text-xs text-blue-700 mt-1">
            {profile?.is_paid ? 'Ready for weekly matches 🚀' : 'Subscribe to start matching'}
          </p>
          {!profile?.is_paid && (
            <Link href="/pricing" className="mt-3 inline-block">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                View Plans
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Active Groups */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Active Groups</CardTitle>
          <Users className="w-5 h-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-900">{stats.totalMatches}</div>
          <p className="text-xs text-purple-700 mt-1">Professional connections</p>
          <Progress value={stats.completionRate} className="mt-2 h-2" />
        </CardContent>
      </Card>

      {/* This Week */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-red-50 border-orange-200/50 hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-800">This Week</CardTitle>
          <BarChart3 className="w-5 h-5 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{stats.thisWeekMatches}</div>
          <p className="text-xs text-orange-700 mt-1">New matches this week</p>
          <div className="flex items-center gap-1 mt-2">
            <Zap className="w-3 h-3 text-orange-500" />
            <span className="text-xs text-orange-600">+{stats.activeChats} active chats</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}