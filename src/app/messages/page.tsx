'use client'
 
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageSquare,
  ArrowLeft,
  Settings,
  Search,
  Users,
  Phone,
  Video,
  Plus,
  Filter,
  Stethoscope,
  Bell,
  BellOff,
  Volume2,
  VolumeX
} from 'lucide-react'
import ChatList from '@/components/features/chat/ChatList'
import ChatRoom from '@/components/features/chat/ChatRoom'
import { useAuthUser } from '@/hooks/features/auth/useAuthUser'
import ProtectedRoute from '@/components/shared/ProtectedRoute'
import { motion, AnimatePresence } from 'framer-motion'
 
export default function MessagesPage() {
  const { user } = useAuthUser()
  const [selectedChat, setSelectedChat] = useState<{
    chatRoomId: string
    matchId: string
  } | null>(null)
  const [isMobileView, setIsMobileView] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
 
  const handleChatSelect = (chatRoomId: string, matchId: string) => {
    setSelectedChat({ chatRoomId, matchId })
    // On mobile, switch to chat view
    if (window.innerWidth < 768) {
      setIsMobileView(true)
    }
  }
 
  const handleBackToList = () => {
    setSelectedChat(null)
    setIsMobileView(false)
  }
 
  const handleNewGroup = () => {
    // TODO: Implement new group creation
    console.log('Creating new group...')
  }
 
  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }
 
  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }
 
  if (!user) {
    return <ProtectedRoute><div /></ProtectedRoute>
  }
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950">
      {/* Mobile Header */}
      <div className="md:hidden bg-white dark:bg-gray-900 border-b border-blue-200 dark:border-blue-800 px-4 py-3">
        <div className="flex items-center justify-between">
          {selectedChat && isMobileView ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                Messages
              </h1>
            </div>
          )}
 
          <div className="flex items-center space-x-2">
            {selectedChat && isMobileView && (
              <>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  <Phone className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  <Video className="w-4 h-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
 
      <div className="max-w-7xl mx-auto p-4">
        {/* Desktop Header */}
        <div className="hidden md:block mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                    Messages
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300">
                    Connect with your medical professional matches
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                Real-time Chat
              </Badge>
            </div>
 
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={notificationsEnabled ? "text-blue-600" : "text-gray-400"}
                >
                  {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={soundEnabled ? "text-blue-600" : "text-gray-400"}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
              <Button variant="outline" size="sm" className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New Group
              </Button>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
 
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-blue-200 dark:border-blue-800"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-blue-200 dark:border-blue-800"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
 
          {/* Filter Options */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <Card className="border-blue-200 dark:border-blue-800">
                  <CardContent className="p-4">
                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="unread">Unread</TabsTrigger>
                        <TabsTrigger value="starred">Starred</TabsTrigger>
                        <TabsTrigger value="archived">Archived</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
 
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-300px)] md:h-[calc(100vh-200px)]">
          {/* Chat List */}
          <div className={`
            lg:col-span-4 xl:col-span-3
            ${isMobileView && selectedChat ? 'hidden' : 'block'}
            ${!isMobileView ? 'md:block' : ''}
          `}>
            <ChatList
              onChatSelect={handleChatSelect}
              selectedChatId={selectedChat?.chatRoomId}
              searchQuery={searchQuery}
            />
          </div>
 
          {/* Chat Room */}
          <div className={`
            lg:col-span-8 xl:col-span-9
            ${!selectedChat ? 'hidden lg:block' : 'block'}
          `}>
            {selectedChat ? (
              <ChatRoom
                chatRoomId={selectedChat.chatRoomId}
                matchId={selectedChat.matchId}
                onClose={handleBackToList}
                notificationsEnabled={notificationsEnabled}
                soundEnabled={soundEnabled}
              />
            ) : (
              <Card className="h-full flex items-center justify-center border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
                <CardContent className="text-center py-12">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-blue-800 dark:text-blue-200 mb-3">
                      Welcome to BeyondRounds Messages
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                      Connect with your medical professional matches through secure, real-time messaging. 
                      Build meaningful professional relationships and expand your network.
                    </p>
 
                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          Live updates
                        </div>
                        <div className="flex items-center">
                          <Badge variant="secondary" className="mr-2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            0
                          </Badge>
                          Unread messages
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                          Group chats
                        </div>
                      </div>
 
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          variant="outline" 
                          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                          onClick={() => window.location.href = '/matching'}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Find New Groups
                        </Button>
                        <Button 
                          variant="outline"
                          className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400"
                          onClick={handleNewGroup}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create Group
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
 
        {/* Features Section */}
        <div className="mt-8 hidden lg:block">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                  <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    💬 Advanced Messaging Features
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                    Connect instantly with your medical professional matches. Messages are delivered in real-time using Supabase subscriptions with advanced features.
                  </p>
                  <div className="flex items-center space-x-6 text-xs text-blue-600 dark:text-blue-400">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                      Real-time delivery
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                      Group messaging
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                      Professional networking
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                      Secure & private
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}