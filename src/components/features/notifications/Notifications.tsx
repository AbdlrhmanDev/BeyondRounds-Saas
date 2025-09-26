'use client'

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  ArrowLeft, 
  Bell, 
  BellOff,
  Check,
  X,
  Calendar,
  MessageCircle,
  Heart,
  AlertTriangle,
  Settings,
  Trash2,
  Mail,
  Stethoscope,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  data: {
    type: string;
    [key: string]: unknown;
  };
  is_read: boolean;
  read_at?: string;
  created_at: string;
  deleted_at?: string;
}

interface NotificationsProps {
  user: Record<string, unknown> | null;
  onNavigate: (page: string) => void;
}

export function Notifications({ user, onNavigate }: NotificationsProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/notifications?userId=${user.id}`);
      const result = await response.json();

      if (result.success) {
        setNotifications(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to load notifications');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      setError('Failed to load notifications');
      // Fallback to mock data for development
      setNotifications(getMockNotifications());
    } finally {
      setIsLoading(false);
    }
  };

  const getMockNotifications = (): Notification[] => [
    {
      id: '1',
      title: 'New Group Match!',
      message: 'You\'ve been matched with "Adventure Seekers" - 3 doctors who love hiking and photography.',
      data: { type: 'match' },
      is_read: false,
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      title: 'Meetup Reminder',
      message: 'Don\'t forget about your hiking meetup tomorrow at 2 PM at Griffith Observatory.',
      data: { type: 'meetup' },
      is_read: false,
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      title: 'New Message',
      message: 'Dr. Marcus Rodriguez sent a message in "Adventure Seekers" group.',
      data: { type: 'message' },
      is_read: true,
      read_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '4',
      title: 'Profile Verification Complete',
      message: 'Your medical license has been verified. You can now access all premium features.',
      data: { type: 'system' },
      is_read: true,
      read_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '5',
      title: 'Weekly Matching Results',
      message: 'We found 3 potential group matches for you this week. Check them out!',
      data: { type: 'match' },
      is_read: true,
      read_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
    }
  ];

  const updateNotification = async (notificationId: string, isRead: boolean) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notificationId,
          isRead
        })
      });

      const result = await response.json();

      if (result.success) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, is_read: isRead, read_at: isRead ? new Date().toISOString() : undefined }
              : notification
          )
        );
      } else {
        throw new Error(result.error || 'Failed to update notification');
      }
    } catch (error) {
      console.error('Error updating notification:', error);
      toast.error('Failed to update notification');
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // In a real implementation, you'd call a DELETE endpoint
      // For now, we'll just remove it from the local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationAction = (notification: Notification, action: string) => {
    console.log(`Action ${action} for notification ${notification.id}`);
    
    if (action === 'View Group' || action === 'View Matches') {
      onNavigate('matching');
    } else if (action === 'Open Chat') {
      onNavigate('chat');
    } else if (action === 'View Details') {
      onNavigate('dashboard');
    }
  };

  const markAsRead = (notificationId: string) => {
    updateNotification(notificationId, true);
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(unreadNotifications.map(n => updateNotification(n.id, true)));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter(n => !n.is_read);
    return notifications.filter(n => n.data?.type === activeTab);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match': return Heart;
      case 'meetup': return Calendar;
      case 'message': return MessageCircle;
      case 'system': return Settings;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'match': return 'text-red-500';
      case 'meetup': return 'text-blue-500';
      case 'message': return 'text-green-500';
      case 'system': return 'text-blue-600';
      default: return 'text-gray-500';
    }
  };

  const getNotificationActions = (notification: Notification) => {
    switch (notification.data?.type) {
      case 'match':
        return ['View Group', 'Dismiss'];
      case 'meetup':
        return ['View Details', 'Mark as Read'];
      case 'message':
        return ['Open Chat'];
      default:
        return [];
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950 flex items-center justify-center">
        <Card className="border-blue-200 dark:border-blue-800">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600 dark:text-gray-300">Loading notifications...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-50 dark:from-blue-950 dark:to-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-blue-200 dark:border-blue-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => onNavigate('dashboard')}
                className="text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl text-blue-700 dark:text-blue-300">BeyondRounds</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Notifications</Badge>
              {unreadCount > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl mb-2 text-blue-800 dark:text-blue-200">Notifications</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Stay updated with your matches, meetups, and messages.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={loadNotifications}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
            <Button
              variant="outline"
              onClick={() => onNavigate('preferences')}
              className="hidden md:flex"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Tabs */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
                <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
                <TabsTrigger value="match">Matches</TabsTrigger>
                <TabsTrigger value="meetup">Meetups</TabsTrigger>
                <TabsTrigger value="message">Messages</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {getFilteredNotifications().length === 0 ? (
                <div className="text-center py-12">
                  <BellOff className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg text-gray-600 dark:text-gray-300 mb-2">No notifications</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {activeTab === 'unread' ? "You're all caught up!" : "No notifications in this category."}
                  </p>
                </div>
              ) : (
                getFilteredNotifications().map((notification) => {
                  const IconComponent = getNotificationIcon(notification.data?.type || 'general');
                  const colorClass = getNotificationColor(notification.data?.type || 'general');
                  const actions = getNotificationActions(notification);
                  
                  return (
                    <div
                      key={notification.id}
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors ${
                        !notification.is_read ? 'bg-blue-50 dark:bg-blue-950 border-l-4 border-l-blue-600' : ''
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 ${colorClass}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className={`text-blue-700 dark:text-blue-300 ${!notification.is_read ? '' : 'opacity-80'}`}>
                              {notification.title}
                            </h4>
                            <div className="flex items-center gap-2 ml-4">
                              <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                {formatTimeAgo(notification.created_at)}
                              </span>
                              {!notification.is_read && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <p className={`text-gray-600 dark:text-gray-300 text-sm mb-3 ${!notification.is_read ? '' : 'opacity-80'}`}>
                            {notification.message}
                          </p>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {actions.map((action, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant={index === 0 ? "default" : "outline"}
                                className={index === 0 ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                                onClick={() => handleNotificationAction(notification, action)}
                              >
                                {action}
                              </Button>
                            ))}
                            
                            <div className="flex items-center gap-1 ml-auto">
                              {!notification.is_read && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => markAsRead(notification.id)}
                                  className="text-gray-500 hover:text-blue-600"
                                >
                                  <Mail className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteNotification(notification.id)}
                                className="text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow cursor-pointer" 
                onClick={() => onNavigate('matching')}>
            <CardContent className="p-6 text-center">
              <Heart className="w-8 h-8 text-red-500 mx-auto mb-3" />
              <h3 className="text-blue-700 dark:text-blue-300 mb-2">Find New Matches</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Discover new groups that match your interests
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigate('chat')}>
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <h3 className="text-blue-700 dark:text-blue-300 mb-2">Check Messages</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                See what's happening in your group chats
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => onNavigate('preferences')}>
            <CardContent className="p-6 text-center">
              <Settings className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="text-blue-700 dark:text-blue-300 mb-2">Notification Settings</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Customize how you receive notifications
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}



