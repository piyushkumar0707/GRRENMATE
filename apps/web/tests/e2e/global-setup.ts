// Playwright Global Setup
import { chromium, FullConfig } from '@playwright/test'

async function globalSetup(config: FullConfig) {
  console.log('🧪 Setting up E2E test environment...')
  
  // Launch browser for setup tasks
  const browser = await chromium.launch()
  const page = await browser.newPage()
  
  try {
    // Wait for the application to be ready
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3000'
    console.log(`🌐 Waiting for application at ${baseURL}`)
    
    // Try to connect to the application with retries
    let retries = 30
    while (retries > 0) {
      try {
        await page.goto(baseURL, { timeout: 5000 })
        const title = await page.title()
        if (title) {
          console.log(`✅ Application is ready - Title: "${title}"`)
          break
        }
      } catch (error) {
        retries--
        if (retries === 0) {
          throw new Error(`Failed to connect to application at ${baseURL}`)
        }
        console.log(`⏳ Waiting for application... (${retries} retries left)`)
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
    
    // Set up test database or seed data if needed
    console.log('🌱 Setting up test data...')
    
    // You might want to:
    // 1. Clear existing test data
    // 2. Seed the database with test data
    // 3. Set up user accounts for testing
    // 4. Configure test environment settings
    
    // Example: Create test user session storage
    await page.evaluate(() => {
      localStorage.setItem('test-mode', 'true')
      localStorage.setItem('test-timestamp', Date.now().toString())
    })
    
    console.log('✅ E2E test environment setup complete')
    
  } catch (error) {
    console.error('❌ Failed to set up E2E test environment:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup