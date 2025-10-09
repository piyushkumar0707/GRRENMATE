// Open Graph Image Generation API
import { ImageResponse } from 'next/server'
import { seoConfig } from '@/lib/seo'

export const runtime = 'edge'

interface OGImageParams {
  title?: string
  description?: string
  type?: 'default' | 'plant' | 'guide' | 'blog'
  plantName?: string
  plantImage?: string
  category?: string
  author?: string
  theme?: 'light' | 'dark'
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const params: OGImageParams = {
      title: searchParams.get('title') || seoConfig.defaultTitle,
      description: searchParams.get('description') || seoConfig.defaultDescription,
      type: (searchParams.get('type') as OGImageParams['type']) || 'default',
      plantName: searchParams.get('plantName') || undefined,
      plantImage: searchParams.get('plantImage') || undefined,
      category: searchParams.get('category') || undefined,
      author: searchParams.get('author') || undefined,
      theme: (searchParams.get('theme') as OGImageParams['theme']) || 'light'
    }

    const isDark = params.theme === 'dark'
    const bgColor = isDark ? '#1f2937' : '#ffffff'
    const textColor = isDark ? '#ffffff' : '#1f2937'
    const accentColor = '#10b981'
    const secondaryColor = isDark ? '#9ca3af' : '#6b7280'

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: bgColor,
            backgroundImage: isDark 
              ? 'radial-gradient(circle at 25px 25px, #374151 2%, transparent 0%), radial-gradient(circle at 75px 75px, #374151 2%, transparent 0%)'
              : 'radial-gradient(circle at 25px 25px, #f3f4f6 2%, transparent 0%), radial-gradient(circle at 75px 75px, #f3f4f6 2%, transparent 0%)',
            backgroundSize: '100px 100px',
            fontFamily: '"Inter", sans-serif'
          }}
        >
          {/* Header with Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '40px 60px',
              borderBottom: `3px solid ${accentColor}`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Logo placeholder */}
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  backgroundColor: accentColor,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '30px'
                }}
              >
                🌱
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: textColor
                }}
              >
                GreenMate
              </div>
            </div>
            
            {params.category && (
              <div
                style={{
                  backgroundColor: accentColor,
                  color: 'white',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '18px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}
              >
                {params.category}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div
            style={{
              display: 'flex',
              flex: 1,
              padding: '60px',
              gap: '40px',
              alignItems: 'center'
            }}
          >
            {/* Left side - Text content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: params.plantImage ? '1' : '1',
                gap: '24px'
              }}
            >
              {/* Plant name or type indicator */}
              {(params.plantName || params.type !== 'default') && (
                <div
                  style={{
                    fontSize: '20px',
                    color: accentColor,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  {params.plantName || `${params.type} Guide`.toUpperCase()}
                </div>
              )}

              {/* Main Title */}
              <div
                style={{
                  fontSize: params.title.length > 60 ? '48px' : '56px',
                  fontWeight: '800',
                  color: textColor,
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em'
                }}
              >
                {params.title}
              </div>

              {/* Description */}
              {params.description && params.description !== seoConfig.defaultDescription && (
                <div
                  style={{
                    fontSize: '24px',
                    color: secondaryColor,
                    lineHeight: 1.4,
                    fontWeight: '400',
                    maxWidth: '600px'
                  }}
                >
                  {params.description.slice(0, 120)}
                  {params.description.length > 120 ? '...' : ''}
                </div>
              )}

              {/* Author */}
              {params.author && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '20px'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: accentColor,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '600'
                    }}
                  >
                    {params.author.charAt(0).toUpperCase()}
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      color: secondaryColor,
                      fontWeight: '500'
                    }}
                  >
                    by {params.author}
                  </div>
                </div>
              )}
            </div>

            {/* Right side - Plant image or decorative element */}
            {params.plantImage ? (
              <div
                style={{
                  width: '300px',
                  height: '300px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                  flexShrink: 0
                }}
              >
                <img
                  src={params.plantImage}
                  alt="Plant"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ) : (
              // Decorative plant illustration
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px',
                  opacity: 0.6
                }}
              >
                <div
                  style={{
                    fontSize: '120px',
                    lineHeight: 1
                  }}
                >
                  {params.type === 'plant' ? '🪴' : 
                   params.type === 'guide' ? '📖' :
                   params.type === 'blog' ? '✏️' : '🌿'}
                </div>
                {params.type === 'plant' && (
                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      fontSize: '40px'
                    }}
                  >
                    🌱💧☀️
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '30px 60px',
              borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
            }}
          >
            <div
              style={{
                fontSize: '18px',
                color: secondaryColor,
                fontWeight: '500'
              }}
            >
              Your Plant Care Companion
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                fontSize: '16px',
                color: secondaryColor
              }}
            >
              <span>🌍 greenmate.app</span>
              <span>•</span>
              <span>📱 Free Plant Care App</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Inter',
            data: await fetch(
              new URL('./Inter-Regular.woff2', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap')
            ).then((res) => res.arrayBuffer()).catch(() => {
              // Fallback if font loading fails
              return new ArrayBuffer(0)
            }),
            weight: 400,
            style: 'normal',
          },
        ],
      }
    )
  } catch (error) {
    console.error('Failed to generate OG image:', error)
    
    // Return a simple fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#10b981',
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '40px'
          }}
        >
          <div style={{ fontSize: '120px', marginBottom: '40px' }}>🌱</div>
          <div>GreenMate</div>
          <div style={{ fontSize: '24px', fontWeight: 'normal', marginTop: '20px' }}>
            Your Plant Care Companion
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630
      }
    )
  }
}

// Helper function to generate OG image URL
export function generateOGImageUrl(params: OGImageParams): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.set(key, value.toString())
    }
  })
  
  return `${seoConfig.siteUrl}/api/og?${searchParams.toString()}`
}