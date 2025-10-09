// SEO Components for GreenMate
import React from 'react'
import Head from 'next/head'
import { 
  generateMetadata, 
  generateOrganizationSchema,
  generateWebSiteSchema,
  generatePlantSchema,
  generateHowToSchema,
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateSocialShareUrls,
  seoConfig,
  PageMetadata,
  PlantData,
  CareGuideData,
  BlogPostData,
  BreadcrumbItem,
  FAQItem,
  SocialShareData,
  logSEODebugInfo
} from '@/lib/seo'

// Main SEO Head component
interface SEOHeadProps extends PageMetadata {
  structuredData?: any[]
  children?: React.ReactNode
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  children,
  structuredData = [],
  ...pageMetadata
}) => {
  const metadata = generateMetadata(pageMetadata)
  
  // Add default organization and website schemas
  const allStructuredData = [
    generateOrganizationSchema(),
    generateWebSiteSchema(),
    ...structuredData
  ]

  // Debug logging in development
  React.useEffect(() => {
    logSEODebugInfo(metadata, allStructuredData)
  }, [metadata, allStructuredData])

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metadata.title as string}</title>
      <meta name="description" content={metadata.description} />
      {metadata.keywords && <meta name="keywords" content={metadata.keywords} />}
      <meta name="robots" content={metadata.robots} />
      {metadata.canonical && <link rel="canonical" href={metadata.canonical} />}
      
      {/* Open Graph Tags */}
      {metadata.openGraph && (
        <>
          <meta property="og:title" content={metadata.openGraph.title} />
          <meta property="og:description" content={metadata.openGraph.description} />
          <meta property="og:type" content={metadata.openGraph.type} />
          <meta property="og:url" content={metadata.openGraph.url} />
          <meta property="og:site_name" content={metadata.openGraph.siteName} />
          <meta property="og:locale" content={metadata.openGraph.locale} />
          
          {metadata.openGraph.images?.map((image, index) => (
            <React.Fragment key={index}>
              <meta property="og:image" content={image.url} />
              <meta property="og:image:width" content={image.width?.toString()} />
              <meta property="og:image:height" content={image.height?.toString()} />
              <meta property="og:image:alt" content={image.alt} />
            </React.Fragment>
          ))}
          
          {metadata.openGraph.publishedTime && (
            <meta property="article:published_time" content={metadata.openGraph.publishedTime} />
          )}
          {metadata.openGraph.modifiedTime && (
            <meta property="article:modified_time" content={metadata.openGraph.modifiedTime} />
          )}
          {metadata.openGraph.authors?.map((author, index) => (
            <meta key={index} property="article:author" content={author} />
          ))}
          {metadata.openGraph.section && (
            <meta property="article:section" content={metadata.openGraph.section} />
          )}
          {metadata.openGraph.tags?.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card Tags */}
      {metadata.twitter && (
        <>
          <meta name="twitter:card" content={metadata.twitter.card} />
          <meta name="twitter:site" content={metadata.twitter.site} />
          <meta name="twitter:creator" content={metadata.twitter.creator} />
          <meta name="twitter:title" content={metadata.twitter.title} />
          <meta name="twitter:description" content={metadata.twitter.description} />
          {metadata.twitter.images?.map((image, index) => (
            <meta key={index} name="twitter:image" content={image} />
          ))}
        </>
      )}
      
      {/* Alternate Language Links */}
      {metadata.alternates?.languages && Object.entries(metadata.alternates.languages).map(([locale, url]) => (
        <link key={locale} rel="alternate" hrefLang={locale} href={url} />
      ))}
      
      {/* Structured Data */}
      {allStructuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, process.env.NODE_ENV === 'development' ? 2 : 0)
          }}
        />
      ))}
      
      {/* Additional Head Content */}
      {children}
    </Head>
  )
}

// Plant Page SEO Component
interface PlantSEOProps {
  plant: PlantData
  breadcrumbs?: BreadcrumbItem[]
  faqs?: FAQItem[]
}

export const PlantSEO: React.FC<PlantSEOProps> = ({ plant, breadcrumbs = [], faqs = [] }) => {
  const structuredData = [
    generatePlantSchema(plant),
    ...(breadcrumbs.length > 0 ? [generateBreadcrumbSchema(breadcrumbs)] : []),
    ...(faqs.length > 0 ? [generateFAQSchema(faqs)] : [])
  ]

  const keywords = [
    plant.name,
    plant.scientificName,
    ...(plant.commonNames || []),
    'plant care',
    'houseplant',
    plant.difficulty?.toLowerCase() + ' plants',
    plant.plantType,
    'indoor plants',
    'plant guide'
  ].filter(Boolean) as string[]

  return (
    <SEOHead
      title={`${plant.name} Care Guide - How to Grow ${plant.name}`}
      description={plant.description || `Complete care guide for ${plant.name}. Learn about watering, lighting, and growing tips for this ${plant.difficulty?.toLowerCase()} houseplant.`}
      keywords={keywords}
      image={plant.image}
      imageAlt={`${plant.name} plant care guide`}
      type="article"
      canonicalUrl={`${seoConfig.siteUrl}/plants/${plant.id}`}
      structuredData={structuredData}
    />
  )
}

