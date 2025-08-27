# AI Gateway Design System

Ein vollständiges Design-System für die AI Gateway-Plattform mit White-Labeling-Unterstützung.

## 🎯 Übersicht

Das Design-System bietet eine konsistente Grundlage für alle UI-Komponenten und ermöglicht es, die App einfach für verschiedene Kunden anzupassen (White-Labeling).

## 📁 Struktur

```
/design/
├── tokens.json          # Design-Tokens & CSS-Variablen
├── components.md        # UI-Komponenten-Kanon
├── layout.md           # Grid-System & Responsive
├── motion.md           # Animationen & Interaktionen
├── a11y.md             # Accessibility-Richtlinien
├── content.md          # Microcopy & Content-Strategie
├── forms.md            # Formulare & Validierung
├── perf.md             # Performance-Budget
├── stack.md            # Tech-Stack & Konfiguration
├── examples/           # Beispiel-Komponenten
│   ├── dashboard.tsx   # Dashboard-Referenz
│   ├── settings.tsx    # Einstellungen-Referenz
│   └── branding.tsx    # Branding-Referenz
└── README.md           # Diese Datei
```

## 🚀 Schnellstart

### 1. Design-Tokens einbinden

```typescript
// In Ihrer Komponente
import { useBranding } from '@/lib/branding';

function MyComponent() {
  const branding = useBranding();
  
  return (
    <div style={{ color: branding.visual.colors.primary }}>
      {branding.company.name}
    </div>
  );
}
```

### 2. CSS-Variablen verwenden

```css
.my-component {
  background-color: var(--brand-primary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-md);
}
```

### 3. Tailwind-Klassen mit Design-Tokens

```typescript
// Tailwind-Klassen verwenden die Design-Token-Werte
<div className="bg-primary text-white rounded-lg p-6 shadow-lg">
  Inhalt
</div>
```

## 🎨 Design-Tokens

### Farben
- **Primary**: Hauptfarbe der Marke
- **Secondary**: Sekundärfarbe
- **Accent**: Akzentfarbe für Hervorhebungen
- **Success/Warning/Error/Info**: Status-Farben

### Spacing
- Konsistente Abstände von 4px bis 128px
- Verwendet in allen Komponenten für einheitliche Abstände

### Typografie
- **Inter** als Hauptschriftart
- **JetBrains Mono** für Code
- Verschiedene Schriftgrößen und -gewichte

### Motion
- **Fast**: 150ms für Hover-Effekte
- **Normal**: 250ms für Standard-Übergänge
- **Slow**: 350ms für komplexe Animationen

## 🧩 Komponenten

### Pflicht-Bibliotheken
- **shadcn/ui**: Primäre Komponenten-Bibliothek
- **Radix UI**: Headless UI-Primitive
- **Lucide React**: Icon-Bibliothek
- **Tailwind CSS**: Utility-First CSS-Framework

### Komponenten-Standards
- Konsistente Props und Varianten
- Accessibility-First-Ansatz
- Loading-, Empty- und Error-States
- Responsive Design

## 📱 Layout & Responsive

### Grid-System
- Mobile-First-Ansatz
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Konsistente Container-Breiten und Abstände

### Responsive-Verhalten
- Mobile: Einspaltiges Layout
- Tablet: Zweispaltiges Layout
- Desktop: Mehrspaltiges Layout mit Sidebar

## ♿ Accessibility

### Standards
- WCAG 2.1 AA Compliance
- Kontrast-Mindestwerte: 4.5:1 für normalen Text
- Tastatur-Navigation für alle interaktiven Elemente
- Screen Reader-Unterstützung

### Best Practices
- Semantisches HTML
- ARIA-Labels und Rollen
- Fokus-Management
- Reduzierte Animationen respektieren

## 🎭 Motion & Interaktionen

### Animation-Richtlinien
- Subtile, funktionale Animationen
- Konsistente Dauern und Easing-Kurven
- `prefers-reduced-motion` respektieren
- Performance-optimiert (60fps)

### Interaktionen
- Hover-Effekte für Buttons und Cards
- Fokus-Übergänge für Formulare
- Loading-States mit Skeleton-Animationen
- Page-Transitions

## 📝 Content & Microcopy

### Sprachliche Regeln
- **Deutsch** als Primärsprache
- **Du-Form** für konsistente Anrede
- Klare, direkte Formulierung
- Professionell aber freundlich

### Platzhalter-Format
```
***[Platzhalter: Beschreibung des Inhalts]***
```

## 📊 Performance

### Core Web Vitals
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### Bundle-Limits
- Initial Bundle: < 150KB (gzipped)
- Route-spezifisch: < 50KB (gzipped)
- CSS: < 50KB (gzipped)

## 🔧 White-Labeling

### Branding-Konfiguration
```typescript
// /lib/branding.ts
export interface BrandingConfig {
  company: {
    name: string;
    shortName: string;
    description: string;
    // ... weitere Firmen-Informationen
  };
  visual: {
    logo: { light: string; dark: string; favicon: string };
    colors: { primary: string; secondary: string; /* ... */ };
    fonts: { primary: string; secondary: string; mono: string };
  };
  // ... weitere Konfigurationsoptionen
}
```

### Anpassbare Elemente
- Firmenname und Logo
- Farbpalette
- Schriftarten
- Feature-Flags
- Lokalisierung

## 🛠️ Entwicklung

### Setup
1. Design-Tokens in `/design/tokens.json` definieren
2. CSS-Variablen in `globals.css` einbinden
3. Tailwind-Konfiguration aktualisieren
4. Branding-Provider in der App einbinden

### Neue Komponenten
1. Design-System-Richtlinien befolgen
2. Accessibility-Attribute hinzufügen
3. Responsive Verhalten implementieren
4. Loading/Empty/Error-States berücksichtigen

### Testing
- Playwright E2E-Tests für komplexe Interaktionen
- Accessibility-Tests mit axe-core
- Performance-Tests mit Lighthouse
- Responsive-Tests auf verschiedenen Breakpoints

## 📚 Ressourcen

### Tools
- **Cursor**: `.cursorrules` für automatische Integration
- **Windsurf**: `.windsurfrules` für Cascade-Integration
- **aider**: `.aider.conf.yml` für Terminal-AI-Integration

### Dokumentation
- [shadcn/ui Dokumentation](https://ui.shadcn.com/)
- [Radix UI Dokumentation](https://www.radix-ui.com/)
- [Tailwind CSS Dokumentation](https://tailwindcss.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Beitragen

### Richtlinien
1. Design-System-Richtlinien befolgen
2. Accessibility-Standards einhalten
3. Performance-Ziele erreichen
4. Responsive Design berücksichtigen
5. Tests für neue Features schreiben

### Code-Review
- Design-Token-Verwendung prüfen
- Accessibility-Attribute validieren
- Performance-Impact bewerten
- Responsive Verhalten testen

## 📄 Lizenz

Dieses Design-System ist Teil des AI Gateway-Projekts und unterliegt den gleichen Lizenzbedingungen.

---

**Hinweis**: Das Design-System wird kontinuierlich weiterentwickelt. Bitte halten Sie sich an die aktuellen Richtlinien und testen Sie Änderungen gründlich.
