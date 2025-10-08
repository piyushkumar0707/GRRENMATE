import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { communityService } from '../services/community.js'

const router = express.Router()

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

/**
 * @route POST /api/community/posts
 * @desc Create a new community post
 */
router.post('/posts', upload.array('images', 5), async (req, res) => {
  try {
    const { userId, plantId, type, title, content, tags } = req.body
    
    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'User ID and content are required'
      })
    }

    let imageUrls: string[] = []

    // Upload images to Cloudinary if provided
    if (req.files && req.files.length > 0) {
      const files = req.files as Express.Multer.File[]
      
      const uploadPromises = files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'greenmate/community',
              transformation: [
                { width: 800, height: 600, crop: 'limit' },
                { quality: 'auto:good' }
              ]
            },
            (error, result) => {
              if (error) reject(error)
              else resolve(result!.secure_url)
            }
          )
          uploadStream.end(file.buffer)
        })
      })

      imageUrls = await Promise.all(uploadPromises)
    }

    const post = await communityService.createPost({
      userId,
      plantId,
      type: type || 'GENERAL',
      title,
      content,
      images: imageUrls,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : []
    })

    res.status(201).json({
      success: true,
      data: post
    })

  } catch (error: any) {
    console.error('Create post error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * @route GET /api/community/posts
 * @desc Get community posts with filters
 */
router.get('/posts', async (req, res) => {
  try {
    const { type, plantId, userId, tags, limit, offset } = req.query

    const filters: any = {}
    if (type) filters.type = type as string
    if (plantId) filters.plantId = plantId as string
    if (userId) filters.userId = userId as string
    if (tags) filters.tags = (tags as string).split(',')
    if (limit) filters.limit = parseInt(limit as string)
    if (offset) filters.offset = parseInt(offset as string)

    const posts = await communityService.getPosts(filters)

    res.json({
      success: true,
      data: posts
    })

  } catch (error: any) {
    console.error('Get posts error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts'
    })
  }
})

/**
 * @route GET /api/community/posts/:id
 * @desc Get a single post with comments
 */
router.get('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.query

    const post = await communityService.getPostById(id, userId as string)

    res.json({
      success: true,
      data: post
    })

  } catch (error: any) {
    console.error('Get post error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post'
    })
  }
})

/**
 * @route POST /api/community/posts/:id/comments
 * @desc Add a comment to a post
 */
router.post('/posts/:id/comments', async (req, res) => {
  try {
    const { id: postId } = req.params
    const { userId, content, parentId } = req.body

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'User ID and content are required'
      })
    }

    const comment = await communityService.createComment({
      userId,
      postId,
      content,
      parentId
    })

    res.status(201).json({
      success: true,
      data: comment
    })

  } catch (error: any) {
    console.error('Create comment error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create comment'
    })
  }
})

/**
 * @route POST /api/community/posts/:id/like
 * @desc Toggle like on a post
 */
router.post('/posts/:id/like', async (req, res) => {
  try {
    const { id: postId } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      })
    }

    const result = await communityService.toggleLike(userId, postId)

    res.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Toggle like error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like'
    })
  }
})

/**
 * @route POST /api/community/users/:id/follow
 * @desc Follow/unfollow a user
 */
router.post('/users/:id/follow', async (req, res) => {
  try {
    const { id: followingId } = req.params
    const { userId: followerId } = req.body

    if (!followerId) {
      return res.status(400).json({
        success: false,
        message: 'Follower user ID is required'
      })
    }

    if (followerId === followingId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot follow yourself'
      })
    }

    const result = await communityService.followUser(followerId, followingId)

    res.json({
      success: true,
      data: result
    })

  } catch (error: any) {
    console.error('Follow user error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to follow user'
    })
  }
})

/**
 * @route GET /api/community/users/:id
 * @desc Get user profile
 */
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { currentUserId } = req.query

    const user = await communityService.getUserProfile(id, currentUserId as string)

    res.json({
      success: true,
      data: user
    })

  } catch (error: any) {
    console.error('Get user profile error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    })
  }
})

/**
 * @route GET /api/community/trending-tags
 * @desc Get trending tags
 */
router.get('/trending-tags', async (req, res) => {
  try {
    const { limit } = req.query
    const trendingTags = await communityService.getTrendingTags(
      limit ? parseInt(limit as string) : undefined
    )

    res.json({
      success: true,
      data: trendingTags
    })

  } catch (error: any) {
    console.error('Get trending tags error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending tags'
    })
  }
})

/**
 * @route GET /api/community/experts
 * @desc Get plant experts
 */
router.get('/experts', async (req, res) => {
  try {
    const { limit } = req.query
    const experts = await communityService.getExperts(
      limit ? parseInt(limit as string) : undefined
    )

    res.json({
      success: true,
      data: experts
    })

  } catch (error: any) {
    console.error('Get experts error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experts'
    })
  }
})

/**
 * @route GET /api/community/feed/:userId
 * @desc Get personalized feed for a user
 */
router.get('/feed/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { limit, offset } = req.query

    // For now, return general posts but in the future this could be
    // personalized based on user's interests, following, etc.
    const posts = await communityService.getPosts({
      limit: limit ? parseInt(limit as string) : 20,
      offset: offset ? parseInt(offset as string) : 0
    })

    res.json({
      success: true,
      data: posts
    })

  } catch (error: any) {
    console.error('Get feed error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed'
    })
  }
})

export default router