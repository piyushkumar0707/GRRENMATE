// E2E Test Helper Utilities
import { Page, Locator, expect } from '@playwright/test'

export class TestHelpers {
  constructor(public page: Page) {}

  // Navigation helpers
  async navigateToHome() {
    await this.page.goto('/')
    await this.waitForPageLoad()
  }

  async navigateToPlants() {
    await this.page.goto('/plants')
    await this.waitForPageLoad()
  }

  async navigateToPlant(plantId: string) {
    await this.page.goto(`/plants/${plantId}`)
    await this.waitForPageLoad()
  }

  async navigateToCommunity() {
    await this.page.goto('/community')
    await this.waitForPageLoad()
  }

  // Wait for page to be fully loaded
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle')
    await this.page.waitForSelector('[data-testid="page-content"], main, .container', { timeout: 10000 })
  }

  // Authentication helpers
  async signIn(email: string = 'test@example.com', password: string = 'password123') {
    await this.page.click('[data-testid="sign-in-button"], button:has-text("Sign In")')
    await this.page.fill('input[type="email"], input[name="email"]', email)
    await this.page.fill('input[type="password"], input[name="password"]', password)
    await this.page.click('button[type="submit"], button:has-text("Sign In")')
    await this.waitForPageLoad()
  }

  async signOut() {
    await this.page.click('[data-testid="user-menu"], [data-testid="profile-menu"]')
    await this.page.click('button:has-text("Sign Out"), a:has-text("Sign Out")')
    await this.waitForPageLoad()
  }

  // Form helpers
  async fillForm(formData: Record<string, string>) {
    for (const [field, value] of Object.entries(formData)) {
      await this.page.fill(`input[name="${field}"], textarea[name="${field}"], select[name="${field}"]`, value)
    }
  }

  async submitForm() {
    await this.page.click('button[type="submit"], button:has-text("Submit"), button:has-text("Save")')
  }

  // Plant-specific helpers
  async addPlant(plantData: {
    name: string
    species?: string
    location?: string
    notes?: string
  }) {
    await this.page.click('[data-testid="add-plant-button"], button:has-text("Add Plant")')
    
    await this.fillForm({
      name: plantData.name,
      species: plantData.species || '',
      location: plantData.location || '',
      notes: plantData.notes || ''
    })
    
    await this.submitForm()
    await this.waitForPageLoad()
  }

  async logCareAction(plantId: string, action: string, notes?: string) {
    await this.navigateToPlant(plantId)
    await this.page.click(`button:has-text("${action}"), [data-testid="care-action-${action.toLowerCase()}"]`)
    
    if (notes) {
      await this.page.fill('textarea[name="notes"], input[name="notes"]', notes)
    }
    
    await this.submitForm()
    await this.waitForPageLoad()
  }

  async uploadPlantPhoto(filePath: string) {
    await this.page.click('[data-testid="upload-photo"], button:has-text("Add Photo")')
    await this.page.setInputFiles('input[type="file"]', filePath)
    await this.page.click('button:has-text("Upload"), button[type="submit"]')
    await this.waitForPageLoad()
  }

  // Community helpers
  async createPost(title: string, content: string, category?: string) {
    await this.page.click('[data-testid="create-post"], button:has-text("Create Post")')
    
    await this.fillForm({
      title,
      content,
      ...(category && { category })
    })
    
    await this.submitForm()
    await this.waitForPageLoad()
  }

  async addComment(postId: string, content: string) {
    await this.page.fill(`[data-testid="comment-input-${postId}"], textarea[name="comment"]`, content)
    await this.page.click(`[data-testid="submit-comment-${postId}"], button:has-text("Comment")`)
    await this.waitForPageLoad()
  }

  // Search helpers
  async searchPlants(query: string) {
    await this.page.fill('[data-testid="search-input"], input[placeholder*="Search"]', query)
    await this.page.press('[data-testid="search-input"], input[placeholder*="Search"]', 'Enter')
    await this.waitForPageLoad()
  }

  // UI assertion helpers
  async expectToastMessage(message: string) {
    await expect(this.page.locator('[data-testid="toast"], .toast, [role="alert"]')).toContainText(message)
  }

  async expectPageTitle(title: string) {
    await expect(this.page).toHaveTitle(new RegExp(title))
  }

  async expectElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible()
  }

  async expectElementHidden(selector: string) {
    await expect(this.page.locator(selector)).toBeHidden()
  }

  async expectElementCount(selector: string, count: number) {
    await expect(this.page.locator(selector)).toHaveCount(count)
  }

  // Wait helpers
  async waitForElement(selector: string, timeout: number = 10000) {
    return await this.page.waitForSelector(selector, { timeout })
  }

  async waitForElementToDisappear(selector: string, timeout: number = 10000) {
    await this.page.waitForSelector(selector, { state: 'detached', timeout })
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle')
  }

  // Mobile helpers
  async setMobileViewport() {
    await this.page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
  }

  async setDesktopViewport() {
    await this.page.setViewportSize({ width: 1280, height: 720 })
  }

  async swipeLeft(selector?: string) {
    const element = selector ? this.page.locator(selector) : this.page
    await element.hover()
    await this.page.mouse.down()
    await this.page.mouse.move(-100, 0)
    await this.page.mouse.up()
  }

  async swipeRight(selector?: string) {
    const element = selector ? this.page.locator(selector) : this.page
    await element.hover()
    await this.page.mouse.down()
    await this.page.mouse.move(100, 0)
    await this.page.mouse.up()
  }

  // Screenshot helpers
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/${name}.png`, fullPage: true })
  }

  async takeElementScreenshot(selector: string, name: string) {
    await this.page.locator(selector).screenshot({ path: `test-results/${name}.png` })
  }

  // Accessibility helpers
  async checkAccessibility() {
    // Basic accessibility checks
    const missingAltImages = await this.page.locator('img:not([alt])').count()
    if (missingAltImages > 0) {
      console.warn(`Found ${missingAltImages} images without alt text`)
    }

    const missingLabels = await this.page.locator('input:not([aria-label]):not([aria-labelledby]):not([aria-describedby])').count()
    if (missingLabels > 0) {
      console.warn(`Found ${missingLabels} inputs without proper labels`)
    }

    // Check for proper heading hierarchy
    const headings = await this.page.locator('h1, h2, h3, h4, h5, h6').allTextContents()
    console.log('Page heading structure:', headings)
  }

  // Performance helpers
  async measurePageLoadTime(): Promise<number> {
    const startTime = Date.now()
    await this.waitForPageLoad()
    return Date.now() - startTime
  }

  async checkCoreWebVitals() {
    const metrics = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const vitals: any = {}

          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime
            }
            if (entry.entryType === 'first-input') {
              vitals.fid = (entry as any).processingStart - entry.startTime
            }
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              vitals.cls = (vitals.cls || 0) + (entry as any).value
            }
          })

          setTimeout(() => resolve(vitals), 1000)
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
      })
    })

    return metrics
  }

  // Debug helpers
  async debugElement(selector: string) {
    const element = this.page.locator(selector)
    const count = await element.count()
    console.log(`Found ${count} elements matching "${selector}"`)
    
    if (count > 0) {
      const text = await element.first().textContent()
      const isVisible = await element.first().isVisible()
      console.log(`First element: visible=${isVisible}, text="${text}"`)
    }
  }

  async logConsoleErrors() {
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text())
      }
    })
  }

  async logNetworkErrors() {
    this.page.on('response', (response) => {
      if (response.status() >= 400) {
        console.error(`Network error: ${response.url()} - ${response.status()}`)
      }
    })
  }
}

// Test data factories
export const TestDataFactory = {
  createPlant: (overrides: Partial<any> = {}) => ({
    name: 'Test Plant',
    species: 'Test Species',
    location: 'Living Room',
    notes: 'Test notes',
    ...overrides
  }),

  createUser: (overrides: Partial<any> = {}) => ({
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    ...overrides
  }),

  createPost: (overrides: Partial<any> = {}) => ({
    title: 'Test Post',
    content: 'This is a test post content',
    category: 'General',
    ...overrides
  })
}