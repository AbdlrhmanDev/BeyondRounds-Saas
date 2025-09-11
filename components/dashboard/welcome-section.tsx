import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Activity, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { WelcomeSectionProps } from '@/lib/types'

export function WelcomeSection({ profile, stats }: WelcomeSectionProps) {
  return (
    <div className="mb-8 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-3xl blur-3xl" />
      <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
              Welcome back, {profile?.first_name}! 👋
            </h1>
            <p className="text-gray-600 text-lg">Your professional networking hub</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {format(new Date(), 'EEEE, MMMM do')}
              </div>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Activity className="w-4 h-4" />
                {stats.activeChats} active conversations
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{stats.completionRate}%</div>
              <div className="text-sm text-gray-500">Engagement Rate</div>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}