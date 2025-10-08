import { motion } from 'framer-motion'
import { Leaf, Camera, Plus, Heart, Water, Sun } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

const Dashboard = () => {
  const plants = [
    {
      id: 1,
      name: 'Monstera Deliciosa',
      nickname: 'Monty',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
      health: 85,
      lastWatered: '2 days ago',
      nextWater: 'Tomorrow'
    },
    {
      id: 2,
      name: 'Fiddle Leaf Fig',
      nickname: 'Figgy',
      image: 'https://images.unsplash.com/photo-1509423350716-97f2360af0e4?w=400&h=400&fit=crop',
      health: 92,
      lastWatered: '1 day ago',
      nextWater: 'In 3 days'
    },
    {
      id: 3,
      name: 'Snake Plant',
      nickname: 'Sammy',
      image: 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400&h=400&fit=crop',
      health: 78,
      lastWatered: '5 days ago',
      nextWater: 'Next week'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Welcome back, <span className="gradient-text">Plant Parent!</span>
            </h1>
            <p className="text-xl text-gray-600">
              Your green friends are thriving. Here's what needs your attention today.
            </p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
          >
            {[
              { label: 'Total Plants', value: '12', icon: Leaf, color: 'text-green-600' },
              { label: 'Identified Today', value: '3', icon: Camera, color: 'text-blue-600' },
              { label: 'Need Water', value: '2', icon: Water, color: 'text-blue-500' },
              { label: 'Healthy Plants', value: '10', icon: Heart, color: 'text-red-500' }
            ].map((stat, index) => (
              <div key={index} className="glass-card p-6 text-center hover:scale-105 transition-transform duration-300">
                <div className={`w-12 h-12 mx-auto mb-4 p-3 rounded-2xl bg-gray-100 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Plants Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-display font-bold">Your Plants</h2>
              <button className="btn-primary inline-flex items-center">
                <Plus className="w-5 h-5 mr-2" />
                Add Plant
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {plants.map((plant, index) => (
                <motion.div
                  key={plant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                  className="plant-card"
                >
                  <div className="plant-card-image">
                    <img
                      src={plant.image}
                      alt={plant.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold">{plant.nickname}</h3>
                      <div className="flex items-center space-x-1">
                        <div className={`w-3 h-3 rounded-full ${
                          plant.health >= 80 ? 'bg-green-400' : 
                          plant.health >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                        }`} />
                        <span className="text-sm text-gray-500">{plant.health}%</span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{plant.name}</p>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last watered:</span>
                        <span className="text-gray-700">{plant.lastWatered}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Next water:</span>
                        <span className="text-primary-600 font-medium">{plant.nextWater}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <button className="flex-1 bg-primary-50 text-primary-600 py-2 px-3 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors duration-200">
                          Care Log
                        </button>
                        <button className="flex-1 bg-gray-50 text-gray-600 py-2 px-3 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors duration-200">
                          Details
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard