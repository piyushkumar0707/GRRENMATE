import type { Metadata } from 'next'
import { Inter, Poppins } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
})

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GreenMate - Your Smart Plant Companion',
  description: 'AI-powered plant recognition, care guides, and community for plant enthusiasts',
  keywords: ['plants', 'gardening', 'AI', 'plant care', 'plant recognition'],
  authors: [{ name: 'GreenMate Team' }],
  openGraph: {
    title: 'GreenMate - Your Smart Plant Companion',
    description: 'AI-powered plant recognition, care guides, and community for plant enthusiasts',
    url: 'https://greenmate.app',
    siteName: 'GreenMate',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'GreenMate - Plant Care App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GreenMate - Your Smart Plant Companion',
    description: 'AI-powered plant recognition, care guides, and community for plant enthusiasts',
    images: ['/og-image.jpg'],
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#22c55e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}