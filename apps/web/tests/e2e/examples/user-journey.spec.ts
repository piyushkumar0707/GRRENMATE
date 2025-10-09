// Comprehensive User Journey E2E Tests
import { test, expect } from '@playwright/test'
import { TestHelpers, TestDataFactory } from '../utils/test-helpers'
import { MockScenarios } from '../utils/api-mocks'
import { testScenarios } from '../fixtures/test-data'

test.describe('User Journey - Plant Management', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await MockScenarios.authenticatedUser(page)
  })

  test('Complete plant care workflow', async ({ page }) => {
    // Start at homepage
    await helpers.navigateToHome()
    await helpers.expectPageTitle('GreenMate')

    // Navigate to plants page
    await helpers.navigateToPlants()
    await helpers.expectElementVisible('[data-testid="plants-grid"]')
    
    // Verify existing plants are displayed
    await helpers.expectElementCount('[data-testid="plant-card"]', 3)

    // Add a new plant
    const newPlant = TestDataFactory.createPlant({
      name: 'My New Monstera',
      species: 'Monstera deliciosa',
      location: 'Living Room Window'
    })

    await helpers.addPlant(newPlant)
    await helpers.expectToastMessage('Plant added successfully')

    // Navigate to the new plant's detail page
    await page.click(`[data-testid="plant-card"]:has-text("${newPlant.name}")`)
    await helpers.waitForPageLoad()
    
    await helpers.expectElementVisible('[data-testid="plant-details"]')
    await expect(page.locator('h1')).toContainText(newPlant.name)

    // Log care actions
    await helpers.logCareAction('plant-monstera-1', 'watering', 'Gave it a good drink')
    await helpers.expectToastMessage('Care logged successfully')

    // Verify care log appears in history
    await helpers.expectElementVisible('[data-testid="care-history"]')
    await helpers.expectElementVisible('[data-testid="care-log"]:has-text("watering")')

    // Upload a photo
    await helpers.uploadPlantPhoto('tests/fixtures/images/test-plant.jpg')
    await helpers.expectToastMessage('Photo uploaded')

    // Check analytics and insights
    await page.click('[data-testid="insights-tab"]')
    await helpers.expectElementVisible('[data-testid="care-statistics"]')
    await helpers.expectElementVisible('[data-testid="health-trends"]')
  })

  test('Plant care reminders and notifications', async ({ page }) => {
    await helpers.navigateToHome()
    
    // Check for overdue care notifications
    await helpers.expectElementVisible('[data-testid="care-reminders"]')
    await helpers.expectElementVisible('[data-testid="overdue-care"]')

    // Click on overdue reminder
    await page.click('[data-testid="overdue-care"] button')
    await helpers.waitForPageLoad()

    // Should navigate to plant detail page
    await helpers.expectElementVisible('[data-testid="plant-details"]')
    
    // Complete the overdue care
    await helpers.logCareAction('plant-sick-1', 'watering')
    await helpers.expectToastMessage('Care logged')

    // Go back to dashboard and verify reminder is gone
    await helpers.navigateToHome()
    await helpers.expectElementHidden('[data-testid="overdue-care"]')
  })

  test('Search and filter plants', async ({ page }) => {
    await helpers.navigateToPlants()
    
    // Search for specific plant
    await helpers.searchPlants('Monstera')
    await helpers.expectElementCount('[data-testid="plant-card"]', 1)
    await helpers.expectElementVisible('[data-testid="plant-card"]:has-text("Monstera")')

    // Clear search
    await page.fill('[data-testid="search-input"]', '')
    await page.press('[data-testid="search-input"]', 'Enter')
    await helpers.expectElementCount('[data-testid="plant-card"]', 3)

    // Filter by health status
    await page.click('[data-testid="health-filter"]')
    await page.click('[data-testid="filter-needs-attention"]')
    await helpers.expectElementCount('[data-testid="plant-card"]', 1)
    await helpers.expectElementVisible('[data-testid="plant-card"]:has-text("Struggling Fiddle Leaf")')

    // Filter by location
    await page.click('[data-testid="location-filter"]')
    await page.click('[data-testid="filter-living-room"]')
    await helpers.expectElementCount('[data-testid="plant-card"]', 1)
  })

  test('Plant care calendar view', async ({ page }) => {
    await helpers.navigateToPlants()
    
    // Switch to calendar view
    await page.click('[data-testid="calendar-view-toggle"]')
    await helpers.expectElementVisible('[data-testid="care-calendar"]')

    // Check current week shows upcoming care tasks
    await helpers.expectElementVisible('[data-testid="upcoming-care"]')
    
    // Click on a care task in calendar
    await page.click('[data-testid="care-task"]:first-child')
    await helpers.expectElementVisible('[data-testid="care-task-modal"]')

    // Complete care task from calendar
    await page.click('[data-testid="mark-complete"]')
    await helpers.expectToastMessage('Care completed')

    // Verify task is marked as complete
    await helpers.expectElementVisible('[data-testid="completed-care-task"]')
  })
})

