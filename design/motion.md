# Interaktion & Motion Design

## Animation-Dauer

### Standard-Dauern
- **Fast**: 150ms - Für Hover-Effekte
- **Normal**: 250ms - Für Standard-Übergänge
- **Slow**: 350ms - Für komplexe Animationen

### CSS-Variablen
```css
:root {
  --motion-duration-fast: 150ms;
  --motion-duration-normal: 250ms;
  --motion-duration-slow: 350ms;
}
```

## Easing-Kurven

### Standard-Kurven
- **Default**: `cubic-bezier(0.4, 0, 0.2, 1)` - Sanfte Übergänge
- **In**: `cubic-bezier(0.4, 0, 1, 1)` - Beschleunigung
- **Out**: `cubic-bezier(0, 0, 0.2, 1)` - Verlangsamung
- **InOut**: `cubic-bezier(0.4, 0, 0.2, 1)` - Beschleunigung + Verlangsamung

### Tailwind-Klassen
```typescript
// Standard-Easing
className="transition-all duration-normal ease-in-out"

// Custom-Easing
className="transition-all duration-fast ease-out"
```

## Wann Animationen erlaubt sind

### Erlaubte Animationen
- **Hover-Effekte**: Buttons, Links, Cards
- **Fokus-Übergänge**: Input-Felder, Buttons
- **Loading-States**: Spinner, Skeleton
- **Page-Transitions**: Sanfte Seitenübergänge
- **Micro-Interactions**: Subtile Feedback-Animationen

### Verbotene Animationen
- **Auto-Play**: Keine automatischen Animationen
- **Flashing**: Keine blinkenden Effekte
- **Excessive Motion**: Keine übertriebenen Animationen
- **Distracting**: Keine ablenkenden Effekte

## Fokus- und Hover-Verhalten

### Fokus-States
```typescript
// Standard-Fokus-Styling
<Button className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Focusable Button
</Button>
```

### Hover-Effekte
```typescript
// Subtile Hover-Animationen
<Card className="hover:shadow-lg transition-shadow duration-fast">
  Hoverable Card
</Card>
```

## Reduzierte Animationen

### prefers-reduced-motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### JavaScript-Implementierung
```typescript
// Animationen basierend auf User-Präferenz
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  // Animation ausführen
  element.classList.add('animate-in');
}
```

## Micro-Interactions

### Button-Interactions
```typescript
// Subtile Button-Animationen
<Button className="
  transform transition-all duration-fast
  hover:scale-105 active:scale-95
  hover:shadow-md active:shadow-sm
">
  Interactive Button
</Button>
```

### Input-Interactions
```typescript
// Input-Fokus-Animationen
<Input className="
  transition-all duration-fast
  focus:ring-2 focus:ring-blue-500
  focus:border-blue-500
" />
```

## Page-Transitions

### Einfache Übergänge
```typescript
// Sanfte Seitenübergänge
<div className="
  animate-in fade-in duration-normal
  slide-in-from-bottom-4
">
  Neue Seite
</div>
```

### Loading-Transitions
```typescript
// Loading-Zustände
<div className="
  transition-opacity duration-normal
  opacity-0 loading:opacity-100
">
  Lade-Inhalt
</div>
```

## Performance-Optimierungen

### Transform vs. Position
```typescript
// Verwende transform statt position für Animationen
// ✅ Gut
className="transform transition-transform duration-normal hover:scale-110"

// ❌ Schlecht
className="transition-all duration-normal hover:translate-x-4"
```

### Will-Change
```typescript
// Optimiere für Animationen
<div className="will-change-transform">
  {/* Animierter Inhalt */}
</div>
```

## Accessibility-Guidelines

### Fokus-Indikatoren
- Alle interaktiven Elemente müssen sichtbare Fokus-States haben
- Fokus-Ringe sollten ausreichend Kontrast haben
- Fokus-States sollten nicht nur auf Hover basieren

### Screen Reader
- Animationen sollten nicht mit Screen Readern interferieren
- Verwende `aria-live` für dynamische Inhalte
- Reduzierte Animationen respektieren

## Best Practices

### Konsistenz
- Verwende die gleichen Dauern und Easing-Kurven konsistent
- Halte Animationen subtil und funktional
- Teste auf verschiedenen Geräten und Browsern

### Performance
- Vermeide Animationen auf `opacity` und `transform` gleichzeitig
- Verwende `requestAnimationFrame` für komplexe Animationen
- Optimiere für 60fps

### User Experience
- Animationen sollten den Inhalt unterstützen, nicht ablenken
- Biete immer eine Option für reduzierte Animationen
- Teste mit verschiedenen Benutzern
