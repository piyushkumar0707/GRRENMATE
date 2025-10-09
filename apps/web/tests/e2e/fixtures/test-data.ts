// E2E Test Fixtures and Mock Data
import { type Plant, type User, type CareLog, type CommunityPost } from '@/types'

// Mock Users
export const mockUsers = {
  testUser: {
    id: 'test-user-1',
    email: 'test@example.com',
    name: 'Test User',
    avatar: '/images/avatars/default.jpg',
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString()
  },
  plantExpert: {
    id: 'expert-user-1',
    email: 'expert@example.com',
    name: 'Plant Expert',
    avatar: '/images/avatars/expert.jpg',
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    },
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString()
  },
  newUser: {
    id: 'new-user-1',
    email: 'newuser@example.com',
    name: 'New User',
    avatar: '/images/avatars/default.jpg',
    preferences: {
      theme: 'light',
      notifications: true,
      language: 'en'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
} satisfies Record<string, User>

// Mock Plants
export const mockPlants = {
  monstera: {
    id: 'plant-monstera-1',
    userId: 'test-user-1',
    name: 'Monstera Deliciosa',
    species: 'Monstera deliciosa',
    commonNames: ['Swiss Cheese Plant', 'Split-leaf Philodendron'],
    location: 'Living Room',
    notes: 'Beautiful large leaves, grows quickly in bright indirect light',
    images: [
      '/images/plants/monstera-1.jpg',
      '/images/plants/monstera-2.jpg'
    ],
    careSchedule: {
      watering: {
        frequency: 7,
        lastCare: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        nextCare: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      fertilizing: {
        frequency: 30,
        lastCare: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        nextCare: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    healthStatus: 'healthy',
    acquisitionDate: new Date('2024-01-15').toISOString(),
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-02-01').toISOString()
  },
  succulent: {
    id: 'plant-succulent-1',
    userId: 'test-user-1',
    name: 'Jade Plant',
    species: 'Crassula ovata',
    commonNames: ['Money Tree', 'Lucky Plant'],
    location: 'Kitchen Window',
    notes: 'Easy to care for, needs bright light and infrequent watering',
    images: ['/images/plants/jade-1.jpg'],
    careSchedule: {
      watering: {
        frequency: 14,
        lastCare: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        nextCare: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    healthStatus: 'healthy',
    acquisitionDate: new Date('2023-12-01').toISOString(),
    createdAt: new Date('2023-12-01').toISOString(),
    updatedAt: new Date('2024-01-20').toISOString()
  },
  sickPlant: {
    id: 'plant-sick-1',
    userId: 'test-user-1',
    name: 'Struggling Fiddle Leaf',
    species: 'Ficus lyrata',
    commonNames: ['Fiddle Leaf Fig'],
    location: 'Bedroom Corner',
    notes: 'Has been showing brown spots on leaves, might need better lighting',
    images: ['/images/plants/fiddle-sick-1.jpg'],
    careSchedule: {
      watering: {
        frequency: 7,
        lastCare: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        nextCare: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // Overdue
      }
    },
    healthStatus: 'needs_attention',
    acquisitionDate: new Date('2023-11-01').toISOString(),
    createdAt: new Date('2023-11-01').toISOString(),
    updatedAt: new Date('2024-01-25').toISOString()
  }
} satisfies Record<string, Plant>

// Mock Care Logs
export const mockCareLogs: CareLog[] = [
  {
    id: 'care-log-1',
    plantId: 'plant-monstera-1',
    userId: 'test-user-1',
    action: 'watering',
    notes: 'Soil was getting dry, gave it a thorough watering',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    images: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'care-log-2',
    plantId: 'plant-monstera-1',
    userId: 'test-user-1',
    action: 'fertilizing',
    notes: 'Applied liquid fertilizer at half strength',
    date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    images: [],
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'care-log-3',
    plantId: 'plant-succulent-1',
    userId: 'test-user-1',
    action: 'watering',
    notes: 'Light watering - soil was completely dry',
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    images: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'care-log-4',
    plantId: 'plant-sick-1',
    userId: 'test-user-1',
    action: 'inspection',
    notes: 'Brown spots are spreading - might be fungal issue',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    images: ['/images/care-logs/fiddle-spots.jpg'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
]

// Mock Community Posts
export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'post-1',
    userId: 'expert-user-1',
    title: 'Complete Guide to Monstera Care',
    content: 'Monsteras are amazing houseplants that can grow huge with proper care. Here are my top tips for keeping them happy...',
    category: 'Care Tips',
    tags: ['monstera', 'houseplants', 'care-guide'],
    images: ['/images/posts/monstera-guide.jpg'],
    likes: 45,
    commentCount: 12,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post-2',
    userId: 'test-user-1',
    title: 'Help! My fiddle leaf fig has brown spots',
    content: 'I\'ve had this fiddle leaf fig for a few months and recently it\'s been developing brown spots on the leaves. Any ideas what might be causing this?',
    category: 'Help & Questions',
    tags: ['fiddle-leaf-fig', 'plant-problems', 'help'],
    images: ['/images/posts/fiddle-problem.jpg'],
    likes: 8,
    commentCount: 23,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'post-3',
    userId: 'new-user-1',
    title: 'Just got my first houseplant!',
    content: 'I\'m so excited to start my plant journey! Just picked up this beautiful pothos from the local nursery. Any beginner tips?',
    category: 'Show & Tell',
    tags: ['beginner', 'pothos', 'first-plant'],
    images: ['/images/posts/first-pothos.jpg'],
    likes: 15,
    commentCount: 8,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
]

// Mock Plant Care Information
export const mockPlantInfo = {
  'monstera-deliciosa': {
    id: 'info-monstera',
    scientificName: 'Monstera deliciosa',
    commonNames: ['Swiss Cheese Plant', 'Split-leaf Philodendron'],
    family: 'Araceae',
    origin: 'Central America',
    difficulty: 'Easy',
    light: 'Bright, indirect light',
    water: 'Water when top inch of soil is dry',
    humidity: '50-60%',
    temperature: '65-80°F (18-27°C)',
    fertilizer: 'Monthly during growing season',
    toxicity: 'Toxic to pets and children',
    commonProblems: [
      'Yellow leaves (overwatering)',
      'Brown leaf tips (low humidity)',
      'No fenestrations (insufficient light)'
    ],
    careCalendar: {
      spring: 'Increase watering and begin fertilizing',
      summer: 'Regular watering and monthly fertilizing',
      fall: 'Reduce watering frequency',
      winter: 'Water sparingly, no fertilizer'
    },
    images: [
      '/images/plant-info/monstera-1.jpg',
      '/images/plant-info/monstera-2.jpg'
    ]
  },
  'crassula-ovata': {
    id: 'info-jade',
    scientificName: 'Crassula ovata',
    commonNames: ['Jade Plant', 'Money Tree', 'Lucky Plant'],
    family: 'Crassulaceae',
    origin: 'South Africa',
    difficulty: 'Very Easy',
    light: 'Bright light, some direct sun OK',
    water: 'Water deeply but infrequently',
    humidity: 'Low humidity preferred',
    temperature: '65-75°F (18-24°C)',
    fertilizer: 'Light feeding in spring/summer',
    toxicity: 'Mildly toxic to pets',
    commonProblems: [
      'Soft, mushy leaves (overwatering)',
      'Wrinkled leaves (underwatering)',
      'Leggy growth (insufficient light)'
    ],
    careCalendar: {
      spring: 'Resume regular watering',
      summer: 'Water when soil is dry',
      fall: 'Begin reducing water',
      winter: 'Very minimal watering'
    },
    images: [
      '/images/plant-info/jade-1.jpg',
      '/images/plant-info/jade-2.jpg'
    ]
  }
}

// Test scenarios for different user states
export const testScenarios = {
  newUser: {
    user: mockUsers.newUser,
    plants: [],
    careLogs: [],
    posts: []
  },
  activeUser: {
    user: mockUsers.testUser,
    plants: Object.values(mockPlants),
    careLogs: mockCareLogs,
    posts: mockCommunityPosts.filter(post => post.userId === mockUsers.testUser.id)
  },
  expertUser: {
    user: mockUsers.plantExpert,
    plants: [mockPlants.monstera],
    careLogs: mockCareLogs.slice(0, 2),
    posts: mockCommunityPosts.filter(post => post.userId === mockUsers.plantExpert.id)
  }
}

// API Response Mocks
export const apiResponses = {
  // Authentication
  signIn: {
    success: {
      user: mockUsers.testUser,
      token: 'mock-jwt-token',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    },
    error: {
      error: 'Invalid credentials',
      message: 'Email or password is incorrect'
    }
  },

  // Plants
  getUserPlants: {
    success: Object.values(mockPlants),
    empty: []
  },

  createPlant: {
    success: (plantData: Partial<Plant>) => ({
      ...mockPlants.monstera,
      ...plantData,
      id: `plant-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
  },

  // Care logs
  getPlantCareLogs: {
    success: mockCareLogs
  },

  createCareLog: {
    success: (logData: Partial<CareLog>) => ({
      id: `care-log-${Date.now()}`,
      ...logData,
      createdAt: new Date().toISOString()
    })
  },

  // Community
  getCommunityPosts: {
    success: mockCommunityPosts,
    paginated: (page: number = 1, limit: number = 10) => ({
      posts: mockCommunityPosts.slice((page - 1) * limit, page * limit),
      pagination: {
        page,
        limit,
        total: mockCommunityPosts.length,
        totalPages: Math.ceil(mockCommunityPosts.length / limit)
      }
    })
  },

  // Plant information
  getPlantInfo: {
    success: (species: string) => mockPlantInfo[species as keyof typeof mockPlantInfo] || null
  },

  // Search
  searchPlants: {
    success: (query: string) => 
      Object.values(mockPlants).filter(plant => 
        plant.name.toLowerCase().includes(query.toLowerCase()) ||
        plant.species.toLowerCase().includes(query.toLowerCase())
      )
  }
}

// Utility functions for test data
export const TestDataUtils = {
  // Generate random plant data
  generatePlant: (overrides: Partial<Plant> = {}): Plant => ({
    id: `plant-${Math.random().toString(36).substr(2, 9)}`,
    userId: 'test-user-1',
    name: `Test Plant ${Math.floor(Math.random() * 1000)}`,
    species: 'Test species',
    commonNames: ['Test Plant'],
    location: 'Test Location',
    notes: 'Test notes',
    images: [],
    careSchedule: {
      watering: {
        frequency: 7,
        lastCare: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        nextCare: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString()
      }
    },
    healthStatus: 'healthy',
    acquisitionDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  // Generate random care log
  generateCareLog: (plantId: string, overrides: Partial<CareLog> = {}): CareLog => ({
    id: `care-log-${Math.random().toString(36).substr(2, 9)}`,
    plantId,
    userId: 'test-user-1',
    action: 'watering',
    notes: 'Test care log',
    date: new Date().toISOString(),
    images: [],
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  // Generate random community post
  generatePost: (overrides: Partial<CommunityPost> = {}): CommunityPost => ({
    id: `post-${Math.random().toString(36).substr(2, 9)}`,
    userId: 'test-user-1',
    title: `Test Post ${Math.floor(Math.random() * 1000)}`,
    content: 'This is a test post content',
    category: 'General',
    tags: ['test'],
    images: [],
    likes: 0,
    commentCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  // Create overdue care schedule
  createOverduePlant: (daysOverdue: number = 3): Plant => {
    const overdueDate = new Date(Date.now() - daysOverdue * 24 * 60 * 60 * 1000)
    return TestDataUtils.generatePlant({
      name: 'Overdue Plant',
      careSchedule: {
        watering: {
          frequency: 7,
          lastCare: new Date(Date.now() - (7 + daysOverdue) * 24 * 60 * 60 * 1000).toISOString(),
          nextCare: overdueDate.toISOString()
        }
      },
      healthStatus: 'needs_attention'
    })
  },

  // Create plant with upcoming care
  createUpcomingCarePlant: (daysUntilCare: number = 2): Plant => {
    const upcomingDate = new Date(Date.now() + daysUntilCare * 24 * 60 * 60 * 1000)
    return TestDataUtils.generatePlant({
      name: 'Upcoming Care Plant',
      careSchedule: {
        watering: {
          frequency: 7,
          lastCare: new Date(Date.now() - (7 - daysUntilCare) * 24 * 60 * 60 * 1000).toISOString(),
          nextCare: upcomingDate.toISOString()
        }
      }
    })
  }
}