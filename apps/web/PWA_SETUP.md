# GreenMate PWA Setup Guide

This guide will help you set up and test the Progressive Web App (PWA) features for GreenMate.

## 🚀 Quick Start

### 1. Install Dependencies

The required dependencies should already be installed. If not, run:

```bash
npm install web-push @types/web-push
```

### 2. Generate VAPID Keys

Generate VAPID keys for push notifications:

```bash
npx web-push generate-vapid-keys
```

### 3. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your keys:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your generated VAPID keys:

```env
VAPID_PUBLIC_KEY=your_generated_public_key
VAPID_PRIVATE_KEY=your_generated_private_key
VAPID_EMAIL=contact@greenmate.com
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_generated_public_key
```

### 4. Add PWA to Your Layout

Replace your `app/layout.tsx` with PWA-enabled layout or add PWA components:

#### Option A: Full PWA Layout (Recommended)

```tsx
import { PWALayout } from '@/components/PWAProvider'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#10b981" />
        {/* Other head content */}
      </head>
      <body>
        <PWALayout>
          {children}
        </PWALayout>
      </body>
    </html>
  )
}
```

#### Option B: Add Components to Existing Layout

```tsx
import { PWAProvider } from '@/components/PWAProvider'
import { 
  PWAInstallPrompt, 
  AppUpdatePrompt, 
  NetworkStatusIndicator, 
  PushNotificationPrompt 
} from '@/components/PWAComponents'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PWAProvider>
          {children}
          <PWAInstallPrompt />
          <AppUpdatePrompt />
          <NetworkStatusIndicator />
          <PushNotificationPrompt />
        </PWAProvider>
      </body>
    </html>
  )
}
```

### 5. Create Required Icons

Create PWA icons in `/public/icons/` directory:

Required icons:
- `favicon-16x16.png` (16x16)
- `favicon-32x32.png` (32x32)
- `apple-touch-icon.png` (180x180)
- `icon-192x192.png` (192x192)
- `icon-512x512.png` (512x512)
- `badge-72x72.png` (72x72)

