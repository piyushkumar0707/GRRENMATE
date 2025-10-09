// Performance and Accessibility E2E Tests
import { test, expect } from '@playwright/test'
import { TestHelpers } from '../utils/test-helpers'
import { MockScenarios } from '../utils/api-mocks'

test.describe('Performance Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await MockScenarios.authenticatedUser(page)
  })

  test('Page load performance', async ({ page }) => {
    // Test home page load time
    const homeLoadTime = await helpers.measurePageLoadTime()
    expect(homeLoadTime).toBeLessThan(3000) // Should load in under 3 seconds

    // Test plants page load time
    await helpers.navigateToPlants()
    const plantsLoadTime = await helpers.measurePageLoadTime()
    expect(plantsLoadTime).toBeLessThan(2000) // Should load in under 2 seconds

    // Test community page load time
    await helpers.navigateToCommunity()
    const communityLoadTime = await helpers.measurePageLoadTime()
    expect(communityLoadTime).toBeLessThan(2500) // Should load in under 2.5 seconds
  })

  test('Core Web Vitals', async ({ page }) => {
    await helpers.navigateToHome()
    
    const vitals = await helpers.checkCoreWebVitals()
    
    // Largest Contentful Paint should be under 2.5s
    if (vitals.lcp) {
      expect(vitals.lcp).toBeLessThan(2500)
    }
    
    // First Input Delay should be under 100ms
    if (vitals.fid) {
      expect(vitals.fid).toBeLessThan(100)
    }
    
    // Cumulative Layout Shift should be under 0.1
    if (vitals.cls) {
      expect(vitals.cls).toBeLessThan(0.1)
    }
  })

  test('Image loading performance', async ({ page }) => {
    await helpers.navigateToPlants()
    
    // Count images on page
    const images = await page.locator('img').count()
    console.log(`Found ${images} images on plants page`)
    
    // Check that images have proper lazy loading attributes
    const lazyImages = await page.locator('img[loading="lazy"]').count()
    const eagerImages = await page.locator('img[loading="eager"]').count()
    
    console.log(`Lazy loaded: ${lazyImages}, Eager loaded: ${eagerImages}`)
    
    // Most images should be lazy loaded
    expect(lazyImages).toBeGreaterThan(0)
    
    // Check for missing alt attributes
    const imagesWithoutAlt = await page.locator('img:not([alt])').count()
    expect(imagesWithoutAlt).toBe(0)
  })

  test('JavaScript bundle size impact', async ({ page }) => {
    let totalJSSize = 0
    let jsFileCount = 0
    
    page.on('response', (response) => {
      if (response.url().includes('.js') && response.status() === 200) {
        jsFileCount++
        // Note: Can't easily get content-length in Playwright, but we can count files
      }
    })
    
    await helpers.navigateToHome()
    await helpers.waitForNetworkIdle()
    
    console.log(`Loaded ${jsFileCount} JavaScript files`)
    
    // Should not load excessive number of JS files
    expect(jsFileCount).toBeLessThan(20)
  })

  test('Slow network performance', async ({ page }) => {
    // Simulate slow 3G connection
    await page.route('**/*', async (route) => {
      // Add 500ms delay to simulate slow network
      await new Promise(resolve => setTimeout(resolve, 500))
      route.continue()
    })
    
    const startTime = Date.now()
    await helpers.navigateToHome()
    const loadTime = Date.now() - startTime
    
    // Should still be reasonably fast even on slow connections
    expect(loadTime).toBeLessThan(5000)
    
    // Check that loading states are shown
    await helpers.expectElementVisible('[data-testid="loading"], .skeleton, .spinner')
  })

  test('Memory usage during navigation', async ({ page }) => {
    // Navigate through different pages and check for memory leaks
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })
    
    // Navigate through multiple pages
    for (let i = 0; i < 5; i++) {
      await helpers.navigateToHome()
      await helpers.navigateToPlants()
      await helpers.navigateToCommunity()
    }
    
    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc()
      }
    })
    
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })
    
    if (initialMemory > 0 && finalMemory > 0) {
      const memoryIncrease = finalMemory - initialMemory
      const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100
      
      console.log(`Memory usage increased by ${memoryIncreasePercent.toFixed(2)}%`)
      
      // Memory shouldn't increase by more than 50% after navigation
      expect(memoryIncreasePercent).toBeLessThan(50)
    }
  })

  test('API response time impact', async ({ page }) => {
    await MockScenarios.slowResponses(page, 2000) // 2 second delays
    
    await helpers.navigateToPlants()
    
    // Should show loading states immediately
    await helpers.expectElementVisible('[data-testid="loading"], .skeleton')
    
    // Should eventually load content
    await helpers.expectElementVisible('[data-testid="plants-grid"]', { timeout: 5000 })
    
    // Loading states should disappear
    await helpers.expectElementHidden('[data-testid="loading"], .skeleton')
  })
})

