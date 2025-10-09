// User Presence and Status System Component
'use client'

import React, { useState, useEffect } from 'react'
import { useUserPresence, useSocket } from '@/lib/socket-client'
import { SocketUser } from '@/lib/socket-server'
import {
  Circle,
  Clock,
  Users,
  Search,
  MoreVertical,
  MessageCircle,
  Video,
  Phone,
  UserPlus,
  Settings,
  Activity,
  MapPin,
  Calendar,
  Wifi,
  WifiOff
} from 'lucide-react'

interface UserPresenceProps {
  currentUser: {
    id: string
    username: string
    avatar?: string
  }
}

interface UserWithActivity extends SocketUser {
  activity?: {
    type: 'browsing' | 'caring_for_plant' | 'chatting' | 'idle'
    description?: string
    startTime: Date
    location?: string
  }
}

const STATUS_COLORS = {
  online: 'bg-green-500',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
  offline: 'bg-gray-400'
}

const STATUS_LABELS = {
  online: 'Online',
  away: 'Away',
  busy: 'Busy',
  offline: 'Offline'
}

export default function UserPresence({ currentUser }: UserPresenceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<SocketUser['status']>('online')
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const { onlineUsers, setStatus, isUserOnline, getUserStatus } = useUserPresence()
  const { isConnected } = useSocket()

  // Mock enhanced user data with activity
  const [usersWithActivity, setUsersWithActivity] = useState<UserWithActivity[]>([])

  useEffect(() => {
    // Enhance online users with mock activity data
    const enhancedUsers: UserWithActivity[] = onlineUsers.map(user => ({
      ...user,
      activity: {
        type: ['browsing', 'caring_for_plant', 'chatting', 'idle'][Math.floor(Math.random() * 4)] as any,
        description: getActivityDescription(user.id),
        startTime: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
        location: ['Living Room', 'Garden', 'Balcony', 'Kitchen'][Math.floor(Math.random() * 4)]
      }
    }))

    setUsersWithActivity(enhancedUsers)
  }, [onlineUsers])

  const getActivityDescription = (userId: string) => {
    const activities = [
      'Watering plants',
      'Reading plant care guides',
      'In plant community chat',
      'Taking plant photos',
      'Updating plant journal',
      'Browsing plant marketplace',
      'Watching plant care videos',
      'Scheduling plant care'
    ]
    return activities[Math.abs(userId.hashCode()) % activities.length]
  }

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - lastSeen.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return lastSeen.toLocaleDateString()
  }

  const formatActivityDuration = (startTime: Date) => {
    const diffMs = new Date().getTime() - startTime.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) return 'just started'
    if (diffMinutes < 60) return `${diffMinutes}m`
    const diffHours = Math.floor(diffMinutes / 60)
    return `${diffHours}h ${diffMinutes % 60}m`
  }

  const handleStatusChange = (newStatus: SocketUser['status']) => {
    setStatus(newStatus)
    setSelectedStatus(newStatus)
    setShowStatusMenu(false)
  }

  const filteredUsers = usersWithActivity.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedUsers = {
    online: filteredUsers.filter(u => u.status === 'online'),
    away: filteredUsers.filter(u => u.status === 'away'),
    busy: filteredUsers.filter(u => u.status === 'busy'),
    offline: filteredUsers.filter(u => u.status === 'offline')
  }

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Community</h2>
            <div className="flex items-center space-x-1">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm text-gray-500">
                {onlineUsers.length} online
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <Activity className="w-4 h-4" />
            </button>
            
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current User Status */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-4">
          <div className="relative">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.username}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {currentUser.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${STATUS_COLORS[selectedStatus]}`} />
          </div>
          
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{currentUser.username}</p>
            <div className="relative">
              <button
                onClick={() => setShowStatusMenu(!showStatusMenu)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
              >
                <Circle className={`w-2 h-2 ${STATUS_COLORS[selectedStatus]}`} />
                <span>{STATUS_LABELS[selectedStatus]}</span>
                <MoreVertical className="w-3 h-3" />
              </button>
              
              {showStatusMenu && (
                <div className="absolute top-6 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10 min-w-32">
                  {Object.entries(STATUS_LABELS).map(([status, label]) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status as SocketUser['status'])}
                      className="flex items-center space-x-2 w-full p-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                    >
                      <Circle className={`w-3 h-3 ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search community members..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="max-h-96 overflow-y-auto">
        {Object.entries(groupedUsers).map(([status, users]) => {
          if (users.length === 0) return null

          return (
            <div key={status} className="p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center space-x-2">
                <Circle className={`w-3 h-3 ${STATUS_COLORS[status as keyof typeof STATUS_COLORS]}`} />
                <span className="capitalize">{status} ({users.length})</span>
              </h3>

              <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2'}>
                {users.map(user => (
                  <UserCard 
                    key={user.id} 
                    user={user} 
                    currentUser={currentUser}
                    viewMode={viewMode}
                    formatLastSeen={formatLastSeen}
                    formatActivityDuration={formatActivityDuration}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No community members found</p>
          </div>
        )}
      </div>
    </div>
  )
}

// User Card Component
function UserCard({ 
  user, 
  currentUser, 
  viewMode, 
  formatLastSeen, 
  formatActivityDuration 
}: {
  user: UserWithActivity
  currentUser: { id: string; username: string; avatar?: string }
  viewMode: 'list' | 'grid'
  formatLastSeen: (date: Date) => string
  formatActivityDuration: (date: Date) => string
}) {
  const [showActions, setShowActions] = useState(false)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'caring_for_plant': return '🌱'
      case 'chatting': return '💬'
      case 'browsing': return '👀'
      case 'idle': return '💤'
      default: return '📱'
    }
  }

  if (viewMode === 'grid') {
    return (
      <div className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
        <div className="flex flex-col items-center space-y-2">
          <div className="relative">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.username}
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${STATUS_COLORS[user.status]}`} />
          </div>
          
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900 truncate w-full">
              {user.username}
            </p>
            <p className="text-xs text-gray-500">
              {user.status === 'offline' 
                ? formatLastSeen(user.lastSeen)
                : user.activity?.description
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative flex-shrink-0">
        {user.avatar ? (
          <img 
            src={user.avatar} 
            alt={user.username}
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-600">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${STATUS_COLORS[user.status]}`} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-gray-900 truncate">
            {user.username}
          </p>
          {user.activity && user.status !== 'offline' && (
            <span className="text-sm">
              {getActivityIcon(user.activity.type)}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {user.status === 'offline' ? (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Last seen {formatLastSeen(user.lastSeen)}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              {user.activity?.description && (
                <span>{user.activity.description}</span>
              )}
              {user.activity?.startTime && (
                <span>• {formatActivityDuration(user.activity.startTime)}</span>
              )}
              {user.activity?.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{user.activity.location}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      {showActions && user.id !== currentUser.id && (
        <div className="flex items-center space-x-1">
          <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            <MessageCircle className="w-4 h-4" />
          </button>
          
          {user.status === 'online' && (
            <>
              <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <Video className="w-4 h-4" />
              </button>
              
              <button className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                <UserPlus className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Presence Status Indicator Component (for use in other components)
export function PresenceIndicator({ 
  userId, 
  size = 'sm' 
}: { 
  userId: string
  size?: 'xs' | 'sm' | 'md' | 'lg' 
}) {
  const { getUserStatus, isUserOnline } = useUserPresence()
  const status = getUserStatus(userId)
  
  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }

  return (
    <div className={`${sizeClasses[size]} ${STATUS_COLORS[status]} rounded-full border border-white`} />
  )
}

// Presence Text Component
export function PresenceText({ userId }: { userId: string }) {
  const { getUserStatus, onlineUsers } = useUserPresence()
  const user = onlineUsers.find(u => u.id === userId)
  
  if (!user) return null

  const formatLastSeen = (lastSeen: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - lastSeen.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    if (diffMinutes < 1) return 'Active now'
    if (diffMinutes < 60) return `Active ${diffMinutes}m ago`
    const diffHours = Math.floor(diffMinutes / 60)
    if (diffHours < 24) return `Active ${diffHours}h ago`
    return `Last seen ${lastSeen.toLocaleDateString()}`
  }

  return (
    <span className="text-xs text-gray-500">
      {user.status === 'offline' 
        ? formatLastSeen(user.lastSeen)
        : STATUS_LABELS[user.status]
      }
    </span>
  )
}

// Utility extension for string hashing (for consistent mock data)
declare global {
  interface String {
    hashCode(): number
  }
}

String.prototype.hashCode = function() {
  let hash = 0
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash
}