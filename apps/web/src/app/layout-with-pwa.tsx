// Example of how to integrate PWA components into your app layout
'use client'

import { Inter } from 'next/font/google'
import { PWALayout } from '@/components/PWAProvider'
import { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] })

// Add these meta tags to your actual layout.tsx or _app.tsx
export const metadata: Metadata = {
  title: 'GreenMate - Your Plant Care Companion',
  description: 'Discover, care for, and grow your plant collection with AI-powered insights and community support.',
  manifest: '/manifest.json',
  themeColor: '#10b981',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GreenMate',
    startupImage: [
      '/icons/apple-splash-2048-2732.jpg',
      {
        url: '/icons/apple-splash-1668-2224.jpg',
        media: '(device-width: 834px) and (device-height: 1112px)',
      },
      {
        url: '/icons/apple-splash-1536-2048.jpg',
        media: '(device-width: 768px) and (device-height: 1024px)',
      },
    ],
  },
  openGraph: {
    type: 'website',
    siteName: 'GreenMate',
    title: 'GreenMate - Your Plant Care Companion',
    description: 'Discover, care for, and grow your plant collection with AI-powered insights and community support.',
    images: [
      {
        url: '/icons/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GreenMate - Your Plant Care Companion',
    description: 'Discover, care for, and grow your plant collection with AI-powered insights and community support.',
    images: ['/icons/twitter-image.png'],
  },
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayoutWithPWA({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="GreenMate" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="GreenMate" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#10b981" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#10b981" />

        {/* Viewport */}
        <meta 
          name="viewport" 
          content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=5,user-scalable=yes,viewport-fit=cover" 
        />

        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Icons */}
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        
        {/* Apple splash screens */}
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-2048-2732.jpg" sizes="2048x2732" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-1668-2224.jpg" sizes="1668x2224" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-1536-2048.jpg" sizes="1536x2048" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-1242-2208.jpg" sizes="1242x2208" />
        <link rel="apple-touch-startup-image" href="/icons/apple-splash-750-1334.jpg" sizes="750x1334" />

        {/* Preload critical resources */}
        <link rel="preload" href="/sw.js" as="script" />
      </head>
      
      <body className={inter.className}>
        {/* Wrap your app with PWALayout */}
        <PWALayout
          vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY}
          enableInstallPrompt={true}
          enableUpdatePrompt={true}
          enableNetworkStatus={true}
          enablePushPrompt={true}
        >
          {children}
        </PWALayout>

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

// Alternative: Component to add PWA functionality to existing layout
export function PWAComponents() {
  return (
    <>
      {/* Add these components anywhere in your app */}
      {/* They will handle their own visibility logic */}
      <PWAInstallPrompt />
      <AppUpdatePrompt />
      <NetworkStatusIndicator />
      <PushNotificationPrompt />
    </>
  )
}

// Example of using PWA hooks in a component
export function ExamplePWAComponent() {
  const { isInstalled, canInstall, isOnline, install } = usePWA()
  const { trackInstallPromptShown } = usePWAAnalytics()

  const handleInstallClick = async () => {
    trackInstallPromptShown()
    const success = await install()
    if (success) {
      console.log('App installed successfully!')
    }
  }

  return (
    <div className="pwa-status">
      <h3>PWA Status</h3>
      <p>Installed: {isInstalled ? 'Yes' : 'No'}</p>
      <p>Can Install: {canInstall ? 'Yes' : 'No'}</p>
      <p>Online: {isOnline ? 'Yes' : 'No'}</p>
      
      {canInstall && !isInstalled && (
        <button onClick={handleInstallClick}>
          Install App
        </button>
      )}
    </div>
  )
}

// Import statements you'll need in your actual files:
/*
import { PWALayout, usePWA, usePWAAnalytics } from '@/components/PWAProvider'
import { 
  PWAInstallPrompt, 
  AppUpdatePrompt, 
  NetworkStatusIndicator, 
  PushNotificationPrompt,
  PWAStatusBar,
  PWAFeatureSupport,
  OfflineFallback
} from '@/components/PWAComponents'
*/