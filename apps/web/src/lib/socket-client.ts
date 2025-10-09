// Socket.IO Client Implementation for Real-time Features
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { SocketUser, ChatMessage, PlantShareActivity, LiveSession } from './socket-server'

// JWT token helper functions
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
}

const setAccessToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('accessToken', token)
}

const removeAccessToken = (): void => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('accessToken')
  sessionStorage.removeItem('accessToken')
}

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connectedUsers: SocketUser[]
  currentUser: SocketUser | null
}

// Socket connection management
class SocketClient {
  private socket: Socket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect(user?: Partial<SocketUser>): Socket | null {
    if (this.socket?.connected) {
      return this.socket
    }

    const socketUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_SOCKET_URL || ''
      : 'http://localhost:3000'

    // Get JWT token for authentication
    const token = getAccessToken()
    
    if (!token) {
      console.error('No access token found. User must be logged in to connect to socket.')
      return null
    }

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
      autoConnect: true,
      auth: {
        token // Send JWT token for authentication
      }
    })

    // Handle successful connection (user is auto-registered via JWT)
    this.socket.on('connect', () => {
      console.log('Socket connected with JWT auth:', this.socket?.id)
      this.reconnectAttempts = 0
    })

    // Handle authentication errors
    this.socket.on('connect_error', (error) => {
      console.error('Socket authentication error:', error.message)
      
      // If token is invalid/expired, remove it
      if (error.message.includes('token') || error.message.includes('auth')) {
        removeAccessToken()
        // Optionally redirect to login or emit an event for the app to handle
        window.dispatchEvent(new CustomEvent('socket-auth-error', { detail: error.message }))
      }
    })

    // Handle connection errors
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
      this.handleReconnect()
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason)
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect manually
        this.handleReconnect()
      }
    })

    return this.socket
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
      
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.socket?.connect()
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  getSocket(): Socket | null {
    return this.socket
  }
}

// Singleton instance
const socketClient = new SocketClient()

// Main Socket Hook - now works with JWT authentication
export function useSocket(user?: Partial<SocketUser>) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectedUsers, setConnectedUsers] = useState<SocketUser[]>([])
  const [currentUser, setCurrentUser] = useState<SocketUser | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    // Connect with JWT - no user parameter needed as auth comes from token
    const token = getAccessToken()
    
    if (!token) {
      setAuthError('No authentication token found')
      return
    }

    const socketInstance = socketClient.connect()
    
    if (!socketInstance) {
      setAuthError('Failed to create socket connection')
      return
    }
    
    setSocket(socketInstance)
    setAuthError(null)

    const handleConnect = () => {
      setIsConnected(true)
      setAuthError(null)
    }
    
    const handleDisconnect = () => setIsConnected(false)
    
    const handleUserRegistered = (data: { success: boolean; user: SocketUser }) => {
      if (data.success) {
        setCurrentUser(data.user)
      }
    }

    const handleUserStatus = (data: { userId: string; status: string; lastSeen: Date }) => {
      setConnectedUsers(prev => 
        prev.map(u => u.id === data.userId ? { ...u, status: data.status as any, lastSeen: data.lastSeen } : u)
      )
    }

    const handleAuthError = (event: CustomEvent) => {
      setAuthError(event.detail)
      setIsConnected(false)
      setCurrentUser(null)
    }

    socketInstance.on('connect', handleConnect)
    socketInstance.on('disconnect', handleDisconnect)
    socketInstance.on('user:registered', handleUserRegistered)
    socketInstance.on('user:status', handleUserStatus)
    
    // Listen for authentication errors
    window.addEventListener('socket-auth-error', handleAuthError as EventListener)

    return () => {
      socketInstance.off('connect', handleConnect)
      socketInstance.off('disconnect', handleDisconnect)
      socketInstance.off('user:registered', handleUserRegistered)
      socketInstance.off('user:status', handleUserStatus)
      window.removeEventListener('socket-auth-error', handleAuthError as EventListener)
    }
  }, []) // Remove dependency on user.id since we use JWT

  const updateStatus = useCallback((status: SocketUser['status']) => {
    if (socket && currentUser) {
      socket.emit('user:status', { userId: currentUser.id, status })
      setCurrentUser(prev => prev ? { ...prev, status } : null)
    }
  }, [socket, currentUser])

  return {
    socket,
    isConnected,
    connectedUsers,
    currentUser,
    updateStatus
  }
}

