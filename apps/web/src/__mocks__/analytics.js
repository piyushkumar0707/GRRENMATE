// Mock for Vercel Analytics
import { jest } from '@jest/globals'

export const Analytics = jest.fn(() => null)

export const track = jest.fn()

export const trackError = jest.fn()

export const identify = jest.fn()

export const pageview = jest.fn()

// Mock for Speed Insights
export const SpeedInsights = jest.fn(() => null)

export default {
  Analytics,
  track,
  trackError,
  identify,
  pageview
}