# Tech-Stack & Konfiguration

## Framework

### Next.js 14
- **App Router**: Moderne Routing-Architektur
- **Server Components**: Optimierte Rendering-Performance
- **TypeScript**: Vollständige Type-Safety
- **ESLint + Prettier**: Code-Qualität und Formatierung

### React 18
- **Concurrent Features**: Verbesserte Performance
- **Suspense**: Besseres Loading-Management
- **Strict Mode**: Entwicklungstools für bessere Qualität

## Tailwind CSS Setup

### Konfiguration
```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design-Token-Integration
        primary: 'var(--brand-primary)',
        secondary: 'var(--brand-secondary)',
        accent: 'var(--brand-accent)',
        success: 'var(--brand-success)',
        warning: 'var(--brand-warning)',
        error: 'var(--brand-error)',
        info: 'var(--brand-info)',
      },
      spacing: {
        // Design-Token-Integration
        '1': 'var(--spacing-1)',
        '2': 'var(--spacing-2)',
        '3': 'var(--spacing-3)',
        '4': 'var(--spacing-4)',
        '5': 'var(--spacing-5)',
        '6': 'var(--spacing-6)',
        '8': 'var(--spacing-8)',
        '10': 'var(--spacing-10)',
        '12': 'var(--spacing-12)',
        '16': 'var(--spacing-16)',
        '20': 'var(--spacing-20)',
        '24': 'var(--spacing-24)',
        '32': 'var(--spacing-32)',
      },
      borderRadius: {
        // Design-Token-Integration
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        // Design-Token-Integration
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'xl': 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        'inner': 'var(--shadow-inner)',
      },
      animation: {
        // Design-Token-Integration
        'fade-in': 'fadeIn var(--motion-duration-normal) var(--motion-easing-default)',
        'slide-up': 'slideUp var(--motion-duration-normal) var(--motion-easing-default)',
        'scale-in': 'scaleIn var(--motion-duration-fast) var(--motion-easing-default)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};

export default config;
```

