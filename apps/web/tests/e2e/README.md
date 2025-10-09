# End-to-End (E2E) Testing Guide

This directory contains comprehensive E2E tests for the GreenMate application using [Playwright](https://playwright.dev/).

## 📁 Directory Structure

```
tests/e2e/
├── config/                    # Configuration files
│   ├── playwright.config.ts   # Main Playwright config
│   ├── playwright-mobile.config.ts  # Mobile-specific config
│   └── playwright-visual.config.ts  # Visual regression config
├── examples/                  # Example test files
│   ├── user-journey.spec.ts   # Complete user journey tests
│   └── performance.spec.ts    # Performance & accessibility tests
├── fixtures/                  # Test data and mock responses
│   └── test-data.ts          # Mock users, plants, posts, etc.
├── utils/                    # Test utilities and helpers
│   ├── test-helpers.ts       # Page object model helpers
│   └── api-mocks.ts         # API mocking utilities
├── global-setup.ts          # Global test setup
├── global-teardown.ts       # Global test cleanup
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Application built and running locally
3. Playwright installed

### Installation

```bash
# Install Playwright and browsers
npm install --save-dev @playwright/test
npx playwright install

# Or install specific browsers
npx playwright install chromium firefox webkit
```

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test examples/user-journey.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run mobile tests
npx playwright test --config=playwright-mobile.config.ts

# Run visual regression tests
npx playwright test --config=playwright-visual.config.ts

# Debug specific test
npx playwright test --debug examples/user-journey.spec.ts
```

### Viewing Results

```bash
# Open HTML report
npx playwright show-report

# Generate and open trace viewer (for debugging)
npx playwright show-trace test-results/[test-name]/trace.zip
```

## 📝 Test Categories

### 1. User Journey Tests (`examples/user-journey.spec.ts`)

Complete end-to-end user workflows including:

- **Plant Management**
  - Adding, editing, deleting plants
  - Care tracking and reminders
  - Photo uploads
  - Search and filtering

- **Community Features**
  - Browsing and creating posts
  - Commenting and interactions
  - Category filtering

- **Mobile Experience**
  - Touch interactions
  - Mobile navigation
  - Responsive behavior

- **New User Onboarding**
  - First-time user experience
  - Empty states
  - Getting started flows

- **Error Handling**
  - Network failures
  - Form validation
  - Authentication errors

### 2. Performance Tests (`examples/performance.spec.ts`)

Performance and quality measurements:

- **Core Web Vitals**
  - Largest Contentful Paint (LCP)
  - First Input Delay (FID)
  - Cumulative Layout Shift (CLS)

- **Page Load Performance**
  - Time to interactive
  - Network requests
  - JavaScript bundle size

- **Accessibility Testing**
  - Keyboard navigation
  - Screen reader compatibility
  - Color contrast
  - WCAG compliance

- **SEO Validation**
  - Meta tags
  - Structured data
  - Open Graph tags
  - Sitemap and robots.txt

## 🛠️ Writing Tests

### Basic Test Structure

```typescript
import { test, expect } from '@playwright/test'
import { TestHelpers } from '../utils/test-helpers'
import { MockScenarios } from '../utils/api-mocks'

test.describe('Feature Tests', () => {
  let helpers: TestHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new TestHelpers(page)
    await MockScenarios.authenticatedUser(page)
  })

  test('should perform user action', async ({ page }) => {
    await helpers.navigateToHome()
    await helpers.expectPageTitle('GreenMate')
    
    // Your test logic here
  })
})
```

### Using Test Helpers

The `TestHelpers` class provides convenient methods for common actions:

```typescript
// Navigation
await helpers.navigateToHome()
await helpers.navigateToPlants()
await helpers.navigateToCommunity()

// User actions
await helpers.signIn()
await helpers.addPlant(plantData)
await helpers.logCareAction('plant-id', 'watering')
await helpers.createPost(title, content)

// Assertions
await helpers.expectElementVisible('[data-testid="element"]')
await helpers.expectPageTitle('Expected Title')
await helpers.expectToastMessage('Success message')

// Performance
const loadTime = await helpers.measurePageLoadTime()
const vitals = await helpers.checkCoreWebVitals()
```

### API Mocking

Use `MockScenarios` to set up different test environments:

```typescript
// Authenticated user with plants
await MockScenarios.authenticatedUser(page)

// New user with no data
await MockScenarios.newUser(page)

// Unauthenticated user
await MockScenarios.unauthenticatedUser(page)

// Server errors
await MockScenarios.serverErrors(page)

// Slow responses
await MockScenarios.slowResponses(page, 3000)
```

### Custom API Mocks

```typescript
import { ApiMockManager } from '../utils/api-mocks'

const mockManager = new ApiMockManager(page)
await mockManager.mockAuth('success')
await mockManager.mockPlantsApi('with-plants')
await mockManager.mockErrors(['/api/plants'], 'server')
```

## 🔧 Configuration

### Main Config (`playwright.config.ts`)

- Browser setup (Chromium, Firefox, WebKit)
- Base URL and test environment
- Screenshots and video recording
- Test parallelization
- Retry logic

### Mobile Config (`playwright-mobile.config.ts`)

- Mobile device emulation
- Touch-specific tests
- Responsive breakpoints

### Visual Config (`playwright-visual.config.ts`)

- Visual regression testing
- Screenshot comparison
- Threshold settings

## 🎯 Best Practices

### Test Design

1. **Use Page Object Model**: Organize actions in helper classes
2. **Mock External Dependencies**: Use API mocks for consistent testing
3. **Test User Journeys**: Focus on complete workflows, not just individual features
4. **Data Independence**: Each test should set up its own test data
5. **Meaningful Test Names**: Describe what the test validates

### Selectors

1. **Prefer `data-testid`**: Use semantic test IDs over CSS classes
2. **Stable Selectors**: Avoid selectors that change with UI updates
3. **Accessible Selectors**: Use ARIA attributes and semantic HTML

```typescript
// Good
await page.click('[data-testid="add-plant-button"]')
await page.click('button:has-text("Add Plant")')

// Avoid
await page.click('.btn-primary.plant-add-btn')
await page.click('div > button:nth-child(2)')
```

### Assertions

1. **Wait for Elements**: Use Playwright's auto-waiting features
2. **Meaningful Messages**: Provide context in assertion failures
3. **Visual Feedback**: Check for loading states and user feedback

```typescript
// Good
await expect(page.locator('[data-testid="success-message"]'))
  .toContainText('Plant added successfully')

// Also good
await helpers.expectToastMessage('Plant added successfully')
```

### Test Data

1. **Use Factories**: Generate test data with factory functions
2. **Realistic Data**: Use meaningful names and values
3. **Edge Cases**: Test with various data scenarios

```typescript
const plant = TestDataFactory.createPlant({
  name: 'Test Monstera',
  species: 'Monstera deliciosa'
})
```

## 🐛 Debugging

### Debug Mode

```bash
# Run single test in debug mode
npx playwright test --debug examples/user-journey.spec.ts

# Debug specific test by name
npx playwright test --debug -g "should add a new plant"
```

### Screenshots and Videos

Tests automatically capture screenshots on failure and videos for failed tests. Find them in the `test-results/` directory.

### Trace Files

Enable trace recording for detailed debugging:

```typescript
// In test configuration
use: {
  trace: 'on-first-retry',
}
```

View traces with:
```bash
npx playwright show-trace test-results/[test-name]/trace.zip
```

### Console Logging

Add debug information to tests:

```typescript
console.log('Current URL:', page.url())
await helpers.debugElement('[data-testid="plants-grid"]')
```

## 🔄 CI/CD Integration

### GitHub Actions

The E2E tests run automatically on:
- Pull requests
- Pushes to main/develop
- Daily scheduled runs

See `.github/workflows/e2e-tests.yml` for the complete workflow.

### Test Sharding

Tests are distributed across multiple workers for faster execution:

```bash
# Run tests in parallel shards
npx playwright test --shard=1/4
npx playwright test --shard=2/4
```

### Reports

- HTML reports are generated for each test run
- Visual regression screenshots are uploaded on failures
- Reports are merged and published to GitHub Pages for main branch

## 📊 Monitoring and Reporting

### Performance Metrics

Tests automatically collect:
- Page load times
- Core Web Vitals
- Memory usage
- Network requests

### Accessibility Scores

Basic accessibility checks include:
- Missing alt text on images
- Form label associations
- Heading hierarchy
- ARIA attributes

### Visual Regression

Screenshots are compared against baseline images to catch visual changes:

```bash
# Update visual baselines
npx playwright test --config=playwright-visual.config.ts --update-snapshots
```

## 🤝 Contributing

### Adding New Tests

1. Create test files in appropriate directories
2. Use existing helpers and utilities
3. Follow naming conventions
4. Add test data to fixtures if needed
5. Update this README if adding new patterns

### Helper Functions

Add reusable actions to `utils/test-helpers.ts`:

```typescript
export class TestHelpers {
  async customAction(params: any) {
    // Implementation
  }
}
```

### Mock Data

Add new test data to `fixtures/test-data.ts`:

```typescript
export const mockNewFeature = {
  // Mock data structure
}
```

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Integration](https://playwright.dev/docs/ci)

## 🆘 Troubleshooting

### Common Issues

1. **Tests fail in CI but pass locally**
   - Check for timing issues and race conditions
   - Ensure proper waits for network requests
   - Verify test data isolation

2. **Flaky tests**
   - Use Playwright's auto-waiting features
   - Add explicit waits for dynamic content
   - Check for proper test cleanup

3. **Visual regression failures**
   - Update baselines after intentional UI changes
   - Check for font rendering differences between environments
   - Verify consistent test data

4. **Performance test failures**
   - Check for network throttling in CI
   - Verify production build is being tested
   - Account for CI environment differences

### Getting Help

- Check existing test examples
- Review Playwright documentation
- Ask team members for guidance
- Create GitHub issues for bugs or improvements