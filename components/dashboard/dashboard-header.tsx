import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, Bell, User, ChevronDown, Settings } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DashboardHeaderProps } from '@/lib/types'

export function DashboardHeader({ 
  profile, 
  searchTerm, 
  onSearchChange, 
  notifications, 
  onSignOut 
}: DashboardHeaderProps) {
  const router = useRouter()

  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg shadow-blue-500/5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-r from-violet-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              BeyondRounds
            </span>
          </Link>
          
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search groups, doctors..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 w-64 bg-white/50 backdrop-blur-sm border-white/30 focus:bg-white/80 focus:border-violet-300 transition-all duration-200"
              />
            </div>
            
            {/* Notifications */}
            <div className="relative">
              <Button variant="ghost" size="sm" className="relative hover:bg-white/50 transition-all duration-200">
                <Bell className="w-4 h-4" />
                {notifications.some(n => n.unread) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse shadow-lg shadow-red-500/25" />
                )}
              </Button>
            </div>
            
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-md bg-white border hover:bg-gray-50">
                  <User className="w-4 h-4" />
                  {profile ? `${profile.first_name}` : 'User'}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-64 bg-white border shadow-lg rounded-md p-1"
                sideOffset={5}
              >
                <DropdownMenuItem 
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => router.push('/profile')}
                >
                  <User className="w-4 h-4" />
                  Profile Info
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="my-1" />
                
                <DropdownMenuItem 
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => router.push('/settings')}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 rounded cursor-pointer"
                  onClick={onSignOut}
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}