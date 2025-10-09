# Real-time Collaboration Integration Guide

This guide helps you integrate the real-time collaboration features with your existing GreenMate application.

## 🚀 Quick Start

### 1. Database Migration

First, apply the new database schema:

```bash
# Generate and run the migration
cd packages/database
npx prisma generate
npx prisma db push
```

### 2. Environment Variables

Add these to your environment files:

```bash
# API (.env)
JWT_SECRET=your-existing-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
REDIS_URL=redis://localhost:6379 # Optional for scaling

# Web (.env.local)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001 # Your API URL
```

### 3. Socket.IO Server Setup

The Socket.IO server is integrated with your existing API. It will start automatically when you run:

```bash
cd apps/api
npm run dev
```

### 4. Client Integration

Update your main app layout to include the Socket.IO provider:

```tsx
// apps/web/src/app/layout.tsx or your root component
import { SocketProvider } from '@/lib/socket-provider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  )
}
```

## 🔧 Integration Steps

### Step 1: Authentication Integration

Update your authentication flow to work with real-time features:

```tsx
// In your login component
import { useAuthState } from '@/lib/auth-utils'
import { useSocket } from '@/lib/socket-client'

function LoginComponent() {
  const { login, isAuthenticated } = useAuthState()
  const { isConnected } = useSocket()

  const handleLogin = async (email: string, password: string) => {
    await login(email, password)
    // Socket will auto-connect after login
  }

  return (
    <div>
      <p>Socket Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      {/* Your login form */}
    </div>
  )
}
```

### Step 2: Add Real-time Features to Existing Components

#### Plant Care with Real-time Collaboration

```tsx
// In your plant care component
import { CollaborativePlantCare } from '@/components/PlantCare/CollaborativePlantCare'
import { usePlantActivity } from '@/lib/socket-client'

function PlantCareComponent({ plantId }: { plantId: string }) {
  const { activities, shareActivity } = usePlantActivity()

  const handleCareAction = async (action: string, notes: string) => {
    // Your existing care logic
    await updatePlantCare(plantId, action, notes)
    
    // Share activity in real-time
    shareActivity({
      type: 'watering',
      plantId,
      plantName: plant.name,
      description: `Watered ${plant.name} - ${notes}`,
      imageUrl: photo?.url
    })
  }

  return (
    <div>
      {/* Your existing plant care UI */}
      <CollaborativePlantCare plantId={plantId} />
      
      {/* Show recent activities */}
      <div>
        <h3>Recent Activity</h3>
        {activities.map(activity => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  )
}
```

#### Community with Chat Integration

```tsx
// In your community component
import { ChatRoom } from '@/components/Chat/ChatRoom'
import { ActivityFeed } from '@/components/Social/ActivityFeed'

function CommunityComponent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Activity Feed */}
      <div className="lg:col-span-2">
        <ActivityFeed />
      </div>
      
      {/* Chat Sidebar */}
      <div className="lg:col-span-1">
        <ChatRoom roomId="general-community" />
      </div>
    </div>
  )
}
```

#### Navigation with User Presence

```tsx
// In your navigation component
import { UserPresence } from '@/components/Social/UserPresence'
import { useUserPresence } from '@/lib/socket-client'

function NavigationComponent() {
  const { onlineUsers, setStatus } = useUserPresence()

  return (
    <nav>
      {/* Your existing navigation */}
      
      {/* Online users indicator */}
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span className="text-sm text-gray-600">
          {onlineUsers.length} online
        </span>
      </div>
      
      {/* User presence component */}
      <UserPresence />
    </nav>
  )
}
```

### Step 3: Notifications Integration

```tsx
// In your app root or layout
import { NotificationSystem } from '@/components/Notifications/NotificationSystem'
import { useRealtimeNotifications } from '@/lib/socket-client'

function AppRoot() {
  const { notifications, unreadCount } = useRealtimeNotifications()

  return (
    <div>
      {/* Your app content */}
      
      {/* Notification system */}
      <NotificationSystem />
      
      {/* Notification badge in header */}
      <div className="notification-badge">
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </div>
    </div>
  )
}
```

## 🔌 API Integration

### Using Real-time APIs

The real-time features provide both Socket.IO events and REST API endpoints:

