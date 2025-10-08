'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Upload, Leaf, Search, Bot, Sparkles } from 'lucide-react'

export default function RecognitionPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setResult(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    // Simulate API call
    setTimeout(() => {
      setResult({
        plantName: "Monstera Deliciosa",
        scientificName: "Monstera deliciosa",
        confidence: 95.8,
        family: "Araceae",
        commonNames: ["Swiss Cheese Plant", "Split-leaf Philodendron"],
        careInstructions: {
          light: "Bright, indirect light",
          water: "Water when top 2 inches of soil are dry",
          humidity: "High humidity preferred (60%+)",
          temperature: "65-80°F (18-27°C)"
        },
        characteristics: [
          "Large, glossy leaves with natural holes",
          "Fast-growing climbing plant",
          "Native to Central America",
          "Popular houseplant"
        ]
      })
      setIsAnalyzing(false)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-6 py-3 rounded-full text-sm font-semibold mb-6">
            <Bot className="h-5 w-5" />
            <span>AI-Powered Plant Recognition</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Identify Any Plant
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload a photo and let our advanced AI technology identify your plant with 95% accuracy, 
            plus get personalized care instructions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Camera className="h-6 w-6 text-emerald-600" />
                <span>Upload Plant Photo</span>
              </h2>

              {!selectedImage ? (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-12 text-center hover:border-emerald-400 transition-colors">
                    <Upload className="h-16 w-16 text-emerald-400 mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-gray-500">
                      JPG, PNG, or WEBP (max 10MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-6">
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Selected plant"
                      className="w-full h-64 object-cover rounded-2xl"
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null)
                        setResult(null)
                      }}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Analyzing Plant...</span>
                      </>
                    ) : (
                      <>
                        <Search className="h-6 w-6" />
                        <span>Identify Plant</span>
                        <Sparkles className="h-5 w-5" />
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Results Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white rounded-3xl p-8 shadow-xl h-full">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <Leaf className="h-6 w-6 text-emerald-600" />
                <span>Plant Information</span>
              </h2>

              {!result ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="h-12 w-12 text-emerald-400" />
                  </div>
                  <p className="text-gray-500 text-lg">
                    Upload a plant photo to get started with AI identification
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Plant Name & Confidence */}
                  <div className="bg-emerald-50 rounded-2xl p-6">
                    <h3 className="text-2xl font-bold text-emerald-800 mb-2">
                      {result.plantName}
                    </h3>
                    <p className="text-emerald-600 italic text-lg mb-3">
                      {result.scientificName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <div className="bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {result.confidence}% Confidence
                      </div>
                      <div className="bg-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {result.family}
                      </div>
                    </div>
                  </div>

                  {/* Common Names */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Common Names:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.commonNames.map((name: string, index: number) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Care Instructions */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Care Instructions:</h4>
                    <div className="space-y-2">
                      {Object.entries(result.careInstructions).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="capitalize font-medium text-emerald-600 w-20">
                            {key}:
                          </span>
                          <span className="text-gray-700">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Characteristics */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Key Characteristics:</h4>
                    <ul className="space-y-2">
                      {result.characteristics.map((char: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="text-emerald-500 mt-1">•</span>
                          <span className="text-gray-700">{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sample Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Try These Sample Photos
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                src: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=200&h=200&fit=crop",
                name: "Monstera"
              },
              {
                src: "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=200&h=200&fit=crop",
                name: "Snake Plant"
              },
              {
                src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=200&fit=crop",
                name: "Fiddle Leaf Fig"
              },
              {
                src: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=200&fit=crop",
                name: "Pothos"
              }
            ].map((sample, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedImage(sample.src)
                  setResult(null)
                }}
                className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-200 group"
              >
                <img
                  src={sample.src}
                  alt={sample.name}
                  className="w-full h-32 object-cover rounded-xl mb-3 group-hover:scale-105 transition-transform"
                />
                <p className="font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
                  {sample.name}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}