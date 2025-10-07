import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Camera, 
  Leaf, 
  Heart, 
  Users, 
  Smartphone, 
  Zap, 
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Sparkles
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'

const LandingPage = () => {
  const [currentFeature, setCurrentFeature] = useState(0)
  
  const features = [
    {
      icon: <Camera className="w-8 h-8" />,
      title: "AI Plant Recognition",
      description: "Instantly identify any plant with our advanced AI technology"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Personalized Care",
      description: "Get customized care guides based on your location and expertise"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Plant Community",
      description: "Connect with fellow plant enthusiasts and share your journey"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Smart Reminders",
      description: "Never forget to water or care for your plants again"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Plant Enthusiast",
      image: "https://images.unsplash.com/photo-1494790108755-2616c6106900?w=80&h=80&fit=crop&crop=face",
      content: "GreenMate helped me turn my apartment into a thriving green oasis!"
    },
    {
      name: "Mike Chen",
      role: "Beginner Gardener", 
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
      content: "Finally, an app that makes plant care simple and enjoyable."
    },
    {
      name: "Emma Rodriguez",
      role: "Urban Gardener",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face", 
      content: "The plant recognition is incredibly accurate. Love the community features!"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden">
      <Navbar />
      
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '4s' }} />
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8"
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/60 backdrop-blur-lg border border-white/20 text-primary-700 mb-4">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Plant Care
              </span>
              
              <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
                <span className="gradient-text">Your Smart</span>
                <br />
                <span className="text-gray-800">Plant Companion</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transform your plant care journey with AI-powered recognition, 
                personalized care guides, and a vibrant community of plant lovers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <Link 
                to="/recognize"
                className="group btn-primary text-lg px-8 py-4 inline-flex items-center justify-center"
              >
                <Camera className="w-6 h-6 mr-3" />
                Try Plant Recognition
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <button className="btn-secondary text-lg px-8 py-4 inline-flex items-center justify-center">
                <Play className="w-6 h-6 mr-3" />
                Watch Demo
              </button>
            </motion.div>

            {/* Hero Stats */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
            >
              {[
                { number: '10K+', label: 'Plants Identified' },
                { number: '5K+', label: 'Happy Users' },
                { number: '98%', label: 'Success Rate' }
              ].map((stat, index) => (
                <div key={index} className="glass-card p-6 text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Floating Plant Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="absolute right-8 top-1/2 transform -translate-y-1/2 hidden lg:block"
        >
          <div className="relative w-64 h-64">
            <img
              src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&h=300&fit=crop"
              alt="Beautiful plant"
              className="w-full h-full object-cover rounded-3xl shadow-2xl float-element"
            />
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-pulse" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-400 rounded-full animate-pulse" />
          </div>
        </motion.div>
      </section>

      {/* Interactive Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/20 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              <span className="gradient-text">Powerful Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to become a successful plant parent, powered by cutting-edge AI.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Feature Cards */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`cursor-pointer transition-all duration-300 ${
                    currentFeature === index ? 'scale-105' : 'hover:scale-102'
                  }`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div className={`glass-card p-6 ${
                    currentFeature === index 
                      ? 'ring-2 ring-primary-400 bg-white/60' 
                      : 'hover:bg-white/40'
                  }`}>
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-2xl ${
                        currentFeature === index 
                          ? 'bg-primary-100 text-primary-600' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Showcase */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass-card p-8 text-center">
                <div className="w-24 h-24 mx-auto mb-6 p-6 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl text-white">
                  {features[currentFeature].icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{features[currentFeature].title}</h3>
                <p className="text-gray-600 mb-6">{features[currentFeature].description}</p>
                <button className="btn-primary">
                  Try Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-yellow-400 rounded-full animate-bounce opacity-80" />
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-green-400 rounded-full animate-pulse" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Loved by <span className="gradient-text">Plant Parents</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of happy users who've transformed their plant care journey.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="glass-card p-6 hover:scale-105 transition-transform duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Ready to Start Your Plant Journey?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of plant lovers and transform your space into a green paradise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/dashboard"
                className="bg-white text-primary-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <button className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-primary-600 transform hover:-translate-y-1 transition-all duration-300">
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <Leaf className="w-8 h-8 text-primary-400 mr-2" />
            <span className="text-2xl font-display font-bold">GreenMate</span>
          </div>
          <p className="text-gray-400 mb-6">
            Your smart companion for a greener tomorrow.
          </p>
          <div className="border-t border-gray-800 pt-6">
            <p className="text-sm text-gray-500">
              © 2025 GreenMate. Made with 💚 for plant lovers everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage