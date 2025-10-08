'use client'

import { PlantRecognition, PlantIdentificationResult } from '@greenmate/ui'
import Link from 'next/link'
import { ArrowLeft, Sparkles } from 'lucide-react'

// Mock identification function for demo
const mockIdentify = async (file: File): Promise<PlantIdentificationResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000))
  
  // Mock results based on common plants
  const mockResults = [
    {
      plantName: "Monstera Deliciosa",
      scientificName: "Monstera deliciosa",
      confidence: 0.94,
      commonNames: ["Swiss Cheese Plant", "Split-leaf Philodendron", "Ceriman"],
      description: "A stunning tropical houseplant known for its large, glossy leaves with distinctive holes and splits. Native to the rainforests of Central America, it's become one of the most popular houseplants for its dramatic foliage and relatively easy care.",
      careGuide: {
        watering: "Water when top 2 inches dry",
        light: "Bright, indirect sunlight",
        temperature: "65-85°F (18-29°C)",
        humidity: "40-60% humidity"
      }
    },
    {
      plantName: "Fiddle Leaf Fig",
      scientificName: "Ficus lyrata",
      confidence: 0.89,
      commonNames: ["Fiddle-leaf Fig", "Banjo Fig"],
      description: "A popular indoor tree with large, violin-shaped leaves. Originally from western Africa, it's prized for its architectural presence and dramatic foliage that can transform any space.",
      careGuide: {
        watering: "Weekly, deep watering",
        light: "Bright, filtered sunlight",
        temperature: "65-75°F (18-24°C)",
        humidity: "30-50% humidity"
      }
    },
    {
      plantName: "Snake Plant",
      scientificName: "Sansevieria trifasciata",
      confidence: 0.96,
      commonNames: ["Mother-in-law's Tongue", "Viper's Bowstring Hemp"],
      description: "A hardy succulent with tall, upright leaves that have green and yellow striping. Known for being nearly indestructible and excellent for beginners, it also purifies air by removing toxins.",
      careGuide: {
        watering: "Every 2-3 weeks",
        light: "Low to bright, indirect light",
        temperature: "60-80°F (15-27°C)",
        humidity: "Low humidity preferred"
      }
    },
    {
      plantName: "Pothos",
      scientificName: "Epipremnum aureum",
      confidence: 0.91,
      commonNames: ["Golden Pothos", "Devil's Ivy", "Money Plant"],
      description: "A fast-growing, trailing vine with heart-shaped leaves that can be variegated with yellow, white, or green patterns. It's incredibly adaptable and perfect for hanging baskets or climbing moss poles.",
      careGuide: {
        watering: "When top inch is dry",
        light: "Low to medium, indirect light",
        temperature: "65-75°F (18-24°C)",
        humidity: "Any humidity level"
      }
    }
  ]
  
  // Return a random result
  return mockResults[Math.floor(Math.random() * mockResults.length)]
}

export default function RecognitionDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Navigation */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center space-x-2 text-foreground hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-primary-600" />
            <span className="text-lg font-heading font-semibold">Plant Recognition Demo</span>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Plant Identification</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold font-heading gradient-text mb-4">
            Identify Any Plant Instantly
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Upload a photo or take a picture with your camera. Our advanced AI will identify your plant 
            and provide detailed care instructions in seconds.
          </p>
        </div>

        {/* Recognition Component */}
        <PlantRecognition onIdentify={mockIdentify} />
      </section>

      {/* Features */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-500 text-white flex items-center justify-center">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload or Capture</h3>
              <p className="text-muted-foreground text-sm">
                Drag & drop an image, browse your files, or take a photo with your camera
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 text-white flex items-center justify-center">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Our advanced machine learning model analyzes the image with 95% accuracy
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-green-500 text-white flex items-center justify-center">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Get Results</h3>
              <p className="text-muted-foreground text-sm">
                Receive plant identification, care guide, and expert recommendations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Tips for Best Results</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/50 p-6 rounded-xl border border-white/20">
              <h3 className="font-semibold mb-3">📸 Photography Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Take photos in good lighting conditions</li>
                <li>• Focus on the leaves and overall plant structure</li>
                <li>• Avoid blurry or heavily filtered images</li>
                <li>• Include flowers or fruits if present</li>
              </ul>
            </div>
            
            <div className="bg-white/50 p-6 rounded-xl border border-white/20">
              <h3 className="font-semibold mb-3">🎯 Accuracy Tips</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Capture the whole plant when possible</li>
                <li>• Show distinctive features like leaf patterns</li>
                <li>• Take multiple angles if unsure</li>
                <li>• Ensure the plant takes up most of the frame</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}