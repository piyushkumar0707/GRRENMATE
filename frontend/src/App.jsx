import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import './index.css'

// Beautiful, comprehensive landing page
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 overflow-hidden relative">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '0s'}} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '2s'}} />
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse" style={{animationDelay: '4s'}} />
      </div>

      {/* Glassmorphism Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-white/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2 group">
              <div className="p-2 rounded-2xl bg-gradient-to-br from-green-500 to-green-600 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <span className="text-white text-xl">🌱</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                GreenMate
              </span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-600 hover:text-green-600 font-medium transition-colors duration-300 hover:scale-105">Home</a>
              <a href="/dashboard" className="text-gray-600 hover:text-green-600 font-medium transition-colors duration-300 hover:scale-105">Dashboard</a>
              <a href="/recognize" className="text-gray-600 hover:text-green-600 font-medium transition-colors duration-300 hover:scale-105">Recognize</a>
            </div>
            <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-2 rounded-2xl font-medium hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 hover:from-green-600 hover:to-green-700">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-8 animate-fade-in">
              <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/60 backdrop-blur-lg border border-white/20 text-green-700 mb-6 shadow-lg hover:scale-105 transition-transform duration-300">
                ✨ AI-Powered Plant Care
              </span>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up" style={{animationDelay: '0.2s'}}>
                <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">Your Smart</span>
                <br />
                <span className="text-gray-800">Plant Companion</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{animationDelay: '0.4s'}}>
                Transform your plant care journey with AI-powered recognition, 
                personalized care guides, and a vibrant community of plant lovers.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{animationDelay: '0.6s'}}>
              <button className="group bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-2xl font-medium text-lg shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 hover:from-green-600 hover:to-green-700">
                📷 Try Plant Recognition
                <span className="inline-block group-hover:translate-x-1 transition-transform duration-300 ml-2">→</span>
              </button>
              <button className="bg-white/80 backdrop-blur-lg text-green-600 px-8 py-4 rounded-2xl font-medium text-lg border-2 border-white/30 hover:bg-white hover:border-green-300 transform hover:-translate-y-2 transition-all duration-300 shadow-lg hover:shadow-xl">
                ▶️ Watch Demo
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto animate-slide-up" style={{animationDelay: '0.8s'}}>
              {[
                { number: '10K+', label: 'Plants Identified', color: 'text-green-600' },
                { number: '5K+', label: 'Happy Users', color: 'text-blue-600' },
                { number: '98%', label: 'Success Rate', color: 'text-purple-600' }
              ].map((stat, index) => (
                <div key={index} className="bg-white/30 backdrop-blur-lg border border-white/20 rounded-3xl p-6 text-center shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 hover:bg-white/40 group">
                  <div className={`text-3xl font-bold ${stat.color} mb-2 group-hover:scale-110 transition-transform duration-300`}>{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Floating Plant Image */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2 hidden lg:block animate-float">
          <div className="relative w-64 h-64">
            <div className="w-full h-full bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-3xl shadow-2xl opacity-80 transform rotate-3 hover:rotate-6 transition-transform duration-500">
              <div className="absolute inset-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-6xl">🌿</span>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce shadow-lg" />
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-pink-400 rounded-full animate-pulse shadow-lg" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/20 backdrop-blur-lg border-y border-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">Powerful Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to become a successful plant parent, powered by cutting-edge AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { emoji: '📷', title: 'AI Recognition', desc: 'Instantly identify any plant with our advanced AI technology', color: 'from-blue-400 to-blue-600' },
              { emoji: '❤️', title: 'Personalized Care', desc: 'Get customized care guides based on your location and expertise', color: 'from-red-400 to-red-600' },
              { emoji: '👥', title: 'Plant Community', desc: 'Connect with fellow plant enthusiasts and share your journey', color: 'from-purple-400 to-purple-600' },
              { emoji: '⚡', title: 'Smart Reminders', desc: 'Never forget to water or care for your plants again', color: 'from-yellow-400 to-yellow-600' }
            ].map((feature, index) => (
              <div key={index} className="bg-white/40 backdrop-blur-lg border border-white/20 rounded-3xl p-6 text-center shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 group hover:bg-white/60">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {feature.emoji}
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-green-600 transition-colors duration-300">{feature.title}</h3>
                <p className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by <span className="bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">Plant Parents</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of happy users who've transformed their plant care journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Johnson', role: 'Plant Enthusiast', content: 'GreenMate helped me turn my apartment into a thriving green oasis!', avatar: '👩‍🦰' },
              { name: 'Mike Chen', role: 'Beginner Gardener', content: 'Finally, an app that makes plant care simple and enjoyable.', avatar: '👨‍💻' },
              { name: 'Emma Rodriguez', role: 'Urban Gardener', content: 'The plant recognition is incredibly accurate. Love the community!', avatar: '👩‍🌾' }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white/40 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 group">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">⭐</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic group-hover:text-gray-700 transition-colors duration-300">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-2xl shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold group-hover:text-green-600 transition-colors duration-300">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-500 to-green-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-green-600/20"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Plant Journey?
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of plant lovers and transform your space into a green paradise.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-green-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl">
              Get Started Free →
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-green-600 transform hover:-translate-y-1 transition-all duration-300">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-2">
              🌱
            </div>
            <span className="text-2xl font-bold">GreenMate</span>
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

// Simple Dashboard Component
const Dashboard = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/40 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent mb-4">🌱 Dashboard</h1>
        <p className="text-gray-600 text-lg mb-6">Welcome to your beautiful plant dashboard!</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/60 rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">12</div>
            <div className="text-gray-600">Total Plants</div>
          </div>
          <div className="bg-white/60 rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">3</div>
            <div className="text-gray-600">Need Water</div>
          </div>
          <div className="bg-white/60 rounded-2xl p-6 text-center shadow-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
            <div className="text-gray-600">Health Rate</div>
          </div>
        </div>
        <a href="/" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 inline-block">
          ← Back to Home
        </a>
      </div>
    </div>
  </div>
)

// Simple Plant Recognition Component
const PlantRecognition = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-8">
    <div className="max-w-4xl mx-auto">
      <div className="bg-white/40 backdrop-blur-lg rounded-3xl p-8 shadow-xl border border-white/20">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent mb-4">📷 Plant Recognition</h1>
        <p className="text-gray-600 text-lg mb-8">Upload a photo to identify your plant using our AI technology!</p>
        
        <div className="bg-white/60 rounded-2xl p-12 text-center shadow-lg border-2 border-dashed border-green-300 hover:border-green-400 transition-colors duration-300 mb-8">
          <div className="text-6xl mb-4">📸</div>
          <h3 className="text-xl font-semibold mb-2">Drag & Drop or Click to Upload</h3>
          <p className="text-gray-600">Support for JPG, PNG, and WEBP formats</p>
          <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl font-medium mt-4 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
            Choose File
          </button>
        </div>
        
        <a href="/" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-2xl font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 inline-block">
          ← Back to Home
        </a>
      </div>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/recognize" element={<PlantRecognition />} />
      </Routes>
    </Router>
  )
}

export default App