### CSS-Variablen
```css
/* globals.css */
:root {
  /* Brand Colors */
  --brand-primary: #2563eb;
  --brand-secondary: #64748b;
  --brand-accent: #f59e0b;
  --brand-success: #10b981;
  --brand-warning: #f59e0b;
  --brand-error: #ef4444;
  --brand-info: #3b82f6;

  /* Background Colors */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-bg-surface: #ffffff;
  --color-bg-overlay: rgba(0, 0, 0, 0.5);

  /* Text Colors */
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-tertiary: #64748b;
  --color-text-inverse: #ffffff;
  --color-text-muted: #94a3b8;

  /* Border Colors */
  --color-border-primary: #e2e8f0;
  --color-border-secondary: #cbd5e1;
  --color-border-focus: #2563eb;
  --color-border-divider: #e2e8f0;

  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;
  --spacing-32: 128px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --shadow-inner: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);

  /* Typography */
  --font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Fira Code', 'Monaco', 'Consolas', monospace;

  /* Motion */
  --motion-duration-fast: 150ms;
  --motion-duration-normal: 250ms;
  --motion-duration-slow: 350ms;
  --motion-easing-default: cubic-bezier(0.4, 0, 0.2, 1);
  --motion-easing-in: cubic-bezier(0.4, 0, 1, 1);
  --motion-easing-out: cubic-bezier(0, 0, 0.2, 1);
  --motion-easing-inOut: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-primary: #0f172a;
    --color-bg-secondary: #1e293b;
    --color-bg-tertiary: #334155;
    --color-bg-surface: #1e293b;
    --color-text-primary: #f8fafc;
    --color-text-secondary: #cbd5e1;
    --color-text-tertiary: #94a3b8;
    --color-border-primary: #334155;
    --color-border-secondary: #475569;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## shadcn/ui + Radix

### Komponenten-Registry
```typescript
// components/ui/registry.tsx
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Komponenten-Export
export { Button } from './button';
export { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
export { Input } from './input';
export { Label } from './label';
export { Badge } from './badge';
export { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
```

### Radix-Integration
```typescript
// Radix-Primitive Wrapper
import * as RadixTabs from '@radix-ui/react-tabs';
import * as RadixTooltip from '@radix-ui/react-tooltip';

// Custom-Komponenten mit Radix
export const Tabs = RadixTabs.Root;
export const TabsList = RadixTabs.List;
export const TabsTrigger = RadixTabs.Trigger;
export const TabsContent = RadixTabs.Content;
```

## Import-Pfade

### Absolute Imports
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/utils/*": ["./utils/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/types/*": ["./types/*"],
      "@/styles/*": ["./styles/*"]
    }
  }
}
```

### Import-Beispiele
```typescript
// Komponenten
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Utilities
import { cn } from '@/lib/utils';
import { formatDate } from '@/utils/date';

// Hooks
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useDebounce } from '@/hooks/use-debounce';

// Types
import type { User, Settings } from '@/types';
```

## ESLint + Prettier

### ESLint-Konfiguration
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended",
    "prettier"
  ],
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### Prettier-Konfiguration
```json
// .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

## Dateistruktur

### Projekt-Organisation
```
/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-Gruppe
│   ├── (dashboard)/       # Dashboard-Gruppe
│   ├── admin/             # Admin-Bereich
│   ├── settings/          # Einstellungen
│   ├── globals.css        # Globale Styles
│   └── layout.tsx         # Root-Layout
├── components/             # Wiederverwendbare Komponenten
│   ├── ui/                # shadcn/ui Komponenten
│   ├── layout/            # Layout-Komponenten
│   ├── forms/             # Formular-Komponenten
│   └── shared/            # Gemeinsame Komponenten
├── lib/                    # Utilities und Helpers
│   ├── utils.ts           # Allgemeine Utilities
│   ├── validations.ts     # Validierungs-Schemas
│   └── api.ts             # API-Client
├── hooks/                  # Custom React Hooks
├── types/                  # TypeScript-Definitionen
├── styles/                 # Zusätzliche Styles
├── public/                 # Statische Assets
└── design/                 # Design-System
    ├── tokens.json        # Design-Tokens
    ├── components.md      # Komponenten-Kanon
    ├── layout.md          # Layout-Richtlinien
    ├── motion.md          # Motion-Richtlinien
    ├── a11y.md            # Accessibility
    ├── content.md         # Content-Richtlinien
    ├── forms.md           # Formular-Richtlinien
    ├── perf.md            # Performance-Budget
    └── stack.md           # Tech-Stack (diese Datei)
```

## Build & Deployment

### Build-Skripte
```json
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "analyze": "ANALYZE=true npm run build"
  }
}
```

### Environment-Variablen
```bash
# .env.local
NEXT_PUBLIC_APP_NAME="AI Gateway"
NEXT_PUBLIC_APP_VERSION="1.0.0"
NEXT_PUBLIC_API_URL="http://localhost:5555"
NEXT_PUBLIC_BRAND_COLOR="#2563eb"
```

## Testing-Setup

### Jest + React Testing Library
```typescript
// jest.config.js
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Playwright
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Best Practices

### Code-Organisation
1. **Feature-basierte Struktur**: Komponenten nach Features gruppieren
2. **Barrel-Exports**: Index-Dateien für saubere Imports
3. **Type-Safety**: Vollständige TypeScript-Integration
4. **Konsistente Namensgebung**: Einheitliche Namenskonventionen

### Performance
1. **Code-Splitting**: Routen und Komponenten aufteilen
2. **Lazy Loading**: Nicht-kritische Inhalte verzögert laden
3. **Bundle-Optimierung**: Regelmäßige Bundle-Analyse
4. **Image-Optimierung**: Next.js Image-Komponente verwenden

### Quality
1. **ESLint**: Code-Qualität kontinuierlich überwachen
2. **Prettier**: Einheitliche Code-Formatierung
3. **TypeScript**: Compile-time Fehler vermeiden
4. **Testing**: Unit- und E2E-Tests implementieren
