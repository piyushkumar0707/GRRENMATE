/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://greenmate.app',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  
  // Sitemap configuration
  sitemapSize: 5000,
  changefreq: 'daily',
  priority: 0.7,
  
  // Exclude specific paths
  exclude: [
    '/api/*',
    '/admin/*',
    '/dashboard/private/*',
    '/404',
    '/500',
    '/sitemap*.xml',
    '/robots.txt',
    '/manifest.json',
    '/sw.js',
    '/_next/*',
    '/static/*'
  ],

  // Transform function to customize URLs
  transform: async (config, path) => {
    // Custom priority and changefreq for different page types
    const customConfig = { ...config }

    // Home page - highest priority
    if (path === '/') {
      customConfig.priority = 1.0
      customConfig.changefreq = 'daily'
    }
    
    // Plant pages - high priority
    else if (path.startsWith('/plants/')) {
      customConfig.priority = 0.9
      customConfig.changefreq = 'weekly'
    }
    
    // Care guides - high priority
    else if (path.startsWith('/guides/')) {
      customConfig.priority = 0.8
      customConfig.changefreq = 'weekly'
    }
    
    // Blog posts - medium priority
    else if (path.startsWith('/blog/')) {
      customConfig.priority = 0.7
      customConfig.changefreq = 'monthly'
    }
    
    // Community pages - medium priority
    else if (path.startsWith('/community/')) {
      customConfig.priority = 0.6
      customConfig.changefreq = 'daily'
    }
    
    // Category/listing pages - medium priority
    else if (path.startsWith('/categories/') || path === '/plants' || path === '/guides') {
      customConfig.priority = 0.8
      customConfig.changefreq = 'weekly'
    }
    
    // Static pages - lower priority
    else if (['/about', '/contact', '/privacy', '/terms'].includes(path)) {
      customConfig.priority = 0.5
      customConfig.changefreq = 'monthly'
    }

    // Multi-language support
    const alternateRefs = [
      {
        href: `${config.siteUrl}${path}`,
        hreflang: 'en'
      },
      {
        href: `${config.siteUrl}/es${path}`,
        hreflang: 'es'
      },
      {
        href: `${config.siteUrl}${path}`,
        hreflang: 'x-default'
      }
    ]

    return {
      loc: path,
      changefreq: customConfig.changefreq,
      priority: customConfig.priority,
      lastmod: new Date().toISOString(),
      alternateRefs
    }
  },

  // Additional paths to include (dynamic pages)
  additionalPaths: async (config) => {
    const paths = []

    try {
      // Add plant pages (you would fetch these from your database)
      // For now, we'll add some example paths
      const popularPlants = [
        'monstera-deliciosa',
        'fiddle-leaf-fig',
        'snake-plant',
        'pothos',
        'peace-lily',
        'rubber-tree',
        'spider-plant',
        'philodendron',
        'aloe-vera',
        'succulent-mix'
      ]

      popularPlants.forEach(slug => {
        paths.push({
          loc: `/plants/${slug}`,
          changefreq: 'weekly',
          priority: 0.9,
          lastmod: new Date().toISOString(),
          alternateRefs: [
            {
              href: `${config.siteUrl}/plants/${slug}`,
              hreflang: 'en'
            },
            {
              href: `${config.siteUrl}/es/plantas/${slug}`,
              hreflang: 'es'
            }
          ]
        })
      })

      // Add care guide categories
      const guideCategories = [
        'watering',
        'lighting',
        'fertilizing',
        'pruning',
        'repotting',
        'propagation',
        'pest-control',
        'troubleshooting'
      ]

      guideCategories.forEach(category => {
        paths.push({
          loc: `/guides/${category}`,
          changefreq: 'weekly',
          priority: 0.8,
          lastmod: new Date().toISOString()
        })
      })

      // Add plant categories
      const plantCategories = [
        'indoor-plants',
        'succulents',
        'flowering-plants',
        'foliage-plants',
        'easy-care-plants',
        'low-light-plants',
        'air-purifying-plants',
        'pet-safe-plants'
      ]

      plantCategories.forEach(category => {
        paths.push({
          loc: `/categories/${category}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: new Date().toISOString()
        })
      })

      // Add blog categories
      const blogCategories = [
        'plant-care-tips',
        'plant-identification',
        'indoor-gardening',
        'plant-health',
        'seasonal-care',
        'beginner-guides'
      ]

      blogCategories.forEach(category => {
        paths.push({
          loc: `/blog/category/${category}`,
          changefreq: 'daily',
          priority: 0.6,
          lastmod: new Date().toISOString()
        })
      })

    } catch (error) {
      console.warn('Error generating additional sitemap paths:', error)
    }

    return paths
  },

  // Robots.txt configuration
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/private/',
          '/404',
          '/500',
          '/_next/',
          '/static/',
          '/sw.js',
          '/workbox-*',
          '*.json'
        ]
      },
      {
        userAgent: 'GPTBot',
        disallow: '/'
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/'
      },
      {
        userAgent: 'CCBot',
        disallow: '/'
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/'
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/'
      }
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://greenmate.app'}/sitemap.xml`,
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://greenmate.app'}/sitemap-0.xml`
    ],
    transformRobotsTxt: async (_, robotsTxt) => {
      return `${robotsTxt}

# Additional crawling rules
User-agent: *
Crawl-delay: 1

# Sitemap location
Sitemap: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://greenmate.app'}/sitemap.xml

# Social media crawlers
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

User-agent: TelegramBot
Allow: /

# Search engine specific rules
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2

User-agent: Slurp
Allow: /
Crawl-delay: 2

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

# Image crawlers
User-agent: Googlebot-Image
Allow: /images/
Allow: /_next/image

User-agent: Bingbot-Image
Allow: /images/
Allow: /_next/image

# Block AI training bots
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: YouBot
Disallow: /

User-agent: Bytespider
Disallow: /
`
    }
  }
}