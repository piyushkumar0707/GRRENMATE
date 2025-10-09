// Live Plant Sharing Sessions Component
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useLiveSessions, useChat, useUserPresence } from '@/lib/socket-client'
import { LiveSession } from '@/lib/socket-server'
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Users,
  MessageCircle,
  Share2,
  Settings,
  Monitor,
  Phone,
  PhoneOff,
  Camera,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  Clock,
  Eye,
  Heart,
  Star,
  Award,
  Leaf,
  Calendar,
  Plus,
  Play,
  Pause,
  Square
} from 'lucide-react'

interface LiveSessionsProps {
  currentUser: {
    id: string
    username: string
    avatar?: string
  }
}

interface SessionParticipant {
  id: string
  username: string
  avatar?: string
  role: 'host' | 'participant'
  isActive: boolean
  joinTime: Date
}

export default function LiveSessions({ currentUser }: LiveSessionsProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'create' | 'active'>('browse')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null)

  const { sessions, currentSession, sessionParticipants, createSession, joinSession } = useLiveSessions()
  const { onlineUsers } = useUserPresence()

  const activeSessions = sessions.filter(s => s.isActive)
  const upcomingSessions = sessions.filter(s => !s.isActive && s.startTime > new Date())

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Video className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Live Sessions</h2>
            <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
              {activeSessions.length} live
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Start Session</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {(['browse', 'create', 'active'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'browse' && (
          <BrowseSessions
            activeSessions={activeSessions}
            upcomingSessions={upcomingSessions}
            currentUser={currentUser}
            onJoinSession={joinSession}
            onSelectSession={setSelectedSession}
          />
        )}

        {activeTab === 'create' && (
          <CreateSession
            currentUser={currentUser}
            onCreateSession={createSession}
          />
        )}

        {activeTab === 'active' && (
          <ActiveSession
            session={currentSession}
            participants={sessionParticipants}
            currentUser={currentUser}
          />
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <CreateSessionModal
          currentUser={currentUser}
          onCreateSession={(sessionData) => {
            createSession(sessionData)
            setShowCreateModal(false)
          }}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Session Details Modal */}
      {selectedSession && (
        <SessionDetailsModal
          session={selectedSession}
          currentUser={currentUser}
          onJoin={() => {
            joinSession(selectedSession.id)
            setSelectedSession(null)
          }}
          onClose={() => setSelectedSession(null)}
        />
      )}
    </div>
  )
}

// Browse Sessions Component
function BrowseSessions({
  activeSessions,
  upcomingSessions,
  currentUser,
  onJoinSession,
  onSelectSession
}: {
  activeSessions: LiveSession[]
  upcomingSessions: LiveSession[]
  currentUser: { id: string; username: string; avatar?: string }
  onJoinSession: (sessionId: string) => void
  onSelectSession: (session: LiveSession) => void
}) {
  const getSessionTypeIcon = (type: string) => {
    switch (type) {
      case 'plant_tour': return '🌿'
      case 'qa_session': return '❓'
      case 'care_demo': return '🧑‍🏫'
      case 'community_chat': return '💬'
      default: return '🌱'
    }
  }

  const formatDuration = (startTime: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - startTime.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    
    if (diffMinutes < 60) return `${diffMinutes}m`
    return `${diffHours}h ${diffMinutes % 60}m`
  }

  return (
    <div className="space-y-6">
      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Live Now</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeSessions.map(session => (
              <div key={session.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-green-100 flex items-center justify-center relative">
                  <div className="text-4xl">{getSessionTypeIcon(session.type)}</div>
                  
                  {/* Live Badge */}
                  <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
                    <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                    <span>LIVE</span>
                  </div>

                  {/* Duration */}
                  <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                    {formatDuration(session.startTime)}
                  </div>

                  {/* Participants Count */}
                  <div className="absolute bottom-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{session.participants.length}</span>
                  </div>
                </div>

                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1">{session.title}</h4>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{session.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs">
                        {session.hostName.charAt(0)}
                      </div>
                      <span className="text-sm text-gray-700">{session.hostName}</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => onSelectSession(session)}
                        className="text-gray-500 hover:text-gray-700 px-2 py-1 text-sm"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => onJoinSession(session.id)}
                        className="bg-purple-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-purple-700"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span>Upcoming</span>
          </h3>
          
          <div className="space-y-3">
            {upcomingSessions.map(session => (
              <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-2xl">{getSessionTypeIcon(session.type)}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{session.title}</h4>
                        <p className="text-sm text-gray-600">by {session.hostName}</p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{session.description}</p>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{session.startTime.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{session.participants.length} registered</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectSession(session)}
                    className="text-purple-600 hover:text-purple-700 px-3 py-1 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSessions.length === 0 && upcomingSessions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="mb-2">No live sessions right now</p>
          <p className="text-sm">Start your own session to share your plant knowledge!</p>
        </div>
      )}
    </div>
  )
}

// Create Session Component
function CreateSession({
  currentUser,
  onCreateSession
}: {
  currentUser: { id: string; username: string; avatar?: string }
  onCreateSession: (sessionData: any) => void
}) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<'plant_tour' | 'qa_session' | 'care_demo' | 'community_chat'>('plant_tour')
  const [maxParticipants, setMaxParticipants] = useState(10)

  const sessionTypes = [
    { value: 'plant_tour', label: 'Plant Tour', icon: '🌿', description: 'Show off your plants and garden' },
    { value: 'qa_session', label: 'Q&A Session', icon: '❓', description: 'Answer plant care questions' },
    { value: 'care_demo', label: 'Care Demo', icon: '🧑‍🏫', description: 'Demonstrate plant care techniques' },
    { value: 'community_chat', label: 'Community Chat', icon: '💬', description: 'General discussion with the community' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim()) return

    onCreateSession({
      title: title.trim(),
      description: description.trim(),
      type,
      maxParticipants
    })

    // Reset form
    setTitle('')
    setDescription('')
    setType('plant_tour')
    setMaxParticipants(10)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Session Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your session about?"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tell viewers what they can expect..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Session Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {sessionTypes.map(sessionType => (
            <button
              key={sessionType.value}
              type="button"
              onClick={() => setType(sessionType.value as any)}
              className={`p-3 border rounded-lg text-left transition-colors ${
                type === sessionType.value
                  ? 'border-purple-500 bg-purple-50 text-purple-900'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-lg">{sessionType.icon}</span>
                <span className="font-medium text-sm">{sessionType.label}</span>
              </div>
              <p className="text-xs text-gray-600">{sessionType.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Max Participants
        </label>
        <select
          value={maxParticipants}
          onChange={(e) => setMaxParticipants(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value={5}>5 participants</option>
          <option value={10}>10 participants</option>
          <option value={20}>20 participants</option>
          <option value={50}>50 participants</option>
          <option value={100}>100 participants</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={!title.trim()}
        className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        Start Live Session
      </button>
    </form>
  )
}

// Active Session Component
function ActiveSession({
  session,
  participants,
  currentUser
}: {
  session: LiveSession | null
  participants: string[]
  currentUser: { id: string; username: string; avatar?: string }
}) {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)

  if (!session) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Video className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>You're not currently in a live session</p>
        <p className="text-sm">Join or start a session to begin sharing!</p>
      </div>
    )
  }

  const isHost = session.hostId === currentUser.id

  return (
    <div className="space-y-4">
      {/* Session Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-purple-900">{session.title}</h3>
            <p className="text-sm text-purple-700">
              {isHost ? 'You are hosting' : `Hosted by ${session.hostName}`}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center space-x-1">
              <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
              <span>LIVE</span>
            </div>
            <div className="text-sm text-purple-700">
              {participants.length} viewers
            </div>
          </div>
        </div>
      </div>

      {/* Video Area */}
      <div className="aspect-video bg-gray-900 rounded-lg relative overflow-hidden">
        {/* Main Video Feed */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl opacity-50">🌿</div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 bg-black bg-opacity-50 rounded-full px-4 py-2">
            <button
              onClick={() => setIsAudioEnabled(!isAudioEnabled)}
              className={`p-2 rounded-full ${
                isAudioEnabled 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-red-500 text-white'
              }`}
            >
              {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsVideoEnabled(!isVideoEnabled)}
              className={`p-2 rounded-full ${
                isVideoEnabled 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-red-500 text-white'
              }`}
            >
              {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
            </button>

            {isHost && (
              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-2 rounded-full ${
                  isScreenSharing 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-700 text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => setShowChat(!showChat)}
              className="p-2 rounded-full bg-gray-700 text-white"
            >
              <MessageCircle className="w-4 h-4" />
            </button>

            <button className="p-2 rounded-full bg-red-500 text-white">
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Participants List */}
        <div className="absolute top-4 right-4">
          <div className="bg-black bg-opacity-50 rounded-lg p-2">
            <div className="flex items-center space-x-1 text-white text-sm mb-2">
              <Users className="w-3 h-3" />
              <span>{participants.length}</span>
            </div>
            
            <div className="space-y-1">
              {participants.slice(0, 3).map((participantId, index) => (
                <div key={participantId} className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs">
                  {index + 1}
                </div>
              ))}
              {participants.length > 3 && (
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white text-xs">
                  +{participants.length - 3}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Session Chat */}
      {showChat && (
        <div className="border border-gray-200 rounded-lg">
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h4 className="font-medium text-gray-900 flex items-center space-x-2">
              <MessageCircle className="w-4 h-4" />
              <span>Live Chat</span>
            </h4>
          </div>
          
          <div className="h-48 p-3 overflow-y-auto bg-gray-50">
            <div className="space-y-2">
              <div className="text-sm">
                <span className="font-medium text-purple-600">Host:</span>
                <span className="ml-2 text-gray-700">Welcome everyone! 🌱</span>
              </div>
              <div className="text-sm">
                <span className="font-medium text-green-600">PlantLover:</span>
                <span className="ml-2 text-gray-700">Thanks for the session!</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Create Session Modal
function CreateSessionModal({
  currentUser,
  onCreateSession,
  onClose
}: {
  currentUser: { id: string; username: string; avatar?: string }
  onCreateSession: (sessionData: any) => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Start Live Session</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <CreateSession
          currentUser={currentUser}
          onCreateSession={(data) => {
            onCreateSession(data)
            onClose()
          }}
        />
      </div>
    </div>
  )
}

// Session Details Modal
function SessionDetailsModal({
  session,
  currentUser,
  onJoin,
  onClose
}: {
  session: LiveSession
  currentUser: { id: string; username: string; avatar?: string }
  onJoin: () => void
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Session Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-gray-900">{session.title}</h4>
            <p className="text-sm text-gray-600">by {session.hostName}</p>
          </div>

          {session.description && (
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-1">Description</h5>
              <p className="text-sm text-gray-600">{session.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Type:</span>
              <p className="font-medium capitalize">{session.type.replace('_', ' ')}</p>
            </div>
            <div>
              <span className="text-gray-500">Participants:</span>
              <p className="font-medium">{session.participants.length} / {session.maxParticipants}</p>
            </div>
          </div>

          {session.isActive ? (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live now</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              Starts: {session.startTime.toLocaleString()}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              onClick={onJoin}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 font-medium"
            >
              {session.isActive ? 'Join Session' : 'Register'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}