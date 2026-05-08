# RemixOS — Mobile & PWA Guide

## Progressive Web App (PWA)

RemixOS Studio is optimised for mobile use as a Progressive Web App.

### PWA Features

- **Installable**: Add to home screen on iOS and Android
- **Offline-capable**: Service worker caches static assets
- **Responsive**: Glassmorphism UI adapts to all screen sizes
- **Touch-optimised**: Tap targets ≥ 44px, gesture-friendly navigation
- **Fast loading**: Core Web Vitals optimised (LCP, FID, CLS)

### Install as PWA

**iOS (Safari):**
1. Open https://remixos.app in Safari
2. Tap the Share button → "Add to Home Screen"
3. Tap "Add"

**Android (Chrome):**
1. Open https://remixos.app in Chrome
2. Tap the three-dot menu → "Add to Home Screen" (or install banner)
3. Tap "Install"

---

## Web Manifest

Add `public/site.webmanifest`:

```json
{
  "name": "RemixOS Studio",
  "short_name": "RemixOS",
  "description": "AI Website Builder SaaS Platform",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#05070a",
  "theme_color": "#8b5cf6",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/studio-desktop.png", "sizes": "1280x800", "type": "image/png" },
    { "src": "/screenshots/studio-mobile.png", "sizes": "390x844", "type": "image/png" }
  ]
}
```

---

## Responsive Design

The Studio UI uses Tailwind CSS responsive breakpoints:

| Breakpoint | Width | Layout |
|------------|-------|--------|
| Default (mobile) | < 768px | Single column, stacked panels |
| `md` | ≥ 768px | Two-column grid (logs + output) |
| `lg` | ≥ 1024px | Three-column builder layout |
| `xl` | ≥ 1280px | Wide dashboard layout |

### AI Builder on Mobile
The builder sidebar collapses on small screens. Tap the config icon to expand it as a sheet overlay.

---

## Capacitor (Native Mobile)

For full native mobile apps (iOS App Store / Google Play), use [Capacitor](https://capacitorjs.com):

```bash
# Install Capacitor
pnpm add @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Initialise
npx cap init RemixOS com.remixos.studio

# Add platforms
npx cap add ios
npx cap add android

# Build and sync
pnpm build
npx cap sync

# Open in Xcode / Android Studio
npx cap open ios
npx cap open android
```

### Native Features (Capacitor plugins)

| Feature | Plugin | Usage |
|---------|--------|-------|
| Push Notifications | `@capacitor/push-notifications` | Deployment alerts |
| Local Filesystem | `@capacitor/filesystem` | Save generated websites locally |
| Haptic Feedback | `@capacitor/haptics` | Build complete feedback |
| Share | `@capacitor/share` | Share generated website URL |
| App | `@capacitor/app` | Deep links, background/foreground events |

---

## Touch Optimisations

Applied globally:
- Minimum tap target size: 44×44px
- No 300ms tap delay (`touch-action: manipulation`)
- Swipe-to-switch tabs (builder categories, output tabs)
- Pinch-to-zoom disabled on form inputs to prevent iOS auto-zoom
- Smooth momentum scrolling on scroll containers

---

## Offline Sync

When offline:
1. Previously loaded workspaces are served from cache
2. Prompt drafts are saved to `localStorage` and synced on reconnect
3. WebSocket reconnects automatically with exponential backoff
4. Generated HTML downloads work entirely offline (client-side)

---

## Testing on Mobile

```bash
# Expose local dev server to your phone (same WiFi)
pnpm dev -- --hostname 0.0.0.0

# Access from phone: http://YOUR_COMPUTER_IP:3000
```

For HTTPS testing (required for some PWA features):

```bash
# With mkcert
mkcert -install
mkcert localhost 192.168.1.x
# Add certs to Next.js config
```
