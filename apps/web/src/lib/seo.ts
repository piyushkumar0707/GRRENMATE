// SEO Utility Library for GreenMate
import { Metadata } from 'next'
import { Thing, WithContext, Plant, Organization, WebSite, BreadcrumbList, Article, Review, HowTo, FAQPage } from 'schema-dts'

export interface SEOConfig {
  siteName: string
  siteUrl: string
  defaultTitle: string
  defaultDescription: string
  defaultImage: string
  twitterHandle: string
  locale: string
  alternateLocales: string[]
}

export const seoConfig: SEOConfig = {
  siteName: 'GreenMate',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://greenmate.app',
  defaultTitle: 'GreenMate - Your Plant Care Companion',
  defaultDescription: 'AI-powered plant care app that helps you identify, care for, and track your plants. Get personalized care recommendations and connect with a community of plant enthusiasts.',
  defaultImage: '/images/og-default.jpg',
  twitterHandle: '@greenmate_app',
  locale: 'en_US',
  alternateLocales: ['es_ES']
}

// Dynamic metadata generation utilities
export interface PageMetadata {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  imageAlt?: string
  type?: 'website' | 'article' | 'product'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  canonicalUrl?: string
  noIndex?: boolean
  alternateUrls?: Record<string, string>
}

export function generateMetadata(page: PageMetadata): Metadata {
  const {
    title,
    description = seoConfig.defaultDescription,
    keywords = [],
    image = seoConfig.defaultImage,
    imageAlt,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags = [],
    canonicalUrl,
    noIndex = false,
    alternateUrls = {}
  } = page

  const fullTitle = title 
    ? `${title} | ${seoConfig.siteName}` 
    : seoConfig.defaultTitle

  const imageUrl = image.startsWith('http') 
    ? image 
    : `${seoConfig.siteUrl}${image}`

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    authors: author ? [{ name: author }] : undefined,
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      type: type as any,
      url: canonicalUrl || seoConfig.siteUrl,
      siteName: seoConfig.siteName,
      locale: seoConfig.locale,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt || description,
        }
      ],
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section,
      tags,
    },
    
    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      site: seoConfig.twitterHandle,
      creator: seoConfig.twitterHandle,
      title: fullTitle,
      description,
      images: [imageUrl],
    },
    
    // Additional meta tags
    robots: noIndex ? 'noindex,nofollow' : 'index,follow',
    canonical: canonicalUrl,
    alternates: Object.keys(alternateUrls).length > 0 ? {
      languages: alternateUrls
    } : undefined,
  }

  // Add alternate locales
  if (seoConfig.alternateLocales.length > 0) {
    metadata.alternates = {
      ...metadata.alternates,
      languages: {
        'x-default': canonicalUrl || seoConfig.siteUrl,
        [seoConfig.locale.toLowerCase()]: canonicalUrl || seoConfig.siteUrl,
        ...alternateUrls
      }
    }
  }

  return metadata
}

// Structured data generators
export function generateOrganizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    logo: `${seoConfig.siteUrl}/images/logo.png`,
    description: seoConfig.defaultDescription,
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/greenmate_app',
      'https://instagram.com/greenmate_app',
      'https://facebook.com/greenmate.app'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'support@greenmate.app',
      availableLanguage: ['English', 'Spanish']
    }
  }
}

export function generateWebSiteSchema(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: seoConfig.siteName,
    url: seoConfig.siteUrl,
    description: seoConfig.defaultDescription,
    inLanguage: seoConfig.locale,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${seoConfig.siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    },
    publisher: {
      '@type': 'Organization',
      name: seoConfig.siteName,
      url: seoConfig.siteUrl
    }
  }
}

export interface PlantData {
  id: string
  name: string
  scientificName?: string
  description?: string
  image?: string
  careInstructions?: {
    watering?: string
    lighting?: string
    humidity?: string
    temperature?: string
    fertilizing?: string
  }
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  size?: string
  origin?: string
  benefits?: string[]
  commonNames?: string[]
  plantType?: string
  bloomingSeason?: string
  toxicity?: string
  propagation?: string[]
}

export function generatePlantSchema(plant: PlantData): WithContext<Thing> {
  const schema: WithContext<Thing> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: plant.name,
    description: plant.description || `Learn how to care for ${plant.name}`,
    image: plant.image ? (plant.image.startsWith('http') ? plant.image : `${seoConfig.siteUrl}${plant.image}`) : undefined,
    url: `${seoConfig.siteUrl}/plants/${plant.id}`,
    identifier: plant.id,
    category: 'Houseplant',
    brand: {
      '@type': 'Brand',
      name: 'GreenMate Plant Guide'
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'InStock',
      seller: {
        '@type': 'Organization',
        name: seoConfig.siteName
      }
    }
  }

  // Add additional properties
  const additionalProperties: any = {}

  if (plant.scientificName) {
    additionalProperties.alternateName = plant.scientificName
  }

  if (plant.commonNames?.length) {
    additionalProperties.alternateName = [
      ...(Array.isArray(additionalProperties.alternateName) ? additionalProperties.alternateName : 
          additionalProperties.alternateName ? [additionalProperties.alternateName] : []),
      ...plant.commonNames
    ]
  }

  if (plant.origin) {
    additionalProperties.countryOfOrigin = plant.origin
  }

  return { ...schema, ...additionalProperties }
}

