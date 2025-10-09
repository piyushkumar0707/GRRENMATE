import { useRouter } from 'next/router'
import { useTranslation as useNextTranslation, i18n } from 'next-i18next'
import { createContext, useContext } from 'react'

// Translation interface for type safety
export interface Translations {
  [key: string]: string | Translations
}

// Language configuration
export const SUPPORTED_LANGUAGES = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    rtl: false,
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    rtl: false,
  },
} as const

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES

// Language context for sharing language state
interface LanguageContextType {
  currentLanguage: SupportedLanguage
  changeLanguage: (language: SupportedLanguage) => Promise<void>
  isLoading: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Enhanced useTranslation hook
export function useTranslation(namespace?: string | string[]) {
  const { t, i18n: i18nInstance, ready } = useNextTranslation(namespace)
  const router = useRouter()
  
  const currentLanguage = (router.locale || 'en') as SupportedLanguage
  
  const changeLanguage = async (language: SupportedLanguage) => {
    // Change the route to the new language
    await router.push(router.asPath, router.asPath, { locale: language })
  }
  
  // Helper function for pluralization
  const tp = (key: string, count: number, options?: any) => {
    return t(key, { count, ...options })
  }
  
  // Helper function for interpolation with React components
  const tr = (key: string, components?: Record<string, React.ReactNode>) => {
    return t(key, { returnObjects: false, ...components })
  }
  
  // Helper function to check if translation exists
  const exists = (key: string, namespace?: string) => {
    return i18nInstance.exists(namespace ? `${namespace}:${key}` : key)
  }
  
  // Helper function to get translation in specific language
  const getTranslation = (key: string, language: SupportedLanguage, options?: any) => {
    return i18nInstance.getFixedT(language)(key, options)
  }
  
  // Helper function to format numbers according to locale
  const formatNumber = (number: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(currentLanguage, options).format(number)
  }
  
  // Helper function to format currency
  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency,
    }).format(amount)
  }
  
  // Helper function to format dates
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
    return new Intl.DateTimeFormat(currentLanguage, { ...defaultOptions, ...options }).format(date)
  }
  
  // Helper function to format relative time
  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    const rtf = new Intl.RelativeTimeFormat(currentLanguage, { numeric: 'auto' })
    
    if (diffInSeconds < 60) {
      return rtf.format(-diffInSeconds, 'second')
    } else if (diffInSeconds < 3600) {
      return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
    } else if (diffInSeconds < 86400) {
      return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
    } else if (diffInSeconds < 2592000) {
      return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
    } else if (diffInSeconds < 31536000) {
      return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
    } else {
      return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
    }
  }
  
  return {
    t,
    tp,
    tr,
    exists,
    getTranslation,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
    currentLanguage,
    changeLanguage,
    ready,
    languages: SUPPORTED_LANGUAGES,
    isRTL: SUPPORTED_LANGUAGES[currentLanguage]?.rtl || false,
  }
}

// Plant-specific translation helpers
export function usePlantTranslations() {
  const { t } = useTranslation('plants')
  
  const getDifficultyText = (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
    return t(`difficulty.${difficulty}`)
  }
  
  const getSizeText = (size: 'SMALL' | 'MEDIUM' | 'LARGE') => {
    return t(`size.${size}`)
  }
  
  const getLightRequirementText = (light: 'LOW' | 'MEDIUM' | 'HIGH' | 'DIRECT') => {
    return t(`lightRequirements.${light}`)
  }
  
  const getPurposeText = (purpose: 'DECORATIVE' | 'AIR_FILTERING' | 'EDIBLE' | 'MEDICINAL' | 'AROMATIC') => {
    return t(`purposes.${purpose}`)
  }
  
  return {
    getDifficultyText,
    getSizeText,
    getLightRequirementText,
    getPurposeText,
  }
}

// Common translation helpers
export function useCommonTranslations() {
  const { t, formatDate, formatRelativeTime } = useTranslation('common')
  
  const getStatusText = (status: string) => {
    return t(status, { defaultValue: status })
  }
  
  const getActionText = (action: string) => {
    return t(action, { defaultValue: action })
  }
  
  const formatLastSeen = (date: Date) => {
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) {
      return t('today')
    } else if (diffInDays === 1) {
      return t('yesterday')
    } else {
      return formatRelativeTime(date)
    }
  }
  
  return {
    getStatusText,
    getActionText,
    formatLastSeen,
  }
}

// Language detection and browser preference
export function detectLanguage(): SupportedLanguage {
  if (typeof window === 'undefined') return 'en'
  
  // Check localStorage first
  const stored = localStorage.getItem('greenmate-language') as SupportedLanguage
  if (stored && stored in SUPPORTED_LANGUAGES) {
    return stored
  }
  
  // Check browser language
  const browserLang = navigator.language.slice(0, 2) as SupportedLanguage
  if (browserLang in SUPPORTED_LANGUAGES) {
    return browserLang
  }
  
  // Fallback to English
  return 'en'
}

// Save language preference
export function saveLanguagePreference(language: SupportedLanguage) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('greenmate-language', language)
  }
}

// Translation validation helper
export function validateTranslations(translations: any, requiredKeys: string[]): string[] {
  const missingKeys: string[] = []
  
  for (const key of requiredKeys) {
    const keyPath = key.split('.')
    let current = translations
    
    for (const path of keyPath) {
      if (!current || typeof current !== 'object' || !(path in current)) {
        missingKeys.push(key)
        break
      }
      current = current[path]
    }
  }
  
  return missingKeys
}

// Translation key extractor for development
export function extractTranslationKeys(text: string): string[] {
  const regex = /t\(['"`]([^'"`]+)['"`]\)/g
  const keys: string[] = []
  let match
  
  while ((match = regex.exec(text)) !== null) {
    keys.push(match[1])
  }
  
  return [...new Set(keys)] // Remove duplicates
}

// Dynamic translation loader
export async function loadTranslations(
  language: SupportedLanguage,
  namespaces: string[]
): Promise<Record<string, any>> {
  const translations: Record<string, any> = {}
  
  for (const namespace of namespaces) {
    try {
      const response = await fetch(`/locales/${language}/${namespace}.json`)
      if (response.ok) {
        translations[namespace] = await response.json()
      }
    } catch (error) {
      console.warn(`Failed to load translations for ${namespace} in ${language}:`, error)
    }
  }
  
  return translations
}

// Translation completeness checker
export function checkTranslationCompleteness(
  baseLanguage: SupportedLanguage,
  targetLanguage: SupportedLanguage,
  namespace: string
): Promise<{ missing: string[], total: number, completed: number }> {
  return Promise.all([
    fetch(`/locales/${baseLanguage}/${namespace}.json`).then(r => r.json()),
    fetch(`/locales/${targetLanguage}/${namespace}.json`).then(r => r.json()),
  ]).then(([baseTranslations, targetTranslations]) => {
    const getAllKeys = (obj: any, prefix = ''): string[] => {
      const keys: string[] = []
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          keys.push(...getAllKeys(obj[key], fullKey))
        } else {
          keys.push(fullKey)
        }
      }
      return keys
    }
    
    const baseKeys = getAllKeys(baseTranslations)
    const missing = validateTranslations(targetTranslations, baseKeys)
    
    return {
      missing,
      total: baseKeys.length,
      completed: baseKeys.length - missing.length,
    }
  })
}

// Export types for use in components
export type UseTranslationReturn = ReturnType<typeof useTranslation>