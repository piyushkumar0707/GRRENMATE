// Real-time Chat Room Component
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useChat, useUserPresence } from '@/lib/socket-client'
import { ChatMessage } from '@/lib/socket-server'
import { 
  Send, 
  Smile, 
  Image as ImageIcon, 
  Users, 
  MoreVertical,
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  Surprised,
  Sad
} from 'lucide-react'

interface ChatRoomProps {
  roomId: string
  roomName: string
  roomType: 'community' | 'private' | 'plant_group'
  currentUser: {
    id: string
    username: string
    avatar?: string
  }
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡']

export default function ChatRoom({ roomId, roomName, roomType, currentUser }: ChatRoomProps) {
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showParticipants, setShowParticipants] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const {
    messages,
    participants,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    addReaction,
    isTyping
  } = useChat(roomId)

  const { isUserOnline, getUserStatus } = useUserPresence()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage(newMessage, 'text')
      setNewMessage('')
      stopTyping()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)
    
    if (!isTyping && e.target.value.trim()) {
      startTyping()
    } else if (isTyping && !e.target.value.trim()) {
      stopTyping()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleReaction = (messageId: string, emoji: string) => {
    addReaction(messageId, emoji)
    setSelectedMessage(null)
  }

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const formatDate = (timestamp: Date) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const grouped: { [key: string]: ChatMessage[] } = {}
    
    messages.forEach(message => {
      const dateKey = formatDate(message.timestamp)
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(message)
    })
    
    return grouped
  }

  const groupedMessages = groupMessagesByDate(messages)

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
            {roomName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{roomName}</h3>
            <p className="text-sm text-gray-500">
              {participants.length} member{participants.length !== 1 ? 's' : ''}
              {typingUsers.length > 0 && (
                <span className="ml-2 text-green-600">
                  {typingUsers.length === 1 
                    ? `${participants.find(p => p.id === typingUsers[0])?.username} is typing...`
                    : `${typingUsers.length} people are typing...`
                  }
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Users className="w-5 h-5" />
          </button>
          
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                {date}
              </div>
            </div>

            {/* Messages for this date */}
            {dateMessages.map((message, index) => {
              const isCurrentUser = message.userId === currentUser.id
              const isSystem = message.type === 'system'
              const showAvatar = !isCurrentUser && !isSystem && 
                (index === 0 || dateMessages[index - 1].userId !== message.userId)

              if (isSystem) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
                      {message.content}
                    </div>
                  </div>
                )
              }

              return (
                <div 
                  key={message.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} group`}
                >
                  <div className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {showAvatar && !isCurrentUser && (
                      <div className="flex-shrink-0 mr-3">
                        {message.avatar ? (
                          <img 
                            src={message.avatar} 
                            alt={message.username}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                            {message.username.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Bubble */}
                    <div className={`relative ${showAvatar || isCurrentUser ? '' : 'ml-11'}`}>
                      {/* Username (for other users' first message in group) */}
                      {showAvatar && !isCurrentUser && (
                        <div className="text-sm text-gray-600 mb-1 ml-3">
                          {message.username}
                        </div>
                      )}

                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isCurrentUser
                            ? 'bg-green-500 text-white ml-auto'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                        onDoubleClick={() => setSelectedMessage(message.id)}
                      >
                        <p className="text-sm">{message.content}</p>
                        
                        {/* Message Reactions */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {message.reactions.map((reaction, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleReaction(message.id, reaction.emoji)}
                                className={`px-2 py-1 rounded-full text-xs flex items-center space-x-1 ${
                                  reaction.users.includes(currentUser.id)
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                }`}
                              >
                                <span>{reaction.emoji}</span>
                                <span>{reaction.users.length}</span>
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Timestamp */}
                        <div className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </div>
                      </div>

                      {/* Reaction Picker */}
                      {selectedMessage === message.id && (
                        <div className="absolute -top-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex space-x-2 z-10">
                          {EMOJI_REACTIONS.map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(message.id, emoji)}
                              className="p-1 hover:bg-gray-100 rounded text-lg"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-end space-x-2">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
              
              <div className="absolute right-2 bottom-2 flex space-x-1">
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <div className="absolute right-0 top-0 w-64 h-full bg-white border-l border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Participants</h3>
            <button
              onClick={() => setShowParticipants(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-2">
            {participants.map(participant => (
              <div key={participant.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                <div className="relative">
                  {participant.avatar ? (
                    <img 
                      src={participant.avatar} 
                      alt={participant.username}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {participant.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  {/* Online Status Indicator */}
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-2 border-white rounded-full ${
                    isUserOnline(participant.id) ? 'bg-green-500' : 'bg-gray-400'
                  }`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {participant.username}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getUserStatus(participant.id)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click outside to close reaction picker */}
      {selectedMessage && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setSelectedMessage(null)}
        />
      )}
    </div>
  )
}