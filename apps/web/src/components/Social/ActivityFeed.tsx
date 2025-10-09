// Real-time Social Activity Feed Component
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { usePlantActivity, useRealtimeNotifications, useUserPresence } from '@/lib/socket-client'
import { PlantShareActivity } from '@/lib/socket-server'
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Droplets,
  Scissors,
  Zap,
  Eye,
  Camera,
  Trophy,
  Users,
  Leaf,
  Clock,
  ThumbsUp,
  BookOpen,
  Star,
  Award,
  TrendingUp,
  MapPin,
  Calendar
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'plant_care' | 'achievement' | 'community_post' | 'plant_update' | 'collaboration' | 'milestone'
  userId: string
  username: string
  avatar?: string
  timestamp: Date
  content: string
  metadata?: {
    plantId?: string
    plantName?: string
    careType?: string
    achievementType?: string
    imageUrl?: string
    location?: string
    collaborators?: string[]
    milestone?: {
      type: 'days_streak' | 'plants_saved' | 'community_helper'
      value: number
    }
  }
  likes: string[]
  comments: Comment[]
  shares: number
}

interface Comment {
  id: string
  userId: string
  username: string
  avatar?: string
  content: string
  timestamp: Date
  likes: string[]
}

interface ActivityFeedProps {
  currentUser: {
    id: string
    username: string
    avatar?: string
  }
  filter?: 'all' | 'following' | 'plants' | 'achievements' | 'community'
}