You can use a PWA icon generator like [PWA Asset Generator](https://github.com/PWABuilder/PWABuilder) or create them manually.

### 6. Update Service Worker File

The service worker is already created at `/public/sw.js`. If you want to use the updated version with better caching strategies:

```bash
# Rename the updated service worker to replace the basic one
mv /public/sw-updated.js /public/sw.js
```

## 📱 Testing Your PWA

### Local Testing

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Test in Chrome DevTools:**
   - Open Chrome DevTools (F12)
   - Go to "Application" tab
   - Check "Service Workers" section
   - Check "Manifest" section
   - Use "Lighthouse" tab to audit PWA features

3. **Test offline functionality:**
   - Open Network tab in DevTools
   - Check "Offline" checkbox
   - Try navigating the app

### Production Testing

1. **Build and serve:**
   ```bash
   npm run build
   npm run start
   ```

2. **Test installation:**
   - Chrome: Look for install button in address bar
   - Edge: Look for install prompt
   - Mobile Safari: Use "Add to Home Screen"

3. **Test push notifications:**
   ```bash
   # Send test notification
   curl -X GET "http://localhost:3000/api/push/send?type=plant-care"
   ```

### Mobile Testing

1. **Test on mobile device:**
   - Connect to same network as development server
   - Access via `http://your-ip:3000`
   - Test install prompt and offline functionality

2. **iOS Testing:**
   - Open in Safari
   - Tap Share button → "Add to Home Screen"
   - Test standalone app mode

## 🔧 PWA Features Included

### ✅ Core PWA Features
- [x] Web App Manifest
- [x] Service Worker with caching strategies
- [x] Offline support with fallback pages
- [x] App installation prompts
- [x] Push notifications
- [x] Background sync
- [x] Network status detection
- [x] App update notifications

### 📋 Caching Strategies
- **Static Assets**: Cache first with network fallback
- **API Requests**: Network first with cache fallback
- **Images**: Cache first with offline fallback image
- **App Shell**: Stale while revalidate

### 🔔 Push Notifications
- Plant care reminders
- Community updates
- Achievement notifications
- Weather alerts
- Custom notification actions

### 📱 Installation
- Chrome/Edge: Browser install prompt
- iOS: Add to Home Screen
- Android: Install banner
- Custom install prompts with dismissal logic

## 🎯 Usage Examples

### Using PWA Hooks in Components

```tsx
import { usePWA, usePWAAnalytics } from '@/components/PWAProvider'

function MyComponent() {
  const { isInstalled, canInstall, isOnline, install } = usePWA()
  const { trackInstallPromptShown } = usePWAAnalytics()

  const handleInstall = async () => {
    trackInstallPromptShown()
    const success = await install()
    if (success) {
      console.log('App installed!')
    }
  }

  return (
    <div>
      <p>PWA Status: {isInstalled ? 'Installed' : 'Not Installed'}</p>
      <p>Network: {isOnline ? 'Online' : 'Offline'}</p>
      {canInstall && (
        <button onClick={handleInstall}>Install App</button>
      )}
    </div>
  )
}
```

### Sending Push Notifications

```tsx
// From your server or API route
const response = await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    subscriptions: [userPushSubscription],
    notification: {
      title: '🌱 Time to Water Your Plants!',
      body: 'Your Snake Plant needs water today.',
      icon: '/icons/plant-icon.png',
      data: { plantId: 'snake-plant-1', type: 'watering' },
      actions: [
        { action: 'water', title: 'Mark as Watered' },
        { action: 'snooze', title: 'Remind Later' }
      ]
    }
  })
})
```

## 🐛 Troubleshooting

### Common Issues

1. **Service worker not registering:**
   - Check browser console for errors
   - Ensure `/sw.js` is accessible
   - Verify Next.js headers configuration

2. **Install prompt not showing:**
   - PWA criteria must be met (HTTPS, manifest, service worker)
   - User must have interacted with the page
   - Install prompt may be delayed

3. **Push notifications not working:**
   - Check VAPID keys are correct
   - Verify notification permissions
   - Ensure HTTPS in production

4. **Offline functionality not working:**
   - Check service worker is active
   - Verify caching strategies
   - Test with DevTools offline mode

### Debug Tools

1. **Chrome DevTools:**
   - Application → Service Workers
   - Application → Manifest
   - Lighthouse → PWA audit

2. **Firefox DevTools:**
   - Application → Service Workers
   - Application → Manifest

3. **PWA Testing:**
   - [PWA Builder](https://www.pwabuilder.com/)
   - [Lighthouse CLI](https://github.com/GoogleChrome/lighthouse)

## 🚀 Deployment

### Vercel (Recommended)

The PWA is configured to work with Vercel out of the box. Just deploy:

```bash
vercel --prod
```

### Other Platforms

Ensure your hosting platform:
- Serves files with correct MIME types
- Supports HTTPS
- Doesn't cache service worker files
- Serves `/manifest.json` and `/sw.js` correctly

## 📈 Analytics

The PWA includes analytics tracking for:
- Install prompt interactions
- PWA usage vs web usage
- Offline functionality usage
- Network status changes

Events are sent to Google Analytics if `gtag` is available.

## 🔄 Updates

To update the PWA:

1. Modify service worker version number
2. Update manifest if needed
3. Deploy changes
4. Users will receive update prompts automatically

## 📚 Additional Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)

## 🎉 Next Steps

After setting up the PWA:

1. Test all features thoroughly
2. Generate and add all required icons
3. Set up push notification server logic
4. Configure analytics tracking
5. Test on multiple devices and browsers
6. Deploy to production with HTTPS
7. Monitor PWA metrics and user feedback

Your GreenMate PWA is now ready to provide an app-like experience to your users! 🌱📱