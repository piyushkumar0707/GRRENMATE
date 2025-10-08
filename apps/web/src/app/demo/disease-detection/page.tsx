'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface DiseaseResult {
  disease: string | null
  confidence: number
  severity: 'mild' | 'moderate' | 'severe' | null
  diagnosis: string
  symptoms: string[]
  treatment: string
  prevention: string[]
  isHealthy: boolean
}

interface AnalysisResult {
  imageUrl: string
  analysis: DiseaseResult
  timestamp: string
}

export default function DiseaseDetectionPage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [plantSpecies, setPlantSpecies] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setError(null)
      setResult(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeDisease = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedImage)
      if (plantSpecies) {
        formData.append('plantSpecies', plantSpecies)
      }

      const response = await fetch('http://localhost:3001/api/disease-detection/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      
      if (data.success) {
        setResult(data.data)
      } else {
        throw new Error(data.message || 'Analysis failed')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case 'mild': return 'text-yellow-600 bg-yellow-100'
      case 'moderate': return 'text-orange-600 bg-orange-100'
      case 'severe': return 'text-red-600 bg-red-100'
      default: return 'text-green-600 bg-green-100'
    }
  }

  const getHealthStatusIcon = (isHealthy: boolean, disease: string | null) => {
    if (isHealthy && !disease) return '🌿'
    if (disease) return '🚨'
    return '🔍'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🔬 Plant Disease Detection
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Upload a photo of your plant to get AI-powered health analysis, disease identification, 
            and treatment recommendations using advanced machine learning.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              📸 Upload Plant Image
            </h2>
            
            {/* Image Upload Area */}
            <div 
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-green-400 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Selected plant"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <p className="text-sm text-gray-600">
                    Click to select a different image
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-6xl">📷</div>
                  <div>
                    <p className="text-lg font-medium text-gray-700">
                      Click to upload plant image
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports JPG, PNG up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {/* Plant Species Input */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plant Species (Optional)
              </label>
              <input
                type="text"
                value={plantSpecies}
                onChange={(e) => setPlantSpecies(e.target.value)}
                placeholder="e.g., Monstera deliciosa, Pothos, etc."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Providing species helps improve analysis accuracy
              </p>
            </div>

            {/* Analyze Button */}
            <button
              onClick={analyzeDisease}
              disabled={!selectedImage || isAnalyzing}
              className="w-full mt-6 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all duration-200"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                '🔍 Analyze Plant Health'
              )}
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">❌ {error}</p>
              </div>
            )}
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6"
          >
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              🔬 Analysis Results
            </h2>
            
            {result ? (
              <div className="space-y-6">
                {/* Health Status */}
                <div className="flex items-center space-x-3">
                  <div className="text-4xl">
                    {getHealthStatusIcon(result.analysis.isHealthy, result.analysis.disease)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {result.analysis.isHealthy && !result.analysis.disease 
                        ? 'Plant Looks Healthy! 🌿' 
                        : result.analysis.disease || 'Health Issue Detected'}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <span className="font-medium text-green-600">
                        {result.analysis.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Severity */}
                {result.analysis.severity && (
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(result.analysis.severity)}`}>
                      Severity: {result.analysis.severity.charAt(0).toUpperCase() + result.analysis.severity.slice(1)}
                    </span>
                  </div>
                )}

                {/* Diagnosis */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">📋 Diagnosis</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {result.analysis.diagnosis}
                  </p>
                </div>

                {/* Symptoms */}
                {result.analysis.symptoms.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">⚠️ Observed Symptoms</h4>
                    <ul className="space-y-1">
                      {result.analysis.symptoms.map((symptom, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-red-500 mr-2">•</span>
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Treatment */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">💊 Treatment</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {result.analysis.treatment}
                  </p>
                </div>

                {/* Prevention */}
                {result.analysis.prevention.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">🛡️ Prevention</h4>
                    <ul className="space-y-1">
                      {result.analysis.prevention.map((tip, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-xs text-gray-500 pt-4 border-t">
                  Analysis completed at {new Date(result.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500">
                  Upload an image to start plant health analysis
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Common Diseases Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-12 bg-white rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            📚 Common Plant Diseases
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Powdery Mildew', icon: '🤍', severity: 'mild' },
              { name: 'Root Rot', icon: '🦠', severity: 'severe' },
              { name: 'Leaf Spot', icon: '🟤', severity: 'moderate' },
              { name: 'Aphids', icon: '🐛', severity: 'moderate' },
              { name: 'Spider Mites', icon: '🕷️', severity: 'mild' },
              { name: 'Scale Insects', icon: '🪲', severity: 'moderate' }
            ].map((disease, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{disease.icon}</span>
                  <div>
                    <h3 className="font-medium text-gray-900">{disease.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(disease.severity)}`}>
                      {disease.severity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}