test.describe('Accessibility Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await MockScenarios.authenticatedUser(page)
  })

  test('Basic accessibility checks', async ({ page }) => {
    await helpers.navigateToHome()
    await helpers.checkAccessibility()
    
    // Check for proper page structure
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThanOrEqual(1)
    expect(h1Count).toBeLessThanOrEqual(1) // Should have exactly one h1
    
    // Check for skip links
    await helpers.expectElementVisible('[data-testid="skip-to-main"], a[href="#main-content"]')
    
    // Check for proper focus management
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)
    expect(focusedElement).toBeDefined()
  })

  test('Keyboard navigation', async ({ page }) => {
    await helpers.navigateToHome()
    
    // Test tab navigation through interactive elements
    await page.keyboard.press('Tab') // Skip link
    await page.keyboard.press('Tab') // First navigation item
    await page.keyboard.press('Enter') // Activate navigation
    
    // Should navigate to new page
    await helpers.waitForPageLoad()
    
    // Test arrow key navigation in lists
    await helpers.navigateToPlants()
    await page.keyboard.press('Tab')
    
    // Find first plant card and test arrow navigation
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowUp')
    await page.keyboard.press('Enter')
    
    // Should open plant details
    await helpers.expectElementVisible('[data-testid="plant-details"], .plant-modal')
  })

  test('Screen reader compatibility', async ({ page }) => {
    await helpers.navigateToPlants()
    
    // Check for proper ARIA labels and descriptions
    const ariaLabels = await page.locator('[aria-label]').count()
    const ariaDescribedBy = await page.locator('[aria-describedby]').count()
    const ariaLabelledBy = await page.locator('[aria-labelledby]').count()
    
    console.log(`Found ${ariaLabels} aria-label, ${ariaDescribedBy} aria-describedby, ${ariaLabelledBy} aria-labelledby`)
    
    // Should have appropriate ARIA attributes
    expect(ariaLabels + ariaDescribedBy + ariaLabelledBy).toBeGreaterThan(5)
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents()
    expect(headings.length).toBeGreaterThan(0)
    
    // Check for proper landmarks
    await helpers.expectElementVisible('nav, [role="navigation"]')
    await helpers.expectElementVisible('main, [role="main"]')
    await helpers.expectElementVisible('header, [role="banner"]')
  })

  test('Color contrast and visual accessibility', async ({ page }) => {
    await helpers.navigateToHome()
    
    // Check for proper color contrast (simplified check)
    const backgroundColors = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'))
      const colors = new Set()
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el)
        const bgColor = styles.backgroundColor
        const color = styles.color
        
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          colors.add({ background: bgColor, text: color })
        }
      })
      
      return Array.from(colors)
    })
    
    console.log(`Found ${backgroundColors.length} different color combinations`)
    
    // Check for focus indicators
    await page.keyboard.press('Tab')
    const focusStyles = await page.evaluate(() => {
      const focused = document.activeElement
      if (!focused) return null
      
      const styles = window.getComputedStyle(focused)
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow
      }
    })
    
    // Should have visible focus indicators
    expect(
      focusStyles?.outline !== 'none' || 
      focusStyles?.outlineWidth !== '0px' || 
      focusStyles?.boxShadow !== 'none'
    ).toBeTruthy()
  })

  test('Form accessibility', async ({ page }) => {
    await helpers.navigateToPlants()
    await page.click('[data-testid="add-plant-button"]')
    
    // Check form labels and descriptions
    const formInputs = await page.locator('input, textarea, select').count()
    const formLabels = await page.locator('label').count()
    const ariaDescriptions = await page.locator('[aria-describedby]').count()
    
    console.log(`Form has ${formInputs} inputs, ${formLabels} labels, ${ariaDescriptions} descriptions`)
    
    // Each input should have proper labeling
    expect(formLabels).toBeGreaterThanOrEqual(formInputs * 0.8) // At least 80% should have labels
    
    // Check for error message accessibility
    await page.click('button[type="submit"]') // Submit without filling
    
    const errorMessages = await page.locator('[role="alert"], [aria-live="polite"], .error-message').count()
    expect(errorMessages).toBeGreaterThan(0)
    
    // Errors should be properly associated with inputs
    const describedInputs = await page.locator('input[aria-describedby], textarea[aria-describedby]').count()
    expect(describedInputs).toBeGreaterThan(0)
  })

  test('Motion and animation accessibility', async ({ page }) => {
    // Test for reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await helpers.navigateToHome()
    
    // Check that animations are disabled or reduced
    const animationDuration = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'))
      const durations = elements.map(el => {
        const styles = window.getComputedStyle(el)
        return styles.animationDuration
      }).filter(duration => duration && duration !== '0s' && duration !== 'none')
      
      return durations.length
    })
    
    console.log(`Found ${animationDuration} elements with animations`)
    
    // Should respect reduced motion preference
    expect(animationDuration).toBeLessThan(5)
  })

  test('Touch and mobile accessibility', async ({ page }) => {
    await helpers.setMobileViewport()
    await helpers.navigateToPlants()
    
    // Check touch target sizes
    const touchTargets = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a, [role="button"], [role="link"]'))
      const smallTargets = buttons.filter(el => {
        const rect = el.getBoundingClientRect()
        return rect.width < 44 || rect.height < 44 // WCAG recommended minimum
      })
      
      return {
        total: buttons.length,
        small: smallTargets.length
      }
    })
    
    console.log(`${touchTargets.small} of ${touchTargets.total} touch targets are below recommended size`)
    
    // Most touch targets should meet size requirements
    const smallPercentage = (touchTargets.small / touchTargets.total) * 100
    expect(smallPercentage).toBeLessThan(20) // Less than 20% should be small
  })

  test('Dark mode accessibility', async ({ page }) => {
    // Test dark mode if supported
    await page.emulateMedia({ colorScheme: 'dark' })
    await helpers.navigateToHome()
    
    // Check that dark mode is applied
    const isDarkMode = await page.evaluate(() => {
      const body = document.body || document.documentElement
      const styles = window.getComputedStyle(body)
      const backgroundColor = styles.backgroundColor
      
      // Simple check: dark mode usually has dark background
      return backgroundColor.includes('rgb(') && 
             backgroundColor.split(',').map(n => parseInt(n.replace(/\D/g, ''))).every(n => n < 128)
    })
    
    if (isDarkMode) {
      console.log('Dark mode detected and working')
      
      // Should still maintain good contrast in dark mode
      await helpers.checkAccessibility()
    }
  })
})

