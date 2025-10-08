'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Camera, Leaf, Users, Sparkles, Brain, Heart, Globe, Zap, ArrowRight, Play, Star, 
  CheckCircle, ShoppingBag, Microscope, Cloud, Bell, MessageCircle, Search, Bot,
  Smartphone, TreePine, Droplets, Sun, Wind, MapPin, TrendingUp, Award, Shield
} from 'lucide-react'

const features = [
  {
    icon: <Search className="h-8 w-8" />,
    title: "AI Plant Recognition",
    description: "Upload images to identify plants instantly with 95% accuracy using advanced AI technology.",
    gradient: "from-emerald-500 to-green-600",
    link: "/demo/recognition",
    delay: 0.1
  },
  {
    icon: <Microscope className="h-8 w-8" />,
    title: "Disease Detection",
    description: "AI-powered analysis to identify plant diseases and get instant treatment recommendations.",
    gradient: "from-red-500 to-pink-600", 
    link: "/demo/disease-detection",
    delay: 0.2
  },
  {
    icon: <Cloud className="h-8 w-8" />,
    title: "Weather-Based Care",
    description: "Get personalized care recommendations based on real-time weather conditions.",
    gradient: "from-blue-500 to-cyan-600",
    link: "/demo/weather-care", 
    delay: 0.3
  },
  {
    icon: <MessageCircle className="h-8 w-8" />,
    title: "Plant Community",
    description: "Connect with fellow gardeners, share experiences, and get expert advice.",
    gradient: "from-purple-500 to-indigo-600",
    link: "/demo/community",
    delay: 0.4
  },
  {
    icon: <ShoppingBag className="h-8 w-8" />,
    title: "Plant Marketplace", 
    description: "Buy and sell plants, seeds, tools, and accessories with local gardeners.",
    gradient: "from-orange-500 to-amber-600",
    link: "/demo/marketplace",
    delay: 0.5
  },
  {
    icon: <Bell className="h-8 w-8" />,
    title: "Smart Notifications",
    description: "Weather-aware reminders and alerts to keep your plants healthy and thriving.",
    gradient: "from-teal-500 to-emerald-600", 
    link: "/demo/notifications",
    delay: 0.6
  }
]

const stats = [
  { icon: <Users className="h-8 w-8" />, number: "50K+", label: "Happy Users", color: "text-blue-600" },
  { icon: <TreePine className="h-8 w-8" />, number: "10K+", label: "Plants Identified", color: "text-green-600" },
  { icon: <Award className="h-8 w-8" />, number: "95%", label: "Accuracy Rate", color: "text-purple-600" },
  { icon: <TrendingUp className="h-8 w-8" />, number: "99%", label: "Success Rate", color: "text-orange-600" }
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Urban Gardener", 
    content: "GreenMate's AI identified my dying plant and provided the exact care it needed. Now it's thriving!",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b714?w=64&h=64&fit=crop&crop=face",
    rating: 5,
    plants: 15
  },
  {
    name: "Mike Rodriguez",
    role: "Plant Enthusiast",
    content: "The disease detection saved my entire garden collection. Incredible AI technology!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&crop=face", 
    rating: 5,
    plants: 32
  },
  {
    name: "Emma Thompson",
    role: "Beginner Gardener",
    content: "As a complete beginner, the community and care guides have been absolutely invaluable.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&h=64&fit=crop&crop=face",
    rating: 5, 
    plants: 8
  }
]

