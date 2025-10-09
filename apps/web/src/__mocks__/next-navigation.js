// Mock for Next.js navigation hooks and components
import { jest } from '@jest/globals'

const mockRouter = {
  push: jest.fn(() => Promise.resolve(true)),
  replace: jest.fn(() => Promise.resolve(true)),
  prefetch: jest.fn(() => Promise.resolve()),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  basePath: '',
  isReady: true,
  isFallback: false,
  isPreview: false,
  isLocaleDomain: true,
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
}

export const useRouter = jest.fn(() => mockRouter)

export const usePathname = jest.fn(() => '/')

export const useSearchParams = jest.fn(() => new URLSearchParams())

export const useParams = jest.fn(() => ({}))

export const notFound = jest.fn()

export const redirect = jest.fn()

export const permanentRedirect = jest.fn()

// Reset function for tests
export const __setMockRouter = (newRouter) => {
  Object.assign(mockRouter, newRouter)
}

export const __resetMockRouter = () => {
  mockRouter.push.mockClear()
  mockRouter.replace.mockClear()
  mockRouter.prefetch.mockClear()
  mockRouter.back.mockClear()
  mockRouter.forward.mockClear()
  mockRouter.refresh.mockClear()
  mockRouter.pathname = '/'
  mockRouter.route = '/'
  mockRouter.query = {}
  mockRouter.asPath = '/'
}