test.describe('User Journey - Community Features', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await MockScenarios.authenticatedUser(page)
  })

  test('Browse and interact with community posts', async ({ page }) => {
    await helpers.navigateToCommunity()
    await helpers.expectElementVisible('[data-testid="community-feed"]')

    // Verify posts are displayed
    await helpers.expectElementCount('[data-testid="community-post"]', 3)

    // Read a post
    await page.click('[data-testid="community-post"]:first-child')
    await helpers.waitForPageLoad()
    
    await helpers.expectElementVisible('[data-testid="post-content"]')
    await helpers.expectElementVisible('[data-testid="post-comments"]')

    // Like the post
    await page.click('[data-testid="like-button"]')
    await helpers.expectElementVisible('[data-testid="like-button"][aria-pressed="true"]')

    // Add a comment
    await helpers.addComment('post-1', 'Great advice! Thanks for sharing.')
    await helpers.expectElementVisible('[data-testid="comment"]:has-text("Great advice")')

    // Share the post
    await page.click('[data-testid="share-button"]')
    await helpers.expectElementVisible('[data-testid="share-modal"]')
    await page.click('[data-testid="copy-link"]')
    await helpers.expectToastMessage('Link copied')
  })

  test('Create and manage community posts', async ({ page }) => {
    await helpers.navigateToCommunity()
    
    // Create a new post
    await helpers.createPost(
      'Help with my new succulent!',
      'I just got this beautiful succulent but I\'m not sure how often to water it. Any tips?',
      'Help & Questions'
    )
    
    await helpers.expectToastMessage('Post created successfully')
    await helpers.expectElementVisible('[data-testid="community-post"]:has-text("Help with my new succulent")')

    // Edit the post
    await page.click('[data-testid="post-menu"]')
    await page.click('[data-testid="edit-post"]')
    
    await page.fill('[data-testid="post-content"]', 'Updated post content with more details...')
    await page.click('[data-testid="save-edit"]')
    
    await helpers.expectToastMessage('Post updated')
    await helpers.expectElementVisible('[data-testid="post-content"]:has-text("Updated post content")')
  })

  test('Community categories and tags', async ({ page }) => {
    await helpers.navigateToCommunity()
    
    // Filter by category
    await page.click('[data-testid="category-filter"]')
    await page.click('[data-testid="category-care-tips"]')
    
    await helpers.expectElementCount('[data-testid="community-post"]', 1)
    await helpers.expectElementVisible('[data-testid="community-post"]:has-text("Complete Guide to Monstera Care")')

    // Search by tags
    await page.fill('[data-testid="tag-search"]', 'monstera')
    await page.press('[data-testid="tag-search"]', 'Enter')
    
    await helpers.expectElementVisible('[data-testid="community-post"]:has-text("Monstera")')

    // Browse trending tags
    await page.click('[data-testid="trending-tags"]')
    await helpers.expectElementVisible('[data-testid="tag-cloud"]')
    
    await page.click('[data-testid="tag"]:has-text("houseplants")')
    await helpers.expectElementVisible('[data-testid="tag-results"]')
  })
})

test.describe('User Journey - Mobile Experience', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await helpers.setMobileViewport()
    await MockScenarios.authenticatedUser(page)
  })

  test('Mobile plant management workflow', async ({ page }) => {
    await helpers.navigateToHome()
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]')
    await helpers.expectElementVisible('[data-testid="mobile-nav"]')
    
    // Navigate to plants
    await page.click('[data-testid="mobile-nav-plants"]')
    await helpers.waitForPageLoad()

    // View plants in mobile grid
    await helpers.expectElementVisible('[data-testid="mobile-plant-grid"]')
    
    // Swipe through plant cards
    await helpers.swipeLeft('[data-testid="plant-card-carousel"]')
    await helpers.expectElementVisible('[data-testid="plant-card"]:nth-child(2)')

    // Open plant quick actions
    await page.click('[data-testid="plant-quick-actions"]')
    await helpers.expectElementVisible('[data-testid="quick-care-buttons"]')
    
    // Log quick care action
    await page.click('[data-testid="quick-water"]')
    await helpers.expectToastMessage('Watering logged')

    // Take photo with mobile camera
    await page.click('[data-testid="add-photo-mobile"]')
    await helpers.expectElementVisible('[data-testid="camera-modal"]')
  })

  test('Mobile community interaction', async ({ page }) => {
    await helpers.navigateToCommunity()
    
    // Pull to refresh
    await helpers.swipeRight('[data-testid="community-feed"]')
    await helpers.expectElementVisible('[data-testid="refresh-indicator"]')

    // Infinite scroll
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await helpers.waitForElement('[data-testid="load-more-indicator"]')
    
    // Open post in mobile view
    await page.click('[data-testid="community-post"]:first-child')
    await helpers.expectElementVisible('[data-testid="mobile-post-view"]')
    
    // Use floating action button
    await page.click('[data-testid="fab-comment"]')
    await helpers.expectElementVisible('[data-testid="mobile-comment-input"]')
  })
})

