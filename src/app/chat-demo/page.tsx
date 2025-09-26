// 'use client'
 
// import { useState } from 'react'
// import ModernChatComponent from '@/components/features/chat/ModernChatComponent'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Badge } from '@/components/ui/badge'
// import { 
//   MessageCircle, 
//   Users, 
//   Zap, 
//   Sparkles, 
//   ArrowLeft,
//   CheckCircle,
//   Heart,
//   ThumbsUp,
//   Reply,
//   Phone,
//   Video,
//   Settings,
//   Star
// } from 'lucide-react'
// import { toast } from 'sonner'
 
// export default function ChatDemo() {
//   const [showChat, setShowChat] = useState(false)
//   const [selectedGroup, setSelectedGroup] = useState('1')
 
//   const mockGroups = [
//     {
//       id: '1',
//       name: 'Adventure Seekers',
//       description: 'Medical professionals who love outdoor adventures',
//       members: [
//         { id: '1', name: 'Dr. Sarah Chen', specialty: 'Emergency Medicine', city: 'Los Angeles', compatibility: 95, isOnline: true },
//         { id: '2', name: 'Dr. Marcus Rodriguez', specialty: 'Cardiology', city: 'San Francisco', compatibility: 88, isOnline: true },
//         { id: '3', name: 'Dr. Emily Watson', specialty: 'Pediatrics', city: 'Seattle', compatibility: 92, isOnline: false },
//         { id: '4', name: 'Dr. James Kim', specialty: 'Neurology', city: 'Portland', compatibility: 85, isOnline: true }
//       ]
//     },
//     {
//       id: '2', 
//       name: 'Foodies Unite',
//       description: 'Culinary enthusiasts in healthcare',
//       members: [
//         { id: '1', name: 'Dr. Sarah Chen', specialty: 'Emergency Medicine', city: 'Los Angeles', compatibility: 95, isOnline: true },
//         { id: '5', name: 'Dr. Lisa Martinez', specialty: 'Internal Medicine', city: 'Miami', compatibility: 90, isOnline: true },
//         { id: '6', name: 'Dr. Ahmad Hassan', specialty: 'Psychiatry', city: 'Chicago', compatibility: 87, isOnline: false }
//       ]
//     },
//     {
//       id: '3',
//       name: 'Tennis Enthusiasts', 
//       description: 'Active medical professionals who love tennis',
//       members: [
//         { id: '1', name: 'Dr. Sarah Chen', specialty: 'Emergency Medicine', city: 'Los Angeles', compatibility: 95, isOnline: true },
//         { id: '7', name: 'Dr. Kevin Park', specialty: 'Orthopedics', city: 'Denver', compatibility: 93, isOnline: true },
//         { id: '8', name: 'Dr. Nina Patel', specialty: 'Dermatology', city: 'Austin', compatibility: 89, isOnline: true }
//       ]
//     }
//   ]
 
//   const handleNavigate = (page: string) => {
//     setShowChat(false)
//     toast.info(`Navigating to ${page}`)
//   }
 
//   if (showChat) {
//     return (
//       <ModernChatComponent
//         chatRoomId={selectedGroup}
//         userId="1"
//         onNavigate={handleNavigate}
//       />
//     )
//   }
 
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
//             <MessageCircle className="w-10 h-10 text-white" />
//           </div>
//           <h1 className="text-5xl font-bold text-gray-900 mb-4">
//             Modern Chat Interface
//           </h1>
//           <p className="text-xl text-gray-600 mb-8">
//             Experience our beautifully designed, real-time group chat system
//           </p>
//         </div>
 
//         {/* Features Grid */}
//         <div className="grid md:grid-cols-3 gap-6 mb-12">
//           <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
//             <CardContent className="p-6 text-center">
//               <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <MessageCircle className="w-6 h-6 text-blue-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Messaging</h3>
//               <p className="text-gray-600 text-sm">
//                 Instant message delivery with typing indicators and read receipts
//               </p>
//             </CardContent>
//           </Card>
 
//           <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
//             <CardContent className="p-6 text-center">
//               <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Users className="w-6 h-6 text-purple-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">Group Management</h3>
//               <p className="text-gray-600 text-sm">
//                 Smart group organization with member profiles and compatibility scores
//               </p>
//             </CardContent>
//           </Card>
 
//           <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
//             <CardContent className="p-6 text-center">
//               <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <Zap className="w-6 h-6 text-green-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">Modern Design</h3>
//               <p className="text-gray-600 text-sm">
//                 Beautiful UI with smooth animations and responsive design
//               </p>
//             </CardContent>
//           </Card>
//         </div>
 
//         {/* Groups Selection */}
//         <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-8">
//           <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
//             <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
//               <Sparkles className="w-6 h-6" />
//               Choose a Group to Chat
//             </CardTitle>
//           </CardHeader>
          
