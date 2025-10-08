import express from 'express'
import { weatherCareService } from '../services/weatherCare.js'

const router = express.Router()

/**
 * @route POST /api/weather-care/recommendations
 * @desc Get weather-based plant care recommendations
 */
router.post('/recommendations', async (req, res) => {
  try {
    const { location, plantTypes } = req.body

    if (!location) {
      return res.status(400).json({
        success: false,
        message: 'Location is required (coordinates or city name)'
      })
    }

    const recommendations = await weatherCareService.getWeatherBasedCareRecommendations(
      location,
      plantTypes
    )

    res.json({
      success: true,
      data: recommendations
    })

  } catch (error: any) {
    console.error('Weather care recommendations error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get weather-based recommendations',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * @route GET /api/weather-care/weather/:city
 * @desc Get current weather for a city
 */
router.get('/weather/:city', async (req, res) => {
  try {
    const { city } = req.params
    const { country } = req.query

    const weather = await weatherCareService.getLocationWeather(
      city,
      country as string
    )

    res.json({
      success: true,
      data: {
        location: country ? `${city}, ${country}` : city,
        weather,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Weather data error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get weather data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * @route POST /api/weather-care/weather/coordinates
 * @desc Get current weather by coordinates
 */
router.post('/weather/coordinates', async (req, res) => {
  try {
    const { lat, lon } = req.body

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      })
    }

    const weather = await weatherCareService.getWeatherData(lat, lon)

    res.json({
      success: true,
      data: {
        location: `${lat.toFixed(2)}, ${lon.toFixed(2)}`,
        weather,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Weather data error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get weather data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

/**
 * @route GET /api/weather-care/tips
 * @desc Get general plant care tips based on season and weather patterns
 */
router.get('/tips', async (req, res) => {
  try {
    const month = new Date().getMonth()
    let season: string
    let tips: any[]

    // Determine season (Northern Hemisphere)
    if (month >= 2 && month <= 4) {
      season = 'Spring'
      tips = [
        {
          title: 'Start Growing Season',
          description: 'Begin regular fertilizing as plants enter active growth',
          icon: '🌱',
          priority: 'high'
        },
        {
          title: 'Repotting Time',
          description: 'Perfect time to repot plants that have outgrown their containers',
          icon: '🪴',
          priority: 'medium'
        },
        {
          title: 'Pruning',
          description: 'Prune dead or damaged growth to encourage new growth',
          icon: '✂️',
          priority: 'medium'
        },
        {
          title: 'Increase Watering',
          description: 'Plants will need more water as they start actively growing',
          icon: '💧',
          priority: 'high'
        }
      ]
    } else if (month >= 5 && month <= 7) {
      season = 'Summer'
      tips = [
        {
          title: 'Consistent Watering',
          description: 'Monitor soil moisture closely and water consistently',
          icon: '💧',
          priority: 'high'
        },
        {
          title: 'Provide Shade',
          description: 'Protect plants from intense afternoon sun',
          icon: '🌳',
          priority: 'medium'
        },
        {
          title: 'Regular Feeding',
          description: 'Feed plants regularly to support active growth',
          icon: '🌿',
          priority: 'medium'
        },
        {
          title: 'Pest Monitoring',
          description: 'Watch for increased pest activity in warm weather',
          icon: '🔍',
          priority: 'high'
        }
      ]
    } else if (month >= 8 && month <= 10) {
      season = 'Fall'
      tips = [
        {
          title: 'Reduce Fertilizing',
          description: 'Gradually reduce feeding as plants prepare for dormancy',
          icon: '🍂',
          priority: 'medium'
        },
        {
          title: 'Harvest Seeds',
          description: 'Collect seeds from mature plants for next year',
          icon: '🌾',
          priority: 'low'
        },
        {
          title: 'Prepare for Winter',
          description: 'Start preparing tender plants for winter protection',
          icon: '🏠',
          priority: 'high'
        },
        {
          title: 'Clean Up',
          description: 'Remove dead or diseased plant material',
          icon: '🧹',
          priority: 'medium'
        }
      ]
    } else {
      season = 'Winter'
      tips = [
        {
          title: 'Reduce Watering',
          description: 'Most plants need less water during dormant period',
          icon: '💧',
          priority: 'high'
        },
        {
          title: 'Monitor Humidity',
          description: 'Indoor heating can reduce humidity - consider humidifiers',
          icon: '💨',
          priority: 'medium'
        },
        {
          title: 'No Fertilizing',
          description: 'Avoid fertilizing dormant plants',
          icon: '🚫',
          priority: 'high'
        },
        {
          title: 'Plan for Spring',
          description: 'Research new plants and plan your spring garden',
          icon: '📝',
          priority: 'low'
        }
      ]
    }

    res.json({
      success: true,
      data: {
        season,
        tips,
        lastUpdated: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Seasonal tips error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to get seasonal tips'
    })
  }
})

export default router