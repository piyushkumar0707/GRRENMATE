// Jest setup file for testing environment configuration
import '@testing-library/jest-dom'

// Mock Next.js environment variables
process.env.NODE_ENV = 'test'
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000/api'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback
    this.options = options
    this.elements = []
  }

  observe(element) {
    this.elements.push(element)
    // Immediately trigger callback for testing
    this.callback([{
      target: element,
      isIntersecting: true,
      intersectionRatio: 1,
      boundingClientRect: element.getBoundingClientRect(),
      intersectionRect: element.getBoundingClientRect(),
      rootBounds: null,
      time: Date.now()
    }])
  }

  unobserve(element) {
    this.elements = this.elements.filter(el => el !== element)
  }

  disconnect() {
    this.elements = []
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback
    this.elements = []
  }

  observe(element) {
    this.elements.push(element)
    // Immediately trigger callback for testing
    this.callback([{
      target: element,
      contentRect: {
        width: 300,
        height: 200,
        top: 0,
        left: 0,
        bottom: 200,
        right: 300
      }
    }])
  }

  unobserve(element) {
    this.elements = this.elements.filter(el => el !== element)
  }

  disconnect() {
    this.elements = []
  }
}

// Mock PerformanceObserver
global.PerformanceObserver = class PerformanceObserver {
  constructor(callback) {
    this.callback = callback
  }

  observe() {
    // Mock implementation
  }

  disconnect() {
    // Mock implementation
  }
}

// Mock performance.mark and performance.measure
Object.defineProperty(global.performance, 'mark', {
  writable: true,
  value: jest.fn()
})

Object.defineProperty(global.performance, 'measure', {
  writable: true,
  value: jest.fn()
})

Object.defineProperty(global.performance, 'getEntriesByName', {
  writable: true,
  value: jest.fn(() => [{ duration: 100, startTime: 0 }])
})

Object.defineProperty(global.performance, 'getEntriesByType', {
  writable: true,
  value: jest.fn(() => [])
})

Object.defineProperty(global.performance, 'memory', {
  writable: true,
  value: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000
  }
})

// Mock navigator properties
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true
})

Object.defineProperty(navigator, 'connection', {
  writable: true,
  value: {
    effectiveType: '4g',
    downlink: 10,
    rtt: 50,
    saveData: false
  }
})

Object.defineProperty(navigator, 'share', {
  writable: true,
  value: jest.fn(() => Promise.resolve())
})

Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: jest.fn(() => Promise.resolve())
  }
})

Object.defineProperty(navigator, 'hardwareConcurrency', {
  writable: true,
  value: 4
})

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock window.scroll
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url')
global.URL.revokeObjectURL = jest.fn()

// Mock File and FileReader
global.File = class MockFile {
  constructor(fileBits, fileName, options = {}) {
    this.name = fileName
    this.size = fileBits.reduce((size, bit) => size + bit.length, 0)
    this.type = options.type || ''
    this.lastModified = Date.now()
  }
}

global.FileReader = class MockFileReader {
  constructor() {
    this.result = null
    this.error = null
    this.readyState = 0
    this.onload = null
    this.onerror = null
    this.onabort = null
    this.onloadend = null
  }

  readAsDataURL(file) {
    this.readyState = 2
    this.result = 'data:image/png;base64,mock-base64-string'
    if (this.onload) {
      this.onload({ target: this })
    }
  }

  readAsText(file) {
    this.readyState = 2
    this.result = 'mock file content'
    if (this.onload) {
      this.onload({ target: this })
    }
  }
}

// Mock WebSocket
global.WebSocket = class MockWebSocket {
  constructor(url) {
    this.url = url
    this.readyState = 1
    this.onopen = null
    this.onmessage = null
    this.onerror = null
    this.onclose = null
  }

  send(data) {
    // Mock send implementation
  }

  close() {
    this.readyState = 3
    if (this.onclose) {
      this.onclose({ code: 1000, reason: 'Normal closure' })
    }
  }
}

// Mock Audio
global.Audio = class MockAudio {
  constructor() {
    this.src = ''
    this.volume = 1
    this.muted = false
    this.paused = true
    this.currentTime = 0
    this.duration = 0
    this.onloadeddata = null
    this.onerror = null
  }

  play() {
    this.paused = false
    return Promise.resolve()
  }

  pause() {
    this.paused = true
  }
}

// Console error suppression for known issues
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (
        args[0].includes('Warning: ReactDOM.render is no longer supported') ||
        args[0].includes('Warning: validateDOMNesting') ||
        args[0].includes('Error: Not implemented: HTMLCanvasElement.prototype.getContext')
      )
    ) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

// Global test utilities
global.createMockFile = (name = 'test.jpg', type = 'image/jpeg', content = 'mock content') => {
  return new File([content], name, { type })
}

global.createMockEvent = (type = 'click', properties = {}) => {
  const event = new Event(type, { bubbles: true, cancelable: true })
  Object.assign(event, properties)
  return event
}

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated'
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(() => Promise.resolve(null)),
  SessionProvider: ({ children }) => children,
}))

// Enhanced debugging for failed tests
if (process.env.DEBUG_TESTS) {
  beforeEach(() => {
    console.log(`Starting test: ${expect.getState().currentTestName}`)
  })

  afterEach(() => {
    console.log(`Completed test: ${expect.getState().currentTestName}`)
  })
}