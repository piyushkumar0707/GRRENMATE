'use client'

import { useState } from 'react'
import { PlantDashboard, PlantData, DashboardStats } from '@greenmate/ui'
import Link from 'next/link'
import { ArrowLeft, Leaf } from 'lucide-react'

// Mock plant data for demo
const mockPlants: PlantData[] = [
  {
    id: '1',
    name: 'Monstera Deliciosa',
    type: 'Tropical',
    health: 92,
    lastWatered: new Date('2024-01-06'),
    nextWatering: new Date('2024-01-09'),
    location: 'Living Room',
    image: 'https://images.unsplash.com/photo-1545241047-6083a3684587?w=400&h=300&fit=crop',
    notes: 'Growing beautifully near the window'
  },
  {
    id: '2',
    name: 'Snake Plant',
    type: 'Succulent',
    health: 87,
    lastWatered: new Date('2024-01-04'),
    nextWatering: new Date('2024-01-18'),
    location: 'Bedroom',
    image: 'https://images.unsplash.com/photo-1593691509543-c55fb32d8de5?w=400&h=300&fit=crop',
    notes: 'Very low maintenance, perfect for beginners'
  },
  {
    id: '3',
    name: 'Fiddle Leaf Fig',
    type: 'Tree',
    health: 73,
    lastWatered: new Date('2024-01-05'),
    nextWatering: new Date('2024-01-08'),
    location: 'Home Office',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    notes: 'Needs more consistent watering schedule'
  },
  {
    id: '4',
    name: 'Pothos',
    type: 'Vine',
    health: 95,
    lastWatered: new Date('2024-01-07'),
    nextWatering: new Date('2024-01-12'),
    location: 'Kitchen',
    image: 'https://images.unsplash.com/photo-1586997469015-6b7de1e02455?w=400&h=300&fit=crop',
    notes: 'Trailing beautifully from the shelf'
  },
  {
    id: '5',
    name: 'Peace Lily',
    type: 'Flowering',
    health: 68,
    lastWatered: new Date('2024-01-03'),
    nextWatering: new Date('2024-01-07'),
    location: 'Bathroom',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop',
    notes: 'Leaves looking a bit droopy, may need more water'
  },
  {
    id: '6',
    name: 'Rubber Plant',
    type: 'Tree',
    health: 84,
    lastWatered: new Date('2024-01-06'),
    nextWatering: new Date('2024-01-13'),
    location: 'Living Room',
    image: 'https://images.unsplash.com/photo-1463594373500-04d4f1e0e8b4?w=400&h=300&fit=crop',
    notes: 'Growing steadily, new leaves emerging'
  },
  {
    id: '7',
    name: 'ZZ Plant',
    type: 'Succulent',
    health: 91,
    lastWatered: new Date('2024-01-02'),
    nextWatering: new Date('2024-01-16'),
    location: 'Home Office',
    image: 'https://images.unsplash.com/photo-1509937528395-d88b5ac3fb4a?w=400&h=300&fit=crop',
    notes: 'Extremely low maintenance and thriving'
  },
  {
    id: '8',
    name: 'Boston Fern',
    type: 'Fern',
    health: 76,
    lastWatered: new Date('2024-01-06'),
    nextWatering: new Date('2024-01-09'),
    location: 'Bathroom',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&h=300&fit=crop',
    notes: 'Loves the humidity in the bathroom'
  }
]

const mockStats: DashboardStats = {
  totalPlants: mockPlants.length,
  healthyPlants: mockPlants.filter(p => p.health >= 80).length,
  needsAttention: mockPlants.filter(p => p.health < 70).length,
  overduePlants: mockPlants.filter(p => new Date() >= p.nextWatering).length,
  weeklyGrowth: 12,
  streakDays: 23
}

export default function DashboardDemoPage() {
  const [plants, setPlants] = useState<PlantData[]>(mockPlants)
  const [stats, setStats] = useState<DashboardStats>(mockStats)

  const handleAddPlant = () => {
    console.log('Add plant clicked - would open plant add form')
    // In real app, this would open a modal or navigate to add plant form
  }

  const handleWaterPlant = (plantId: string) => {
    setPlants(prevPlants => 
      prevPlants.map(plant => 
        plant.id === plantId 
          ? {
              ...plant,
              lastWatered: new Date(),
              nextWatering: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              health: Math.min(100, plant.health + Math.random() * 5) // Slight health boost
            }
          : plant
      )
    )
    
    // Update stats
    const updatedPlants = plants.map(plant => 
      plant.id === plantId 
        ? {
            ...plant,
            lastWatered: new Date(),
            nextWatering: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            health: Math.min(100, plant.health + Math.random() * 5)
          }
        : plant
    )
    
    setStats({
      ...stats,
      healthyPlants: updatedPlants.filter(p => p.health >= 80).length,
      needsAttention: updatedPlants.filter(p => p.health < 70).length,
      overduePlants: updatedPlants.filter(p => new Date() >= p.nextWatering).length,
    })
  }

  const handlePlantClick = (plant: PlantData) => {
    console.log('Plant clicked:', plant.name)
    // Navigate to plant detail page
    window.location.href = `/demo/plant/${plant.id}`
  }

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
            <Leaf className="h-5 w-5 text-primary-600" />
            <span className="text-lg font-heading font-semibold">Plant Dashboard Demo</span>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Leaf className="h-4 w-4" />
            <span>Interactive Plant Dashboard</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold font-heading gradient-text mb-4">
            Manage Your Plant Collection
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track plant health, monitor watering schedules, and stay on top of care tasks. 
            Click the "Water" buttons to see real-time updates!
          </p>
        </div>

        {/* Dashboard Component */}
        <PlantDashboard
          plants={plants}
          stats={stats}
          onAddPlant={handleAddPlant}
          onWaterPlant={handleWaterPlant}
          onPlantClick={handlePlantClick}
        />
      </section>

      {/* Features */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Dashboard Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-white/50 rounded-xl border border-white/20">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                📊
              </div>
              <h3 className="font-semibold mb-2">Real-time Stats</h3>
              <p className="text-sm text-muted-foreground">
                Track collection health, growth, and care streaks
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/50 rounded-xl border border-white/20">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                🗓️
              </div>
              <h3 className="font-semibold mb-2">Smart Reminders</h3>
              <p className="text-sm text-muted-foreground">
                Never miss watering with intelligent scheduling
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/50 rounded-xl border border-white/20">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                🔍
              </div>
              <h3 className="font-semibold mb-2">Search & Filter</h3>
              <p className="text-sm text-muted-foreground">
                Easily find plants by name, type, or care status
              </p>
            </div>
            
            <div className="text-center p-6 bg-white/50 rounded-xl border border-white/20">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                📱
              </div>
              <h3 className="font-semibold mb-2">Responsive Design</h3>
              <p className="text-sm text-muted-foreground">
                Perfect experience on desktop, tablet, and mobile
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Instructions */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Try the Interactive Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
              <h3 className="font-semibold mb-3 text-green-800">💧 Water Your Plants</h3>
              <p className="text-sm text-green-700">
                Click the "Water" button on any plant card to see real-time updates. 
                Watch the stats change and overdue tasks disappear!
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
              <h3 className="font-semibold mb-3 text-blue-800">🔍 Filter & Search</h3>
              <p className="text-sm text-blue-700">
                Use the search bar and filter buttons to find specific plants. 
                Try filtering by "Needs Water" or "Attention" to see different views.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}