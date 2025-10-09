// API Mocking Utilities for E2E Tests
import { Page, Route } from '@playwright/test'
import { apiResponses } from '../fixtures/test-data'

export class ApiMockManager {
  constructor(private page: Page) {}

  // Mock authentication endpoints
  async mockAuth(scenario: 'success' | 'error' = 'success') {
    // Mock sign in
    await this.page.route('**/api/auth/signin', (route) => {
      if (scenario === 'success') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiResponses.signIn.success)
        })
      } else {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify(apiResponses.signIn.error)
        })
      }
    })

    // Mock sign out
    await this.page.route('**/api/auth/signout', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })

    // Mock user session
    await this.page.route('**/api/auth/session', (route) => {
      if (scenario === 'success') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(apiResponses.signIn.success)
        })
      } else {
        route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Not authenticated' })
        })
      }
    })
  }

  // Mock plant-related endpoints
  async mockPlantsApi(scenario: 'with-plants' | 'empty' = 'with-plants') {
    // Get user plants
    await this.page.route('**/api/plants', (route) => {
      if (route.request().method() === 'GET') {
        const response = scenario === 'with-plants' 
          ? apiResponses.getUserPlants.success 
          : apiResponses.getUserPlants.empty
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(response)
        })
      } else if (route.request().method() === 'POST') {
        // Create plant
        const requestBody = route.request().postDataJSON()
        const newPlant = apiResponses.createPlant.success(requestBody)
        
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newPlant)
        })
      }
    })

    // Get single plant
    await this.page.route('**/api/plants/*', (route) => {
      if (route.request().method() === 'GET') {
        const plantId = route.request().url().split('/').pop()
        const plant = apiResponses.getUserPlants.success.find(p => p.id === plantId)
        
        if (plant) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(plant)
          })
        } else {
          route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Plant not found' })
          })
        }
      } else if (route.request().method() === 'PUT') {
        // Update plant
        const plantId = route.request().url().split('/').pop()
        const requestBody = route.request().postDataJSON()
        const existingPlant = apiResponses.getUserPlants.success.find(p => p.id === plantId)
        
        if (existingPlant) {
          const updatedPlant = { ...existingPlant, ...requestBody, updatedAt: new Date().toISOString() }
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(updatedPlant)
          })
        } else {
          route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Plant not found' })
          })
        }
      } else if (route.request().method() === 'DELETE') {
        // Delete plant
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        })
      }
    })
  }

  // Mock care log endpoints
  async mockCareLogsApi() {
    // Get care logs for plant
    await this.page.route('**/api/plants/*/care-logs', (route) => {
      if (route.request().method() === 'GET') {
        const plantId = route.request().url().split('/')[5] // Extract plant ID from URL
        const careLogs = apiResponses.getPlantCareLogs.success.filter(log => log.plantId === plantId)
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(careLogs)
        })
      } else if (route.request().method() === 'POST') {
        // Create care log
        const plantId = route.request().url().split('/')[5]
        const requestBody = route.request().postDataJSON()
        const newCareLog = apiResponses.createCareLog.success({ 
          ...requestBody, 
          plantId,
          userId: 'test-user-1'
        })
        
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newCareLog)
        })
      }
    })

    // Get all care logs for user
    await this.page.route('**/api/care-logs', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(apiResponses.getPlantCareLogs.success)
      })
    })
  }

  // Mock community endpoints
  async mockCommunityApi() {
    // Get community posts
    await this.page.route('**/api/community/posts', (route) => {
      if (route.request().method() === 'GET') {
        const url = new URL(route.request().url())
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '10')
        
        const response = apiResponses.getCommunityPosts.paginated(page, limit)
        
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(response)
        })
      } else if (route.request().method() === 'POST') {
        // Create post
        const requestBody = route.request().postDataJSON()
        const newPost = {
          id: `post-${Date.now()}`,
          userId: 'test-user-1',
          likes: 0,
          commentCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...requestBody
        }
        
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newPost)
        })
      }
    })

    // Get single post
    await this.page.route('**/api/community/posts/*', (route) => {
      if (route.request().method() === 'GET') {
        const postId = route.request().url().split('/').pop()
        const post = apiResponses.getCommunityPosts.success.find(p => p.id === postId)
        
        if (post) {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(post)
          })
        } else {
          route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Post not found' })
          })
        }
      }
    })

    // Mock comments
    await this.page.route('**/api/community/posts/*/comments', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]) // Empty comments for now
        })
      } else if (route.request().method() === 'POST') {
        const requestBody = route.request().postDataJSON()
        const newComment = {
          id: `comment-${Date.now()}`,
          userId: 'test-user-1',
          postId: route.request().url().split('/')[6],
          createdAt: new Date().toISOString(),
          ...requestBody
        }
        
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify(newComment)
        })
      }
    })
  }

  // Mock plant information endpoints
  async mockPlantInfoApi() {
    await this.page.route('**/api/plant-info/**', (route) => {
      const species = route.request().url().split('/').pop()?.replace(/[^a-z-]/gi, '')
      const plantInfo = apiResponses.getPlantInfo.success(species || '')
      
      if (plantInfo) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(plantInfo)
        })
      } else {
        route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Plant information not found' })
        })
      }
    })
  }

  // Mock search endpoints
  async mockSearchApi() {
    await this.page.route('**/api/search/plants', (route) => {
      const url = new URL(route.request().url())
      const query = url.searchParams.get('q') || ''
      const results = apiResponses.searchPlants.success(query)
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results })
      })
    })

    await this.page.route('**/api/search/posts', (route) => {
      const url = new URL(route.request().url())
      const query = url.searchParams.get('q') || ''
      const results = apiResponses.getCommunityPosts.success.filter(post =>
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase())
      )
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ results })
      })
    })
  }

  // Mock image upload endpoints
  async mockImageUploads() {
    await this.page.route('**/api/upload/**', (route) => {
      // Simulate successful image upload
      const mockImageUrl = `/images/uploads/mock-${Date.now()}.jpg`
      
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          url: mockImageUrl
        })
      })
    })
  }

  // Mock analytics endpoints
  async mockAnalytics() {
    await this.page.route('**/api/analytics/**', (route) => {
      // Mock analytics tracking - just return success
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      })
    })
  }

  // Mock error scenarios
  async mockErrors(endpoints: string[], errorType: 'network' | 'server' | 'not-found' = 'server') {
    for (const endpoint of endpoints) {
      await this.page.route(`**${endpoint}`, (route) => {
        if (errorType === 'network') {
          route.abort('failed')
        } else if (errorType === 'server') {
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ 
              error: 'Internal Server Error',
              message: 'Something went wrong'
            })
          })
        } else if (errorType === 'not-found') {
          route.fulfill({
            status: 404,
            contentType: 'application/json',
            body: JSON.stringify({ 
              error: 'Not Found',
              message: 'Resource not found'
            })
          })
        }
      })
    }
  }

  // Mock slow responses for performance testing
  async mockSlowResponses(endpoints: string[], delayMs: number = 3000) {
    for (const endpoint of endpoints) {
      await this.page.route(`**${endpoint}`, async (route) => {
        await new Promise(resolve => setTimeout(resolve, delayMs))
        route.continue()
      })
    }
  }

  // Setup all API mocks with default successful responses
  async setupDefaultMocks() {
    await this.mockAuth('success')
    await this.mockPlantsApi('with-plants')
    await this.mockCareLogsApi()
    await this.mockCommunityApi()
    await this.mockPlantInfoApi()
    await this.mockSearchApi()
    await this.mockImageUploads()
    await this.mockAnalytics()
  }

  // Setup mocks for new user scenario
  async setupNewUserMocks() {
    await this.mockAuth('success')
    await this.mockPlantsApi('empty')
    await this.mockCareLogsApi()
    await this.mockCommunityApi()
    await this.mockPlantInfoApi()
    await this.mockSearchApi()
    await this.mockImageUploads()
    await this.mockAnalytics()
  }

  // Setup mocks for error scenarios
  async setupErrorMocks() {
    await this.mockAuth('error')
    await this.mockErrors(['/api/plants', '/api/community'], 'server')
  }

  // Clear all mocks
  async clearAllMocks() {
    await this.page.unroute('**')
  }
}

