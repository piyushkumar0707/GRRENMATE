import axios from 'axios'

interface WeatherData {
  temperature: number
  humidity: number
  pressure: number
  description: string
  icon: string
  windSpeed: number
  uvIndex?: number
  precipitation?: number
}

interface CareRecommendation {
  type: 'watering' | 'fertilizing' | 'humidity' | 'light' | 'temperature' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  action: string
  reason: string
  icon: string
  dueDate?: string
}

interface WeatherCareResponse {
  location: string
  weather: WeatherData
  recommendations: CareRecommendation[]
  forecast: string
  lastUpdated: string
}

export class WeatherCareService {
  private openWeatherApiKey: string

  constructor() {
    this.openWeatherApiKey = process.env.OPENWEATHER_API_KEY!
    if (!this.openWeatherApiKey) {
      throw new Error('OpenWeather API key is required for weather-based care recommendations')
    }
  }

  async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            lat,
            lon,
            appid: this.openWeatherApiKey,
            units: 'metric'
          }
        }
      )

      const data = response.data
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0
      }
    } catch (error: any) {
      console.error('Weather API error:', error)
      throw new Error('Failed to fetch weather data')
    }
  }

  async getLocationWeather(city: string, country?: string): Promise<WeatherData> {
    try {
      const location = country ? `${city},${country}` : city
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather`,
        {
          params: {
            q: location,
            appid: this.openWeatherApiKey,
            units: 'metric'
          }
        }
      )

      const data = response.data
      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        windSpeed: data.wind.speed,
        precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0
      }
    } catch (error: any) {
      console.error('Weather API error:', error)
      throw new Error('Failed to fetch weather data')
    }
  }

  generateCareRecommendations(weather: WeatherData, plantTypes?: string[]): CareRecommendation[] {
    const recommendations: CareRecommendation[] = []

    // Temperature-based recommendations
    if (weather.temperature > 30) {
      recommendations.push({
        type: 'watering',
        priority: 'high',
        action: 'Increase watering frequency',
        reason: `High temperature (${weather.temperature}°C) increases evaporation`,
        icon: '💧',
        dueDate: new Date().toISOString()
      })
      recommendations.push({
        type: 'general',
        priority: 'medium',
        action: 'Provide shade during peak hours',
        reason: 'Protect plants from intense heat stress',
        icon: '🌳'
      })
    } else if (weather.temperature < 10) {
      recommendations.push({
        type: 'watering',
        priority: 'low',
        action: 'Reduce watering frequency',
        reason: `Low temperature (${weather.temperature}°C) reduces water evaporation`,
        icon: '💧'
      })
      recommendations.push({
        type: 'temperature',
        priority: 'high',
        action: 'Move sensitive plants indoors',
        reason: 'Protect from potential frost damage',
        icon: '🏠'
      })
    }

    // Humidity-based recommendations
    if (weather.humidity > 80) {
      recommendations.push({
        type: 'humidity',
        priority: 'medium',
        action: 'Ensure good air circulation',
        reason: `Very high humidity (${weather.humidity}%) increases disease risk`,
        icon: '🌬️'
      })
      recommendations.push({
        type: 'general',
        priority: 'medium',
        action: 'Check for signs of fungal diseases',
        reason: 'High humidity promotes fungal growth',
        icon: '🔍'
      })
    } else if (weather.humidity < 30) {
      recommendations.push({
        type: 'humidity',
        priority: 'high',
        action: 'Increase humidity around plants',
        reason: `Low humidity (${weather.humidity}%) can stress plants`,
        icon: '💨'
      })
      recommendations.push({
        type: 'watering',
        priority: 'medium',
        action: 'Mist plants regularly',
        reason: 'Help compensate for dry air',
        icon: '💦'
      })
    }

    // Precipitation-based recommendations
    if (weather.precipitation && weather.precipitation > 5) {
      recommendations.push({
        type: 'watering',
        priority: 'low',
        action: 'Skip outdoor watering today',
        reason: `Recent rainfall (${weather.precipitation}mm) provides natural watering`,
        icon: '🌧️'
      })
      recommendations.push({
        type: 'general',
        priority: 'medium',
        action: 'Check drainage after rain',
        reason: 'Ensure plants are not waterlogged',
        icon: '🔍'
      })
    }

    // Wind-based recommendations
    if (weather.windSpeed > 10) {
      recommendations.push({
        type: 'general',
        priority: 'medium',
        action: 'Secure tall plants and containers',
        reason: `Strong winds (${weather.windSpeed} m/s) can damage plants`,
        icon: '🌪️'
      })
      recommendations.push({
        type: 'watering',
        priority: 'medium',
        action: 'Check soil moisture more frequently',
        reason: 'Wind increases water evaporation',
        icon: '💧'
      })
    }

    // Weather condition specific recommendations
    if (weather.description.includes('rain')) {
      recommendations.push({
        type: 'general',
        priority: 'low',
        action: 'Enjoy the natural watering!',
        reason: 'Plants love natural rainwater',
        icon: '🌿'
      })
    } else if (weather.description.includes('sun') || weather.description.includes('clear')) {
      recommendations.push({
        type: 'light',
        priority: 'low',
        action: 'Perfect day for photosynthesis',
        reason: 'Bright sunshine promotes healthy plant growth',
        icon: '☀️'
      })
    }

    // Seasonal general recommendations
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) { // Spring
      recommendations.push({
        type: 'fertilizing',
        priority: 'medium',
        action: 'Start spring fertilizing schedule',
        reason: 'Plants are entering their active growing season',
        icon: '🌱'
      })
    } else if (month >= 5 && month <= 7) { // Summer
      recommendations.push({
        type: 'watering',
        priority: 'medium',
        action: 'Monitor watering needs closely',
        reason: 'Summer growth requires consistent moisture',
        icon: '🌞'
      })
    } else if (month >= 8 && month <= 10) { // Fall
      recommendations.push({
        type: 'fertilizing',
        priority: 'low',
        action: 'Reduce fertilizing frequency',
        reason: 'Plants are preparing for dormancy',
        icon: '🍂'
      })
    } else { // Winter
      recommendations.push({
        type: 'watering',
        priority: 'low',
        action: 'Water sparingly',
        reason: 'Most plants are dormant and need less water',
        icon: '❄️'
      })
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  async getWeatherBasedCareRecommendations(
    location: { lat?: number; lon?: number; city?: string; country?: string },
    plantTypes?: string[]
  ): Promise<WeatherCareResponse> {
    try {
      let weather: WeatherData
      let locationName: string

      if (location.lat && location.lon) {
        weather = await this.getWeatherData(location.lat, location.lon)
        locationName = `${location.lat.toFixed(2)}, ${location.lon.toFixed(2)}`
      } else if (location.city) {
        weather = await this.getLocationWeather(location.city, location.country)
        locationName = location.country ? `${location.city}, ${location.country}` : location.city
      } else {
        throw new Error('Location coordinates or city name is required')
      }

      const recommendations = this.generateCareRecommendations(weather, plantTypes)

      // Generate forecast summary
      let forecast = `Today's weather: ${weather.description} with temperature around ${weather.temperature}°C`
      if (weather.precipitation && weather.precipitation > 0) {
        forecast += ` and ${weather.precipitation}mm of precipitation`
      }

      return {
        location: locationName,
        weather,
        recommendations,
        forecast,
        lastUpdated: new Date().toISOString()
      }
    } catch (error: any) {
      console.error('Weather care service error:', error)
      throw error
    }
  }
}

export const weatherCareService = new WeatherCareService()