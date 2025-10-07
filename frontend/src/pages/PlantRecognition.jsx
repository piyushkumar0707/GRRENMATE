import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Camera, Upload, Sparkles, Loader, CheckCircle, ArrowRight } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

const PlantRecognition = () => {
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [result, setResult] = useState(null)
  const [uploadedImage, setUploadedImage] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImage(reader.result)
        identifyPlant(file)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  })

  const identifyPlant = async (file) => {
    setIsIdentifying(true)
    setResult(null)
    
    // Simulate API call
    setTimeout(() => {
      setResult({
        name: 'Monstera Deliciosa',
        commonName: 'Swiss Cheese Plant',
        confidence: 94,
        family: 'Araceae',
        description: 'A popular houseplant known for its large, glossy, heart-shaped leaves with natural holes.',
        care: {
          light: 'Bright, indirect light',
          water: 'Weekly or when top inch of soil is dry',
          humidity: '60-70%',
          temperature: '65-80°F (18-27°C)'
        }
      })
      setIsIdentifying(false)
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/60 backdrop-blur-lg border border-white/20 text-primary-700 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Recognition
            </span>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Identify Your <span className="gradient-text">Plant</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Upload a photo of your plant and get instant identification with detailed care instructions.
            </p>
          </motion.div>

          {/* Upload Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div
              {...getRootProps()}
              className={`glass-card p-12 text-center cursor-pointer transition-all duration-300 ${
                isDragActive ? 'ring-4 ring-primary-200 bg-primary-50/50' : 'hover:bg-white/60'
              }`}
            >
              <input {...getInputProps()} />
              
              {!uploadedImage ? (
                <div className="space-y-6">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center">
                    <Camera className="w-12 h-12 text-white" />
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-semibold mb-2">
                      {isDragActive ? 'Drop your plant photo here' : 'Upload plant photo'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Drag and drop or click to select an image
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <button className="btn-primary inline-flex items-center">
                        <Upload className="w-5 h-5 mr-2" />
                        Choose File
                      </button>
                      <button className="btn-secondary inline-flex items-center">
                        <Camera className="w-5 h-5 mr-2" />
                        Take Photo
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="relative w-64 h-64 mx-auto rounded-3xl overflow-hidden shadow-xl">
                    <img
                      src={uploadedImage}
                      alt="Uploaded plant"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {!isIdentifying && !result && (
                    <div>
                      <p className="text-gray-600 mb-4">Great photo! Click identify to analyze your plant.</p>
                      <button 
                        onClick={() => identifyPlant()}
                        className="btn-primary inline-flex items-center"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Identify Plant
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Loading State */}
          {isIdentifying && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center mb-12"
            >
              <div className="relative w-16 h-16 mx-auto mb-6">
                <div className="pulse-ring"></div>
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center">
                  <Loader className="w-8 h-8 text-white animate-spin" />
                </div>
              </div>
              <h3 className="text-xl font-semibold mb-2">Analyzing your plant...</h3>
              <p className="text-gray-600">Our AI is examining the image and identifying the species.</p>
            </motion.div>
          )}

          {/* Results */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              {/* Identification Result */}
              <div className="glass-card p-8">
                <div className="flex items-center mb-6">
                  <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Plant Identified!</h3>
                    <p className="text-gray-600">Confidence: {result.confidence}%</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-semibold text-primary-600 mb-2">Scientific Name</h4>
                      <p className="text-2xl font-bold italic text-gray-900">{result.name}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-primary-600 mb-2">Common Name</h4>
                      <p className="text-xl text-gray-700">{result.commonName}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-semibold text-primary-600 mb-2">Family</h4>
                      <p className="text-lg text-gray-700">{result.family}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-primary-600 mb-3">Description</h4>
                    <p className="text-gray-700 leading-relaxed">{result.description}</p>
                  </div>
                </div>
              </div>

              {/* Care Instructions */}
              <div className="glass-card p-8">
                <h3 className="text-2xl font-bold mb-6">Care Instructions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(result.care).map(([key, value]) => (
                    <div key={key} className="bg-white/60 rounded-2xl p-4">
                      <div className="flex items-center mb-2">
                        <div className="w-3 h-3 bg-primary-500 rounded-full mr-3"></div>
                        <h4 className="font-semibold text-gray-900 capitalize">{key}</h4>
                      </div>
                      <p className="text-gray-700 ml-6">{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="btn-primary inline-flex items-center">
                  Add to My Plants
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
                <button className="btn-secondary">
                  Try Another Photo
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PlantRecognition