// Utility functions for common mock scenarios
export const MockScenarios = {
  // Authenticated user with plants
  authenticatedUser: async (page: Page) => {
    const mockManager = new ApiMockManager(page)
    await mockManager.setupDefaultMocks()
    return mockManager
  },

  // New user without plants
  newUser: async (page: Page) => {
    const mockManager = new ApiMockManager(page)
    await mockManager.setupNewUserMocks()
    return mockManager
  },

  // Unauthenticated user
  unauthenticatedUser: async (page: Page) => {
    const mockManager = new ApiMockManager(page)
    await mockManager.mockAuth('error')
    return mockManager
  },

  // Network/server errors
  serverErrors: async (page: Page) => {
    const mockManager = new ApiMockManager(page)
    await mockManager.setupErrorMocks()
    return mockManager
  },

  // Slow responses for performance testing
  slowResponses: async (page: Page, delayMs: number = 3000) => {
    const mockManager = new ApiMockManager(page)
    await mockManager.setupDefaultMocks()
    await mockManager.mockSlowResponses(['**/api/**'], delayMs)
    return mockManager
  }
}

// Helper to wait for API requests
export const waitForApiCall = async (page: Page, url: string, method: string = 'GET') => {
  return page.waitForResponse(response => 
    response.url().includes(url) && response.request().method() === method
  )
}

// Helper to intercept and validate API requests
export const interceptApiCall = async (
  page: Page, 
  url: string, 
  validator: (request: any) => boolean
) => {
  return new Promise<boolean>((resolve) => {
    page.on('request', (request) => {
      if (request.url().includes(url)) {
        try {
          const isValid = validator(request)
          resolve(isValid)
        } catch (error) {
          resolve(false)
        }
      }
    })
  })
}