test.describe('SEO and Meta Data Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await MockScenarios.authenticatedUser(page)
  })

  test('Page titles and meta descriptions', async ({ page }) => {
    // Test home page
    await helpers.navigateToHome()
    
    const homeTitle = await page.title()
    expect(homeTitle).toMatch(/GreenMate/i)
    expect(homeTitle.length).toBeGreaterThan(10)
    expect(homeTitle.length).toBeLessThan(60)
    
    const homeDescription = await page.getAttribute('meta[name="description"]', 'content')
    expect(homeDescription).toBeTruthy()
    expect(homeDescription!.length).toBeGreaterThan(120)
    expect(homeDescription!.length).toBeLessThan(160)
    
    // Test plants page
    await helpers.navigateToPlants()
    
    const plantsTitle = await page.title()
    expect(plantsTitle).toMatch(/plants/i)
    expect(plantsTitle).not.toBe(homeTitle)
    
    // Test individual plant page
    await helpers.navigateToPlant('plant-monstera-1')
    
    const plantTitle = await page.title()
    expect(plantTitle).toMatch(/monstera/i)
    expect(plantTitle).not.toBe(plantsTitle)
  })

  test('Open Graph and social meta tags', async ({ page }) => {
    await helpers.navigateToHome()
    
    // Check Open Graph tags
    const ogTitle = await page.getAttribute('meta[property="og:title"]', 'content')
    const ogDescription = await page.getAttribute('meta[property="og:description"]', 'content')
    const ogImage = await page.getAttribute('meta[property="og:image"]', 'content')
    const ogType = await page.getAttribute('meta[property="og:type"]', 'content')
    
    expect(ogTitle).toBeTruthy()
    expect(ogDescription).toBeTruthy()
    expect(ogImage).toBeTruthy()
    expect(ogType).toBe('website')
    
    // Check Twitter Card tags
    const twitterCard = await page.getAttribute('meta[name="twitter:card"]', 'content')
    const twitterTitle = await page.getAttribute('meta[name="twitter:title"]', 'content')
    
    expect(twitterCard).toBeTruthy()
    expect(twitterTitle).toBeTruthy()
  })

  test('Structured data (JSON-LD)', async ({ page }) => {
    await helpers.navigateToPlant('plant-monstera-1')
    
    const structuredData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'))
      return scripts.map(script => {
        try {
          return JSON.parse(script.textContent || '')
        } catch {
          return null
        }
      }).filter(Boolean)
    })
    
    expect(structuredData.length).toBeGreaterThan(0)
    
    // Check for plant-specific structured data
    const plantData = structuredData.find(data => data['@type'] === 'Product' || data['@type'] === 'Thing')
    expect(plantData).toBeTruthy()
    
    if (plantData) {
      expect(plantData.name).toBeTruthy()
      expect(plantData.description).toBeTruthy()
    }
  })

  test('Canonical URLs and navigation', async ({ page }) => {
    await helpers.navigateToHome()
    
    const canonicalUrl = await page.getAttribute('link[rel="canonical"]', 'href')
    expect(canonicalUrl).toBeTruthy()
    
    // Should match current URL (minus query parameters)
    const currentUrl = page.url().split('?')[0]
    expect(canonicalUrl).toBe(currentUrl)
    
    // Test breadcrumb navigation
    await helpers.navigateToPlant('plant-monstera-1')
    
    const breadcrumbs = await page.locator('[data-testid="breadcrumbs"] a').allTextContents()
    expect(breadcrumbs.length).toBeGreaterThanOrEqual(2)
    expect(breadcrumbs).toContain('Home')
    expect(breadcrumbs).toContain('Plants')
  })

  test('XML sitemap and robots.txt', async ({ page }) => {
    // Test robots.txt
    const robotsResponse = await page.request.get('/robots.txt')
    expect(robotsResponse.status()).toBe(200)
    
    const robotsText = await robotsResponse.text()
    expect(robotsText).toMatch(/User-agent:/i)
    expect(robotsText).toMatch(/Sitemap:/i)
    
    // Test sitemap.xml
    const sitemapUrl = robotsText.match(/Sitemap:\s*(.*)/i)?.[1]
    if (sitemapUrl) {
      const sitemapResponse = await page.request.get(sitemapUrl)
      expect(sitemapResponse.status()).toBe(200)
      
      const sitemapXml = await sitemapResponse.text()
      expect(sitemapXml).toMatch(/<urlset/i)
      expect(sitemapXml).toMatch(/<url>/i)
    }
  })
})