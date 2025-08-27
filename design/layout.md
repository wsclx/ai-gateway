# Layout & Responsive Design

## Grid-System

### Container-Breiten
```css
/* Mobile First */
.container {
  width: 100%;
  padding-left: 1rem;  /* 16px */
  padding-right: 1rem; /* 16px */
  margin-left: auto;
  margin-right: auto;
}

/* Breakpoints */
@media (min-width: 640px) { .container { max-width: 640px; } }
@media (min-width: 768px) { .container { max-width: 768px; } }
@media (min-width: 1024px) { .container { max-width: 1024px; } }
@media (min-width: 1280px) { .container { max-width: 1280px; } }
@media (min-width: 1536px) { .container { max-width: 1536px; } }
```

### Spaltenabstände
- **Mobile**: 16px (1rem)
- **Tablet**: 24px (1.5rem)
- **Desktop**: 32px (2rem)

## Mobile-First Regeln

### Breakpoint-Strategie
1. **Mobile (320px+)**: Basis-Layout
2. **Small (640px+)**: Tablet-Portrait
3. **Medium (768px+)**: Tablet-Landscape
4. **Large (1024px+)**: Desktop
5. **XL (1280px+)**: Large Desktop
6. **2XL (1536px+)**: Ultra-Wide

### Responsive-Verhalten
- **Mobile**: Einspaltiges Layout
- **Tablet**: Zweispaltiges Layout
- **Desktop**: Mehrspaltiges Layout mit Sidebar

## Layout-Komponenten

### Header
```typescript
// Mobile: Full-width, Stacked
// Desktop: Fixed-width, Horizontal
<Header className="w-full md:w-auto md:flex-row" />
```

### Sidebar
```typescript
// Mobile: Hidden by default, Overlay
// Desktop: Visible, Fixed-width
<Sidebar className="hidden lg:block lg:w-64" />
```

### Main Content
```typescript
// Mobile: Full-width
// Desktop: With sidebar offset
<main className="w-full lg:ml-64" />
```

## Scroll-Bereiche

### Viewport-Scroll
- Hauptinhalt scrollt im Viewport
- Header bleibt fixiert
- Sidebar scrollt unabhängig

### Container-Scroll
```typescript
// Für lange Listen oder Tabellen
<div className="h-96 overflow-y-auto">
  {/* Scrollbarer Inhalt */}
</div>
```

## Spacing-System

### Vertikale Abstände
```typescript
// Konsistente Abstände zwischen Sektionen
<section className="space-y-6">
  <div>Content 1</div>
  <div>Content 2</div>
</section>
```

### Horizontale Abstände
```typescript
// Konsistente Abstände zwischen Elementen
<div className="flex space-x-4">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</div>
```

## Responsive-Utilities

### Sichtbarkeit
```typescript
// Elemente nur auf bestimmten Breakpoints anzeigen
<div className="hidden md:block">Desktop Only</div>
<div className="block md:hidden">Mobile Only</div>
```

### Layout-Änderungen
```typescript
// Layout je nach Breakpoint anpassen
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* Responsive Grid */}
</div>
```

## Container-Patterns

### Page Container
```typescript
// Standard-Seiten-Container
<div className="container mx-auto px-4 py-6">
  {/* Seiteninhalt */}
</div>
```

### Content Container
```typescript
// Inhalt-Container mit max-width
<div className="max-w-4xl mx-auto">
  {/* Begrenzter Inhalt */}
</div>
```

### Full-Width Container
```typescript
// Volle Breite für Hero-Sektionen
<div className="w-full bg-gray-100">
  {/* Volle Breite */}
</div>
```

## Responsive-Typography

### Schriftgrößen
```typescript
// Responsive Schriftgrößen
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

### Zeilenabstände
```typescript
// Responsive Zeilenabstände
<p className="leading-tight md:leading-normal lg:leading-relaxed">
  Responsive Text
</p>
```
