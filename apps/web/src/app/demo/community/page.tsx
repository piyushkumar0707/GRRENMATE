'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Post {
  id: string
  type: 'GENERAL' | 'HELP_REQUEST' | 'SUCCESS_STORY' | 'PLANT_SHOWCASE'
  title?: string
  content: string
  images: string[]
  tags: string[]
  createdAt: string
  user: {
    username: string
    profile?: {
      firstName?: string
      lastName?: string
      avatar?: string
    }
  }
  plant?: {
    name: string
    scientificName: string
  }
  _count: {
    likes: number
    comments: number
  }
}

interface TrendingTag {
  tag: string
  count: number
}

interface Expert {
  username: string
  profile?: {
    firstName?: string
    lastName?: string
    avatar?: string
  }
  _count: {
    posts: number
    followers: number
    userPlants: number
  }
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([])
  const [experts, setExperts] = useState<Expert[]>([])
  const [loading, setLoading] = useState(false)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    type: 'GENERAL' as const,
    tags: ''
  })

  const fetchPosts = async (type?: string) => {
    setLoading(true)
    try {
      const url = type && type !== 'all' 
        ? `http://localhost:3001/api/community/posts?type=${type}`
        : 'http://localhost:3001/api/community/posts'
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          setPosts(data.data)
        }
      } else {
        setPosts([])
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchTrendingTags = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/community/trending-tags')
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          setTrendingTags(data.data)
        }
      } else {
        setTrendingTags([])
      }
    } catch (error) {
      console.error('Error fetching trending tags:', error)
      setTrendingTags([])
    }
  }

  const fetchExperts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/community/experts')
      if (response.ok) {
        const data = await response.json()
        
        if (data.success) {
          setExperts(data.data)
        }
      } else {
        setExperts([])
      }
    } catch (error) {
      console.error('Error fetching experts:', error)
      setExperts([])
    }
  }

  const createPost = async () => {
    if (!newPost.content.trim()) return

    try {
      const formData = new FormData()
      formData.append('userId', 'demo-user-id') // In real app, get from auth
      formData.append('content', newPost.content)
      formData.append('type', newPost.type)
      if (newPost.title) formData.append('title', newPost.title)
      if (newPost.tags) formData.append('tags', newPost.tags)

      const response = await fetch('http://localhost:3001/api/community/posts', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        setNewPost({ title: '', content: '', type: 'GENERAL', tags: '' })
        fetchPosts(activeFilter)
      }
    } catch (error) {
      console.error('Error creating post:', error)
    }
  }

  useEffect(() => {
    fetchPosts()
    fetchTrendingTags()
    fetchExperts()
  }, [])

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter)
    fetchPosts(filter)
  }

  const getPostTypeIcon = (type: string) => {
    const icons = {
      'GENERAL': '💬',
      'HELP_REQUEST': '🆘',
      'SUCCESS_STORY': '🎉',
      'PLANT_SHOWCASE': '🌿'
    }
    return icons[type as keyof typeof icons] || '💬'
  }

  const getPostTypeColor = (type: string) => {
    const colors = {
      'GENERAL': 'bg-blue-100 text-blue-800',
      'HELP_REQUEST': 'bg-red-100 text-red-800',
      'SUCCESS_STORY': 'bg-green-100 text-green-800',
      'PLANT_SHOWCASE': 'bg-purple-100 text-purple-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌱 Plant Community
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Connect with fellow plant enthusiasts, share experiences, get expert advice, 
            and showcase your green friends in our thriving community.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Post Filters */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📝 Post Types
              </h3>
              <div className="space-y-2">
                {[
                  { key: 'all', label: 'All Posts', icon: '🌍' },
                  { key: 'GENERAL', label: 'General', icon: '💬' },
                  { key: 'HELP_REQUEST', label: 'Help Requests', icon: '🆘' },
                  { key: 'SUCCESS_STORY', label: 'Success Stories', icon: '🎉' },
                  { key: 'PLANT_SHOWCASE', label: 'Plant Showcase', icon: '🌿' }
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => handleFilterChange(filter.key)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      activeFilter === filter.key
                        ? 'bg-green-100 text-green-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{filter.icon}</span>
                    <span className="font-medium">{filter.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Trending Tags */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔥 Trending Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    #{tag.tag} ({tag.count})
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Plant Experts */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🌟 Plant Experts
              </h3>
              <div className="space-y-3">
                {experts.map((expert, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                      {expert.profile?.firstName?.[0] || expert.username[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {expert.profile?.firstName || expert.username}
                      </p>
                      <p className="text-sm text-gray-600">
                        {expert._count.posts} posts • {expert._count.followers} followers
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Create Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ✍️ Share with the Community
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Post title (optional)"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <select
                    value={newPost.type}
                    onChange={(e) => setNewPost({...newPost, type: e.target.value as any})}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="GENERAL">General Discussion</option>
                    <option value="HELP_REQUEST">Help Request</option>
                    <option value="SUCCESS_STORY">Success Story</option>
                    <option value="PLANT_SHOWCASE">Plant Showcase</option>
                  </select>
                </div>
                
                <textarea
                  placeholder="Share your plant experiences, ask questions, or showcase your green friends..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                />
                
                <input
                  type="text"
                  placeholder="Tags (comma-separated: monstera, watering, help)"
                  value={newPost.tags}
                  onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                
                <button
                  onClick={createPost}
                  disabled={!newPost.content.trim()}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
                >
                  {getPostTypeIcon(newPost.type)} Share Post
                </button>
              </div>
            </motion.div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading community posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
                  <div className="text-6xl mb-4">🌱</div>
                  <p className="text-gray-500 text-lg">No posts found</p>
                  <p className="text-gray-400">Be the first to share something with the community!</p>
                </div>
              ) : (
                posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-xl p-6"
                  >
                    {/* Post Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                          {post.user.profile?.firstName?.[0] || post.user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {post.user.profile?.firstName 
                              ? `${post.user.profile.firstName} ${post.user.profile.lastName || ''}`
                              : post.user.username
                            }
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPostTypeColor(post.type)}`}>
                        {getPostTypeIcon(post.type)} {post.type.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Post Content */}
                    {post.title && (
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {post.title}
                      </h3>
                    )}
                    
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {post.content}
                    </p>

                    {/* Plant Info */}
                    {post.plant && (
                      <div className="flex items-center space-x-2 mb-4 p-3 bg-green-50 rounded-lg">
                        <span className="text-2xl">🌿</span>
                        <div>
                          <p className="font-medium text-green-800">{post.plant.name}</p>
                          <p className="text-sm text-green-600">{post.plant.scientificName}</p>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Post Actions */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                          <span className="text-lg">❤️</span>
                          <span className="text-sm">{post._count.likes}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors">
                          <span className="text-lg">💬</span>
                          <span className="text-sm">{post._count.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-gray-600 hover:text-green-500 transition-colors">
                          <span className="text-lg">🔄</span>
                          <span className="text-sm">Share</span>
                        </button>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <span className="text-lg">⋯</span>
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}