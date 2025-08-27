# Performance-Budget

## Zielgrößen

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Loading-Performance
- **First Paint**: < 1.8s
- **First Contentful Paint**: < 2.0s
- **Time to Interactive**: < 3.8s

## Größenlimits pro Seite/Route

### JavaScript-Bundle
- **Initial Bundle**: < 150KB (gzipped)
- **Route-spezifisch**: < 50KB (gzipped)
- **Vendor-Bundle**: < 100KB (gzipped)

### CSS-Bundle
- **Global CSS**: < 50KB (gzipped)
- **Route-spezifisch**: < 20KB (gzipped)

### Bilder
- **Hero-Images**: < 200KB
- **Thumbnails**: < 50KB
- **Icons**: < 10KB

## Bildregeln

### Bildoptimierung
```typescript
// Next.js Image-Komponente verwenden
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Firmenlogo"
  width={200}
  height={60}
  priority={true} // Für Above-the-fold Bilder
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

### Bildformate
- **WebP**: Für moderne Browser (Fallback: JPEG/PNG)
- **AVIF**: Für unterstützte Browser
- **Responsive Images**: Verschiedene Größen für verschiedene Breakpoints

### Lazy Loading
```typescript
// Bilder unterhalb des Viewports lazy laden
<Image
  src="/content-image.jpg"
  alt="Content Image"
  width={800}
  height={600}
  loading="lazy"
  className="w-full h-auto"
/>
```

## Code-Splitting

### Route-based Splitting
```typescript
// Dynamische Imports für Routen
const AdminPanel = dynamic(() => import('@/components/AdminPanel'), {
  loading: () => <AdminPanelSkeleton />,
  ssr: false
});

const SettingsPanel = dynamic(() => import('@/components/SettingsPanel'), {
  loading: () => <SettingsSkeleton />
});
```

### Component-based Splitting
```typescript
// Schwere Komponenten dynamisch laden
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <ChartSkeleton />,
  ssr: false
});
```

## Bundle-Analyse

### Webpack Bundle Analyzer
```json
// package.json Script
{
  "scripts": {
    "analyze": "ANALYZE=true npm run build"
  }
}
```

### Bundle-Größen überwachen
```typescript
// Bundle-Größen-Checker
const bundleSizeCheck = {
  maxSize: '150KB',
  maxInitialRequests: 4,
  maxAsyncRequests: 4
};
```

## Caching-Strategien

### Static Assets
```typescript
// Lange Cache-Zeiten für statische Assets
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      }
    ];
  }
};
```

### API-Responses
```typescript
// Cache-Header für API-Endpoints
@app.get("/api/v1/settings")
async def get_settings(
    response: Response,
    current_user: User = Depends(get_current_local_user)
):
    response.headers["Cache-Control"] = "private, max-age=300"  # 5 Minuten
    return {"settings": user_settings}
```

## Performance-Monitoring

### Real User Monitoring
```typescript
// Performance-Metriken sammeln
const reportWebVitals = (metric: any) => {
  if (metric.label === 'web-vital') {
    // An Analytics-Service senden
    analytics.track('web-vital', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating
    });
  }
};
```

### Lighthouse CI
```json
// .lighthouserc
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

## Optimierungen

### Tree Shaking
```typescript
// Nur benötigte Imports
import { Button } from '@/components/ui/button';
// Statt: import * from '@/components/ui';

// Lodash-es für besseres Tree Shaking
import { debounce } from 'lodash-es';
// Statt: import _ from 'lodash';
```

### Bundle-Optimierung
```typescript
// Externe Bibliotheken als CDN laden
// next.config.js
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals = {
        ...config.externals,
        'lodash': '_'
      };
    }
    return config;
  }
};
```

## Critical Path

### Above-the-fold CSS
```typescript
// Kritische CSS inline einbetten
// pages/_document.tsx
<Head>
  <style dangerouslySetInnerHTML={{
    __html: criticalCSS
  }} />
</Head>
```

### JavaScript-Priorität
```typescript
// Kritische JavaScript-Funktionalität
const criticalFunctions = {
  navigation: () => import('@/utils/navigation'),
  authentication: () => import('@/utils/auth')
};

// Nicht-kritische Funktionen
const nonCriticalFunctions = {
  analytics: () => import('@/utils/analytics'),
  notifications: () => import('@/utils/notifications')
};
```

## Best Practices

### Allgemeine Richtlinien
1. **Code-Splitting**: Routen und Komponenten aufteilen
2. **Lazy Loading**: Nicht-kritische Inhalte verzögert laden
3. **Bildoptimierung**: Moderne Formate und Größen verwenden
4. **Caching**: Aggressive Caching-Strategien implementieren
5. **Monitoring**: Performance kontinuierlich überwachen

### Entwicklung
- **Bundle-Analyzer**: Regelmäßige Bundle-Größen prüfen
- **Lighthouse**: Performance-Scores überwachen
- **Real User Data**: Echte Performance-Daten sammeln

### Deployment
- **CDN**: Statische Assets über CDN ausliefern
- **Compression**: Gzip/Brotli-Kompression aktivieren
- **HTTP/2**: Moderne Protokolle nutzen
