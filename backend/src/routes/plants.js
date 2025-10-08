import express from 'express'
import Plant from '../models/Plant.js'
import { protect, optional } from '../middleware/auth.js'

const router = express.Router()

// @desc    Get all plants
// @route   GET /api/plants
// @access  Public
const getPlants = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      difficulty,
      categories,
      sunlight,
      sort = '-popularity.recognitionCount'
    } = req.query

    // Build query
    const query = { status: 'active' }

    if (search) {
      query.$text = { $search: search }
    }

    if (difficulty) {
      query['characteristics.difficulty'] = difficulty
    }

    if (categories) {
      query.categories = { $in: categories.split(',') }
    }

    if (sunlight) {
      query['care.sunlight'] = sunlight
    }

    // Execute query with pagination
    const plants = await Plant.find(query)
      .select('name scientificName images care.sunlight characteristics.difficulty categories popularity')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)

    const total = await Plant.countDocuments(query)

    res.status(200).json({
      success: true,
      data: {
        plants,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          count: plants.length,
          totalCount: total
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single plant
// @route   GET /api/plants/:id
// @access  Public
const getPlant = async (req, res, next) => {
  try {
    const plant = await Plant.findById(req.params.id)

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      })
    }

    // Increment view count
    plant.popularity.viewCount += 1
    await plant.save()

    res.status(200).json({
      success: true,
      data: plant
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Search plants
// @route   GET /api/plants/search
// @access  Public
const searchPlants = async (req, res, next) => {
  try {
    const { q, limit = 10 } = req.query

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      })
    }

    const plants = await Plant.find({
      $text: { $search: q },
      status: 'active'
    })
    .select('name scientificName commonNames images characteristics.difficulty')
    .limit(parseInt(limit))
    .sort({ score: { $meta: 'textScore' } })

    res.status(200).json({
      success: true,
      data: plants
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get popular plants
// @route   GET /api/plants/popular
// @access  Public
const getPopularPlants = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query

    const plants = await Plant.find({ status: 'active' })
      .select('name scientificName images popularity characteristics.difficulty')
      .sort('-popularity.recognitionCount')
      .limit(parseInt(limit))

    res.status(200).json({
      success: true,
      data: plants
    })
  } catch (error) {
    next(error)
  }
}

// Routes
router.route('/').get(getPlants)
router.route('/search').get(searchPlants)
router.route('/popular').get(getPopularPlants)
router.route('/:id').get(getPlant)

export default router