export default function HomePage() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50">
      {/* Enhanced Navigation */}
      <motion.header 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-emerald-100 shadow-lg"
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Leaf className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              GreenMate
            </span>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-8">
            {[
              { href: "/demo/disease-detection", label: "Disease Detection", icon: <Microscope className="h-4 w-4" /> },
              { href: "/demo/weather-care", label: "Weather Care", icon: <Cloud className="h-4 w-4" /> },
              { href: "/demo/community", label: "Community", icon: <MessageCircle className="h-4 w-4" /> },
              { href: "/demo/marketplace", label: "Marketplace", icon: <ShoppingBag className="h-4 w-4" /> },
              { href: "/demo/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> }
            ].map((item, index) => (
              <motion.div key={item.href} whileHover={{ scale: 1.05 }}>
                <Link 
                  href={item.href} 
                  className="flex items-center space-x-2 text-gray-700 hover:text-emerald-600 transition-all duration-200 font-medium group"
                >
                  <span className="group-hover:text-emerald-500 transition-colors">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            ))}
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link 
                href="/demo/dashboard"
                className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <Play className="h-4 w-4" />
                <span>Try Demo</span>
              </Link>
            </motion.div>
          </div>
        </nav>
      </motion.header>

      {/* Enhanced Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-md"
            >
              <Sparkles className="h-5 w-5" />
              <span>AI-Powered Plant Care Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 bg-clip-text text-transparent">
                Your Smart Plant
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                Companion
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed"
            >
              Transform your gardening with AI-powered plant recognition, disease detection, 
              weather-based care recommendations, and a thriving community of plant enthusiasts.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/demo/recognition"
                  className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3"
                >
                  <Camera className="h-6 w-6" />
                  <span>Try Plant Recognition</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/demo/dashboard"
                  className="bg-white text-emerald-600 px-8 py-4 rounded-full font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-3 border-2 border-emerald-200 hover:border-emerald-300"
                >
                  <Play className="h-6 w-6" />
                  <span>View Dashboard</span>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-16 bg-white/80 backdrop-blur-sm"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${stat.color.replace('text-', 'from-').replace('-600', '-100')} to-white flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Enhanced Features Section */}
      <section className="py-24 bg-gradient-to-b from-white to-emerald-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-700 px-6 py-3 rounded-full text-sm font-semibold mb-8">
              <Bot className="h-5 w-5" />
              <span>Powerful AI Features</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Everything You Need
              </span>
              <br />
              <span className="text-gray-800">for Plant Care</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From cutting-edge AI identification to community-driven expertise, 
              discover tools that transform how you care for your plants.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: feature.delay }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="group"
              >
                <Link href={feature.link}>
                  <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-emerald-200 h-full transform hover:-translate-y-2">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ${hoveredFeature === index ? 'scale-110 rotate-3' : ''}`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center group-hover:text-emerald-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-center leading-relaxed mb-6">
                      {feature.description}
                    </p>
                    <div className="flex items-center justify-center text-emerald-600 font-semibold group-hover:text-emerald-700 transition-colors">
                      <span>Try Now</span>
                      <ArrowRight className={`h-5 w-5 ml-2 transition-transform duration-300 ${hoveredFeature === index ? 'translate-x-2' : ''}`} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials Section */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 to-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <div className="inline-flex items-center space-x-2 bg-white/80 text-emerald-700 px-6 py-3 rounded-full text-sm font-semibold mb-8 shadow-lg">
              <Heart className="h-5 w-5" />
              <span>Loved by Plant Enthusiasts</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Join thousands of happy gardeners worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how GreenMate is transforming plant care experiences across the globe
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 50, rotate: -5 }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ y: -10, rotate: 1 }}
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/50"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full mr-4 border-4 border-emerald-100"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-emerald-600 font-medium">{testimonial.role}</p>
                    <p className="text-sm text-gray-500">{testimonial.plants} plants</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-24 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white relative overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.3, 0],
                scale: [0, 1, 0],
                x: [0, Math.random() * 200 - 100],
                y: [0, Math.random() * 200 - 100]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                delay: Math.random() * 5
              }}
              className="absolute w-2 h-2 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-20 h-20 mx-auto mb-8 bg-white/20 rounded-full flex items-center justify-center"
          >
            <Leaf className="h-10 w-10 text-white" />
          </motion.div>
          
          <h2 className="text-4xl md:text-6xl font-bold mb-6">
            Start Your Plant Journey Today
          </h2>
          <p className="text-xl md:text-2xl text-emerald-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Join the AI revolution in plant care. Discover, nurture, and connect 
            with plants like never before.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/demo/recognition"
                className="bg-white text-emerald-600 px-10 py-5 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center space-x-3 hover:bg-emerald-50"
              >
                <Camera className="h-6 w-6" />
                <span>Try Plant Recognition</span>
                <Sparkles className="h-5 w-5" />
              </Link>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/demo/dashboard"
                className="bg-transparent border-2 border-white text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-emerald-600 transition-all duration-300 flex items-center space-x-3"
              >
                <Play className="h-6 w-6" />
                <span>Explore Dashboard</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced Footer */}
      <footer className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center space-x-3 mb-8 md:mb-0"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Leaf className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-bold">GreenMate</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 text-gray-400"
            >
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span>&copy; 2025 GreenMate</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-400" />
                <span>Made with love for plant enthusiasts</span>
              </div>
            </motion.div>
          </div>
        </div>
      </footer>
    </main>
  )
}