// Tests for SEO utility functions
import { describe, it, expect, beforeEach } from '@jest/globals'
import {
  generateMetadata,
  generatePlantSchema,
  generateHowToSchema,
  generateSocialShareUrls,
  slugify,
  generateCanonicalUrl,
  validateStructuredData,
  seoConfig
} from '../seo'

describe('SEO Utilities', () => {
  describe('generateMetadata', () => {
    it('should generate basic metadata with defaults', () => {
      const metadata = generateMetadata({
        title: 'Test Page'
      })

      expect(metadata.title).toBe('Test Page | GreenMate')
      expect(metadata.description).toBe(seoConfig.defaultDescription)
      expect(metadata.robots).toBe('index,follow')
    })

    it('should generate metadata with custom values', () => {
      const metadata = generateMetadata({
        title: 'Monstera Plant Care',
        description: 'Learn how to care for your Monstera plant',
        keywords: ['monstera', 'plant care', 'houseplant'],
        type: 'article',
        author: 'Plant Expert'
      })

      expect(metadata.title).toBe('Monstera Plant Care | GreenMate')
      expect(metadata.description).toBe('Learn how to care for your Monstera plant')
      expect(metadata.keywords).toBe('monstera,plant care,houseplant')
      expect(metadata.authors).toEqual([{ name: 'Plant Expert' }])
      expect(metadata.openGraph?.type).toBe('article')
    })

    it('should handle noIndex flag', () => {
      const metadata = generateMetadata({
        title: 'Private Page',
        noIndex: true
      })

      expect(metadata.robots).toBe('noindex,nofollow')
    })

    it('should generate Open Graph and Twitter metadata', () => {
      const metadata = generateMetadata({
        title: 'Plant Care Guide',
        description: 'Complete plant care guide',
        image: '/images/plant-guide.jpg'
      })

      expect(metadata.openGraph?.title).toBe('Plant Care Guide | GreenMate')
      expect(metadata.openGraph?.description).toBe('Complete plant care guide')
      expect(metadata.openGraph?.images?.[0].url).toContain('/images/plant-guide.jpg')
      
      expect(metadata.twitter?.title).toBe('Plant Care Guide | GreenMate')
      expect(metadata.twitter?.description).toBe('Complete plant care guide')
      expect(metadata.twitter?.card).toBe('summary_large_image')
    })
  })

  describe('generatePlantSchema', () => {
    it('should generate valid plant structured data', () => {
      const plantData = {
        id: 'monstera-deliciosa',
        name: 'Monstera Deliciosa',
        scientificName: 'Monstera deliciosa',
        description: 'Popular houseplant with split leaves',
        image: '/images/monstera.jpg',
        difficulty: 'Medium' as const,
        origin: 'Central America'
      }

      const schema = generatePlantSchema(plantData)

      expect(schema['@context']).toBe('https://schema.org')
      expect(schema['@type']).toBe('Product')
      expect(schema.name).toBe('Monstera Deliciosa')
      expect(schema.description).toBe('Popular houseplant with split leaves')
      expect(schema.url).toBe(`${seoConfig.siteUrl}/plants/monstera-deliciosa`)
      expect(schema.alternateName).toBe('Monstera deliciosa')
    })

    it('should handle minimal plant data', () => {
      const plantData = {
        id: 'test-plant',
        name: 'Test Plant'
      }

      const schema = generatePlantSchema(plantData)

      expect(schema.name).toBe('Test Plant')
      expect(schema.description).toBe('Learn how to care for Test Plant')
      expect(schema.identifier).toBe('test-plant')
    })
  })

  describe('generateHowToSchema', () => {
    it('should generate valid how-to structured data', () => {
      const guideData = {
        id: 'watering-guide',
        title: 'How to Water Your Plants',
        description: 'Complete watering guide',
        plantName: 'Monstera',
        steps: [
          { name: 'Check soil', description: 'Feel the soil moisture' },
          { name: 'Water slowly', description: 'Pour water evenly' }
        ],
        tools: ['Watering can', 'Moisture meter'],
        timeRequired: 'PT15M',
        difficulty: 'Easy' as const,
        author: 'Plant Expert'
      }

      const schema = generateHowToSchema(guideData)

      expect(schema['@type']).toBe('HowTo')
      expect(schema.name).toBe('How to Water Your Plants')
      expect(schema.step).toHaveLength(2)
      expect(schema.step[0].position).toBe(1)
      expect(schema.tool).toHaveLength(2)
      expect(schema.totalTime).toBe('PT15M')
      expect(schema.author?.name).toBe('Plant Expert')
    })
  })

  describe('generateSocialShareUrls', () => {
    it('should generate social sharing URLs', () => {
      const shareData = {
        url: 'https://greenmate.app/plants/monstera',
        title: 'Monstera Care Guide',
        description: 'Learn how to care for Monstera plants',
        hashtags: ['PlantCare', 'Monstera']
      }

      const urls = generateSocialShareUrls(shareData)

      expect(urls.twitter).toContain('twitter.com/intent/tweet')
      expect(urls.twitter).toContain(encodeURIComponent(shareData.url))
      expect(urls.twitter).toContain(encodeURIComponent(shareData.title))
      expect(urls.twitter).toContain('PlantCare,Monstera')

      expect(urls.facebook).toContain('facebook.com/sharer')
      expect(urls.linkedin).toContain('linkedin.com/sharing')
      expect(urls.whatsapp).toContain('wa.me')
    })

    it('should generate Pinterest URL when image is provided', () => {
      const shareData = {
        url: 'https://greenmate.app/plants/monstera',
        title: 'Monstera Care Guide',
        image: 'https://example.com/monstera.jpg'
      }

      const urls = generateSocialShareUrls(shareData)

      expect(urls.pinterest).toContain('pinterest.com/pin/create')
      expect(urls.pinterest).toContain(encodeURIComponent(shareData.image))
    })

    it('should not generate Pinterest URL without image', () => {
      const shareData = {
        url: 'https://greenmate.app/plants/monstera',
        title: 'Monstera Care Guide'
      }

      const urls = generateSocialShareUrls(shareData)

      expect(urls.pinterest).toBeNull()
    })
  })

  describe('slugify', () => {
    it('should convert text to URL-friendly slugs', () => {
      expect(slugify('Monstera Deliciosa')).toBe('monstera-deliciosa')
      expect(slugify('How to Care for Plants!')).toBe('how-to-care-for-plants')
      expect(slugify('Snake Plant (Sansevieria)')).toBe('snake-plant-sansevieria')
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces')
    })

    it('should handle special characters', () => {
      expect(slugify('Plant Care 101: A Beginner\'s Guide')).toBe('plant-care-101-a-beginners-guide')
      expect(slugify('Plants & Flowers')).toBe('plants-flowers')
      expect(slugify('50% OFF Plants')).toBe('50-off-plants')
    })

    it('should handle empty strings', () => {
      expect(slugify('')).toBe('')
      expect(slugify('   ')).toBe('')
    })
  })

  describe('generateCanonicalUrl', () => {
    it('should generate canonical URLs', () => {
      expect(generateCanonicalUrl('/plants/monstera')).toBe(`${seoConfig.siteUrl}/plants/monstera`)
      expect(generateCanonicalUrl('plants/monstera')).toBe(`${seoConfig.siteUrl}/plants/monstera`)
    })

    it('should handle locale prefixes', () => {
      expect(generateCanonicalUrl('/plants/monstera', 'es')).toBe(`${seoConfig.siteUrl}/es/plants/monstera`)
      expect(generateCanonicalUrl('/plants/monstera', 'en')).toBe(`${seoConfig.siteUrl}/plants/monstera`)
    })
  })

  describe('validateStructuredData', () => {
    it('should validate valid structured data', () => {
      const validSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Test Product',
        description: 'Test description'
      }

      expect(validateStructuredData(validSchema)).toBe(true)
    })

    it('should invalidate missing required fields', () => {
      const invalidSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product'
        // Missing name and description
      }

      // Mock console.warn to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      expect(validateStructuredData(invalidSchema)).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Product schema missing required fields: name, description')
      
      consoleSpy.mockRestore()
    })

    it('should invalidate missing context or type', () => {
      const invalidSchema = {
        name: 'Test'
      }

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()
      
      expect(validateStructuredData(invalidSchema)).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Missing @context or @type in structured data')
      
      consoleSpy.mockRestore()
    })
  })
})