```tsx
// Create a chat room
const createChatRoom = async (plantId: string, name: string) => {
  const response = await makeAuthenticatedRequest('/api/chat/rooms', {
    method: 'POST',
    body: JSON.stringify({
      name,
      type: 'plant_community',
      plantId,
      description: `Chat room for ${name} enthusiasts`
    })
  })
  return response.json()
}

// Create a live session
const createLiveSession = async () => {
  const response = await makeAuthenticatedRequest('/api/social/sessions', {
    method: 'POST',
    body: JSON.stringify({
      title: 'Plant Care Q&A',
      description: 'Weekly plant care questions and answers',
      type: 'qa_session',
      startTime: new Date().toISOString(),
      maxParticipants: 20
    })
  })
  return response.json()
}

// Create social activity
const createActivity = async (plantId: string, action: string) => {
  const response = await makeAuthenticatedRequest('/api/social/activities', {
    method: 'POST',
    body: JSON.stringify({
      type: 'plant_care',
      title: `Plant Care Update`,
      description: `Just ${action} my plant`,
      plantId,
      metadata: { action }
    })
  })
  return response.json()
}
```

## 🎨 Styling Integration

The components use Tailwind CSS classes. Make sure your existing design system includes:

```css
/* Add these to your global CSS if not already present */
@layer components {
  .chat-message {
    @apply p-3 rounded-lg mb-2 max-w-xs;
  }
  
  .activity-card {
    @apply bg-white rounded-lg shadow p-4 mb-4;
  }
  
  .presence-indicator {
    @apply w-2 h-2 rounded-full;
  }
  
  .notification-badge {
    @apply bg-red-500 text-white text-xs rounded-full px-2 py-1;
  }
}
```

## 🧪 Testing Integration

### 1. Test Socket Connection

```tsx
// Create a test component
function SocketTest() {
  const { isConnected, currentUser } = useSocket()
  
  return (
    <div className="p-4 border rounded">
      <h3>Socket Status</h3>
      <p>Connected: {isConnected ? '✅' : '❌'}</p>
      <p>User: {currentUser?.username || 'Not authenticated'}</p>
    </div>
  )
}
```

### 2. Test Real-time Features

```tsx
// Test chat functionality
function ChatTest() {
  const { messages, sendMessage } = useChat('test-room')
  const [message, setMessage] = useState('')
  
  return (
    <div>
      <div className="h-64 overflow-y-auto">
        {messages.map(msg => (
          <div key={msg.id}>{msg.username}: {msg.content}</div>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            sendMessage(message)
            setMessage('')
          }
        }}
      />
    </div>
  )
}
```

## 🚨 Troubleshooting

### Common Issues

1. **Socket connection fails**
   - Check if JWT token is valid
   - Verify Socket.IO server is running
   - Check CORS settings

2. **Authentication errors**
   - Ensure JWT_SECRET matches between API and Socket server
   - Check token expiration
   - Verify database connection

3. **Database errors**
   - Run `npx prisma generate` after schema changes
   - Check database connection string
   - Verify all relations are properly defined

### Debug Tools

```tsx
// Add this component for debugging
function DebugPanel() {
  const { isConnected, currentUser } = useSocket()
  const { session } = useAuthState()
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded text-xs">
      <h4>Debug Info</h4>
      <p>Socket: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>User ID: {currentUser?.id}</p>
      <p>Token exists: {!!getAccessToken()}</p>
      <p>Session valid: {!!session}</p>
    </div>
  )
}
```

## 📚 Next Steps

After integration:

1. **Performance Optimization**
   - Implement message pagination
   - Add connection pooling
   - Set up Redis for scaling

2. **Security Enhancements**
   - Add rate limiting
   - Implement message moderation
   - Add abuse reporting

3. **Feature Extensions**
   - Add file sharing in chat
   - Implement voice/video calls
   - Add advanced presence features

4. **Monitoring**
   - Set up Socket.IO admin UI
   - Add performance metrics
   - Implement error tracking

## 🔗 API Endpoints

### Chat API
- `GET /api/chat/rooms` - List chat rooms
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/rooms/:id` - Get room details
- `POST /api/chat/rooms/:id/join` - Join room
- `POST /api/chat/rooms/:id/leave` - Leave room
- `GET /api/chat/rooms/:id/messages` - Get messages
- `POST /api/chat/rooms/:id/messages` - Send message
- `POST /api/messages/:id/react` - React to message

### Social API
- `GET /api/social/activities` - Get activity feed
- `POST /api/social/activities` - Create activity
- `POST /api/social/activities/:id/like` - Like activity
- `POST /api/social/activities/:id/comments` - Comment on activity
- `GET /api/social/sessions` - Get live sessions
- `POST /api/social/sessions` - Create session
- `POST /api/social/sessions/:id/join` - Join session
- `POST /api/social/sessions/:id/start` - Start session
- `GET /api/social/presence/:userId` - Get user presence
- `PUT /api/social/presence` - Update presence

This integration guide provides a comprehensive overview of adding real-time collaboration features to your existing GreenMate application. The features are designed to work seamlessly with your current architecture while adding powerful real-time capabilities.