//           <CardContent className="p-8">
//             <div className="grid md:grid-cols-3 gap-6">
//               {mockGroups.map((group) => (
//                 <Card 
//                   key={group.id}
//                   className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
//                     selectedGroup === group.id 
//                       ? 'ring-2 ring-blue-500 bg-blue-50' 
//                       : 'hover:bg-gray-50'
//                   }`}
//                   onClick={() => setSelectedGroup(group.id)}
//                 >
//                   <CardContent className="p-6">
//                     <div className="text-center">
//                       <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
//                         <Users className="w-8 h-8 text-white" />
//                       </div>
//                       <h3 className="text-lg font-semibold text-gray-900 mb-2">{group.name}</h3>
//                       <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                      
//                       <div className="space-y-2">
//                         <div className="flex items-center justify-center gap-2">
//                           <Users className="w-4 h-4 text-gray-500" />
//                           {group.members.length} members
//                         </div>
                        
//                         <div className="flex items-center justify-center gap-2">
//                           <div className="flex -space-x-1">
//                             {group.members.slice(0, 3).map((member) => (
//                               <div 
//                                 key={member.id}
//                                 className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white"
//                               >
                                
//                                   {member.name.split(' ').map(n => n[0]).join('')}
                                
//                               </div>
//                             ))}
//                             {group.members.length > 3 && (
//                               <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center border-2 border-white">
                                
//                                   +{group.members.length - 3}
                                
//                               </div>
//                             )}
//                           </div>
//                         </div>
                        
//                         <div className="flex items-center justify-center gap-1">
//                           {group.members.filter(m => m.isOnline).length > 0 && (
//                             <>
//                               <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              
//                                 {group.members.filter(m => m.isOnline).length} online
                              
//                             </>
//                           )}
//                         </div>
//                       </div>
                      
//                       {selectedGroup === group.id && (
//                         <div className="mt-4">
//                           <Badge className="bg-blue-600 text-white">
//                             Selected
//                           </Badge>
//                         </div>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </CardContent>
//         </Card>
 
//         {/* Demo Actions */}
//         <div className="text-center space-y-4">
//           <Button 
//             onClick={() => setShowChat(true)}
//             size="lg"
//             className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg"
//           >
//             <MessageCircle className="w-5 h-5 mr-2" />
//             Start Chatting
//           </Button>
          
//           <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
//             <div className="flex items-center gap-1">
//               <CheckCircle className="w-4 h-4 text-green-500" />
//               Real-time messaging
//             </div>
//             <div className="flex items-center gap-1">
//               <Heart className="w-4 h-4 text-red-500" />
//               Reactions & replies
//             </div>
//             <div className="flex items-center gap-1">
//               <Phone className="w-4 h-4 text-blue-500" />
//               Voice & video calls
//             </div>
//           </div>
//         </div>
 
//         {/* Features Showcase */}
//         <div className="mt-16">
//           <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
//             Chat Features
//           </h2>
          
//           <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
//             <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
//               <CardContent className="p-6 text-center">
//                 <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <MessageCircle className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <h4 className="font-semibold text-gray-900 mb-2">Instant Messages</h4>
//                 <p className="text-sm text-gray-600">Send and receive messages instantly with real-time updates</p>
//               </CardContent>
//             </Card>
 
//             <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
//               <CardContent className="p-6 text-center">
//                 <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <ThumbsUp className="w-6 h-6 text-purple-600" />
//                 </div>
//                 <h4 className="font-semibold text-gray-900 mb-2">Reactions</h4>
//                 <p className="text-sm text-gray-600">React to messages with emojis and show your appreciation</p>
//               </CardContent>
//             </Card>
 
//             <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
//               <CardContent className="p-6 text-center">
//                 <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <Reply className="w-6 h-6 text-green-600" />
//                 </div>
//                 <h4 className="font-semibold text-gray-900 mb-2">Message Replies</h4>
//                 <p className="text-sm text-gray-600">Reply to specific messages to keep conversations organized</p>
//               </CardContent>
//             </Card>
 
//             <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
//               <CardContent className="p-6 text-center">
//                 <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <Settings className="w-6 h-6 text-yellow-600" />
//                 </div>
//                 <h4 className="font-semibold text-gray-900 mb-2">Group Settings</h4>
//                 <p className="text-sm text-gray-600">Manage group members, notifications, and preferences</p>
//               </CardContent>
//             </Card>
//           </div>
//         </div>
 
//         {/* Footer */}
//         <div className="text-center mt-16">
//           <p className="text-sm text-gray-500">
//             Built with Next.js, Tailwind CSS, and Supabase Realtime
//           </p>
//         </div>
//       </div>
//     </div>
//   )
// }