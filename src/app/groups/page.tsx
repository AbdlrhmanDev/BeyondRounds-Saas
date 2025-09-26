'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, MessageCircle } from 'lucide-react'

export default function GroupsPage() {
  const groups = [
    {
      id: 1,
      name: "Cardiology Coffee Club",
      members: 4,
      lastMessage: "Let's meet at Blue Bottle Coffee this Saturday!",
      lastMessageTime: "2 hours ago",
      unreadCount: 2,
      avatar: "CC",
      color: "bg-blue-100 text-blue-600"
    },
    {
      id: 2,
      name: "Weekend Hikers",
      members: 3,
      lastMessage: "Weather looks great for hiking this weekend",
      lastMessageTime: "5 hours ago",
      unreadCount: 0,
      avatar: "WH",
      color: "bg-green-100 text-green-600"
    },
    {
      id: 3,
      name: "Book Club Doctors",
      members: 5,
      lastMessage: "Finished 'The Immortal Life of Henrietta Lacks' - amazing read!",
      lastMessageTime: "1 day ago",
      unreadCount: 1,
      avatar: "BC",
      color: "bg-purple-100 text-purple-600"
    },
    {
      id: 4,
      name: "Emergency Medicine Night Shift",
      members: 6,
      lastMessage: "Anyone working tonight? Coffee run at 2 AM?",
      lastMessageTime: "2 days ago",
      unreadCount: 0,
      avatar: "EM",
      color: "bg-red-100 text-red-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Active Groups
              </h1>
              <p className="text-xl text-gray-600">
                Connect and chat with your medical colleagues
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>
          </div>
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {groups.map((group) => (
            <Card key={group.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 ${group.color}`}>
                      {group.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <div className="flex items-center text-sm text-gray-500">
                        <Users className="w-4 h-4 mr-1" />
                        {group.members} members
                      </div>
                    </div>
                  </div>
                  {group.unreadCount > 0 && (
                    <Badge className="bg-blue-600 text-white">
                      {group.unreadCount}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">{group.lastMessage}</p>
                <p className="text-sm text-gray-400">{group.lastMessageTime}</p>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Join Chat
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State for No Groups */}
        {groups.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Groups Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Join groups to connect with other medical professionals
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}