test.describe('User Journey - New User Onboarding', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await MockScenarios.newUser(page)
  })

  test('First-time user experience', async ({ page }) => {
    await helpers.navigateToHome()
    
    // Should see onboarding welcome
    await helpers.expectElementVisible('[data-testid="welcome-modal"]')
    await page.click('[data-testid="start-onboarding"]')

    // Onboarding step 1: Add first plant
    await helpers.expectElementVisible('[data-testid="onboarding-add-plant"]')
    await page.click('[data-testid="add-first-plant"]')
    
    const firstPlant = TestDataFactory.createPlant({
      name: 'My First Plant',
      species: 'Pothos'
    })
    
    await helpers.addPlant(firstPlant)
    await page.click('[data-testid="onboarding-next"]')

    // Onboarding step 2: Set care preferences
    await helpers.expectElementVisible('[data-testid="onboarding-preferences"]')
    await page.click('[data-testid="notifications-enable"]')
    await page.click('[data-testid="reminder-frequency-daily"]')
    await page.click('[data-testid="onboarding-next"]')

    // Onboarding step 3: Explore community
    await helpers.expectElementVisible('[data-testid="onboarding-community"]')
    await page.click('[data-testid="visit-community"]')
    await helpers.waitForPageLoad()
    
    await helpers.expectElementVisible('[data-testid="community-tour"]')
    await page.click('[data-testid="finish-tour"]')

    // Complete onboarding
    await helpers.expectElementVisible('[data-testid="onboarding-complete"]')
    await page.click('[data-testid="finish-onboarding"]')
    
    // Should be redirected to main dashboard
    await helpers.expectElementVisible('[data-testid="dashboard"]')
    await helpers.expectElementHidden('[data-testid="welcome-modal"]')
  })

  test('Empty states and getting started prompts', async ({ page }) => {
    await helpers.navigateToPlants()
    
    // Should see empty state
    await helpers.expectElementVisible('[data-testid="plants-empty-state"]')
    await helpers.expectElementVisible('[data-testid="add-first-plant-cta"]')
    
    await page.click('[data-testid="add-first-plant-cta"]')
    await helpers.expectElementVisible('[data-testid="plant-form"]')

    // Navigate to care logs - also empty
    await helpers.navigateToHome()
    await page.click('[data-testid="care-logs-tab"]')
    
    await helpers.expectElementVisible('[data-testid="care-logs-empty-state"]')
    await helpers.expectElementVisible('[data-testid="getting-started-tips"]')

    // Community should show welcome message
    await helpers.navigateToCommunity()
    await helpers.expectElementVisible('[data-testid="community-welcome"]')
    await helpers.expectElementVisible('[data-testid="suggested-posts"]')
  })
})

test.describe('User Journey - Error Handling', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
  })

  test('Network error handling', async ({ page }) => {
    await MockScenarios.serverErrors(page)
    
    await helpers.navigateToPlants()
    
    // Should show error state
    await helpers.expectElementVisible('[data-testid="error-state"]')
    await helpers.expectElementVisible('[data-testid="retry-button"]')
    
    // Setup successful mocks and retry
    await MockScenarios.authenticatedUser(page)
    await page.click('[data-testid="retry-button"]')
    
    await helpers.expectElementVisible('[data-testid="plants-grid"]')
    await helpers.expectElementHidden('[data-testid="error-state"]')
  })

  test('Form validation and error messages', async ({ page }) => {
    await MockScenarios.authenticatedUser(page)
    await helpers.navigateToPlants()
    
    // Try to add plant with missing required fields
    await page.click('[data-testid="add-plant-button"]')
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await helpers.expectElementVisible('[data-testid="field-error"]:has-text("Plant name is required")')
    await helpers.expectElementVisible('[data-testid="form-error-summary"]')
    
    // Fix errors and resubmit
    await page.fill('input[name="name"]', 'Valid Plant Name')
    await page.click('button[type="submit"]')
    
    await helpers.expectElementHidden('[data-testid="field-error"]')
    await helpers.expectToastMessage('Plant added successfully')
  })

  test('Authentication error handling', async ({ page }) => {
    await MockScenarios.unauthenticatedUser(page)
    
    // Try to access protected route
    await helpers.navigateToPlants()
    
    // Should redirect to sign in
    await helpers.expectElementVisible('[data-testid="sign-in-form"]')
    await helpers.expectPageTitle(/sign in/i)
    
    // Try invalid credentials
    await helpers.signIn('invalid@email.com', 'wrongpassword')
    await helpers.expectElementVisible('[data-testid="auth-error"]')
    
    // Setup valid auth and try again
    await MockScenarios.authenticatedUser(page)
    await helpers.signIn()
    
    await helpers.expectElementHidden('[data-testid="sign-in-form"]')
    await helpers.expectElementVisible('[data-testid="plants-grid"]')
  })
})