import * as React from "react"
import { useCallback, useState, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "../lib/utils"
import { Button } from "./button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card"
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  X, 
  Loader2, 
  Sparkles, 
  Leaf,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Download
} from "lucide-react"

export interface PlantRecognitionProps {
  onIdentify?: (file: File) => Promise<PlantIdentificationResult>
  className?: string
}

export interface PlantIdentificationResult {
  plantName: string
  scientificName: string
  confidence: number
  commonNames: string[]
  description: string
  careGuide: {
    watering: string
    light: string
    temperature: string
    humidity: string
  }
  image?: string
}

const PlantRecognition = React.forwardRef<HTMLDivElement, PlantRecognitionProps>(
  ({ onIdentify, className }, ref) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [isIdentifying, setIsIdentifying] = useState(false)
    const [result, setResult] = useState<PlantIdentificationResult | null>(null)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [showCamera, setShowCamera] = useState(false)
    const [stream, setStream] = useState<MediaStream | null>(null)

    const onDrop = useCallback((acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (file) {
        setSelectedFile(file)
        setError(null)
        setResult(null)
        
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: {
        'image/*': ['.jpeg', '.jpg', '.png', '.webp']
      },
      maxFiles: 1,
      multiple: false
    })

    const handleCameraCapture = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          } 
        })
        setStream(mediaStream)
        setShowCamera(true)
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream
        }
      } catch (err) {
        setError('Camera access denied or not available')
      }
    }

    const capturePhoto = () => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current
        const video = videoRef.current
        const context = canvas.getContext('2d')
        
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        
        if (context) {
          context.drawImage(video, 0, 0)
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
              setSelectedFile(file)
              setPreview(canvas.toDataURL())
              closeCamera()
            }
          }, 'image/jpeg', 0.8)
        }
      }
    }

    const closeCamera = () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setStream(null)
      }
      setShowCamera(false)
    }

    const handleIdentify = async () => {
      if (!selectedFile || !onIdentify) return

      setIsIdentifying(true)
      setError(null)

      try {
        const identificationResult = await onIdentify(selectedFile)
        setResult(identificationResult)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to identify plant')
      } finally {
        setIsIdentifying(false)
      }
    }

    const handleReset = () => {
      setSelectedFile(null)
      setPreview(null)
      setResult(null)
      setError(null)
      closeCamera()
    }

    const handleFileSelect = () => {
      fileInputRef.current?.click()
    }

    const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        onDrop([file])
      }
    }

    return (
      <div ref={ref} className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                <Button
                  variant="glass"
                  size="lg"
                  onClick={capturePhoto}
                  className="bg-white/20 hover:bg-white/30"
                >
                  <Camera className="h-6 w-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={closeCamera}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {!result ? (
          <Card variant="soft" className="overflow-hidden">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-white flex items-center justify-center">
                <Sparkles className="h-8 w-8" />
              </div>
              <CardTitle className="text-2xl font-heading">Plant Recognition</CardTitle>
              <CardDescription>
                Upload an image or take a photo to identify your plant instantly
              </CardDescription>
            </CardHeader>

            <CardContent>
              {!preview ? (
                // Upload Zone
                <div
                  {...getRootProps()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
                    isDragActive 
                      ? "border-primary-400 bg-primary-50 scale-105" 
                      : "border-gray-300 hover:border-primary-300 hover:bg-primary-50/50"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                        <Upload className="h-10 w-10 text-primary-600" />
                      </div>
                    </div>
                    
                    {isDragActive ? (
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-primary-700">Drop your image here!</p>
                        <p className="text-primary-600">We'll identify your plant in seconds</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-gray-700">
                          Drag & drop your plant image here
                        </p>
                        <p className="text-gray-500">or choose from options below</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Image Preview
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden bg-gray-50">
                    <img
                      src={preview}
                      alt="Plant preview"
                      className="w-full h-64 object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={handleReset}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                
                <Button
                  variant="outline"
                  onClick={handleFileSelect}
                  leftIcon={<ImageIcon className="h-5 w-5" />}
                  className="h-12"
                >
                  Browse Files
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCameraCapture}
                  leftIcon={<Camera className="h-5 w-5" />}
                  className="h-12"
                >
                  Take Photo
                </Button>
                
                <Button
                  variant="gradient"
                  onClick={handleIdentify}
                  disabled={!selectedFile || isIdentifying}
                  loading={isIdentifying}
                  leftIcon={!isIdentifying ? <Sparkles className="h-5 w-5" /> : undefined}
                  className="h-12"
                >
                  {isIdentifying ? 'Identifying...' : 'Identify Plant'}
                </Button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          // Results Display
          <Card variant="gradient" className="overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500 text-white flex items-center justify-center">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Plant Identified!</CardTitle>
                    <CardDescription className="text-green-700">
                      {Math.round(result.confidence * 100)}% confidence
                    </CardDescription>
                  </div>
                </div>
                <Button variant="ghost" onClick={handleReset}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Another
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Plant Image */}
                <div className="space-y-4">
                  <img
                    src={preview!}
                    alt="Identified plant"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                {/* Plant Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {result.plantName}
                    </h3>
                    <p className="text-gray-600 italic mb-2">{result.scientificName}</p>
                    {result.commonNames.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {result.commonNames.slice(0, 3).map((name, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {result.description}
                    </p>
                  </div>

                  {/* Care Guide Preview */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Quick Care Guide</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white/70 rounded-lg">
                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Watering</p>
                        <p className="text-sm font-medium">{result.careGuide.watering}</p>
                      </div>
                      <div className="p-3 bg-white/70 rounded-lg">
                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Light</p>
                        <p className="text-sm font-medium">{result.careGuide.light}</p>
                      </div>
                      <div className="p-3 bg-white/70 rounded-lg">
                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Temperature</p>
                        <p className="text-sm font-medium">{result.careGuide.temperature}</p>
                      </div>
                      <div className="p-3 bg-white/70 rounded-lg">
                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Humidity</p>
                        <p className="text-sm font-medium">{result.careGuide.humidity}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="plant" className="flex-1">
                      <Leaf className="h-4 w-4 mr-2" />
                      View Full Care Guide
                    </Button>
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }
)

PlantRecognition.displayName = "PlantRecognition"

export { PlantRecognition }