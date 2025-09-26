# 🔌 Supabase Realtime (WebSocket) Complete Guide

## 📚 **What is Supabase Realtime?**

Supabase Realtime is Supabase's **WebSocket-based real-time feature** that allows you to:
- **Listen to database changes** in real-time
- **Subscribe to table updates** (INSERT, UPDATE, DELETE)
- **Create live chat applications**
- **Build collaborative features**
- **Monitor data changes** instantly

## 🏗️ **How to Use Supabase Realtime**

### **1. Basic Setup**

```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

// Create a channel to listen to changes
const channel = supabase
  .channel('table-changes')
  .on('postgres_changes', 
    { 
      event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
      schema: 'public', 
      table: 'profiles' 
    }, 
    (payload) => {
      console.log('Change received!', payload)
      // Handle the change
    }
  )
  .subscribe()
```

### **2. Different Event Types**

```typescript
// Listen to specific events
const channel = supabase
  .channel('profiles-updates')
  .on('postgres_changes', 
    { 
      event: 'INSERT', // Only new records
      schema: 'public', 
      table: 'profiles' 
    }, 
    (payload) => {
      console.log('New profile created:', payload.new)
    }
  )
  .on('postgres_changes', 
    { 
      event: 'UPDATE', // Only updates
      schema: 'public', 
      table: 'profiles' 
    }, 
    (payload) => {
      console.log('Profile updated:', payload.new)
    }
  )
  .on('postgres_changes', 
    { 
      event: 'DELETE', // Only deletions
      schema: 'public', 
      table: 'profiles' 
    }, 
    (payload) => {
      console.log('Profile deleted:', payload.old)
    }
  )
  .subscribe()
```

### **3. Real-time Chat Example**

```typescript
// Chat messages table
const channel = supabase
  .channel('chat-room-1')
  .on('postgres_changes', 
    { 
      event: 'INSERT',
      schema: 'public', 
      table: 'messages',
      filter: 'room_id=eq.1' // Only messages for room 1
    }, 
    (payload) => {
      // Add new message to chat UI
      addMessageToChat(payload.new)
    }
  )
  .subscribe()

// Send a message
const sendMessage = async (message: string) => {
  const { error } = await supabase
    .from('messages')
    .insert({
      room_id: 1,
      content: message,
      user_id: currentUser.id
    })
  
  if (error) console.error('Error sending message:', error)
}
```

### **4. Presence (Who's Online)**

```typescript
// Track who's online
const channel = supabase
  .channel('online-users')
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Online users:', state)
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', newPresences)
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', leftPresences)
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      // Track this user as online
      await channel.track({
        user_id: currentUser.id,
        online_at: new Date().toISOString(),
      })
    }
  })
```

## 🛠️ **Practical Examples for BeyondRounds**

### **1. Live Profile Updates**

```typescript
// Listen to profile changes
const profileChannel = supabase
  .channel('profile-updates')
  .on('postgres_changes', 
    { 
      event: 'UPDATE',
      schema: 'public', 
      table: 'profiles',
      filter: `user_id=eq.${currentUser.id}`
    }, 
    (payload) => {
      // Update profile in UI
      updateProfileInUI(payload.new)
    }
  )
  .subscribe()
```

### **2. Live Match Notifications**

```typescript
// Listen for new matches
const matchChannel = supabase
  .channel('match-notifications')
  .on('postgres_changes', 
    { 
      event: 'INSERT',
      schema: 'public', 
      table: 'matches',
      filter: `user_id=eq.${currentUser.id}`
    }, 
    (payload) => {
      // Show match notification
      showMatchNotification(payload.new)
    }
  )
  .subscribe()
```

### **3. Live Group Chat**

```typescript
// Group chat functionality
const groupChatChannel = supabase
  .channel(`group-${groupId}`)
  .on('postgres_changes', 
    { 
      event: 'INSERT',
      schema: 'public', 
      table: 'messages',
      filter: `group_id=eq.${groupId}`
    }, 
    (payload) => {
      // Add message to chat
      addMessageToGroupChat(payload.new)
    }
  )
  .subscribe()
```

## ⚙️ **Configuration Options**

### **1. Channel Options**

```typescript
const channel = supabase
  .channel('my-channel', {
    config: {
      broadcast: { self: true }, // Include own events
      presence: { key: 'user_id' }, // Presence key
    }
  })
```

### **2. Error Handling**

```typescript
const channel = supabase
  .channel('my-channel')
  .on('postgres_changes', { ... }, (payload) => {
    // Handle data
  })
  .subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      console.log('Successfully subscribed!')
    } else if (status === 'CHANNEL_ERROR') {
      console.error('Channel error occurred')
    } else if (status === 'TIMED_OUT') {
      console.error('Connection timed out')
    } else if (status === 'CLOSED') {
      console.log('Channel closed')
    }
  })
```

## 🧹 **Cleanup**

```typescript
// Always unsubscribe when done
useEffect(() => {
  const channel = supabase
    .channel('my-channel')
    .on('postgres_changes', { ... }, (payload) => {
      // Handle changes
    })
    .subscribe()

  // Cleanup on unmount
  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

## 🚨 **Common Issues & Solutions**

### **1. WebSocket Connection Failures**
- **Issue**: `WebSocket connection failed`
- **Solution**: This is normal in development, doesn't affect functionality
- **Workaround**: Use polling fallback or disable realtime for critical operations

### **2. RLS (Row Level Security) Issues**
- **Issue**: Can't receive realtime updates
- **Solution**: Ensure RLS policies allow the user to read the data

### **3. Too Many Subscriptions**
- **Issue**: Performance problems
- **Solution**: Limit subscriptions and clean up unused channels

## 📊 **Database Setup for Realtime**

```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;

-- Or enable for all tables (not recommended for production)
ALTER PUBLICATION supabase_realtime ADD TABLE public.*;
```

## 🎯 **Best Practices**

1. **Subscribe only to what you need**
2. **Clean up subscriptions** when components unmount
3. **Handle connection errors** gracefully
4. **Use filters** to limit data
5. **Test with RLS policies** enabled
6. **Monitor performance** with many subscriptions

## 🔗 **Key Terms**

- **Channel**: A WebSocket connection for listening to changes
- **Postgres Changes**: Database change events (INSERT, UPDATE, DELETE)
- **Presence**: Real-time user presence tracking
- **Broadcast**: Custom events between clients
- **Subscription**: The act of listening to a channel

**Supabase Realtime is perfect for building live features like chat, notifications, and collaborative editing!** 🚀

