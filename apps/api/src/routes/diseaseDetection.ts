import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { diseaseDetectionService } from '../services/diseaseDetection.js'

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
 * @route POST /api/disease-detection/analyze
 * @desc Analyze plant image for diseases
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file provided' 
      })
    }

    const { plantSpecies, plantId, userId } = req.body

    // Upload image to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'greenmate/disease-detection',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto:good' }
          ]
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      )
      uploadStream.end(req.file.buffer)
    })

    const imageUrl = (uploadResult as any).secure_url

    // Analyze image for diseases
    const detectionResult = await diseaseDetectionService.detectDisease(
      imageUrl, 
      plantSpecies
    )

    // Save detection to database (if user is logged in)
    if (userId) {
      await diseaseDetectionService.saveDiseaseDetection({
        userId,
        plantId,
        imageUrl,
        result: detectionResult
      })
    }

    res.json({
      success: true,
      data: {
        imageUrl,
        analysis: detectionResult,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Disease detection error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to analyze plant image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * @route POST /api/disease-detection/analyze-url
 * @desc Analyze plant image from URL for diseases
 */
router.post('/analyze-url', async (req, res) => {
  try {
    const { imageUrl, plantSpecies, plantId, userId } = req.body

    if (!imageUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image URL is required' 
      })
    }

    // Analyze image for diseases
    const detectionResult = await diseaseDetectionService.detectDisease(
      imageUrl, 
      plantSpecies
    )

    // Save detection to database (if user is logged in)
    if (userId) {
      await diseaseDetectionService.saveDiseaseDetection({
        userId,
        plantId,
        imageUrl,
        result: detectionResult
      })
    }

    res.json({
      success: true,
      data: {
        imageUrl,
        analysis: detectionResult,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Disease detection error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to analyze plant image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * @route GET /api/disease-detection/history/:userId
 * @desc Get user's disease detection history
 */
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const history = await diseaseDetectionService.getDiseaseHistory(userId)
    
    res.json({
      success: true,
      data: history
    })
  } catch (error: any) {
    console.error('Get history error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve disease detection history'
    })
  }
})

/**
 * @route GET /api/disease-detection/common-diseases
 * @desc Get common plant diseases information
 */
router.get('/common-diseases', async (req, res) => {
  try {
    const commonDiseases = [
      {
        name: 'Powdery Mildew',
        symptoms: ['White powdery coating on leaves', 'Yellowing leaves', 'Stunted growth'],
        causes: ['High humidity', 'Poor air circulation', 'Overcrowding'],
        treatment: ['Remove affected parts', 'Improve air circulation', 'Apply fungicide'],
        prevention: ['Avoid overhead watering', 'Ensure good ventilation', 'Regular plant inspection']
      },
      {
        name: 'Root Rot',
        symptoms: ['Yellowing leaves', 'Wilting despite moist soil', 'Black or mushy roots'],
        causes: ['Overwatering', 'Poor drainage', 'Contaminated soil'],
        treatment: ['Remove from pot', 'Trim affected roots', 'Repot in fresh, well-draining soil'],
        prevention: ['Proper drainage', 'Water when soil is dry', 'Use quality potting mix']
      },
      {
        name: 'Leaf Spot',
        symptoms: ['Brown or black spots on leaves', 'Yellow halos around spots', 'Leaf drop'],
        causes: ['Bacterial or fungal infection', 'High humidity', 'Water on leaves'],
        treatment: ['Remove affected leaves', 'Improve air circulation', 'Apply appropriate fungicide'],
        prevention: ['Avoid wetting leaves', 'Space plants properly', 'Water at soil level']
      },
      {
        name: 'Aphid Infestation',
        symptoms: ['Small green/black insects', 'Sticky honeydew', 'Curled or yellowing leaves'],
        causes: ['Overfeeding with nitrogen', 'Stress', 'Poor plant health'],
        treatment: ['Spray with water', 'Apply insecticidal soap', 'Introduce beneficial insects'],
        prevention: ['Regular inspection', 'Avoid over-fertilizing', 'Maintain plant health']
      },
      {
        name: 'Spider Mites',
        symptoms: ['Fine webbing on leaves', 'Yellow stippling', 'Leaf drop'],
        causes: ['Low humidity', 'High temperatures', 'Stress'],
        treatment: ['Increase humidity', 'Spray with water', 'Use predatory mites'],
        prevention: ['Maintain humidity', 'Regular misting', 'Good plant hygiene']
      }
    ]

    res.json({
      success: true,
      data: commonDiseases
    })
  } catch (error: any) {
    console.error('Get common diseases error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve common diseases information'
    })
  }
})

export default router