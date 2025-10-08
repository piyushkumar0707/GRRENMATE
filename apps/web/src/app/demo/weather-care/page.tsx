'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface WeatherData {
  temperature: number
  humidity: number
  pressure: number
  description: string
  icon: string
  windSpeed: number
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

interface WeatherCareData {
  location: string
  weather: WeatherData
  recommendations: CareRecommendation[]
  forecast: string
  lastUpdated: string
}

export default function WeatherCarePage() {
  const [weatherCare, setWeatherCare] = useState<WeatherCareData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [city, setCity] = useState('New York')
  const [country, setCountry] = useState('US')

  const fetchWeatherCare = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3001/api/weather-care/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: { city, country }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch weather care recommendations')
      }

      const data = await response.json()
      if (data.success) {
        setWeatherCare(data.data)
      } else {
        throw new Error(data.message)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserLocation = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setLoading(true)
          try {
            const response = await fetch('http://localhost:3001/api/weather-care/recommendations', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                location: {
                  lat: position.coords.latitude,
                  lon: position.coords.longitude
                }
              })
            })

            if (!response.ok) {
              throw new Error('Failed to fetch weather care recommendations')
            }

            const data = await response.json()
            if (data.success) {
              setWeatherCare(data.data)
              setError(null)
            }
          } catch (err: any) {
            setError(err.message)
          } finally {
            setLoading(false)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
          setError('Location access denied. Please enter your city manually.')
        }
      )
    } else {
      setError('Geolocation is not supported by this browser.')
    }
  }

  useEffect(() => {
    fetchWeatherCare()
  }, [])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 border-red-200 text-red-800'
      case 'high': return 'bg-orange-100 border-orange-200 text-orange-800'
      case 'medium': return 'bg-yellow-100 border-yellow-200 text-yellow-800'
      case 'low': return 'bg-green-100 border-green-200 text-green-800'
      default: return 'bg-gray-100 border-gray-200 text-gray-800'
    }
  }

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌦️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '🌨️', '13n': '🌨️',
      '50d': '🌫️', '50n': '🌫️'
    }
    return iconMap[iconCode] || '🌤️'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌤️ Weather-Based Plant Care
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get intelligent plant care recommendations based on real-time weather conditions, 
            seasonal patterns, and local climate data.
          </p>
        </motion.div>

        {/* Location Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your city"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country Code
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., US, UK, IN"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchWeatherCare}
                disabled={loading}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Loading...' : 'Get Recommendations'}
              </button>
              <button
                onClick={fetchUserLocation}
                disabled={loading}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                title="Use my location"
              >
                📍
              </button>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 border border-red-200 rounded-lg p-4 mb-8"
          >
            <p className="text-red-600">❌ {error}</p>
          </motion.div>
        )}

        {weatherCare && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Weather Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                🌍 Current Weather
              </h2>
              
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  📍 {weatherCare.location}
                </h3>
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-4xl">
                    {getWeatherIcon(weatherCare.weather.icon)}
                  </span>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {Math.round(weatherCare.weather.temperature)}°C
                    </div>
                    <div className="text-gray-600 capitalize">
                      {weatherCare.weather.description}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">💧 Humidity</span>
                  <span className="font-medium">{weatherCare.weather.humidity}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">🌪️ Wind Speed</span>
                  <span className="font-medium">{weatherCare.weather.windSpeed} m/s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">📊 Pressure</span>
                  <span className="font-medium">{weatherCare.weather.pressure} hPa</span>
                </div>
                {weatherCare.weather.precipitation && weatherCare.weather.precipitation > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">🌧️ Precipitation</span>
                    <span className="font-medium">{weatherCare.weather.precipitation} mm</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium text-gray-900 mb-2">📝 Forecast</h4>
                <p className="text-sm text-gray-700">{weatherCare.forecast}</p>
              </div>

              <div className="text-xs text-gray-500 mt-4">
                Last updated: {new Date(weatherCare.lastUpdated).toLocaleString()}
              </div>
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6"
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                🎯 Care Recommendations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {weatherCare.recommendations.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className={`p-4 rounded-xl border-2 ${getPriorityColor(rec.priority)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{rec.icon}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {rec.action}
                        </h3>
                        <p className="text-sm opacity-90 mb-2">
                          {rec.reason}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium uppercase tracking-wider">
                            {rec.type}
                          </span>
                          <span className="text-xs font-medium">
                            {rec.priority.toUpperCase()}
                          </span>
                        </div>
                        {rec.dueDate && (
                          <div className="text-xs mt-2 opacity-75">
                            Due: {new Date(rec.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {weatherCare.recommendations.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🌿</div>
                  <p className="text-gray-500">
                    Great weather conditions! No urgent care needed today.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <SeasonalTips />
        </motion.div>
      </div>
    </div>
  )
}

function SeasonalTips() {
  const [tips, setTips] = useState<any>(null)

  useEffect(() => {
    fetch('http://localhost:3001/api/weather-care/tips')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTips(data.data)
        }
      })
      .catch(console.error)
  }, [])

  if (!tips) return null

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">
        🍃 {tips.season} Care Tips
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tips.tips.map((tip: any, index: number) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2">{tip.icon}</div>
            <h3 className="font-semibold text-gray-900 mb-2">{tip.title}</h3>
            <p className="text-sm text-gray-600">{tip.description}</p>
            <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full ${
              tip.priority === 'high' ? 'bg-red-100 text-red-700' :
              tip.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }`}>
              {tip.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}