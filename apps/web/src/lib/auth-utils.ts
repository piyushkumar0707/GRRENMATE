// Authentication utilities for real-time features integration
'use client'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface UserSession {
  user: {
    id: string
    email: string
    username: string
    name?: string
    role: string
    avatar?: string
    isExpert?: boolean
    expertiseAreas?: string[]
  }
  tokens: AuthTokens
  expiresAt: number
}

// Token storage keys
const ACCESS_TOKEN_KEY = 'accessToken'
const REFRESH_TOKEN_KEY = 'refreshToken'
const USER_SESSION_KEY = 'userSession'

// Get access token from storage
export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY)
}

// Set access token in storage
export const setAccessToken = (token: string, persistent = true): void => {
  if (typeof window === 'undefined') return
  
  if (persistent) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token)
  } else {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
  }
}

// Get refresh token from storage
export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

// Set refresh token in storage
export const setRefreshToken = (token: string): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

// Remove all auth tokens
export const clearAuthTokens = (): void => {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_SESSION_KEY)
  sessionStorage.removeItem(ACCESS_TOKEN_KEY)
}

// Get user session from storage
export const getUserSession = (): UserSession | null => {
  if (typeof window === 'undefined') return null
  
  const sessionData = localStorage.getItem(USER_SESSION_KEY)
  if (!sessionData) return null
  
  try {
    const session = JSON.parse(sessionData) as UserSession
    
    // Check if session is expired
    if (Date.now() >= session.expiresAt) {
      clearAuthTokens()
      return null
    }
    
    return session
  } catch {
    return null
  }
}

// Set user session in storage
export const setUserSession = (session: UserSession): void => {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session))
  setAccessToken(session.tokens.accessToken)
  setRefreshToken(session.tokens.refreshToken)
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const session = getUserSession()
  return session !== null && getAccessToken() !== null
}

// Refresh access token
export const refreshAccessToken = async (): Promise<AuthTokens | null> => {
  const refreshToken = getRefreshToken()
  
  if (!refreshToken) {
    return null
  }
  
  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    })
    
    if (!response.ok) {
      throw new Error('Failed to refresh token')
    }
    
    const { accessToken, refreshToken: newRefreshToken } = await response.json()
    
    const tokens = {
      accessToken,
      refreshToken: newRefreshToken
    }
    
    setAccessToken(accessToken)
    setRefreshToken(newRefreshToken)
    
    // Update session with new tokens
    const session = getUserSession()
    if (session) {
      session.tokens = tokens
      // Extend expiration by 15 minutes (typical access token lifetime)
      session.expiresAt = Date.now() + (15 * 60 * 1000)
      setUserSession(session)
    }
    
    return tokens
  } catch (error) {
    console.error('Failed to refresh access token:', error)
    clearAuthTokens()
    return null
  }
}

// Make authenticated API request with automatic token refresh
export const makeAuthenticatedRequest = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let accessToken = getAccessToken()
  
  if (!accessToken) {
    throw new Error('No access token available')
  }
  
  const makeRequest = (token: string) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  }
  
  let response = await makeRequest(accessToken)
  
  // If token is expired, try to refresh
  if (response.status === 401) {
    const refreshedTokens = await refreshAccessToken()
    
    if (refreshedTokens) {
      response = await makeRequest(refreshedTokens.accessToken)
    } else {
      throw new Error('Authentication failed')
    }
  }
  
  return response
}

// Login function
export const login = async (email: string, password: string): Promise<UserSession> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Login failed')
  }
  
  const { user, accessToken, refreshToken } = await response.json()
  
  const session: UserSession = {
    user,
    tokens: { accessToken, refreshToken },
    expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes
  }
  
  setUserSession(session)
  
  return session
}

// Logout function
export const logout = async (): Promise<void> => {
  const refreshToken = getRefreshToken()
  
  try {
    if (refreshToken) {
      await makeAuthenticatedRequest('/api/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken })
      })
    }
  } catch (error) {
    console.error('Logout API call failed:', error)
  } finally {
    clearAuthTokens()
    
    // Emit logout event for other components
    window.dispatchEvent(new CustomEvent('auth-logout'))
  }
}

// Hook for authentication state management
export const useAuthState = () => {
  const [session, setSession] = React.useState<UserSession | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  
  React.useEffect(() => {
    // Check for existing session
    const existingSession = getUserSession()
    setSession(existingSession)
    setIsLoading(false)
    
    // Listen for auth events
    const handleAuthLogout = () => {
      setSession(null)
    }
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === USER_SESSION_KEY) {
        const newSession = getUserSession()
        setSession(newSession)
      }
    }
    
    window.addEventListener('auth-logout', handleAuthLogout)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('auth-logout', handleAuthLogout)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  const loginUser = async (email: string, password: string) => {
    try {
      const newSession = await login(email, password)
      setSession(newSession)
      return newSession
    } catch (error) {
      throw error
    }
  }
  
  const logoutUser = async () => {
    await logout()
    setSession(null)
  }
  
  return {
    session,
    user: session?.user || null,
    isAuthenticated: !!session,
    isLoading,
    login: loginUser,
    logout: logoutUser
  }
}

// Export React import for the hook
import React from 'react'