export default function ActivityFeed({ currentUser, filter = 'all' }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [newPost, setNewPost] = useState('')
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({})
  const [commentInputs, setCommentInputs] = useState<{ [key: string]: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const { activities: plantActivities } = usePlantActivity()
  const { onlineUsers, isUserOnline } = useUserPresence()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Mock activities for demo - in real app, these would come from API/database
  useEffect(() => {
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'plant_care',
        userId: 'user1',
        username: 'GreenThumb99',
        avatar: '/avatars/user1.jpg',
        timestamp: new Date(Date.now() - 30 * 60000), // 30 minutes ago
        content: 'Just watered my Fiddle Leaf Fig! The leaves are looking so much healthier now. 🌱',
        metadata: {
          plantId: 'plant1',
          plantName: 'Fiddle Leaf Fig',
          careType: 'watering',
          imageUrl: '/plants/fiddle-leaf-fig.jpg'
        },
        likes: ['user2', 'user3'],
        comments: [
          {
            id: 'c1',
            userId: 'user2',
            username: 'PlantLover',
            content: 'Looking great! How often do you water it?',
            timestamp: new Date(Date.now() - 20 * 60000),
            likes: []
          }
        ],
        shares: 1
      },
      {
        id: '2',
        type: 'achievement',
        userId: 'user2',
        username: 'PlantLover',
        timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
        content: 'Achieved a 30-day plant care streak! Consistency really pays off! 🏆',
        metadata: {
          achievementType: 'care_streak',
          milestone: {
            type: 'days_streak',
            value: 30
          }
        },
        likes: ['user1', 'user3', 'user4'],
        comments: [],
        shares: 3
      },
      {
        id: '3',
        type: 'community_post',
        userId: 'user3',
        username: 'UrbanGardener',
        timestamp: new Date(Date.now() - 4 * 60 * 60000), // 4 hours ago
        content: 'Does anyone know why my snake plant leaves are turning yellow? I\'ve been following the care guide but something seems off. Any advice would be appreciated! 🤔',
        metadata: {
          plantName: 'Snake Plant',
          imageUrl: '/plants/snake-plant-yellow.jpg'
        },
        likes: ['user1'],
        comments: [
          {
            id: 'c2',
            userId: 'user1',
            username: 'GreenThumb99',
            content: 'Could be overwatering. Snake plants prefer to dry out between waterings.',
            timestamp: new Date(Date.now() - 3.5 * 60 * 60000),
            likes: ['user3']
          },
          {
            id: 'c3',
            userId: 'user4',
            username: 'PlantExpert',
            content: 'Also check for root rot. Yellow leaves are often a sign of root problems.',
            timestamp: new Date(Date.now() - 3 * 60 * 60000),
            likes: ['user3', 'user1']
          }
        ],
        shares: 0
      }
    ]

    setActivities(mockActivities)
  }, [])

  // Convert plant activities to feed items
  useEffect(() => {
    const feedItems: ActivityItem[] = plantActivities.map(activity => ({
      id: activity.id,
      type: 'plant_care',
      userId: activity.userId,
      username: activity.username,
      timestamp: activity.timestamp,
      content: activity.description,
      metadata: {
        plantId: activity.plantId,
        plantName: activity.plantName,
        careType: activity.type,
        imageUrl: activity.imageUrl
      },
      likes: [],
      comments: [],
      shares: 0
    }))

    setActivities(prev => {
      const combined = [...feedItems, ...prev]
      return combined.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    })
  }, [plantActivities])

  const getActivityIcon = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'plant_care':
        switch (activity.metadata?.careType) {
          case 'watering': return <Droplets className="w-5 h-5 text-blue-500" />
          case 'fertilizing': return <Zap className="w-5 h-5 text-yellow-500" />
          case 'pruning': return <Scissors className="w-5 h-5 text-green-500" />
          case 'observation': return <Eye className="w-5 h-5 text-purple-500" />
          case 'photo': return <Camera className="w-5 h-5 text-pink-500" />
          default: return <Leaf className="w-5 h-5 text-green-500" />
        }
      case 'achievement':
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 'community_post':
        return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'plant_update':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'collaboration':
        return <Users className="w-5 h-5 text-purple-500" />
      case 'milestone':
        return <Award className="w-5 h-5 text-orange-500" />
      default:
        return <Leaf className="w-5 h-5 text-green-500" />
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - timestamp.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return timestamp.toLocaleDateString()
  }

  const handleLike = (activityId: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const isLiked = activity.likes.includes(currentUser.id)
        const newLikes = isLiked
          ? activity.likes.filter(id => id !== currentUser.id)
          : [...activity.likes, currentUser.id]
        return { ...activity, likes: newLikes }
      }
      return activity
    }))
  }

  const handleCommentLike = (activityId: string, commentId: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        const newComments = activity.comments.map(comment => {
          if (comment.id === commentId) {
            const isLiked = comment.likes.includes(currentUser.id)
            const newLikes = isLiked
              ? comment.likes.filter(id => id !== currentUser.id)
              : [...comment.likes, currentUser.id]
            return { ...comment, likes: newLikes }
          }
          return comment
        })
        return { ...activity, comments: newComments }
      }
      return activity
    }))
  }

  const handleAddComment = (activityId: string) => {
    const commentText = commentInputs[activityId]?.trim()
    if (!commentText) return

    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      avatar: currentUser.avatar,
      content: commentText,
      timestamp: new Date(),
      likes: []
    }

    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        return {
          ...activity,
          comments: [...activity.comments, newComment]
        }
      }
      return activity
    }))

    setCommentInputs(prev => ({ ...prev, [activityId]: '' }))
  }

  const handleShare = (activityId: string) => {
    setActivities(prev => prev.map(activity => {
      if (activity.id === activityId) {
        return { ...activity, shares: activity.shares + 1 }
      }
      return activity
    }))
    
    // In a real app, this would trigger share functionality
    console.log('Sharing activity:', activityId)
  }

  const toggleComments = (activityId: string) => {
    setShowComments(prev => ({
      ...prev,
      [activityId]: !prev[activityId]
    }))
  }

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true
    if (filter === 'plants') return activity.type === 'plant_care' || activity.type === 'plant_update'
    if (filter === 'achievements') return activity.type === 'achievement' || activity.type === 'milestone'
    if (filter === 'community') return activity.type === 'community_post' || activity.type === 'collaboration'
    if (filter === 'following') {
      // In a real app, this would filter based on followed users
      return true
    }
    return true
  })

  return (
    <div className="max-w-2xl mx-auto bg-white">
      {/* Create Post */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
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
          
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your plant journey..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={3}
            />
            
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600 px-3 py-1 rounded-md hover:bg-green-50">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Photo</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600 px-3 py-1 rounded-md hover:bg-green-50">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Location</span>
                </button>
              </div>
              
              <button
                disabled={!newPost.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div ref={scrollRef} className="space-y-6">
        {filteredActivities.map(activity => (
          <div key={activity.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Activity Header */}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    {activity.avatar ? (
                      <img 
                        src={activity.avatar} 
                        alt={activity.username}
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                          {activity.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Online indicator */}
                    {isUserOnline(activity.userId) && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">{activity.username}</h3>
                      {getActivityIcon(activity)}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(activity.timestamp)}</span>
                    </p>
                  </div>
                </div>
                
                <button className="text-gray-400 hover:text-gray-600 p-1">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Activity Content */}
            <div className="px-4 pb-3">
              <p className="text-gray-900 mb-3">{activity.content}</p>
              
              {/* Achievement Badge */}
              {activity.type === 'achievement' && activity.metadata?.milestone && (
                <div className="inline-flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-full px-3 py-1 mb-3">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">
                    {activity.metadata.milestone.value} {activity.metadata.milestone.type.replace('_', ' ')}
                  </span>
                </div>
              )}

              {/* Plant Info */}
              {activity.metadata?.plantName && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                  <Leaf className="w-4 h-4" />
                  <span>{activity.metadata.plantName}</span>
                </div>
              )}
            </div>

            {/* Activity Image */}
            {activity.metadata?.imageUrl && (
              <div className="px-4 pb-3">
                <img 
                  src={activity.metadata.imageUrl} 
                  alt="Activity"
                  className="w-full rounded-lg object-cover max-h-96"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="px-4 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(activity.id)}
                    className={`flex items-center space-x-1 hover:text-red-600 transition-colors ${
                      activity.likes.includes(currentUser.id) 
                        ? 'text-red-600' 
                        : 'text-gray-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${
                      activity.likes.includes(currentUser.id) ? 'fill-current' : ''
                    }`} />
                    <span className="text-sm">{activity.likes.length}</span>
                  </button>

                  <button
                    onClick={() => toggleComments(activity.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{activity.comments.length}</span>
                  </button>

                  <button
                    onClick={() => handleShare(activity.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">{activity.shares}</span>
                  </button>
                </div>

                {activity.likes.length > 0 && (
                  <div className="text-sm text-gray-500">
                    {activity.likes.length} like{activity.likes.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            {showComments[activity.id] && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-3">
                {/* Existing Comments */}
                {activity.comments.map(comment => (
                  <div key={comment.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {comment.avatar ? (
                        <img 
                          src={comment.avatar} 
                          alt={comment.username}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {comment.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-100 rounded-lg px-3 py-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {comment.username}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900">{comment.content}</p>
                      </div>
                      
                      <div className="flex items-center space-x-4 mt-1">
                        <button
                          onClick={() => handleCommentLike(activity.id, comment.id)}
                          className={`flex items-center space-x-1 text-xs hover:text-red-600 ${
                            comment.likes.includes(currentUser.id) 
                              ? 'text-red-600' 
                              : 'text-gray-500'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {comment.likes.length > 0 && (
                            <span>{comment.likes.length}</span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add Comment */}
                <div className="flex items-start space-x-3 mt-3">
                  <div className="flex-shrink-0">
                    {currentUser.avatar ? (
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.username}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {currentUser.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 flex space-x-2">
                    <input
                      type="text"
                      value={commentInputs[activity.id] || ''}
                      onChange={(e) => setCommentInputs(prev => ({
                        ...prev,
                        [activity.id]: e.target.value
                      }))}
                      placeholder="Write a comment..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(activity.id)
                        }
                      }}
                    />
                    <button
                      onClick={() => handleAddComment(activity.id)}
                      disabled={!commentInputs[activity.id]?.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-full text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center py-4">
            <button
              onClick={() => {
                // In real app, load more activities
                setIsLoading(true)
                setTimeout(() => setIsLoading(false), 1000)
              }}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}