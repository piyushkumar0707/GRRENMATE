import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { marketplaceService } from '../services/marketplace.js'

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
 * @route POST /api/marketplace/listings
 * @desc Create a new marketplace listing
 */
router.post('/listings', upload.array('images', 5), async (req, res) => {
  try {
    const { userId, plantId, title, description, price, location } = req.body
    
    if (!userId || !title || !description || !price) {
      return res.status(400).json({
        success: false,
        message: 'User ID, title, description, and price are required'
      })
    }

    const numericPrice = parseFloat(price)
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price must be a valid positive number'
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
              folder: 'greenmate/marketplace',
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

    const listing = await marketplaceService.createListing({
      userId,
      plantId: plantId || undefined,
      title,
      description,
      price: numericPrice,
      images: imageUrls,
      location
    })

    res.status(201).json({
      success: true,
      data: listing
    })

  } catch (error: any) {
    console.error('Create listing error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create listing',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * @route GET /api/marketplace/listings
 * @desc Get marketplace listings with filters
 */
router.get('/listings', async (req, res) => {
  try {
    const { 
      plantId, 
      minPrice, 
      maxPrice, 
      location, 
      userId, 
      limit, 
      offset, 
      sortBy, 
      sortOrder 
    } = req.query

    const filters: any = {}
    
    if (plantId) filters.plantId = plantId as string
    if (userId) filters.userId = userId as string
    if (location) filters.location = location as string
    if (sortBy) filters.sortBy = sortBy as string
    if (sortOrder) filters.sortOrder = sortOrder as string
    
    if (minPrice) {
      const min = parseFloat(minPrice as string)
      if (!isNaN(min)) filters.minPrice = min
    }
    
    if (maxPrice) {
      const max = parseFloat(maxPrice as string)
      if (!isNaN(max)) filters.maxPrice = max
    }
    
    if (limit) {
      const l = parseInt(limit as string)
      if (!isNaN(l)) filters.limit = l
    }
    
    if (offset) {
      const o = parseInt(offset as string)
      if (!isNaN(o)) filters.offset = o
    }

    const listings = await marketplaceService.getListings(filters)

    res.json({
      success: true,
      data: listings
    })

  } catch (error: any) {
    console.error('Get listings error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listings'
    })
  }
})

/**
 * @route GET /api/marketplace/listings/:id
 * @desc Get a single marketplace listing
 */
router.get('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params
    const listing = await marketplaceService.getListingById(id)

    res.json({
      success: true,
      data: listing
    })

  } catch (error: any) {
    console.error('Get listing error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch listing'
    })
  }
})

/**
 * @route PUT /api/marketplace/listings/:id
 * @desc Update a marketplace listing
 */
router.put('/listings/:id', upload.array('images', 5), async (req, res) => {
  try {
    const { id } = req.params
    const { userId, title, description, price, location } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      })
    }

    const updates: any = {}
    if (title) updates.title = title
    if (description) updates.description = description
    if (location) updates.location = location
    
    if (price) {
      const numericPrice = parseFloat(price)
      if (!isNaN(numericPrice) && numericPrice >= 0) {
        updates.price = numericPrice
      }
    }

    // Handle new images if provided
    if (req.files && req.files.length > 0) {
      const files = req.files as Express.Multer.File[]
      
      const uploadPromises = files.map(file => {
        return new Promise<string>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: 'image',
              folder: 'greenmate/marketplace',
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

      const imageUrls = await Promise.all(uploadPromises)
      updates.images = imageUrls
    }

    const listing = await marketplaceService.updateListing(id, userId, updates)

    res.json({
      success: true,
      data: listing
    })

  } catch (error: any) {
    console.error('Update listing error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update listing'
    })
  }
})

/**
 * @route DELETE /api/marketplace/listings/:id
 * @desc Deactivate a marketplace listing
 */
router.delete('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      })
    }

    await marketplaceService.deactivateListing(id, userId)

    res.json({
      success: true,
      message: 'Listing deactivated successfully'
    })

  } catch (error: any) {
    console.error('Deactivate listing error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate listing'
    })
  }
})

/**
 * @route POST /api/marketplace/purchases
 * @desc Create a purchase
 */
router.post('/purchases', async (req, res) => {
  try {
    const { buyerId, listingId, amount } = req.body

    if (!buyerId || !listingId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Buyer ID, listing ID, and amount are required'
      })
    }

    const numericAmount = parseFloat(amount)
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a valid positive number'
      })
    }

    const purchase = await marketplaceService.createPurchase({
      buyerId,
      listingId,
      amount: numericAmount
    })

    res.status(201).json({
      success: true,
      data: purchase
    })

  } catch (error: any) {
    console.error('Create purchase error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create purchase'
    })
  }
})

/**
 * @route GET /api/marketplace/purchases/:userId
 * @desc Get user's purchases (as buyer or seller)
 */
router.get('/purchases/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const { type } = req.query

    const purchases = await marketplaceService.getPurchases(
      userId, 
      (type as 'buyer' | 'seller') || 'buyer'
    )

    res.json({
      success: true,
      data: purchases
    })

  } catch (error: any) {
    console.error('Get purchases error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch purchases'
    })
  }
})

/**
 * @route PUT /api/marketplace/purchases/:id/status
 * @desc Update purchase status
 */
router.put('/purchases/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status, userId } = req.body

    if (!status || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Status and user ID are required'
      })
    }

    if (!['pending', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be pending, completed, or cancelled'
      })
    }

    const purchase = await marketplaceService.updatePurchaseStatus(id, status, userId)

    res.json({
      success: true,
      data: purchase
    })

  } catch (error: any) {
    console.error('Update purchase status error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update purchase status'
    })
  }
})

/**
 * @route POST /api/marketplace/reviews
 * @desc Create a review
 */
router.post('/reviews', async (req, res) => {
  try {
    const { reviewerId, targetType, targetId, rating, comment } = req.body

    if (!reviewerId || !targetType || !targetId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Reviewer ID, target type, target ID, and rating are required'
      })
    }

    const numericRating = parseInt(rating)
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      })
    }

    if (!['seller', 'buyer', 'plant'].includes(targetType)) {
      return res.status(400).json({
        success: false,
        message: 'Target type must be seller, buyer, or plant'
      })
    }

    const review = await marketplaceService.createReview({
      reviewerId,
      targetType,
      targetId,
      rating: numericRating,
      comment
    })

    res.status(201).json({
      success: true,
      data: review
    })

  } catch (error: any) {
    console.error('Create review error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to create review'
    })
  }
})

/**
 * @route GET /api/marketplace/reviews/:targetId
 * @desc Get reviews for a target
 */
router.get('/reviews/:targetId', async (req, res) => {
  try {
    const { targetId } = req.params
    const { targetType } = req.query

    if (!targetType) {
      return res.status(400).json({
        success: false,
        message: 'Target type is required'
      })
    }

    const reviews = await marketplaceService.getReviews(targetId, targetType as string)

    res.json({
      success: true,
      data: reviews
    })

  } catch (error: any) {
    console.error('Get reviews error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews'
    })
  }
})

/**
 * @route GET /api/marketplace/stats
 * @desc Get marketplace statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await marketplaceService.getMarketplaceStats()

    res.json({
      success: true,
      data: stats
    })

  } catch (error: any) {
    console.error('Get marketplace stats error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch marketplace stats'
    })
  }
})

export default router