import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import Plant from '../models/Plant.js'
import { protect, optional } from '../middleware/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, 'plant-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'), false)
    }
  }
})

// Simulate PlantNet API call (replace with actual API integration)
const mockPlantRecognition = async (imagePath) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Mock response - in production, this would be actual PlantNet API results
  const mockResults = [
    {
      plantId: null,
      scientificName: 'Monstera deliciosa',
      commonName: 'Swiss Cheese Plant',
      family: 'Araceae',
      confidence: 0.94,
      description: 'A popular houseplant known for its large, glossy, heart-shaped leaves with natural holes.',
      care: {
        sunlight: 'bright_indirect',
        water: { frequency: 'weekly' },
        temperature: { min: 18, max: 27, unit: 'celsius' },
        humidity: { min: 60, max: 70 }
      }
    },
    {
      plantId: null,
      scientificName: 'Epipremnum aureum',
      commonName: 'Golden Pothos',
      family: 'Araceae',
      confidence: 0.76,
      description: 'A trailing vine plant with heart-shaped leaves variegated in green and yellow.',
      care: {
        sunlight: 'low_light',
        water: { frequency: 'weekly' },
        temperature: { min: 15, max: 30, unit: 'celsius' },
        humidity: { min: 40, max: 60 }
      }
    }
  ]
  
  return mockResults
}

// @desc    Identify plant from image
// @route   POST /api/recognition/identify
// @access  Public
const identifyPlant = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      })
    }

    const imagePath = req.file.path

    // Call plant recognition service (mock for now)
    const recognitionResults = await mockPlantRecognition(imagePath)

    if (!recognitionResults || recognitionResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not identify the plant. Please try with a clearer image.'
      })
    }

    // Try to find matching plants in our database
    for (let result of recognitionResults) {
      const dbPlant = await Plant.findOne({
        scientificName: { $regex: result.scientificName, $options: 'i' }
      })
      
      if (dbPlant) {
        result.plantId = dbPlant._id
        // Increment recognition count
        dbPlant.popularity.recognitionCount += 1
        await dbPlant.save()
      }
    }

    // Create recognition record if user is authenticated
    if (req.user) {
      // In a full implementation, you'd save recognition history here
      // const recognition = await Recognition.create({
      //   userId: req.user.id,
      //   imagePath,
      //   results: recognitionResults
      // })
    }

    res.status(200).json({
      success: true,
      data: {
        results: recognitionResults,
        totalResults: recognitionResults.length,
        bestMatch: recognitionResults[0]
      }
    })

  } catch (error) {
    next(error)
  }
}

// @desc    Get recognition history
// @route   GET /api/recognition/history
// @access  Private
const getRecognitionHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query

    // Mock history for now - implement actual history model later
    const mockHistory = [
      {
        id: '1',
        date: new Date(),
        plantName: 'Monstera deliciosa',
        confidence: 94,
        image: '/uploads/plant-123.jpg'
      },
      {
        id: '2',
        date: new Date(Date.now() - 86400000), // Yesterday
        plantName: 'Ficus benjamina',
        confidence: 87,
        image: '/uploads/plant-124.jpg'
      }
    ]

    res.status(200).json({
      success: true,
      data: {
        history: mockHistory,
        pagination: {
          current: parseInt(page),
          total: 1,
          count: mockHistory.length
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

// Routes
router.post('/identify', optional, upload.single('image'), identifyPlant)
router.get('/history', protect, getRecognitionHistory)

export default router