export interface CareGuideData {
  id: string
  title: string
  description: string
  plantName: string
  steps: Array<{
    name: string
    description: string
    image?: string
  }>
  tools?: string[]
  supplies?: string[]
  timeRequired?: string
  difficulty?: 'Easy' | 'Medium' | 'Hard'
  author?: string
  publishedDate?: string
  updatedDate?: string
}

export function generateHowToSchema(guide: CareGuideData): WithContext<HowTo> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: guide.title,
    description: guide.description,
    image: guide.steps[0]?.image ? `${seoConfig.siteUrl}${guide.steps[0].image}` : undefined,
    totalTime: guide.timeRequired || 'PT30M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0'
    },
    tool: guide.tools?.map(tool => ({
      '@type': 'HowToTool',
      name: tool
    })) || [],
    supply: guide.supplies?.map(supply => ({
      '@type': 'HowToSupply',
      name: supply
    })) || [],
    step: guide.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.description,
      image: step.image ? `${seoConfig.siteUrl}${step.image}` : undefined
    })),
    author: guide.author ? {
      '@type': 'Person',
      name: guide.author
    } : {
      '@type': 'Organization',
      name: seoConfig.siteName
    },
    datePublished: guide.publishedDate,
    dateModified: guide.updatedDate || guide.publishedDate
  }
}

export interface BlogPostData {
  id: string
  title: string
  description: string
  content: string
  author: string
  publishedDate: string
  updatedDate?: string
  tags: string[]
  category: string
  image?: string
  readingTime?: number
}

export function generateArticleSchema(post: BlogPostData): WithContext<Article> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    image: post.image ? `${seoConfig.siteUrl}${post.image}` : undefined,
    author: {
      '@type': 'Person',
      name: post.author
    },
    publisher: {
      '@type': 'Organization',
      name: seoConfig.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${seoConfig.siteUrl}/images/logo.png`
      }
    },
    datePublished: post.publishedDate,
    dateModified: post.updatedDate || post.publishedDate,
    mainEntityOfPage: `${seoConfig.siteUrl}/blog/${post.id}`,
    articleSection: post.category,
    keywords: post.tags.join(', '),
    wordCount: Math.ceil(post.content.length / 5), // Rough word count estimation
    timeRequired: post.readingTime ? `PT${post.readingTime}M` : undefined
  }
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${seoConfig.siteUrl}${item.url}`
    }))
  }
}

export interface FAQItem {
  question: string
  answer: string
}

export function generateFAQSchema(faqs: FAQItem[]): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// URL and slug utilities
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateCanonicalUrl(path: string, locale?: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  const localePrefix = locale && locale !== seoConfig.locale.split('_')[0] ? `/${locale}` : ''
  return `${seoConfig.siteUrl}${localePrefix}${cleanPath}`
}

// Social sharing utilities
export interface SocialShareData {
  url: string
  title: string
  description?: string
  image?: string
  via?: string
  hashtags?: string[]
}

export function generateSocialShareUrls(data: SocialShareData) {
  const encodedUrl = encodeURIComponent(data.url)
  const encodedTitle = encodeURIComponent(data.title)
  const encodedDescription = encodeURIComponent(data.description || '')
  const hashtags = data.hashtags?.join(',') || ''

  return {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}&via=${data.via || seoConfig.twitterHandle.replace('@', '')}&hashtags=${hashtags}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: data.image 
      ? `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(data.image)}&description=${encodedDescription}`
      : null,
    reddit: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle} ${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription} ${encodedUrl}`
  }
}

// Image optimization for SEO
export function generateOptimizedImageUrl(
  src: string,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'webp' | 'jpeg' | 'png'
  } = {}
): string {
  const { width = 1200, height = 630, quality = 80, format = 'webp' } = options
  
  if (src.startsWith('http')) {
    // External image - use Next.js image optimization
    const params = new URLSearchParams({
      url: src,
      w: width.toString(),
      h: height.toString(),
      q: quality.toString()
    })
    return `${seoConfig.siteUrl}/_next/image?${params.toString()}`
  }
  
  // Internal image
  return `${seoConfig.siteUrl}${src}`
}

// Rich snippet testing utilities (development only)
export function validateStructuredData(schema: any): boolean {
  try {
    // Basic validation
    if (!schema['@context'] || !schema['@type']) {
      console.warn('Missing @context or @type in structured data')
      return false
    }
    
    // Check for required fields based on type
    switch (schema['@type']) {
      case 'Product':
        if (!schema.name || !schema.description) {
          console.warn('Product schema missing required fields: name, description')
          return false
        }
        break
      case 'Article':
        if (!schema.headline || !schema.author || !schema.datePublished) {
          console.warn('Article schema missing required fields: headline, author, datePublished')
          return false
        }
        break
      case 'HowTo':
        if (!schema.name || !schema.step || schema.step.length === 0) {
          console.warn('HowTo schema missing required fields: name, step')
          return false
        }
        break
    }
    
    return true
  } catch (error) {
    console.error('Error validating structured data:', error)
    return false
  }
}

export function logSEODebugInfo(metadata: Metadata, structuredData?: any[]) {
  if (process.env.NODE_ENV === 'development') {
    console.group('🔍 SEO Debug Info')
    console.log('Metadata:', metadata)
    
    if (structuredData) {
      structuredData.forEach((schema, index) => {
        console.log(`Structured Data ${index + 1}:`, schema)
        console.log(`Valid: ${validateStructuredData(schema)}`)
      })
    }
    
    console.groupEnd()
  }
}

export default {
  generateMetadata,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generatePlantSchema,
  generateHowToSchema,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateSocialShareUrls,
  slugify,
  generateCanonicalUrl,
  seoConfig
}