// Chat Hook
export function useChat(roomId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [participants, setParticipants] = useState<SocketUser[]>([])
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  
  const { socket, currentUser } = useSocket()
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!socket || !currentUser || !roomId) return

    // Join room
    socket.emit('room:join', { roomId, userId: currentUser.id })

    // Message handlers
    const handleMessage = (message: ChatMessage) => {
      setMessages(prev => [...prev, message])
    }

    const handleTyping = (data: { userId: string; username: string; isTyping: boolean }) => {
      if (data.userId !== currentUser.id) {
        setTypingUsers(prev => {
          if (data.isTyping) {
            return [...prev.filter(id => id !== data.userId), data.userId]
          } else {
            return prev.filter(id => id !== data.userId)
          }
        })
      }
    }

    const handleParticipants = (data: { roomId: string; participants: SocketUser[] }) => {
      if (data.roomId === roomId) {
        setParticipants(data.participants)
      }
    }

    const handleUserJoined = (data: { userId: string; username: string; timestamp: Date }) => {
      // Add system message for user joining
      const systemMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        content: `${data.username} joined the chat`,
        userId: 'system',
        username: 'System',
        timestamp: data.timestamp,
        roomId,
        type: 'system'
      }
      setMessages(prev => [...prev, systemMessage])
    }

    const handleUserLeft = (data: { userId: string; username: string; timestamp: Date }) => {
      // Add system message for user leaving
      const systemMessage: ChatMessage = {
        id: `system_${Date.now()}`,
        content: `${data.username} left the chat`,
        userId: 'system',
        username: 'System',
        timestamp: data.timestamp,
        roomId,
        type: 'system'
      }
      setMessages(prev => [...prev, systemMessage])
    }

    const handleReaction = (data: { messageId: string; emoji: string; userId: string }) => {
      setMessages(prev => prev.map(msg => {
        if (msg.id === data.messageId) {
          const reactions = msg.reactions || []
          const existingReaction = reactions.find(r => r.emoji === data.emoji)
          
          if (existingReaction) {
            if (existingReaction.users.includes(data.userId)) {
              // Remove reaction
              existingReaction.users = existingReaction.users.filter(id => id !== data.userId)
              if (existingReaction.users.length === 0) {
                return { ...msg, reactions: reactions.filter(r => r.emoji !== data.emoji) }
              }
            } else {
              // Add reaction
              existingReaction.users.push(data.userId)
            }
          } else {
            // New reaction
            reactions.push({ emoji: data.emoji, users: [data.userId] })
          }
          
          return { ...msg, reactions: [...reactions] }
        }
        return msg
      }))
    }

    socket.on('chat:message', handleMessage)
    socket.on('chat:typing', handleTyping)
    socket.on('room:participants', handleParticipants)
    socket.on('room:user_joined', handleUserJoined)
    socket.on('room:user_left', handleUserLeft)
    socket.on('chat:reaction', handleReaction)

    return () => {
      socket.emit('room:leave', { roomId, userId: currentUser.id })
      socket.off('chat:message', handleMessage)
      socket.off('chat:typing', handleTyping)
      socket.off('room:participants', handleParticipants)
      socket.off('room:user_joined', handleUserJoined)
      socket.off('room:user_left', handleUserLeft)
      socket.off('chat:reaction', handleReaction)
    }
  }, [socket, currentUser, roomId])

  const sendMessage = useCallback((content: string, type: ChatMessage['type'] = 'text', metadata?: any) => {
    if (!socket || !currentUser || !content.trim()) return

    const message: Omit<ChatMessage, 'id' | 'timestamp'> = {
      content: content.trim(),
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      roomId,
      type,
      metadata,
      reactions: []
    }

    socket.emit('chat:message', message)
  }, [socket, currentUser, roomId])

  const startTyping = useCallback(() => {
    if (!socket || !currentUser || isTyping) return

    setIsTyping(true)
    socket.emit('chat:typing', {
      roomId,
      userId: currentUser.id,
      username: currentUser.username,
      isTyping: true
    })

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 3 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }, [socket, currentUser, roomId, isTyping])

  const stopTyping = useCallback(() => {
    if (!socket || !currentUser || !isTyping) return

    setIsTyping(false)
    socket.emit('chat:typing', {
      roomId,
      userId: currentUser.id,
      username: currentUser.username,
      isTyping: false
    })

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }, [socket, currentUser, roomId, isTyping])

  const addReaction = useCallback((messageId: string, emoji: string) => {
    if (!socket || !currentUser) return

    socket.emit('chat:reaction', {
      messageId,
      emoji,
      userId: currentUser.id,
      roomId
    })
  }, [socket, currentUser, roomId])

  return {
    messages,
    participants,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    addReaction,
    isTyping
  }
}