// Care Guide SEO Component
interface CareGuideSEOProps {
  guide: CareGuideData
  breadcrumbs?: BreadcrumbItem[]
}

export const CareGuideSEO: React.FC<CareGuideSEOProps> = ({ guide, breadcrumbs = [] }) => {
  const structuredData = [
    generateHowToSchema(guide),
    ...(breadcrumbs.length > 0 ? [generateBreadcrumbSchema(breadcrumbs)] : [])
  ]

  const keywords = [
    guide.plantName,
    'plant care',
    'how to',
    guide.difficulty?.toLowerCase(),
    'plant guide',
    'gardening',
    'houseplant care',
    ...guide.steps.map(step => step.name.toLowerCase())
  ].filter(Boolean) as string[]

  return (
    <SEOHead
      title={guide.title}
      description={guide.description}
      keywords={keywords}
      type="article"
      publishedTime={guide.publishedDate}
      modifiedTime={guide.updatedDate}
      author={guide.author}
      canonicalUrl={`${seoConfig.siteUrl}/guides/${guide.id}`}
      structuredData={structuredData}
    />
  )
}

// Blog Post SEO Component
interface BlogSEOProps {
  post: BlogPostData
  breadcrumbs?: BreadcrumbItem[]
}

export const BlogSEO: React.FC<BlogSEOProps> = ({ post, breadcrumbs = [] }) => {
  const structuredData = [
    generateArticleSchema(post),
    ...(breadcrumbs.length > 0 ? [generateBreadcrumbSchema(breadcrumbs)] : [])
  ]

  return (
    <SEOHead
      title={post.title}
      description={post.description}
      keywords={post.tags}
      image={post.image}
      type="article"
      publishedTime={post.publishedDate}
      modifiedTime={post.updatedDate}
      author={post.author}
      section={post.category}
      tags={post.tags}
      canonicalUrl={`${seoConfig.siteUrl}/blog/${post.id}`}
      structuredData={structuredData}
    />
  )
}

// Social Share Component
interface SocialShareProps {
  data: SocialShareData
  className?: string
  showLabels?: boolean
}

export const SocialShare: React.FC<SocialShareProps> = ({ 
  data, 
  className = '', 
  showLabels = true 
}) => {
  const shareUrls = generateSocialShareUrls(data)

  const handleShare = (platform: string, url: string) => {
    if (navigator.share && platform === 'native') {
      navigator.share({
        title: data.title,
        text: data.description,
        url: data.url
      }).catch(() => {
        // Fallback to traditional sharing
      })
      return
    }

    window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabels && <span className="text-sm font-medium text-gray-700">Share:</span>}
      
      {/* Native Web Share API (if supported) */}
      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          onClick={() => handleShare('native', '')}
          className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
          title="Share"
          aria-label="Share via system dialog"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
        </button>
      )}
      
      {/* Twitter */}
      <button
        onClick={() => handleShare('twitter', shareUrls.twitter)}
        className="p-2 text-gray-600 hover:text-blue-400 transition-colors"
        title="Share on Twitter"
        aria-label="Share on Twitter"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>
      </button>
      
      {/* Facebook */}
      <button
        onClick={() => handleShare('facebook', shareUrls.facebook)}
        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
        title="Share on Facebook"
        aria-label="Share on Facebook"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      </button>
      
      {/* LinkedIn */}
      <button
        onClick={() => handleShare('linkedin', shareUrls.linkedin)}
        className="p-2 text-gray-600 hover:text-blue-700 transition-colors"
        title="Share on LinkedIn"
        aria-label="Share on LinkedIn"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </button>
      
      {/* Pinterest (if image is available) */}
      {shareUrls.pinterest && (
        <button
          onClick={() => handleShare('pinterest', shareUrls.pinterest!)}
          className="p-2 text-gray-600 hover:text-red-600 transition-colors"
          title="Share on Pinterest"
          aria-label="Share on Pinterest"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.758-1.378l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.99C24.007 5.367 18.641.001 12.017.001z"/>
          </svg>
        </button>
      )}
      
      {/* WhatsApp */}
      <button
        onClick={() => handleShare('whatsapp', shareUrls.whatsapp)}
        className="p-2 text-gray-600 hover:text-green-600 transition-colors"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      </button>
      
      {/* Copy Link */}
      <button
        onClick={() => {
          navigator.clipboard?.writeText(data.url)
          // Could show a toast notification here
        }}
        className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
        title="Copy link"
        aria-label="Copy link to clipboard"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
        </svg>
      </button>
    </div>
  )
}

// Breadcrumb Navigation Component
interface BreadcrumbNavProps {
  items: BreadcrumbItem[]
  className?: string
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({ items, className = '' }) => {
  return (
    <nav className={`text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && (
              <svg className="w-4 h-4 text-gray-400 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {index === items.length - 1 ? (
              <span className="text-gray-500" aria-current="page">
                {item.name}
              </span>
            ) : (
              <a 
                href={item.url} 
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                {item.name}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default SEOHead