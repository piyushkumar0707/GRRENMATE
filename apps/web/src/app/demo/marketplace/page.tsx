'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface MarketplaceListing {
  id: string
  title: string
  description: string
  price: number
  category: 'PLANT' | 'SEED' | 'TOOL' | 'FERTILIZER' | 'POT' | 'OTHER'
  condition: 'NEW' | 'USED' | 'FAIR' | 'POOR'
  status: 'ACTIVE' | 'SOLD' | 'RESERVED'
  images: string[]
  location: string
  seller: {
    username: string
    profile?: {
      firstName?: string
      lastName?: string
      avatar?: string
    }
    _count: {
      marketplaceListings: number
      reviews: number
    }
  }
  plant?: {
    name: string
    scientificName?: string
  }
  createdAt: string
}

interface MarketplaceStats {
  totalListings: number
  totalSales: number
  averagePrice: number
  popularCategories: Array<{
    category: string
    count: number
  }>
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [stats, setStats] = useState<MarketplaceStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('recent')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { key: 'all', label: 'All Items', icon: '🌍' },
    { key: 'PLANT', label: 'Plants', icon: '🌿' },
    { key: 'SEED', label: 'Seeds', icon: '🌱' },
    { key: 'TOOL', label: 'Tools', icon: '🛠️' },
    { key: 'FERTILIZER', label: 'Fertilizers', icon: '🧪' },
    { key: 'POT', label: 'Pots', icon: '🏺' },
    { key: 'OTHER', label: 'Other', icon: '📦' }
  ]

  const sortOptions = [
    { key: 'recent', label: 'Most Recent' },
    { key: 'price-low', label: 'Price: Low to High' },
    { key: 'price-high', label: 'Price: High to Low' },
    { key: 'popular', label: 'Most Popular' }
  ]

  const fetchListings = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeCategory !== 'all') params.append('category', activeCategory)
      if (searchTerm) params.append('search', searchTerm)
      if (sortBy) params.append('sortBy', sortBy)

      const response = await fetch(`http://localhost:3001/api/marketplace/listings?${params}`)
      const data = await response.json()
      
      if (data.success) {
        setListings(data.data)
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/marketplace/stats')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  useEffect(() => {
    fetchListings()
    fetchStats()
  }, [activeCategory, sortBy, searchTerm])

  const getConditionColor = (condition: string) => {
    const colors = {
      'NEW': 'bg-green-100 text-green-800',
      'USED': 'bg-blue-100 text-blue-800',
      'FAIR': 'bg-yellow-100 text-yellow-800',
      'POOR': 'bg-red-100 text-red-800'
    }
    return colors[condition as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'ACTIVE': 'bg-green-100 text-green-800',
      'SOLD': 'bg-gray-100 text-gray-800',
      'RESERVED': 'bg-orange-100 text-orange-800'
    }
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🛍️ Plant Marketplace
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Buy and sell plants, seeds, tools, and accessories. 
            Connect with local gardeners and build your green paradise.
          </p>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalListings}</div>
              <p className="text-gray-600">Active Listings</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              <div className="text-3xl mb-2">💰</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalSales}</div>
              <p className="text-gray-600">Total Sales</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              <div className="text-3xl mb-2">💵</div>
              <div className="text-2xl font-bold text-gray-900">${stats.averagePrice}</div>
              <p className="text-gray-600">Average Price</p>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.popularCategories[0]?.category || 'N/A'}
              </div>
              <p className="text-gray-600">Top Category</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔍 Search
              </h3>
              <input
                type="text"
                placeholder="Search plants, tools, seeds..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </motion.div>

            {/* Categories */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl p-6 mb-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                📦 Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.key}
                    onClick={() => setActiveCategory(category.key)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      activeCategory === category.key
                        ? 'bg-green-100 text-green-800'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Sort Options */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🔄 Sort By
              </h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </motion.div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Listings Grid */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading marketplace listings...</p>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
                <div className="text-6xl mb-4">🛍️</div>
                <p className="text-gray-500 text-lg">No listings found</p>
                <p className="text-gray-400">Try adjusting your search or category filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((listing, index) => (
                  <motion.div
                    key={listing.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gradient-to-br from-green-400 to-blue-500">
                      {listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-6xl">
                          {categories.find(c => c.key === listing.category)?.icon || '📦'}
                        </div>
                      )}
                      
                      {/* Status Badge */}
                      <div className="absolute top-2 right-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                          {listing.status}
                        </span>
                      </div>

                      {/* Condition Badge */}
                      <div className="absolute top-2 left-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(listing.condition)}`}>
                          {listing.condition}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                          {listing.title}
                        </h3>
                        <div className="text-2xl font-bold text-green-600 ml-2">
                          ${listing.price}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {listing.description}
                      </p>

                      {/* Plant Info */}
                      {listing.plant && (
                        <div className="flex items-center space-x-2 mb-4 p-2 bg-green-50 rounded-lg">
                          <span className="text-lg">🌿</span>
                          <div>
                            <p className="font-medium text-green-800 text-sm">{listing.plant.name}</p>
                            {listing.plant.scientificName && (
                              <p className="text-xs text-green-600">{listing.plant.scientificName}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Location */}
                      <div className="flex items-center space-x-2 mb-4 text-gray-600">
                        <span className="text-sm">📍</span>
                        <span className="text-sm">{listing.location}</span>
                      </div>

                      {/* Seller Info */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                            {listing.seller.profile?.firstName?.[0] || listing.seller.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {listing.seller.profile?.firstName || listing.seller.username}
                            </p>
                            <p className="text-xs text-gray-600">
                              {listing.seller._count.marketplaceListings} listings
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors">
                            Contact
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            ❤️
                          </button>
                        </div>
                      </div>

                      {/* Posted Date */}
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-gray-500">
                          Posted {new Date(listing.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Load More Button */}
            {!loading && listings.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center mt-8"
              >
                <button className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-200">
                  Load More Listings
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Popular Categories Section */}
        {stats?.popularCategories && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              📈 Popular Categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {stats.popularCategories.map((category, index) => {
                const categoryInfo = categories.find(c => c.key === category.category)
                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
                    onClick={() => setActiveCategory(category.category)}
                  >
                    <div className="text-3xl mb-2">
                      {categoryInfo?.icon || '📦'}
                    </div>
                    <p className="font-medium text-gray-900 mb-1">
                      {categoryInfo?.label || category.category}
                    </p>
                    <p className="text-sm text-gray-600">
                      {category.count} listings
                    </p>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}