// Plant Activity Hook
export function usePlantActivity() {
  const [activities, setActivities] = useState<PlantShareActivity[]>([])
  const { socket, currentUser } = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleActivity = (activity: PlantShareActivity) => {
      setActivities(prev => [activity, ...prev])
    }

    socket.on('plant:activity', handleActivity)

    return () => {
      socket.off('plant:activity', handleActivity)
    }
  }, [socket])

  const shareActivity = useCallback((activity: Omit<PlantShareActivity, 'id' | 'timestamp' | 'userId' | 'username'>) => {
    if (!socket || !currentUser) return

    const fullActivity: PlantShareActivity = {
      ...activity,
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: currentUser.id,
      username: currentUser.username,
      timestamp: new Date()
    }

    socket.emit('plant:activity', fullActivity)
  }, [socket, currentUser])

  return {
    activities,
    shareActivity
  }
}

// Live Sessions Hook
export function useLiveSessions() {
  const [sessions, setSessions] = useState<LiveSession[]>([])
  const [currentSession, setCurrentSession] = useState<LiveSession | null>(null)
  const [sessionParticipants, setSessionParticipants] = useState<string[]>([])
  
  const { socket, currentUser } = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleSessionCreated = (session: LiveSession) => {
      setSessions(prev => [session, ...prev])
    }

    const handleSessionUserJoined = (data: { userId: string; username: string; timestamp: Date }) => {
      if (currentSession) {
        setSessionParticipants(prev => [...prev, data.userId])
      }
    }

    socket.on('session:created', handleSessionCreated)
    socket.on('session:user_joined', handleSessionUserJoined)

    return () => {
      socket.off('session:created', handleSessionCreated)
      socket.off('session:user_joined', handleSessionUserJoined)
    }
  }, [socket, currentSession])

  const createSession = useCallback((sessionData: Omit<LiveSession, 'id' | 'participants' | 'startTime' | 'isActive' | 'hostId' | 'hostName'>) => {
    if (!socket || !currentUser) return

    const session = {
      ...sessionData,
      hostId: currentUser.id,
      hostName: currentUser.username
    }

    socket.emit('session:create', session)
  }, [socket, currentUser])

  const joinSession = useCallback((sessionId: string) => {
    if (!socket || !currentUser) return

    socket.emit('session:join', { sessionId, userId: currentUser.id })
    
    const session = sessions.find(s => s.id === sessionId)
    if (session) {
      setCurrentSession(session)
    }
  }, [socket, currentUser, sessions])

  return {
    sessions,
    currentSession,
    sessionParticipants,
    createSession,
    joinSession
  }
}

// Real-time Notifications Hook
export function useRealtimeNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const { socket } = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleNotification = (notification: any) => {
      setNotifications(prev => [notification, ...prev])
      
      // Show browser notification if PWA notifications are enabled
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
          tag: notification.type,
          data: notification.metadata
        })
      }
    }

    socket.on('notification:received', handleNotification)

    return () => {
      socket.off('notification:received', handleNotification)
    }
  }, [socket])

  const sendNotification = useCallback((data: {
    targetUserIds: string[]
    type: string
    title: string
    message: string
    metadata?: any
  }) => {
    if (!socket) return
    socket.emit('notification:send', data)
  }, [socket])

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    sendNotification,
    markAsRead,
    clearNotifications,
    unreadCount: notifications.filter(n => !n.read).length
  }
}

// User Presence Hook
export function useUserPresence() {
  const [onlineUsers, setOnlineUsers] = useState<SocketUser[]>([])
  const { socket, connectedUsers, updateStatus } = useSocket()

  useEffect(() => {
    setOnlineUsers(connectedUsers.filter(user => user.status !== 'offline'))
  }, [connectedUsers])

  const setStatus = useCallback((status: SocketUser['status']) => {
    updateStatus(status)
  }, [updateStatus])

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.some(user => user.id === userId)
  }, [onlineUsers])

  const getUserStatus = useCallback((userId: string) => {
    return connectedUsers.find(user => user.id === userId)?.status || 'offline'
  }, [connectedUsers])

  return {
    onlineUsers,
    setStatus,
    isUserOnline,
    getUserStatus
  }
}

// Export the socket client for direct access if needed
export { socketClient }