'use client'

import { useState } from 'react'
import { Hero, Card, CardHeader, CardTitle, CardDescription, CardContent, Button, PlantCard } from '@greenmate/ui'
import { Camera, Leaf, Users, Sparkles, Brain, Heart, Globe, Zap, ArrowRight, Play, Star, CheckCircle, ShoppingBag } from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: <Camera className="h-8 w-8" />,
    title: "Plant Recognition",
    description: "Upload images or enter names to identify plants instantly with 95% accuracy using advanced AI.",
    gradient: "from-green-400 to-emerald-500"
  },
  {
    icon: <Leaf className="h-8 w-8" />,
    title: "Personalized Care Guides",
    description: "Get tailored care instructions based on plant species, your location, and local climate conditions.",
    gradient: "from-blue-400 to-cyan-500"
  },
  {
    icon: <Brain className="h-8 w-8" />,
    title: "Disease Detection",
    description: "AI-powered leaf analysis to identify plant diseases and get treatment recommendations.",
    gradient: "from-purple-400 to-pink-500"
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Location-Aware Suggestions",
    description: "Climate-based plant recommendations perfect for your region and growing conditions.",
    gradient: "from-orange-400 to-red-500"
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Plant Community",
    description: "Share experiences, get expert advice, and connect with fellow plant enthusiasts worldwide.",
    gradient: "from-indigo-400 to-purple-500"
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Smart Reminders",
    description: "Weather-aware watering and care notifications that adapt to your plant's needs.",
    gradient: "from-yellow-400 to-orange-500"
  },
  {
    icon: <ShoppingBag className="h-8 w-8" />,
    title: "Plant Marketplace",
    description: "Buy and sell plants, seeds, tools, and accessories with local gardeners and enthusiasts.",
    gradient: "from-emerald-400 to-teal-500"
  }
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Urban Gardener",
    content: "GreenMate helped me identify a mysterious plant that was dying. Now it's thriving!",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b714?w=64&h=64&fit=crop&crop=face",
    rating: 5
  },
  {
    name: "Mike Rodriguez",
    role: "Plant Enthusiast",
    content: "The AI recognition is incredibly accurate. I've identified over 50 plants in my neighborhood.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face",
    rating: 5
  },
  {
    name: "Emma Thompson",
    role: "Beginner Gardener",
    content: "As a complete beginner, the personalized care guides have been a lifesaver for my plants.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    rating: 5
  }
]

const samplePlants = [
  {
    plantName: "Monstera Deliciosa",
    plantType: "Tropical",
    health: 92,
    lastWatered: new Date('2024-01-05'),
    image: "https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&h=300&fit=crop"
  },
  {
    plantName: "Snake Plant",
    plantType: "Succulent",
    health: 87,
    lastWatered: new Date('2024-01-02'),
    image: "https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400&h=300&fit=crop"
  },
  {
    plantName: "Fiddle Leaf Fig",
    plantType: "Tropical",
    health: 73,
    lastWatered: new Date('2024-01-04'),
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
  }
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('recognition')

  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-heading font-bold text-foreground">
              GreenMate
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/demo/disease-detection" className="text-foreground hover:text-primary-600 transition-colors">
              Disease Detection
            </Link>
            <Link href="/demo/weather-care" className="text-foreground hover:text-primary-600 transition-colors">
              Weather Care
            </Link>
            <Link href="/demo/community" className="text-foreground hover:text-primary-600 transition-colors">
              Community
            </Link>
            <Link href="/demo/marketplace" className="text-foreground hover:text-primary-600 transition-colors">
              Marketplace
            </Link>
            <Link href="/demo/notifications" className="text-foreground hover:text-primary-600 transition-colors">
              Notifications
            </Link>
            <Button variant="gradient" asChild>
              <Link href="/demo/dashboard">Try Demo</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <Hero
        title="Your Smart Plant Companion"
        subtitle="🌱 GreenMate"
        description="AI-powered plant recognition, personalized care guides, and community platform for plant enthusiasts"
        primaryCta={{
          text: "Try Plant Recognition",
          onClick: () => window.location.href = '/demo/recognition'
        }}
        secondaryCta={{
          text: "View Dashboard Demo",
          onClick: () => window.location.href = '/demo/dashboard'
        }}
        animated
      />

      {/* Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4 animate-fade-in-up">
              <Sparkles className="h-4 w-4" />
              <span>Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold font-heading gradient-text mb-4 animate-fade-in-up">
              Everything You Need for Plant Care
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up">
              From AI-powered identification to personalized care guides, GreenMate has everything you need to keep your plants healthy and thriving.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card variant="soft" hover="lift" className="h-full group cursor-pointer">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-heading">{feature.title}</CardTitle>
                    <CardDescription className="text-center">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plant Collection Preview */}
      <section className="py-24 bg-gradient-to-b from-primary-50/30 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading gradient-text mb-4 animate-fade-in-up">
              Track Your Plant Collection
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto animate-fade-in-up">
              Monitor your plants' health, track watering schedules, and get personalized care recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {samplePlants.map((plant, index) => (
              <div
                key={plant.plantName}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <PlantCard
                  {...plant}
                  onWater={() => console.log(`Water ${plant.plantName}`)}
                  onViewDetails={() => console.log(`View ${plant.plantName}`)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-heading gradient-text mb-4 animate-fade-in-up">
              Loved by Plant Enthusiasts
            </h2>
            <p className="text-xl text-muted-foreground animate-fade-in-up">
              Join thousands of happy plant parents worldwide
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Card variant="glass" className="p-6 backdrop-blur-md">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                  <p className="text-foreground mb-4">"{testimonial.content}"</p>
                  <div className="flex space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-500 to-primary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 plant-pattern opacity-10" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 animate-fade-in-up">
            Start Your Plant Journey Today
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto animate-fade-in-up">
            Join thousands of plant enthusiasts who trust GreenMate to keep their plants healthy and thriving.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up">
            <Button
              variant="secondary"
              size="xl"
              className="bg-white text-primary-600 hover:bg-primary-50 shadow-xl"
              rightIcon={<Camera className="h-5 w-5" />}
              onClick={() => window.location.href = '/demo/recognition'}
            >
              Try Plant Recognition
            </Button>
            <Button
              variant="glass"
              size="xl"
              className="border-white/30 hover:bg-white/20"
              rightIcon={<Play className="h-5 w-5" />}
              onClick={() => window.location.href = '/demo/dashboard'}
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Leaf className="h-6 w-6 text-primary-600" />
              <span className="text-xl font-heading font-bold text-foreground">GreenMate</span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>&copy; 2025 GreenMate</span>
              <span>Made with 💚 for plant lovers</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}

